/**
 * 단원: 분수의 덧셈과 뺄셈 (2022 개정교육과정 4-2 1단원)
 * 성취기준: 분모가 같은 분수의 덧셈과 뺄셈을 계산할 수 있다.
 * 모두 동분모, 분모 2~15.
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import { gcd, fromMixed, type Frac, type Mixed } from '../fraction';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, MathToken, Problem, SkillDef } from '../types';

const txt = (text: string): MathToken => ({ kind: 'text', text });
const frT = (f: Frac): MathToken => ({ kind: 'frac', n: f.n, d: f.d });
const mixT = (m: Mixed): MathToken =>
  m.whole === 0
    ? { kind: 'frac', n: m.n, d: m.d }
    : { kind: 'frac', whole: m.whole, n: m.n, d: m.d };

/**
 * 가분수 → 대분수 (약분하지 않음).
 * ⚠️ 4학년은 '약분과 통분'(5학년) 미도입 — 분모는 그대로 두고 분자끼리만 계산한다.
 * (공용 fraction.ts의 toMixed는 내부에서 simplify를 호출하므로 4학년에 쓰면 안 됨.)
 */
function toMixedRaw(f: Frac): Mixed {
  const whole = Math.floor(f.n / f.d);
  return { whole, n: f.n - whole * f.d, d: f.d };
}

/** 동분모 기약 진분수 (0 < n < d, gcd=1) */
function randProperSameDenom(rng: RNG): [Frac, Frac, number] {
  for (;;) {
    const d = rng.int(2, 15);
    // 분자 후보 (기약 조건: gcd(n,d)=1)
    const opts: number[] = [];
    for (let n = 1; n < d; n++) if (gcd(n, d) === 1) opts.push(n);
    if (opts.length < 2) continue;
    const n1 = rng.pick(opts);
    const remaining = opts.filter((x) => x !== n1);
    if (!remaining.length) continue;
    const n2 = rng.pick(remaining);
    return [{ n: n1, d }, { n: n2, d }, d];
  }
}

/** 동분모에서 결과 토큰 (약분하지 않고 대분수로만 정리) */
function resultToken(f: Frac): ChoiceValue {
  const m = toMixedRaw(f);
  if (m.n === 0) return { kind: 'decimal', v: m.whole }; // 정수 결과 (걸러져야 함)
  return m.whole === 0
    ? { kind: 'frac', n: m.n, d: m.d }
    : { kind: 'frac', whole: m.whole, n: m.n, d: m.d };
}

/** 동분모 오개념 오답 (분모끼리 더함, 분자만 계산 오류, 받아내림 누락 등) */
function sameDenomMisconceptions(a: Frac, b: Frac, op: '+' | '-'): ChoiceValue[] {
  const d = a.d; // 동분모
  const applyN = (x: number, y: number) => (op === '+' ? x + y : x - y);
  const cands: Frac[] = [
    { n: applyN(a.n, b.n), d: d + d }, // 분모끼리 더함 (오개념)
    { n: applyN(a.n, b.n) + 1, d: d }, // 분자 계산 오류 (+1)
    { n: Math.abs(applyN(a.n, b.n) - 1), d: d }, // 분자 계산 오류 (-1)
    { n: a.n, d: d }, // 받아내림/올림 누락 (b를 무시)
    { n: b.n, d: d }, // 첫 번째 분수를 무시
    // 분모끼리 곱함
    { n: applyN(a.n, b.n), d: d * d > 60 ? d + 2 : d * d },
  ];
  const result: Frac = { n: applyN(a.n, b.n), d };
  // ±1 변형 오답 추가
  for (const delta of [2, -2, 3]) cands.push({ n: result.n + delta, d: d });
  return cands
    .filter((f) => f.n > 0 && f.d > 0 && f.d <= 60 && f.n % f.d !== 0)
    .map(resultToken);
}

/** 분수 입력 정답 형태 생성 (약분하지 않음 — 4학년) */
function fracAnswer(f: Frac): { n: number; d: number; whole?: number } {
  const m = toMixedRaw(f);
  if (m.whole === 0) return { n: m.n, d: m.d };
  return { whole: m.whole, n: m.n, d: m.d };
}

