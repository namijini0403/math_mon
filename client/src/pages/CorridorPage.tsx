/**
 * 「흐려진 별의 회랑」 — 틀렸던 문제(흐려진 별)를 그 문제 그대로 다시 풀어 별을 되살리는 곳.
 * 데이터: store.wrongLog (단원별 (skillId,seed)). 저장된 seed로 generateProblem → 완전 동일 문제 재현.
 * 맞히면 별 점등 + 목록에서 졸업(recordAnswer가 clearWrong). 틀리면 흐린 채로 남는다.
 * (오답노트라는 학습지스러운 이름 대신 세계관 이름 — 빛을 잃은 별을 되살리는 모험)
 */

import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { generateProblem, getSkill } from '../generator';
import type { Problem } from '../generator/types';
import { UNIT_TITLES } from '../game/stages';
import { unitsWithWrong, type WrongEntry } from '../game/wrongLog';
import { checkAnswer, isAnswerReady, type UserAnswer } from '../game/check';
import { useGame } from '../game/store';
import { sfx } from '../game/sounds';
import { MathView } from '../components/MathView';
import { SolutionReveal } from '../components/SolutionReveal';
import { ProblemBody } from '../components/problem/ProblemBody';

/** 단원 선택 — 흐려진 별이 있는 단원만 보여준다 */
function CorridorPicker() {
  const wrongLog = useGame((s) => s.wrongLog);
  const units = unitsWithWrong(wrongLog);

  return (
    <div className="max-w-xl mx-auto px-5 pb-20">
      <div className="flex items-center gap-3 py-4">
        <Link to="/" className="text-2xl opacity-60 hover:opacity-100" aria-label="홈으로">
          ←
        </Link>
        <div>
          <h1 className="text-xl">🌌 흐려진 별의 회랑</h1>
          <p className="text-xs opacity-60">틀렸던 문제를 다시 풀어 별빛을 되살려요</p>
        </div>
      </div>

      {units.length === 0 ? (
        <div className="rounded-3xl bg-night-900 border-2 border-night-700 px-6 py-12 text-center mt-6">
          <div className="text-5xl mb-3">✨</div>
          <div className="text-lg">모든 별이 반짝이고 있어요!</div>
          <div className="text-xs opacity-60 mt-2 leading-relaxed">
            틀린 문제가 생기면 이곳에 흐려진 별로 모여요.
            <br />
            다시 풀어서 별빛을 되살릴 수 있어요.
          </div>
          <Link
            to="/"
            className="inline-block btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-6 py-2.5 mt-5 text-sm"
          >
            지도로 돌아가기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 mt-2">
          <div className="text-xs opacity-50 px-1">되살릴 별이 있는 단원</div>
          {units.map(({ unitId, count }) => (
            <Link
              key={unitId}
              to={`/corridor/${unitId}`}
              className="btn-3d rounded-2xl bg-night-900 border-2 border-night-700 border-b-night-700 px-5 py-4 hover:bg-night-800 flex items-center gap-3"
            >
              <span className="text-2xl">🌫️</span>
              <span className="flex-1">{UNIT_TITLES[unitId] ?? unitId}</span>
              <span className="text-coin text-sm">흐려진 별 {count}개</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

interface Slot {
  entry: WrongEntry;
  problem: Problem;
}

/** 회랑 진행 — 시작 시점의 흐려진 별 목록을 스냅샷으로 잡고 하나씩 다시 푼다 */
function CorridorRunner({ unitId }: { unitId: string }) {
  const navigate = useNavigate();
  const { recordAnswer, showAnswers } = useGame();

  // 시작 시점 스냅샷 (풀면서 store가 바뀌어도 이번 세션 목록은 고정)
  const slots = useMemo<Slot[]>(() => {
    const arr = useGame.getState().wrongLog[unitId] ?? [];
    return arr
      .map((entry) => {
        try {
          getSkill(entry.skillId); // 존재하지 않는 스킬은 제외
          return { entry, problem: generateProblem(entry.skillId, entry.seed) };
        } catch {
          return null;
        }
      })
      .filter((x): x is Slot => x !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<UserAnswer | null>(null);
  const [phase, setPhase] = useState<'answering' | 'feedback' | 'done'>(
    slots.length === 0 ? 'done' : 'answering',
  );
  const [lastCorrect, setLastCorrect] = useState(false);
  const [relit, setRelit] = useState(0);
  const [stillDim, setStillDim] = useState(0);
  const servedAtRef = useRef<number>(Date.now());

  const slot = slots[idx];

  const confirm = (forced?: UserAnswer) => {
    const a = forced ?? answer;
    if (!a || !slot) return;
    const ok = checkAnswer(slot.problem, a);
    // seed를 넘기면 store가 정답 시 clearWrong(별 점등), 오답 시 ts 갱신
    recordAnswer(slot.entry.skillId, ok, slot.entry.seed);
    setLastCorrect(ok);
    if (ok) {
      setRelit((n) => n + 1);
      sfx.correct();
    } else {
      setStillDim((n) => n + 1);
      sfx.wrong();
    }
    setPhase('feedback');
  };

  const next = () => {
    if (idx + 1 >= slots.length) {
      sfx.fanfare();
      setPhase('done');
      return;
    }
    setIdx((i) => i + 1);
    setAnswer(null);
    servedAtRef.current = Date.now();
    setPhase('answering');
  };

  // ── 완료 화면 ──
  if (phase === 'done') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-5 p-6 text-center max-w-xl mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="text-7xl mb-2">{relit > 0 ? '🌟' : '🌌'}</div>
          <h1 className="text-2xl text-glow">
            {slots.length === 0 ? '이 단원엔 흐려진 별이 없어요' : `별 ${relit}개를 되살렸어요!`}
          </h1>
        </motion.div>
        {slots.length > 0 && (
          <p className="opacity-80">
            {stillDim > 0
              ? `${stillDim}개의 별은 아직 흐려요. 「수련의 첨탑」에서 그 유형을 더 단련해 봐요!`
              : '회랑의 모든 별이 다시 반짝여요! 정말 멋져요 ✨'}
          </p>
        )}
        <div className="flex gap-3 mt-2 flex-wrap justify-center">
          <button
            onClick={() => navigate('/corridor')}
            className="btn-3d rounded-2xl bg-night-800 border-night-800 border-b-night-700 px-6 py-3 text-lg"
          >
            다른 단원
          </button>
          <Link
            to="/"
            className="btn-3d rounded-2xl bg-glow border-glow border-b-lime-600 px-8 py-3 text-lg text-night-950"
          >
            지도로
          </Link>
        </div>
      </div>
    );
  }

  if (!slot) return null;
  const locked = phase === 'feedback';

  return (
    <div className="min-h-dvh flex flex-col max-w-xl mx-auto">
      <div className="flex items-center gap-3 p-4">
        <Link to="/corridor" className="text-2xl opacity-60 hover:opacity-100" aria-label="나가기">
          ✕
        </Link>
        <div className="flex-1">
          <div className="text-sm leading-tight">🌌 {UNIT_TITLES[unitId] ?? unitId}</div>
          {/* 별 진행 — 점등(✨)/현재(🌟)/대기(🌫️) */}
          <div className="flex gap-1 mt-1 flex-wrap">
            {slots.map((_, i) => (
              <span key={i} className="text-xs">
                {i < idx ? '✨' : i === idx ? '🌟' : '🌫️'}
              </span>
            ))}
          </div>
        </div>
        <div className="text-sm opacity-70">
          {idx + 1}/{slots.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-7 px-5 pb-44">
        <AnimatePresence mode="wait">
          <motion.div
            key={slot.problem.id}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <ProblemBody
              problem={slot.problem}
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
                  {lastCorrect ? '별빛이 되살아났어요! 🌟' : '아직 흐려요 — 풀이를 보고 다시!'}
                </div>
                {lastCorrect && <SolutionReveal explanation={slot.problem.explanation} />}
                {!lastCorrect && (
                  <>
                    <div className="text-sm leading-relaxed opacity-90 mb-1">
                      <MathView expr={slot.problem.explanation} size="md" className="justify-start" />
                    </div>
                    <Link
                      to={`/tower/${slot.entry.skillId}`}
                      className="inline-block rounded-full bg-mana/20 text-mana px-3 py-1 text-xs mt-1"
                    >
                      🗼 이 유형 「수련의 첨탑」에서 더 연습 →
                    </Link>
                  </>
                )}
                <button
                  onClick={next}
                  autoFocus
                  className={`btn-3d w-full mt-3 rounded-2xl py-3.5 text-xl text-night-950 ${
                    lastCorrect ? 'bg-glow border-glow border-b-lime-600' : 'bg-hurt border-hurt border-b-rose-600'
                  }`}
                >
                  {idx + 1 >= slots.length ? '결과 보기' : '다음 별'}
                </button>
              </motion.div>
            ) : (
              slot.problem.format !== 'matching' && (
                <motion.div key="confirm" className="p-4 bg-night-950/90 backdrop-blur">
                  <button
                    onClick={() => confirm()}
                    disabled={!isAnswerReady(slot.problem, answer)}
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

export default function CorridorPage() {
  const { unitId } = useParams();
  if (!unitId) return <CorridorPicker />;
  return <CorridorRunner key={unitId} unitId={unitId} />;
}
