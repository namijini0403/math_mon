/**
 * 단원: 덧셈과 뺄셈(1) (2022 개정교육과정 1-2 2단원)
 * 성취기준: 받아올림 없는 (몇십몇)±(몇), (몇십)±(몇십), 세 수 계산을 할 수 있다.
 */

import { RNG } from '../rng';
import { nj, ida } from '../josa';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

const ITEMS = ['사과', '귤', '포도', '딸기', '별', '풍선', '공', '꽃', '나비', '구슬', '도토리', '레몬'];

// ── 1. as12a-add1  (몇십몇)+(몇) 받아올림 없는 덧셈 (fill-blanks)  난이도 1 ──
const as12aAdd1: SkillDef = {
  id: 'as12a-add1',
  unitId: 'unitAS12a',
  difficulty: 1,
  title: '(몇십몇)+(몇) 덧셈',
  note: '일의 자리 합이 9 이하(받아올림 없음). fill-blanks.',
  minVariety: 45,
  generate(seed) {
    const rng = new RNG(seed);
    let tens = 3, ones = 2, add = 4;
    for (let tries = 0; tries < 100; tries++) {
      const tt = rng.int(1, 9);
      const to = rng.int(1, 8);
      const ta = rng.int(1, 9 - to);
      if (ta >= 1) { tens = tt; ones = to; add = ta; break; }
    }
    const a = tens * 10 + ones;
    const ans = a + add;

    const expr: MathExpr = [
      txt(`${a} + ${add} = `),
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
      explanation: [txt(`낱개끼리 더하면 ${ones} + ${add} = ${ida(ones + add)}. 그래서 ${a} + ${add} = ${ans}.`)],
    };
  },
};

// ── 2. as12a-sub1  (몇십몇)-(몇) 받아내림 없는 뺄셈 (fill-blanks)  난이도 1 ──
const as12aSub1: SkillDef = {
  id: 'as12a-sub1',
  unitId: 'unitAS12a',
  difficulty: 1,
  title: '(몇십몇)-(몇) 뺄셈',
  note: '일의 자리 수 빼기(받아내림 없음). 결과 ≥ 10. fill-blanks.',
  minVariety: 45,
  generate(seed) {
    const rng = new RNG(seed);
    let tens = 3, ones = 5, sub = 2;
    for (let tries = 0; tries < 100; tries++) {
      const tt = rng.int(1, 9);
      const to = rng.int(2, 9);
      const ts = rng.int(1, to - 1);
      tens = tt; ones = to; sub = ts; break;
    }
    const a = tens * 10 + ones;
    const ans = a - sub;

    const expr: MathExpr = [
      txt(`${a} - ${sub} = `),
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
      explanation: [txt(`낱개끼리 빼면 ${ones} - ${sub} = ${ida(ones - sub)}. 그래서 ${a} - ${sub} = ${ans}.`)],
    };
  },
};

// ── 3. as12a-tens  (몇십)±(몇십) (fill-blanks)  난이도 1 ────────────────────
const as12aTens: SkillDef = {
  id: 'as12a-tens',
  unitId: 'unitAS12a',
  difficulty: 1,
  title: '(몇십)±(몇십)',
  note: '십의 자리끼리 더하거나 빼기. 결과 10~90. fill-blanks.',
  minVariety: 28,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    let a = 30, b = 20, ans = 50;

    if (pat === 0) {
      // 덧셈: a + b ≤ 90
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(1, 8) * 10;
        const tb = rng.int(1, 9 - ta / 10) * 10;
        if (ta + tb <= 90) { a = ta; b = tb; ans = ta + tb; break; }
      }
    } else {
      // 뺄셈: a - b ≥ 10
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(2, 9) * 10;
        const tb = rng.int(1, ta / 10 - 1) * 10;
        a = ta; b = tb; ans = ta - tb; break;
      }
    }

    const op = pat === 0 ? '+' : '-';
    const expr: MathExpr = [
      txt(`${a} ${op} ${b} = `),
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
      explanation: [txt(`10개씩 묶음끼리 ${op === '+' ? '더해요' : '빼요'}. ${a} ${op} ${b} = ${ans}.`)],
    };
  },
};

