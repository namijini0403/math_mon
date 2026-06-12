/**
 * 단원: 분수의 곱셈 (2022 개정교육과정 5-2 2단원)
 * 성취기준: 분수의 곱셈 원리를 이해하고 계산한다.
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

/** 오개념 후보가 dedupe로 모자라지 않게 — 분모를 2배로 잘못 계산한 근접 오답 추가 */
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

/* ── 곱셈 계산 ─────────────────────────────── */
function mulFrac(a: Frac, b: Frac): Frac {
  return simplify({ n: a.n * b.n, d: a.d * b.d });
}

/* ──────────────────────────────────────────────────────
   스킬 1: fmul-nat — (진분수) × (자연수)
────────────────────────────────────────────────────── */

/** 약분 전/후 해설 생성 */
function explainFracNat(f: Frac, nat: number): MathExpr {
  const rawN = f.n * nat;
  const raw: Frac = { n: rawN, d: f.d };
  const result = simplify(raw);
  const m = toMixed(result);
  const g = gcd(rawN, f.d);
  const exprs: MathToken[] = [
    frT(f),
    opT('×'),
    txt(String(nat)),
    opT('='),
    { kind: 'frac', n: rawN, d: f.d },
  ];
  if (raw.n !== result.n || raw.d !== result.d || m.whole > 0) {
    exprs.push(opT('='), mixT(m));
  }
  if (g > 1) {
    exprs.unshift(txt(`분자와 분모를 ${g}로 약분해요. `));
  } else {
    exprs.unshift(txt('분자에 자연수를 곱해요. '));
  }
  return exprs;
}

/** 진분수×자연수 오개념 보기 후보 */
function fracNatDistr(f: Frac, nat: number): ChoiceValue[] {
  const result = simplify({ n: f.n * nat, d: f.d });
  const rm = toMixed(result);
  const cands: ChoiceValue[] = [];

  // 오개념 1: 분모에도 곱한다
  const s1 = simplify({ n: f.n * nat, d: f.d * nat });
  if (s1.n > 0 && s1.n % s1.d !== 0) cands.push(toChoiceVal(s1));

  // 오개념 2: 분자에 nat-1 곱 (곱 실수)
  if (nat > 1) {
    const w2 = simplify({ n: f.n * (nat - 1), d: f.d });
    if (w2.n > 0 && w2.n % w2.d !== 0) cands.push(toChoiceVal(w2));
  }

  // 오개념 3: 분자에 nat+1 곱 (곱 실수)
  const w3 = simplify({ n: f.n * (nat + 1), d: f.d });
  if (w3.n > 0 && w3.n % w3.d !== 0) cands.push(toChoiceVal(w3));

  // 오개념 4: 약분 없이 가분수로 표기 (값 다를 것만)
  const rawFrac: Frac = { n: f.n * nat, d: f.d };
  if ((rawFrac.n !== result.n || rawFrac.d !== result.d) && rawFrac.n % rawFrac.d !== 0) {
    cands.push({ kind: 'frac', n: rawFrac.n, d: rawFrac.d });
  }

  // 오개념 5: 대분수 whole±1
  if (rm.whole > 0 && rm.n > 0) {
    cands.push({ kind: 'frac', whole: rm.whole + 1, n: rm.n, d: rm.d });
    if (rm.whole >= 2) cands.push({ kind: 'frac', whole: rm.whole - 1, n: rm.n, d: rm.d });
  }

  // 오개념 6: 분자 ±1 실수
  for (const delta of [1, -1, 2, -2]) {
    const cn = result.n + delta;
    if (cn > 0 && cn % result.d !== 0) {
      const s = simplify({ n: cn, d: result.d });
      if (s.n > 0 && s.n % s.d !== 0) cands.push(toChoiceVal(s));
    }
  }

  // 필터: 분모 ≤ 60, 분자 ≥ 1, 정수 아님, 진분수 또는 대분수 형식
  return cands.filter((c) => {
    if (c.kind !== 'frac') return false;
    if (c.n < 1 || c.d <= 0 || c.d > 60) return false;
    const w = c.whole ?? 0;
    if (w < 0) return false;
    if (w === 0 && c.n >= c.d) return false;
    if (w > 0 && c.n >= c.d) return false;
    return true;
  });
}

