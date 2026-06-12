/**
 * 단원: 소수의 덧셈과 뺄셈 (2022 개정교육과정 4-2 3단원)
 * 성취기준: 소수 두·세 자리 수의 자릿값을 알고, 소수의 덧셈과 뺄셈을 할 수 있다.
 *   decimal-input 형식, ×100/×1000 정수 스케일 계산.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const dec = (v: number): ChoiceValue => ({ kind: 'decimal', v });

/** 소수 두 자리 랜덤 생성 (1~99 사이 정수 / 100). 끝자리 0 허용 */
function randDec2(rng: RNG, min = 1, max = 99): number {
  return rng.int(min, max);
}

/** 소수 세 자리 랜덤 생성 (1~999 사이 정수 / 1000). 끝자리 0 허용 */
function randDec3(rng: RNG, min = 1, max = 999): number {
  return rng.int(min, max);
}

// ── 1. dec4-placevalue  자릿값 (특정 자리 숫자가 나타내는 값)  난이도 1 ──
const dec4PlaceValue: SkillDef = {
  id: 'dec4-placevalue',
  unitId: 'unitDecAS',
  difficulty: 1,
  title: '소수 자릿값',
  note: '소수 두·세 자리에서 특정 자리의 숫자가 나타내는 값. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const isThree = rng.chance(0.5); // 소수 세 자리 여부

    // 정수 스케일로 생성
    // 소수 두 자리: intV / 100, 소수 세 자리: intV / 1000
    // 각 자리 숫자가 1~9이어야 의미 있음 (0이면 나타내는 값이 0)
    let displayStr: string;

    if (!isThree) {
      // 소수 두 자리 x.yz (1~9의 숫자 포함 보장)
      let tens = 0, ones = 0, tenths = 0, hundredths = 0;
      for (let tries = 0; tries < 200; tries++) {
        tens = rng.int(0, 9);
        ones = rng.int(0, 9);
        tenths = rng.int(1, 9); // 소수 첫째 자리 (0이면 0.0x가 되어 소수 한 자리처럼 보임)
        hundredths = rng.int(1, 9);
        const intV = tens * 1000 + ones * 100 + tenths * 10 + hundredths;
        if (intV > 0) break;
      }
      // 표시값: xx.yy
      const wholeN = tens * 10 + ones;
      displayStr = `${wholeN}.${tenths}${hundredths}`;
      // 답은 정수로 표현해야 함 → 이 스킬은 fill-blanks, blankAnswers는 양의 정수
      // "0.1이 몇 개" 형태로 질문 → 답 = 해당 자리 숫자
      const placeIdx = rng.int(0, 1);
      const placeDigit = placeIdx === 0 ? tenths : hundredths;
      const placeName = placeIdx === 0 ? '소수 첫째' : '소수 둘째';
      const unitName = placeIdx === 0 ? '0.1' : '0.01';
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${displayStr}에서 ${placeName} 자리 숫자가 나타내는 값은 ${unitName}이 몇 개인가요?`,
        expr: [
          txt(`${displayStr}의 ${placeName} 자리 숫자가 나타내는 값: `),
          { kind: 'blank', slot: 0 },
          txt(` 개`),
        ],
        blankAnswers: [placeDigit],
        explanation: [
          txt(`${displayStr}의 ${placeName} 자리 숫자는 ${placeDigit}이에요. `),
          txt(`${placeDigit} × ${unitName} = ${(placeDigit * parseFloat(unitName)).toFixed(placeIdx + 1)}`),
        ],
      };
    } else {
      // 소수 세 자리 x.yzw — 모든 자리 숫자 1~9 (답이 0이 되면 안 됨)
      let ones = 1, tenths = 1, hundredths = 1, thousandths = 1;
      for (let tries = 0; tries < 200; tries++) {
        ones = rng.int(1, 9);
        tenths = rng.int(1, 9);
        hundredths = rng.int(1, 9);
        thousandths = rng.int(1, 9);
        break; // 항상 유효
      }
      displayStr = `${ones}.${tenths}${hundredths}${thousandths}`;
      const placeIdx = rng.int(0, 2); // 0: 소수 첫째, 1: 소수 둘째, 2: 소수 셋째
      const placeDigits = [tenths, hundredths, thousandths];
      const placeNames = ['소수 첫째', '소수 둘째', '소수 셋째'];
      const unitNames = ['0.1', '0.01', '0.001'];
      const placeDigit = placeDigits[placeIdx];
      const placeName = placeNames[placeIdx];
      const unitName = unitNames[placeIdx];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${displayStr}에서 ${placeName} 자리 숫자가 나타내는 값은 ${unitName}이 몇 개인가요?`,
        expr: [
          txt(`${displayStr}의 ${placeName} 자리 숫자가 나타내는 값: `),
          { kind: 'blank', slot: 0 },
          txt(` 개`),
        ],
        blankAnswers: [placeDigit],
        explanation: [
          txt(`${displayStr}의 ${placeName} 자리 숫자는 ${placeDigit}이에요. `),
          txt(`${placeDigit} × ${unitName} = ${(placeDigit * parseFloat(unitName)).toFixed(placeIdx + 1)}`),
        ],
      };
    }
  },
};

