/**
 * 단원: 소수의 나눗셈 (2022 개정교육과정 6-2 2단원: ÷소수)
 * 성취기준: 소수의 나눗셈의 계산 원리를 이해하고, 소수의 나눗셈을 할 수 있다.
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;

/** 소수를 깔끔한 문자열로 표시 (trailing zero 없음) */
function fmtDec(v: number): string {
  return String(v);
}



// ── 1. ddiv2-same : (소수 1자리) ÷ (소수 1자리), 몫은 자연수 ─────────────
const ddiv2Same: SkillDef = {
  id: 'ddiv2-same',
  unitId: 'unitDecDiv2',
  title: '(소수 1자리) ÷ (소수 1자리)',
  note: '자릿수 같은 소수끼리 나누기. 몫은 2~40의 자연수. 10배 변환 원리 강조.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    // 몫을 먼저 정하고 역산: quotient = 2~40 (자연수)
    // 제수(divisor): 1자리 소수. 1 ≤ divisorInt ≤ 9 (0.1~0.9)
    // 피제수(dividend) = quotient × divisor, 두 자리까지만 허용 → dividend ≤ 9.9
    let quotient: number;
    let divisorInt: number;
    let dividend: number;
    let guard = 0;
    do {
      quotient = rng.int(2, 40);
      divisorInt = rng.int(1, 9); // 0.1~0.9
      // dividend = quotient × (divisorInt/10) — 정수 스케일 계산
      const rawDividendInt = quotient * divisorInt; // × 10 → 실제 × 0.1씩
      // rawDividendInt / 10 = dividend
      dividend = rawDividendInt / 10;
      guard++;
    } while ((dividend > 9.9 || dividend <= 0 || Math.round(dividend * 10) % 10 === 0) && guard < 300);

    // fallback
    if (dividend > 9.9 || dividend <= 0) {
      quotient = 5; divisorInt = 4; dividend = 2.0;
      // 2.0 끝자리 0이라 fallback 다시
      quotient = 21; divisorInt = 4; dividend = 8.4;
    }

    // 검증: dividendInt / divisorInt 가 quotient 여야 함
    let dividendInt = Math.round(dividend * 10);
    if (dividendInt % divisorInt !== 0) {
      // fallback: 8.4 ÷ 0.4 = 21
      quotient = 21; divisorInt = 4; dividend = 8.4;
      dividendInt = Math.round(dividend * 10);
    }
    const finalDividend = dividend;
    const finalDivisor = divisorInt / 10;
    const finalDivisorInt = divisorInt;
    const finalDividendInt = dividendInt;
    const finalQuotient = quotient;

    const explanation: MathExpr = [
      txt(`나누는 수와 나누어지는 수에 똑같이 10배를 하면 몫이 같아요. `),
      txt(`${fmtDec(finalDividend)} ÷ ${fmtDec(finalDivisor)} = ${finalDividendInt} ÷ ${finalDivisorInt} = ${finalQuotient}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${fmtDec(finalDividend)} ÷ ${fmtDec(finalDivisor)}`)],
      answer: finalQuotient,
      explanation,
    };
  },
};

