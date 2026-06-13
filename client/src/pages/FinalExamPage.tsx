/**
 * 학기말 총괄평가 던전 — 한 학기 6단원에서 25문제 출제.
 * ExamPage를 기반으로 확장. 해금 조건: 그 학기 단원 3개 이상 별 획득.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SKILLS, generateProblem, randomSeed } from '../generator';
import type { Problem, SkillDef } from '../generator/types';
import { SEMESTERS, STAGES, UNIT_TITLES } from '../game/stages';
import { checkAnswer, isAnswerReady, type UserAnswer } from '../game/check';
import { answerToText } from '../generator/render-text';
import { useGame } from '../game/store';
import { sfx } from '../game/sounds';
import { TreasureReveal } from '../components/TreasureReveal';
import type { RewardCardDef } from '../game/rewardCards';
import { MathView } from '../components/MathView';
import { ChoiceView } from '../components/problem/ChoiceView';
import { ComparisonView } from '../components/problem/ComparisonView';
import { FractionInputView } from '../components/problem/FractionInputView';
import { DecimalInputView } from '../components/problem/DecimalInputView';
import { FillBlanksView } from '../components/problem/FillBlanksView';
import { MatchingView } from '../components/problem/MatchingView';
import { track } from '../analytics';

const TOTAL = 25;
const PASS_SCORE = 23; // 92%↑

/** 한 단원이 클리어됐다 = 심화 제외 스테이지 중 별 있는 스테이지가 1개 이상 */
function isUnitCleared(unitId: string, stages: Record<string, { stars: number }>): boolean {
  return STAGES.filter((st) => st.unitId === unitId && st.type !== 'challenge').some(
    (st) => (stages[st.id]?.stars ?? 0) > 0,
  );
}

/** 총괄평가 해금 조건: 그 학기 단원 중 3개 이상 클리어 */
function isFinalUnlocked(
  semesterUnits: string[],
  stages: Record<string, { stars: number }>,
): boolean {
  return semesterUnits.filter((u) => isUnitCleared(u, stages)).length >= 3;
}

/**
 * 총괄평가 문제 선택.
 * - unit = units[index % units.length] 로 균등 분배
 * - 난이도 램프: index<8→1, index<17→2, else→3
 * - target===3 이면 challenge 스킬 50% 혼합
 */
function pickFinalProblem(units: string[], index: number): Problem {
  const unitId = units[index % units.length];
  const target: 1 | 2 | 3 = index < 8 ? 1 : index < 17 ? 2 : 3;
  const unitSkills = SKILLS.filter((s) => s.unitId === unitId);
  let pool: SkillDef[];
  if (target === 3) {
    const ch = unitSkills.filter((s) => s.challenge === true);
    const hard = unitSkills.filter((s) => s.difficulty === 3);
    pool = Math.random() < 0.5 && ch.length > 0 ? ch : hard.length > 0 ? hard : unitSkills;
  } else {
    pool = unitSkills.filter((s) => !s.challenge && s.difficulty === target);
    if (pool.length === 0) pool = unitSkills.filter((s) => !s.challenge);
  }
  if (pool.length === 0) pool = unitSkills;
  const skill = pool[Math.floor(Math.random() * pool.length)];
  return generateProblem(skill.id, randomSeed());
}

function gradeOf(score: number): { title: string; emoji: string; line: string } {
  if (score === 25) return { title: '전설의 졸업생!', emoji: '👑', line: '25문제 완벽! 이번 학기 완전 정복!' };
  if (score >= PASS_SCORE) return { title: '총괄 합격!', emoji: '🏰', line: '훌륭해요! 학기말 평가를 통과했어요!' };
  if (score >= 18) return { title: '한 걸음 더!', emoji: '🛡️', line: '거의 다 왔어요. 틀린 단원을 복습해 봐요!' };
  return { title: '수련 필요', emoji: '🌱', line: '괜찮아요! 레슨을 다시 돌고 재도전해 봐요!' };
}