// ── 2. dec4-compare  소수 크기 비교 (comparison)  난이도 1 ─────────────
const dec4Compare: SkillDef = {
  id: 'dec4-compare',
  unitId: 'unitDecAS',
  difficulty: 1,
  title: '소수 크기 비교',
  note: '두 소수의 크기 비교. comparison 형식.',
  generate(seed) {
    const rng = new RNG(seed);
    // 두 소수를 정수 스케일로 생성
    const pat = rng.int(0, 2);

    let aInt: number, bInt: number, scale: number;

    if (pat === 0) {
      // 소수 두 자리끼리
      scale = 100;
      aInt = randDec2(rng, 10, 99);
      bInt = randDec2(rng, 10, 99);
      while (bInt === aInt) bInt = randDec2(rng, 10, 99);
    } else if (pat === 1) {
      // 소수 세 자리끼리
      scale = 1000;
      aInt = randDec3(rng, 100, 999);
      bInt = randDec3(rng, 100, 999);
      while (bInt === aInt) bInt = randDec3(rng, 100, 999);
    } else {
      // 소수 두 자리 vs 세 자리 (같은 정수 부분)
      scale = 1000;
      const wholeA = rng.int(1, 9);
      const fractA = randDec2(rng, 10, 99); // × 10 → 천분의 자리
      const fractB = randDec3(rng, 100, 999);
      aInt = wholeA * 1000 + fractA * 10;
      bInt = wholeA * 1000 + fractB;
      while (bInt === aInt) bInt = wholeA * 1000 + randDec3(rng, 100, 999);
    }

    const a = aInt / scale;
    const b = bInt / scale;
    const answer: '<' | '>' | '=' = aInt < bInt ? '<' : aInt > bInt ? '>' : '=';

    // 소수점 표시 (자릿수 유지)
    const places = scale === 100 ? 2 : 3;
    const aStr = a.toFixed(places).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    const bStr = b.toFixed(places).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '두 소수의 크기를 비교하세요.',
      left: [{ kind: 'decimal', v: a }],
      right: [{ kind: 'decimal', v: b }],
      answer,
      explanation: [
        txt(`소수는 자연수처럼 큰 자리부터 비교해요. `),
        txt(`${aStr} ${answer} ${bStr}`),
      ],
    };
  },
};

