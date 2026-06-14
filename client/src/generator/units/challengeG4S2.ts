/**
 * 4-2 심화 문제 생성기 (challenge: true, difficulty: 3)
 * 명세: docs/challenge/g4s2.md
 */

import { RNG } from '../rng';
import { ida, josa } from '../josa';
import { gcd } from '../fraction';
import type { MathExpr, MathToken, Problem, SkillDef } from '../types';

// ── 공통 토큰 헬퍼 ──────────────────────────────────────────
const txt = (t: string): MathToken => ({ kind: 'text', text: t });
const blank = (slot: number): MathToken => ({ kind: 'blank', slot });

// ═══════════════════════════════════════════════════════════════
//  unitFracAS4 — 분수의 덧셈과 뺄셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch42-tapefrac  색 테이프 겹쳐 잇기 (겹침 길이 역산)
 * 전체 = n·L − (n−1)·e → e = (n·L − T)/(n−1)
 * fraction-input (mixed 가능, requireIrreducible)
 */
const chTapefrac: SkillDef = {
  id: 'ch42-tapefrac',
  unitId: 'unitFracAS4',
  title: '색 테이프 겹쳐 잇기 (분수)',
  note: 'n=2~4, L 대분수, e 진분수, 동분모, fraction-input requireIrreducible',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: n=3, d=4, L=2+1/4=9/4, e=1/4, T=3×9/4-2×1/4=27/4-2/4=25/4=6+1/4
    let n = 3, d = 4, lWhole = 2, lN = 1, eN = 1, tWhole = 6, tFracN = 1;
    let ansN = 1, ansD = 4;

    for (let tries = 0; tries < 2000; tries++) {
      const n2 = rng.int(2, 4);
      const d2 = rng.pick([3, 4, 5, 6, 8, 9, 10] as const);
      if (d2 > 60) continue;

      // L = lWhole2 + lN2/d2 (대분수, lN2 in [1,d2-1])
      const lWhole2 = rng.int(1, 4);
      const lN2 = rng.int(1, d2 - 1);
      // L as numerator over d2
      const lNum = lWhole2 * d2 + lN2;

      // e = eN2/d2 (진분수, eN2 in [1,d2-1])
      const eN2 = rng.int(1, d2 - 1);

      // T = n·L - (n-1)·e (as fractions over d2)
      // T_num = n·lNum - (n-1)·eN2
      const tNum = n2 * lNum - (n2 - 1) * eN2;
      if (tNum <= 0) continue;

      // T must be > 0 and e > 0 (already)
      // e = (n·L - T)/(n-1) → check: answer is eN2/d2
      // simplify answer
      const g = gcd(eN2, d2);
      const rn = eN2 / g;
      const rd = d2 / g;
      if (rd > 60) continue;
      if (rd < 2) continue; // must be proper fraction

      // T as mixed number for display
      const tW = Math.floor(tNum / d2);
      const tFN = tNum % d2;
      if (tW < 1) continue; // T should be > L for plausibility
      // e should be positive
      if (eN2 <= 0) continue;
      // e < L (겹침이 테이프보다 짧아야)
      if (eN2 >= lNum) continue;

      n = n2; d = d2; lWhole = lWhole2; lN = lN2; eN = eN2;
      tWhole = tW; tFracN = tFN;
      ansN = rn; ansD = rd;
      break;
    }

    const lNum = lWhole * d + lN;
    const tNum = n * lNum - (n - 1) * eN;

    // Check if answer is a mixed number (ansN/ansD is already proper since eN<d)
    // answer is eN/d simplified → ansN/ansD (proper fraction, so whole=0)
    const tStr = tFracN > 0 ? `${tWhole}${josa(tWhole, '과/와')} ${tFracN}/${d}` : `${tWhole}`;

    const explanation: MathExpr = [
      txt(`전체 길이 = 테이프 ${n}장 − 겹친 부분 합 = ${n}×${lWhole}${josa(lWhole, '과/와')} ${lN}/${d} − (${n}−1)×겹침. `),
      txt(`테이프 ${n}장 합: ${n}×${lNum}/${d} = ${n * lNum}/${d}. `),
      txt(`전체 ${tStr} = ${tNum}/${d}. `),
      txt(`(${n}−1)×겹침 = ${n * lNum}/${d} − ${tNum}/${d} = ${n * lNum - tNum}/${d}. `),
      txt(`겹침 = ${n * lNum - tNum}/${d} ÷ ${n - 1} = ${eN}/${d}. `),
      txt(`기약분수: ${ansN}/${ansD}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `길이가 ${lWhole}${josa(lWhole, '과/와')} ${lN}/${d} cm인 색 테이프 ${n}장을 똑같이 겹쳐서 이었더니 전체 길이가 ${tStr} cm가 되었습니다. 겹친 부분의 길이는 몇 cm인가요? (기약분수로)`,
      mixed: false,
      requireIrreducible: true,
      answer: { n: ansN, d: ansD },
      explanation,
    };
  },
};

/**
 * ch42-sumdifffrac  합·차로 큰 대분수
 * 두 대분수의 합 S, 차 D → 더 큰 수 = (S+D)/2
 * fraction-input (mixed=true, requireIrreducible)
 */
const chSumdifffrac: SkillDef = {
  id: 'ch42-sumdifffrac',
  unitId: 'unitFracAS4',
  title: '합·차로 큰 대분수',
  note: '동분모 d, S>D, 분자합 짝수, mixed=true, requireIrreducible',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: d=4, S_num=15(3+3/4), D_num=5(1+1/4) → (15+5)/2=10/4=2+2/4=2+1/2
    let d = 4, sWhole = 3, sN = 3, dWhole = 1, dN = 1;
    let ansWhole = 2, ansFracN = 1, ansFracD = 2;

    for (let tries = 0; tries < 2000; tries++) {
      const d2 = rng.pick([3, 4, 5, 6, 8, 9, 10] as const);
      if (d2 > 60) continue;

      // 두 대분수 A > B, 동분모 d2
      // A = aW + aN/d2, B = bW + bN/d2
      const aW = rng.int(2, 6);
      const aN = rng.int(1, d2 - 1);
      const bW = rng.int(1, aW - 1); // B < A
      const bN = rng.int(1, d2 - 1);

      const aNum = aW * d2 + aN; // A as num/d2
      const bNum = bW * d2 + bN; // B as num/d2
      if (aNum <= bNum) continue;

      // S = A+B, D = A-B (분자로)
      const sNum = aNum + bNum;
      const dNum = aNum - bNum;

      // 더 큰 수 = (S+D)/2 = aNum/d2
      // S+D must be even (sNum+dNum = 2*aNum, always even)
      const ansNum = aNum; // = (sNum + dNum) / 2

      // ansNum/d2 → 기약 대분수
      const g = gcd(ansNum % d2, d2);
      const rn = (ansNum % d2) / g;
      const rd = d2 / g;
      const rw = Math.floor(ansNum / d2);

      if (rw < 1) continue;
      if (rn < 1) continue; // 정수가 되면 안됨 (분수부 필요)
      if (rd > 60) continue;

      // S, D as mixed numbers (display)
      const sW2 = Math.floor(sNum / d2);
      const sN2 = sNum % d2;
      const dW2 = Math.floor(dNum / d2);
      const dN2 = dNum % d2;

      // S, D should be proper mixed numbers (D could be a fraction < 1)
      if (sW2 < 1) continue;
      // D can be just fraction or mixed - but dNum > 0 ensured

      d = d2;
      sWhole = sW2; sN = sN2;
      dWhole = dW2; dN = dN2;
      ansWhole = rw; ansFracN = rn; ansFracD = rd;
      break;
    }

    const sStr = sN > 0 ? `${sWhole}${josa(sWhole, '과/와')} ${sN}/${d}` : `${sWhole}`;
    const dStr = dWhole > 0
      ? (dN > 0 ? `${dWhole}${josa(dWhole, '과/와')} ${dN}/${d}` : `${dWhole}`)
      : `${dN}/${d}`;

    const explanation: MathExpr = [
      txt(`두 대분수의 합 S = ${sStr}, 차 D = ${dStr}. `),
      txt(`더 큰 수 = (S + D) ÷ 2. `),
      txt(`S + D = (${sWhole * d + sN}/${d}) + (${dWhole * d + dN}/${d}) = ${sWhole * d + sN + dWhole * d + dN}/${d}. `),
      txt(`더 큰 수 = ${(sWhole * d + sN + dWhole * d + dN)}/${d} ÷ 2 = ${(sWhole * d + sN + dWhole * d + dN) / 2}/${d}. `),
      txt(`대분수(기약): ${ansWhole}${josa(ansWhole, '과/와')} ${ansFracN}/${ansFracD}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `분모가 ${d}인 두 대분수의 합이 ${sStr}이고, 차가 ${dStr}일 때 더 큰 대분수를 구하세요. (기약분수로)`,
      mixed: true,
      requireIrreducible: true,
      answer: { whole: ansWhole, n: ansFracN, d: ansFracD },
      explanation,
    };
  },
};

