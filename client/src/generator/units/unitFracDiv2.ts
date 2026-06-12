/**
 * 단원: 분수의 나눗셈 (2022 개정교육과정 6-2 1단원)
 * 성취기준: (분수) ÷ (분수)의 원리를 이해하고 계산한다.
 * 핵심 원리: 나누는 수의 역수를 곱하는 것과 같다.
 */

import { RNG } from '../rng';
import { gcd, simplify, toMixed, fromMixed, type Frac, type Mixed } from '../fraction';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, MathToken, Problem, SkillDef } from '../types';

/* ── 토큰 헬퍼 ─────────────────────────────── */
const txt = (text: string): MathToken => ({ kind: 'text', text });
const frT = (f: Frac): MathToken => ({ kind: 'frac', n: f.n, d: f.d });
const mixT = (m: Mixed): MathToken =>
  m.whole === 0
    ? { kind: 'frac', n: m.n, d: m.d }
    : { kind: 'frac', whole: m.whole, n: m.n, d: m.d };
const opT = (o: string): MathToken => ({ kind: 'text', text: ` ${o} ` });

/* ── 기약 진분수 분자 목록 ───────────────────── */
function irreducibleNums(d: number): number[] {
  const ns: number[] = [];
  for (let n = 1; n < d; n++) if (gcd(n, d) === 1) ns.push(n);
  return ns;
}

/* ── ChoiceValue 변환 ──────────────────────── */
function toChoiceVal(f: Frac): ChoiceValue {
  const m = toMixed(f);
  if (m.whole === 0) return { kind: 'frac', n: m.n, d: m.d };
  return { kind: 'frac', whole: m.whole, n: m.n, d: m.d };
}

/* ── 나눗셈 계산 (역수 곱) ─────────────────── */
function divFrac(a: Frac, b: Frac): Frac {
  // a ÷ b = a × (b의 역수) = a.n*b.d / a.d*b.n
  return simplify({ n: a.n * b.d, d: a.d * b.n });
}

/** 오개념 보기 — 분모를 2배로 잘못 계산한 근접 오답 (halfStepDistr 패턴) */
function halfStepDistr(result: Frac): ChoiceValue[] {
  const out: ChoiceValue[] = [];
  const d2 = result.d * 2;
  if (d2 > 60) return out;
  for (const delta of [1, -1, 3, -3]) {
    const cn = result.n * 2 + delta;
    if (cn > 0 && cn % d2 !== 0) out.push(toChoiceVal({ n: cn, d: d2 }));
  }
  return out;
}

/* ──────────────────────────────────────────────────────
   스킬 1: fdiv2-same — 분모가 같은 진분수끼리 나눗셈
   예: 5/7 ÷ 2/7 = 5÷2 = 5/2 = 2 1/2
   분자가 나누어떨어지는 쌍 금지 (정수 답 금지)
────────────────────────────────────────────────────── */

function explainSameDiv(a: Frac, b: Frac): MathExpr {
  // a/d ÷ b/d = a÷b (분모가 같으면 분자끼리 나눠요)
  const result = simplify({ n: a.n, d: b.n }); // a.n/b.n 기약
  const rm = toMixed(result);
  return [
    txt('분모가 같은 분수끼리 나눌 때는 분자끼리 나눠요. '),
    frT(a),
    opT('÷'),
    frT(b),
    opT('='),
    txt(`${a.n}÷${b.n}`),
    opT('='),
    { kind: 'frac', n: a.n, d: b.n },
    opT('='),
    mixT(rm),
  ];
}

const fdiv2Same: SkillDef = {
  id: 'fdiv2-same',
  minVariety: 45,
  unitId: 'unitFracDiv2',
  difficulty: 1,
  title: '분모가 같은 진분수끼리 나눗셈',
  note: '분모가 같은 진분수끼리 나눌 때 분자끼리 나누는 원리 이해. 정수 결과 금지.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let a!: Frac;
    let b!: Frac;
    for (;;) {
      const d = rng.int(3, 9);
      // 분자 a.n > b.n 이고 a.n % b.n !== 0 (정수 금지)
      // 또한 a.n, b.n < d (진분수 조건)
      const bN = rng.int(2, d - 1);
      const aN = rng.int(bN + 1, d - 1); // a > b (양의 결과 보장)
      if (aN <= bN) continue;
      if (aN % bN === 0) continue; // 정수 결과 금지
      a = { n: aN, d };
      b = { n: bN, d };
      break;
    }

    const result = simplify({ n: a.n, d: b.n });
    const rm = toMixed(result);
    const expr: MathExpr = [frT(a), opT('÷'), frT(b)];
    const explanation = explainSameDiv(a, b);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: '계산하세요. (대분수로 나타내세요)',
      expr,
      mixed: true,
      requireIrreducible: true,
      answer: { whole: rm.whole, n: rm.n, d: rm.d },
      explanation,
    };
  },
};

