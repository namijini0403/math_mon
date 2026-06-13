/**
 * 육성 아이템 뽑기 연출 — 알이 흔들리다 빛과 함께 톡 터지며 아이템이 나온다.
 * 수집형(가챠) 아이템이 "랜덤으로 뽑힌" 느낌을 주는 자동 연출.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { sfx } from '../game/sounds';

const RAYS = Array.from({ length: 8 }, (_, i) => i * 45);

function ItemImg({ id, emoji }: { id: string; emoji: string }) {
  const [ok, setOk] = useState(true);
  if (ok) {
    return (
      <img
        src={`assets/dragon/items/${id}.png`}
        alt=""
        className="w-12 h-12 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
        onError={() => setOk(false)}
      />
    );
  }
  return <span className="text-4xl leading-none">{emoji}</span>;
}

export function ItemGachaReveal({
  item,
  delay = 0,
}: {
  item: { id: string; name: string; emoji: string };
  delay?: number;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      setOpen(true);
      sfx.levelUp();
    }, (delay + 1.0) * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center gap-1"
    >
      <div className="text-xs opacity-80">🎁 새 아이템 뽑기!</div>
      <div className="relative w-20 h-20 flex items-center justify-center">
        {!open ? (
          <motion.div
            animate={{ rotate: [-8, 8, -8, 8, 0], scale: [1, 1.08, 1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-5xl drop-shadow-lg"
          >
            🥚
          </motion.div>
        ) : (
          <>
            {RAYS.map((deg) => (
              <motion.div
                key={deg}
                className="absolute left-1/2 top-1/2 w-1 rounded-full origin-bottom bg-coin"
                style={{ rotate: `${deg}deg` }}
                initial={{ height: 0, opacity: 1 }}
                animate={{ height: 40, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            ))}
            <motion.div
              initial={{ scale: 0.2, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >
              <ItemImg id={item.id} emoji={item.emoji} />
            </motion.div>
          </>
        )}
      </div>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold">
          {item.name}
        </motion.div>
      )}
    </motion.div>
  );
}