/** 동분모 덧뺄셈 해설 */
function explainSameDenom(a: Frac, b: Frac, op: '+' | '-'): MathExpr {
  const d = a.d;
  const resultN = op === '+' ? a.n + b.n : a.n - b.n;
  const raw: Frac = { n: resultN, d };
  const m = toMixedRaw(raw);
  const tokens: MathToken[] = [
    txt(`분모가 같으므로 분모는 그대로 두고 분자끼리만 계산해요. `),
    frT(a),
    { kind: 'op', op },
    frT(b),
    { kind: 'op', op: '=' },
    frT(raw),
  ];
  // 가분수면 대분수로만 고친다 (약분은 5학년 — 분모 유지)
  if (m.whole > 0) {
    tokens.push({ kind: 'op', op: '=' }, mixT(m));
  }
  return tokens;
}

/** 동분모 덧뺄셈 문제 공통 빌더 */
function makeSameDenomProblem(
  skill: SkillDef,
  seed: number,
  a: Frac,
  b: Frac,
  op: '+' | '-',
  aDisp?: MathToken,
  bDisp?: MathToken,
): Problem {
  const rng = new RNG(seed ^ 0x4f7a3c21);
  const result: Frac = { n: op === '+' ? a.n + b.n : a.n - b.n, d: a.d };
  const m = toMixedRaw(result);
  const aT = aDisp ?? frT(a);
  const bT = bDisp ?? frT(b);
  const expr: MathExpr = [aT, { kind: 'op', op }, bT];
  const explanation = explainSameDenom(a, b, op);
  const base = { id: `${skill.id}:${seed}`, skillId: skill.id, seed, expr, explanation };

  if (rng.chance(0.5)) {
    return {
      ...base,
      format: 'fraction-input' as const,
      prompt: '계산하세요.' + (m.whole > 0 ? ' (대분수로 나타내세요)' : ''),
      mixed: m.whole > 0,
      requireIrreducible: false,
      answer: fracAnswer(result),
    };
  }
  const { choices, answerIndex } = buildChoices(
    resultToken(result),
    sameDenomMisconceptions(a, b, op),
    rng,
  );
  return { ...base, format: 'choice' as const, prompt: '계산 결과를 고르세요.', choices, answerIndex };
}

// ── 1. f4-add-proper-lt1  진분수 덧셈 (합 < 1)  난이도 1 ─────────────
const f4AddProperLt1: SkillDef = {
  id: 'f4-add-proper-lt1',
  unitId: 'unitFracAS4',
  difficulty: 1,
  title: '진분수의 덧셈 (합 < 1)',
  note: '동분모 진분수 덧셈, 합이 1 미만. 분모 2~15.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: Frac, b: Frac;
    // fallback
    a = { n: 1, d: 5 }; b = { n: 2, d: 5 };
    for (let tries = 0; tries < 200; tries++) {
      const [ta, tb] = randProperSameDenom(rng);
      if (ta.n + tb.n < ta.d) { a = ta; b = tb; break; }
    }
    return makeSameDenomProblem(this, seed, a, b, '+');
  },
};

// ── 2. f4-add-proper-ge1  진분수 덧셈 (합 ≥ 1, 대분수)  난이도 2 ──────
const f4AddProperGe1: SkillDef = {
  id: 'f4-add-proper-ge1',
  unitId: 'unitFracAS4',
  difficulty: 2,
  title: '진분수의 덧셈 (합 ≥ 1)',
  note: '동분모 진분수 덧셈, 합이 1 이상 → 대분수. 분모 2~15.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: Frac, b: Frac;
    a = { n: 3, d: 4 }; b = { n: 3, d: 4 };
    for (let tries = 0; tries < 200; tries++) {
      const [ta, tb] = randProperSameDenom(rng);
      const sumN = ta.n + tb.n;
      // 합이 정수(분모의 배수)이면 건너뜀
      if (sumN >= ta.d && sumN % ta.d !== 0) { a = ta; b = tb; break; }
    }
    return makeSameDenomProblem(this, seed, a, b, '+');
  },
};

