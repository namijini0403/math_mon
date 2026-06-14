/**
 * 명예의 시험장 — 단원평가 연습.
 * 단원을 골라 10문제(난이도 상승, 후반 심화 혼합)를 풀고 점수·등급을 받는다.
 * 하트 없음, 보스전과 비슷한 난이도. 교사는 단원평가 대비용으로 활용.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SKILLS, generateProblem, randomSeed } from '../generator';
import type { Problem, SkillDef } from '../generator/types';
import { SEMESTERS, UNIT_TITLES } from '../game/stages';
import { accessZone, parseGradeSemester } from '../game/gradeAccess';
import { checkAnswer, isAnswerReady, type UserAnswer } from '../game/check';
import { answerToText } from '../generator/render-text';
import { useGame } from '../game/store';
import { sfx } from '../game/sounds';
import { TreasureReveal } from '../components/TreasureReveal';
import type { RewardCardDef } from '../game/rewardCards';
import { MathView } from '../components/MathView';
import { FigureView } from '../components/figure/FigureView';
import { SolutionReveal } from '../components/SolutionReveal';
import { ChoiceView } from '../components/problem/ChoiceView';
import { ComparisonView } from '../components/problem/ComparisonView';
import { FractionInputView } from '../components/problem/FractionInputView';
import { DecimalInputView } from '../components/problem/DecimalInputView';
import { FillBlanksView } from '../components/problem/FillBlanksView';
import { MatchingView } from '../components/problem/MatchingView';
import { GuidingStarButton } from '../components/GuidingStarButton';
import { track } from '../analytics';

const TOTAL = 10;

type Stats = Record<string, { c: number; w: number }>;

/** 약점 가중 픽 — 정답률이 낮은(틀린 비율 높은) 스킬을 더 자주 뽑는다. */
function pickWeighted(pool: SkillDef[], stats: Stats): SkillDef {
  const entries = pool.map((s) => {
    const st = stats[s.id];
    // 표본 없으면 보통 가중, 오답이 많을수록 최대 3배까지 가중
    const w = !st || st.c + st.w === 0 ? 1 : 1 + 2 * (st.w / (st.c + st.w));
    return { s, w };
  });
  const totalW = entries.reduce((a, e) => a + e.w, 0);
  let r = Math.random() * totalW;
  for (const e of entries) {
    r -= e.w;
    if (r <= 0) return e.s;
  }
  return entries[entries.length - 1].s;
}

/**
 * 시험 문제 선택 — 앞 3문제 기초, 중간 보통, 마지막 3문제 도전(심화 혼합).
 * weak=true(약점 봉인 모드)면 같은 난이도 풀 안에서 '내가 틀린 유형'을 가중해 뽑는다.
 */
function pickExamProblem(unitId: string, index: number, weak: boolean, stats: Stats): Problem {
  const unitSkills = SKILLS.filter((s) => s.unitId === unitId);
  const target: 1 | 2 | 3 = index < 3 ? 1 : index < 7 ? 2 : 3;
  let pool: SkillDef[];
  if (target === 3) {
    const ch = unitSkills.filter((s) => s.challenge === true);
    const hard = unitSkills.filter((s) => s.difficulty === 3);
    pool = Math.random() < 0.5 && ch.length > 0 ? ch : hard.length > 0 ? hard : unitSkills;
  } else {
    pool = unitSkills.filter((s) => !s.challenge && s.difficulty === target);
    if (pool.length === 0) pool = unitSkills.filter((s) => !s.challenge);
  }
  const skill = weak ? pickWeighted(pool, stats) : pool[Math.floor(Math.random() * pool.length)];
  return generateProblem(skill.id, randomSeed());
}

