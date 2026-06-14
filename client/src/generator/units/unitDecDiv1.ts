/**
 * 단원: 소수의 나눗셈 (2022 개정교육과정 6-1 3단원)
 * 성취기준: (소수)÷(자연수)의 계산 원리를 이해하고, 소수의 나눗셈을 할 수 있다.
 *
 * 핵심 기법: 몫 q를 먼저 정하고 피제수 = q × n 으로 역산.
 *           정수 스케일 계산으로 부동소수점 오차 제거.
 */

import { RNG } from '../rng';
import { nj, ida } from '../josa';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;

/** 소수점 이하 자릿수 */
function decimalPlaces(v: number): number {
  if (!isFinite(v)) return 0;
  const s = v.toFixed(10).replace(/0+$/, '');
  const dot = s.indexOf('.');
  return dot < 0 ? 0 : s.length - dot - 1;
}

/**
 * 부동소수점 없이 소수 × 정수 계산.
 * 결과 = round(round(a × scale) × b) / scale
 */
function mulDecInt(a: number, b: number): number {
  const places = decimalPlaces(a);
  const scale = Math.pow(10, places);
  const aInt = Math.round(a * scale);
  return Math.round(aInt * b) / scale;
}

/** 깔끔한 소수 문자열 (trailing zero 없음) */
function fmtDec(v: number): string {
  return String(v);
}

// ── 1. ddiv1-basic : (소수 1자리) ÷ (자연수), 몫도 소수 1자리 ────
const ddiv1Basic: SkillDef = {
  id: 'ddiv1-basic',
  unitId: 'unitDecDiv1',
  title: '(소수 1자리) ÷ (자연수)',
  note: '몫 q를 1자리 소수(1.2~9.8)로 먼저 정하고, 피제수 = q × n 역산. n은 2~4. 몫도 소수 1자리.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    // 몫 q: 1자리 소수, 끝자리 ≠ 0 (1.2~9.8)
    let qInt = rng.int(12, 98);
    let guard = 0;
    while (qInt % 10 === 0 && guard < 200) { qInt = rng.int(12, 98); guard++; }
    const q = qInt / 10;

    // 나누는 수 n: 2~4
    const n = rng.int(2, 4);

    // 피제수 = q × n (정수 스케일로 계산)
    const dividend = mulDecInt(q, n);

    // dividendInt = dividend × 10 (정수 표현)
    const dividendInt = Math.round(dividend * 10);

    const explanation: MathExpr = [
      txt(`${nj(fmtDec(dividend), '은/는')} ${dividendInt}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`이에요. `),
      txt(`${dividendInt} ÷ ${n} = ${dividendInt / n}이므로 `),
      txt(`${fmtDec(dividend)} ÷ ${nj(n, '은/는')} ${dividendInt / n}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`인 ${ida(fmtDec(q))}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${fmtDec(dividend)} ÷ ${n}`)],
      answer: q,
      explanation,
    };
  },
};

// ── 2. ddiv1-carry : 몫이 두 자리 소수 ─────────────────────────────
const ddiv1Carry: SkillDef = {
  id: 'ddiv1-carry',
  unitId: 'unitDecDiv1',
  title: '몫이 소수 두 자리인 나눗셈',
  note: '몫 q를 2자리 소수(0.25~9.75, 끝자리≠0)로 먼저 정하고 피제수 역산. n은 2~6.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 몫 q: 2자리 소수, 끝자리(100분의 1 자리) ≠ 0, 0.25~9.75
    let qInt = rng.int(25, 975); // /100
    let guard = 0;
    while (qInt % 10 === 0 && guard < 200) { qInt = rng.int(25, 975); guard++; }
    const q = qInt / 100;

    // 나누는 수 n: 2~6
    const n = rng.int(2, 6);

    // 피제수 = q × n
    const dividend = mulDecInt(q, n);

    // 피제수가 너무 크면 재시도
    guard = 0;
    let finalQ = q;
    let finalN = n;
    let finalDividend = dividend;

    while (finalDividend > 99 && guard < 200) {
      let newQInt = rng.int(25, 499);
      while (newQInt % 10 === 0) newQInt = rng.int(25, 499);
      const newN = rng.int(2, 6);
      const newQ = newQInt / 100;
      const newDividend = mulDecInt(newQ, newN);
      if (newDividend <= 99) {
        finalQ = newQ;
        finalN = newN;
        finalDividend = newDividend;
        break;
      }
      guard++;
    }
    // 극단적 fallback
    if (finalDividend > 99) { finalQ = 1.25; finalN = 4; finalDividend = mulDecInt(1.25, 4); }

    // 피제수의 정수 표현 (소수 1자리 또는 2자리일 수 있음)
    const dividendPlaces = decimalPlaces(finalDividend);
    const dividendScale = Math.pow(10, dividendPlaces);
    const dividendInt = Math.round(finalDividend * dividendScale);

    const explanation: MathExpr = [
      txt(`${nj(fmtDec(finalDividend), '은/는')} ${dividendInt}의 `),
      { kind: 'frac', n: 1, d: dividendScale },
      txt(`이에요. `),
      txt(`${dividendInt} ÷ ${finalN} = ${dividendInt / finalN}이므로 `),
      txt(`${fmtDec(finalDividend)} ÷ ${finalN}의 몫은 ${dividendInt / finalN}의 `),
      { kind: 'frac', n: 1, d: dividendScale },
      txt(`인 ${ida(fmtDec(finalQ))}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${fmtDec(finalDividend)} ÷ ${finalN}`)],
      answer: finalQ,
      explanation,
    };
  },
};

