/**
 * 단원: 비와 비율 (2022 개정교육과정 6-1 4단원)
 * 성취기준: 두 수의 비를 이해하고, 비율을 분수·소수·백분율로 나타내며
 * 비율을 활용하여 실생활 문제를 해결한다.
 */

import { RNG } from '../rng';
import { simplify, gcd } from '../fraction';
import { buildChoices } from '../choices';
import { nj, ida } from '../josa';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;

// ── 1. ratio-express ───────────────────────────────────────────────
const ratioExpress: SkillDef = {
  id: 'ratio-express',
  unitId: 'unitRatio',
  title: '비로 나타내기',
  note: '두 양을 비로 나타내기. "~에 대한 ~의 비"(기준 뒤) 표현 포함, 순서 함정 등 4지선다.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    // 소재 풀: [항목A 이름, 항목B 이름, A 범위, B 범위]
    const scenarios = [
      { aLabel: '남학생', bLabel: '여학생', aRange: [8, 20] as [number, number], bRange: [8, 20] as [number, number] },
      { aLabel: '빨간 구슬', bLabel: '파란 구슬', aRange: [5, 18] as [number, number], bRange: [5, 18] as [number, number] },
      { aLabel: '사과', bLabel: '배', aRange: [4, 15] as [number, number], bRange: [4, 15] as [number, number] },
      { aLabel: '강아지', bLabel: '고양이', aRange: [3, 12] as [number, number], bRange: [3, 12] as [number, number] },
      { aLabel: '연필', bLabel: '지우개', aRange: [6, 20] as [number, number], bRange: [6, 20] as [number, number] },
    ] as const;

    const sc = rng.pick(scenarios);
    let a = rng.int(sc.aRange[0], sc.aRange[1]);
    let b = rng.int(sc.bRange[0], sc.bRange[1]);
    // a ≠ b 보장
    while (a === b) b = rng.int(sc.bRange[0], sc.bRange[1]);

    const total = a + b;

    // "~에 대한 ~의 비" 표현 여부 (50% 확률)
    // "A에 대한 B의 비" → B : A (기준이 A, 비교가 B)
    const useKiJunExpr = rng.chance(0.5);

    let prompt: string;
    let correctText: string;
    let orderTrapText: string; // 순서 바꾼 함정

    if (useKiJunExpr) {
      // "sc.aLabel 수에 대한 sc.bLabel 수의 비"
      prompt = `${sc.aLabel} ${a}명과 ${sc.bLabel} ${b}명이 있어요. ${sc.aLabel} 수에 대한 ${sc.bLabel} 수의 비를 나타내세요.`;
      // A에 대한 B의 비 = B : A
      correctText = `${b} : ${a}`;
      orderTrapText = `${a} : ${b}`;
    } else {
      prompt = `${sc.aLabel} ${a}명과 ${sc.bLabel} ${b}명의 수를 비로 나타내세요. (${sc.aLabel} 수 : ${sc.bLabel} 수)`;
      correctText = `${a} : ${b}`;
      orderTrapText = `${b} : ${a}`;
    }

    // 기약비 (약분한 비)
    const g = gcd(a, b);
    const simplA = a / g;
    const simplB = b / g;
    const simplText = `${simplA} : ${simplB}`;

    // 전체에 대한 A의 비
    const totalTrapText = useKiJunExpr ? `${b} : ${total}` : `${a} : ${total}`;

    // 후보 풀 (6개 이상)
    const answer: ChoiceValue = { kind: 'text', text: correctText };
    const candidates: ChoiceValue[] = [
      { kind: 'text', text: orderTrapText },
      { kind: 'text', text: totalTrapText },
      { kind: 'text', text: simplText },
      { kind: 'text', text: `${total} : ${a}` },
      { kind: 'text', text: `${total} : ${b}` },
      { kind: 'text', text: `${a} : ${total}` },
    ];

    const { choices, answerIndex } = buildChoices(answer, candidates, rng);

    const explanation: MathExpr = useKiJunExpr
      ? [
          txt(`"A에 대한 B의 비"는 B : A로 써요. 기준량이 A, 비교하는 양이 B예요. `),
          txt(`${sc.aLabel}(${a}) 수에 대한 ${sc.bLabel}(${b}) 수의 비 → ${b} : ${ida(a)}.`),
        ]
      : [
          txt(`비는 두 양을 순서대로 기호 ':'로 나타내요. `),
          txt(`${sc.aLabel} ${a}명 : ${sc.bLabel} ${b}명 → ${a} : ${ida(b)}.`),
        ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 2. ratio-value ─────────────────────────────────────────────────
const ratioValue: SkillDef = {
  id: 'ratio-value',
  unitId: 'unitRatio',
  title: '비율을 분수로 나타내기',
  note: '비 A:B의 비율 A/B를 기약 진분수로 입력. 비교량 < 기준량인 쌍만 사용.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    // 기약 진분수가 되도록: g가 1이 아닐 수 있는 쌍을 생성하고 약분
    // 비교량(a) < 기준량(b), GCD > 1 이면 약분이 필요해서 더 흥미로운 문제
    let compares: number, base: number;
    let guard = 0;
    do {
      base = rng.int(4, 12);
      compares = rng.int(1, base - 1);
      guard++;
      if (guard > 300) { base = 5; compares = 3; break; }
    } while (compares === base); // 진분수 보장 (이미 compares < base)

    const { n: sn, d: sd } = simplify({ n: compares, d: base });

    // 표시는 원래 비로
    const prompt = `비 ${compares} : ${base}의 비율을 기약분수로 나타내세요.`;

    const expr: MathExpr = [
      txt(`비 ${compares} : ${base}`),
    ];

    const explanation: MathExpr = [
      txt(`비율 = 비교하는 양 ÷ 기준량이에요. `),
      txt(`비 ${compares} : ${base}에서 비교하는 양은 ${compares}, 기준량은 ${ida(base)}. `),
      txt(`비율 = `),
      { kind: 'frac', n: compares, d: base },
      txt(` = `),
      { kind: 'frac', n: sn, d: sd },
      txt(`(기약분수)예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt,
      expr,
      mixed: false,
      answer: { n: sn, d: sd },
      requireIrreducible: true,
      explanation,
    };
  },
};

// ── 3. ratio-percent ───────────────────────────────────────────────
const ratioPercent: SkillDef = {
  id: 'ratio-percent',
  unitId: 'unitRatio',
  title: '비율을 백분율로 나타내기',
  note: '소수 또는 분수(분모 2,4,5,10,20,25,50)를 백분율(자연수)로 변환. fill-blanks.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 자연수 백분율이 보장되는 분모 목록
    const niceDenomnators = [2, 4, 5, 10, 20, 25, 50] as const;

    // 소수 표현 vs 분수 표현 (50% 확률)
    const useDecimal = rng.chance(0.5);

    let prompt: string;
    let expr: MathExpr;
    let answerPercent: number;

    if (useDecimal) {
      // 소수 → 백분율: 0.xx 형태 (자연수 %가 되는 값)
      // 1~99% 사이, 5의 배수 또는 분모 보장값
      const percentCandidates = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];
      answerPercent = rng.pick(percentCandidates);
      const decimalVal = answerPercent / 100;
      prompt = `소수 ${nj(decimalVal, '을/를')} 백분율로 나타내세요.`;
      expr = [
        { kind: 'decimal', v: decimalVal },
        txt(' = '),
        { kind: 'blank', slot: 0 },
        txt(' %'),
      ];
    } else {
      // 분수 → 백분율
      const d = rng.pick(niceDenomnators);
      // 분자: 1 ~ d-1 범위에서 자연수 % 보장
      // d * k / 100이 정수 → k = n/d * 100이 정수
      // n/d * 100 = 정수 → n은 d와 100의 공약수의 배수
      const validNumerators: number[] = [];
      for (let n = 1; n < d; n++) {
        if ((n * 100) % d === 0) validNumerators.push(n);
      }
      const numerator = rng.pick(validNumerators.length > 0 ? validNumerators : [1]);
      answerPercent = Math.round((numerator / d) * 100);

      const { n: sn, d: sd } = simplify({ n: numerator, d });
      prompt = `분수 ${sn}/${nj(sd, '을/를')} 백분율로 나타내세요.`;
      expr = [
        { kind: 'frac', n: sn, d: sd },
        txt(' = '),
        { kind: 'blank', slot: 0 },
        txt(' %'),
      ];
    }

    const explanation: MathExpr = [
      txt(`백분율 = 비율 × 100이에요. `),
      useDecimal
        ? txt(`${answerPercent / 100} × 100 = ${answerPercent} %예요.`)
        : txt(`비율을 소수로 바꾼 뒤 × 100 하거나, 분자 × 100 ÷ 분모로 구해요. 답은 ${answerPercent} %예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [answerPercent],
      explanation,
    };
  },
};

// ── 4. percent-of ──────────────────────────────────────────────────
const percentOf: SkillDef = {
  id: 'percent-of',
  unitId: 'unitRatio',
  title: '전체에서 백분율 구하기',
  note: '전체 중 일부의 비율을 백분율(정수 %)로 구하기. 전체를 4,5,10,20,25,50명으로 제한.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 정수 % 보장되는 전체 수
    const totalCandidates = [4, 5, 10, 20, 25, 50] as const;
    const total = rng.pick(totalCandidates);

    // 일부: 1 ~ total-1 중에서 정수 % 보장
    const validParts: number[] = [];
    for (let p = 1; p < total; p++) {
      if ((p * 100) % total === 0) validParts.push(p);
    }
    const part = rng.pick(validParts);
    const answerPercent = Math.round((part / total) * 100);

    // 소재 풀
    const scenarios = [
      { ctx: `${total}명 중 ${part}명이 안경을 써요.`, subject: '안경을 쓰는 학생의 비율' },
      { ctx: `${total}개 중 ${part}개가 불량품이에요.`, subject: '불량품의 비율' },
      { ctx: `${total}명 중 ${part}명이 우유를 좋아해요.`, subject: '우유를 좋아하는 학생의 비율' },
      { ctx: `${total}명 중 ${part}명이 자전거를 가지고 있어요.`, subject: '자전거를 가진 학생의 비율' },
      { ctx: `${total}문제 중 ${part}문제를 맞혔어요.`, subject: '맞힌 문제의 비율' },
    ] as const;

    const sc = rng.pick(scenarios);
    const prompt = `${sc.ctx} ${nj(sc.subject, '은/는')} 몇 %인가요?`;

    const expr: MathExpr = [
      txt(`비율: `),
      { kind: 'frac', n: part, d: total },
      txt(` → `),
      { kind: 'blank', slot: 0 },
      txt(' %'),
    ];

    const explanation: MathExpr = [
      txt(`비율 = 비교하는 양 ÷ 기준량 = ${part} ÷ ${total} = `),
      { kind: 'frac', n: part, d: total },
      txt(`. 백분율 = 비율 × 100 = `),
      { kind: 'frac', n: part, d: total },
      txt(` × 100 = ${answerPercent} %예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [answerPercent],
      explanation,
    };
  },
};

// ── 5. percent-apply ───────────────────────────────────────────────
const percentApply: SkillDef = {
  id: 'percent-apply',
  unitId: 'unitRatio',
  title: 'a의 b% 구하기',
  note: '정수 결과가 나오는 a의 b%를 계산. 금액은 100원 단위.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 소재별 템플릿
    const templates = [
      // 금액 할인
      () => {
        const baseOptions = [1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000] as const;
        const percentOptions = [10, 20, 25, 30, 40, 50] as const;
        const base = rng.pick(baseOptions);
        const pct = rng.pick(percentOptions);
        const answer = Math.round((base * pct) / 100);
        return {
          prompt: `${base.toLocaleString()}원의 ${pct}%는 얼마인가요?`,
          expr: [
            txt(`${base.toLocaleString()}원의 ${pct}% = `),
            { kind: 'blank', slot: 0 } as const,
            txt('원'),
          ] as MathExpr,
          answer,
          expText: `${base.toLocaleString()} × ${pct} ÷ 100 = ${answer.toLocaleString()}원이에요.`,
        };
      },
      // 학생 수
      () => {
        const totalOptions = [100, 200, 400, 500] as const;
        const percentOptions = [10, 20, 25, 30, 40, 50] as const;
        const total = rng.pick(totalOptions);
        const pct = rng.pick(percentOptions);
        const answer = Math.round((total * pct) / 100);
        return {
          prompt: `전교생 ${total}명의 ${pct}%는 몇 명인가요?`,
          expr: [
            txt(`${total}명의 ${pct}% = `),
            { kind: 'blank', slot: 0 } as const,
            txt('명'),
          ] as MathExpr,
          answer,
          expText: `${total} × ${pct} ÷ 100 = ${answer}명이에요.`,
        };
      },
      // 거리/길이
      () => {
        const distOptions = [200, 300, 400, 500, 600, 800, 1000] as const;
        const percentOptions = [10, 20, 25, 40, 50] as const;
        const dist = rng.pick(distOptions);
        const pct = rng.pick(percentOptions);
        const answer = Math.round((dist * pct) / 100);
        return {
          prompt: `${dist} m 중 ${pct}%는 몇 m인가요?`,
          expr: [
            txt(`${dist} m의 ${pct}% = `),
            { kind: 'blank', slot: 0 } as const,
            txt(' m'),
          ] as MathExpr,
          answer,
          expText: `${dist} × ${pct} ÷ 100 = ${answer} m예요.`,
        };
      },
    ];

    const tmpl = rng.pick(templates)();

    const explanation: MathExpr = [
      txt(`a의 b% = a × b ÷ 100이에요. `),
      txt(tmpl.expText),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: tmpl.prompt,
      expr: tmpl.expr,
      blankAnswers: [tmpl.answer],
      explanation,
    };
  },
};

// ── 6. ratio-compare ───────────────────────────────────────────────
const ratioCompare: SkillDef = {
  id: 'ratio-compare',
  unitId: 'unitRatio',
  title: '비율 비교하기',
  note: '두 가게의 할인율을 비교. 10% 확률로 같은 할인율 → "두 가게가 같아요" 정답.',
  difficulty: 3,
  generate(seed) {
    const rng = new RNG(seed);

    // 자연수 할인율 보장: 정가를 100의 약수로, 할인액을 정가의 배수로
    // 정가 후보: 100원 단위에서 할인율이 정수 %가 되는 값
    // 단순하게: 정가 = k * 100, 할인율 = 10~50 사이 정수 → 할인액 = 정가 * 할인율 / 100
    const priceBases = [1000, 2000, 3000, 4000, 5000, 6000, 8000, 10000] as const;
    const discountRates = [10, 15, 20, 25, 30, 40] as const;

    const same = rng.chance(0.1); // 10% 확률로 두 가게 할인율 같게

    let priceA: number, discAmtA: number, rateA: number;
    let priceB: number, discAmtB: number, rateB: number;

    if (same) {
      rateA = rng.pick(discountRates);
      rateB = rateA;
      priceA = rng.pick(priceBases);
      let priceB2 = rng.pick(priceBases);
      while (priceB2 === priceA) priceB2 = rng.pick(priceBases);
      priceB = priceB2;
      discAmtA = Math.round(priceA * rateA / 100);
      discAmtB = Math.round(priceB * rateB / 100);
    } else {
      rateA = rng.pick(discountRates);
      rateB = rng.pick(discountRates);
      let guard = 0;
      while (rateA === rateB && guard < 100) {
        rateB = rng.pick(discountRates);
        guard++;
      }
      priceA = rng.pick(priceBases);
      priceB = rng.pick(priceBases);
      discAmtA = Math.round(priceA * rateA / 100);
      discAmtB = Math.round(priceB * rateB / 100);
    }

    const prompt =
      `가 가게는 ${priceA.toLocaleString()}원짜리 물건을 ${discAmtA.toLocaleString()}원 할인하고, ` +
      `나 가게는 ${priceB.toLocaleString()}원짜리 물건을 ${discAmtB.toLocaleString()}원 할인해요. ` +
      `할인율이 더 높은 가게는 어디인가요?`;

    let answerText: string;
    if (same) {
      answerText = '두 가게가 같아요';
    } else if (rateA > rateB) {
      answerText = '가 가게';
    } else {
      answerText = '나 가게';
    }

    // 보기 4개 고정 구성 (정답 + 나머지 3개)
    const allOptions: ChoiceValue[] = [
      { kind: 'text', text: '가 가게' },
      { kind: 'text', text: '나 가게' },
      { kind: 'text', text: '두 가게가 같아요' },
      { kind: 'text', text: '알 수 없어요' },
    ];

    const shuffled = rng.shuffle(allOptions);
    const answerIndex = shuffled.findIndex((c) => c.kind === 'text' && c.text === answerText);

    const explanation: MathExpr = [
      txt(`할인율 = 할인 금액 ÷ 정가 × 100이에요. `),
      txt(`가 가게 할인율: ${discAmtA} ÷ ${priceA} × 100 = ${rateA} %. `),
      txt(`나 가게 할인율: ${discAmtB} ÷ ${priceB} × 100 = ${rateB} %. `),
      same
        ? txt(`두 가게의 할인율이 ${rateA} %로 같아요.`)
        : txt(`${rateA > rateB ? '가' : '나'} 가게의 할인율(${Math.max(rateA, rateB)} %)이 더 높아요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt,
      choices: shuffled,
      answerIndex,
      explanation,
    };
  },
};

// ── 7. ratio-word ──────────────────────────────────────────────────
const ratioWord: SkillDef = {
  id: 'ratio-word',
  unitId: 'unitRatio',
  title: '백분율 문장제',
  note: '득표율, 성공률, 할인가, 저축률, 출석률 소재. fill-blanks. 자연수 답 보장.',
  difficulty: 3,
  word: true,
  generate(seed) {
    const rng = new RNG(seed);
    const templateIdx = rng.int(0, 4);

    let prompt: string;
    let expr: MathExpr;
    let blankAnswers: number[];
    let explanation: MathExpr;

    // 소재 0: 득표율
    if (templateIdx === 0) {
      const totalVotes = rng.pick([100, 200, 400, 500] as const);
      const pctCandidates = [20, 25, 30, 40, 50] as const;
      const pct = rng.pick(pctCandidates);
      const votes = Math.round(totalVotes * pct / 100);
      const names = ['지민', '서연', '하은', '도윤', '민준'] as const;
      const name = rng.pick(names);
      prompt = `학생회장 선거에서 전체 ${totalVotes}표 중 ${nj(name, '이/가')} ${votes}표를 얻었어요. ${name}의 득표율은 몇 %인가요?`;
      expr = [
        txt(`득표율: `),
        { kind: 'blank', slot: 0 },
        txt(' %'),
      ];
      blankAnswers = [pct];
      explanation = [
        txt(`비율 = 비교하는 양 ÷ 기준량이에요. `),
        txt(`득표율 = ${votes} ÷ ${totalVotes} × 100 = ${pct} %예요.`),
      ];

    // 소재 1: 슛 성공률
    } else if (templateIdx === 1) {
      const totalShots = rng.pick([10, 20, 25, 50] as const);
      const pctCandidates = [20, 40, 50, 60, 80] as const;
      const pct = rng.pick(pctCandidates);
      const made = Math.round(totalShots * pct / 100);
      prompt = `농구 경기에서 ${totalShots}번 슛을 던져 ${made}번 성공했어요. 슛 성공률은 몇 %인가요?`;
      expr = [
        txt(`성공률: `),
        { kind: 'blank', slot: 0 },
        txt(' %'),
      ];
      blankAnswers = [pct];
      explanation = [
        txt(`비율 = 비교하는 양 ÷ 기준량이에요. `),
        txt(`성공률 = ${made} ÷ ${totalShots} × 100 = ${pct} %예요.`),
      ];

    // 소재 2: 할인 판매가 계산
    } else if (templateIdx === 2) {
      const priceOptions = [2000, 3000, 4000, 5000, 8000, 10000] as const;
      const discPctOptions = [10, 20, 25, 30, 40, 50] as const;
      const origPrice = rng.pick(priceOptions);
      const discPct = rng.pick(discPctOptions);
      const discAmt = Math.round(origPrice * discPct / 100);
      const salePrice = origPrice - discAmt;
      prompt = `원가 ${origPrice.toLocaleString()}원인 물건을 ${discPct}% 할인해서 팔아요. 판매 가격은 얼마인가요?`;
      expr = [
        txt(`판매 가격: `),
        { kind: 'blank', slot: 0 },
        txt('원'),
      ];
      blankAnswers = [salePrice];
      explanation = [
        txt(`할인 금액 = ${origPrice.toLocaleString()} × ${discPct} ÷ 100 = ${discAmt.toLocaleString()}원. `),
        txt(`판매 가격 = 원가 − 할인 금액 = ${origPrice.toLocaleString()} − ${discAmt.toLocaleString()} = ${salePrice.toLocaleString()}원이에요.`),
      ];

    // 소재 3: 저축률
    } else if (templateIdx === 3) {
      const incomeOptions = [10000, 20000, 40000, 50000] as const;
      const pctCandidates = [10, 20, 25, 40, 50] as const;
      const income = rng.pick(incomeOptions);
      const pct = rng.pick(pctCandidates);
      const saved = Math.round(income * pct / 100);
      prompt = `용돈 ${income.toLocaleString()}원 중 ${saved.toLocaleString()}원을 저축했어요. 저축률은 몇 %인가요?`;
      expr = [
        txt(`저축률: `),
        { kind: 'blank', slot: 0 },
        txt(' %'),
      ];
      blankAnswers = [pct];
      explanation = [
        txt(`비율 = 비교하는 양 ÷ 기준량이에요. `),
        txt(`저축률 = ${saved.toLocaleString()} ÷ ${income.toLocaleString()} × 100 = ${pct} %예요.`),
      ];

    // 소재 4: 출석률
    } else {
      const totalDays = rng.pick([20, 25, 40, 50] as const);
      const pctCandidates = [80, 84, 88, 90, 92, 96] as const;
      // 자연수 % 보장 확인
      const validPcts = pctCandidates.filter((p) => (totalDays * p) % 100 === 0);
      const fallback = [80] as const;
      const pct = rng.pick(validPcts.length > 0 ? validPcts : fallback);
      const attended = Math.round(totalDays * pct / 100);
      prompt = `수업일 ${totalDays}일 중 ${attended}일 출석했어요. 출석률은 몇 %인가요?`;
      expr = [
        txt(`출석률: `),
        { kind: 'blank', slot: 0 },
        txt(' %'),
      ];
      blankAnswers = [pct];
      explanation = [
        txt(`비율 = 비교하는 양 ÷ 기준량이에요. `),
        txt(`출석률 = ${attended} ÷ ${totalDays} × 100 = ${pct} %예요.`),
      ];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers,
      explanation,
    };
  },
};

export const unitRatioSkills: SkillDef[] = [
  ratioExpress,
  ratioValue,
  ratioPercent,
  percentOf,
  percentApply,
  ratioCompare,
  ratioWord,
];
