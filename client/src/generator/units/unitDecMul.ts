/**
 * 단원: 소수의 곱셈 (2022 개정교육과정 5-2 4단원)
 * 성취기준: 소수의 곱셈의 계산 원리를 이해하고, 소수의 곱셈을 할 수 있다.
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;

/**
 * 소수점 이하 자릿수를 결정한다.
 * 예: 4.2 → 1, 0.28 → 2, 1.25 → 2
 */
function decimalPlaces(v: number): number {
  if (!isFinite(v)) return 0;
  const s = v.toFixed(10).replace(/0+$/, '');
  const dot = s.indexOf('.');
  return dot < 0 ? 0 : s.length - dot - 1;
}

/**
 * 부동소수점 없이 소수 × 소수 계산.
 * aInt = a의 정수표현, aScale = 10^(a의 소수 자릿수)
 * 결과 = (aInt * bInt) / (aScale * bScale)
 * trailing zero 제거는 JS Number 값 자체가 처리한다 (0.20 → 0.2).
 */
function mulDecimal(a: number, b: number): number {
  const aPlaces = decimalPlaces(a);
  const bPlaces = decimalPlaces(b);
  const aScale = Math.pow(10, aPlaces);
  const bScale = Math.pow(10, bPlaces);
  const aInt = Math.round(a * aScale);
  const bInt = Math.round(b * bScale);
  const resultScale = aScale * bScale;
  return Math.round(aInt * bInt) / resultScale;
}

/** 소수를 깔끔한 문자열로 표시 (trailing zero 없음) */
function fmtDec(v: number): string {
  return String(v);
}

// ── 1. dmul-nat : (1자리 소수) × (자연수) ─────────────────────────
const dmulNat: SkillDef = {
  id: 'dmul-nat',
  unitId: 'unitDecMul',
  title: '(소수 1자리) × (자연수)',
  note: '0.1~9.9 범위 소수 × 2~9 자연수. 소수 끝자리 ≠ 0. 곱 ≤ 100.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    // 소수 1자리: aInt/10, 끝자리 0 회피 (1.0, 2.0 등 제외 → 항상 진짜 소수)
    let aInt = rng.int(1, 99);
    let guard = 0;
    while (aInt % 10 === 0 && guard < 200) { aInt = rng.int(1, 99); guard++; }

    let nat = rng.int(2, 9);
    const a = aInt / 10;
    let ans = mulDecimal(a, nat);
    guard = 0;
    while (ans > 100 && guard < 200) {
      nat = rng.int(2, 9);
      ans = mulDecimal(a, nat);
      guard++;
    }
    // 극단적 fallback (aInt=6.1처럼 큰 소수에서 nat을 줄여도 넘을 때)
    if (ans > 100) { aInt = 6; nat = 7; }

    const finalA = aInt / 10;
    const finalAInt = aInt; // finalA × 10 = aInt (끝자리≠0 보장)
    const answer = mulDecimal(finalA, nat);

    const explanation: MathExpr = [
      txt(`${nj(fmtDec(finalA), '은/는')} ${finalAInt}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`이에요. `),
      txt(`${finalAInt} × ${nat} = ${finalAInt * nat}이므로 `),
      txt(`${fmtDec(finalA)} × ${nj(nat, '은/는')} ${finalAInt * nat}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`인 ${fmtDec(answer)}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${fmtDec(finalA)} × ${nat}`)],
      answer,
      explanation,
    };
  },
};

