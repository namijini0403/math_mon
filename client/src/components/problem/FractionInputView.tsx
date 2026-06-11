import type { FractionInputProblem } from '../../generator/types';
import type { UserAnswer } from '../../game/check';

function NumBox({
  value,
  onChange,
  locked,
  wide,
  autoFocus,
  label,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  locked: boolean;
  wide?: boolean;
  autoFocus?: boolean;
  label: string;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label={label}
      autoFocus={autoFocus}
      disabled={locked}
      value={value ?? ''}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
        onChange(digits === '' ? null : parseInt(digits, 10));
      }}
      className={`${wide ? 'w-20 h-20 text-4xl' : 'w-16 h-14 text-3xl'} rounded-xl border-2 border-night-700 bg-night-800 text-center font-bold focus:border-mana focus:outline-none disabled:opacity-60`}
    />
  );
}

export function FractionInputView({
  problem,
  answer,
  onChange,
  locked,
}: {
  problem: FractionInputProblem;
  answer: UserAnswer | null;
  onChange: (a: UserAnswer) => void;
  locked: boolean;
}) {
  const a = answer?.kind === 'fraction' ? answer : { kind: 'fraction' as const, whole: null, n: null, d: null };
  const set = (patch: Partial<typeof a>) => onChange({ ...a, ...patch });

  return (
    <div className="flex items-center justify-center gap-3">
      {problem.mixed && (
        <NumBox label="자연수" value={a.whole} onChange={(v) => set({ whole: v })} locked={locked} wide autoFocus />
      )}
      <div className="flex flex-col items-center gap-2">
        <NumBox label="분자" value={a.n} onChange={(v) => set({ n: v })} locked={locked} autoFocus={!problem.mixed} />
        <div className="h-1 w-20 rounded bg-violet-100" />
        <NumBox label="분모" value={a.d} onChange={(v) => set({ d: v })} locked={locked} />
      </div>
    </div>
  );
}
