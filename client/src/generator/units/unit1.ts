/**
 * 단원 1: 약분과 통분
 * 성취기준: 분수의 성질(분모·분자에 0이 아닌 같은 수를 곱하거나 나누어도 크기가 같다)을
 * 이용해 약분·통분하고, 분수의 크기를 비교한다.
 */

import { RNG } from '../rng';
import { gcd, lcm, compare, type Frac } from '../fraction';
import { buildChoices } from '../choices';
import { ida, josa, nj, yo } from '../josa';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

/** 분모가 [dMin, dMax]인 기약 진분수 */
function randIrreducible(rng: RNG, dMin: number, dMax: number): Frac {
  for (;;) {
    const d = rng.int(Math.max(dMin, 2), dMax);
    const opts: number[] = [];
    for (let n = 1; n < d; n++) if (gcd(n, d) === 1) opts.push(n);
    if (opts.length > 0) return { n: rng.pick(opts), d };
  }
}

const fr = (f: Frac): ChoiceValue => ({ kind: 'frac', n: f.n, d: f.d });
const frT = (f: Frac) => ({ kind: 'frac', n: f.n, d: f.d }) as const;
const txt = (text: string) => ({ kind: 'text', text }) as const;

/** ── 크기가 같은 분수 만들기 (빈칸) ─────────────────────────── */
const eqMake: SkillDef = {
  id: 'u1-eq-make',
  unitId: 'unit1',
  difficulty: 1,
  title: '크기가 같은 분수 만들기',
  note: '분모·분자에 같은 수를 곱하거나 나누기. □ 채우기',
  generate(seed) {
    const rng = new RNG(seed);
    const base = randIrreducible(rng, 2, 9);
    const k = rng.int(2, Math.min(6, Math.floor(48 / base.d)));
    const scaled: Frac = { n: base.n * k, d: base.d * k };
    // up: 작은 분수 = 큰 분수의 빈칸 채우기 / down: 큰 분수를 줄이기
    const up = rng.chance(0.5);
    const blankNumer = rng.chance(0.5);

    const [given, target] = up ? [base, scaled] : [scaled, base];
    const blankAnswer = blankNumer ? target.n : target.d;
    const expr: MathExpr = [
      frT(given),
      { kind: 'op', op: '=' },
      blankNumer
        ? { kind: 'fracBlank', n: { slot: 0 }, d: target.d }
        : { kind: 'fracBlank', n: target.n, d: { slot: 0 } },
    ];
    const explanation: MathExpr = up
      ? [txt(`분모와 분자에 똑같이 ${nj(k, '을/를')} 곱하면 크기가 같은 분수가 돼요. `), frT(base), { kind: 'op', op: '=' }, frT(scaled)]
      : [txt(`분모와 분자를 똑같이 ${nj(k, '으로/로')} 나누면 크기가 같은 분수가 돼요. `), frT(scaled), { kind: 'op', op: '=' }, frT(base)];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '□ 안에 알맞은 수를 써넣으세요.',
      expr,
      blankAnswers: [blankAnswer],
      explanation,
    };
  },
};

