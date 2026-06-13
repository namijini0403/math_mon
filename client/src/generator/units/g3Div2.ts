/**
 * 단원: 나눗셈 (2022 개정교육과정 3-2 2단원)
 * 성취기준: (몇십)÷(몇), (두 자리)÷(한 자리) 나머지 없음/있음,
 * 검산식(나누어지는 수 = 나누는 수×몫+나머지), 문장제
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. div32-tens  (몇십)÷(몇) (fill-blanks) ─────────────────────
const div32Tens: SkillDef = {
  id: 'div32-tens',
  unitId: 'unitDiv32',
  difficulty: 1,
  title: '(몇십)÷(몇)',
  note: '십의 배수 ÷ 한 자리 수(나누어떨어짐). fill-blanks.',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    // 나누어떨어지는 (몇십): b × q × 10 형태
    const b = rng.int(2, 9);
    const q = rng.int(1, 9);
    const a = b * q * 10;

    const expr: MathExpr = [
      txt(`${a} ÷ ${b} = `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [q * 10],
      explanation: [txt(`${a} ÷ ${b} = ${a / b}. ${b} × ${q} = ${b * q}이므로 ${a} ÷ ${b} = ${q * 10}이에요.`)],
    };
  },
};

// ── 2. div32-no-rem  (두 자리)÷(한 자리) 나머지 없음 (fill-blanks) ─
const div32NoRem: SkillDef = {
  id: 'div32-no-rem',
  unitId: 'unitDiv32',
  difficulty: 1,
  title: '(두 자리)÷(한 자리) 나머지 없음',
  note: '두 자리 ÷ 한 자리, 나누어떨어짐. fill-blanks.',
  minVariety: 57,
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number, q: number;
    a = 48; b = 4; q = 12;

    for (let tries = 0; tries < 300; tries++) {
      const tb = rng.int(2, 9);
      const tq = rng.int(10, 19); // 몫이 두 자리가 되도록 (10~19 범위)
      const ta = tb * tq;
      if (ta >= 10 && ta <= 99) {
        a = ta; b = tb; q = tq; break;
      }
    }

    const expr: MathExpr = [
      txt(`${a} ÷ ${b} = `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [q],
      explanation: [txt(`${a} ÷ ${b} = ${q}. 나머지 없이 나누어떨어져요.`)],
    };
  },
};

// ── 3. div32-rem  (두 자리)÷(한 자리) 나머지 있음 (fill-blanks) ────
const div32Rem: SkillDef = {
  id: 'div32-rem',
  unitId: 'unitDiv32',
  difficulty: 2,
  title: '(두 자리)÷(한 자리) 나머지 있음',
  note: '두 자리 ÷ 한 자리, 나머지 있음. 몫과 나머지 두 칸 채우기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number, q: number, r: number;
    a = 47; b = 4; q = 11; r = 3;

    for (let tries = 0; tries < 300; tries++) {
      const tb = rng.int(2, 9);
      const tq = rng.int(10, 19);
      const tr = rng.int(1, tb - 1); // 나머지 < 나누는 수
      const ta = tb * tq + tr;
      if (ta >= 10 && ta <= 99 && tr > 0) {
        a = ta; b = tb; q = tq; r = tr; break;
      }
    }

    const expr: MathExpr = [
      txt(`${a} ÷ ${b} = `),
      { kind: 'blank', slot: 0 },
      txt(' … '),
      { kind: 'blank', slot: 1 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '몫과 나머지를 구하세요.',
      expr,
      blankAnswers: [q, r],
      explanation: [txt(`${a} ÷ ${b} = ${q} … ${r}. ${b} × ${q} + ${r} = ${b * q + r} = ${a}로 검산할 수 있어요.`)],
    };
  },
};

// ── 4. div32-verify  검산식 역산 (fill-blanks) ──────────────────────
const div32Verify: SkillDef = {
  id: 'div32-verify',
  unitId: 'unitDiv32',
  difficulty: 2,
  title: '검산식 역산',
  note: '나누어지는 수 = 나누는 수×몫+나머지 관계로 빈칸 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number, q: number, r: number;
    a = 47; b = 4; q = 11; r = 3;

    for (let tries = 0; tries < 300; tries++) {
      const tb = rng.int(2, 9);
      const tq = rng.int(10, 19);
      const tr = rng.int(1, tb - 1);
      const ta = tb * tq + tr;
      if (ta >= 10 && ta <= 99 && tr > 0) {
        a = ta; b = tb; q = tq; r = tr; break;
      }
    }

    // 패턴: 0 = 나누어지는 수(a) 찾기, 1 = 몫(q) 찾기, 2 = 나머지(r) 찾기
    const pat = rng.int(0, 2);
    let expr: MathExpr;
    let answer: number;
    let promptStr: string;
    let explStr: string;

    if (pat === 0) {
      // □ ÷ b = q … r  →  a = b×q + r
      answer = a;
      promptStr = `□ ÷ ${b} = ${q} … ${r}일 때, □를 구하세요.`;
      expr = [txt('□ = '), { kind: 'blank', slot: 0 }];
      explStr = `나누어지는 수 = 나누는 수 × 몫 + 나머지 = ${b} × ${q} + ${r} = ${a}`;
    } else if (pat === 1) {
      // a ÷ b = □ … r  →  q = (a - r) / b
      answer = q;
      promptStr = `${a} ÷ ${b} = □ … ${r}일 때, □를 구하세요.`;
      expr = [txt('□ = '), { kind: 'blank', slot: 0 }];
      explStr = `${b} × □ + ${r} = ${a}이므로 ${b} × □ = ${a - r}, □ = ${q}`;
    } else {
      // a ÷ b = q … □  →  r = a - b×q
      answer = r;
      promptStr = `${a} ÷ ${b} = ${q} … □일 때, □를 구하세요.`;
      expr = [txt('□ = '), { kind: 'blank', slot: 0 }];
      explStr = `${b} × ${q} + □ = ${a}이므로 □ = ${a} − ${b * q} = ${r}`;
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptStr,
      expr,
      blankAnswers: [answer],
      explanation: [txt(explStr)],
    };
  },
};

// ── 5. div32-word  나눗셈 문장제 (fill-blanks) ──────────────────────
const div32Word: SkillDef = {
  id: 'div32-word',
  unitId: 'unitDiv32',
  difficulty: 3,
  word: true,
  title: '나눗셈 문장제',
  note: '(두 자리)÷(한 자리) 나머지 포함 모험 소재 문장제. 소재 3가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let prompt: string;
    let b: number, q: number, r: number, a: number;
    let explanation: string;

    // 나머지 있는 두 자리 나눗셈 공통 생성
    b = 4; q = 12; r = 2; a = 50;
    for (let tries = 0; tries < 300; tries++) {
      const tb = rng.int(2, 7);
      const tq = rng.int(10, 15);
      const tr = rng.int(1, tb - 1);
      const ta = tb * tq + tr;
      if (ta >= 20 && ta <= 79 && tr > 0) {
        b = tb; q = tq; r = tr; a = ta; break;
      }
    }

    if (pat === 0) {
      prompt = `마법사 ${a}명이 ${b}명씩 모둠을 만들어요. 모둠이 몇 개 만들어지고, 몇 명이 남나요?`;
      explanation = `${a} ÷ ${b} = ${q} … ${r}`;
    } else if (pat === 1) {
      prompt = `보석 ${a}개를 상자 ${b}개에 똑같이 나누면, 한 상자에 몇 개씩 담기고 몇 개가 남나요?`;
      explanation = `${a} ÷ ${b} = ${q} … ${r}`;
    } else {
      prompt = `별 스티커 ${a}장을 ${b}장씩 봉투에 담으면, 봉투가 몇 개 필요하고 몇 장이 남나요?`;
      explanation = `${a} ÷ ${b} = ${q} … ${r}`;
    }

    const expr: MathExpr = [
      txt('몫: '),
      { kind: 'blank', slot: 0 },
      txt(', 나머지: '),
      { kind: 'blank', slot: 1 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [q, r],
      explanation: [txt(explanation)],
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitDiv32Skills: SkillDef[] = [
  div32Tens,
  div32NoRem,
  div32Rem,
  div32Verify,
  div32Word,
];
