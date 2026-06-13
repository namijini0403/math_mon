/**
 * 단원: 평면도형 (2022 개정교육과정 3-1 2단원)
 * 성취기준: 선분·직선·반직선을 구분하고, 각과 직각 개수를 알며,
 * 직각삼각형을 판별하고, 직사각형·정사각형의 둘레/변을 역산한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. plane3-line  선분·직선·반직선 구분 (choice)  난이도 1 ──────────
const plane3Line: SkillDef = {
  id: 'plane3-line',
  unitId: 'unitPlane3',
  difficulty: 1,
  title: '선분·직선·반직선 구분',
  note: '선분/직선/반직선 설명을 보고 고르기. 4지선다. (오답에 곡선 추가)',
  minVariety: 6,
  generate(seed) {
    const rng = new RNG(seed);

    const items = [
      {
        q: '양 끝이 있는 곧은 선이에요.',
        answer: '선분',
        explain: '양 끝이 정해진 곧은 선은 선분이에요.',
      },
      {
        q: '양쪽으로 끝없이 뻗은 곧은 선이에요.',
        answer: '직선',
        explain: '양쪽 모두 끝없이 뻗은 선은 직선이에요.',
      },
      {
        q: '한쪽 끝은 있고, 다른 쪽으로 끝없이 뻗은 선이에요.',
        answer: '반직선',
        explain: '한 끝점에서 한 방향으로만 끝없이 뻗은 선은 반직선이에요.',
      },
      {
        q: '점 ㄱ에서 점 ㄴ까지 이어진 곧은 선이에요.',
        answer: '선분',
        explain: '두 점 사이를 잇는 곧은 선은 선분이에요.',
      },
      {
        q: '점 ㄱ을 지나 양쪽으로 끝없이 뻗은 선이에요.',
        answer: '직선',
        explain: '양쪽 모두 끝없이 뻗은 선은 직선이에요.',
      },
      {
        q: '점 ㄱ에서 출발하여 점 ㄴ 방향으로만 끝없이 뻗은 선이에요.',
        answer: '반직선',
        explain: '한 끝점에서 한쪽으로만 뻗는 선은 반직선이에요.',
      },
    ];

    const item = rng.pick(items);
    const answerVal = txc(item.answer);
    const allLabels = ['선분', '직선', '반직선', '곡선'];
    const candidates = allLabels
      .filter(l => l !== item.answer)
      .map(l => txc(l));
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: item.q,
      expr: [txt(item.q)],
      choices,
      answerIndex,
      explanation: [txt(item.explain)],
    };
  },
};

// ── 2. plane3-angle  도형의 각·직각 개수 (fill-blanks)  난이도 1 ─────
const plane3Angle: SkillDef = {
  id: 'plane3-angle',
  unitId: 'unitPlane3',
  difficulty: 1,
  title: '도형의 각·직각 개수',
  note: '삼각형/사각형/직사각형/정사각형의 각 개수·직각 개수. fill-blanks(2칸).',
  minVariety: 8,
  generate(seed) {
    const rng = new RNG(seed);

    const shapes = [
      { name: '삼각형', angles: 3, rightAngles: 0 },
      { name: '직각삼각형', angles: 3, rightAngles: 1 },
      { name: '사각형', angles: 4, rightAngles: 0 },
      { name: '직사각형', angles: 4, rightAngles: 4 },
      { name: '정사각형', angles: 4, rightAngles: 4 },
      { name: '오각형', angles: 5, rightAngles: 0 },
      { name: '육각형', angles: 6, rightAngles: 0 },
      { name: '평행사변형', angles: 4, rightAngles: 0 },
    ];

    const shape = rng.pick(shapes);

    // 패턴 0: 각의 수만 물어보기 (1칸)
    // 패턴 1: 직각의 수만 물어보기 (1칸)
    const pat = rng.int(0, 1);

    if (pat === 0) {
      const expr: MathExpr = [
        txt(`${shape.name}의 각의 수: `),
        { kind: 'blank', slot: 0 },
        txt('개'),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${shape.name}의 각은 모두 몇 개인가요?`,
        expr,
        blankAnswers: [shape.angles],
        explanation: [txt(`${shape.name}의 각은 ${shape.angles}개예요.`)],
      };
    } else {
      // 직각 개수 (직각이 0인 도형이면 다시 뽑기)
      let chosen = shape;
      for (let tries = 0; tries < 50; tries++) {
        const s = rng.pick(shapes);
        if (s.rightAngles > 0) { chosen = s; break; }
      }
      // 직각이 없는 도형도 가능 (정답 0은 blankAnswers 규칙상 금지 → rightAngles>0 보장)
      // fallback: 직각삼각형
      if (chosen.rightAngles === 0) chosen = shapes[1];

      const expr: MathExpr = [
        txt(`${chosen.name}의 직각 수: `),
        { kind: 'blank', slot: 0 },
        txt('개'),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${chosen.name}에서 직각은 모두 몇 개인가요?`,
        expr,
        blankAnswers: [chosen.rightAngles],
        explanation: [txt(`${chosen.name}의 직각은 ${chosen.rightAngles}개예요.`)],
      };
    }
  },
};

// ── 3. plane3-right-tri  직각삼각형 판별 (choice)  난이도 2 ──────────
const plane3RightTri: SkillDef = {
  id: 'plane3-right-tri',
  unitId: 'unitPlane3',
  difficulty: 2,
  title: '직각삼각형 판별',
  note: '세 각이 주어질 때 직각삼각형인지 판별. choice(맞다/아니다).',
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴 0: 직각삼각형 (한 각이 90°)
    // 패턴 1: 일반 삼각형 (직각 없음)
    const isRight = rng.chance(0.5);

    let a: number, b: number, c: number;
    let answer: string;
    let explain: string;

    if (isRight) {
      // 한 각이 90°인 삼각형
      let fa = 90, fb = 40, fc = 50;
      for (let tries = 0; tries < 200; tries++) {
        const tb = rng.int(10, 80);
        const tc = 90 - tb;
        if (tc >= 1 && tc <= 89) { fa = 90; fb = tb; fc = tc; break; }
      }
      a = fa; b = fb; c = fc;
      answer = '맞다';
      explain = `세 각 중 하나가 90°이므로 직각삼각형이에요.`;
    } else {
      // 직각 없는 삼각형
      let fa = 60, fb = 70, fc = 50;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 80);
        const tb = rng.int(30, 80);
        const tc = 180 - ta - tb;
        if (tc >= 1 && tc !== 90 && ta !== 90 && tb !== 90 && tc <= 178) {
          fa = ta; fb = tb; fc = tc; break;
        }
      }
      a = fa; b = fb; c = fc;
      answer = '아니다';
      explain = `세 각 중에 90°가 없으므로 직각삼각형이 아니에요.`;
    }

    const answerVal = txc(answer);
    const candidates: ChoiceValue[] = [
      txc(answer === '맞다' ? '아니다' : '맞다'),
      txc('알 수 없다'),
      txc('예각삼각형이다'),
    ];
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `세 각이 ${a}°, ${b}°, ${c}°인 삼각형은 직각삼각형인가요?`,
      expr: [txt(`${a}°, ${b}°, ${c}°`)],
      choices,
      answerIndex,
      explanation: [txt(explain)],
    };
  },
};

// ── 4. plane3-perimeter  직사각형·정사각형 둘레/변 역산 (fill-blanks)  난이도 2 ──
const plane3Perimeter: SkillDef = {
  id: 'plane3-perimeter',
  unitId: 'unitPlane3',
  difficulty: 2,
  title: '직사각형·정사각형 둘레·변 역산',
  note: '둘레에서 변 길이 역산, 또는 변에서 둘레 계산. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴 0: 직사각형 둘레 구하기 (가로+세로 → 둘레)
    // 패턴 1: 직사각형 변 역산 (둘레+한 변 → 다른 변)
    // 패턴 2: 정사각형 둘레 구하기
    // 패턴 3: 정사각형 변 역산 (둘레 → 한 변)
    const pat = rng.int(0, 3);

    let expr: MathExpr;
    let answer: number;
    let promptStr: string;
    let explStr: string;

    if (pat === 0) {
      const w = rng.int(2, 20);
      const h = rng.int(2, 20);
      const peri = (w + h) * 2;
      answer = peri;
      promptStr = `가로가 ${w} cm, 세로가 ${h} cm인 직사각형의 둘레는 몇 cm인가요?`;
      expr = [txt('둘레 = '), { kind: 'blank', slot: 0 }, txt(' cm')];
      explStr = `(${w} + ${h}) × 2 = ${w + h} × 2 = ${peri} cm`;
    } else if (pat === 1) {
      const peri = rng.int(4, 40) * 2; // 짝수
      const h = rng.int(1, peri / 2 - 1);
      const w = peri / 2 - h;
      answer = w;
      promptStr = `둘레가 ${peri} cm이고 세로가 ${h} cm인 직사각형의 가로는 몇 cm인가요?`;
      expr = [txt('가로 = '), { kind: 'blank', slot: 0 }, txt(' cm')];
      explStr = `가로 = ${peri} ÷ 2 - ${h} = ${peri / 2} - ${h} = ${w} cm`;
    } else if (pat === 2) {
      const side = rng.int(2, 25);
      const peri = side * 4;
      answer = peri;
      promptStr = `한 변이 ${side} cm인 정사각형의 둘레는 몇 cm인가요?`;
      expr = [txt('둘레 = '), { kind: 'blank', slot: 0 }, txt(' cm')];
      explStr = `${side} × 4 = ${peri} cm`;
    } else {
      // 정사각형 변 역산
      const side = rng.int(2, 25);
      const peri = side * 4;
      answer = side;
      promptStr = `둘레가 ${peri} cm인 정사각형의 한 변은 몇 cm인가요?`;
      expr = [txt('한 변 = '), { kind: 'blank', slot: 0 }, txt(' cm')];
      explStr = `${peri} ÷ 4 = ${side} cm`;
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

// ── 5. plane3-word  평면도형 문장제 (fill-blanks)  난이도 3 ──────────
const plane3Word: SkillDef = {
  id: 'plane3-word',
  unitId: 'unitPlane3',
  difficulty: 3,
  word: true,
  title: '평면도형 문장제',
  note: '직사각형·정사각형 둘레 활용 모험 소재 문장제. 소재 4가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;
    let unit: string;

    if (pat === 0) {
      // 직사각형 둘레
      const w = rng.int(3, 20);
      const h = rng.int(3, 20);
      const peri = (w + h) * 2;
      answer = peri;
      unit = 'm';
      prompt = `마법 정원의 가로가 ${w} m, 세로가 ${h} m예요. 정원 주위에 울타리를 치려면 몇 m가 필요한가요?`;
      explanation = [txt(`(${w} + ${h}) × 2 = ${peri} m`)];
    } else if (pat === 1) {
      // 정사각형 둘레
      const side = rng.int(4, 20);
      const peri = side * 4;
      answer = peri;
      unit = 'cm';
      prompt = `용사의 방패는 한 변이 ${side} cm인 정사각형 모양이에요. 방패의 둘레는 몇 cm인가요?`;
      explanation = [txt(`${side} × 4 = ${peri} cm`)];
    } else if (pat === 2) {
      // 변 역산 (가로 구하기)
      const peri = rng.int(4, 40) * 2;
      const h = rng.int(1, peri / 2 - 1);
      const w = peri / 2 - h;
      answer = w;
      unit = 'cm';
      prompt = `마법 양탄자는 직사각형 모양으로 둘레가 ${peri} cm이고, 세로가 ${h} cm예요. 가로는 몇 cm인가요?`;
      explanation = [txt(`가로 = ${peri} ÷ 2 - ${h} = ${w} cm`)];
    } else {
      // 정사각형 변 역산
      const side = rng.int(3, 20);
      const peri = side * 4;
      answer = side;
      unit = 'cm';
      prompt = `보물 상자 뚜껑은 정사각형 모양으로 둘레가 ${peri} cm예요. 한 변의 길이는 몇 cm인가요?`;
      explanation = [txt(`${peri} ÷ 4 = ${side} cm`)];
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
      explanation,
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitPlane3Skills: SkillDef[] = [
  plane3Line,
  plane3Angle,
  plane3RightTri,
  plane3Perimeter,
  plane3Word,
];
