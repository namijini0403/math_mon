/**
 * 단원: 곱셈 (2022 개정교육과정 3-1 4단원)
 * 성취기준: (두 자리)×(한 자리) 올림 없음/있음, (몇십)×(몇),
 * 어림하여 곱 구하기, 문장제
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

/** (두 자리)×(한 자리)를 일의 자리·십의 자리 부분곱으로 나눠 설명한다. */
function mul2x1Explain(a: number, b: number): string {
  const tens = Math.floor(a / 10), ones = a % 10;
  const onesProd = ones * b;
  const tensProd = tens * b * 10;
  return `일의 자리: ${ones} × ${b} = ${onesProd}. 십의 자리: ${tens} × ${b} = ${tens * b}인데 자리값이 십이라 ${tensProd}이에요. 두 곱을 더하면 ${tensProd} + ${onesProd} = ${a * b}이에요.`;
}

// ── 1. mul31-no-carry  (두 자리)×(한 자리) 올림 없음 (fill-blanks) ───
const mul31NoCarry: SkillDef = {
  id: 'mul31-no-carry',
  unitId: 'unitMul31',
  difficulty: 1,
  title: '(두 자리)×(한 자리) 올림 없음',
  note: '각 자리의 곱이 9 이하 — 받아올림 없이 계산. fill-blanks.',
  minVariety: 30,
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number, ans: number;
    a = 12; b = 3; ans = 36;

    for (let tries = 0; tries < 300; tries++) {
      // 십의 자리 × b ≤ 9, 일의 자리 × b ≤ 9
      const tb = rng.int(2, 9);
      const tens = rng.int(1, Math.floor(9 / tb));
      const ones = rng.int(1, Math.floor(9 / tb));
      const ta = tens * 10 + ones;
      const tans = ta * tb;
      if (tans >= 10 && tans <= 99 && ta >= 11) {
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
      explanation: [txt(mul2x1Explain(a, b))],
    };
  },
};

// ── 2. mul31-carry  (두 자리)×(한 자리) 올림 있음 (fill-blanks) ────
const mul31Carry: SkillDef = {
  id: 'mul31-carry',
  unitId: 'unitMul31',
  difficulty: 2,
  title: '(두 자리)×(한 자리) 올림 있음',
  note: '적어도 한 자리의 곱이 10 이상 — 받아올림이 생김. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number, ans: number;
    a = 37; b = 4; ans = 148;

    for (let tries = 0; tries < 300; tries++) {
      const tb = rng.int(2, 9);
      const ta = rng.int(11, 99);
      const tens = Math.floor(ta / 10);
      const ones = ta % 10;
      // 최소 한 자리에서 받아올림 발생
      if (tens * tb < 10 && ones * tb < 10) continue;
      const tans = ta * tb;
      if (tans >= 10 && tans <= 999) {
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
      explanation: [txt(mul2x1Explain(a, b))],
    };
  },
};

// ── 3. mul31-tens  (몇십)×(몇) (fill-blanks) ─────────────────────
const mul31Tens: SkillDef = {
  id: 'mul31-tens',
  unitId: 'unitMul31',
  difficulty: 1,
  title: '(몇십)×(몇)',
  note: '십의 배수에 한 자리 수를 곱함. fill-blanks.',
  minVariety: 56,
  generate(seed) {
    const rng = new RNG(seed);
    // 몇십: 20~90, 몇: 2~9
    const a = rng.int(2, 9) * 10;
    const b = rng.int(2, 9);
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
      explanation: [txt(`${a}는 십이 ${a / 10}개예요. 먼저 ${a / 10} × ${b} = ${(a / 10) * b}을 구하고, 자리값이 십이라 10을 곱하면 ${ans}이에요.`)],
    };
  },
};