/* ──────────────────────────────────────────────────────
   스킬 2: fdiv2-nat-frac — (자연수) ÷ (진분수)
   예: 2 ÷ 3/5 = 2 × 5/3 = 10/3 = 3 1/3
   정수 답 금지: 자연수가 분자의 배수이면 재생성
────────────────────────────────────────────────────── */

function explainNatDiv(nat: number, b: Frac): MathExpr {
  // nat ÷ b/d = nat × d/b.n = nat*d / b.n
  const rawN = nat * b.d;
  const result = simplify({ n: rawN, d: b.n });
  const rm = toMixed(result);
  return [
    txt('나눗셈은 나누는 수의 역수를 곱하는 것과 같아요. '),
    txt(String(nat)),
    opT('÷'),
    frT(b),
    opT('='),
    txt(String(nat)),
    opT('×'),
    { kind: 'frac', n: b.d, d: b.n },
    opT('='),
    { kind: 'frac', n: rawN, d: b.n },
    opT('='),
    mixT(rm),
  ];
}

const fdiv2NatFrac: SkillDef = {
  id: 'fdiv2-nat-frac',
  minVariety: 35,
  unitId: 'unitFracDiv2',
  difficulty: 2,
  title: '(자연수) ÷ (진분수)',
  note: '자연수를 진분수로 나누기. 역수 곱 원리. 정수 결과 금지.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let nat!: number;
    let b!: Frac;
    for (;;) {
      const nat_ = rng.int(2, 5);
      const d = rng.int(3, 8);
      const ns = irreducibleNums(d);
      if (!ns.length) continue;
      const n = rng.pick(ns);
      // nat_ × d 는 분자, b.n이 분모 → nat_*d 가 n의 배수면 정수 → 금지
      if ((nat_ * d) % n === 0) continue;
      // 결과 분모 = n, 분모 ≤ 60
      if (n > 60) continue;
      nat = nat_;
      b = { n, d };
      break;
    }

    const rawN = nat * b.d;
    const result = simplify({ n: rawN, d: b.n });
    const rm = toMixed(result);
    const expr: MathExpr = [txt(String(nat)), opT('÷'), frT(b)];
    const explanation = explainNatDiv(nat, b);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: '계산하세요. (대분수로 나타내세요)',
      expr,
      mixed: true,
      requireIrreducible: true,
      answer: { whole: rm.whole, n: rm.n, d: rm.d },
      explanation,
    };
  },
};

/* ──────────────────────────────────────────────────────
   스킬 3: fdiv2-diff — 분모 다른 진분수끼리 나눗셈
   예: 2/3 ÷ 3/4 = 2/3 × 4/3 = 8/9
   50% fraction-input / 50% choice
   오개념 보기 7개 이상
────────────────────────────────────────────────────── */

function explainDiffDiv(a: Frac, b: Frac): MathExpr {
  // a ÷ b = a × (역수of b)
  const recipB: Frac = { n: b.d, d: b.n };
  const rawN = a.n * b.d;
  const rawD = a.d * b.n;
  const result = simplify({ n: rawN, d: rawD });
  const rm = toMixed(result);
  const exprs: MathToken[] = [
    txt('나눗셈은 나누는 수의 분모와 분자를 바꾸어(역수) 곱하는 것과 같아요. '),
    frT(a),
    opT('÷'),
    frT(b),
    opT('='),
    frT(a),
    opT('×'),
    frT(recipB),
    opT('='),
    { kind: 'frac', n: rawN, d: rawD },
  ];
  if (rawN !== result.n || rawD !== result.d || rm.whole > 0) {
    exprs.push(opT('='), mixT(rm));
  }
  return exprs;
}