// ── 3. ddiv1-zero : 몫의 소수 부분에 0이 들어가는 경우 ──────────────
const ddiv1Zero: SkillDef = {
  id: 'ddiv1-zero',
  unitId: 'unitDecDiv1',
  title: '몫에 0이 들어가는 나눗셈',
  note: '몫 q = a.0b 형태(예: 4.08, 2.05). 피제수 = q × n 역산. n은 2~5.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 몫 q = a.0b : 정수 부분 a(1~9), 소수 두 번째 자리 b(1~9)
    // qInt = a * 100 + b  (예: a=4, b=8 → q=4.08, qInt=408)
    const a = rng.int(1, 9);
    const b = rng.int(1, 9);
    const qInt = a * 100 + b; // a.0b × 100
    const q = qInt / 100;     // a.0b

    // 나누는 수 n: 2~5
    const n = rng.int(2, 5);

    // 피제수 = q × n
    const dividend = mulDecInt(q, n);

    // 피제수의 정수 표현
    const dividendPlaces = decimalPlaces(dividend);
    const dividendScale = Math.pow(10, dividendPlaces);
    const dividendInt = Math.round(dividend * dividendScale);

    const explanation: MathExpr = [
      txt(`${fmtDec(dividend)} ÷ ${nj(n, '을/를')} 세로로 계산할 때, `),
      txt(`수를 하나 내려도 나눌 수 없으면 몫에 0을 써요. `),
      txt(`${dividendInt} ÷ ${n} = ${dividendInt / n}이고, `),
      txt(`${nj(fmtDec(dividend), '은/는')} ${dividendInt}의 `),
      { kind: 'frac', n: 1, d: dividendScale },
      txt(`이므로 몫은 ${ida(fmtDec(q))}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${fmtDec(dividend)} ÷ ${n}`)],
      answer: q,
      explanation,
    };
  },
};

