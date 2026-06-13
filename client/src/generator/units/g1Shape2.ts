/**
 * 단원: 여러 가지 모양 (2022 개정교육과정 1-2 3단원)
 * 성취기준: 평면 모양(네모·세모·동그라미)을 분류하고, 개수를 세며, 본뜬 모양을 이해한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// 물건 풀 20종 이상 (평면 모양별 분류)
const SQUARE_OBJECTS = ['책', '창문', '수첩', '도마', '타일', '액자', '냅킨', '달력'];        // 네모
const TRIANGLE_OBJECTS = ['삼각김밥', '옷걸이', '표지판', '텐트', '피자 조각', '슬라이드'];   // 세모
const CIRCLE_OBJECTS = ['동전', '시계', '피자', '단추', '쿠키', '빗', '접시', '태양'];       // 동그라미

const ALL_OBJECTS = [
  ...SQUARE_OBJECTS.map(o => ({ name: o, shape: '네모' as const })),
  ...TRIANGLE_OBJECTS.map(o => ({ name: o, shape: '세모' as const })),
  ...CIRCLE_OBJECTS.map(o => ({ name: o, shape: '동그라미' as const })),
];

// 평면 모양 특징 (1학년 눈높이 — 곧은 변·뾰족한 곳으로 구별)
const PLANE_TRAIT: Record<string, string> = {
  '네모': '곧은 변이 4개, 뾰족한 곳이 4개 있어요',
  '세모': '곧은 변이 3개, 뾰족한 곳이 3개 있어요',
  '동그라미': '뾰족한 곳 없이 동그랗게 굽어 있어요',
};

// ── 1. shape12-classify  평면 모양 분류 (choice)  난이도 1 ──────────────────
const shape12Classify: SkillDef = {
  id: 'shape12-classify',
  unitId: 'unitShape12',
  difficulty: 1,
  title: '평면 모양 분류',
  note: '물건을 보고 평면 모양(네모/세모/동그라미) 고르기. choice. 물건 풀 22종.',
  minVariety: 22,
  generate(seed) {
    const rng = new RNG(seed);
    const obj = rng.pick(ALL_OBJECTS);
    const correct = txc(obj.shape);
    const allShapes = ['네모', '세모', '동그라미'];
    const cands: ChoiceValue[] = allShapes
      .filter(s => s !== obj.shape)
      .map(s => txc(s));
    // need 3 distractors total for choice of 4 — add one more
    cands.push(txc('타원'));
    const { choices, answerIndex } = buildChoices(correct, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${obj.name}은 어떤 모양인가요?`,
      choices,
      answerIndex,
      explanation: [txt(`${obj.name}은 ${PLANE_TRAIT[obj.shape]}. 그래서 ${obj.shape} 모양이에요.`)],
    };
  },
};

// ── 2. shape12-count  모양 개수 세기 (fill-blanks)  난이도 1 ─────────────────
const SHAPE_EMOJIS: Record<string, string> = {
  '네모': '🟦',
  '세모': '🔺',
  '동그라미': '⭕',
};

const shape12Count: SkillDef = {
  id: 'shape12-count',
  unitId: 'unitShape12',
  difficulty: 1,
  title: '모양 개수 세기',
  note: '이모지로 나열된 모양 그림에서 특정 모양 개수 세기. fill-blanks.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    // 세 모양을 섞어서 나열, 특정 모양 개수 묻기
    const sq = rng.int(1, 5);
    const tr = rng.int(1, 5);
    const ci = rng.int(1, 5);
    const target = rng.pick(['네모', '세모', '동그라미'] as const);

    const counts: Record<string, number> = { '네모': sq, '세모': tr, '동그라미': ci };
    const answer = counts[target];

    // 이모지 나열 (섞어서)
    const items: string[] = [
      ...Array(sq).fill(SHAPE_EMOJIS['네모']),
      ...Array(tr).fill(SHAPE_EMOJIS['세모']),
      ...Array(ci).fill(SHAPE_EMOJIS['동그라미']),
    ];
    // shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = rng.int(0, i);
      [items[i], items[j]] = [items[j], items[i]];
    }
    const display = items.join(' ');

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${display}\n${target} 모양은 몇 개인가요?`,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`${target} 모양만 하나씩 골라 세면 ${answer}개예요.`)],
    };
  },
};

// ── 3. shape12-trace  본뜬 모양 (choice)  난이도 2 ───────────────────────────
// 상자(직육면체)를 본뜨면 네모, 원기둥을 본뜨면 동그라미, 삼각형 프리즘 → 세모
const TRACE_OBJECTS = [
  { name: '상자', result: '네모', emoji: '📦' },
  { name: '통조림 캔', result: '동그라미', emoji: '🥫' },
  { name: '삼각형 블록', result: '세모', emoji: '🔺' },
  { name: '책', result: '네모', emoji: '📘' },
  { name: '접시', result: '동그라미', emoji: '🍽️' },
  { name: '피자 조각 블록', result: '세모', emoji: '🍕' },
  { name: '창문틀', result: '네모', emoji: '🪟' },
  { name: '동전', result: '동그라미', emoji: '🪙' },
];

const shape12Trace: SkillDef = {
  id: 'shape12-trace',
  unitId: 'unitShape12',
  difficulty: 2,
  title: '본뜬 모양',
  note: '물체를 종이에 본뜨면 어떤 모양이 나오는지 고르기. choice.',
  minVariety: 8,
  generate(seed) {
    const rng = new RNG(seed);
    const obj = rng.pick(TRACE_OBJECTS);
    const correct = txc(obj.result);
    const allShapes = ['네모', '세모', '동그라미'];
    const cands: ChoiceValue[] = allShapes
      .filter(s => s !== obj.result)
      .map(s => txc(s));
    cands.push(txc('타원'));
    const { choices, answerIndex } = buildChoices(correct, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${obj.emoji} ${obj.name}을 종이에 본뜨면 어떤 모양이 나오나요?`,
      choices,
      answerIndex,
      explanation: [txt(`${obj.name}을 종이에 본뜨면 ${obj.result} 모양이 나와요.`)],
    };
  },
};

// ── 4. shape12-word  문장제 (fill-blanks)  난이도 2 ─────────────────────────
const shape12Word: SkillDef = {
  id: 'shape12-word',
  unitId: 'unitShape12',
  difficulty: 2,
  word: true,
  title: '여러 가지 모양 문장제',
  note: '모양 개수 세기 문장제. fill-blanks.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    const sq = rng.int(1, 6);
    const tr = rng.int(1, 6);
    const ci = rng.int(1, 6);
    const target = rng.pick(['네모', '세모', '동그라미'] as const);
    const counts: Record<string, number> = { '네모': sq, '세모': tr, '동그라미': ci };
    const answer = counts[target];
    const total = sq + tr + ci;

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `여러 모양이 모두 ${total}개 있어요. 네모 ${sq}개, 세모 ${tr}개, 동그라미 ${ci}개예요. ${target} 모양은 몇 개인가요?`,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`네모 ${sq}개, 세모 ${tr}개, 동그라미 ${ci}개 중에서 ${target} 모양만 세면 ${answer}개예요.`)],
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitShape12Skills: SkillDef[] = [
  shape12Classify,
  shape12Count,
  shape12Trace,
  shape12Word,
];