/** fdiv2-diff 오개념 보기 후보 — 7가지 이상 오개념 패턴 */
function diffDivDistr(a: Frac, b: Frac): ChoiceValue[] {
  const result = divFrac(a, b);
  const rm = toMixed(result);
  const cands: ChoiceValue[] = [];

  // 오개념 1: 역수를 취하지 않고 그냥 곱함 (a.n*b.n / a.d*b.d)
  const wrongMul = simplify({ n: a.n * b.n, d: a.d * b.d });
  if (wrongMul.d <= 60 && wrongMul.n % wrongMul.d !== 0) cands.push(toChoiceVal(wrongMul));

  // 오개념 2: 앞 분수를 뒤집어서 곱함 (역수 방향 반대)
  const wrongFlip = simplify({ n: a.d * b.d, d: a.n * b.n });
  if (wrongFlip.n > 0 && wrongFlip.d <= 60 && wrongFlip.n % wrongFlip.d !== 0) cands.push(toChoiceVal(wrongFlip));

  // 오개념 3: 분자끼리 나누고 분모끼리 나눔 (a.n/b.n 과 a.d/b.d)
  if (a.n > b.n && a.d > b.d && a.n % b.n === 0 && a.d % b.d === 0) {
    // 값이 정수가 되므로 건너뜀
  } else if (a.n % b.n !== 0 || a.d % b.d !== 0) {
    // 분자 a.n*b.d / (b.n * a.d) 를 다르게: a.n/b.n (근사 오개념)
    const wrongSep = simplify({ n: a.n * a.d, d: b.n * b.d });
    if (wrongSep.n > 0 && wrongSep.d <= 60 && wrongSep.n % wrongSep.d !== 0) cands.push(toChoiceVal(wrongSep));
  }

  // 오개념 4: 교차곱 오개념 — (b.n×b.d) / (a.n×a.d)
  const wrongCross = simplify({ n: b.n * b.d, d: a.n * a.d });
  if (wrongCross.n > 0 && wrongCross.d <= 60 && wrongCross.n % wrongCross.d !== 0) cands.push(toChoiceVal(wrongCross));

  // 오개념 5: 분모+분자 덧셈 오개념 (a.n+b.n / a.d+b.d)
  const wrongAdd = simplify({ n: a.n + b.n, d: a.d + b.d });
  if (wrongAdd.n > 0 && wrongAdd.d <= 60 && wrongAdd.n % wrongAdd.d !== 0) cands.push(toChoiceVal(wrongAdd));

  // 오개념 6: 결과 분자 ±1 실수
  for (const delta of [1, -1, 2, -2]) {
    const cn = result.n + delta;
    if (cn > 0 && result.d <= 60 && cn % result.d !== 0) {
      const s = simplify({ n: cn, d: result.d });
      if (s.n > 0 && s.n % s.d !== 0 && s.d <= 60) cands.push(toChoiceVal(s));
    }
  }

  // 오개념 7: 대분수 whole ±1
  if (rm.whole > 0 && rm.n > 0) {
    cands.push({ kind: 'frac', whole: rm.whole + 1, n: rm.n, d: rm.d });
    if (rm.whole >= 2) cands.push({ kind: 'frac', whole: rm.whole - 1, n: rm.n, d: rm.d });
  }

  // halfStepDistr 보강
  const half = halfStepDistr(result);
  cands.push(...half);

  // 오개념 8: 약분 안 한 가분수로 표기
  const raw: Frac = { n: a.n * b.d, d: a.d * b.n };
  if ((raw.n !== result.n || raw.d !== result.d) && raw.d <= 60 && raw.n % raw.d !== 0) {
    cands.push({ kind: 'frac', n: raw.n, d: raw.d });
  }

  return cands.filter((c) => {
    if (c.kind !== 'frac') return false;
    if (c.n < 1 || c.d <= 0 || c.d > 60) return false;
    const w = c.whole ?? 0;
    if (w < 0) return false;
    if (w > 0 && c.n >= c.d) return false;
    if (w === 0 && c.n >= c.d) return false;
    return true;
  });
}

