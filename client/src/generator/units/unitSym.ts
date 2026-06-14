/**
 * 단원: 합동과 대칭 (2022 개정교육과정 5-2 3단원)
 * 성취기준: 합동의 의미와 성질을 알고, 선대칭도형·점대칭도형의 성질을 이해하여
 * 문제 해결에 활용한다. (그림 없이 텍스트로 출제 가능한 유형만 다룸)
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;
const blank = (slot: number) => ({ kind: 'blank', slot }) as const;

/** 삼각형 꼭짓점 이름 쌍: 삼각형 ㄱㄴㄷ ↔ 삼각형 ㄹㅁㅂ */
const TRI_A = ['ㄱ', 'ㄴ', 'ㄷ'] as const;
const TRI_B = ['ㄹ', 'ㅁ', 'ㅂ'] as const;

/** 변 이름 (꼭짓점 인덱스 두 개로 변 구성) */
const SIDES: [number, number][] = [
  [0, 1], // ㄱㄴ / ㄹㅁ
  [1, 2], // ㄴㄷ / ㅁㅂ
  [0, 2], // ㄱㄷ / ㄹㅂ
];

/** 각 이름 (꼭짓점 인덱스로 각 구성) */
const ANGLES: number[] = [0, 1, 2]; // 각 ㄱ/각 ㄹ, 각 ㄴ/각 ㅁ, 각 ㄷ/각 ㅂ

// ── 1. sym-corr-side ────────────────────────────────────────────────
const corrSide: SkillDef = {
  id: 'sym-corr-side',
  minVariety: 40,
  unitId: 'unitSym',
  title: '합동 대응변 구하기',
  note: '합동인 두 삼각형에서 대응변의 길이를 구한다. 길이 3~20 cm.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);
    const sideIdx = rng.int(0, 2);
    const [i, j] = SIDES[sideIdx];
    const vA0 = TRI_A[i];
    const vA1 = TRI_A[j];
    const vB0 = TRI_B[i];
    const vB1 = TRI_B[j];
    const len = rng.int(3, 20);

    const expr: MathExpr = [
      txt(`변 ${vB0}${vB1} = `),
      blank(0),
      txt(' cm'),
    ];

    const explanation: MathExpr = [
      txt(`합동인 두 도형에서 대응변의 길이는 서로 같아요. `),
      txt(`변 ${vA0}${vA1}의 대응변은 변 ${vB0}${vB1}이므로 변 ${vB0}${vB1}도 ${len} cm예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `삼각형 ㄱㄴㄷ과 삼각형 ㄹㅁㅂ은 서로 합동입니다. 변 ${vA0}${nj(vA1, '이/가')} ${len} cm일 때, 대응변인 변 ${vB0}${nj(vB1, '은/는')} 몇 cm인가요?`,
      expr,
      blankAnswers: [len],
      explanation,
      figure: { kind: 'congruent-triangle-pair' },
    };
  },
};

// ── 2. sym-corr-angle ───────────────────────────────────────────────
const corrAngle: SkillDef = {
  id: 'sym-corr-angle',
  unitId: 'unitSym',
  title: '합동 대응각 구하기',
  note: '합동인 두 삼각형에서 대응각의 크기를 구한다. 각 20~120°.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);
    const angleIdx = rng.pick(ANGLES);
    const vA = TRI_A[angleIdx];
    const vB = TRI_B[angleIdx];
    const deg = rng.int(20, 120);

    const expr: MathExpr = [
      txt(`각 ${vB} = `),
      blank(0),
      txt('°'),
    ];

    const explanation: MathExpr = [
      txt(`합동인 두 도형에서 대응각의 크기는 서로 같아요. `),
      txt(`각 ${vA}의 대응각은 각 ${vB}이므로 각 ${vB}도 ${deg}°예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `삼각형 ㄱㄴㄷ과 삼각형 ㄹㅁㅂ은 서로 합동입니다. 각 ${nj(vA, '이/가')} ${deg}°일 때, 대응각인 각 ${nj(vB, '은/는')} 몇 도인가요?`,
      expr,
      blankAnswers: [deg],
      explanation,
      figure: { kind: 'congruent-triangle-pair' },
    };
  },
};

