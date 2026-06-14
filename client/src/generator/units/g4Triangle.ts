/**
 * 단원: 삼각형 (2022 개정교육과정 4-2 2단원)
 * 성취기준: 이등변삼각형·정삼각형의 성질을 이해하고,
 *   예각·직각·둔각삼각형을 분류하며, 둘레를 구할 수 있다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. tri-isosceles-apex  이등변삼각형 꼭지각→밑각  난이도 1 ──────────
const triIsoscelesApex: SkillDef = {
  id: 'tri-isosceles-apex',
  unitId: 'unitTriangle',
  difficulty: 1,
  title: '이등변삼각형 꼭지각→밑각',
  note: '꼭지각이 주어졌을 때 밑각 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 꼭지각: apex, 밑각: base = (180 - apex) / 2
    // 밑각이 정수가 되려면 apex는 짝수
    let apex = 40, base = 70;
    for (let tries = 0; tries < 200; tries++) {
      const t = rng.int(10, 160);
      const tapex = t % 2 === 0 ? t : t - 1; // 짝수로
      const tbase = (180 - tapex) / 2;
      if (tapex >= 10 && tapex <= 160 && tbase >= 1 && Number.isInteger(tbase)) {
        apex = tapex; base = tbase; break;
      }
    }
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `이등변삼각형의 꼭지각이 ${apex}°일 때, 밑각은 몇 도인가요?`,
      expr: [txt(`꼭지각: ${apex}°, 밑각: `), { kind: 'blank', slot: 0 }, txt('°')],
      blankAnswers: [base],
      explanation: [
        txt(`이등변삼각형에서 두 밑각의 크기는 같아요. `),
        txt(`(180° − ${apex}°) ÷ 2 = ${180 - apex}° ÷ 2 = ${base}°`),
      ],
    };
  },
};

// ── 2. tri-isosceles-base  이등변삼각형 밑각→꼭지각  난이도 1 ──────────
const triIsoscelesBase: SkillDef = {
  id: 'tri-isosceles-base',
  unitId: 'unitTriangle',
  difficulty: 1,
  title: '이등변삼각형 밑각→꼭지각',
  note: '밑각이 주어졌을 때 꼭지각 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    let base = 55, apex = 70;
    for (let tries = 0; tries < 200; tries++) {
      const tb = rng.int(10, 89); // 밑각은 90° 미만 (둔각 삼각형이면 밑각이 둔각 불가)
      const tapex = 180 - 2 * tb;
      if (tapex >= 1 && tapex <= 178) { base = tb; apex = tapex; break; }
    }
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `이등변삼각형의 밑각이 ${base}°일 때, 꼭지각은 몇 도인가요?`,
      expr: [txt(`밑각: ${base}°, 꼭지각: `), { kind: 'blank', slot: 0 }, txt('°')],
      blankAnswers: [apex],
      explanation: [
        txt(`꼭지각 = 180° − 두 밑각의 합 = 180° − ${base}° × 2 = 180° − ${2 * base}° = ${apex}°`),
      ],
    };
  },
};

// ── 3. tri-equilateral  정삼각형 변·둘레  난이도 1 ───────────────────
const triEquilateral: SkillDef = {
  id: 'tri-equilateral',
  unitId: 'unitTriangle',
  difficulty: 1,
  title: '정삼각형 변·둘레',
  note: '변의 길이 또는 둘레 구하기. fill-blanks. minVariety: 30',
  minVariety: 30,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 변 → 둘레
      const side = rng.int(2, 20);
      const peri = side * 3;
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `정삼각형의 한 변의 길이가 ${side} cm일 때 둘레는 몇 cm인가요?`,
        expr: [txt(`한 변: ${side} cm, 둘레: `), { kind: 'blank', slot: 0 }, txt(' cm')],
        blankAnswers: [peri],
        explanation: [txt(`정삼각형은 세 변의 길이가 모두 같아요. ${side} × 3 = ${peri} cm`)],
      };
    } else {
      // 둘레 → 변
      const side = rng.int(2, 20);
      const peri = side * 3;
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `정삼각형의 둘레가 ${peri} cm일 때 한 변의 길이는 몇 cm인가요?`,
        expr: [txt(`둘레: ${peri} cm, 한 변: `), { kind: 'blank', slot: 0 }, txt(' cm')],
        blankAnswers: [side],
        explanation: [txt(`정삼각형 한 변 = 둘레 ÷ 3 = ${peri} ÷ 3 = ${side} cm`)],
      };
    }
  },
};

// ── 4. tri-classify  세 각으로 삼각형 분류 (choice)  난이도 2 ──────────
const triClassify: SkillDef = {
  id: 'tri-classify',
  unitId: 'unitTriangle',
  difficulty: 2,
  title: '삼각형 분류 (예각/직각/둔각)',
  note: '세 각이 주어질 때 삼각형 종류 고르기. 4지선다.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2); // 0: 예각, 1: 직각, 2: 둔각

    let a: number, b: number, c: number;
    let label: string;

    // 세 각을 모두 다르게(부등변) 만들어 '이등변삼각형' 보기와의 정답 모호성을 없앤다.
    if (pat === 0) {
      // 예각삼각형: 세 각 모두 90° 미만, 서로 다름
      a = 50; b = 60; c = 70;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 89);
        const tb = rng.int(30, 89);
        const tc = 180 - ta - tb;
        if (tc >= 1 && tc < 90 && ta !== tb && tb !== tc && ta !== tc) { a = ta; b = tb; c = tc; break; }
      }
      label = '예각삼각형';
    } else if (pat === 1) {
      // 직각삼각형: 한 각이 정확히 90°, 나머지 두 각은 서로 다름(45°,45° 제외)
      a = 90; b = 30; c = 60;
      for (let tries = 0; tries < 50; tries++) {
        const tb = rng.int(10, 80);
        if (tb !== 45) { b = tb; c = 90 - tb; break; }
      }
      label = '직각삼각형';
    } else {
      // 둔각삼각형: 한 각이 90° 초과, 나머지 두 각은 서로 다름
      a = 100; b = 30; c = 50;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(91, 150);
        const tb = rng.int(10, 180 - ta - 1);
        const tc = 180 - ta - tb;
        if (tc >= 1 && tb !== tc) { a = ta; b = tb; c = tc; break; }
      }
      label = '둔각삼각형';
    }

    const allLabels = ['예각삼각형', '직각삼각형', '둔각삼각형', '이등변삼각형'];
    const answerVal = txc(label);
    const candidates = allLabels.filter((l) => l !== label).map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    const explain =
      pat === 0 ? '세 각이 모두 90° 미만이므로 예각삼각형이에요.'
      : pat === 1 ? '한 각이 90°이므로 직각삼각형이에요.'
      : `${a}°가 90°보다 크므로 둔각삼각형이에요.`;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `세 각이 ${a}°, ${b}°, ${c}°인 삼각형은 어떤 삼각형인가요?`,
      expr: [txt(`${a}°, ${b}°, ${c}°`)],
      choices,
      answerIndex,
      explanation: [txt(explain)],
    };
  },
};

// ── 5. tri-perimeter-inv  이등변 둘레에서 변 역산  난이도 2 ─────────────
const triPerimeterInv: SkillDef = {
  id: 'tri-perimeter-inv',
  unitId: 'unitTriangle',
  difficulty: 2,
  title: '이등변삼각형 둘레에서 변 역산',
  note: '둘레와 한 변이 주어질 때 나머지 변 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 같은 두 변(이등변)이 미지수, 밑변 주어짐
      const base = rng.int(3, 15);
      const side = rng.int(3, 20);
      const peri = 2 * side + base;
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `이등변삼각형의 둘레가 ${peri} cm이고 밑변이 ${base} cm일 때, 같은 두 변의 길이는 각각 몇 cm인가요?`,
        expr: [txt(`같은 두 변: `), { kind: 'blank', slot: 0 }, txt(' cm')],
        blankAnswers: [side],
        explanation: [
          txt(`(둘레 − 밑변) ÷ 2 = (${peri} − ${base}) ÷ 2 = ${peri - base} ÷ 2 = ${side} cm`),
        ],
      };
    } else {
      // 밑변이 미지수, 같은 두 변 주어짐
      const side = rng.int(4, 20);
      const base = rng.int(2, side * 2 - 1); // 삼각 부등식: base < 2*side
      // base는 1 이상이어야 하고, 2*side > base
      const peri = 2 * side + base;
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `이등변삼각형의 둘레가 ${peri} cm이고 같은 두 변의 길이가 각각 ${side} cm일 때, 밑변의 길이는 몇 cm인가요?`,
        expr: [txt(`밑변: `), { kind: 'blank', slot: 0 }, txt(' cm')],
        blankAnswers: [base],
        explanation: [
          txt(`밑변 = 둘레 − 같은 두 변 × 2 = ${peri} − ${side} × 2 = ${peri} − ${side * 2} = ${base} cm`),
        ],
      };
    }
  },
};

// ── 6. tri-word  문장제  난이도 3 ────────────────────────────────────
const triWord: SkillDef = {
  id: 'tri-word',
  unitId: 'unitTriangle',
  difficulty: 3,
  word: true,
  title: '삼각형 문장제',
  note: '이등변/정삼각형/분류 소재 모험 문장제. 소재 4가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 이등변삼각형 꼭지각 → 밑각
      let apex = 80, base = 50;
      for (let tries = 0; tries < 200; tries++) {
        const t = rng.int(20, 160);
        const ta = t % 2 === 0 ? t : t - 1;
        const tb = (180 - ta) / 2;
        if (ta >= 20 && ta <= 140 && Number.isInteger(tb) && tb >= 1) {
          apex = ta; base = tb; break;
        }
      }
      answer = base;
      prompt = `나비 마을의 삼각형 깃발은 이등변삼각형 모양이에요. 꼭지각이 ${apex}°라면 밑각은 몇 도인가요?`;
      explanation = [txt(`(180° − ${apex}°) ÷ 2 = ${180 - apex}° ÷ 2 = ${base}°`)];
    } else if (pat === 1) {
      // 정삼각형 둘레
      const side = rng.int(4, 25);
      answer = side * 3;
      prompt = `마법사의 삼각형 마법진은 정삼각형 모양이에요. 한 변의 길이가 ${side} cm라면 둘레는 몇 cm인가요?`;
      explanation = [txt(`정삼각형 둘레 = ${side} × 3 = ${answer} cm`)];
    } else if (pat === 2) {
      // 이등변삼각형 둘레에서 변 역산
      const side = rng.int(5, 20);
      const base = rng.int(2, Math.min(side * 2 - 1, 20));
      const peri = 2 * side + base;
      answer = side;
      prompt = `삼각형 요새의 울타리는 이등변삼각형 모양이에요. 둘레가 ${peri} cm이고 밑변이 ${base} cm라면, 같은 두 변의 길이는 각각 몇 cm인가요?`;
      explanation = [txt(`(${peri} − ${base}) ÷ 2 = ${peri - base} ÷ 2 = ${side} cm`)];
    } else {
      // 삼각형 나머지 각 (이등변, 밑각 → 꼭지각)
      let base = 50, apex = 80;
      for (let tries = 0; tries < 200; tries++) {
        const tb = rng.int(10, 89);
        const ta = 180 - 2 * tb;
        if (ta >= 1 && ta < 180) { base = tb; apex = ta; break; }
      }
      answer = apex;
      prompt = `탐험대 깃발은 이등변삼각형 모양이에요. 아래 두 각이 모두 ${base}°라면, 꼭대기 각(꼭지각)은 몇 도인가요?`;
      explanation = [txt(`꼭지각 = 180° − ${base}° × 2 = ${apex}°`)];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr: [txt('답: '), { kind: 'blank', slot: 0 }],
      blankAnswers: [answer],
      explanation,
    };
  },
};

export const unitTriangleSkills: SkillDef[] = [
  triIsoscelesApex,
  triIsoscelesBase,
  triEquilateral,
  triClassify,
  triPerimeterInv,
  triWord,
];
