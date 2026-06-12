/**
 * 단원: 각기둥과 각뿔 (2022 개정 6-1 2단원)
 * 성취기준: 각기둥·각뿔의 구성 요소(면·모서리·꼭짓점)의 수를 공식으로 구하고,
 * 역산으로 몇 각기둥/각뿔인지 판별하며, 개념 선택·응용 문장제를 해결한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { MathExpr, SkillDef } from '../types';

// ── 공통 헬퍼 ──────────────────────────────────────────────────

const txt = (text: string) => ({ kind: 'text' as const, text });
const blank = (slot: number) => ({ kind: 'blank' as const, slot });

/** n각형 이름 (n = 3~10) */
const POLYGON_NAMES: Record<number, string> = {
  3: '삼각',
  4: '사각',
  5: '오각',
  6: '육각',
  7: '칠각',
  8: '팔각',
  9: '구각',
  10: '십각',
};

// ── 1. 각기둥 구성 요소 개수 ────────────────────────────────────

const prismCount: SkillDef = {
  id: 'prism-count',
  unitId: 'unitPrism',
  difficulty: 1,
  minVariety: 20,
  title: '각기둥의 구성 요소 개수',
  note: 'n각기둥: 면 n+2, 모서리 3n, 꼭짓점 2n (n=3~10). fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const n = rng.int(3, 10);
    const name = POLYGON_NAMES[n];

    const parts = [
      { partName: '면', answer: n + 2, formula: `n+2 = ${n}+2 = ${n + 2}`, unit: '개' },
      { partName: '모서리', answer: 3 * n, formula: `3×n = 3×${n} = ${3 * n}`, unit: '개' },
      { partName: '꼭짓점', answer: 2 * n, formula: `2×n = 2×${n} = ${2 * n}`, unit: '개' },
    ] as const;
    const part = rng.pick(parts);

    const expr: MathExpr = [
      txt(`${name}기둥의 ${part.partName} 수: `),
      blank(0),
      txt(` ${part.unit}`),
    ];

    const explMap: Record<string, string> = {
      면: `n각기둥의 면은 위·아래 밑면 2개 + 옆면 n개 = n+2개예요. ${name}기둥(n=${n})의 면은 ${n}+2 = ${n + 2}개예요.`,
      모서리: `n각기둥의 모서리는 밑면 2개에 n개씩(2n개) + 옆면 기둥 n개 = 3n개예요. ${name}기둥(n=${n})의 모서리는 3×${n} = ${3 * n}개예요.`,
      꼭짓점: `n각기둥의 꼭짓점은 위 밑면 n개 + 아래 밑면 n개 = 2n개예요. ${name}기둥(n=${n})의 꼭짓점은 2×${n} = ${2 * n}개예요.`,
    };

    const explanation: MathExpr = [txt(explMap[part.partName])];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${name}기둥의 ${part.partName}은 모두 몇 개인가요?`,
      expr,
      blankAnswers: [part.answer],
      explanation,
    };
  },
};

// ── 2. 각뿔 구성 요소 개수 ─────────────────────────────────────

const pyramidCount: SkillDef = {
  id: 'pyramid-count',
  unitId: 'unitPrism',
  difficulty: 1,
  minVariety: 20,
  title: '각뿔의 구성 요소 개수',
  note: 'n각뿔: 면 n+1, 모서리 2n, 꼭짓점 n+1 (n=3~10). fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const n = rng.int(3, 10);
    const name = POLYGON_NAMES[n];

    const parts = [
      { partName: '면', answer: n + 1, unit: '개' },
      { partName: '모서리', answer: 2 * n, unit: '개' },
      { partName: '꼭짓점', answer: n + 1, unit: '개' },
    ] as const;
    const part = rng.pick(parts);

    const expr: MathExpr = [
      txt(`${name}뿔의 ${part.partName} 수: `),
      blank(0),
      txt(` ${part.unit}`),
    ];

    const explMap: Record<string, string> = {
      면: `n각뿔의 면은 밑면 1개 + 옆면(삼각형) n개 = n+1개예요. ${name}뿔(n=${n})의 면은 ${n}+1 = ${n + 1}개예요.`,
      모서리: `n각뿔의 모서리는 밑면 모서리 n개 + 옆 모서리 n개 = 2n개예요. ${name}뿔(n=${n})의 모서리는 2×${n} = ${2 * n}개예요.`,
      꼭짓점: `n각뿔의 꼭짓점은 밑면 꼭짓점 n개 + 꼭대기 꼭짓점 1개 = n+1개예요. ${name}뿔(n=${n})의 꼭짓점은 ${n}+1 = ${n + 1}개예요.`,
    };

    const explanation: MathExpr = [txt(explMap[part.partName])];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${name}뿔의 ${part.partName}은 모두 몇 개인가요?`,
      expr,
      blankAnswers: [part.answer],
      explanation,
    };
  },
};