// ── 3. f4-sub-proper  진분수 뺄셈  난이도 1 ──────────────────────────
const f4SubProper: SkillDef = {
  id: 'f4-sub-proper',
  unitId: 'unitFracAS4',
  difficulty: 1,
  title: '진분수의 뺄셈',
  note: '동분모 진분수 뺄셈 (a > b 보장). 분모 2~15.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: Frac, b: Frac;
    a = { n: 3, d: 5 }; b = { n: 1, d: 5 };
    for (let tries = 0; tries < 200; tries++) {
      const [ta, tb] = randProperSameDenom(rng);
      if (ta.n > tb.n) { a = ta; b = tb; break; }
      if (tb.n > ta.n) { a = tb; b = ta; break; }
    }
    return makeSameDenomProblem(this, seed, a, b, '-');
  },
};

// ── 4. f4-add-mixed  대분수 덧셈  난이도 2 ───────────────────────────
const f4AddMixed: SkillDef = {
  id: 'f4-add-mixed',
  unitId: 'unitFracAS4',
  difficulty: 2,
  title: '대분수의 덧셈',
  note: '동분모 대분수 덧셈 (받아올림 유무 랜덤). 분모 2~15.',
  generate(seed) {
    const rng = new RNG(seed);
    let ma: Mixed, mb: Mixed;
    ma = { whole: 1, n: 1, d: 3 }; mb = { whole: 1, n: 1, d: 3 };
    for (let tries = 0; tries < 200; tries++) {
      const [ta, tb] = randProperSameDenom(rng);
      const tma: Mixed = { whole: rng.int(1, 4), n: ta.n, d: ta.d };
      const tmb: Mixed = { whole: rng.int(1, 4), n: tb.n, d: tb.d };
      // 결과가 정수가 되면 안 됨: 분자합이 분모의 배수면 정수
      const sumN = tma.n + tmb.n;
      if (sumN % ta.d === 0) continue;
      ma = tma; mb = tmb;
      break;
    }
    return makeSameDenomProblem(this, seed, fromMixed(ma), fromMixed(mb), '+', mixT(ma), mixT(mb));
  },
};

// ── 5. f4-sub-mixed  대분수 뺄셈 (받아내림 포함)  난이도 3 ─────────────
const f4SubMixed: SkillDef = {
  id: 'f4-sub-mixed',
  unitId: 'unitFracAS4',
  difficulty: 3,
  title: '대분수의 뺄셈 (받아내림)',
  note: '동분모 대분수 뺄셈, 분수 부분 a < b → 받아내림. 분모 2~15.',
  generate(seed) {
    const rng = new RNG(seed);
    let ma: Mixed, mb: Mixed;
    ma = { whole: 3, n: 1, d: 5 }; mb = { whole: 1, n: 3, d: 5 };
    for (let tries = 0; tries < 200; tries++) {
      const [ta, tb] = randProperSameDenom(rng);
      if (ta.n >= tb.n) continue; // a분자 < b분자이어야 받아내림 발생
      const wb = rng.int(1, 3);
      // wa - wb - 1 >= 1 이어야 결과 자연수 부분이 0 이상 (대분수 whole >= 1)
      const wa = rng.int(wb + 2, wb + 4);
      const tma: Mixed = { whole: wa, n: ta.n, d: ta.d };
      const tmb: Mixed = { whole: wb, n: tb.n, d: tb.d };
      // 결과 분수 부분이 정수가 되면 안 됨
      const borrowedN = ta.n + ta.d - tb.n;
      if (borrowedN % ta.d === 0) continue;
      ma = tma; mb = tmb; break;
    }
    // 해설: 받아내림 과정 명시
    const d = ma.d;
    const borrowedN = ma.n + d - mb.n;
    const borrowedResult: Mixed = {
      whole: ma.whole - mb.whole - 1,
      n: borrowedN,
      d,
    };
    const explanation: MathExpr = [
      txt(`분수 부분: `),
      frT({ n: ma.n, d }),
      txt(` < `),
      frT({ n: mb.n, d }),
      txt(`이므로 자연수 1에서 받아내립니다. `),
      txt(`${nj(ma.whole, '을/를')} ${nj(ma.whole - 1, '으로/로')} 줄이고 분자에 분모(${d})를 더해요. `),
      txt(`분수 부분: ${ma.n + d} − ${mb.n} = ${borrowedN} (분모 ${nj(d, '은/는')} 그대로). `),
      txt(`자연수 부분: ${ma.whole - 1} − ${mb.whole} = ${borrowedResult.whole}.`),
    ];
    const result: Frac = { n: borrowedResult.whole * d + borrowedResult.n, d };
    const expr: MathExpr = [mixT(ma), { kind: 'op', op: '-' }, mixT(mb)];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: '계산하세요. (대분수로 나타내세요)',
      expr,
      mixed: true,
      requireIrreducible: false,
      answer: fracAnswer(result),
      explanation,
    };
  },
};

