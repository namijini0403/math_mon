/**
 * 단원: 원의 넓이 (2022 개정교육과정 6-2 5단원)
 * 성취기준: 원주율의 의미를 알고, 원주와 원의 넓이를 구할 수 있다.
 * 원주율: 3.14 (고정). 모든 계산은 정수 스케일로 부동소수점 오차 방지.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;

/** 소수를 깔끔한 문자열로 표시 (trailing zero 없음) */
function fmt(v: number): string {
  return String(v);
}

/**
 * 지름 d(정수) → 원주 = d × 3.14
 * 정수 스케일: Math.round(d * 314) / 100
 * d가 정수이면 d*314는 정수이므로 round 불필요하나 안전하게 유지.
 */
function circum(d: number): number {
  return Math.round(d * 314) / 100;
}

/**
 * 반지름 r(정수) → 원의 넓이 = r × r × 3.14
 * 정수 스케일: Math.round(r * r * 314) / 100
 * r*r은 정수이므로 r*r*314도 정수 → 결과는 소수 둘째 자리까지 정확.
 */
function area(r: number): number {
  return Math.round(r * r * 314) / 100;
}

// ── 1. circ-circum : 원주 구하기 ──────────────────────────────────
const circCircum: SkillDef = {
  id: 'circ-circum',
  minVariety: 25,
  unitId: 'unitCircle',
  title: '원주 구하기',
  note: '지름 또는 반지름이 주어진 원의 원주를 구한다. 원주율 3.14.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    // 반지름 제시 vs 지름 제시 랜덤
    const useRadius = rng.chance(0.5);

    let d: number;
    if (useRadius) {
      // 반지름 r: 1~10 정수 → 지름 d = r×2
      const r = rng.int(1, 10);
      d = r * 2;
      const answer = circum(d);

      const explanation: MathExpr = [
        txt(`반지름이 ${r} cm이면 지름은 ${r} × 2 = ${d} cm예요. `),
        txt(`원주 = 지름 × 원주율 = ${d} × 3.14 = ${fmt(answer)} cm예요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'decimal-input',
        prompt: `반지름이 ${r} cm인 원의 원주는 몇 cm인가요? (원주율: 3.14)`,
        answer,
        unit: 'cm',
        explanation,
      };
    } else {
      // 지름 d: 2~20 정수
      d = rng.int(2, 20);
      const answer = circum(d);

      const explanation: MathExpr = [
        txt(`원주 = 지름 × 원주율 = ${d} × 3.14 = ${fmt(answer)} cm예요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'decimal-input',
        prompt: `지름이 ${d} cm인 원의 원주는 몇 cm인가요? (원주율: 3.14)`,
        answer,
        unit: 'cm',
        explanation,
      };
    }
  },
};

// ── 2. circ-circum-inv : 원주로 지름/반지름 역산 ──────────────────
const circCircumInv: SkillDef = {
  id: 'circ-circum-inv',
  minVariety: 25,
  unitId: 'unitCircle',
  title: '원주로 지름·반지름 구하기',
  note: '원주 C = d×3.14에서 지름 또는 반지름을 역산. d가 자연수가 되도록 먼저 d를 정하고 C를 계산.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 지름 d: 2~20 정수 → 원주 C = d×3.14
    const d = rng.int(2, 20);
    const C = circum(d);

    // 지름 묻기 vs 반지름 묻기
    const askRadius = rng.chance(0.5);

    if (askRadius) {
      // 반지름이 정수가 되려면 d가 짝수여야 함 → d를 짝수로 고정
      const dEven = d % 2 === 0 ? d : d + 1;
      const CEven = circum(dEven);
      const rAns = dEven / 2;

      const explanation: MathExpr = [
        txt(`원주 = 지름 × 원주율이므로 지름 = 원주 ÷ 원주율이에요. `),
        txt(`지름 = ${fmt(CEven)} ÷ 3.14 = ${dEven} cm, `),
        txt(`반지름 = ${dEven} ÷ 2 = ${rAns} cm예요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `원주가 ${fmt(CEven)} cm인 원이 있어요. 이 원의 반지름은 몇 cm인가요?`,
        expr: [
          txt(`반지름 = `), { kind: 'blank', slot: 0 }, txt(` cm`),
        ],
        blankAnswers: [rAns],
        explanation,
      };
    } else {
      const explanation: MathExpr = [
        txt(`원주 = 지름 × 원주율이므로 지름 = 원주 ÷ 원주율이에요. `),
        txt(`지름 = ${fmt(C)} ÷ 3.14 = ${d} cm예요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `원주가 ${fmt(C)} cm인 원이 있어요. 이 원의 지름은 몇 cm인가요?`,
        expr: [
          txt(`지름 = `), { kind: 'blank', slot: 0 }, txt(` cm`),
        ],
        blankAnswers: [d],
        explanation,
      };
    }
  },
};

