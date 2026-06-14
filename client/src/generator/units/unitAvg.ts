/**
 * 단원: 평균과 가능성 (2022 개정교육과정 5-2 6단원)
 * 성취기준: 자료의 평균을 구하고 활용하며, 사건이 일어날 가능성을 말과 수로 나타낸다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import { josa, ida, nj } from '../josa';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;
const dec = (v: number): ChoiceValue => ({ kind: 'decimal', v });
const textCV = (text: string): ChoiceValue => ({ kind: 'text', text });
const fracCV = (n: number, d: number): ChoiceValue => ({ kind: 'frac', n, d });

// ── 1. avg-calc ────────────────────────────────────────────────────
const avgCalc: SkillDef = {
  id: 'avg-calc',
  unitId: 'unitAvg',
  title: '평균 구하기',
  note: '수 3~5개의 평균을 빈칸으로 채운다. 평균을 먼저 정하고 편차의 합이 0이 되도록 생성.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    const topics = [
      { name: '줄넘기', unit: '회', subject: '줄넘기 기록' },
      { name: '수학 점수', unit: '점', subject: '수학 점수' },
      { name: '책 쪽수', unit: '쪽', subject: '읽은 책 쪽수' },
      { name: '턱걸이', unit: '회', subject: '턱걸이 기록' },
      { name: '공 던지기', unit: 'm', subject: '공 던지기 기록' },
    ] as const;
    const topic = rng.pick(topics);

    const names = ['지민', '서연', '민준', '하은', '지우', '소율', '준호'];
    const name = rng.pick(names);

    // 수 개수: 3~5
    const count = rng.int(3, 5);
    // 평균: 20~40 (단위에 따라 범위 조정)
    const avg = rng.int(20, 40);

    // 편차의 합이 0이 되도록 수 생성 (평균 먼저 확정 → 편차 합=0 보장)
    const usedNums: number[] = [];
    let runningDelta = 0;
    for (let i = 0; i < count - 1; i++) {
      const d = rng.int(-6, 6);
      usedNums.push(avg + d);
      runningDelta += d;
    }
    usedNums.push(avg - runningDelta);

    const validNums = usedNums.every((v) => v > 0 && v <= 100) ? usedNums : Array(count).fill(avg) as number[];
    const sum = validNums.reduce((a, b) => a + b, 0);
    const answer = sum / count; // avg와 동일 (정수 보장)

    const numsStr = validNums.join(', ');

    const expr: MathExpr = [
      txt(`평균: `),
      { kind: 'blank', slot: 0 },
      txt(topic.unit),
    ];

    const explanation: MathExpr = [
      txt(`평균 = 자료 값의 합 ÷ 자료 수 = (${numsStr}) ÷ ${count} = ${sum} ÷ ${count} = ${answer}${ida(topic.unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${name}${josa(name, '이/가')}의 ${count}회 ${topic.subject}${josa(topic.subject, '이/가')} ${numsStr}${ida(topic.unit)}. 평균은 몇 ${topic.unit}인가요?`,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 2. avg-sum ─────────────────────────────────────────────────────
const avgSum: SkillDef = {
  id: 'avg-sum',
  unitId: 'unitAvg',
  title: '합 구하기',
  note: '평균과 횟수를 알 때 합을 구한다. 합 = 평균 × 횟수.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    const topics = [
      { subject: '시험 점수', unit: '점', verb: '받았어요' },
      { subject: '줄넘기 기록', unit: '회', verb: '이에요' },
      { subject: '독서 쪽수', unit: '쪽', verb: '이에요' },
      { subject: '달리기 기록', unit: '초', verb: '이에요' },
    ] as const;
    const topic = rng.pick(topics);

    const count = rng.int(3, 6);
    const avg = rng.int(10, 25);
    const total = avg * count;

    const expr: MathExpr = [
      txt(`총 합계: `),
      { kind: 'blank', slot: 0 },
      txt(topic.unit),
    ];

    const explanation: MathExpr = [
      txt(`합계 = 평균 × 자료 수 = ${avg} × ${count} = ${total}${ida(topic.unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${count}회 ${topic.subject}의 평균이 ${avg}${ida(topic.unit)}. ${count}회의 합계는 몇 ${topic.unit}인가요?`,
      expr,
      blankAnswers: [total],
      explanation,
    };
  },
};

// ── 3. avg-missing ────────────────────────────────────────────────
const avgMissing: SkillDef = {
  id: 'avg-missing',
  unitId: 'unitAvg',
  title: '모르는 값 역산',
  note: '4회 평균과 1~3회 값을 알 때 4회 값을 구한다. 답 1~100 보장.',
  difficulty: 3,
  generate(seed) {
    const rng = new RNG(seed);

    const topics = [
      { subject: '시험 점수', unit: '점' },
      { subject: '줄넘기 기록', unit: '회' },
      { subject: '독서 쪽수', unit: '쪽' },
      { subject: '달리기 기록', unit: '초' },
    ] as const;
    const topic = rng.pick(topics);

    const names = ['지민', '서연', '민준', '하은'];
    const name = rng.pick(names);

    // 평균과 앞 3회 값 생성, 4회 값이 1~100 범위에 들도록
    let avg = 0, a = 0, b = 0, c = 0, fourth = 0;
    let guard = 0;
    do {
      avg = rng.int(20, 80);
      a = rng.int(15, 95);
      b = rng.int(15, 95);
      c = rng.int(15, 95);
      fourth = avg * 4 - (a + b + c);
      guard++;
      if (guard > 300) { avg = 50; a = 40; b = 55; c = 45; fourth = avg * 4 - (a + b + c); break; }
    } while (fourth < 1 || fourth > 100);

    const expr: MathExpr = [
      txt(`4회 ${topic.subject}: `),
      { kind: 'blank', slot: 0 },
      txt(topic.unit),
    ];

    const explanation: MathExpr = [
      txt(`4회의 합계 = 평균 × 4 = ${avg} × 4 = ${avg * 4}${topic.unit}. `),
      txt(`4회 값 = ${avg * 4} − (${a} + ${b} + ${c}) = ${avg * 4} − ${a + b + c} = ${fourth}${ida(topic.unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${name}${josa(name, '이/가')}의 4회 ${topic.subject} 평균이 ${avg}${ida(topic.unit)}. 1회부터 3회까지의 점수가 ${a}, ${b}, ${c}${topic.unit}이라면 4회 기록은 몇 ${topic.unit}이어야 할까요?`,
      expr,
      blankAnswers: [fourth],
      explanation,
    };
  },
};

// ── 4. avg-compare ───────────────────────────────────────────────
const avgCompare: SkillDef = {
  id: 'avg-compare',
  unitId: 'unitAvg',
  title: '평균 비교',
  note: '두 모둠의 평균을 비교하여 더 높은 모둠을 고른다.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    const isSame = rng.chance(0.15);

    let n1: number, s1: number, n2: number, s2: number;
    let avg1: number, avg2: number;
    let guard = 0;

    if (isSame) {
      // 두 평균이 같도록 생성
      do {
        n1 = rng.int(3, 6);
        n2 = rng.int(3, 6);
        avg1 = rng.int(3, 10);
        avg2 = avg1;
        s1 = avg1 * n1;
        s2 = avg2 * n2;
        guard++;
        if (guard > 300) { n1 = 4; n2 = 5; avg1 = 6; avg2 = 6; s1 = 24; s2 = 30; break; }
      } while (s1 === s2); // 두 모둠 총 권수는 다르게
    } else {
      // 두 평균이 다르도록 생성
      do {
        n1 = rng.int(3, 6);
        n2 = rng.int(3, 6);
        avg1 = rng.int(3, 12);
        avg2 = rng.int(3, 12);
        s1 = avg1 * n1;
        s2 = avg2 * n2;
        guard++;
        if (guard > 300) { n1 = 4; n2 = 5; avg1 = 8; avg2 = 6; s1 = 32; s2 = 30; break; }
      } while (avg1 === avg2);
    }

    // 정답 결정
    let correctText: string;
    if (isSame || avg1 === avg2) {
      correctText = '두 모둠이 같아요';
    } else if (avg1 > avg2) {
      correctText = '가 모둠';
    } else {
      correctText = '나 모둠';
    }

    // 보기 4개 고정: '가 모둠', '나 모둠', '두 모둠이 같아요', '알 수 없어요'
    const fixedChoices: ChoiceValue[] = [
      textCV('가 모둠'),
      textCV('나 모둠'),
      textCV('두 모둠이 같아요'),
      textCV('알 수 없어요'),
    ];

    const shuffled = rng.shuffle(fixedChoices);
    const answerIndex = shuffled.findIndex((c) => c.kind === 'text' && c.text === correctText);

    const explanation: MathExpr = [
      txt(`가 모둠 평균 = ${s1} ÷ ${n1} = ${avg1}권. `),
      txt(`나 모둠 평균 = ${s2} ÷ ${n2} = ${avg2}권. `),
      txt(
        isSame || avg1 === avg2
          ? `두 모둠의 평균이 같으므로 '두 모둠이 같아요'가 정답이에요.`
          : `${avg1 > avg2 ? '가' : '나'} 모둠의 평균이 더 크므로 '${correctText}'이 정답이에요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `가 모둠은 ${n1}명이 책을 ${s1}권, 나 모둠은 ${n2}명이 책을 ${s2}권 읽었어요. 한 명당 읽은 책이 더 많은 모둠은 어느 모둠인가요?`,
      choices: shuffled,
      answerIndex,
      explanation,
    };
  },
};

// ── 5. chance-word ────────────────────────────────────────────────
const chanceWord: SkillDef = {
  id: 'chance-word',
  unitId: 'unitAvg',
  title: '가능성을 말로 나타내기',
  note: '상황을 보고 가능성을 불가능하다/반반이다/확실하다 중에서 고른다.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    type Situation = { q: string; answer: '불가능하다' | '반반이다' | '확실하다' };

    const situations: Situation[] = [
      { q: '주사위를 굴려서 7이 나올 가능성은 어떤가요?', answer: '불가능하다' },
      { q: '동전을 던져서 그림 면이 나올 가능성은 어떤가요?', answer: '반반이다' },
      { q: '내일 아침 해가 동쪽에서 뜰 가능성은 어떤가요?', answer: '확실하다' },
      { q: '주사위를 굴려서 0보다 큰 수가 나올 가능성은 어떤가요?', answer: '확실하다' },
      { q: '1부터 10까지 번호표 중에서 11번을 뽑을 가능성은 어떤가요?', answer: '불가능하다' },
      { q: '검은 공만 든 주머니에서 검은 공을 꺼낼 가능성은 어떤가요?', answer: '확실하다' },
      { q: '흰 공 2개와 검은 공 2개가 든 주머니에서 흰 공을 꺼낼 가능성은 어떤가요?', answer: '반반이다' },
      { q: '숫자 카드 2, 4, 6, 8 중 한 장을 뽑아 홀수가 나올 가능성은 어떤가요?', answer: '불가능하다' },
      { q: '숫자 카드 1, 2, 3, 4 중 한 장을 뽑아 5 이하의 수가 나올 가능성은 어떤가요?', answer: '확실하다' },
      { q: '회전판의 절반은 빨간색, 절반은 파란색일 때 빨간색에 멈출 가능성은 어떤가요?', answer: '반반이다' },
      { q: '빨간 공만 5개 든 주머니에서 파란 공을 꺼낼 가능성은 어떤가요?', answer: '불가능하다' },
      { q: '내년에도 1월이 있을 가능성은 어떤가요?', answer: '확실하다' },
    ];

    const situation = rng.pick(situations);

    // 함정 보기 풀
    const trapChoices = ['~일 것 같다', '~아닐 것 같다'] as const;
    const trap = rng.pick(trapChoices);

    // 4개 보기: 3개 고정 + 함정 1개
    const baseChoices: ChoiceValue[] = [
      textCV('불가능하다'),
      textCV('반반이다'),
      textCV('확실하다'),
      textCV(trap),
    ];

    const shuffled = rng.shuffle(baseChoices);
    const answerIndex = shuffled.findIndex((c) => c.kind === 'text' && c.text === situation.answer);

    const explanationMap: Record<string, string> = {
      불가능하다: '절대로 일어날 수 없으므로 가능성은 "불가능하다"예요.',
      반반이다: '일어날 수도 있고 아닐 수도 있으므로 가능성은 "반반이다"예요.',
      확실하다: '반드시 일어나므로 가능성은 "확실하다"예요.',
    };

    const explanation: MathExpr = [
      txt(explanationMap[situation.answer]),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: situation.q,
      choices: shuffled,
      answerIndex,
      explanation,
    };
  },
};

// ── 6. chance-num ─────────────────────────────────────────────────
const chanceNum: SkillDef = {
  id: 'chance-num',
  unitId: 'unitAvg',
  title: '가능성을 수로 나타내기',
  note: '가능성을 0, 1/2, 1 등 수로 나타낸다.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    type NumSituation = {
      q: string;
      answer: ChoiceValue;
      answerLabel: string;
    };

    const situations: NumSituation[] = [
      {
        q: '회전판의 절반이 빨간색일 때 빨간색에 멈출 가능성을 수로 나타내면 얼마인가요?',
        answer: fracCV(1, 2),
        answerLabel: '1/2',
      },
      {
        q: '주사위를 굴려서 7이 나올 가능성을 수로 나타내면 얼마인가요?',
        answer: dec(0),
        answerLabel: '0',
      },
      {
        q: '검은 공만 든 주머니에서 공을 꺼낼 때 검은 공이 나올 가능성을 수로 나타내면 얼마인가요?',
        answer: dec(1),
        answerLabel: '1',
      },
      {
        q: '동전을 던졌을 때 앞면이 나올 가능성을 수로 나타내면 얼마인가요?',
        answer: fracCV(1, 2),
        answerLabel: '1/2',
      },
      {
        q: '빨간 공만 6개 든 주머니에서 파란 공을 꺼낼 가능성을 수로 나타내면 얼마인가요?',
        answer: dec(0),
        answerLabel: '0',
      },
      {
        q: '내일 해가 서쪽으로 질 가능성을 수로 나타내면 얼마인가요?',
        answer: dec(1),
        answerLabel: '1',
      },
    ];

    const situation = rng.pick(situations);

    // 후보: 0, 1/2, 1, 1/4 — 정답과 겹치지 않는 3개를 오답으로
    const allCandidates: ChoiceValue[] = [
      dec(0),
      fracCV(1, 2),
      dec(1),
      fracCV(1, 4),
      fracCV(3, 4),
      dec(2),
    ];

    const { choices, answerIndex } = buildChoices(situation.answer, allCandidates, rng);

    const explanation: MathExpr = [
      txt(`가능성은 0(불가능) ~ 1(확실) 사이의 수로 나타내요. `),
      txt(`이 경우의 가능성은 ${ida(situation.answerLabel)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: situation.q,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 7. avg-word ───────────────────────────────────────────────────
const avgWord: SkillDef = {
  id: 'avg-word',
  unitId: 'unitAvg',
  title: '평균 활용 문장제',
  note: '목표 평균을 만들기 위해 마지막 회의 값을 구한다.',
  difficulty: 3,
  word: true,
  generate(seed) {
    const rng = new RNG(seed);

    const topics = [
      { subject: '시험 점수', unit: '점', actor: '지민' },
      { subject: '줄넘기 기록', unit: '회', actor: '서연' },
      { subject: '독서 쪽수', unit: '쪽', actor: '민준' },
      { subject: '달리기 기록', unit: '초', actor: '하은' },
    ] as const;
    const topic = rng.pick(topics);

    // m1: 지난 4회 평균, m2: 5회까지 목표 평균 (m2 > m1, 둘 다 정수, 5회 점수 1~100 보장)
    let m1 = 0, m2 = 0, fifth = 0;
    let guard = 0;
    do {
      m1 = rng.int(30, 70);
      m2 = rng.int(m1 + 1, Math.min(m1 + 20, 80));
      fifth = m2 * 5 - m1 * 4;
      guard++;
      if (guard > 300) { m1 = 60; m2 = 64; fifth = m2 * 5 - m1 * 4; break; }
    } while (fifth < 1 || fifth > 100);

    const expr: MathExpr = [
      txt(`5회 ${topic.subject}: `),
      { kind: 'blank', slot: 0 },
      txt(topic.unit),
    ];

    const explanation: MathExpr = [
      txt(`5회까지의 합계 = 목표 평균 × 5 = ${m2} × 5 = ${m2 * 5}${topic.unit}. `),
      txt(`지난 4회의 합계 = 지난 평균 × 4 = ${m1} × 4 = ${m1 * 4}${topic.unit}. `),
      txt(`5회 ${topic.subject} = ${m2 * 5} − ${m1 * 4} = ${fifth}${ida(topic.unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${topic.actor}${josa(topic.actor, '이/가')}의 지난 4회 ${topic.subject} 평균이 ${m1}${ida(topic.unit)}. 5회까지의 평균을 ${m2}${nj(topic.unit, '으로/로')} 만들려면 5회 기록은 몇 ${topic.unit}이어야 할까요?`,
      expr,
      blankAnswers: [fifth],
      explanation,
    };
  },
};

export const unitAvgSkills: SkillDef[] = [
  avgCalc,
  avgSum,
  avgMissing,
  avgCompare,
  chanceWord,
  chanceNum,
  avgWord,
];