const fdiv2Diff: SkillDef = {
  id: 'fdiv2-diff',
  unitId: 'unitFracDiv2',
  difficulty: 2,
  title: '분모 다른 진분수끼리 나눗셈',
  note: '역수 곱 원리. 분모 d1×n2 ≤ 60. 50% fraction-input / 50% choice.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let a!: Frac;
    let b!: Frac;
    for (;;) {
      // 결과 분모 = a.d * b.n ≤ 60 제약
      const d1 = rng.int(2, 6);
      const n2max = Math.min(6, Math.floor(60 / d1));
      if (n2max < 2) continue;
      const n2 = rng.int(2, n2max);
      const d2 = rng.int(n2 + 1, Math.min(8, n2 + 5)); // d2 > n2 (진분수 조건)
      if (d2 <= n2) continue;
      if (gcd(n2, d2) !== 1) continue; // b는 기약 진분수
      const ns1 = irreducibleNums(d1);
      if (!ns1.length) continue;
      const n1 = rng.pick(ns1);
      // 결과 = n1*d2 / d1*n2, 분모 = d1*n2
      const resD = d1 * n2;
      if (resD > 60) continue;
      const resN = n1 * d2;
      if (resN % resD === 0) continue; // 정수 금지
      // 분모가 같은 경우 제외 (스킬1과 구별)
      if (d1 === d2) continue;
      a = { n: n1, d: d1 };
      b = { n: n2, d: d2 };
      break;
    }

    const result = divFrac(a, b);
    const rm = toMixed(result);
    const isMixed = rm.whole > 0;
    const expr: MathExpr = [frT(a), opT('÷'), frT(b)];
    const explanation = explainDiffDiv(a, b);

    const rng2 = new RNG(seed ^ 0xd4e9c3a1);
    if (rng2.chance(0.5)) {
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fraction-input',
        prompt: isMixed ? '계산하세요. (대분수로 나타내세요)' : '계산하세요. (기약분수로 나타내세요)',
        expr,
        mixed: isMixed,
        requireIrreducible: true,
        answer: isMixed ? { whole: rm.whole, n: rm.n, d: rm.d } : { n: rm.n, d: rm.d },
        explanation,
      };
    }

    const answerCV = toChoiceVal(result);
    const distractors = diffDivDistr(a, b);
    const { choices, answerIndex } = buildChoices(answerCV, distractors, rng2);
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: '계산 결과를 고르세요.',
      expr,
      choices,
      answerIndex,
      explanation,
    };
  },
};

/* ──────────────────────────────────────────────────────
   스킬 4: fdiv2-mixed — 대분수 포함 나눗셈
   예: 2 1/4 ÷ 3/8 = 9/4 ÷ 3/8 = 9/4 × 8/3 = 72/12 = 6 → 정수 금지!
   정수가 되면 재생성.
────────────────────────────────────────────────────── */

function explainMixedDiv(m: Mixed, b: Frac): MathExpr {
  const a = fromMixed(m);
  const recipB: Frac = { n: b.d, d: b.n };
  const rawN = a.n * b.d;
  const rawD = a.d * b.n;
  const result = simplify({ n: rawN, d: rawD });
  const rm = toMixed(result);
  return [
    txt('대분수를 가분수로 바꾼 뒤 역수를 곱해요. '),
    mixT(m),
    opT('='),
    frT(a),
    txt('. '),
    frT(a),
    opT('÷'),
    frT(b),
    opT('='),
    frT(a),
    opT('×'),
    frT(recipB),
    opT('='),
    { kind: 'frac', n: rawN, d: rawD },
    opT('='),
    mixT(rm),
  ];
}