// ── 2. ddiv2-diff : (소수 2자리) ÷ (소수 1자리), 몫은 소수 1자리 ─────────
const ddiv2Diff: SkillDef = {
  id: 'ddiv2-diff',
  unitId: 'unitDecDiv2',
  title: '(소수 2자리) ÷ (소수 1자리)',
  note: '몫이 소수 한 자리인 나눗셈. 예: 7.82÷3.4=2.3. 100배/10배 변환 원리.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 몫을 먼저 정하고 역산
    // 몫: 소수 1자리 1.1~9.9, 끝자리 ≠ 0
    // 제수: 소수 1자리 0.1~9.9, 끝자리 ≠ 0
    // 피제수 = 몫 × 제수 → 소수 2자리여야 함 (끝자리 ≠ 0)
    let quotientInt: number; // 몫 × 10
    let divisorInt: number;  // 제수 × 10
    let dividendInt: number; // 피제수 × 100
    let guard = 0;
    do {
      quotientInt = rng.int(11, 99);
      while (quotientInt % 10 === 0) quotientInt = rng.int(11, 99);
      divisorInt = rng.int(1, 99);
      while (divisorInt % 10 === 0) divisorInt = rng.int(1, 99);
      // 피제수 × 100 = (몫 × 10) × (제수 × 10) / 10 = 몫Int × 제수Int / 10
      // 피제수 = (quotientInt × divisorInt) / 100
      // 피제수 × 100 = quotientInt × divisorInt / 1 ... 아니라
      // dividend = quotient × divisor
      //          = (quotientInt/10) × (divisorInt/10)
      //          = quotientInt × divisorInt / 100
      // dividendInt (× 100) = quotientInt × divisorInt
      dividendInt = quotientInt * divisorInt;
      // 피제수가 소수 2자리여야: dividendInt % 10 ≠ 0 (끝자리 ≠ 0)
      // 그리고 피제수 값이 합리적 범위 (0.01~99.99)
      guard++;
    } while ((dividendInt % 10 === 0 || dividendInt > 9999 || dividendInt < 10) && guard < 300);

    if (dividendInt > 9999 || dividendInt < 10 || dividendInt % 10 === 0) {
      // fallback: 7.82 ÷ 3.4 = 2.3
      quotientInt = 23; divisorInt = 34; dividendInt = 23 * 34; // 782
    }

    const finalDividend = dividendInt / 100;
    const finalDivisor = divisorInt / 10;
    const finalQuotient = quotientInt / 10;

    // 해설: 피제수×100, 제수×10 → 피제수×10 / 제수 (같은 비율)
    // 실제로는 10배 곱해서 정수나눗셈: (dividendInt/10) ÷ divisorInt = quotientInt/10
    const dividendInt10 = dividendInt / 10; // 피제수 × 10 (소수 1자리)
    // 100배, 10배 변환 설명
    const explanation: MathExpr = [
      txt(`나누는 수와 나누어지는 수에 똑같이 10배를 하면 몫이 같아요. `),
      txt(`${fmtDec(finalDividend)} ÷ ${fmtDec(finalDivisor)} = ${fmtDec(dividendInt10)} ÷ ${divisorInt} = ${fmtDec(finalQuotient)}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${fmtDec(finalDividend)} ÷ ${fmtDec(finalDivisor)}`)],
      answer: finalQuotient,
      explanation,
    };
  },
};

// ── 3. ddiv2-nat : (자연수) ÷ (소수), 몫은 자연수 ───────────────────────
const ddiv2Nat: SkillDef = {
  id: 'ddiv2-nat',
  unitId: 'unitDecDiv2',
  title: '(자연수) ÷ (소수)',
  note: '자연수를 소수로 나누기. 몫은 자연수. 예: 9÷1.5=6, 14÷3.5=4.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 몫을 먼저 정하고 역산
    // 몫: 2~20 자연수
    // 제수: 소수 1자리 0.1~9.9, 끝자리 ≠ 0
    // 피제수 = 몫 × 제수 → 자연수여야 함
    // divisor = divisorInt/10, dividend = quotient × divisorInt/10
    // dividend가 자연수 → quotient × divisorInt % 10 = 0
    let quotient: number;
    let divisorInt: number;
    let dividend: number;
    let guard = 0;
    do {
      quotient = rng.int(2, 20);
      divisorInt = rng.int(1, 99);
      while (divisorInt % 10 === 0) divisorInt = rng.int(1, 99);
      // quotient × divisorInt / 10 이 자연수 → quotient × divisorInt % 10 === 0
      // divisorInt 끝자리 ≠ 0이므로 quotient가 10의 배수이거나,
      // 혹은 quotient × (divisorInt % 10) % 10 === 0 이어야 함
      const raw = quotient * divisorInt;
      dividend = raw / 10;
      guard++;
    } while ((dividend !== Math.floor(dividend) || dividend > 100 || dividend < 2) && guard < 400);

    if (dividend !== Math.floor(dividend) || dividend > 100 || dividend < 2) {
      // fallback: 9 ÷ 1.5 = 6
      quotient = 6; divisorInt = 15; dividend = 9;
    }

    const finalDividend = Math.round(dividend);
    const finalDivisor = divisorInt / 10;
    const finalQuotient = quotient;
    // 10배 변환: dividend × 10 / divisorInt = quotient
    const dividendInt10 = finalDividend * 10;

    const explanation: MathExpr = [
      txt(`나누는 수와 나누어지는 수에 똑같이 10배를 하면 몫이 같아요. `),
      txt(`${finalDividend} ÷ ${fmtDec(finalDivisor)} = ${dividendInt10} ÷ ${divisorInt} = ${finalQuotient}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${finalDividend} ÷ ${fmtDec(finalDivisor)}`)],
      answer: finalQuotient,
      explanation,
    };
  },
};

