/**
 * 레슨/보스전 플레이어
 * - 레슨: 듀오링고식 한 문제씩 + 하단 피드백 시트, 하트 3개
 * - 보스전: 문제가 위에서 떨어진다(제한시간). 시간 초과·오답이면 바닥에 블록이 쌓이고,
 *   3개 쌓이면 패배. 정답이면 보스에게 데미지. 격파 시 보스 카드 획득.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CHALLENGE_PASS, getStage } from '../game/stages';
import { nextProblem, type Served } from '../game/lesson';
import { checkAnswer, isAnswerReady, type UserAnswer } from '../game/check';
import { useGame, type EarnedCard } from '../game/store';
import { sfx } from '../game/sounds';
import { XP_BOSS_CLEAR, XP_LESSON_CLEAR, XP_PERFECT_BONUS, XP_PER_CORRECT } from '../game/xp';
import { COMBO_BONUS, type BadgeDef } from '../game/badges';
import { type RewardCardDef } from '../game/rewardCards';
import { TreasureReveal } from '../components/TreasureReveal';
import { MedalView } from '../components/MedalView';
import { answerToText } from '../generator/render-text';
import { MathView } from '../components/MathView';
import { ChoiceView } from '../components/problem/ChoiceView';
import { ComparisonView } from '../components/problem/ComparisonView';
import { FractionInputView } from '../components/problem/FractionInputView';
import { DecimalInputView } from '../components/problem/DecimalInputView';
import { FillBlanksView } from '../components/problem/FillBlanksView';
import { MatchingView } from '../components/problem/MatchingView';
import { track } from '../analytics';

type Phase = 'answering' | 'feedback' | 'result' | 'failed';
const MAX_MISSES = 3;

export default function LessonPage() {
  // stageId가 바뀌면 모든 진행 상태를 리셋해야 하므로 key로 강제 리마운트
  const { stageId = '' } = useParams();
  return <LessonRunner key={stageId} stageId={stageId} />;
}

function LessonRunner({ stageId }: { stageId: string }) {
  const stage = useMemo(() => getStage(stageId), [stageId]);
  const navigate = useNavigate();
  const { skillStats, showAnswers, recordAnswer, addXp, addBossCard, completeStage } = useGame();

  const total = stage.problemCount;
  const isBoss = stage.type === 'boss';
  // 심화 탐험: 하트 없음, 10문제를 전부 풀고 8개 이상 맞히면 클리어
  const isChallenge = stage.type === 'challenge';
  // 보스전은 문제별이 아니라 스테이지 전체에 10분의 넉넉한 제한시간을 준다.
  // 문장제 위주라 읽고 생각할 시간이 필요 — 시간 초과 시에만 패배.
  const stageTimeBudget = isBoss ? 600 : 0;

  const [served, setServed] = useState<Served>(() =>
    nextProblem(stage, skillStats, 0, useGame.getState().recentWrong),
  );
  const [answer, setAnswer] = useState<UserAnswer | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [done, setDone] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [hitFx, setHitFx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(isBoss ? stageTimeBudget : null);
  const [comboBonus, setComboBonus] = useState(0);
  const [bonusToast, setBonusToast] = useState<string | null>(null);
  const [bossImgOk, setBossImgOk] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<{
    stars: number;
    xp: number;
    cards: EarnedCard[];
    badges: BadgeDef[];
    treasures: { drawn: RewardCardDef; duplicate: boolean; label: string }[];
  } | null>(null);
  const maxComboRef = useRef(0);
  const servedAtRef = useRef<number>(Date.now());
  // 보스전 전체 제한시간 마감 시각 (restart 시 갱신)
  const stageDeadlineRef = useRef<number>(Date.now() + stageTimeBudget * 1000);

  const problem = served.problem;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // ── analytics: 마운트 시 시작 이벤트 ──
  useEffect(() => {
    void track(isBoss ? 'boss.start' : 'lesson.start', {
      stage_id: stage.id,
      unit_id: stage.unitId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 보스전 전체 제한시간 타이머: 스테이지 통째로 카운트다운, 0이 되면 패배 ──
  // (문제별 타이머 아님 — 계산이 많아도 시간에 쫓기지 않게 넉넉한 총량을 준다)
  useEffect(() => {
    if (!isBoss) return;
    const id = setInterval(() => {
      if (phaseRef.current === 'result' || phaseRef.current === 'failed') return;
      const left = (stageDeadlineRef.current - Date.now()) / 1000;
      if (left <= 0) {
        setTimeLeft(0);
        setTimedOut(true);
        setPhase('failed');
      } else {
        setTimeLeft(left);
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBoss]);

  const miss = (timeout: boolean) => {
    recordAnswer(problem.skillId, false);
    setLastCorrect(false);
    setTimedOut(timeout);
    if (isChallenge) {
      // 심화: 틀려도 다음 문제로 (하트 없음, 10문제 전부 풀기)
      setDone((d) => d + 1);
    } else {
      setMisses((m) => m + 1);
    }
    setCombo(0);
    setWrongCount((w) => w + 1);
    sfx.wrong();
    setPhase('feedback');
  };

  const confirm = (forced?: UserAnswer) => {
    const a = forced ?? answer;
    if (!a) return;
    const elapsed_ms = Date.now() - servedAtRef.current;
    const correct = checkAnswer(problem, a);
    if (!correct) {
      void track(isBoss ? 'boss.answer' : 'lesson.answer', {
        stage_id: stage.id,
        unit_id: stage.unitId,
        skill_id: problem.skillId,
        problem_id: problem.id,
        correct: false,
        elapsed_ms,
      });
      miss(false);
      return;
    }
    void track(isBoss ? 'boss.answer' : 'lesson.answer', {
      stage_id: stage.id,
      unit_id: stage.unitId,
      skill_id: problem.skillId,
      problem_id: problem.id,
      correct: true,
      elapsed_ms,
    });
    recordAnswer(problem.skillId, true);
    setLastCorrect(true);
    setTimedOut(false);
    setDone((d) => d + 1);
    setCorrectCount((c) => c + 1);
    const newCombo = combo + 1;
    setCombo(newCombo);
    maxComboRef.current = Math.max(maxComboRef.current, newCombo);
    // 콤보 마일스톤 보너스 XP (5/10/20 도달 순간)
    const bonus = COMBO_BONUS[newCombo];
    if (bonus) {
      setComboBonus((b) => b + bonus);
      setBonusToast(`🔥 ${newCombo}콤보 보너스 +${bonus} XP!`);
      setTimeout(() => setBonusToast(null), 2200);
    }
    if (isBoss) {
      setHitFx((h) => h + 1);
      sfx.bossHit();
    } else {
      sfx.correct();
      if (combo + 1 >= 3) sfx.combo(combo + 1);
    }
    setPhase('feedback');
  };

  const next = () => {
    if (!isChallenge && !lastCorrect && misses >= MAX_MISSES) {
      void track(isBoss ? 'boss.fail' : 'lesson.fail', { stage_id: stage.id });
      setPhase('failed');
      return;
    }
    if (done >= total) {
      finish();
      return;
    }
    const s = useGame.getState();
    const nextServed = nextProblem(stage, s.skillStats, done, s.recentWrong);
    setServed(nextServed);
    servedAtRef.current = Date.now();
    // 보스 제한시간은 스테이지 전체 카운트다운이므로 문제마다 리셋하지 않는다
    setAnswer(null);
    setPhase('answering');
  };

  const finish = () => {
    const game = useGame.getState();
    const treasures: { drawn: RewardCardDef; duplicate: boolean; label: string }[] = [];

    // 심화 탐험: 10문제 중 8개 이상이어야 클리어
    if (isChallenge && correctCount < CHALLENGE_PASS) {
      void track('lesson.fail', { stage_id: stage.id });
      setPhase('failed');
      return;
    }

    const perfect = isChallenge ? correctCount === total : wrongCount === 0;
    const stars = isChallenge
      ? Math.min(3, correctCount - CHALLENGE_PASS + 1) // 8→1, 9→2, 10→3
      : perfect
        ? 3
        : wrongCount <= 2
          ? 2
          : 1;
    const xp =
      done * XP_PER_CORRECT +
      (isBoss ? XP_BOSS_CLEAR : isChallenge ? 25 : XP_LESSON_CLEAR) +
      (perfect ? XP_PERFECT_BONUS : 0) +
      comboBonus;
    const isFirstLesson = game.records.lessonsCompleted === 0;
    // 보물 카드·격파 메달은 첫 클리어에만 — 재도전은 XP·별만 (카드는 드물어야 가치 있다!)
    const isFirstClear = (game.stages[stage.id]?.stars ?? 0) === 0;
    const cards = [...addXp(xp)];
    if (isBoss && isFirstClear) {
      cards.push(addBossCard(stage.id));
      treasures.push({ ...game.drawTreasureCard(), label: '보스 격파 보상' });
    }
    if (isChallenge) {
      game.recordChallengeClear();
      if (isFirstClear) {
        treasures.push({ ...useGame.getState().drawTreasureCard(), label: '심화 탐험 보상' });
      }
    }
    game.reportCombo(maxComboRef.current);
    completeStage(stage.id, stars, perfect);
    if (isFirstLesson) {
      treasures.push({ ...useGame.getState().drawTreasureCard(), label: '첫 모험 기념' });
    }
    // 히든 미션: 조건이 갖춰진 순간 깜짝 카드
    for (const h of useGame.getState().checkHiddenMissions()) {
      treasures.push({ drawn: h.drawn, duplicate: h.duplicate, label: `히든 미션: ${h.mission.name}` });
    }
    useGame.getState().evaluateDragonItems();
    const badges = useGame.getState().evaluateBadges();
    sfx.fanfare();
    if (cards.length > 0 || badges.length > 0 || treasures.length > 0)
      setTimeout(() => sfx.levelUp(), 600);
    void track(isBoss ? 'boss.defeat' : 'lesson.complete', {
      stage_id: stage.id,
      stars,
      score: xp,
    });
    setResult({ stars, xp, cards, badges, treasures });
    setPhase('result');
  };

  const restart = () => {
    setMisses(0);
    setDone(0);
    setCombo(0);
    setWrongCount(0);
    setComboBonus(0);
    setCorrectCount(0);
    maxComboRef.current = 0;
    const s = useGame.getState();
    const nextServed = nextProblem(stage, s.skillStats, 0, s.recentWrong);
    setServed(nextServed);
    servedAtRef.current = Date.now();
    // 보스 전체 제한시간 다시 채우기
    setTimedOut(false);
    stageDeadlineRef.current = Date.now() + stageTimeBudget * 1000;
    setTimeLeft(isBoss ? stageTimeBudget : null);
    setAnswer(null);
    setPhase('answering');
  };

  // ── 결과 화면 ──
  // justify-center는 내용이 화면보다 길어지면(보물 연출 등) 위가 잘리며 겹쳐 보이므로 상단 정렬 + 여백
  if (phase === 'result' && result) {
    return (
      <div className="min-h-dvh flex flex-col items-center gap-6 p-6 pt-16 pb-12 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="text-7xl mb-2">{isBoss ? '🏆' : isChallenge ? '🌌' : '🎉'}</div>
          <h1 className="text-3xl text-glow">
            {isBoss
              ? `${stage.boss?.name} 격파!`
              : isChallenge
                ? `심화 탐험 정복! (${correctCount}/${total})`
                : '레슨 완료!'}
          </h1>
        </motion.div>
        <div className="flex gap-2 text-5xl">
          {[1, 2, 3].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.25, type: 'spring' }}
              className={i <= result.stars ? '' : 'opacity-20 grayscale'}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="rounded-2xl bg-night-800 px-8 py-4 text-xl"
        >
          <span className="text-coin">+{result.xp} XP</span>
          {comboBonus > 0 && <span className="text-sm opacity-70 ml-2">(콤보 보너스 +{comboBonus} 포함)</span>}
        </motion.div>

        {result.treasures.map((t, i) => (
          <TreasureReveal key={i} drawn={t.drawn} duplicate={t.duplicate} label={t.label} delay={1.3 + i * 0.5} />
        ))}

        {result.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, type: 'spring' }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-mana text-lg">🏅 새 배지 획득!</div>
            <div className="flex gap-3 flex-wrap justify-center">
              {result.badges.map((b) => (
                <div key={b.id} className="rounded-2xl bg-night-800 border border-mana/40 px-4 py-3 text-center">
                  <div className="text-3xl">{b.emoji}</div>
                  <div className="text-sm text-mana">{b.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {result.cards.length > 0 && (
          <motion.div
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="text-coin text-lg">
              {isBoss ? '🎖️ 격파 메달 획득!' : '✨ 레벨업! 인증 메달 획득 ✨'}
            </div>
            <div className="flex gap-4">
              {result.cards.slice(-2).map((c, i) => (
                <MedalView key={i} card={c} size="lg" />
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => {
              setResult(null);
              restart();
            }}
            className="btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-7 py-3 text-xl"
          >
            🔄 한 번 더!
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-3d rounded-2xl bg-glow border-glow border-b-lime-600 px-10 py-3 text-xl text-night-950"
          >
            계속하기
          </button>
        </div>
        <div className="text-xs opacity-50">깬 스테이지도 언제든 다시 도전할 수 있어요 — 문제는 매번 새로 나와요!</div>
      </div>
    );
  }

  // ── 실패 화면 ──
  if (phase === 'failed') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="text-7xl">{isBoss ? (timedOut ? '⏰' : '🧱') : isChallenge ? '🌫️' : '💔'}</div>
        <h1 className="text-2xl">
          {isBoss
            ? timedOut
              ? '시간이 다 됐어요!'
              : '문제가 다 쌓여버렸어요!'
            : isChallenge
              ? `${correctCount}/${total} — 아깝다!`
              : '하트를 다 잃었어요...'}
        </h1>
        <p className="opacity-70">
          {isBoss
            ? `${stage.boss?.name}이(가) 아직 버티고 있어요. 다시 도전!`
            : isChallenge
              ? `심화 탐험은 10문제 중 ${CHALLENGE_PASS}개 이상 맞혀야 해요. 다시 도전!`
              : '괜찮아요, 다시 해 봐요!'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={restart}
            className="btn-3d rounded-2xl bg-glow border-glow border-b-lime-600 px-8 py-3 text-lg text-night-950"
          >
            다시 도전
          </button>
          <Link to="/" className="btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-8 py-3 text-lg">
            지도로
          </Link>
        </div>
      </div>
    );
  }

  const locked = phase === 'feedback';
  // 보스 전체 제한시간 잔량 비율 (스테이지 통째)
  const timeRatio = isBoss && timeLeft !== null ? Math.max(0, timeLeft / stageTimeBudget) : 1;

  return (
    <div
      className="min-h-dvh flex flex-col max-w-xl mx-auto"
      style={
        isBoss
          ? {
              backgroundImage:
                'linear-gradient(to bottom, rgba(15,13,41,0.85), rgba(15,13,41,0.95)), url(assets/bg/boss.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* ── 상단 바 ── */}
      <div className="flex items-center gap-3 p-4">
        <Link
          to="/"
          className="text-2xl opacity-60 hover:opacity-100"
          aria-label="나가기"
          onClick={() => void track('lesson.abandon', { stage_id: stage.id, score: done })}
        >
          ✕
        </Link>
        {isBoss && stage.boss ? (
          <div className="flex-1 flex items-center gap-2">
            <motion.span
              key={hitFx}
              animate={hitFx > 0 ? { x: [0, -6, 6, -4, 0], rotate: [0, -8, 6, 0] } : { y: [0, -3, 0], rotate: [-2, 2, -2] }}
              transition={hitFx > 0 ? { duration: 0.4 } : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="text-4xl flex-shrink-0"
            >
              {bossImgOk && stage.boss.image ? (
                <img
                  src={stage.boss.image}
                  alt={stage.boss.name}
                  onError={() => setBossImgOk(false)}
                  className="w-14 h-14 object-contain drop-shadow-lg"
                />
              ) : (
                stage.boss.emoji
              )}
            </motion.span>
            <div className="flex-1">
              <div className="text-xs text-hurt mb-1">
                {stage.boss.name} {done === 0 && `· "${stage.boss.taunt}"`}
              </div>
              <div className="h-4 rounded-full bg-night-800 overflow-hidden border border-night-700">
                <motion.div
                  className="h-full bg-gradient-to-r from-hurt to-rose-600"
                  animate={{ width: `${((total - done) / total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 h-4 rounded-full bg-night-800 overflow-hidden border border-night-700">
            <motion.div
              className="h-full bg-gradient-to-r from-glow to-lime-500"
              animate={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        )}
        {isChallenge ? (
          <div className="text-sm text-mana">
            ✨ {correctCount}/{CHALLENGE_PASS} 목표
          </div>
        ) : (
          !isBoss && (
            <div className="flex items-center gap-1 text-xl" aria-label={`하트 ${MAX_MISSES - misses}개`}>
              {[0, 1, 2].map((i) => (
                <span key={i} className={i < MAX_MISSES - misses ? '' : 'opacity-20 grayscale'}>
                  ❤️
                </span>
              ))}
            </div>
          )
        )}
      </div>

      {/* 보스전: 스테이지 전체 제한시간 바 (문제별 아님 — 통째로 줄어든다) */}
      {isBoss && phase !== 'result' && (
        <div className="px-4">
          <div className="h-2.5 rounded-full bg-night-800 overflow-hidden">
            <div
              className={`h-full transition-[width] duration-200 ${timeRatio > 0.35 ? 'bg-gradient-to-r from-mana to-sky-400' : 'bg-gradient-to-r from-hurt to-rose-500'}`}
              style={{ width: `${timeRatio * 100}%` }}
            />
          </div>
          <div className="text-right text-xs mt-0.5 opacity-60">
            ⏱ 남은 시간 {Math.floor((timeLeft ?? 0) / 60)}:{String(Math.ceil((timeLeft ?? 0) % 60)).padStart(2, '0')}
          </div>
        </div>
      )}

      {/* 배지: 콤보 / 복습 */}
      <div className="flex justify-center gap-2 min-h-8 mt-1">
        <AnimatePresence>
          {served.isReview && phase === 'answering' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="rounded-full bg-mana/20 text-mana px-4 py-1 text-sm"
            >
              📌 아까 틀렸던 유형이에요!
            </motion.div>
          )}
          {bonusToast ? (
            <motion.div
              key="bonus"
              initial={{ scale: 0, y: -8 }}
              animate={{ scale: 1.1, y: 0 }}
              exit={{ scale: 0 }}
              className="rounded-full bg-coin text-night-950 px-4 py-1 text-sm font-bold shadow-lg shadow-coin/40"
            >
              {bonusToast}
            </motion.div>
          ) : (
            combo >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="rounded-full bg-coin/20 text-coin px-4 py-1 text-sm"
              >
                🔥 {combo} 연속 정답!
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* ── 문제 영역 ── */}
      <div className="flex-1 flex flex-col items-center justify-start gap-6 px-5 pb-44 pt-2 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={problem.id}
            initial={isBoss ? { y: -40, opacity: 0 } : { x: 60, opacity: 0 }}
            animate={
              isBoss && phase === 'answering' && served.timeLimit
                ? { y: [0, 110], opacity: 1, x: 0 }
                : { x: 0, y: isBoss ? 110 : 0, opacity: 1 }
            }
            exit={isBoss ? { y: 200, opacity: 0 } : { x: -60, opacity: 0 }}
            transition={
              isBoss && phase === 'answering' && served.timeLimit
                ? { y: { duration: served.timeLimit, ease: 'linear' }, opacity: { duration: 0.2 } }
                : { duration: 0.25 }
            }
            className="w-full flex flex-col items-center gap-6"
          >
            <h2 className="text-xl text-center opacity-90">{problem.prompt}</h2>
            {showAnswers && (
              <div className="rounded-full bg-coin/15 text-coin px-4 py-1 text-xs">
                🔑 [교사용] 정답: {answerToText(problem)}
              </div>
            )}
            {problem.expr && problem.format !== 'fill-blanks' && (
              <div className="rounded-3xl bg-night-900 border border-night-700 px-6 py-6 w-full text-center">
                <MathView expr={problem.expr} size="lg" />
              </div>
            )}

            {problem.format === 'choice' && (
              <ChoiceView problem={problem} answer={answer} onChange={setAnswer} locked={locked} />
            )}
            {problem.format === 'comparison' && (
              <ComparisonView problem={problem} answer={answer} onChange={setAnswer} locked={locked} />
            )}
            {problem.format === 'fraction-input' && (
              <FractionInputView problem={problem} answer={answer} onChange={setAnswer} locked={locked} />
            )}
            {problem.format === 'decimal-input' && (
              <DecimalInputView problem={problem} answer={answer} onChange={setAnswer} locked={locked} />
            )}
            {problem.format === 'fill-blanks' && (
              <div className="rounded-3xl bg-night-900 border border-night-700 px-6 py-8 w-full">
                <FillBlanksView problem={problem} answer={answer} onChange={setAnswer} locked={locked} />
              </div>
            )}
            {problem.format === 'matching' && (
              <MatchingView
                problem={problem}
                locked={locked}
                onComplete={(mistakes) => confirm({ kind: 'matching', mistakes })}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 보스전: 쌓인 블록 */}
      {isBoss && (
        <div className="fixed bottom-24 left-0 right-0 pointer-events-none">
          <div className="max-w-xl mx-auto px-5 flex gap-1.5 items-end">
            {Array.from({ length: misses }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex-1 h-9 rounded-lg bg-gradient-to-b from-stone-500 to-stone-700 border-b-4 border-stone-800 flex items-center justify-center text-sm"
              >
                🧱
              </motion.div>
            ))}
            {Array.from({ length: MAX_MISSES - misses }).map((_, i) => (
              <div key={`e${i}`} className="flex-1 h-9 rounded-lg border-2 border-dashed border-night-700 opacity-40" />
            ))}
          </div>
        </div>
      )}

      {/* ── 하단: 확인 버튼 / 피드백 시트 ── */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="max-w-xl mx-auto">
          <AnimatePresence>
            {phase === 'feedback' ? (
              <motion.div
                key="feedback"
                initial={{ y: 200 }}
                animate={{ y: 0 }}
                exit={{ y: 200 }}
                transition={{ type: 'spring', damping: 22 }}
                className={`rounded-t-3xl p-5 pb-7 ${lastCorrect ? 'bg-lime-950' : 'bg-rose-950'}`}
              >
                <div className={`text-2xl mb-1 ${lastCorrect ? 'text-glow' : 'text-hurt'}`}>
                  {lastCorrect
                    ? isBoss
                      ? ['치명타! ⚔️', '명중! 🏹', '강력한 한 방! 💥'][done % 3]
                      : ['정답이에요! 🎉', '완벽해요! ✨', '대단해요! 💪'][done % 3]
                    : timedOut
                      ? '💥 시간 초과! 문제가 쌓였어요!'
                      : isBoss
                        ? '빗나갔어요! 문제가 쌓였어요! 🧱'
                        : '아쉬워요! 😢'}
                </div>
                {!lastCorrect && (
                  <div className="text-sm leading-relaxed opacity-90 mb-1">
                    <MathView expr={problem.explanation} size="md" className="justify-start" />
                  </div>
                )}
                <button
                  onClick={next}
                  autoFocus
                  className={`btn-3d w-full mt-3 rounded-2xl py-3.5 text-xl text-night-950 ${
                    lastCorrect
                      ? 'bg-glow border-glow border-b-lime-600'
                      : 'bg-hurt border-hurt border-b-rose-600'
                  }`}
                >
                  계속하기
                </button>
              </motion.div>
            ) : (
              problem.format !== 'matching' && (
                <motion.div key="confirm" className="p-4 bg-night-950/90 backdrop-blur">
                  <button
                    onClick={() => confirm()}
                    disabled={!isAnswerReady(problem, answer)}
                    className="btn-3d w-full rounded-2xl py-3.5 text-xl bg-glow border-glow border-b-lime-600 text-night-950 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    확인
                  </button>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
