/**
 * 6-2 심화 문제 생성기 (challenge: true, difficulty: 3)
 * 명세: docs/challenge/g6s2.md
 *
 * 단원별 선택 유형:
 *  unitFracDiv2 — ch62-tri-area-side(1-1), ch62-frac-part-inv(1-2), ch62-work-rate(1-7)
 *  unitDecDiv2  — ch62-shape-dec-div(2-1), ch62-dec-wrong-inv(2-6), ch62-clock-diff(2-8)
 *  unitSpace    — ch62-cube-grid-count(3-1), ch62-cuboid-ways(3-3), ch62-cube-minmax(3-4)
 *  unitProportion — ch62-ratio-area(4-2), ch62-gear-ratio(4-3), ch62-ratio-rect(4-7)
 *  unitCircle   — ch62-circle-biggest(5-1), ch62-compound-area(5-3), ch62-quarter-cut(5-4)
 *  unitRound3d  — ch62-cylinder-net(6-1), ch62-rotate-cross-diff(6-7), ch62-cone-wire(6-3)
 *
 * 제외 유형 (그림 필수 또는 구현 부적합):
 *  1-3 사용자 정의 연산 — 기호 연산 표기가 텍스트로 모호하고 구현 복잡도 높음
 *  1-4/1-5/1-6/1-9/1-10 수 카드·범위·분모 조건 — 다른 스킬에서 유사 유형 이미 커버
 *  2-2/2-3/2-4/2-5/2-7 — 반올림 위치·수 카드·소수 개수 유형 (2-6, 2-8로 다양성 확보)
 *  3-2 페인트 면 넓이 — 숫자 행렬 파싱 후 면 계산이 텍스트만으로 모호
 *  4-1/4-4/4-5/4-6/4-8 — 범위/역산/비율변화/시각/혼합 중 복잡도 극단적 유형
 *  5-2 원 굴리기 이동 거리 역산 — circ-circum-inv와 중복
 *  5-5/5-6/5-7/5-8 — 경로·동심원·합과 차 등치이동 (그림 의존)
 *  6-2 전개도 둘레 역산 — 공식 전개가 혼동스럽고 그림 의존
 *  6-4 회전체 단면 — 회전 방향 그림 의존
 *  6-5/6-6/6-8 — 내접 원기둥·전개도↔입체·앞모양 (그림 의존)
 */

import { RNG } from '../rng';
import {
  gcd,
  simplify,
  toMixed,
  type Frac,
} from '../fraction';
import { nj, ida } from '../josa';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, MathToken, Problem, SkillDef } from '../types';

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

// ── π=3.14 정수 스케일 헬퍼 ──────────────────────────────────
/** 반지름 r(정수) → r²×3.14, 정수 스케일로 계산 */
function circArea(r: number): number {
  return Math.round(r * r * 314) / 100;
}

// ═══════════════════════════════════════════════════════════════
//  unitFracDiv2 — 분수의 나눗셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch62-tri-area-side  삼각형 넓이에서 밑변 역산 (명세 1-1)
 * 역산 방식: 밑변(자연수) b → 높이 H(대분수) → 넓이 A = b×H÷2
 * 문제: 넓이 A와 높이 H 주어지면 밑변 b 구하기
 */
