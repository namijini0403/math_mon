import type { ComparisonProblem } from '../../generator/types';
import type { UserAnswer } from '../../game/check';
import { MathView } from '../MathView';

const SYMBOLS = ['<', '=', '>'] as const;

export function ComparisonView({
  problem,
  answer,
  onChange,
  locked,
}: {
  problem: ComparisonProblem;
  answer: UserAnswer | null;
  onChange: (a: UserAnswer) => void;
  locked: boolean;
}) {
  const selected = answer?.kind === 'comparison' ? answer.symbol : null;
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex items-center justify-center gap-4 text-3xl">
        <MathView expr={problem.left} size="lg" />
        <span className="w-14 h-14 rounded-2xl border-2 border-dashed border-night-700 flex items-center justify-center text-coin text-3xl font-bold">
          {selected ?? '?'}
        </span>
        <MathView expr={problem.right} size="lg" />
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {SYMBOLS.map((sym) => (
          <button
            key={sym}
            disabled={locked}
            onClick={() => onChange({ kind: 'comparison', symbol: sym })}
            className={`btn-3d rounded-2xl border-2 py-4 text-3xl font-bold ${
              selected === sym
                ? 'border-mana bg-mana/20 border-b-mana text-mana brightness-125'
                : 'border-night-700 bg-night-800 border-b-night-700 hover:bg-night-700/60'
            }`}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}
