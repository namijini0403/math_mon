/**
 * 연습 모드 — 하트 없이 무한 연습. 기초 연산 / 문장제 두 코너.
 * 모든 정오답은 skillStats에 기록되고 10문제마다 서버에 동기화된다 (교사 현황 연동).
 */

import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SKILLS, generateProblem, randomSeed } from '../generator';
import { UNIT_TITLES } from '../game/stages';
import { accessZone, parseGradeSemester } from '../game/gradeAccess';
import type { Problem, SkillDef } from '../generator/types';
import { checkAnswer, isAnswerReady, type UserAnswer } from '../game/check';
import { answerToText } from '../generator/render-text';
import { useGame } from '../game/store';
import { sfx } from '../game/sounds';
import { MathView } from '../components/MathView';
import { ChoiceView } from '../components/problem/ChoiceView';
import { ComparisonView } from '../components/problem/ComparisonView';
import { FractionInputView } from '../components/problem/FractionInputView';
import { DecimalInputView } from '../components/problem/DecimalInputView';
import { FillBlanksView } from '../components/problem/FillBlanksView';
import { MatchingView } from '../components/problem/MatchingView';
import { track } from '../analytics';

/** 선택한 단원의 스킬만 (선행/누적 없음 — '이 단원'만 정확히) */
function unitSkills(unitId: string): SkillDef[] {
  return SKILLS.filter((s) => s.unitId === unitId);
}

const MODES = {
  basic: {
    title: '기초 연산 연습',
    emoji: '🏋️',
    desc: '계산 문제만 무한으로!',
    pool: (unitId: string) => {
      const u = unitSkills(unitId);
      const p = u.filter((s) => !s.word && !s.challenge && s.difficulty <= 2);
      // 기초 풀이 비면 그 단원의 비심화 스킬 전체로 폴백
      return p.length > 0 ? p : u.filter((s) => !s.challenge);
    },
  },
  word: {
    title: '문장제 연습',
    emoji: '📖',
    desc: '줄글 문제만 모아서 연습!',
    pool: (unitId: string) => {
      const u = unitSkills(unitId);
      const p = u.filter((s) => s.word === true && !s.challenge);
      return p.length > 0 ? p : u.filter((s) => !s.challenge);
    },
  },
  challenge: {
    title: '심화 연습',
    emoji: '🌌',
    desc: '고난도 문제 도전!',
    pool: (unitId: string) => {
      const u = unitSkills(unitId);
      const ch = u.filter((s) => s.challenge === true);
      // 심화 스킬이 아직 없는 단원은 도전(난이도 3) 문제로 대체
      const d3 = u.filter((s) => s.difficulty === 3);
      return ch.length > 0 ? ch : d3.length > 0 ? d3 : u;
    },
  },
} as const;

export type PracticeMode = keyof typeof MODES;

function pickProblem(
  mode: PracticeMode,
  unitId: string,
  stats: Record<string, { c: number; w: number }>,
): Problem {
  const pool = MODES[mode].pool(unitId);
  // 약한 스킬 가중
  const entries = pool.map((s) => {
    const st = stats[s.id];
    const w = !st || st.c + st.w === 0 ? 1.5 : 1 + 2 * (st.w / (st.c + st.w));
    return { s, w };
  });
  const totalW = entries.reduce((a, e) => a + e.w, 0);
  let r = Math.random() * totalW;
  for (const e of entries) {
    r -= e.w;
    if (r <= 0) return generateProblem(e.s.id, randomSeed());
  }
  return generateProblem(entries[entries.length - 1].s.id, randomSeed());
}

export default function PracticePage() {
  const { mode = 'basic', unitId = '' } = useParams();
  const m = (mode in MODES ? mode : 'basic') as PracticeMode;
  return <PracticeRunner key={`${m}:${unitId}`} mode={m} unitId={unitId} />;
}

