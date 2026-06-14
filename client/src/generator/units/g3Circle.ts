/**
 * 단원: 원 (2022 개정교육과정 3-2 3단원)
 * 성취기준: 반지름↔지름 관계, 원의 중심·반지름 성질(choice),
 * 원 여러 개 이어붙인 선분 길이(반지름 합산), 문장제
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. circ3-rel  반지름↔지름 관계 (fill-blanks) ────────────────────
const circ3Rel: SkillDef = {
  id: 'circ3-rel',
  unitId: 'unitCircle3',
  difficulty: 1,
  title: '반지름↔지름 관계',
  note: '반지름이 주어지면 지름, 지름이 주어지면 반지름 계산. fill-blanks.',
  minVariety: 18,
  generate(seed) {
    const rng = new RNG(seed);
    const r = rng.int(1, 9); // 반지름 1~9 cm
    const d = r * 2;
    const pat = rng.int(0, 1); // 0: 반지름→지름, 1: 지름→반지름

    let promptStr: string;
    let expr: MathExpr;
    let answer: number;
    let explStr: string;

    if (pat === 0) {
      promptStr = `원의 반지름이 ${r} cm일 때, 지름은 몇 cm인가요?`;
      expr = [txt('지름 = '), { kind: 'blank', slot: 0 }, txt(' cm')];
      answer = d;
      explStr = `지름 = 반지름 × 2 = ${r} × 2 = ${d} cm`;
    } else {
      promptStr = `원의 지름이 ${d} cm일 때, 반지름은 몇 cm인가요?`;
      expr = [txt('반지름 = '), { kind: 'blank', slot: 0 }, txt(' cm')];
      answer = r;
      explStr = `반지름 = 지름 ÷ 2 = ${d} ÷ 2 = ${r} cm`;
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptStr,
      expr,
      blankAnswers: [answer],
      explanation: [txt(explStr)],
    };
  },
};

// ── 2. circ3-prop  원의 중심·반지름 성질 (choice) ────────────────────
const circ3Prop: SkillDef = {
  id: 'circ3-prop',
  unitId: 'unitCircle3',
  difficulty: 1,
  title: '원의 중심·반지름 성질',
  note: '원의 중심·반지름·지름에 관한 성질 중 올바른 것 고르기. choice.',
  minVariety: 4,
  generate(seed) {
    const rng = new RNG(seed);
    const r = rng.int(3, 8); // r≥3으로 올려 wrongs 겹침 방지 (r=3: d=6, wrongs 1,5,7 — OK)
    const d = r * 2;

    // 패턴: 4가지 문항 유형
    const pat = rng.int(0, 3);

    // 패턴 0,1 수치형 오답 — 정답과 다른 값 3개 보장
    // pat0: 정답 r cm, 오답 d, r+1, r+2
    // pat1: 정답 d cm, 오답 r, d+2, d+4
    type QA = { prompt: string; answer: string; wrongs: string[] };
    const qa: QA[] = [
      {
        prompt: `반지름이 ${r} cm인 원에서, 원의 중심에서 원 위의 어느 점까지의 거리는 모두 같아요. 이 거리는 몇 cm인가요?`,
        answer: `${r} cm`,
        wrongs: [`${d} cm`, `${r + 1} cm`, `${r + 2} cm`],
      },
      {
        prompt: `지름이 ${d} cm인 원에서 원의 중심을 지나는 가장 긴 선분의 길이는?`,
        answer: `${d} cm`,
        wrongs: [`${r} cm`, `${d + 2} cm`, `${d + 4} cm`],
      },
      {
        prompt: `원에서 반지름을 몇 개 그을 수 있을까요?`,
        answer: '셀 수 없이 많이 그을 수 있다.',
        wrongs: ['1개만 그을 수 있다.', '2개만 그을 수 있다.', '4개만 그을 수 있다.'],
      },
      {
        prompt: `원에서 지름은 반지름의 몇 배인가요?`,
        answer: '2배',
        wrongs: ['3배', '4배', '1배'],
      },
    ];

    const { prompt, answer, wrongs } = qa[pat];
    const answerVal = txc(answer);
    const candidates: ChoiceValue[] = wrongs.slice(0, 3).map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt,
      expr: [],
      choices,
      answerIndex,
      explanation: [txt(`정답: ${answer}. 원에서 중심에서 원 위의 점까지 거리(반지름)는 모두 같고, 지름 = 반지름 × 2예요.`)],
    };
  },
};

// ── 3. circ3-line  원 여러 개 이어붙인 선분 길이 (fill-blanks) ──────
const circ3Line: SkillDef = {
  id: 'circ3-line',
  unitId: 'unitCircle3',
  difficulty: 2,
  title: '원 여러 개 이어붙인 선분 길이',
  note: '같은 크기 원 2~4개를 일렬로 이어붙인 선분 길이. fill-blanks. r∈{2..8}×n∈{2..4}×pat{0,1}=42combos',
  minVariety: 42,
  generate(seed) {
    const rng = new RNG(seed);
    const r = rng.int(2, 8);  // 반지름 2~8 cm
    const n = rng.int(2, 4);  // 원 2~4개
    const total = r * 2 * n;  // 총 선분 길이 = 지름 × 개수

    const pat = rng.int(0, 1);
    let promptStr: string;
    let answer: number;
    let explStr: string;

    if (pat === 0) {
      // 반지름이 주어졌을 때 선분 길이
      promptStr = `반지름이 ${r} cm인 원 ${n}개를 일렬로 이어붙였어요. 왼쪽 끝에서 오른쪽 끝까지 선분의 길이는 몇 cm인가요?`;
      answer = total;
      explStr = `각 원의 지름 = ${r} × 2 = ${r * 2} cm. 원 ${n}개이므로 ${r * 2} × ${n} = ${total} cm.`;
    } else {
      // 지름이 주어졌을 때 선분 길이
      const d = r * 2;
      promptStr = `지름이 ${d} cm인 원 ${n}개를 일렬로 이어붙였어요. 전체 선분의 길이는 몇 cm인가요?`;
      answer = total;
      explStr = `지름 ${d} cm × ${n}개 = ${total} cm.`;
    }

    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt(' cm'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptStr,
      expr,
      blankAnswers: [answer],
      explanation: [txt(explStr)],
    };
  },
};

// ── 4. circ3-mixed-line  크기 다른 원 이어붙인 선분 길이 (fill-blanks) ─
const circ3MixedLine: SkillDef = {
  id: 'circ3-mixed-line',
  unitId: 'unitCircle3',
  difficulty: 2,
  title: '크기 다른 원 이어붙인 선분 길이',
  note: '크기가 다른 원 2개를 이어붙인 선분 길이(반지름 합산). fill-blanks. r1≠r2∈{1..7}: 42쌍',
  minVariety: 42,
  generate(seed) {
    const rng = new RNG(seed);
    const r1 = rng.int(1, 7);
    let r2 = rng.int(1, 7);
    // r1 ≠ r2 보장
    for (let tries = 0; tries < 20; tries++) {
      if (r2 !== r1) break;
      r2 = rng.int(1, 7);
    }
    if (r2 === r1) r2 = r1 === 7 ? r1 - 1 : r1 + 1;

    const total = (r1 + r2) * 2; // 지름 합 = 두 원의 지름 합산

    const promptStr = `반지름이 ${r1} cm인 원과 반지름이 ${r2} cm인 원을 일렬로 이어붙였어요. 왼쪽 끝에서 오른쪽 끝까지 선분의 길이는 몇 cm인가요?`;
    const explStr = `첫 번째 원의 지름 = ${r1 * 2} cm, 두 번째 원의 지름 = ${r2 * 2} cm. 합 = ${r1 * 2} + ${r2 * 2} = ${total} cm.`;

    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt(' cm'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptStr,
      expr,
      blankAnswers: [total],
      explanation: [txt(explStr)],
    };
  },
};

// ── 5. circ3-word  원 문장제 (fill-blanks) ──────────────────────────
const circ3Word: SkillDef = {
  id: 'circ3-word',
  unitId: 'unitCircle3',
  difficulty: 3,
  word: true,
  title: '원 문장제',
  note: '반지름·지름·선분 길이 모험 소재 문장제. 소재 3가지. pat0,1: r∈{2..9}=8, pat2: r∈{2..6}×n∈{2..4}=15 → ~31',
  minVariety: 30,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let prompt: string;
    let answer: number;
    let unit: string;
    let explanation: string;

    if (pat === 0) {
      // 반지름으로 지름 계산
      const r = rng.int(2, 9);
      const d = r * 2;
      unit = 'cm';
      prompt = `마법사가 원형 방패를 만들었어요. 방패의 반지름이 ${r} cm라면, 지름은 몇 cm인가요?`;
      answer = d;
      explanation = `지름은 반지름의 2배예요. ${r} × 2 = ${d}이라 지름은 ${d} cm예요.`;
    } else if (pat === 1) {
      // 지름으로 반지름 계산
      const r = rng.int(2, 9);
      const d = r * 2;
      unit = 'cm';
      prompt = `용사의 둥근 방어막의 지름이 ${d} cm예요. 중심에서 방어막까지의 거리(반지름)는 몇 cm인가요?`;
      answer = r;
      explanation = `반지름은 지름의 절반이에요. ${d} ÷ 2 = ${r}이라 반지름은 ${r} cm예요.`;
    } else {
      // 원 여러 개 이어붙인 길이
      const r = rng.int(2, 6);
      const n = rng.int(2, 4);
      const total = r * 2 * n;
      unit = 'cm';
      prompt = `반지름이 ${r} cm인 둥근 돌멩이 ${n}개를 일렬로 이어 놓았어요. 처음부터 끝까지 길이는 몇 cm인가요?`;
      answer = total;
      explanation = `각 돌멩이 지름 = ${r * 2} cm. ${n}개이므로 ${r * 2} × ${n} = ${total} cm.`;
    }

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
      blankAnswers: [answer],
      explanation: [txt(explanation)],
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitCircle3Skills: SkillDef[] = [
  circ3Rel,
  circ3Prop,
  circ3Line,
  circ3MixedLine,
  circ3Word,
];