// ── 6. f4-nat-sub-frac  1−진분수 / (자연수)−(대분수)  난이도 2 ─────────
const f4NatSubFrac: SkillDef = {
  id: 'f4-nat-sub-frac',
  unitId: 'unitFracAS4',
  difficulty: 2,
  title: '(자연수) - (분수)',
  note: '1−진분수 또는 자연수−대분수. 분모 2~15.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1); // 0: 1−진분수, 1: 자연수−대분수

    if (pat === 0) {
      // 1 − 진분수 = 같은 분모의 나머지 분수
      let f: Frac;
      f = { n: 2, d: 5 };
      for (let tries = 0; tries < 200; tries++) {
        const d = rng.int(2, 15);
        const opts: number[] = [];
        for (let n = 1; n < d; n++) if (gcd(n, d) === 1) opts.push(n);
        if (!opts.length) continue;
        const n = rng.pick(opts);
        // 결과: d−n / d, 확인: gcd는 상관없음 (약분 가능할 수도 있음)
        f = { n, d }; break;
      }
      const result: Frac = { n: f.d - f.n, d: f.d };
      const explanation: MathExpr = [
        txt(`1을 분모가 ${f.d}인 분수로 바꾸면 `),
        frT({ n: f.d, d: f.d }),
        txt(`예요. `),
        frT({ n: f.d, d: f.d }),
        { kind: 'op', op: '-' },
        frT(f),
        { kind: 'op', op: '=' },
        frT(result),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fraction-input',
        prompt: '계산하세요.',
        expr: [txt('1'), { kind: 'op', op: '-' }, frT(f)],
        mixed: false,
        requireIrreducible: false,
        answer: fracAnswer(result),
        explanation,
      };
    } else {
      // 자연수 − 대분수
      let whole: number, mf: Mixed;
      whole = 4; mf = { whole: 1, n: 2, d: 5 };
      for (let tries = 0; tries < 200; tries++) {
        const d = rng.int(2, 15);
        const opts: number[] = [];
        for (let n = 1; n < d; n++) if (gcd(n, d) === 1) opts.push(n);
        if (!opts.length) continue;
        const n = rng.pick(opts);
        const mfW = rng.int(1, 3);
        // w - mfW - 1 >= 1 이어야 결과 자연수 ≥ 1 (대분수 표기 가능)
        const w = rng.int(mfW + 2, mfW + 4);
        // 결과 분수 부분: d−n (받아내림), 자연수: w−mfW−1
        const resN = d - n;
        if (resN % d === 0) continue;
        whole = w; mf = { whole: mfW, n, d }; break;
      }
      const d = mf.d;
      const resN = d - mf.n;
      const resWhole = whole - mf.whole - 1;
      const result: Frac = { n: resWhole * d + resN, d };
      const explanation: MathExpr = [
        txt(`${whole}에서 1을 받아내려 `),
        frT({ n: d, d }),
        txt(`로 만들고, `),
        frT({ n: d, d }),
        { kind: 'op', op: '-' },
        frT({ n: mf.n, d }),
        { kind: 'op', op: '=' },
        frT({ n: resN, d }),
        txt(`. 자연수: ${whole - 1} − ${mf.whole} = ${resWhole}.`),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fraction-input',
        prompt: '계산하세요. (대분수로 나타내세요)',
        expr: [txt(String(whole)), { kind: 'op', op: '-' }, mixT(mf)],
        mixed: true,
        requireIrreducible: false,
        answer: fracAnswer(result),
        explanation,
      };
    }
  },
};

