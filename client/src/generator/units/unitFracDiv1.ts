/**
 * 단원: 분수의 나눗셈 1 (2022 개정교육과정 6-1 1단원)
 * 성취기준: (자연수)÷(자연수), (분수)÷(자연수)의 원리를 이해하고 계산한다.
 */

import { RNG } from '../rng';
import { nj } from '../josa';
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

/** 분수 보기 유효성 필터 공통: 분모 ≤ 60, 분자 ≥ 1, 정수 아님, 대분수면 분수부 진분수 */
function isValidFracChoice(c: ChoiceValue): boolean {
  if (c.kind !== 'frac') return false;
  if (c.n < 1 || c.d <= 0 || c.d > 60) return false;
  const w = c.whole ?? 0;
  if (w < 0) return false;
  if (w === 0 && c.n >= c.d) return false;
  if (w > 0 && c.n >= c.d) return false;
  return true;
}

/* ──────────────────────────────────────────────────────
   스킬 1: fdiv1-nat-nat — (자연수)÷(자연수) 몫을 분수로
────────────────────────────────────────────────────── */

function explainNatNat(a: number, b: number): MathExpr {
  const result = simplify({ n: a, d: b });
  const m = toMixed(result);
  const exprs: MathToken[] = [
    txt(`${a}÷${b}의 몫을 분수로 나타내면 `),
    txt(`분자가 ${a}, 분모가 ${b}인 분수예요. `),
    txt(`${a} ÷ ${b} = `),
    { kind: 'frac', n: a, d: b },
  ];
  const g = gcd(a, b);
  if (g > 1) {
    exprs.push(txt(` = `), mixT(m));
    exprs.push(txt(` (분자와 분모를 ${nj(g, '으로/로')} 약분해요.)`));
  }
  return exprs;
}

const fdiv1NatNat: SkillDef = {
  id: 'fdiv1-nat-nat',
  unitId: 'unitFracDiv1',
  difficulty: 1,
  title: '(자연수)÷(자연수)의 몫을 분수로',
  note: 'a÷b의 몫을 분수 a/b로 나타낸다. 나누어떨어지는 쌍 금지. 결과 기약분수/대분수.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let a!: number;
    let b!: number;
    for (;;) {
      const candidate_b = rng.int(2, 9);
      const candidate_a = rng.int(1, candidate_b + 4);
      if (candidate_a === 0) continue;
      if (candidate_a % candidate_b === 0) continue; // 나누어떨어지는 쌍 금지
      if (candidate_a === candidate_b) continue; // 결과 1 금지
      a = candidate_a;
      b = candidate_b;
      break;
    }

    const result = simplify({ n: a, d: b });
    const m = toMixed(result);
    const isMixed = m.whole > 0;
    const expr: MathExpr = [txt(`${a} ÷ ${b}`)];
    const explanation = explainNatNat(a, b);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: isMixed
        ? `${a} ÷ ${b}의 몫을 대분수로 나타내세요.`
        : `${a} ÷ ${b}의 몫을 기약분수로 나타내세요.`,
      expr,
      mixed: isMixed,
      requireIrreducible: true,
      answer: isMixed ? { whole: m.whole, n: m.n, d: m.d } : { n: m.n, d: m.d },
      explanation,
    };
  },
};

/* ──────────────────────────────────────────────────────
   스킬 2: fdiv1-frac-nat — (진분수)÷(자연수), 분자가 나누어떨어지는 경우
────────────────────────────────────────────────────── */

function explainFracNatDiv(f: Frac, nat: number): MathExpr {
  // 분자가 nat으로 나누어떨어짐: n/d ÷ nat = (n÷nat)/d
  const newN = f.n / nat;
  return [
    txt(`분자 ${nj(f.n, '이/가')} ${nj(nat, '으로/로')} 나누어떨어져요. `),
    frT(f),
    opT('÷'),
    txt(String(nat)),
    opT('='),
    { kind: 'frac', n: f.n, d: f.d },
    txt(` → 분자를 ${nj(nat, '으로/로')} 나눠요 → `),
    { kind: 'frac', n: newN, d: f.d },
  ];
}

