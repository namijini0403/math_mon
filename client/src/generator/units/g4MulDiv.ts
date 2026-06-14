/**
 * 단원: 곱셈과 나눗셈 (2022 개정교육과정 4-1 3단원)
 * 성취기준: (세 자리)×(몇십), (세 자리)×(두 자리), (두/세 자리)÷(몇십),
 * (세 자리)÷(두 자리)의 계산 원리를 이해하고, 검산을 할 수 있다.
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. md4-mul-tens  (세 자리)×(몇십) (fill-blanks)  난이도 1 ───────
const md4MulTens: SkillDef = {
  id: 'md4-mul-tens',
  unitId: 'unitMulDiv',
  difficulty: 1,
  title: '(세 자리)×(몇십)',
  note: '세 자리 수 × 몇십 (10~90). fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const a = rng.int(100, 999);
    const b = rng.int(1, 9) * 10;
    const ans = a * b;

    const expr: MathExpr = [
      txt(`${a} × ${b} = `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation: [
        txt(`${a} × ${b} = ${a} × ${b / 10} × 10 = ${a * (b / 10)} × 10 = ${ans}`),
      ],
    };
  },
};

// ── 2. md4-mul-two  (세 자리)×(두 자리) (fill-blanks)  난이도 2 ─────
const md4MulTwo: SkillDef = {
  id: 'md4-mul-two',
  unitId: 'unitMulDiv',
  difficulty: 2,
  title: '(세 자리)×(두 자리)',
  note: '세 자리 수 × 두 자리 수. fill-blanks. 곱 ≤ 99999.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number, ans: number;
    a = 123; b = 45; ans = a * b;
    for (let tries = 0; tries < 200; tries++) {
      const ta = rng.int(100, 499);
      const tb = rng.int(11, 99);
      const tans = ta * tb;
      if (tans <= 99999) { a = ta; b = tb; ans = tans; break; }
    }

    const tens = Math.floor(b / 10);
    const ones = b % 10;
    const step1 = a * ones;
    const step2 = a * tens * 10;

    const expr: MathExpr = [
      txt(`${a} × ${b} = `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation: [
        txt(`${a} × ${ones} = ${step1}, ${a} × ${tens}0 = ${step2}, `),
        txt(`${step1} + ${step2} = ${ans}`),
      ],
    };
  },
};

// ── 3. md4-div-tens  (두/세 자리)÷(몇십) 몫·나머지 (fill-blanks)  난이도 1 ──
const md4DivTens: SkillDef = {
  id: 'md4-div-tens',
  unitId: 'unitMulDiv',
  difficulty: 1,
  title: '(두/세 자리)÷(몇십)',
  note: '두/세 자리 수 ÷ 몇십. 몫과 나머지 fill-blanks (2개 blank). 나머지 ≥ 1 보장.',
  generate(seed) {
    const rng = new RNG(seed);
    const b = rng.int(1, 9) * 10; // 나누는 수: 10~90
    const quotient = rng.int(1, 9);
    // 나머지 ≥ 1 보장 (blankAnswers > 0 불변식)
    const remainder = rng.int(1, b - 1);
    const a = b * quotient + remainder;

    const expr: MathExpr = [
      txt(`${a} ÷ ${b} = `),
      { kind: 'blank', slot: 0 },
      txt(' 나머지 '),
      { kind: 'blank', slot: 1 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '나눗셈을 하세요. (몫, 나머지 순서로)',
      expr,
      blankAnswers: [quotient, remainder],
      explanation: [
        txt(`${a} ÷ ${b}: 몫은 ${quotient}, 나머지는 ${remainder}. `),
        txt(`검산: ${b} × ${quotient} + ${remainder} = ${b * quotient + remainder} = ${a}`),
      ],
    };
  },
};

// ── 4. md4-div-two  (세 자리)÷(두 자리) 몫·나머지 (fill-blanks)  난이도 2 ──
const md4DivTwo: SkillDef = {
  id: 'md4-div-two',
  unitId: 'unitMulDiv',
  difficulty: 2,
  title: '(세 자리)÷(두 자리)',
  note: '세 자리 수 ÷ 두 자리 수. 몫과 나머지 ≥ 1. fill-blanks (2개 blank).',
  generate(seed) {
    const rng = new RNG(seed);
    // 나머지 ≥ 1 보장
    let fa = 100, fb = 11, fq = 1, fr = 1;
    for (let tries = 0; tries < 300; tries++) {
      const tb = rng.int(11, 49);
      const tq = rng.int(2, 9);
      const tr = rng.int(1, tb - 1); // 나머지 ≥ 1
      const ta = tb * tq + tr;
      if (ta >= 100 && ta <= 999) { fa = ta; fb = tb; fq = tq; fr = tr; break; }
    }

    const expr: MathExpr = [
      txt(`${fa} ÷ ${fb} = `),
      { kind: 'blank', slot: 0 },
      txt(' 나머지 '),
      { kind: 'blank', slot: 1 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '나눗셈을 하세요. (몫, 나머지 순서로)',
      expr,
      blankAnswers: [fq, fr],
      explanation: [
        txt(`${fa} ÷ ${fb}: 몫은 ${fq}, 나머지는 ${fr}. `),
        txt(`검산: ${fb} × ${fq} + ${fr} = ${fb * fq + fr} = ${fa}`),
      ],
    };
  },
};

// ── 5. md4-verify  검산 역산 (fill-blanks)  난이도 2 ────────────────
const md4Verify: SkillDef = {
  id: 'md4-verify',
  unitId: 'unitMulDiv',
  difficulty: 2,
  title: '나눗셈 검산',
  note: '나눗셈 검산식 □ 채우기. 나누는 수×몫+나머지=나뉘는 수. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴 0: 나눗셈식 → 검산식에서 □ 채우기 (몫 구하기)
    // 패턴 1: 나눗셈식 → 나뉘는 수 구하기
    const pat = rng.int(0, 1);

    let a: number, b: number, q: number, r: number;
    b = 12; q = 7; r = 5; a = b * q + r;
    for (let tries = 0; tries < 200; tries++) {
      const tb = rng.int(11, 50);
      const tq = rng.int(2, 9);
      const tr = rng.int(1, tb - 1);
      const ta = tb * tq + tr;
      if (ta >= 100 && ta <= 999) { a = ta; b = tb; q = tq; r = tr; break; }
    }

    let expr: MathExpr;
    let answer: number;
    let explStr: string;

    if (pat === 0) {
      // 검산식에서 몫(□) 구하기: b × □ + r = a
      expr = [
        txt(`검산: ${b} × `),
        { kind: 'blank', slot: 0 },
        txt(` + ${r} = ${a}`),
      ];
      answer = q;
      explStr = `${b} × ${q} + ${r} = ${b * q} + ${r} = ${a}`;
    } else {
      // 나뉘는 수(□) 구하기: □ ÷ b = q … r → □ = b × q + r
      expr = [
        txt('□ ÷ '),
        txt(`${b} = ${q} 나머지 ${r} 일 때, □ = `),
        { kind: 'blank', slot: 0 },
      ];
      answer = a;
      explStr = `나누는 수 × 몫 + 나머지 = ${b} × ${q} + ${r} = ${a}`;
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '검산식을 이용하여 □에 알맞은 수를 구하세요.',
      expr,
      blankAnswers: [answer],
      explanation: [
        txt('검산은 (나누는 수) × (몫) + (나머지) = (나뉘는 수)로 확인해요.'),
        txt(explStr),
      ],
    };
  },
};

// ── 6. md4-word  곱셈·나눗셈 문장제 (fill-blanks)  난이도 3 ─────────
const md4Word: SkillDef = {
  id: 'md4-word',
  unitId: 'unitMulDiv',
  difficulty: 3,
  word: true,
  title: '곱셈·나눗셈 문장제',
  note: '(세 자리)×(두 자리) 또는 (세 자리)÷(두 자리) 모험 소재 문장제.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;
    let unit: string;

    if (pat === 0) {
      // (세 자리) × (두 자리) 곱셈 문장제
      let a = 120, b = 15, ans = 120 * 15;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(100, 300);
        const tb = rng.int(12, 30);
        const tans = ta * tb;
        if (tans >= 1 && tans <= 9999) { a = ta; b = tb; ans = tans; break; }
      }
      answer = ans;
      unit = '개';
      prompt = `성 안에 방이 ${a}개 있고, 방마다 보물이 ${b}개씩 있어요. 보물은 모두 몇 개인가요?`;
      explanation = [
        txt(`방 ${a}개에 보물이 ${b}개씩이니 곱셈으로 구해요.`),
        txt(`${a} × ${b} = ${ans}개.`),
      ];
    } else if (pat === 1) {
      // (세 자리) × (몇십) 곱셈 문장제
      const a = rng.int(100, 500);
      const b = rng.int(1, 9) * 10;
      answer = a * b;
      unit = '원';
      prompt = `마법 약 한 병에 ${a}원이에요. ${b}병을 사면 모두 얼마인가요?`;
      explanation = [
        txt(`한 병 ${a}원짜리 ${b}병이니 곱셈이에요.`),
        txt(`${a} × ${b} = ${answer}원.`),
      ];
    } else if (pat === 2) {
      // (세 자리) ÷ (두 자리) 나눗셈 문장제 (나누어떨어짐)
      const b = rng.int(11, 30);
      const q = rng.int(2, 9);
      const a = b * q;
      answer = q;
      unit = '명';
      const aCheck = a >= 100 && a <= 999 ? a : b * 5;
      const qCheck = aCheck / b;
      prompt = `모험대원 ${aCheck}명을 ${b}명씩 모둠으로 나누면 모둠이 몇 개인가요?`;
      explanation = [
        txt(`${aCheck}명을 ${b}명씩 묶으면 모둠 수는 나눗셈으로 구해요.`),
        txt(`${aCheck} ÷ ${b} = ${qCheck}개.`),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt,
        expr: [txt('답: '), { kind: 'blank', slot: 0 }, txt(' ' + unit)],
        blankAnswers: [qCheck],
        explanation,
      };
    } else {
      // (세 자리) ÷ (두 자리) 나머지 문장제
      const b = rng.int(11, 25);
      const q = rng.int(3, 9);
      const r = rng.int(1, b - 1);
      const a = b * q + r;
      const safeA = (a >= 100 && a <= 999) ? a : b * q + r;
      answer = q; // 몫(몇 모둠)
      unit = '모둠';
      prompt = `마법사가 ${safeA}개의 마나구슬을 ${b}개씩 상자에 담으려 해요. 상자 몇 개가 꽉 차고 ${r}개가 남나요?`;
      explanation = [
        txt(`${b}개씩 담으면 꽉 찬 상자 수는 몫, 남는 구슬은 나머지예요.`),
        txt(`${safeA} ÷ ${b} = ${q} 나머지 ${r}. 상자 ${q}개가 꽉 차요.`),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt,
        expr: [txt('꽉 찬 상자: '), { kind: 'blank', slot: 0 }, txt(' ' + unit)],
        blankAnswers: [q],
        explanation,
      };
    }

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
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitMulDivSkills: SkillDef[] = [
  md4MulTens,
  md4MulTwo,
  md4DivTens,
  md4DivTwo,
  md4Verify,
  md4Word,
];
