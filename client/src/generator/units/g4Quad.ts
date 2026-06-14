/**
 * 단원: 사각형 (2022 개정교육과정 4-2 4단원)
 * 성취기준: 평행사변형·마름모·사다리꼴의 성질을 이해하고 각·변·둘레를 구할 수 있다.
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. quad-para-angle  평행사변형 각 구하기  난이도 1 ──────────────────
const quadParaAngle: SkillDef = {
  id: 'quad-para-angle',
  unitId: 'unitQuad',
  difficulty: 1,
  title: '평행사변형 각 구하기',
  note: '이웃한 각의 합=180°, 마주 보는 각이 같음. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    // pat 0: 이웃한 각 → 나머지 각, pat 1: 마주 보는 각 제시
    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 한 각(예각) → 이웃한 각(둔각)
      let a = 60, b = 120;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 89);
        const tb = 180 - ta;
        if (ta >= 30 && tb >= 91 && tb <= 170) { a = ta; b = tb; break; }
      }
      answer = b;
      prompt = `평행사변형에서 한 각이 ${a}°일 때, 이웃한 각은 몇 도인가요?`;
      explanation = [txt(`평행사변형에서 이웃한 두 각의 합은 180°이에요. 180° − ${a}° = ${b}°`)];
    } else {
      // 마주 보는 각 → 같은 크기
      let a = 70;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 150);
        if (ta !== 90) { a = ta; break; }
      }
      answer = a;
      prompt = `평행사변형에서 한 각이 ${a}°일 때, 마주 보는 각은 몇 도인가요?`;
      explanation = [txt(`평행사변형에서 마주 보는 두 각의 크기는 같아요. 마주 보는 각 = ${a}°`)];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr: [txt('답: '), { kind: 'blank', slot: 0 }, txt('°')],
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 2. quad-para-side  평행사변형 변·둘레 역산  난이도 2 ─────────────────
const quadParaSide: SkillDef = {
  id: 'quad-para-side',
  unitId: 'unitQuad',
  difficulty: 2,
  title: '평행사변형 변·둘레 역산',
  note: '둘레와 한 변으로 나머지 변 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 둘레 + 짧은 변 → 긴 변
      let a = 10, b = 6, peri = 32;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(5, 20);
        const tb = rng.int(2, ta - 1);
        const tp = 2 * (ta + tb);
        if (tp >= 10 && ta !== tb) { a = ta; b = tb; peri = tp; break; }
      }
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `평행사변형의 둘레가 ${peri} cm이고 짧은 변이 ${b} cm일 때, 긴 변의 길이는 몇 cm인가요?`,
        expr: [txt('긴 변: '), { kind: 'blank', slot: 0 }, txt(' cm')],
        blankAnswers: [a],
        explanation: [
          txt(`평행사변형은 마주 보는 변의 길이가 같아요.`),
          txt(`긴 변 = (둘레 ÷ 2) − 짧은 변 = (${peri} ÷ 2) − ${b} = ${peri / 2} − ${b} = ${a} cm`),
        ],
      };
    } else {
      // 두 변 → 둘레
      let a = 10, b = 6, peri = 32;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(4, 20);
        const tb = rng.int(2, ta);
        if (ta !== tb) { a = ta; b = tb; peri = 2 * (ta + tb); break; }
      }
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `평행사변형의 두 변의 길이가 각각 ${a} cm, ${b} cm일 때, 둘레는 몇 cm인가요?`,
        expr: [txt('둘레: '), { kind: 'blank', slot: 0 }, txt(' cm')],
        blankAnswers: [peri],
        explanation: [
          txt(`평행사변형 둘레 = (${a} + ${b}) × 2 = ${a + b} × 2 = ${peri} cm`),
        ],
      };
    }
  },
};

// ── 3. quad-rhombus  마름모 성질(둘레·각)  난이도 2 ─────────────────────
const quadRhombus: SkillDef = {
  id: 'quad-rhombus',
  unitId: 'unitQuad',
  difficulty: 2,
  title: '마름모 성질(둘레·각)',
  note: '네 변이 같음, 이웃각 합=180°, 마주보는 각이 같음. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    if (pat === 0) {
      // 한 변 → 둘레
      const side = rng.int(3, 20);
      const peri = side * 4;
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `마름모의 한 변의 길이가 ${side} cm일 때, 둘레는 몇 cm인가요?`,
        expr: [txt('둘레: '), { kind: 'blank', slot: 0 }, txt(' cm')],
        blankAnswers: [peri],
        explanation: [txt(`마름모는 네 변의 길이가 모두 같아요. ${side} × 4 = ${peri} cm`)],
      };
    } else if (pat === 1) {
      // 둘레 → 한 변
      const side = rng.int(3, 20);
      const peri = side * 4;
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `마름모의 둘레가 ${peri} cm일 때, 한 변의 길이는 몇 cm인가요?`,
        expr: [txt('한 변: '), { kind: 'blank', slot: 0 }, txt(' cm')],
        blankAnswers: [side],
        explanation: [txt(`마름모 한 변 = 둘레 ÷ 4 = ${peri} ÷ 4 = ${side} cm`)],
      };
    } else {
      // 한 각 → 이웃한 각(이웃각의 합 = 180°)
      let a = 60, b = 120;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 89);
        const tb = 180 - ta;
        if (ta >= 30 && tb >= 91 && tb <= 170) { a = ta; b = tb; break; }
      }
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `마름모에서 한 각이 ${a}°일 때, 이웃한 각은 몇 도인가요?`,
        expr: [txt('이웃한 각: '), { kind: 'blank', slot: 0 }, txt('°')],
        blankAnswers: [b],
        explanation: [txt(`마름모에서 이웃한 두 각의 합은 180°이에요. 180° − ${a}° = ${b}°`)],
      };
    }
  },
};

// ── 4. quad-classify  사각형 판별 (choice)  난이도 2 ─────────────────────
const quadClassify: SkillDef = {
  id: 'quad-classify',
  unitId: 'unitQuad',
  difficulty: 2,
  title: '사각형 판별',
  note: '성질 서술을 보고 사각형 종류 고르기. 4지선다.',
  generate(seed) {
    const rng = new RNG(seed);

    type QuadDesc = { label: string; desc: string };
    const quads: QuadDesc[] = [
      {
        label: '사다리꼴',
        desc: '마주 보는 한 쌍의 변이 서로 평행한 사각형',
      },
      {
        label: '평행사변형',
        desc: '마주 보는 두 쌍의 변이 모두 평행한 사각형',
      },
      {
        label: '마름모',
        desc: '네 변의 길이가 모두 같은 사각형',
      },
      {
        label: '직사각형',
        desc: '네 각이 모두 직각인 사각형',
      },
    ];

    const pickedIdx = rng.int(0, quads.length - 1);
    const picked = quads[pickedIdx];
    const answerVal = txc(picked.label);
    const candidates = quads.filter((_, i) => i !== pickedIdx).map((q) => txc(q.label));
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `다음 설명에 해당하는 사각형은 무엇인가요?\n\n"${picked.desc}"`,
      expr: [txt(picked.desc)],
      choices,
      answerIndex,
      explanation: [txt(`${nj(picked.desc, '이/가')} 바로 ${picked.label}의 정의예요.`)],
    };
  },
};

// ── 5. quad-word  사각형 문장제  난이도 3 ─────────────────────────────────
const quadWord: SkillDef = {
  id: 'quad-word',
  unitId: 'unitQuad',
  difficulty: 3,
  word: true,
  title: '사각형 문장제',
  note: '평행사변형·마름모 소재 모험 문장제. 소재 4가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 평행사변형 이웃한 각
      let a = 65, b = 115;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 89);
        const tb = 180 - ta;
        if (ta !== 90 && tb !== 90) { a = ta; b = tb; break; }
      }
      answer = b;
      prompt = `모험가의 방패는 평행사변형 모양이에요. 한 각이 ${a}°라면, 이웃한 각은 몇 도인가요?`;
      explanation = [txt(`이웃한 각 = 180° − ${a}° = ${b}°`)];
    } else if (pat === 1) {
      // 마름모 둘레
      const side = rng.int(4, 20);
      const peri = side * 4;
      answer = peri;
      prompt = `마법사의 마름모 문양에서 한 변의 길이가 ${side} cm예요. 문양의 둘레는 몇 cm인가요?`;
      explanation = [txt(`마름모 둘레 = ${side} × 4 = ${peri} cm`)];
    } else if (pat === 2) {
      // 평행사변형 둘레에서 변 역산
      let a = 10, b = 6, peri = 32;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(5, 18);
        const tb = rng.int(2, ta - 1);
        const tp = 2 * (ta + tb);
        if (ta !== tb) { a = ta; b = tb; peri = tp; break; }
      }
      answer = a;
      prompt = `용사가 만든 평행사변형 깃발의 둘레가 ${peri} cm이고, 짧은 변이 ${b} cm예요. 긴 변의 길이는 몇 cm인가요?`;
      explanation = [txt(`긴 변 = (${peri} ÷ 2) − ${b} = ${peri / 2} − ${b} = ${a} cm`)];
    } else {
      // 마름모 둘레에서 한 변 역산
      const side = rng.int(4, 18);
      const peri = side * 4;
      answer = side;
      prompt = `탐험대의 마름모 모양 텐트 밑면 둘레가 ${peri} cm예요. 한 변의 길이는 몇 cm인가요?`;
      explanation = [txt(`한 변 = ${peri} ÷ 4 = ${side} cm`)];
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

export const unitQuadSkills: SkillDef[] = [
  quadParaAngle,
  quadParaSide,
  quadRhombus,
  quadClassify,
  quadWord,
];
