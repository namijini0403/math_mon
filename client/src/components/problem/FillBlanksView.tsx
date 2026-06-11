import type { FillBlanksProblem } from '../../generator/types';
import type { UserAnswer } from '../../game/check';
import { MathView } from '../MathView';

export function FillBlanksView({
  problem,
  answer,
  onChange,
  locked,
}: {
  problem: FillBlanksProblem;
  answer: UserAnswer | null;
  onChange: (a: UserAnswer) => void;
  locked: boolean;
}) {
  const values =
    answer?.kind === 'blanks' ? answer.values : problem.blankAnswers.map(() => null);

  const setSlot = (slot: number, v: number | null) => {
    const next = [...values];
    next[slot] = v;
    onChange({ kind: 'blanks', values: next });
  };

  return (
    <div className="flex justify-center w-full">
      <MathView
        expr={problem.expr ?? []}
        size="lg"
        renderBlank={(slot) => (
          <input
            key={slot}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label={`빈칸 ${slot + 1}`}
            disabled={locked}
            value={values[slot] ?? ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
              setSlot(slot, digits === '' ? null : parseInt(digits, 10));
            }}
            className="w-14 h-12 mx-0.5 rounded-lg border-2 border-dashed border-coin/70 bg-night-800 text-center text-2xl font-bold focus:border-mana focus:outline-none disabled:opacity-60"
          />
        )}
      />
    </div>
  );
}
