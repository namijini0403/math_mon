/**
 * 단원: 여러 가지 그래프 (2022 개정교육과정 6-1 5단원)
 * 성취기준: 띠그래프와 원그래프를 이해하고, 자료를 백분율로 나타내며, 그래프를 읽고 해석한다.
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;
const textCV = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 공통: 주제 풀 ──────────────────────────────────────────────────

interface TopicData {
  title: string;      // 그래프 제목 (예: "좋아하는 과일별 학생 수")
  unit: string;       // 단위 (예: "명")
  items: string[];    // 항목 이름 풀 (4개 이상)
}

const TOPICS: TopicData[] = [
  {
    title: '좋아하는 과일별 학생 수',
    unit: '명',
    items: ['사과', '포도', '귤', '수박', '딸기', '복숭아'],
  },
  {
    title: '좋아하는 운동별 학생 수',
    unit: '명',
    items: ['축구', '야구', '수영', '농구', '배드민턴', '달리기'],
  },
  {
    title: '좋아하는 계절별 학생 수',
    unit: '명',
    items: ['봄', '여름', '가을', '겨울'],
  },
  {
    title: '좋아하는 동물별 학생 수',
    unit: '명',
    items: ['강아지', '고양이', '토끼', '햄스터', '금붕어', '거북이'],
  },
  {
    title: '좋아하는 과목별 학생 수',
    unit: '명',
    items: ['수학', '국어', '과학', '체육', '음악', '미술'],
  },
  {
    title: '마을별 학생 수',
    unit: '명',
    items: ['가 마을', '나 마을', '다 마을', '라 마을', '마 마을'],
  },
  {
    title: '혈액형별 학생 수',
    unit: '명',
    items: ['A형', 'B형', 'O형', 'AB형'],
  },
];

const GRAPH_NAMES = ['띠그래프', '원그래프'] as const;

/**
 * 공통 자료 생성기:
 * - 주제에서 항목 4개 선택
 * - 백분율 합 100, 각 5의 배수, 모두 다르게
 * - 전체를 20의 배수로 → 전체 × 각% ÷ 100 이 항상 정수
 */
interface GraphData {
  topic: TopicData;
  graphName: '띠그래프' | '원그래프';
  items: string[];       // 선택된 4개 항목
  percents: number[];    // 각 항목의 백분율 (합 100)
  total: number;         // 전체 수 (20의 배수, 20~400)
  /** 자료 제시 문자열: "전체 200명 | 사과 40% · 포도 25% · 귤 20% · 기타 15%" */
  dataText: string;
}

function generateGraphData(rng: RNG): GraphData {
  const topic = rng.pick(TOPICS);
  const graphName = rng.pick(GRAPH_NAMES);

  // 항목 4개 선택
  const items = rng.sample(topic.items, 4);

  // 백분율 생성: 합 100, 각 5의 배수, 모두 다름
  // 방법: 4개 값을 모두 다르게 뽑아 합이 100이 되게
  // 가능한 5의 배수 조합 (최소 5, 최대 60, 합 100, 4개 모두 다름)
  let percents: number[] = [];
  let guard = 0;
  do {
    // 앞 3개를 5~60 범위에서 5의 배수로 뽑고, 4번째를 역산
    const candidates = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    const p1 = rng.pick(candidates);
    const p2 = rng.pick(candidates);
    const p3 = rng.pick(candidates);
    const p4 = 100 - p1 - p2 - p3;

    // p4도 5의 배수, 양수, 60 이하, 4개 모두 다름 검증
    const all = [p1, p2, p3, p4];
    const allUnique = new Set(all).size === 4;
    const p4Valid = p4 >= 5 && p4 <= 60 && p4 % 5 === 0;
    if (p4Valid && allUnique) {
      percents = all;
    }
    guard++;
    if (guard > 500) {
      // fallback: 확실히 동작하는 고정 값
      percents = [40, 25, 20, 15];
      break;
    }
  } while (percents.length === 0);

  // 전체: 20의 배수 (20~400)
  const totalMultiples = [] as number[];
  for (let v = 20; v <= 400; v += 20) totalMultiples.push(v);
  const total = rng.pick(totalMultiples);

  // 자료 제시 문자열
  const itemsStr = items.map((item, i) => `${item} ${percents[i]}%`).join(' · ');
  const dataText = `전체 ${total}${topic.unit} | ${itemsStr}`;

  return { topic, graphName, items, percents, total, dataText };
}

