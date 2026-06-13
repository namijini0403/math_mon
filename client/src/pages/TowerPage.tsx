/**
 * 「수련의 첨탑」 — 한 가지 유형(스킬)만 무한히 단련하는 곳.
 * 회랑에서 못 되살린 별의 유형, 또는 약한 유형을 집중 반복할 때 쓴다.
 * 보상은 연습과 동일(현재 학기만 문제당 +1 XP — 복습/선행은 미지급, 파밍 방지).
 */

import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { generateProblem, getSkill, randomSeed } from '../generator';
import type { Problem, SkillDef } from '../generator/types';
import { UNIT_TITLES } from '../game/stages';
import { accessZone, parseGradeSemester } from '../game/gradeAccess';
import { checkAnswer, isAnswerReady, type UserAnswer } from '../game/check';
import { useGame } from '../game/store';
import { sfx } from '../game/sounds';
import { MathView } from '../components/MathView';
import { SolutionReveal } from '../components/SolutionReveal';
import { ProblemBody } from '../components/problem/ProblemBody';
import { track } from '../analytics';

export default function TowerPage() {
  const { skillId = '' } = useParams();
  let skill: SkillDef | null = null;
  try {
    skill = getSkill(skillId);
  } catch {
    skill = null;
  }
  if (!skill) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-5xl">🗼</div>
        <p className="opacity-80">알 수 없는 수련 유형이에요.</p>
        <Link to="/" className="btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-6 py-3">
          지도로
        </Link>
      </div>
    );
  }
  return <TowerRunner key={skillId} skill={skill} />;
}

function TowerRunner({ skill }: { skill: SkillDef }) {
  const { recordAnswer, addXp, syncNow, showAnswers, classCode } = useGame();
  const rewarded = useMemo(
    () => accessZone(parseGradeSemester(classCode), skill.unitId) === 'current',
    [classCode, skill.unitId],
  );

  const [problem, setProblem] = useState<Problem>(() => generateProblem(skill.id, randomSeed()));
  const [answer, setAnswer] = useState<UserAnswer | null>(null);
  const [phase, setPhase] = useState<'answering' | 'feedback'>('answering');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [solved, setSolved] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const answeredRef = useRef(0);
  const servedAtRef = useRef<number>(Date.now());

  const confirm = (forced?: UserAnswer) => {
    const a = forced ?? answer;
    if (!a) return;
    const elapsed_ms = Date.now() - servedAtRef.current;
    const ok = checkAnswer(problem, a);
    recordAnswer(problem.skillId, ok, problem.seed);
    void track('practice.answer', {
      skill_id: problem.skillId,
      problem_id: problem.id,
      correct: ok,
      elapsed_ms,
      policy_tag: 'tower',
    });
    setLastCorrect(ok);
    setSolved((s) => s + 1);
    if (ok) {
      setCorrect((c) => c + 1);
      setStreak((s) => s + 1);
      if (rewarded) addXp(1);
      sfx.correct();
    } else {
      setStreak(0);
      sfx.wrong();
    }
    answeredRef.current += 1;
    if (answeredRef.current % 10 === 0) syncNow();
    setPhase('feedback');
  };

  const next = () => {
    setProblem(generateProblem(skill.id, randomSeed()));
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
          <div className="text-lg leading-tight">🗼 수련의 첨탑</div>
          <div className="text-[0.7rem] opacity-50 leading-tight">
            {skill.title} · {UNIT_TITLES[skill.unitId] ?? skill.unitId}
          </div>
          <div className="text-xs opacity-60">
            {solved}문제 중 {correct}개 정답
            {solved > 0 && ` (${Math.round((correct / solved) * 100)}%)`}
          </div>
        </div>
        {streak >= 2 && <div className="text-coin text-sm">🔥 {streak}연속</div>}
      </div>

      {!rewarded && (
        <div className="mx-4 mb-1 rounded-xl px-3 py-2 text-[0.7rem] leading-snug border bg-night-800 border-night-700 opacity-80">
          이 유형은 현재 학기가 아니라 경험치·드래곤 성장은 오르지 않아요. 그래도 단련은 실력이 돼요! 💪
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-7 px-5 pb-44">
        <AnimatePresence mode="wait">
          <motion.div
            key={problem.id}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <ProblemBody
              problem={problem}
              answer={answer}
              onChange={setAnswer}
              locked={locked}
              onMatchingComplete={(mistakes) => confirm({ kind: 'matching', mistakes })}
              showAnswer={showAnswers}
            />
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
