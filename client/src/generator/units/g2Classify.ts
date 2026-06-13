/**
 * 단원: 분류하기 (2022 개정교육과정 2-1 5단원)
 * 성취기준: 기준에 따라 분류하고 세며, 분류 결과를 표로 나타내고
 * 가장 많은/적은 종류를 알 수 있다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. class2-count  기준에 따라 세기 (fill-blanks)  난이도 1 ───────────────
const class2Count: SkillDef = {
  id: 'class2-count',
  unitId: 'unitClassify',
  difficulty: 1,
  title: '기준에 따라 세기',
  note: '이모지 목록에서 특정 기준(색/종류)에 맞는 것 세기. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    // 여러 종류의 이모지를 나열하고 특정 종류 개수 세기 (타깃 최소 1개 보장)
    const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓'];
    const NAMES: Record<string, string> = {
      '🍎': '사과', '🍊': '귤', '🍋': '레몬', '🍇': '포도', '🍓': '딸기',
    };
    const target = rng.pick(EMOJIS);
    const total = rng.int(7, 12);
    const items: string[] = [target]; // 최소 1개 보장
    for (let i = 1; i < total; i++) {
      items.push(rng.pick(EMOJIS));
    }
    const shuffled = rng.shuffle(items);
    const count = shuffled.filter((e) => e === target).length;

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 중 ${NAMES[target]}(${target})은 몇 개인가요?\n${shuffled.join(' ')}`,
      expr,
      blankAnswers: [count],
      explanation: [txt(`${NAMES[target]}(${target})은 ${count}개예요.`)],
    };
  },
};

// ── 2. class2-table  분류 표 빈칸 (fill-blanks)  난이도 2 ─────────────────
const class2Table: SkillDef = {
  id: 'class2-table',
  unitId: 'unitClassify',
  difficulty: 2,
  title: '분류 표 빈칸',
  note: '표의 합계 또는 특정 칸 빈칸 채우기. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 합계 구하기
      const CATEGORIES = ['사과', '귤', '포도', '딸기'];
      const n = rng.int(2, 4); // 몇 가지 과일
      const cats = rng.sample(CATEGORIES, n);
      const counts = cats.map(() => rng.int(1, 8));
      const total = counts.reduce((s, c) => s + c, 0);
      const tableStr = cats.map((c, i) => `${c}: ${counts[i]}개`).join(', ');
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `분류 결과입니다. 합계는 몇 개인가요?\n${tableStr}`,
        expr,
        blankAnswers: [total],
        explanation: [txt(`${counts.join(' + ')} = ${total}개`)],
      };
    } else {
      // 합계와 일부를 알 때 나머지 구하기
      const CATEGORIES2 = ['빨간색', '파란색', '노란색'];
      const counts = CATEGORIES2.map(() => rng.int(2, 8));
      const total = counts.reduce((s, c) => s + c, 0);
      const missingIdx = rng.int(0, 2);
      const known = counts.filter((_, i) => i !== missingIdx);
      const knownSum = known.reduce((s, c) => s + c, 0);
      const ans = total - knownSum;
      const tableStr = CATEGORIES2.map((c, i) =>
        i === missingIdx ? `${c}: □개` : `${c}: ${counts[i]}개`
      ).join(', ');
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `분류 결과입니다. 합계가 ${total}개일 때 □에 알맞은 수는 얼마인가요?\n${tableStr}`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${total} - ${knownSum} = ${ans}`)],
      };
    }
  },
};

// ── 3. class2-most  가장 많은 종류 (choice)  난이도 2 ──────────────────────
const class2Most: SkillDef = {
  id: 'class2-most',
  unitId: 'unitClassify',
  difficulty: 2,
  title: '가장 많은 종류',
  note: '분류 결과에서 가장 많은/적은 종류 고르기. choice.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const CATEGORIES3 = ['사과', '귤', '포도', '딸기'];
    const cats = rng.sample(CATEGORIES3, 4);
    let counts: number[] = [];
    // 모두 다른 수
    for (let tries = 0; tries < 200; tries++) {
      const tc = cats.map(() => rng.int(1, 10));
      if (new Set(tc).size === tc.length) { counts = tc; break; }
    }
    if (counts.length === 0) counts = [4, 2, 7, 1];

    const askMost = rng.int(0, 1) === 0;
    const maxIdx = counts.indexOf(Math.max(...counts));
    const minIdx = counts.indexOf(Math.min(...counts));
    const ansIdx = askMost ? maxIdx : minIdx;
    const answerVal = txc(cats[ansIdx]);
    const others = cats.filter((_, i) => i !== ansIdx).map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, others, rng);

    const tableStr = cats.map((c, i) => `${c}: ${counts[i]}개`).join(', ');
    const word = askMost ? '가장 많은' : '가장 적은';
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `분류 결과입니다. ${word} 종류는 무엇인가요?\n${tableStr}`,
      choices,
      answerIndex,
      explanation: [txt(`${word} 것은 ${cats[ansIdx]}(${counts[ansIdx]}개)예요.`)],
    };
  },
};

// ── 4. class2-word  문장제 (fill-blanks)  난이도 2 ──────────────────────────
const class2Word: SkillDef = {
  id: 'class2-word',
  unitId: 'unitClassify',
  difficulty: 2,
  word: true,
  title: '분류하기 문장제',
  note: '분류 결과를 활용한 문장제. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const EMOJIS2 = ['🔴', '🔵', '🟡', '🟢', '🟣'];
    const NAMES2: Record<string, string> = {
      '🔴': '빨간색', '🔵': '파란색', '🟡': '노란색', '🟢': '초록색', '🟣': '보라색',
    };
    const target = rng.pick(EMOJIS2);
    const others2 = EMOJIS2.filter((e) => e !== target);
    const total = rng.int(8, 14);
    // 최소 1개의 비-타깃, 최소 1개의 타깃 보장
    const items: string[] = [target, rng.pick(others2)];
    for (let i = 2; i < total; i++) {
      items.push(rng.pick(EMOJIS2));
    }
    const shuffled2 = rng.shuffle(items);
    const count = shuffled2.filter((e) => e === target).length;
    const other = shuffled2.length - count;

    const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `색깔 공을 분류했어요. ${NAMES2[target]}이 아닌 공은 몇 개인가요?\n${shuffled2.join(' ')}`,
      expr,
      blankAnswers: [other],
      explanation: [txt(`전체 ${shuffled2.length}개 중 ${NAMES2[target]} ${count}개이므로, 나머지는 ${shuffled2.length} - ${count} = ${other}개`)],
    };
  },
};

export const unitClassifySkills: SkillDef[] = [
  class2Count,
  class2Table,
  class2Most,
  class2Word,
];
