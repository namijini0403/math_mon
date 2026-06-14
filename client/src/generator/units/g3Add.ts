/**
 * 단원: 덧셈과 뺄셈 (2022 개정교육과정 3-1 1단원)
 * 성취기준: 세 자리 수의 덧셈과 뺄셈(받아올림/내림)을 계산하고,
 * 몇백으로 어림하며, □가 있는 식에서 역산으로 □를 구한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

/** 세 자리 덧셈을 일→십→백 자리별 단계로 풀어 설명한다(받아올림 짚기). */
function addExplain(a: number, b: number): string {
  const u1 = a % 10, u2 = b % 10;
  const t1 = Math.floor(a / 10) % 10, t2 = Math.floor(b / 10) % 10;
  const h1 = Math.floor(a / 100), h2 = Math.floor(b / 100);
  const uSum = u1 + u2;
  const carryU = uSum >= 10 ? 1 : 0;
  const tSum = t1 + t2 + carryU;
  const carryT = tSum >= 10 ? 1 : 0;
  const hSum = h1 + h2 + carryT;
  const uStep = `일의 자리: ${u1} + ${u2} = ${uSum}.${carryU ? ' 10이 넘으니 십의 자리로 1을 받아올림해요.' : ''}`;
  const tStep = `십의 자리: ${t1} + ${t2}${carryU ? ' + 1(받아올림)' : ''} = ${tSum}.${carryT ? ' 10이 넘으니 백의 자리로 1을 받아올림해요.' : ''}`;
  const hStep = `백의 자리: ${h1} + ${h2}${carryT ? ' + 1(받아올림)' : ''} = ${hSum}.`;
  return `${uStep} ${tStep} ${hStep} 그래서 ${a} + ${b} = ${a + b}이에요.`;
}

/** 세 자리 뺄셈을 일→십→백 자리별 단계로 풀어 설명한다(받아내림 짚기). a ≥ b. */
function subExplain(a: number, b: number): string {
  const u1 = a % 10, u2 = b % 10;
  const t1 = Math.floor(a / 10) % 10, t2 = Math.floor(b / 10) % 10;
  const h1 = Math.floor(a / 100), h2 = Math.floor(b / 100);
  let borrowU = 0, uRes: number;
  if (u1 < u2) { uRes = u1 + 10 - u2; borrowU = 1; } else { uRes = u1 - u2; }
  const t1e = t1 - borrowU;
  let borrowT = 0, tRes: number;
  if (t1e < t2) { tRes = t1e + 10 - t2; borrowT = 1; } else { tRes = t1e - t2; }
  const hRes = h1 - borrowT - h2;
  const uStep = borrowU
    ? `일의 자리: ${u1}이 ${u2}보다 작으니 십의 자리에서 10을 빌려 ${u1} + 10 - ${u2} = ${uRes}.`
    : `일의 자리: ${u1} - ${u2} = ${uRes}.`;
  const tBase = borrowU ? `${t1} - 1(빌려줌)= ${t1e}` : `${t1}`;
  const tStep = borrowT
    ? `십의 자리: ${tBase}이 ${t2}보다 작으니 백의 자리에서 10을 빌려 ${t1e} + 10 - ${t2} = ${tRes}.`
    : `십의 자리: ${tBase} - ${t2} = ${tRes}.`;
  const hBase = borrowT ? `${h1} - 1(빌려줌)= ${h1 - borrowT}` : `${h1}`;
  const hStep = `백의 자리: ${hBase} - ${h2} = ${hRes}.`;
  return `${uStep} ${tStep} ${hStep} 그래서 ${a} - ${b} = ${a - b}이에요.`;
}