/**
 * ch42-bloodtype  분수 부분으로 전체 인원
 * 나머지 비율=(d−2a−b)/d, T=N×d/(d−2a−b), fill-blanks 명
 */
const chBloodtype: SkillDef = {
  id: 'ch42-bloodtype',
  unitId: 'unitFracAS4',
  title: '분수 부분으로 전체 인원',
  note: 'T=m×d, N=m×(d-2a-b), 나머지≥1, fill-blanks 명',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: d=10, a=2, b=3 → 나머지=(10-4-3)/10=3/10, T=50, N=15
    let d = 10, a = 2, b = 3;
    let T = 50, N = 15;

    for (let tries = 0; tries < 2000; tries++) {
      const d2 = rng.pick([8, 9, 10, 12] as const);
      const a2 = rng.int(1, 3);
      const b2 = rng.int(1, 3);
      const rem = d2 - 2 * a2 - b2;
      if (rem < 1) continue; // 나머지 비율 양수
      if (2 * a2 + b2 >= d2) continue;
      // T = m×d2, N = m×rem
      const m2 = rng.int(2, 8);
      const T2 = m2 * d2;
      const N2 = m2 * rem;
      if (T2 > 200) continue;
      if (N2 < 1) continue;

      d = d2; a = a2; b = b2;
      T = T2; N = N2;
      break;
    }

    const rem = d - 2 * a - b;

    const explanation: MathExpr = [
      txt(`전체를 T명이라 하면, ㉮는 ${a}/${d}×T, ㉯는 ${b}/${d}×T, ㉰는 ㉮와 같으므로 ${a}/${d}×T. `),
      txt(`비율 합: ${a}/${d} + ${b}/${d} + ${a}/${d} = ${2 * a + b}/${d}. `),
      txt(`나머지 ㉱의 비율: 1 − ${2 * a + b}/${d} = ${rem}/${d}. `),
      txt(`㉱(나머지)는 N명 = ${rem}/${d}×T이므로 T = ${N} × ${d} ÷ ${rem} = ${T}${ida('명')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `어느 반 전체의 ${a}/${d}은 ㉮혈액형, ${b}/${d}은 ㉯혈액형, ㉰혈액형은 ㉮혈액형과 같고, 나머지 ㉱혈액형은 ${N}명입니다. 전체 인원은 몇 명인가요?`,
      expr: [blank(0), txt(' 명')],
      blankAnswers: [T],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitTriangle — 삼각형
// ═══════════════════════════════════════════════════════════════

/**
 * ch42-isoperim  이등변삼각형 둘레/변
 * 둘레 P, 등변 a → 밑변 = P−2a (>0). 또는 밑변 주고 등변 묻기.
 * fill-blanks cm
 */
const chIsoperim: SkillDef = {
  id: 'ch42-isoperim',
  unitId: 'unitTriangle',
  title: '이등변삼각형 둘레/변',
  note: 'P=등변2a+밑변, 둘 다 양수, fill-blanks cm',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: P=18, a=6, base=6
    let P = 18, a = 6, base = 6;
    let askBase = true;

    for (let tries = 0; tries < 2000; tries++) {
      const isAskBase = rng.chance(0.5);
      const a2 = rng.int(3, 15);
      const base2 = rng.int(2, 15);
      // 삼각형 성립: 밑변 < 2×등변
      if (base2 >= 2 * a2) continue;
      if (base2 === a2) continue; // 정삼각형 제외 (이등변이지만 너무 단순)
      const P2 = 2 * a2 + base2;
      if (P2 > 60) continue;

      P = P2; a = a2; base = base2; askBase = isAskBase;
      break;
    }

    if (askBase) {
      const explanation: MathExpr = [
        txt(`이등변삼각형의 둘레 = 등변 × 2 + 밑변. `),
        txt(`밑변 = 둘레 − 등변 × 2 = ${P} − ${a} × 2 = ${P} − ${2 * a} = ${base} cm.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `이등변삼각형의 세 변의 길이의 합이 ${P} cm이고, 길이가 같은 두 변 각각이 ${a} cm일 때 나머지 한 변(밑변)의 길이는 몇 cm인가요?`,
        expr: [blank(0), txt(' cm')],
        blankAnswers: [base],
        explanation,
      };
    } else {
      const explanation: MathExpr = [
        txt(`이등변삼각형의 둘레 = 등변 × 2 + 밑변. `),
        txt(`등변 × 2 = 둘레 − 밑변 = ${P} − ${base} = ${P - base} cm. `),
        txt(`등변 = ${P - base} ÷ 2 = ${a} cm.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `이등변삼각형의 세 변의 길이의 합이 ${P} cm이고, 밑변의 길이가 ${base} cm일 때 길이가 같은 두 변(등변) 한 개의 길이는 몇 cm인가요?`,
        expr: [blank(0), txt(' cm')],
        blankAnswers: [a],
        explanation,
      };
    }
  },
};

/**
 * ch42-isoangle  이등변삼각형 각
 * 꼭지각 x → 밑각 = (180-x)/2. 또는 밑각 y → 꼭지각 = 180-2y.
 * fill-blanks °
 */
const chIsoangle: SkillDef = {
  id: 'ch42-isoangle',
  unitId: 'unitTriangle',
  title: '이등변삼각형 각',
  note: '꼭지각→밑각 또는 밑각→꼭지각, 결과 양의 정수 °, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: 꼭지각=40°, 밑각=70°
    let apex = 40, base = 70;
    let askBase = true;

    for (let tries = 0; tries < 2000; tries++) {
      const isAskBase = rng.chance(0.5);
      if (isAskBase) {
        // 꼭지각 → 밑각: apex must be even (so (180-apex)/2 is integer)
        // Or just ensure (180-apex) is even → apex must be even
        const apex2 = rng.int(10, 80) * 2; // even, 20~160
        if (apex2 <= 0 || apex2 >= 180) continue;
        const base2 = (180 - apex2) / 2;
        if (base2 <= 0 || !Number.isInteger(base2)) continue;
        apex = apex2; base = base2; askBase = true;
      } else {
        // 밑각 → 꼭지각: base must make apex = 180-2*base > 0
        const base2 = rng.int(20, 85);
        const apex2 = 180 - 2 * base2;
        if (apex2 <= 0) continue;
        apex = apex2; base = base2; askBase = false;
      }
      break;
    }

    if (askBase) {
      const explanation: MathExpr = [
        txt(`이등변삼각형의 두 밑각의 크기는 같아요. `),
        txt(`세 각의 합 = 180°이므로, 두 밑각의 합 = 180° − 꼭지각 = 180° − ${apex}° = ${180 - apex}°. `),
        txt(`한 밑각 = ${180 - apex} ÷ 2 = ${base}°.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `이등변삼각형에서 꼭지각이 ${apex}°일 때 한 밑각의 크기는 몇 도인가요?`,
        expr: [blank(0), txt('°')],
        blankAnswers: [base],
        explanation,
      };
    } else {
      const explanation: MathExpr = [
        txt(`이등변삼각형의 두 밑각의 크기는 같아요. `),
        txt(`꼭지각 = 180° − 두 밑각의 합 = 180° − ${base}° × 2 = 180° − ${2 * base}° = ${apex}°.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `이등변삼각형에서 밑각이 ${base}°일 때 꼭지각의 크기는 몇 도인가요?`,
        expr: [blank(0), txt('°')],
        blankAnswers: [apex],
        explanation,
      };
    }
  },
};

/**
 * ch42-tristrip  정삼각형 줄 둘레
 * 한 변 s cm인 정삼각형 n개를 위아래 번갈아 한 줄로 이으면 둘레 = (n+2)×s
 * n=3~8, s=2~9, fill-blanks cm
 */
const chTristrip: SkillDef = {
  id: 'ch42-tristrip',
  unitId: 'unitTriangle',
  title: '정삼각형 줄 둘레',
  note: '둘레=(n+2)×s, n=3~8, s=2~9, fill-blanks cm, minVariety:42',
  difficulty: 3,
  challenge: true,
  minVariety: 42,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const n = rng.int(3, 8);
    const s = rng.int(2, 9);
    const ans = (n + 2) * s;

    const explanation: MathExpr = [
      txt(`정삼각형 ${n}개를 위아래 번갈아 한 줄로 이어 붙이면, `),
      txt(`겉으로 드러나는 변의 수는 n+2 = ${n}+2 = ${n + 2}개예요. `),
      txt(`둘레 = ${n + 2} × ${s} = ${ans} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 변이 ${s} cm인 정삼각형 ${n}개를 위아래 번갈아 한 줄로 이어 붙인 도형의 둘레는 몇 cm인가요?`,
      expr: [blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitDecAS — 소수의 덧셈과 뺄셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch42-dectape  색 테이프 겹쳐 잇기 (소수, 겹침 역산)
 * e=(n·L−T)/(n−1), ×100 정수 계산
 * decimal-input
 */
const chDectape: SkillDef = {
  id: 'ch42-dectape',
  unitId: 'unitDecAS',
  title: '색 테이프 겹쳐 잇기 (소수)',
  note: 'e=(n·L-T)/(n-1), ×100 정수계산, decimal-input',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: n=3, L=3.50, e=0.20, T=3×350-2×20=1050-40=1010 → T=10.10
    let n = 3, L100 = 350, e100 = 20, T100 = 1010;

    for (let tries = 0; tries < 2000; tries++) {
      const n2 = rng.int(2, 4);
      // L in [1.00, 5.00] (×100 = 100~500), step 10
      const L100_2 = rng.int(10, 50) * 10; // 100~500
      // e in [0.10, 0.90] step 0.10 (must be < L)
      const e100_2 = rng.int(1, 9) * 10; // 10~90
      if (e100_2 >= L100_2) continue;
      // T = n·L − (n−1)·e
      const T100_2 = n2 * L100_2 - (n2 - 1) * e100_2;
      if (T100_2 <= 0) continue;
      // Check: e = (n·L - T)/(n-1)
      const eCheck = (n2 * L100_2 - T100_2);
      if (eCheck % (n2 - 1) !== 0) continue;
      if (eCheck / (n2 - 1) !== e100_2) continue;
      // e×10000 must be integer → e100_2 is integer, e=e100_2/100, e×10000=e100_2×100 ✓
      if (T100_2 % 1 !== 0) continue;

      n = n2; L100 = L100_2; e100 = e100_2; T100 = T100_2;
      break;
    }

    const L = L100 / 100;
    const e = e100 / 100;
    const T = T100 / 100;

    const explanation: MathExpr = [
      txt(`전체 길이 = 테이프 ${n}장 − 겹친 부분 합 이므로, `),
      txt(`${T} = ${n} × ${L} − (${n}−1) × 겹침. `),
      txt(`(${n}−1) × 겹침 = ${n} × ${L} − ${T} = ${(n * L100) / 100} − ${T} = ${(n * L100 - T100) / 100}. `),
      txt(`겹침 = ${(n * L100 - T100) / 100} ÷ ${n - 1} = ${e} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `길이가 ${L} cm인 색 테이프 ${n}장을 같은 길이씩 겹쳐서 이었더니 전체 길이가 ${T} cm가 되었습니다. 겹친 부분의 길이는 몇 cm인가요?`,
      answer: e,
      explanation,
    };
  },
};

/**
 * ch42-decsumdiff  합·차로 큰 소수
 * 더 큰 수 = (S+D)/2, ×100 정수 계산
 * decimal-input
 */
const chDecsumdiff: SkillDef = {
  id: 'ch42-decsumdiff',
  unitId: 'unitDecAS',
  title: '합·차로 큰 소수',
  note: '(S+D)/2, ×100 정수계산, decimal-input',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: S=10.50, D=2.30 → 큰 수=(1050+230)/2=640 → 6.40
    let S100 = 1050, D100 = 230, ans100 = 640;

    for (let tries = 0; tries < 2000; tries++) {
      // 두 소수 A > B (소수 둘째 자리)
      // A = a100/100, B = b100/100
      const a100 = rng.int(101, 999); // 1.01 ~ 9.99
      const b100 = rng.int(10, a100 - 10); // B < A, at least 0.10

      const S100_2 = a100 + b100;
      const D100_2 = a100 - b100;
      // S+D must be even (= 2*a100, always even)
      const ans100_2 = a100; // (S+D)/2 = a100

      if (ans100_2 <= 0) continue;
      // ans×10000 = ans100_2×100 → integer ✓
      // S and D should be reasonable
      if (S100_2 > 1500) continue;
      if (D100_2 <= 0) continue;

      S100 = S100_2; D100 = D100_2; ans100 = ans100_2;
      break;
    }

    const S = S100 / 100;
    const D = D100 / 100;
    const ans = ans100 / 100;

    const explanation: MathExpr = [
      txt(`두 소수의 합 S = ${S}, 차 D = ${D}. `),
      txt(`더 큰 수 + 더 작은 수 = ${S}, 더 큰 수 − 더 작은 수 = ${D}. `),
      txt(`더 큰 수 × 2 = ${S} + ${D} = ${(S100 + D100) / 100}. `),
      txt(`더 큰 수 = ${(S100 + D100) / 100} ÷ 2 = ${ans}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `두 소수의 합이 ${S}이고, 차가 ${D}일 때 더 큰 소수는 얼마인가요?`,
      answer: ans,
      explanation,
    };
  },
};

/**
 * ch42-decbetween  소수 한 자리 수 개수
 * A보다 크고 B보다 작은 소수 한 자리 수의 개수 = B×10 - A×10 - 1
 * fill-blanks 개
 */
const chDecbetween: SkillDef = {
  id: 'ch42-decbetween',
  unitId: 'unitDecAS',
  title: '소수 한 자리 수 개수',
  note: 'A<x<B, x 소수 한 자리, 개수 2~9, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: A=1.2, B=3.0 → 1.3,1.4,...,2.9 → 16개? 범위 재설정
    // A=2.3, B=3.5 → 2.4,2.5,...,3.4 → 10종? 개수=B×10-A×10-1=35-23-1=11
    // 개수 2~9 보장
    let A10 = 23, B10 = 27, ans = 3;

    for (let tries = 0; tries < 2000; tries++) {
      // A, B: 소수 한 자리 (×10 정수) A < B
      const A10_2 = rng.int(10, 85); // 1.0 ~ 8.5
      const cnt = rng.int(2, 9);
      // A보다 크고 B보다 작은 소수 한 자리 = A10+1, A10+2, ... → 개수
      // 최대 값 = A10+cnt (B10 = A10+cnt+1 이상이면 됨)
      const B10_2 = A10_2 + cnt + 1; // 딱 cnt개
      if (B10_2 > 99) continue; // 9.9 이하
      // 실제 검증
      const realCnt = B10_2 - A10_2 - 1;
      if (realCnt !== cnt) continue;
      if (realCnt < 2 || realCnt > 9) continue;

      A10 = A10_2; B10 = B10_2; ans = cnt;
      break;
    }

    const A = A10 / 10;
    const B = B10 / 10;

    // 해당 수 나열 (최대 9개)
    const list: number[] = [];
    for (let x10 = A10 + 1; x10 < B10; x10++) {
      list.push(x10 / 10);
    }

    const explanation: MathExpr = [
      txt(`${A}보다 크고 ${B}보다 작은 소수 한 자리 수를 찾아요. `),
      txt(`해당하는 수: ${list.join(', ')}. `),
      txt(`모두 ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${A}보다 크고 ${B}보다 작은 소수 한 자리 수는 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitQuad — 사각형
// ═══════════════════════════════════════════════════════════════

/**
 * ch42-paralleldist  평행선 사이 거리
 * 가와 라 사이 P, 가와 나 사이 a, 다와 라 사이 b → 나와 다 사이 = P-a-b
 * fill-blanks cm
 */
const chParalleldist: SkillDef = {
  id: 'ch42-paralleldist',
  unitId: 'unitQuad',
  title: '평행선 사이 거리',
  note: 'P-a-b > 0, fill-blanks cm',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: P=20, a=5, b=7, ans=8
    let P = 20, a = 5, b = 7, ans = 8;

    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(2, 10);
      const b2 = rng.int(2, 10);
      const mid2 = rng.int(2, 10); // 나와 다 사이 거리
      const P2 = a2 + mid2 + b2;
      if (P2 > 40) continue;
      if (mid2 <= 0) continue;

      P = P2; a = a2; b = b2; ans = mid2;
      break;
    }

    const explanation: MathExpr = [
      txt(`직선 가, 나, 다, 라가 차례로 평행합니다. `),
      txt(`가와 라 사이 거리 = 가↔나 + 나↔다 + 다↔라 = ${P} cm. `),
      txt(`나와 다 사이 거리 = ${P} − ${a} − ${b} = ${ans} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `직선 가, 나, 다, 라가 차례로 평행합니다. 가와 라 사이의 거리가 ${P} cm이고, 가와 나 사이의 거리가 ${a} cm, 다와 라 사이의 거리가 ${b} cm일 때 나와 다 사이의 거리는 몇 cm인가요?`,
      expr: [blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch42-quadangle  사각형 네 각
 * 세 각 a, b, c → 나머지 한 각 = 360-a-b-c (>0, 권장<180)
 * fill-blanks °
 */
const chQuadangle: SkillDef = {
  id: 'ch42-quadangle',
  unitId: 'unitQuad',
  title: '사각형 네 각',
  note: '360-a-b-c >0 <180 권장, fill-blanks °',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: a=80, b=100, c=90 → ans=90
    let a = 80, b = 100, c = 90, ans = 90;

    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(40, 140);
      const b2 = rng.int(40, 140);
      const c2 = rng.int(40, 140);
      const ans2 = 360 - a2 - b2 - c2;
      if (ans2 <= 0) continue;
      if (ans2 >= 180) continue; // 권장 조건
      // 삼각형이 되지 않도록: 4개 각 모두 0~360 범위
      a = a2; b = b2; c = c2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`사각형의 네 각의 합은 360°예요. `),
      txt(`나머지 한 각 = 360° − ${a}° − ${b}° − ${c}° = ${360 - a - b - c}°.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `어떤 사각형의 네 각 중 세 각이 ${a}°, ${b}°, ${c}°일 때 나머지 한 각의 크기는 몇 도인가요?`,
      expr: [blank(0), txt('°')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch42-paraperim  평행사변형 둘레 / 마름모 둘레
 * fill-blanks cm
 */
const chParaperim: SkillDef = {
  id: 'ch42-paraperim',
  unitId: 'unitQuad',
  title: '평행사변형·마름모 둘레',
  note: '평행사변형 2(a+b) 또는 마름모 4s, fill-blanks cm',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: 평행사변형 a=7, b=5 → 2×(7+5)=24
    let isRhombus = false, a = 7, b = 5, ans = 24;

    for (let tries = 0; tries < 2000; tries++) {
      const rhombus = rng.chance(0.35);
      if (rhombus) {
        const s = rng.int(3, 15);
        ans = 4 * s;
        if (ans > 80) continue;
        a = s; b = s; isRhombus = true;
      } else {
        const a2 = rng.int(3, 15);
        const b2 = rng.int(3, 15);
        if (a2 === b2) continue; // 정사각형 제외
        const ans2 = 2 * (a2 + b2);
        if (ans2 > 80) continue;
        a = a2; b = b2; ans = ans2; isRhombus = false;
      }
      break;
    }

    if (isRhombus) {
      const explanation: MathExpr = [
        txt(`마름모는 네 변의 길이가 모두 같아요. `),
        txt(`둘레 = ${a} × 4 = ${ans} cm.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `한 변이 ${a} cm인 마름모의 네 변 길이의 합은 몇 cm인가요?`,
        expr: [blank(0), txt(' cm')],
        blankAnswers: [ans],
        explanation,
      };
    } else {
      const explanation: MathExpr = [
        txt(`평행사변형은 마주 보는 두 쌍의 변의 길이가 같아요. `),
        txt(`둘레 = (${a} + ${b}) × 2 = ${a + b} × 2 = ${ans} cm.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `평행사변형의 한 변이 ${a} cm이고 이웃한 변이 ${b} cm일 때 네 변 길이의 합은 몇 cm인가요?`,
        expr: [blank(0), txt(' cm')],
        blankAnswers: [ans],
        explanation,
      };
    }
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitLineGraph — 꺾은선그래프
// ═══════════════════════════════════════════════════════════════

/**
 * ch42-linescaletotal  눈금 한 칸으로 전체 합
 * k × (m1+m2+m3+m4) = 전체 합
 * fill-blanks
 */
const chLinescaletotal: SkillDef = {
  id: 'ch42-linescaletotal',
  unitId: 'unitLineGraph',
  title: '눈금 한 칸으로 전체 합',
  note: 'k×(m1+m2+m3+m4), k=2~10, mi=1~8, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const topics = [
      { label: '연도별', items: ['2020년', '2021년', '2022년', '2023년'], unit: '명' },
      { label: '월별', items: ['3월', '4월', '5월', '6월'], unit: '개' },
      { label: '분기별', items: ['1분기', '2분기', '3분기', '4분기'], unit: '상자' },
      { label: '요일별', items: ['월', '화', '수', '목'], unit: '명' },
    ];

    // 폴백
    let k = 5, m1 = 3, m2 = 4, m3 = 6, m4 = 2, ans = 75;
    let topic = topics[0];

    for (let tries = 0; tries < 2000; tries++) {
      const k2 = rng.int(2, 10);
      const m1_2 = rng.int(1, 8);
      const m2_2 = rng.int(1, 8);
      const m3_2 = rng.int(1, 8);
      const m4_2 = rng.int(1, 8);
      const ans2 = k2 * (m1_2 + m2_2 + m3_2 + m4_2);
      if (ans2 < 10 || ans2 > 300) continue;
      k = k2; m1 = m1_2; m2 = m2_2; m3 = m3_2; m4 = m4_2; ans = ans2;
      topic = rng.pick(topics);
      break;
    }

    const [it1, it2, it3, it4] = topic.items;

    const explanation: MathExpr = [
      txt(`세로 눈금 한 칸이 ${k}${topic.unit}이에요. `),
      txt(`${it1}: ${m1}칸 → ${k * m1}${topic.unit}, ${it2}: ${m2}칸 → ${k * m2}${topic.unit}. `),
      txt(`${it3}: ${m3}칸 → ${k * m3}${topic.unit}, ${it4}: ${m4}칸 → ${k * m4}${topic.unit}. `),
      txt(`전체: ${k * m1} + ${k * m2} + ${k * m3} + ${k * m4} = ${ans}${ida(topic.unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `꺾은선그래프에서 세로 눈금 한 칸이 ${k}${topic.unit}을 나타냅니다. ${it1}의 꺾은선은 ${m1}칸, ${it2}는 ${m2}칸, ${it3}는 ${m3}칸, ${it4}는 ${m4}칸입니다. 전체 합계는 몇 ${topic.unit}인가요?`,
      expr: [blank(0), txt(` ${topic.unit}`)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch42-linerescale  눈금 재조정
 * 새 눈금 한 칸 크기 = (M−m)/c (정수)
 * fill-blanks
 */
const chLinerescale: SkillDef = {
  id: 'ch42-linerescale',
  unitId: 'unitLineGraph',
  title: '눈금 재조정',
  note: '(M-m)/c 정수, c=2~6, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const units = ['명', '개', 'kg', 'cm'];

    // 폴백: M=120, m=30, c=3 → 새 칸=30
    let M = 120, m = 30, c = 3, ans = 30;
    let unit = '명';

    for (let tries = 0; tries < 2000; tries++) {
      const c2 = rng.int(2, 6);
      const ans2 = rng.int(2, 20) * 5; // 새 칸 크기 (5의 배수 권장)
      const diff = ans2 * c2; // M - m
      const m2 = rng.int(5, 50);
      const M2 = m2 + diff;
      if (M2 > 500) continue;
      if (M2 <= m2) continue;
      // 검증
      if ((M2 - m2) % c2 !== 0) continue;
      if ((M2 - m2) / c2 !== ans2) continue;

      M = M2; m = m2; c = c2; ans = ans2;
      unit = rng.pick(units);
      break;
    }

    const explanation: MathExpr = [
      txt(`최댓값과 최솟값의 차: ${M} − ${m} = ${M - m}. `),
      txt(`이 차이가 ${c}칸으로 표현되므로 새 눈금 한 칸의 크기 = ${M - m} ÷ ${c} = ${ans}${ida(unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `어떤 꺾은선그래프에서 값의 최댓값은 ${M}${unit}이고 최솟값은 ${m}${unit}입니다. 눈금 한 칸의 크기를 바꿔 다시 그렸더니 최댓값과 최솟값의 칸 수 차이가 ${c}칸이 되었습니다. 새 눈금 한 칸의 크기는 몇 ${unit}인가요?`,
      expr: [blank(0), txt(` ${unit}`)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch42-linemissing  관계로 빠진 값
 * 4개 항목 합 N, 세 값 v1,v2,v3 → 빠진 값 = N-v1-v2-v3 (>0)
 * fill-blanks
 */
const chLinemissing: SkillDef = {
  id: 'ch42-linemissing',
  unitId: 'unitLineGraph',
  title: '관계로 빠진 값',
  note: 'N-v1-v2-v3 > 0, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const topics = [
      { items: ['1월', '2월', '3월', '4월'], unit: '명', thing: '월별 방문자 수' },
      { items: ['봄', '여름', '가을', '겨울'], unit: '개', thing: '계절별 판매량' },
      { items: ['1반', '2반', '3반', '4반'], unit: '명', thing: '반별 독서 수' },
      { items: ['가', '나', '다', '라'], unit: 'kg', thing: '항목별 무게' },
    ];

    // 폴백
    let v1 = 25, v2 = 30, v3 = 20, ans = 25, N = 100;
    let topic = topics[0];
    let hiddenIdx = 3;

    for (let tries = 0; tries < 2000; tries++) {
      const top = rng.pick(topics);
      const v1_2 = rng.int(10, 50);
      const v2_2 = rng.int(10, 50);
      const v3_2 = rng.int(10, 50);
      const ans2 = rng.int(5, 40);
      const N2 = v1_2 + v2_2 + v3_2 + ans2;
      if (N2 > 200) continue;
      if (ans2 < 1) continue;
      const hiddenIdx2 = rng.int(0, 3);

      v1 = v1_2; v2 = v2_2; v3 = v3_2; ans = ans2; N = N2;
      topic = top; hiddenIdx = hiddenIdx2;
      break;
    }

    const vals = [v1, v2, v3, ans];
    // Rearrange so hidden is at hiddenIdx
    const display = [...vals];
    // We need to put ans at hiddenIdx position
    // Currently ans is at index 3, swap with hiddenIdx
    [display[hiddenIdx], display[3]] = [display[3], display[hiddenIdx]];

    const items = topic.items;
    const visibleStr = items.map((itm, i) =>
      i === hiddenIdx ? `${itm}: ?` : `${itm}: ${display[i]}${topic.unit}`
    ).join(', ');

    const known = display
      .map((v, i) => i !== hiddenIdx ? `${v}` : null)
      .filter(Boolean).join(' + ');

    const explanation: MathExpr = [
      txt(`4개 항목의 합: ${N}${topic.unit}. `),
      txt(`나머지 세 항목의 합: ${known} = ${N - ans}${topic.unit}. `),
      txt(`빠진 값: ${N} − ${N - ans} = ${ans}${ida(topic.unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음은 ${topic.thing}입니다. 4개 항목의 합이 ${N}${topic.unit}일 때 빠진 값은 얼마인가요?\n${visibleStr}`,
      expr: [blank(0), txt(` ${topic.unit}`)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitPolygon — 다각형
// ═══════════════════════════════════════════════════════════════

// 정다각형 한 내각 테이블 (정수인 것만)
const REGULAR_POLY_ANGLE: Record<number, number> = {
  3: 60,
  4: 90,
  5: 108,
  6: 120,
  8: 135,
  9: 140,
  10: 144,
  12: 150,
};
const REGULAR_POLY_SIDES = [3, 4, 5, 6, 8, 9, 10, 12];

/**
 * ch42-polydiag  다각형 대각선 수
 * n각형 대각선 = n×(n−3)÷2, n=4~12
 * 변형: 대각선 N개 → 변의 수 역산
 * fill-blanks
 */
const chPolydiag: SkillDef = {
  id: 'ch42-polydiag',
  unitId: 'unitPolygon',
  title: '다각형 대각선 수',
  note: 'n=4~12, 정방향 또는 역방향, fill-blanks, minVariety:18',
  difficulty: 3,
  challenge: true,
  minVariety: 18,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const n = rng.int(4, 12);
    const diag = n * (n - 3) / 2;
    const askForward = rng.chance(0.6); // 정방향: n각형의 대각선 수

    const POLY_NAMES: Record<number, string> = {
      4: '사각형', 5: '오각형', 6: '육각형', 7: '칠각형',
      8: '팔각형', 9: '구각형', 10: '십각형', 11: '십일각형', 12: '십이각형',
    };
    const polyName = POLY_NAMES[n] || `${n}각형`;

    if (askForward) {
      const explanation: MathExpr = [
        txt(`${n}각형에서 한 꼭짓점에서 그을 수 있는 대각선 수: ${n}−3 = ${n - 3}개. `),
        txt(`전체 대각선 수 = ${n} × ${n - 3} ÷ 2 = ${diag}${ida('개')}.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${polyName}에 그을 수 있는 대각선은 모두 몇 개인가요?`,
        expr: [blank(0), txt(' 개')],
        blankAnswers: [diag],
        explanation,
      };
    } else {
      // 역산: 대각선이 diag개 → n각형의 변의 수
      const explanation: MathExpr = [
        txt(`변의 수를 n이라 하면 대각선 수 = n×(n−3)÷2 = ${diag}. `),
        txt(`n×(n−3) = ${2 * diag}. `),
        txt(`n = ${n}${josa(n, '을/를')} 대입하면 ${n}×${n - 3} = ${n * (n - 3)}이므로 ${2 * diag} ÷ 2 = ${diag}. 맞아요! `),
        txt(`따라서 변의 수는 ${ida(n)}.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `대각선이 ${diag}개인 다각형의 변의 수는 몇 개인가요?`,
        expr: [blank(0), txt(' 개')],
        blankAnswers: [n],
        explanation,
      };
    }
  },
};

/**
 * ch42-polyangle  두 정다각형 사이 각
 * 정m각형과 정n각형을 한 변끼리 붙였을 때 바깥쪽 각 = 360 - 정m내각 - 정n내각
 * 변형: 정n각형 한 내각 자체
 * fill-blanks °
 */
const chPolyangle: SkillDef = {
  id: 'ch42-polyangle',
  unitId: 'unitPolygon',
  title: '두 정다각형 사이 각',
  note: '360-정m내각-정n내각 >0, minVariety:28',
  difficulty: 3,
  challenge: true,
  minVariety: 28,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 변형 A: 두 정다각형 붙일 때 바깥 각
    // 변형 B: 정다각형 한 내각
    const askBetween = rng.chance(0.6);

    if (askBetween) {
      // 폴백: m=4(90°), n=6(120°) → 360-90-120=150
      let m = 4, n = 6, ans = 150;

      for (let tries = 0; tries < 2000; tries++) {
        const m2 = rng.pick(REGULAR_POLY_SIDES);
        const n2 = rng.pick(REGULAR_POLY_SIDES);
        const ang = 360 - REGULAR_POLY_ANGLE[m2] - REGULAR_POLY_ANGLE[n2];
        if (ang <= 0) continue;
        m = m2; n = n2; ans = ang;
        break;
      }

      const POLY_NAMES: Record<number, string> = {
        3: '삼각형', 4: '사각형', 5: '오각형', 6: '육각형',
        8: '팔각형', 9: '구각형', 10: '십각형', 12: '십이각형',
      };

      const explanation: MathExpr = [
        txt(`정${POLY_NAMES[m]}의 한 내각: (${m}−2)×180÷${m} = ${REGULAR_POLY_ANGLE[m]}°. `),
        txt(`정${POLY_NAMES[n]}의 한 내각: (${n}−2)×180÷${n} = ${REGULAR_POLY_ANGLE[n]}°. `),
        txt(`한 점 주위 각도의 합 = 360°이므로 바깥쪽 각 = 360 − ${REGULAR_POLY_ANGLE[m]} − ${REGULAR_POLY_ANGLE[n]} = ${ans}°.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `정${POLY_NAMES[m]}과 정${POLY_NAMES[n]}을 한 변끼리 붙였을 때 두 도형 바깥쪽에 생기는 각의 크기는 몇 도인가요?`,
        expr: [blank(0), txt('°')],
        blankAnswers: [ans],
        explanation,
      };
    } else {
      // 변형 B: 정n각형 한 내각
      const n = rng.pick(REGULAR_POLY_SIDES);
      const ans = REGULAR_POLY_ANGLE[n];

      const POLY_NAMES: Record<number, string> = {
        3: '삼각형', 4: '사각형', 5: '오각형', 6: '육각형',
        8: '팔각형', 9: '구각형', 10: '십각형', 12: '십이각형',
      };

      const explanation: MathExpr = [
        txt(`정${POLY_NAMES[n]}의 내각의 합: (${n}−2) × 180 = ${(n - 2) * 180}°. `),
        txt(`모든 내각의 크기가 같으므로 한 내각 = ${(n - 2) * 180} ÷ ${n} = ${ans}°.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `정${POLY_NAMES[n]}의 한 내각의 크기는 몇 도인가요?`,
        expr: [blank(0), txt('°')],
        blankAnswers: [ans],
        explanation,
      };
    }
  },
};

/**
 * ch42-polywire  정다각형 철사 변 수
 * 정m각형 철사 → 한 변 b인 정다각형 변 수 = (m×a)/b (정수, ≥3)
 * fill-blanks 개
 */
const chPolywire: SkillDef = {
  id: 'ch42-polywire',
  unitId: 'unitPolygon',
  title: '정다각형 철사 변 수',
  note: '(m×a)÷b 정수≥3, m×a는 b의 배수, fill-blanks 개',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: m=6, a=4 → 총=24, b=3 → 8각형
    let m = 6, a = 4, b = 3, totalLen = 24, ans = 8;

    for (let tries = 0; tries < 2000; tries++) {
      const m2 = rng.pick(REGULAR_POLY_SIDES);
      const a2 = rng.int(2, 10);
      const total2 = m2 * a2;
      // b는 total2의 약수, 몫 ≥ 3
      const b2 = rng.int(2, 12);
      if (total2 % b2 !== 0) continue;
      const ans2 = total2 / b2;
      if (ans2 < 3) continue;
      if (ans2 > 20) continue;
      if (b2 === a2 && m2 === ans2) continue; // 같은 도형 제외 (trivial)

      m = m2; a = a2; b = b2; totalLen = total2; ans = ans2;
      break;
    }

    const POLY_NAMES: Record<number, string> = {
      3: '삼각형', 4: '사각형', 5: '오각형', 6: '육각형',
      8: '팔각형', 9: '구각형', 10: '십각형', 12: '십이각형',
    };
    const newPolyName = ans <= 12 && POLY_NAMES[ans] ? POLY_NAMES[ans] : `${ans}각형`;

    const explanation: MathExpr = [
      txt(`정${POLY_NAMES[m] ?? `${m}각형`}의 철사 총 길이: ${m} × ${a} = ${totalLen} cm. `),
      txt(`한 변이 ${b} cm인 정다각형의 변의 수: ${totalLen} ÷ ${b} = ${ans}${ida('개')}. `),
      txt(`${ans}각형은 정${newPolyName}이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 변이 ${a} cm인 정${POLY_NAMES[m] ?? `${m}각형`}을 만든 철사를 펴서 한 변이 ${b} cm인 정다각형을 만들면 변은 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  내보내기
// ═══════════════════════════════════════════════════════════════

export const challengeG4S2Skills: SkillDef[] = [
  // unitFracAS4 — 분수의 덧셈과 뺄셈
  chTapefrac,
  chSumdifffrac,
  chBloodtype,
  // unitTriangle — 삼각형
  chIsoperim,
  chIsoangle,
  chTristrip,
  // unitDecAS — 소수의 덧셈과 뺄셈
  chDectape,
  chDecsumdiff,
  chDecbetween,
  // unitQuad — 사각형
  chParalleldist,
  chQuadangle,
  chParaperim,
  // unitLineGraph — 꺾은선그래프
  chLinescaletotal,
  chLinerescale,
  chLinemissing,
  // unitPolygon — 다각형
  chPolydiag,
  chPolyangle,
  chPolywire,
];
