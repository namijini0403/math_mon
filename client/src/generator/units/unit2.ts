/**
 * 단원 2: 분수의 덧셈과 뺄셈
 * 성취기준: 분모가 다른 분수의 덧셈과 뺄셈의 계산 원리를 이해하고 계산한다.
 */

import { RNG } from '../rng';
import {
  gcd,
  lcm,
  add,
  sub,
  compare,
  toMixed,
  fromMixed,
  simplify,
  type Frac,
  type Mixed,
} from '../fraction';
import { buildChoices } from '../choices';
import { nameSubject, nj, yo } from '../josa';
import type { ChoiceValue, MathExpr, MathToken, Problem, SkillDef } from '../types';
import { NAMES, WORD_TEMPLATES } from './wordTemplates';

const txt = (text: string): MathToken => ({ kind: 'text', text });
const frT = (f: Frac): MathToken => ({ kind: 'frac', n: f.n, d: f.d });
const mixT = (m: Mixed): MathToken =>
  m.whole === 0 ? { kind: 'frac', n: m.n, d: m.d } : { kind: 'frac', whole: m.whole, n: m.n, d: m.d };

/** 결과값을 보기/정답 표현으로 (1 이상이면 대분수) */
function resultValue(f: Frac): ChoiceValue {
  const m = toMixed(f);
  return m.whole === 0 ? { kind: 'frac', n: m.n, d: m.d } : { kind: 'frac', whole: m.whole, n: m.n, d: m.d };
}

/** 분모가 다른 기약 진분수 (lcm 제한) */
function randProperPair(rng: RNG, dMax = 10, lcmMax = 24): [Frac, Frac] {
  for (;;) {
    const d1 = rng.int(2, dMax);
    const d2 = rng.int(2, dMax);
    if (d1 === d2 || lcm(d1, d2) > lcmMax) continue;
    const n1opts: number[] = [];
    const n2opts: number[] = [];
    for (let n = 1; n < d1; n++) if (gcd(n, d1) === 1) n1opts.push(n);
    for (let n = 1; n < d2; n++) if (gcd(n, d2) === 1) n2opts.push(n);
    if (!n1opts.length || !n2opts.length) continue;
    return [
      { n: rng.pick(n1opts), d: d1 },
      { n: rng.pick(n2opts), d: d2 },
    ];
  }
}

/** 통분 과정 해설 */
function explainAddSub(a: Frac, b: Frac, op: '+' | '-'): MathExpr {
  const L = lcm(a.d, b.d);
  const A: Frac = { n: a.n * (L / a.d), d: L };
  const B: Frac = { n: b.n * (L / b.d), d: L };
  const raw: Frac = { n: op === '+' ? A.n + B.n : A.n - B.n, d: L };
  const result = simplify(raw);
  const m = toMixed(result);
  const tail: MathToken[] = [];
  if (raw.n !== result.n || m.whole > 0) {
    tail.push({ kind: 'op', op: '=' }, mixT(m));
  }
  return [
    txt(`분모 ${nj(a.d, '과/와')} ${b.d}의 최소공배수 ${nj(L, '으로/로')} 통분해요. `),
    frT(A),
    { kind: 'op', op },
    frT(B),
    { kind: 'op', op: '=' },
    frT(raw),
    ...tail,
  ];
}

/** 오개념 기반 오답 후보 (덧셈/뺄셈 공용) */
function misconceptions(a: Frac, b: Frac, op: '+' | '-'): ChoiceValue[] {
  const L = lcm(a.d, b.d);
  const apply = (x: number, y: number) => (op === '+' ? x + y : x - y);
  const cands: Frac[] = [
    { n: apply(a.n, b.n), d: a.d + b.d }, // 분자끼리·분모끼리 계산
    { n: apply(a.n, b.n), d: L }, // 통분하면서 분자를 안 바꿈
    { n: apply(a.n * (L / a.d), b.n), d: L }, // 한쪽만 통분
    { n: apply(a.n, b.n * (L / b.d)), d: L }, // 반대쪽만 통분
    // 연산을 반대로 한 오개념
    op === '+'
      ? { n: Math.abs(a.n * (L / a.d) - b.n * (L / b.d)), d: L }
      : { n: a.n * (L / a.d) + b.n * (L / b.d), d: L },
  ];
  // 분자 계산 실수 (±1 ~ ±3) — 위 후보가 dedupe로 줄어도 보기 4개를 채울 수 있게
  const trueN = apply(a.n * (L / a.d), b.n * (L / b.d));
  for (const delta of [1, -1, 2, -2, 3, -3]) cands.push({ n: trueN + delta, d: L });
  // L이 작으면 L분모 후보가 금방 바닥남 → 분모를 2L로 잘못 통분한 오개념 후보 추가
  for (const delta of [1, -1, 3, -3]) cands.push({ n: trueN * 2 + delta, d: 2 * L });

  // 양수이면서 정수가 아닌 후보만 (정수는 '1 0/1' 같은 깨진 대분수 표기가 됨)
  return cands.filter((f) => f.n > 0 && f.d > 0 && f.n % f.d !== 0).map(resultValue);
}