const fdiv1FracNat: SkillDef = {
  id: 'fdiv1-frac-nat',
  minVariety: 30,
  unitId: 'unitFracDiv1',
  difficulty: 1,
  title: '(진분수)÷(자연수) — 분자가 나누어떨어지는 경우',
  note: '분자가 나누는 수의 배수인 진분수÷자연수. 분자를 자연수로 나눠 기약분수 완성.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let f!: Frac;
    let nat!: number;
    for (;;) {
      const divisor = rng.int(2, 6);
      // 분자는 divisor의 배수 (단, 진분수 조건 n < d)
      const mult = rng.int(1, 4);
      const n = divisor * mult;
      const dMin = n + 1;
      if (dMin > 9) continue;
      const d = rng.int(dMin, Math.min(9, dMin + 4));
      if (gcd(n, d) !== divisor && gcd(n, d) % divisor !== 0) {
        // gcd(n, d)가 divisor의 배수여야 약분 후 진분수
        // 사실 n이 divisor의 배수이므로 n/divisor이 새 분자
        // gcd(n/divisor, d) 체크: 결과가 기약인지는 상관없음 (어차피 simplify)
      }
      const result = simplify({ n: n / divisor, d });
      if (result.n === 0 || result.n % result.d === 0) continue; // 정수 금지
      if (result.n >= result.d) continue; // 진분수 유지
      f = { n, d };
      nat = divisor;
      break;
    }

    const newN = f.n / nat;
    const result = simplify({ n: newN, d: f.d });
    const expr: MathExpr = [frT(f), opT('÷'), txt(String(nat))];
    const explanation = explainFracNatDiv(f, nat);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: '계산하세요. (기약분수로 나타내세요)',
      expr,
      mixed: false,
      requireIrreducible: true,
      answer: { n: result.n, d: result.d },
      explanation,
    };
  },
};

/* ──────────────────────────────────────────────────────
   스킬 3: fdiv1-frac-nat2 — (진분수)÷(자연수), 분자가 나누어떨어지지 않는 경우
────────────────────────────────────────────────────── */

function explainFracNat2Div(f: Frac, nat: number): MathExpr {
  // 분모에 nat을 곱한다: n/d ÷ nat = n/(d×nat)
  const newD = f.d * nat;
  const result = simplify({ n: f.n, d: newD });
  const g = gcd(f.n, newD);
  const exprs: MathToken[] = [
    txt(`÷${nj(nat, '은/는')} ×`),
    { kind: 'frac', n: 1, d: nat },
    txt(`과 같아요. `),
    frT(f),
    opT('÷'),
    txt(String(nat)),
    opT('='),
    frT(f),
    opT('×'),
    { kind: 'frac', n: 1, d: nat },
    opT('='),
    { kind: 'frac', n: f.n, d: newD },
  ];
  if (g > 1) {
    exprs.push(opT('='), frT(result));
    exprs.push(txt(` (${nj(g, '으로/로')} 약분해요.)`));
  }
  return exprs;
}