// ── 3. dec4-add  소수 덧셈 (decimal-input)  난이도 2 ────────────────
const dec4Add: SkillDef = {
  id: 'dec4-add',
  unitId: 'unitDecAS',
  difficulty: 2,
  title: '소수의 덧셈',
  note: '소수 두·세 자리 덧셈. 정수 스케일 계산. decimal-input.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let aInt: number, bInt: number, scale: number, aStr: string, bStr: string;

    if (pat === 0) {
      // 소수 두 자리 + 소수 두 자리
      scale = 100;
      aInt = randDec2(rng, 11, 89); // 0.11~0.89
      bInt = randDec2(rng, 11, 89);
      // 합이 10 이하이어야 answer×10000이 정수 조건
      while (aInt + bInt > 900) { bInt = randDec2(rng, 11, 89); }
      aStr = (aInt / scale).toFixed(2);
      bStr = (bInt / scale).toFixed(2);
    } else if (pat === 1) {
      // 소수 세 자리 + 소수 세 자리
      scale = 1000;
      aInt = randDec3(rng, 111, 899);
      bInt = randDec3(rng, 111, 899);
      while (aInt + bInt > 9000) { bInt = randDec3(rng, 111, 899); }
      aStr = (aInt / scale).toFixed(3);
      bStr = (bInt / scale).toFixed(3);
    } else {
      // 소수 두 자리 + 소수 세 자리
      scale = 1000;
      const rawA = randDec2(rng, 11, 89);
      aInt = rawA * 10; // 소수 두 자리 → 천분으로 환산
      bInt = randDec3(rng, 111, 899);
      while (aInt + bInt > 9000) { bInt = randDec3(rng, 111, 899); }
      aStr = (rawA / 100).toFixed(2);
      bStr = (bInt / scale).toFixed(3);
    }

    const sumInt = aInt + bInt;
    const answer = sumInt / scale; // ×10000 정수이어야 하는 조건 (scale 100이면 ×10000은 ×100 정수)

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${aStr} + ${bStr}`)],
      answer,
      explanation: [
        txt(`소수점 자리를 맞추어 자연수처럼 더해요. `),
        txt(`${aStr} + ${bStr} = ${answer.toFixed(scale === 100 ? 2 : 3)}`),
      ],
    };
  },
};

// ── 4. dec4-sub  소수 뺄셈 (decimal-input)  난이도 2 ────────────────
const dec4Sub: SkillDef = {
  id: 'dec4-sub',
  unitId: 'unitDecAS',
  difficulty: 2,
  title: '소수의 뺄셈',
  note: '소수 두·세 자리 뺄셈 (a > b 보장). 정수 스케일 계산.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let aInt: number, bInt: number, scale: number, aStr: string, bStr: string;

    if (pat === 0) {
      scale = 100;
      aInt = randDec2(rng, 30, 99);
      bInt = randDec2(rng, 11, aInt - 1);
      aStr = (aInt / scale).toFixed(2);
      bStr = (bInt / scale).toFixed(2);
    } else if (pat === 1) {
      scale = 1000;
      aInt = randDec3(rng, 300, 999);
      bInt = randDec3(rng, 111, aInt - 1);
      aStr = (aInt / scale).toFixed(3);
      bStr = (bInt / scale).toFixed(3);
    } else {
      // 정수 부분 포함 뺄셈: x.xx - y.yy (x > y 보장)
      scale = 100;
      const aWhole = rng.int(2, 9);
      const aFrac = randDec2(rng, 11, 99);
      const bWhole = rng.int(0, aWhole - 1);
      const bFrac = randDec2(rng, 11, 99);
      aInt = aWhole * 100 + aFrac;
      bInt = bWhole * 100 + bFrac;
      if (aInt <= bInt) { bInt = aWhole * 100 - 10; }
      aStr = (aInt / scale).toFixed(2);
      bStr = (bInt / scale).toFixed(2);
    }

    const diffInt = aInt - bInt;
    const answer = diffInt / scale;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${aStr} - ${bStr}`)],
      answer,
      explanation: [
        txt(`소수점 자리를 맞추어 자연수처럼 빼요. `),
        txt(`${aStr} - ${bStr} = ${answer.toFixed(scale === 100 ? 2 : 3)}`),
      ],
    };
  },
};

// ── 5. dec4-scale  10배·100배·1/10 관계  난이도 2 ────────────────────
const dec4Scale: SkillDef = {
  id: 'dec4-scale',
  unitId: 'unitDecAS',
  difficulty: 2,
  title: '소수 10배·1/10 관계',
  note: '소수를 10배/100배 하거나 1/10로 하는 값 구하기. fill-blanks+choice.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    if (pat === 0) {
      // 소수 두 자리 × 10 = ? → choice
      const baseInt = randDec2(rng, 12, 98);
      const base = baseInt / 100;
      const result = baseInt / 10; // ×10 → 소수 한 자리
      const baseStr = base.toFixed(2);
      const rightAnswer = dec(result);
      const candidates: ChoiceValue[] = [
        dec(result * 10),        // ×100 (오개념)
        dec(result / 10),        // ×1 (오개념: 움직이지 않음)
        dec(result + 0.1),       // 계산 오류
        dec(Math.max(0.01, result - 0.1)), // 계산 오류
      ];
      const { choices, answerIndex } = buildChoices(rightAnswer, candidates, rng);
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'choice',
        prompt: `${baseStr}의 10배는 얼마인가요?`,
        expr: [txt(`${baseStr} × 10`)],
        choices,
        answerIndex,
        explanation: [
          txt(`소수에 10을 곱하면 소수점이 오른쪽으로 한 칸 이동해요. `),
          txt(`${baseStr} × 10 = ${result.toFixed(1).replace(/\.0$/, '')}`),
        ],
      };
    } else if (pat === 1) {
      // 소수 한 자리의 1/10 = ? → choice
      const baseInt = randDec2(rng, 10, 99);
      const base = baseInt / 10; // 소수 한 자리
      const baseStr = base.toFixed(1);
      const result = baseInt / 100; // ÷10
      const resultStr = result.toFixed(2);
      const rightAnswer = dec(result);
      const candidates: ChoiceValue[] = [
        dec(base * 10),          // ×10 (오개념: 반대)
        dec((baseInt + 1) / 100),
        dec(Math.max(0.01, (baseInt - 1) / 100)),
        dec(base),               // 그대로 (오개념)
      ];
      const { choices, answerIndex } = buildChoices(rightAnswer, candidates, rng);
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'choice',
        prompt: `${baseStr}의 1/10은 얼마인가요?`,
        expr: [txt(`${baseStr}의 1/10`)],
        choices,
        answerIndex,
        explanation: [
          txt(`소수를 1/10로 하면 소수점이 왼쪽으로 한 칸 이동해요. `),
          txt(`${baseStr} × (1/10) = ${resultStr}`),
        ],
      };
    } else {
      // 소수 세 자리 × 100 = ? → choice
      const baseInt = randDec3(rng, 101, 999);
      const base = baseInt / 1000; // 소수 세 자리
      const result = baseInt / 10; // ×100 → 소수 한 자리
      const baseStr = base.toFixed(3);
      const rightAnswer = dec(result);
      const candidates: ChoiceValue[] = [
        dec(result * 10),        // ×1000 (오개념)
        dec(result / 10),        // ×10 (오개념)
        dec(result + 0.1),       // 계산 오류
        dec(Math.max(0.01, result - 0.1)), // 계산 오류
      ];
      const { choices, answerIndex } = buildChoices(rightAnswer, candidates, rng);
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'choice',
        prompt: `${baseStr}의 100배는 얼마인가요?`,
        expr: [txt(`${baseStr} × 100`)],
        choices,
        answerIndex,
        explanation: [
          txt(`100배를 하면 소수점이 오른쪽으로 두 칸 이동해요. `),
          txt(`${baseStr} × 100 = ${result.toFixed(1).replace(/\.0$/, '')}`),
        ],
      };
    }
  },
};

