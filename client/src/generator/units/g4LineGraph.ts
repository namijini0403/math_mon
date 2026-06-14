/**
 * 단원: 꺾은선그래프 (2022 개정교육과정 4-2 5단원)
 * 성취기준: 꺾은선그래프를 읽고 변화량을 파악하며 해석할 수 있다.
 * 표를 텍스트로 제시 (그림 없음).
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 공통: 꺾은선그래프 자료 생성 ────────────────────────────────────────
interface LineTopicData {
  subject: string;   // 예: "시각별 기온"
  timeLabel: string; // 예: "시"
  unit: string;      // 예: "도"
  times: string[];
}

const LINE_TOPICS: LineTopicData[] = [
  { subject: '시각별 기온', timeLabel: '시', unit: '도', times: ['9시', '10시', '11시', '12시', '오후 1시'] },
  { subject: '날짜별 최고 기온', timeLabel: '일', unit: '도', times: ['1일', '2일', '3일', '4일', '5일'] },
  { subject: '월별 강수량', timeLabel: '월', unit: 'mm', times: ['3월', '4월', '5월', '6월', '7월'] },
  { subject: '시간별 방문자 수', timeLabel: '시', unit: '명', times: ['10시', '11시', '12시', '오후 1시', '오후 2시'] },
  { subject: '날짜별 판매량', timeLabel: '일', unit: '개', times: ['월요일', '화요일', '수요일', '목요일', '금요일'] },
];

interface LineData {
  topic: LineTopicData;
  times: string[];    // 5개 시점
  values: number[];   // 각 시점의 값 (양의 정수)
  dataText: string;   // "9시: 5도, 10시: 8도, ..."
}

function generateLineData(rng: RNG, minVal = 2, maxVal = 30): LineData {
  const topic = rng.pick(LINE_TOPICS);
  const times = topic.times.slice(0, 5);
  let values: number[] = times.map(() => rng.int(minVal, maxVal));
  const dataText = times.map((t, i) => `${t}: ${values[i]}${topic.unit}`).join(', ');
  return { topic, times, values, dataText };
}

/** 연속된 두 시점 간 변화량 절댓값 배열 */
function changes(values: number[]): number[] {
  const ch: number[] = [];
  for (let i = 1; i < values.length; i++) {
    ch.push(Math.abs(values[i] - values[i - 1]));
  }
  return ch;
}

// ── 1. line-max-change  변화가 가장 큰 구간 (choice)  난이도 1 ──────────
const lineMaxChange: SkillDef = {
  id: 'line-max-change',
  unitId: 'unitLineGraph',
  difficulty: 1,
  title: '변화가 가장 큰 구간',
  note: '표 텍스트 제시 → 변화량 최대 구간. 4지선다.',
  generate(seed) {
    const rng = new RNG(seed);
    // 값들이 모두 다른 변화량을 갖도록 재시도
    let data: LineData = generateLineData(rng);
    for (let tries = 0; tries < 200; tries++) {
      const d = generateLineData(rng);
      const ch = changes(d.values);
      const maxCh = Math.max(...ch);
      const maxCount = ch.filter((c) => c === maxCh).length;
      if (maxCount === 1 && new Set(ch).size >= 3) { data = d; break; }
    }

    const ch = changes(data.values);
    const maxIdx = ch.indexOf(Math.max(...ch));
    const answerLabel = `${data.times[maxIdx]} ~ ${data.times[maxIdx + 1]}`;

    // 다른 3개 구간 오답
    const allLabels = ch.map((_, i) => `${data.times[i]} ~ ${data.times[i + 1]}`);
    const candidates = allLabels.filter((_, i) => i !== maxIdx).map(txc);
    const answerVal = txc(answerLabel);
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `[${data.topic.subject}]\n${data.dataText}\n\n변화가 가장 큰 구간은 어느 것인가요?`,
      expr: [txt(data.dataText)],
      choices,
      answerIndex,
      explanation: [
        txt(`각 구간의 변화량: ${ch.map((c, i) => `${data.times[i]}~${data.times[i + 1]}: ${c}${data.topic.unit}`).join(', ')}`),
        txt(`가장 큰 변화량은 ${data.times[maxIdx]}~${data.times[maxIdx + 1]} 구간의 ${ch[maxIdx]}${data.topic.unit}이에요.`),
      ],
    };
  },
};