// ── 1. graph-read ─────────────────────────────────────────────────
const graphRead: SkillDef = {
  id: 'graph-read',
  unitId: 'unitGraph',
  title: '그래프에서 항목 수 구하기',
  note: '띠그래프/원그래프에서 특정 항목의 수를 백분율로 구한다. 전체 × 백분율 ÷ 100.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);
    const d = generateGraphData(rng);

    // 질문할 항목 랜덤 선택
    const targetIdx = rng.int(0, 3);
    const targetItem = d.items[targetIdx];
    const targetPct = d.percents[targetIdx];
    const answer = (d.total * targetPct) / 100;

    const expr: MathExpr = [
      txt(`${nj(targetItem, '을/를')} 좋아하는 학생: `),
      { kind: 'blank', slot: 0 },
      txt(d.topic.unit),
    ];

    const explanation: MathExpr = [
      txt(`(항목 수) = 전체 × 백분율 ÷ 100`),
      txt(` = ${d.total} × ${targetPct} ÷ 100`),
      txt(` = ${answer}${d.topic.unit}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음은 ${nj(d.topic.title, '을/를')} 나타낸 ${d.graphName}예요. [${d.dataText}] ${nj(targetItem, '을/를')} 좋아하는 학생은 몇 ${d.topic.unit}인가요?`,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 2. graph-most ─────────────────────────────────────────────────
const graphMost: SkillDef = {
  id: 'graph-most',
  unitId: 'unitGraph',
  title: '가장 많은/적은 항목 고르기',
  note: '백분율을 비교하여 가장 많거나 적은 항목을 고른다. 4지선다.',
  difficulty: 1,
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    const d = generateGraphData(rng);

    // 가장 많은/적은 중 랜덤
    const isMost = rng.chance(0.5);

    let answerIdx: number;
    if (isMost) {
      answerIdx = d.percents.indexOf(Math.max(...d.percents));
    } else {
      answerIdx = d.percents.indexOf(Math.min(...d.percents));
    }
    const answerItem = d.items[answerIdx];

    // 보기: 4개 항목 이름 (전부 텍스트)
    const baseChoices: ChoiceValue[] = d.items.map((item) => textCV(item));

    // 셔플: 정답 위치를 랜덤하게
    const shuffled = rng.shuffle(baseChoices);
    const answerIndex = shuffled.findIndex(
      (c) => c.kind === 'text' && c.text === answerItem,
    );

    const explanation: MathExpr = [
      txt(
        `백분율을 비교하면: ${d.items.map((item, i) => `${item} ${d.percents[i]}%`).join(', ')}이에요. `,
      ),
      txt(
        `${isMost ? '가장 큰' : '가장 작은'} 백분율은 ${answerItem}(${d.percents[answerIdx]}%)${isMost ? '이므로' : '이므로'} 정답은 '${answerItem}'이에요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `다음은 ${nj(d.topic.title, '을/를')} 나타낸 ${d.graphName}예요. [${d.dataText}] ${isMost ? '가장 많은' : '가장 적은'} 학생이 좋아하는 것은 무엇인가요?`,
      choices: shuffled,
      answerIndex,
      explanation,
    };
  },
};

// ── 3. graph-percent ──────────────────────────────────────────────
const graphPercent: SkillDef = {
  id: 'graph-percent',
  unitId: 'unitGraph',
  title: '자료를 백분율로 나타내기',
  note: '전체와 항목 수를 알 때 백분율을 구한다. (항목 수 ÷ 전체) × 100.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    const TOPICS2: TopicData[] = [
      {
        title: '좋아하는 운동별 학생 수',
        unit: '명',
        items: ['축구', '야구', '수영', '농구', '배드민턴'],
      },
      {
        title: '좋아하는 과목별 학생 수',
        unit: '명',
        items: ['수학', '국어', '과학', '체육', '음악'],
      },
      {
        title: '좋아하는 과일별 학생 수',
        unit: '명',
        items: ['사과', '포도', '귤', '수박', '딸기'],
      },
      {
        title: '혈액형별 학생 수',
        unit: '명',
        items: ['A형', 'B형', 'O형', 'AB형'],
      },
    ];
    const topic = rng.pick(TOPICS2);
    const item = rng.pick(topic.items);

    // 전체와 항목 수를 정수 % 보장으로 구성
    // percent = 5의 배수 (5~50)
    const pct = rng.pick([5, 10, 15, 20, 25, 30, 40, 50]);
    // total: 20의 배수 (20~200)
    const totalMultiples: number[] = [];
    for (let v = 20; v <= 200; v += 20) totalMultiples.push(v);
    const total = rng.pick(totalMultiples);
    const count = (total * pct) / 100;

    const expr: MathExpr = [
      { kind: 'blank', slot: 0 },
      txt('%'),
    ];

    const explanation: MathExpr = [
      txt(`백분율 = (항목 수) ÷ 전체 × 100`),
      txt(` = ${count} ÷ ${total} × 100`),
      txt(` = ${pct}%예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `전체 ${total}${topic.unit} 중 ${nj(item, '을/를')} 좋아하는 학생이 ${count}${topic.unit}일 때, 백분율로 나타내면 몇 %인가요?`,
      expr,
      blankAnswers: [pct],
      explanation,
    };
  },
};

// ── 4. graph-missing ──────────────────────────────────────────────
const graphMissing: SkillDef = {
  id: 'graph-missing',
  unitId: 'unitGraph',
  title: '빠진 항목의 백분율 구하기',
  note: '3개 항목의 백분율 합을 100에서 빼서 나머지 항목의 백분율을 구한다.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);
    const d = generateGraphData(rng);

    // 4번째 항목(기타/나머지)을 빠진 항목으로 설정
    const knownItems = d.items.slice(0, 3);
    const knownPercents = d.percents.slice(0, 3);
    const missingItem = d.items[3];
    const missingPct = d.percents[3];
    const knownSum = knownPercents.reduce((a, b) => a + b, 0);

    const knownStr = knownItems
      .map((item, i) => `${item} ${knownPercents[i]}%`)
      .join(', ');

    const expr: MathExpr = [
      txt(`${missingItem}: `),
      { kind: 'blank', slot: 0 },
      txt('%'),
    ];

    const explanation: MathExpr = [
      txt(`모든 항목의 백분율 합은 100%예요. `),
      txt(`${missingItem}의 백분율 = 100 − (${knownPercents.join(' + ')}) `),
      txt(`= 100 − ${knownSum} = ${missingPct}%예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음은 ${nj(d.topic.title, '을/를')} 나타낸 ${d.graphName}예요. ${knownStr}이고, ${missingItem}의 백분율이 빠져 있어요. ${nj(missingItem, '은/는')} 몇 %인가요?`,
      expr,
      blankAnswers: [missingPct],
      explanation,
    };
  },
};

// ── 5. graph-times ────────────────────────────────────────────────
const graphTimes: SkillDef = {
  id: 'graph-times',
  unitId: 'unitGraph',
  title: '항목 수의 배 비교',
  note: '두 항목의 백분율 비를 이용하여 몇 배인지 구한다. 정수 배만 출제.',
  difficulty: 3,
  generate(seed) {
    const rng = new RNG(seed);

    // 배수 관계인 두 백분율 쌍 생성: larger = k × smaller (k=2,3,4,5)
    const MULTIPLIERS = [2, 3, 4, 5] as const;
    const k = rng.pick(MULTIPLIERS);

    // smaller: 5의 배수, larger = k × smaller, 합이 100 이하, larger ≤ 60
    const smallerCandidates: number[] = [];
    for (let s = 5; s <= 30; s += 5) {
      const l = k * s;
      if (l <= 60 && s !== l) smallerCandidates.push(s);
    }
    const smaller = rng.pick(smallerCandidates);
    const larger = k * smaller;

    // 나머지 두 항목의 백분율 (합 = 100 - larger - smaller)
    const remaining = 100 - larger - smaller;
    // remaining을 두 5의 배수로 분할 (모두 다르게, smaller와 larger와도 다르게)
    let p3 = 0, p4 = 0;
    let guard = 0;
    do {
      const candidates: number[] = [];
      for (let v = 5; v < remaining; v += 5) {
        if (remaining - v >= 5) candidates.push(v);
      }
      if (candidates.length === 0) { p3 = remaining / 2; p4 = remaining / 2; break; }
      p3 = rng.pick(candidates);
      p4 = remaining - p3;
      guard++;
      if (guard > 200) { p3 = 5; p4 = remaining - 5; break; }
    } while (
      p4 % 5 !== 0 ||
      p3 === p4 ||
      p3 === smaller || p3 === larger ||
      p4 === smaller || p4 === larger
    );

    const topic = rng.pick(TOPICS);
    const items = rng.sample(topic.items, 4);
    // items[0] = larger 항목, items[1] = smaller 항목
    const percents = [larger, smaller, p3, p4];
    const total = rng.pick([100, 200, 300, 400]);

    const largerItem = items[0];
    const smallerItem = items[1];

    const itemsStr = items.map((item, i) => `${item} ${percents[i]}%`).join(' · ');
    const dataText = `전체 ${total}${topic.unit} | ${itemsStr}`;

    const graphName = rng.pick(GRAPH_NAMES);

    const expr: MathExpr = [
      { kind: 'blank', slot: 0 },
      txt('배'),
    ];

    const explanation: MathExpr = [
      txt(`(항목 수) = 전체 × 백분율 ÷ 100이므로, `),
      txt(`${nj(largerItem, '을/를')} 좋아하는 학생 수 = ${total} × ${larger} ÷ 100 = ${(total * larger) / 100}${topic.unit}, `),
      txt(`${nj(smallerItem, '을/를')} 좋아하는 학생 수 = ${total} × ${smaller} ÷ 100 = ${(total * smaller) / 100}${topic.unit}이에요. `),
      txt(`${(total * larger) / 100} ÷ ${(total * smaller) / 100} = ${k}이므로 ${k}배예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음은 ${nj(topic.title, '을/를')} 나타낸 ${graphName}예요. [${dataText}] ${nj(largerItem, '을/를')} 좋아하는 학생 수는 ${nj(smallerItem, '을/를')} 좋아하는 학생 수의 몇 배인가요?`,
      expr,
      blankAnswers: [k],
      explanation,
    };
  },
};

// ── 6. graph-word ─────────────────────────────────────────────────
const graphWord: SkillDef = {
  id: 'graph-word',
  unitId: 'unitGraph',
  title: '그래프 활용 2단계 문장제',
  note: '전체 → 항목 수 → 항목 내 세부 수, 2단계 곱셈으로 답을 구하는 문장제.',
  difficulty: 3,
  word: true,
  generate(seed) {
    const rng = new RNG(seed);

    // 4가지 소재
    type Scenario = {
      question: (total: number, areaName: string, pct: number, subPct: number, subName: string) => string;
      areaLabel: string;
      subLabel: string;
      areas: string[];
      subs: string[];
      subPcts: number[]; // 절반=50, 1/4=25, 3/4=75, 2/5=40, 3/5=60
    };

    const scenarios: Scenario[] = [
      {
        question: (total, area, pct, subPct, sub) =>
          `전체 ${total}명 중 ${nj(area, '이/가')} ${pct}%이고, 그 중 ${subPct}%가 ${sub}이라면 ${area}의 ${nj(sub, '은/는')} 몇 명인가요?`,
        areaLabel: '마을별 학생',
        subLabel: '성별',
        areas: ['가 마을', '나 마을', '다 마을', '라 마을'],
        subs: ['여학생', '남학생'],
        subPcts: [50, 25, 75],
      },
      {
        question: (total, area, pct, subPct, sub) =>
          `전체 ${total}명의 학생 중 ${nj(area, '을/를')} 좋아하는 학생이 ${pct}%이고, 그 중 ${subPct}%가 ${sub}이라면 ${nj(sub, '은/는')} 몇 명인가요?`,
        areaLabel: '운동별 학생',
        subLabel: '학년',
        areas: ['축구', '야구', '수영', '농구'],
        subs: ['6학년', '5학년'],
        subPcts: [50, 25, 75],
      },
      {
        question: (total, area, pct, subPct, sub) =>
          `전체 ${total}명의 학생 중 ${nj(area, '을/를')} 좋아하는 학생이 ${pct}%이고, 그 중 ${subPct}%가 ${sub}이라면 ${nj(sub, '은/는')} 몇 명인가요?`,
        areaLabel: '과일별 학생',
        subLabel: '성별',
        areas: ['사과', '포도', '귤', '수박'],
        subs: ['여학생', '남학생'],
        subPcts: [50, 25, 75],
      },
      {
        question: (total, area, pct, subPct, sub) =>
          `전체 ${total}명의 학생 중 ${nj(area, '이/가')} ${pct}%이고, 그 중 ${subPct}%가 ${sub}이라면 ${area}의 ${nj(sub, '은/는')} 몇 명인가요?`,
        areaLabel: '혈액형별 학생',
        subLabel: '성별',
        areas: ['A형', 'B형', 'O형', 'AB형'],
        subs: ['여학생', '남학생'],
        subPcts: [50, 25, 75],
      },
    ];

    const scenario = rng.pick(scenarios);
    const area = rng.pick(scenario.areas);
    const sub = rng.pick(scenario.subs);
    const subPct = rng.pick(scenario.subPcts);

    // 전체 수: 20의 배수, pct × subPct ÷ 10000 × total이 정수가 되게
    // total = 400의 약수 × 20의 배수 → total은 100의 배수로 제한하면 안전
    // pct: 10~50 범위 5의 배수, subPct: 25,50,75 중 하나
    // total × pct/100 × subPct/100 이 정수: total이 400의 배수면 항상 정수
    // 단순히 total=200 or 400으로 고정
    const totalCandidates = [200, 300, 400];
    let total = 0, pct = 0, answer = 0;
    let guard = 0;
    do {
      total = rng.pick(totalCandidates);
      pct = rng.pick([10, 15, 20, 25, 30, 40]);
      const step1 = (total * pct) / 100;   // 정수 (total이 20의 배수, pct가 5의 배수)
      answer = (step1 * subPct) / 100;
      guard++;
      if (guard > 300) { total = 400; pct = 25; answer = (total * pct / 100) * subPct / 100; break; }
    } while (!Number.isInteger(answer) || answer < 1);

    const step1 = (total * pct) / 100;

    const expr: MathExpr = [
      { kind: 'blank', slot: 0 },
      txt('명'),
    ];

    const explanation: MathExpr = [
      txt(`1단계: ${area}의 학생 수 = 전체 × 백분율 ÷ 100 = ${total} × ${pct} ÷ 100 = ${step1}명. `),
      txt(`2단계: ${sub} = ${step1} × ${subPct} ÷ 100 = ${answer}명이에요.`),
    ];

    const prompt = scenario.question(total, area, pct, subPct, sub);

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

// ── 내보내기 ──────────────────────────────────────────────────────

export const unitGraphSkills: SkillDef[] = [
  graphRead,
  graphMost,
  graphPercent,
  graphMissing,
  graphTimes,
  graphWord,
];
