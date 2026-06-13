/**
 * 단원: 길이 재기 (2022 개정교육과정 2-1 4단원)
 * 성취기준: cm 단위로 길이를 읽고 쓰며, 임의 단위(뼘·연필 등)로 길이를 재고,
 * 길이를 어림하고 비교할 수 있다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. len2-cm  cm 읽기·쓰기 (fill-blanks)  난이도 1 ────────────────────────
const len2Cm: SkillDef = {
  id: 'len2-cm',
  unitId: 'unitLength2',
  difficulty: 1,
  title: 'cm 읽기·쓰기',
  note: 'cm 단위 길이를 서술로 읽거나 숫자로 쓰기. fill-blanks. 1~30cm.',
  minVariety: 30,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const cm = rng.int(1, 30);

    if (pat === 0) {
      // cm 값 → 몇 cm
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt(' cm')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `자로 재었더니 ${cm} 센티미터예요. 숫자로 쓰면 몇 cm인가요?`,
        expr,
        blankAnswers: [cm],
        explanation: [txt(`'센티미터'는 'cm'로 써요. 그래서 ${cm} 센티미터는 ${cm} cm예요.`)],
      };
    } else {
      // 두 길이 합
      const a = rng.int(1, 15);
      const b = rng.int(1, 15);
      const ans = a + b;
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt(' cm')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `연필의 길이가 ${a} cm이고 자의 길이가 ${b} cm예요. 두 길이의 합은 몇 cm인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`두 길이를 더해요. ${a} + ${b} = ${ans}이라서 ${ans} cm예요.`)],
      };
    }
  },
};

// ── 2. len2-unit  임의 단위 세기 (fill-blanks)  난이도 1 ────────────────────
const UNIT_TOOLS = [
  { name: '뼘', emoji: '✋' },
  { name: '연필', emoji: '✏️' },
  { name: '클립', emoji: '📎' },
  { name: '지우개', emoji: '🔲' },
] as const;

const len2Unit: SkillDef = {
  id: 'len2-unit',
  unitId: 'unitLength2',
  difficulty: 1,
  title: '임의 단위 세기',
  note: '뼘·연필 등 임의 단위로 몇 번인지 세기. fill-blanks.',
  minVariety: 32,
  generate(seed) {
    const rng = new RNG(seed);
    const tool = rng.pick(UNIT_TOOLS);
    const count = rng.int(2, 9);
    const OBJECTS = ['책상', '교실 문', '칠판', '복도', '창문', '책상 서랍'];
    const obj = rng.pick(OBJECTS);
    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('번')];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${tool.emoji} ${obj}의 길이를 ${tool.name}으로 재었더니 ${tool.name}이 딱 ${count}번이었어요. ${tool.name}으로 재면 몇 번인가요?`,
      expr,
      blankAnswers: [count],
      explanation: [txt(`${tool.name}으로 재면 ${count}번이에요.`)],
    };
  },
};

// ── 3. len2-compare  길이 비교 (choice)  난이도 2 ────────────────────────────
const len2Compare: SkillDef = {
  id: 'len2-compare',
  unitId: 'unitLength2',
  difficulty: 2,
  title: '길이 어림·비교',
  note: '두 길이 중 어느 것이 더 긴지 choice. 또는 단위가 다른 비교.',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 두 cm 값 비교
      let a = 10, b = 15;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(3, 28);
        const tb = rng.int(3, 28);
        if (ta !== tb) { a = ta; b = tb; break; }
      }
      const longer = a > b ? 'A' : 'B';
      const answerVal = txc(`${longer}가 더 길어요`);
      const other = longer === 'A' ? 'B' : 'A';
      const cands = [
        txc(`${other}가 더 길어요`),
        txc('같아요'),
        txc('알 수 없어요'),
      ];
      const { choices, answerIndex } = buildChoices(answerVal, cands, rng);
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'choice',
        prompt: `A의 길이는 ${a} cm이고 B의 길이는 ${b} cm예요. 어느 것이 더 긴가요?`,
        choices,
        answerIndex,
        explanation: [txt(`A는 ${a} cm, B는 ${b} cm예요. ${Math.max(a, b)} cm가 ${Math.min(a, b)} cm보다 더 기니까 ${longer}가 더 길어요.`)],
      };
    } else {
      // 같은 물건, 다른 임의 단위로 쟀을 때 — 단위가 클수록 횟수가 적다
      const count1 = rng.int(3, 6);
      const count2 = rng.int(8, 15);
      // 뼘 단위가 클립보다 크므로 뼘 횟수 < 클립 횟수
      const answerVal = txc('뼘이 더 커요');
      const cands = [txc('클립이 더 커요'), txc('같아요'), txc('알 수 없어요')];
      const { choices, answerIndex } = buildChoices(answerVal, cands, rng);
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'choice',
        prompt: `같은 물건을 뼘으로 재니 ${count1}번, 클립으로 재니 ${count2}번이었어요. 뼘과 클립 중 어느 단위가 더 큰가요?`,
        choices,
        answerIndex,
        explanation: [txt(`횟수가 더 적은 뼘(${count1}번)의 단위가 더 커요. 단위가 클수록 횟수는 줄어들어요.`)],
      };
    }
  },
};

// ── 4. len2-word  문장제 (fill-blanks)  난이도 2 ────────────────────────────
const len2Word: SkillDef = {
  id: 'len2-word',
  unitId: 'unitLength2',
  difficulty: 2,
  word: true,
  title: '길이 재기 문장제',
  note: 'cm 길이 덧뺄셈 문장제. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const OBJECTS2 = ['연필', '리본', '막대', '끈', '색종이', '빨대'];
    const obj = rng.pick(OBJECTS2);

    if (pat === 0) {
      const a = rng.int(5, 20);
      const b = rng.int(1, a - 1);
      const ans = a - b;
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt(' cm')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${obj}의 길이가 ${a} cm예요. ${b} cm를 잘라내면 남은 길이는 몇 cm인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`전체 ${a} cm에서 잘라낸 ${b} cm를 빼요. ${a} - ${b} = ${ans}이라서 ${ans} cm예요.`)],
      };
    } else {
      const a = rng.int(5, 20);
      const b = rng.int(3, 15);
      const ans = a + b;
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt(' cm')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${obj} 두 개의 길이가 각각 ${a} cm와 ${b} cm예요. 두 ${obj}를 이으면 몇 cm인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`두 길이를 이으면 더해요. ${a} + ${b} = ${ans}이라서 ${ans} cm예요.`)],
      };
    }
  },
};

export const unitLength2Skills: SkillDef[] = [
  len2Cm,
  len2Unit,
  len2Compare,
  len2Word,
];