/** ── 크기가 같은 분수 찾기 (4지선다) ─────────────────────────── */
const eqFind: SkillDef = {
  id: 'u1-eq-find',
  unitId: 'unit1',
  difficulty: 1,
  title: '크기가 같은 분수 찾기',
  note: '오개념 distractor: 같은 수 더하기, 분자만 곱하기, 분모만 곱하기',
  generate(seed) {
    const rng = new RNG(seed);
    const base = randIrreducible(rng, 3, 9);
    const k = rng.int(2, Math.min(5, Math.floor(45 / base.d)));
    const answer: Frac = { n: base.n * k, d: base.d * k };

    const a = rng.int(1, 4);
    const j = k === 2 ? 3 : k - 1;
    const candidates: ChoiceValue[] = rng.shuffle([
      fr({ n: base.n + a, d: base.d + a }), // 같은 수를 "더한" 오개념
      fr({ n: base.n * k, d: base.d * j }), // 분모에 다른 수를 곱함
      fr({ n: base.n, d: base.d * k }), // 분모만 곱함
      fr({ n: base.n * k + 1, d: base.d * k }), // 분자 계산 실수
      fr({ n: base.d * k, d: base.n * k }), // 분자·분모 뒤집기
    ]);
    const { choices, answerIndex } = buildChoices(fr(answer), candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: '크기가 같은 분수를 고르세요.',
      expr: [frT(base)],
      choices,
      answerIndex,
      explanation: [
        txt(`분모와 분자에 똑같이 ${nj(k, '을/를')} 곱하면 `),
        frT(base),
        { kind: 'op', op: '=' },
        frT(answer),
        txt(`${yo(answer.n)}. 분모와 분자에 같은 수를 곱해야(또는 나눠야) 크기가 같아요.`),
      ],
    };
  },
};

/** ── 기약분수로 나타내기 (직접 입력) ─────────────────────────── */
const simplifyInput: SkillDef = {
  id: 'u1-simplify',
  unitId: 'unit1',
  difficulty: 2,
  title: '기약분수로 나타내기',
  note: '약분 가능한 분수만 출제, 정답은 기약분수 입력',
  generate(seed) {
    const rng = new RNG(seed);
    const base = randIrreducible(rng, 2, 9);
    const g = rng.int(2, Math.min(6, Math.floor(48 / base.d)));
    const given: Frac = { n: base.n * g, d: base.d * g };

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: '기약분수로 나타내세요.',
      expr: [frT(given)],
      mixed: false,
      requireIrreducible: true,
      answer: { n: base.n, d: base.d },
      explanation: [
        txt(`${nj(given.n, '과/와')} ${given.d}의 최대공약수는 ${ida(g)}. 분모와 분자를 ${nj(g, '으로/로')} 나누면 `),
        frT(given),
        { kind: 'op', op: '=' },
        frT(base),
        txt(`${yo(base.n)}.`),
      ],
    };
  },
};

/** ── 기약분수 찾기 (4지선다) ─────────────────────────── */
const irreduciblePick: SkillDef = {
  id: 'u1-irreducible',
  unitId: 'unit1',
  difficulty: 2,
  title: '기약분수 찾기',
  note: '기약분수 1개 + 약분 가능한 분수 3개',
  generate(seed) {
    const rng = new RNG(seed);
    const answer = randIrreducible(rng, 5, 12);

    // 약분 가능한 분수들 — 값이 서로(그리고 정답과) 다른 것만 모아 dedupe로 모자라지 않게
    const candidates: ChoiceValue[] = [];
    const seen: Frac[] = [answer];
    let guard = 0;
    while (candidates.length < 5 && guard++ < 200) {
      const b = randIrreducible(rng, 2, 9);
      const g = rng.int(2, 4);
      const red: Frac = { n: b.n * g, d: b.d * g };
      if (red.d > 24) continue;
      if (seen.some((s) => compare(s, red) === 0)) continue;
      seen.push(red);
      candidates.push(fr(red));
    }
    const { choices, answerIndex } = buildChoices(fr(answer), candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: '기약분수를 고르세요.',
      choices,
      answerIndex,
      explanation: [
        frT(answer),
        txt(
          `의 분모 ${nj(answer.d, '과/와')} 분자 ${nj(answer.n, '은/는')} 1 말고는 공약수가 없어서 더 이상 약분할 수 없어요. 이런 분수를 기약분수라고 해요.`,
        ),
      ],
    };
  },
};