// ── 3. circ-area : 원의 넓이 구하기 ──────────────────────────────
const circArea: SkillDef = {
  id: 'circ-area',
  minVariety: 15,
  unitId: 'unitCircle',
  title: '원의 넓이 구하기',
  note: '반지름 또는 (짝수) 지름이 주어진 원의 넓이를 구한다. r×r×3.14, 정수 스케일.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 지름 제시 vs 반지름 제시
    const useDiameter = rng.chance(0.5);

    if (useDiameter) {
      // 지름은 짝수(2~20) → 반지름 r = d/2 (정수)
      const d = rng.int(1, 10) * 2; // 2,4,6,...,20
      const r = d / 2;
      const answer = area(r);

      const explanation: MathExpr = [
        txt(`지름이 ${d} cm이면 반지름은 ${d} ÷ 2 = ${r} cm예요. `),
        txt(`원의 넓이 = 반지름 × 반지름 × 원주율 = ${r} × ${r} × 3.14 = ${fmt(answer)} cm²예요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'decimal-input',
        prompt: `지름이 ${d} cm인 원의 넓이는 몇 cm²인가요? (원주율: 3.14)`,
        answer,
        unit: 'cm²',
        explanation,
      };
    } else {
      // 반지름 r: 2~10 정수
      const r = rng.int(2, 10);
      const answer = area(r);

      const explanation: MathExpr = [
        txt(`원의 넓이 = 반지름 × 반지름 × 원주율 = ${r} × ${r} × 3.14 = ${fmt(answer)} cm²예요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'decimal-input',
        prompt: `반지름이 ${r} cm인 원의 넓이는 몇 cm²인가요? (원주율: 3.14)`,
        answer,
        unit: 'cm²',
        explanation,
      };
    }
  },
};

