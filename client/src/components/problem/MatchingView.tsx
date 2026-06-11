import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { MatchingProblem } from '../../generator/types';
import { RNG } from '../../generator/rng';
import { sfx } from '../../game/sounds';
import { ChoiceValueView } from './ChoiceValueView';

interface Card {
  side: 'left' | 'right';
  pairIndex: number;
  key: string;
}

/** 짝맞추기 — 모든 쌍을 맞추면 자동 제출. 한 번이라도 잘못 짝지으면 오답 처리 */
export function MatchingView({
  problem,
  onComplete,
  locked,
}: {
  problem: MatchingProblem;
  onComplete: (mistakes: number) => void;
  locked: boolean;
}) {
  const { leftCards, rightCards } = useMemo(() => {
    const rng = new RNG(problem.seed ^ 0x5f3759df);
    const left: Card[] = problem.pairs.map((_, i) => ({ side: 'left', pairIndex: i, key: `l${i}` }));
    const right: Card[] = problem.pairs.map((_, i) => ({ side: 'right', pairIndex: i, key: `r${i}` }));
    return { leftCards: rng.shuffle(left), rightCards: rng.shuffle(right) };
  }, [problem]);

  const [selected, setSelected] = useState<Card | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState<string | null>(null);

  const tap = (card: Card) => {
    if (locked || solved.has(card.pairIndex)) return;
    if (!selected || selected.side === card.side) {
      setSelected(card);
      return;
    }
    if (selected.pairIndex === card.pairIndex) {
      const next = new Set(solved).add(card.pairIndex);
      setSolved(next);
      setSelected(null);
      sfx.combo(next.size);
      if (next.size === problem.pairs.length) onComplete(mistakes);
    } else {
      setMistakes((m) => m + 1);
      setShake(card.key);
      sfx.wrong();
      setSelected(null);
      setTimeout(() => setShake(null), 400);
    }
  };

  const renderCard = (card: Card) => {
    const value =
      card.side === 'left' ? problem.pairs[card.pairIndex].left : problem.pairs[card.pairIndex].right;
    const isSolved = solved.has(card.pairIndex);
    const isSel = selected?.key === card.key;
    return (
      <motion.button
        key={card.key}
        animate={shake === card.key ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.4 }}
        disabled={locked || isSolved}
        onClick={() => tap(card)}
        className={`btn-3d rounded-2xl border-2 py-4 px-2 min-h-20 flex items-center justify-center transition-all ${
          isSolved
            ? 'border-glow/40 bg-glow/10 text-glow/50 opacity-50'
            : isSel
              ? 'border-mana bg-mana/20 border-b-mana brightness-125'
              : 'border-night-700 bg-night-800 border-b-night-700 hover:bg-night-700/60'
        }`}
      >
        <ChoiceValueView value={value} size="md" />
      </motion.button>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full max-w-sm mx-auto">
      <div className="flex flex-col gap-3">{leftCards.map(renderCard)}</div>
      <div className="flex flex-col gap-3">{rightCards.map(renderCard)}</div>
    </div>
  );
}