// ── 3. 각기둥 역산 ─────────────────────────────────────────────

/**
 * 면/모서리/꼭짓점 수로부터 n각기둥의 n을 역산한다.
 * 면 f = n+2  → n = f−2
 * 모서리 e = 3n → n = e÷3
 * 꼭짓점 v = 2n → n = v÷2
 * n=3~10 범위에서만 출제.
 */
const prismInverse: SkillDef = {
  id: 'prism-inverse',
  unitId: 'unitPrism',
  difficulty: 2,
  minVariety: 20,
  title: '각기둥 역산 (몇 각기둥인가)',
  note: '면/모서리/꼭짓점 수 → n각기둥의 n 역산. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const n = rng.int(3, 10);
    const name = POLYGON_NAMES[n];

    type PartKind = 'face' | 'edge' | 'vertex';
    const kind = rng.pick<PartKind>(['face', 'edge', 'vertex']);

    let prompt: string;
    let count: number;
    let expr: MathExpr;
    let explanation: MathExpr;

    if (kind === 'face') {
      count = n + 2;
      prompt = `면이 ${count}개인 각기둥은 몇 각기둥인가요?`;
      expr = [txt(`면 ${count}개 → `), blank(0), txt('각기둥')];
      explanation = [
        txt(
          `n각기둥의 면 수 = n+2이에요. n+2 = ${count}이면 n = ${count}−2 = ${n}이에요. ` +
          `따라서 면이 ${count}개인 각기둥은 ${name}기둥이에요.`,
        ),
      ];
    } else if (kind === 'edge') {
      count = 3 * n;
      prompt = `모서리가 ${count}개인 각기둥은 몇 각기둥인가요?`;
      expr = [txt(`모서리 ${count}개 → `), blank(0), txt('각기둥')];
      explanation = [
        txt(
          `n각기둥의 모서리 수 = 3n이에요. 3n = ${count}이면 n = ${count}÷3 = ${n}이에요. ` +
          `따라서 모서리가 ${count}개인 각기둥은 ${name}기둥이에요.`,
        ),
      ];
    } else {
      count = 2 * n;
      prompt = `꼭짓점이 ${count}개인 각기둥은 몇 각기둥인가요?`;
      expr = [txt(`꼭짓점 ${count}개 → `), blank(0), txt('각기둥')];
      explanation = [
        txt(
          `n각기둥의 꼭짓점 수 = 2n이에요. 2n = ${count}이면 n = ${count}÷2 = ${n}이에요. ` +
          `따라서 꼭짓점이 ${count}개인 각기둥은 ${name}기둥이에요.`,
        ),
      ];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [n],
      explanation,
    };
  },
};

// ── 4. 각뿔 역산 ───────────────────────────────────────────────

/**
 * 면 f = n+1  → n = f−1
 * 모서리 e = 2n → n = e÷2
 * 꼭짓점 v = n+1 → n = v−1
 */