const fdiv2Mixed: SkillDef = {
  id: 'fdiv2-mixed',
  unitId: 'unitFracDiv2',
  difficulty: 3,
  title: '대분수 포함 나눗셈',
  note: '대분수를 가분수로 바꾼 뒤 역수 곱. 정수 결과 금지.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let m!: Mixed;
    let b!: Frac;
    for (;;) {
      // 결과 분모 = da * n2 ≤ 60
      const da = rng.int(2, 4);
      const n2max = Math.min(5, Math.floor(60 / da));
      if (n2max < 2) continue;
      const n2 = rng.int(2, n2max);
      const d2 = rng.int(n2 + 1, Math.min(8, n2 + 5));
      if (d2 <= n2) continue;
      if (gcd(n2, d2) !== 1) continue;
      const whole = rng.int(1, 3);
      const nas = irreducibleNums(da);
      if (!nas.length) continue;
      const na = rng.pick(nas);
      const impN = whole * da + na; // 가분수 분자
      // 결과 = impN * d2 / (da * n2)
      const resD = da * n2;
      if (resD > 60) continue;
      const resN = impN * d2;
      if (resN % resD === 0) continue; // 정수 결과 금지
      m = { whole, n: na, d: da };
      b = { n: n2, d: d2 };
      break;
    }

    const a = fromMixed(m);
    const result = divFrac(a, b);
    const rm = toMixed(result);
    const isMixed = rm.whole > 0;
    const expr: MathExpr = [mixT(m), opT('÷'), frT(b)];
    const explanation = explainMixedDiv(m, b);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: isMixed ? '계산하세요. (대분수로 나타내세요)' : '계산하세요. (기약분수로 나타내세요)',
      expr,
      mixed: isMixed,
      requireIrreducible: true,
      answer: isMixed ? { whole: rm.whole, n: rm.n, d: rm.d } : { n: rm.n, d: rm.d },
      explanation,
    };
  },
};

/* ──────────────────────────────────────────────────────
   스킬 5: fdiv2-word — 분수의 나눗셈 문장제
   - 자연수 답(도막 수 등): fill-blanks
   - 분수 답: fraction-input
   소재 5개 이상
────────────────────────────────────────────────────── */

interface WordScenarioDiv {
  kind: 'integer-answer' | 'frac-answer';
  buildPrompt: (a: MathToken, b: MathToken) => MathToken[];
  unit: string;
}

const WORD_SCENARIOS_DIV: WordScenarioDiv[] = [
  // --- 자연수 답 (fill-blanks): 도막 수 ---
  {
    kind: 'integer-answer',
    buildPrompt: (a, b) => [
      txt('철사 '), a, txt(' m를 '), b, txt(' m씩 자르면 몇 도막이 되나요?'),
    ],
    unit: '도막',
  },
  {
    kind: 'integer-answer',
    buildPrompt: (a, b) => [
      txt('리본 '), a, txt(' m를 '), b, txt(' m씩 나누면 몇 명에게 줄 수 있나요?'),
    ],
    unit: '명',
  },
  {
    kind: 'integer-answer',
    buildPrompt: (a, b) => [
      txt('주스 '), a, txt(' L를 '), b, txt(' L씩 나누어 담으면 몇 컵이 되나요?'),
    ],
    unit: '컵',
  },
  // --- 분수 답 (fraction-input): 단위량 ---
  {
    kind: 'frac-answer',
    buildPrompt: (a, b) => [
      txt('넓이가 '), a, txt(' m²인 벽을 페인트 '), b, txt(' L로 칠했어요. 1 L로 칠한 넓이는 몇 m²인가요?'),
    ],
    unit: 'm²',
  },
  {
    kind: 'frac-answer',
    buildPrompt: (a, b) => [
      txt('밀가루 '), a, txt(' kg으로 빵 '), b, txt(' kg을 만들었어요. 빵 1 kg을 만드는 데 밀가루는 몇 kg 필요한가요?'),
    ],
    unit: 'kg',
  },
  {
    kind: 'frac-answer',
    buildPrompt: (a, b) => [
      txt('휘발유 '), a, txt(' L로 자동차가 '), b, txt(' km를 달렸어요. 1 L로 달릴 수 있는 거리는 몇 km인가요?'),
    ],
    unit: 'km',
  },
  {
    kind: 'frac-answer',
    buildPrompt: (a, b) => [
      txt('물 '), a, txt(' L를 수조 '), b, txt('개에 똑같이 나누었어요. 수조 한 개에 담긴 물은 몇 L인가요?'),
    ],
    unit: 'L',
  },
];

