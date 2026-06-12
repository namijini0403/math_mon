/**
 * 보물 카드 획득 연출 — 비밀상자가 흔들리다 빛과 함께 터지고,
 * 카드가 클로즈업됐다가 작아지며 보관함에 저장되는 시퀀스.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RARITY_COLOR, RARITY_LABEL, type RewardCardDef } from '../game/rewardCards';
import { sfx } from '../game/sounds';

type Stage = 'box' | 'burst' | 'closeup' | 'stored';

const RAYS = Array.from({ length: 10 }, (_, i) => i * 36);

export function TreasureReveal({
  drawn,
  duplicate,
  label,
  delay = 0,
}: {
  drawn: RewardCardDef;
  duplicate: boolean;
  label: string;
  delay?: number;
}) {
  const [stage, setStage] = useState<Stage>('box');
  const color = RARITY_COLOR[drawn.rarity];

  // 자동 진행: 상자(흔들) → 폭발 → 클로즈업 → 보관
  useEffect(() => {
    const t1 = setTimeout(() => {
      setStage('burst');
      sfx.bossHit();
    }, (delay + 1.2) * 1000);
    const t2 = setTimeout(() => {
      setStage('closeup');
      sfx.levelUp();
    }, (delay + 1.7) * 1000);
    const t3 = setTimeout(() => setStage('stored'), (delay + 3.6) * 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center gap-1.5 relative"
    >
      <div className="text-sm opacity-80">🗝️ {label}</div>

      <div className="relative flex items-center justify-center min-h-24">
        <AnimatePresence mode="wait">
          {stage === 'box' && (
            <motion.div
              key="box"
              animate={{ rotate: [-6, 6, -6, 6, 0], scale: [1, 1.06, 1, 1.08, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              exit={{ scale: 1.4, opacity: 0 }}
              className="text-6xl drop-shadow-lg"
            >
              🎁
            </motion.div>
          )}

          {stage === 'burst' && (
            <motion.div key="burst" className="relative w-24 h-24" exit={{ opacity: 0 }}>
              {/* 빛줄기 방사 */}
              {RAYS.map((deg) => (
                <motion.div
                  key={deg}
                  className="absolute left-1/2 top-1/2 w-1 rounded-full origin-bottom"
                  style={{ background: color, rotate: `${deg}deg` }}
                  initial={{ height: 0, opacity: 1 }}
                  animate={{ height: 56, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${color}cc, transparent 70%)` }}
                initial={{ scale: 0.2, opacity: 1 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          )}

          {(stage === 'closeup' || stage === 'stored') && (
            <motion.div
              key="card"
              initial={{ scale: 0.2, rotateY: 540, opacity: 0 }}
              animate={
                stage === 'closeup'
                  ? { scale: 1.15, rotateY: 0, opacity: 1 }
                  : { scale: 0.62, rotateY: 0, opacity: 1 }
              }
              transition={
                stage === 'closeup'
                  ? { type: 'spring', stiffness: 160, damping: 16 }
                  : { duration: 0.45, ease: 'easeInOut' }
              }
              className="flex flex-col items-center gap-1"
            >
              <img
                src={drawn.src}
                alt={drawn.name}
                className="w-36 rounded-2xl border-4"
                style={{ borderColor: color, boxShadow: `0 0 24px 5px ${color}77` }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(stage === 'closeup' || stage === 'stored') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="text-sm font-bold">{drawn.name}</div>
            <div className="text-xs font-bold" style={{ color }}>
              {RARITY_LABEL[drawn.rarity]}
              {duplicate && ' · 중복 +10 XP'}
            </div>
            {stage === 'stored' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] opacity-50 mt-0.5"
              >
                🎴 보관함에 저장됐어요
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