// ── 2. line-two-diff  두 시점 차 (fill-blanks)  난이도 1 ─────────────────
const lineTwoDiff: SkillDef = {
  id: 'line-two-diff',
  unitId: 'unitLineGraph',
  difficulty: 1,
  title: '두 시점 차',
  note: '두 시점의 값 차이 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = generateLineData(rng);

    // 서로 다른 두 시점 선택
    let i1 = 0, i2 = 4;
    for (let tries = 0; tries < 200; tries++) {
      const ti1 = rng.int(0, data.times.length - 1);
      let ti2 = rng.int(0, data.times.length - 1);
      if (ti2 === ti1) ti2 = (ti1 + 1) % data.times.length;
      if (data.values[ti1] !== data.values[ti2]) { i1 = ti1; i2 = ti2; break; }
    }

    const answer = Math.abs(data.values[i1] - data.values[i2]);
    const t1 = data.times[i1];
    const t2 = data.times[i2];
    const bigV = Math.max(data.values[i1], data.values[i2]);
    const smallV = Math.min(data.values[i1], data.values[i2]);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `[${data.topic.subject}]\n${data.dataText}\n\n${t1}과 ${t2}의 차는 몇 ${data.topic.unit}인가요?`,
      expr: [txt(`${t1}과 ${t2}의 차: `), { kind: 'blank', slot: 0 }, txt(` ${data.topic.unit}`)],
      blankAnswers: [answer],
      explanation: [
        txt(`${t1}: ${data.values[i1]}${data.topic.unit}, ${t2}: ${data.values[i2]}${data.topic.unit}`),
        txt(`차는 큰 값에서 작은 값을 빼요. ${bigV} − ${smallV} = ${answer}${data.topic.unit}`),
      ],
    };
  },
};

// ── 3. line-total  전체 합계 (fill-blanks)  난이도 2 ─────────────────────
const lineTotal: SkillDef = {
  id: 'line-total',
  unitId: 'unitLineGraph',
  difficulty: 2,
  title: '전체 합계',
  note: '모든 시점의 합 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const data = generateLineData(rng);
    const answer = data.values.reduce((a, b) => a + b, 0);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `[${data.topic.subject}]\n${data.dataText}\n\n전체 합계는 몇 ${data.topic.unit}인가요?`,
      expr: [txt('전체 합계: '), { kind: 'blank', slot: 0 }, txt(` ${data.topic.unit}`)],
      blankAnswers: [answer],
      explanation: [
        txt(`합계: ${data.values.join(' + ')} = ${answer}${data.topic.unit}`),
      ],
    };
  },
};

// ── 4. line-scale  눈금·물결선 시작값 활용 계산 (fill-blanks)  난이도 2 ──
/**
 * 물결선 시작값 + 눈금 수 + 눈금 한 칸 크기 → 한 시점의 실제 값 계산
 */
const lineScale: SkillDef = {
  id: 'line-scale',
  unitId: 'unitLineGraph',
  difficulty: 2,
  title: '눈금·물결선 시작값 활용',
  note: '물결선 시작값 + 눈금으로 실제 값 계산. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);

    // 물결선 시작값: 10~40 (5 단위), 눈금 한 칸: 2 또는 5, 눈금 수: 1~10
    let start = 10, tickSize = 2, ticks = 5, value = 20;
    for (let tries = 0; tries < 200; tries++) {
      const ts = rng.int(2, 8) * 5; // 10, 15, ..., 40
      const tsz = rng.pick([2, 5] as const);
      const tt = rng.int(1, 10);
      const tv = ts + tsz * tt;
      if (tv >= 12 && tv <= 80 && tv > ts) { start = ts; tickSize = tsz; ticks = tt; value = tv; break; }
    }

    const LINE_TOPIC_NAMES = ['기온(도)', '강수량(mm)', '방문자 수(명)', '판매량(개)'];
    const subject = rng.pick(LINE_TOPIC_NAMES);
    const timePoint = rng.pick(['9시', '10시', '11시', '12시', '오후 1시']);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `꺾은선그래프에서 [${subject}]를 나타낼 때, 물결선이 ${start}부터 시작하고 눈금 한 칸이 ${tickSize}을 나타내요. ${timePoint}의 점이 눈금 ${ticks}칸 위에 있다면 실제 값은 얼마인가요?`,
      expr: [txt(`실제 값: `), { kind: 'blank', slot: 0 }],
      blankAnswers: [value],
      explanation: [
        txt(`실제 값 = 물결선 시작값 + 눈금 한 칸 크기 × 눈금 수`),
        txt(`= ${start} + ${tickSize} × ${ticks} = ${start} + ${tickSize * ticks} = ${value}`),
      ],
    };
  },
};

