/**
 * 단원: 덧셈과 뺄셈(3) (2022 개정교육과정 1-2 6단원)
 * 성취기준: 받아올림 (몇)+(몇)=십몇, 받아내림 (십몇)-(몇), 덧뺄 관계식, □ 구하기를 할 수 있다.
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

const ITEMS = ['사과', '귤', '포도', '딸기', '별', '풍선', '공', '꽃', '나비', '구슬', '도토리', '레몬'];

// ── 1. as12c-carry  받아올림 (몇)+(몇)=십몇 (fill-blanks)  난이도 1 ──────────
const as12cCarry: SkillDef = {
  id: 'as12c-carry',
  unitId: 'unitAS12c',
  difficulty: 1,
  title: '받아올림 덧셈',
  note: '(몇)+(몇)=십몇. 합 11~18. fill-blanks.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    let a = 7, b = 4;
    for (let tries = 0; tries < 100; tries++) {
      const ta = rng.int(2, 9);
      const tb = rng.int(2, 9);
      if (ta + tb >= 11 && ta + tb <= 18) { a = ta; b = tb; break; }
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
      // 1학년 받아올림: 한 수를 갈라 10을 먼저 만든다
      explanation: [txt(`${nj(b, '을/를')} ${nj(10 - a, '과/와')} ${ans - 10}로 가르면 ${a} + ${10 - a} = 10, 10 + ${ans - 10} = ${ans}이에요.`)],
    };
  },
};

// ── 2. as12c-borrow  받아내림 (십몇)-(몇) (fill-blanks)  난이도 1 ─────────────
const as12cBorrow: SkillDef = {
  id: 'as12c-borrow',
  unitId: 'unitAS12c',
  difficulty: 1,
  title: '받아내림 뺄셈',
  note: '(십몇)-(몇). 피빼는 수 > 일의 자리(받아내림 필요). 결과 ≥ 1. fill-blanks.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    let a = 13, b = 5;
    for (let tries = 0; tries < 100; tries++) {
      const ta = rng.int(11, 18);
      const tonesA = ta % 10;
      // 받아내림이 필요한 경우: b > 일의 자리
      const tb = rng.int(tonesA + 1, 9);
      const result = ta - tb;
      if (result >= 1) { a = ta; b = tb; break; }
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
      // 1학년 받아내림: 십몇을 10과 낱개로 가르고 10에서 먼저 뺀다
      explanation: [txt(`${nj(a, '을/를')} 10과 ${a % 10}으로 가르고, 10 - ${b} = ${10 - b}, ${10 - b} + ${a % 10} = ${ans}이에요.`)],
    };
  },
};

// ── 3. as12c-relation  덧뺄 관계식 빈칸 (fill-blanks)  난이도 2 ───────────────
// a + b = c 의 관계를 이용해 c - b = ? 또는 c - a = ? 빈칸 채우기
const as12cRelation: SkillDef = {
  id: 'as12c-relation',
  unitId: 'unitAS12c',
  difficulty: 2,
  title: '덧뺄 관계식',
  note: 'a+b=c 관계에서 c-b=? 또는 c-a=? 빈칸. fill-blanks.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    // c = a + b, 합 11~18
    let a = 7, b = 6;
    for (let tries = 0; tries < 100; tries++) {
      const ta = rng.int(2, 9);
      const tb = rng.int(2, 9);
      if (ta + tb >= 11 && ta + tb <= 18) { a = ta; b = tb; break; }
    }
    const c = a + b;
    const pat = rng.int(0, 1);
    const answer = pat === 0 ? a : b;
    const sub = pat === 0 ? b : a;

    const expr: MathExpr = [
      txt(`${a} + ${b} = ${c}이에요.\n${c} - ${sub} = `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${a} + ${b} = ${c}이에요. 이것을 이용하여 ${c} - ${nj(sub, '을/를')} 구하세요.`,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`${a} + ${b} = ${c}이므로 ${c} - ${sub} = ${answer}예요.`)],
    };
  },
};

// ── 4. as12c-missing  □ 구하기 (fill-blanks)  난이도 2 ──────────────────────
// □ + b = c(십몇) 또는 c - □ = a 형태
const as12cMissing: SkillDef = {
  id: 'as12c-missing',
  unitId: 'unitAS12c',
  difficulty: 2,
  title: '□ 구하기',
  note: '□ + b = c(십몇) 또는 c(십몇) - □ = a 형태. □ ≥ 1. fill-blanks.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;
    const expr: MathExpr = [txt('□ = '), { kind: 'blank', slot: 0 }];

    if (pat === 0) {
      // □ + b = c(십몇), c = 11~18
      let b = 6, c = 13;
      for (let tries = 0; tries < 100; tries++) {
        const tc = rng.int(11, 18);
        const tb = rng.int(2, 9);
        const box = tc - tb;
        if (box >= 2 && box <= 9) { b = tb; c = tc; answer = box; break; }
      }
      answer = c - b;
      promptStr = `□ + ${b} = ${c}일 때, □에 알맞은 수를 구하세요.`;
      explanation = [txt(`${c}에서 ${b}만큼 덜어 내면 □를 알 수 있어요. □ = ${c} - ${b} = ${answer}.`)];
    } else {
      // c(십몇) - □ = a, 결과 ≥ 1
      let a = 4, c = 13;
      for (let tries = 0; tries < 100; tries++) {
        const tc = rng.int(11, 18);
        const ta = rng.int(1, 9);
        const box = tc - ta;
        if (box >= 2 && box <= 9) { a = ta; c = tc; answer = box; break; }
      }
      answer = c - a;
      promptStr = `${c} - □ = ${a}일 때, □에 알맞은 수를 구하세요.`;
      explanation = [txt(`${c}에서 얼마를 빼야 ${nj(a, '이/가')} 될까요? □ = ${c} - ${a} = ${answer}.`)];
    }

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

// ── 5. as12c-word  문장제 (fill-blanks)  난이도 2 ────────────────────────────
const as12cWord: SkillDef = {
  id: 'as12c-word',
  unitId: 'unitAS12c',
  difficulty: 2,
  word: true,
  title: '덧셈과 뺄셈(3) 문장제',
  note: '받아올림·받아내림 문장제. fill-blanks.',
  minVariety: 96,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const item = rng.pick(ITEMS);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 받아올림 덧셈
      let a = 7, b = 5;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(2, 9);
        const tb = rng.int(2, 9);
        if (ta + tb >= 11 && ta + tb <= 18) { a = ta; b = tb; break; }
      }
      answer = a + b;
      promptStr = `${nj(item, '이/가')} ${a}개 있어요. ${b}개를 더 가져오면 모두 몇 개인가요?`;
      explanation = [txt(`${a}개에 ${b}개를 더하면 ${a} + ${b} = ${answer}이에요. 모두 ${answer}개예요.`)];
    } else {
      // 받아내림 뺄셈
      let a = 14, b = 6;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(11, 18);
        const tonesA = ta % 10;
        const tb = rng.int(tonesA + 1, 9);
        const result = ta - tb;
        if (result >= 1) { a = ta; b = tb; break; }
      }
      answer = a - b;
      promptStr = `${nj(item, '이/가')} ${a}개 있어요. ${b}개를 친구에게 주면 몇 개가 남나요?`;
      explanation = [txt(`${a}개에서 ${b}개를 덜어 내면 ${a} - ${b} = ${answer}이에요. ${answer}개가 남아요.`)];
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
export const unitAS12cSkills: SkillDef[] = [
  as12cCarry,
  as12cBorrow,
  as12cRelation,
  as12cMissing,
  as12cWord,
];