/** fdiv1-frac-nat2 오개념 보기 후보 (7개 이상 확보) */
function fracNat2DivDistr(f: Frac, nat: number): ChoiceValue[] {
  const newD = f.d * nat;
  const result = simplify({ n: f.n, d: newD });
  const cands: ChoiceValue[] = [];

  // 오개념 1: 분자에 nat을 곱한다 (n×nat / d) → 오답 "분자에 곱"
  const wrong1 = simplify({ n: f.n * nat, d: f.d });
  if (wrong1.d <= 60 && wrong1.n % wrong1.d !== 0) cands.push(toChoiceVal(wrong1));

  // 오개념 2: 분자, 분모 둘 다 nat으로 나눔 시도 (반올림) — 명세 금지, 대신 비슷한 수치 오답
  // → 분모만 nat으로 나눔 (d가 nat의 배수가 아닐 때 틀린 값)
  if (f.d % nat !== 0) {
    // 분모를 잘못 처리: d/nat 반올림 → 근사 분모
    const wrongD = Math.max(1, Math.round(f.d / nat));
    if (wrongD !== f.d && wrongD > 0) {
      const w2 = simplify({ n: f.n, d: wrongD });
      if (w2.d <= 60 && w2.n % w2.d !== 0 && w2.n > 0) cands.push(toChoiceVal(w2));
    }
  }

  // 오개념 3: 분자·분모 둘 다 nat으로 나눔 (n/nat, d/nat — 비정수지만 표현)
  // → 실제로는 분자 nat배 분모 nat배 (잘못된 분수 축소): n×nat / d×nat = n/d (원래 값)
  // → 대신 n/(d÷nat 반올림) 오답
  {
    const wrongD2 = Math.max(1, f.d - nat + 1);
    if (wrongD2 !== f.d && wrongD2 > 0 && wrongD2 !== newD) {
      const w3 = simplify({ n: f.n, d: wrongD2 });
      if (w3.d <= 60 && w3.n % w3.d !== 0 && w3.n > 0) cands.push(toChoiceVal(w3));
    }
  }

  // 오개념 4: 약분 전 가분수 그대로 (약분 안 함, 다른 표현)
  if (f.n !== result.n || newD !== result.d) {
    if (newD <= 60 && f.n % newD !== 0) {
      cands.push({ kind: 'frac', n: f.n, d: newD });
    }
  }

  // 오개념 5: 분자 ±1 실수
  for (const delta of [1, -1, 2, -2]) {
    const cn = result.n + delta;
    if (cn > 0 && result.d <= 60 && cn % result.d !== 0) {
      const s = simplify({ n: cn, d: result.d });
      if (s.n > 0 && s.d <= 60 && s.n % s.d !== 0) cands.push(toChoiceVal(s));
    }
  }

  // 오개념 6: 분모에 nat+1 곱 (분모 잘못 곱함)
  const wrongD3 = f.d * (nat + 1);
  if (wrongD3 <= 60) {
    const w6 = simplify({ n: f.n, d: wrongD3 });
    if (w6.n > 0 && w6.n % w6.d !== 0) cands.push(toChoiceVal(w6));
  }

  // 오개념 7: 분모에 nat-1 곱 (nat > 2일 때)
  if (nat > 2) {
    const wrongD4 = f.d * (nat - 1);
    if (wrongD4 <= 60 && wrongD4 > 0) {
      const w7 = simplify({ n: f.n, d: wrongD4 });
      if (w7.n > 0 && w7.n % w7.d !== 0) cands.push(toChoiceVal(w7));
    }
  }

  // 오개념 8: 분자+분모에 모두 nat 더함
  {
    const w8 = simplify({ n: f.n + nat, d: f.d + nat });
    if (w8.n > 0 && w8.d <= 60 && w8.n % w8.d !== 0) cands.push(toChoiceVal(w8));
  }

  return cands.filter(isValidFracChoice);
}