// ── 5. line-word  꺾은선그래프 문장제  난이도 3 ──────────────────────────
const lineWord: SkillDef = {
  id: 'line-word',
  unitId: 'unitLineGraph',
  difficulty: 3,
  word: true,
  title: '꺾은선그래프 문장제',
  note: '꺾은선 자료 해석 모험 문장제. 소재 4가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 변화가 가장 큰 구간 → 변화량
      const data = generateLineData(rng, 5, 25);
      let maxChIdx = 0, maxCh = 0;
      for (let i = 0; i < data.values.length - 1; i++) {
        const ch = Math.abs(data.values[i + 1] - data.values[i]);
        if (ch > maxCh) { maxCh = ch; maxChIdx = i; }
      }
      answer = maxCh;
      {
        const v0 = data.values[maxChIdx], v1 = data.values[maxChIdx + 1];
        const big = Math.max(v0, v1), small = Math.min(v0, v1);
        prompt = `[탐험대 캠프의 ${data.topic.subject}]\n${data.dataText}\n\n변화가 가장 큰 구간(${data.times[maxChIdx]} ~ ${data.times[maxChIdx + 1]})의 변화량은 몇 ${data.topic.unit}인가요?`;
        explanation = [txt(`두 값의 차로 구해요. ${big} − ${small} = ${answer}${data.topic.unit}`)];
      }
    } else if (pat === 1) {
      // 두 시점 차 (차가 0이 되지 않도록 재시도)
      let data = generateLineData(rng, 5, 30);
      let i1 = 0;
      let i2 = data.times.length - 1;
      for (let tries = 0; tries < 200; tries++) {
        const d = generateLineData(rng, 5, 30);
        if (d.values[0] !== d.values[d.times.length - 1]) {
          data = d; i1 = 0; i2 = d.times.length - 1; break;
        }
      }
      answer = Math.abs(data.values[i1] - data.values[i2]);
      {
        const big = Math.max(data.values[i1], data.values[i2]);
        const small = Math.min(data.values[i1], data.values[i2]);
        prompt = `[마법사 탑의 ${data.topic.subject}]\n${data.dataText}\n\n${data.times[i1]}와 ${data.times[i2]}의 차는 몇 ${data.topic.unit}인가요?`;
        explanation = [txt(`큰 값에서 작은 값을 빼요. ${big} − ${small} = ${answer}${data.topic.unit}`)];
      }
    } else if (pat === 2) {
      // 합계에서 한 시점 역산
      const data = generateLineData(rng, 4, 20);
      const hiddenIdx = rng.int(0, data.times.length - 1);
      const total = data.values.reduce((a, b) => a + b, 0);
      const hiddenVal = data.values[hiddenIdx];
      const restTotal = total - hiddenVal;
      const hiddenTime = data.times[hiddenIdx];
      const shownVals = data.values.map((v, i) => (i === hiddenIdx ? '?' : v));
      const shownText = data.times.map((t, i) => `${t}: ${shownVals[i]}${data.topic.unit}`).join(', ');
      answer = hiddenVal;
      prompt = `[요새의 ${data.topic.subject}]\n${shownText}\n\n전체 합계가 ${total}${data.topic.unit}이라면, ${hiddenTime}의 값은 몇 ${data.topic.unit}인가요?`;
      explanation = [txt(`${hiddenTime} = 전체 합계 − 나머지 합 = ${total} − ${restTotal} = ${hiddenVal}${data.topic.unit}`)];
    } else {
      // 전체 합계
      const data = generateLineData(rng, 3, 20);
      answer = data.values.reduce((a, b) => a + b, 0);
      prompt = `[모험 마을의 ${data.topic.subject}]\n${data.dataText}\n\n전체 합계는 몇 ${data.topic.unit}인가요?`;
      explanation = [txt(`${data.values.join(' + ')} = ${answer}${data.topic.unit}`)];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr: [txt('답: '), { kind: 'blank', slot: 0 }],
      blankAnswers: [answer],
      explanation,
    };
  },
};

export const unitLineGraphSkills: SkillDef[] = [
  lineMaxChange,
  lineTwoDiff,
  lineTotal,
  lineScale,
  lineWord,
];
