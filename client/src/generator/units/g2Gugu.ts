/**
 * 단원: 곱셈구구 (2022 개정교육과정 2-2 2단원)
 * 성취기준: 2·5단, 3·6단, 4·8단, 7·9단 구구단 암기, 구구단 빈칸(□×n=결과),
 * 0과 1의 곱, 문장제.
 *
 * 주의: 0의 곱 스킬은 답이 0인 경우 fill-blanks 금지(양의 정수 위반) → choice 형식.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. gugu-25  2단·5단 (fill-blanks)  난이도 1 ──────────────────────────────
const gugu25: SkillDef = {
  id: 'gugu-25',
  unitId: 'unitGugu',
  difficulty: 1,
  title: '2단·5단 구구',
  note: '2단(2×1~2×9), 5단(5×1~5×9) 계산. fill-blanks.',
  minVariety: 18,
  generate(seed) {
    const rng = new RNG(seed);
    const dan = rng.pick([2, 5] as const);
    const n = rng.int(1, 9);
    const ans = dan * n;
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // dan × n = ?
      const expr: MathExpr = [txt(`${dan} × ${n} = `), { kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '구구단을 계산하세요.',
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${dan} × ${n} = ${ans}`)],
      };
    } else {
      // n × dan = ?
      const expr: MathExpr = [txt(`${n} × ${dan} = `), { kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '구구단을 계산하세요.',
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${n} × ${dan} = ${dan} × ${n} = ${ans}`)],
      };
    }
  },
};

// ── 2. gugu-36  3단·6단 (fill-blanks)  난이도 1 ──────────────────────────────
const gugu36: SkillDef = {
  id: 'gugu-36',
  unitId: 'unitGugu',
  difficulty: 1,
  title: '3단·6단 구구',
  note: '3단(3×1~3×9), 6단(6×1~6×9) 계산. fill-blanks.',
  minVariety: 18,
  generate(seed) {
    const rng = new RNG(seed);
    const dan = rng.pick([3, 6] as const);
    const n = rng.int(1, 9);
    const ans = dan * n;
    const pat = rng.int(0, 1);

    if (pat === 0) {
      const expr: MathExpr = [txt(`${dan} × ${n} = `), { kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '구구단을 계산하세요.',
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${dan} × ${n} = ${ans}`)],
      };
    } else {
      const expr: MathExpr = [txt(`${n} × ${dan} = `), { kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '구구단을 계산하세요.',
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${n} × ${dan} = ${dan} × ${n} = ${ans}`)],
      };
    }
  },
};

// ── 3. gugu-48  4단·8단 (fill-blanks)  난이도 2 ──────────────────────────────
const gugu48: SkillDef = {
  id: 'gugu-48',
  unitId: 'unitGugu',
  difficulty: 2,
  title: '4단·8단 구구',
  note: '4단(4×1~4×9), 8단(8×1~8×9) 계산. fill-blanks.',
  minVariety: 18,
  generate(seed) {
    const rng = new RNG(seed);
    const dan = rng.pick([4, 8] as const);
    const n = rng.int(1, 9);
    const ans = dan * n;
    const pat = rng.int(0, 1);

    if (pat === 0) {
      const expr: MathExpr = [txt(`${dan} × ${n} = `), { kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '구구단을 계산하세요.',
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${dan} × ${n} = ${ans}`)],
      };
    } else {
      const expr: MathExpr = [txt(`${n} × ${dan} = `), { kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '구구단을 계산하세요.',
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${n} × ${dan} = ${dan} × ${n} = ${ans}`)],
      };
    }
  },
};

// ── 4. gugu-79  7단·9단 (fill-blanks)  난이도 2 ──────────────────────────────
const gugu79: SkillDef = {
  id: 'gugu-79',
  unitId: 'unitGugu',
  difficulty: 2,
  title: '7단·9단 구구',
  note: '7단(7×1~7×9), 9단(9×1~9×9) 계산. fill-blanks.',
  minVariety: 18,
  generate(seed) {
    const rng = new RNG(seed);
    const dan = rng.pick([7, 9] as const);
    const n = rng.int(1, 9);
    const ans = dan * n;
    const pat = rng.int(0, 1);

    if (pat === 0) {
      const expr: MathExpr = [txt(`${dan} × ${n} = `), { kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '구구단을 계산하세요.',
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${dan} × ${n} = ${ans}`)],
      };
    } else {
      const expr: MathExpr = [txt(`${n} × ${dan} = `), { kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '구구단을 계산하세요.',
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${n} × ${dan} = ${dan} × ${n} = ${ans}`)],
      };
    }
  },
};

// ── 5. gugu-missing  구구 빈칸(□×n=결과) (fill-blanks)  난이도 2 ────────────
const guguMissing: SkillDef = {
  id: 'gugu-missing',
  unitId: 'unitGugu',
  difficulty: 2,
  title: '구구단 빈칸',
  note: '□×n=결과 또는 n×□=결과 형태. fill-blanks. 1~9단(1단 포함).',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const dan = rng.int(2, 9);
    const n = rng.int(1, 9);
    const result = dan * n;
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // □ × dan = result  (answer: n)
      const expr: MathExpr = [
        { kind: 'blank', slot: 0 },
        txt(` × ${dan} = ${result}`),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '□에 알맞은 수를 쓰세요.',
        expr,
        blankAnswers: [n],
        explanation: [txt(`□ × ${dan} = ${result} → □ = ${result} ÷ ${dan} = ${n}`)],
      };
    } else {
      // dan × □ = result  (answer: n)
      const expr: MathExpr = [
        txt(`${dan} × `),
        { kind: 'blank', slot: 0 },
        txt(` = ${result}`),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '□에 알맞은 수를 쓰세요.',
        expr,
        blankAnswers: [n],
        explanation: [txt(`${dan} × □ = ${result} → □ = ${result} ÷ ${dan} = ${n}`)],
      };
    }
  },
};

// ── 6. gugu-zero  0과 1의 곱 (choice)  난이도 1 ──────────────────────────────
// 답이 0이 될 수 있으므로 fill-blanks 불가 → choice 형식
const guguZero: SkillDef = {
  id: 'gugu-zero',
  unitId: 'unitGugu',
  difficulty: 1,
  title: '0과 1의 곱',
  note: '0×n=0, n×0=0, 1×n=n, n×1=n. choice 4지선다.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    // 0 또는 1 곱하기
    const zeroOrOne = rng.pick([0, 1] as const);
    const n = rng.int(0, 9);
    const result = zeroOrOne * n;
    const pat = rng.int(0, 1);

    let promptText: string;
    if (pat === 0) {
      promptText = `${zeroOrOne} × ${n} = ?`;
    } else {
      promptText = `${n} × ${zeroOrOne} = ?`;
    }

    const answerVal = txc(String(result));
    // 오답: 다른 그럴듯한 값
    const distractors: ChoiceValue[] = [];
    const cands = new Set<number>();
    cands.add(result);
    // 오개념 기반 오답 후보
    const wrongCands = [n, zeroOrOne, n + zeroOrOne, n > 0 ? n - 1 : 2, 1, 0, n + 1];
    for (const w of wrongCands) {
      if (!cands.has(w) && w >= 0) {
        cands.add(w);
        distractors.push(txc(String(w)));
        if (distractors.length >= 3) break;
      }
    }
    // 부족하면 추가
    for (let extra = 2; distractors.length < 3; extra++) {
      if (!cands.has(extra)) {
        cands.add(extra);
        distractors.push(txc(String(extra)));
      }
    }

    const { choices, answerIndex } = buildChoices(answerVal, distractors, rng, 4);
    const explPrefix = pat === 0 ? `${zeroOrOne} × ${n}` : `${n} × ${zeroOrOne}`;
    const explSuffix = zeroOrOne === 0 ? `어떤 수에 0을 곱하면 항상 0이에요.` : `어떤 수에 1을 곱하면 그 수 자체예요.`;
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `계산하세요.\n${promptText}`,
      choices,
      answerIndex,
      explanation: [txt(`${explPrefix} = ${result}. ${explSuffix}`)],
    };
  },
};

// ── 7. gugu-word  구구단 문장제 (fill-blanks)  난이도 2 ──────────────────────
const EMOJI_POOL_GG = ['🍎', '⭐', '🌸', '🚗', '⚽', '🎈', '🍬', '🐰', '🌻', '🍪', '🎀', '🍡'] as const;
const ITEMS_GG = ['사탕', '연필', '공', '딸기', '카드', '풍선', '쿠키', '스티커', '블록', '구슬'];
const guguWord: SkillDef = {
  id: 'gugu-word',
  unitId: 'unitGugu',
  difficulty: 2,
  word: true,
  title: '구구단 문장제',
  note: '구구단을 이용한 묶어 세기 문장제. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const dan = rng.int(2, 9);
    const n = rng.int(2, 9);
    const ans = dan * n;
    const emoji = rng.pick(EMOJI_POOL_GG);
    const item = rng.pick(ITEMS_GG);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${emoji} ${item}이 ${dan}개씩 ${n}봉지 있어요. ${item}은 모두 몇 개인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${dan} × ${n} = ${ans}개`)],
      };
    } else {
      // 배열 형태
      const rows = rng.int(2, 5);
      const cols = rng.int(2, 5);
      const total = rows * cols;
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${emoji} ${item}을 ${rows}줄로 놓았더니 한 줄에 ${cols}개씩 있어요. ${item}은 모두 몇 개인가요?`,
        expr,
        blankAnswers: [total],
        explanation: [txt(`${rows} × ${cols} = ${total}개`)],
      };
    }
  },
};

export const unitGuguSkills: SkillDef[] = [
  gugu25,
  gugu36,
  gugu48,
  gugu79,
  guguMissing,
  guguZero,
  guguWord,
];