const fdiv1FracNat2: SkillDef = {
  id: 'fdiv1-frac-nat2',
  unitId: 'unitFracDiv1',
  difficulty: 2,
  title: '(진분수)÷(자연수) — 분자가 나누어떨어지지 않는 경우',
  note: '분자가 나누는 수로 나누어떨어지지 않는 경우. 분모에 자연수를 곱하는 원리 적용.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let f!: Frac;
    let nat!: number;
    for (;;) {
      const d = rng.int(2, 9);
      const ns = irreducibleNums(d);
      if (!ns.length) continue;
      const n = rng.pick(ns);
      const divisor = rng.int(2, 6);
      // 분자가 divisor로 나누어떨어지면 안 됨
      if (n % divisor === 0) continue;
      // 결과 분모 ≤ 60 체크
      const newD = d * divisor;
      if (newD > 60) continue;
      // 결과가 정수가 되면 안 됨
      const result = simplify({ n, d: newD });
      if (result.n % result.d === 0) continue;
      f = { n, d };
      nat = divisor;
      break;
    }

    const newD = f.d * nat;
    const result = simplify({ n: f.n, d: newD });
    const expr: MathExpr = [frT(f), opT('÷'), txt(String(nat))];
    const explanation = explainFracNat2Div(f, nat);

    const rng2 = new RNG(seed ^ 0xc4d7e821);
    if (rng2.chance(0.5)) {
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fraction-input',
        prompt: '계산하세요. (기약분수로 나타내세요)',
        expr,
        mixed: false,
        requireIrreducible: true,
        answer: { n: result.n, d: result.d },
        explanation,
      };
    }

    const answerCV = toChoiceVal(result);
    const distractors = fracNat2DivDistr(f, nat);
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
   스킬 4: fdiv1-mixed-nat — (대분수)÷(자연수)
────────────────────────────────────────────────────── */

function explainMixedNatDiv(m: Mixed, nat: number): MathExpr {
  const f = fromMixed(m);
  const newD = f.d * nat;
  const result = simplify({ n: f.n, d: newD });
  const rm = toMixed(result);
  const g = gcd(f.n, newD);
  const exprs: MathToken[] = [
    txt('대분수를 가분수로 바꿔요. '),
    mixT(m),
    opT('='),
    frT(f),
    txt('. '),
    frT(f),
    opT('÷'),
    txt(String(nat)),
    opT('='),
    frT(f),
    opT('×'),
    { kind: 'frac', n: 1, d: nat },
    opT('='),
    { kind: 'frac', n: f.n, d: newD },
  ];
  if (g > 1) {
    exprs.push(opT('='), mixT(rm));
    exprs.push(txt(` (${nj(g, '으로/로')} 약분해요.)`));
  } else if (rm.whole > 0) {
    exprs.push(opT('='), mixT(rm));
  }
  return exprs;
}

const fdiv1MixedNat: SkillDef = {
  id: 'fdiv1-mixed-nat',
  unitId: 'unitFracDiv1',
  difficulty: 3,
  title: '(대분수)÷(자연수)',
  note: '대분수를 가분수로 바꾼 뒤 자연수로 나눈다. 분모에 자연수 곱하는 원리 적용.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let m!: Mixed;
    let nat!: number;
    for (;;) {
      const d = rng.int(2, 6);
      const ns = irreducibleNums(d);
      if (!ns.length) continue;
      const n = rng.pick(ns);
      const whole = rng.int(1, 4);
      const divisor = rng.int(2, 6);
      const impN = whole * d + n;
      // 결과 분모 = d × divisor ≤ 54 (d≤6, divisor≤6 → 최대 36)
      const newD = d * divisor;
      if (newD > 54) continue;
      // 결과가 정수이면 안 됨 (impN % divisor == 0 이고 결과가 정수인 경우 제거)
      const result = simplify({ n: impN, d: newD });
      if (result.n % result.d === 0) continue;
      m = { whole, n, d };
      nat = divisor;
      break;
    }

    const f = fromMixed(m);
    const newD = f.d * nat;
    const result = simplify({ n: f.n, d: newD });
    const rm = toMixed(result);
    const isMixed = rm.whole > 0;
    const expr: MathExpr = [mixT(m), opT('÷'), txt(String(nat))];
    const explanation = explainMixedNatDiv(m, nat);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: isMixed
        ? '계산하세요. (대분수로 나타내세요)'
        : '계산하세요. (기약분수로 나타내세요)',
      expr,
      mixed: isMixed,
      requireIrreducible: true,
      answer: isMixed ? { whole: rm.whole, n: rm.n, d: rm.d } : { n: rm.n, d: rm.d },
      explanation,
    };
  },
};

