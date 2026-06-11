/** 수식 토큰 렌더러 — 분수를 위아래로 쌓아 표시한다 */

import type { ReactNode } from 'react';
import type { MathExpr, MathToken } from '../generator/types';

type Size = 'md' | 'lg';

const SIZES = {
  md: { frac: 'text-lg', whole: 'text-2xl', text: 'text-lg', op: 'text-xl', minW: 'min-w-7' },
  lg: { frac: 'text-2xl', whole: 'text-4xl', text: 'text-2xl', op: 'text-3xl', minW: 'min-w-10' },
} as const;

export function Fraction({
  n,
  d,
  whole,
  size = 'lg',
}: {
  n: ReactNode;
  d: ReactNode;
  whole?: number;
  size?: Size;
}) {
  const s = SIZES[size];
  return (
    <span className="inline-flex items-center gap-1 align-middle mx-0.5">
      {whole !== undefined && whole !== 0 && (
        <span className={`${s.whole} font-bold`}>{whole}</span>
      )}
      <span className={`inline-flex flex-col items-center leading-tight ${s.frac}`}>
        <span className={`px-1.5 ${s.minW} text-center`}>{n}</span>
        <span className="h-[2.5px] w-full rounded bg-current" />
        <span className={`px-1.5 ${s.minW} text-center`}>{d}</span>
      </span>
    </span>
  );
}

function Token({
  token,
  size,
  renderBlank,
}: {
  token: MathToken;
  size: Size;
  renderBlank?: (slot: number) => ReactNode;
}) {
  const s = SIZES[size];
  switch (token.kind) {
    case 'text':
      return <span className={s.text}>{token.text}</span>;
    case 'frac':
      return <Fraction n={token.n} d={token.d} whole={token.whole} size={size} />;
    case 'decimal':
      return <span className={`${s.whole} font-bold`}>{token.v}</span>;
    case 'op':
      return <span className={`${s.op} font-bold mx-1.5`}>{token.op}</span>;
    case 'blank':
      return <>{renderBlank?.(token.slot) ?? <span className={s.whole}>□</span>}</>;
    case 'fracBlank': {
      const part = (v: number | { slot: number }) =>
        typeof v === 'number' ? v : (renderBlank?.(v.slot) ?? '□');
      return <Fraction n={part(token.n)} d={part(token.d)} whole={token.whole} size={size} />;
    }
  }
}

export function MathView({
  expr,
  size = 'lg',
  renderBlank,
  className = '',
}: {
  expr: MathExpr;
  size?: Size;
  renderBlank?: (slot: number) => ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex flex-wrap items-center justify-center gap-y-2 ${className}`}>
      {expr.map((t, i) => (
        <Token key={i} token={t} size={size} renderBlank={renderBlank} />
      ))}
    </span>
  );
}
