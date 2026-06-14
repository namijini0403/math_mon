/**
 * 단원: 직육면체 (2022 개정 5-2 5단원)
 * 성취기준: 직육면체·정육면체의 구성 요소(면·모서리·꼭짓점)를 알고, 면의 관계(평행·수직)를
 * 이해하며, 모서리 길이의 합을 구하는 공식을 활용한다.
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

// ── 공통 헬퍼 ──────────────────────────────────────────────

const txt = (text: string) => ({ kind: 'text' as const, text });
const blank = (slot: number) => ({ kind: 'blank' as const, slot });

// ── 1. 구성 요소 개수 ────────────────────────────────────────

const cubCount: SkillDef = {
  id: 'cub-count',
  minVariety: 5,
  unitId: 'unitCuboid',
  difficulty: 1,
  title: '직육면체의 구성 요소 개수',
  note: '면 6, 모서리 12, 꼭짓점 8 / 정육면체·직육면체 표현 랜덤',
  generate(seed) {
    const rng = new RNG(seed);

    const shapes = ['직육면체', '정육면체'] as const;
    const shapeName = rng.pick(shapes);

    const parts = [
      { name: '면', count: 6, unit: '개' },
      { name: '모서리', count: 12, unit: '개' },
      { name: '꼭짓점', count: 8, unit: '개' },
    ] as const;
    const part = rng.pick(parts);

    const expr: MathExpr = [
      txt(`${shapeName}의 ${part.name}의 수: `),
      blank(0),
      txt(` ${part.unit}`),
    ];

    const explanation: MathExpr = [
      txt(
        `${shapeName}의 ${part.name}은 모두 ${part.count}${part.unit}이에요. ` +
        `직육면체(정육면체 포함)는 면이 6개, 모서리가 12개, 꼭짓점이 8개예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${shapeName}의 ${part.name}은 모두 몇 ${part.unit}인가요?`,
      expr,
      blankAnswers: [part.count],
      explanation,
      figure: { kind: 'cuboid', w: 4, h: 3, d: 3 },
    };
  },
};

// ── 2. 면의 관계 ─────────────────────────────────────────────

const cubFacePair: SkillDef = {
  id: 'cub-face-pair',
  minVariety: 3,
  unitId: 'unitCuboid',
  difficulty: 2,
  title: '직육면체 면의 관계',
  note: '평행한 면 3쌍, 한 면과 수직인 면 4개, 한 모서리에서 만나는 면 2개',
  generate(seed) {
    const rng = new RNG(seed);

    const questions = [
      {
        prompt: '직육면체에서 서로 평행한 면은 모두 몇 쌍인가요?',
        answer: 3,
        exprLabel: '평행한 면의 쌍 수:',
        expl:
          '직육면체에는 마주 보는 면이 3쌍 있어요. 위·아래, 앞·뒤, 왼쪽·오른쪽 면이 각각 평행해요. 따라서 평행한 면은 3쌍이에요.',
      },
      {
        prompt: '직육면체에서 한 면과 수직인 면은 몇 개인가요?',
        answer: 4,
        exprLabel: '한 면과 수직인 면의 수:',
        expl:
          '직육면체에서 한 면을 정했을 때, 그 면과 수직인 면은 4개예요. 마주 보는(평행한) 면 1개를 제외하면 나머지 4면이 모두 수직이에요.',
      },
      {
        prompt: '직육면체에서 한 모서리에서 만나는 면은 몇 개인가요?',
        answer: 2,
        exprLabel: '한 모서리에서 만나는 면의 수:',
        expl:
          '직육면체에서 하나의 모서리는 두 면이 만나는 선이에요. 따라서 한 모서리에서 만나는 면은 2개예요.',
      },
    ] as const;

    const q = rng.pick(questions);

    const expr: MathExpr = [
      txt(`${q.exprLabel} `),
      blank(0),
    ];

    const explanation: MathExpr = [txt(q.expl)];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: q.prompt,
      expr,
      blankAnswers: [q.answer],
      explanation,
      figure: { kind: 'cuboid', w: 4, h: 3, d: 3 },
    };
  },
};

// ── 3. 모서리 길이 합 ────────────────────────────────────────

const cubEdgeSum: SkillDef = {
  id: 'cub-edge-sum',
  unitId: 'unitCuboid',
  difficulty: 2,
  title: '직육면체 모서리 길이의 합',
  note: '가로·세로·높이 2~15 서로 다르게, 합 = 4×(a+b+c)',
  generate(seed) {
    const rng = new RNG(seed);

    // 서로 다른 세 값 뽑기
    const pool = Array.from({ length: 14 }, (_, i) => i + 2); // 2~15
    const [a, b, c] = rng.sample(pool, 3);
    const total = 4 * (a + b + c);

    const expr: MathExpr = [
      txt(`(${a} + ${b} + ${c}) × 4 = `),
      blank(0),
      txt(' cm'),
    ];

    const explanation: MathExpr = [
      txt(
        `직육면체에는 길이가 같은 모서리가 4개씩 3종류 있어요. ` +
        `(가로 + 세로 + 높이) × 4 = (${a} + ${b} + ${c}) × 4 = ${a + b + c} × 4 = ${total} cm예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체의 모든 모서리 길이의 합은 몇 cm인가요?`,
      expr,
      blankAnswers: [total],
      explanation,
      figure: { kind: 'cuboid', w: a, h: c, d: b, dims: { w: `${a}`, h: `${c}`, d: `${b}` } },
    };
  },
};

// ── 4. 정육면체 역산 ─────────────────────────────────────────

const cubCubeEdge: SkillDef = {
  id: 'cub-cube-edge',
  minVariety: 12,
  unitId: 'unitCuboid',
  difficulty: 2,
  title: '정육면체 한 모서리 구하기',
  note: '모서리 합 S = 12e, e는 2~15, S÷12 = e',
  generate(seed) {
    const rng = new RNG(seed);

    const e = rng.int(2, 15);
    const S = 12 * e;

    const expr: MathExpr = [
      txt(`${S} ÷ 12 = `),
      blank(0),
      txt(' cm'),
    ];

    const explanation: MathExpr = [
      txt(
        `정육면체의 모서리는 모두 12개이고 길이가 모두 같아요. ` +
        `한 모서리의 길이 = 모든 모서리 길이의 합 ÷ 12 = ${S} ÷ 12 = ${e} cm예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `모든 모서리 길이의 합이 ${S} cm인 정육면체의 한 모서리는 몇 cm인가요?`,
      expr,
      blankAnswers: [e],
      explanation,
    };
  },
};

// ── 5. 직육면체 역산 (높이 구하기) ──────────────────────────

const cubEdgeMissing: SkillDef = {
  id: 'cub-edge-missing',
  unitId: 'unitCuboid',
  difficulty: 3,
  title: '직육면체 높이 구하기',
  note: '모서리 합 S, 가로 a, 세로 b 주어지면 높이 = S÷4 - a - b, 높이 ≥ 2 보장',
  generate(seed) {
    const rng = new RNG(seed);

    // 서로 다른 세 값(가로, 세로, 높이)을 뽑아 S를 계산, 높이 ≥ 2 보장
    const pool = Array.from({ length: 14 }, (_, i) => i + 2); // 2~15
    const [a, b, c] = rng.sample(pool, 3);
    const S = 4 * (a + b + c);
    // c가 구해야 할 높이
    const height = c; // = S÷4 - a - b

    const expr: MathExpr = [
      txt(`${S} ÷ 4 − ${a} − ${b} = `),
      blank(0),
      txt(' cm'),
    ];

    const explanation: MathExpr = [
      txt(
        `직육면체 모서리 합 = (가로 + 세로 + 높이) × 4이므로 ` +
        `가로 + 세로 + 높이 = ${S} ÷ 4 = ${S / 4}예요. ` +
        `높이 = ${S / 4} − ${a} − ${b} = ${height} cm예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `모든 모서리 길이의 합이 ${S} cm이고 가로가 ${a} cm, 세로가 ${b} cm인 직육면체의 높이는 몇 cm인가요?`,
      expr,
      blankAnswers: [height],
      explanation,
      figure: { kind: 'cuboid', w: a, h: c, d: b, dims: { w: `${a}`, h: '?', d: `${b}` } },
    };
  },
};

// ── 6. 문장제 ────────────────────────────────────────────────

type WordKind =
  | 'wire-leftover'      // 철사로 정육면체 틀, 남는 철사
  | 'tape-cuboid'        // 직육면체 모든 모서리에 테이프
  | 'wire-two-cubes'     // 정육면체 틀 2개 필요한 철사
  | 'wire-cuboid'        // 직육면체 철사 틀 만들기
  | 'wire-cube-enough';  // 철사가 충분한지 (필요량 계산)

const WORD_KINDS: WordKind[] = [
  'wire-leftover',
  'tape-cuboid',
  'wire-two-cubes',
  'wire-cuboid',
  'wire-cube-enough',
];

const cubWord: SkillDef = {
  id: 'cub-word',
  unitId: 'unitCuboid',
  difficulty: 3,
  word: true,
  title: '직육면체·정육면체 철사 문장제',
  note: '소재 5종: 남는 철사·테이프·2개 틀·직육면체 틀·충분한지',
  generate(seed) {
    const rng = new RNG(seed);
    const kind = rng.pick(WORD_KINDS);

    switch (kind) {
      case 'wire-leftover': {
        // 철사 S cm로 한 모서리 e cm 정육면체 틀 → 남는 철사 S − 12e ≥ 1
        const e = rng.int(2, 12);
        const needed = 12 * e;
        const leftover = rng.int(1, 20);
        const S = needed + leftover;

        const expr: MathExpr = [
          txt(`${S} − 12 × ${e} = ${S} − ${needed} = `),
          blank(0),
          txt(' cm'),
        ];
        const explanation: MathExpr = [
          txt(
            `정육면체 틀을 만드는 데 필요한 철사 = 12 × ${e} = ${needed} cm예요. ` +
            `남는 철사 = ${S} − ${needed} = ${leftover} cm예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `철사 ${S} cm로 한 모서리가 ${e} cm인 정육면체 모양의 틀을 만들면 남는 철사는 몇 cm인가요?`,
          expr,
          blankAnswers: [leftover],
          explanation,
          figure: { kind: 'cuboid', w: e, h: e, d: e, dims: { w: `${e}`, h: `${e}`, d: `${e}` } },
        };
      }

      case 'tape-cuboid': {
        // 직육면체 모든 모서리에 테이프 = 4×(a+b+c)
        const pool = Array.from({ length: 14 }, (_, i) => i + 2);
        const [a, b, c] = rng.sample(pool, 3);
        const total = 4 * (a + b + c);

        const materials = ['색 테이프', '리본', '끈'] as const;
        const mat = rng.pick(materials);

        const boxes = ['상자', '선물 상자', '나무 상자'] as const;
        const box = rng.pick(boxes);

        const expr: MathExpr = [
          txt(`(${a} + ${b} + ${c}) × 4 = `),
          blank(0),
          txt(' cm'),
        ];
        const explanation: MathExpr = [
          txt(
            `직육면체에는 길이가 같은 모서리가 4개씩 3종류 있어요. ` +
            `필요한 ${mat} = (가로 + 세로 + 높이) × 4 = (${a} + ${b} + ${c}) × 4 = ${total} cm예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체 모양 ${box}의 모든 모서리에 ${mat}를 붙이려고 해요. 필요한 ${mat}는 몇 cm인가요?`,
          expr,
          blankAnswers: [total],
          explanation,
          figure: { kind: 'cuboid', w: a, h: c, d: b, dims: { w: `${a}`, h: `${c}`, d: `${b}` } },
        };
      }

      case 'wire-two-cubes': {
        // 정육면체 틀 2개 = 2 × 12 × e = 24e
        const e = rng.int(2, 12);
        const total = 24 * e;

        const expr: MathExpr = [
          txt(`12 × ${e} × 2 = `),
          blank(0),
          txt(' cm'),
        ];
        const explanation: MathExpr = [
          txt(
            `정육면체 틀 1개에 필요한 철사 = 12 × ${e} = ${12 * e} cm예요. ` +
            `2개를 만드는 데 필요한 철사 = ${12 * e} × 2 = ${total} cm예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `한 모서리가 ${e} cm인 정육면체 모양의 틀 2개를 만드는 데 필요한 철사는 몇 cm인가요?`,
          expr,
          blankAnswers: [total],
          explanation,
          figure: { kind: 'cuboid', w: e, h: e, d: e, dims: { w: `${e}`, h: `${e}`, d: `${e}` } },
        };
      }

      case 'wire-cuboid': {
        // 직육면체 철사 틀 = 4×(a+b+c)
        const pool = Array.from({ length: 14 }, (_, i) => i + 2);
        const [a, b, c] = rng.sample(pool, 3);
        const total = 4 * (a + b + c);

        const expr: MathExpr = [
          txt(`(${a} + ${b} + ${c}) × 4 = `),
          blank(0),
          txt(' cm'),
        ];
        const explanation: MathExpr = [
          txt(
            `직육면체에는 길이가 같은 모서리가 4개씩 3종류 있어요. ` +
            `필요한 철사 = (가로 + 세로 + 높이) × 4 = (${a} + ${b} + ${c}) × 4 = ${total} cm예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체 모양의 틀을 철사로 만들려고 해요. 필요한 철사는 모두 몇 cm인가요?`,
          expr,
          blankAnswers: [total],
          explanation,
          figure: { kind: 'cuboid', w: a, h: c, d: b, dims: { w: `${a}`, h: `${c}`, d: `${b}` } },
        };
      }

      case 'wire-cube-enough': {
        // 정육면체 틀 필요량 = 12e, 질문: "필요한 철사는?"
        const e = rng.int(2, 15);
        const needed = 12 * e;

        const objects = ['정육면체 모양 화분', '정육면체 모양 조명 틀', '정육면체 모양 액자 틀'] as const;
        const obj = rng.pick(objects);

        const expr: MathExpr = [
          txt(`12 × ${e} = `),
          blank(0),
          txt(' cm'),
        ];
        const explanation: MathExpr = [
          txt(
            `정육면체의 모서리는 모두 12개이고 길이가 모두 같아요. ` +
            `필요한 철사 = 12 × ${e} = ${needed} cm예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `한 모서리가 ${e} cm인 ${obj}을 철사로 만들려고 해요. 필요한 철사는 몇 cm인가요?`,
          expr,
          blankAnswers: [needed],
          explanation,
          figure: { kind: 'cuboid', w: e, h: e, d: e, dims: { w: `${e}`, h: `${e}`, d: `${e}` } },
        };
      }
    }
  },
};

// ── export ──────────────────────────────────────────────────

export const unitCuboidSkills: SkillDef[] = [
  cubCount,
  cubFacePair,
  cubEdgeSum,
  cubCubeEdge,
  cubEdgeMissing,
  cubWord,
];