/* ──────────────────────────────────────────────────────
   스킬 5: fdiv1-word — 문장제
────────────────────────────────────────────────────── */

interface WordTemplate {
  /** 'proper': 진분수 소재, 'mixed': 대분수 소재 */
  kind: 'proper' | 'mixed';
  buildExpr: (amount: MathToken, divisor: number) => MathToken[];
  unit: string;
}

const WORD_TEMPLATES: WordTemplate[] = [
  // 진분수 소재
  {
    kind: 'proper',
    buildExpr: (amount, n) => [
      txt('리본 '),
      amount,
      txt(` m를 ${n}명이 똑같이 나누면 한 명이 갖는 리본의 길이는 몇 m인가요?`),
    ],
    unit: 'm',
  },
  {
    kind: 'proper',
    buildExpr: (amount, n) => [
      txt('주스 '),
      amount,
      txt(` L를 ${n}일 동안 같은 양씩 나눠 마시면 하루에 마시는 양은 몇 L인가요?`),
    ],
    unit: 'L',
  },
  {
    kind: 'proper',
    buildExpr: (amount, n) => [
      txt('철사 '),
      amount,
      txt(` m를 ${n}도막으로 똑같이 자르면 한 도막의 길이는 몇 m인가요?`),
    ],
    unit: 'm',
  },
  {
    kind: 'proper',
    buildExpr: (amount, n) => [
      txt('밀가루 '),
      amount,
      txt(` kg을 ${n}봉지에 똑같이 나눠 담으면 한 봉지에 들어가는 밀가루는 몇 kg인가요?`),
    ],
    unit: 'kg',
  },
  {
    kind: 'proper',
    buildExpr: (amount, n) => [
      txt('물 '),
      amount,
      txt(` L를 ${n}개의 컵에 같은 양씩 나눠 담으면 컵 한 개에 들어가는 물은 몇 L인가요?`),
    ],
    unit: 'L',
  },
  // 대분수 소재
  {
    kind: 'mixed',
    buildExpr: (amount, n) => [
      txt('색 테이프 '),
      amount,
      txt(` m를 ${n}명이 똑같이 나누면 한 명이 갖는 길이는 몇 m인가요?`),
    ],
    unit: 'm',
  },
  {
    kind: 'mixed',
    buildExpr: (amount, n) => [
      txt('페인트 '),
      amount,
      txt(` L를 ${n}개의 벽에 같은 양씩 칠하면 벽 하나에 사용하는 페인트는 몇 L인가요?`),
    ],
    unit: 'L',
  },
  {
    kind: 'mixed',
    buildExpr: (amount, n) => [
      txt('설탕 '),
      amount,
      txt(` kg을 ${n}개의 봉지에 똑같이 나눠 담으면 봉지 한 개의 무게는 몇 kg인가요?`),
    ],
    unit: 'kg',
  },
  {
    kind: 'mixed',
    buildExpr: (amount, n) => [
      txt('노끈 '),
      amount,
      txt(` m를 ${n}도막으로 똑같이 자르면 한 도막은 몇 m인가요?`),
    ],
    unit: 'm',
  },
  {
    kind: 'mixed',
    buildExpr: (amount, n) => [
      txt('기름 '),
      amount,
      txt(` L를 ${n}병에 똑같이 나눠 담으면 한 병에 들어가는 기름은 몇 L인가요?`),
    ],
    unit: 'L',
  },
];