/** ── 통분하기 (빈칸) ─────────────────────────── */
const commonDenom: SkillDef = {
  id: 'u1-common-denom',
  unitId: 'unit1',
  difficulty: 2,
  title: '통분하기',
  note: '최소공배수를 공통분모로 통분, 분자 빈칸 2개',
  generate(seed) {
    const rng = new RNG(seed);
    let a: Frac, b: Frac, L: number;
    do {
      a = randIrreducible(rng, 2, 9);
      b = randIrreducible(rng, 2, 9);
      L = lcm(a.d, b.d);
    } while (a.d === b.d || L > 36);

    const an = a.n * (L / a.d);
    const bn = b.n * (L / b.d);
    const expr: MathExpr = [
      txt('( '),
      frT(a),
      txt(' , '),
      frT(b),
      txt(' )  →  ( '),
      { kind: 'fracBlank', n: { slot: 0 }, d: L },
      txt(' , '),
      { kind: 'fracBlank', n: { slot: 1 }, d: L },
      txt(' )'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '두 분수를 통분하세요.',
      expr,
      blankAnswers: [an, bn],
      explanation: [
        txt(`${nj(a.d, '과/와')} ${b.d}의 최소공배수는 ${ida(L)}. `),
        frT(a),
        txt(`의 분모·분자에 ${nj(L / a.d, '을/를')}, `),
        frT(b),
        txt(`의 분모·분자에 ${nj(L / b.d, '을/를')} 곱하면 `),
        frT({ n: an, d: L }),
        txt(' , '),
        frT({ n: bn, d: L }),
        txt(' 이에요.'),
      ],
    };
  },
};

/** ── 두 분수 크기 비교 ─────────────────────────── */
const compareTwo: SkillDef = {
  id: 'u1-compare2',
  unitId: 'unit1',
  difficulty: 2,
  title: '분수의 크기 비교',
  note: '통분해서 비교. 15% 확률로 크기가 같은 쌍 출제',
  generate(seed) {
    const rng = new RNG(seed);
    let a: Frac, b: Frac;
    if (rng.chance(0.15)) {
      // 크기가 같은 쌍: 기약분수와 그것을 키운 분수
      const base = randIrreducible(rng, 2, 8);
      const k = rng.int(2, Math.min(4, Math.floor(32 / base.d)));
      [a, b] = rng.shuffle([base, { n: base.n * k, d: base.d * k }]);
    } else {
      do {
        a = randIrreducible(rng, 2, 10);
        b = randIrreducible(rng, 2, 10);
      } while (a.d === b.d || compare(a, b) === 0 || lcm(a.d, b.d) > 40);
    }

    const L = lcm(a.d, b.d);
    const cmp = compare(a, b);
    const answer = cmp < 0 ? '<' : cmp > 0 ? '>' : '=';

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '두 분수의 크기를 비교하세요.',
      left: [frT(a)],
      right: [frT(b)],
      answer,
      explanation: [
        txt(`분모를 ${nj(L, '으로/로')} 통분하면 `),
        frT({ n: a.n * (L / a.d), d: L }),
        { kind: 'op', op: answer === '=' ? '=' : answer },
        frT({ n: b.n * (L / b.d), d: L }),
        txt(`${yo(b.n * (L / b.d))}. 분모가 같으면 분자가 클수록 큰 분수예요.`),
      ],
    };
  },
};

/** ── 셋 중 가장 큰/작은 분수 ─────────────────────────── */
const compareThree: SkillDef = {
  id: 'u1-compare3',
  unitId: 'unit1',
  difficulty: 3,
  title: '가장 큰 분수 찾기',
  note: '값이 모두 다른 분수 4개 중 최대/최소 고르기',
  generate(seed) {
    const rng = new RNG(seed);
    const fracs: Frac[] = [];
    let guard = 0;
    while (fracs.length < 4 && guard++ < 100) {
      const f = randIrreducible(rng, 2, 10);
      if (fracs.every((g) => compare(f, g) !== 0)) fracs.push(f);
    }
    const wantMax = rng.chance(0.5);
    const sorted = [...fracs].sort((x, y) => compare(x, y));
    const answer = wantMax ? sorted[sorted.length - 1] : sorted[0];
    const rest = fracs.filter((f) => f !== answer);
    const { choices, answerIndex } = buildChoices(fr(answer), rest.map(fr), rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: wantMax ? '가장 큰 분수를 고르세요.' : '가장 작은 분수를 고르세요.',
      choices,
      answerIndex,
      explanation: [
        txt('통분하거나 1과 가까운 정도를 생각해서 비교해 보세요. 크기 순서: '),
        ...sorted.flatMap((f, i) => (i === 0 ? [frT(f)] : [{ kind: 'op', op: '<' } as const, frT(f)])),
      ],
    };
  },
};

