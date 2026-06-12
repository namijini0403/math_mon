/**
 * 단원: 막대그래프 (2022 개정교육과정 4-1 5단원)
 * 성취기준: 막대그래프를 읽고 해석하며, 주어진 자료에서 값을 비교한다.
 * 표를 텍스트로 제시 (그림 없음).
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 공통: 막대그래프 주제 풀 ───────────────────────────────────────
interface BarTopicData {
  title: string;
  unit: string;
  items: string[];
}

const BAR_TOPICS: BarTopicData[] = [
  { title: '좋아하는 과일', unit: '명', items: ['사과', '바나나', '포도', '귤', '딸기', '수박'] },
  { title: '좋아하는 계절', unit: '명', items: ['봄', '여름', '가을', '겨울'] },
  { title: '좋아하는 동물', unit: '명', items: ['강아지', '고양이', '토끼', '햄스터', '금붕어'] },
  { title: '요일별 도서관 방문자 수', unit: '명', items: ['월요일', '화요일', '수요일', '목요일', '금요일'] },
  { title: '마을별 나무 수', unit: '그루', items: ['가 마을', '나 마을', '다 마을', '라 마을'] },
  { title: '좋아하는 운동', unit: '명', items: ['축구', '야구', '수영', '달리기', '농구'] },
  { title: '모둠별 딱지 수', unit: '개', items: ['1모둠', '2모둠', '3모둠', '4모둠'] },
  { title: '날씨별 날 수', unit: '일', items: ['맑음', '흐림', '비', '눈'] },
];

interface BarData {
  topic: BarTopicData;
  selectedItems: string[];   // 4개 항목
  values: number[];          // 각 항목의 값 (모두 다름)
  /** 자료 텍스트: "사과: 7명, 바나나: 4명, 포도: 6명, 귤: 3명" */
  dataText: string;
}

function generateBarData(rng: RNG, scale: number = 1): BarData {
  const topic = rng.pick(BAR_TOPICS);
  // 항목 4개 선택
  const selectedItems = rng.sample(topic.items, Math.min(4, topic.items.length));

  // 값: 2~20 범위에서 서로 다른 값 (scale로 단위 조정)
  let values: number[] = [];
  for (let tries = 0; tries < 200; tries++) {
    const tv = selectedItems.map(() => rng.int(2, 20) * scale);
    const allUnique = new Set(tv).size === tv.length;
    if (allUnique) { values = tv; break; }
  }
  if (values.length === 0) values = selectedItems.map((_, i) => (i + 2) * scale);

  const dataText = selectedItems
    .map((item, i) => `${item}: ${values[i]}${topic.unit}`)
    .join(', ');

  return { topic, selectedItems, values, dataText };
}

// ── 1. bar-most  가장 많은/적은 항목 (choice)  난이도 1 ───────────────
const barMost: SkillDef = {
  id: 'bar-most',
  unitId: 'unitBarGraph',
  difficulty: 1,
  title: '가장 많은/적은 항목',
  note: '표를 텍스트로 보고 가장 많은 또는 적은 항목을 선택. 4지선다.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = generateBarData(rng);
    const isMax = rng.chance(0.5);

    const maxVal = Math.max(...data.values);
    const minVal = Math.min(...data.values);
    const answerIdx = isMax
      ? data.values.indexOf(maxVal)
      : data.values.indexOf(minVal);
    const answer = data.selectedItems[answerIdx];

    const answerVal = txc(answer);
    const candidates = data.selectedItems.filter(it => it !== answer).map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    const prompt = `[${data.topic.title}]\n${data.dataText}\n\n가장 ${isMax ? '많은' : '적은'} 항목은 무엇인가요?`;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt,
      choices,
      answerIndex,
      explanation: [
        txt(`값을 비교하면: ${data.selectedItems.map((it, i) => `${it}=${data.values[i]}`).join(', ')}`),
        txt(`가장 ${isMax ? '많은' : '적은'} 항목은 ${answer}(${isMax ? maxVal : minVal}${data.topic.unit})이에요.`),
      ],
    };
  },
};

