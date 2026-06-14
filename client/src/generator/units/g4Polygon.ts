/**
 * 단원: 다각형 (2022 개정교육과정 4-2 6단원)
 * 성취기준: 정다각형의 둘레와 대각선 개수를 구하고 정다각형을 이름으로 구별한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

/** 변 수 n인 다각형의 대각선 개수: n(n-3)/2 (n >= 4) */
function diagonalCount(n: number): number {
  return (n * (n - 3)) / 2;
}

// 정다각형 이름 표
const POLYGON_NAMES: Record<number, string> = {
  3: '정삼각형',
  4: '정사각형',
  5: '정오각형',
  6: '정육각형',
  7: '정칠각형',
  8: '정팔각형',
  9: '정구각형',
  10: '정십각형',
};

// ── 1. pgon-perimeter  정다각형 둘레 (fill-blanks)  난이도 1 ──────────────
const pgonPerimeter: SkillDef = {
  id: 'pgon-perimeter',
  unitId: 'unitPolygon',
  difficulty: 1,
  title: '정다각형 둘레',
  note: '변 수 × 한 변의 길이. fill-blanks. minVariety: 40',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    // 변 수: 3~10, 한 변: 2~20
    const n = rng.int(3, 10);
    const side = rng.int(2, 20);
    const peri = n * side;
    const name = POLYGON_NAMES[n];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${name}의 한 변의 길이가 ${side} cm일 때, 둘레는 몇 cm인가요?`,
      expr: [txt(`한 변: ${side} cm, 둘레: `), { kind: 'blank', slot: 0 }, txt(' cm')],
      blankAnswers: [peri],
      explanation: [
        txt(`${name}은 ${n}개의 변이 모두 같아요. ${side} × ${n} = ${peri} cm`),
      ],
    };
  },
};

// ── 2. pgon-side-inv  둘레에서 한 변 역산 (fill-blanks)  난이도 1 ─────────
const pgonSideInv: SkillDef = {
  id: 'pgon-side-inv',
  unitId: 'unitPolygon',
  difficulty: 1,
  title: '둘레에서 한 변 역산',
  note: '둘레 ÷ 변 수 = 한 변. fill-blanks. minVariety: 40',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    let n = 5, side = 6, peri = 30;
    for (let tries = 0; tries < 200; tries++) {
      const tn = rng.int(3, 10);
      const ts = rng.int(2, 20);
      const tp = tn * ts;
      if (tp >= 9 && tp <= 100) { n = tn; side = ts; peri = tp; break; }
    }
    const name = POLYGON_NAMES[n];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${name}의 둘레가 ${peri} cm일 때, 한 변의 길이는 몇 cm인가요?`,
      expr: [txt(`둘레: ${peri} cm, 한 변: `), { kind: 'blank', slot: 0 }, txt(' cm')],
      blankAnswers: [side],
      explanation: [
        txt(`한 변 = 둘레 ÷ 변의 수 = ${peri} ÷ ${n} = ${side} cm`),
      ],
    };
  },
};