// ── 1. add3-add  세 자리 덧셈 (받아올림 0→1→2회, difficulty 램프) ───
const add3Add: SkillDef = {
  id: 'add3-add',
  unitId: 'unitAdd3',
  difficulty: 2,
  title: '세 자리 수 덧셈',
  note: '세 자리 수 + 세 자리 수. 받아올림 없음/1회/2회를 seed로 램프. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 받아올림 단계: 0=없음, 1=1회, 2=2회
    const level = rng.int(0, 2);

    let a: number, b: number, ans: number;
    a = 123; b = 234; ans = 357;

    for (let tries = 0; tries < 300; tries++) {
      let ta: number, tb: number;
      if (level === 0) {
        // 받아올림 없음: 각 자리 합 ≤ 9
        const h1 = rng.int(1, 4); const h2 = rng.int(1, 9 - h1);
        const t1 = rng.int(0, 4); const t2 = rng.int(0, 9 - t1);
        const u1 = rng.int(0, 4); const u2 = rng.int(0, 9 - u1);
        ta = h1 * 100 + t1 * 10 + u1;
        tb = h2 * 100 + t2 * 10 + u2;
      } else if (level === 1) {
        // 받아올림 정확히 1회: 한 자리만 합 ≥ 10
        const pos = rng.int(0, 2); // 0=일, 1=십, 2=백
        ta = rng.int(100, 499);
        tb = rng.int(100, 499);
        // 단순화: pos==0 일의 자리에서 받아올림 보장
        if (pos === 0) {
          const u1 = rng.int(5, 9); const u2 = rng.int(10 - u1, 9);
          const t1 = rng.int(0, 4); const t2 = rng.int(0, 4);
          const h1 = rng.int(1, 4); const h2 = rng.int(1, 9 - h1);
          ta = h1 * 100 + t1 * 10 + u1;
          tb = h2 * 100 + t2 * 10 + u2;
        } else if (pos === 1) {
          const u1 = rng.int(0, 4); const u2 = rng.int(0, 9 - u1);
          const t1 = rng.int(5, 9); const t2 = rng.int(10 - t1, 9);
          const h1 = rng.int(1, 4); const h2 = rng.int(1, 9 - h1);
          ta = h1 * 100 + t1 * 10 + u1;
          tb = h2 * 100 + t2 * 10 + u2;
        } else {
          const u1 = rng.int(0, 4); const u2 = rng.int(0, 9 - u1);
          const t1 = rng.int(0, 4); const t2 = rng.int(0, 9 - t1);
          const h1 = rng.int(2, 5); const h2 = rng.int(10 - h1, 7);
          ta = h1 * 100 + t1 * 10 + u1;
          tb = h2 * 100 + t2 * 10 + u2;
        }
      } else {
        // 받아올림 2회: 임의 세 자리 덧셈, 합이 999 이하면 허용
        ta = rng.int(100, 499);
        tb = rng.int(100, 499);
      }
      const tans = ta + tb;
      if (tans >= 101 && tans <= 999 && ta >= 100 && tb >= 100) {
        a = ta; b = tb; ans = tans; break;
      }
    }

    const expr: MathExpr = [
      txt(`${a} + ${b} = `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation: [txt(addExplain(a, b))],
    };
  },
};

// ── 2. add3-sub  세 자리 뺄셈 (받아내림) (fill-blanks)  난이도 2 ────
const add3Sub: SkillDef = {
  id: 'add3-sub',
  unitId: 'unitAdd3',
  difficulty: 2,
  title: '세 자리 수 뺄셈',
  note: '세 자리 수 - 세 자리 수(받아내림 있을 수 있음). 결과 ≥ 1. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number, ans: number;
    a = 543; b = 218; ans = 325;

    for (let tries = 0; tries < 300; tries++) {
      const ta = rng.int(200, 999);
      const tb = rng.int(100, ta - 1);
      const tans = ta - tb;
      if (tans >= 1 && tb >= 100) {
        a = ta; b = tb; ans = tans; break;
      }
    }

    const expr: MathExpr = [
      txt(`${a} - ${b} = `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation: [txt(subExplain(a, b))],
    };
  },
};