/** ── 분수와 소수의 크기 비교 ─────────────────────────── */
const fracDecimal: SkillDef = {
  id: 'u1-frac-dec',
  unitId: 'unit1',
  difficulty: 3,
  title: '분수와 소수의 크기 비교',
  note: '분모 2,4,5,10,20,25 → 소수로 정확히 변환 가능',
  generate(seed) {
    const rng = new RNG(seed);
    const d = rng.pick([2, 4, 5, 10, 20, 25]);
    const opts: number[] = [];
    for (let n = 1; n < d; n++) if (gcd(n, d) === 1) opts.push(n);
    const f: Frac = { n: rng.pick(opts), d };
    const fv = Math.round((f.n / f.d) * 100) / 100;

    let dec: number;
    if (rng.chance(0.2)) {
      dec = fv; // 같은 값
    } else {
      const delta = rng.pick([0.05, 0.1, 0.15, 0.2, 0.25]) * (rng.chance(0.5) ? 1 : -1);
      dec = Math.round((fv + delta) * 100) / 100;
      if (dec <= 0 || dec >= 1) dec = Math.round((fv - delta) * 100) / 100;
    }

    const cmp = fv < dec ? -1 : fv > dec ? 1 : 0;
    const answer = cmp < 0 ? '<' : cmp > 0 ? '>' : '=';
    const fracFirst = rng.chance(0.5);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '분수와 소수의 크기를 비교하세요.',
      left: fracFirst ? [frT(f)] : [{ kind: 'decimal', v: dec }],
      right: fracFirst ? [{ kind: 'decimal', v: dec }] : [frT(f)],
      answer: fracFirst ? answer : answer === '<' ? '>' : answer === '>' ? '<' : '=',
      explanation: [
        frT(f),
        txt(`${josa(f.n, '을/를')} 소수로 나타내면 ${ida(fv)}. ${nj(fv, '과/와')} ${nj(dec, '을/를')} 비교하면 답을 알 수 있어요.`),
      ],
    };
  },
};

/** ── 같은 크기 분수 짝맞추기 ─────────────────────────── */
const eqMatch: SkillDef = {
  id: 'u1-eq-match',
  unitId: 'unit1',
  difficulty: 1,
  title: '같은 크기 분수 짝맞추기',
  note: '기약분수 ↔ 키운 분수 4쌍. 쌍끼리 값이 모두 달라야 함',
  generate(seed) {
    const rng = new RNG(seed);
    const bases: Frac[] = [];
    let guard = 0;
    while (bases.length < 4 && guard++ < 100) {
      const f = randIrreducible(rng, 2, 8);
      if (bases.every((g) => compare(f, g) !== 0)) bases.push(f);
    }
    const pairs = bases.map((base) => {
      const k = rng.int(2, Math.min(5, Math.floor(40 / base.d)));
      return { left: fr(base), right: fr({ n: base.n * k, d: base.d * k }) };
    });

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'matching',
      prompt: '크기가 같은 분수끼리 짝지으세요.',
      pairs,
      explanation: [txt('분모와 분자를 같은 수로 나누어(약분) 기약분수로 만들면 짝을 찾을 수 있어요.')],
    };
  },
};

export const unit1Skills: SkillDef[] = [
  eqMake,
  eqFind,
  simplifyInput,
  irreduciblePick,
  commonDenom,
  compareTwo,
  compareThree,
  fracDecimal,
  eqMatch,
];
