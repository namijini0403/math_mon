/**
 * 5-2 심화 문제 생성기 (challenge: true, difficulty: 3)
 * 명세: docs/challenge/g5s2.md
 */

import { RNG } from '../rng';
import {
  gcd,
  simplify,
  toMixed,
  isIrreducible,
  type Frac,
} from '../fraction';
import { nj, ida } from '../josa';
import type { MathExpr, MathToken, Problem, SkillDef } from '../types';

// ── 공통 토큰 헬퍼 ──────────────────────────────────────────
const txt = (t: string): MathToken => ({ kind: 'text', text: t });
const frT = (f: Frac): MathToken => ({ kind: 'frac', n: f.n, d: f.d });
const mixT = (f: Frac): MathToken => {
  const m = toMixed(f);
  return m.whole === 0
    ? { kind: 'frac', n: m.n, d: m.d }
    : { kind: 'frac', whole: m.whole, n: m.n, d: m.d };
};
const blank = (slot: number): MathToken => ({ kind: 'blank', slot });

// ═══════════════════════════════════════════════════════════════
//  unitRange — 수의 범위와 어림하기
// ═══════════════════════════════════════════════════════════════

/**
 * ch52-rounddiff  올림·버림 후 두 값의 차
 * N을 올림하여 만의 자리까지 나타낸 값과 버림하여 천의 자리까지 나타낸 값의 차
 */
