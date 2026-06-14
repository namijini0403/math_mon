/**
 * 3-2 심화 문제 생성기 (challenge: true, difficulty: 3)
 * 명세: docs/challenge/g3s2.md
 */

import { RNG } from '../rng';
import { ida, josa } from '../josa';
import { gcd } from '../fraction';
import type { MathExpr, MathToken, Problem, SkillDef } from '../types';

// ── 공통 토큰 헬퍼 ──────────────────────────────────────────
const txt = (t: string): MathToken => ({ kind: 'text', text: t });
const blank = (slot: number): MathToken => ({ kind: 'blank', slot });

// ═══════════════════════════════════════════════════════════════
//  unitMul32 — 곱셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch32-machine  두 기계 생산량 차
 * ㉮ 기계 p개/h × h1시간, ㉯ 기계 q개/h × h2시간
 * 차 = |p·h1 − q·h2| (≥1), fill-blanks(개)
 */
const chMachine: SkillDef = {
  id: 'ch32-machine',
  unitId: 'unitMul32',
  title: '두 기계 생산량 차',
  note: '|p·h1 - q·h2| ≥1, fill-blanks 개',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let p = 8, q = 5, h1 = 3, h2 = 4, ans = 4;
    let aMore = true; // ㉮가 더 많은지 여부

    for (let tries = 0; tries < 2000; tries++) {
      const p2 = rng.int(3, 12);
      const q2 = rng.int(3, 12);
      const h1_2 = rng.int(2, 6);
      const h2_2 = rng.int(2, 6);
      const totalA = p2 * h1_2;
      const totalB = q2 * h2_2;
      const diff = Math.abs(totalA - totalB);
      if (diff < 1) continue;
      if (totalA === totalB) continue;
      p = p2; q = q2; h1 = h1_2; h2 = h2_2;
      ans = diff;
      aMore = totalA > totalB;
      break;
    }

    const totalA = p * h1;
    const totalB = q * h2;

    const explanation: MathExpr = [
      txt(`㉮ 기계: ${p} × ${h1} = ${totalA}${ida('개')}`),
      txt(`, ㉯ 기계: ${q} × ${h2} = ${totalB}${ida('개')}. `),
      txt(`${aMore ? '㉮' : '㉯'} 기계가 더 많이 만들었어요. `),
      txt(`차: ${Math.max(totalA, totalB)} − ${Math.min(totalA, totalB)} = ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `㉮ 기계는 1시간에 ${p}개, ㉯ 기계는 1시간에 ${q}개를 만듭니다. ㉮로 ${h1}시간, ㉯로 ${h2}시간 만들면 어느 기계가 몇 개 더 많이 만드나요?`,
      expr: [blank(0), txt(' 개 더 많이')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch32-pinsquare  정사각형 둘레 누름못
 * 한 변에 m개(꼭짓점 포함), 간격 g cm → 한 변 = (m-1)·g, 합 = 한변 × 4
 * fill-blanks cm
 */
const chPinSquare: SkillDef = {
  id: 'ch32-pinsquare',
  unitId: 'unitMul32',
  title: '정사각형 둘레 누름못 간격으로 둘레',
  note: '한변=(m-1)×g, 합=한변×4, fill-blanks cm, m=3~8 × g=2~10 ≤ 49종',
  difficulty: 3,
  challenge: true,
  minVariety: 49,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let m = 5, g = 4, side = 16, ans = 64;

    for (let tries = 0; tries < 2000; tries++) {
      const m2 = rng.int(3, 8); // 한 변에 3~8개
      const g2 = rng.int(2, 10); // 간격 2~10 cm
      const side2 = (m2 - 1) * g2;
      const ans2 = side2 * 4;
      if (ans2 < 8 || ans2 > 200) continue;
      m = m2; g = g2; side = side2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`한 변의 간격 수: ${m} − 1 = ${m - 1}군데. `),
      txt(`한 변의 길이: ${m - 1} × ${g} = ${side} cm. `),
      txt(`네 변의 길이의 합: ${side} × 4 = ${ans} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `정사각형 게시판 네 변에 일정한 간격으로 누름못을 꽂았더니 한 변에 ${m}개(꼭짓점 포함)가 되었습니다. 간격이 ${g} cm일 때 네 변 길이의 합은 몇 cm인가요?`,
      expr: [blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch32-mulbetween  곱 부등식 자연수 개수
 * a×b < k×□ < c×d 인 자연수 □의 개수
 * 개수 2~8 보장
 */
const chMulBetween: SkillDef = {
  id: 'ch32-mulbetween',
  unitId: 'unitMul32',
  title: '곱 부등식 사이의 자연수 개수',
  note: 'a×b < k×□ < c×d 범위의 □ 개수 2~8, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let lo = 12, hi = 30, k = 3, ans = 5;
    let loA = 3, loB = 4, hiC = 5, hiD = 6;

    for (let tries = 0; tries < 2000; tries++) {
      // k 고정
      const k2 = rng.int(2, 6);
      // 아래 범위: a×b
      const a2 = rng.int(2, 7);
      const b2 = rng.int(2, 7);
      const lo2 = a2 * b2;
      // 위 범위: c×d, lo+k*3 이상 ~ lo+k*9 이하
      const cnt = rng.int(2, 8);
      // k×□ 범위: lo < k×□ < hi
      // □ 범위: lo/k < □ < hi/k
      // □ 최솟값 = floor(lo/k)+1, □ 최댓값 = ceil(hi/k)-1
      // 개수 = □max - □min + 1 = cnt
      // □min = floor(lo2/k2) + 1
      const sqMin = Math.floor(lo2 / k2) + 1;
      const sqMax = sqMin + cnt - 1;
      // hi2 = sqMax*k2+1..k2 사이 (k×sqMax < hi2, hi2 > k×sqMax, hi2 <= k×(sqMax+1))
      // hi2 > k2*sqMax 이고 (sqMax+1)*k2 > hi2이면 OK
      // c2×d2 = hi2 → 간단히 hi2 = k2*(sqMax+1) - rng.int(0, k2-1) 하지만 인수분해가 어려움
      // 단순하게: hi2 직접 선택
      const hi2Min = k2 * sqMax + 1;
      const hi2Max = k2 * (sqMax + 1) - 1;
      if (hi2Min > hi2Max) continue;
      const hi2 = rng.int(hi2Min, hi2Max);
      // hi2를 c×d 형태로 분해 (1×hi2 제외, 양쪽 ≥2)
      const factors2: Array<[number, number]> = [];
      for (let cc = 2; cc <= 9; cc++) {
        if (hi2 % cc === 0) {
          const dd = hi2 / cc;
          if (dd >= 2 && dd <= 9) factors2.push([cc, dd]);
        }
      }
      if (!factors2.length) continue;
      const [c2, d2] = rng.pick(factors2);
      // lo2도 a×b로 맞추기
      // lo2는 a2*b2 이미 있음
      if (lo2 >= hi2) continue;
      // 최종 체크
      const realMin = Math.floor(lo2 / k2) + 1;
      const realMax = Math.ceil(hi2 / k2) - 1;
      if (hi2 % k2 === 0) {
        // hi2가 k2의 배수이면 sqMax = hi2/k2-1
        if (realMax !== sqMax) continue;
      }
      const realCnt = realMax - realMin + 1;
      if (realCnt !== cnt) continue;
      if (realCnt < 2 || realCnt > 8) continue;

      loA = a2; loB = b2; hiC = c2; hiD = d2;
      lo = lo2; hi = hi2; k = k2; ans = realCnt;
      break;
    }

    const explanation: MathExpr = [
      txt(`${loA}×${loB} = ${lo}, ${hiC}×${hiD} = ${hi}. `),
      txt(`${lo} < ${k}×□ < ${hi}에서 □의 범위를 구해요. `),
      txt(`${k}×□가 ${lo}보다 크려면 □는 ${Math.floor(lo / k) + 1} 이상이어야 해요. `),
      txt(`${k}×□가 ${hi}보다 작으려면 □는 ${Math.ceil(hi / k) - 1} 이하여야 해요. `),
      txt(`자연수 □는 ${Math.floor(lo / k) + 1}부터 ${Math.ceil(hi / k) - 1}까지 모두 ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${loA}×${loB}보다 크고 ${hiC}×${hiD}보다 작은 ${k}×□ 꼴의 자연수 □는 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitDiv32 — 나눗셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch32-divrem  나머지 조건 수의 개수
 * A보다 크고 B보다 작은 수 중 d로 나눈 나머지가 r인 수의 개수
 * 개수 2~8
 */
const chDivRem: SkillDef = {
  id: 'ch32-divrem',
  unitId: 'unitDiv32',
  title: '나머지 조건 수의 개수',
  note: 'A < x < B, x÷d 나머지 r, 개수 2~8, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let A = 10, B = 45, d = 7, r = 3, ans = 5;

    for (let tries = 0; tries < 2000; tries++) {
      const d2 = rng.int(3, 9);
      const r2 = rng.int(0, d2 - 1);
      // 시작점: A < x → 첫 x ≥ A+1
      const A2 = rng.int(10, 60);
      const cnt = rng.int(2, 8);
      // 첫 해: A2 < x, x ≡ r2 (mod d2)
      // 첫 해 = r2 + d2*ceil((A2+1-r2)/d2) 보정
      let first = r2;
      while (first <= A2) first += d2;
      // cnt개의 해
      const last = first + (cnt - 1) * d2;
      const B2 = last + rng.int(1, d2 - 1);
      if (B2 > 200) continue;
      // 실제 검증
      let realCnt = 0;
      for (let x = A2 + 1; x < B2; x++) {
        if (x % d2 === r2) realCnt++;
      }
      if (realCnt !== cnt) continue;

      A = A2; B = B2; d = d2; r = r2; ans = cnt;
      break;
    }

    const explanation: MathExpr = [
      txt(`${A}보다 크고 ${B}보다 작은 수 중 ${d}${josa(d, '으로/로')} 나눈 나머지가 ${r}인 수를 찾아요. `),
      txt(`해당하는 수: `),
    ];
    // 해당 수 나열 (최대 8개)
    const list: number[] = [];
    for (let x = A + 1; x < B; x++) {
      if (x % d === r) list.push(x);
    }
    explanation.push(txt(`${list.join(', ')}. `));
    explanation.push(txt(`모두 ${ans}${ida('개')}.`));

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${A}보다 크고 ${B}보다 작은 수 중 ${d}${josa(d, '으로/로')} 나눈 나머지가 ${r}인 수는 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch32-boxneed  상자 필요 개수 (올림)
 * p개씩 q줄 + r개 = T개, s개씩 담으면 상자 = ceil(T/s)
 * fill-blanks
 */
const chBoxNeed: SkillDef = {
  id: 'ch32-boxneed',
  unitId: 'unitDiv32',
  title: '상자 필요 개수 (올림)',
  note: 'T=p×q+r, ceil(T/s), fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let p = 6, q = 5, r = 4, s = 8, T = 34, ans = 5;

    for (let tries = 0; tries < 2000; tries++) {
      const p2 = rng.int(3, 9);
      const q2 = rng.int(3, 8);
      const r2 = rng.int(1, p2 - 1); // r < p이어야 자연스러움
      const T2 = p2 * q2 + r2;
      const s2 = rng.int(3, 10);
      const quotient = Math.floor(T2 / s2);
      const remain = T2 % s2;
      if (remain === 0) continue; // 나머지 없으면 올림 안 해도 됨 (문제가 단순해짐)
      const ans2 = quotient + 1;
      if (ans2 < 2 || ans2 > 20) continue;

      p = p2; q = q2; r = r2; s = s2; T = T2; ans = ans2;
      break;
    }

    const quotient = Math.floor(T / s);
    const remain = T % s;

    const explanation: MathExpr = [
      txt(`전체 개수: ${p} × ${q} + ${r} = ${T}${ida('개')}. `),
      txt(`${T} ÷ ${s} = ${quotient}···${remain}. `),
      txt(`나머지 ${remain}개가 더 있으므로 상자가 1개 더 필요해요. `),
      txt(`상자: ${quotient} + 1 = ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 줄에 ${p}개씩 ${q}줄 있는 물건에 ${r}개를 더해 총 ${T}개가 되었습니다. ${s}개씩 담는 상자에 모두 담으려면 상자는 적어도 몇 개 필요한가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch32-squaremarker  정사각형 둘레 표지판
 * 한 변 L m, g m 간격, 꼭짓점 포함 → 전체 = (L/g) × 4
 * L은 g의 배수, fill-blanks
 */
const chSquareMarker: SkillDef = {
  id: 'ch32-squaremarker',
  unitId: 'unitDiv32',
  title: '정사각형 둘레 표지판 개수',
  note: '전체=(L/g)×4, L은 g의 배수, g=2~6 × k=3~8 ≤ 28종, fill-blanks',
  difficulty: 3,
  challenge: true,
  minVariety: 28,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let L = 20, g = 4, ans = 20;

    for (let tries = 0; tries < 2000; tries++) {
      const g2 = rng.int(2, 6);
      const k = rng.int(3, 8); // 한 변 k칸
      const L2 = g2 * k;
      if (L2 > 40) continue;
      const ans2 = k * 4; // 꼭짓점 포함이지만 네 꼭짓점은 중복 → (L/g)×4
      if (ans2 < 8) continue;
      L = L2; g = g2; ans = ans2;
      break;
    }

    const perSide = L / g;

    const explanation: MathExpr = [
      txt(`한 변에 간격 수: ${L} ÷ ${g} = ${perSide}군데. `),
      txt(`꼭짓점은 네 변이 공유하므로 전체 표지판 = ${perSide} × 4 = ${ans}${ida('개')}. `),
      txt(`(각 꼭짓점을 한 번씩만 셈)`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 변이 ${L} m인 정사각형 모양 둘레에 ${g} m 간격으로 표지판을 세웠습니다(네 꼭짓점 포함). 표지판은 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitCircle3 — 원
// ═══════════════════════════════════════════════════════════════

/**
 * ch32-nested  동심원 반지름 차
 * 큰 원 안 k개 동심원, 이웃 차 c cm, 가장 큰 반지름 R → 가장 작은 = R - (k-1)·c
 * fill-blanks cm
 */
const chNested: SkillDef = {
  id: 'ch32-nested',
  unitId: 'unitCircle3',
  title: '동심원 가장 작은 반지름',
  note: 'R-(k-1)·c > 0, fill-blanks cm',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let R = 15, k = 4, c = 2, ans = 9;

    for (let tries = 0; tries < 2000; tries++) {
      const k2 = rng.int(2, 5); // 안쪽 원 개수 (작아지는 원 k2개)
      const c2 = rng.int(1, 5); // 이웃 차
      const ans2min = 1;
      // 가장 큰 원 반지름 R2 = ans + (k2-1)·c2 (ans ≥ 1)
      const ansVal = rng.int(2, 8);
      const R2 = ansVal + (k2 - 1) * c2;
      if (R2 > 30 || R2 < 5) continue;
      if (ansVal < ans2min) continue;

      R = R2; k = k2; c = c2; ans = ansVal;
      break;
    }

    const explanation: MathExpr = [
      txt(`가장 큰 원 반지름 ${R} cm에서 이웃한 두 원의 반지름 차 ${c} cm씩 줄어들어요. `),
      txt(`${k}개 동심원이 있으므로 이웃한 쌍은 ${k - 1}쌍. `),
      txt(`가장 작은 반지름: ${R} − ${k - 1} × ${c} = ${R} − ${(k - 1) * c} = ${ans} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `큰 원 안에 점점 작아지는 원이 동심원으로 ${k}개 있고, 이웃한 두 원의 반지름 차가 ${c} cm로 일정합니다. 가장 큰 원의 반지름이 ${R} cm일 때 가장 작은 원의 반지름은 몇 cm인가요?`,
      expr: [blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch32-rectcircles  직사각형 안 원 개수
 * 가로 w, 세로 h 직사각형, 지름 = h인 원을 겹치지 않게 한 줄 → floor(w/h) ≥ 2
 * fill-blanks
 */
const chRectCircles: SkillDef = {
  id: 'ch32-rectcircles',
  unitId: 'unitCircle3',
  title: '직사각형 안 원 최대 개수',
  note: 'floor(w/h) ≥ 2, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let w = 24, h = 6, ans = 4;

    for (let tries = 0; tries < 2000; tries++) {
      const h2 = rng.int(3, 8); // 세로=지름
      const ans2 = rng.int(2, 6); // 원 개수
      const w2base = h2 * ans2;
      // w는 w2base ~ w2base + h2-1 사이 (딱 맞거나 조금 더)
      const w2 = w2base + rng.int(0, h2 - 1);
      if (w2 > 50) continue;
      if (Math.floor(w2 / h2) !== ans2) continue;
      w = w2; h = h2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`원의 지름이 세로(${h} cm)와 같으므로 원 하나의 가로 폭은 ${h} cm. `),
      txt(`가로 ${w} cm ÷ ${h} cm = ${Math.floor(w / h)} (나머지 ${w % h}). `),
      txt(`최대 ${ans}${ida('개')} 그릴 수 있어요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로가 ${w} cm, 세로가 ${h} cm인 직사각형 안에 지름이 세로와 같은 원을 겹치지 않게 한 줄로 그릴 때 최대 몇 개까지 그릴 수 있나요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch32-threecenters  세 원 중심 삼각형 둘레 → 반지름 합
 * 서로 맞닿은 세 원 중심 삼각형 둘레 P cm (짝수) → 반지름 합 = P/2
 * fill-blanks cm
 */
const chThreeCenters: SkillDef = {
  id: 'ch32-threecenters',
  unitId: 'unitCircle3',
  title: '세 원 중심 삼각형 둘레로 반지름 합',
  note: '둘레=2×반지름합, P짝수, r=2~8 합6~24 → P=12~48(짝수) 18종, fill-blanks cm',
  difficulty: 3,
  challenge: true,
  minVariety: 18,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let P = 24, ans = 12;

    for (let tries = 0; tries < 2000; tries++) {
      // 세 반지름 r1, r2, r3 (각 1~10)
      const r1 = rng.int(2, 8);
      const r2 = rng.int(2, 8);
      const r3 = rng.int(2, 8);
      const sumR = r1 + r2 + r3;
      const P2 = sumR * 2; // 둘레 = (r1+r2)+(r2+r3)+(r3+r1) = 2(r1+r2+r3)
      if (P2 > 60) continue;
      P = P2;
      ans = sumR;
      break;
    }

    const explanation: MathExpr = [
      txt(`서로 맞닿은 두 원의 중심 사이 거리 = 두 반지름의 합이에요. `),
      txt(`삼각형 세 변의 합 = (r₁+r₂) + (r₂+r₃) + (r₃+r₁) = 2×(r₁+r₂+r₃). `),
      txt(`${P} = 2×(세 반지름의 합)이므로 세 반지름의 합 = ${P} ÷ 2 = ${ans} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `서로 맞닿아 있는 세 원의 중심을 이어 삼각형을 만들었더니 세 변의 길이의 합이 ${P} cm였습니다. 세 원의 반지름의 합은 몇 cm인가요?`,
      expr: [blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitFrac32 — 분수
// ═══════════════════════════════════════════════════════════════

/**
 * ch32-fracof  분수의 일부 빼고 남기
 * N개의 1/f1를 언니에게, 나머지의 1/f2를 동생에게
 * 남은 = N × (1 - 1/f1) × (1 - 1/f2) 정수
 * fill-blanks 개
 */
const chFracOf: SkillDef = {
  id: 'ch32-fracof',
  unitId: 'unitFrac32',
  title: '분수의 일부를 빼고 남은 개수',
  note: 'N×(1-1/f1)×(1-1/f2) 정수, N은 f1×f2의 배수, fill-blanks 개',
  difficulty: 3,
  challenge: true,
  minVariety: 30,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let N = 12, f1 = 2, f2 = 3, ans = 4;

    for (let tries = 0; tries < 2000; tries++) {
      const f1_2 = rng.int(2, 4);
      const f2_2 = rng.int(2, 4);
      // N은 f1×f2의 배수
      const mult = rng.int(1, 5);
      const N2 = f1_2 * f2_2 * mult;
      if (N2 > 60 || N2 < 8) continue;
      // 남은 = N × (f1-1)/f1 × (f2-1)/f2
      const afterFirst = N2 * (f1_2 - 1); // N × (f1-1)
      if (afterFirst % f1_2 !== 0) continue;
      const remainFirst = afterFirst / f1_2;
      const afterSecond = remainFirst * (f2_2 - 1);
      if (afterSecond % f2_2 !== 0) continue;
      const ans2 = afterSecond / f2_2;
      if (ans2 < 1) continue;

      N = N2; f1 = f1_2; f2 = f2_2; ans = ans2;
      break;
    }

    const givenToSister = N / f1;
    const remainAfterSister = N - givenToSister;
    const givenToBrother = remainAfterSister / f2;

    const explanation: MathExpr = [
      txt(`언니에게: ${N} ÷ ${f1} = ${givenToSister}${ida('개')} 줬어요. `),
      txt(`남은 것: ${N} − ${givenToSister} = ${remainAfterSister}${ida('개')}. `),
      txt(`동생에게: ${remainAfterSister} ÷ ${f2} = ${givenToBrother}${ida('개')} 줬어요. `),
      txt(`최종 남은 것: ${remainAfterSister} − ${givenToBrother} = ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `사탕 ${N}개의 1/${f1}을 언니에게 주고, 나머지의 1/${f2}를 동생에게 주었습니다. 남은 사탕은 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch32-fracbetween  분수 부등식 자연수 개수
 * 대분수 A < □/d < 대분수 B → □의 개수 2~8
 * fill-blanks
 */
const chFracBetween: SkillDef = {
  id: 'ch32-fracbetween',
  unitId: 'unitFrac32',
  title: '분수 부등식 사이의 자연수 개수',
  note: '대분수 A < □/d < B, □의 자연수 개수 2~8, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let d = 5, loWhole = 1, loN = 2, hiWhole = 3, hiN = 1, ans = 9;
    // A = 1과 2/5 = 7/5, B = 3과 1/5 = 16/5 → □ = 8~15 → 8개
    ans = 8;

    for (let tries = 0; tries < 2000; tries++) {
      const d2 = rng.int(3, 8);
      // A: 대분수 (whole1, n1/d2)
      const w1 = rng.int(1, 4);
      const n1 = rng.int(1, d2 - 1);
      const Anum = w1 * d2 + n1; // 분자 (가분수)
      // B: 대분수 (whole2, n2/d2) > A
      const cnt = rng.int(2, 8);
      // □는 Anum+1 ~ Anum+cnt
      const Bnum = Anum + cnt + 1; // B분자 > Anum+cnt
      if (Bnum > 60) continue;
      // Bnum을 대분수로
      const w2 = Math.floor(Bnum / d2);
      const n2 = Bnum % d2;
      if (n2 === 0) continue; // 자연수는 대분수가 아님
      if (w2 < w1 + 1) continue; // B > A 보장 (whole 기준)
      // 실제 □ 개수 검증
      let realCnt = 0;
      for (let sq = 1; sq < 200; sq++) {
        if (sq > Anum && sq < Bnum) realCnt++;
      }
      if (realCnt !== cnt) continue;

      d = d2;
      loWhole = w1; loN = n1;
      hiWhole = w2; hiN = n2;
      ans = cnt;
      break;
    }

    const Anum = loWhole * d + loN;
    const Bnum = hiWhole * d + hiN;

    const explanation: MathExpr = [
      txt(`${loWhole}${josa(loWhole, '과/와')} ${loN}/${d}를 가분수로 바꾸면 ${Anum}/${d}. `),
      txt(`${hiWhole}${josa(hiWhole, '과/와')} ${hiN}/${d}를 가분수로 바꾸면 ${Bnum}/${d}. `),
      txt(`${Anum}/${d} < □/${d} < ${Bnum}/${d}에서 분모가 같으므로 분자 비교: `),
      txt(`${Anum} < □ < ${Bnum}. `),
      txt(`해당하는 자연수: ${Anum + 1}부터 ${Bnum - 1}까지 → 모두 ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${loWhole}${josa(loWhole, '과/와')} ${loN}/${d}보다 크고 ${hiWhole}${josa(hiWhole, '과/와')} ${hiN}/${d}보다 작은 □/${d}를 만족하는 자연수 □는 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch32-sumdifffrac  분모·분자 합과 차로 대분수
 * 합 S, 차 D → 분자=(S+D)/2, 분모=(S-D)/2 → 가분수 → 대분수
 * fraction-input(mixed=true, requireIrreducible)
 * minVariety 명시 (조합 수 제한)
 */
const chSumDiffFrac: SkillDef = {
  id: 'ch32-sumdifffrac',
  unitId: 'unitFrac32',
  title: '분모·분자 합과 차로 대분수 나타내기',
  note: '분자=(S+D)/2>분모=(S-D)/2, 기약 대분수, fraction-input mixed=true',
  difficulty: 3,
  challenge: true,
  minVariety: 25,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: S=13, D=5 → 분자=9, 분모=4 → 2와 1/4
    let S = 13, D = 5, numN = 9, numD = 4, whole = 2, fracN = 1, fracD = 4;

    for (let tries = 0; tries < 2000; tries++) {
      // 분자 n, 분모 d (n > d ≥ 2, 가분수)
      const d2 = rng.int(2, 9);
      // n > d, n ≤ 60/d 이하
      const whole2 = rng.int(1, 6);
      const fn2 = rng.int(1, d2 - 1); // 분수부 분자
      const n2 = whole2 * d2 + fn2; // 가분수 분자
      if (n2 > 60) continue;
      if (n2 <= d2) continue; // 가분수 조건
      // 기약 확인
      const g = gcd(n2, d2);
      const rn = n2 / g;
      const rd = d2 / g;
      if (rd > 60) continue;
      // S = n+d, D = n-d (둘 다 짝수이거나 둘 다 홀수 - 합·차 모두 짝수 또는 홀수)
      const S2 = n2 + d2;
      const D2 = n2 - d2;
      if (S2 % 2 !== D2 % 2) continue; // 홀짝 불일치
      if (D2 < 1) continue; // 차가 양수

      // 대분수로
      const w2 = Math.floor(rn / rd);
      if (w2 < 1) continue; // whole ≥ 1
      const fn_out = rn - w2 * rd;
      if (fn_out < 1) continue; // 분수부 ≥ 1 (정수가 되면 안됨)

      S = S2; D = D2; numN = n2; numD = d2;
      whole = w2; fracN = fn_out; fracD = rd;
      break;
    }

    const explanation: MathExpr = [
      txt(`분자+분모 = ${S}, 분자−분모 = ${D}. `),
      txt(`분자 = (${S}+${D})÷2 = ${(S + D) / 2}, 분모 = (${S}−${D})÷2 = ${(S - D) / 2}. `),
      txt(`가분수: ${numN}/${numD}. `),
    ];
    if (gcd(numN, numD) > 1) {
      explanation.push(txt(`기약분수로: ${numN / gcd(numN, numD)}/${numD / gcd(numN, numD)}. `));
    }
    explanation.push(txt(`대분수: ${whole}${josa(whole, '과/와')} ${fracN}/${fracD}.`));

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `분모와 분자의 합이 ${S}이고, 차가 ${D}인 가분수(분자>분모)를 대분수로 나타내세요. (기약분수로)`,
      mixed: true,
      requireIrreducible: true,
      answer: { whole, n: fracN, d: fracD },
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitMeasure3 — 들이와 무게
// ═══════════════════════════════════════════════════════════════

/**
 * ch32-mldiff  나눠 주고 남은 들이 (L mL)
 * 우유 X L Y mL에서 a mL씩 n명 → 남은 [L, mL] 각 ≥1
 * fill-blanks
 */
const chMlDiff: SkillDef = {
  id: 'ch32-mldiff',
  unitId: 'unitMeasure3',
  title: '나눠 주고 남은 들이 (L mL)',
  note: '총mL - a×n, [L,mL] 각 ≥1, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let XL = 3, XmL = 400, a = 200, n = 5, ansL = 1, ansMl = 400;

    for (let tries = 0; tries < 2000; tries++) {
      const XL2 = rng.int(2, 5);
      const XmL2 = rng.int(100, 900); // 100 단위
      const totalMl = XL2 * 1000 + XmL2;
      const n2 = rng.int(2, 6);
      const a2 = rng.int(50, 400); // a mL씩 (50 단위)
      const used = a2 * n2;
      const remainMl = totalMl - used;
      if (remainMl <= 0) continue;
      const rL = Math.floor(remainMl / 1000);
      const rMl = remainMl % 1000;
      if (rL < 1 || rMl < 1) continue; // 각 ≥ 1
      XL = XL2; XmL = XmL2; a = a2; n = n2;
      ansL = rL; ansMl = rMl;
      break;
    }

    const totalMl = XL * 1000 + XmL;
    const used = a * n;

    const explanation: MathExpr = [
      txt(`전체: ${XL} L ${XmL} mL = ${totalMl} mL. `),
      txt(`나눠 준 양: ${a} × ${n} = ${used} mL. `),
      txt(`남은 양: ${totalMl} − ${used} = ${totalMl - used} mL = ${ansL} L ${ansMl} mL.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `우유 ${XL} L ${XmL} mL에서 ${a} mL씩 ${n}명에게 나누어 주면 남은 양은 몇 L 몇 mL인가요?`,
      expr: [blank(0), txt(' L '), blank(1), txt(' mL')],
      blankAnswers: [ansL, ansMl],
      explanation,
    };
  },
};

/**
 * ch32-recipe  레시피 인분 늘리기 (kg g)
 * x인분에 A g, B g, C g → y인분 합 (kg g), kg≥1 g≥1
 * fill-blanks
 */
const chRecipe: SkillDef = {
  id: 'ch32-recipe',
  unitId: 'unitMeasure3',
  title: '레시피 인분 늘리기 (kg g)',
  note: '합×y/x, [kg,g] 각 ≥1, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: 2인분 A=300g B=200g C=150g → 합=650g, 4인분=1300g=1kg 300g
    let x = 2, y = 4, A = 300, B = 200, C = 150, ansKg = 1, ansG = 300;

    for (let tries = 0; tries < 2000; tries++) {
      const x2 = rng.int(2, 4);
      const mult = rng.int(2, 4);
      const y2 = x2 * mult;
      if (y2 > 12) continue;
      // x인분의 각 재료 g (x2의 배수)
      const A2 = rng.int(1, 8) * x2 * 10; // 10g 단위, x2의 배수
      const B2 = rng.int(1, 8) * x2 * 10;
      const C2 = rng.int(1, 8) * x2 * 10;
      const sumX = A2 + B2 + C2;
      const sumY = sumX * mult; // y인분 합
      const kg = Math.floor(sumY / 1000);
      const g = sumY % 1000;
      if (kg < 1 || g < 1) continue;
      if (sumY > 5000) continue;
      x = x2; y = y2; A = A2; B = B2; C = C2;
      ansKg = kg; ansG = g;
      break;
    }

    const sumX = A + B + C;
    const mult = y / x;
    const sumY = sumX * mult;

    const explanation: MathExpr = [
      txt(`${x}인분 재료 합: ${A} + ${B} + ${C} = ${sumX} g. `),
      txt(`${y}인분 = ${x}인분 × ${mult}이므로 합: ${sumX} × ${mult} = ${sumY} g. `),
      txt(`${sumY} g = ${ansKg} kg ${ansG} g.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `요리 ${x}인분에 재료 ${A} g, ${B} g, ${C} g이 필요합니다. ${y}인분에 필요한 재료의 무게 합은 몇 kg 몇 g인가요?`,
      expr: [blank(0), txt(' kg '), blank(1), txt(' g')],
      blankAnswers: [ansKg, ansG],
      explanation,
    };
  },
};

/**
 * ch32-tank  들이 구하기 (유입·유출)
 * 1분에 inL씩 들어오고 outL씩 빠짐, T분 후 VL 넘침
 * 통의 들이 = (in-out)×T − V (>0)
 * fill-blanks L
 */
const chTank: SkillDef = {
  id: 'ch32-tank',
  unitId: 'unitMeasure3',
  title: '들이 구하기 (유입·유출)',
  note: '(in-out)×T-V > 0, fill-blanks L',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let inL = 5, outL = 2, T = 10, V = 5, ans = 25;

    for (let tries = 0; tries < 2000; tries++) {
      const outL2 = rng.int(1, 4);
      const net2 = rng.int(1, 4); // 순유입 = in - out
      const inL2 = outL2 + net2;
      if (inL2 > 10) continue;
      const T2 = rng.int(5, 15);
      const V2 = rng.int(1, net2 * T2 - 1); // 통 들이 = net×T - V ≥ 1
      const ans2 = net2 * T2 - V2;
      if (ans2 < 1 || ans2 > 80) continue;

      inL = inL2; outL = outL2; T = T2; V = V2; ans = ans2;
      break;
    }

    const net = inL - outL;

    const explanation: MathExpr = [
      txt(`1분에 순유입: ${inL} − ${outL} = ${net} L. `),
      txt(`${T}분 동안 들어온 양: ${net} × ${T} = ${net * T} L. `),
      txt(`이 중 ${V} L가 넘쳤으므로 통의 들이 = ${net * T} − ${V} = ${ans} L.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `빈 통에 1분에 ${inL} L씩 물이 들어오고, 동시에 1분에 ${outL} L씩 빠집니다. ${T}분 동안 물이 ${V} L 넘쳤다면 통의 들이는 몇 L인가요?`,
      expr: [blank(0), txt(' L')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitData3 — 자료의 정리
// ═══════════════════════════════════════════════════════════════

/**
 * ch32-pictomissing  합계로 빠진 항목 수
 * 4개 항목 합계 T, 3개 공개 → 나머지 = T − 합 (≥1)
 * fill-blanks
 */
const chPictoMissing: SkillDef = {
  id: 'ch32-pictomissing',
  unitId: 'unitData3',
  title: '합계로 빠진 항목 수 구하기',
  note: '4개 항목 합계, 1개 빈칸, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const topicSets = [
      { cat: '마을', items: ['가 마을', '나 마을', '다 마을', '라 마을'], unit: '가구' },
      { cat: '종류', items: ['사과', '배', '귤', '포도'], unit: '개' },
      { cat: '반', items: ['1반', '2반', '3반', '4반'], unit: '명' },
      { cat: '색', items: ['빨간색', '파란색', '초록색', '노란색'], unit: '개' },
    ];

    // 폴백
    let vals = [12, 15, 8, 5], T = 40, hidden = 2, ans = 5;
    let topic = topicSets[0];

    for (let tries = 0; tries < 2000; tries++) {
      const top = rng.pick(topicSets);
      const v1 = rng.int(3, 20);
      const v2 = rng.int(3, 20);
      const v3 = rng.int(3, 20);
      const v4 = rng.int(3, 20);
      const T2 = v1 + v2 + v3 + v4;
      const hidden2 = rng.int(0, 3); // 숨길 인덱스
      const ans2 = [v1, v2, v3, v4][hidden2];
      if (ans2 < 1) continue;
      if (T2 > 80) continue;

      vals = [v1, v2, v3, v4];
      T = T2; hidden = hidden2; ans = ans2;
      topic = top;
      break;
    }

    const visibleItems = topic.items.map((item, i) =>
      i === hidden ? `${item}: ?` : `${item}: ${vals[i]}${topic.unit}`
    );

    const explanation: MathExpr = [
      txt(`합계: ${T}${topic.unit}. `),
      txt(`나머지 합: ${vals.filter((_, i) => i !== hidden).join(' + ')} = ${T - ans}${topic.unit}. `),
      txt(`빠진 항목: ${T} − ${T - ans} = ${ans}${ida(topic.unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 표에서 합계가 ${T}${topic.unit}일 때 빠진 수는 얼마인가요?\n${visibleItems.join(', ')}`,
      expr: [blank(0), txt(` ${topic.unit}`)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch32-pictomaxmin  최다 + 두 번째로 적은
 * 5개 항목 서로 다른 수 → 가장 많은 + 두 번째로 적은 합 (또는 차)
 * fill-blanks
 */
const chPictoMaxMin: SkillDef = {
  id: 'ch32-pictomaxmin',
  unitId: 'unitData3',
  title: '최다와 두 번째로 적은 합(또는 차)',
  note: '5개 서로 다른 수, 최다±두번째최소, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const topicSets = [
      { items: ['봄', '여름', '가을', '겨울', '연중'], unit: '명', thing: '좋아하는 계절별 학생 수' },
      { items: ['축구', '농구', '야구', '배구', '탁구'], unit: '명', thing: '좋아하는 운동별 학생 수' },
      { items: ['강아지', '고양이', '토끼', '물고기', '새'], unit: '마리', thing: '동물별 수' },
    ];

    // 폴백
    let vals = [25, 12, 18, 8, 15], ans = 25 + 12, isSum = true;
    let topic = topicSets[0];

    for (let tries = 0; tries < 2000; tries++) {
      const top = rng.pick(topicSets);
      // 5개 서로 다른 수
      const pool: number[] = [];
      let ok = true;
      for (let i = 0; i < 5; i++) {
        let v = rng.int(5, 30);
        let attempt = 0;
        while (pool.includes(v) && attempt < 20) { v = rng.int(5, 30); attempt++; }
        if (pool.includes(v)) { ok = false; break; }
        pool.push(v);
      }
      if (!ok) continue;

      const sorted = [...pool].sort((a, b) => a - b);
      const maxVal = sorted[4];
      const secondMin = sorted[1];
      const isSum2 = rng.chance(0.6);
      const ans2 = isSum2 ? maxVal + secondMin : maxVal - secondMin;
      if (ans2 < 1) continue;

      vals = pool; ans = ans2; isSum = isSum2; topic = top;
      break;
    }

    const sorted = [...vals].sort((a, b) => a - b);
    const maxVal = sorted[4];
    const secondMin = sorted[1];
    const maxIdx = vals.indexOf(maxVal);
    const secMinIdx = vals.indexOf(secondMin);

    const tableStr = topic.items.map((item, i) => `${item}: ${vals[i]}${topic.unit}`).join(', ');

    const explanation: MathExpr = [
      txt(`가장 많은 것: ${topic.items[maxIdx]}(${maxVal}${topic.unit}). `),
      txt(`두 번째로 적은 것: ${topic.items[secMinIdx]}(${secondMin}${topic.unit}). `),
      txt(`${isSum ? '합' : '차'}: ${maxVal} ${isSum ? '+' : '−'} ${secondMin} = ${ans}${ida(topic.unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음은 ${topic.thing}입니다.\n${tableStr}\n가장 많은 것과 두 번째로 적은 것의 ${isSum ? '합' : '차'}는?`,
      expr: [blank(0), txt(` ${topic.unit}`)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch32-pictototal  합계 후 1인당 배수
 * 3~4반 학생 수 합계 → 한 명에게 k자루씩 → 모두 합계×k
 * fill-blanks
 */
const chPictoTotal: SkillDef = {
  id: 'ch32-pictototal',
  unitId: 'unitData3',
  title: '합계 후 1인당 배수',
  note: '3~4개 반 합계×k, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let counts = [28, 30, 25], k = 4, total = 83, ans = 332;

    for (let tries = 0; tries < 2000; tries++) {
      const numClasses = rng.int(3, 4);
      const cs: number[] = [];
      for (let i = 0; i < numClasses; i++) {
        cs.push(rng.int(20, 35));
      }
      const total2 = cs.reduce((a, b) => a + b, 0);
      const k2 = rng.int(2, 6);
      const ans2 = total2 * k2;
      if (ans2 > 800) continue;

      counts = cs; k = k2; total = total2; ans = ans2;
      break;
    }

    const classNames = ['1반', '2반', '3반', '4반'];
    const tableStr = counts.map((c, i) => `${classNames[i]}: ${c}명`).join(', ');

    const explanation: MathExpr = [
      txt(`전체 학생: ${counts.join(' + ')} = ${total}${ida('명')}. `),
      txt(`연필: ${total} × ${k} = ${ans}${ida('자루')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음은 각 반 학생 수입니다.\n${tableStr}\n한 명에게 연필을 ${k}자루씩 주면 모두 몇 자루가 필요한가요?`,
      expr: [blank(0), txt(' 자루')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  내보내기
// ═══════════════════════════════════════════════════════════════

export const challengeG3S2Skills: SkillDef[] = [
  // unitMul32 — 곱셈
  chMachine,
  chPinSquare,
  chMulBetween,
  // unitDiv32 — 나눗셈
  chDivRem,
  chBoxNeed,
  chSquareMarker,
  // unitCircle3 — 원
  chNested,
  chRectCircles,
  chThreeCenters,
  // unitFrac32 — 분수
  chFracOf,
  chFracBetween,
  chSumDiffFrac,
  // unitMeasure3 — 들이와 무게
  chMlDiff,
  chRecipe,
  chTank,
  // unitData3 — 자료의 정리
  chPictoMissing,
  chPictoMaxMin,
  chPictoTotal,
];