// ── 7. f4-word  문장제  난이도 3 ─────────────────────────────────────
const f4Word: SkillDef = {
  id: 'f4-word',
  unitId: 'unitFracAS4',
  difficulty: 3,
  word: true,
  title: '분수 덧뺄셈 문장제',
  note: '동분모 분수를 이용한 모험/판타지 소재 문장제. 소재 4가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let a: Frac, b: Frac, op: '+' | '-';
    let prompt: string, unit: string;

    // 동분모 기약 진분수 쌍, 결과도 분수(정수 아님) 보장
    const pickValidPair = (rng2: RNG, needOp: '+' | '-'): [Frac, Frac] => {
      for (let t = 0; t < 500; t++) {
        const [ta, tb] = randProperSameDenom(rng2);
        let fa = ta, fb = tb;
        if (needOp === '-' && fa.n < fb.n) { fa = tb; fb = ta; }
        const resN = needOp === '+' ? fa.n + fb.n : fa.n - fb.n;
        // 결과 분수 부분이 0이면 안 됨 (정수 결과 제거) — 약분 없이 판정
        const m = toMixedRaw({ n: resN, d: fa.d });
        if (m.n === 0) continue;
        if (resN <= 0) continue;
        return [fa, fb];
      }
      // fallback
      return needOp === '+' ? [{ n: 1, d: 5 }, { n: 2, d: 5 }] : [{ n: 3, d: 5 }, { n: 1, d: 5 }];
    };

    if (pat === 0) {
      [a, b] = pickValidPair(rng, '+');
      // 합이 1 미만 보장
      for (let g = 0; g < 200; g++) {
        if (a.n + b.n < a.d) break;
        [a, b] = pickValidPair(rng, '+');
      }
      op = '+';
      unit = '조각';
      prompt = `모험가 시우가 케이크를 구워서 먹었어요. 처음에 전체의 ${nj(frFmt(a), '을/를')} 먹고, 나중에 ${nj(frFmt(b), '을/를')} 더 먹었어요. 모두 얼마나 먹었나요?`;
    } else if (pat === 1) {
      [a, b] = pickValidPair(rng, '-');
      op = '-';
      unit = 'L';
      prompt = `마법 물약이 ${frFmt(a)} L 있었는데 탐험 중에 ${frFmt(b)} L를 사용했어요. 남은 물약은 몇 L인가요?`;
    } else if (pat === 2) {
      [a, b] = pickValidPair(rng, '+');
      // 합이 정수가 아닌지 보장 (이미 pickValidPair에서 보장됨)
      op = '+';
      unit = 'km';
      prompt = `요정 마을까지 가는 길의 ${frFmt(a)} km를 걷고, 나머지 중 ${frFmt(b)} km를 더 걸었어요. 모두 몇 km를 걸었나요?`;
    } else {
      [a, b] = pickValidPair(rng, '-');
      op = '-';
      unit = '시간';
      prompt = `드래곤 동굴 탐험에 ${frFmt(a)} 시간이 걸렸는데, 예상보다 ${frFmt(b)} 시간 단축했어요. 실제 걸린 시간은 몇 시간인가요?`;
    }

    const resultN = op === '+' ? a.n + b.n : a.n - b.n;
    const result: Frac = { n: resultN, d: a.d };
    const m = toMixedRaw(result);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `답을 구하세요. (단위: ${unit})`,
      expr: [txt(prompt)],
      mixed: m.whole > 0,
      requireIrreducible: false,
      answer: fracAnswer(result),
      explanation: explainSameDenom(a, b, op),
    };
  },
};

/** 분수를 표시 문자열로 */
function frFmt(f: Frac): string {
  return `${f.n}/${f.d}`;
}

export const unitFracAS4Skills: SkillDef[] = [
  f4AddProperLt1,
  f4AddProperGe1,
  f4SubProper,
  f4AddMixed,
  f4SubMixed,
  f4NatSubFrac,
  f4Word,
];