const fmulNat: SkillDef = {
  id: 'fmul-nat',
  unitId: 'unitFracMul',
  difficulty: 1,
  title: '(진분수) × (자연수)',
  note: '진분수에 자연수를 곱하고 기약분수/대분수로 나타낸다.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let f!: Frac;
    let nat!: number;
    for (;;) {
      const d = rng.int(2, 9);
      const ns = irreducibleNums(d);
      if (!ns.length) continue;
      const n = rng.pick(ns);
      const k = rng.int(2, 6);
      if ((n * k) % d === 0) continue; // 정수 결과 금지
      f = { n, d };
      nat = k;
      break;
    }

    const result = simplify({ n: f.n * nat, d: f.d });
    const m = toMixed(result);
    const expr: MathExpr = [frT(f), opT('×'), txt(String(nat))];
    const explanation = explainFracNat(f, nat);

    const rng2 = new RNG(seed ^ 0xf1a3bc7);
    if (rng2.chance(0.5)) {
      const isMixed = m.whole > 0;
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fraction-input',
        prompt: isMixed ? '계산하세요. (대분수로 나타내세요)' : '계산하세요. (기약분수로 나타내세요)',
        expr,
        mixed: isMixed,
        requireIrreducible: true,
        answer: isMixed ? { whole: m.whole, n: m.n, d: m.d } : { n: m.n, d: m.d },
        explanation,
      };
    }

    const answerCV = toChoiceVal(result);
    const distractors = [...fracNatDistr(f, nat), ...halfStepDistr(result)];
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
   스킬 2: fmul-nat2 — (대분수) × (자연수)
────────────────────────────────────────────────────── */

function explainMixedNat(m: Mixed, nat: number): MathExpr {
  const f = fromMixed(m);
  const mulResult = simplify({ n: f.n * nat, d: f.d });
  const finalM = toMixed(mulResult);
  return [
    txt('대분수를 가분수로 바꿔요. '),
    mixT(m),
    opT('='),
    frT(f),
    txt('. '),
    frT(f),
    opT('×'),
    txt(String(nat)),
    opT('='),
    { kind: 'frac', n: f.n * nat, d: f.d },
    opT('='),
    mixT(finalM),
  ];
}

