/**
 * CompanionCheer — 내가 키우는 미니미가 잠깐 나타나 응원하는 전역 오버레이.
 * - 5연속 정답(cheer): 같이 신나서 축하
 * - 2연속 오답(cheerup): 다음엔 잘할 수 있다고 응원
 * store.companionCue(전역)를 소비하고 잠시 뒤 스스로 사라진다(clearCompanionCue).
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../game/store';
import { dragonArt } from '../game/dragonArt';
import { currentFullness, dragonEmoji } from '../game/dragon';
import { todayStr } from '../game/missions';

const CHEER_LINES = ['대단해! 5개나 연속 정답! 🎉', '우와, 멈추질 않아! 같이 신난다! ✨', '최고야! 너랑 모험하니 너무 좋아! 💖'];
const CHEERUP_LINES = ['괜찮아, 다음엔 꼭 맞힐 수 있어! 💪', '천천히 다시 해보자, 난 너를 믿어! 🌟', '힘내자! 내가 곁에서 응원할게! 🤗'];

export function CompanionCheer() {
  const cue = useGame((s) => s.companionCue);
  const clearCompanionCue = useGame((s) => s.clearCompanionCue);
  const dragon = useGame((s) => s.dragon);
  const [shown, setShown] = useState<{ kind: 'cheer' | 'cheerup'; line: string; id: number } | null>(null);

  useEffect(() => {
    if (!cue) return;
    const lines = cue.kind === 'cheer' ? CHEER_LINES : CHEERUP_LINES;
    const line = lines[cue.id % lines.length];
    setShown({ kind: cue.kind, line, id: cue.id });
    clearCompanionCue(); // 신호 즉시 소비 (새 신호가 와도 갱신됨)
    const t = setTimeout(() => setShown((cur) => (cur?.id === cue.id ? null : cur)), 2800);
    return () => clearTimeout(t);
  }, [cue, clearCompanionCue]);

  const art = dragonArt(dragon, currentFullness(dragon, todayStr()));

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key={shown.id}
          className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 flex items-end gap-2 pointer-events-none"
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          {/* 말풍선 */}
          <motion.div
            className={`relative max-w-[15rem] rounded-2xl px-3.5 py-2 text-sm font-bold shadow-lg ${
              shown.kind === 'cheer'
                ? 'bg-coin text-night-950'
                : 'bg-mana text-white'
            }`}
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            {shown.line}
            <span
              className={`absolute -bottom-1.5 right-4 w-3 h-3 rotate-45 ${
                shown.kind === 'cheer' ? 'bg-coin' : 'bg-mana'
              }`}
            />
          </motion.div>
          {/* 미니미 */}
          <motion.div
            animate={shown.kind === 'cheer' ? { y: [0, -10, 0], rotate: [-4, 4, -4] } : { rotate: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: shown.kind === 'cheer' ? 0.6 : 1.2, ease: 'easeInOut' }}
          >
            <CompanionAvatar src={art.src} fallback={art.fallbackEmoji || dragonEmoji(dragon)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CompanionAvatar({ src, fallback }: { src: string; fallback: string }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        alt="내 드래곤"
        className="w-20 h-20 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        onError={() => setErr(true)}
      />
    );
  }
  return <span className="text-5xl select-none drop-shadow">{fallback}</span>;
}
