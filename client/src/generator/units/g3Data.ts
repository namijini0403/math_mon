/**
 * 단원: 자료의 정리 (2022 개정교육과정 3-2 6단원)
 * 성취기준: 표 텍스트 제시→합계·차, 그림그래프 읽기(큰 그림=10·작은 그림=1),
 * 값→그림 개수 역산(빈칸 2개 [큰,작은]), 가장 많은/적은 항목, 문장제
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 공통: 표 주제 풀 ─────────────────────────────────────────────────
interface DataTopic {
  title: string;
  unit: string;
  items: string[];
}

const DATA_TOPICS: DataTopic[] = [
  { title: '좋아하는 과일', unit: '명', items: ['사과', '바나나', '포도', '귤'] },
  { title: '좋아하는 동물', unit: '명', items: ['강아지', '고양이', '토끼', '금붕어'] },
  { title: '좋아하는 계절', unit: '명', items: ['봄', '여름', '가을', '겨울'] },
  { title: '모둠별 별 개수', unit: '개', items: ['1모둠', '2모둠', '3모둠', '4모둠'] },
  { title: '마을별 어린이 수', unit: '명', items: ['가 마을', '나 마을', '다 마을', '라 마을'] },
  { title: '요일별 방문자 수', unit: '명', items: ['월', '화', '수', '목'] },
  { title: '좋아하는 운동', unit: '명', items: ['축구', '수영', '달리기', '농구'] },
];

interface TableData {
  topic: DataTopic;
  items: string[];
  values: number[]; // 서로 다른 값 (2~30, 모두 양수)
  dataText: string;
}

/** 4개 항목, 값 서로 다름 보장 */
function generateTableData(rng: RNG, maxVal = 30): TableData {
  const topic = rng.pick(DATA_TOPICS);
  // 항목 4개
  const items = rng.sample(topic.items, Math.min(4, topic.items.length));

  let values: number[] = [];
  for (let tries = 0; tries < 200; tries++) {
    const tv = items.map(() => rng.int(2, maxVal));
    if (new Set(tv).size === tv.length) { values = tv; break; }
  }
  if (values.length === 0) values = items.map((_, i) => (i + 2) * 3);

  const dataText = items.map((item, i) => `${item}: ${values[i]}${topic.unit}`).join(', ');

  return { topic, items, values, dataText };
}

// ── 1. data3-table-sum  표 읽기 → 합계 (fill-blanks)  난이도 1 ───────
const data3TableSum: SkillDef = {
  id: 'data3-table-sum',
  unitId: 'unitData3',
  difficulty: 1,
  title: '표 읽기 → 합계',
  note: '표를 텍스트로 제시하고 전체 합 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = generateTableData(rng);
    const ans = data.values.reduce((a, b) => a + b, 0);

    const expr: MathExpr = [
      txt('합계: '),
      { kind: 'blank', slot: 0 },
      txt(data.topic.unit),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `[${data.topic.title}]\n${data.dataText}\n\n모든 항목의 합계는 몇 ${data.topic.unit}인가요?`,
      expr,
      blankAnswers: [ans],
      explanation: [txt(`합계: ${data.values.join(' + ')} = ${ans}${data.topic.unit}`)],
    };
  },
};

// ── 2. data3-table-diff  표 읽기 → 차 (fill-blanks)  난이도 2 ─────────
const data3TableDiff: SkillDef = {
  id: 'data3-table-diff',
  unitId: 'unitData3',
  difficulty: 2,
  title: '표 읽기 → 두 항목의 차',
  note: '표 텍스트 제시 후 두 항목 차이 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = generateTableData(rng);

    let i1 = 0, i2 = 1;
    for (let tries = 0; tries < 50; tries++) {
      const ti1 = rng.int(0, data.items.length - 1);
      let ti2 = rng.int(0, data.items.length - 1);
      if (ti2 === ti1) ti2 = (ti1 + 1) % data.items.length;
      if (data.values[ti1] !== data.values[ti2]) { i1 = ti1; i2 = ti2; break; }
    }

    const ans = Math.abs(data.values[i1] - data.values[i2]);
    const item1 = data.items[i1];
    const item2 = data.items[i2];

    const expr: MathExpr = [
      txt(`${item1}과 ${item2}의 차: `),
      { kind: 'blank', slot: 0 },
      txt(data.topic.unit),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `[${data.topic.title}]\n${data.dataText}\n\n${item1}과 ${item2}의 차는 몇 ${data.topic.unit}인가요?`,
      expr,
      blankAnswers: [ans],
      explanation: [
        txt(`|${data.values[i1]} - ${data.values[i2]}| = ${ans}${data.topic.unit}`),
      ],
    };
  },
};