// ── 2. bar-diff  두 항목의 차 (fill-blanks)  난이도 2 ────────────────
const barDiff: SkillDef = {
  id: 'bar-diff',
  unitId: 'unitBarGraph',
  difficulty: 2,
  title: '두 항목의 차',
  note: '두 항목의 값 차이 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = generateBarData(rng);

    // 차이가 0이 아닌 두 항목 선택
    let i1 = 0, i2 = 1;
    for (let tries = 0; tries < 50; tries++) {
      const ti1 = rng.int(0, data.selectedItems.length - 1);
      let ti2 = rng.int(0, data.selectedItems.length - 1);
      if (ti2 === ti1) ti2 = (ti1 + 1) % data.selectedItems.length;
      if (data.values[ti1] !== data.values[ti2]) { i1 = ti1; i2 = ti2; break; }
    }

    const answer = Math.abs(data.values[i1] - data.values[i2]);
    const item1 = data.selectedItems[i1];
    const item2 = data.selectedItems[i2];

    const expr: MathExpr = [
      txt(`${item1}과 ${item2}의 차: `),
      { kind: 'blank', slot: 0 },
      txt(data.topic.unit),
    ];

    const prompt = `[${data.topic.title}]\n${data.dataText}\n\n${item1}과 ${item2}의 차는 몇 ${data.topic.unit}인가요?`;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [answer],
      explanation: [
        txt(`${item1}: ${data.values[i1]}${data.topic.unit}, ${item2}: ${data.values[i2]}${data.topic.unit}`),
        txt(`차: |${data.values[i1]} - ${data.values[i2]}| = ${answer}${data.topic.unit}`),
      ],
    };
  },
};

// ── 3. bar-total  전체 합 (fill-blanks)  난이도 2 ─────────────────────
const barTotal: SkillDef = {
  id: 'bar-total',
  unitId: 'unitBarGraph',
  difficulty: 2,
  title: '전체 합',
  note: '모든 항목의 합 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = generateBarData(rng);

    const answer = data.values.reduce((a, b) => a + b, 0);

    const expr: MathExpr = [
      txt('전체 합: '),
      { kind: 'blank', slot: 0 },
      txt(data.topic.unit),
    ];

    const prompt = `[${data.topic.title}]\n${data.dataText}\n\n전체 합은 몇 ${data.topic.unit}인가요?`;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [answer],
      explanation: [
        txt(`합: ${data.values.join(' + ')} = ${answer}${data.topic.unit}`),
      ],
    };
  },
};

// ── 4. bar-scale  눈금 한 칸 크기 역산 (fill-blanks)  난이도 2 ─────────
/**
 * 한 항목의 값과 눈금 수를 제시 → 눈금 한 칸 크기 구하기.
 * 눈금 수: 2~10, 값 = 눈금 수 × 칸 크기 (정수).
 */
const barScale: SkillDef = {
  id: 'bar-scale',
  unitId: 'unitBarGraph',
  difficulty: 2,
  title: '눈금 한 칸 크기 역산',
  note: '값과 눈금 수로 눈금 한 칸 크기 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = generateBarData(rng);

    // 눈금 수: 2~10, 칸 크기: 1~10 → 값 = 눈금 × 칸 크기
    let ticks = 2, tickSize = 1;
    ticks = 2; tickSize = 1;
    for (let tries = 0; tries < 200; tries++) {
      const tTicks = rng.int(2, 10);
      const tSize = rng.int(1, 10);
      const tVal = tTicks * tSize;
      if (tVal >= 2 && tVal <= 50) { ticks = tTicks; tickSize = tSize; break; }
    }

    // 대상 항목 선택하고 값 고정
    const itemIdx = rng.int(0, data.selectedItems.length - 1);
    const item = data.selectedItems[itemIdx];
    const itemVal = ticks * tickSize;

    // 해당 항목의 값을 itemVal로 교체한 dataText
    const adjustedValues = [...data.values];
    adjustedValues[itemIdx] = itemVal;
    const adjustedDataText = data.selectedItems
      .map((it, i) => `${it}: ${adjustedValues[i]}${data.topic.unit}`)
      .join(', ');

    const answer = tickSize;

    const expr: MathExpr = [
      txt(`눈금 한 칸의 크기: `),
      { kind: 'blank', slot: 0 },
      txt(data.topic.unit),
    ];

    const prompt = `[${data.topic.title}]\n${adjustedDataText}\n\n막대그래프에서 ${item} 항목의 막대가 눈금 ${ticks}칸이라면, 눈금 한 칸은 몇 ${data.topic.unit}인가요?`;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [answer],
      explanation: [
        txt(`${item}의 값: ${itemVal}${data.topic.unit}, 눈금 수: ${ticks}칸`),
        txt(`눈금 한 칸 = ${itemVal} ÷ ${ticks} = ${answer}${data.topic.unit}`),
      ],
    };
  },
};

