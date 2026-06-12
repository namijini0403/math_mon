/** 드래곤 방 — 다마고치식 드래곤 육성 화면 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { useGame } from '../game/store';
import {
  AFFINITY_INFO,
  DRAGON_ITEMS,
  DRAGON_STAGES,
  FRUITS,
  MOOD_INFO,
  RARE_ENDING_CARDS,
  adultTitle,
  currentFullness,
  dragonMood,
  stageForGp,
  topAffinity,
  type Affinity,
} from '../game/dragon';
import { todayStr } from '../game/missions';
import { sfx } from '../game/sounds';

const SEEN_STAGE_KEY = 'mathmon-dragon-seen-stage';

// ── 드래곤 무대 ─────────────────────────────────────────────────────────────

function DragonStage({ stage, adult, mood }: {
  stage: number;
  adult?: { affinity: Affinity; form: 'human' | 'dragon' };
  mood: 'happy' | 'normal' | 'hungry' | 'sad';
}) {
  const [imgError, setImgError] = useState(false);

  const imgSrc = adult
    ? `assets/dragon/mini/adult-${adult.affinity}-${adult.form}.png`
    : `assets/dragon/mini/stage${stage}.png`;

  const stagesLookup = DRAGON_STAGES as readonly { stage: number; name: string; emoji: string; minGp: number }[];
  const fallbackEmoji = adult
    ? AFFINITY_INFO[adult.affinity].emoji + (adult.form === 'human' ? '🧑' : '🐉')
    : stagesLookup[stage]?.emoji ?? '🥚';

  // 무드별 애니메이션
  const moodAnimate: Record<string, TargetAndTransition> = {
    happy: { y: [0, -12, 0] },
    normal: { scale: [1, 1.03, 1] },
    hungry: { rotate: [-3, 3, -3], y: [0, 4, 0] },
    sad: { rotate: [-5, 5, -5] },
  };
  const moodTransition: Record<string, Transition> = {
    happy: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
    normal: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
    hungry: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
    sad: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' },
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        animate={moodAnimate[mood]}
        transition={moodTransition[mood]}
        className="relative"
      >
        {!imgError ? (
          <img
            src={imgSrc}
            alt="드래곤"
            className="w-40 h-40 object-contain drop-shadow-[0_0_24px_rgba(167,139,250,0.6)]"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-8xl drop-shadow-[0_0_16px_rgba(167,139,250,0.5)] select-none">
            {fallbackEmoji}
          </span>
        )}
        {mood === 'sad' && (
          <motion.span
            className="absolute -right-4 top-2 text-2xl"
            animate={{ y: [0, 8, 0], opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            💧
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}

// ── 과일 날아가는 연출 ────────────────────────────────────────────────────────

interface FlyingFruit {
  id: number;
  emoji: string;
}

// ── 하트 파티클 ──────────────────────────────────────────────────────────────

function HeartParticle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      className="fixed pointer-events-none text-2xl z-40"
      style={{ left: x, top: y }}
      initial={{ opacity: 1, scale: 0.5, y: 0 }}
      animate={{ opacity: 0, scale: 1.4, y: -60 }}
      transition={{ duration: 0.9, delay, ease: 'easeOut' }}
    >
      💖
    </motion.div>
  );
}

// ── 진화 모달 ────────────────────────────────────────────────────────────────

function EvolutionModal({ fromStage, toStage, onClose }: {
  fromStage: number;
  toStage: number;
  onClose: () => void;
}) {
  useEffect(() => {
    sfx.levelUp();
  }, []);

  const stageList = DRAGON_STAGES as readonly { stage: number; name: string; emoji: string; minGp: number }[];
  const fromInfo = stageList[fromStage];
  const toInfo = stageList[toStage];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-night-950/95 backdrop-blur flex flex-col items-center justify-center gap-6 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 빛나는 배경 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(167,139,250,0.35) 0%, transparent 70%)',
        }}
      />

      <motion.div
        className="text-5xl"
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      >
        ✨
      </motion.div>

      <div className="text-3xl text-center font-bold drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]">
        드래곤이 성장했어요!
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2 opacity-50">
          <span className="text-5xl">{fromInfo?.emoji ?? '🥚'}</span>
          <span className="text-sm text-center">{fromInfo?.name ?? ''}</span>
        </div>
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="text-3xl"
        >
          →
        </motion.div>
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <span className="text-6xl drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]">
            {toInfo?.emoji ?? '✨'}
          </span>
          <span className="text-sm text-center text-coin">{toInfo?.name ?? ''}</span>
        </motion.div>
      </div>

      <button
        onClick={onClose}
        className="btn-3d rounded-2xl bg-glow border-glow border-b-lime-600 px-10 py-3 text-xl text-night-950 mt-4"
      >
        확인!
      </button>
    </motion.div>
  );
}

// ── 엔딩 오버레이 ────────────────────────────────────────────────────────────

function EndingOverlay({ affinity, form, nickname, title, onClose }: {
  affinity: Affinity;
  form: 'human' | 'dragon';
  nickname: string;
  title: string;
  onClose: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const info = AFFINITY_INFO[affinity];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-night-950/95 backdrop-blur flex flex-col items-center justify-center gap-5 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-3xl font-bold text-coin text-center drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]">
        🌟 전설의 엔딩!
      </div>

      {!imgError ? (
        <img
          src={`assets/dragon/ending/${affinity}-${form}.png`}
          alt={title}
          className="w-56 h-56 object-contain rounded-3xl"
          style={{ boxShadow: `0 0 32px 8px ${info.color}55` }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-56 h-56 rounded-3xl flex flex-col items-center justify-center gap-3"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${info.color}44 0%, transparent 80%)`,
            boxShadow: `0 0 32px 8px ${info.color}55`,
            border: `2px solid ${info.color}88`,
          }}
        >
          <span className="text-7xl">{info.emoji}</span>
          <span className="text-lg font-bold text-center px-2" style={{ color: info.color }}>
            {title}
          </span>
        </div>
      )}

      <div className="text-center">
        <div className="text-xl font-bold">{nickname}의 드래곤</div>
        <div className="text-lg mt-1" style={{ color: info.color }}>
          {title}
        </div>
        <div className="text-sm mt-3 opacity-70 max-w-xs">
          긴 여정을 함께해 줘서 고마워요! 정말 대단한 모험가예요. 🎉
        </div>
      </div>

      <button
        onClick={onClose}
        className="btn-3d rounded-2xl bg-glow border-glow border-b-lime-600 px-8 py-3 text-lg text-night-950"
      >
        닫기
      </button>
    </motion.div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function DragonPage() {
  const { dragon, streak, rewardCards, nickname, feedDragon } = useGame();
  const today = todayStr();
  const stage = stageForGp(dragon.gp);
  const fullness = currentFullness(dragon, today);
  const streakActive = streak.last === today;
  const mood = dragonMood(fullness, streakActive);
  const moodInfo = MOOD_INFO[mood];
  const topAff = topAffinity(dragon.affinities);

  // 진화 연출
  const [showEvolution, setShowEvolution] = useState(false);
  const [evoFrom, setEvoFrom] = useState(0);
  const seenRef = useRef(false);

  useEffect(() => {
    if (seenRef.current) return;
    seenRef.current = true;
    const saved = parseInt(localStorage.getItem(SEEN_STAGE_KEY) ?? '0', 10);
    if (stage > saved) {
      setEvoFrom(saved);
      setShowEvolution(true);
    }
  }, [stage]);

  function handleEvolutionClose() {
    localStorage.setItem(SEEN_STAGE_KEY, String(stage));
    setShowEvolution(false);
  }

  // 과일 날아가는 연출
  const [flyingFruits, setFlyingFruits] = useState<FlyingFruit[]>([]);
  const [dragonPop, setDragonPop] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const dragonRef = useRef<HTMLDivElement>(null);
  const flyIdRef = useRef(0);

  function handleFeed(fruitId: string, emoji: string) {
    const ok = feedDragon(fruitId);
    if (!ok) return;
    sfx.correct();

    const fid = ++flyIdRef.current;
    setFlyingFruits((prev) => [...prev, { id: fid, emoji }]);
    setTimeout(() => setFlyingFruits((prev) => prev.filter((f) => f.id !== fid)), 700);

    // 드래곤 팝
    setDragonPop(true);
    setTimeout(() => setDragonPop(false), 500);

    // 하트 파티클
    const rect = dragonRef.current?.getBoundingClientRect();
    if (rect) {
      const baseX = rect.left + rect.width / 2;
      const baseY = rect.top + rect.height / 3;
      const newHearts = [0, 1, 2].map((i) => ({
        id: Date.now() + i,
        x: baseX + (i - 1) * 24,
        y: baseY,
        delay: i * 0.15,
      }));
      setHearts((prev) => [...prev, ...newHearts]);
      setTimeout(() => {
        const ids = newHearts.map((h) => h.id);
        setHearts((prev) => prev.filter((h) => !ids.includes(h.id)));
      }, 1200);
    }
  }

  // 엔딩
  const [showEnding, setShowEnding] = useState(false);
  const hasRareEnding = dragon.adult != null && rewardCards.length >= RARE_ENDING_CARDS;
  const endingTitle = dragon.adult ? adultTitle(dragon.adult) : '';

  // 성장 게이지 계산
  const stagesArr = DRAGON_STAGES as readonly { stage: number; name: string; emoji: string; minGp: number }[];
  const currentStageInfo = stagesArr[stage] ?? { stage: 0, name: '신비한 알', emoji: '🥚', minGp: 0 };
  const nextStageInfo = stagesArr[stage + 1] ?? null;
  const gpProgress = nextStageInfo
    ? ((dragon.gp - currentStageInfo.minGp) / (nextStageInfo.minGp - currentStageInfo.minGp)) * 100
    : 100;

  // 속성 막대 최대값
  const maxAff = Math.max(1, ...Object.values(dragon.affinities));
  const affinityOrder: Affinity[] = ['sun', 'moon', 'star', 'forest'];

  return (
    <div className="max-w-xl mx-auto px-5 pb-16">
      {/* 하트 파티클 */}
      {hearts.map((h) => (
        <HeartParticle key={h.id} x={h.x} y={h.y} delay={h.delay} />
      ))}

      {/* 과일 날아가기 */}
      {flyingFruits.map((f) => (
        <motion.div
          key={f.id}
          className="fixed pointer-events-none text-3xl z-40"
          style={{ left: '50%', top: '55%' }}
          initial={{ x: -80, y: 60, opacity: 1, scale: 1 }}
          animate={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.6, ease: 'easeIn' }}
        >
          {f.emoji}
        </motion.div>
      ))}

      {/* ── 헤더 ── */}
      <div className="flex items-center gap-3 py-4">
        <Link to="/" className="text-2xl opacity-60 hover:opacity-100" aria-label="뒤로">
          ←
        </Link>
        <h1 className="text-xl">나의 드래곤</h1>
      </div>

      {/* ── 드래곤 무대 ── */}
      <div className="rounded-3xl bg-night-900 border border-night-700 p-6 flex flex-col items-center gap-4"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #2b2768 0%, #1e1b4b 60%)',
        }}
      >
        {/* 성체 칭호 */}
        {dragon.adult && (
          <motion.div
            className="text-sm font-bold px-4 py-1 rounded-full"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
            style={{
              color: AFFINITY_INFO[dragon.adult.affinity].color,
              boxShadow: `0 0 12px 2px ${AFFINITY_INFO[dragon.adult.affinity].color}55`,
              border: `1px solid ${AFFINITY_INFO[dragon.adult.affinity].color}66`,
            }}
          >
            {endingTitle}
          </motion.div>
        )}

        {/* 드래곤 */}
        <motion.div
          ref={dragonRef}
          animate={dragonPop ? { scale: 1.25 } : { scale: 1 }}
          transition={{ duration: 0.25, type: 'spring' }}
        >
          <DragonStage stage={stage} adult={dragon.adult} mood={mood} />
        </motion.div>

        {/* 말풍선 */}
        <div className="bg-night-800 rounded-full px-5 py-2 text-sm text-center max-w-xs border border-night-700">
          {moodInfo.emoji} {moodInfo.line}
        </div>
      </div>

      {/* ── 상태 패널 ── */}
      <div className="mt-4 rounded-3xl bg-night-900 border border-night-700 p-5 flex flex-col gap-4">
        {/* 성장 게이지 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm">
              <span>{currentStageInfo?.emoji}</span>
              <span className="opacity-80">{currentStageInfo?.name}</span>
            </div>
            {nextStageInfo ? (
              <div className="text-xs opacity-50">
                다음: {nextStageInfo.emoji} {nextStageInfo.name}
              </div>
            ) : (
              <div className="text-xs text-coin">완전한 성체 ✨</div>
            )}
          </div>
          <div className="h-3 rounded-full bg-night-800 overflow-hidden border border-night-700">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
                boxShadow: '0 0 6px 1px rgba(167,139,250,0.5)',
              }}
              animate={{ width: `${gpProgress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="text-xs opacity-40 text-right mt-1">{dragon.gp} GP</div>
        </div>

        {/* 배부름 게이지 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-80">배부름</div>
            <div className="text-sm font-bold" style={{
              color: fullness >= 70 ? '#34d399' : fullness >= 40 ? '#fbbf24' : '#fb7185',
            }}>
              {moodInfo.emoji} {moodInfo.label}
            </div>
          </div>
          <div className="h-3 rounded-full bg-night-800 overflow-hidden border border-night-700">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: fullness >= 70
                  ? 'linear-gradient(90deg, #34d399, #6ee7b7)'
                  : fullness >= 40
                    ? 'linear-gradient(90deg, #fbbf24, #fde68a)'
                    : 'linear-gradient(90deg, #fb7185, #fda4af)',
              }}
              animate={{ width: `${fullness}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="text-xs opacity-40 text-right mt-1">{fullness}%</div>
        </div>
      </div>

      {/* ── 속성 패널 ── */}
      <div className="mt-4 rounded-3xl bg-night-900 border border-night-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm opacity-70">속성</div>
          {dragon.adult ? (
            <div className="text-xs font-bold" style={{ color: AFFINITY_INFO[dragon.adult.affinity].color }}>
              {AFFINITY_INFO[dragon.adult.affinity].emoji} {AFFINITY_INFO[dragon.adult.affinity].name} 확정!
            </div>
          ) : (
            <div className="text-xs opacity-50">가장 높은 속성이 성체의 모습을 결정해요!</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {affinityOrder.map((aff) => {
            const info = AFFINITY_INFO[aff];
            const val = dragon.affinities[aff];
            const pct = (val / maxAff) * 100;
            const isTop = aff === topAff;
            const isConfirmed = dragon.adult?.affinity === aff;
            return (
              <div key={aff} className="flex items-center gap-3">
                <span className="text-base w-6 text-center">{info.emoji}</span>
                <span className="text-xs w-8 opacity-70">{info.name}</span>
                <div className="flex-1 h-2.5 rounded-full bg-night-800 overflow-hidden border border-night-700">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                      backgroundColor: info.color,
                      boxShadow: isTop ? `0 0 6px 1px ${info.color}80` : 'none',
                    }}
                  />
                </div>
                <span className="text-xs w-6 text-right opacity-50">{val}</span>
                {isTop && <span className="text-xs">{isConfirmed ? '✨' : '⬆'}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 과일 바구니 ── */}
      <div className="mt-4 rounded-3xl bg-night-900 border border-night-700 p-5">
        <div className="text-sm opacity-70 mb-3">과일 바구니 🍎</div>
        <div className="grid grid-cols-4 gap-3">
          {FRUITS.map((fruit) => {
            const count = dragon.fruits[fruit.id] ?? 0;
            const isEmpty = count === 0;
            return (
              <motion.button
                key={fruit.id}
                whileTap={isEmpty ? {} : { scale: 0.88 }}
                onClick={() => !isEmpty && handleFeed(fruit.id, fruit.emoji)}
                disabled={isEmpty}
                aria-label={`${fruit.name} 먹이기 (${count}개)`}
                className={`relative flex flex-col items-center rounded-2xl border-2 p-3 gap-1 transition-all ${
                  isEmpty
                    ? 'border-night-700 opacity-40 grayscale cursor-not-allowed'
                    : 'border-night-700 hover:border-night-600 active:border-night-600'
                }`}
              >
                {count > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-coin text-night-950 text-[10px] font-bold flex items-center justify-center z-10">
                    {count}
                  </div>
                )}
                <span className="text-3xl leading-none">{fruit.emoji}</span>
                <span className="text-[10px] opacity-70 text-center leading-tight">{fruit.name}</span>
              </motion.button>
            );
          })}
        </div>
        <div className="mt-3 text-xs opacity-40 text-center">
          미션과 레슨에서 과일을 얻을 수 있어요
        </div>
      </div>

      {/* ── 아이템 선반 ── */}
      <div className="mt-4 rounded-3xl bg-night-900 border border-night-700 p-5">
        <div className="text-sm opacity-70 mb-3">아이템 선반 🏺</div>
        <div className="grid grid-cols-5 gap-2">
          {DRAGON_ITEMS.map((item) => {
            const owned = dragon.items.includes(item.id);
            return (
              <div
                key={item.id}
                className={`flex flex-col items-center rounded-2xl border p-2 gap-1 transition-all ${
                  owned
                    ? 'border-night-600 bg-night-800'
                    : 'border-dashed border-night-700 opacity-35 grayscale'
                }`}
                title={owned ? item.desc : item.hint}
                aria-label={owned ? `${item.name}: ${item.desc}` : `잠김 — ${item.hint}`}
              >
                <span className="text-2xl leading-none">{item.emoji}</span>
                <span className="text-[9px] text-center leading-tight opacity-80">
                  {owned ? item.name : item.hint}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 엔딩 배너 ── */}
      <div className="mt-4 rounded-3xl bg-night-900 border border-night-700 p-5 text-center">
        {hasRareEnding ? (
          <button
            onClick={() => setShowEnding(true)}
            className="btn-3d rounded-2xl bg-coin border-coin border-b-amber-600 px-6 py-3 text-lg text-night-950 w-full"
          >
            🌟 전설의 엔딩이 열렸어요!
          </button>
        ) : (
          <div className="text-sm opacity-50">
            보물 카드 {rewardCards.length}/{RARE_ENDING_CARDS} —
            다 모으면 특별한 엔딩이 열려요...
          </div>
        )}
      </div>

      {/* ── 진화 모달 ── */}
      <AnimatePresence>
        {showEvolution && (
          <EvolutionModal
            fromStage={evoFrom}
            toStage={stage}
            onClose={handleEvolutionClose}
          />
        )}
      </AnimatePresence>

      {/* ── 엔딩 오버레이 ── */}
      <AnimatePresence>
        {showEnding && dragon.adult && (
          <EndingOverlay
            affinity={dragon.adult.affinity}
            form={dragon.adult.form}
            nickname={nickname ?? '모험가'}
            title={endingTitle}
            onClose={() => setShowEnding(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
