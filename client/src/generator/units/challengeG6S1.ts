/**
 * 6-1 심화 문제 생성기 (challenge: true, difficulty: 3)
 * 명세: docs/challenge/g6s1.md
 *
 * 단원별 선택 유형:
 *  unitFracDiv1 — ch61-lineup-dist(1-6), ch61-frac-range-count(1-5), ch61-symbol-sub(1-4)
 *  unitPrism    — ch61-prism-elem(2-1), ch61-prism-edge-sum(2-2), ch61-euler(2-3/2-5)
 *  unitDecDiv1  — ch61-dec-wrong(3-2), ch61-dec-double-ineq(3-4), ch61-dec-circle-meet(3-6)
 *  unitRatio    — ch61-ratio-inv(4-3), ch61-ratio-chain(4-4), ch61-ratio-mix(4-7)
 *  unitGraph    — ch61-graph-remain(5-2), ch61-graph-cascade(5-4), ch61-graph-reverse(5-6)
 *  unitVolume   — ch61-cube-edge(6-1), ch61-vol-surface(6-2), ch61-water-fill(6-7)
 *
 * 제외 유형 (그림 필수):
 *  1-1 도형 넓이 역산 — 마름모 도형 그림 필수
 *  1-2 수직선 점 위치 — 수직선 그림 의존 (눈금 그림)
 *  1-3 혼합 계산 □ — 분수 특수 구조로 단독 스킬 가치 낮음
 *  2-4 전개도 역산 — 전개도 그림 필수
 *  2-6 각뿔 이름 찾기 — choice 구현 대신 euler에 통합
 *  3-3 수 카드 최대·최소 — 구조 단순(보기 변형 어려움)
 *  3-5 수직선 소수 — 수직선 그림 필요
 *  3-7 역산 곱 — 3-2와 구조 중복
 *  3-8 직사각형 넓이 역산 — 밭 그림 의존
 *  4-1/4-5/4-6 도형 변의 비 / 비율 차이 / 도형 변화 — 도형 그림 의존
 *  5-1/5-3 원그래프/띠그래프 읽기 — 그래프 이미지 의존
 *  5-5 두 그래프 비교 — 그래프 이미지 의존
 *  6-3 전개도 둘레 역산 — 전개도 그림 필수
 *  6-4 구멍 뚫린 직육면체 부피 — 그림 구조 설명 어렵
 *  6-6 쌓기나무 겉넓이 — 쌓기나무 배치 그림 필수
 *  6-8 포장지 면적 — 포장 방향 그림 필수
 */

