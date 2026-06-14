/**
 * 📜 도착한 시험 — 교사가 배포한 특별 단원평가를 응시하는 화면 (Phase D).
 * 문제는 buildAssignment로 결정적으로 구성(학생별 시드 → 학생마다 다른 시험 + 재현 가능).
 * 제출 시 서버에 (skillId, seed, correct) 문항별 결과를 1회 기록한다.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { generateProblem } from '../generator';
import type { Problem } from '../generator/types';
import { buildAssignment, studentSeed } from '../game/assignmentGen';
import { checkAnswer, isAnswerReady, type UserAnswer } from '../game/check';
import { useGame } from '../game/store';
import { sfx } from '../game/sounds';
import { fetchMyAssignments, submitAssignment, type PendingAssignment } from '../api';
import { MathView } from '../components/MathView';
import { SolutionReveal } from '../components/SolutionReveal';
import { ProblemBody } from '../components/problem/ProblemBody';
import { track } from '../analytics';

export default function AssignmentPage() {
  const { id = '' } = useParams();
  const [assignment, setAssignment] = useState<PendingAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchMyAssignments()
      .then((list) => {
        if (!alive) return;
        setAssignment(list.find((a) => a.id === id) ?? null);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-center opacity-70">
        <div>
          <div className="text-5xl mb-3 animate-pulse">📜</div>
          시험을 불러오는 중…
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-5xl">📭</div>
        <p className="opacity-80">받을 수 있는 시험이 없어요. (이미 풀었거나 마감되었을 수 있어요)</p>
        <Link to="/" className="btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-6 py-3">
          지도로
        </Link>
      </div>
    );
  }

  return <AssignmentRunner key={assignment.id} assignment={assignment} />;
}

interface ItemResult {
  skillId: string;
  seed: number;
  correct: boolean;
}

function AssignmentRunner({ assignment }: { assignment: PendingAssignment }) {
  const { recordAnswer, addXp, syncNow, showAnswers, studentId, nickname, skillStats, helpLog } = useGame();
  const navigate = useNavigate();

  // 학생별 결정적 시드 → 학생마다 다른 시험(약점 가중 시 본인 약점 반영)
  const problems = useMemo<Problem[]>(() => {
    const key = studentId ?? nickname ?? 'anon';
    const seed = studentSeed(assignment.seed, key);
    const items = buildAssignment(assignment.config, seed, skillStats, helpLog);
    return items.map((it) => generateProblem(it.skillId, it.seed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment.id]);

  const total = problems.length;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<UserAnswer | null>(null);
  const [phase, setPhase] = useState<'answering' | 'feedback' | 'result'>('answering');
  const [lastCorrect, setLastCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');
  const resultsRef = useRef<ItemResult[]>([]);
  const servedAtRef = useRef<number>(Date.now());
  const submittedRef = useRef(false);

  useEffect(() => {
    void track('exam.start', { unit_id: assignment.config.unitIds[0], policy_tag: 'assignment' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (total === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-5xl">⚠️</div>
        <p className="opacity-80">시험 문제를 구성할 수 없어요. 선생님께 알려 주세요.</p>
        <Link to="/" className="btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-6 py-3">
          지도로
        </Link>
      </div>
    );
  }

  const problem = problems[index];

  const finish = async (finalResults: ItemResult[], finalScore: number) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitState('sending');
    void track('exam.complete', {
      unit_id: assignment.config.unitIds[0],
      score: Math.round((finalScore / total) * 100),
    });
    // 현재 학기 보상과 충돌 없이, 특별 시험 응시 보상은 소액 XP만(카드 없음 — 경제 불변).
    addXp(finalScore * 2 + 3);
    syncNow();
    const ok = await submitAssignment(assignment.id, {
      score: finalScore,
      total,
      items: finalResults,
    });
    setSubmitState(ok ? 'done' : 'failed');
  };

  const confirm = (forced?: UserAnswer) => {
    const a = forced ?? answer;
    if (!a) return;
    const elapsed_ms = Date.now() - servedAtRef.current;
    const ok = checkAnswer(problem, a);
    recordAnswer(problem.skillId, ok, problem.seed);
    resultsRef.current.push({ skillId: problem.skillId, seed: problem.seed, correct: ok });
    void track('exam.answer', {
      unit_id: assignment.config.unitIds[0],
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
    if (index + 1 >= total) {
      const finalScore = resultsRef.current.filter((r) => r.correct).length;
      sfx.fanfare();
      setPhase('result');
      void finish(resultsRef.current, finalScore);
      return;
    }
    setIndex((i) => i + 1);
    servedAtRef.current = Date.now();
    setAnswer(null);
    setPhase('answering');
  };

  // ── 결과 ──
  if (phase === 'result') {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-5 p-6 text-center max-w-xl mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="text-7xl mb-2">📜</div>
          <h1 className="text-2xl text-glow">시험 제출 완료!</h1>
        </motion.div>
        {assignment.title && <p className="opacity-70 text-sm">「{assignment.title}」</p>}
        <div className="text-5xl font-bold text-coin">
          {score}<span className="text-2xl opacity-60"> / {total}</span>
        </div>
        <p className="opacity-80">{pct}점</p>
        <div className="rounded-2xl bg-night-800 px-6 py-3 text-sm">
          {submitState === 'sending' && <span className="opacity-70">선생님께 결과를 보내는 중…</span>}
          {submitState === 'done' && <span className="text-glow">선생님께 결과를 보냈어요 ✅ (+{score * 2 + 3} XP)</span>}
          {submitState === 'failed' && (
            <span className="text-hurt">결과 전송에 실패했어요. 인터넷 연결을 확인해 주세요.</span>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-3d rounded-2xl bg-glow border-glow border-b-lime-600 px-7 py-3 text-lg text-night-950"
        >
          지도로 돌아가기
        </button>
      </div>
    );
  }

  const locked = phase === 'feedback';

  return (
    <div className="min-h-dvh flex flex-col max-w-xl mx-auto">
      <div className="flex items-center gap-3 p-4">
        <Link to="/" className="text-2xl opacity-60 hover:opacity-100" aria-label="나가기">
          ✕
        </Link>
        <div className="flex-1">
          <div className="text-sm leading-tight">📜 {assignment.title || '선생님이 보낸 시험'}</div>
          <div className="h-3 mt-1 rounded-full bg-night-800 overflow-hidden border border-night-700">
            <motion.div
              className="h-full bg-gradient-to-r from-coin to-amber-500"
              animate={{ width: `${(index / total) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-sm opacity-70">
          {index + 1}/{total}
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
                  {index + 1 >= total ? '제출하기' : '다음 문제'}
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
