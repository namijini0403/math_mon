/** 분수 연산 유틸 — 생성기의 정답 솔버. 모든 분수는 d > 0을 유지한다. */

export interface Frac {
  n: number;
  d: number;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

export function frac(n: number, d: number): Frac {
  if (d === 0) throw new Error('denominator 0');
  return { n, d };
}

/** 기약분수로 약분 */
export function simplify(f: Frac): Frac {
  const g = gcd(f.n, f.d);
  return g === 0 ? f : { n: f.n / g, d: f.d / g };
}

export function isIrreducible(f: Frac): boolean {
  return gcd(f.n, f.d) === 1;
}

export function isProper(f: Frac): boolean {
  return f.n > 0 && f.n < f.d;
}

export function value(f: Frac): number {
  return f.n / f.d;
}

/** 정확한 비교 (부동소수점 회피): a-b의 부호 */
export function compare(a: Frac, b: Frac): -1 | 0 | 1 {
  const diff = a.n * b.d - b.n * a.d;
  return diff < 0 ? -1 : diff > 0 ? 1 : 0;
}

export function equals(a: Frac, b: Frac): boolean {
  return compare(a, b) === 0;
}

export function add(a: Frac, b: Frac): Frac {
  return simplify({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
}

export function sub(a: Frac, b: Frac): Frac {
  return simplify({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
}

/** 가분수 → 대분수 표현 { whole, n, d } (n < d). 진분수면 whole = 0 */
export interface Mixed {
  whole: number;
  n: number;
  d: number;
}

export function toMixed(f: Frac): Mixed {
  const s = simplify(f);
  const whole = Math.floor(s.n / s.d);
  return { whole, n: s.n - whole * s.d, d: s.d };
}

export function fromMixed(m: Mixed): Frac {
  return { n: m.whole * m.d + m.n, d: m.d };
}

/** 대분수/진분수 입력 답안과 정답 비교 — 값이 같고, 분수 부분이 기약이며 진분수여야 정답 */
export function mixedEquals(input: Mixed, answer: Frac): boolean {
  const f = fromMixed(input);
  if (!equals(f, answer)) return false;
  if (input.n === 0) return input.d > 0;
  return isProper({ n: input.n, d: input.d }) && isIrreducible({ n: input.n, d: input.d });
}