// ── 2. dmul-nat2 : (자연수) × (1자리 소수) ───────────────────────
const dmulNat2: SkillDef = {
  id: 'dmul-nat2',
  unitId: 'unitDecMul',
  title: '(자연수) × (소수 1자리)',
  note: '2~9 자연수 × 0.1~9.9 소수 1자리. 곱 ≤ 100.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    const nat = rng.int(2, 9);

    let bInt = rng.int(1, 99);
    let guard = 0;
    while (bInt % 10 === 0 && guard < 200) { bInt = rng.int(1, 99); guard++; }
    let b = bInt / 10;
    let ans = mulDecimal(nat, b);
    guard = 0;
    while (ans > 100 && guard < 200) {
      bInt = rng.int(1, 99);
      if (bInt % 10 === 0) continue;
      b = bInt / 10;
      ans = mulDecimal(nat, b);
      guard++;
    }
    if (ans > 100) { b = 0.6; bInt = 6; }
    const finalB = b;
    const finalBInt = Math.round(finalB * 10);
    const answer = mulDecimal(nat, finalB);

    const explanation: MathExpr = [
      txt(`${nj(fmtDec(finalB), '은/는')} ${finalBInt}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`이에요. `),
      txt(`${nat} × ${finalBInt} = ${nat * finalBInt}이므로 `),
      txt(`${nat} × ${nj(fmtDec(finalB), '은/는')} ${nat * finalBInt}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`인 ${fmtDec(answer)}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${nat} × ${fmtDec(finalB)}`)],
      answer,
      explanation,
    };
  },
};

// ── 3. dmul-dec : (1자리 소수) × (1자리 소수) ────────────────────
const dmulDec: SkillDef = {
  id: 'dmul-dec',
  unitId: 'unitDecMul',
  title: '(소수 1자리) × (소수 1자리)',
  note: '0.1~9.9 × 0.1~9.9. 끝자리 모두 ≠ 0. 곱 ≤ 100.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    let aInt = rng.int(1, 99);
    let guard = 0;
    while (aInt % 10 === 0 && guard < 200) { aInt = rng.int(1, 99); guard++; }

    let bInt = rng.int(1, 99);
    guard = 0;
    while (bInt % 10 === 0 && guard < 200) { bInt = rng.int(1, 99); guard++; }

    let a = aInt / 10;
    let b = bInt / 10;
    let ans = mulDecimal(a, b);
    guard = 0;
    while (ans > 100 && guard < 200) {
      aInt = rng.int(1, 99);
      if (aInt % 10 === 0) { guard++; continue; }
      bInt = rng.int(1, 99);
      if (bInt % 10 === 0) { guard++; continue; }
      a = aInt / 10;
      b = bInt / 10;
      ans = mulDecimal(a, b);
      guard++;
    }
    if (ans > 100) { a = 0.4; b = 0.7; aInt = 4; bInt = 7; }

    const finalA = a, finalB = b;
    const finalAInt = Math.round(finalA * 10);
    const finalBInt = Math.round(finalB * 10);
    const answer = mulDecimal(finalA, finalB);
    const productInt = finalAInt * finalBInt;

    const explanation: MathExpr = [
      txt(`${nj(fmtDec(finalA), '은/는')} ${finalAInt}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`, ${nj(fmtDec(finalB), '은/는')} ${finalBInt}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`이에요. `),
      txt(`${finalAInt} × ${finalBInt} = ${productInt}이므로 `),
      txt(`${fmtDec(finalA)} × ${nj(fmtDec(finalB), '은/는')} ${productInt}의 `),
      { kind: 'frac', n: 1, d: 100 },
      txt(`인 ${fmtDec(answer)}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${fmtDec(finalA)} × ${fmtDec(finalB)}`)],
      answer,
      explanation,
    };
  },
};