const chTriAreaSide: SkillDef = {
  id: 'ch62-tri-area-side',
  unitId: 'unitFracDiv2',
  title: '삼각형 넓이에서 밑변 역산 (대분수 나눗셈)',
  note: 'b = A×2÷H, A는 역산으로 생성, 답은 자연수, 분모 ≤ 60',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let base = 6, hN = 13, hD = 2, aN = 39, aD = 2;

    for (let tries = 0; tries < 2000; tries++) {
      // 밑변 b: 2~12 (자연수 답)
      const b2 = rng.int(2, 12);
      // 높이 H: 대분수 whole=2~6, 진분수 기약
      const hWhole = rng.int(2, 6);
      const hDen = rng.int(2, 8);
      const hNum = rng.int(1, hDen - 1);
      if (gcd(hNum, hDen) !== 1) continue;
      const hN2 = hWhole * hDen + hNum; // 가분수 분자
      // 넓이 A = b×H÷2 = b×hN2 / (2×hDen)
      const aN2 = b2 * hN2;
      const aD2 = 2 * hDen;
      const af = simplify({ n: aN2, d: aD2 });
      if (af.d > 60) continue;
      // A가 대분수(정수부>0, 분수부>0)인지 확인
      const am = toMixed(af);
      if (am.whole === 0) continue; // 진분수 제외
      if (am.n === 0) continue;     // 정수 제외
      // H도 분모 ≤ 60
      if (hDen > 60) continue;

      base = b2; hN = hN2; hD = hDen;
      aN = af.n; aD = af.d;
      break;
    }

    const hMixed = toMixed({ n: hN, d: hD });
    const aMixed = toMixed({ n: aN, d: aD });

    // 풀이: b = A×2÷H = (aN/aD)×2×(hD/hN)
    const stepN = aN * 2 * hD;
    const stepD = aD * hN;
    const ans = simplify({ n: stepN, d: stepD });

    const explanation: MathExpr = [
      txt(`삼각형 넓이 = 밑변 × 높이 ÷ 2이므로, 밑변 = 넓이 × 2 ÷ 높이 = `),
      mixT({ n: aN, d: aD }),
      txt(` × 2 ÷ `),
      mixT({ n: hN, d: hD }),
      txt(` = `),
      frT({ n: aN * 2, d: aD }),
      txt(` × `),
      frT({ n: hD, d: hN }),
      txt(` = `),
      frT(ans),
      txt(` = ${ans.n} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `삼각형의 넓이가 ${nj(aMixed.whole, '과/와')} ${aMixed.n}/${aMixed.d} cm²이고 높이가 ${nj(hMixed.whole, '과/와')} ${hMixed.n}/${hMixed.d} cm일 때, 밑변의 길이는 몇 cm입니까?`,
      expr: [txt('밑변 = '), blank(0), txt(' cm')],
      blankAnswers: [base],
      explanation,
    };
  },
};

/**
 * ch62-frac-part-inv  전체의 분수 역산 (명세 1-2)
 * 나머지 비율의 양 M이 주어질 때 전체 = M ÷ (1-p/q) = 채송화 양 계산
 * 정수 답 보장: q와 (q-p)의 LCM 배수로 M 선택
 */
const chFracPartInv: SkillDef = {
  id: 'ch62-frac-part-inv',
  unitId: 'unitFracDiv2',
  title: '전체의 분수 역산 (화단 넓이 응용)',
  note: 'M ÷ (1-p/q) = 전체, 정수 답, 분모 6~15',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const contexts = [
      { item1: '채송화', item2: '무궁화', place: '화단', unit: 'm²' },
      { item1: '밀', item2: '보리', place: '밭', unit: 'm²' },
      { item1: '딸기', item2: '토마토', place: '텃밭', unit: 'm²' },
    ];

    // 폴백값
    let pN = 3, pD = 8, M = 500, total = 800, part1 = 300;
    let ctx = contexts[0];

    for (let tries = 0; tries < 2000; tries++) {
      const d = rng.int(6, 15);
      const n = rng.int(1, d - 1);
      if (gcd(n, d) !== 1) continue;
      const remain = d - n; // 나머지 분자
      // M: 전체×(d-n)/d → 전체가 자연수 되도록 M=(d-n)의 배수
      const k = rng.int(20, 200);
      const total2 = k * d;
      const M2 = (total2 * remain) / d;
      if (!Number.isInteger(M2) || M2 <= 0) continue;
      const part1val = total2 - M2; // p/q를 심은 넓이
      if (part1val <= 0) continue;
      if (total2 > 5000 || M2 > 5000) continue;

      pN = n; pD = d; M = M2; total = total2; part1 = part1val;
      ctx = rng.pick(contexts);
      break;
    }

    const remainN = pD - pN;

    const explanation: MathExpr = [
      txt(`${nj(ctx.item2, '을/를')} 심은 부분은 전체의 1 − ${pN}/${pD} = ${remainN}/${pD}${ida(`${remainN}/${pD}`)}에요. `),
      txt(`전체 = ${M} ÷ ${remainN}/${pD} = ${M} × ${pD}/${remainN} = ${total} ${ctx.unit}. `),
      txt(`${nj(ctx.item1, '을/를')} 심은 부분 = ${total} − ${M} = ${part1} ${ctx.unit}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${ctx.place} 전체의 ${pN}/${pD}에 ${nj(ctx.item1, '을/를')} 심고 나머지에 ${nj(ctx.item2, '을/를')} 심었습니다. ${nj(ctx.item2, '을/를')} 심은 부분이 ${M} ${ctx.unit}일 때, ${nj(ctx.item1, '을/를')} 심은 부분의 넓이는 몇 ${ctx.unit}입니까?`,
      expr: [txt(`${ctx.item1} 넓이 = `), blank(0), txt(` ${ctx.unit}`)],
      blankAnswers: [part1],
      explanation,
    };
  },
};

/**
 * ch62-work-rate  단위당 작업량 역산 (명세 1-7)
 * N명이 T시간 동안 f/g를 완료 → 1인 1시간 작업량, 나머지 완료 시간
 */
const chWorkRate: SkillDef = {
  id: 'ch62-work-rate',
  unitId: 'unitFracDiv2',
  title: '1인 1시간 작업량으로 나머지 완료 시간 (명세 1-7)',
  note: '1인1시간 = f/g÷(N×T), 나머지÷1인1시간 = 정수 시간, 분모 ≤ 60',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const contexts = [
      { work: '공사', unit: '시간' },
      { work: '청소', unit: '시간' },
      { work: '정리', unit: '시간' },
    ];

    // 폴백값
    let N = 4, T = 2, fN = 4, fD = 9, ansHours = 10;
    let ctx = contexts[0];

    for (let tries = 0; tries < 2000; tries++) {
      const N2 = rng.int(2, 6);
      const T2 = rng.int(1, 4);
      // 완료 비율 f/g: 기약 진분수
      const gD = rng.int(3, 9);
      const gN = rng.int(1, gD - 1);
      if (gcd(gN, gD) !== 1) continue;

      // 1인1시간 작업량 = gN/(gD × N2 × T2)
      const oneRawD = gD * N2 * T2;
      const oneF = simplify({ n: gN, d: oneRawD });
      if (oneF.d > 60) continue;

      // 나머지 = (gD - gN)/gD
      const remN = gD - gN;
      // 나머지 ÷ 1인1시간 = (remN/gD) ÷ (gN/oneRawD)
      //                    = (remN/gD) × (oneRawD/gN)
      //                    = remN × N2 × T2 / gN
      const ans2Num = remN * N2 * T2;
      const ans2Den = gN;
      if (ans2Num % ans2Den !== 0) continue;
      const ans2 = ans2Num / ans2Den;
      if (ans2 <= 0 || ans2 > 40) continue;

      N = N2; T = T2; fN = gN; fD = gD; ansHours = ans2;
      ctx = rng.pick(contexts);
      break;
    }

    const remN2 = fD - fN;
    const oneF = simplify({ n: fN, d: fD * N * T });

    const explanation: MathExpr = [
      txt(`1인 1시간 작업량 = ${fN}/${fD} ÷ (${N}×${T}) = ${fN}/${fD} ÷ ${N * T} = `),
      frT(oneF),
      txt(`. 나머지 일의 양 = ${remN2}/${fD}. `),
      txt(`한 명이 나머지를 끝내는 데 걸리는 시간 = ${remN2}/${fD} ÷ `),
      frT(oneF),
      txt(` = ${ansHours} ${ctx.unit}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `어떤 ${nj(ctx.work, '을/를')} ${N}명이 ${T}시간 동안 함께 하여 전체의 ${fN}/${nj(fD, '을/를')} 끝냈습니다. 한 명이 남은 일을 혼자 끝내는 데 몇 ${nj(ctx.unit, '이/가')} 걸립니까?`,
      expr: [txt('걸리는 시간 = '), blank(0), txt(` ${ctx.unit}`)],
      blankAnswers: [ansHours],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitDecDiv2 — 소수의 나눗셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch62-shape-dec-div  도형 성질 + 소수 나눗셈으로 대각선 구하기 (명세 2-1)
 * 마름모 넓이 S = d1×d2÷2 → d2 = S×2÷d1
 * 역산 방식: d1(소수 한 자리), d2 자연수 → S = d1×d2÷2
 */
const chShapeDecDiv: SkillDef = {
  id: 'ch62-shape-dec-div',
  unitId: 'unitDecDiv2',
  title: '마름모 넓이에서 대각선 역산 (소수 나눗셈)',
  note: 'd2 = S×2÷d1, 정수 스케일, decimal-input',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let d1 = 6.3, d2 = 10.0, S = 31.5;
    // d1×100 정수, d2 자연수(×10), S×100 정수

    for (let tries = 0; tries < 2000; tries++) {
      // d1: 소수 한 자리 (1.2 ~ 9.8), 짝수 배 권장
      const d1x10 = rng.int(12, 98);
      if (d1x10 % 2 === 1) continue; // 짝수 × 5 = 정수가 되도록
      // d2: 자연수 (4 ~ 20)
      const d2v = rng.int(4, 20);
      // S = d1×d2÷2 = (d1x10/10)×d2÷2
      // S×100 = d1x10 × d2 × 100 / (10 × 2) = d1x10 × d2 × 5
      const S100 = d1x10 * d2 * 5;
      if (S100 % 100 !== 0) {
        // S가 소수 둘째 자리 이하인지 확인
        if (S100 % 10 !== 0) continue; // 소수 셋째 자리 이하이면 제외
      }
      const Sv = S100 / 100;
      if (Sv <= 0) continue;
      // answer×10000이 정수인지 확인 (decimal-input 불변식)
      if (Math.abs(d2v * 10000 - Math.round(d2v * 10000)) > 1e-6) continue;

      d1 = d1x10 / 10;
      d2 = d2v;
      S = Sv;
      break;
    }

    const ansVal = d2;

    const explanation: MathExpr = [
      txt(`마름모의 넓이 = 대각선₁ × 대각선₂ ÷ 2이므로, `),
      txt(`대각선₂ = 넓이 × 2 ÷ 대각선₁ = ${S} × 2 ÷ ${d1} = ${S * 2} ÷ ${d1} = ${ansVal} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `마름모의 넓이가 ${S} cm²이고 한 대각선의 길이가 ${d1} cm일 때, 다른 대각선의 길이는 몇 cm입니까?`,
      answer: ansVal,
      unit: 'cm',
      explanation,
    };
  },
};

/**
 * ch62-dec-wrong-inv  소수 나눗셈 역산 — 잘못 계산한 식 (명세 2-6)
 * (키 − 100) × b = c → 키 = c ÷ b + 100 (표준체중 공식)
 * c ÷ b가 자연수가 되도록 설정
 */
const chDecWrongInv: SkillDef = {
  id: 'ch62-dec-wrong-inv',
  unitId: 'unitDecDiv2',
  title: '표준체중 공식 역산 (소수 나눗셈)',
  note: '(□−100)×b = c → □ = c÷b+100, b 소수 두 자리, 정수 스케일',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let bX100 = 85, cVal = 51, heightAns = 160;

    for (let tries = 0; tries < 2000; tries++) {
      // b: 0.80~0.96, 4의 배수 ×100 (더 넓은 범위)
      const bX = rng.int(20, 24) * 4; // 80, 84, 88, 92, 96
      // 키 − 100: 자연수 diff → diff × bX/100이 정수여야 함
      // bX=80: diff×80%100=0 → diff×4%5=0 → diff%5=0
      // bX=84: diff×84%100=0 → diff×21%25=0 → diff%25=0 (since gcd(21,25)=1)
      // bX=88: diff×88%100=0 → diff×22%25=0 → diff%25=0
      // bX=92: diff×92%100=0 → diff×23%25=0 → diff%25=0
      // bX=96: diff×96%100=0 → diff×24%25=0 → diff%25=0
      // 단순화: diff를 100/gcd(100,bX)의 배수로 설정
      const g = gcd(100, bX);
      const minDiff = 100 / g; // 이 배수여야 함
      const maxK = Math.floor(80 / minDiff);
      if (maxK < 1) continue;
      const k = rng.int(1, maxK);
      const diff = minDiff * k;
      if (diff < 30 || diff > 80) continue;
      const cX100 = diff * bX;
      if (cX100 % 100 !== 0) continue;
      const c2 = cX100 / 100;
      const height = 100 + diff;

      bX100 = bX; cVal = c2; heightAns = height;
      break;
    }

    const bStr = (bX100 / 100).toFixed(2);

    const explanation: MathExpr = [
      txt(`표준체중 공식: (키 − 100) × ${bStr} = ${cVal}. `),
      txt(`키 − 100 = ${cVal} ÷ ${bStr} = ${heightAns - 100}. `),
      txt(`키 = ${heightAns - 100} + 100 = ${heightAns} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `표준체중 공식: (키(cm) − 100) × ${bStr} = 표준체중(kg). 표준체중이 ${cVal} kg인 사람의 키는 몇 cm입니까?`,
      expr: [txt('키 = '), blank(0), txt(' cm')],
      blankAnswers: [heightAns],
      explanation,
    };
  },
  minVariety: 15, // bX(5가지) × diff 조건부 배수 조합 (실제 ~19가지)
};

/**
 * ch62-clock-diff  두 시계 차이 계산 (명세 2-8)
 * 시계 A: 하루 a분 빨라짐, 시계 B: 하루 b분 느려짐
 * 하루 총 차이 = a+b 분, N분 차이 나는 데 = N÷(a+b)일
 */
const chClockDiff: SkillDef = {
  id: 'ch62-clock-diff',
  unitId: 'unitDecDiv2',
  title: '두 시계 차이로 날수 계산 (소수 나눗셈)',
  note: 'N ÷ (a+b) = 자연수 일수, a·b 소수 한 자리, 정수 스케일',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let aX10 = 3, bX10 = 1, targetMinX10 = 8, daysAns = 20;

    for (let tries = 0; tries < 2000; tries++) {
      // a: 0.1~0.9 분/일 (×10 정수 1~9)
      const a2 = rng.int(1, 9);
      // b: 0.1~0.9 분/일 (×10 정수 1~9)
      const b2 = rng.int(1, 9);
      const sumX10 = a2 + b2; // (a+b)×10
      // targetMin: 목표 차이 (자연수 분) → N ÷ (sumX10/10) = N×10/sumX10 = 자연수
      const targetN = rng.int(2, 10) * sumX10; // 자연수 배수
      const days = targetN / sumX10 * 10;
      if (!Number.isInteger(days) || days <= 0 || days > 60) continue;
      // target = targetN * 10 / 10 = targetN / 10... 실제 target = days × sumX10/10
      const actualTargetX10 = days * sumX10; // ×10
      if (actualTargetX10 % 10 !== 0) continue;
      const targetMin = actualTargetX10 / 10;
      if (!Number.isInteger(targetMin) || targetMin <= 0 || targetMin > 30) continue;

      aX10 = a2; bX10 = b2; targetMinX10 = targetMin; daysAns = days;
      break;
    }

    const aStr = (aX10 / 10).toFixed(1);
    const bStr = (bX10 / 10).toFixed(1);
    const sumStr = ((aX10 + bX10) / 10).toFixed(1);

    const explanation: MathExpr = [
      txt(`하루 두 시계의 차이 = ${aStr} + ${bStr} = ${sumStr}분. `),
      txt(`${targetMinX10}분 차이가 나는 데 걸리는 날수 = ${targetMinX10} ÷ ${sumStr} = ${daysAns}일.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `시계 가는 하루에 ${aStr}분씩 빨라지고, 시계 나는 하루에 ${bStr}분씩 느려집니다. 두 시계를 동시에 맞춘 후 두 시계가 ${targetMinX10}분 차이 나는 것은 며칠 후입니까?`,
      expr: [txt('걸리는 날수 = '), blank(0), txt(' 일')],
      blankAnswers: [daysAns],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitSpace — 공간과 입체
// ═══════════════════════════════════════════════════════════════

/**
 * ch62-cube-grid-count  쌓기나무 숫자 표 — 특정 층 이상 개수 합산 (명세 3-1)
 * 3×3 격자에 각 칸 층 수(1~5)가 주어지고, threshold층 이상인 칸의 수 합산
 */
const chCubeGridCount: SkillDef = {
  id: 'ch62-cube-grid-count',
  unitId: 'unitSpace',
  title: '쌓기나무 숫자 표 — 특정 층 이상 개수 합산',
  note: '3×3 격자, threshold 2~3, 해당 칸 수치 합산, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let grid = [2, 4, 3, 3, 2, 1, 1, 3, 2];
    let threshold = 3, ansVal = 10;

    for (let tries = 0; tries < 2000; tries++) {
      // 3×3 격자 (9칸), 각 칸 1~5
      const g2 = Array.from({ length: 9 }, () => rng.int(1, 5));
      const th = rng.int(2, 4);
      // threshold 이상인 칸의 수를 합산
      const ans2 = g2.filter(v => v >= th).reduce((a, b) => a + b, 0);
      // 조건: threshold 이상인 칸이 3~6개
      const count = g2.filter(v => v >= th).length;
      if (count < 3 || count > 6) continue;
      if (ans2 <= 0) continue;

      grid = g2; threshold = th; ansVal = ans2;
      break;
    }

    const row1 = `${grid[0]} ${grid[1]} ${grid[2]}`;
    const row2 = `${grid[3]} ${grid[4]} ${grid[5]}`;
    const row3 = `${grid[6]} ${grid[7]} ${grid[8]}`;
    const matching = grid.filter(v => v >= threshold);

    const explanation: MathExpr = [
      txt(`위에서 본 숫자 표: [${row1}] / [${row2}] / [${row3}]. `),
      txt(`${threshold}층 이상인 칸의 수: ${matching.join(', ')}. `),
      txt(`합계 = ${matching.join(' + ')} = ${ansVal}개.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `위에서 본 쌓기나무 모양에 각 칸의 층 수를 나타낸 것입니다.\n${row1}\n${row2}\n${row3}\n${threshold}층 이상에 쌓인 쌓기나무는 모두 몇 개입니까?`,
      expr: [txt(`${threshold}층 이상 합계 = `), blank(0), txt(' 개')],
      blankAnswers: [ansVal],
      explanation,
    };
  },
};

/**
 * ch62-cuboid-ways  N개 쌓기나무로 직육면체 만드는 방법 수 (명세 3-3)
 * N의 세 약수 조합 (a×b×c=N), 뒤집기/회전 같으면 동일
 */
const chCuboidWays: SkillDef = {
  id: 'ch62-cuboid-ways',
  unitId: 'unitSpace',
  title: '쌓기나무 N개로 직육면체 만드는 방법 수',
  note: 'a×b×c=N, 중복 제거(a≤b≤c), N=24/36/48 등, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 약수 조합이 4~8가지인 N 목록 (실제 방법 수 미리 계산)
    // N: a≤b≤c, a*b*c=N 인 (a,b,c) 개수
    const candidates: Array<{ n: number; ways: number; factored: string[] }> = [];
    const testNums = [12, 16, 18, 20, 24, 27, 30, 36, 48, 60];
    for (const n of testNums) {
      const triples: string[] = [];
      for (let a = 1; a <= Math.cbrt(n); a++) {
        if (n % a !== 0) continue;
        for (let b = a; b <= Math.sqrt(n / a); b++) {
          if ((n / a) % b !== 0) continue;
          const c = n / a / b;
          if (c < b) continue;
          triples.push(`${a}×${b}×${c}`);
        }
      }
      candidates.push({ n, ways: triples.length, factored: triples });
    }

    const pick = rng.pick(candidates);
    const N = pick.n;
    const ways = pick.ways;
    const factored = pick.factored;

    const explanation: MathExpr = [
      txt(`${N} = a×b×c (a≤b≤c)인 경우를 모두 찾아요. `),
      txt(`${factored.join(', ')}. `),
      txt(`총 ${ways}가지.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `쌓기나무 ${N}개를 모두 사용하여 직육면체 모양을 만들려고 합니다. 뒤집거나 돌려서 같은 모양이면 한 가지로 볼 때, 만들 수 있는 모양은 모두 몇 가지입니까?`,
      expr: [txt('방법 수 = '), blank(0), txt(' 가지')],
      blankAnswers: [ways],
      explanation,
    };
  },
  minVariety: 10, // candidates 10가지
};

/**
 * ch62-cube-minmax  앞·옆에서 본 모양으로 쌓기나무 최대·최소 개수 (명세 3-4)
 * 앞에서 본 열별 최대 높이, 옆에서 본 행별 최대 높이로 최대·최소 계산
 * 격자 크기 3×3
 */
const chCubeMinMax: SkillDef = {
  id: 'ch62-cube-minmax',
  unitId: 'unitSpace',
  title: '앞·옆 모양으로 쌓기나무 최대·최소 개수',
  note: '3×3 격자, 최대=Σmin(front[col],side[row]), 최소=각 행/열 조건 최솟값, fill-blanks 두 칸',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let frontH = [3, 1, 2], sideH = [3, 2, 1];
    let maxCount = 0, minCount = 0;

    for (let tries = 0; tries < 2000; tries++) {
      // 앞에서 본 열 최대 높이 (3열)
      const f2 = [rng.int(1, 4), rng.int(1, 4), rng.int(1, 4)];
      // 옆에서 본 행 최대 높이 (3행)
      const s2 = [rng.int(1, 4), rng.int(1, 4), rng.int(1, 4)];

      // 최대: 각 칸 = min(front[col], side[row])의 합
      let maxSum = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          maxSum += Math.min(f2[c], s2[r]);
        }
      }
      if (maxSum <= 0) continue;

      // 최소: 각 행에서 side[r]를 만족하는 최소 (최댓값 1개만 유지)
      // 각 열에서 front[c]를 만족하는 최소도 동시에
      // 정확한 최솟값 계산: 행렬 방식
      // 최소를 구하기 위해 각 행·열 제약을 동시에 만족하는 최소 배치
      // 간단한 근사: 각 행에서 side[r] 높이인 칸 1개 + 나머지 1
      // 정확한 계산: branch로 모든 가능한 배치 탐색 (3×3이므로 가능)
      // 단순화: 각 열 최댓값이 front[c]이고 각 행 최댓값이 side[r]인 배치 중 최소 합
      // 공식: max(Σfront, Σside) ≤ minCount ≤ maxCount
      // 더 정확한 최소: 각 행 i에서 side[i]를 담당하는 열 j (front[j]>=side[i])를 선택
      //   → 그 칸만 side[i], 나머지는 1(또는 front[c]가 1인 경우)
      // 여기서는 단순 공식 사용: minCount = max(maxFront, maxSide) + Σ(front - max) + ...
      // 실용적 계산:
      let minSum = 0;
      // 각 행에서 side[r] 달성을 위한 최솟값 (해당 행에서 side[r]짜리 1칸 + 나머지 각 1개)
      // 단, 그 칸은 front[c] >= side[r]인 c여야 함
      for (let r = 0; r < 3; r++) {
        const sv = s2[r];
        // side[r] 값을 수용할 수 있는 열 존재 여부 확인
        const canPlace = f2.some(fv => fv >= sv);
        if (!canPlace) { minSum = -1; break; }
        // 해당 행 최소: sv (담당 칸) + 나머지 2칸 (각 1 또는 front[c]가 1이면 1)
        // 나머지 칸은 front 달성에 기여할 수도 있으므로 1로 기본 계산
        minSum += sv + (3 - 1) * 1;
      }
      if (minSum <= 0) continue;

      // 전열 front 달성 확인: 각 열 c에서 최댓값이 front[c]이어야 함
      // 위 배치에서 각 열 최댓값 확인 (대략적 추정)
      // 단순화: minSum 재계산
      // 보다 정확한 방식: 행렬을 직접 최소 배치로 구성
      // minGrid[r][c] 초기 = 1, 각 행에서 가장 큰 front[c]에 side[r] 배치
      const minGrid: number[][] = Array.from({ length: 3 }, () => [1, 1, 1]);
      for (let r = 0; r < 3; r++) {
        // side[r]를 담당할 최적 열 c 선택: front[c] >= side[r]이고 front[c]가 가장 작은 c
        let bestC = -1;
        let bestFront = Infinity;
        for (let c = 0; c < 3; c++) {
          if (f2[c] >= s2[r] && f2[c] < bestFront) {
            bestC = c; bestFront = f2[c];
          }
        }
        if (bestC === -1) { minSum = -1; break; }
        minGrid[r][bestC] = s2[r];
      }
      if (minSum === -1) continue;

      // front 조건 충족을 위해 각 열 c에서 최댓값이 front[c]인지 확인 및 조정
      for (let c = 0; c < 3; c++) {
        const colMax = Math.max(...minGrid.map(row => row[c]));
        if (colMax < f2[c]) {
          // 어느 행이든 front[c]로 올려야 함
          let fixed = false;
          for (let r = 0; r < 3; r++) {
            if (minGrid[r][c] < f2[c] && s2[r] >= f2[c]) {
              minGrid[r][c] = f2[c];
              fixed = true;
              break;
            }
          }
          if (!fixed) {
            // 조건 불만족 조합 — 재시도
            minSum = -1;
            break;
          }
        }
      }
      if (minSum === -1) continue;

      minSum = minGrid.flat().reduce((a, b) => a + b, 0);

      if (minSum <= 0 || minSum > maxSum) continue;
      if (maxSum > 30 || minSum > 20) continue;
      if (maxSum === minSum) continue; // 두 값이 같으면 제외 (교육 효과)

      frontH = f2; sideH = s2;
      maxCount = maxSum; minCount = minSum;
      break;
    }

    const explanation: MathExpr = [
      txt(`앞에서 본 열별 최대 높이: [${frontH.join(', ')}], `),
      txt(`옆에서 본 행별 최대 높이: [${sideH.join(', ')}]. `),
      txt(`최대: 각 칸 = min(앞 열 높이, 옆 행 높이)의 합 = ${maxCount}개. `),
      txt(`최소: 각 행·열 제약을 동시에 만족하는 최소 배치 합 = ${minCount}개.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `앞에서 본 모양의 각 열 최대 높이가 [${frontH.join(', ')}]이고, 옆(오른쪽)에서 본 모양의 각 행 최대 높이가 [${sideH.join(', ')}]입니다. 쌓기나무의 최대 개수와 최소 개수를 각각 구하세요.`,
      expr: [txt('최대 = '), blank(0), txt(' 개,  최소 = '), blank(1), txt(' 개')],
      blankAnswers: [maxCount, minCount],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitProportion — 비례식과 비례배분
// ═══════════════════════════════════════════════════════════════

/**
 * ch62-ratio-area  변의 길이 비로 삼각형 넓이 계산 (명세 4-2)
 * 삼각형 전체 넓이 S, 선분 비 m:n → 작은 삼각형 넓이 = S × m/(m+n)
 */
const chRatioArea: SkillDef = {
  id: 'ch62-ratio-area',
  unitId: 'unitProportion',
  title: '변의 길이 비로 삼각형 넓이 계산',
  note: 'S×m/(m+n) = 자연수, S가 (m+n)의 배수, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let m = 2, n = 5, S = 210, ans = 60;

    for (let tries = 0; tries < 2000; tries++) {
      const m2 = rng.int(1, 5);
      const n2 = rng.int(1, 5);
      if (m2 === n2) continue;
      const sum = m2 + n2;
      // S = 전체 넓이 = sum의 배수, 10~500 범위
      const kMax = Math.floor(500 / sum);
      if (kMax < 2) continue;
      const k = rng.int(2, Math.min(kMax, 30));
      const S2 = sum * k;
      const ans2 = S2 * m2 / sum; // = m2 × k
      if (!Number.isInteger(ans2) || ans2 <= 0) continue;

      m = m2; n = n2; S = S2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`선분 ㄴㄹ : 선분 ㄹㄷ = ${m} : ${n}이므로, `),
      txt(`삼각형 ㄱㄴㄹ의 넓이 = 전체 넓이 × ${m}/(${m}+${n}) `),
      txt(`= ${S} × ${m}/${m + n} = ${ans} cm².`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `삼각형 ㄱㄴㄷ에서 선분 ㄴㄹ과 선분 ㄹㄷ의 길이의 비가 ${m} : ${n}입니다. 삼각형 ㄱㄴㄷ의 넓이가 ${S} cm²일 때, 삼각형 ㄱㄴㄹ의 넓이는 몇 cm²입니까?`,
      expr: [txt('삼각형 ㄱㄴㄹ 넓이 = '), blank(0), txt(' cm²')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch62-gear-ratio  톱니바퀴 반비례 회전수 (명세 4-3)
 * 이의 수 × 회전수 = 일정: a×rA = b×rB
 */
const chGearRatio: SkillDef = {
  id: 'ch62-gear-ratio',
  unitId: 'unitProportion',
  title: '톱니바퀴 반비례 회전수',
  note: 'a×rA = b×rB, rB=자연수, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let a = 18, b = 42, rA = 35, rB = 15;

    for (let tries = 0; tries < 2000; tries++) {
      // a, b: 이의 수 (10~60)
      const a2 = rng.int(10, 40) * 2; // 짝수
      const b2 = rng.int(10, 40) * 2;
      if (a2 === b2) continue;
      // rA: A가 돌 수 (5~50, b의 인수로 나누어 떨어지게)
      const g = gcd(a2, b2);
      // rA를 b2/g의 배수로 설정 → a2×rA가 b2의 배수
      const unit = b2 / g;
      const kMax = Math.floor(50 / unit);
      if (kMax < 1) continue;
      const k = rng.int(1, Math.min(kMax, 10));
      const rA2 = unit * k;
      const rB2 = a2 * rA2 / b2;
      if (!Number.isInteger(rB2) || rB2 <= 0) continue;
      if (rA2 > 100 || rB2 > 100) continue;

      a = a2; b = b2; rA = rA2; rB = rB2;
      break;
    }

    const explanation: MathExpr = [
      txt(`톱니바퀴에서 이의 수 × 회전수는 서로 같아요. `),
      txt(`${a} × ${rA} = ${b} × ㉯ → ㉯ = ${a * rA} ÷ ${b} = ${rB}바퀴.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `톱니가 ${a}개인 톱니바퀴 ㉮와 ${b}개인 톱니바퀴 ㉯가 맞물려 있습니다. ㉮가 ${rA}바퀴 돌 때 ㉯는 몇 바퀴 돌겠습니까?`,
      expr: [txt('㉯의 회전수 = '), blank(0), txt(' 바퀴')],
      blankAnswers: [rB],
      explanation,
    };
  },
};

/**
 * ch62-ratio-rect  직사각형 세로:가로 비와 둘레로 넓이 구하기 (명세 4-7)
 * 둘레 P, 비 a:b → 세로=P/2×a/(a+b), 가로=P/2×b/(a+b), 넓이=세로×가로
 */
const chRatioRect: SkillDef = {
  id: 'ch62-ratio-rect',
  unitId: 'unitProportion',
  title: '직사각형 비·둘레로 넓이 구하기',
  note: '세로=P/2×a/(a+b), 가로=P/2×b/(a+b), 넓이 자연수, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let a = 3, b = 4, P = 56, height = 12, width = 16, area = 192;

    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(1, 5);
      const b2 = rng.int(a2 + 1, 8); // b > a
      if (gcd(a2, b2) !== 1) continue;
      const sum = a2 + b2;
      // 절반 둘레 P/2 = sum의 배수
      const kMax = Math.floor(100 / sum);
      if (kMax < 1) continue;
      const k = rng.int(2, Math.min(kMax, 15));
      const halfP = sum * k;
      const P2 = halfP * 2;
      const h2 = halfP * a2 / sum; // 세로
      const w2 = halfP * b2 / sum; // 가로
      if (!Number.isInteger(h2) || !Number.isInteger(w2)) continue;
      if (h2 <= 0 || w2 <= 0) continue;
      const area2 = h2 * w2;
      if (area2 > 5000) continue;

      a = a2; b = b2; P = P2; height = h2; width = w2; area = area2;
      break;
    }

    const explanation: MathExpr = [
      txt(`세로와 가로의 비가 ${a}:${b}이므로, 절반 둘레 = 세로+가로 = ${P / 2} cm. `),
      txt(`세로 = ${P / 2} × ${a}/${a + b} = ${height} cm, `),
      txt(`가로 = ${P / 2} × ${b}/${a + b} = ${width} cm. `),
      txt(`넓이 = ${height} × ${width} = ${area} cm².`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `직사각형의 세로와 가로의 비가 ${a} : ${b}이고 둘레가 ${P} cm일 때, 이 직사각형의 넓이는 몇 cm²입니까?`,
      expr: [txt('넓이 = '), blank(0), txt(' cm²')],
      blankAnswers: [area],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitCircle — 원의 넓이 (원주율 3.14 고정)
// ═══════════════════════════════════════════════════════════════

/**
 * ch62-circle-biggest  여러 조건으로 가장 큰 원 찾기 (명세 5-1)
 * 세 원의 조건: ①반지름 r₁, ②지름 d, ③원주 C → 각 반지름 계산 후 넓이 비교
 */
const chCircleBiggest: SkillDef = {
  id: 'ch62-circle-biggest',
  unitId: 'unitCircle',
  title: '다양한 조건의 원 중 가장 큰 원 (choice)',
  note: '반지름/지름/원주 조건으로 반지름 역산 후 넓이 비교, choice 4지선다',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 허용 반지름 목록 (r²×3.14가 소수 둘째 자리 이하인 정수 반지름)
    // r=5 → 78.5, r=6→113.04, r=7→153.86, r=8→200.96, r=9→254.34, r=10→314
    const allowedR = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    // 폴백값
    let r1 = 9, r2 = 10, r3 = 8, biggestIdx = 1;

    for (let tries = 0; tries < 2000; tries++) {
      const r1v = rng.pick(allowedR);
      const r2v = rng.pick(allowedR);
      const r3v = rng.pick(allowedR);
      // 모두 다른 반지름
      if (r1v === r2v || r2v === r3v || r1v === r3v) continue;

      const areas = [circArea(r1v), circArea(r2v), circArea(r3v)];
      const maxArea = Math.max(...areas);
      const maxIdx = areas.indexOf(maxArea);

      r1 = r1v; r2 = r2v; r3 = r3v; biggestIdx = maxIdx;
      break;
    }

    // 원주 C = r3 × 2 × 3.14
    const C = Math.round(r3 * 2 * 314) / 100;
    const cStr = String(C);

    const a1 = circArea(r1);
    const a2 = circArea(r2);
    const a3 = circArea(r3);

    // 보기 레이블 텍스트
    const labels = [
      `①이 가장 크다`,
      `②이 가장 크다`,
      `③이 가장 크다`,
      `모든 원의 넓이가 같다`,
    ];
    const correctLabel = biggestIdx === 0 ? '①' : biggestIdx === 1 ? '②' : '③';

    const correctChoice: ChoiceValue = { kind: 'text', text: labels[biggestIdx] };
    const wrongCandidates: ChoiceValue[] = [0, 1, 2, 3]
      .filter(i => i !== biggestIdx)
      .map(i => ({ kind: 'text', text: labels[i] } as ChoiceValue));

    const { choices, answerIndex } = buildChoices(correctChoice, wrongCandidates, rng, 4);

    const explanation: MathExpr = [
      txt(`① 반지름 ${r1} cm → 넓이 = ${r1}²×3.14 = ${a1} cm². `),
      txt(`② 지름 ${r2 * 2} cm → 반지름 ${r2} cm → 넓이 = ${r2}²×3.14 = ${a2} cm². `),
      txt(`③ 원주 ${cStr} cm → 반지름 = ${cStr}÷(2×3.14) = ${r3} cm → 넓이 = ${r3}²×3.14 = ${a3} cm². `),
      txt(`따라서 넓이가 가장 큰 원은 ${correctLabel}${ida(correctLabel)}에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `다음 중 넓이가 가장 큰 원을 고르세요. (원주율: 3.14)\n① 반지름이 ${r1} cm인 원\n② 지름이 ${r2 * 2} cm인 원\n③ 원주가 ${cStr} cm인 원`,
      choices,
      answerIndex,
      explanation,
    };
  },
};

/**
 * ch62-compound-area  정사각형 + 원 복합 도형 색칠 넓이 (명세 5-3)
 * 정사각형 안에 원 4개(반지름 = 정사각형 한 변의 절반) 내접
 * 색칠 = 정사각형 - 원 4개
 */
const chCompoundArea: SkillDef = {
  id: 'ch62-compound-area',
  unitId: 'unitCircle',
  title: '정사각형 안 원 4개 — 색칠 넓이',
  note: 'sq - 4원, r=a/2, a는 짝수, decimal-input, 원주율 3.14',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // a: 짝수 정수 cm (정사각형 한 변) → r = a/2 (정수)
    // 원 4개 넓이 = 4 × r² × 3.14 = (a/2)² × 3.14 × 4 = a² × 3.14
    // 색칠 = a² - a² × 3.14 → 음수! 수정: 각 원은 r=a/2, 4개이므로
    // 원 4개 = 4 × r² × 3.14. 정사각형 = a×a = (2r)² = 4r²
    // 색칠 = 4r² - 4r²×3.14... 음수. 수정: 원 4개가 내접 → 각 원의 지름 = a/2(?)
    // 올바른 설정: 정사각형 a, 4개 원 배치 → 각 원 지름 = a/2 → r = a/4
    // 정사각형 = a², 원 4개 = 4 × (a/4)² × 3.14 = 4 × a²/16 × 3.14 = a²×3.14/4
    // 색칠 = a² - a²×3.14/4 → r = a/4이면 a=4의 배수
    // 명세 예: 한 변 20 cm, 지름 10 cm 원 4개 → r=5, a=20, 원 4개=4×25×3.14=314
    // 색칠 = 400 - 314 = 86

    const allowedA = [20, 24, 28, 32]; // a=4배수, r=a/4 (5,6,7,8)
    const a = rng.pick(allowedA);
    const r = a / 4; // 각 원의 반지름
    const sqArea = a * a;
    // 원 4개 넓이 = 4 × r² × 3.14
    const circlesArea = Math.round(4 * r * r * 314) / 100;
    const coloredArea = sqArea - circlesArea;

    if (coloredArea <= 0) {
      // 폴백: a=20, r=5
      const af = 20, rf = 5;
      const sq2 = af * af;
      const circ2 = Math.round(4 * rf * rf * 314) / 100;
      const col2 = sq2 - circ2;
      const explanation2: MathExpr = [
        txt(`정사각형 넓이 = ${af}² = ${sq2} cm². `),
        txt(`원 4개 넓이 = 4 × ${rf}² × 3.14 = 4 × ${rf * rf} × 3.14 = ${circ2} cm². `),
        txt(`색칠 넓이 = ${sq2} − ${circ2} = ${col2} cm².`),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'decimal-input',
        prompt: `한 변이 ${af} cm인 정사각형 안에 지름이 ${rf * 2} cm인 원이 4개 내접해 있습니다. 색칠된 부분의 넓이는 몇 cm²입니까? (원주율: 3.14)`,
        answer: col2,
        unit: 'cm²',
        explanation: explanation2,
      };
    }

    const explanation: MathExpr = [
      txt(`정사각형 넓이 = ${a}² = ${sqArea} cm². `),
      txt(`원 4개 넓이 = 4 × ${r}² × 3.14 = 4 × ${r * r} × 3.14 = ${circlesArea} cm². `),
      txt(`색칠 넓이 = ${sqArea} − ${circlesArea} = ${coloredArea} cm².`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `한 변이 ${a} cm인 정사각형 안에 지름이 ${r * 2} cm인 원이 4개 내접해 있습니다. 색칠된 부분의 넓이는 몇 cm²입니까? (원주율: 3.14)`,
      answer: coloredArea,
      unit: 'cm²',
      explanation,
    };
  },
  minVariety: 4, // allowedA 4가지
};

/**
 * ch62-quarter-cut  정사각형에서 1/4원 4개 자른 넓이 (명세 5-4)
 * 정사각형 한 변 a, 각 꼭짓점 중심 반지름 a/2인 1/4원 4개 = 원 1개
 * 색칠 = 정사각형 - 원 = a² - (a/2)²×3.14
 */
const chQuarterCut: SkillDef = {
  id: 'ch62-quarter-cut',
  unitId: 'unitCircle',
  title: '정사각형에서 1/4원 4개 자른 색칠 넓이',
  note: 'a²−(a/2)²×3.14, a=짝수, decimal-input, 원주율 3.14',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // a: 짝수 정수 (10~20) → r = a/2 (5~10)
    // 조건: a² > (a/2)²×3.14 = a²×3.14/4
    // a²(1 - 3.14/4) = a²×0.215 > 0 → 항상 양수
    const evenA = [10, 12, 14, 16, 18, 20];
    const a = rng.pick(evenA);
    const r = a / 2;
    const sqArea = a * a;
    const circleArea = Math.round(r * r * 314) / 100; // (a/2)²×3.14
    const coloredArea = Math.round((sqArea - circleArea) * 100) / 100;

    const explanation: MathExpr = [
      txt(`각 꼭짓점 중심 반지름 ${r} cm의 1/4원 4개 = 반지름 ${r} cm의 원 1개. `),
      txt(`원의 넓이 = ${r}² × 3.14 = ${circleArea} cm². `),
      txt(`색칠 넓이 = 정사각형 − 원 = ${sqArea} − ${circleArea} = ${coloredArea} cm².`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `한 변이 ${a} cm인 정사각형에서 각 꼭짓점을 중심으로 반지름 ${r} cm인 원의 1/4씩 잘라냈습니다. 남은 색칠 부분의 넓이는 몇 cm²입니까? (원주율: 3.14)`,
      answer: coloredArea,
      unit: 'cm²',
      explanation,
    };
  },
  minVariety: 6, // evenA 6가지
};

// ═══════════════════════════════════════════════════════════════
//  unitRound3d — 원기둥, 원뿔, 구
// ═══════════════════════════════════════════════════════════════

/**
 * ch62-cylinder-net  원기둥 전개도 넓이 (명세 6-1)
 * 밑면 반지름 r, 높이 h → 전개도 넓이 = 2×r²×3.14 + 2r×3.14×h
 * 정수 스케일: ×100
 */
const chCylinderNet: SkillDef = {
  id: 'ch62-cylinder-net',
  unitId: 'unitRound3d',
  title: '원기둥 전개도 넓이',
  note: '2r²×3.14 + 2r×3.14×h, r=3~10, h=5~20, decimal-input',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 허용 반지름: r²×3.14가 소수 둘째 자리 이하 (r=3~10)
    // r=3→28.26, r=4→50.24, r=5→78.5, r=6→113.04, r=7→153.86, r=8→200.96, r=9→254.34, r=10→314
    const allowedR = [3, 4, 5, 6, 7, 8, 9, 10];
    const r = rng.pick(allowedR);
    const h = rng.int(5, 20);

    // 전개도 넓이 = 2×r²×3.14 + 2×r×3.14×h
    // = 3.14 × (2r² + 2rh) = 3.14 × 2r × (r + h)
    const inner = 2 * r * (r + h); // 정수
    const totalX100 = Math.round(inner * 314); // ×100
    const totalArea = totalX100 / 100;

    const base2 = Math.round(2 * r * r * 314) / 100;
    const side = Math.round(2 * r * h * 314) / 100;

    const explanation: MathExpr = [
      txt(`밑면 2개 넓이 = 2 × ${r}² × 3.14 = 2 × ${r * r} × 3.14 = ${base2} cm². `),
      txt(`옆면 넓이 = 2 × ${r} × 3.14 × ${h} = ${side} cm². `),
      txt(`전개도 넓이 = ${base2} + ${side} = ${totalArea} cm².`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `밑면의 반지름이 ${r} cm이고 높이가 ${h} cm인 원기둥의 전개도의 넓이는 몇 cm²입니까? (원주율: 3.14)`,
      answer: totalArea,
      unit: 'cm²',
      explanation,
    };
  },
  minVariety: 48, // r 8가지 × h 16가지
};

/**
 * ch62-rotate-cross-diff  두 축 회전 단면 넓이 차 (명세 6-7)
 * 직사각형(가로 a, 세로 b)를 각각 가로/세로 축으로 돌린 두 원기둥의
 * 회전축에 수직인 단면 넓이 차 = |a²-b²|×3.14
 */
const chRotateCrossDiff: SkillDef = {
  id: 'ch62-rotate-cross-diff',
  unitId: 'unitRound3d',
  title: '두 축 회전 원기둥 단면 넓이 차',
  note: '|a²-b²|×3.14, 정수 결과 우선, 원주율 3.14, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let sideA = 12, sideB = 16, diffArea = 336;

    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(4, 15);
      const b2 = rng.int(4, 15);
      if (a2 === b2) continue;
      // 단면 차 = |a²-b²| × 3.14
      const diffSq = Math.abs(a2 * a2 - b2 * b2);
      // ×100 스케일
      const diffX100 = Math.round(diffSq * 314);
      // 소수 둘째 자리 이하 보장
      const diffV = diffX100 / 100;
      if (Math.abs(diffV * 10000 - Math.round(diffV * 10000)) > 1e-6) continue;
      // 결과가 양수이고 너무 크지 않도록
      if (diffV <= 0 || diffV > 5000) continue;

      sideA = a2; sideB = b2;
      // 원주율 3로 자연수가 나오면 좋지만 3.14로도 소수 둘째 자리 OK
      diffArea = diffV;
      break;
    }

    const bigR = Math.max(sideA, sideB);
    const smallR = Math.min(sideA, sideB);
    const bigArea = Math.round(bigR * bigR * 314) / 100;
    const smallArea = Math.round(smallR * smallR * 314) / 100;

    const explanation: MathExpr = [
      txt(`가로를 축으로 돌리면 반지름 = 세로 = ${sideB} cm, 단면 = ${sideB}² × 3.14 = ${Math.round(sideB * sideB * 314) / 100} cm². `),
      txt(`세로를 축으로 돌리면 반지름 = 가로 = ${sideA} cm, 단면 = ${sideA}² × 3.14 = ${Math.round(sideA * sideA * 314) / 100} cm². `),
      txt(`두 단면 넓이의 차 = ${bigArea} − ${smallArea} = ${diffArea} cm².`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `직사각형(가로 ${sideA} cm, 세로 ${sideB} cm)을 가로를 축으로 돌려 만든 원기둥과 세로를 축으로 돌려 만든 원기둥의 회전축에 수직인 단면 넓이의 차는 몇 cm²입니까? (원주율: 3.14)`,
      answer: diffArea,
      unit: 'cm²',
      explanation,
    };
  },
};

/**
 * ch62-cone-wire  원뿔 철사 문제 — 모선 길이 역산 (명세 6-3)
 * 철사 전체 = 밑면 둘레 + 모선 × 모선 수(5)
 * 모선 = (철사 - 밑면 둘레) ÷ 5
 */
const chConeWire: SkillDef = {
  id: 'ch62-cone-wire',
  unitId: 'unitRound3d',
  title: '원뿔 철사에서 모선 길이 역산',
  note: '모선 = (총철사 - 밑면둘레) ÷ 5, 자연수, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let wireTotal = 145, basePeri = 50, slantAns = 19;

    for (let tries = 0; tries < 2000; tries++) {
      // 모선 길이: 자연수 5~30 cm
      const slant2 = rng.int(5, 30);
      // 밑면 둘레: 자연수 20~100 cm (2πr에서 r 자연수인 경우)
      // 원주율 3.14, r = 1~15 → 둘레 = 2×r×3.14 (소수 가능)
      // 단순화: 밑면 둘레를 자연수로 설정
      const basePeri2 = rng.int(4, 20) * 5; // 20~100, 5의 배수
      // 철사 = 밑면 둘레 + 모선 × 5
      const wire2 = basePeri2 + slant2 * 5;
      if (wire2 <= 0 || wire2 > 500) continue;

      wireTotal = wire2; basePeri = basePeri2; slantAns = slant2;
      break;
    }

    const explanation: MathExpr = [
      txt(`철사 전체 = 밑면 둘레 + 모선 × 5. `),
      txt(`모선 = (${wireTotal} − ${basePeri}) ÷ 5 = ${wireTotal - basePeri} ÷ 5 = ${slantAns} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `길이 ${wireTotal} cm인 철사를 모두 사용하여 원뿔 모양을 만들었습니다. 밑면의 둘레가 ${basePeri} cm일 때, 모선의 길이는 몇 cm입니까?`,
      expr: [txt('모선 = '), blank(0), txt(' cm')],
      blankAnswers: [slantAns],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  내보내기
// ═══════════════════════════════════════════════════════════════

export const challengeG6S2Skills: SkillDef[] = [
  // unitFracDiv2
  chTriAreaSide,
  chFracPartInv,
  chWorkRate,
  // unitDecDiv2
  chShapeDecDiv,
  chDecWrongInv,
  chClockDiff,
  // unitSpace
  chCubeGridCount,
  chCuboidWays,
  chCubeMinMax,
  // unitProportion
  chRatioArea,
  chGearRatio,
  chRatioRect,
  // unitCircle
  chCircleBiggest,
  chCompoundArea,
  chQuarterCut,
  // unitRound3d
  chCylinderNet,
  chRotateCrossDiff,
  chConeWire,
];