const fdiv1Word: SkillDef = {
  id: 'fdiv1-word',
  unitId: 'unitFracDiv1',
  difficulty: 3,
  word: true,
  title: '분수의 나눗셈 문장제',
  note: '(진분수 또는 대분수) ÷ (자연수) 상황을 문장제로 출제한다. 소재 10가지.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    const tmpl = rng.pick(WORD_TEMPLATES);
    const nat = rng.int(2, 6);

    let amountToken!: MathToken;
    let result!: Frac;
    let unit!: string;
    let explanation!: MathExpr;

    if (tmpl.kind === 'proper') {
      // 진분수 소재
      let f!: Frac;
      for (;;) {
        const d = rng.int(2, 9);
        const ns = irreducibleNums(d);
        if (!ns.length) continue;
        const n = rng.pick(ns);
        // 분자가 nat으로 나누어떨어지는 경우와 아닌 경우 모두 허용
        const newD = n % nat === 0 ? d : d * nat;
        if (newD > 54) continue;
        const res = simplify({ n: n % nat === 0 ? n / nat : n, d: n % nat === 0 ? d : newD });
        if (res.n % res.d === 0) continue; // 정수 금지
        if (res.n >= res.d) continue; // 결과가 진분수여야 함 (문장제 단순화)
        f = { n, d };
        result = res;
        break;
      }
      amountToken = frT(f);
      unit = tmpl.unit;
      // 해설
      if (f.n % nat === 0) {
        explanation = [
          txt(`분자 ${nj(f.n, '이/가')} ${nj(nat, '으로/로')} 나누어떨어져요. `),
          frT(f),
          opT('÷'),
          txt(String(nat)),
          opT('='),
          { kind: 'frac', n: f.n / nat, d: f.d },
          ...(gcd(f.n / nat, f.d) > 1
            ? ([opT('='), frT(result)] as MathToken[])
            : ([] as MathToken[])),
        ];
      } else {
        const newD = f.d * nat;
        const g = gcd(f.n, newD);
        explanation = [
          txt(`÷${nj(nat, '은/는')} ×`),
          { kind: 'frac', n: 1, d: nat },
          txt(`과 같아요. `),
          frT(f),
          opT('÷'),
          txt(String(nat)),
          opT('='),
          { kind: 'frac', n: f.n, d: newD },
          ...(g > 1
            ? ([opT('='), frT(result)] as MathToken[])
            : ([] as MathToken[])),
        ];
      }
    } else {
      // 대분수 소재
      let m!: Mixed;
      for (;;) {
        const d = rng.int(2, 6);
        const ns = irreducibleNums(d);
        if (!ns.length) continue;
        const n = rng.pick(ns);
        const whole = rng.int(1, 3);
        const impN = whole * d + n;
        const newD = d * nat;
        if (newD > 54) continue;
        const res = simplify({ n: impN, d: newD });
        if (res.n % res.d === 0) continue; // 정수 금지
        m = { whole, n, d };
        result = res;
        break;
      }
      const f = fromMixed(m);
      amountToken = mixT(m);
      unit = tmpl.unit;
      const newD = f.d * nat;
      const rm = toMixed(result);
      explanation = [
        txt('대분수를 가분수로 바꿔요. '),
        mixT(m),
        opT('='),
        frT(f),
        txt('. '),
        frT(f),
        opT('÷'),
        txt(String(nat)),
        opT('='),
        frT(f),
        opT('×'),
        { kind: 'frac', n: 1, d: nat },
        opT('='),
        { kind: 'frac', n: f.n, d: newD },
        opT('='),
        mixT(rm),
      ];
    }

    const rm = toMixed(result);
    const isMixed = rm.whole > 0;
    const exprTokens = tmpl.buildExpr(amountToken, nat);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `답을 구하세요. (단위: ${unit})`,
      expr: exprTokens,
      mixed: isMixed,
      requireIrreducible: true,
      answer: isMixed ? { whole: rm.whole, n: rm.n, d: rm.d } : { n: rm.n, d: rm.d },
      explanation,
    };
  },
};

/* ── export ─────────────────────────────────────────── */
export const unitFracDiv1Skills: SkillDef[] = [
  fdiv1NatNat,
  fdiv1FracNat,
  fdiv1FracNat2,
  fdiv1MixedNat,
  fdiv1Word,
];