// ── 4. ddiv2-round : 몫을 반올림하여 나타내기 ────────────────────────────
const ddiv2Round: SkillDef = {
  id: 'ddiv2-round',
  unitId: 'unitDecDiv2',
  title: '몫을 반올림하여 나타내기',
  note: '나누어떨어지지 않는 나눗셈에서 몫을 반올림. 반올림 자리는 첫째/둘째 소수 자리 랜덤.',
  difficulty: 3,
  generate(seed) {
    const rng = new RNG(seed);

    // 나누어떨어지지 않는 (자연수) ÷ (자연수) 쌍 선택
    // 피제수: 2~50, 제수: 2~15, 두 수 서로소가 아닌 것도 포함하되 나누어떨어지지 않아야
    let a: number, b: number;
    let guard = 0;
    do {
      a = rng.int(2, 50);
      b = rng.int(2, 15);
      guard++;
    } while ((a % b === 0 || b === 1 || a === b) && guard < 300);

    if (a % b === 0 || b === 1) {
      // fallback: 13 ÷ 7
      a = 13; b = 7;
    }

    // 반올림 자리: 0 = 소수 첫째 자리, 1 = 소수 둘째 자리
    const roundPlace = rng.int(0, 1); // 0: 첫째, 1: 둘째

    let roundedAnswer: number;
    let placeStr: string;

    if (roundPlace === 0) {
      // 소수 첫째 자리까지: 소수 둘째 자리에서 반올림
      // roundedAnswer = Math.round((a × 100) / b / 10) / 10
      // = Math.round(a × 10 / b) / 10  (정수 연산)
      const numerator = a * 10; // a × 10
      roundedAnswer = Math.round(numerator / b) / 10;
      placeStr = '소수 첫째 자리';
    } else {
      // 소수 둘째 자리까지: 소수 셋째 자리에서 반올림
      // roundedAnswer = Math.round((a × 1000) / b / 10) / 100
      // = Math.round(a × 100 / b) / 100
      const numerator = a * 100;
      roundedAnswer = Math.round(numerator / b) / 100;
      placeStr = '소수 둘째 자리';
    }

    // 검증: roundedAnswer > 0 이고 유한 정수 스케일
    if (!isFinite(roundedAnswer) || roundedAnswer <= 0) {
      a = 13; b = 7;
      const numerator = a * 10;
      roundedAnswer = Math.round(numerator / b) / 10;
      placeStr = '소수 첫째 자리';
    }

    const explanation: MathExpr = [
      txt(`${a} ÷ ${nj(b, '을/를')} 계산하면 나누어떨어지지 않아요. `),
      txt(`${placeStr}까지 나타내려면 한 자리 아래에서 반올림해요. `),
      roundPlace === 0
        ? txt(`${a} × 10 = ${a * 10}, ${a * 10} ÷ ${b} ≈ ${Math.round((a * 10) / b)}이므로 `)
        : txt(`${a} × 100 = ${a * 100}, ${a * 100} ÷ ${b} ≈ ${Math.round((a * 100) / b)}이므로 `),
      txt(`반올림하면 약 ${fmtDec(roundedAnswer)}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `${a} ÷ ${b}의 몫을 반올림하여 ${placeStr}까지 나타내세요.`,
      answer: roundedAnswer,
      explanation,
    };
  },
};

// ── 5. ddiv2-share : 나누어 주고 남는 양 (몫은 자연수, fill-blanks) ────────
const ddiv2Share: SkillDef = {
  id: 'ddiv2-share',
  unitId: 'unitDecDiv2',
  title: '나누어 주고 남는 양',
  note: '소수 총량을 자연수 단위로 나눌 때 몇 묶음이 가능한지 (자연수 몫). 남는 양도 해설.',
  difficulty: 3,
  generate(seed) {
    const rng = new RNG(seed);

    type Template = {
      prompt: string;
      expr: MathExpr;
      blankAnswers: number[];
      explanation: MathExpr;
    };

    // 소재 템플릿 목록 — 총량(소수), 단위 용량(자연수 or 소수 1자리)
    // 몫은 자연수, 나머지 > 0 보장
    const templates: (() => Template)[] = [
      () => {
        // 물 총량 ÷ 한 병 용량 → 몇 병
        // 총량: 소수 1자리 (divisorInt/10 × quotient + remainder/10)
        // 한 병: 자연수 L (2~5)
        const perBottle = rng.int(2, 5);
        const quotient = rng.int(2, 8);
        // remainder: 0.1~(perBottle-0.1) 범위에서 0이 아닌 소수 1자리
        let remInt = rng.int(1, perBottle * 10 - 1);
        while (remInt % 10 === 0) remInt = rng.int(1, perBottle * 10 - 1);
        // totalInt × 10: quotient × perBottle × 10 + remInt
        const totalInt10 = quotient * perBottle * 10 + remInt;
        const total = totalInt10 / 10;
        const remainder = remInt / 10;
        return {
          prompt: `물 ${fmtDec(total)} L를 한 병에 ${perBottle} L씩 담으면 몇 병까지 담을 수 있나요?`,
          expr: [{ kind: 'blank', slot: 0 }] as MathExpr,
          blankAnswers: [quotient],
          explanation: [
            txt(`${fmtDec(total)} ÷ ${nj(perBottle, '을/를')} 계산해요. `),
            txt(`${perBottle} × ${quotient} = ${perBottle * quotient}이고, `),
            txt(`${fmtDec(total)} - ${perBottle * quotient} = ${fmtDec(remainder)}이므로 `),
            txt(`${quotient}병까지 담을 수 있고 ${fmtDec(remainder)} L가 남아요.`),
          ],
        };
      },
      () => {
        // 끈 총량 ÷ 한 도막 길이 → 몇 도막
        const perPiece = rng.int(2, 4); // m
        const quotient = rng.int(2, 8);
        let remInt = rng.int(1, perPiece * 10 - 1);
        while (remInt % 10 === 0) remInt = rng.int(1, perPiece * 10 - 1);
        const totalInt10 = quotient * perPiece * 10 + remInt;
        const total = totalInt10 / 10;
        const remainder = remInt / 10;
        return {
          prompt: `끈 ${fmtDec(total)} m를 한 도막에 ${perPiece} m씩 자르면 몇 도막을 만들 수 있나요?`,
          expr: [{ kind: 'blank', slot: 0 }] as MathExpr,
          blankAnswers: [quotient],
          explanation: [
            txt(`${fmtDec(total)} ÷ ${nj(perPiece, '을/를')} 계산해요. `),
            txt(`${perPiece} × ${quotient} = ${perPiece * quotient}이고, `),
            txt(`${fmtDec(total)} - ${perPiece * quotient} = ${fmtDec(remainder)}이므로 `),
            txt(`${quotient}도막을 만들 수 있고 ${fmtDec(remainder)} m가 남아요.`),
          ],
        };
      },
      () => {
        // 주스 총량 ÷ 한 잔 용량 → 몇 잔
        const perCup = rng.int(2, 3); // L
        const quotient = rng.int(2, 7);
        let remInt = rng.int(1, perCup * 10 - 1);
        while (remInt % 10 === 0) remInt = rng.int(1, perCup * 10 - 1);
        const totalInt10 = quotient * perCup * 10 + remInt;
        const total = totalInt10 / 10;
        const remainder = remInt / 10;
        return {
          prompt: `주스 ${fmtDec(total)} L를 한 잔에 ${perCup} L씩 나누어 주면 몇 잔까지 줄 수 있나요?`,
          expr: [{ kind: 'blank', slot: 0 }] as MathExpr,
          blankAnswers: [quotient],
          explanation: [
            txt(`${fmtDec(total)} ÷ ${nj(perCup, '을/를')} 계산해요. `),
            txt(`${perCup} × ${quotient} = ${perCup * quotient}이고, `),
            txt(`${fmtDec(total)} - ${perCup * quotient} = ${fmtDec(remainder)}이므로 `),
            txt(`${quotient}잔까지 줄 수 있고 ${fmtDec(remainder)} L가 남아요.`),
          ],
        };
      },
      () => {
        // 철사 ÷ 한 조각 길이 → 몇 조각
        const perPiece = rng.int(2, 5);
        const quotient = rng.int(2, 8);
        let remInt = rng.int(1, perPiece * 10 - 1);
        while (remInt % 10 === 0) remInt = rng.int(1, perPiece * 10 - 1);
        const totalInt10 = quotient * perPiece * 10 + remInt;
        const total = totalInt10 / 10;
        const remainder = remInt / 10;
        return {
          prompt: `철사 ${fmtDec(total)} m를 한 조각에 ${perPiece} m씩 자르면 몇 조각을 만들 수 있나요?`,
          expr: [{ kind: 'blank', slot: 0 }] as MathExpr,
          blankAnswers: [quotient],
          explanation: [
            txt(`${fmtDec(total)} ÷ ${nj(perPiece, '을/를')} 계산해요. `),
            txt(`${perPiece} × ${quotient} = ${perPiece * quotient}이고, `),
            txt(`${fmtDec(total)} - ${perPiece * quotient} = ${fmtDec(remainder)}이므로 `),
            txt(`${quotient}조각을 만들 수 있고 ${fmtDec(remainder)} m가 남아요.`),
          ],
        };
      },
    ];

    const tmpl = templates[rng.int(0, templates.length - 1)]();

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: tmpl.prompt,
      expr: tmpl.expr,
      blankAnswers: tmpl.blankAnswers,
      explanation: tmpl.explanation,
    };
  },
};

// ── 6. ddiv2-word : 소수의 나눗셈 문장제 (decimal-input, word) ─────────────
const ddiv2Word: SkillDef = {
  id: 'ddiv2-word',
  unitId: 'unitDecDiv2',
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
      // 휘발유 효율: N.d km를 L로 → 1 L당 몇 km
      // 1 L당 거리: 몫 (소수 1자리 or 자연수)
      // quotientInt: 10~200 (1.0~20.0 km/L)
      let quotientInt = rng.int(10, 200);
      while (quotientInt % 10 === 0) quotientInt = rng.int(10, 200);
      // fuelInt: 제수 × 10 (0.1~9.9 L)
      let fuelInt = rng.int(2, 30);
      while (fuelInt % 10 === 0) fuelInt = rng.int(2, 30);
      // 거리 = (quotientInt/10) × (fuelInt/10) = quotientInt×fuelInt/100
      const distInt = quotientInt * fuelInt; // × 100
      const dist = distInt / 100;
      // dist가 소수 2자리 이하이고 fuelInt/10이 소수여야
      if (distInt % 10 !== 0 || dist <= 0 || dist > 200) {
        // fallback: 22.4 ÷ 1.4 = 16
        answer = 16; unit = 'km';
        prompt = `휘발유 1.4 L로 22.4 km를 갔습니다. 휘발유 1 L로 갈 수 있는 거리는 몇 km인가요?`;
        explanation = [
          txt(`22.4 ÷ 1.4에서 나누는 수와 나누어지는 수에 똑같이 10배를 하면 `),
          txt(`224 ÷ 14 = 16이에요. 휘발유 1 L로 16 km를 갈 수 있어요.`),
        ];
      } else {
        const fuel = fuelInt / 10;
        const kmPerL = quotientInt / 10;
        answer = kmPerL;
        unit = 'km';
        prompt = `휘발유 ${fmtDec(fuel)} L로 ${fmtDec(dist)} km를 갔습니다. 휘발유 1 L로 갈 수 있는 거리는 몇 km인가요?`;
        const distInt10 = Math.round(dist * 10);
        explanation = [
          txt(`${fmtDec(dist)} ÷ ${fmtDec(fuel)}에서 똑같이 10배를 하면 `),
          txt(`${distInt10} ÷ ${fuelInt} = ${fmtDec(kmPerL)}이에요. `),
          txt(`휘발유 1 L로 ${fmtDec(kmPerL)} km를 갈 수 있어요.`),
        ];
      }

    } else if (templateIdx === 1) {
      // 리본을 N.d m씩 자르면 몇 도막 (몫은 자연수)
      // quotient: 2~15 자연수
      // divisorInt: 소수 1자리 (1~9 → 0.1~0.9)
      const quotient = rng.int(2, 15);
      let divisorInt = rng.int(1, 9);
      while (divisorInt % 10 === 0) divisorInt = rng.int(1, 9);
      // dividend = quotient × (divisorInt/10) = quotient × divisorInt / 10
      const rawDividendInt = quotient * divisorInt;
      if (rawDividendInt % 10 !== 0) {
        // fallback: 9.6 ÷ 0.8 = 12
        answer = 12; unit = '도막';
        prompt = `리본 9.6 m를 0.8 m씩 자르면 몇 도막이 되나요?`;
        explanation = [
          txt(`9.6 ÷ 0.8에서 나누는 수와 나누어지는 수에 똑같이 10배를 하면 `),
          txt(`96 ÷ 8 = 12이에요. 리본은 12도막이 돼요.`),
        ];
      } else {
        const dividend = rawDividendInt / 10;
        const divisor = divisorInt / 10;
        answer = quotient;
        unit = '도막';
        prompt = `리본 ${fmtDec(dividend)} m를 ${fmtDec(divisor)} m씩 자르면 몇 도막이 되나요?`;
        const dividendInt10 = Math.round(dividend * 10);
        explanation = [
          txt(`${fmtDec(dividend)} ÷ ${fmtDec(divisor)}에서 똑같이 10배를 하면 `),
          txt(`${dividendInt10} ÷ ${divisorInt} = ${quotient}이에요. `),
          txt(`리본은 ${quotient}도막이 돼요.`),
        ];
      }

    } else if (templateIdx === 2) {
      // 페인트: N.dd L로 S.d m² 칠할 때 1 L로 칠하는 넓이
      // 몫: 소수 1자리 (quotientInt/10)
      // 제수: 소수 2자리 (divisorInt/100, 끝자리≠0)
      // 피제수 = 몫 × 제수 (소수)
      let quotientInt = rng.int(11, 99);
      while (quotientInt % 10 === 0) quotientInt = rng.int(11, 99);
      let divisorInt = rng.int(11, 99);
      while (divisorInt % 10 === 0) divisorInt = rng.int(11, 99);
      // dividend = (quotientInt/10) × (divisorInt/100) = quotientInt×divisorInt/1000
      const rawInt = quotientInt * divisorInt;
      // dividend × 1000 = rawInt → dividend 소수 3자리 이하
      // 원하는 건 dividend가 소수 1~2자리
      if (rawInt % 100 !== 0 || rawInt > 99900 || rawInt < 100) {
        // fallback: 3.6 ÷ 1.5 = 2.4
        answer = 2.4; unit = 'm²';
        prompt = `페인트 1.5 L로 3.6 m²를 칠할 수 있습니다. 페인트 1 L로 칠할 수 있는 넓이는 몇 m²인가요?`;
        explanation = [
          txt(`3.6 ÷ 1.5에서 나누는 수와 나누어지는 수에 똑같이 10배를 하면 `),
          txt(`36 ÷ 15 = 2.4이에요. 페인트 1 L로 2.4 m²를 칠할 수 있어요.`),
        ];
      } else {
        const dividend = rawInt / 1000;
        const divisor = divisorInt / 100;
        const kmPerL = quotientInt / 10;
        answer = kmPerL;
        unit = 'm²';
        prompt = `페인트 ${fmtDec(divisor)} L로 ${fmtDec(dividend)} m²를 칠할 수 있습니다. 페인트 1 L로 칠할 수 있는 넓이는 몇 m²인가요?`;
        const dividendInt10 = Math.round(dividend * 10);
        const divisorInt10 = Math.round(divisor * 10);
        explanation = [
          txt(`${fmtDec(dividend)} ÷ ${fmtDec(divisor)}에서 똑같이 10배를 하면 `),
          txt(`${dividendInt10} ÷ ${divisorInt10} = ${fmtDec(kmPerL)}이에요. `),
          txt(`페인트 1 L로 ${fmtDec(kmPerL)} m²를 칠할 수 있어요.`),
        ];
      }

    } else if (templateIdx === 3) {
      // 설탕: N.d kg를 0.X kg씩 봉지에 담으면 몇 봉지
      // 몫: 2~20 자연수
      const quotient = rng.int(2, 20);
      let divisorInt = rng.int(1, 9);
      const rawDividendInt = quotient * divisorInt;
      if (rawDividendInt % 10 !== 0) {
        answer = 8; unit = '봉지';
        prompt = `설탕 4.8 kg을 0.6 kg씩 봉지에 담으면 몇 봉지가 되나요?`;
        explanation = [
          txt(`4.8 ÷ 0.6에서 나누는 수와 나누어지는 수에 똑같이 10배를 하면 `),
          txt(`48 ÷ 6 = 8이에요. 설탕 8봉지가 돼요.`),
        ];
      } else {
        const dividend = rawDividendInt / 10;
        const divisor = divisorInt / 10;
        answer = quotient;
        unit = '봉지';
        prompt = `설탕 ${fmtDec(dividend)} kg을 ${fmtDec(divisor)} kg씩 봉지에 담으면 몇 봉지가 되나요?`;
        const dividendInt10 = Math.round(dividend * 10);
        explanation = [
          txt(`${fmtDec(dividend)} ÷ ${fmtDec(divisor)}에서 똑같이 10배를 하면 `),
          txt(`${dividendInt10} ÷ ${divisorInt} = ${quotient}이에요. `),
          txt(`설탕 ${quotient}봉지가 돼요.`),
        ];
      }

    } else if (templateIdx === 4) {
      // 물통: N L 물을 X.d L짜리 컵으로 몇 컵
      // 몫: 2~15 자연수
      // 제수: 소수 1자리 (divisorInt/10, 끝자리≠0, 0.1~9.9)
      const quotient = rng.int(2, 15);
      let divisorInt = rng.int(1, 99);
      while (divisorInt % 10 === 0) divisorInt = rng.int(1, 99);
      const rawInt = quotient * divisorInt; // dividend × 10
      if (rawInt % 10 !== 0) {
        answer = 6; unit = '컵';
        prompt = `물 9 L를 컵 한 개에 1.5 L씩 담으면 몇 컵이 되나요?`;
        explanation = [
          txt(`9 ÷ 1.5에서 나누는 수와 나누어지는 수에 똑같이 10배를 하면 `),
          txt(`90 ÷ 15 = 6이에요. 물 6컵이 돼요.`),
        ];
      } else {
        const dividend = rawInt / 10; // 자연수
        const divisor = divisorInt / 10;
        answer = quotient;
        unit = '컵';
        prompt = `물 ${dividend} L를 컵 한 개에 ${fmtDec(divisor)} L씩 담으면 몇 컵이 되나요?`;
        const dividendInt10 = dividend * 10;
        explanation = [
          txt(`${dividend} ÷ ${fmtDec(divisor)}에서 똑같이 10배를 하면 `),
          txt(`${dividendInt10} ÷ ${divisorInt} = ${quotient}이에요. `),
          txt(`물 ${quotient}컵이 돼요.`),
        ];
      }

    } else {
      // 속력: N km를 X.X시간에 갔을 때 1시간에 몇 km
      // 몫: 소수 1자리
      let quotientInt = rng.int(11, 99);
      while (quotientInt % 10 === 0) quotientInt = rng.int(11, 99);
      let timeInt = rng.int(2, 20);
      while (timeInt % 10 === 0) timeInt = rng.int(2, 20);
      // dist = (quotientInt/10) × (timeInt/10) = quotientInt×timeInt/100
      const distInt = quotientInt * timeInt;
      if (distInt % 100 !== 0 || distInt / 100 > 200) {
        answer = 7.5; unit = 'km';
        prompt = `자전거를 타고 2시간 동안 15 km를 갔습니다. 1시간에 몇 km를 간 셈인가요?`;
        explanation = [
          txt(`15 ÷ 2 = 7.5이에요. `),
          txt(`1시간에 7.5 km를 간 셈이에요.`),
        ];
      } else {
        const dist = distInt / 100;
        const time = timeInt / 10;
        const speed = quotientInt / 10;
        answer = speed;
        unit = 'km';
        prompt = `자전거를 타고 ${fmtDec(time)}시간 동안 ${fmtDec(dist)} km를 갔습니다. 1시간에 몇 km를 간 셈인가요?`;
        const distInt10 = Math.round(dist * 10);
        explanation = [
          txt(`${fmtDec(dist)} ÷ ${fmtDec(time)}에서 똑같이 10배를 하면 `),
          txt(`${distInt10} ÷ ${timeInt} = ${fmtDec(speed)}이에요. `),
          txt(`1시간에 ${fmtDec(speed)} km를 간 셈이에요.`),
        ];
      }
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

export const unitDecDiv2Skills: SkillDef[] = [
  ddiv2Same,
  ddiv2Diff,
  ddiv2Nat,
  ddiv2Round,
  ddiv2Share,
  ddiv2Word,
];