// ── 3. add3-round  몇백으로 어림 (choice)  난이도 1 ─────────────────
const add3Round: SkillDef = {
  id: 'add3-round',
  unitId: 'unitAdd3',
  difficulty: 1,
  title: '몇백으로 어림',
  note: '세 자리 수를 가장 가까운 몇백으로 어림(반올림). 4지선다.',
  minVariety: 9,
  generate(seed) {
    const rng = new RNG(seed);
    // 몇백 단위: 100~900
    const hundreds = rng.int(1, 8);
    // 십의 자리 기준 반올림: 1~49이면 버림, 50~99이면 올림
    const rem = rng.int(1, 99);
    const num = hundreds * 100 + rem;
    const rounded = rem >= 50 ? (hundreds + 1) * 100 : hundreds * 100;

    // 오답: 위/아래 백, +200
    const wrong1 = (hundreds + 1) * 100 === rounded ? hundreds * 100 : (hundreds + 1) * 100;
    const wrong2 = (hundreds - 1 >= 1) ? (hundreds - 1) * 100 : (hundreds + 2) * 100;
    const wrong3 = num; // 어림 안 한 값

    const answerVal = txc(`${rounded}`);
    const candidates: ChoiceValue[] = [txc(`${wrong1}`), txc(`${wrong2}`), txc(`${wrong3}`)];
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${num}을 몇백으로 어림하면 얼마인가요?`,
      expr: [txt(`${num}`)],
      choices,
      answerIndex,
      explanation: [
        txt(`몇백으로 어림할 때는 십의 자리 숫자를 봐요. ${num}의 십의 자리는 ${Math.floor(rem / 10)}이라 ${rem >= 50 ? '5와 같거나 커서 올림' : '5보다 작아서 버림'}하면 ${rounded}이에요.`),
      ],
    };
  },
};

// ── 4. add3-missing  □가 있는 덧뺄셈 역산 (fill-blanks)  난이도 2 ──
const add3Missing: SkillDef = {
  id: 'add3-missing',
  unitId: 'unitAdd3',
  difficulty: 2,
  title: '□가 있는 덧뺄셈 식',
  note: '□ + b = c 또는 a - □ = c 형태 역산. fill-blanks. □ ≥ 1.',
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴 0: □ + b = c → □ = c - b
    // 패턴 1: a - □ = c → □ = a - c
    // 패턴 2: a + □ = c → □ = c - a
    const pat = rng.int(0, 2);

    let promptStr: string;
    let expr: MathExpr;
    let answer: number;
    let explStr: string;

    if (pat === 0) {
      // □ + b = c
      let b = 123, c = 456, ans = 333;
      for (let tries = 0; tries < 300; tries++) {
        const tb = rng.int(100, 499);
        const tc = rng.int(tb + 1, 999);
        const tans = tc - tb;
        if (tans >= 1 && tans <= 999 && tb >= 100) {
          b = tb; c = tc; ans = tans; break;
        }
      }
      answer = ans;
      promptStr = `□ + ${b} = ${c}일 때, □에 알맞은 수를 구하세요.`;
      expr = [txt('□ = '), { kind: 'blank', slot: 0 }];
      explStr = `□에 ${b}를 더해서 ${c}가 되었어요. 그러니 전체 ${c}에서 ${b}를 빼면 □를 알 수 있어요. □ = ${c} - ${b} = ${ans}.`;
    } else if (pat === 1) {
      // a - □ = c
      let a = 543, c = 218, ans = 325;
      for (let tries = 0; tries < 300; tries++) {
        const ta = rng.int(200, 999);
        const tc = rng.int(1, ta - 100);
        const tans = ta - tc;
        if (tans >= 1 && tans <= 999 && ta >= 200) {
          a = ta; c = tc; ans = tans; break;
        }
      }
      answer = ans;
      promptStr = `${a} - □ = ${c}일 때, □에 알맞은 수를 구하세요.`;
      expr = [txt('□ = '), { kind: 'blank', slot: 0 }];
      explStr = `${a}에서 □를 빼서 ${c}가 남았어요. 빼낸 수는 처음 수에서 남은 수를 빼면 돼요. □ = ${a} - ${c} = ${ans}.`;
    } else {
      // a + □ = c
      let a = 234, c = 567, ans = 333;
      for (let tries = 0; tries < 300; tries++) {
        const ta = rng.int(100, 499);
        const tc = rng.int(ta + 1, 999);
        const tans = tc - ta;
        if (tans >= 1 && ta >= 100) {
          a = ta; c = tc; ans = tans; break;
        }
      }
      answer = ans;
      promptStr = `${a} + □ = ${c}일 때, □에 알맞은 수를 구하세요.`;
      expr = [txt('□ = '), { kind: 'blank', slot: 0 }];
      explStr = `${a}에 □를 더해서 ${c}가 되었어요. 그러니 전체 ${c}에서 ${a}를 빼면 □를 알 수 있어요. □ = ${c} - ${a} = ${ans}.`;
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

// ── 5. add3-word  덧뺄셈 문장제 (fill-blanks)  난이도 3 ─────────────
const add3Word: SkillDef = {
  id: 'add3-word',
  unitId: 'unitAdd3',
  difficulty: 3,
  word: true,
  title: '덧뺄셈 문장제',
  note: '세 자리 수 덧셈·뺄셈 모험 소재 문장제. 소재 4가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;
    let unit: string;

    if (pat === 0) {
      // 덧셈 문장제
      let a = 234, b = 312, ans = 546;
      for (let tries = 0; tries < 300; tries++) {
        const ta = rng.int(100, 499);
        const tb = rng.int(100, 499);
        const tans = ta + tb;
        if (tans >= 101 && tans <= 999) {
          a = ta; b = tb; ans = tans; break;
        }
      }
      unit = '개';
      answer = ans;
      prompt = `마법사가 마법 구슬 ${a}개를 가지고 있었어요. 모험을 마치고 ${b}개를 더 모았다면, 마법 구슬은 모두 몇 개인가요?`;
      explanation = [txt(`처음 ${a}개에 더 모은 ${b}개를 더해요. ${a} + ${b} = ${ans}이라 모두 ${ans}개예요.`)];
    } else if (pat === 1) {
      // 뺄셈 문장제
      let a = 543, b = 218, ans = 325;
      for (let tries = 0; tries < 300; tries++) {
        const ta = rng.int(200, 999);
        const tb = rng.int(100, ta - 1);
        const tans = ta - tb;
        if (tans >= 1) {
          a = ta; b = tb; ans = tans; break;
        }
      }
      unit = '개';
      answer = ans;
      prompt = `용사의 배낭에 화살이 ${a}개 있었어요. 전투에서 ${b}개를 사용했다면, 남은 화살은 몇 개인가요?`;
      explanation = [txt(`처음 ${a}개에서 사용한 ${b}개를 빼요. ${a} - ${b} = ${ans}이라 ${ans}개가 남아요.`)];
    } else if (pat === 2) {
      // 어림셈 활용 문장제
      const a = rng.int(100, 499);
      const b = rng.int(100, 499);
      const ans = a + b;
      // 어림값만 물어봄 (답은 정확한 합)
      unit = '원';
      answer = ans;
      prompt = `마법 약이 ${a}원, 회복 물약이 ${b}원이에요. 두 물약을 사면 모두 얼마인가요?`;
      explanation = [txt(`두 물약의 값을 더해요. ${a} + ${b} = ${ans}이라 모두 ${ans}원이에요.`)];
    } else {
      // 역산 활용 문장제: 전체에서 일부 알기
      let total = 750, part = 320, ans = 430;
      for (let tries = 0; tries < 300; tries++) {
        const ttotal = rng.int(300, 999);
        const tpart = rng.int(100, ttotal - 1);
        const tans = ttotal - tpart;
        if (tans >= 1) {
          total = ttotal; part = tpart; ans = tans; break;
        }
      }
      unit = '명';
      answer = ans;
      prompt = `성 안에 기사가 ${total}명 있었어요. 그 중 ${part}명은 붉은 갑옷을 입었다면, 나머지 기사는 몇 명인가요?`;
      explanation = [txt(`전체 ${total}명에서 붉은 갑옷 ${part}명을 빼면 나머지예요. ${total} - ${part} = ${ans}이라 ${ans}명이에요.`)];
    }

    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt(' ' + unit),
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
export const unitAdd3Skills: SkillDef[] = [
  add3Add,
  add3Sub,
  add3Round,
  add3Missing,
  add3Word,
];
