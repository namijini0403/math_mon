/**
 * 단원: 분수와 소수 (2022 개정교육과정 3-1 6단원)
 * 성취기준: 전체-부분 분수 쓰기, 단위분수 비교, 분모 같은 분수 비교,
 * 소수 한 자리(0.□=□/10 관계), 소수 크기 비교, 문장제
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. frac3-part  전체-부분으로 분수 쓰기 (fraction-input) ──────
const frac3Part: SkillDef = {
  id: 'frac3-part',
  unitId: 'unitFrac3',
  difficulty: 1,
  title: '전체-부분으로 분수 쓰기',
  note: '전체를 d등분하고 그 중 n개에 해당하는 분수. fraction-input. 분모 ≤ 12.',
  generate(seed) {
    const rng = new RNG(seed);
    // 분모 2~12, 분자 1~d-1
    const d = rng.int(2, 12);
    const n = rng.int(1, d - 1);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `전체를 ${d}칸으로 나누었을 때 그 중 ${n}칸을 색칠했어요. 색칠한 부분을 분수로 쓰세요.`,
      explanation: [
        txt(`전체를 똑같이 ${d}칸으로 나눈 것 중 ${n}칸이에요. 그래서 `),
        { kind: 'frac', n, d },
        txt(`이에요.`),
      ],
      mixed: false,
      answer: { n, d },
      requireIrreducible: false,
    };
  },
};

// ── 2. frac3-unit-cmp  단위분수 크기 비교 (comparison) ───────────
const frac3UnitCmp: SkillDef = {
  id: 'frac3-unit-cmp',
  unitId: 'unitFrac3',
  difficulty: 1,
  title: '단위분수 크기 비교',
  note: '1/a 와 1/b 크기 비교. 분모가 클수록 작음. 분모 ≤ 12.',
  minVariety: 55,
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number;
    a = 3; b = 5;

    for (let tries = 0; tries < 300; tries++) {
      const ta = rng.int(2, 12);
      const tb = rng.int(2, 12);
      if (ta !== tb) { a = ta; b = tb; break; }
    }

    const left: MathExpr = [{ kind: 'frac', n: 1, d: a }];
    const right: MathExpr = [{ kind: 'frac', n: 1, d: b }];
    const answer = 1 / a < 1 / b ? '<' : '>';

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '두 단위분수의 크기를 비교하여 ○에 >, =, < 를 써넣으세요.',
      left,
      right,
      answer,
      explanation: [
        txt(`분모가 클수록 크기가 작아요. ${a} ${a > b ? '>' : '<'} ${b}이므로 `),
        { kind: 'frac', n: 1, d: a },
        txt(` ${answer} `),
        { kind: 'frac', n: 1, d: b },
      ],
    };
  },
};

// ── 3. frac3-same-denom-cmp  분모 같은 분수 비교 (comparison) ────
const frac3SameDenomCmp: SkillDef = {
  id: 'frac3-same-denom-cmp',
  unitId: 'unitFrac3',
  difficulty: 2,
  title: '분모 같은 분수 비교',
  note: '같은 분모의 두 진분수 비교. 분자가 클수록 크다. 분모 ≤ 12.',
  generate(seed) {
    const rng = new RNG(seed);
    const d = rng.int(3, 12);
    let n1: number, n2: number;
    n1 = 1; n2 = 2;

    for (let tries = 0; tries < 300; tries++) {
      const tn1 = rng.int(1, d - 1);
      const tn2 = rng.int(1, d - 1);
      if (tn1 !== tn2) { n1 = tn1; n2 = tn2; break; }
    }

    const left: MathExpr = [{ kind: 'frac', n: n1, d }];
    const right: MathExpr = [{ kind: 'frac', n: n2, d }];
    const answer: '<' | '>' = n1 < n2 ? '<' : '>';

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '두 분수의 크기를 비교하여 ○에 >, =, < 를 써넣으세요.',
      left,
      right,
      answer,
      explanation: [
        txt(`분모가 같을 때 분자가 클수록 커요. ${n1} ${n1 < n2 ? '<' : '>'} ${n2}이므로 `),
        { kind: 'frac', n: n1, d },
        txt(` ${answer} `),
        { kind: 'frac', n: n2, d },
      ],
    };
  },
};

// ── 4. frac3-dec-rel  소수 한 자리와 분수 관계 (fill-blanks) ──────
const frac3DecRel: SkillDef = {
  id: 'frac3-dec-rel',
  unitId: 'unitFrac3',
  difficulty: 2,
  title: '소수 한 자리와 분수 관계',
  note: '0.□ = □/10 빈칸 채우기. fill-blanks. 분자 1~9.',
  minVariety: 9,
  generate(seed) {
    const rng = new RNG(seed);
    // 0.n = n/10
    const n = rng.int(1, 9);
    // 방향: 0 = 소수→분수, 1 = 분수→소수(분자 빈칸으로 표현 불가, 분모/분자로)
    const dir = rng.int(0, 1);

    let prompt: string;
    let expr: MathExpr;

    if (dir === 0) {
      // 0.n = □/10
      prompt = `0.${n}을 분수로 나타내면 □/10입니다. □에 알맞은 수를 구하세요.`;
      expr = [
        { kind: 'decimal', v: n / 10 },
        txt(' = '),
        { kind: 'blank', slot: 0 },
        txt('/10'),
      ];
    } else {
      // n/10 = 0.□
      prompt = `${n}/10을 소수로 나타내면 0.□입니다. □에 알맞은 수를 구하세요.`;
      expr = [
        { kind: 'frac', n, d: 10 },
        txt(' = 0.'),
        { kind: 'blank', slot: 0 },
      ];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [n],
      explanation: [
        txt(`0.${n}은 0.1이 ${n}개예요. 0.1은 `),
        { kind: 'frac', n: 1, d: 10 },
        txt(`과 같으니 0.${n} = `),
        { kind: 'frac', n, d: 10 },
        txt(`이에요.`),
      ],
    };
  },
};

// ── 5. frac3-dec-cmp  소수 한 자리 크기 비교 (comparison) ─────────
const frac3DecCmp: SkillDef = {
  id: 'frac3-dec-cmp',
  unitId: 'unitFrac3',
  difficulty: 2,
  title: '소수 한 자리 크기 비교',
  note: '소수 한 자리 두 수의 크기 비교. comparison.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number;
    a = 3; b = 7;

    for (let tries = 0; tries < 300; tries++) {
      const ta = rng.int(1, 9);
      const tb = rng.int(1, 9);
      if (ta !== tb) { a = ta; b = tb; break; }
    }

    const av = a / 10;
    const bv = b / 10;

    const left: MathExpr = [{ kind: 'decimal', v: av }];
    const right: MathExpr = [{ kind: 'decimal', v: bv }];
    const answer: '<' | '>' = av < bv ? '<' : '>';

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '두 소수의 크기를 비교하여 ○에 >, =, < 를 써넣으세요.',
      left,
      right,
      answer,
      explanation: [
        { kind: 'decimal', v: av },
        txt(` ${answer} `),
        { kind: 'decimal', v: bv },
        txt(`. 소수 부분 ${a} ${a < b ? '<' : '>'} ${b}이에요.`),
      ],
    };
  },
};

// ── 6. frac3-word  분수·소수 문장제 (fill-blanks) ──────────────────
const frac3Word: SkillDef = {
  id: 'frac3-word',
  unitId: 'unitFrac3',
  difficulty: 3,
  word: true,
  title: '분수·소수 문장제',
  note: '분수 또는 소수 한 자리 모험 소재 문장제. 소재 3가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let prompt: string;
    let ans: number;
    let expl: string;
    let unit: string;

    if (pat === 0) {
      // 전체의 몇/d 만큼
      const d = rng.int(2, 10);
      const n = rng.int(1, d - 1);
      const total = d * rng.int(2, 8);
      const per = total / d;
      ans = per * n;
      unit = '개';
      prompt = `마법사가 구슬 ${total}개를 ${d}묶음으로 똑같이 나누었어요. 그 중 ${n}묶음은 몇 개인가요?`;
      // 3학년은 혼합계산(÷×) 전이므로 두 단계로 따로 설명
      expl = `한 묶음은 ${total} ÷ ${d} = ${per}개예요. ${n}묶음은 ${per} × ${n} = ${ans}개예요.`;
    } else if (pat === 1) {
      // 소수 → 분수 문장제: 길이를 소수로 나타내기
      const n = rng.int(1, 9);
      ans = n;
      unit = '칸';
      prompt = `리본을 10칸으로 나누었을 때 0.${n}은 몇 칸인가요?`;
      expl = `10칸으로 나누면 한 칸이 0.1이에요. 0.${n}은 0.1이 ${n}개니 ${n}칸이에요.`;
    } else {
      // 분수 비교 문장제
      const d = rng.int(4, 12);
      const n1 = rng.int(1, d - 2);
      const n2 = rng.int(n1 + 1, d - 1);
      ans = n2;
      unit = '조각';
      prompt = `피자를 ${d}조각으로 나누었을 때 오리가 ${n1}조각, 토끼가 ${n2}조각을 먹었어요. 더 많이 먹은 동물은 몇 조각을 먹었나요?`;
      expl = `${n1}/${d} < ${n2}/${d}이므로 토끼가 더 많이 먹었고, ${n2}조각이에요.`;
    }

    if (ans <= 0) { ans = 1; }

    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt(' ' + unit),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [ans],
      explanation: [txt(expl)],
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitFrac3Skills: SkillDef[] = [
  frac3Part,
  frac3UnitCmp,
  frac3SameDenomCmp,
  frac3DecRel,
  frac3DecCmp,
  frac3Word,
];