const chRoundDiff: SkillDef = {
  id: 'ch52-rounddiff',
  unitId: 'unitRange',
  title: '올림·버림 후 두 값의 차',
  note: '5~6자리수 N, 올림(만) vs 버림(천), 차이 fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let N = 43700, roundUpVal = 50000, roundDownVal = 43000, ans = 7000;
    for (let tries = 0; tries < 2000; tries++) {
      // N: 만 단위 올림이 의미있고, 천 단위 버림이 의미있는 5자리 수
      const tenThousand = rng.int(2, 8); // 2만~8만
      const thousand = rng.int(1, 9);    // 천 자리 ≠ 0 (올림 시 변화 생김)
      const rest = rng.int(0, 999);
      const N2 = tenThousand * 10000 + thousand * 1000 + rest;

      // 올림하여 만의 자리: 천 단위 이하가 0보다 크면 만 단위 +1
      const roundUp2 = (tenThousand + 1) * 10000; // thousand ≥ 1이므로 항상 +1

      // 버림하여 천의 자리: 백 단위 이하 제거
      const roundDown2 = tenThousand * 10000 + thousand * 1000;

      const ans2 = roundUp2 - roundDown2;
      if (ans2 <= 0 || !Number.isInteger(ans2)) continue;

      N = N2; roundUpVal = roundUp2; roundDownVal = roundDown2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`${N}을 올림하여 만의 자리까지 나타내면 ${roundUpVal}이에요. `),
      txt(`${N}을 버림하여 천의 자리까지 나타내면 ${roundDownVal}이에요. `),
      txt(`두 값의 차: ${roundUpVal} − ${roundDownVal} = ${ans}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${N}을 올림하여 만의 자리까지 나타낸 값과 버림하여 천의 자리까지 나타낸 값의 차를 구하세요.`,
      expr: [txt('차 = '), blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch52-billmin  지폐 최소 장수 차이
 * 물건값 P원, A는 10000원짜리, B는 1000원짜리 최소 장수의 차
 */
const chBillMin: SkillDef = {
  id: 'ch52-billmin',
  unitId: 'unitRange',
  title: '지폐 최소 장수 차이',
  note: 'P를 올림: A(10000단위), B(1000단위) → 장수 차',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let P = 14700, countA = 2, countB = 15, ans = 13;
    for (let tries = 0; tries < 2000; tries++) {
      // P: 10000~39999, 끝 세 자리가 0이 아님 (10000의 배수 아님)
      const base = rng.int(1, 3) * 10000;
      const extra = rng.int(100, 9900); // 백단위 이상 남음 → 1000원 올림 장수가 생김
      const P2 = base + extra;
      if (P2 % 10000 === 0 || P2 % 1000 === 0) continue;

      const countA2 = Math.ceil(P2 / 10000);
      const countB2 = Math.ceil(P2 / 1000);
      const ans2 = countB2 - countA2;
      if (ans2 <= 0) continue;

      P = P2; countA = countA2; countB = countB2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`${P}원을 내기 위해 10000원짜리만 사용하면 올림하여 10000의 자리까지: `),
      txt(`${countA}장이 필요해요. `),
      txt(`1000원짜리만 사용하면 올림하여 1000의 자리까지: `),
      txt(`${countB}장이 필요해요. `),
      txt(`두 사람이 낼 지폐 수의 차: ${countB} − ${countA} = ${ans}장.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${P}원짜리 물건을 사려 합니다. 가는 10000원짜리 지폐만, 나는 1000원짜리 지폐만 사용할 때, 최소한으로 내야 하는 지폐 수의 차는 몇 장인가요?`,
      expr: [txt('지폐 수 차 = '), blank(0), txt(' 장')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch52-bundlesell  묶음 판매 총 금액
 * total개를 bundleA씩 priceA원에, 나머지를 bundleB씩 priceB원에 팔 때 총 금액
 */
const chBundleSell: SkillDef = {
  id: 'ch52-bundlesell',
  unitId: 'unitRange',
  title: '묶음 판매 수익 계산',
  note: 'total÷bundleA(버림) → 큰 묶음 금액 + 나머지÷bundleB(버림) → 작은 묶음 금액',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const items = [
      { name: '사탕', unit: '개' },
      { name: '연필', unit: '자루' },
      { name: '지우개', unit: '개' },
      { name: '공책', unit: '권' },
    ];

    // 폴백값
    let total = 3847, bundleA = 100, priceA = 8000, bundleB = 10, priceB = 500;
    let bigCount = 38, smallCount = 4, totalAmt = 306000;
    let itemName = '과자', itemUnit = '개';

    for (let tries = 0; tries < 2000; tries++) {
      const bundleA2 = 100;
      const bundleB2 = 10;
      const total2 = rng.int(1000, 5000);
      // 두 나머지 모두 0이 아니어야 함
      if (total2 % bundleA2 === 0) continue;
      if ((total2 % bundleA2) % bundleB2 === 0) continue;

      const priceA2 = rng.int(3, 15) * 1000; // 3000~15000
      const priceB2 = rng.int(1, 8) * 100;   // 100~800

      const bigCount2 = Math.floor(total2 / bundleA2);
      const rem = total2 % bundleA2;
      const smallCount2 = Math.floor(rem / bundleB2);
      if (smallCount2 === 0) continue;

      const totalAmt2 = bigCount2 * priceA2 + smallCount2 * priceB2;
      if (totalAmt2 <= 0) continue;

      const item = rng.pick(items);
      total = total2; bundleA = bundleA2; priceA = priceA2;
      bundleB = bundleB2; priceB = priceB2;
      bigCount = bigCount2; smallCount = smallCount2; totalAmt = totalAmt2;
      itemName = item.name; itemUnit = item.unit;
      break;
    }

    const rem = total % bundleA;

    const explanation: MathExpr = [
      txt(`${total}${itemUnit}을 ${bundleA}${itemUnit}씩 묶으면 ${bigCount}묶음이고 ${rem}${itemUnit}이 남아요. `),
      txt(`큰 묶음 금액: ${bigCount} × ${priceA}원 = ${bigCount * priceA}원. `),
      txt(`남은 ${rem}${itemUnit}을 ${bundleB}${itemUnit}씩 묶으면 ${smallCount}묶음이에요. `),
      txt(`작은 묶음 금액: ${smallCount} × ${priceB}원 = ${smallCount * priceB}원. `),
      txt(`총 금액: ${bigCount * priceA} + ${smallCount * priceB} = ${totalAmt}원.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${itemName} ${total}${itemUnit}을 ${bundleA}${itemUnit}씩 묶어 ${priceA}원에 팔고, 나머지는 ${bundleB}${itemUnit}씩 묶어 ${priceB}원에 팔았습니다. ${itemName}을 판 금액은 모두 얼마인가요?`,
      expr: [txt('총 금액 = '), blank(0), txt(' 원')],
      blankAnswers: [totalAmt],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitFracMul — 분수의 곱셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch52-fracineqnat  범위 부등식 안의 자연수 구하기
 * lower < □×(p/q) < upper, 만족하는 자연수 중 최솟값 fill-blanks
 */
const chFracIneqNat: SkillDef = {
  id: 'ch52-fracineqnat',
  unitId: 'unitFracMul',
  title: '분수 곱 범위 안의 자연수 구하기',
  note: 'lower < □×(p/q) < upper, 자연수 3~6개 존재, 최솟값·최댓값 fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let p = 3, q = 7, lowerN = 18, lowerD = 7, upperN = 11, upperD = 2;
    let minAns = 7, maxAns = 12;
    for (let tries = 0; tries < 3000; tries++) {
      const q2 = rng.int(3, 10);
      const p2 = rng.int(1, q2 - 1);
      if (gcd(p2, q2) !== 1) continue;

      // lower, upper: 자연수 또는 대분수
      const lWhole = rng.int(1, 4);
      const lN2 = rng.int(1, q2 - 1);
      if (gcd(lN2, q2) !== 1) continue;
      const lowerN2 = lWhole * q2 + lN2;
      const lowerD2 = q2;

      const uWhole = lWhole + rng.int(1, 3);
      const uN2 = rng.int(1, q2 - 1);
      if (gcd(uN2, q2) !== 1) continue;
      const upperN2 = uWhole * q2 + uN2;
      const upperD2 = q2;

      if (upperN2 <= lowerN2) continue;

      // □ 범위: lower/(p/q) < □ < upper/(p/q)
      // = lower × (q/p) < □ < upper × (q/p)
      const boxLo = (lowerN2 / lowerD2) * (q2 / p2); // > boxLo
      const boxHi = (upperN2 / upperD2) * (q2 / p2); // < boxHi

      const minAns2 = Math.floor(boxLo) + 1;
      const maxAns2 = Math.ceil(boxHi) - 1;
      const count = maxAns2 - minAns2 + 1;
      if (count < 3 || count > 6 || minAns2 <= 0) continue;

      p = p2; q = q2;
      lowerN = lowerN2; lowerD = lowerD2;
      upperN = upperN2; upperD = upperD2;
      minAns = minAns2; maxAns = maxAns2;
      break;
    }

    const lWholePart = Math.floor(lowerN / lowerD);
    const lFracN = lowerN - lWholePart * lowerD;
    const uWholePart = Math.floor(upperN / upperD);
    const uFracN = upperN - uWholePart * upperD;

    const explanation: MathExpr = [
      txt(`${lWholePart}과 ${lFracN}/${lowerD} < □ × ${p}/${q} < ${uWholePart}과 ${uFracN}/${upperD}에서 `),
      txt(`각 변을 ${p}/${q}로 나눠요 (= ${q}/${p}를 곱해요). `),
      txt(`${lowerN}/${lowerD} × ${q}/${p} = ${lowerN * q}/${lowerD * p},  ${upperN}/${upperD} × ${q}/${p} = ${upperN * q}/${upperD * p}이에요. `),
      txt(`따라서 □는 ${lowerN * q}/${lowerD * p}보다 크고 ${upperN * q}/${upperD * p}보다 작은 자연수예요. `),
      txt(`만족하는 자연수는 ${minAns}부터 ${maxAns}까지예요. `),
      txt(`가장 작은 자연수는 ${minAns}, 가장 큰 자연수는 ${maxAns}${ida(maxAns)}에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${lWholePart}과 ${lFracN}/${lowerD} < □ × ${p}/${q} < ${uWholePart}과 ${uFracN}/${upperD}에서 □ 안에 들어갈 수 있는 자연수 중 가장 작은 수와 가장 큰 수를 구하세요.`,
      expr: [txt('가장 작은 수: '), blank(0), txt(',  가장 큰 수: '), blank(1)],
      blankAnswers: [minAns, maxAns],
      explanation,
    };
  },
};

/**
 * ch52-fracconsume  전체의 분수 사용 후 남은 양
 * 총량 total, 전체의 frac1 사용, 나머지의 frac2 사용 후 남은 양 (fraction-input)
 */
const chFracConsume: SkillDef = {
  id: 'ch52-fracconsume',
  unitId: 'unitFracMul',
  title: '분수 비율 사용 후 남은 양',
  note: 'total × (1-frac1) × (1-frac2), 분모 ≤ 60, 대분수 결과, 역산 방식으로 생성',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const contexts = [
      { material: '밀가루', unit: 'kg', use1: '빵 만들기', use2: '과자 만들기' },
      { material: '쌀', unit: 'kg', use1: '밥 짓기', use2: '떡 만들기' },
      { material: '설탕', unit: 'kg', use1: '케이크 만들기', use2: '잼 만들기' },
      { material: '반죽', unit: 'kg', use1: '빵 굽기', use2: '쿠키 만들기' },
    ];

    // 역산 방식:
    // 1. frac1, frac2 고르기
    // 2. after2 (최종 남은 양) 을 대분수로 고르기
    // 3. after1 = after2 ÷ (1-frac2) = after2 × d2/(d2-n2)
    // 4. total = after1 ÷ (1-frac1) = after1 × d1/(d1-n1)
    // → total, after1 모두 대분수(분수부 > 0) 보장 가능

    // 폴백값: frac1=1/3, frac2=3/5, after2=4/5*6/5... 계산
    // total=18, after1=12, after2=24/5 → 대분수 4과4/5
    let totalF: Frac = { n: 18, d: 1 };
    let after1F: Frac = { n: 12, d: 1 };
    let after2F: Frac = { n: 24, d: 5 };
    let f1N = 1, f1D = 3, f2N = 3, f2D = 5;
    let ctx = contexts[0];

    for (let tries = 0; tries < 3000; tries++) {
      // frac1, frac2: 진분수, 기약
      const f1D2 = rng.int(2, 6);
      const f1N2 = rng.int(1, f1D2 - 1);
      if (gcd(f1N2, f1D2) !== 1) continue;

      const f2D2 = rng.int(2, 6);
      const f2N2 = rng.int(1, f2D2 - 1);
      if (gcd(f2N2, f2D2) !== 1) continue;

      // after2를 대분수로 직접 설정: 정수부 1~3, 분자 1~(f2D2-1)
      const a2Whole = rng.int(1, 3);
      const a2FracN = rng.int(1, f2D2 - 1);
      if (gcd(a2FracN, f2D2) !== 1) continue;
      const after2F2: Frac = { n: a2Whole * f2D2 + a2FracN, d: f2D2 };

      // after1 = after2 × f2D2/(f2D2-f2N2)
      const after1F2 = simplify({ n: after2F2.n * f2D2, d: after2F2.d * (f2D2 - f2N2) });
      if (after1F2.d > 60) continue;
      const after1M2 = toMixed(after1F2);
      if (after1M2.n === 0) continue; // after1이 정수면 제외

      // total = after1 × f1D2/(f1D2-f1N2)
      const totalF2 = simplify({ n: after1F2.n * f1D2, d: after1F2.d * (f1D2 - f1N2) });
      if (totalF2.d > 60) continue;
      const totalM2 = toMixed(totalF2);
      if (totalM2.n === 0) continue; // total이 정수면 제외 (설명 토큰 안전)
      // after2 분모 ≤ 60
      const after2M2 = toMixed(after2F2);
      if (after2M2.n === 0) continue;
      if (!isIrreducible({ n: after2M2.n, d: after2M2.d })) continue;
      // after1도 기약
      if (!isIrreducible({ n: after1M2.n, d: after1M2.d })) continue;

      totalF = totalF2; after1F = after1F2; after2F = after2F2;
      f1N = f1N2; f1D = f1D2;
      f2N = f2N2; f2D = f2D2;
      ctx = rng.pick(contexts);
      break;
    }

    const totalM = toMixed(totalF);
    const after2M = toMixed(after2F);
    const answer = after2M.whole > 0
      ? { whole: after2M.whole, n: after2M.n, d: after2M.d }
      : { n: after2M.n, d: after2M.d };

    // total 표시용 (대분수이면 대분수 형태로)
    const totalStr = totalM.whole > 0
      ? `${totalM.whole}과 ${totalM.n}/${totalM.d}`
      : `${totalF.n}/${totalF.d}`;

    const explanation: MathExpr = [
      txt(`총량: `),
      mixT(totalF),
      txt(` ${ctx.unit}. `),
      txt(`${ctx.use1}에 전체의 ${f1N}/${f1D}를 사용하면 남은 양: `),
      mixT(totalF),
      txt(` × ${f1D - f1N}/${f1D} = `),
      mixT(after1F),
      txt(` ${ctx.unit}. `),
      txt(`${ctx.use2}에 나머지의 ${f2N}/${f2D}를 사용하면 남은 양: `),
      mixT(after1F),
      txt(` × ${f2D - f2N}/${f2D} = `),
      mixT(after2F),
      txt(` ${ctx.unit}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `${ctx.material}이 ${totalStr} ${ctx.unit} 있습니다. 전체의 ${f1N}/${f1D}를 ${ctx.use1}에 사용하고, 나머지의 ${f2N}/${f2D}를 ${ctx.use2}에 사용했습니다. 남은 ${ctx.material}은 몇 ${ctx.unit}인가요?`,
      mixed: after2M.whole > 0,
      requireIrreducible: true,
      answer,
      explanation,
    };
  },
};

/**
 * ch52-areascale  넓이 변화 비율
 * 가로를 scaleW배, 세로를 scaleH배 → 넓이는 처음의 몇 배? (fraction-input)
 */
const chAreaScale: SkillDef = {
  id: 'ch52-areascale',
  unitId: 'unitFracMul',
  title: '직사각형 넓이 변화 비율',
  note: 'scaleW × scaleH = 넓이 배율, 분모 ≤ 60, 기약분수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let wN = 7, wD = 5, hN = 3, hD = 4;
    let resN = 21, resD = 20;

    for (let tries = 0; tries < 3000; tries++) {
      // scaleW: 1 초과 대분수 (가로 늘리기), ex 1 + n/d
      const wD2 = rng.int(2, 6);
      const wFrac = rng.int(1, wD2 - 1);
      if (gcd(wFrac, wD2) !== 1) continue;
      const wN2 = wD2 + wFrac; // 가분수 = 1 + wFrac/wD2

      // scaleH: 1 미만 진분수 (세로 줄이기)
      const hD2 = rng.int(2, 8);
      const hN2 = rng.int(1, hD2 - 1);
      if (gcd(hN2, hD2) !== 1) continue;

      // 결과 = wN2/wD2 × hN2/hD2
      const resF = simplify({ n: wN2 * hN2, d: wD2 * hD2 });
      if (resF.d > 60 || resF.n <= 0) continue;
      // 결과가 정수면 대분수 토큰 불변식 위반이나, 여기선 fraction-input (mixed=false) → 정수OK
      // 하지만 교육 효과를 위해 진분수 결과만 허용 (넓이 감소)
      if (resF.n >= resF.d) continue; // 넓이가 늘어나면 제외 (진분수 결과만)
      if (!isIrreducible(resF)) continue;

      wN = wN2; wD = wD2; hN = hN2; hD = hD2;
      resN = resF.n; resD = resF.d;
      break;
    }

    const wWhole = Math.floor(wN / wD);
    const wFracN = wN - wWhole * wD;

    const explanation: MathExpr = [
      txt(`넓이 배율 = 가로 배율 × 세로 배율이에요. `),
      txt(`가로 배율: `),
      { kind: 'frac', whole: wWhole, n: wFracN, d: wD },
      txt(` = `),
      frT({ n: wN, d: wD }),
      txt(`, 세로 배율: `),
      frT({ n: hN, d: hD }),
      txt(`. 넓이 배율 = `),
      frT({ n: wN, d: wD }),
      txt(` × `),
      frT({ n: hN, d: hD }),
      txt(` = `),
      frT({ n: resN, d: resD }),
      txt(`${ida(`${resN}/${resD}`)}예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `직사각형의 가로를 처음의 ${wWhole}과 ${wFracN}/${wD}배로 늘이고, 세로를 처음의 ${hN}/${hD}배로 줄였습니다. 새 직사각형의 넓이는 처음의 몇 배인가요?`,
      mixed: false,
      requireIrreducible: true,
      answer: { n: resN, d: resD },
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitSym — 합동과 대칭
// ═══════════════════════════════════════════════════════════════

/**
 * ch52-congtriangle  합동 삼각형 각도 추론
 * 두 합동 삼각형 각도 a, b가 주어질 때 세 번째 각도 계산
 * 연결 방식에 따라 특정 각도 구하기
 */
const chCongTriangle: SkillDef = {
  id: 'ch52-congtriangle',
  unitId: 'unitSym',
  title: '합동 삼각형 각도 추론',
  note: '두 각도 a,b → 세 번째 각도 c=180-a-b, 연결 구조에 따른 외각/내각 계산',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let angA = 35, angB = 65, angC = 80, targetAng = 110, targetLabel = '두 삼각형이 공유 변으로 이어진 도형의 꼭짓점 각도 ⓐ';

    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(20, 60);
      const b2 = rng.int(20, 60);
      const c2 = 180 - a2 - b2;
      if (c2 <= 0 || c2 <= 10) continue;

      // 연결 방식: 두 삼각형을 b각 꼭짓점을 공유하여 이어 붙임
      // 결합 도형의 꼭짓점 각도 = 180 - (a+b) = c + (180-a-b-b) -- 다양한 구조
      // 단순한 경우: 한 변을 공유 → 공유 변의 반대쪽 꼭짓점의 각도
      // 두 삼각형을 이어 붙인 사각형에서 ⓐ = 360 - a - b - a - b
      // 더 간단: 선형 연결 → 외각 = a + b
      const scenario = rng.int(0, 1);
      let targetAng2: number;
      let desc: string;
      if (scenario === 0) {
        // 두 합동 삼각형을 빗변으로 이어 붙인 평행사변형에서
        // 위 꼭짓점 각도 = 180 - a - b = c2 (이미 c2)
        // 아래 꼭짓점 각도 = 180 - c2 = a + b
        targetAng2 = a2 + b2;
        desc = `각도 ⓐ`;
        if (targetAng2 <= 0 || targetAng2 >= 360) continue;
      } else {
        // 삼각형의 외각 = 나머지 두 내각의 합
        targetAng2 = a2 + b2; // 외각
        desc = `각도 ⓐ`;
        if (targetAng2 <= 0 || targetAng2 >= 180) continue;
      }

      angA = a2; angB = b2; angC = c2;
      targetAng = targetAng2;
      targetLabel = desc;
      break;
    }

    const explanation: MathExpr = [
      txt(`두 삼각형은 합동이므로 대응각이 같아요. `),
      txt(`삼각형의 세 내각: ${angA}°, ${angB}°, ${angC}° (합 = 180°). `),
      txt(`두 삼각형을 이어 붙인 도형에서 `),
      txt(`${targetLabel}(ⓐ)는 두 각도의 합 ${angA}° + ${angB}° = ${targetAng}°${ida(targetAng)}예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `두 삼각형이 서로 합동입니다. 삼각형의 두 각도가 ${angA}°와 ${angB}°일 때, 두 삼각형을 이어 붙인 도형의 ${targetLabel}(ⓐ)를 구하세요.`,
      expr: [txt('ⓐ = '), blank(0), txt(' °')],
      blankAnswers: [targetAng],
      explanation,
    };
  },
};

/**
 * ch52-paperfold  정사각형 종이 접기 각도
 * 종이를 접어 생긴 각도 foldAngle이 주어질 때, 나머지 각도를 구하기
 */
const chPaperFold: SkillDef = {
  id: 'ch52-paperfold',
  unitId: 'unitSym',
  title: '정사각형 종이 접기 각도',
  note: '접기 각도 foldAngle → 두 각의 차 = 90 - 2×foldAngle',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // foldAngle: 10~40도 (접힌 각도)
    // 정사각형의 한 꼭짓점을 다른 위치로 접으면:
    // 접힌 삼각형에서 합동에 의해 두 각도가 같음
    // 직각(90°)에서 두 합동각을 빼면 나머지 각도 계산
    // ① = foldAngle (접힌 대응각)
    // 직각이므로 foldAngle + ② = 90 → ② = 90 - foldAngle
    // 두 각도 차 = ② - ① = (90 - foldAngle) - foldAngle = 90 - 2×foldAngle
    // 결과 > 0이 되려면 foldAngle < 45

    // 폴백값
    let foldAngle = 32, ang1 = 32, ang2 = 58, diff = 26;
    for (let tries = 0; tries < 2000; tries++) {
      const fa = rng.int(10, 40);
      const a2 = 90 - fa;
      const d = a2 - fa; // = 90 - 2*fa
      if (d <= 0) continue;
      foldAngle = fa;
      ang1 = fa;
      ang2 = a2;
      diff = d;
      break;
    }

    const explanation: MathExpr = [
      txt(`정사각형 종이를 접으면 합동 삼각형이 생겨요. `),
      txt(`접힌 각도 ① = ${ang1}°${ida(ang1)}예요. `),
      txt(`정사각형의 꼭짓점 각도는 90°이므로 ② = 90° − ${ang1}° = ${ang2}°${ida(ang2)}예요. `),
      txt(`두 각도의 차 ② − ① = ${ang2}° − ${ang1}° = ${diff}°${ida(diff)}예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `정사각형 모양의 종이를 그림처럼 접었을 때 생긴 각도 ①이 ${foldAngle}°입니다. 두 각도 ①과 ②의 차를 구하세요.`,
      expr: [txt('② − ① = '), blank(0), txt(' °')],
      blankAnswers: [diff],
      explanation,
    };
  },
  minVariety: 31, // foldAngle: 10~40 = 31가지
};

/**
 * ch52-symaxis  선대칭 도형 각도 계산
 * 선대칭 사각형(또는 삼각형)에서 주어진 각도로 나머지 각도 추론
 */
const chSymAxis: SkillDef = {
  id: 'ch52-symaxis',
  unitId: 'unitSym',
  title: '선대칭 도형 각도 계산',
  note: '선대칭 → 대응각 동치, 내각 합(360° 또는 180°)으로 미지각 계산',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 선대칭 사각형 문제:
    // 마름모(선대칭): 두 쌍의 각도가 각각 같음. 대각선은 두 각도가 서로 보각
    // 사각형 내각 합 = 360°
    // 마름모 : 각도 a, 180-a, a, 180-a
    // 주어진 각도: a → 구하는 각도: 180-a

    // 폴백값
    let givenAngle = 68, targetAngle = 112;
    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(30, 80);
      const t2 = 180 - a2;
      if (t2 <= 0 || t2 >= 180) continue;
      if (a2 === t2) continue; // 정사각형(90°) 제외

      givenAngle = a2;
      targetAngle = t2;
      break;
    }

    const explanation: MathExpr = [
      txt(`선대칭 도형은 대칭축을 기준으로 대응각이 서로 같아요. `),
      txt(`마름모 모양의 선대칭 도형에서 마주 보는 각도는 서로 같고, `),
      txt(`이웃한 두 각도의 합은 180°예요. `),
      txt(`주어진 각도가 ${givenAngle}°이므로, `),
      txt(`구하는 각도 ⓐ = 180° − ${givenAngle}° = ${targetAngle}°${ida(targetAngle)}예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `선대칭 도형인 마름모에서 한 각도가 ${givenAngle}°입니다. 이웃한 각도 ⓐ를 구하세요.`,
      expr: [txt('ⓐ = '), blank(0), txt(' °')],
      blankAnswers: [targetAngle],
      explanation,
    };
  },
  minVariety: 51, // givenAngle: 30~80 = 51가지
};

// ═══════════════════════════════════════════════════════════════
//  unitDecMul — 소수의 곱셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch52-decineqsum  부등식 범위 안 자연수 최댓값+최솟값
 * A×B < □ < C×D에서 가장 큰·작은 자연수의 합
 */
const chDecIneqSum: SkillDef = {
  id: 'ch52-decineqsum',
  unitId: 'unitDecMul',
  title: '소수 곱 부등식 범위 자연수 합',
  note: 'A×B < □ < C×D, 최대+최소 자연수, 정수 스케일 계산',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let lhsInt = 3423, rhsInt = 3922, lhsStr = '1.63×21', rhsStr = '53×0.74';
    let minBox = 35, maxBox = 39, ans = 74;

    for (let tries = 0; tries < 3000; tries++) {
      // LHS = p/100, RHS = q/100 형태로 정수 스케일 계산
      // A: xx.xx (소수 두 자리), B: 자연수 (1~30)
      const A_int = rng.int(120, 250); // 1.20 ~ 2.50 → ×100
      const B_nat = rng.int(15, 30);
      const lhsInt2 = A_int * B_nat; // LHS × 100

      // C: 자연수, D: 0.xx (소수 두 자리)
      const C_nat = rng.int(40, 80);
      const D_int = rng.int(60, 95); // 0.60 ~ 0.95 → ×100
      const rhsInt2 = C_nat * D_int; // RHS × 100

      if (rhsInt2 <= lhsInt2) continue;
      if (rhsInt2 - lhsInt2 < 500) continue; // 충분한 범위

      // □ 범위: lhsInt2/100 < □ < rhsInt2/100
      const minBox2 = Math.floor(lhsInt2 / 100) + 1;
      const maxBox2 = Math.ceil(rhsInt2 / 100) - 1;
      if (minBox2 > maxBox2 || maxBox2 - minBox2 < 2) continue;
      if (minBox2 <= 0) continue;

      const ans2 = minBox2 + maxBox2;
      lhsInt = lhsInt2; rhsInt = rhsInt2;
      lhsStr = `${(A_int / 100).toFixed(2)}×${B_nat}`;
      rhsStr = `${C_nat}×${(D_int / 100).toFixed(2)}`;
      minBox = minBox2; maxBox = maxBox2; ans = ans2;
      break;
    }

    const lhsVal = lhsInt / 100;
    const rhsVal = rhsInt / 100;

    const explanation: MathExpr = [
      txt(`${lhsStr} = ${lhsVal}... `),
      txt(`${rhsStr} = ${rhsVal}... `),
      txt(`${lhsVal} < □ < ${rhsVal}에서 `),
      txt(`가장 작은 자연수: ${minBox}, 가장 큰 자연수: ${maxBox}. `),
      txt(`합 = ${minBox} + ${maxBox} = ${ans}${ida(ans)}에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${lhsStr} < □ < ${rhsStr}에서 □에 들어갈 수 있는 가장 큰 자연수와 가장 작은 자연수의 합을 구하세요.`,
      expr: [txt('가장 큰 수 + 가장 작은 수 = '), blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch52-savingsgap  저금액 목표 차이
 * 작년 저금액 base, 올해 ratio1배 저금, 목표 ratio2배 → 차이 계산
 */
const chSavingsGap: SkillDef = {
  id: 'ch52-savingsgap',
  unitId: 'unitDecMul',
  title: '저금액 목표 차이 (소수 곱셈)',
  note: 'base × ratio1, base × ratio2, 두 결과의 차 = 정수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const contexts = [
      { subject: '용돈', verb: '모음', unit: '원' },
      { subject: '독서량', verb: '읽음', unit: '권' },
      { subject: '운동 시간', verb: '운동함', unit: '분' },
    ];

    // 폴백값
    let base = 80000, r1Num = 78, r2Num = 140;
    let current = 62400, target = 112000, gap = 49600;
    let ctx = contexts[0];

    for (let tries = 0; tries < 3000; tries++) {
      // base: 만 단위 깔끔하게
      const baseK = rng.int(5, 15) * 10; // 50, 60, ..., 150 (×1000)
      const base2 = baseK * 1000;

      // ratio1: 0.60 ~ 0.95 (소수 두 자리)
      const r1 = rng.int(60, 95);
      // ratio2: 1.20 ~ 2.00
      const r2 = rng.int(120, 200);

      // 두 결과 모두 정수여야 함 (base ×r/100이 정수)
      const curr2 = base2 * r1;
      const tgt2 = base2 * r2;
      if (curr2 % 100 !== 0) continue;
      if (tgt2 % 100 !== 0) continue;

      const currAmt = curr2 / 100;
      const tgtAmt = tgt2 / 100;
      const gap2 = tgtAmt - currAmt;
      if (gap2 <= 0) continue;

      base = base2;
      r1Num = r1; r2Num = r2;
      current = currAmt; target = tgtAmt; gap = gap2;
      ctx = rng.pick(contexts);
      break;
    }

    const r1Str = (r1Num / 100).toFixed(2);
    const r2Str = (r2Num / 100).toFixed(2);

    const explanation: MathExpr = [
      txt(`올해 ${ctx.subject}: ${base}원 × ${r1Str} = ${current}원. `),
      txt(`목표 ${ctx.subject}: ${base}원 × ${r2Str} = ${target}원. `),
      txt(`목표 달성을 위해 더 필요한 금액: ${target} − ${current} = ${gap}원.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `작년 ${ctx.subject}이 ${base}원이었습니다. 올해는 작년의 ${r1Str}배를 ${ctx.verb}고, 올해 목표는 작년의 ${r2Str}배입니다. 목표를 채우려면 얼마를 더 모아야 하나요?`,
      expr: [txt('더 필요한 금액 = '), blank(0), txt(' 원')],
      blankAnswers: [gap],
      explanation,
    };
  },
};

/**
 * ch52-tapedec  겹쳐지는 테이프 전체 길이 (소수)
 * 길이 tapeLen cm인 테이프 count장을 overlap cm씩 겹쳐 이어 붙인 전체 길이
 */
const chTapeDec: SkillDef = {
  id: 'ch52-tapedec',
  unitId: 'unitDecMul',
  title: '겹쳐지는 테이프 전체 길이 (소수)',
  note: 'tapeLen×count − overlap×(count-1), 정수 스케일, decimal-input',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let tapeLen = 24.5, count = 18, overlap = 4.3;
    let ansVal = 24.5 * 18 - 4.3 * 17;

    for (let tries = 0; tries < 3000; tries++) {
      // tapeLen: 소수 한 자리 (10.x ~ 30.x) → ×10 정수
      const tL = rng.int(100, 300); // ×10
      // count: 5~20
      const cnt = rng.int(5, 20);
      // overlap: 소수 한 자리 (1.x ~ 5.x), tapeLen보다 작아야 함
      const ov = rng.int(10, 50); // ×10, 1.0 ~ 5.0
      if (ov >= tL) continue;

      // 정수 스케일로 계산: ×10
      const totalInt = tL * cnt - ov * (cnt - 1); // ×10
      if (totalInt <= 0) continue;
      if (totalInt % 10 !== 0) continue; // 소수 한 자리로 나눠떨어져야 함
      // answer×10000이 정수여야 함 (decimal-input 불변식)
      const ansv = totalInt / 10;
      if (Math.abs(ansv * 10000 - Math.round(ansv * 10000)) > 1e-6) continue;
      if (ansv <= 0) continue;

      tapeLen = tL / 10;
      count = cnt;
      overlap = ov / 10;
      ansVal = ansv;
      break;
    }

    const explanation: MathExpr = [
      txt(`테이프 ${count}장의 전체 합계: ${tapeLen} × ${count} = ${tapeLen * count} cm. `),
      txt(`겹친 부분은 ${count - 1}군데: ${overlap} × ${count - 1} = ${overlap * (count - 1)} cm. `),
      txt(`전체 길이 = ${tapeLen * count} − ${overlap * (count - 1)} = ${ansVal} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `길이가 ${tapeLen} cm인 색 테이프 ${count}장을 ${overlap} cm씩 겹쳐서 한 줄로 이어 붙였습니다. 전체 길이는 몇 cm인가요?`,
      answer: ansVal,
      unit: 'cm',
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitCuboid — 직육면체
// ═══════════════════════════════════════════════════════════════

/**
 * ch52-edgesum  직육면체 모든 모서리의 합
 * 4×(a+b+c) 계산
 */
const chEdgeSum: SkillDef = {
  id: 'ch52-edgesum',
  unitId: 'unitCuboid',
  title: '직육면체 모든 모서리의 합',
  note: '4×(a+b+c), 세 모서리 길이 자연수, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const a = rng.int(3, 15);
    const b = rng.int(3, 15);
    const c = rng.int(3, 15);
    const ans = 4 * (a + b + c);

    const explanation: MathExpr = [
      txt(`직육면체의 모서리는 12개로, 길이가 같은 것이 4개씩 3종류예요. `),
      txt(`모든 모서리의 합 = 4 × (가로 + 세로 + 높이) `),
      txt(`= 4 × (${a} + ${b} + ${c}) = 4 × ${a + b + c} = ${ans} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체의 모든 모서리 길이의 합을 구하세요.`,
      expr: [txt('모서리 합 = '), blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch52-doublebox  두 직육면체 이어 붙이기 모서리 합
 * 같은 직육면체 2개를 한 방향으로 이어 붙였을 때 새 직육면체 모서리 합
 */
const chDoubleBox: SkillDef = {
  id: 'ch52-doublebox',
  unitId: 'unitCuboid',
  title: '두 직육면체 이어 붙이기 모서리 합',
  note: '붙이는 축 ×2 → 4×(a′+b′+c′)',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const a = rng.int(4, 15);
    const b = rng.int(4, 15);
    const c = rng.int(4, 15);

    // 붙이는 방향: 0=가로, 1=세로, 2=높이
    const axis = rng.int(0, 2);
    const axisNames = ['가로', '세로', '높이'];
    const dims = [a, b, c];
    const newDims = [...dims];
    newDims[axis] = newDims[axis] * 2;

    const ans = 4 * (newDims[0] + newDims[1] + newDims[2]);

    const explanation: MathExpr = [
      txt(`두 직육면체를 ${axisNames[axis]} 방향으로 이어 붙이면 `),
      txt(`새 직육면체의 세 변은 `),
      txt(`가로 ${newDims[0]} cm, 세로 ${newDims[1]} cm, 높이 ${newDims[2]} cm${ida(`${newDims[2]}cm`)}에요. `),
      txt(`모든 모서리 합 = 4 × (${newDims[0]} + ${newDims[1]} + ${newDims[2]}) `),
      txt(`= 4 × ${newDims[0] + newDims[1] + newDims[2]} = ${ans} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로 ${a} cm, 세로 ${b} cm, 높이 ${c} cm인 직육면체 2개를 ${axisNames[axis]} 방향으로 이어 붙여 큰 직육면체를 만들었습니다. 모든 모서리 길이의 합을 구하세요.`,
      expr: [txt('모서리 합 = '), blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch52-paintcut  정육면체 칠하기 후 자르기 — 한 면만 색칠된 개수
 * n×n×n 정육면체를 겉면 색칠 후 1×1×1로 자를 때 한 면만 색칠된 개수 = 6×(n-2)²
 */
const chPaintCut: SkillDef = {
  id: 'ch52-paintcut',
  unitId: 'unitCuboid',
  title: '정육면체 칠하기 후 자르기 (한 면 색칠)',
  note: 'n = big÷small, 한 면만 = 6×(n-2)²',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // (big, small) 쌍: big이 small의 배수이고 n = big/small ≥ 3
    const pairs: Array<[number, number]> = [
      [12, 3], [15, 3], [20, 4], [12, 4], [15, 5], [18, 3], [16, 4], [20, 5],
      [9, 3], [21, 3],
    ];

    const [big, small] = rng.pick(pairs);
    const n = big / small;
    const ans = 6 * (n - 2) * (n - 2);

    const explanation: MathExpr = [
      txt(`한 모서리 ${big} cm를 ${small} cm로 자르면 한 방향에 ${n}개씩 총 ${n}×${n}×${n} = ${n * n * n}개예요. `),
      txt(`한 면만 색칠된 것은 각 면의 중앙 부분이에요. `),
      txt(`각 면에서 모서리와 꼭짓점을 제외한 중앙: (${n}−2)×(${n}−2) = ${(n - 2) * (n - 2)}개. `),
      txt(`6면 × ${(n - 2) * (n - 2)}개 = ${ans}개.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 모서리 ${big} cm인 정육면체의 겉면을 모두 색칠한 후 한 모서리 ${small} cm인 정육면체로 잘랐습니다. 한 면만 색칠된 작은 정육면체는 몇 개인가요?`,
      expr: [txt('한 면만 색칠된 개수 = '), blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
  minVariety: 10,
};

// ═══════════════════════════════════════════════════════════════
//  unitAvg — 평균과 가능성
// ═══════════════════════════════════════════════════════════════

/**
 * ch52-avgmissing  전체 합 역산으로 빠진 값 구하기
 * n개 자료 중 n-1개 알 때 평균으로 나머지 하나 구하기
 */
const chAvgMissing: SkillDef = {
  id: 'ch52-avgmissing',
  unitId: 'unitAvg',
  title: '평균으로 빠진 값 역산',
  note: 'n개 평균 avg, n-1개 합 → 미지값 = n×avg - 알려진합, 자연수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const subjects = [
      ['국어', '수학', '사회', '과학', '영어'],
      ['달리기', '멀리뛰기', '공던지기', '줄넘기', '수영'],
      ['가', '나', '다', '라', '마'],
    ];
    const units = ['점', '개', '권'];

    // 폴백값
    let n = 5, avg = 86, knownVals = [92, 88, 79, 90], missingVal = 81;
    let subj = subjects[0], unit = units[0];

    for (let tries = 0; tries < 3000; tries++) {
      const n2 = rng.int(4, 7);
      const avg2 = rng.int(60, 95);
      const totalSum = n2 * avg2;

      // n-1개 값 생성 (전부 양수, 합이 totalSum보다 작음)
      const known: number[] = [];
      let sumKnown = 0;
      let ok = true;
      for (let i = 0; i < n2 - 1; i++) {
        const v = rng.int(50, 100);
        known.push(v);
        sumKnown += v;
      }
      const missing = totalSum - sumKnown;
      if (missing <= 0 || !Number.isInteger(missing) || missing > 150) { ok = false; }
      if (!ok) continue;

      n = n2; avg = avg2; knownVals = known; missingVal = missing;
      subj = rng.pick(subjects);
      unit = rng.pick(units);
      break;
    }

    const subjectList = subj.slice(0, n);
    const knownSubjects = subjectList.slice(0, n - 1).join(', ');
    const missingSubject = subjectList[n - 1];
    const knownSum = knownVals.reduce((a, b) => a + b, 0);

    const explanation: MathExpr = [
      txt(`${n}개 자료의 평균이 ${avg}${unit}이므로 전체 합 = ${n} × ${avg} = ${n * avg}${unit}. `),
      txt(`알려진 값들의 합: ${knownVals.join(' + ')} = ${knownSum}${unit}. `),
      txt(`${missingSubject} = ${n * avg} − ${knownSum} = ${missingVal}${unit}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${subjectList.join(', ')} ${n}개의 평균이 ${avg}${unit}입니다. ${knownSubjects}${nj(knownVals[0], '이/가')} 각각 ${knownVals.join(', ')}${unit}일 때, ${missingSubject}${nj(missingSubject, '은/는')} 몇 ${unit}인가요?`,
      expr: [txt(`${missingSubject} = `), blank(0), txt(` ${unit}`)],
      blankAnswers: [missingVal],
      explanation,
    };
  },
};

/**
 * ch52-newmember  신입 회원 가입 후 평균 변화
 * 기존 nOld명 평균 avgOld, 새 nNew명 가입 후 전체 평균 avgAll → 새 회원 평균
 */
const chNewMember: SkillDef = {
  id: 'ch52-newmember',
  unitId: 'unitAvg',
  title: '신입 회원 가입 후 새 회원 평균 역산',
  note: '새 회원 평균 = (전체합 − 기존합) ÷ 신규인원, 자연수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const contexts = [
      { group: '동호회', attr: '나이', unit: '세' },
      { group: '반', attr: '키', unit: 'cm' },
      { group: '팀', attr: '점수', unit: '점' },
    ];

    // 폴백값
    let nOld = 32, avgOld = 43, nNew = 6, newAvg = 31, avgAll = 41;
    let ctx = contexts[0];

    for (let tries = 0; tries < 3000; tries++) {
      const nOld2 = rng.int(10, 40);
      const avgOld2 = rng.int(50, 100);
      const nNew2 = rng.int(2, 8);
      const avgAll2 = rng.int(Math.max(40, avgOld2 - 20), avgOld2 + 5);

      const totalAll = (nOld2 + nNew2) * avgAll2;
      const totalOld = nOld2 * avgOld2;
      const totalNew = totalAll - totalOld;
      const newAvg2 = totalNew / nNew2;

      if (!Number.isInteger(newAvg2) || newAvg2 <= 0 || newAvg2 > 200) continue;
      if (newAvg2 === avgOld2) continue;

      nOld = nOld2; avgOld = avgOld2; nNew = nNew2; newAvg = newAvg2; avgAll = avgAll2;
      ctx = rng.pick(contexts);
      break;
    }

    const totalOld = nOld * avgOld;
    const totalAll = (nOld + nNew) * avgAll;

    const explanation: MathExpr = [
      txt(`기존 합계: ${nOld} × ${avgOld} = ${totalOld}${ctx.unit}. `),
      txt(`전체 합계: ${nOld + nNew} × ${avgAll} = ${totalAll}${ctx.unit}. `),
      txt(`새 회원 합계: ${totalAll} − ${totalOld} = ${totalAll - totalOld}${ctx.unit}. `),
      txt(`새 회원 평균: ${totalAll - totalOld} ÷ ${nNew} = ${newAvg}${ctx.unit}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${nOld}명 ${ctx.group}의 평균 ${ctx.attr}이 ${avgOld}${ctx.unit}입니다. ${nNew}명이 새로 가입하여 전체 평균이 ${avgAll}${ctx.unit}이 되었을 때, 새로 가입한 회원들의 평균 ${ctx.attr}은 얼마인가요?`,
      expr: [txt(`새 회원 평균 = `), blank(0), txt(` ${ctx.unit}`)],
      blankAnswers: [newAvg],
      explanation,
    };
  },
};

/**
 * ch52-excludeone  최고 기록 제외 역산
 * 전체 평균 avgAll, 제외 후 평균 avgExcl → 제외된 값 계산
 */
const chExcludeOne: SkillDef = {
  id: 'ch52-excludeone',
  unitId: 'unitAvg',
  title: '최고 기록 제외 후 역산',
  note: '제외된 값 = n×avgAll − (n-1)×avgExcl, 자연수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const contexts = [
      { event: '오디션 참가자', attr: '점수', unit: '점' },
      { event: '달리기 선수', attr: '기록', unit: '초' },
      { event: '시험 응시자', attr: '점수', unit: '점' },
    ];

    // 폴백값
    let n = 5, avgAll = 71.5, avgExcl = 66, excludedVal = 84;
    let ctx = contexts[0];

    // avgAll은 소수 한 자리 허용 (fill-blanks 정수 답이므로 avgAll이 소수여도 됨)
    for (let tries = 0; tries < 3000; tries++) {
      const n2 = rng.int(4, 8);
      // avgAll: 소수 한 자리 (×2로 정수화)
      const avgAllX2 = rng.int(120, 180); // avgAll = X/2
      const avgExcl2 = rng.int(50, 85);

      const totalAll = avgAllX2 * n2; // = avgAll × n × 2
      const totalExcl = avgExcl2 * (n2 - 1) * 2;
      const excluded = (totalAll - totalExcl) / 2;

      if (!Number.isInteger(excluded) || excluded <= 0 || excluded > 200) continue;
      if (excluded <= avgExcl2) continue; // 제외된 값이 최고여야 함

      n = n2;
      avgAll = avgAllX2 / 2;
      avgExcl = avgExcl2;
      excludedVal = excluded;
      ctx = rng.pick(contexts);
      break;
    }

    const totalAllVal = avgAll * n;
    const totalExclVal = avgExcl * (n - 1);

    const explanation: MathExpr = [
      txt(`전체 합계: ${avgAll} × ${n} = ${totalAllVal}${ctx.unit}. `),
      txt(`제외 후 합계: ${avgExcl} × ${n - 1} = ${totalExclVal}${ctx.unit}. `),
      txt(`제외된 값 = ${totalAllVal} − ${totalExclVal} = ${excludedVal}${ctx.unit}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${ctx.event} ${n}명의 전체 ${ctx.attr} 평균이 ${avgAll}${ctx.unit}이고, 가장 높은 ${ctx.attr}을 제외한 ${n - 1}명의 평균이 ${avgExcl}${ctx.unit}일 때, 제외된 ${ctx.attr}은 몇 ${ctx.unit}인가요?`,
      expr: [txt('제외된 값 = '), blank(0), txt(` ${ctx.unit}`)],
      blankAnswers: [excludedVal],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  내보내기
// ═══════════════════════════════════════════════════════════════

export const challengeG5S2Skills: SkillDef[] = [
  // unitRange
  chRoundDiff,
  chBillMin,
  chBundleSell,
  // unitFracMul
  chFracIneqNat,
  chFracConsume,
  chAreaScale,
  // unitSym
  chCongTriangle,
  chPaperFold,
  chSymAxis,
  // unitDecMul
  chDecIneqSum,
  chSavingsGap,
  chTapeDec,
  // unitCuboid
  chEdgeSum,
  chDoubleBox,
  chPaintCut,
  // unitAvg
  chAvgMissing,
  chNewMember,
  chExcludeOne,
];