/** 덧셈/뺄셈 문제 공통 생성기 */
function makeOpProblem(
  skill: SkillDef,
  seed: number,
  a: Frac,
  b: Frac,
  op: '+' | '-',
  aDisp: MathToken = frT(a),
  bDisp: MathToken = frT(b),
): Problem {
  const rng = new RNG(seed ^ 0x9e3779b9); // 형식 결정용 별도 스트림
  const result = op === '+' ? add(a, b) : sub(a, b);
  const expr: MathExpr = [aDisp, { kind: 'op', op }, bDisp];
  const explanation = explainAddSub(a, b, op);
  const base = { id: `${skill.id}:${seed}`, skillId: skill.id, seed, expr, explanation };

  // 50%는 직접 입력, 50%는 4지선다 (오개념 보기)
  if (rng.chance(0.5)) {
    const m = toMixed(result);
    return {
      ...base,
      format: 'fraction-input',
      prompt: '계산하세요.' + (m.whole > 0 ? ' (대분수로 나타내세요)' : ''),
      mixed: m.whole > 0,
      requireIrreducible: true,
      answer: m.whole === 0 ? { n: m.n, d: m.d } : { whole: m.whole, n: m.n, d: m.d },
    };
  }
  const { choices, answerIndex } = buildChoices(resultValue(result), misconceptions(a, b, op), rng);
  return { ...base, format: 'choice', prompt: '계산 결과를 고르세요.', choices, answerIndex };
}

/** ── 진분수 덧셈 (합 < 1) ─────────────────────────── */
const addProperEasy: SkillDef = {
  id: 'u2-add-proper-1',
  unitId: 'unit2',
  difficulty: 1,
  title: '진분수의 덧셈 ①',
  note: '합이 1보다 작은 경우',
  generate(seed) {
    const rng = new RNG(seed);
    let a: Frac, b: Frac;
    do {
      [a, b] = randProperPair(rng);
    } while (compare(add(a, b), { n: 1, d: 1 }) >= 0);
    return makeOpProblem(this, seed, a, b, '+');
  },
};

/** ── 진분수 덧셈 (합 ≥ 1, 받아올림) ─────────────────────────── */
const addProperCarry: SkillDef = {
  id: 'u2-add-proper-2',
  unitId: 'unit2',
  difficulty: 2,
  title: '진분수의 덧셈 ②',
  note: '합이 1 이상 → 대분수로 나타내기',
  generate(seed) {
    const rng = new RNG(seed);
    let a: Frac, b: Frac;
    do {
      [a, b] = randProperPair(rng);
    } while (compare(add(a, b), { n: 1, d: 1 }) < 0);
    return makeOpProblem(this, seed, a, b, '+');
  },
};

/** ── 진분수 뺄셈 ─────────────────────────── */
const subProper: SkillDef = {
  id: 'u2-sub-proper',
  unitId: 'unit2',
  difficulty: 1,
  title: '진분수의 뺄셈',
  note: '결과 > 0 보장 (a > b)',
  generate(seed) {
    const rng = new RNG(seed);
    let a: Frac, b: Frac;
    do {
      [a, b] = randProperPair(rng);
    } while (compare(a, b) <= 0);
    return makeOpProblem(this, seed, a, b, '-');
  },
};

/** ── 대분수 덧셈 ─────────────────────────── */
const addMixed: SkillDef = {
  id: 'u2-add-mixed',
  unitId: 'unit2',
  difficulty: 2,
  title: '대분수의 덧셈',
  note: '자연수 1~3, 받아올림 유무 랜덤',
  generate(seed) {
    const rng = new RNG(seed);
    const [fa, fb] = randProperPair(rng, 8, 24);
    const ma: Mixed = { whole: rng.int(1, 3), n: fa.n, d: fa.d };
    const mb: Mixed = { whole: rng.int(1, 3), n: fb.n, d: fb.d };
    return makeOpProblem(this, seed, fromMixed(ma), fromMixed(mb), '+', mixT(ma), mixT(mb));
  },
};

