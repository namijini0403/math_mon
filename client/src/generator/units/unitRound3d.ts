/**
 * 단원: 원기둥, 원뿔, 구 (2022 개정 6-2 6단원)
 * 성취기준: 원기둥·원뿔·구의 구성 요소를 알고, 회전체의 원리를 이해하며,
 * 치수(반지름·지름·높이·모선)와 관련된 계산을 할 수 있다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

// ── 공통 헬퍼 ──────────────────────────────────────────────
const txt = (text: string) => ({ kind: 'text' as const, text });
const blank = (slot: number) => ({ kind: 'blank' as const, slot });
const tChoice = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. round3d-parts : 구성 요소 fill-blanks ────────────────

const round3dParts: SkillDef = {
  id: 'round3d-parts',
  unitId: 'unitRound3d',
  difficulty: 1,
  minVariety: 6,
  title: '원기둥·원뿔·구의 구성 요소',
  note: '밑면 수, 꼭짓점 수, 옆면 수, 중심 수 등 8가지 질문 풀',
  generate(seed) {
    const rng = new RNG(seed);

    const questions = [
      {
        prompt: '원기둥의 밑면은 모두 몇 개인가요?',
        exprLabel: '원기둥의 밑면 수:',
        answer: 2,
        expl: '원기둥의 밑면은 위와 아래에 하나씩, 모두 2개예요.',
      },
      {
        prompt: '원뿔의 꼭짓점은 몇 개인가요?',
        exprLabel: '원뿔의 꼭짓점 수:',
        answer: 1,
        expl: '원뿔의 꼭짓점은 뾰족한 맨 위에 1개만 있어요.',
      },
      {
        prompt: '원기둥의 옆면은 몇 개인가요?',
        exprLabel: '원기둥의 옆면 수:',
        answer: 1,
        expl: '원기둥의 옆면은 굽은 곡면으로 이루어진 1개예요.',
      },
      {
        prompt: '구의 중심은 몇 개인가요?',
        exprLabel: '구의 중심 수:',
        answer: 1,
        expl: '구는 한 점(중심)에서 같은 거리에 있는 점들의 집합이에요. 중심은 1개예요.',
      },
      {
        prompt: '원뿔의 밑면은 몇 개인가요?',
        exprLabel: '원뿔의 밑면 수:',
        answer: 1,
        expl: '원뿔의 밑면은 아래쪽에 있는 원 1개예요.',
      },
      {
        prompt: '원기둥에서 두 밑면은 서로 몇 쌍인가요?',
        exprLabel: '원기둥 밑면의 쌍 수:',
        answer: 1,
        expl: '원기둥의 두 밑면은 서로 평행한 1쌍이에요.',
      },
      {
        prompt: '원뿔의 옆면은 몇 개인가요?',
        exprLabel: '원뿔의 옆면 수:',
        answer: 1,
        expl: '원뿔의 옆면은 꼭짓점에서 밑면 가장자리까지 이어진 굽은 면 1개예요.',
      },
      {
        prompt: '구의 반지름은 구의 중심에서 표면까지의 거리인데, 그 중심은 몇 개인가요?',
        exprLabel: '구의 중심 수:',
        answer: 1,
        expl: '구의 중심은 공 모양의 딱 한 가운데에 1개만 있어요.',
      },
      {
        prompt: '원기둥의 두 밑면의 모양은 원인데, 밑면의 개수는 몇 개인가요?',
        exprLabel: '원기둥의 밑면 수:',
        answer: 2,
        expl: '원기둥에는 위와 아래에 합쳐서 2개의 원 모양 밑면이 있어요.',
      },
      {
        prompt: '원뿔에서 꼭짓점과 밑면의 둘레를 잇는 선(모선)이 만드는 꼭짓점은 몇 개인가요?',
        exprLabel: '원뿔의 꼭짓점 수:',
        answer: 1,
        expl: '원뿔의 모선들은 모두 꼭짓점 1개에서 만나요.',
      },
    ] as const;

    const q = rng.pick(questions);

    const expr: MathExpr = [
      txt(`${q.exprLabel} `),
      blank(0),
      txt(' 개'),
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
    };
  },
};

// ── 2. round3d-pick : 개념 4지선다 ────────────────────────────

const round3dPick: SkillDef = {
  id: 'round3d-pick',
  unitId: 'unitRound3d',
  difficulty: 2,
  minVariety: 5,
  title: '원기둥·원뿔·구 개념 고르기',
  note: '각 도형의 옳은 설명 하나를 고르는 4지선다, 3가지 도형 버전',
  generate(seed) {
    const rng = new RNG(seed);

    type QuestionDef = {
      prompt: string;
      answer: string;
      distractors: string[];
      expl: string;
    };

    const questions: QuestionDef[] = [
      // 원기둥 — 옳은 설명 버전 A
      {
        prompt: '원기둥에 대한 설명으로 옳은 것은 무엇인가요?',
        answer: '두 밑면은 서로 평행한 원이에요.',
        distractors: [
          '꼭짓점이 1개 있어요.',
          '밑면의 모양은 삼각형이에요.',
          '옆면이 평평한 면이에요.',
        ],
        expl: '원기둥의 두 밑면은 서로 평행하고 합동인 원이에요. 꼭짓점은 없고, 옆면은 굽은 곡면이에요.',
      },
      // 원기둥 — 옳은 설명 버전 B
      {
        prompt: '원기둥에 대한 설명으로 옳은 것은 무엇인가요?',
        answer: '옆면은 굽은 면(곡면)이에요.',
        distractors: [
          '꼭짓점이 2개 있어요.',
          '밑면은 삼각형이에요.',
          '두 밑면은 수직이에요.',
        ],
        expl: '원기둥의 옆면은 굽은 곡면이에요. 두 밑면은 평행하며, 꼭짓점은 없어요.',
      },
      // 원기둥 — 회전체 버전
      {
        prompt: '원기둥에 대한 설명으로 옳은 것은 무엇인가요?',
        answer: '직사각형을 한 변을 기준으로 돌리면 만들 수 있어요.',
        distractors: [
          '삼각형을 돌리면 만들 수 있어요.',
          '반원을 돌리면 만들 수 있어요.',
          '원형을 수직으로 잘라 만들 수 있어요.',
        ],
        expl: '직사각형을 한 변을 기준으로 돌리면 원기둥이 생겨요. 삼각형은 원뿔, 반원은 구가 돼요.',
      },
      // 원뿔 — 옳은 설명 버전 A
      {
        prompt: '원뿔에 대한 설명으로 옳은 것은 무엇인가요?',
        answer: '꼭짓점이 1개 있어요.',
        distractors: [
          '밑면이 2개 있어요.',
          '옆면이 평평해요.',
          '모선의 길이가 높이보다 짧아요.',
        ],
        expl: '원뿔은 꼭짓점이 1개 있고, 밑면은 원 1개예요. 모선의 길이는 항상 높이보다 길어요.',
      },
      // 원뿔 — 옳은 설명 버전 B
      {
        prompt: '원뿔에 대한 설명으로 옳은 것은 무엇인가요?',
        answer: '모선의 길이는 높이보다 항상 길어요.',
        distractors: [
          '밑면이 2개예요.',
          '꼭짓점이 없어요.',
          '옆면이 직사각형 모양이에요.',
        ],
        expl: '원뿔에서 모선은 꼭짓점에서 밑면 둘레까지의 선이에요. 직각삼각형으로 보면 모선이 빗변이므로 높이보다 길어요.',
      },
      // 원뿔 — 회전체 버전
      {
        prompt: '원뿔에 대한 설명으로 옳은 것은 무엇인가요?',
        answer: '직각삼각형을 한 변을 기준으로 돌리면 만들 수 있어요.',
        distractors: [
          '직사각형을 돌리면 만들 수 있어요.',
          '반원을 돌리면 만들 수 있어요.',
          '사다리꼴을 돌리면 만들 수 있어요.',
        ],
        expl: '직각삼각형의 한 직각 변을 기준으로 돌리면 원뿔이 생겨요. 직사각형은 원기둥, 반원은 구가 돼요.',
      },
      // 구 — 옳은 설명 버전 A
      {
        prompt: '구에 대한 설명으로 옳은 것은 무엇인가요?',
        answer: '어느 방향으로 잘라도 단면이 원이에요.',
        distractors: [
          '꼭짓점이 1개 있어요.',
          '밑면이 1개 있어요.',
          '옆면이 평평해요.',
        ],
        expl: '구는 완전히 둥근 입체도형으로, 어느 방향으로 잘라도 단면이 항상 원이에요.',
      },
      // 구 — 옳은 설명 버전 B
      {
        prompt: '구에 대한 설명으로 옳은 것은 무엇인가요?',
        answer: '반원을 지름을 기준으로 돌리면 만들 수 있어요.',
        distractors: [
          '직사각형을 돌리면 만들 수 있어요.',
          '직각삼각형을 돌리면 만들 수 있어요.',
          '정사각형을 돌리면 만들 수 있어요.',
        ],
        expl: '반원을 지름을 기준으로 돌리면 구가 생겨요. 직사각형은 원기둥, 직각삼각형은 원뿔이 돼요.',
      },
    ];

    const q = rng.pick(questions);

    const distractorCandidates = rng.shuffle(q.distractors).slice(0, 3);

    const answerChoice = tChoice(q.answer);
    const candidates = distractorCandidates.map(tChoice);

    const { choices, answerIndex } = buildChoices(answerChoice, candidates, rng);

    const explanation: MathExpr = [txt(q.expl)];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: q.prompt,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 3. round3d-rotate : 회전체 연결 choice ────────────────────

const round3dRotate: SkillDef = {
  id: 'round3d-rotate',
  unitId: 'unitRound3d',
  difficulty: 2,
  minVariety: 3,
  title: '평면도형을 돌려서 만드는 입체도형',
  note: '직사각형→원기둥, 직각삼각형→원뿔, 반원→구 세 가지 버전',
  generate(seed) {
    const rng = new RNG(seed);

    type RotateQ = {
      prompt: string;
      answer: string;
      expl: string;
    };

    const questions: RotateQ[] = [
      {
        prompt: '직사각형을 한 변을 기준으로 돌리면 어떤 입체도형이 될까요?',
        answer: '원기둥',
        expl: '직사각형을 한 변을 기준으로 돌리면 원기둥이 돼요. 짧은 변이 반지름, 긴 변이 높이가 돼요.',
      },
      {
        prompt: '직각삼각형을 한 직각 변을 기준으로 돌리면 어떤 입체도형이 될까요?',
        answer: '원뿔',
        expl: '직각삼각형을 한 직각 변을 기준으로 돌리면 원뿔이 돼요. 빗변이 모선이 되고, 다른 직각 변이 높이가 돼요.',
      },
      {
        prompt: '반원을 지름을 기준으로 돌리면 어떤 입체도형이 될까요?',
        answer: '구',
        expl: '반원을 지름을 기준으로 돌리면 구가 돼요. 반원의 반지름이 구의 반지름이 돼요.',
      },
    ];

    const q = rng.pick(questions);

    const allAnswers = ['원기둥', '원뿔', '구'];
    const distractor = ['직육면체'];
    const distractorCandidates = [
      ...allAnswers.filter((a) => a !== q.answer),
      ...distractor,
    ].map(tChoice);

    const answerChoice = tChoice(q.answer);
    const { choices, answerIndex } = buildChoices(answerChoice, distractorCandidates, rng);

    const explanation: MathExpr = [txt(q.expl)];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: q.prompt,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 4. round3d-size : 치수 계산 fill-blanks ──────────────────

const round3dSize: SkillDef = {
  id: 'round3d-size',
  unitId: 'unitRound3d',
  difficulty: 2,
  title: '원기둥·원뿔 치수 계산',
  note: '반지름→지름, 지름→반지름, 지름+높이 합, 3종 fill-blanks',
  generate(seed) {
    const rng = new RNG(seed);

    type SizeKind = 'r-to-d' | 'd-to-r' | 'd-plus-h';
    const kinds: SizeKind[] = ['r-to-d', 'd-to-r', 'd-plus-h'];
    const kind = rng.pick(kinds);

    switch (kind) {
      case 'r-to-d': {
        // 반지름 → 지름 (원기둥)
        const r = rng.int(2, 15);
        const d = 2 * r;

        const expr: MathExpr = [
          txt(`지름 = 2 × ${r} = `),
          blank(0),
          txt(' cm'),
        ];
        const explanation: MathExpr = [
          txt(
            `원기둥의 밑면은 원이에요. 지름 = 반지름 × 2 = ${r} × 2 = ${d} cm예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `반지름이 ${r} cm인 원기둥 밑면의 지름은 몇 cm인가요?`,
          expr,
          blankAnswers: [d],
          explanation,
        };
      }

      case 'd-to-r': {
        // 지름 → 반지름 (원뿔 밑면)
        const r = rng.int(2, 15);
        const d = 2 * r;

        const expr: MathExpr = [
          txt(`반지름 = ${d} ÷ 2 = `),
          blank(0),
          txt(' cm'),
        ];
        const explanation: MathExpr = [
          txt(
            `원뿔의 밑면은 원이에요. 반지름 = 지름 ÷ 2 = ${d} ÷ 2 = ${r} cm예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `밑면의 지름이 ${d} cm인 원뿔의 밑면 반지름은 몇 cm인가요?`,
          expr,
          blankAnswers: [r],
          explanation,
        };
      }

      case 'd-plus-h': {
        // 지름 + 높이 합 (원기둥)
        const r = rng.int(2, 10);
        const d = 2 * r;
        const h = rng.int(3, 20);
        const total = d + h;

        const expr: MathExpr = [
          txt(`${d} + ${h} = `),
          blank(0),
          txt(' cm'),
        ];
        const explanation: MathExpr = [
          txt(
            `원기둥의 밑면 지름은 반지름 × 2 = ${r} × 2 = ${d} cm예요. ` +
            `지름과 높이의 합 = ${d} + ${h} = ${total} cm예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `반지름이 ${r} cm, 높이가 ${h} cm인 원기둥에서 밑면의 지름과 높이의 합은 몇 cm인가요?`,
          expr,
          blankAnswers: [total],
          explanation,
        };
      }
    }
  },
};

// ── 5. round3d-word : 응용 decimal-input ─────────────────────

type WordKind3d =
  | 'cylinder-circumference'   // 원기둥 밑면 둘레
  | 'cylinder-lateral-width'   // 원기둥 옆면 전개 직사각형 가로
  | 'sphere-cross-section'     // 구의 가장 넓은 단면 넓이
  | 'cylinder-lateral-area';   // 원기둥 옆면 넓이 (둘레 × 높이)

const WORD_KINDS_3D: WordKind3d[] = [
  'cylinder-circumference',
  'cylinder-lateral-width',
  'sphere-cross-section',
  'cylinder-lateral-area',
];

const round3dWord: SkillDef = {
  id: 'round3d-word',
  unitId: 'unitRound3d',
  difficulty: 3,
  word: true,
  title: '원기둥·구 응용 문장제',
  note: '밑면 둘레, 옆면 전개 가로, 구 단면 넓이, 옆면 넓이 — 소재 4종 decimal-input',
  generate(seed) {
    const rng = new RNG(seed);
    const kind = rng.pick(WORD_KINDS_3D);

    switch (kind) {
      case 'cylinder-circumference': {
        // 밑면 둘레 = 2 × r × 3.14
        const r = rng.int(2, 10);
        const circumference = Math.round(2 * r * 314) / 100;

        const containers = ['원통 모양 통', '원기둥 모양 화분', '원기둥 모양 두루마리 휴지'] as const;
        const container = rng.pick(containers);

        const explanation: MathExpr = [
          txt(
            `원기둥의 밑면은 원이에요. 원의 둘레 = 지름 × 3.14 = (반지름 × 2) × 3.14 = ` +
            `(${r} × 2) × 3.14 = ${2 * r} × 3.14 = ${circumference} cm예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'decimal-input',
          prompt: `반지름이 ${r} cm인 ${container}의 밑면 둘레는 몇 cm인가요? (원주율: 3.14)`,
          answer: circumference,
          unit: 'cm',
          explanation,
        };
      }

      case 'cylinder-lateral-width': {
        // 옆면을 펼치면 직사각형, 가로 = 밑면 둘레 = 2 × r × 3.14
        const r = rng.int(2, 10);
        const lateralWidth = Math.round(2 * r * 314) / 100;

        const explanation: MathExpr = [
          txt(
            `원기둥의 옆면을 펼치면 직사각형이에요. ` +
            `그 직사각형의 가로는 밑면의 둘레와 같아요. ` +
            `가로 = 반지름 × 2 × 3.14 = ${r} × 2 × 3.14 = ${2 * r} × 3.14 = ${lateralWidth} cm예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'decimal-input',
          prompt: `반지름이 ${r} cm인 원기둥의 옆면을 펼친 직사각형의 가로는 몇 cm인가요? (원주율: 3.14)`,
          answer: lateralWidth,
          unit: 'cm',
          explanation,
        };
      }

      case 'sphere-cross-section': {
        // 구의 가장 넓게 자른 단면 넓이 = r² × 3.14
        const r = rng.int(2, 10);
        const area = Math.round(r * r * 314) / 100;

        const balls = ['공', '구슬', '구 모양 장식품'] as const;
        const ball = rng.pick(balls);

        const explanation: MathExpr = [
          txt(
            `구를 가장 넓게 자른 단면은 반지름이 ${r} cm인 원이에요. ` +
            `원의 넓이 = 반지름 × 반지름 × 3.14 = ${r} × ${r} × 3.14 = ${r * r} × 3.14 = ${area} cm²예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'decimal-input',
          prompt: `반지름이 ${r} cm인 ${ball}을 가장 넓게 자른 단면의 넓이는 몇 cm²인가요? (원주율: 3.14)`,
          answer: area,
          unit: 'cm²',
          explanation,
        };
      }

      case 'cylinder-lateral-area': {
        // 옆면 넓이 = 밑면 둘레 × 높이 = 2 × r × 3.14 × h
        const r = rng.int(2, 8);
        const h = rng.int(3, 15);
        const lateralArea = Math.round(2 * r * 314 * h) / 100;

        const explanation: MathExpr = [
          txt(
            `원기둥의 옆면을 펼치면 직사각형이에요. ` +
            `가로(밑면 둘레) = ${r} × 2 × 3.14 = ${Math.round(2 * r * 314) / 100} cm, ` +
            `세로(높이) = ${h} cm이에요. ` +
            `옆면의 넓이 = 가로 × 세로 = ${Math.round(2 * r * 314) / 100} × ${h} = ${lateralArea} cm²예요.`,
          ),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'decimal-input',
          prompt: `반지름이 ${r} cm, 높이가 ${h} cm인 원기둥의 옆면 넓이는 몇 cm²인가요? (원주율: 3.14)`,
          answer: lateralArea,
          unit: 'cm²',
          explanation,
        };
      }
    }
  },
};

// ── export ──────────────────────────────────────────────────

export const unitRound3dSkills: SkillDef[] = [
  round3dParts,
  round3dPick,
  round3dRotate,
  round3dSize,
  round3dWord,
];