// ── 4. circ-half : 반원·사분원 넓이 ──────────────────────────────
const circHalf: SkillDef = {
  id: 'circ-half',
  minVariety: 12,
  unitId: 'unitCircle',
  title: '반원·사분원의 넓이',
  note: '반원: r²×3.14÷2 = r²×157/100. 사분원: r²×3.14÷4 = r²×314/400 (r 짝수로 정수 보장).',
  difficulty: 3,
  generate(seed) {
    const rng = new RNG(seed);

    // 반원 vs 사분원
    const isQuarter = rng.chance(0.5);

    if (isQuarter) {
      // 사분원: r²×314/400 = r²×157/200
      // r이 짝수일 때 r²×314이 400의 배수 → (짝수)²×314/400 정수
      // 예: r=2 → 4×314/400=1256/400=3.14, r=4 → 16×314/400=50.24, ...
      // 실제로는 r²×314이 400의 배수가 되려면 r²이 200/gcd(314,200)의 배수
      // gcd(314,200)=2, 따라서 r²이 100의 배수 → r이 10의 배수
      // 그렇지 않으면 소수 둘째 자리까지만 정확하면 OK (answer×10000 정수 조건)
      // r²×314/400 = r²×157/200: 분자 r²×157, 분모 200
      // answer×10000 = r²×157×50 정수 ← r이 정수이면 항상 정수 OK
      const r = rng.int(1, 5) * 2; // 2,4,6,8,10 (짝수)
      // 정수 스케일: r*r*314/400
      const answer = Math.round(r * r * 314) / 400;

      const explanation: MathExpr = [
        txt(`사분원의 넓이 = 원의 넓이 ÷ 4예요. `),
        txt(`원의 넓이 = ${r} × ${r} × 3.14 = ${fmt(area(r))} cm²이므로 `),
        txt(`사분원의 넓이 = ${fmt(area(r))} ÷ 4 = ${fmt(answer)} cm²예요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'decimal-input',
        prompt: `반지름이 ${r} cm인 사분원(원의 4분의 1)의 넓이는 몇 cm²인가요? (원주율: 3.14)`,
        answer,
        unit: 'cm²',
        explanation,
      };
    } else {
      // 반원: r²×3.14÷2 = r²×157/100
      // r*r*157: r이 정수이면 정수, /100 → 소수 둘째 자리까지 정확
      const r = rng.int(2, 10);
      const answer = Math.round(r * r * 157) / 100;

      const explanation: MathExpr = [
        txt(`반원의 넓이 = 원의 넓이 ÷ 2예요. `),
        txt(`원의 넓이 = ${r} × ${r} × 3.14 = ${fmt(area(r))} cm²이므로 `),
        txt(`반원의 넓이 = ${fmt(area(r))} ÷ 2 = ${fmt(answer)} cm²예요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'decimal-input',
        prompt: `반지름이 ${r} cm인 반원의 넓이는 몇 cm²인가요? (원주율: 3.14)`,
        answer,
        unit: 'cm²',
        explanation,
      };
    }
  },
};

// ── 5. circ-point : 원주율 개념 문제 ─────────────────────────────
const circPoint: SkillDef = {
  id: 'circ-point',
  unitId: 'unitCircle',
  title: '원주율 개념 이해',
  note: '원주율의 정의·성질 4지선다 또는 원주율 계산 버전. minVariety 5(개념 유형 제한).',
  difficulty: 2,
  minVariety: 5,
  generate(seed) {
    const rng = new RNG(seed);

    // 개념 문제 vs 계산 문제
    const isCalc = rng.chance(0.5);

    if (isCalc) {
      // "원주가 C cm, 지름 d cm인 원의 원주율은?" → C/d = 3.14
      const d = rng.int(2, 20);
      const C = circum(d);

      const answerCV: ChoiceValue = { kind: 'decimal', v: 3.14 };
      const candidates: ChoiceValue[] = [
        { kind: 'decimal', v: 3 },
        { kind: 'decimal', v: 3.1 },
        { kind: 'decimal', v: 3.4 },
        { kind: 'decimal', v: 3.41 },
        { kind: 'decimal', v: 31.4 },
      ];

      const { choices, answerIndex } = buildChoices(answerCV, candidates, rng);

      const explanation: MathExpr = [
        txt(`원주율 = 원주 ÷ 지름 = ${fmt(C)} ÷ ${d} = 3.14예요. `),
        txt(`원주율은 원의 크기에 상관없이 항상 일정해요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'choice',
        prompt: `원주가 ${fmt(C)} cm이고 지름이 ${d} cm인 원의 원주율을 구하세요.`,
        choices,
        answerIndex,
        explanation,
      };
    } else {
      // 개념 설명 4지선다
      const conceptSets: { correct: string; wrongs: string[] }[] = [
        {
          correct: '원주율은 원주 ÷ 지름이에요.',
          wrongs: [
            '원주율은 지름 ÷ 원주예요.',
            '원주율은 원마다 달라요.',
            '원주율은 항상 3이에요.',
          ],
        },
        {
          correct: '원주율은 원의 크기에 관계없이 일정해요.',
          wrongs: [
            '원이 클수록 원주율도 커져요.',
            '원주율은 지름 ÷ 반지름이에요.',
            '원주율은 약 31.4예요.',
          ],
        },
        {
          correct: '원주 = 지름 × 원주율로 구해요.',
          wrongs: [
            '원주 = 반지름 × 원주율로 구해요.',
            '원주 = 지름 + 원주율로 구해요.',
            '원주 = 지름 × 반지름으로 구해요.',
          ],
        },
        {
          correct: '(원주율) = (원주) ÷ (지름)이에요.',
          wrongs: [
            '(원주율) = (지름) ÷ (원주)예요.',
            '(원주율) = (원주) × (지름)이에요.',
            '(원주율) = (반지름) ÷ (원주)예요.',
          ],
        },
        {
          correct: '원주율 3.14를 이용하면 지름 × 3.14로 원주를 구할 수 있어요.',
          wrongs: [
            '원주율 3.14를 이용하면 반지름 × 3.14로 원주를 구할 수 있어요.',
            '원주율 3.14를 이용하면 지름 ÷ 3.14로 원주를 구할 수 있어요.',
            '원주율 3.14를 이용하면 지름 × 3으로 원주를 구할 수 있어요.',
          ],
        },
      ];

      const idx = rng.int(0, conceptSets.length - 1);
      const chosen = conceptSets[idx];

      const answerCV: ChoiceValue = { kind: 'text', text: chosen.correct };
      const candidates: ChoiceValue[] = chosen.wrongs.map(w => ({ kind: 'text', text: w } as ChoiceValue));

      const { choices, answerIndex } = buildChoices(answerCV, candidates, rng);

      const explanation: MathExpr = [
        txt(`원주율은 (원주) ÷ (지름)이에요. `),
        txt(`원의 크기가 달라도 원주율은 항상 약 3.14로 일정해요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'choice',
        prompt: `원주율에 대한 설명으로 옳은 것을 고르세요.`,
        choices,
        answerIndex,
        explanation,
      };
    }
  },
};

// ── 6. circ-word : 원 관련 문장제 ─────────────────────────────────
const circWord: SkillDef = {
  id: 'circ-word',
  unitId: 'unitCircle',
  title: '원 문장제',
  note: '원주·원의 넓이를 활용하는 실생활 문장제. 소재 5가지 이상.',
  difficulty: 3,
  word: true,
  generate(seed) {
    const rng = new RNG(seed);
    const templateIdx = rng.int(0, 5);

    let answer = 0;
    let prompt = '';
    let unit = '';
    let explanation: MathExpr = [];

    if (templateIdx === 0) {
      // 굴렁쇠: 지름 d cm인 굴렁쇠가 한 바퀴 굴러간 거리 = 원주
      const d = rng.int(2, 20);
      answer = circum(d);
      unit = 'cm';
      prompt = `지름이 ${d} cm인 굴렁쇠가 땅 위에서 한 바퀴 굴러갔어요. 굴렁쇠가 이동한 거리는 몇 cm인가요? (원주율: 3.14)`;
      explanation = [
        txt(`굴렁쇠가 한 바퀴 굴러간 거리는 원주와 같아요. `),
        txt(`원주 = 지름 × 원주율 = ${d} × 3.14 = ${fmt(answer)} cm예요.`),
      ];

    } else if (templateIdx === 1) {
      // 호수 둘레: 지름 d m인 호수 주변 산책로의 둘레
      const d = rng.int(10, 50) * 2; // 20~100 m (짝수)
      answer = circum(d);
      unit = 'm';
      prompt = `지름이 ${d} m인 원 모양 호수 주변을 한 바퀴 산책했어요. 산책한 거리는 몇 m인가요? (원주율: 3.14)`;
      explanation = [
        txt(`호수 주변을 한 바퀴 도는 거리는 원주와 같아요. `),
        txt(`원주 = 지름 × 원주율 = ${d} × 3.14 = ${fmt(answer)} m예요.`),
      ];

    } else if (templateIdx === 2) {
      // 피자: 반지름 r cm인 피자의 넓이
      const r = rng.int(2, 10);
      answer = area(r);
      unit = 'cm²';
      prompt = `반지름이 ${r} cm인 피자의 넓이는 몇 cm²인가요? (원주율: 3.14)`;
      explanation = [
        txt(`피자는 원 모양이에요. `),
        txt(`원의 넓이 = 반지름 × 반지름 × 원주율 = ${r} × ${r} × 3.14 = ${fmt(answer)} cm²예요.`),
      ];

    } else if (templateIdx === 3) {
      // 원 모양 거울: 지름 d cm인 거울의 넓이
      const d = rng.int(1, 10) * 2; // 2~20 cm (짝수)
      const r = d / 2;
      answer = area(r);
      unit = 'cm²';
      prompt = `지름이 ${d} cm인 원 모양 거울의 넓이는 몇 cm²인가요? (원주율: 3.14)`;
      explanation = [
        txt(`지름이 ${d} cm이면 반지름은 ${r} cm예요. `),
        txt(`원의 넓이 = 반지름 × 반지름 × 원주율 = ${r} × ${r} × 3.14 = ${fmt(answer)} cm²예요.`),
      ];

    } else if (templateIdx === 4) {
      // 통나무: 반지름 r cm인 원 모양 통나무의 단면 둘레
      const r = rng.int(2, 15);
      const d = r * 2;
      answer = circum(d);
      unit = 'cm';
      prompt = `반지름이 ${r} cm인 원 모양 통나무를 잘랐더니 단면이 원 모양이에요. 단면의 둘레는 몇 cm인가요? (원주율: 3.14)`;
      explanation = [
        txt(`반지름이 ${r} cm이면 지름은 ${r} × 2 = ${d} cm예요. `),
        txt(`둘레(원주) = 지름 × 원주율 = ${d} × 3.14 = ${fmt(answer)} cm예요.`),
      ];

    } else {
      // 꽃밭: 반지름 r m인 원 모양 꽃밭의 넓이
      const r = rng.int(3, 8);
      answer = area(r);
      unit = 'm²';
      prompt = `반지름이 ${r} m인 원 모양 꽃밭의 넓이는 몇 m²인가요? (원주율: 3.14)`;
      explanation = [
        txt(`꽃밭은 원 모양이에요. `),
        txt(`원의 넓이 = 반지름 × 반지름 × 원주율 = ${r} × ${r} × 3.14 = ${fmt(answer)} m²예요.`),
      ];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt,
      answer,
      unit,
      explanation,
    };
  },
};

export const unitCircleSkills: SkillDef[] = [
  circCircum,
  circCircumInv,
  circArea,
  circHalf,
  circPoint,
  circWord,
];
