/**
 * 단원: 직육면체의 부피와 겉넓이 (2022 개정 6-1 6단원)
 * 성취기준: 직육면체·정육면체의 부피(가로×세로×높이, e³)와 겉넓이((ab+bc+ca)×2)를 구하고,
 * 역산으로 모르는 변을 구하며, m³와 cm³ 단위 관계를 이해한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { MathExpr, SkillDef } from '../types';

// ── 공통 헬퍼 ──────────────────────────────────────────────

const txt = (text: string) => ({ kind: 'text' as const, text });
const blank = (slot: number) => ({ kind: 'blank' as const, slot });

// ── 1. 직육면체 부피 ─────────────────────────────────────────

const volRect: SkillDef = {
  id: 'vol-rect',
  unitId: 'unitVolume',
  difficulty: 1,
  title: '직육면체 부피 구하기',
  note: '가로×세로×높이, 변 2~12, 부피 ≤ 1000',
  generate(seed) {
    const rng = new RNG(seed);

    // 부피 ≤ 1000이 될 때까지 재시도
    let a: number, b: number, c: number;
    do {
      a = rng.int(2, 12);
      b = rng.int(2, 12);
      c = rng.int(2, 12);
    } while (a * b * c > 1000);
    const vol = a * b * c;

    const expr: MathExpr = [
      txt(`${a} × ${b} × ${c} = `),
      blank(0),
      txt(' cm³'),
    ];

    const explanation: MathExpr = [
      txt(
        `직육면체의 부피 = 가로 × 세로 × 높이 = ${a} × ${b} × ${c} = ${vol} cm³예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체의 부피는 몇 cm³인가요?`,
      expr,
      blankAnswers: [vol],
      explanation,
    };
  },
};

// ── 2. 정육면체 부피 ─────────────────────────────────────────

const volCube: SkillDef = {
  id: 'vol-cube',
  minVariety: 8,
  unitId: 'unitVolume',
  difficulty: 1,
  title: '정육면체 부피 구하기',
  note: '한 모서리 e, e³, e 2~10',
  generate(seed) {
    const rng = new RNG(seed);

    const e = rng.int(2, 10);
    const vol = e * e * e;

    const expr: MathExpr = [
      txt(`${e} × ${e} × ${e} = `),
      blank(0),
      txt(' cm³'),
    ];

    const explanation: MathExpr = [
      txt(
        `정육면체의 부피 = 한 모서리 × 한 모서리 × 한 모서리 = ${e} × ${e} × ${e} = ${vol} cm³예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 모서리가 ${e} cm인 정육면체의 부피는 몇 cm³인가요?`,
      expr,
      blankAnswers: [vol],
      explanation,
    };
  },
};

// ── 3. 부피 역산: 높이 구하기 ────────────────────────────────

const volMissing: SkillDef = {
  id: 'vol-missing',
  unitId: 'unitVolume',
  difficulty: 2,
  title: '직육면체 높이 역산하기',
  note: '부피 V = a×b×c, a·b 주어지면 c = V÷(a×b), 나누어떨어지게 구성',
  generate(seed) {
    const rng = new RNG(seed);

    // a, b, c 를 먼저 뽑고 V = a×b×c 계산 → 나누어떨어짐 보장
    let a: number, b: number, c: number;
    do {
      a = rng.int(2, 10);
      b = rng.int(2, 10);
      c = rng.int(2, 10);
    } while (a * b * c > 1000);
    const vol = a * b * c;
    const ab = a * b;

    const expr: MathExpr = [
      txt(`${vol} ÷ (${a} × ${b}) = ${vol} ÷ ${ab} = `),
      blank(0),
      txt(' cm'),
    ];

    const explanation: MathExpr = [
      txt(
        `직육면체의 부피 = 가로 × 세로 × 높이이므로 ` +
        `높이 = 부피 ÷ (가로 × 세로) = ${vol} ÷ (${a} × ${b}) = ${vol} ÷ ${ab} = ${c} cm예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `부피가 ${vol} cm³이고 가로가 ${a} cm, 세로가 ${b} cm인 직육면체의 높이는 몇 cm인가요?`,
      expr,
      blankAnswers: [c],
      explanation,
    };
  },
};

// ── 4. 직육면체 겉넓이 ──────────────────────────────────────

const surfRect: SkillDef = {
  id: 'surf-rect',
  unitId: 'unitVolume',
  difficulty: 2,
  title: '직육면체 겉넓이 구하기',
  note: '겉넓이 = (ab+bc+ca)×2, 변 2~10',
  generate(seed) {
    const rng = new RNG(seed);

    const pool = Array.from({ length: 9 }, (_, i) => i + 2); // 2~10
    const [a, b, c] = rng.sample(pool, 3);
    const surf = (a * b + b * c + c * a) * 2;

    const expr: MathExpr = [
      txt(`(${a}×${b} + ${b}×${c} + ${c}×${a}) × 2 = (${a * b} + ${b * c} + ${c * a}) × 2 = `),
      blank(0),
      txt(' cm²'),
    ];

    const explanation: MathExpr = [
      txt(
        `직육면체의 겉넓이 = (가로×세로 + 세로×높이 + 높이×가로) × 2 ` +
        `= (${a}×${b} + ${b}×${c} + ${c}×${a}) × 2 ` +
        `= (${a * b} + ${b * c} + ${c * a}) × 2 = ${surf} cm²예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체의 겉넓이는 몇 cm²인가요?`,
      expr,
      blankAnswers: [surf],
      explanation,
    };
  },
};

// ── 5. 정육면체 겉넓이 ──────────────────────────────────────

const surfCube: SkillDef = {
  id: 'surf-cube',
  minVariety: 10,
  unitId: 'unitVolume',
  difficulty: 2,
  title: '정육면체 겉넓이 구하기',
  note: '겉넓이 = e²×6, e 2~12',
  generate(seed) {
    const rng = new RNG(seed);

    const e = rng.int(2, 12);
    const surf = e * e * 6;

    const expr: MathExpr = [
      txt(`${e} × ${e} × 6 = ${e * e} × 6 = `),
      blank(0),
      txt(' cm²'),
    ];

    const explanation: MathExpr = [
      txt(
        `정육면체는 크기가 같은 정사각형 면이 6개예요. ` +
        `겉넓이 = 한 면의 넓이 × 6 = ${e} × ${e} × 6 = ${e * e} × 6 = ${surf} cm²예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 모서리가 ${e} cm인 정육면체의 겉넓이는 몇 cm²인가요?`,
      expr,
      blankAnswers: [surf],
      explanation,
    };
  },
};

// ── 6. 단위 관계 (m³ ↔ cm³) ─────────────────────────────────

type UnitKind =
  | 'basic'        // 1 m³ = ? cm³
  | 'm-to-cm'      // k m³ = ? cm³  (k 2~5)
  | 'cm-to-m';     // k×1000000 cm³ = ? m³  (k 2~5)

const UNIT_KINDS: UnitKind[] = ['basic', 'm-to-cm', 'cm-to-m'];

const volUnit: SkillDef = {
  id: 'vol-unit',
  unitId: 'unitVolume',
  minVariety: 15,
  difficulty: 2,
  title: '부피 단위 관계 (m³ ↔ cm³)',
  note: '1 m³=1000000 cm³, k m³=k×1000000 cm³, 역방향도 choice',
  generate(seed) {
    const rng = new RNG(seed);
    const kind = rng.pick(UNIT_KINDS);

    switch (kind) {
      case 'basic': {
        // 1 m³ = ? cm³
        const answer = { kind: 'decimal' as const, v: 1000000 };
        const candidates = [
          { kind: 'decimal' as const, v: 10000 },
          { kind: 'decimal' as const, v: 1000 },
          { kind: 'decimal' as const, v: 100000 },
          { kind: 'decimal' as const, v: 10000000 },
          { kind: 'decimal' as const, v: 100 },
          { kind: 'decimal' as const, v: 500000 },
        ];
        const { choices, answerIndex } = buildChoices(answer, candidates, rng);

        const explanation: MathExpr = [
          txt('1 m³ = 100 cm × 100 cm × 100 cm = 1000000 cm³이에요.'),
        ];

        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'choice',
          prompt: '1 m³는 몇 cm³인가요?',
          choices,
          answerIndex,
          explanation,
        };
      }

      case 'm-to-cm': {
        // k m³ = k×1000000 cm³
        const k = rng.int(2, 9);
        const vol = k * 1000000;
        const answer = { kind: 'decimal' as const, v: vol };
        const offsets = [-2000000, -1000000, 1000000, 2000000, 500000, 3000000].map(d => vol + d).filter(v => v > 0);
        const candidates = offsets.map(v => ({ kind: 'decimal' as const, v }));

        const { choices, answerIndex } = buildChoices(answer, candidates, rng);

        const explanation: MathExpr = [
          txt(`1 m³ = 1000000 cm³이므로 ${k} m³ = ${k} × 1000000 = ${vol} cm³예요.`),
        ];

        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'choice',
          prompt: `${k} m³는 몇 cm³인가요?`,
          choices,
          answerIndex,
          explanation,
        };
      }

      case 'cm-to-m': {
        // k×1000000 cm³ = k m³
        const k = rng.int(2, 9);
        const volCm = k * 1000000;
        const answer = { kind: 'decimal' as const, v: k };
        const distractors = [k - 1, k + 1, k + 2, k * 10, k * 100, k + 3]
          .filter(v => v > 0 && v !== k)
          .map(v => ({ kind: 'decimal' as const, v }));

        const { choices, answerIndex } = buildChoices(answer, distractors, rng);

        const explanation: MathExpr = [
          txt(`1000000 cm³ = 1 m³이므로 ${volCm} cm³ = ${volCm} ÷ 1000000 = ${k} m³예요.`),
        ];

        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'choice',
          prompt: `${volCm} cm³는 몇 m³인가요?`,
          choices,
          answerIndex,
          explanation,
        };
      }

      default: {
        const _exhaustive: never = kind;
        throw new Error(`알 수 없는 단위 문제 종류: ${_exhaustive}`);
      }
    }
  },
};

// ── 7. 문장제 ────────────────────────────────────────────────

type WordKind =
  | 'tank-vol'        // 수조 부피
  | 'dice-surf'       // 주사위 겉넓이
  | 'vol-diff'        // 두 직육면체 부피 차이
  | 'box-surf'        // 선물 상자 겉넓이 (포장지)
  | 'cube-vol-word';  // 정육면체 모양 얼음 부피

const WORD_KINDS: WordKind[] = [
  'tank-vol',
  'dice-surf',
  'vol-diff',
  'box-surf',
  'cube-vol-word',
];

const volWord: SkillDef = {
  id: 'vol-word',
  unitId: 'unitVolume',
  difficulty: 3,
  word: true,
  title: '부피와 겉넓이 문장제',
  note: '소재 5종: 수조 부피·주사위 겉넓이·두 직육면체 차이·포장지·얼음 부피',
  generate(seed) {
    const rng = new RNG(seed);
    const kind = rng.pick(WORD_KINDS);

    switch (kind) {
      case 'tank-vol': {
        // 직육면체 수조 부피
        let a: number, b: number, c: number;
        do {
          a = rng.int(2, 12);
          b = rng.int(2, 12);
          c = rng.int(2, 12);
        } while (a * b * c > 1000);
        const vol = a * b * c;

        const expr: MathExpr = [
          txt(`${a} × ${b} × ${c} = `),
          blank(0),
          txt(' cm³'),
        ];
        const explanation: MathExpr = [
          txt(
            `직육면체의 부피 = 가로 × 세로 × 높이 = ${a} × ${b} × ${c} = ${vol} cm³예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 상자 모양 수조의 부피는 몇 cm³인가요?`,
          expr,
          blankAnswers: [vol],
          explanation,
        };
      }

      case 'dice-surf': {
        // 정육면체 주사위 겉넓이
        const e = rng.int(2, 10);
        const surf = e * e * 6;

        const expr: MathExpr = [
          txt(`${e} × ${e} × 6 = ${e * e} × 6 = `),
          blank(0),
          txt(' cm²'),
        ];
        const explanation: MathExpr = [
          txt(
            `정육면체는 크기가 같은 정사각형 면이 6개예요. ` +
            `겉넓이 = 한 면의 넓이 × 6 = ${e} × ${e} × 6 = ${surf} cm²예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `한 모서리가 ${e} cm인 정육면체 모양 주사위의 겉넓이는 몇 cm²인가요?`,
          expr,
          blankAnswers: [surf],
          explanation,
        };
      }

      case 'vol-diff': {
        // 두 직육면체 부피 차이
        let a1: number, b1: number, c1: number, a2: number, b2: number, c2: number;
        do {
          a1 = rng.int(2, 10);
          b1 = rng.int(2, 10);
          c1 = rng.int(2, 10);
          a2 = rng.int(2, 10);
          b2 = rng.int(2, 10);
          c2 = rng.int(2, 10);
        } while (a1 * b1 * c1 > 1000 || a2 * b2 * c2 > 1000 || a1 * b1 * c1 === a2 * b2 * c2);
        const vol1 = a1 * b1 * c1;
        const vol2 = a2 * b2 * c2;
        const bigger = vol1 >= vol2 ? { vol: vol1, a: a1, b: b1, c: c1 } : { vol: vol2, a: a2, b: b2, c: c2 };
        const smaller = vol1 >= vol2 ? { vol: vol2, a: a2, b: b2, c: c2 } : { vol: vol1, a: a1, b: b1, c: c1 };
        const diff = bigger.vol - smaller.vol;

        const expr: MathExpr = [
          txt(`${bigger.vol} − ${smaller.vol} = `),
          blank(0),
          txt(' cm³'),
        ];
        const explanation: MathExpr = [
          txt(
            `가 상자의 부피 = ${bigger.a} × ${bigger.b} × ${bigger.c} = ${bigger.vol} cm³, ` +
            `나 상자의 부피 = ${smaller.a} × ${smaller.b} × ${smaller.c} = ${smaller.vol} cm³이에요. ` +
            `두 상자의 부피 차이 = ${bigger.vol} − ${smaller.vol} = ${diff} cm³예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt:
            `가로 ${bigger.a} cm, 세로 ${bigger.b} cm, 높이 ${bigger.c} cm인 가 상자와 ` +
            `가로 ${smaller.a} cm, 세로 ${smaller.b} cm, 높이 ${smaller.c} cm인 나 상자가 있어요. ` +
            `두 상자의 부피의 차는 몇 cm³인가요?`,
          expr,
          blankAnswers: [diff],
          explanation,
        };
      }

      case 'box-surf': {
        // 선물 상자 포장지 (겉넓이)
        const pool = Array.from({ length: 9 }, (_, i) => i + 2);
        const [a, b, c] = rng.sample(pool, 3);
        const surf = (a * b + b * c + c * a) * 2;

        const wraps = ['포장지', '색종이', '한지'] as const;
        const wrap = rng.pick(wraps);

        const expr: MathExpr = [
          txt(`(${a}×${b} + ${b}×${c} + ${c}×${a}) × 2 = (${a * b} + ${b * c} + ${c * a}) × 2 = `),
          blank(0),
          txt(' cm²'),
        ];
        const explanation: MathExpr = [
          txt(
            `직육면체의 겉넓이 = (가로×세로 + 세로×높이 + 높이×가로) × 2 ` +
            `= (${a}×${b} + ${b}×${c} + ${c}×${a}) × 2 ` +
            `= (${a * b} + ${b * c} + ${c * a}) × 2 = ${surf} cm²예요. ` +
            `필요한 ${wrap}의 넓이는 최소 ${surf} cm²예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt:
            `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체 모양 선물 상자를 ` +
            `${wrap}로 빈틈없이 싸려고 해요. 필요한 ${wrap}의 넓이는 몇 cm²인가요?`,
          expr,
          blankAnswers: [surf],
          explanation,
        };
      }

      case 'cube-vol-word': {
        // 정육면체 얼음 부피
        const e = rng.int(2, 9);
        const vol = e * e * e;

        const objects = ['얼음', '두부', '지우개', '나무 블록'] as const;
        const obj = rng.pick(objects);

        const expr: MathExpr = [
          txt(`${e} × ${e} × ${e} = `),
          blank(0),
          txt(' cm³'),
        ];
        const explanation: MathExpr = [
          txt(
            `정육면체의 부피 = 한 모서리 × 한 모서리 × 한 모서리 = ${e} × ${e} × ${e} = ${vol} cm³예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `한 모서리가 ${e} cm인 정육면체 모양 ${obj}의 부피는 몇 cm³인가요?`,
          expr,
          blankAnswers: [vol],
          explanation,
        };
      }

      default: {
        const _exhaustive: never = kind;
        throw new Error(`알 수 없는 문장제 종류: ${_exhaustive}`);
      }
    }
  },
};

// ── export ──────────────────────────────────────────────────

export const unitVolumeSkills: SkillDef[] = [
  volRect,
  volCube,
  volMissing,
  surfRect,
  surfCube,
  volUnit,
  volWord,
];