/** 대분수×자연수 오개념 보기 */
function mixedNatDistr(m: Mixed, nat: number): ChoiceValue[] {
  const f = fromMixed(m);
  const result = simplify({ n: f.n * nat, d: f.d });
  const rm = toMixed(result);
  const cands: ChoiceValue[] = [];

  // 오개념 1: 자연수 부분만 곱함 (분수 부분 그대로)
  if (m.n > 0 && m.n < m.d) {
    cands.push({ kind: 'frac', whole: m.whole * nat, n: m.n, d: m.d });
  }

  // 오개념 2: 분수 부분에만 곱함
  const fracOnly = simplify({ n: m.n * nat, d: m.d });
  const fracOnlyM = toMixed(fracOnly);
  if (fracOnlyM.n > 0 && fracOnlyM.n < fracOnlyM.d) {
    cands.push({ kind: 'frac', whole: m.whole + fracOnlyM.whole, n: fracOnlyM.n, d: fracOnlyM.d });
  }

  // 오개념 3: whole ±1
  if (rm.whole > 0 && rm.n > 0) {
    cands.push({ kind: 'frac', whole: rm.whole + 1, n: rm.n, d: rm.d });
    if (rm.whole >= 2) cands.push({ kind: 'frac', whole: rm.whole - 1, n: rm.n, d: rm.d });
  }

  // 오개념 4: 분자 ±1
  if (rm.n > 0) {
    for (const delta of [1, -1, 2]) {
      const nn = rm.n + delta;
      if (nn > 0 && nn < rm.d) cands.push({ kind: 'frac', whole: rm.whole, n: nn, d: rm.d });
    }
  }

  // 오개념 5: nat-1 곱
  if (nat > 2) {
    const r2 = simplify({ n: f.n * (nat - 1), d: f.d });
    const r2m = toMixed(r2);
    if (r2m.n > 0 && r2m.n % r2m.d !== 0) cands.push(toChoiceVal(r2));
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

const fmulNat2: SkillDef = {
  id: 'fmul-nat2',
  unitId: 'unitFracMul',
  difficulty: 1,
  title: '(대분수) × (자연수)',
  note: '대분수에 자연수를 곱하고 대분수로 나타낸다.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let m!: Mixed;
    let nat!: number;
    for (;;) {
      const d = rng.int(2, 6);
      const ns = irreducibleNums(d);
      if (!ns.length) continue;
      const n = rng.pick(ns);
      const whole = rng.int(1, 3);
      const k = rng.int(2, 5);
      const impN = whole * d + n;
      if ((impN * k) % d === 0) continue; // 정수 결과 금지
      m = { whole, n, d };
      nat = k;
      break;
    }

    const f = fromMixed(m);
    const result = simplify({ n: f.n * nat, d: f.d });
    const rm = toMixed(result);
    const expr: MathExpr = [mixT(m), opT('×'), txt(String(nat))];
    const explanation = explainMixedNat(m, nat);

    const rng2 = new RNG(seed ^ 0xa3c9f12b);
    if (rng2.chance(0.5)) {
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
    }

    const answerCV = toChoiceVal(result);
    const distractors = [...mixedNatDistr(m, nat), ...halfStepDistr(result)];
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
   스킬 3: fmul-proper — (진분수) × (진분수)
────────────────────────────────────────────────────── */

function explainProperMul(a: Frac, b: Frac): MathExpr {
  const rawN = a.n * b.n;
  const rawD = a.d * b.d;
  const result = simplify({ n: rawN, d: rawD });
  const g = gcd(rawN, rawD);
  const exprs: MathToken[] = [
    frT(a),
    opT('×'),
    frT(b),
    opT('='),
    { kind: 'frac', n: rawN, d: rawD },
  ];
  if (g > 1) {
    exprs.push(opT('='), frT(result));
    exprs.unshift(txt('분자끼리, 분모끼리 곱한 뒤 약분해요. '));
  } else {
    exprs.unshift(txt('분자끼리, 분모끼리 곱해요. '));
  }
  return exprs;
}

/** 진분수×진분수 오개념 보기 */
function properMulDistr(a: Frac, b: Frac): ChoiceValue[] {
  const result = mulFrac(a, b);
  const cands: ChoiceValue[] = [];

  // 오개념 1: 분자끼리만 곱하고 분모는 한쪽만
  for (const wd of [a.d, b.d]) {
    const s = simplify({ n: a.n * b.n, d: wd });
    if (s.n > 0 && s.d <= 60 && s.n % s.d !== 0) cands.push(toChoiceVal(s));
  }

  // 오개념 2: 분자+분자 / 분모+분모 (덧셈 오개념)
  const addWrong = simplify({ n: a.n + b.n, d: a.d + b.d });
  if (addWrong.n > 0 && addWrong.d <= 60 && addWrong.n % addWrong.d !== 0) {
    cands.push(toChoiceVal(addWrong));
  }

  // 오개념 3: 교차곱 (분자a×분모b / 분모a×분자b)
  if (b.n > 0) {
    const cross = simplify({ n: a.n * b.d, d: a.d * b.n });
    if (cross.n > 0 && cross.d <= 60 && cross.n % cross.d !== 0) cands.push(toChoiceVal(cross));
  }

  // 오개념 4: 분자 결과에 ±1 실수
  for (const delta of [1, -1, 2, -2, 3]) {
    const cn = result.n + delta;
    if (cn > 0 && result.d <= 60 && cn % result.d !== 0) {
      const s = simplify({ n: cn, d: result.d });
      if (s.n > 0 && s.n % s.d !== 0) cands.push(toChoiceVal(s));
    }
  }

  // 오개념 5: 약분 안 한 값
  const rawFrac: Frac = { n: a.n * b.n, d: a.d * b.d };
  if ((rawFrac.n !== result.n || rawFrac.d !== result.d) && rawFrac.d <= 60 && rawFrac.n % rawFrac.d !== 0) {
    cands.push({ kind: 'frac', n: rawFrac.n, d: rawFrac.d });
  }

  return cands.filter((c) => {
    if (c.kind !== 'frac') return false;
    if (c.n < 1 || c.d <= 0 || c.d > 60) return false;
    const w = c.whole ?? 0;
    if (w < 0) return false;
    if (w === 0 && c.n >= c.d) return false;
    if (w > 0 && c.n >= c.d) return false;
    return true;
  });
}

const fmulProper: SkillDef = {
  id: 'fmul-proper',
  unitId: 'unitFracMul',
  difficulty: 2,
  title: '(진분수) × (진분수)',
  note: '진분수 두 개를 곱하고 기약분수로 나타낸다. 분모 곱 ≤ 60.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let a!: Frac;
    let b!: Frac;
    for (;;) {
      const d1 = rng.int(2, 7);
      const d2max = Math.min(7, Math.floor(60 / d1));
      if (d2max < 2) continue;
      const d2 = rng.int(2, d2max);
      const ns1 = irreducibleNums(d1);
      const ns2 = irreducibleNums(d2);
      if (!ns1.length || !ns2.length) continue;
      const n1 = rng.pick(ns1);
      const n2 = rng.pick(ns2);
      const rawN = n1 * n2;
      const rawD = d1 * d2;
      if (rawN === 0 || rawN % rawD === 0) continue;
      a = { n: n1, d: d1 };
      b = { n: n2, d: d2 };
      break;
    }

    const result = mulFrac(a, b);
    const expr: MathExpr = [frT(a), opT('×'), frT(b)];
    const explanation = explainProperMul(a, b);

    const rng2 = new RNG(seed ^ 0x5d8a32f1);
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
    const distractors = [...properMulDistr(a, b), ...halfStepDistr(result)];
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
   스킬 4: fmul-mixed — (대분수) × (진분수)
────────────────────────────────────────────────────── */

function explainMixedProper(m: Mixed, b: Frac): MathExpr {
  const a = fromMixed(m);
  const rawN = a.n * b.n;
  const rawD = a.d * b.d;
  const result = simplify({ n: rawN, d: rawD });
  const rm = toMixed(result);
  return [
    txt('대분수를 가분수로 바꿔요. '),
    mixT(m),
    opT('='),
    frT(a),
    txt('. '),
    frT(a),
    opT('×'),
    frT(b),
    opT('='),
    { kind: 'frac', n: rawN, d: rawD },
    opT('='),
    mixT(rm),
  ];
}

const fmulMixed: SkillDef = {
  id: 'fmul-mixed',
  unitId: 'unitFracMul',
  difficulty: 3,
  title: '(대분수) × (진분수)',
  note: '대분수를 가분수로 바꾼 뒤 곱하고 대분수로 나타낸다.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    let m!: Mixed;
    let b!: Frac;
    for (;;) {
      const da = rng.int(2, 4);
      const dbMax = Math.min(6, Math.floor(60 / da));
      if (dbMax < 2) continue;
      const db = rng.int(2, dbMax);
      const whole = rng.int(1, 3);
      const nas = irreducibleNums(da);
      const nbs = irreducibleNums(db);
      if (!nas.length || !nbs.length) continue;
      const na = rng.pick(nas);
      const nb = rng.pick(nbs);
      const impN = whole * da + na;
      const rawD = da * db;
      if (rawD > 60) continue;
      const rawN = impN * nb;
      if (rawN === 0 || rawN % rawD === 0) continue;
      m = { whole, n: na, d: da };
      b = { n: nb, d: db };
      break;
    }

    const a = fromMixed(m);
    const result = simplify({ n: a.n * b.n, d: a.d * b.d });
    const rm = toMixed(result);
    const isMixed = rm.whole > 0;
    const expr: MathExpr = [mixT(m), opT('×'), frT(b)];
    const explanation = explainMixedProper(m, b);

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
   스킬 5: fmul-word — 문장제
────────────────────────────────────────────────────── */

interface WordScenario {
  kind: 'proper' | 'mixed';
  buildTokens: (a: MathToken, b: MathToken) => MathToken[];
  unit: string;
}

const WORD_SCENARIOS: WordScenario[] = [
  // 진분수×진분수: "전체의 부분"
  {
    kind: 'proper',
    buildTokens: (a, b) => [txt('철사 '), a, txt(' m의 '), b, txt('만큼을 사용했어요. 사용한 철사의 길이는 몇 m인가요?')],
    unit: 'm',
  },
  {
    kind: 'proper',
    buildTokens: (a, b) => [txt('주스 '), a, txt(' L의 '), b, txt('만큼을 마셨어요. 마신 주스는 몇 L인가요?')],
    unit: 'L',
  },
  {
    kind: 'proper',
    buildTokens: (a, b) => [txt('밀가루 '), a, txt(' kg의 '), b, txt('만큼을 빵 만들기에 썼어요. 사용한 밀가루는 몇 kg인가요?')],
    unit: 'kg',
  },
  {
    kind: 'proper',
    buildTokens: (a, b) => [txt('리본 '), a, txt(' m 중에서 '), b, txt('만큼을 선물 포장에 사용했어요. 사용한 리본은 몇 m인가요?')],
    unit: 'm',
  },
  {
    kind: 'proper',
    buildTokens: (a, b) => [txt('물통에 물이 '), a, txt(' L 들어 있어요. 이 중 '), b, txt('를 화분에 주었어요. 화분에 준 물은 몇 L인가요?')],
    unit: 'L',
  },
  // 대분수×진분수: "양의 일부"
  {
    kind: 'mixed',
    buildTokens: (a, b) => [txt('한 병에 '), a, txt(' L씩 들어 있는 주스 한 병의 '), b, txt('만큼을 마셨어요. 마신 주스는 몇 L인가요?')],
    unit: 'L',
  },
  {
    kind: 'mixed',
    buildTokens: (a, b) => [txt('노끈 한 타래가 '), a, txt(' m예요. 이 중 '), b, txt('만큼을 사용했어요. 사용한 노끈은 몇 m인가요?')],
    unit: 'm',
  },
  {
    kind: 'mixed',
    buildTokens: (a, b) => [txt('밀가루 한 봉지가 '), a, txt(' kg이에요. 이 중 '), b, txt('만큼을 사용했어요. 사용한 밀가루는 몇 kg인가요?')],
    unit: 'kg',
  },
  {
    kind: 'mixed',
    buildTokens: (a, b) => [txt('페인트 한 통이 '), a, txt(' L예요. 전체의 '), b, txt('만큼을 벽에 칠했어요. 칠한 페인트는 몇 L인가요?')],
    unit: 'L',
  },
  {
    kind: 'mixed',
    buildTokens: (a, b) => [txt('색 테이프 한 롤이 '), a, txt(' m예요. 이 중 '), b, txt('만큼을 잘라 사용했어요. 사용한 테이프는 몇 m인가요?')],
    unit: 'm',
  },
];

const fmulWord: SkillDef = {
  id: 'fmul-word',
  unitId: 'unitFracMul',
  difficulty: 3,
  word: true,
  title: '분수의 곱셈 문장제',
  note: '전체의 부분 개념(진분수×진분수) 및 대분수×진분수 문장제.',
  generate(seed): Problem {
    const rng = new RNG(seed);
    const sc = rng.pick(WORD_SCENARIOS);

    let result!: Frac;
    let exprTokens!: MathToken[];
    let unit!: string;
    let explanationTokens!: MathToken[];

    if (sc.kind === 'proper') {
      let a!: Frac;
      let b!: Frac;
      for (;;) {
        const d1 = rng.int(2, 7);
        const d2max = Math.min(7, Math.floor(60 / d1));
        if (d2max < 2) continue;
        const d2 = rng.int(2, d2max);
        const ns1 = irreducibleNums(d1);
        const ns2 = irreducibleNums(d2);
        if (!ns1.length || !ns2.length) continue;
        const n1 = rng.pick(ns1);
        const n2 = rng.pick(ns2);
        const rawN = n1 * n2;
        const rawD = d1 * d2;
        if (rawN === 0 || rawN % rawD === 0) continue;
        a = { n: n1, d: d1 };
        b = { n: n2, d: d2 };
        break;
      }
      result = mulFrac(a, b);
      unit = sc.unit;
      exprTokens = sc.buildTokens(frT(a), frT(b));
      explanationTokens = [
        txt('(전체) × (분율) = '),
        frT(a),
        opT('×'),
        frT(b),
        opT('='),
        { kind: 'frac', n: a.n * b.n, d: a.d * b.d },
        opT('='),
        frT(result),
      ];
    } else {
      let m!: Mixed;
      let b!: Frac;
      for (;;) {
        const da = rng.int(2, 4);
        const dbMax = Math.min(6, Math.floor(60 / da));
        if (dbMax < 2) continue;
        const db = rng.int(2, dbMax);
        const whole = rng.int(1, 3);
        const nas = irreducibleNums(da);
        const nbs = irreducibleNums(db);
        if (!nas.length || !nbs.length) continue;
        const na = rng.pick(nas);
        const nb = rng.pick(nbs);
        const rawD = da * db;
        if (rawD > 60) continue;
        const impN = whole * da + na;
        const rawN = impN * nb;
        if (rawN === 0 || rawN % rawD === 0) continue;
        m = { whole, n: na, d: da };
        b = { n: nb, d: db };
        break;
      }
      const a = fromMixed(m);
      result = simplify({ n: a.n * b.n, d: a.d * b.d });
      unit = sc.unit;
      exprTokens = sc.buildTokens(mixT(m), frT(b));
      explanationTokens = [
        txt('대분수를 가분수로 바꿔요. '),
        mixT(m),
        opT('='),
        frT(a),
        txt('. '),
        frT(a),
        opT('×'),
        frT(b),
        opT('='),
        { kind: 'frac', n: a.n * b.n, d: a.d * b.d },
        opT('='),
        frT(result),
      ];
    }

    const rm = toMixed(result);
    const isMixedAnswer = rm.whole > 0;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `답을 구하세요. (단위: ${unit})`,
      expr: exprTokens,
      mixed: isMixedAnswer,
      requireIrreducible: true,
      answer: isMixedAnswer ? { whole: rm.whole, n: rm.n, d: rm.d } : { n: rm.n, d: rm.d },
      explanation: explanationTokens,
    };
  },
};

/* ── export ─────────────────────────────────────────── */
export const unitFracMulSkills: SkillDef[] = [
  fmulNat,
  fmulNat2,
  fmulProper,
  fmulMixed,
  fmulWord,
];