const fdiv2Word: SkillDef = {
  id: 'fdiv2-word',
  unitId: 'unitFracDiv2',
  difficulty: 3,
  word: true,
  title: '분수의 나눗셈 문장제',
  note: '자연수 답(fill-blanks) 및 분수 답(fraction-input) 문장제. 소재 7가지.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    const sc = rng.pick(WORD_SCENARIOS_DIV);

    if (sc.kind === 'integer-answer') {
      // 자연수 답: A ÷ B = 정수 (도막 수 등)
      // A = 진분수, B = 진분수, A/B = 정수가 되도록 B의 분자가 A의 분자를 나눔
      let fracA!: Frac;
      let fracB!: Frac;
      let answer!: number;
      for (;;) {
        const d = rng.int(3, 8);
        // bN은 d의 약수이고, aN은 bN*k (k=정수, aN<d)
        const bN = rng.pick([1, 2, 3].filter((x) => x < d && d % x !== 0 || x < d));
        // 분모 같은 경우: A = aN/d, B = bN/d, A÷B = aN÷bN
        // aN이 bN의 배수여야 정수 → aN = bN * k, aN < d
        const k = rng.int(2, 4);
        const aN = bN * k;
        if (aN >= d) continue;
        if (gcd(aN, d) !== 1 && gcd(bN, d) !== 1) {
          // 둘 다 약분 가능하면 OK지만 진분수여야 함
        }
        fracA = { n: aN, d };
        fracB = { n: bN, d };
        answer = k;
        break;
      }

      const exprTokens = sc.buildPrompt(frT(fracA), frT(fracB));
      const explanation: MathToken[] = [
        txt('(전체) ÷ (한 묶음의 크기) = (묶음 수)예요. '),
        frT(fracA),
        opT('÷'),
        frT(fracB),
        opT('='),
        txt(`${fracA.n}÷${fracB.n}`),
        opT('='),
        txt(String(answer)),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '알맞은 수를 써넣으세요.',
        expr: [
          ...exprTokens,
          txt(' ('),
          frT(fracA),
          opT('÷'),
          frT(fracB),
          opT('='),
          { kind: 'blank', slot: 0 },
          txt(`)`)
        ],
        blankAnswers: [answer],
        explanation,
      };
    } else {
      // 분수 답 (fraction-input)
      let fracA!: Frac;
      let fracB!: Frac;
      for (;;) {
        // A ÷ B = 분수 답 → A와 B는 진분수, 결과가 정수가 아니어야 함
        // 결과 분모 = a.d * b.n ≤ 60
        const da = rng.int(2, 5);
        const n2max = Math.min(5, Math.floor(60 / da));
        if (n2max < 2) continue;
        const n2 = rng.int(2, n2max);
        const d2 = rng.int(n2 + 1, Math.min(8, n2 + 5));
        if (d2 <= n2) continue;
        if (gcd(n2, d2) !== 1) continue;
        const ns1 = irreducibleNums(da);
        if (!ns1.length) continue;
        const n1 = rng.pick(ns1);
        const resD = da * n2;
        if (resD > 60) continue;
        const resN = n1 * d2;
        if (resN % resD === 0) continue; // 정수 금지
        fracA = { n: n1, d: da };
        fracB = { n: n2, d: d2 };
        break;
      }

      const result = divFrac(fracA, fracB);
      const rm = toMixed(result);
      const isMixed = rm.whole > 0;
      const recipB: Frac = { n: fracB.d, d: fracB.n };
      const rawN = fracA.n * fracB.d;
      const rawD = fracA.d * fracB.n;

      const exprTokens = sc.buildPrompt(frT(fracA), frT(fracB));
      const explanation: MathToken[] = [
        txt('나눗셈은 나누는 수의 역수를 곱하는 것과 같아요. '),
        frT(fracA),
        opT('÷'),
        frT(fracB),
        opT('='),
        frT(fracA),
        opT('×'),
        frT(recipB),
        opT('='),
        { kind: 'frac', n: rawN, d: rawD },
        opT('='),
        mixT(rm),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fraction-input',
        prompt: `답을 구하세요. (단위: ${sc.unit})`,
        expr: exprTokens,
        mixed: isMixed,
        requireIrreducible: true,
        answer: isMixed ? { whole: rm.whole, n: rm.n, d: rm.d } : { n: rm.n, d: rm.d },
        explanation,
      };
    }
  },
};

/* ── export ─────────────────────────────────────────── */
export const unitFracDiv2Skills: SkillDef[] = [
  fdiv2Same,
  fdiv2NatFrac,
  fdiv2Diff,
  fdiv2Mixed,
  fdiv2Word,
];