import { RNG } from '../rng';
import {
  gcd,
  simplify,
  toMixed,
  compare,
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
//  unitFracDiv1 — 분수의 나눗셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch61-lineup-dist  등간격 줄 서기 거리 (명세 1-6)
 * total_people명이 같은 간격으로 줄을 섰고 양 끝 거리가 total_dist 대분수 m.
 * from_person번째~to_person번째 사이 거리를 기약분수로 구하기.
 */
const chLineupDist: SkillDef = {
  id: 'ch61-lineup-dist',
  unitId: 'unitFracDiv1',
  title: '등간격 줄 서기 거리 (대분수 나눗셈)',
  note: 'total_dist ÷ (n-1) × (to-from), 분모 ≤ 60, 기약분수 결과',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let people = 11, distN = 33, distD = 2, fromP = 3, toP = 8;
    let ansN = 15, ansD = 2; // 7과 1/2
    for (let tries = 0; tries < 2000; tries++) {
      const p2 = rng.int(5, 15);
      const intervals = p2 - 1;
      // total_dist: 대분수 whole=2~8, frac 단순
      const dWhole = rng.int(2, 8);
      const dD = rng.int(2, 9);
      const dN2 = rng.int(1, dD - 1);
      if (gcd(dN2, dD) !== 1) continue;
      const distN2 = dWhole * dD + dN2;
      const distD2 = dD;
      // from, to
      const from2 = rng.int(2, Math.max(2, Math.floor(p2 / 3)));
      const to2 = rng.int(from2 + 2, p2 - 1);
      const span = to2 - from2;
      // 거리 = distN2/distD2 ÷ intervals × span = distN2×span / (distD2×intervals)
      const rawN = distN2 * span;
      const rawD = distD2 * intervals;
      const g = gcd(rawN, rawD);
      const anN = rawN / g;
      const anD = rawD / g;
      if (anD > 60) continue;
      if (anD === 1) continue; // 정수 답 제외 (대분수 토큰 불변식)
      const m = toMixed({ n: anN, d: anD });
      if (m.whole > 0 && m.n === 0) continue; // 정수 대분수 제외
      // 한 칸 거리 분수(설명용)도 ≤ 60 보장
      const oneStepCheck = simplify({ n: distN2, d: distD2 * intervals });
      if (oneStepCheck.d > 60) continue;
      people = p2; distN = distN2; distD = distD2;
      fromP = from2; toP = to2;
      ansN = anN; ansD = anD;
      break;
    }

    const distMixed = toMixed({ n: distN, d: distD });
    const ansMixed = toMixed({ n: ansN, d: ansD });
    const answer = ansMixed.whole > 0
      ? { whole: ansMixed.whole, n: ansMixed.n, d: ansMixed.d }
      : { n: ansMixed.n, d: ansMixed.d };

    const intervals = people - 1;
    const span = toP - fromP;

    // 한 칸 거리 = distN / (distD × intervals) → 기약분수로 표시
    const oneStepF = simplify({ n: distN, d: distD * intervals });

    const explanation: MathExpr = [
      txt(`${people}명이 줄을 서면 간격은 ${intervals}칸이에요. `),
      txt(`한 칸 거리 = `),
      { kind: 'frac', whole: distMixed.whole, n: distMixed.n, d: distMixed.d },
      txt(` ÷ ${intervals} = `),
      frT(oneStepF),
      txt(` m. `),
      txt(`${fromP}번째~${toP}번째 사이는 ${span}칸이에요. `),
      txt(`거리 = `),
      frT(oneStepF),
      txt(` × ${span} = `),
      mixT({ n: ansN, d: ansD }),
      txt(` m.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `${people}명이 같은 간격으로 한 줄에 서 있고, 양 끝 사이의 거리가 ${distMixed.whole}과 ${distMixed.n}/${distMixed.d} m입니다. ${fromP}번째 학생과 ${toP}번째 학생 사이의 거리를 기약분수로 나타내세요.`,
      mixed: ansMixed.whole > 0,
      requireIrreducible: true,
      answer,
      explanation,
    };
  },
};

/**
 * ch61-frac-range-count  이중 부등식 자연수 개수 (명세 1-5)
 * A÷B×C < □ < D÷E×F, □에 들어갈 자연수 개수
 */
const chFracRangeCount: SkillDef = {
  id: 'ch61-frac-range-count',
  unitId: 'unitFracDiv1',
  title: '이중 부등식 자연수 개수 (대분수 나눗셈)',
  note: 'A÷B×C < □ < D÷E×F, 자연수 3~8개 존재 보장',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let lhsN = 16, lhsD = 5, rhsN = 40, rhsD = 3;
    let lhsB = 4, lhsC = 3, lhsWhole = 3, lhsFN = 1, lhsFD = 5;
    let rhsB = 5, rhsC = 9, rhsWhole = 6, rhsFN = 2, rhsFD = 3;
    let count = 5;

    for (let tries = 0; tries < 3000; tries++) {
      // LHS = A÷B×C: A 대분수, B,C 자연수
      const aWhole = rng.int(2, 5);
      const aD = rng.int(2, 8);
      const aN = rng.int(1, aD - 1);
      if (gcd(aN, aD) !== 1) continue;
      const aFrac: Frac = { n: aWhole * aD + aN, d: aD };
      const bDiv = rng.int(2, 6);
      const cMul = rng.int(2, 8);
      // LHS = aFrac ÷ bDiv × cMul = aFrac.n × cMul / (aFrac.d × bDiv)
      const lhsF = simplify({ n: aFrac.n * cMul, d: aFrac.d * bDiv });
      if (lhsF.d > 60) continue;

      // RHS = D÷E×F: 대분수, lhs 보다 큰 값
      const dWhole = rng.int(aWhole + 1, aWhole + 4);
      const dD = rng.int(2, 8);
      const dN = rng.int(1, dD - 1);
      if (gcd(dN, dD) !== 1) continue;
      const dFrac: Frac = { n: dWhole * dD + dN, d: dD };
      const eDiv = rng.int(2, 6);
      const fMul = rng.int(2, 8);
      const rhsF = simplify({ n: dFrac.n * fMul, d: dFrac.d * eDiv });
      if (rhsF.d > 60) continue;

      if (compare(lhsF, rhsF) >= 0) continue;

      // 자연수 개수
      const loVal = lhsF.n / lhsF.d; // > loVal
      const hiVal = rhsF.n / rhsF.d; // < hiVal
      const minNat = Math.floor(loVal) + 1;
      const maxNat = Math.ceil(hiVal) - 1;
      const cnt = maxNat - minNat + 1;
      if (cnt < 3 || cnt > 8) continue;

      lhsN = lhsF.n; lhsD = lhsF.d;
      rhsN = rhsF.n; rhsD = rhsF.d;
      lhsB = bDiv; lhsC = cMul; lhsWhole = aWhole; lhsFN = aN; lhsFD = aD;
      rhsB = eDiv; rhsC = fMul; rhsWhole = dWhole; rhsFN = dN; rhsFD = dD;
      count = cnt;
      break;
    }

    const lhsVal = (lhsN / lhsD).toFixed(3);
    const rhsVal = (rhsN / rhsD).toFixed(3);
    const minNat = Math.floor(lhsN / lhsD) + 1;
    const maxNat = Math.ceil(rhsN / rhsD) - 1;

    const explanation: MathExpr = [
      txt(`좌변: ${lhsWhole}과 ${lhsFN}/${lhsFD} ÷ ${lhsB} × ${lhsC} = `),
      frT({ n: lhsN, d: lhsD }),
      txt(` ≈ ${lhsVal}. `),
      txt(`우변: ${rhsWhole}과 ${rhsFN}/${rhsFD} ÷ ${rhsB} × ${rhsC} = `),
      frT({ n: rhsN, d: rhsD }),
      txt(` ≈ ${rhsVal}. `),
      txt(`${lhsVal}... < □ < ${rhsVal}...에서 자연수는 ${minNat}부터 ${maxNat}까지 ${count}개${ida(count)}예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${lhsWhole}과 ${lhsFN}/${lhsFD} ÷ ${lhsB} × ${lhsC} < □ < ${rhsWhole}과 ${rhsFN}/${rhsFD} ÷ ${rhsB} × ${rhsC}에서 □에 들어갈 수 있는 자연수는 모두 몇 개입니까?`,
      expr: [txt('자연수의 개수 = '), blank(0), txt(' 개')],
      blankAnswers: [count],
      explanation,
    };
  },
};

/**
 * ch61-symbol-sub  기호 대입 분수 계산 (명세 1-4)
 * ㉮=a(자연수), ㉯=대분수, ㉰=c(자연수) → (㉯÷㉮)×㉰ 기약분수
 */
const chSymbolSub: SkillDef = {
  id: 'ch61-symbol-sub',
  unitId: 'unitFracDiv1',
  title: '기호 대입 분수 계산',
  note: '(㉯/㉮)×㉰ = 대분수÷자연수×자연수, 기약분수, 분모 ≤ 60',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let a = 8, bN = 11, bD = 4, c = 5, ansN = 55, ansD = 32;
    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(5, 15);
      const bWhole = rng.int(2, 6);
      const bDenom = rng.int(2, 8);
      const bNum = rng.int(1, bDenom - 1);
      if (gcd(bNum, bDenom) !== 1) continue;
      const bN2 = bWhole * bDenom + bNum;
      const c2 = rng.int(2, 8);
      // (b/a)×c = bN2×c2 / (bDenom×a2)
      const raw = simplify({ n: bN2 * c2, d: bDenom * a2 });
      if (raw.d > 60) continue;
      if (raw.d === 1) continue; // 정수 답 제외
      const m = toMixed(raw);
      if (m.whole > 0 && m.n === 0) continue;
      // 중간 분수 bN/(bD*a2) 기약 분모도 ≤ 60 보장
      const midF = simplify({ n: bN2, d: bDenom * a2 });
      if (midF.d > 60) continue;
      // 진분수이거나 분수부가 있는 대분수 → OK
      a = a2; bN = bN2; bD = bDenom; c = c2;
      ansN = raw.n; ansD = raw.d;
      break;
    }

    const bMixed = toMixed({ n: bN, d: bD });
    const ansMixed = toMixed({ n: ansN, d: ansD });
    const answer = ansMixed.whole > 0
      ? { whole: ansMixed.whole, n: ansMixed.n, d: ansMixed.d }
      : { n: ansMixed.n, d: ansMixed.d };

    const midF = simplify({ n: bN, d: bD * a });

    const explanation: MathExpr = [
      txt(`㉯÷㉮ = `),
      { kind: 'frac', whole: bMixed.whole, n: bMixed.n, d: bMixed.d },
      txt(` ÷ ${a} = `),
      frT(midF),
      txt(`. `),
      txt(`×㉰: `),
      frT(midF),
      txt(` × ${c} = `),
      mixT({ n: ansN, d: ansD }),
      txt(`.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `㉮=${a}, ㉯=${bMixed.whole}과 ${bMixed.n}/${bMixed.d}, ㉰=${c}일 때 (㉯÷㉮)×㉰의 값을 기약분수로 나타내세요.`,
      mixed: ansMixed.whole > 0,
      requireIrreducible: true,
      answer,
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitPrism — 각기둥과 각뿔
// ═══════════════════════════════════════════════════════════════

/**
 * ch61-prism-elem  각기둥 구성 요소 역산 (명세 2-1)
 * "꼭짓점+면의 합이 X개인 각기둥의 모서리는 몇 개?" 등
 * 두 요소 합/차 또는 단일 값에서 n 구하고, 나머지 요소 계산
 */
const chPrismElem: SkillDef = {
  id: 'ch61-prism-elem',
  unitId: 'unitPrism',
  title: '각기둥 구성 요소 역산',
  note: '꼭짓점=2n, 모서리=3n, 면=n+2, 두 요소 합/차로 n 역산 후 세 번째 요소 계산',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 각기둥: vertex=2n, edge=3n, face=n+2 (n: 밑면 변 수, 3~10)
    const elemsA = ['꼭짓점', '모서리', '면'] as const;
    const formulaA = [2, 3, 1] as const; // vertex=2n, edge=3n, face=1n(+2)
    const offsetA = [0, 0, 2] as const;  // face에만 +2

    type Elem = 0 | 1 | 2;

    // 폴백값
    let nVal = 7, qElem: Elem = 1;
    let cond = 2 * nVal + nVal + 2; // v+f
    let condStr = '꼭짓점과 면의 수의 합';
    let ansVal = 3 * nVal;

    for (let tries = 0; tries < 2000; tries++) {
      const n2 = rng.int(3, 10);
      const scenarios = [
        { e1: 0 as Elem, e2: 2 as Elem, op: '+', q: 1 as Elem },
        { e1: 0 as Elem, e2: 1 as Elem, op: '+', q: 2 as Elem },
        { e1: 1 as Elem, e2: 2 as Elem, op: '+', q: 0 as Elem },
        { e1: 1 as Elem, e2: 0 as Elem, op: '-', q: 2 as Elem },
      ];
      const sc = scenarios[rng.int(0, scenarios.length - 1)];
      const val1 = formulaA[sc.e1] * n2 + offsetA[sc.e1];
      const val2 = formulaA[sc.e2] * n2 + offsetA[sc.e2];
      const cond2 = sc.op === '+' ? val1 + val2 : val1 - val2;
      if (cond2 <= 0) continue;
      const qVal = formulaA[sc.q] * n2 + offsetA[sc.q];
      if (qVal <= 0) continue;

      const opStr = sc.op === '+' ? '합' : '차';
      const condStr2 = `${elemsA[sc.e1]}과 ${elemsA[sc.e2]}의 수의 ${opStr}`;

      nVal = n2; qElem = sc.q;
      cond = cond2; condStr = condStr2; ansVal = qVal;
      break;
    }

    const explanation: MathExpr = [
      txt(`n각기둥의 꼭짓점=2n, 모서리=3n, 면=n+2 공식을 써요. `),
      txt(`${condStr}이 ${cond}개이므로 n을 구하면 n=${nVal}. `),
      txt(`${nVal}각기둥의 ${elemsA[qElem]} 수 = `),
      txt(`${formulaA[qElem] === 1 ? '' : `${formulaA[qElem]}×`}${nVal}${offsetA[qElem] > 0 ? `+${offsetA[qElem]}` : ''} = ${ansVal}개.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${condStr}이 ${cond}개인 각기둥의 ${elemsA[qElem]} 수는 몇 개입니까?`,
      expr: [txt(`${elemsA[qElem]} 수 = `), blank(0), txt(' 개')],
      blankAnswers: [ansVal],
      explanation,
    };
  },
  minVariety: 32, // n(3~10)=8, scenario 4가지 = 32조합
};

/**
 * ch61-prism-edge-sum  각기둥 모서리 길이의 합 / 역산 (명세 2-2)
 * 정n각형 밑면 한 변 a cm, 높이 h cm → 합 = 2n×a + n×h = n×(2a+h)
 * 또는 합과 n, a를 알 때 h 역산
 */
const chPrismEdgeSum: SkillDef = {
  id: 'ch61-prism-edge-sum',
  unitId: 'unitPrism',
  title: '각기둥 모서리 길이의 합 / 높이 역산',
  note: 'n×(2a+h) 계산, 또는 total÷n−2a=h 역산, 자연수 답',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const forward = rng.chance(0.5);

    // 폴백값
    let n = 5, a = 7, h = 9, ansVal = 5 * (2 * 7 + 9);

    if (forward) {
      for (let tries = 0; tries < 2000; tries++) {
        const n2 = rng.int(3, 8);
        const a2 = rng.int(2, 15);
        const h2 = rng.int(2, 15);
        const ans = n2 * (2 * a2 + h2);
        if (ans > 500) continue;
        n = n2; a = a2; h = h2; ansVal = ans;
        break;
      }

      const explanation: MathExpr = [
        txt(`${n}각기둥의 모서리는 밑면 2개의 변(${n}×${a}×2=${2 * n * a} cm)과 `),
        txt(`옆면 높이 방향 모서리(${n}×${h}=${n * h} cm)로 구성돼요. `),
        txt(`합 = ${2 * n * a} + ${n * h} = ${ansVal} cm.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `밑면이 정${n}각형이고 한 변이 ${a} cm, 높이가 ${h} cm인 ${n}각기둥의 모든 모서리 길이의 합은 몇 cm입니까?`,
        expr: [txt('모서리 합 = '), blank(0), txt(' cm')],
        blankAnswers: [ansVal],
        explanation,
      };
    } else {
      // 역산: 합과 n, a를 알 때 h 구하기
      for (let tries = 0; tries < 2000; tries++) {
        const n2 = rng.int(3, 8);
        const a2 = rng.int(2, 12);
        const h2 = rng.int(2, 12);
        const total = n2 * (2 * a2 + h2);
        if (total > 500) continue;
        n = n2; a = a2; h = h2; ansVal = h2;
        break;
      }
      const total = n * (2 * a + h);

      const explanation: MathExpr = [
        txt(`${n}각기둥 모서리 합 = ${n}×(2×${a}+높이) = ${total}. `),
        txt(`2×${a}+높이 = ${total}÷${n} = ${2 * a + h}. `),
        txt(`높이 = ${2 * a + h}−${2 * a} = ${h} cm.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `밑면이 정${n}각형이고 한 변이 ${a} cm인 ${n}각기둥의 모든 모서리 길이의 합이 ${total} cm일 때, 이 각기둥의 높이는 몇 cm입니까?`,
        expr: [txt('높이 = '), blank(0), txt(' cm')],
        blankAnswers: [h],
        explanation,
      };
    }
  },
};

/**
 * ch61-euler  오일러 공식 + 여러 각기둥 조합 (명세 2-3, 2-5)
 * 두 가지 시나리오를 랜덤 선택:
 *   A) 면+꼭짓점으로 모서리 구하기 (오일러 공식 직접 적용)
 *   B) 서로 다른 각기둥들의 모서리 합이 E개일 때, 꼭짓점 합 구하기
 */
const chEuler: SkillDef = {
  id: 'ch61-euler',
  unitId: 'unitPrism',
  title: '오일러 공식·각기둥 조합 모서리/꼭짓점',
  note: '오일러: E=F+V-2; 각기둥 조합: edge_sum=3Σnk, vertex_sum=2Σnk',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);
    const scenario = rng.chance(0.5);

    if (scenario) {
      // 시나리오 A: 오일러 공식
      // 폴백값
      let faces = 10, vertices = 12, edges = 20;
      for (let tries = 0; tries < 2000; tries++) {
        const f2 = rng.int(4, 12);
        const v2 = rng.int(4, 16);
        const e2 = f2 + v2 - 2;
        if (e2 <= 0 || e2 % 2 !== 0) continue; // 모서리 수는 짝수여야 실제 다면체 가능
        if (e2 < 4) continue;
        faces = f2; vertices = v2; edges = e2;
        break;
      }

      const explanation: MathExpr = [
        txt(`다면체의 오일러 공식: (면의 수) + (꼭짓점의 수) = (모서리의 수) + 2. `),
        txt(`모서리 수 = ${faces} + ${vertices} − 2 = ${edges}개.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `어떤 다면체의 면이 ${faces}개, 꼭짓점이 ${vertices}개일 때 모서리는 몇 개입니까?`,
        expr: [txt('모서리 수 = '), blank(0), txt(' 개')],
        blankAnswers: [edges],
        explanation,
      };
    } else {
      // 시나리오 B: 각기둥 조합
      // edge_sum = 3×(n1+n2+n3), vertex_sum = 2×(n1+n2+n3)
      let edgeSum = 60, vertexSum = 40;
      for (let tries = 0; tries < 2000; tries++) {
        const nSum = rng.int(6, 20); // n1+n2+...의 합
        const edgeS = 3 * nSum;
        const vertS = 2 * nSum;
        if (edgeS > 120) continue;
        edgeSum = edgeS; vertexSum = vertS;
        break;
      }

      const nSum = edgeSum / 3;

      const explanation: MathExpr = [
        txt(`각기둥의 모서리 수 = 3n (n: 밑면 변 수). `),
        txt(`모서리 합 = 3×(밑면 변 수의 합) = ${edgeSum}. `),
        txt(`밑면 변 수의 합 = ${edgeSum}÷3 = ${nSum}. `),
        txt(`꼭짓점 합 = 2×${nSum} = ${vertexSum}개.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `서로 다른 각기둥 여러 개의 모서리 수의 합이 ${edgeSum}개일 때, 이 각기둥들의 꼭짓점 수의 합은 몇 개입니까?`,
        expr: [txt('꼭짓점 합 = '), blank(0), txt(' 개')],
        blankAnswers: [vertexSum],
        explanation,
      };
    }
  },
  minVariety: 50,
};

// ═══════════════════════════════════════════════════════════════
//  unitDecDiv1 — 소수의 나눗셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch61-dec-wrong  잘못된 나눗셈 역산 (명세 3-2)
 * 어떤 수를 A로 나눠야 했는데 B로 나눴더니 C → 바른 몫
 */
const chDecWrong: SkillDef = {
  id: 'ch61-dec-wrong',
  unitId: 'unitDecDiv1',
  title: '잘못된 소수 나눗셈 역산',
  note: '원래 수=wrong×B, 바른 몫=원래÷A, decimal-input, 정수 스케일 계산',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let wDiv = 4, cDiv = 8, wQuot = 36, ansVal = 1.8;
    // wrong_quotient: 소수 한 자리 (×10 정수)
    for (let tries = 0; tries < 2000; tries++) {
      const wD2 = rng.int(2, 9);
      const cD2 = rng.int(2, 9);
      if (wD2 === cD2) continue;
      // wQuot: 소수 한 자리 (10~99 → 1.0~9.9)
      const wQ10 = rng.int(10, 99);
      // 원래 수 = wQ10/10 × wD2 → 정수 스케일로: wQ10 × wD2 (×10)
      const origX10 = wQ10 * wD2;
      // 바른 몫 = origX10/10 / cD2 = origX10 / (10 × cD2)
      if (origX10 % cD2 !== 0) continue;
      const ansX10 = origX10 / cD2; // ×10 스케일
      if (ansX10 <= 0) continue;
      // answer×10000이 정수인지 확인
      const ansv = ansX10 / 10;
      if (Math.abs(ansv * 10000 - Math.round(ansv * 10000)) > 1e-6) continue;

      wDiv = wD2; cDiv = cD2;
      wQuot = wQ10; // ×10 저장 → 표시 시 /10
      ansVal = ansv;
      break;
    }

    const wrongQuotStr = (wQuot / 10).toFixed(1);
    const origVal = (wQuot / 10) * wDiv;

    const explanation: MathExpr = [
      txt(`잘못 계산: □ ÷ ${wDiv} = ${wrongQuotStr}. `),
      txt(`원래 수 = ${wrongQuotStr} × ${wDiv} = ${origVal}. `),
      txt(`바른 계산: ${origVal} ÷ ${cDiv} = ${ansVal}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `어떤 수를 ${cDiv}로 나눠야 했는데 잘못하여 ${wDiv}로 나눴더니 ${wrongQuotStr}이 되었습니다. 바르게 계산한 몫을 구하세요.`,
      answer: ansVal,
      explanation,
    };
  },
};

/**
 * ch61-dec-double-ineq  이중 부등식 공통 자연수 (명세 3-4)
 * 부등식 1: A÷B < □ < C÷D, 부등식 2: E÷F < □ < G÷H
 * 공통 자연수 중 가장 작은 것과 가장 큰 것
 */
const chDecDoubleIneq: SkillDef = {
  id: 'ch61-dec-double-ineq',
  unitId: 'unitDecDiv1',
  title: '소수 나눗셈 이중 부등식 공통 자연수',
  note: '두 범위의 교집합 자연수, 1~3개 보장, 정수 스케일 계산',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let a1 = 357, b1 = 6, c1 = 903, d1 = 9;
    let a2 = 442, b2 = 7, c2 = 658, d2 = 8;
    let minAns = 7, maxAns = 8, count = 2;

    for (let tries = 0; tries < 3000; tries++) {
      // A, C: 소수 한 자리 (×10 정수), B, D: 자연수 2~9
      const A1 = rng.int(100, 900); // ×10
      const B1 = rng.int(2, 9);
      const C1 = rng.int(A1 + 20, 1000); // C > A
      const D1 = rng.int(2, 9);
      const lo1 = A1 / (B1 * 10); // A1/10 ÷ B1
      const hi1 = C1 / (D1 * 10);
      if (hi1 <= lo1 + 0.5) continue;

      const A2 = rng.int(100, 900);
      const B2 = rng.int(2, 9);
      const C2 = rng.int(A2 + 20, 1000);
      const D2 = rng.int(2, 9);
      const lo2 = A2 / (B2 * 10);
      const hi2 = C2 / (D2 * 10);
      if (hi2 <= lo2 + 0.5) continue;

      const loMax = Math.max(lo1, lo2);
      const hiMin = Math.min(hi1, hi2);
      const minN = Math.floor(loMax) + 1;
      const maxN = Math.ceil(hiMin) - 1;
      if (minN > maxN) continue;
      const cnt = maxN - minN + 1;
      if (cnt < 1 || cnt > 3) continue;
      if (minN <= 0) continue;

      a1 = A1; b1 = B1; c1 = C1; d1 = D1;
      a2 = A2; b2 = B2; c2 = C2; d2 = D2;
      minAns = minN; maxAns = maxN; count = cnt;
      break;
    }

    const a1s = (a1 / 10).toFixed(1), c1s = (c1 / 10).toFixed(1);
    const a2s = (a2 / 10).toFixed(1), c2s = (c2 / 10).toFixed(1);
    const lo1 = a1 / (b1 * 10), hi1 = c1 / (d1 * 10);
    const lo2 = a2 / (b2 * 10), hi2 = c2 / (d2 * 10);

    const natList = [];
    for (let v = minAns; v <= maxAns; v++) natList.push(v);

    const explanation: MathExpr = [
      txt(`부등식 1: ${a1s}÷${b1} = ${lo1.toFixed(2)}... < □ < ${c1s}÷${d1} = ${hi1.toFixed(2)}... → □ 범위: ${Math.floor(lo1) + 1}~${Math.ceil(hi1) - 1}. `),
      txt(`부등식 2: ${a2s}÷${b2} = ${lo2.toFixed(2)}... < □ < ${c2s}÷${d2} = ${hi2.toFixed(2)}... → □ 범위: ${Math.floor(lo2) + 1}~${Math.ceil(hi2) - 1}. `),
      txt(`공통 자연수: ${natList.join(', ')}.`),
    ];

    if (count === 1) {
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${a1s}÷${b1} < □ < ${c1s}÷${d1} 이고 ${a2s}÷${b2} < □ < ${c2s}÷${d2} 일 때, □에 공통으로 들어갈 자연수를 구하세요.`,
        expr: [txt('공통 자연수 = '), blank(0)],
        blankAnswers: [minAns],
        explanation,
      };
    } else {
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${a1s}÷${b1} < □ < ${c1s}÷${d1} 이고 ${a2s}÷${b2} < □ < ${c2s}÷${d2} 일 때, □에 공통으로 들어갈 자연수 중 가장 작은 수와 가장 큰 수를 구하세요.`,
        expr: [txt('가장 작은 수: '), blank(0), txt(',  가장 큰 수: '), blank(1)],
        blankAnswers: [minAns, maxAns],
        explanation,
      };
    }
  },
};

/**
 * ch61-dec-circle-meet  원형 경로 만남 시간 (명세 3-6)
 * 둘레 c m, 두 사람 속력 a, b m/분, 반대 방향 → 처음 만나는 시간
 */
const chDecCircleMeet: SkillDef = {
  id: 'ch61-dec-circle-meet',
  unitId: 'unitDecDiv1',
  title: '원형 경로 반대 방향 만남 시간',
  note: 'time = circumference ÷ (speedA + speedB), 소수 첫째 자리 이하, 정수 스케일',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let circ = 4806, sA = 684, sB = 513; // ×10 스케일
    let ansVal = 4.0;

    for (let tries = 0; tries < 3000; tries++) {
      // 속력 a, b: 소수 한 자리 ×10 정수 (30~150 → 3.0~15.0 m/분)
      const sA2 = rng.int(30, 150);
      const sB2 = rng.int(30, 150);
      if (sA2 === sB2) continue;
      const sumAB = sA2 + sB2;
      // 둘레 = sumAB × time, time: 소수 한 자리 (1.0~9.9)
      const timeX10 = rng.int(10, 99);
      const circX10 = sumAB * timeX10; // circumference × 10 × 10 = × 100
      // circumference = circX10 / 100
      // answer = circumference ÷ (sA2/10 + sB2/10) = (circX10/100) ÷ (sumAB/10)
      //        = circX10 / (100 × sumAB / 10) = circX10 / (10 × sumAB) = timeX10/10
      const ansv = timeX10 / 10;
      if (Math.abs(ansv * 10000 - Math.round(ansv * 10000)) > 1e-6) continue;
      // circumference should be a nice decimal (one decimal place)
      if (circX10 % 10 !== 0) continue; // circumference ends cleanly in one decimal
      const circDisplay = circX10 / 10; // e.g. 480.6

      circ = circDisplay * 10; // store as ×10 for display: circDisplay
      sA = sA2; sB = sB2;
      ansVal = ansv;
      break;
    }

    const circStr = (circ / 10).toFixed(1);
    const sAStr = (sA / 10).toFixed(1);
    const sBStr = (sB / 10).toFixed(1);
    const sumStr = ((sA + sB) / 10).toFixed(1);

    const explanation: MathExpr = [
      txt(`두 사람이 반대 방향으로 걸으면 1분마다 두 속력의 합만큼 가까워져요. `),
      txt(`두 속력의 합 = ${sAStr} + ${sBStr} = ${sumStr} m/분. `),
      txt(`만나는 시간 = ${circStr} ÷ ${sumStr} = ${ansVal} 분.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `둘레가 ${circStr} m인 원 모양 공원에서 두 사람이 같은 위치에서 반대 방향으로 출발합니다. 한 사람은 분당 ${sAStr} m, 다른 사람은 분당 ${sBStr} m를 걷는다면, 출발 후 몇 분 만에 처음으로 만납니까?`,
      answer: ansVal,
      unit: '분',
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitRatio — 비와 비율
// ═══════════════════════════════════════════════════════════════

/**
 * ch61-ratio-inv  할인율로 원가 역산 (명세 4-3)
 * 할인율 r%, 할인 후 가격 p원 → 원가 = p ÷ (1 − r/100)
 */
const chRatioInv: SkillDef = {
  id: 'ch61-ratio-inv',
  unitId: 'unitRatio',
  title: '할인율로 원가 역산',
  note: 'original = discounted ÷ (1−rate/100), 원가 자연수, rate 5의 배수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const items = ['모자', '가방', '운동화', '점퍼', '책', '지갑', '노트북 케이스'];

    // 폴백값
    let rate = 20, discounted = 12000, origPrice = 15000, item = '모자';

    for (let tries = 0; tries < 2000; tries++) {
      const rate2 = rng.int(1, 6) * 5; // 5, 10, 15, 20, 25, 30
      // 원가를 먼저 선택하고 역산
      const origMul = rng.int(1, 20); // 원가 = origMul × 1000
      const orig2 = origMul * 1000;
      // 할인 후 = orig × (100-rate)/100 → 자연수 보장
      if ((orig2 * (100 - rate2)) % 100 !== 0) continue;
      const disc2 = (orig2 * (100 - rate2)) / 100;
      if (disc2 <= 0 || disc2 > 50000) continue;

      rate = rate2; discounted = disc2; origPrice = orig2;
      item = rng.pick(items);
      break;
    }

    const explanation: MathExpr = [
      txt(`${rate}% 할인 후 가격 = 원가 × (1 − ${rate}/100) = 원가 × ${(100 - rate) / 100}${ida(`${(100 - rate) / 100}`)}에요. `),
      txt(`원가 = ${discounted} ÷ ${(100 - rate) / 100} = ${origPrice}원.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${rate}% 할인된 가격인 ${discounted.toLocaleString()}원에 ${item}${nj(item, '을/를')} 샀습니다. 이 ${item}의 원래 가격은 얼마입니까?`,
      expr: [txt('원래 가격 = '), blank(0), txt(' 원')],
      blankAnswers: [origPrice],
      explanation,
    };
  },
  minVariety: 30, // rate 6가지 × origMul 여러 가지
};

/**
 * ch61-ratio-chain  연속 비율 역산 (명세 4-4)
 * 전체 × rA/100 × rB/100 = B수, 전체 역산
 */
const chRatioChain: SkillDef = {
  id: 'ch61-ratio-chain',
  unitId: 'unitRatio',
  title: '연속 비율 역산으로 전체 구하기',
  note: 'total × rA/100 × rB/100 = known, total 자연수, 두 비율 모두 5의 배수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const contexts = [
      { group: '반 학생', hobby: '독서를 좋아하는 학생', sport: '과학책을 좋아하는 학생' },
      { group: '반 학생', hobby: '운동을 좋아하는 학생', sport: '축구를 좋아하는 학생' },
      { group: '반 학생', hobby: '음악을 좋아하는 학생', sport: '피아노를 좋아하는 학생' },
    ];

    // 폴백값
    let total = 50, rA = 70, rB = 60, known = 21;
    let ctx = contexts[1];

    for (let tries = 0; tries < 3000; tries++) {
      const rA2 = rng.int(5, 18) * 5; // 25~90
      const rB2 = rng.int(5, 18) * 5;
      if (rA2 > 90 || rB2 > 90) continue;
      // total × rA2/100 × rB2/100이 자연수
      // total 선택: rA2×rB2의 인수가 100²의 인수를 상쇄하도록
      // 간단히: 100²=10000, total = 10000 / gcd(10000, rA2×rB2) × k
      const prod = rA2 * rB2;
      const g = gcd(10000, prod);
      const minTotal = 10000 / g;
      if (minTotal > 200) continue;
      const kMax = Math.floor(200 / minTotal);
      if (kMax < 1) continue;
      const k = rng.int(1, kMax);
      const total2 = minTotal * k;
      const known2 = (total2 * rA2 * rB2) / 10000;
      if (!Number.isInteger(known2) || known2 <= 0) continue;
      if (known2 > total2) continue;

      total = total2; rA = rA2; rB = rB2; known = known2;
      ctx = rng.pick(contexts);
      break;
    }

    const explanation: MathExpr = [
      txt(`전체 × ${rA}/100 × ${rB}/100 = ${known}. `),
      txt(`전체 × ${rA * rB / 10000} = ${known}. `),
      txt(`전체 = ${known} ÷ ${rA * rB / 10000} = ${total}명.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `우리 ${ctx.group} 중 ${rA}%가 ${ctx.hobby}이고, ${ctx.hobby} 중 ${rB}%가 ${ctx.sport}입니다. ${ctx.sport}이 ${known}명이라면 전체 학생은 몇 명입니까?`,
      expr: [txt('전체 학생 수 = '), blank(0), txt(' 명')],
      blankAnswers: [total],
      explanation,
    };
  },
};

/**
 * ch61-ratio-mix  혼합 비율 (소금물 농도) (명세 4-7)
 * A g × rA% + B g × rB% → 혼합 농도 = (A×rA+B×rB)÷(A+B)
 */
const chRatioMix: SkillDef = {
  id: 'ch61-ratio-mix',
  unitId: 'unitRatio',
  title: '혼합 소금물 농도 계산',
  note: '(A×rA + B×rB)÷(A+B)×100 = 자연수 %, 두 농도 다름',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let amtA = 200, rateA = 4, amtB = 100, rateB = 10, mixed = 6;

    for (let tries = 0; tries < 3000; tries++) {
      const aA = rng.int(1, 10) * 50; // 50~500 g
      const rA2 = rng.int(1, 10) * 2;  // 2~20 %
      const aB = rng.int(1, 10) * 50;
      const rB2 = rng.int(1, 10) * 2;
      if (rA2 === rB2) continue;
      const saltA = aA * rA2; // ×100 스케일
      const saltB = aB * rB2;
      const totalAmt = aA + aB;
      const totalSaltX100 = saltA + saltB;
      // 혼합 농도 = totalSaltX100 / totalAmt (×100 이미 포함)
      if (totalSaltX100 % totalAmt !== 0) continue;
      const mixedRate = totalSaltX100 / totalAmt;
      if (mixedRate <= 0 || mixedRate > 100) continue;

      amtA = aA; rateA = rA2; amtB = aB; rateB = rB2; mixed = mixedRate;
      break;
    }

    const saltA = (amtA * rateA) / 100;
    const saltB = (amtB * rateB) / 100;
    const totalAmt = amtA + amtB;
    const totalSalt = saltA + saltB;

    const explanation: MathExpr = [
      txt(`${rateA}% 소금물 ${amtA} g에 들어있는 소금: ${amtA}×${rateA}/100 = ${saltA} g. `),
      txt(`${rateB}% 소금물 ${amtB} g에 들어있는 소금: ${amtB}×${rateB}/100 = ${saltB} g. `),
      txt(`전체 소금: ${saltA}+${saltB} = ${totalSalt} g, 전체 소금물: ${totalAmt} g. `),
      txt(`혼합 농도 = ${totalSalt}÷${totalAmt}×100 = ${mixed}%.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${rateA}%의 소금물 ${amtA} g과 ${rateB}%의 소금물 ${amtB} g을 섞으면 몇 %의 소금물이 됩니까?`,
      expr: [txt('혼합 농도 = '), blank(0), txt(' %')],
      blankAnswers: [mixed],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitGraph — 여러 가지 그래프
// ═══════════════════════════════════════════════════════════════

/**
 * ch61-graph-remain  나머지 항목 비율 역산 (명세 5-2)
 * 3~4개 항목 비율이 주어지고, 나머지(기타) 비율 + 총 인원수 주어지면 기타 인원수 계산
 */
const chGraphRemain: SkillDef = {
  id: 'ch61-graph-remain',
  unitId: 'unitGraph',
  title: '그래프 나머지 항목 비율·수량 역산',
  note: '100-sum(known_rates) = 나머지 %, total×(나머지%)/100 = 수량',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const topics = [
      { title: '좋아하는 취미', items: ['독서', '음악', '운동', '요리'] },
      { title: '좋아하는 과목', items: ['수학', '과학', '국어', '사회'] },
      { title: '받고 싶은 선물', items: ['책', '게임', '운동용품', '음식'] },
    ];

    // 폴백값
    let rates = [35, 28, 22], remainRate = 15, total = 200, remainCount = 30;
    let topic = topics[0];

    for (let tries = 0; tries < 3000; tries++) {
      const t = rng.pick(topics);
      const n = rng.int(3, 4); // 알려진 항목 수
      const rateList: number[] = [];
      let sum = 0;
      let ok = true;
      for (let i = 0; i < n; i++) {
        const r = rng.int(1, 8) * 5; // 5~40, 5의 배수
        if (sum + r >= 100) { ok = false; break; }
        rateList.push(r);
        sum += r;
      }
      if (!ok) continue;
      const remain = 100 - sum;
      if (remain < 5 || remain > 40) continue;

      // 전체 인원: total × remain / 100이 자연수
      const totalMul = rng.int(2, 10) * 20; // 40~200
      if ((totalMul * remain) % 100 !== 0) continue;
      const remCount = (totalMul * remain) / 100;
      if (remCount <= 0) continue;

      rates = rateList; remainRate = remain; total = totalMul; remainCount = remCount;
      topic = t;
      break;
    }

    const itemNames = topic.items.slice(0, rates.length);
    const rateStr = itemNames.map((name, i) => `${name} ${rates[i]}%`).join(', ');

    const explanation: MathExpr = [
      txt(`알려진 비율 합: ${rates.join('+')} = ${rates.reduce((a, b) => a + b, 0)}%. `),
      txt(`나머지 비율 = 100 − ${rates.reduce((a, b) => a + b, 0)} = ${remainRate}%. `),
      txt(`나머지 학생 수 = ${total} × ${remainRate}/100 = ${remainCount}명.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `전체 ${total}명을 대상으로 "${topic.title}"를 조사한 원그래프에서 ${rateStr}일 때, 나머지 항목의 학생은 몇 명입니까?`,
      expr: [txt('나머지 학생 수 = '), blank(0), txt(' 명')],
      blankAnswers: [remainCount],
      explanation,
    };
  },
};

/**
 * ch61-graph-cascade  중첩 비율 계산 (명세 5-4)
 * 전체의 outer_rate%가 '기타', 기타의 inner_rate%가 특정 항목 → 전체 대비 %
 */
const chGraphCascade: SkillDef = {
  id: 'ch61-graph-cascade',
  unitId: 'unitGraph',
  title: '중첩 비율 계산 (그래프 연계)',
  note: 'outer% × inner% / 100 = 전체 대비 %, 자연수 결과',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const contexts = [
      { outer: '기타', inner: '미술', whole: '취미' },
      { outer: '기타', inner: '농구', whole: '스포츠' },
      { outer: '기타', inner: '딸기', whole: '좋아하는 과일' },
    ];

    // 폴백값
    let outerRate = 20, innerRate = 30, resultRate = 6, total = 500, resultCount = 30;
    let ctx = contexts[0];

    for (let tries = 0; tries < 3000; tries++) {
      const o2 = rng.int(1, 8) * 5;  // 5~40
      const i2 = rng.int(1, 18) * 5; // 5~90
      // 전체 대비 = o2 × i2 / 100, 자연수여야 함
      if ((o2 * i2) % 100 !== 0) continue;
      const res2 = (o2 * i2) / 100;
      if (res2 <= 0 || res2 >= 50) continue;

      // 전체 인원
      const tMul = rng.int(2, 20) * 25; // 50~500, 25의 배수
      if ((tMul * res2) % 100 !== 0) continue;
      const resCount2 = (tMul * res2) / 100;
      if (resCount2 <= 0) continue;

      outerRate = o2; innerRate = i2; resultRate = res2;
      total = tMul; resultCount = resCount2;
      ctx = rng.pick(contexts);
      break;
    }

    const explanation: MathExpr = [
      txt(`전체의 ${outerRate}%가 "${ctx.outer}"이고, "${ctx.outer}" 중 ${innerRate}%가 "${ctx.inner}". `),
      txt(`전체 대비 "${ctx.inner}" 비율 = ${outerRate}% × ${innerRate}% ÷ 100 = ${resultRate}%. `),
      txt(`${ctx.inner} 학생 수 = ${total} × ${resultRate}/100 = ${resultCount}명.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${total}명을 대상으로 "${ctx.whole}"을 조사했습니다. 전체의 ${outerRate}%가 "${ctx.outer}"이고, "${ctx.outer}" 중 ${innerRate}%가 "${ctx.inner}"를 선택했습니다. "${ctx.inner}"를 선택한 학생은 전체의 몇 %입니까?`,
      expr: [txt(`"${ctx.inner}"의 전체 대비 비율 = `), blank(0), txt(' %')],
      blankAnswers: [resultRate],
      explanation,
    };
  },
  minVariety: 40,
};

/**
 * ch61-graph-reverse  비율로 전체 역산 (명세 5-6)
 * 특정 항목의 수와 비율(%)이 주어지고 전체 수 구하기
 */
const chGraphReverse: SkillDef = {
  id: 'ch61-graph-reverse',
  unitId: 'unitGraph',
  title: '비율로 전체 인원 역산',
  note: 'total = known_count ÷ (rate/100), 자연수, rate 5의 배수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const contexts = [
      { activity: '등산', group: '초등학생' },
      { activity: '수영', group: '학생' },
      { activity: '달리기', group: '학생' },
      { activity: '독서', group: '어린이' },
    ];

    // 폴백값
    let rate = 15, known = 600, total = 4000;
    let ctx = contexts[0];

    for (let tries = 0; tries < 2000; tries++) {
      const rate2 = rng.int(1, 18) * 5; // 5, 10, ..., 90
      // total × rate2/100이 자연수 → total이 100/gcd(100,rate2)의 배수여야 함
      const g = gcd(100, rate2);
      const minT = 100 / g;
      const tMul = rng.int(1, 20);
      const total2 = minT * tMul;
      const known2 = (total2 * rate2) / 100;
      if (!Number.isInteger(known2) || known2 <= 0 || known2 > 5000) continue;

      rate = rate2; known = known2; total = total2;
      ctx = rng.pick(contexts);
      break;
    }

    const explanation: MathExpr = [
      txt(`전체 × ${rate}/100 = ${known}. `),
      txt(`전체 = ${known} ÷ ${rate / 100} = ${total}명.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${ctx.group} 중 ${ctx.activity}을 좋아하는 학생이 전체의 ${rate}%이고 ${known}명이라면, 조사한 ${ctx.group}은 모두 몇 명입니까?`,
      expr: [txt('전체 학생 수 = '), blank(0), txt(' 명')],
      blankAnswers: [total],
      explanation,
    };
  },
  minVariety: 40,
};

// ═══════════════════════════════════════════════════════════════
//  unitVolume — 직육면체의 부피와 겉넓이
// ═══════════════════════════════════════════════════════════════

/**
 * ch61-cube-edge  정육면체 한 모서리 역산 (명세 6-1)
 * 직육면체 부피 = 정육면체 부피 → 정육면체 한 모서리 길이 (n=2~12)
 */
const chCubeEdge: SkillDef = {
  id: 'ch61-cube-edge',
  unitId: 'unitVolume',
  title: '정육면체 한 모서리 역산 (부피 역산)',
  note: 'l×w×h = n³, n: 2~12 자연수, 역산으로 생성',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // n³을 l×w×h 세 인수의 곱으로 표현
    const validN = [2, 3, 4, 5, 6, 8, 10, 12];
    const n = rng.pick(validN);
    const vol = n * n * n;

    // 세 인수 분해: 소인수 분해 후 3그룹으로 분배
    let l = 1, w = 1, h = 1;
    let tries = 0;
    for (;;) {
      // vol을 무작위로 세 자연수로 분해
      const a = rng.int(1, Math.floor(Math.cbrt(vol)));
      if (vol % a !== 0) { tries++; if (tries > 2000) { l = n; w = n; h = n; break; } continue; }
      const rem = vol / a;
      const b = rng.int(1, Math.floor(Math.sqrt(rem)));
      if (rem % b !== 0) { tries++; if (tries > 2000) { l = n; w = n; h = n; break; } continue; }
      const c = rem / b;
      if (a > 20 || b > 20 || c > 20) { tries++; if (tries > 2000) { l = n; w = n; h = n; break; } continue; }
      // l, w, h가 모두 1이 되지 않도록 (n=1이 아니므로 vol>1)
      if (a === 1 && b === 1) { tries++; if (tries > 2000) { l = n; w = n; h = n; break; } continue; }
      // 세 인수가 n³이 되는지 확인
      if (a * b * c !== vol) { tries++; continue; }
      // 입체 느낌이 나도록 1 제외 권장
      if (a === 1 || b === 1 || c === 1) {
        tries++;
        if (tries > 1000) { l = n; w = n; h = n; break; }
        if (rng.chance(0.8)) continue;
      }
      l = a; w = b; h = c;
      break;
    }

    const explanation: MathExpr = [
      txt(`직육면체의 부피 = ${l}×${w}×${h} = ${vol} cm³. `),
      txt(`정육면체의 한 모서리를 □ cm라 하면 □³ = ${vol}. `),
      txt(`${n}³ = ${vol}이므로 □ = ${n} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로 ${l} cm, 세로 ${w} cm, 높이 ${h} cm인 직육면체와 부피가 같은 정육면체의 한 모서리 길이는 몇 cm입니까?`,
      expr: [txt('정육면체 한 모서리 = '), blank(0), txt(' cm')],
      blankAnswers: [n],
      explanation,
    };
  },
  minVariety: 8, // validN 8가지
};

/**
 * ch61-vol-surface  직육면체 겉넓이와 부피 (명세 6-2)
 * l, w, h → 겉넓이 = 2(lw+wh+lh), 부피 = lwh
 * 두 값 중 하나(또는 둘 다) fill-blanks
 */
const chVolSurface: SkillDef = {
  id: 'ch61-vol-surface',
  unitId: 'unitVolume',
  title: '직육면체 겉넓이·부피 계산',
  note: '겉넓이=2(lw+wh+lh), 부피=lwh, fill-blanks 두 칸',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    let l = 5, w = 4, h = 7;
    for (let tries = 0; tries < 2000; tries++) {
      const l2 = rng.int(2, 12);
      const w2 = rng.int(2, 12);
      const h2 = rng.int(2, 12);
      const sa = 2 * (l2 * w2 + w2 * h2 + l2 * h2);
      const vol = l2 * w2 * h2;
      if (sa > 1000 || vol > 1500) continue;
      l = l2; w = w2; h = h2;
      break;
    }

    const sa = 2 * (l * w + w * h + l * h);
    const vol = l * w * h;

    const explanation: MathExpr = [
      txt(`겉넓이 = 2×(${l}×${w} + ${w}×${h} + ${l}×${h}) `),
      txt(`= 2×(${l * w}+${w * h}+${l * h}) `),
      txt(`= 2×${l * w + w * h + l * h} = ${sa} cm². `),
      txt(`부피 = ${l}×${w}×${h} = ${vol} cm³.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로 ${l} cm, 세로 ${w} cm, 높이 ${h} cm인 직육면체의 겉넓이와 부피를 각각 구하세요.`,
      expr: [txt('겉넓이 = '), blank(0), txt(' cm²,  부피 = '), blank(1), txt(' cm³')],
      blankAnswers: [sa, vol],
      explanation,
    };
  },
};

/**
 * ch61-water-fill  물 채우기 높이 역산 (명세 6-7)
 * 직육면체 그릇에 전체의 fraction만큼 물을 채울 때 물의 높이
 */
const chWaterFill: SkillDef = {
  id: 'ch61-water-fill',
  unitId: 'unitVolume',
  title: '직육면체 그릇 물 높이 역산',
  note: '물 부피 = 전체부피×frac, 높이 = 물부피÷(l×w), 자연수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let boxL = 20, boxW = 15, boxH = 12, fracN = 3, fracD = 4, waterH = 9;

    for (let tries = 0; tries < 2000; tries++) {
      const l2 = rng.int(10, 30);
      const w2 = rng.int(10, 25);
      const h2 = rng.int(8, 20);
      const fD = rng.int(2, 6);
      const fN = rng.int(1, fD - 1);
      if (gcd(fN, fD) !== 1) continue;
      // 물의 높이 = h2 × fN/fD 자연수 보장
      if ((h2 * fN) % fD !== 0) continue;
      const wH = (h2 * fN) / fD;
      if (wH <= 0 || wH >= h2) continue;

      boxL = l2; boxW = w2; boxH = h2;
      fracN = fN; fracD = fD; waterH = wH;
      break;
    }

    const vol = boxL * boxW * boxH;
    const waterVol = (vol * fracN) / fracD;

    const explanation: MathExpr = [
      txt(`직육면체 그릇의 전체 부피 = ${boxL}×${boxW}×${boxH} = ${vol} cm³. `),
      txt(`물의 부피 = ${vol} × ${fracN}/${fracD} = ${waterVol} cm³. `),
      txt(`물의 높이 = ${waterVol} ÷ (${boxL}×${boxW}) = ${waterVol} ÷ ${boxL * boxW} = ${waterH} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로 ${boxL} cm, 세로 ${boxW} cm, 높이 ${boxH} cm인 직육면체 그릇의 ${fracN}/${fracD}만큼 물을 채울 때 물의 높이는 몇 cm입니까?`,
      expr: [txt('물의 높이 = '), blank(0), txt(' cm')],
      blankAnswers: [waterH],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  내보내기
// ═══════════════════════════════════════════════════════════════

export const challengeG6S1Skills: SkillDef[] = [
  // unitFracDiv1
  chLineupDist,
  chFracRangeCount,
  chSymbolSub,
  // unitPrism
  chPrismElem,
  chPrismEdgeSum,
  chEuler,
  // unitDecDiv1
  chDecWrong,
  chDecDoubleIneq,
  chDecCircleMeet,
  // unitRatio
  chRatioInv,
  chRatioChain,
  chRatioMix,
  // unitGraph
  chGraphRemain,
  chGraphCascade,
  chGraphReverse,
  // unitVolume
  chCubeEdge,
  chVolSurface,
  chWaterFill,
];