const pyramidInverse: SkillDef = {
  id: 'pyramid-inverse',
  unitId: 'unitPrism',
  difficulty: 2,
  minVariety: 20,
  title: '각뿔 역산 (몇 각뿔인가)',
  note: '면/모서리/꼭짓점 수 → n각뿔의 n 역산. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const n = rng.int(3, 10);
    const name = POLYGON_NAMES[n];

    type PartKind = 'face' | 'edge' | 'vertex';
    const kind = rng.pick<PartKind>(['face', 'edge', 'vertex']);

    let prompt: string;
    let count: number;
    let expr: MathExpr;
    let explanation: MathExpr;

    if (kind === 'face') {
      count = n + 1;
      prompt = `면이 ${count}개인 각뿔은 몇 각뿔인가요?`;
      expr = [txt(`면 ${count}개 → `), blank(0), txt('각뿔')];
      explanation = [
        txt(
          `n각뿔의 면 수 = n+1이에요. n+1 = ${count}이면 n = ${count}−1 = ${n}이에요. ` +
          `따라서 면이 ${count}개인 각뿔은 ${name}뿔이에요.`,
        ),
      ];
    } else if (kind === 'edge') {
      count = 2 * n;
      prompt = `모서리가 ${count}개인 각뿔은 몇 각뿔인가요?`;
      expr = [txt(`모서리 ${count}개 → `), blank(0), txt('각뿔')];
      explanation = [
        txt(
          `n각뿔의 모서리 수 = 2n이에요. 2n = ${count}이면 n = ${count}÷2 = ${n}이에요. ` +
          `따라서 모서리가 ${count}개인 각뿔은 ${name}뿔이에요.`,
        ),
      ];
    } else {
      count = n + 1;
      prompt = `꼭짓점이 ${count}개인 각뿔은 몇 각뿔인가요?`;
      expr = [txt(`꼭짓점 ${count}개 → `), blank(0), txt('각뿔')];
      explanation = [
        txt(
          `n각뿔의 꼭짓점 수 = n+1이에요. n+1 = ${count}이면 n = ${count}−1 = ${n}이에요. ` +
          `따라서 꼭짓점이 ${count}개인 각뿔은 ${name}뿔이에요.`,
        ),
      ];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [n],
      explanation,
    };
  },
};

// ── 5. 개념 4지선다 ────────────────────────────────────────────

/**
 * 각기둥 또는 각뿔에 대한 개념 설명 4지선다.
 * 옳은 설명 풀과 틀린 설명 풀을 구분해 후보 6개 이상 확보 후 buildChoices 사용.
 */

const PRISM_CORRECT = [
  '두 밑면이 서로 평행해요.',
  '두 밑면의 모양과 크기가 서로 같아요.',
  '옆면은 직사각형이에요.',
  '밑면이 n각형이면 n각기둥이에요.',
  '높이는 두 밑면 사이의 거리예요.',
  '밑면이 2개예요.',
  '두 밑면에 수직인 모서리가 n개 있어요.',
];

const PRISM_WRONG = [
  '옆면이 삼각형이에요.',       // 각뿔의 특징
  '꼭짓점이 1개예요.',          // 각뿔의 특징
  '밑면이 1개예요.',            // 각뿔의 특징
  '두 밑면이 평행하지 않아요.', // 틀린 설명
  '옆면이 원이에요.',           // 원기둥 혼동
  '꼭대기가 뾰족해요.',         // 각뿔의 특징
  '모든 면이 삼각형이에요.',     // 틀린 설명
];

const PYRAMID_CORRECT = [
  '밑면이 1개예요.',
  '옆면은 삼각형이에요.',
  '꼭대기에 꼭짓점이 1개 있어요.',
  '밑면이 n각형이면 n각뿔이에요.',
  '높이는 꼭짓점에서 밑면에 내린 수선의 길이예요.',
  '꼭짓점의 수는 밑면의 꼭짓점 수보다 1개 더 많아요.',
  '옆면의 수와 밑면의 변의 수가 같아요.',
];

const PYRAMID_WRONG = [
  '밑면이 2개예요.',            // 각기둥의 특징
  '두 밑면이 서로 평행해요.',   // 각기둥의 특징
  '옆면이 직사각형이에요.',     // 각기둥의 특징
  '꼭짓점이 없어요.',           // 틀린 설명
  '모든 면이 직사각형이에요.',  // 틀린 설명
  '옆면이 원이에요.',           // 원뿔 혼동
  '두 밑면의 모양이 달라요.',   // 틀린 설명
];

