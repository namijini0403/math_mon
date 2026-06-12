import type { DecimalInputProblem } from '../../generator/types';
import type { UserAnswer } from '../../game/check';

/** 소수 직접 입력 — 숫자와 소수점 하나만 허용 */
export function DecimalInputView({
  problem,
  answer,
  onChange,
  locked,
}: {
  problem: DecimalInputProblem;
  answer: UserAnswer | null;
  onChange: (a: UserAnswer) => void;
  locked: boolean;
}) {
  const text = answer?.kind === 'decimal' ? answer.text : '';
  return (
    <div className="flex items-center justify-center gap-2">
      <input
        type="text"
        inputMode="decimal"
        aria-label="소수 답 입력"
        autoFocus
        disabled={locked}
        value={text}
        onChange={(e) => {
          // 숫자 + 소수점 1개만
          let v = e.target.value.replace(/[^0-9.]/g, '');
          const firstDot = v.indexOf('.');
          if (firstDot >= 0) v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
          onChange({ kind: 'decimal', text: v.slice(0, 8) });
        }}
        className="w-40 h-16 rounded-xl border-2 border-night-700 bg-night-800 text-center text-3xl font-bold focus:border-mana focus:outline-none disabled:opacity-60"
      />
      {problem.unit && <span className="text-2xl opacity-80">{problem.unit}</span>}
    </div>
  );
}