// ── 4. ddiv1-natnat : (자연수) ÷ (자연수)의 몫을 소수로 ─────────────
const ddiv1NatNat: SkillDef = {
  id: 'ddiv1-natnat',
  minVariety: 25,
  unitId: 'unitDecDiv1',
  title: '(자연수) ÷ (자연수)의 몫을 소수로',
  note: '나누어떨어지지 않는 (자연수)÷(자연수)를 소수(1~2자리)로 나타낸다. 분모가 2,4,5,8,10,20,25 계열.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 나누어떨어지지 않고 소수 1~2자리에서 끝나는 쌍만 허용
    // 분모(n)가 2,4,5,8,10,20,25 계열이면 유한소수.
    // 미리 검증된 (피제수, 나누는수) 쌍 테이블에서 랜덤 선택.
    const pairs: Array<{ dividend: number; divisor: number; answer: number }> = [
      { dividend: 7,  divisor: 2,  answer: 3.5  },
      { dividend: 9,  divisor: 2,  answer: 4.5  },
      { dividend: 3,  divisor: 2,  answer: 1.5  },
      { dividend: 5,  divisor: 2,  answer: 2.5  },
      { dividend: 11, divisor: 2,  answer: 5.5  },
      { dividend: 13, divisor: 2,  answer: 6.5  },
      { dividend: 7,  divisor: 4,  answer: 1.75 },
      { dividend: 9,  divisor: 4,  answer: 2.25 },
      { dividend: 3,  divisor: 4,  answer: 0.75 },
      { dividend: 11, divisor: 4,  answer: 2.75 },
      { dividend: 13, divisor: 4,  answer: 3.25 },
      { dividend: 15, divisor: 4,  answer: 3.75 },
      { dividend: 7,  divisor: 5,  answer: 1.4  },
      { dividend: 9,  divisor: 5,  answer: 1.8  },
      { dividend: 3,  divisor: 5,  answer: 0.6  },
      { dividend: 11, divisor: 5,  answer: 2.2  },
      { dividend: 13, divisor: 5,  answer: 2.6  },
      { dividend: 14, divisor: 5,  answer: 2.8  },
      { dividend: 6,  divisor: 8,  answer: 0.75 },
      { dividend: 10, divisor: 8,  answer: 1.25 },
      { dividend: 14, divisor: 8,  answer: 1.75 },
      { dividend: 18, divisor: 8,  answer: 2.25 },
      { dividend: 22, divisor: 8,  answer: 2.75 },
      { dividend: 7,  divisor: 10, answer: 0.7  },
      { dividend: 9,  divisor: 10, answer: 0.9  },
      { dividend: 3,  divisor: 20, answer: 0.15 },
      { dividend: 7,  divisor: 20, answer: 0.35 },
      { dividend: 9,  divisor: 20, answer: 0.45 },
      { dividend: 3,  divisor: 25, answer: 0.12 },
      { dividend: 7,  divisor: 25, answer: 0.28 },
    ];

    const chosen = rng.pick(pairs);
    const { dividend, divisor, answer } = chosen;

    const explanation: MathExpr = [
      txt(`${dividend} ÷ ${nj(divisor, '은/는')} 나누어떨어지지 않으므로 소수로 나타내요. `),
      txt(`${dividend} ÷ ${divisor} = `),
      { kind: 'frac', n: dividend, d: divisor },
      txt(`이고, 분모를 10 또는 100으로 바꾸면 `),
      txt(`${ida(fmtDec(answer))}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '몫을 소수로 나타내세요.',
      expr: [txt(`${dividend} ÷ ${divisor}`)],
      answer,
      explanation,
    };
  },
};

// ── 5. ddiv1-point : 자릿수 추론 (4지선다) ──────────────────────────
const ddiv1Point: SkillDef = {
  id: 'ddiv1-point',
  unitId: 'unitDecDiv1',
  title: '소수점 위치 추론',
  note: '정수 나눗셈 결과를 이용해 소수 나눗셈 결과의 소수점 위치를 고른다.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 정수 나눗셈 aBase ÷ n = qBase (나누어떨어지는 쌍)
    // aBase: 100~999 (3자리), n: 2~9, qBase = aBase / n (정수)
    let n = rng.int(2, 9);
    // qBase를 먼저 정하고 aBase를 역산
    let qBase = rng.int(10, 99); // 2자리 정수 몫
    let aBase = qBase * n;
    // aBase가 3자리가 아닐 수도 있으므로 조정
    let guard = 0;
    while ((aBase < 100 || aBase > 999) && guard < 200) {
      n = rng.int(2, 9);
      qBase = rng.int(10, 99);
      aBase = qBase * n;
      guard++;
    }
    if (aBase < 100 || aBase > 999) { n = 3; qBase = 208; aBase = 624; }

    // 소수 문제: aBase ÷ 100 = aDec, 정답 = qBase / 100
    const aDec = aBase / 100;
    const correctAnswer = qBase / 100;

    // 보기 후보: 소수점을 다른 위치에 놓은 값들
    const candidateValues = [
      qBase,          // 소수점 없음 (함정)
      qBase / 10,     // /10 (함정)
      qBase / 100,    // /100 = 정답
      qBase / 1000,   // /1000 (함정)
      qBase * 10,     // ×10 (함정)
      qBase * 100,    // ×100 (함정)
    ];

    const answerCV: ChoiceValue = { kind: 'decimal', v: correctAnswer };

    const seen = new Set<number>([correctAnswer]);
    const candidates: ChoiceValue[] = [];
    for (const v of candidateValues) {
      if (v === correctAnswer) continue;
      if (seen.has(v)) continue;
      if (v <= 0) continue;
      seen.add(v);
      candidates.push({ kind: 'decimal', v });
      if (candidates.length >= 6) break;
    }

    if (candidates.length < 3) {
      const extra = [qBase / 10000, qBase * 1000];
      for (const v of extra) {
        if (v <= 0 || seen.has(v)) continue;
        seen.add(v);
        candidates.push({ kind: 'decimal', v });
        if (candidates.length >= 6) break;
      }
    }

    const { choices, answerIndex } = buildChoices(answerCV, candidates, rng);

    const explanation: MathExpr = [
      txt(`${aBase} ÷ ${n} = ${qBase}임을 이용해요. `),
      txt(`${nj(fmtDec(aDec), '은/는')} ${aBase}의 `),
      { kind: 'frac', n: 1, d: 100 },
      txt(`이므로, ${fmtDec(aDec)} ÷ ${n}의 몫은 ${qBase}의 `),
      { kind: 'frac', n: 1, d: 100 },
      txt(`인 ${ida(fmtDec(correctAnswer))}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${aBase} ÷ ${n} = ${nj(qBase, '을/를')} 이용하여 ${fmtDec(aDec)} ÷ ${nj(n, '을/를')} 구하세요.`,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 6. ddiv1-word : 소수의 나눗셈 문장제 ───────────────────────────
const ddiv1Word: SkillDef = {
  id: 'ddiv1-word',
  unitId: 'unitDecDiv1',
  title: '소수의 나눗셈 문장제',
  note: '소수의 나눗셈을 활용하는 실생활 문장제. 소재 5가지 이상.',
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
      // 끈: 길이 N.d m를 k명이 똑같이 나누기
      // 몫 q 먼저 (1자리 소수), 나누는 수 n: 2~5
      let qInt = rng.int(12, 49);
      while (qInt % 10 === 0) qInt = rng.int(12, 49);
      const q = qInt / 10;
      const n = rng.int(2, 5);
      const totalLen = mulDecInt(q, n);
      answer = q;
      unit = 'm';
      prompt = `끈 ${fmtDec(totalLen)} m를 ${n}명이 똑같이 나누면 한 사람이 갖는 끈은 몇 m인가요?`;
      const dividendInt = Math.round(totalLen * 10);
      explanation = [
        txt(`${fmtDec(totalLen)} m를 ${n}명이 나누므로 `),
        txt(`${fmtDec(totalLen)} ÷ ${nj(n, '을/를')} 계산해요. `),
        txt(`${dividendInt} ÷ ${n} = ${dividendInt / n}이고 `),
        txt(`${nj(fmtDec(totalLen), '은/는')} ${dividendInt}의 `),
        { kind: 'frac', n: 1, d: 10 },
        txt(`이므로 한 사람의 끈은 ${fmtDec(q)} m예요.`),
      ];

    } else if (templateIdx === 1) {
      // 우유: 총량 N.d L를 k컵에 똑같이 나누기
      let qInt = rng.int(8, 29);
      while (qInt % 10 === 0) qInt = rng.int(8, 29);
      const q = qInt / 10;
      const n = rng.int(2, 6);
      const total = mulDecInt(q, n);
      answer = q;
      unit = 'L';
      prompt = `우유 ${fmtDec(total)} L를 ${n}컵에 똑같이 나누어 담으면 한 컵에 담기는 우유는 몇 L인가요?`;
      const dividendInt = Math.round(total * 10);
      explanation = [
        txt(`${fmtDec(total)} L를 ${n}컵에 나누므로 `),
        txt(`${fmtDec(total)} ÷ ${nj(n, '을/를')} 계산해요. `),
        txt(`${dividendInt} ÷ ${n} = ${dividendInt / n}이고 `),
        txt(`${nj(fmtDec(total), '은/는')} ${dividendInt}의 `),
        { kind: 'frac', n: 1, d: 10 },
        txt(`이므로 한 컵에 담기는 우유는 ${fmtDec(q)} L예요.`),
      ];

    } else if (templateIdx === 2) {
      // 쌀: N.d kg을 k봉지에 똑같이 나누기
      let qInt = rng.int(11, 39);
      while (qInt % 10 === 0) qInt = rng.int(11, 39);
      const q = qInt / 10;
      const n = rng.int(2, 5);
      const total = mulDecInt(q, n);
      answer = q;
      unit = 'kg';
      prompt = `쌀 ${fmtDec(total)} kg을 ${n}봉지에 똑같이 나누어 담으면 한 봉지에 담기는 쌀은 몇 kg인가요?`;
      const dividendInt = Math.round(total * 10);
      explanation = [
        txt(`${fmtDec(total)} kg을 ${n}봉지에 나누므로 `),
        txt(`${fmtDec(total)} ÷ ${nj(n, '을/를')} 계산해요. `),
        txt(`${dividendInt} ÷ ${n} = ${dividendInt / n}이고 `),
        txt(`${nj(fmtDec(total), '은/는')} ${dividendInt}의 `),
        { kind: 'frac', n: 1, d: 10 },
        txt(`이므로 한 봉지에 담기는 쌀은 ${fmtDec(q)} kg이에요.`),
      ];

    } else if (templateIdx === 3) {
      // 색 테이프: N.dd m를 k도막으로 똑같이 자르기 (2자리 소수 몫)
      let qInt = rng.int(25, 99);
      while (qInt % 10 === 0) qInt = rng.int(25, 99);
      const q = qInt / 100;
      const n = rng.int(2, 5);
      const total = mulDecInt(q, n);
      answer = q;
      unit = 'm';
      prompt = `색 테이프 ${fmtDec(total)} m를 ${n}도막으로 똑같이 자르면 한 도막은 몇 m인가요?`;
      const dividendPlaces = decimalPlaces(total);
      const dividendScale = Math.pow(10, dividendPlaces);
      const dividendInt = Math.round(total * dividendScale);
      explanation = [
        txt(`${fmtDec(total)} m를 ${n}도막으로 자르므로 `),
        txt(`${fmtDec(total)} ÷ ${nj(n, '을/를')} 계산해요. `),
        txt(`${dividendInt} ÷ ${n} = ${dividendInt / n}이고 `),
        txt(`${nj(fmtDec(total), '은/는')} ${dividendInt}의 `),
        { kind: 'frac', n: 1, d: dividendScale },
        txt(`이므로 한 도막은 ${fmtDec(q)} m예요.`),
      ];

    } else if (templateIdx === 4) {
      // 물: 수도에서 나오는 물 N.d L를 k개의 물병에 (몫에 0 포함 케이스)
      // 몫 q = a.0b 형태 사용
      const a = rng.int(1, 4);
      const b = rng.int(1, 9);
      const q = (a * 100 + b) / 100; // a.0b
      const n = rng.int(2, 4);
      const total = mulDecInt(q, n);
      answer = q;
      unit = 'L';
      prompt = `물 ${fmtDec(total)} L를 ${n}개의 물병에 똑같이 나누어 담으면 한 병에 담기는 물은 몇 L인가요?`;
      const dividendPlaces = decimalPlaces(total);
      const dividendScale = Math.pow(10, dividendPlaces);
      const dividendInt = Math.round(total * dividendScale);
      explanation = [
        txt(`${fmtDec(total)} L를 ${n}개로 나누므로 `),
        txt(`${fmtDec(total)} ÷ ${nj(n, '을/를')} 계산해요. `),
        txt(`나누는 도중 수를 내려도 나눌 수 없으면 몫에 0을 써요. `),
        txt(`${dividendInt} ÷ ${n} = ${dividendInt / n}이므로 `),
        txt(`한 병에 ${fmtDec(q)} L씩 담겨요.`),
      ];

    } else {
      // 운동: 달리기 총 거리 N.d km를 k일로 나누기
      let qInt = rng.int(13, 49);
      while (qInt % 10 === 0) qInt = rng.int(13, 49);
      const q = qInt / 10;
      const n = rng.int(2, 5);
      const total = mulDecInt(q, n);
      answer = q;
      unit = 'km';
      prompt = `${n}일 동안 매일 같은 거리를 달려 모두 ${fmtDec(total)} km를 달렸어요. 하루에 달린 거리는 몇 km인가요?`;
      const dividendInt = Math.round(total * 10);
      explanation = [
        txt(`${fmtDec(total)} km를 ${n}일로 나누므로 `),
        txt(`${fmtDec(total)} ÷ ${nj(n, '을/를')} 계산해요. `),
        txt(`${dividendInt} ÷ ${n} = ${dividendInt / n}이고 `),
        txt(`${nj(fmtDec(total), '은/는')} ${dividendInt}의 `),
        { kind: 'frac', n: 1, d: 10 },
        txt(`이므로 하루에 달린 거리는 ${fmtDec(q)} km예요.`),
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

export const unitDecDiv1Skills: SkillDef[] = [
  ddiv1Basic,
  ddiv1Carry,
  ddiv1Zero,
  ddiv1NatNat,
  ddiv1Point,
  ddiv1Word,
];
