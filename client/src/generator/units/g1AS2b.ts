/**
 * 단원: 덧셈과 뺄셈(2) (2022 개정교육과정 1-2 4단원)
 * 성취기준: 10이 되는 더하기, 10에서 빼기, 10을 이용한 세 수 덧셈, 이어 세기 덧셈을 할 수 있다.
 */

import { RNG } from '../rng';
import { nj, ida } from '../josa';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

const ITEMS = ['사과', '귤', '포도', '딸기', '별', '풍선', '공', '꽃', '나비', '구슬', '도토리', '레몬'];

// ── 1. as12b-make10  10이 되는 더하기 (fill-blanks)  난이도 1 ─────────────────
const as12bMake10: SkillDef = {
  id: 'as12b-make10',
  unitId: 'unitAS12b',
  difficulty: 1,
  title: '10이 되는 더하기',
  note: 'a + □ = 10 형태. □ ≥ 1. fill-blanks.',
  minVariety: 9,
  generate(seed) {
    const rng = new RNG(seed);
    const a = rng.int(1, 9);
    const ans = 10 - a;

    const expr: MathExpr = [
      txt(`${a} + `),
      { kind: 'blank', slot: 0 },
      txt(' = 10'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${a}에 얼마를 더하면 10이 되나요?`,
      expr,
      blankAnswers: [ans],
      explanation: [txt(`${a}에 ${nj(ans, '을/를')} 더하면 10이 돼요. ${a} + ${ans} = 10.`)],
    };
  },
};

// ── 2. as12b-from10  10에서 빼기 (fill-blanks)  난이도 1 ─────────────────────
const as12bFrom10: SkillDef = {
  id: 'as12b-from10',
  unitId: 'unitAS12b',
  difficulty: 1,
  title: '10에서 빼기',
  note: '10 - a = □ 형태. □ ≥ 1. fill-blanks.',
  minVariety: 9,
  generate(seed) {
    const rng = new RNG(seed);
    const a = rng.int(1, 9);
    const ans = 10 - a;

    const expr: MathExpr = [
      txt(`10 - ${a} = `),
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
      explanation: [txt(`10에서 ${nj(a, '을/를')} 덜어 내면 ${nj(ans, '이/가')} 남아요. 10 - ${a} = ${ans}.`)],
    };
  },
};

// ── 3. as12b-use10  10을 이용한 세 수 덧셈 (fill-blanks)  난이도 2 ───────────
// 예: 7 + 3 + 5 = (7+3) + 5 = 10 + 5 = 15
const as12bUse10: SkillDef = {
  id: 'as12b-use10',
  unitId: 'unitAS12b',
  difficulty: 2,
  title: '10을 이용한 세 수 덧셈',
  note: 'a + b + c, a+b=10 이 되는 경우. 결과 11~19. fill-blanks.',
  minVariety: 9,
  generate(seed) {
    const rng = new RNG(seed);
    const a = rng.int(1, 9);
    const b = 10 - a;
    const c = rng.int(1, 9);
    const ans = 10 + c;

    const expr: MathExpr = [
      txt(`${a} + ${b} + ${c} = `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${a} + ${b} = 10을 이용하여 계산하세요.`,
      expr,
      blankAnswers: [ans],
      explanation: [txt(`${a} + ${b} = 10, 10 + ${c} = ${ans}`)],
    };
  },
};

// ── 4. as12b-counting  이어 세기 덧셈 (fill-blanks)  난이도 2 ──────────────
// 예: 8에서 3 이어 세기 → 9, 10, 11
const as12bCounting: SkillDef = {
  id: 'as12b-counting',
  unitId: 'unitAS12b',
  difficulty: 2,
  title: '이어 세기 덧셈',
  note: '큰 수에서 이어 세기로 더하기. 합 11~19. fill-blanks.',
  minVariety: 24,
  generate(seed) {
    const rng = new RNG(seed);
    // a: 큰 수(6~9), b: 더하는 수(1~9), 합 11~18
    let a = 7, b = 4;
    for (let tries = 0; tries < 100; tries++) {
      const ta = rng.int(6, 9);
      const tb = rng.int(2, 9);
      if (ta + tb >= 11 && ta + tb <= 18) { a = ta; b = tb; break; }
    }
    const ans = a + b;

    // 이어 세기 힌트: a에서 b번 세기
    const steps = Array.from({ length: b }, (_, i) => a + i + 1).join(', ');

    const expr: MathExpr = [
      txt(`${a} + ${b} = `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${a}에서 ${b}칸 이어 세면? (${steps})`,
      expr,
      blankAnswers: [ans],
      explanation: [txt(`${a}에서 ${b}칸 이어 세면 ${ida(ans)}.`)],
    };
  },
};

// ── 5. as12b-word  문장제 (fill-blanks)  난이도 2 ────────────────────────────
const as12bWord: SkillDef = {
  id: 'as12b-word',
  unitId: 'unitAS12b',
  difficulty: 2,
  word: true,
  title: '덧셈과 뺄셈(2) 문장제',
  note: '10 만들기·이어 세기 활용 문장제. fill-blanks.',
  minVariety: 96,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const item = rng.pick(ITEMS);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 10이 되는 더하기 활용
      const a = rng.int(1, 9);
      const need = 10 - a;
      answer = 10;
      promptStr = `바구니에 ${nj(item, '이/가')} ${a}개 있어요. 10개가 되려면 ${need}개를 더 담으면 돼요. 그러면 모두 몇 개인가요?`;
      explanation = [txt(`${a}개에 ${need}개를 더하면 ${a} + ${need} = 10개예요.`)];
    } else {
      // 이어 세기 덧셈 활용
      let a = 7, b = 4;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(6, 9);
        const tb = rng.int(2, 9);
        if (ta + tb >= 11 && ta + tb <= 18) { a = ta; b = tb; break; }
      }
      answer = a + b;
      promptStr = `${nj(item, '이/가')} ${a}개 있어요. ${b}개를 더 가져오면 모두 몇 개인가요?`;
      explanation = [txt(`${a}개에서 ${b}칸 이어 세면 ${a} + ${b} = ${answer}개예요.`)];
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
export const unitAS12bSkills: SkillDef[] = [
  as12bMake10,
  as12bFrom10,
  as12bUse10,
  as12bCounting,
  as12bWord,
];
