/**
 * 단원: 각도 (2022 개정교육과정 4-1 2단원)
 * 성취기준: 예각·직각·둔각을 분류하고, 각도의 합·차를 구하며,
 * 직선과 한 바퀴에서 나머지 각, 삼각형·사각형의 각의 합을 이해한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. ang-classify  예각·직각·둔각 분류 (choice)  난이도 1 ─────────
const angClassify: SkillDef = {
  id: 'ang-classify',
  unitId: 'unitAngle',
  difficulty: 1,
  title: '각도 분류',
  note: '각도를 보고 예각/직각/둔각/평각 분류. 4지선다.',
  generate(seed) {
    const rng = new RNG(seed);
    // 각도 종류
    const types: { label: string; range: [number, number] }[] = [
      { label: '예각', range: [1, 89] },
      { label: '직각', range: [90, 90] },
      { label: '둔각', range: [91, 179] },
      { label: '평각', range: [180, 180] },
    ];
    const chosen = rng.pick(types);
    const angle = rng.int(chosen.range[0], chosen.range[1]);
    const answer = chosen.label;

    const allLabels: ChoiceValue[] = types.map(t => txc(t.label));
    const answerVal = txc(answer);
    const candidates = allLabels.filter(c => (c as { text: string }).text !== answer);
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    const explain =
      angle < 90 ? '0°보다 크고 90°보다 작은 각은 예각이에요.'
      : angle === 90 ? '90°인 각은 직각이에요.'
      : angle < 180 ? '90°보다 크고 180°보다 작은 각은 둔각이에요.'
      : '180°인 각은 평각이에요.';

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${angle}°는 어떤 각인가요?`,
      expr: [txt(`${angle}°`)],
      choices,
      answerIndex,
      explanation: [txt(explain)],
    };
  },
};

// ── 2. ang-addSub  각도의 합·차 (fill-blanks)  난이도 1 ─────────────
const angAddSub: SkillDef = {
  id: 'ang-add-sub',
  unitId: 'unitAngle',
  difficulty: 1,
  title: '각도의 합·차',
  note: '두 각도의 합 또는 차. fill-blanks. 결과 1~359°.',
  generate(seed) {
    const rng = new RNG(seed);
    const isAdd = rng.chance(0.5);

    let a: number, b: number, ans: number;
    let guard = 0;
    a = 30; b = 45; ans = 75;
    for (let tries = 0; tries < 200; tries++) {
      const ta = rng.int(5, 170);
      const tb = rng.int(5, 170);
      if (isAdd) {
        const tans = ta + tb;
        if (tans >= 1 && tans <= 359) { a = ta; b = tb; ans = tans; break; }
      } else {
        const tans = Math.abs(ta - tb);
        if (tans >= 1) { a = Math.max(ta, tb); b = Math.min(ta, tb); ans = tans; break; }
      }
      guard++;
    }

    const sym = isAdd ? '+' : '−';
    const expr: MathExpr = [
      txt(`${a}° ${sym} ${b}° = `),
      { kind: 'blank', slot: 0 },
      txt('°'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '각도를 계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation: [
        txt(`${a}° ${sym} ${b}° = ${ans}°`),
      ],
    };
  },
};

// ── 3. ang-line  직선에서 나머지 각 (fill-blanks)  난이도 2 ─────────
const angLine: SkillDef = {
  id: 'ang-line',
  unitId: 'unitAngle',
  difficulty: 2,
  title: '직선에서 나머지 각',
  note: '직선(180°)에서 알려진 각을 빼 나머지 각 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴: 직선 위 두 각 (a + ans = 180)
    let a: number, ans: number;
    a = 30; ans = 150;
    for (let tries = 0; tries < 200; tries++) {
      const ta = rng.int(10, 170);
      const tans = 180 - ta;
      if (tans >= 1 && tans <= 179) { a = ta; ans = tans; break; }
    }

    const expr: MathExpr = [
      txt(`직선 위에서 ${a}°와 이웃하는 각: `),
      { kind: 'blank', slot: 0 },
      txt('°'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `직선 위에서 한쪽이 ${a}°일 때, 나머지 각의 크기를 구하세요.`,
      expr,
      blankAnswers: [ans],
      explanation: [
        txt(`직선(평각)은 180°예요. 180° − ${a}° = ${ans}°`),
      ],
    };
  },
};

// ── 4. ang-round  한 바퀴에서 나머지 각 (fill-blanks)  난이도 2 ─────
const angRound: SkillDef = {
  id: 'ang-round',
  unitId: 'unitAngle',
  difficulty: 2,
  title: '한 바퀴에서 나머지 각',
  note: '360°에서 알려진 각을 빼 나머지 각 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴 0: 2각 (a + ans = 360)
    // 패턴 1: 3각 (a + b + ans = 360)
    const pat = rng.int(0, 1);

    let ans: number;
    let exprStr: string;
    let explStr: string;

    if (pat === 0) {
      let a = 120, tans = 240;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 330);
        const ttans = 360 - ta;
        if (ttans >= 1 && ttans <= 359) { a = ta; tans = ttans; break; }
      }
      ans = tans;
      exprStr = `한 바퀴에서 ${a}°를 제외한 나머지 각: `;
      explStr = `360° − ${a}° = ${ans}°`;
    } else {
      let a = 90, b = 120, tans = 150;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 200);
        const tb = rng.int(30, 200);
        const ttans = 360 - ta - tb;
        if (ttans >= 1 && ttans <= 359) { a = ta; b = tb; tans = ttans; break; }
      }
      ans = tans;
      exprStr = `한 바퀴에서 ${a}°, ${b}°를 제외한 나머지 각: `;
      explStr = `360° − ${a}° − ${b}° = ${ans}°`;
    }

    const expr: MathExpr = [
      txt(exprStr),
      { kind: 'blank', slot: 0 },
      txt('°'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '한 바퀴(360°)에서 나머지 각의 크기를 구하세요.',
      expr,
      blankAnswers: [ans],
      explanation: [txt(explStr)],
    };
  },
};

// ── 5. ang-triangle  삼각형 각의 합에서 나머지 각 (fill-blanks)  난이도 2 ──
const angTriangle: SkillDef = {
  id: 'ang-triangle',
  unitId: 'unitAngle',
  difficulty: 2,
  title: '삼각형의 나머지 각',
  note: '세 각의 합 180°에서 나머지 각 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 두 각이 주어지고 나머지 한 각 구하기
    let a: number, b: number, ans: number;
    a = 60; b = 70; ans = 50;
    for (let tries = 0; tries < 200; tries++) {
      const ta = rng.int(20, 140);
      const tb = rng.int(20, 140);
      const tans = 180 - ta - tb;
      if (tans >= 1 && tans <= 178 && ta + tb < 179) {
        a = ta; b = tb; ans = tans; break;
      }
    }

    const expr: MathExpr = [
      txt(`삼각형의 세 각: ${a}°, ${b}°, `),
      { kind: 'blank', slot: 0 },
      txt('°'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `삼각형의 두 각이 ${a}°, ${b}°일 때 나머지 각은 몇 도인가요?`,
      expr,
      blankAnswers: [ans],
      explanation: [
        txt(`삼각형 세 각의 합은 180°예요. `),
        txt(`180° − ${a}° − ${b}° = ${ans}°`),
      ],
    };
  },
};

// ── 6. ang-quad  사각형 각의 합에서 나머지 각 (fill-blanks)  난이도 3 ──
const angQuad: SkillDef = {
  id: 'ang-quad',
  unitId: 'unitAngle',
  difficulty: 3,
  title: '사각형의 나머지 각',
  note: '네 각의 합 360°에서 나머지 각 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴 0: 세 각 주어짐
    // 패턴 1: 두 각 주어짐 (나머지 하나는 직각)
    const pat = rng.int(0, 1);

    let ans: number;
    let promptStr: string;
    let explStr: string;
    let exprParts: MathExpr;

    if (pat === 0) {
      let a = 80, b = 90, c = 110, tans = 80;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 170);
        const tb = rng.int(30, 170);
        const tc = rng.int(30, 170);
        const ttans = 360 - ta - tb - tc;
        if (ttans >= 1 && ttans <= 359) { a = ta; b = tb; c = tc; tans = ttans; break; }
      }
      ans = tans;
      promptStr = `사각형의 세 각이 ${a}°, ${b}°, ${c}°일 때 나머지 각은 몇 도인가요?`;
      explStr = `360° − ${a}° − ${b}° − ${c}° = ${ans}°`;
      exprParts = [
        txt(`사각형의 네 각: ${a}°, ${b}°, ${c}°, `),
        { kind: 'blank', slot: 0 },
        txt('°'),
      ];
    } else {
      let a = 80, b = 100, tans = 90;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(40, 170);
        const tb = rng.int(40, 170);
        const ttans = 360 - ta - tb - 90; // 세 번째 각은 직각
        if (ttans >= 1 && ttans <= 359) { a = ta; b = tb; tans = ttans; break; }
      }
      ans = tans;
      promptStr = `사각형의 세 각이 ${a}°, ${b}°, 90°일 때 나머지 각은 몇 도인가요?`;
      explStr = `360° − ${a}° − ${b}° − 90° = ${ans}°`;
      exprParts = [
        txt(`사각형의 네 각: ${a}°, ${b}°, 90°, `),
        { kind: 'blank', slot: 0 },
        txt('°'),
      ];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptStr,
      expr: exprParts,
      blankAnswers: [ans],
      explanation: [
        txt('사각형 네 각의 합은 360°예요. '),
        txt(explStr),
      ],
    };
  },
};

// ── 7. ang-word  각도 문장제 (fill-blanks)  난이도 3 ────────────────
const angWord: SkillDef = {
  id: 'ang-word',
  unitId: 'unitAngle',
  difficulty: 3,
  word: true,
  title: '각도 문장제',
  note: '각도를 활용한 모험/판타지 소재 문장제. 소재 4가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 직선에서 나머지 각 문장제
      let a = 65, ans = 115;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(20, 160);
        const tans = 180 - ta;
        if (tans >= 1) { a = ta; ans = tans; break; }
      }
      answer = ans;
      prompt = `마법사의 지팡이가 땅에 닿아 ${a}°의 각도를 만들었어요. 지팡이 반대쪽 각도는 몇 도인가요?`;
      explanation = [txt(`직선(180°)에서 ${a}°를 빼면 180° − ${a}° = ${ans}°`)];
    } else if (pat === 1) {
      // 삼각형 각도 문장제
      let a = 50, b = 70, ans = 60;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(20, 130);
        const tb = rng.int(20, 130);
        const tans = 180 - ta - tb;
        if (tans >= 1 && tans <= 178) { a = ta; b = tb; ans = tans; break; }
      }
      answer = ans;
      prompt = `삼각형 모양의 마법진에서 두 각이 ${a}°, ${b}°예요. 나머지 한 각은 몇 도인가요?`;
      explanation = [txt(`삼각형 세 각의 합은 180°. 180° − ${a}° − ${b}° = ${ans}°`)];
    } else if (pat === 2) {
      // 한 바퀴 문장제
      let a = 120, b = 90, ans = 150;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 200);
        const tb = rng.int(30, 200);
        const tans = 360 - ta - tb;
        if (tans >= 1 && tans <= 359) { a = ta; b = tb; ans = tans; break; }
      }
      answer = ans;
      prompt = `시계탑 꼭대기에서 두 방향으로 빛이 나와 각각 ${a}°, ${b}°를 이루어요. 나머지 방향의 각도는 몇 도인가요?`;
      explanation = [txt(`360° − ${a}° − ${b}° = ${ans}°`)];
    } else {
      // 각도 합 문장제
      let a = 35, b = 55, ans = 90;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(10, 170);
        const tb = rng.int(10, 170);
        const tans = ta + tb;
        if (tans >= 1 && tans <= 359) { a = ta; b = tb; ans = tans; break; }
      }
      answer = ans;
      prompt = `용사가 두 번 방향을 바꿨어요. 처음엔 ${a}°, 두 번째엔 ${b}° 돌았다면 모두 몇 도를 돌았나요?`;
      explanation = [txt(`${a}° + ${b}° = ${ans}°`)];
    }

    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt('°'),
    ];

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

// ── Export ──────────────────────────────────────────────────────────
export const unitAngleSkills: SkillDef[] = [
  angClassify,
  angAddSub,
  angLine,
  angRound,
  angTriangle,
  angQuad,
  angWord,
];