export default function FinalExamPage() {
  const { semesterId = '' } = useParams<{ semesterId: string }>();
  const { showAnswers, recordAnswer, addXp, syncNow, stages } = useGame();

  const semester = SEMESTERS.find((s) => s.id === semesterId);

  const [index, setIndex] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState<UserAnswer | null>(null);
  const [phase, setPhase] = useState<'answering' | 'feedback' | 'result'>('answering');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [treasures, setTreasures] = useState<
    { drawn: RewardCardDef; duplicate: boolean; label: string }[]
  >([]);
  const [badges, setBadges] = useState<{ emoji: string; name: string }[]>([]);
  const [alreadyGranted, setAlreadyGranted] = useState(false);

  const servedAtRef = useRef<number>(Date.now());

  // 최초 마운트 시 첫 문제 생성 + exam.start 이벤트
  useEffect(() => {
    if (!semester) return;
    setProblem(pickFinalProblem(semester.units, 0));
    servedAtRef.current = Date.now();
    void track('exam.start', { unit_id: semesterId, policy_tag: 'final' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 방어: 학기 없거나 해금 미충족 ──
  if (!semester) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-5 p-6 text-center max-w-xl mx-auto">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl">알 수 없는 학기예요</h1>
        <Link to="/" className="btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-7 py-3">
          홈으로
        </Link>
      </div>
    );
  }

  if (!isFinalUnlocked(semester.units, stages)) {
    const cleared = semester.units.filter((u) => isUnitCleared(u, stages)).length;
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-5 p-6 text-center max-w-xl mx-auto">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl">아직 잠긴 던전이에요</h1>
        <p className="opacity-70 max-w-xs">
          {semester.label} 단원 3개 이상 클리어하면 열려요
          <br />
          (현재 {cleared}/3)
        </p>
        <Link to="/hub" className="btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-7 py-3">
          던전 허브로
        </Link>
      </div>
    );
  }

  const confirm = (forced?: UserAnswer) => {
    const a = forced ?? answer;
    if (!a || !problem) return;
    const elapsed_ms = Date.now() - servedAtRef.current;
    const ok = checkAnswer(problem, a);
    recordAnswer(problem.skillId, ok);
    void track('exam.answer', {
      unit_id: semesterId,
      skill_id: problem.skillId,
      problem_id: problem.id,
      correct: ok,
      elapsed_ms,
      policy_tag: 'final',
    });
    setLastCorrect(ok);
    if (ok) {
      setScore((s) => s + 1);
      sfx.correct();
    } else {
      sfx.wrong();
    }
    setPhase('feedback');
  };

  const next = () => {
    if (!semester) return;
    if (index + 1 >= TOTAL) {
      // 총괄평가 종료
      const game = useGame.getState();
      const passed = score >= PASS_SCORE;
      addXp(score * 3 + 10);
      const { grantCard } = game.recordFinalExam(semesterId, passed);
      game.evaluateDragonItems();

      const newTreasures: { drawn: RewardCardDef; duplicate: boolean; label: string }[] = [];
      if (grantCard) {
        const t = game.drawTreasureCard();
        newTreasures.push({ ...t, label: '총괄평가 통과 보상' });
      }
      const hidden = game.checkHiddenMissions().map((h) => ({
        drawn: h.drawn,
        duplicate: h.duplicate,
        label: `히든 미션: ${h.mission.name}`,
      }));
      newTreasures.push(...hidden);
      setTreasures(newTreasures);

      const earnedBadges = game.evaluateBadges();
      setBadges(earnedBadges.map((b) => ({ emoji: b.emoji, name: b.name })));
      setAlreadyGranted(passed && !grantCard);

      void track('exam.complete', { unit_id: semesterId, score: score * 4, policy_tag: 'final' });
      syncNow();
      sfx.fanfare();
      setPhase('result');
      return;
    }
    setIndex((i) => i + 1);
    setProblem(pickFinalProblem(semester.units, index + 1));
    servedAtRef.current = Date.now();
    setAnswer(null);
    setPhase('answering');
  };

  const restart = () => {
    setIndex(0);
    setScore(0);
    setTreasures([]);
    setBadges([]);
    setAlreadyGranted(false);
    setProblem(pickFinalProblem(semester.units, 0));
    servedAtRef.current = Date.now();
    setAnswer(null);
    void track('exam.start', { unit_id: semesterId, policy_tag: 'final' });
    setPhase('answering');
  };

  // ── 결과 화면 ──
  if (phase === 'result') {
    const grade = gradeOf(score);
    const passed = score >= PASS_SCORE;
    return (
      <div className="min-h-dvh flex flex-col items-center gap-5 p-6 pt-10 text-center max-w-xl mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="text-7xl mb-2">{grade.emoji}</div>
          <h1 className="text-3xl text-glow">{grade.title}</h1>
        </motion.div>
        <div className="text-5xl font-bold text-coin">
          {score}<span className="text-2xl opacity-60"> / {TOTAL}</span>
        </div>
        <p className="opacity-80">{grade.line}</p>
        <div className="rounded-2xl bg-night-800 px-6 py-3">
          <span className="text-coin">+{score * 3 + 10} XP</span>
        </div>
        {passed && alreadyGranted && (
          <div className="rounded-2xl bg-night-900 border border-coin/30 px-5 py-3 text-sm opacity-80">
            이미 보상 카드를 받은 학기예요 — 이번엔 배지로 보답! 🏅
          </div>
        )}
        {badges.length > 0 && (
          <div className="rounded-2xl bg-night-900 border border-violet-500/40 px-5 py-3 text-sm">
            🎖️ 새 배지 획득: {badges.map((b) => `${b.emoji} ${b.name}`).join(', ')}
          </div>
        )}
        {treasures.map((t, i) => (
          <TreasureReveal key={i} drawn={t.drawn} duplicate={t.duplicate} label={t.label} delay={0.8 + i * 0.5} />
        ))}
        <div className="flex gap-3 mt-2">
          <button
            onClick={restart}
            className="btn-3d rounded-2xl bg-glow border-glow border-b-lime-600 px-7 py-3 text-lg text-night-950"
          >
            다시 도전
          </button>
          <Link
            to="/"
            className="btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-7 py-3 text-lg"
          >
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  if (!problem) return null;
  const locked = phase === 'feedback';

  return (
    <div className="min-h-dvh flex flex-col max-w-xl mx-auto">
      {/* ── 진행 헤더 ── */}
      <div className="flex items-center gap-3 p-4">
        <Link to="/hub" className="text-2xl opacity-60 hover:opacity-100" aria-label="나가기">
          ✕
        </Link>
        <div className="flex-1">
          <div className="text-sm leading-tight">🏰 {semester.label} 총괄평가</div>
          <div className="h-3 mt-1 rounded-full bg-night-800 overflow-hidden border border-night-700">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-coin"
              animate={{ width: `${(index / TOTAL) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-sm opacity-70">
          {index + 1}/{TOTAL}
        </div>
      </div>

      {/* ── 현재 단원 표시 ── */}
      <div className="px-4 pb-1">
        <div className="text-xs opacity-40">
          {UNIT_TITLES[semester.units[index % semester.units.length]] ?? ''}
        </div>
      </div>

      {/* ── 문제 영역 ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-7 px-5 pb-44">
        <AnimatePresence mode="wait">
          <motion.div
            key={problem.id}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center gap-7"
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

      {/* ── 하단 확인/피드백 패널 ── */}
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
                  {lastCorrect ? '정답! ⚔️' : '아쉬워요! 😢'}
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
                  {index + 1 >= TOTAL ? '결과 보기' : '다음 문제'}
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