// ── 3. sym-peri ─────────────────────────────────────────────────────
const periSkill: SkillDef = {
  id: 'sym-peri',
  unitId: 'unitSym',
  title: '합동 삼각형 둘레 활용',
  note: '합동 삼각형의 둘레와 두 변을 알 때 나머지 한 변을 구한다. 삼각형 부등식 보장.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 삼각형 부등식을 만족하는 세 변 생성
    let a = 5, b = 6, c = 7;
    let guard = 0;
    do {
      a = rng.int(3, 15);
      b = rng.int(3, 15);
      c = rng.int(3, 15);
      guard++;
      if (guard > 300) { a = 5; b = 6; c = 7; break; }
    } while (
      a + b <= c || a + c <= b || b + c <= a
    );

    const peri = a + b + c;

    // 어떤 두 변을 주고 나머지를 구할지 랜덤
    const hiddenIdx = rng.int(0, 2);
    const sides = [a, b, c];
    const answer = sides[hiddenIdx];
    const known = sides.filter((_, i) => i !== hiddenIdx);
    const [k1, k2] = known;

    const expr: MathExpr = [
      txt('나머지 한 변 = '),
      blank(0),
      txt(' cm'),
    ];

    const explanation: MathExpr = [
      txt(`합동인 삼각형의 둘레는 ${peri} cm예요. `),
      txt(`두 변의 합이 ${k1}+${k2}=${k1 + k2} cm이므로 `),
      txt(`나머지 한 변은 ${peri}−${k1 + k2}=${answer} cm예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `삼각형 ㄱㄴㄷ과 합동인 삼각형의 둘레가 ${peri} cm이고, 두 변이 ${k1} cm, ${k2} cm일 때 나머지 한 변은 몇 cm인가요?`,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 4. sym-axis-count ───────────────────────────────────────────────
interface ShapeInfo {
  name: string;
  axes: number;
}

const SHAPES: ShapeInfo[] = [
  { name: '정삼각형', axes: 3 },
  { name: '정사각형', axes: 4 },
  { name: '정오각형', axes: 5 },
  { name: '정육각형', axes: 6 },
  { name: '직사각형', axes: 2 },
  { name: '마름모', axes: 2 },
  { name: '이등변삼각형', axes: 1 },
];

const axisCount: SkillDef = {
  id: 'sym-axis-count',
  minVariety: 7,
  unitId: 'unitSym',
  title: '선대칭도형의 대칭축 개수',
  note: '정다각형·특수 사각형 등 7가지 도형 중 하나를 골라 대칭축 수를 구한다.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);
    const shape = rng.pick(SHAPES);

    const expr: MathExpr = [
      txt(`대칭축의 수: `),
      blank(0),
      txt('개'),
    ];

    const explanation: MathExpr = [
      txt(`${nj(shape.name, '은/는')} 선대칭도형이에요. `),
      txt(`${shape.name}의 대칭축은 모두 ${shape.axes}개예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${shape.name}의 대칭축은 모두 몇 개인가요?`,
      expr,
      blankAnswers: [shape.axes],
      explanation,
    };
  },
};

// ── 5. sym-line-dist ────────────────────────────────────────────────
const lineDist: SkillDef = {
  id: 'sym-line-dist',
  minVariety: 25,
  unitId: 'unitSym',
  title: '선대칭 성질 — 거리 관계',
  note: '대칭축까지 거리 또는 선분 전체 길이를 구하는 두 변형을 랜덤으로 출제.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);
    const d = rng.int(2, 15);
    const variant = rng.int(0, 1); // 0: 대응점 거리 같음, 1: 선분 전체 길이 2d

    let prompt: string;
    let expr: MathExpr;
    let answer: number;
    let explanation: MathExpr;

    if (variant === 0) {
      // 변형 0: 점 ㄱ에서 대칭축까지 d cm → 대응점 ㄱ'에서 대칭축까지 거리는?
      prompt = `선대칭도형에서 점 ㄱ에서 대칭축까지의 거리가 ${d} cm일 때, 대응점 ㄱ'에서 대칭축까지의 거리는 몇 cm인가요?`;
      answer = d;
      expr = [
        txt(`대응점 ㄱ'에서 대칭축까지 = `),
        blank(0),
        txt(' cm'),
      ];
      explanation = [
        txt(`선대칭도형에서 대응점은 대칭축으로부터 서로 같은 거리에 있어요. `),
        txt(`점 ㄱ에서 대칭축까지 ${d} cm이므로 대응점 ㄱ'에서 대칭축까지도 ${d} cm예요.`),
      ];
    } else {
      // 변형 1: 점 ㄱ과 대응점 ㄱ'을 이은 선분이 대칭축과 만나는 점까지 거리 d cm → 선분 ㄱㄱ' 전체는?
      prompt = `선대칭도형에서 점 ㄱ과 대응점 ㄱ'을 이은 선분이 대칭축과 만나는 점까지의 거리가 ${d} cm일 때, 선분 ㄱㄱ'의 전체 길이는 몇 cm인가요?`;
      answer = 2 * d;
      expr = [
        txt(`선분 ㄱㄱ' = `),
        blank(0),
        txt(' cm'),
      ];
      explanation = [
        txt(`대칭축은 두 대응점을 이은 선분의 중점을 지나요. `),
        txt(`점 ㄱ에서 대칭축까지 ${d} cm, 대칭축에서 ㄱ'까지도 ${d} cm이므로 `),
        txt(`선분 ㄱㄱ'은 ${d}+${d}=${2 * d} cm예요.`),
      ];
    }

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

// ── 6. sym-word ─────────────────────────────────────────────────────
const symWord: SkillDef = {
  id: 'sym-word',
  unitId: 'unitSym',
  title: '점대칭·선대칭 활용 문장제',
  note: '2단계 사고 문장제 4가지 변형(소재 풀). 점대칭 중심 거리, 대칭축 양쪽 합, 둘레, 대응변 합.',
  difficulty: 3,
  word: true,
  generate(seed) {
    const rng = new RNG(seed);
    const templateIdx = rng.int(0, 3);

    let prompt: string;
    let expr: MathExpr;
    let answer: number;
    let explanation: MathExpr;

    if (templateIdx === 0) {
      // 소재 0: 점대칭 — 대칭의 중심에서 점까지 거리 d → 대응점까지 거리는 2d
      const d = rng.int(2, 12);
      answer = 2 * d;
      prompt = `점대칭도형에서 대칭의 중심에서 점 ㄱ까지의 거리가 ${d} cm입니다. 점 ㄱ에서 대응점 ㄱ'까지의 거리는 몇 cm인가요?`;
      expr = [
        txt(`점 ㄱ에서 대응점 ㄱ'까지 = `),
        blank(0),
        txt(' cm'),
      ];
      explanation = [
        txt(`점대칭도형에서 대칭의 중심은 두 대응점을 이은 선분의 중점이에요. `),
        txt(`대칭의 중심에서 점 ㄱ까지 ${d} cm, 중심에서 ㄱ'까지도 ${d} cm이므로 `),
        txt(`점 ㄱ에서 대응점 ㄱ'까지는 ${d}+${d}=${answer} cm예요.`),
      ];

    } else if (templateIdx === 1) {
      // 소재 1: 선대칭 — 대칭축 양쪽 변의 합으로 전체 둘레 구하기
      // 선대칭 삼각형, 대칭축으로 나뉘는 반쪽 둘레(대칭축 제외)의 두 변 길이를 주고 전체 둘레 구하기
      // 이등변삼각형 — 밑변 isoBase, 같은 두 변 isoSide
      const isoBase = rng.int(4, 14);
      const isoSide = rng.int(3, 12);
      answer = isoBase + 2 * isoSide;
      prompt = `이등변삼각형 모양의 선대칭도형에서 대칭축을 따라 접으면 두 변이 완전히 겹칩니다. 밑변이 ${isoBase} cm이고 같은 두 변 중 하나가 ${isoSide} cm일 때, 이 삼각형의 둘레는 몇 cm인가요?`;
      expr = [
        txt('둘레 = '),
        blank(0),
        txt(' cm'),
      ];
      explanation = [
        txt(`이등변삼각형은 선대칭도형으로 대칭축을 접으면 두 변이 겹쳐요. `),
        txt(`같은 두 변이 각각 ${isoSide} cm이고 밑변이 ${isoBase} cm이므로 `),
        txt(`둘레는 ${isoSide}+${isoSide}+${isoBase}=${answer} cm예요.`),
      ];

    } else if (templateIdx === 2) {
      // 소재 2: 점대칭 — 대응변 길이로 변의 합 구하기
      const side1 = rng.int(3, 12);
      const side2 = rng.int(3, 12);
      // 대응변의 길이는 같으므로 합 = ㄱㄴ × 2 (ㄴㄷ은 함정용 불필요 정보)
      answer = side1 * 2;
      prompt = `점대칭도형에서 변 ㄱㄴ의 대응변은 변 ㄷㄹ입니다. 변 ㄱㄴ이 ${side1} cm, 변 ㄴㄷ이 ${side2} cm일 때, 변 ㄱㄴ과 변 ㄷㄹ의 길이의 합은 몇 cm인가요?`;
      expr = [
        txt('변 ㄱㄴ + 변 ㄷㄹ = '),
        blank(0),
        txt(' cm'),
      ];
      explanation = [
        txt(`점대칭도형에서 대응변의 길이는 서로 같아요. `),
        txt(`변 ㄱㄴ의 대응변인 변 ㄷㄹ도 ${side1} cm예요. `),
        txt(`따라서 두 변의 합은 ${side1}+${side1}=${answer} cm예요.`),
      ];

    } else {
      // 소재 3: 선대칭 — 선대칭도형의 대칭 후 대응점 거리 합
      // 두 쌍의 대응점이 각각 대칭축과의 거리가 d1, d2일 때 두 선분의 합
      const d1 = rng.int(2, 10);
      const d2 = rng.int(2, 10);
      answer = 2 * d1 + 2 * d2;
      prompt = `선대칭도형에서 점 ㄱ에서 대칭축까지의 거리가 ${d1} cm이고, 점 ㄴ에서 대칭축까지의 거리가 ${d2} cm입니다. 선분 ㄱㄱ'과 선분 ㄴㄴ'의 길이의 합은 몇 cm인가요?`;
      expr = [
        txt('선분 ㄱㄱ\' + 선분 ㄴㄴ\' = '),
        blank(0),
        txt(' cm'),
      ];
      explanation = [
        txt(`대칭축은 두 대응점을 이은 선분의 중점을 수직으로 지나요. `),
        txt(`선분 ㄱㄱ'은 ${d1}×2=${2 * d1} cm, 선분 ㄴㄴ'은 ${d2}×2=${2 * d2} cm이므로 `),
        txt(`합은 ${2 * d1}+${2 * d2}=${answer} cm예요.`),
      ];
    }

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

export const unitSymSkills: SkillDef[] = [
  corrSide,
  corrAngle,
  periSkill,
  axisCount,
  lineDist,
  symWord,
];