const prismPick: SkillDef = {
  id: 'prism-pick',
  unitId: 'unitPrism',
  difficulty: 2,
  minVariety: 5,
  title: '각기둥·각뿔 개념 선택',
  note: '각기둥 또는 각뿔의 옳은 설명 4지선다. 후보 6개 이상. choice 형식.',
  generate(seed) {
    const rng = new RNG(seed);
    const isPrism = rng.chance(0.5);

    const shapeName = isPrism ? '각기둥' : '각뿔';
    const correctPool = isPrism ? PRISM_CORRECT : PYRAMID_CORRECT;
    const wrongPool = isPrism ? PRISM_WRONG : PYRAMID_WRONG;

    // 옳은 설명 1개 선택 (정답)
    const correctText = rng.pick(correctPool);
    // 틀린 설명 후보를 셔플해 6개 확보 (buildChoices 내부에서 3개 선택)
    const wrongCandidates = rng.shuffle(wrongPool).map((t) => ({
      kind: 'text' as const,
      text: t,
    }));

    const answer = { kind: 'text' as const, text: correctText };
    const { choices, answerIndex } = buildChoices(answer, wrongCandidates, rng, 4);

    const explanation: MathExpr = [
      txt(
        isPrism
          ? `각기둥은 두 밑면이 서로 평행하고, 옆면은 직사각형이에요. ` +
            `꼭짓점이 1개인 것은 각뿔의 특징이에요. 정답: "${correctText}"`
          : `각뿔은 밑면이 1개이고, 옆면은 삼각형이에요. ` +
            `두 밑면이 평행한 것은 각기둥의 특징이에요. 정답: "${correctText}"`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${shapeName}에 대한 설명으로 옳은 것을 고르세요.`,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 6. 모서리 길이 합 문장제 ────────────────────────────────────

/**
 * 각기둥: 밑면 정n각형(한 변 a cm), 높이 h cm
 *   → 모든 모서리 합 = 밑면 모서리 2na + 옆 모서리 nh = n(2a + h)
 *
 * 각뿔: 밑면 정n각형(한 변 a cm), 옆 모서리 b cm
 *   → 모든 모서리 합 = 밑면 na + 옆 nb = n(a + b)
 */
const prismWord: SkillDef = {
  id: 'prism-word',
  unitId: 'unitPrism',
  difficulty: 3,
  word: true,
  title: '각기둥·각뿔 모서리 길이 합 문장제',
  note: '각기둥: 2na + nh, 각뿔: na + nb. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const isPrism = rng.chance(0.5);
    const n = rng.int(3, 8); // 삼각~팔각
    const name = POLYGON_NAMES[n];

    if (isPrism) {
      // 각기둥: 밑면 한 변 a, 높이 h
      // 합 = 2na + nh (밑면 위아래 n개씩 2n개 + 옆 기둥 n개)
      const a = rng.int(2, 12);
      const h = rng.int(2, 15);
      const total = 2 * n * a + n * h;

      const expr: MathExpr = [
        txt(`2 × ${n} × ${a} + ${n} × ${h} = ${2 * n * a} + ${n * h} = `),
        blank(0),
        txt(' cm'),
      ];

      const explanation: MathExpr = [
        txt(
          `${name}기둥의 밑면 모서리는 위·아래 합쳐 2×${n}=​${2 * n}개이고 각각 ${a} cm예요. ` +
          `옆 모서리는 ${n}개이고 각각 ${h} cm예요. ` +
          `모든 모서리 합 = 2×${n}×${a} + ${n}×${h} = ${2 * n * a} + ${n * h} = ${total} cm예요.`,
        ),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt:
          `밑면이 한 변 ${a} cm인 정${name}형이고 높이가 ${h} cm인 ${name}기둥의 ` +
          `모든 모서리 길이의 합은 몇 cm인가요?`,
        expr,
        blankAnswers: [total],
        explanation,
      };
    } else {
      // 각뿔: 밑면 한 변 a, 옆 모서리 b
      // 합 = na + nb = n(a+b)
      const a = rng.int(2, 12);
      const b = rng.int(2, 15);
      const total = n * a + n * b;

      const expr: MathExpr = [
        txt(`${n} × ${a} + ${n} × ${b} = ${n * a} + ${n * b} = `),
        blank(0),
        txt(' cm'),
      ];

      const explanation: MathExpr = [
        txt(
          `${name}뿔의 밑면 모서리는 ${n}개이고 각각 ${a} cm예요. ` +
          `옆 모서리는 ${n}개이고 각각 ${b} cm예요. ` +
          `모든 모서리 합 = ${n}×${a} + ${n}×${b} = ${n * a} + ${n * b} = ${total} cm예요.`,
        ),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt:
          `밑면이 한 변 ${a} cm인 정${name}형이고 옆 모서리가 ${b} cm인 ${name}뿔의 ` +
          `모든 모서리 길이의 합은 몇 cm인가요?`,
        expr,
        blankAnswers: [total],
        explanation,
      };
    }
  },
};

// ── export ──────────────────────────────────────────────────────

export const unitPrismSkills: SkillDef[] = [
  prismCount,
  pyramidCount,
  prismInverse,
  pyramidInverse,
  prismPick,
  prismWord,
];