// ── 4. as12a-three  세 수 계산 (fill-blanks)  난이도 2 ──────────────────────
const as12aThree: SkillDef = {
  id: 'as12a-three',
  unitId: 'unitAS12a',
  difficulty: 2,
  title: '세 수 계산',
  note: '(몇십몇)+(몇)+(몇) 또는 (몇십몇)-(몇)-(몇). 받아올림/받아내림 없음. fill-blanks.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    let a = 31, b = 2, c = 3, ans = 36;

    if (pat === 0) {
      // 덧셈: a + b + c, 일의 자리 합 ≤ 9
      for (let tries = 0; tries < 100; tries++) {
        const tt = rng.int(1, 9);
        const to = rng.int(1, 6);
        const tb = rng.int(1, 4);
        const tc = rng.int(1, 9 - to - tb);
        if (tc >= 1) {
          a = tt * 10 + to;
          b = tb;
          c = tc;
          ans = a + b + c;
          break;
        }
      }
    } else {
      // 뺄셈: a - b - c, 일의 자리 충분히 큼
      for (let tries = 0; tries < 100; tries++) {
        const tt = rng.int(1, 9);
        const to = rng.int(4, 9);
        const tb = rng.int(1, to - 2);
        const tc = rng.int(1, to - tb - 1);
        if (tc >= 1) {
          a = tt * 10 + to;
          b = tb;
          c = tc;
          ans = a - b - c;
          break;
        }
      }
    }

    const op = pat === 0 ? '+' : '-';
    const expr: MathExpr = [
      txt(`${a} ${op} ${b} ${op} ${c} = `),
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
      explanation: [txt(`${a} ${op} ${b} = ${a + (pat === 0 ? b : -b)}, 그리고 ${op} ${c} = ${ans}`)],
    };
  },
};

// ── 5. as12a-word  문장제 (fill-blanks)  난이도 2 ────────────────────────────
const as12aWord: SkillDef = {
  id: 'as12a-word',
  unitId: 'unitAS12a',
  difficulty: 2,
  word: true,
  title: '덧셈과 뺄셈(1) 문장제',
  note: '받아올림 없는 (몇십몇)±(몇) 문장제. fill-blanks.',
  minVariety: 96,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const item = rng.pick(ITEMS);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 덧셈
      let tens = 3, ones = 2, add = 4;
      for (let tries = 0; tries < 100; tries++) {
        const tt = rng.int(1, 8);
        const to = rng.int(1, 7);
        const ta = rng.int(1, 9 - to);
        if (ta >= 1) { tens = tt; ones = to; add = ta; break; }
      }
      const a = tens * 10 + ones;
      answer = a + add;
      promptStr = `${nj(item, '이/가')} ${a}개 있어요. ${add}개를 더 가져오면 모두 몇 개인가요?`;
      explanation = [txt(`${a}개에 ${add}개를 더하면 ${a} + ${add} = ${ida(answer)}. 모두 ${answer}개예요.`)];
    } else {
      // 뺄셈
      let tens = 3, ones = 5, sub = 2;
      for (let tries = 0; tries < 100; tries++) {
        const tt = rng.int(1, 9);
        const to = rng.int(2, 9);
        const ts = rng.int(1, to - 1);
        tens = tt; ones = to; sub = ts; break;
      }
      const a = tens * 10 + ones;
      answer = a - sub;
      promptStr = `${nj(item, '이/가')} ${a}개 있어요. ${sub}개를 먹으면 몇 개가 남나요?`;
      explanation = [txt(`${a}개에서 ${sub}개를 덜어 내면 ${a} - ${sub} = ${ida(answer)}. ${answer}개가 남아요.`)];
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
      explanation,
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitAS12aSkills: SkillDef[] = [
  as12aAdd1,
  as12aSub1,
  as12aTens,
  as12aThree,
  as12aWord,
];