// ── 4. dmul-dec2 : (2자리 소수) × (1자리 소수) 또는 (1자리) × (2자리) ──
const dmulDec2: SkillDef = {
  id: 'dmul-dec2',
  unitId: 'unitDecMul',
  title: '(소수 2자리) × (소수 1자리)',
  note: '0.01~9.99 × 0.1~9.9. 끝자리 ≠ 0. 곱 ≤ 100.',
  difficulty: 3,
  generate(seed) {
    const rng = new RNG(seed);
    const swapped = rng.chance(0.5); // (1자리)×(2자리) vs (2자리)×(1자리)

    // 2자리 소수: 0.01~9.99, 끝자리(100분의 1 자리) ≠ 0
    let aInt = rng.int(1, 999); // /100
    let guard = 0;
    while (aInt % 10 === 0 && guard < 200) { aInt = rng.int(1, 999); guard++; }

    // 1자리 소수: 0.1~9.9, 끝자리 ≠ 0
    let bInt = rng.int(1, 99); // /10
    guard = 0;
    while (bInt % 10 === 0 && guard < 200) { bInt = rng.int(1, 99); guard++; }

    let a = aInt / 100;
    let b = bInt / 10;
    let ans = mulDecimal(a, b);
    guard = 0;
    while (ans > 100 && guard < 200) {
      aInt = rng.int(1, 999);
      if (aInt % 10 === 0) { guard++; continue; }
      bInt = rng.int(1, 99);
      if (bInt % 10 === 0) { guard++; continue; }
      a = aInt / 100;
      b = bInt / 10;
      ans = mulDecimal(a, b);
      guard++;
    }
    if (ans > 100) { a = 1.25; b = 0.4; aInt = 125; bInt = 4; }

    const finalA = a, finalB = b;
    const finalAInt = Math.round(finalA * 100); // 2자리 소수의 정수 표현
    const finalBInt = Math.round(finalB * 10);  // 1자리 소수의 정수 표현
    const answer = mulDecimal(finalA, finalB);
    const productInt = finalAInt * finalBInt;

    const [leftStr, rightStr] = swapped
      ? [fmtDec(finalB), fmtDec(finalA)]
      : [fmtDec(finalA), fmtDec(finalB)];

    const explanation: MathExpr = [
      txt(`${nj(fmtDec(finalA), '은/는')} ${finalAInt}의 `),
      { kind: 'frac', n: 1, d: 100 },
      txt(`, ${nj(fmtDec(finalB), '은/는')} ${finalBInt}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`이에요. `),
      txt(`${finalAInt} × ${finalBInt} = ${productInt}이므로 `),
      txt(`${fmtDec(finalA)} × ${nj(fmtDec(finalB), '은/는')} ${productInt}의 `),
      { kind: 'frac', n: 1, d: 1000 },
      txt(`인 ${fmtDec(answer)}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: '계산하세요.',
      expr: [txt(`${leftStr} × ${rightStr}`)],
      answer,
      explanation,
    };
  },
};

// ── 5. dmul-point : 소수점 위치 추론 (4지선다) ───────────────────
const dmulPoint: SkillDef = {
  id: 'dmul-point',
  unitId: 'unitDecMul',
  title: '소수점 위치 추론',
  note: '정수 곱셈 결과를 이용해 소수 곱셈 결과의 소수점 위치를 고른다.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 두 자연수 a, b를 선택하여 a × b = productInt 를 기반으로 소수 문제 구성
    // a: 10~99, b: 10~99, 곱 ≤ 9999
    let aBase = rng.int(11, 99);
    let bBase = rng.int(11, 99);
    let guard = 0;
    while ((aBase % 10 === 0 || bBase % 10 === 0) && guard < 200) {
      aBase = rng.int(11, 99);
      bBase = rng.int(11, 99);
      guard++;
    }
    if (aBase % 10 === 0) aBase += 1;
    if (bBase % 10 === 0) bBase += 1;

    const productInt = aBase * bBase;

    // 소수 변환: 둘 다 1자리 소수로 (/10 × /10 = /100)
    const aDec = aBase / 10;
    const bDec = bBase / 10;
    const correctAnswer = mulDecimal(aDec, bDec); // productInt / 100

    // 보기 후보: 소수점을 다른 위치에 놓은 값들
    const candidateValues = [
      productInt,                        // 소수점 없음 (함정)
      productInt / 10,                   // /10 (함정)
      productInt / 100,                  // /100 = 정답
      productInt / 1000,                 // /1000 (함정)
      productInt / 10000,                // /10000 (함정)
      productInt * 10,                   // ×10 (함정)
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

    // 후보 부족 시 추가
    if (candidates.length < 3) {
      const extra = [productInt / 100000, productInt * 100];
      for (const v of extra) {
        if (v <= 0 || seen.has(v)) continue;
        seen.add(v);
        candidates.push({ kind: 'decimal', v });
        if (candidates.length >= 6) break;
      }
    }

    const { choices, answerIndex } = buildChoices(answerCV, candidates, rng);

    const explanation: MathExpr = [
      txt(`${aBase} × ${bBase} = ${productInt}임을 이용해요. `),
      txt(`${nj(fmtDec(aDec), '은/는')} ${aBase}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`, ${nj(fmtDec(bDec), '은/는')} ${bBase}의 `),
      { kind: 'frac', n: 1, d: 10 },
      txt(`이므로 두 소수의 곱은 ${productInt}의 `),
      { kind: 'frac', n: 1, d: 100 },
      txt(`인 ${fmtDec(correctAnswer)}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${aBase} × ${bBase} = ${productInt}임을 이용하여 ${fmtDec(aDec)} × ${nj(fmtDec(bDec), '을/를')} 구하세요.`,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 6. dmul-word : 소수의 곱셈 문장제 ───────────────────────────
const dmulWord: SkillDef = {
  id: 'dmul-word',
  unitId: 'unitDecMul',
  title: '소수의 곱셈 문장제',
  note: '소수의 곱셈을 활용하는 실생활 문장제. 소재 5가지 이상.',
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
      // 자동차: 휘발유 1 L로 N.d km
      let kmInt = rng.int(85, 165); // 8.5~16.5 km/L
      while (kmInt % 10 === 0) kmInt = rng.int(85, 165);
      const kmPerL = kmInt / 10;
      // 기름량: 0.4~0.9 L (1자리 소수)
      let fuelInt = rng.int(4, 9);
      let ans = mulDecimal(kmPerL, fuelInt / 10);
      let guard = 0;
      while (ans > 100 && guard < 50) { fuelInt = rng.int(4, 9); ans = mulDecimal(kmPerL, fuelInt / 10); guard++; }
      const fuel = fuelInt / 10;
      answer = mulDecimal(kmPerL, fuel);
      unit = 'km';
      prompt = `휘발유 1 L로 ${fmtDec(kmPerL)} km를 가는 자동차가 ${fmtDec(fuel)} L의 휘발유로 갈 수 있는 거리는 몇 km인가요?`;
      explanation = [
        txt(`1 L로 ${fmtDec(kmPerL)} km를 가므로 ${fmtDec(fuel)} L로는 `),
        txt(`${fmtDec(kmPerL)} × ${fmtDec(fuel)} = ${fmtDec(answer)} km를 가요.`),
      ];

    } else if (templateIdx === 1) {
      // 설탕: 한 봉지 N.dd kg × 자연수 봉지
      let bagInt = rng.int(11, 99); // 0.11~0.99 kg
      while (bagInt % 10 === 0) bagInt = rng.int(11, 99);
      const bagKg = bagInt / 100;
      const bags = rng.int(2, 9);
      answer = mulDecimal(bagKg, bags);
      unit = 'kg';
      prompt = `한 봉지에 ${fmtDec(bagKg)} kg인 설탕 ${bags}봉지의 무게는 모두 몇 kg인가요?`;
      const bagInt100 = Math.round(bagKg * 100);
      explanation = [
        txt(`${fmtDec(bagKg)} kg인 설탕이 ${bags}봉지이므로 `),
        txt(`${fmtDec(bagKg)} × ${bags} = ${fmtDec(answer)} kg이에요. `),
        txt(`(${bagInt100} × ${bags} = ${bagInt100 * bags}, 이것의 `),
        { kind: 'frac', n: 1, d: 100 },
        txt(`이 ${fmtDec(answer)} kg)`),
      ];

    } else if (templateIdx === 2) {
      // 리본: 1 m 가격 N원 × 소수 m (정수 답도 OK)
      const pricePerM = rng.int(200, 900) * 10; // 2000~9000원, 100단위
      // 길이: 1자리 소수 0.5~2.5 m
      let lenInt = rng.int(5, 25);
      while (lenInt % 10 === 0) lenInt = rng.int(5, 25);
      const len = lenInt / 10;
      answer = mulDecimal(pricePerM, len);
      unit = '원';
      prompt = `리본 1 m의 가격이 ${pricePerM}원일 때, ${fmtDec(len)} m의 가격은 얼마인가요?`;
      const lenInt10 = Math.round(len * 10);
      explanation = [
        txt(`1 m에 ${pricePerM}원이므로 ${fmtDec(len)} m는 `),
        txt(`${pricePerM} × ${fmtDec(len)} = ${fmtDec(answer)}원이에요. `),
        txt(`(${pricePerM} × ${lenInt10} = ${pricePerM * lenInt10}, 이것의 `),
        { kind: 'frac', n: 1, d: 10 },
        txt(`이 ${fmtDec(answer)}원)`),
      ];

    } else if (templateIdx === 3) {
      // 물통: 1분에 N.d L 나오는 수도 × 소수 분
      let rateInt = rng.int(12, 49);
      while (rateInt % 10 === 0) rateInt = rng.int(12, 49);
      const rate = rateInt / 10;
      let minInt = rng.int(2, 9);
      let ans = mulDecimal(rate, minInt);
      let guard = 0;
      while (ans > 100 && guard < 50) { minInt = rng.int(2, 9); ans = mulDecimal(rate, minInt); guard++; }
      answer = mulDecimal(rate, minInt);
      unit = 'L';
      prompt = `1분에 ${fmtDec(rate)} L씩 나오는 수도로 ${minInt}분 동안 받을 수 있는 물의 양은 몇 L인가요?`;
      const rateInt10 = Math.round(rate * 10);
      explanation = [
        txt(`1분에 ${fmtDec(rate)} L이므로 ${minInt}분 동안 `),
        txt(`${fmtDec(rate)} × ${minInt} = ${fmtDec(answer)} L를 받을 수 있어요. `),
        txt(`(${rateInt10} × ${minInt} = ${rateInt10 * minInt}, 이것의 `),
        { kind: 'frac', n: 1, d: 10 },
        txt(`이 ${fmtDec(answer)} L)`),
      ];

    } else if (templateIdx === 4) {
      // 철사: 1 m 무게 N.dd kg × 자연수
      let wireInt = rng.int(12, 99);
      while (wireInt % 10 === 0) wireInt = rng.int(12, 99);
      const wireKg = wireInt / 100;
      const meters = rng.int(2, 9);
      answer = mulDecimal(wireKg, meters);
      unit = 'kg';
      prompt = `철사 1 m의 무게가 ${fmtDec(wireKg)} kg일 때, 철사 ${meters} m의 무게는 몇 kg인가요?`;
      const wireInt100 = Math.round(wireKg * 100);
      explanation = [
        txt(`1 m에 ${fmtDec(wireKg)} kg이므로 ${meters} m는 `),
        txt(`${fmtDec(wireKg)} × ${meters} = ${fmtDec(answer)} kg이에요. `),
        txt(`(${wireInt100} × ${meters} = ${wireInt100 * meters}, 이것의 `),
        { kind: 'frac', n: 1, d: 100 },
        txt(`이 ${fmtDec(answer)} kg)`),
      ];

    } else {
      // 운동장 걷기: 한 바퀴 N.d km × 소수 바퀴
      let lapInt = rng.int(3, 15);
      while (lapInt % 10 === 0) lapInt = rng.int(3, 15);
      const lapKm = lapInt / 10;
      let timesInt = rng.int(3, 25);
      while (timesInt % 10 === 0) timesInt = rng.int(3, 25);
      let guard = 0;
      while (mulDecimal(lapKm, timesInt / 10) > 100 && guard < 100) {
        timesInt = rng.int(3, 25);
        if (timesInt % 10 === 0) { guard++; continue; }
        guard++;
      }
      const finalTimes = timesInt / 10;
      answer = mulDecimal(lapKm, finalTimes);
      unit = 'km';
      prompt = `운동장 한 바퀴가 ${fmtDec(lapKm)} km일 때, ${fmtDec(finalTimes)} 바퀴를 걸으면 모두 몇 km를 걷게 되나요?`;
      const lapInt10 = Math.round(lapKm * 10);
      const timesInt10 = Math.round(finalTimes * 10);
      explanation = [
        txt(`한 바퀴가 ${fmtDec(lapKm)} km이므로 ${fmtDec(finalTimes)} 바퀴는 `),
        txt(`${fmtDec(lapKm)} × ${fmtDec(finalTimes)} = ${fmtDec(answer)} km예요. `),
        txt(`(${lapInt10} × ${timesInt10} = ${lapInt10 * timesInt10}, 이것의 `),
        { kind: 'frac', n: 1, d: 100 },
        txt(`이 ${fmtDec(answer)} km)`),
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

export const unitDecMulSkills: SkillDef[] = [
  dmulNat,
  dmulNat2,
  dmulDec,
  dmulDec2,
  dmulPoint,
  dmulWord,
];