function gradeOf(score: number): { title: string; emoji: string; line: string } {
  if (score === 10) return { title: '전설의 용사!', emoji: '👑', line: '완벽해요! 단원을 완전히 정복했어요!' };
  if (score >= 8) return { title: '명예 합격!', emoji: '🏆', line: '훌륭해요! 단원평가 준비 완료!' };
  if (score >= 5) return { title: '조금만 더!', emoji: '🛡️', line: '거의 다 왔어요. 틀린 유형을 복습해 봐요!' };
  return { title: '수련이 필요해요', emoji: '🌱', line: '괜찮아요! 레슨을 다시 돌고 도전해 봐요!' };
}

export default function ExamPage() {
  const { showAnswers, recordAnswer, addXp, syncNow, classCode } = useGame();
  const [searchParams] = useSearchParams();
  const weak = searchParams.get('focus') === 'weak';
  const [unitId, setUnitId] = useState<string | null>(null);
  // 복습/선행 단원 시험은 보상(XP·메달·미션카드) 미지급
  const rewarded = unitId ? accessZone(parseGradeSemester(classCode), unitId) === 'current' : true;
  const [index, setIndex] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [answer, setAnswer] = useState<UserAnswer | null>(null);
  const [phase, setPhase] = useState<'pick' | 'answering' | 'feedback' | 'result'>('pick');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [treasures, setTreasures] = useState<{ drawn: RewardCardDef; duplicate: boolean; label: string }[]>([]);

  const servedAtRef = useRef<number>(Date.now());

  // 런처에서 단원을 지정해 들어오면(/exam/:unitId) 그 단원으로 바로 시작
  const { unitId: routeUnitId } = useParams();
  // 시험 단원이 속한 학기를 우선 사용 (없으면 마지막 선택 학기 → 기본)
  const semId =
    (routeUnitId && SEMESTERS.find((s) => s.units.includes(routeUnitId))?.id) ??
    localStorage.getItem('mathmon-semester') ??
    'g5s1';
  const semester = SEMESTERS.find((s) => s.id === semId) ?? SEMESTERS[0];

  const begin = (uid: string) => {
    setUnitId(uid);
    setIndex(0);
    setScore(0);
    setProblem(pickExamProblem(uid, 0, weak, useGame.getState().skillStats));
    servedAtRef.current = Date.now();
    setAnswer(null);
    void track('exam.start', { unit_id: uid, policy_tag: weak ? 'weak' : 'normal' });
    setPhase('answering');
  };

  // 라우트로 단원이 지정된 경우 자동 시작 (마운트 1회)
  useEffect(() => {
    if (routeUnitId) begin(routeUnitId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirm = (forced?: UserAnswer) => {
    const a = forced ?? answer;
    if (!a || !problem) return;
    const elapsed_ms = Date.now() - servedAtRef.current;
    const ok = checkAnswer(problem, a);
    recordAnswer(problem.skillId, ok, problem.seed);
    void track('exam.answer', {
      unit_id: unitId ?? undefined,
      skill_id: problem.skillId,
      problem_id: problem.id,
      correct: ok,
      elapsed_ms,
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
    if (!unitId) return;
    if (index + 1 >= TOTAL) {
      // 시험 종료
      const game = useGame.getState();
      if (rewarded) {
        game.recordExam();
        addXp(score * 2 + 5);
        game.evaluateDragonItems();
        const hidden = game.checkHiddenMissions().map((h) => ({
          drawn: h.drawn,
          duplicate: h.duplicate,
          label: `히든 미션: ${h.mission.name}`,
        }));
        setTreasures(hidden);
      }
      void track('exam.complete', { unit_id: unitId, score: score * 10 });
      syncNow();
      sfx.fanfare();
      setPhase('result');
      return;
    }
    setIndex((i) => i + 1);
    setProblem(pickExamProblem(unitId, index + 1, weak, useGame.getState().skillStats));
    servedAtRef.current = Date.now();
    setAnswer(null);
    setPhase('answering');
  };

  // ── 단원 선택 ──
  if (phase === 'pick') {
    return (
      <div className="max-w-xl mx-auto px-5 pb-16">
        <div className="flex items-center gap-3 py-4">
          <Link to="/" className="text-2xl opacity-60 hover:opacity-100" aria-label="나가기">←</Link>
          <div>
            <h1 className="text-xl">{weak ? '🌑 약점 봉인 모드' : '🏟️ 명예의 시험장'}</h1>
            <p className="text-xs opacity-60">
              {weak
                ? `내가 자주 틀린 유형을 집중 출제해요 (보스전 수준 · ${semester.label})`
                : `단원을 골라 10문제 시험에 도전! (보스전 수준 · ${semester.label})`}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 mt-2">
          {semester.units.map((uid) => (
            <button
              key={uid}
              onClick={() => begin(uid)}
              className="btn-3d rounded-2xl bg-night-900 border-2 border-night-700 border-b-night-700 px-5 py-4 text-left hover:bg-night-800 flex items-center"
            >
              <span className="flex-1">{UNIT_TITLES[uid]}</span>
              <span className="opacity-50">⚔️ 도전</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── 결과 ──
  if (phase === 'result') {
    const grade = gradeOf(score);
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-5 p-6 text-center max-w-xl mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="text-7xl mb-2">{grade.emoji}</div>
          <h1 className="text-3xl text-glow">{grade.title}</h1>
        </motion.div>
        <div className="text-5xl font-bold text-coin">
          {score}<span className="text-2xl opacity-60"> / {TOTAL}</span>
        </div>
        <p className="opacity-80">{grade.line}</p>
        <div className="rounded-2xl bg-night-800 px-6 py-3">
          {rewarded ? (
            <span className="text-coin">+{score * 2 + 5} XP</span>
          ) : (
            <span className="text-sm opacity-80">
              {accessZone(parseGradeSemester(classCode), unitId ?? '') === 'review' ? '복습' : '선행'} 시험 — 경험치는 오르지 않아요
            </span>
          )}
        </div>
        {treasures.map((t, i) => (
          <TreasureReveal key={i} drawn={t.drawn} duplicate={t.duplicate} label={t.label} delay={0.8 + i * 0.5} />
        ))}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => setPhase('pick')}
            className="btn-3d rounded-2xl bg-glow border-glow border-b-lime-600 px-7 py-3 text-lg text-night-950"
          >
            다른 단원 도전
          </button>
          <Link to="/" className="btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-7 py-3 text-lg">
            지도로
          </Link>
        </div>
      </div>
    );
  }

  if (!problem) return null;
  const locked = phase === 'feedback';

  return (
    <div className="min-h-dvh flex flex-col max-w-xl mx-auto">
      <div className="flex items-center gap-3 p-4">
        <Link to="/" className="text-2xl opacity-60 hover:opacity-100" aria-label="나가기">✕</Link>
        <div className="flex-1">
          <div className="text-sm leading-tight">
            {weak ? '🌑' : '🏟️'} {unitId ? UNIT_TITLES[unitId] : ''} {weak ? '약점 봉인 모드' : '시험'}
          </div>
          <div className="h-3 mt-1 rounded-full bg-night-800 overflow-hidden border border-night-700">
            <motion.div
              className="h-full bg-gradient-to-r from-coin to-amber-500"
              animate={{ width: `${(index / TOTAL) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-sm opacity-70">
          {index + 1}/{TOTAL}
        </div>
      </div>

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
            {problem.figure && <FigureView spec={problem.figure} />}
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
                {lastCorrect && <SolutionReveal explanation={problem.explanation} />}
                <button
                  onClick={next}
                  autoFocus
                  className={`btn-3d w-full mt-3 rounded-2xl py-3.5 text-xl text-night-950 ${
                    lastCorrect ? 'bg-glow border-glow border-b-lime-600' : 'bg-hurt border-hurt border-b-rose-600'
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
                  <GuidingStarButton skillId={problem.skillId} problemId={problem.id} />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
