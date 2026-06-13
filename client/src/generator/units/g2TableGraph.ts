/**
 * 단원: 표와 그래프 (2022 개정교육과정 2-2 5단원)
 * 성취기준: 이모지 자료 목록 → 표 빈칸 채우기, ○그래프 높이 비교(텍스트),
 * 합계 구하기, 가장 많은 항목 선택(choice), 문장제.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 공통: 표 주제 풀 ─────────────────────────────────────────────────────────
interface TableTopic {
  title: string;
  items: string[];
  emojis: string[];
  unit: string;
}

const TABLE_TOPICS: TableTopic[] = [
  {
    title: '좋아하는 과일',
    items: ['사과', '바나나', '포도', '딸기'],
    emojis: ['🍎', '🍌', '🍇', '🍓'],
    unit: '명',
  },
  {
    title: '좋아하는 동물',
    items: ['강아지', '고양이', '토끼', '햄스터'],
    emojis: ['🐶', '🐱', '🐰', '🐹'],
    unit: '명',
  },
  {
    title: '좋아하는 운동',
    items: ['달리기', '수영', '축구', '줄넘기'],
    emojis: ['🏃', '🏊', '⚽', '🪢'],
    unit: '명',
  },
  {
    title: '모둠별 별 스티커 수',
    items: ['1모둠', '2모둠', '3모둠', '4모둠'],
    emojis: ['⭐', '🌟', '✨', '💫'],
    unit: '개',
  },
  {
    title: '좋아하는 색깔',
    items: ['빨강', '파랑', '초록', '노랑'],
    emojis: ['❤️', '💙', '💚', '💛'],
    unit: '명',
  },
];

interface TableData {
  topic: TableTopic;
  values: number[];   // 4개 항목 각 값 (2~8)
  total: number;
}

function makeTableData(rng: RNG): TableData {
  const topic = rng.pick(TABLE_TOPICS);
  let values: number[] = [];
  for (let tries = 0; tries < 200; tries++) {
    const tv = topic.items.map(() => rng.int(2, 8));
    if (new Set(tv).size >= 3) { values = tv; break; }
  }
  if (values.length === 0) values = [3, 5, 4, 6];
  const total = values.reduce((a, b) => a + b, 0);
  return { topic, values, total };
}

// 이모지 목록 문자열 생성 (각 항목 n개씩)
function makeEmojiList(topic: TableTopic, values: number[]): string {
  return topic.items
    .map((item, i) => `${item}: ${topic.emojis[i % topic.emojis.length].repeat(values[i])}`)
    .join('\n');
}

// ── 1. tbg2-table  표 빈칸 채우기 (fill-blanks)  난이도 1 ──────────────────────
const tbg2Table: SkillDef = {
  id: 'tbg2-table',
  unitId: 'unitTableGraph',
  difficulty: 1,
  title: '표 빈칸 채우기',
  note: '이모지 목록을 보고 표의 빈칸(한 항목의 수)을 채운다. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = makeTableData(rng);
    // 빈칸 항목 1개 선택
    const blankIdx = rng.int(0, 3);
    const answer = data.values[blankIdx];
    const blankItem = data.topic.items[blankIdx];
    const emojiList = makeEmojiList(data.topic, data.values);

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt(data.topic.unit)];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `자료를 보고 표의 빈칸을 채우세요.\n${emojiList}\n\n[${data.topic.title}] ${blankItem}: □${data.topic.unit}`,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`${blankItem} 이모지가 ${answer}개이므로 ${answer}${data.topic.unit}이에요.`)],
    };
  },
};

// ── 2. tbg2-graph  ○그래프 높이 비교 (fill-blanks)  난이도 1 ────────────────────
const tbg2Graph: SkillDef = {
  id: 'tbg2-graph',
  unitId: 'unitTableGraph',
  difficulty: 1,
  title: '○그래프 높이 비교',
  note: '텍스트로 제시된 ○그래프 높이 숫자를 비교. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = makeTableData(rng);
    const maxIdx = data.values.indexOf(Math.max(...data.values));
    const minIdx = data.values.indexOf(Math.min(...data.values));
    const isMax = rng.chance(0.5);
    const targetIdx = isMax ? maxIdx : minIdx;
    const answer = data.values[targetIdx];

    // 텍스트 그래프 표현
    const graphText = data.topic.items
      .map((item, i) => `${item}: ○ × ${data.values[i]}`)
      .join(', ');
    const questionWord = isMax ? '가장 많은' : '가장 적은';
    const targetItem = data.topic.items[targetIdx];

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt(data.topic.unit)];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `그래프를 보고 답하세요.\n[${data.topic.title}] ${graphText}\n\n${questionWord} ${targetItem}은 몇 ${data.topic.unit}인가요?`,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`${targetItem}의 ○ 수는 ${answer}개예요.`)],
    };
  },
};

// ── 3. tbg2-total  합계 구하기 (fill-blanks)  난이도 1 ─────────────────────────
const tbg2Total: SkillDef = {
  id: 'tbg2-total',
  unitId: 'unitTableGraph',
  difficulty: 1,
  title: '합계 구하기',
  note: '표의 각 항목을 더해 합계를 구한다. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = makeTableData(rng);
    const tableText = data.topic.items
      .map((item, i) => `${item}: ${data.values[i]}${data.topic.unit}`)
      .join(', ');

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt(data.topic.unit)];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `표를 보고 합계를 구하세요.\n[${data.topic.title}] ${tableText}\n\n합계: □${data.topic.unit}`,
      expr,
      blankAnswers: [data.total],
      explanation: [txt(`각 항목의 수를 모두 더해요. ${data.values.join(' + ')} = ${data.total}${data.topic.unit}예요.`)],
    };
  },
};

// ── 4. tbg2-most  가장 많은 항목 (choice)  난이도 1 ───────────────────────────
const tbg2Most: SkillDef = {
  id: 'tbg2-most',
  unitId: 'unitTableGraph',
  difficulty: 1,
  title: '가장 많은/적은 항목',
  note: '표를 보고 가장 많은 또는 가장 적은 항목을 선택. choice 4지선다.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = makeTableData(rng);
    const isMax = rng.chance(0.5);
    const targetVal = isMax ? Math.max(...data.values) : Math.min(...data.values);
    const targetIdx = data.values.indexOf(targetVal);
    const answer = data.topic.items[targetIdx];
    const tableText = data.topic.items
      .map((item, i) => `${item}: ${data.values[i]}${data.topic.unit}`)
      .join(', ');

    const answerVal = txc(answer);
    const distractors = data.topic.items
      .filter((_, i) => i !== targetIdx)
      .map((item) => txc(item));
    const { choices, answerIndex } = buildChoices(answerVal, distractors, rng, 4);
    const questionWord = isMax ? '가장 많이' : '가장 적게';
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `표를 보고 ${questionWord} 좋아하는 것을 고르세요.\n[${data.topic.title}] ${tableText}`,
      choices,
      answerIndex,
      explanation: [txt(`${answer}이 ${targetVal}${data.topic.unit}으로 ${questionWord} 선택받았어요.`)],
    };
  },
};

// ── 5. tbg2-word  표와 그래프 문장제 (fill-blanks)  난이도 2 ──────────────────
const tbg2Word: SkillDef = {
  id: 'tbg2-word',
  unitId: 'unitTableGraph',
  difficulty: 2,
  word: true,
  title: '표와 그래프 문장제',
  note: '표에서 두 항목 비교(차이) 또는 합계 관련 문장제. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = makeTableData(rng);
    const pat = rng.int(0, 1);
    const tableText = data.topic.items
      .map((item, i) => `${item}: ${data.values[i]}${data.topic.unit}`)
      .join(', ');

    if (pat === 0) {
      // 두 항목 차이 (diff >= 1 보장)
      let idxA = 0, idxB = 2, diff = 1;
      let vA = data.values[0], vB = data.values[2];
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(0, 3);
        const tb = rng.int(0, 3);
        if (ta === tb) continue;
        const tva = data.values[ta];
        const tvb = data.values[tb];
        const tdiff = Math.abs(tva - tvb);
        if (tdiff >= 1) { idxA = ta; idxB = tb; vA = tva; vB = tvb; diff = tdiff; break; }
      }
      const bigItem = vA >= vB ? data.topic.items[idxA] : data.topic.items[idxB];
      const smallItem = vA < vB ? data.topic.items[idxA] : data.topic.items[idxB];
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt(data.topic.unit)];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `표를 보고 답하세요.\n[${data.topic.title}] ${tableText}\n\n${bigItem}은 ${smallItem}보다 몇 ${data.topic.unit} 더 많은가요?`,
        expr,
        blankAnswers: [diff],
        explanation: [txt(`더 많은 ${Math.max(vA, vB)}${data.topic.unit}에서 더 적은 ${Math.min(vA, vB)}${data.topic.unit}를 빼요. ${Math.max(vA, vB)} − ${Math.min(vA, vB)} = ${diff}${data.topic.unit}예요.`)],
      };
    } else {
      // 합계 문장제
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt(data.topic.unit)];
      const names = ['우리 반', '2학년 전체', '우리 학교'];
      const name = rng.pick(names);
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `표를 보고 답하세요.\n[${data.topic.title}] ${tableText}\n\n${name} 학생은 모두 몇 ${data.topic.unit}인가요?`,
        expr,
        blankAnswers: [data.total],
        explanation: [txt(`각 항목의 수를 모두 더해요. ${data.values.join(' + ')} = ${data.total}${data.topic.unit}예요.`)],
      };
    }
  },
};

export const unitTableGraphSkills: SkillDef[] = [
  tbg2Table,
  tbg2Graph,
  tbg2Total,
  tbg2Most,
  tbg2Word,
];
