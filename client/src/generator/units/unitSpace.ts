/**
 * 단원: 공간과 입체 (2022 개정 6-2 3단원: 쌓기나무)
 * 성취기준: 쌓기나무로 만든 입체 도형의 개수를 층별 설명으로 구하고,
 * 정육면체·직육면체를 만드는 데 필요한 쌓기나무 수를 계산한다.
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

// ── 공통 헬퍼 ──────────────────────────────────────────────

const txt = (text: string) => ({ kind: 'text' as const, text });
const blank = (slot: number) => ({ kind: 'blank' as const, slot });

// ── 1. 층별 개수 합 ──────────────────────────────────────────

const spaceLayers: SkillDef = {
  id: 'space-layers',
  unitId: 'unitSpace',
  difficulty: 1,
  title: '층별 쌓기나무 개수 합',
  note: '2~4층 랜덤, 위층 ≤ 아래층 보장, 합 구하기',
  generate(seed) {
    const rng = new RNG(seed);

    const numFloors = rng.int(2, 4);

    // 아래층부터 위층 순으로 내림차순 보장
    const floors: number[] = [];
    let maxForNext = rng.int(4, 10);
    for (let i = 0; i < numFloors; i++) {
      const val = rng.int(1, maxForNext);
      floors.push(val);
      maxForNext = val;
    }
    // floors[0] = 1층(가장 많음), floors[last] = 최상층(가장 적음)

    const total = floors.reduce((s, v) => s + v, 0);

    // 수식: "1층 a개 + 2층 b개 + ... = □개"
    const exprParts: MathExpr = [];
    floors.forEach((f, i) => {
      if (i > 0) exprParts.push(txt(' + '));
      exprParts.push(txt(`${i + 1}층 ${f}개`));
    });
    exprParts.push(txt(' = '));
    exprParts.push(blank(0));
    exprParts.push(txt('개'));

    // 해설
    const layerDesc = floors.map((f, i) => `${i + 1}층 ${f}개`).join(', ');
    const addStr = floors.join(' + ');
    const explanation: MathExpr = [
      txt(
        `층별로 더하면 돼요. ${layerDesc}이므로 ` +
        `${addStr} = ${total}개예요.`,
      ),
    ];

    // prompt
    const floorDesc = floors
      .map((f, i) => `${i + 1}층에 ${f}개`)
      .join(', ');
    const prompt = `쌓기나무를 ${floorDesc} 쌓았어요. 모두 몇 개인가요?`;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr: exprParts,
      blankAnswers: [total],
      explanation,
    };
  },
};

// ── 2. 정육면체 만들기 ────────────────────────────────────────

const spaceCube: SkillDef = {
  id: 'space-cube',
  unitId: 'unitSpace',
  difficulty: 2,
  minVariety: 4,
  title: '정육면체 모양 쌓기나무 개수',
  note: 'n³ (n: 2~5), 한 모서리에 n개씩인 정육면체',
  generate(seed) {
    const rng = new RNG(seed);

    const n = rng.int(2, 5);
    const total = n * n * n;

    const expr: MathExpr = [
      txt(`${n} × ${n} × ${n} = `),
      blank(0),
      txt('개'),
    ];

    const explanation: MathExpr = [
      txt(
        `한 모서리에 ${n}개씩 놓인 정육면체는 가로 ${n}개, 세로 ${n}개, 높이 ${n}층이에요. ` +
        `필요한 쌓기나무 = ${n} × ${n} × ${n} = ${total}개예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `쌓기나무로 한 모서리에 ${n}개씩 놓인 정육면체 모양을 만들려면 모두 몇 개 필요한가요?`,
      expr,
      blankAnswers: [total],
      explanation,
    };
  },
};

// ── 3. 더 필요한 개수 ────────────────────────────────────────

const spaceNeed: SkillDef = {
  id: 'space-need',
  unitId: 'unitSpace',
  difficulty: 2,
  title: '정육면체 완성에 더 필요한 쌓기나무',
  note: 'n³ − a, n: 2~5, a: 1 이상 n³−1 이하 보장',
  generate(seed) {
    const rng = new RNG(seed);

    const n = rng.int(2, 5);
    const total = n * n * n;
    // a는 1 이상 total-1 이하
    const a = rng.int(1, total - 1);
    const need = total - a;

    const expr: MathExpr = [
      txt(`${total} − ${a} = `),
      blank(0),
      txt('개'),
    ];

    const explanation: MathExpr = [
      txt(
        `한 모서리에 ${n}개씩인 정육면체를 만드는 데는 ${n} × ${n} × ${n} = ${total}개가 필요해요. ` +
        `지금 ${a}개를 쌓았으므로 더 필요한 쌓기나무는 ${total} − ${a} = ${need}개예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 모서리에 ${n}개씩인 정육면체 모양을 만들려고 해요. 지금 ${a}개를 쌓았다면 몇 개가 더 필요한가요?`,
      expr,
      blankAnswers: [need],
      explanation,
    };
  },
};

// ── 4. 직육면체 모양 쌓기나무 개수 ──────────────────────────

const spaceHidden: SkillDef = {
  id: 'space-hidden',
  unitId: 'unitSpace',
  difficulty: 3,
  minVariety: 30,
  title: '직육면체 모양 쌓기나무 개수',
  note: '가로 × 세로 × 높이 (각 2~5), 서로 다른 세 값',
  generate(seed) {
    const rng = new RNG(seed);

    // 서로 다른 세 값 (2~6) — 6P3 = 120가지 이상으로 minVariety:30 충족
    const pool = [2, 3, 4, 5, 6] as const;
    const shuffled = rng.shuffle(pool);
    const [a, b, c] = shuffled;
    const total = a * b * c;

    const expr: MathExpr = [
      txt(`${a} × ${b} × ${c} = `),
      blank(0),
      txt('개'),
    ];

    const explanation: MathExpr = [
      txt(
        `직육면체 모양으로 쌓으면 가로 ${a}개, 세로 ${b}개, 높이 ${c}층이에요. ` +
        `필요한 쌓기나무 = ${a} × ${b} × ${c} = ${total}개예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `쌓기나무를 가로 ${a}개, 세로 ${b}개, 높이 ${c}층으로 쌓으면 쌓기나무는 모두 몇 개인가요?`,
      expr,
      blankAnswers: [total],
      explanation,
    };
  },
};

// ── 5. 2단계 문장제 ───────────────────────────────────────────

type SpaceWordKind =
  | 'three-layers-diff'   // 층별 k개 차이 합산
  | 'box-leftover'        // 상자에서 정육면체 만들고 남는 개수
  | 'two-shapes-total'    // 두 모양 합산
  | 'layers-then-need';   // 층별 합산 후 추가 필요 개수

const SPACE_WORD_KINDS: SpaceWordKind[] = [
  'three-layers-diff',
  'box-leftover',
  'two-shapes-total',
  'layers-then-need',
];

const spaceWord: SkillDef = {
  id: 'space-word',
  unitId: 'unitSpace',
  difficulty: 3,
  word: true,
  title: '쌓기나무 2단계 문장제',
  note: '소재 4종: 층별 차이 합산·상자 남은 개수·두 모양 합산·층별 합산 후 추가',
  generate(seed) {
    const rng = new RNG(seed);
    const kind = rng.pick(SPACE_WORD_KINDS);

    switch (kind) {
      case 'three-layers-diff': {
        // 1층 a개, 2층은 1층보다 k개 적게, 3층은 2층보다 m개 적게 → 합
        // 각 층 ≥ 1 보장
        const floor3 = rng.int(1, 3);        // 3층 최솟값
        const m = rng.int(1, 3);              // 3층→2층 차이
        const floor2 = floor3 + m;            // 2층
        const k = rng.int(1, 3);              // 2층→1층 차이
        const floor1 = floor2 + k;            // 1층
        const total = floor1 + floor2 + floor3;

        const expr: MathExpr = [
          txt(`${floor1} + ${floor2} + ${floor3} = `),
          blank(0),
          txt('개'),
        ];
        const explanation: MathExpr = [
          txt(
            `1층: ${floor1}개, 2층: 1층보다 ${k}개 적으므로 ${floor1} − ${k} = ${floor2}개, ` +
            `3층: 2층보다 ${m}개 적으므로 ${floor2} − ${m} = ${floor3}개예요. ` +
            `모두 ${floor1} + ${floor2} + ${floor3} = ${total}개예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt:
            `쌓기나무를 1층에 ${floor1}개, 2층은 1층보다 ${k}개 적게, ` +
            `3층은 2층보다 ${m}개 적게 쌓았어요. 모두 몇 개인가요?`,
          expr,
          blankAnswers: [total],
          explanation,
        };
      }

      case 'box-leftover': {
        // 상자에 N개, 정육면체(한 모서리 n개) 만들고 남은 개수
        const n = rng.int(2, 4);
        const cubeTotal = n * n * n;
        const leftover = rng.int(1, 15);
        const boxTotal = cubeTotal + leftover;

        const expr: MathExpr = [
          txt(`${boxTotal} − ${n} × ${n} × ${n} = ${boxTotal} − ${cubeTotal} = `),
          blank(0),
          txt('개'),
        ];
        const explanation: MathExpr = [
          txt(
            `한 모서리에 ${n}개씩인 정육면체를 만드는 데 ${n} × ${n} × ${n} = ${cubeTotal}개가 필요해요. ` +
            `남은 쌓기나무 = ${boxTotal} − ${cubeTotal} = ${leftover}개예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt:
            `상자에 쌓기나무가 ${boxTotal}개 있었어요. ` +
            `한 모서리에 ${n}개씩 놓인 정육면체 모양을 만들고 나니 몇 개가 남았나요?`,
          expr,
          blankAnswers: [leftover],
          explanation,
        };
      }

      case 'two-shapes-total': {
        // 가로 a₁ × 세로 b₁ × 높이 c₁ 직육면체 + 가로 a₂ × 세로 b₂ × 높이 c₂ 직육면체 합
        const a1 = rng.int(2, 4);
        const b1 = rng.int(2, 4);
        const c1 = rng.int(1, 3);
        const a2 = rng.int(2, 4);
        const b2 = rng.int(2, 4);
        const c2 = rng.int(1, 3);
        const shape1 = a1 * b1 * c1;
        const shape2 = a2 * b2 * c2;
        const total = shape1 + shape2;

        const names = ['민준', '서연', '지호', '하은', '도윤', '수아'] as const;
        const [name1, name2] = rng.sample(names, 2);

        const expr: MathExpr = [
          txt(`${shape1} + ${shape2} = `),
          blank(0),
          txt('개'),
        ];
        const explanation: MathExpr = [
          txt(
            `${name1}이가 쌓은 직육면체: ${a1} × ${b1} × ${c1} = ${shape1}개, ` +
            `${name2}이가 쌓은 직육면체: ${a2} × ${b2} × ${c2} = ${shape2}개예요. ` +
            `두 사람이 쌓은 쌓기나무의 합 = ${shape1} + ${shape2} = ${total}개예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt:
            `${name1}이는 가로 ${a1}개, 세로 ${b1}개, 높이 ${c1}층으로 쌓기나무를 쌓았고, ` +
            `${name2}이는 가로 ${a2}개, 세로 ${b2}개, 높이 ${c2}층으로 쌓았어요. ` +
            `두 사람이 사용한 쌓기나무는 모두 몇 개인가요?`,
          expr,
          blankAnswers: [total],
          explanation,
        };
      }

      case 'layers-then-need': {
        // n³ > f1 + f2 가 항상 성립하도록 역순으로 결정
        // n: 3~5 → n³: 27, 64, 125
        const n = rng.int(3, 5);
        const cubeTotal = n * n * n;
        // 쌓은 총합은 2 이상 cubeTotal-1 이하 (f1+f2 각 ≥ 1 보장을 위해 최소 2)
        const stacked = rng.int(2, cubeTotal - 1);
        // 1층 ≥ 2층 ≥ 1 을 만족하는 범위에서 f2 결정
        const f2max = Math.floor(stacked / 2);
        const f2 = rng.int(1, f2max);   // f2max ≥ 1 (stacked ≥ 2이므로)
        const f1 = stacked - f2;        // f1 = stacked - f2 ≥ f2 ≥ 1 보장
        const need = cubeTotal - stacked;

        const expr: MathExpr = [
          txt(`${cubeTotal} − (${f1} + ${f2}) = ${cubeTotal} − ${stacked} = `),
          blank(0),
          txt('개'),
        ];
        const explanation: MathExpr = [
          txt(
            `지금까지 쌓은 쌓기나무: 1층 ${f1}개 + 2층 ${f2}개 = ${stacked}개예요. ` +
            `한 모서리에 ${n}개씩인 정육면체에는 ${n} × ${n} × ${n} = ${cubeTotal}개가 필요해요. ` +
            `더 필요한 쌓기나무 = ${cubeTotal} − ${stacked} = ${need}개예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt:
            `쌓기나무를 1층에 ${f1}개, 2층에 ${f2}개 쌓았어요. ` +
            `한 모서리에 ${n}개씩인 정육면체 모양을 완성하려면 몇 개가 더 필요한가요?`,
          expr,
          blankAnswers: [need],
          explanation,
        };
      }
    }
  },
};

// ── export ──────────────────────────────────────────────────

export const unitSpaceSkills: SkillDef[] = [
  spaceLayers,
  spaceCube,
  spaceNeed,
  spaceHidden,
  spaceWord,
];
