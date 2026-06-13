/**
 * 보물 카드 뽑기 연출 — 뒤집힌 카드 3장 중 하나를 직접 골라 뒤집어 보는 가챠식 연출.
 * (보상은 이미 정해져 있고, 어떤 카드를 고르든 그 보상이 나온다 — 고르는 재미용 연출)
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RARITY_COLOR, RARITY_LABEL, type RewardCardDef } from '../game/rewardCards';
import { sfx } from '../game/sounds';

type Stage = 'pick' | 'reveal' | 'stored';
const SLOTS = [-1, 0, 1];

function CardBack({ color, faded }: { color: string; faded?: boolean }) {
  return (
    <div
      className="w-full h-full rounded-xl border-2 flex items-center justify-center"
      style={{
        borderColor: `${color}99`,
        background: 'linear-gradient(150deg, #241f57 0%, #0f0d29 100%)',
        boxShadow: faded ? undefined : `0 0 12px ${color}55`,
        opacity: faded ? 0.35 : 1,
      }}
    >
      <span className="text-2xl" style={{ color }}>✦</span>
    </div>
  );
}

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
  const [stage, setStage] = useState<Stage>('pick');
  const color = RARITY_COLOR[drawn.rarity];

  const choose = () => {
    if (stage !== 'pick') return;
    setStage('reveal');
    sfx.levelUp();
    setTimeout(() => setStage('stored'), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center gap-2 relative"
    >
      <div className="text-sm opacity-80">🗝️ {label}</div>

      {stage === 'pick' ? (
        <>
          <div className="text-xs text-coin">카드 한 장을 골라봐! ✨</div>
          <div className="flex gap-3 justify-center min-h-28">
            {SLOTS.map((p, i) => (
              <motion.button
                key={i}
                onClick={choose}
                aria-label="뒤집힌 카드 고르기"
                className="w-20 h-28"
                initial={{ rotate: p * 4 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.22 }}
                whileHover={{ scale: 1.07, y: -8 }}
                whileTap={{ scale: 0.95 }}
              >
                <CardBack color={color} />
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-28">
          <motion.div
            initial={{ rotateY: 180, scale: 0.7, opacity: 0 }}
            animate={{ rotateY: 0, scale: stage === 'stored' ? 0.82 : 1.12, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className="flex flex-col items-center"
          >
            <img
              src={drawn.src}
              alt={drawn.name}
              className="w-28 rounded-2xl border-4"
              style={{ borderColor: color, boxShadow: `0 0 24px 5px ${color}77` }}
            />
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {(stage === 'reveal' || stage === 'stored') && (
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
                📦 보관함에 저장됐어요
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
