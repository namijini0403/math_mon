/**
 * 단원: 덧셈과 뺄셈 (2022 개정교육과정 1-1 3단원)
 * 성취기준: 9까지의 수에서 모으기·가르기, 덧셈, 뺄셈, □ 구하기를 할 수 있다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

const ITEMS = ['사과', '귤', '포도', '딸기', '별', '풍선', '공', '꽃', '나비', '구슬'];

// ── 1. as1-gather  모으기·가르기 (fill-blanks)  난이도 1 ────────────────
const as1Gather: SkillDef = {
  id: 'as1-gather',
  unitId: 'unitAddSub1',
  difficulty: 1,
  title: '모으기·가르기',
  note: '두 수를 모아 합 구하기 또는 한 수를 두 수로 가르기. fill-blanks. 합 ≤ 9.',
  minVariety: 32,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1); // 0: 모으기, 1: 가르기

    if (pat === 0) {
      // 모으기: a와 b를 모으면? (합 ≤ 9)
      let a = 2, b = 3;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(1, 8);
        const tb = rng.int(1, 9 - ta);
        if (tb >= 1) { a = ta; b = tb; break; }
      }
      const ans = a + b;
      const expr: MathExpr = [
        txt(`${a}과 ${b}을 모으면 `),
        { kind: 'blank', slot: 0 },
        txt('이에요.'),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${a}과 ${b}을 모으면 얼마인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${a}과 ${b}을 모으면 ${ans}이에요.`)],
      };
    } else {
      // 가르기: n을 a와 ?로 가르기 (? ≥ 1)
      let n = 5, a = 2;
      for (let tries = 0; tries < 100; tries++) {
        const tn = rng.int(2, 9);
        const ta = rng.int(1, tn - 1);
        n = tn; a = ta; break;
      }
      const ans = n - a;
      const expr: MathExpr = [
        txt(`${n}은 ${a}과 `),
        { kind: 'blank', slot: 0 },
        txt('으로 가를 수 있어요.'),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${n}을 ${a}과 얼마로 가를 수 있나요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${n} = ${a} + ${ans}이에요.`)],
      };
    }
  },
};

// ── 2. as1-add  합 9 이하 덧셈 (fill-blanks)  난이도 1 ──────────────────
const as1Add: SkillDef = {
  id: 'as1-add',
  unitId: 'unitAddSub1',
  difficulty: 1,
  title: '9 이하 덧셈',
  note: '1자리 수 + 1자리 수. 합 ≤ 9. fill-blanks.',
  minVariety: 32,
  generate(seed) {
    const rng = new RNG(seed);
    let a = 2, b = 3;
    for (let tries = 0; tries < 100; tries++) {
      const ta = rng.int(1, 8);
      const tb = rng.int(1, 9 - ta);
      if (tb >= 1) { a = ta; b = tb; break; }
    }
    const ans = a + b;

    const expr: MathExpr = [
      txt(`${a} + ${b} = `),
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
      explanation: [txt(`${a} + ${b} = ${ans}`)],
    };
  },
};

// ── 3. as1-sub  9 이하 뺄셈 (fill-blanks)  난이도 1 ────────────────────
const as1Sub: SkillDef = {
  id: 'as1-sub',
  unitId: 'unitAddSub1',
  difficulty: 1,
  title: '9 이하 뺄셈',
  note: '1자리 수 - 1자리 수. 결과 ≥ 1. fill-blanks.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    let a = 5, b = 2;
    for (let tries = 0; tries < 100; tries++) {
      const ta = rng.int(2, 9);
      const tb = rng.int(1, ta - 1);
      a = ta; b = tb; break;
    }
    const ans = a - b;

    const expr: MathExpr = [
      txt(`${a} - ${b} = `),
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
      explanation: [txt(`${a} - ${b} = ${ans}`)],
    };
  },
};

// ── 4. as1-zero  0의 덧셈·뺄셈 (choice)  난이도 1 ────────────────────
// 0이 답이 되는 문제 금지: 0이 관여하지만 결과는 양수
const as1Zero: SkillDef = {
  id: 'as1-zero',
  unitId: 'unitAddSub1',
  difficulty: 1,
  title: '0의 덧셈·뺄셈',
  note: '0과 관련된 덧뺄셈. 결과는 항상 양수(a+0=a, a-0=a). choice. 4지선다.',
  minVariety: 16,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1); // 0: a+0=?, 1: a-0=?
    const a = rng.int(1, 9);

    const answer = a; // 항상 a (a+0=a, a-0=a)
    const op = pat === 0 ? '+' : '-';
    const promptStr = `${a} ${op} 0 = ?`;

    // Build 3 unique distractors different from answer(=a)
    const taken = new Set([a]);
    const pool = [1,2,3,4,5,6,7,8,9].filter(v => !taken.has(v));
    // prefer neighbours
    const ordered = [...pool].sort((x, y) => Math.abs(x - a) - Math.abs(y - a));
    const d1 = ordered[0];
    const d2 = ordered[1];
    const d3 = ordered[2];

    const answerVal = txc(`${answer}`);
    const cands: ChoiceValue[] = [txc(`${d1}`), txc(`${d2}`), txc(`${d3}`)];
    const { choices, answerIndex } = buildChoices(answerVal, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `계산하세요: ${promptStr}`,
      choices,
      answerIndex,
      explanation: [txt(`어떤 수에 0을 더하거나 빼면 그 수가 그대로예요. ${a} ${op} 0 = ${a}`)],
    };
  },
};

// ── 5. as1-missing  □ 구하기 (fill-blanks)  난이도 2 ─────────────────
const as1Missing: SkillDef = {
  id: 'as1-missing',
  unitId: 'unitAddSub1',
  difficulty: 2,
  title: '□ 구하기',
  note: '□ + b = c 또는 a - □ = c 형태. □ ≥ 1. fill-blanks.',
  minVariety: 28,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1); // 0: □+b=c, 1: a-□=c

    let promptStr: string;
    let answer: number;
    const expr: MathExpr = [txt('□ = '), { kind: 'blank', slot: 0 }];

    if (pat === 0) {
      // □ + b = c → □ = c - b (□ ≥ 1, c ≤ 9)
      let b = 2, c = 5;
      for (let tries = 0; tries < 100; tries++) {
        const tc = rng.int(2, 9);
        const tb = rng.int(1, tc - 1);
        b = tb; c = tc; break;
      }
      answer = c - b;
      promptStr = `□ + ${b} = ${c}일 때, □에 알맞은 수를 구하세요.`;
    } else {
      // a - □ = c → □ = a - c (□ ≥ 1, c ≥ 1)
      let a = 7, c = 3;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(3, 9);
        const tc = rng.int(1, ta - 2);
        a = ta; c = tc; break;
      }
      answer = a - c;
      promptStr = `${a} - □ = ${c}일 때, □에 알맞은 수를 구하세요.`;
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptStr,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`□ = ${answer}`)],
    };
  },
};

// ── 6. as1-word  문장제 (fill-blanks)  난이도 2 ─────────────────────────
const as1Word: SkillDef = {
  id: 'as1-word',
  unitId: 'unitAddSub1',
  difficulty: 2,
  word: true,
  title: '덧셈과 뺄셈 문장제',
  note: '합 9 이하 덧셈·뺄셈 1학년 수준 문장제. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const item = rng.pick(ITEMS);

    let promptStr: string;
    let answer: number;
    let unit = '개';

    if (pat === 0) {
      // 덧셈
      let a = 2, b = 3;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(1, 7);
        const tb = rng.int(1, 9 - ta);
        if (tb >= 1) { a = ta; b = tb; break; }
      }
      answer = a + b;
      promptStr = `${item}가 ${a}개 있어요. ${b}개를 더 사면 모두 몇 개인가요?`;
    } else {
      // 뺄셈
      let a = 5, b = 2;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(2, 9);
        const tb = rng.int(1, ta - 1);
        a = ta; b = tb; break;
      }
      answer = a - b;
      promptStr = `${item}가 ${a}개 있어요. ${b}개를 먹으면 몇 개가 남나요?`;
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
      prompt: promptStr,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`답: ${answer}${unit}`)],
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitAddSub1Skills: SkillDef[] = [
  as1Gather,
  as1Add,
  as1Sub,
  as1Zero,
  as1Missing,
  as1Word,
];