// ── 3. data3-pictograph-read  그림그래프 읽기 (fill-blanks) 난이도 1 ─
// 큰 그림(🔵)=10명, 작은 그림(🔹)=1명. 그림 수 → 값
const data3PictoRead: SkillDef = {
  id: 'data3-picto-read',
  unitId: 'unitData3',
  difficulty: 1,
  title: '그림그래프 읽기 (그림 개수→값)',
  note: '큰 그림=10, 작은 그림=1. 주어진 그림 개수로 값 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const topic = rng.pick(DATA_TOPICS);
    const item = rng.pick(topic.items);
    // 큰 그림 0~5개, 작은 그림 0~9개 (합 >= 1)
    let big: number, small: number;
    big = 0; small = 1;

    for (let tries = 0; tries < 200; tries++) {
      const tb = rng.int(0, 5);
      const ts = rng.int(0, 9);
      if (tb + ts >= 1) { big = tb; small = ts; break; }
    }

    const ans = big * 10 + small;

    const bigPic = '🔵'.repeat(big);
    const smallPic = '🔹'.repeat(small);
    const picStr = bigPic + smallPic || '(없음)';

    const expr: MathExpr = [
      txt(`${item}: `),
      { kind: 'blank', slot: 0 },
      txt(topic.unit),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `[${topic.title}] 그림그래프 (🔵=10${topic.unit}, 🔹=1${topic.unit})\n${item}: ${picStr}\n\n${item}은(는) 몇 ${topic.unit}인가요?`,
      expr,
      blankAnswers: [ans],
      explanation: [
        txt(`🔵 ${big}개 × 10 + 🔹 ${small}개 × 1 = ${big * 10} + ${small} = ${ans}${topic.unit}`),
      ],
    };
  },
};

// ── 4. data3-pictograph-inv  값→그림 개수 역산 (fill-blanks 2개) 난이도 2
// 값이 주어지면 큰 그림 몇 개, 작은 그림 몇 개인지
// 빈칸 둘 다 > 0 보장: big >= 1, small >= 1
const data3PictoInv: SkillDef = {
  id: 'data3-picto-inv',
  unitId: 'unitData3',
  difficulty: 2,
  title: '그림그래프 역산 (값→그림 개수)',
  note: '값이 주어지면 큰 그림(10)/작은 그림(1) 각 몇 개인지. 빈칸 [큰,작은]. 둘 다 >= 1 보장. fill-blanks.',
  minVariety: 45,
  generate(seed) {
    const rng = new RNG(seed);
    const topic = rng.pick(DATA_TOPICS);
    const item = rng.pick(topic.items);
    // 큰 그림 1~5개, 작은 그림 1~9개 → 둘 다 >= 1 보장
    const big = rng.int(1, 5);
    const small = rng.int(1, 9);
    const val = big * 10 + small;

    const expr: MathExpr = [
      txt('큰 그림: '),
      { kind: 'blank', slot: 0 },
      txt('개, 작은 그림: '),
      { kind: 'blank', slot: 1 },
      txt('개'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `[${topic.title}] 그림그래프 (🔵=10${topic.unit}, 🔹=1${topic.unit})\n${item}의 수가 ${val}${topic.unit}이라면, 큰 그림(🔵)과 작은 그림(🔹)은 각각 몇 개인가요?`,
      expr,
      blankAnswers: [big, small],
      explanation: [
        txt(`${val} ÷ 10 = ${big} 나머지 ${small}. 큰 그림 ${big}개, 작은 그림 ${small}개`),
      ],
    };
  },
};

// ── 5. data3-most-least  가장 많은/적은 항목 (choice) 난이도 1 ─────────
const data3MostLeast: SkillDef = {
  id: 'data3-most-least',
  unitId: 'unitData3',
  difficulty: 1,
  title: '가장 많은/적은 항목',
  note: '표를 텍스트로 보고 가장 많은/적은 항목 고르기. 4지선다.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = generateTableData(rng);
    const isMax = rng.chance(0.5);

    const maxVal = Math.max(...data.values);
    const minVal = Math.min(...data.values);
    const answerIdx = isMax ? data.values.indexOf(maxVal) : data.values.indexOf(minVal);
    const answer = data.items[answerIdx];

    const answerVal = txc(answer);
    const candidates = data.items.filter(it => it !== answer).map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `[${data.topic.title}]\n${data.dataText}\n\n가장 ${isMax ? '많은' : '적은'} 항목은 무엇인가요?`,
      choices,
      answerIndex,
      explanation: [
        txt(`${data.items.map((it, i) => `${it}=${data.values[i]}`).join(', ')}`),
        txt(`. 가장 ${isMax ? '많은' : '적은'} 항목: ${answer}(${isMax ? maxVal : minVal}${data.topic.unit})`),
      ],
    };
  },
};

