/**
 * 단원: 다각형의 둘레와 넓이 (2022 개정 5-1 6단원)
 * 성취기준: 정다각형·직사각형의 둘레, 직사각형·평행사변형·삼각형·사다리꼴·마름모의 넓이를 구하고
 * 공식을 이해한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

// ── 공통 헬퍼 ──────────────────────────────────────────────

const txt = (text: string) => ({ kind: 'text' as const, text });
const blank = (slot: number) => ({ kind: 'blank' as const, slot });

// ── 1. 정다각형 둘레 ─────────────────────────────────────────

const polyPeriRegular: SkillDef = {
  id: 'poly-peri-regular',
  unitId: 'unitPoly',
  difficulty: 1,
  title: '정다각형의 둘레',
  note: '정삼각형~정팔각형, 변의 길이 2~20, 둘레 ≤ 400',
  generate(seed) {
    const rng = new RNG(seed);

    // 정N각형 후보: N=3..8
    const shapes: { n: number; name: string }[] = [
      { n: 3, name: '정삼각형' },
      { n: 4, name: '정사각형' },
      { n: 5, name: '정오각형' },
      { n: 6, name: '정육각형' },
      { n: 7, name: '정칠각형' },
      { n: 8, name: '정팔각형' },
    ];
    const shape = rng.pick(shapes);
    // 변 길이: 둘레가 ≤ 400이 되도록 max 제한
    const sideMax = Math.min(20, Math.floor(400 / shape.n));
    const side = rng.int(2, sideMax);
    const peri = shape.n * side;

    const expr: MathExpr = [
      txt(`한 변이 ${side} cm인 ${shape.name}의 둘레:`),
      txt(` ${side} × ${shape.n} = `),
      blank(0),
      txt(' cm'),
    ];

    const explanation: MathExpr = [
      txt(`정다각형의 둘레 = 한 변의 길이 × 변의 수 = ${side} × ${shape.n} = ${peri} cm예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 변이 ${side} cm인 ${shape.name}의 둘레는 몇 cm인가요?`,
      expr,
      blankAnswers: [peri],
      explanation,
    };
  },
};

// ── 2. 직사각형 둘레 ─────────────────────────────────────────

const polyPeriRect: SkillDef = {
  id: 'poly-peri-rect',
  unitId: 'unitPoly',
  difficulty: 1,
  title: '직사각형의 둘레',
  note: '가로·세로 2~20, 둘레 ≤ 400',
  generate(seed) {
    const rng = new RNG(seed);
    const w = rng.int(2, 20);
    let h = rng.int(2, 20);
    if (h === w) h = h < 20 ? h + 1 : h - 1; // 정사각형 피하기(문항 다양성)
    const peri = 2 * (w + h);

    const expr: MathExpr = [
      txt(`가로 ${w} cm, 세로 ${h} cm인 직사각형의 둘레:`),
      txt(` (${w} + ${h}) × 2 = `),
      blank(0),
      txt(' cm'),
    ];

    const explanation: MathExpr = [
      txt(
        `직사각형의 둘레 = (가로 + 세로) × 2 = (${w} + ${h}) × 2 = ${w + h} × 2 = ${peri} cm예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로 ${w} cm, 세로 ${h} cm인 직사각형의 둘레는 몇 cm인가요?`,
      expr,
      blankAnswers: [peri],
      explanation,
    };
  },
};

// ── 3. 직사각형·정사각형 넓이 ────────────────────────────────

const polyAreaRect: SkillDef = {
  id: 'poly-area-rect',
  unitId: 'unitPoly',
  difficulty: 1,
  title: '직사각형·정사각형의 넓이',
  note: '가로·세로 2~20, 넓이 ≤ 400',
  generate(seed) {
    const rng = new RNG(seed);
    const isSquare = rng.chance(0.3);
    let w: number, h: number;
    if (isSquare) {
      w = rng.int(2, 20);
      h = w;
    } else {
      do {
        w = rng.int(2, 20);
        h = rng.int(2, 20);
      } while (w * h > 400 || w === h);
    }
    const area = w * h;
    const shapeName = isSquare ? '정사각형' : '직사각형';
    const desc = isSquare
      ? `한 변이 ${w} cm인 정사각형`
      : `가로 ${w} cm, 세로 ${h} cm인 직사각형`;
    const formula = isSquare
      ? `한 변 × 한 변 = ${w} × ${h}`
      : `가로 × 세로 = ${w} × ${h}`;

    const expr: MathExpr = [
      txt(`${desc}의 넓이:`),
      txt(` ${w} × ${h} = `),
      blank(0),
      txt(' cm²'),
    ];

    const explanation: MathExpr = [
      txt(`${shapeName}의 넓이 = ${formula} = ${area} cm²예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${desc}의 넓이는 몇 cm²인가요?`,
      expr,
      blankAnswers: [area],
      explanation,
    };
  },
};

// ── 4. 역산: 한 변 / 세로 구하기 ────────────────────────────

const polyMissingSide: SkillDef = {
  id: 'poly-missing-side',
  unitId: 'unitPoly',
  difficulty: 2,
  title: '둘레·넓이로 한 변 구하기',
  note: '정다각형 둘레÷N, 직사각형 넓이÷가로 — 나누어떨어지게',
  generate(seed) {
    const rng = new RNG(seed);
    const type = rng.pick(['regular', 'area'] as const);

    if (type === 'regular') {
      // 정N각형: 한 변 구하기
      const shapes = [
        { n: 3, name: '정삼각형' },
        { n: 4, name: '정사각형' },
        { n: 5, name: '정오각형' },
        { n: 6, name: '정육각형' },
        { n: 8, name: '정팔각형' },
      ];
      const shape = rng.pick(shapes);
      const side = rng.int(2, Math.min(20, Math.floor(400 / shape.n)));
      const peri = shape.n * side;

      const expr: MathExpr = [
        txt(`둘레가 ${peri} cm인 ${shape.name}의 한 변:`),
        txt(` ${peri} ÷ ${shape.n} = `),
        blank(0),
        txt(' cm'),
      ];
      const explanation: MathExpr = [
        txt(
          `정다각형의 한 변 = 둘레 ÷ 변의 수 = ${peri} ÷ ${shape.n} = ${side} cm예요.`,
        ),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `둘레가 ${peri} cm인 ${shape.name}의 한 변은 몇 cm인가요?`,
        expr,
        blankAnswers: [side],
        explanation,
      };
    } else {
      // 직사각형: 세로 구하기 (넓이 ÷ 가로)
      const w = rng.int(2, 20);
      const h = rng.int(2, 20);
      const area = w * h;
      // 항상 나누어떨어짐 (w * h)
      const expr: MathExpr = [
        txt(`넓이가 ${area} cm²이고 가로가 ${w} cm인 직사각형의 세로:`),
        txt(` ${area} ÷ ${w} = `),
        blank(0),
        txt(' cm'),
      ];
      const explanation: MathExpr = [
        txt(
          `직사각형의 세로 = 넓이 ÷ 가로 = ${area} ÷ ${w} = ${h} cm예요.`,
        ),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `넓이가 ${area} cm²이고 가로가 ${w} cm인 직사각형의 세로는 몇 cm인가요?`,
        expr,
        blankAnswers: [h],
        explanation,
      };
    }
  },
};

// ── 5. 평행사변형 넓이 ──────────────────────────────────────

const polyAreaPara: SkillDef = {
  id: 'poly-area-para',
  unitId: 'unitPoly',
  difficulty: 2,
  title: '평행사변형의 넓이',
  note: '밑변×높이, 변 2~20, 넓이 ≤ 400',
  generate(seed) {
    const rng = new RNG(seed);
    let base: number, height: number;
    do {
      base = rng.int(2, 20);
      height = rng.int(2, 20);
    } while (base * height > 400);

    const area = base * height;

    const expr: MathExpr = [
      txt(`밑변 ${base} cm, 높이 ${height} cm인 평행사변형의 넓이:`),
      txt(` ${base} × ${height} = `),
      blank(0),
      txt(' cm²'),
    ];
    const explanation: MathExpr = [
      txt(
        `평행사변형의 넓이 = 밑변 × 높이 = ${base} × ${height} = ${area} cm²예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `밑변이 ${base} cm이고 높이가 ${height} cm인 평행사변형의 넓이는 몇 cm²인가요?`,
      expr,
      blankAnswers: [area],
      explanation,
    };
  },
};

// ── 6. 삼각형 넓이 ──────────────────────────────────────────

const polyAreaTri: SkillDef = {
  id: 'poly-area-tri',
  unitId: 'unitPoly',
  difficulty: 2,
  title: '삼각형의 넓이',
  note: '밑변×높이÷2, 밑변×높이가 짝수 보장, 넓이 ≤ 400',
  generate(seed) {
    const rng = new RNG(seed);
    let base: number, height: number;
    do {
      base = rng.int(2, 20);
      height = rng.int(2, 20);
    } while (base * height > 800 || (base * height) % 2 !== 0);

    const area = (base * height) / 2;

    const expr: MathExpr = [
      txt(`밑변 ${base} cm, 높이 ${height} cm인 삼각형의 넓이:`),
      txt(` ${base} × ${height} ÷ 2 = `),
      blank(0),
      txt(' cm²'),
    ];
    const explanation: MathExpr = [
      txt(
        `삼각형의 넓이 = 밑변 × 높이 ÷ 2 = ${base} × ${height} ÷ 2 = ${base * height} ÷ 2 = ${area} cm²예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `밑변이 ${base} cm이고 높이가 ${height} cm인 삼각형의 넓이는 몇 cm²인가요?`,
      expr,
      blankAnswers: [area],
      explanation,
    };
  },
};

// ── 7. 사다리꼴 넓이 (4지선다) ──────────────────────────────

const polyAreaTrap: SkillDef = {
  id: 'poly-area-trap',
  unitId: 'unitPoly',
  difficulty: 3,
  title: '사다리꼴의 넓이',
  note: '(윗변+아랫변)×높이÷2, 짝수 보장, choice 4개, 오개념 distractor',
  generate(seed) {
    const rng = new RNG(seed);
    let top: number, bot: number, height: number;
    do {
      top = rng.int(2, 18);
      bot = rng.int(2, 18);
      height = rng.int(2, 18);
    } while (
      top === bot ||
      (top + bot) * height > 800 ||
      ((top + bot) * height) % 2 !== 0
    );

    const area = ((top + bot) * height) / 2;

    // 오개념 보기
    const noDiv2 = (top + bot) * height;           // ÷2 안 한 값
    const onlyTop = top * height;                  // 윗변만×높이
    const onlyBot = bot * height;                  // 아랫변만×높이
    const offBy = area + rng.pick([-2, 2, -4, 4]); // ±오차
    const wrongDiv = Math.round((top + bot) * height / 3); // 잘못된 나눗셈

    const answer: ChoiceValue = { kind: 'text', text: `${area} cm²` };
    const candidates: ChoiceValue[] = [
      { kind: 'text', text: `${noDiv2} cm²` },
      { kind: 'text', text: `${onlyTop} cm²` },
      { kind: 'text', text: `${onlyBot} cm²` },
      { kind: 'text', text: `${offBy > 0 ? offBy : area + 6} cm²` },
      { kind: 'text', text: `${wrongDiv} cm²` },
    ];

    const { choices, answerIndex } = buildChoices(answer, candidates, rng);

    const explanation: MathExpr = [
      txt(
        `사다리꼴의 넓이 = (윗변 + 아랫변) × 높이 ÷ 2 = (${top} + ${bot}) × ${height} ÷ 2 = ${top + bot} × ${height} ÷ 2 = ${(top + bot) * height} ÷ 2 = ${area} cm²예요.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `윗변이 ${top} cm, 아랫변이 ${bot} cm, 높이가 ${height} cm인 사다리꼴의 넓이는 몇 cm²인가요?`,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 8. 둘레·넓이 문장제 ─────────────────────────────────────

type WordScenario = {
  label: string;
  kind: 'rect-peri' | 'rect-area' | 'para-area' | 'tri-area' | 'trap-area' | 'rhombus-area';
};

const SCENARIOS: WordScenario[] = [
  { label: '텃밭', kind: 'rect-area' },
  { label: '교실 게시판', kind: 'rect-peri' },
  { label: '액자', kind: 'rect-peri' },
  { label: '직사각형 모양의 놀이터', kind: 'rect-area' },
  { label: '평행사변형 모양의 꽃밭', kind: 'para-area' },
  { label: '삼각형 모양의 깃발', kind: 'tri-area' },
  { label: '사다리꼴 모양의 화단', kind: 'trap-area' },
  { label: '마름모 모양의 연', kind: 'rhombus-area' },
  { label: '직사각형 모양의 종이', kind: 'rect-area' },
  { label: '삼각형 모양의 조각 천', kind: 'tri-area' },
];

const polyWord: SkillDef = {
  id: 'poly-word',
  unitId: 'unitPoly',
  difficulty: 3,
  word: true,
  title: '둘레·넓이 문장제',
  note: '소재 10가지 문장제, fill-blanks',
  generate(seed) {
    const rng = new RNG(seed);
    const scenario = rng.pick(SCENARIOS);

    switch (scenario.kind) {
      case 'rect-peri': {
        const w = rng.int(2, 20);
        let h = rng.int(2, 20);
        if (h === w) h = h < 20 ? h + 1 : h - 1;
        const peri = 2 * (w + h);
        const expr: MathExpr = [
          txt(`(${w} + ${h}) × 2 = `),
          blank(0),
          txt(' cm'),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `가로가 ${w} cm이고 세로가 ${h} cm인 ${scenario.label}의 둘레는 몇 cm인가요?`,
          expr,
          blankAnswers: [peri],
          explanation: [
            txt(`직사각형의 둘레 = (가로 + 세로) × 2 = (${w} + ${h}) × 2 = ${peri} cm예요.`),
          ],
        };
      }

      case 'rect-area': {
        let w: number, h: number;
        do {
          w = rng.int(2, 20);
          h = rng.int(2, 20);
        } while (w * h > 400);
        const area = w * h;
        const expr: MathExpr = [
          txt(`${w} × ${h} = `),
          blank(0),
          txt(' cm²'),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `가로가 ${w} cm이고 세로가 ${h} cm인 ${scenario.label}의 넓이는 몇 cm²인가요?`,
          expr,
          blankAnswers: [area],
          explanation: [
            txt(`직사각형의 넓이 = 가로 × 세로 = ${w} × ${h} = ${area} cm²예요.`),
          ],
        };
      }

      case 'para-area': {
        let base: number, height: number;
        do {
          base = rng.int(2, 20);
          height = rng.int(2, 20);
        } while (base * height > 400);
        const area = base * height;
        const expr: MathExpr = [
          txt(`${base} × ${height} = `),
          blank(0),
          txt(' cm²'),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `밑변이 ${base} cm이고 높이가 ${height} cm인 ${scenario.label}의 넓이는 몇 cm²인가요?`,
          expr,
          blankAnswers: [area],
          explanation: [
            txt(`평행사변형의 넓이 = 밑변 × 높이 = ${base} × ${height} = ${area} cm²예요.`),
          ],
        };
      }

      case 'tri-area': {
        let base: number, height: number;
        do {
          base = rng.int(2, 20);
          height = rng.int(2, 20);
        } while (base * height > 800 || (base * height) % 2 !== 0);
        const area = (base * height) / 2;
        const expr: MathExpr = [
          txt(`${base} × ${height} ÷ 2 = `),
          blank(0),
          txt(' cm²'),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `밑변이 ${base} cm이고 높이가 ${height} cm인 ${scenario.label}의 넓이는 몇 cm²인가요?`,
          expr,
          blankAnswers: [area],
          explanation: [
            txt(`삼각형의 넓이 = 밑변 × 높이 ÷ 2 = ${base} × ${height} ÷ 2 = ${area} cm²예요.`),
          ],
        };
      }

      case 'trap-area': {
        let top: number, bot: number, height: number;
        do {
          top = rng.int(2, 18);
          bot = rng.int(2, 18);
          height = rng.int(2, 18);
        } while (
          top === bot ||
          (top + bot) * height > 800 ||
          ((top + bot) * height) % 2 !== 0
        );
        const area = ((top + bot) * height) / 2;
        const expr: MathExpr = [
          txt(`(${top} + ${bot}) × ${height} ÷ 2 = `),
          blank(0),
          txt(' cm²'),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `윗변이 ${top} cm, 아랫변이 ${bot} cm, 높이가 ${height} cm인 ${scenario.label}의 넓이는 몇 cm²인가요?`,
          expr,
          blankAnswers: [area],
          explanation: [
            txt(`사다리꼴의 넓이 = (윗변 + 아랫변) × 높이 ÷ 2 = (${top} + ${bot}) × ${height} ÷ 2 = ${area} cm²예요.`),
          ],
        };
      }

      case 'rhombus-area': {
        // 마름모 넓이 = 두 대각선의 곱 ÷ 2, 짝수 보장
        let d1: number, d2: number;
        do {
          d1 = rng.int(2, 20);
          d2 = rng.int(2, 20);
        } while (d1 * d2 > 800 || (d1 * d2) % 2 !== 0);
        const area = (d1 * d2) / 2;
        const expr: MathExpr = [
          txt(`${d1} × ${d2} ÷ 2 = `),
          blank(0),
          txt(' cm²'),
        ];
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `두 대각선의 길이가 각각 ${d1} cm, ${d2} cm인 ${scenario.label}의 넓이는 몇 cm²인가요?`,
          expr,
          blankAnswers: [area],
          explanation: [
            txt(`마름모의 넓이 = 두 대각선의 곱 ÷ 2 = ${d1} × ${d2} ÷ 2 = ${d1 * d2} ÷ 2 = ${area} cm²예요.`),
          ],
        };
      }
    }
  },
};

// ── export ──────────────────────────────────────────────────

export const unitPolySkills: SkillDef[] = [
  polyPeriRegular,
  polyPeriRect,
  polyAreaRect,
  polyMissingSide,
  polyAreaPara,
  polyAreaTri,
  polyAreaTrap,
  polyWord,
];