// ── 3. pgon-diagonal  대각선 개수 n(n-3)/2 (fill-blanks)  난이도 2 ─────────
const pgonDiagonal: SkillDef = {
  id: 'pgon-diagonal',
  unitId: 'unitPolygon',
  difficulty: 2,
  title: '대각선 개수',
  note: 'n(n-3)/2 공식 적용. 4~10각형. fill-blanks.',
  minVariety: 7,
  generate(seed) {
    const rng = new RNG(seed);
    // 4~10각형에서 선택 (대각선이 있는 다각형만)
    const n = rng.int(4, 10);
    const diag = diagonalCount(n);
    const name = POLYGON_NAMES[n];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${name}의 대각선은 모두 몇 개인가요?`,
      expr: [txt(`${name}의 대각선 수: `), { kind: 'blank', slot: 0 }, txt('개')],
      blankAnswers: [diag],
      explanation: [
        txt(`한 꼭짓점에서는 자기 자신과 양옆 꼭짓점을 뺀 ${n - 3}개에 대각선을 그을 수 있어요.`),
        txt(`꼭짓점이 ${n}개이고 대각선 하나를 두 번씩 세므로, ${n} × ${n - 3} ÷ 2 = ${n * (n - 3)} ÷ 2 = ${diag}개.`),
      ],
    };
  },
};

// ── 4. pgon-name  정다각형 이름·변 수 (choice)  난이도 1 ──────────────────
const pgonName: SkillDef = {
  id: 'pgon-name',
  unitId: 'unitPolygon',
  difficulty: 1,
  title: '정다각형 이름·변 수',
  note: '변 수 제시 → 이름 고르기 또는 이름 제시 → 변 수 고르기. 4지선다.',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const sides = [3, 4, 5, 6, 7, 8, 9, 10];

    if (pat === 0) {
      // 변 수 → 이름
      const n = rng.pick(sides);
      const name = POLYGON_NAMES[n];
      const answerVal = txc(name);
      const distractorSides = sides.filter((s) => s !== n);
      const candidates = rng.sample(distractorSides, 3).map((s) => txc(POLYGON_NAMES[s]));
      const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'choice',
        prompt: `변이 ${n}개인 정다각형의 이름은 무엇인가요?`,
        expr: [txt(`변 수: ${n}개`)],
        choices,
        answerIndex,
        explanation: [txt(`변이 ${n}개인 정다각형은 ${name}이에요.`)],
      };
    } else {
      // 이름 → 변 수
      const n = rng.pick(sides);
      const name = POLYGON_NAMES[n];
      const answerVal = txc(`${n}개`);
      const distractorSides = sides.filter((s) => s !== n);
      const candidates = rng.sample(distractorSides, 3).map((s) => txc(`${s}개`));
      const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'choice',
        prompt: `${name}의 변은 모두 몇 개인가요?`,
        expr: [txt(name)],
        choices,
        answerIndex,
        explanation: [txt(`${name}은 변이 ${n}개예요.`)],
      };
    }
  },
};

// ── 5. pgon-word  다각형 문장제  난이도 3 ─────────────────────────────────
const pgonWord: SkillDef = {
  id: 'pgon-word',
  unitId: 'unitPolygon',
  difficulty: 3,
  word: true,
  title: '다각형 문장제',
  note: '정다각형 둘레·대각선 소재 모험 문장제. 소재 4가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 정다각형 둘레
      const n = rng.int(3, 10);
      const side = rng.int(3, 20);
      const peri = n * side;
      const name = POLYGON_NAMES[n];
      answer = peri;
      prompt = `마법사의 마법진은 ${name} 모양이에요. 한 변의 길이가 ${side} cm라면 마법진의 둘레는 몇 cm인가요?`;
      explanation = [txt(`${name} 둘레 = ${side} × ${n} = ${peri} cm`)];
    } else if (pat === 1) {
      // 한 변 역산
      const n = rng.int(3, 10);
      const side = rng.int(3, 15);
      const peri = n * side;
      const name = POLYGON_NAMES[n];
      answer = side;
      prompt = `탐험대의 요새는 ${name} 모양이에요. 요새의 둘레가 ${peri} m라면 한 변의 길이는 몇 m인가요?`;
      explanation = [txt(`한 변 = ${peri} ÷ ${n} = ${side} m`)];
    } else if (pat === 2) {
      // 대각선 개수
      const n = rng.int(4, 8);
      const diag = diagonalCount(n);
      const name = POLYGON_NAMES[n];
      answer = diag;
      prompt = `모험가가 그린 ${name} 도형에서 대각선은 모두 몇 개인가요?`;
      explanation = [
        txt(`한 꼭짓점에서 ${n - 3}개씩, 꼭짓점은 ${n}개, 대각선을 두 번씩 세므로 2로 나눠요.`),
        txt(`${n} × (${n} − 3) ÷ 2 = ${n * (n - 3)} ÷ 2 = ${diag}개`),
      ];
    } else {
      // 여러 정다각형의 둘레 합 비교
      const n1 = rng.pick([4, 5, 6] as const);
      const n2 = rng.pick([3, 4, 5] as const);
      const side1 = rng.int(3, 12);
      const side2 = rng.int(3, 12);
      const peri1 = n1 * side1;
      const peri2 = n2 * side2;
      const name1 = POLYGON_NAMES[n1];
      const name2 = POLYGON_NAMES[n2];
      answer = peri1 + peri2;
      prompt = `${name1}(한 변 ${side1} cm)과 ${name2}(한 변 ${side2} cm)의 둘레를 모두 더하면 몇 cm인가요?`;
      explanation = [
        txt(`${name1} 둘레: ${side1} × ${n1} = ${peri1} cm`),
        txt(`${name2} 둘레: ${side2} × ${n2} = ${peri2} cm`),
        txt(`합계: ${peri1} + ${peri2} = ${answer} cm`),
      ];
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

export const unitPolygonSkills: SkillDef[] = [
  pgonPerimeter,
  pgonSideInv,
  pgonDiagonal,
  pgonName,
  pgonWord,
];