// ── 5. bar-word  문장제 (fill-blanks)  난이도 3 ───────────────────────
const barWord: SkillDef = {
  id: 'bar-word',
  unitId: 'unitBarGraph',
  difficulty: 3,
  word: true,
  title: '막대그래프 문장제',
  note: '막대그래프 표 텍스트를 이용한 문장제. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = generateBarData(rng);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 가장 많은 것보다 가장 적은 것이 얼마나 적은지
      const maxVal = Math.max(...data.values);
      const minVal = Math.min(...data.values);
      const maxItem = data.selectedItems[data.values.indexOf(maxVal)];
      const minItem = data.selectedItems[data.values.indexOf(minVal)];
      answer = maxVal - minVal;
      prompt = `[${data.topic.title}]\n${data.dataText}\n\n가장 많은 ${maxItem}은 가장 적은 ${minItem}보다 몇 ${data.topic.unit} 더 많은가요?`;
      explanation = [txt(`${maxVal} - ${minVal} = ${answer}${data.topic.unit}`)];
    } else if (pat === 1) {
      // 전체 합에서 한 항목 역산
      const total = data.values.reduce((a, b) => a + b, 0);
      const knownIdx = rng.int(0, data.selectedItems.length - 1);
      const knownItem = data.selectedItems[knownIdx];
      const knownVal = data.values[knownIdx];
      answer = total - knownVal;
      prompt = `[${data.topic.title}]\n${data.dataText}\n\n전체는 ${total}${data.topic.unit}이고 ${knownItem}이 ${knownVal}${data.topic.unit}이라면, 나머지 항목의 합은 몇 ${data.topic.unit}인가요?`;
      explanation = [txt(`${total} - ${knownVal} = ${answer}${data.topic.unit}`)];
    } else if (pat === 2) {
      // 두 항목 합
      const idx1 = rng.int(0, data.selectedItems.length - 1);
      let idx2 = rng.int(0, data.selectedItems.length - 1);
      if (idx2 === idx1) idx2 = (idx1 + 1) % data.selectedItems.length;
      answer = data.values[idx1] + data.values[idx2];
      const it1 = data.selectedItems[idx1];
      const it2 = data.selectedItems[idx2];
      prompt = `[${data.topic.title}]\n${data.dataText}\n\n${it1}과 ${it2}를 합치면 모두 몇 ${data.topic.unit}인가요?`;
      explanation = [txt(`${data.values[idx1]} + ${data.values[idx2]} = ${answer}${data.topic.unit}`)];
    } else {
      // 전체 합
      answer = data.values.reduce((a, b) => a + b, 0);
      prompt = `[${data.topic.title}]\n${data.dataText}\n\n모든 항목을 합치면 모두 몇 ${data.topic.unit}인가요?`;
      explanation = [txt(`${data.values.join(' + ')} = ${answer}${data.topic.unit}`)];
    }

    const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt(` ${data.topic.unit}`)];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitBarGraphSkills: SkillDef[] = [
  barMost,
  barDiff,
  barTotal,
  barScale,
  barWord,
];