function PracticeRunner({ mode, unitId }: { mode: PracticeMode; unitId: string }) {
  const { recordAnswer, addXp, syncNow, showAnswers, classCode } = useGame();
  // 학년 접근: 복습/선행 단원 연습은 보상(XP·드래곤 성장) 미지급(파밍 방지)
  const zone = accessZone(parseGradeSemester(classCode), unitId);
  const rewarded = zone === 'current';
  const [problem, setProblem] = useState<Problem>(() =>
    pickProblem(mode, unitId, useGame.getState().skillStats),
  );
  const [answer, setAnswer] = useState<UserAnswer | null>(null);
  const [phase, setPhase] = useState<'answering' | 'feedback'>('answering');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [solved, setSolved] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [setToast, setSetToast] = useState(false);
  const answeredRef = useRef(0);
  const servedAtRef = useRef<number>(Date.now());

  // 나갈 때 동기화
  useEffect(() => () => syncNow(), [syncNow]);

  const meta = MODES[mode];

  const confirm = (forced?: UserAnswer) => {
    const a = forced ?? answer;
    if (!a) return;
    const elapsed_ms = Date.now() - servedAtRef.current;
    const ok = checkAnswer(problem, a);
    recordAnswer(problem.skillId, ok);
    void track('practice.answer', {
      skill_id: problem.skillId,
      problem_id: problem.id,
      correct: ok,
      elapsed_ms,
      policy_tag: mode,
    });
    setLastCorrect(ok);
    setSolved((s) => s + 1);
    if (ok) {
      setCorrect((c) => c + 1);
      setStreak((s) => s + 1);
      if (rewarded) addXp(1); // 연습은 문제당 1 XP (현재 학기만)
      sfx.correct();
    } else {
      setStreak(0);
      sfx.wrong();
    }
    // 드래곤 성장: 연습 10문제 = 1세트 (복습/선행은 미적립)
    const game = useGame.getState();
    const completedSet = rewarded ? game.addPracticeAnswer(mode) : null;
    setSetToast(completedSet !== null);
    if (completedSet) {
      game.evaluateDragonItems();
      void track('practice.set_complete', { policy_tag: mode });
      sfx.fanfare();
    }
    answeredRef.current += 1;
    if (answeredRef.current % 10 === 0) syncNow();
    setPhase('feedback');
  };

  const next = () => {
    setProblem(pickProblem(mode, unitId, useGame.getState().skillStats));
    servedAtRef.current = Date.now();
    setAnswer(null);
    setPhase('answering');
  };

  const locked = phase === 'feedback';

  return (
    <div className="min-h-dvh flex flex-col max-w-xl mx-auto">
      <div className="flex items-center gap-3 p-4">
        <Link to="/" className="text-2xl opacity-60 hover:opacity-100" aria-label="나가기">
          ✕
        </Link>
        <div className="flex-1">
          <div className="text-lg leading-tight">
            {meta.emoji} {UNIT_TITLES[unitId] ?? meta.title}
          </div>
          <div className="text-[0.7rem] opacity-50 leading-tight">{meta.title}</div>
          <div className="text-xs opacity-60">
            {solved}문제 중 {correct}개 정답
            {solved > 0 && ` (${Math.round((correct / solved) * 100)}%)`}
          </div>
        </div>
        {streak >= 2 && <div className="text-coin text-sm">🔥 {streak}연속</div>}
      </div>

      {!rewarded && (
        <div
          className={`mx-4 mb-1 rounded-xl px-3 py-2 text-[0.7rem] leading-snug border ${
            zone === 'review' ? 'bg-mana/10 border-mana/40 text-mana' : 'bg-night-800 border-night-700 opacity-80'
          }`}
        >
          {zone === 'review'
            ? '⏳ 복습 연습이에요 — 실력은 쌓이지만 경험치·드래곤 성장은 오르지 않아요.'
            : '🚀 선행 연습이에요 — 도전은 좋지만 경험치·드래곤 성장은 오르지 않아요.'}
        </div>
      )}

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
                  {lastCorrect ? (rewarded ? '정답! +1 XP ✨' : '정답! ✨') : '아쉬워요! 😢'}
                </div>
                {setToast && (
                  <div className="text-sm text-coin mb-1">
                    🐲 연습 1세트 완성! 드래곤이 쑥쑥 자라요 (+15 성장)
                  </div>
                )}
                {!lastCorrect && (
                  <div className="text-sm leading-relaxed opacity-90 mb-1">
                    <MathView expr={problem.explanation} size="md" className="justify-start" />
                  </div>
                )}
                <button
                  onClick={next}
                  autoFocus
                  className={`btn-3d w-full mt-3 rounded-2xl py-3.5 text-xl text-night-950 ${
                    lastCorrect ? 'bg-glow border-glow border-b-lime-600' : 'bg-hurt border-hurt border-b-rose-600'
                  }`}
                >
                  다음 문제
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
