import type { ChoiceProblem } from '../../generator/types';
import type { UserAnswer } from '../../game/check';
import { ChoiceValueView } from './ChoiceValueView';

export function ChoiceView({
  problem,
  answer,
  onChange,
  locked,
}: {
  problem: ChoiceProblem;
  answer: UserAnswer | null;
  onChange: (a: UserAnswer) => void;
  locked: boolean;
}) {
  const selected = answer?.kind === 'choice' ? answer.index : null;
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {problem.choices.map((c, i) => {
        const isSel = selected === i;
        return (
          <button
            key={i}
            disabled={locked}
            onClick={() => onChange({ kind: 'choice', index: i })}
            className={`btn-3d rounded-2xl border-2 px-4 py-5 flex items-center justify-center min-h-24 transition-colors ${
              isSel
                ? 'border-mana bg-mana/20 border-b-mana text-mana brightness-125'
                : 'border-night-700 bg-night-800 border-b-night-700 hover:bg-night-700/60'
            }`}
          >
            <ChoiceValueView value={c} />
          </button>
        );
      })}
    </div>
  );
}