// ── 6. data3-word  자료의 정리 문장제 (fill-blanks) 난이도 3 ──────────
const data3Word: SkillDef = {
  id: 'data3-word',
  unitId: 'unitData3',
  difficulty: 3,
  word: true,
  title: '자료의 정리 문장제',
  note: '표/그림그래프를 이용한 문장제. 패턴 3가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let prompt: string;
    let ans: number;
    let unit: string;
    let expl: string;

    if (pat === 0) {
      // 합계에서 한 항목 뺀 나머지
      const data = generateTableData(rng);
      const total = data.values.reduce((a, b) => a + b, 0);
      const idx = rng.int(0, data.items.length - 1);
      const known = data.values[idx];
      ans = total - known;
      unit = data.topic.unit;
      prompt = `[${data.topic.title}]\n${data.dataText}\n\n전체는 ${total}${unit}이고 ${data.items[idx]}이 ${known}${unit}이라면, 나머지 항목의 합은 몇 ${unit}인가요?`;
      expl = `${total} - ${known} = ${ans}${unit}`;
    } else if (pat === 1) {
      // 가장 많은 것과 가장 적은 것의 차
      const data = generateTableData(rng);
      const maxVal = Math.max(...data.values);
      const minVal = Math.min(...data.values);
      const maxItem = data.items[data.values.indexOf(maxVal)];
      const minItem = data.items[data.values.indexOf(minVal)];
      ans = maxVal - minVal;
      unit = data.topic.unit;
      prompt = `[${data.topic.title}]\n${data.dataText}\n\n가장 많은 ${maxItem}은 가장 적은 ${minItem}보다 몇 ${unit} 더 많은가요?`;
      expl = `${maxVal} - ${minVal} = ${ans}${unit}`;
    } else {
      // 그림그래프 문장제: 두 항목 합
      const topic = rng.pick(DATA_TOPICS);
      const items = rng.sample(topic.items, 2);
      const big1 = rng.int(1, 4);
      const small1 = rng.int(1, 9);
      const big2 = rng.int(1, 4);
      const small2 = rng.int(1, 9);
      const v1 = big1 * 10 + small1;
      const v2 = big2 * 10 + small2;
      ans = v1 + v2;
      unit = topic.unit;
      prompt = `[${topic.title}] 그림그래프 (🔵=10${unit}, 🔹=1${unit})\n${items[0]}: 🔵${big1}개 🔹${small1}개 (${v1}${unit})\n${items[1]}: 🔵${big2}개 🔹${small2}개 (${v2}${unit})\n\n${items[0]}과 ${items[1]}을 합치면 모두 몇 ${unit}인가요?`;
      expl = `${v1} + ${v2} = ${ans}${unit}`;
    }

    if (ans <= 0) { ans = 1; }

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
      prompt,
      expr,
      blankAnswers: [ans],
      explanation: [txt(expl)],
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitData3Skills: SkillDef[] = [
  data3TableSum,
  data3TableDiff,
  data3PictoRead,
  data3PictoInv,
  data3MostLeast,
  data3Word,
];
