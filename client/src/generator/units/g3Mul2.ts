/**
 * 단원: 곱셈 (2022 개정교육과정 3-2 1단원)
 * 성취기준: (세 자리)×(한 자리), (몇십)×(몇십), (두 자리)×(두 자리), 문장제
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. mul32-3by1  (세 자리)×(한 자리) (fill-blanks) ───────────────
const mul32ThreeByOne: SkillDef = {
  id: 'mul32-3by1',
  unitId: 'unitMul32',
  difficulty: 1,
  title: '(세 자리)×(한 자리)',
  note: '세 자리 수 × 한 자리 수. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number, ans: number;
    a = 123; b = 3; ans = 369;

    for (let tries = 0; tries < 300; tries++) {
      const tb = rng.int(2, 9);
      const ta = rng.int(101, 399);
      const tans = ta * tb;
      if (tans >= 100 && tans <= 9999) {
        a = ta; b = tb; ans = tans; break;
      }
    }

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
      explanation: [txt(`${a} × ${b} = ${ans}. 각 자리를 따로 곱한 뒤 더해요.`)],
    };
  },
};

// ── 2. mul32-tens-tens  (몇십)×(몇십) (fill-blanks) ────────────────
const mul32TensTens: SkillDef = {
  id: 'mul32-tens-tens',
  unitId: 'unitMul32',
  difficulty: 1,
  title: '(몇십)×(몇십)',
  note: '십의 배수 × 십의 배수. fill-blanks.',
  minVariety: 56,
  generate(seed) {
    const rng = new RNG(seed);
    const a = rng.int(2, 9) * 10;
    const b = rng.int(2, 9) * 10;
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
      explanation: [txt(`${a} × ${b} = ${a / 10} × ${b / 10} × 100 = ${(a / 10) * (b / 10)} × 100 = ${ans}`)],
    };
  },
};

// ── 3. mul32-2by2  (두 자리)×(두 자리) (fill-blanks) ───────────────
const mul32TwoByTwo: SkillDef = {
  id: 'mul32-2by2',
  unitId: 'unitMul32',
  difficulty: 2,
  title: '(두 자리)×(두 자리)',
  note: '두 자리 수 × 두 자리 수. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number, ans: number;
    a = 23; b = 14; ans = 322;

    for (let tries = 0; tries < 300; tries++) {
      const ta = rng.int(11, 49);
      const tb = rng.int(11, 49);
      const tans = ta * tb;
      if (tans >= 100 && tans <= 2401) {
        a = ta; b = tb; ans = tans; break;
      }
    }

    const expr: MathExpr = [
      txt(`${a} × ${b} = `),
      { kind: 'blank', slot: 0 },
    ];

    // 세로셈 설명: a × b의 일의 자리, 십의 자리 분해
    const bOnes = b % 10;
    const bTens = Math.floor(b / 10);
    const partial1 = a * bOnes;
    const partial2 = a * bTens * 10;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation: [txt(`${a} × ${b} = ${a} × ${bOnes} + ${a} × ${bTens * 10} = ${partial1} + ${partial2} = ${ans}`)],
    };
  },
};

// ── 4. mul32-word  곱셈 문장제 (fill-blanks) ────────────────────────
const mul32Word: SkillDef = {
  id: 'mul32-word',
  unitId: 'unitMul32',
  difficulty: 3,
  word: true,
  title: '곱셈 문장제',
  note: '세 자리×한 자리 또는 두 자리×두 자리 모험 소재 문장제. 소재 3가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let prompt: string;
    let a: number, b: number, ans: number;
    let unit: string;

    if (pat === 0) {
      // (세 자리) × (한 자리)
      a = rng.int(101, 299);
      b = rng.int(2, 9);
      ans = a * b;
      unit = '개';
      prompt = `마법사가 보물 상자 ${b}개를 열었어요. 상자마다 마법 수정이 ${a}개 들어 있어요. 마법 수정은 모두 몇 개인가요?`;
    } else if (pat === 1) {
      // (몇십) × (몇십)
      a = rng.int(2, 9) * 10;
      b = rng.int(2, 9) * 10;
      ans = a * b;
      unit = '걸음';
      prompt = `용사가 하루에 ${a}걸음씩 ${b}일 동안 걸었어요. 모두 몇 걸음인가요?`;
    } else {
      // (두 자리) × (두 자리)
      a = rng.int(11, 39);
      b = rng.int(11, 39);
      ans = a * b;
      unit = '원';
      prompt = `별빛 열매 한 봉지에 ${a}원이에요. ${b}봉지를 사면 얼마인가요?`;
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
      blankAnswers: [ans],
      explanation: [txt(`${a} × ${b} = ${ans}`)],
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitMul32Skills: SkillDef[] = [
  mul32ThreeByOne,
  mul32TensTens,
  mul32TwoByTwo,
  mul32Word,
];