/** ── 대분수 뺄셈 (받아내림 없음) ─────────────────────────── */
const subMixed: SkillDef = {
  id: 'u2-sub-mixed',
  unitId: 'unit2',
  difficulty: 2,
  title: '대분수의 뺄셈 ①',
  note: '분수 부분 a ≥ b → 받아내림 없음',
  generate(seed) {
    const rng = new RNG(seed);
    let fa: Frac, fb: Frac;
    do {
      [fa, fb] = randProperPair(rng, 8, 24);
    } while (compare(fa, fb) <= 0);
    const wb = rng.int(1, 3);
    const ma: Mixed = { whole: rng.int(wb, wb + 2), n: fa.n, d: fa.d };
    const mb: Mixed = { whole: wb, n: fb.n, d: fb.d };
    return makeOpProblem(this, seed, fromMixed(ma), fromMixed(mb), '-', mixT(ma), mixT(mb));
  },
};

/** ── 대분수 뺄셈 (받아내림 있음) ─────────────────────────── */
const subMixedBorrow: SkillDef = {
  id: 'u2-sub-mixed-borrow',
  unitId: 'unit2',
  difficulty: 3,
  title: '대분수의 뺄셈 ②',
  note: '분수 부분 a < b → 자연수에서 1을 받아내림',
  generate(seed) {
    const rng = new RNG(seed);
    let fa: Frac, fb: Frac;
    do {
      [fa, fb] = randProperPair(rng, 8, 24);
    } while (compare(fa, fb) >= 0);
    const wb = rng.int(1, 2);
    const ma: Mixed = { whole: rng.int(wb + 1, wb + 3), n: fa.n, d: fa.d };
    const mb: Mixed = { whole: wb, n: fb.n, d: fb.d };
    return makeOpProblem(this, seed, fromMixed(ma), fromMixed(mb), '-', mixT(ma), mixT(mb));
  },
};

/** ── 문장제 ─────────────────────────── */
const wordProblem: SkillDef = {
  id: 'u2-word',
  unitId: 'unit2',
  difficulty: 3,
  word: true,
  title: '분수 문장제',
  note: '문장 풀에서 소재·이름 선택, 항상 직접 입력',
  generate(seed) {
    const rng = new RNG(seed);
    const tpl = rng.pick(WORD_TEMPLATES);
    const name = rng.pick(NAMES);

    let a: Frac, b: Frac;
    if (tpl.op === 'add') {
      [a, b] = randProperPair(rng);
    } else {
      do {
        [a, b] = randProperPair(rng);
      } while (compare(a, b) <= 0);
    }

    // 템플릿 문자열 → 토큰 (이름/분수 슬롯 치환)
    const expr: MathExpr = [];
    const parts = tpl.text
      .replace(/\{NAME\}이\(가\)/g, nameSubject(name))
      .replace(/\{NAME\}/g, name)
      .split(/(\{A\}|\{B\})/);
    for (const p of parts) {
      if (p === '{A}') expr.push(frT(a));
      else if (p === '{B}') expr.push(frT(b));
      else if (p) expr.push(txt(p));
    }

    const result = tpl.op === 'add' ? add(a, b) : sub(a, b);
    const m = toMixed(result);
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `답을 구하세요. (단위: ${tpl.unit})`,
      expr,
      mixed: m.whole > 0,
      requireIrreducible: true,
      answer: m.whole === 0 ? { n: m.n, d: m.d } : { whole: m.whole, n: m.n, d: m.d },
      explanation: explainAddSub(a, b, tpl.op === 'add' ? '+' : '-'),
    };
  },
};

/** ── □ 구하기 (역산) ─────────────────────────── */
const missingAddend: SkillDef = {
  id: 'u2-missing',
  unitId: 'unit2',
  difficulty: 3,
  title: '□ 구하기',
  note: 'a + □ = c 에서 □ = c - a. 보스전용 고난도',
  generate(seed) {
    const rng = new RNG(seed);
    let a: Frac, b: Frac;
    do {
      [a, b] = randProperPair(rng);
    } while (compare(add(a, b), { n: 1, d: 1 }) >= 0);
    const c = add(a, b);
    const m = toMixed(b);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: '□ 안에 알맞은 분수를 구하세요.',
      expr: [frT(a), { kind: 'op', op: '+' }, txt('□'), { kind: 'op', op: '=' }, frT(c)],
      mixed: false,
      requireIrreducible: true,
      answer: { n: m.n, d: m.d },
      explanation: [
        txt('□ = '),
        frT(c),
        { kind: 'op', op: '-' },
        frT(a),
        txt(`${yo(a.n)}. `),
        ...explainAddSub(c, a, '-'),
      ],
    };
  },
};

export const unit2Skills: SkillDef[] = [
  addProperEasy,
  addProperCarry,
  subProper,
  addMixed,
  subMixed,
  subMixedBorrow,
  wordProblem,
  missingAddend,
];
