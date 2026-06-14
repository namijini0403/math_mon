/**
 * 단원: 곱셈 (2022 개정교육과정 2-1 6단원)
 * 성취기준: 묶어 세기, 몇의 몇 배, 곱셈식으로 나타내기(구구단 암기 아닌 개념),
 * 덧셈식↔곱셈식 변환을 할 수 있다.
 */

import { RNG } from '../rng';
import { nj, ida } from '../josa';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// 이모지 소재 풀
const EMOJI_POOL = ['🍎', '⭐', '🌸', '🚗', '⚽', '🎈', '🍬', '🐰', '🌻', '🍪'] as const;

// ── 1. muli-group  묶어 세기 (fill-blanks)  난이도 1 ────────────────────────
const muliGroup: SkillDef = {
  id: 'muli-group',
  unitId: 'unitMulIntro',
  difficulty: 1,
  title: '묶어 세기',
  note: 'N씩 M묶음 = ? fill-blanks. N:2~5, M:2~6.',
  minVariety: 16,
  generate(seed) {
    const rng = new RNG(seed);
    const n = rng.int(2, 5); // 묶음 크기
    const m = rng.int(2, 6); // 묶음 수
    const ans = n * m;
    const emoji = rng.pick(EMOJI_POOL);
    // 이모지를 m묶음 표현
    const groups: string[] = [];
    for (let i = 0; i < m; i++) {
      groups.push(emoji.repeat(n));
    }
    const display = groups.join('  ');

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${nj(emoji, '이/가')} ${n}개씩 ${m}묶음 있어요. 모두 몇 개인가요?\n${display}`,
      expr,
      blankAnswers: [ans],
      explanation: [txt(`${n}개씩 ${m}묶음이니 ${nj(n, '을/를')} ${m}번 더해요: ${Array(m).fill(String(n)).join(' + ')} = ${ans}. 곱셈식으로는 ${n} × ${m} = ${ans}개예요.`)],
    };
  },
};

// ── 2. muli-times  몇의 몇 배 (fill-blanks)  난이도 1 ──────────────────────
const muliTimes: SkillDef = {
  id: 'muli-times',
  unitId: 'unitMulIntro',
  difficulty: 1,
  title: '몇의 몇 배',
  note: 'a의 b배 = a×b. fill-blanks. a:2~9, b:2~5.',
  minVariety: 32,
  generate(seed) {
    const rng = new RNG(seed);
    const a = rng.int(2, 9);
    const b = rng.int(2, 5);
    const ans = a * b;
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 결과 구하기
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${a}의 ${b}배는 얼마인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${a}의 ${b}배는 ${nj(a, '을/를')} ${b}번 더한 것이에요: ${Array(b).fill(String(a)).join(' + ')} = ${ans}. 곱셈식으로는 ${a} × ${b} = ${ida(ans)}.`)],
      };
    } else {
      // 몇 배인지 구하기
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('배')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${a}의 몇 배가 ${ans}인가요?`,
        expr,
        blankAnswers: [b],
        explanation: [txt(`${a}씩 뛰어 세 보면 ${ida(Array(b).fill(0).map((_, i) => a * (i + 1)).join(', '))}. ${nj(a, '을/를')} ${b}번 더하면 ${nj(ans, '이/가')} 되니까 ${a}의 ${b}배예요.`)],
      };
    }
  },
};

// ── 3. muli-expr  곱셈식 나타내기 (fill-blanks 빈칸 2개)  난이도 2 ──────────
const muliExpr: SkillDef = {
  id: 'muli-expr',
  unitId: 'unitMulIntro',
  difficulty: 2,
  title: '곱셈식 나타내기',
  note: '묶어 세기를 곱셈식으로 나타내기. fill-blanks 빈칸 2개 [a, b] 또는 결과 1개.',
  minVariety: 16,
  generate(seed) {
    const rng = new RNG(seed);
    const n = rng.int(2, 5); // 묶음 크기
    const m = rng.int(2, 6); // 묶음 수
    const ans = n * m;
    const emoji = rng.pick(EMOJI_POOL);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // a × b = ? 빈칸 2개 ([a, b])
      const expr: MathExpr = [
        { kind: 'blank', slot: 0 },
        txt(' × '),
        { kind: 'blank', slot: 1 },
        txt(` = ${ans}`),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${nj(emoji, '이/가')} ${n}개씩 ${m}묶음 있어요. 곱셈식으로 나타내세요.`,
        expr,
        blankAnswers: [n, m],
        explanation: [txt(`${n}개씩 ${m}묶음 → ${n} × ${m} = ${ans}`)],
      };
    } else {
      // a × b = □ 결과 1개
      const expr: MathExpr = [
        txt(`${n} × ${m} = `),
        { kind: 'blank', slot: 0 },
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${nj(emoji, '이/가')} ${n}개씩 ${m}묶음일 때 곱셈식의 결과는 얼마인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${n} × ${m} = ${ans}`)],
      };
    }
  },
};

// ── 4. muli-convert  덧셈식↔곱셈식 (fill-blanks)  난이도 2 ─────────────────
const muliConvert: SkillDef = {
  id: 'muli-convert',
  unitId: 'unitMulIntro',
  difficulty: 2,
  title: '덧셈식↔곱셈식',
  note: '반복 덧셈을 곱셈식으로, 곱셈식을 덧셈식으로 변환. fill-blanks.',
  minVariety: 16,
  generate(seed) {
    const rng = new RNG(seed);
    const n = rng.int(2, 6);
    const m = rng.int(2, 6);
    const ans = n * m;
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 덧셈식 → 곱셈식
      const addStr = Array(m).fill(String(n)).join(' + ');
      const expr: MathExpr = [
        { kind: 'blank', slot: 0 },
        txt(' × '),
        { kind: 'blank', slot: 1 },
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `덧셈식을 곱셈식으로 나타내세요.\n${addStr} = ${ans}`,
        expr,
        blankAnswers: [n, m],
        explanation: [txt(`${nj(n, '이/가')} ${m}번 반복 → ${n} × ${m} = ${ans}`)],
      };
    } else {
      // 곱셈식 → 덧셈식 결과
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `곱셈식을 덧셈식으로 나타낼 때 결과는 얼마인가요?\n${n} × ${m} = ?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${Array(m).fill(String(n)).join(' + ')} = ${ans}`)],
      };
    }
  },
};

// ── 5. muli-word  문장제 (fill-blanks)  난이도 2 ────────────────────────────
const muliWord: SkillDef = {
  id: 'muli-word',
  unitId: 'unitMulIntro',
  difficulty: 2,
  word: true,
  title: '곱셈 문장제',
  note: '묶어 세기·몇의 몇 배 개념 문장제. fill-blanks.',
  minVariety: 32,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const emoji = rng.pick(EMOJI_POOL);
    const ITEMS = ['사탕', '연필', '공', '딸기', '카드', '풍선', '쿠키', '별사탕'];
    const item = rng.pick(ITEMS);

    if (pat === 0) {
      // 묶어 세기 문장제
      const n = rng.int(2, 6);
      const m = rng.int(2, 5);
      const ans = n * m;
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${emoji} ${nj(item, '이/가')} ${n}개씩 ${m}봉지 있어요. ${nj(item, '은/는')} 모두 몇 개인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`한 봉지에 ${n}개씩 ${m}봉지니까 ${nj(n, '을/를')} ${m}번 더해요. 곱셈식으로 ${n} × ${m} = ${ans}개예요.`)],
      };
    } else {
      // 몇 배 문장제
      const a = rng.int(2, 8);
      const b = rng.int(2, 4);
      const ans = a * b;
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `민준이는 ${nj(item, '을/를')} ${a}개 가지고 있어요. 수아는 민준이의 ${b}배만큼 가지고 있어요. 수아가 가진 ${nj(item, '은/는')} 몇 개인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${a}의 ${b}배 = ${a} × ${b} = ${ans}개`)],
      };
    }
  },
};

export const unitMulIntroSkills: SkillDef[] = [
  muliGroup,
  muliTimes,
  muliExpr,
  muliConvert,
  muliWord,
];