// ── 6. dec4-word  문장제  난이도 3 ──────────────────────────────────
const dec4Word: SkillDef = {
  id: 'dec4-word',
  unitId: 'unitDecAS',
  difficulty: 3,
  word: true,
  title: '소수 덧뺄셈 문장제',
  note: '소수 덧뺄셈 모험 소재 문장제. 소재 4가지. decimal-input.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let aInt: number, bInt: number, scale: number;
    let prompt: string, unit: string;
    let isAdd: boolean;

    if (pat === 0) {
      // 덧셈 (소수 두 자리)
      scale = 100;
      aInt = randDec2(rng, 15, 80);
      bInt = randDec2(rng, 15, 80);
      while (aInt + bInt > 900) bInt = randDec2(rng, 15, 50);
      isAdd = true;
      unit = 'km';
      const aStr = (aInt / scale).toFixed(2);
      const bStr = (bInt / scale).toFixed(2);
      prompt = `모험가가 오전에 ${aStr} km를 걷고, 오후에 ${bStr} km를 더 걸었어요. 오늘 모두 몇 km를 걸었나요?`;
    } else if (pat === 1) {
      // 뺄셈 (소수 두 자리)
      scale = 100;
      aInt = randDec2(rng, 50, 99);
      bInt = randDec2(rng, 11, aInt - 5);
      isAdd = false;
      unit = 'L';
      const aStr = (aInt / scale).toFixed(2);
      const bStr = (bInt / scale).toFixed(2);
      prompt = `마법 물약이 ${aStr} L 있었는데, 탐험 중에 ${bStr} L를 사용했어요. 남은 물약은 몇 L인가요?`;
    } else if (pat === 2) {
      // 소수 세 자리 덧셈
      scale = 1000;
      aInt = randDec3(rng, 120, 800);
      bInt = randDec3(rng, 120, 800);
      while (aInt + bInt > 9000) bInt = randDec3(rng, 120, 500);
      isAdd = true;
      unit = 'kg';
      const aStr = (aInt / scale).toFixed(3);
      const bStr = (bInt / scale).toFixed(3);
      prompt = `요정이 마법 열매를 ${aStr} kg 따고, 파트너 요정이 ${bStr} kg을 더 따왔어요. 모두 몇 kg을 땄나요?`;
    } else {
      // 소수 세 자리 뺄셈
      scale = 1000;
      aInt = randDec3(rng, 500, 999);
      bInt = randDec3(rng, 111, aInt - 10);
      isAdd = false;
      unit = 'm';
      const aStr = (aInt / scale).toFixed(3);
      const bStr = (bInt / scale).toFixed(3);
      prompt = `용의 동굴 입구에서 보물까지 ${aStr} m인데, 이미 ${bStr} m를 걸어왔어요. 남은 거리는 몇 m인가요?`;
    }

    const resultInt = isAdd ? aInt + bInt : aInt - bInt;
    const answer = resultInt / scale;
    const aDisp = (aInt / scale).toFixed(scale === 100 ? 2 : 3);
    const bDisp = (bInt / scale).toFixed(scale === 100 ? 2 : 3);
    const ansDisp = answer.toFixed(scale === 100 ? 2 : 3);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `답을 구하세요. (단위: ${unit})`,
      expr: [txt(prompt)],
      answer,
      unit,
      explanation: [
        txt(`${aDisp} ${isAdd ? '+' : '-'} ${bDisp} = ${ansDisp} ${unit}`),
      ],
    };
  },
};

export const unitDecASSkills: SkillDef[] = [
  dec4PlaceValue,
  dec4Compare,
  dec4Add,
  dec4Sub,
  dec4Scale,
  dec4Word,
];
