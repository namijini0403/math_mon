/**
 * 단원: 비교하기 (2022 개정교육과정 1-1 4단원)
 * 성취기준: 개수·크기·길이를 비교하고, 더 많다/적다/길다/짧다 등 어휘를 이해한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// 이모지 풀 10종
const EMOJIS = ['🍎', '🍌', '🍇', '🐰', '🐶', '⭐', '🌸', '🚗', '⚽', '🎈'];
const ITEMS = ['사과', '귤', '포도', '딸기', '별사탕', '풍선', '공', '꽃', '나비', '구슬'];

// ── 1. comp1-emoji  이모지 두 묶음 개수 비교 (choice)  난이도 1 ──────────
const comp1Emoji: SkillDef = {
  id: 'comp1-emoji',
  unitId: 'unitCompare1',
  difficulty: 1,
  title: '이모지 개수 비교',
  note: '이모지 두 묶음을 보고 더 많은 쪽 고르기. choice.',
  minVariety: 72,
  generate(seed) {
    const rng = new RNG(seed);
    const emoji1 = rng.pick(EMOJIS);
    let emoji2 = rng.pick(EMOJIS);
    if (emoji2 === emoji1) emoji2 = EMOJIS[(EMOJIS.indexOf(emoji1) + 1) % EMOJIS.length];

    let countA = 3, countB = 5;
    for (let tries = 0; tries < 100; tries++) {
      const ta = rng.int(1, 8);
      const tb = rng.int(1, 9);
      if (ta !== tb) { countA = ta; countB = tb; break; }
    }

    const displayA = emoji1.repeat(countA);
    const displayB = emoji2.repeat(countB);
    const moreIsA = countA > countB;
    const labelA = `가 (${countA}개)`;
    const labelB = `나 (${countB}개)`;

    const answerVal = txc(moreIsA ? labelA : labelB);
    const cands: ChoiceValue[] = [txc(moreIsA ? labelB : labelA), txc('같아요'), txc('모르겠어요')];
    const { choices, answerIndex } = buildChoices(answerVal, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `가: ${displayA}\n나: ${displayB}\n더 많은 쪽은 어느 것인가요?`,
      choices,
      answerIndex,
      explanation: [
        txt(`가는 ${countA}개, 나는 ${countB}개예요. ${countA > countB ? '가' : '나'}가 더 많아요.`),
      ],
    };
  },
};

// ── 2. comp1-most  셋 중 가장 ~한 것 (수치 단서) (choice)  난이도 2 ───────
const COMPARE_TOPICS = [
  { subject: '나무', attr: '높이', unit: 'cm', adj_more: '높은', adj_less: '낮은' },
  { subject: '끈', attr: '길이', unit: 'cm', adj_more: '긴', adj_less: '짧은' },
  { subject: '빌딩', attr: '층수', unit: '층', adj_more: '높은', adj_less: '낮은' },
  { subject: '가방', attr: '무게', unit: 'kg', adj_more: '무거운', adj_less: '가벼운' },
];

const NAMES = ['가', '나', '다'];

const comp1Most: SkillDef = {
  id: 'comp1-most',
  unitId: 'unitCompare1',
  difficulty: 2,
  title: '가장 ~한 것 고르기',
  note: '셋 중 수치 단서를 보고 가장 크거나 작은 것 고르기. choice.',
  minVariety: 64,
  generate(seed) {
    const rng = new RNG(seed);
    const topic = rng.pick(COMPARE_TOPICS);
    let vals: number[] = [3, 5, 7];
    for (let tries = 0; tries < 100; tries++) {
      const tv = [rng.int(1, 9), rng.int(1, 9), rng.int(1, 9)];
      if (new Set(tv).size === 3) { vals = tv; break; }
    }

    const isMax = rng.chance(0.5);
    const target = isMax ? Math.max(...vals) : Math.min(...vals);
    const answerName = NAMES[vals.indexOf(target)];
    const adj = isMax ? topic.adj_more : topic.adj_less;

    const promptStr = vals.map((v, i) => `${NAMES[i]}: ${v}${topic.unit}`).join(', ') +
      `\n가장 ${adj} 것은 어느 것인가요?`;

    const answerVal = txc(answerName);
    const cands: ChoiceValue[] = NAMES.filter(n => n !== answerName).map(txc);
    // add one more wrong option to get 3 distractors
    cands.push(txc('모두 같아요'));
    const { choices, answerIndex } = buildChoices(answerVal, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: promptStr,
      choices,
      answerIndex,
      explanation: [
        txt(`${vals.map((v, i) => `${NAMES[i]}=${v}${topic.unit}`).join(', ')}. 가장 ${adj} 것은 ${answerName}이에요.`),
      ],
    };
  },
};

// ── 3. comp1-vocab  비교 어휘 (choice)  난이도 1 ───────────────────────
const comp1Vocab: SkillDef = {
  id: 'comp1-vocab',
  unitId: 'unitCompare1',
  difficulty: 1,
  title: '비교 어휘',
  note: '더 많다/적다/길다/짧다/무겁다/가볍다 어휘 choice.',
  minVariety: 48,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2); // 0: 개수, 1: 길이, 2: 무게

    let promptStr: string;
    let answer: string;
    let wrong1: string, wrong2: string, wrong3: string;

    if (pat === 0) {
      const item = rng.pick(ITEMS);
      const a = rng.int(1, 9);
      let b = rng.int(1, 9);
      for (let tries = 0; tries < 50; tries++) { if (b !== a) break; b = rng.int(1, 9); }
      const more = a > b;
      answer = more ? '더 많아요' : '더 적어요';
      wrong1 = more ? '더 적어요' : '더 많아요';
      wrong2 = '같아요';
      wrong3 = '모르겠어요';
      promptStr = `가에는 ${item}가 ${a}개, 나에는 ${b}개 있어요. 가는 나보다 ${item}가 어때요?`;
    } else if (pat === 1) {
      const a = rng.int(1, 9);
      let b = rng.int(1, 9);
      for (let tries = 0; tries < 50; tries++) { if (b !== a) break; b = rng.int(1, 9); }
      const longer = a > b;
      answer = longer ? '더 길어요' : '더 짧아요';
      wrong1 = longer ? '더 짧아요' : '더 길어요';
      wrong2 = '같아요';
      wrong3 = '모르겠어요';
      promptStr = `가 끈은 ${a}cm, 나 끈은 ${b}cm예요. 가 끈은 나 끈보다 어때요?`;
    } else {
      const a = rng.int(1, 9);
      let b = rng.int(1, 9);
      for (let tries = 0; tries < 50; tries++) { if (b !== a) break; b = rng.int(1, 9); }
      const heavier = a > b;
      answer = heavier ? '더 무거워요' : '더 가벼워요';
      wrong1 = heavier ? '더 가벼워요' : '더 무거워요';
      wrong2 = '같아요';
      wrong3 = '모르겠어요';
      promptStr = `가 가방은 ${a}kg, 나 가방은 ${b}kg이에요. 가 가방은 나 가방보다 어때요?`;
    }

    const answerVal = txc(answer);
    const cands: ChoiceValue[] = [txc(wrong1), txc(wrong2), txc(wrong3)];
    const { choices, answerIndex } = buildChoices(answerVal, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: promptStr,
      choices,
      answerIndex,
      explanation: [txt(`답: ${answer}`)],
    };
  },
};

// ── 4. comp1-word  문장제 (fill-blanks)  난이도 2 ───────────────────────
const comp1Word: SkillDef = {
  id: 'comp1-word',
  unitId: 'unitCompare1',
  difficulty: 2,
  word: true,
  title: '비교하기 문장제',
  note: '개수 비교 1학년 수준 문장제. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);
    const item = rng.pick(ITEMS);

    let promptStr: string;
    let answer: number;

    if (pat === 0) {
      // 더 많은 쪽 개수
      let a = 3, b = 5;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(1, 8);
        const tb = rng.int(1, 9);
        if (ta !== tb) { a = ta; b = tb; break; }
      }
      answer = Math.max(a, b);
      const item2 = rng.pick(ITEMS.filter(i => i !== item));
      promptStr = `${item}가 ${a}개, ${item2}가 ${b}개 있어요. 더 많은 것은 몇 개인가요?`;
    } else if (pat === 1) {
      // 더 적은 쪽 개수
      let a = 3, b = 5;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(1, 8);
        const tb = rng.int(1, 9);
        if (ta !== tb) { a = ta; b = tb; break; }
      }
      answer = Math.min(a, b);
      const item2 = rng.pick(ITEMS.filter(i => i !== item));
      promptStr = `${item}가 ${a}개, ${item2}가 ${b}개 있어요. 더 적은 것은 몇 개인가요?`;
    } else {
      // 차이
      let a = 3, b = 5;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(1, 8);
        const tb = rng.int(ta + 1, 9);
        a = ta; b = tb; break;
      }
      answer = b - a;
      const item2 = rng.pick(ITEMS.filter(i => i !== item));
      promptStr = `${item}가 ${a}개, ${item2}가 ${b}개 있어요. ${item2}는 ${item}보다 몇 개 더 많은가요?`;
    }

    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt('개'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptStr,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`답: ${answer}개`)],
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitCompare1Skills: SkillDef[] = [
  comp1Emoji,
  comp1Most,
  comp1Vocab,
  comp1Word,
];