// ── 4. mul31-estimate  어림하여 곱 구하기 (choice) ────────────────
const mul31Estimate: SkillDef = {
  id: 'mul31-estimate',
  unitId: 'unitMul31',
  difficulty: 2,
  title: '어림하여 곱 구하기',
  note: '두 자리 수를 몇십으로 어림한 뒤 곱셈. 4지선다.',
  minVariety: 56,
  generate(seed) {
    const rng = new RNG(seed);
    // 두 자리 수 반올림 어림 후 × 한 자리
    // tens: 2~8, rem: 1~9 (십의 자리 딱 0·5 이외로 명확하게 방향 결정)
    const tens = rng.int(2, 8);
    const rem10 = rng.int(1, 9); // 십 단위 나머지의 십 자리 (1~9로 구분)
    const b = rng.int(2, 9);
    // rem10 < 5 → 내림, rem10 >= 5 → 올림
    const rounded = rem10 >= 5 ? (tens + 1) * 10 : tens * 10;
    const ans = rounded * b;

    // 오답 후보 4종: 반대 방향, +10×b, -10×b, +20×b — 값이 다른 3개 고르기
    const opposite = (rem10 >= 5 ? tens * 10 : (tens + 1) * 10) * b;
    const plus10 = (rounded + 10) * b;
    const minus10 = rounded > 10 ? (rounded - 10) * b : (rounded + 20) * b;
    const plus20 = (rounded + 20) * b;

    const seen = new Set<number>([ans]);
    const candidateVals: number[] = [];
    for (const v of [opposite, plus10, minus10, plus20]) {
      if (!seen.has(v) && v > 0) { seen.add(v); candidateVals.push(v); }
      if (candidateVals.length >= 3) break;
    }
    // 만약 3개 미만이면 앞에 이어 붙임
    let extra = ans + 10;
    while (candidateVals.length < 3) {
      if (!seen.has(extra)) { seen.add(extra); candidateVals.push(extra); }
      extra += 10;
    }

    const answerVal = txc(`${ans}`);
    const candidates: ChoiceValue[] = candidateVals.map((v) => txc(`${v}`));
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    // 실제 문제 숫자: 십의 자리 = tens, 일의 자리 = rem10 (예: tens=3, rem10=7 → 37)
    const aDisplay = tens * 10 + rem10;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${aDisplay}를 몇십으로 어림하여 ${aDisplay} × ${b}의 어림값을 구하세요.`,
      expr: [txt(`${aDisplay} × ${b} ≈ ?`)],
      choices,
      answerIndex,
      explanation: [txt(`${aDisplay}의 일의 자리가 ${rem10}이라 ${rem10 >= 5 ? '올림' : '버림'}하면 약 ${rounded}이에요. 어림한 ${rounded} × ${b} = ${ans}으로 어림해요.`)],
    };
  },
};

// ── 5. mul31-word  곱셈 문장제 (fill-blanks) ─────────────────────
const mul31Word: SkillDef = {
  id: 'mul31-word',
  unitId: 'unitMul31',
  difficulty: 3,
  word: true,
  title: '곱셈 문장제',
  note: '(두 자리)×(한 자리) 모험 소재 문장제. 소재 3가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let prompt: string;
    let a: number, b: number, ans: number;
    let unit: string;
    let explStr: string;

    if (pat === 0) {
      // 물건 × 묶음
      a = rng.int(11, 49);
      b = rng.int(2, 9);
      ans = a * b;
      unit = '개';
      prompt = `마법사가 마법 보석 ${a}개씩 ${b}봉지를 모았어요. 보석은 모두 몇 개인가요?`;
      explStr = `한 봉지에 ${a}개씩 ${b}봉지예요. ${a} × ${b} = ${ans}이라 모두 ${ans}개예요.`;
    } else if (pat === 1) {
      // 거리 × 횟수
      a = rng.int(12, 39);
      b = rng.int(2, 8);
      ans = a * b;
      unit = '걸음';
      prompt = `용사가 하루에 ${a}걸음씩 ${b}일 동안 걸었어요. 모두 몇 걸음인가요?`;
      explStr = `하루에 ${a}걸음씩 ${b}일이에요. ${a} × ${b} = ${ans}이라 모두 ${ans}걸음이에요.`;
    } else {
      // 가격 × 수량
      a = rng.int(10, 49) * 10;
      b = rng.int(2, 9);
      ans = a * b;
      unit = '원';
      prompt = `신비한 열매 한 개에 ${a}원이에요. ${b}개를 사면 얼마인가요?`;
      explStr = `한 개에 ${a}원짜리 ${b}개예요. ${a} × ${b} = ${ans}이라 ${ans}원이에요.`;
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
      explanation: [txt(explStr)],
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitMul31Skills: SkillDef[] = [
  mul31NoCarry,
  mul31Carry,
  mul31Tens,
  mul31Estimate,
  mul31Word,
];
