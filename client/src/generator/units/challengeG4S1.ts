/**
 * 4-1 심화 문제 생성기 (challenge: true, difficulty: 3)
 * 명세: docs/challenge/g4s1.md
 */

import { RNG } from '../rng';
import { ida, josa } from '../josa';
import type { MathExpr, MathToken, Problem, SkillDef } from '../types';

// ── 공통 토큰 헬퍼 ──────────────────────────────────────────
const txt = (t: string): MathToken => ({ kind: 'text', text: t });
const blank = (slot: number): MathToken => ({ kind: 'blank', slot });

// ── 180° 돌리기 헬퍼 ────────────────────────────────────────
// 회전 가능 숫자: 0→0, 1→1, 2→2, 5→5, 6→9, 8→8, 9→6
// 3, 4, 7 사용 금지
const ROT_MAP: Record<number, number> = { 0: 0, 1: 1, 2: 2, 5: 5, 6: 9, 8: 8, 9: 6 };
const ROT_DIGITS = [0, 1, 2, 5, 6, 8, 9];
// 비영(0이 아닌) 회전 가능 숫자 (선두·끝 자리에 쓸 수 있는)
const ROT_NONZERO = [1, 2, 5, 6, 8, 9];

/**
 * 세 자리 수 N (회전 가능 숫자만, 일의자리≠0) 을 180° 돌린 수 반환.
 * 180° 돌리기: 숫자 배열 뒤집고 각 숫자를 rot 변환.
 */
function rot3(n: number): number {
  const d0 = Math.floor(n / 100);       // 백의 자리
  const d1 = Math.floor(n / 10) % 10;  // 십의 자리
  const d2 = n % 10;                    // 일의 자리
  // 배열 뒤집기: [d0,d1,d2] → [d2,d1,d0], 각 rot
  const r0 = ROT_MAP[d2]; // 새 백의 자리
  const r1 = ROT_MAP[d1]; // 새 십의 자리
  const r2 = ROT_MAP[d0]; // 새 일의 자리
  return r0 * 100 + r1 * 10 + r2;
}

/** N이 회전 가능 세 자리 수인지 검사 (일의자리≠0, 돌린 결과도 세 자리 = 돌린 백의자리≠0) */
function isValidRot3(n: number): boolean {
  if (n < 100 || n > 999) return false;
  const d0 = Math.floor(n / 100);
  const d1 = Math.floor(n / 10) % 10;
  const d2 = n % 10;
  // 모든 숫자가 회전 가능해야 함
  if (!(d0 in ROT_MAP) || !(d1 in ROT_MAP) || !(d2 in ROT_MAP)) return false;
  // 일의자리 ≠ 0 (돌리면 백의자리가 되므로)
  if (d2 === 0) return false;
  // 돌린 결과 백의자리(= rot(d2)) ≠ 0
  if (ROT_MAP[d2] === 0) return false;
  return true;
}

// ═══════════════════════════════════════════════════════════════
//  unitBigNum — 큰 수
// ═══════════════════════════════════════════════════════════════

/**
 * ch41-placevalue  자리값 배수
 * 8~11자리 수에서 두 자리 선택, ㉠/㉡의 나타내는 값 비율
 * fill-blanks 배
 */
const chPlacevalue: SkillDef = {
  id: 'ch41-placevalue',
  unitId: 'unitBigNum',
  title: '자리값 배수',
  note: 'd㉡≠0, d㉠가 d㉡의 배수, 8~11자리 수, fill-blanks 배',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 자리 이름 (높은 자리 = 인덱스 0)
    // 최대 11자리: 천억(10^11)~십억(10^10)~억(10^8)~천만(10^7)~백만(10^6)~십만(10^5)~만(10^4)~천(10^3)~백(10^2)~십(10^1)~일(10^0)
    const PLACE_NAMES = [
      '천억', '백억', '십억', '억',
      '천만', '백만', '십만', '만',
      '천', '백', '십', '일',
    ];
    // 10의 지수 (인덱스 0 = 자리 11 = 천억 = 10^11)
    const PLACE_EXP = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

    // 8~11자리 수: 자리수 count = 8~11 → 최소 자리 = 인덱스 (12-count) ~ 11
    // 폴백
    let hiIdx = 0, loIdx = 4, dHi = 6, dLo = 2;
    let ansVal = 30000;

    for (let tries = 0; tries < 2000; tries++) {
      // 자리수 8~11
      const digits = rng.int(8, 11);
      // 최고 자리 인덱스 (0=천억...)
      // digits 자리 수 → 최고 자리 exp = digits-1
      // PLACE_EXP[idx] = digits-1 → idx = 12 - digits
      const maxIdx = 12 - digits; // 최고 자리 인덱스
      const minIdx = 11;          // 일의 자리

      // 두 인덱스 선택 (높은 자리 = 더 작은 인덱스)
      const idx1 = rng.int(maxIdx, minIdx - 2); // ㉠ (높은 자리)
      const idx2 = rng.int(idx1 + 1, minIdx);   // ㉡ (낮은 자리)

      const d1 = rng.int(1, 9); // ㉠ 숫자
      const d2 = rng.int(1, 9); // ㉡ 숫자 ≠ 0

      // ㉠이 ㉡의 배수가 되어야 함
      if (d1 % d2 !== 0) continue;
      const digitRatio = d1 / d2;

      // 자리 차이
      const expDiff = PLACE_EXP[idx1] - PLACE_EXP[idx2];
      // 10^expDiff
      const placeFactor = Math.pow(10, expDiff);
      const totalRatio = digitRatio * placeFactor;

      // 답이 너무 크면 스킵
      if (totalRatio > 100000000) continue;
      if (!Number.isInteger(totalRatio)) continue;

      hiIdx = idx1; loIdx = idx2;
      dHi = d1; dLo = d2;
      ansVal = totalRatio;
      break;
    }

    const hiName = PLACE_NAMES[hiIdx];
    const loName = PLACE_NAMES[loIdx];
    const hiExp = PLACE_EXP[hiIdx];
    const loExp = PLACE_EXP[loIdx];
    const expDiff = hiExp - loExp;
    const placeFactor = Math.pow(10, expDiff);
    const digitRatio = dHi / dLo;

    const hiPlaceVal = dHi * Math.pow(10, hiExp);
    const loPlaceVal = dLo * Math.pow(10, loExp);

    const explanation: MathExpr = [
      txt(`${hiName} 자리의 숫자 ${dHi}이(가) 나타내는 값: ${hiPlaceVal.toLocaleString()}. `),
      txt(`${loName} 자리의 숫자 ${dLo}이(가) 나타내는 값: ${loPlaceVal.toLocaleString()}. `),
      txt(`두 자릿값 차이: ${expDiff}자리 → 자릿값 차이는 ${placeFactor.toLocaleString()}배. `),
      txt(`숫자 비율: ${dHi} ÷ ${dLo} = ${digitRatio}배. `),
      txt(`총 배수: ${digitRatio} × ${placeFactor.toLocaleString()} = ${ansVal.toLocaleString()}배예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `어떤 수에서 ${hiName} 자리의 숫자는 ${dHi}, ${loName} 자리의 숫자는 ${dLo}입니다. ${hiName} 자리의 숫자 ㉠이 나타내는 값은 ${loName} 자리의 숫자 ㉡이 나타내는 값의 몇 배인가요?`,
      expr: [blank(0), txt(' 배')],
      blankAnswers: [ansVal],
      explanation,
    };
  },
};

/**
 * ch41-checks  수표·지폐 교환
 * 총액 = a×1000000 + b×10000, 10만 원짜리로 최대 몇 장?
 * fill-blanks 장
 */
const chChecks: SkillDef = {
  id: 'ch41-checks',
  unitId: 'unitBigNum',
  title: '수표·지폐 교환',
  note: '총액=a×1000000+b×10000, floor(총액/100000), fill-blanks 장',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let a = 3, b = 15, total = 3150000, ans = 31;

    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(1, 9);  // 100만원짜리 수표 1~9장
      const b2 = rng.int(1, 99); // 만원짜리 지폐 1~99장
      const total2 = a2 * 1000000 + b2 * 10000;
      const ans2 = Math.floor(total2 / 100000);
      if (ans2 < 1) continue;
      a = a2; b = b2; total = total2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`100만 원짜리 ${a}장: ${a} × 1,000,000 = ${(a * 1000000).toLocaleString()} 원. `),
      txt(`만 원짜리 ${b}장: ${b} × 10,000 = ${(b * 10000).toLocaleString()} 원. `),
      txt(`총액: ${total.toLocaleString()} 원. `),
      txt(`10만 원짜리로 바꾸면: ${total.toLocaleString()} ÷ 100,000 = ${ans} 장 (나머지 ${total % 100000 > 0 ? total % 100000 : 0} 원은 바꿀 수 없어요).`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `100만 원짜리 수표 ${a}장과 만 원짜리 지폐 ${b}장이 있습니다. 10만 원짜리 수표로 될 수 있는 대로 많이 바꾸면 몇 장이 되나요?`,
      expr: [blank(0), txt(' 장')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch41-zerocount  큰 수의 0의 개수
 * "A억보다 B만 큰 수"에서 0의 개수
 * fill-blanks
 */
const chZerocount: SkillDef = {
  id: 'ch41-zerocount',
  unitId: 'unitBigNum',
  title: '큰 수의 0의 개수',
  note: 'A×10^8 + B×10^4, 0 개수≥1, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: A=3, B=500 → 300,005,000,000 → 0 개수?
    // 300005000000 → '300005000000' → 0: 4개
    let A = 3, B = 500, numVal = 300005000000, ans = 5;

    for (let tries = 0; tries < 2000; tries++) {
      const A2 = rng.int(1, 9);
      const B2 = rng.int(1, 9999);
      // 수 = A × 10^8 + B × 10^4
      const numVal2 = A2 * 100000000 + B2 * 10000;
      const str = numVal2.toString();
      const zeroCount = (str.match(/0/g) || []).length;
      if (zeroCount < 1) continue;
      A = A2; B = B2; numVal = numVal2; ans = zeroCount;
      break;
    }

    const explanation: MathExpr = [
      txt(`${A}억보다 ${B}만 큰 수를 구해요. `),
      txt(`${A}억 = ${(A * 100000000).toLocaleString()} `),
      txt(`${B}만 = ${(B * 10000).toLocaleString()} `),
      txt(`두 수의 합: ${numVal.toLocaleString()} `),
      txt(`이 수를 숫자로 나타내면: ${numVal.toString()}. `),
      txt(`0의 개수: ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${A}억보다 ${B}만 큰 수를 숫자로 나타낼 때, 0은 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitAngle — 각도
// ═══════════════════════════════════════════════════════════════

/**
 * ch41-clockangle  시계 두 바늘 작은 각
 * M은 10의 배수, 분침=6M°, 시침=30N+M/2°, 정수 보장
 * fill-blanks °
 */
const chClockangle: SkillDef = {
  id: 'ch41-clockangle',
  unitId: 'unitAngle',
  title: '시계 두 바늘 작은 각',
  note: 'M 10의 배수, 분침6M°, 시침30N+M/2°, fill-blanks °',
  difficulty: 3,
  challenge: true,
  minVariety: 60,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // N=0~11, M=0,10,20,30,40,50
    // 폴백: N=3, M=0 → 분침0°, 시침90° → diff=90
    let N = 3, M = 0, ans = 90;

    for (let tries = 0; tries < 2000; tries++) {
      const N2 = rng.int(1, 12);
      const M2 = rng.int(0, 5) * 10;
      const minuteAngle = 6 * M2;
      const hourAngle = 30 * N2 + M2 / 2; // 정수 (M이 10의 배수이므로 M/2는 5의 배수)
      const diff = Math.abs(hourAngle - minuteAngle);
      const ans2 = Math.min(diff, 360 - diff);
      if (ans2 === 0) continue; // 두 바늘 겹침 제외
      N = N2; M = M2; ans = ans2;
      break;
    }

    const minuteAngle = 6 * M;
    const hourAngle = 30 * N + M / 2;
    const diff = Math.abs(hourAngle - minuteAngle);

    const explanation: MathExpr = [
      txt(`시계에서 분침은 1분에 6°씩 움직여요. `),
      txt(`분침이 가리키는 각도: 6 × ${M} = ${minuteAngle}°. `),
      txt(`시침은 1시간에 30°, 1분에 0.5°씩 움직여요. `),
      txt(`시침이 가리키는 각도: 30 × ${N} + ${M} × 0.5 = ${30 * N} + ${M / 2} = ${hourAngle}°. `),
      txt(`두 바늘 사이의 각도: |${hourAngle} − ${minuteAngle}| = ${diff}°. `),
      txt(`작은 쪽의 각도: min(${diff}, 360 − ${diff}) = ${ans}°예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${N}시 ${M}분에 시계의 두 바늘이 이루는 작은 쪽의 각도는 몇 도인가요?`,
      expr: [blank(0), txt('°')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch41-polysum  다각형 각의 합
 * n각형의 모든 각의 합 = (n−2)×180
 * n=3~8, fill-blanks °
 */
const chPolysum: SkillDef = {
  id: 'ch41-polysum',
  unitId: 'unitAngle',
  title: '다각형 각의 합',
  note: '(n-2)×180, n=3~8, fill-blanks °',
  difficulty: 3,
  challenge: true,
  minVariety: 6,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const n = rng.int(3, 8);

    const POLY_NAMES: Record<number, string> = {
      3: '삼각형',
      4: '사각형',
      5: '오각형',
      6: '육각형',
      7: '칠각형',
      8: '팔각형',
    };

    const polyName = POLY_NAMES[n];

    // 변형: 50% 확률로 정n각형의 한 각도 묻기 (단, 답이 나누어 떨어질 때)
    const totalAngle = (n - 2) * 180;
    const canOneAngle = totalAngle % n === 0 && n >= 5; // 정삼각형(60), 정사각형(90)은 제외(너무 쉬움)
    const askOne = canOneAngle && rng.chance(0.4);

    if (askOne) {
      const oneAns = totalAngle / n;
      const explanation: MathExpr = [
        txt(`${n}각형의 모든 각의 합: (${n} − 2) × 180 = ${n - 2} × 180 = ${totalAngle}°. `),
        txt(`정${polyName}은 모든 각의 크기가 같으므로 한 각: ${totalAngle} ÷ ${n} = ${oneAns}°예요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `정${polyName}의 한 각의 크기는 몇 도인가요?`,
        expr: [blank(0), txt('°')],
        blankAnswers: [oneAns],
        explanation,
      };
    }

    const explanation: MathExpr = [
      txt(`${n}각형은 꼭짓점에서 대각선을 그으면 삼각형 ${n - 2}개로 나뉘어요. `),
      txt(`삼각형 하나의 각의 합은 180°이므로, `),
      txt(`${n}각형의 모든 각의 합: (${n} − 2) × 180 = ${n - 2} × 180 = ${totalAngle}°예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${polyName}의 모든 각의 크기의 합은 몇 도인가요?`,
      expr: [blank(0), txt('°')],
      blankAnswers: [totalAngle],
      explanation,
    };
  },
};

/**
 * ch41-clockdiff  두 시계 작은 각의 차
 * 시계 가/나 각각 작은 각 → 차 (양수)
 * fill-blanks °
 */
const chClockdiff: SkillDef = {
  id: 'ch41-clockdiff',
  unitId: 'unitAngle',
  title: '두 시계 작은 각의 차',
  note: 'N1,M1,N2,M2 각각 작은 각 → 차≥1, fill-blanks °',
  difficulty: 3,
  challenge: true,
  minVariety: 55,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: 3시 0분(90°), 1시 30분(135°) → 차=45°
    let N1 = 3, M1 = 0, N2 = 1, M2 = 30, ang1 = 90, ang2 = 135, ans = 45;

    for (let tries = 0; tries < 2000; tries++) {
      const N1_2 = rng.int(1, 12);
      const M1_2 = rng.int(0, 5) * 10;
      const N2_2 = rng.int(1, 12);
      const M2_2 = rng.int(0, 5) * 10;

      // 같은 시각 제외
      if (N1_2 === N2_2 && M1_2 === M2_2) continue;

      const minAng1 = 6 * M1_2;
      const hourAng1 = 30 * N1_2 + M1_2 / 2;
      const diff1 = Math.abs(hourAng1 - minAng1);
      const smallAng1 = Math.min(diff1, 360 - diff1);

      const minAng2 = 6 * M2_2;
      const hourAng2 = 30 * N2_2 + M2_2 / 2;
      const diff2 = Math.abs(hourAng2 - minAng2);
      const smallAng2 = Math.min(diff2, 360 - diff2);

      const ansDiff = Math.abs(smallAng1 - smallAng2);
      if (ansDiff < 1) continue;

      N1 = N1_2; M1 = M1_2; N2 = N2_2; M2 = M2_2;
      ang1 = smallAng1; ang2 = smallAng2; ans = ansDiff;
      break;
    }

    const minStr = (m: number) => m === 0 ? '정각' : `${m}분`;

    const explanation: MathExpr = [
      txt(`가 시계(${N1}시 ${minStr(M1)}): 분침=${6 * M1}°, 시침=${30 * N1 + M1 / 2}°. `),
      txt(`가 시계 작은 각: min(|${30 * N1 + M1 / 2} − ${6 * M1}|, 360 − |…|) = ${ang1}°. `),
      txt(`나 시계(${N2}시 ${minStr(M2)}): 분침=${6 * M2}°, 시침=${30 * N2 + M2 / 2}°. `),
      txt(`나 시계 작은 각: min(|${30 * N2 + M2 / 2} − ${6 * M2}|, 360 − |…|) = ${ang2}°. `),
      txt(`두 시계 작은 각의 차: |${ang1} − ${ang2}| = ${ans}°예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `시계 가는 ${N1}시 ${minStr(M1)}, 시계 나는 ${N2}시 ${minStr(M2)}를 가리킵니다. 두 시계의 두 바늘이 이루는 작은 쪽의 각도의 차는 몇 도인가요?`,
      expr: [blank(0), txt('°')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitMulDiv — 곱셈과 나눗셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch41-traintunnel  기차 터널 통과
 * v·t − L > 0 = 터널 길이
 * fill-blanks m
 */
const chTraintunnel: SkillDef = {
  id: 'ch41-traintunnel',
  unitId: 'unitMulDiv',
  title: '기차 터널 통과',
  note: 'v×t - L > 0, fill-blanks m',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: L=200m, v=30m/s, t=15s → 터널=250m
    let L = 200, v = 30, t = 15, ans = 250;

    for (let tries = 0; tries < 2000; tries++) {
      const L2 = rng.int(5, 30) * 10;  // 기차 길이: 50~300m
      const v2 = rng.int(5, 30) * 2;   // 속도: 10~60 m/s (짝수)
      const t2 = rng.int(5, 30);        // 통과 시간: 5~30초
      const moved = v2 * t2;            // 움직인 거리
      const tunnel = moved - L2;
      if (tunnel < 10) continue;
      if (tunnel > 2000) continue;
      L = L2; v = v2; t = t2; ans = tunnel;
      break;
    }

    const moved = v * t;

    const explanation: MathExpr = [
      txt(`기차가 완전히 통과하려면 터널 길이 + 기차 길이만큼 이동해야 해요. `),
      txt(`이동한 거리: ${v} × ${t} = ${moved} m. `),
      txt(`터널 길이: ${moved} − ${L} = ${ans} m예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `길이가 ${L} m인 기차가 1초에 ${v} m의 속도로 달려 터널을 완전히 통과하는 데 ${t}초가 걸렸습니다. 터널의 길이는 몇 m인가요?`,
      expr: [blank(0), txt(' m')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch41-divremmax  나머지 조건 세 자리 수 (최대 또는 최소)
 * D로 나눈 나머지가 r인 세 자리 수 중 가장 큰 수 or 가장 작은 수
 * fill-blanks
 */
const chDivremmax: SkillDef = {
  id: 'ch41-divremmax',
  unitId: 'unitMulDiv',
  title: '나머지 조건 세 자리 수',
  note: 'D=11~40, 0≤r<D, 최대/최소 세자리수, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: D=13, r=5 → 최대: 999이하, 13×76+5=993, 최소: 100이상, 13×8+5=109
    let D = 13, r = 5, askMax = true, ans = 993;

    for (let tries = 0; tries < 2000; tries++) {
      const D2 = rng.int(11, 40);
      const r2 = rng.int(0, D2 - 1);
      const isMax = rng.chance(0.5);

      let ansVal: number;
      if (isMax) {
        // 999 이하 최대 ≡ r (mod D)
        const q = Math.floor((999 - r2) / D2);
        ansVal = q * D2 + r2;
        if (ansVal > 999) ansVal -= D2;
        if (ansVal < 100) continue; // 세 자리가 아님
      } else {
        // 100 이상 최소 ≡ r (mod D)
        const q = Math.ceil((100 - r2) / D2);
        ansVal = q * D2 + r2;
        if (ansVal < 100) ansVal += D2;
        if (ansVal > 999) continue; // 세 자리가 아님
      }

      // 검증
      if (ansVal % D2 !== r2) continue;
      if (ansVal < 100 || ansVal > 999) continue;

      D = D2; r = r2; askMax = isMax; ans = ansVal;
      break;
    }

    const label = askMax ? '가장 큰' : '가장 작은';
    const qAns = Math.floor(ans / D);

    const explanation: MathExpr = [
      txt(`${D}${josa(D, '으로/로')} 나눈 나머지가 ${r}인 세 자리 수를 구해요. `),
      txt(`이런 수는 ${D} × □ + ${r} 형태예요. `),
    ];
    if (askMax) {
      explanation.push(txt(`${label} 세 자리 수는 999 이하이므로: ${D} × ${qAns} + ${r} = ${ans}. `));
      explanation.push(txt(`검산: ${ans} ÷ ${D} = ${qAns} ··· ${r}. 답은 ${ida(ans)}.`));
    } else {
      explanation.push(txt(`${label} 세 자리 수는 100 이상이므로: ${D} × ${qAns} + ${r} = ${ans}. `));
      explanation.push(txt(`검산: ${ans} ÷ ${D} = ${qAns} ··· ${r}. 답은 ${ida(ans)}.`));
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${D}${josa(D, '으로/로')} 나눈 나머지가 ${r}인 세 자리 수 중 ${label} 수를 구하세요.`,
      expr: [blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch41-leftoveradd  똑같이 나누려면 더 필요한 수
 * T mod s ≠ 0이면 더 필요 = s − (T mod s)
 * fill-blanks
 */
const chLeftoveradd: SkillDef = {
  id: 'ch41-leftoveradd',
  unitId: 'unitMulDiv',
  title: '똑같이 나누려면 더 필요한 수',
  note: 'T mod s ≠ 0, 더 필요 = s-(T mod s), fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const things = [
      { item: '구슬', container: '상자', unit: '개' },
      { item: '사탕', container: '봉투', unit: '개' },
      { item: '책', container: '묶음', unit: '권' },
      { item: '색연필', container: '필통', unit: '자루' },
      { item: '쿠키', container: '접시', unit: '개' },
    ];

    // 폴백
    let T = 37, s = 8, rem = 5, ans = 3;
    let thing = things[0];

    for (let tries = 0; tries < 2000; tries++) {
      const s2 = rng.int(3, 12); // s개씩 나눔
      const T2 = rng.int(20, 120);
      const rem2 = T2 % s2;
      if (rem2 === 0) continue; // 나머지 없으면 더 필요 없음
      const ans2 = s2 - rem2;
      if (ans2 < 1) continue;

      T = T2; s = s2; rem = rem2; ans = ans2;
      thing = rng.pick(things);
      break;
    }

    const q = Math.floor(T / s);

    const explanation: MathExpr = [
      txt(`${T} ÷ ${s} = ${q} ··· ${rem}. `),
      txt(`나머지 ${rem}${thing.unit}${josa(thing.unit, '이/가')} 남아서 ${q + 1}번째 ${thing.container}에 넣을 수 없어요. `),
      txt(`남김없이 나누려면 ${s} − ${rem} = ${ans}${thing.unit}${josa(thing.unit, '이/가')} 더 있어야 해요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${thing.item} ${T}${thing.unit}을 ${thing.container}에 ${s}${thing.unit}씩 똑같이 나누려고 하는데 남는 것이 생깁니다. 남김없이 나누려면 ${thing.item}이 적어도 몇 ${thing.unit} 더 필요한가요?`,
      expr: [blank(0), txt(` ${thing.unit}`)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitMove — 평면도형의 이동 (180° 돌리기)
// ═══════════════════════════════════════════════════════════════

/**
 * ch41-rotnum  180° 돌린 수와 처음 수의 차
 * fill-blanks
 */
const chRotnum: SkillDef = {
  id: 'ch41-rotnum',
  unitId: 'unitMove',
  title: '180° 돌린 수와 처음 수의 차',
  note: '회전 가능 세자리수, |R-N|>0, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: N=196, R=rot3(196)
    // 196 → d0=1,d1=9,d2=6 → 일의자리≠0 OK
    // rot: r0=ROT_MAP[6]=9, r1=ROT_MAP[9]=6, r2=ROT_MAP[1]=1 → 961
    let N = 196, R = 961, ans = 765;

    for (let tries = 0; tries < 2000; tries++) {
      // 세 자리 수 생성: 백의자리, 십의자리, 일의자리 모두 ROT_DIGITS
      const d0 = rng.pick(ROT_NONZERO as readonly number[]); // 백의자리 ≠ 0
      const d1 = rng.pick(ROT_DIGITS as readonly number[]);
      const d2 = rng.pick(ROT_NONZERO as readonly number[]); // 일의자리 ≠ 0 (돌리면 새 백의자리)
      const N2 = d0 * 100 + d1 * 10 + d2;
      if (!isValidRot3(N2)) continue;
      const R2 = rot3(N2);
      if (R2 < 100 || R2 > 999) continue;
      const diff = Math.abs(R2 - N2);
      if (diff === 0) continue;
      N = N2; R = R2; ans = diff;
      break;
    }

    const [dN0, dN1, dN2] = [Math.floor(N / 100), Math.floor(N / 10) % 10, N % 10];

    const explanation: MathExpr = [
      txt(`처음 수 ${N}: 백의 자리 ${dN0}, 십의 자리 ${dN1}, 일의 자리 ${dN2}. `),
      txt(`180° 돌리기: 자리 순서를 뒤집고 각 숫자를 변환해요. `),
      txt(`일의 자리 ${dN2} → ${ROT_MAP[dN2]} (새 백의 자리), `),
      txt(`십의 자리 ${dN1} → ${ROT_MAP[dN1]} (새 십의 자리), `),
      txt(`백의 자리 ${dN0} → ${ROT_MAP[dN0]} (새 일의 자리). `),
      txt(`돌린 수: ${R}. `),
      txt(`두 수의 차: |${R} − ${N}| = ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `세 자리 수 ${N}${josa(N, '을/를')} 180° 돌렸을 때 만들어지는 수와 처음 수의 차는 얼마인가요?\n(0→0, 1→1, 2→2, 5→5, 6→9, 8→8, 9→6으로 바뀝니다.)`,
      expr: [blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch41-rotsum  180° 돌린 수와 처음 수의 합
 * fill-blanks
 */
const chRotsum: SkillDef = {
  id: 'ch41-rotsum',
  unitId: 'unitMove',
  title: '180° 돌린 수와 처음 수의 합',
  note: '회전 가능 세자리수, R+N, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: N=196, R=961 → 합=1157
    let N = 196, R = 961, ans = 1157;

    for (let tries = 0; tries < 2000; tries++) {
      const d0 = rng.pick(ROT_NONZERO as readonly number[]);
      const d1 = rng.pick(ROT_DIGITS as readonly number[]);
      const d2 = rng.pick(ROT_NONZERO as readonly number[]);
      const N2 = d0 * 100 + d1 * 10 + d2;
      if (!isValidRot3(N2)) continue;
      const R2 = rot3(N2);
      if (R2 < 100 || R2 > 999) continue;
      N = N2; R = R2; ans = N2 + R2;
      break;
    }

    const [dN0, dN1, dN2] = [Math.floor(N / 100), Math.floor(N / 10) % 10, N % 10];

    const explanation: MathExpr = [
      txt(`처음 수 ${N}: 백의 자리 ${dN0}, 십의 자리 ${dN1}, 일의 자리 ${dN2}. `),
      txt(`180° 돌리기: 자리 순서를 뒤집고 각 숫자를 변환해요. `),
      txt(`일의 자리 ${dN2} → ${ROT_MAP[dN2]}, 십의 자리 ${dN1} → ${ROT_MAP[dN1]}, 백의 자리 ${dN0} → ${ROT_MAP[dN0]}. `),
      txt(`돌린 수: ${R}. `),
      txt(`두 수의 합: ${N} + ${R} = ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `세 자리 수 ${N}${josa(N, '을/를')} 180° 돌렸을 때 만들어지는 수와 처음 수의 합은 얼마인가요?\n(0→0, 1→1, 2→2, 5→5, 6→9, 8→8, 9→6으로 바뀝니다.)`,
      expr: [blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch41-rotcard  카드로 만든 최대·최소를 돌린 두 수의 차
 * 회전 가능 숫자 카드 4~5장 중 3장으로 최대/최소 세자리수, 각 180° 돌려 차
 * fill-blanks
 */
const chRotcard: SkillDef = {
  id: 'ch41-rotcard',
  unitId: 'unitMove',
  title: '카드로 만든 최대·최소를 돌린 두 수의 차',
  note: '4~5장 카드, 최대/최소 세자리수 각 180° 돌려 차, fill-blanks. 실제 조합 약 56종',
  difficulty: 3,
  challenge: true,
  minVariety: 50,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백 카드: [1,2,6,9] → 최대 세자리: 962, 최소: 126
    // rot3(962)=269? 확인: d0=9,d1=6,d2=2 → r0=ROT_MAP[2]=2,r1=ROT_MAP[6]=9,r2=ROT_MAP[9]=6 → 296
    // rot3(126): d0=1,d1=2,d2=6 → r0=ROT_MAP[6]=9,r1=ROT_MAP[2]=2,r2=ROT_MAP[1]=1 → 921
    // 차=|296-921|=625
    let cards: number[] = [1, 2, 6, 9];
    let maxNum = 962, minNum = 126, rotMax = 296, rotMin = 921, ans = 625;

    for (let tries = 0; tries < 2000; tries++) {
      const count = rng.chance(0.5) ? 4 : 5;
      // 카드 생성: count개의 서로 다른 회전 가능 숫자
      const pool = [...ROT_DIGITS]; // [0,1,2,5,6,8,9]
      if (pool.length < count) continue;
      const shuffled = rng.shuffle(pool as readonly number[]);
      const cands = shuffled.slice(0, count);

      // 브루트포스: 3개 조합 중 가장 큰/작은 수 (d0≠0, d2≠0, rot 결과도 세 자리)
      const choose3 = (arr: number[]): [number, number, number][] => {
        const result: [number, number, number][] = [];
        for (let i = 0; i < arr.length; i++)
          for (let j = 0; j < arr.length; j++)
            if (j !== i)
              for (let k = 0; k < arr.length; k++)
                if (k !== i && k !== j)
                  result.push([arr[i], arr[j], arr[k]]);
        return result;
      };

      const perms = choose3(cands);
      // 유효한 순열: d0≠0, d2≠0 (일의자리 0이면 돌린 백의자리=0)
      const valid = perms.filter(([d0, , d2]) => d0 !== 0 && d2 !== 0 && ROT_MAP[d2] !== 0);
      if (valid.length < 2) continue;

      const toNum = ([a, b, c]: [number, number, number]) => a * 100 + b * 10 + c;
      const nums = valid.map(toNum);
      const maxN = Math.max(...nums);
      const minN = Math.min(...nums);
      if (maxN === minN) continue;

      // 각각 회전
      if (!isValidRot3(maxN) || !isValidRot3(minN)) continue;
      const rMax = rot3(maxN);
      const rMin = rot3(minN);
      if (rMax < 100 || rMax > 999 || rMin < 100 || rMin > 999) continue;

      const diff = Math.abs(rMax - rMin);
      if (diff === 0) continue;

      cards = cands.sort((a, b) => a - b);
      maxNum = maxN; minNum = minN;
      rotMax = rMax; rotMin = rMin; ans = diff;
      break;
    }

    const cardStr = cards.join(', ');
    const [mxD0, mxD1, mxD2] = [Math.floor(maxNum / 100), Math.floor(maxNum / 10) % 10, maxNum % 10];
    const [mnD0, mnD1, mnD2] = [Math.floor(minNum / 100), Math.floor(minNum / 10) % 10, minNum % 10];

    const explanation: MathExpr = [
      txt(`카드 ${cardStr} 중 3장으로 만들 수 있는 가장 큰 세 자리 수: ${maxNum}. `),
      txt(`${maxNum} 돌리기: ${mxD2}→${ROT_MAP[mxD2]}, ${mxD1}→${ROT_MAP[mxD1]}, ${mxD0}→${ROT_MAP[mxD0]} → ${rotMax}. `),
      txt(`카드 중 3장으로 만들 수 있는 가장 작은 세 자리 수: ${minNum}. `),
      txt(`${minNum} 돌리기: ${mnD2}→${ROT_MAP[mnD2]}, ${mnD1}→${ROT_MAP[mnD1]}, ${mnD0}→${ROT_MAP[mnD0]} → ${rotMin}. `),
      txt(`두 수의 차: |${rotMax} − ${rotMin}| = ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `숫자 카드 ${cardStr} 중에서 3장을 골라 만들 수 있는 가장 큰 세 자리 수와 가장 작은 세 자리 수를 각각 180° 돌렸을 때 두 수의 차는 얼마인가요?\n(0→0, 1→1, 2→2, 5→5, 6→9, 8→8, 9→6으로 바뀝니다.)`,
      expr: [blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitBarGraph — 막대그래프
// ═══════════════════════════════════════════════════════════════

/**
 * ch41-barscale  눈금 한 칸 크기로 전체
 * k명 × (m1+m2+m3)칸 = 전체
 * fill-blanks
 */
const chBarscale: SkillDef = {
  id: 'ch41-barscale',
  unitId: 'unitBarGraph',
  title: '눈금 한 칸 크기로 전체',
  note: 'k×(m1+m2+m3), k=2~10, mi=1~8, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const groups = [
      { items: ['가 마을', '나 마을', '다 마을'], unit: '명' },
      { items: ['1반', '2반', '3반'], unit: '명' },
      { items: ['봄', '여름', '가을'], unit: '명' },
      { items: ['사과', '배', '귤'], unit: '개' },
      { items: ['축구', '농구', '야구'], unit: '명' },
    ];

    // 폴백
    let k = 5, m1 = 3, m2 = 4, m3 = 6, ans = 65;
    let grp = groups[0];

    for (let tries = 0; tries < 2000; tries++) {
      const k2 = rng.int(2, 10);
      const m1_2 = rng.int(1, 8);
      const m2_2 = rng.int(1, 8);
      const m3_2 = rng.int(1, 8);
      const ans2 = k2 * (m1_2 + m2_2 + m3_2);
      if (ans2 < 10 || ans2 > 200) continue;
      k = k2; m1 = m1_2; m2 = m2_2; m3 = m3_2; ans = ans2;
      grp = rng.pick(groups);
      break;
    }

    const [it1, it2, it3] = grp.items;

    const explanation: MathExpr = [
      txt(`세로 눈금 한 칸이 ${k}${grp.unit}이에요. `),
      txt(`${it1}: ${m1}칸 = ${k}×${m1} = ${k * m1}${grp.unit}. `),
      txt(`${it2}: ${m2}칸 = ${k}×${m2} = ${k * m2}${grp.unit}. `),
      txt(`${it3}: ${m3}칸 = ${k}×${m3} = ${k * m3}${grp.unit}. `),
      txt(`전체: ${k * m1} + ${k * m2} + ${k * m3} = ${ans}${ida(grp.unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `막대그래프에서 세로 눈금 한 칸이 ${k}${grp.unit}을 나타냅니다. ${it1}의 막대는 ${m1}칸, ${it2}의 막대는 ${m2}칸, ${it3}의 막대는 ${m3}칸입니다. 전체 ${grp.unit} 수는 몇 ${grp.unit}인가요?`,
      expr: [blank(0), txt(` ${grp.unit}`)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch41-barrel  관계로 막대 항목 구하기
 * A=2×B, C=A+d 또는 C=A-d, 합=N → B 역산
 * fill-blanks 명
 */
const chBarrel: SkillDef = {
  id: 'ch41-barrel',
  unitId: 'unitBarGraph',
  title: '관계로 막대 항목 구하기',
  note: 'A=k×B, C=A±d, 합=N, 역산, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const items = [
      { names: ['가', '나', '다'], unit: '명', context: '학생 수' },
      { names: ['사과', '배', '귤'], unit: '개', context: '판매 수' },
      { names: ['봄', '여름', '가을'], unit: '명', context: '좋아하는 계절별 학생 수' },
    ];

    // A=k*B (k=2 or 3), C=A+d or C=A-d
    // 합 = A + B + C = k*B + B + (k*B ± d) = (2k+1)*B ± d = N
    // B = (N ∓ d) / (2k+1)

    // 수정: k=2, d=3, N=(2*2+1)*5+3=28 → B=5, A=10, C=13
    let k = 2, d = 3, cMore = true, B = 5, A = 10, N = 28;
    let item = items[0];

    for (let tries = 0; tries < 2000; tries++) {
      const k2 = rng.pick([2, 3] as const);
      const cMore2 = rng.chance(0.5);
      const B2 = rng.int(3, 15);
      const A2 = k2 * B2;
      const d2 = rng.int(1, 10);
      const C2 = cMore2 ? A2 + d2 : A2 - d2;
      if (C2 < 1) continue;
      const N2 = A2 + B2 + C2;
      if (N2 > 120 || N2 < 10) continue;

      // 역산 검증: B = (N2 ∓ d2) / (2k2+1)
      const bCalc = cMore2 ? (N2 - d2) / (2 * k2 + 1) : (N2 + d2) / (2 * k2 + 1);
      if (!Number.isInteger(bCalc) || bCalc !== B2) continue;

      k = k2; d = d2; cMore = cMore2;
      B = B2; A = A2; N = N2;
      item = rng.pick(items);
      break;
    }

    const [nameA, nameB, nameC] = item.names;
    const cRel = cMore ? `${nameA}보다 ${d} ${item.unit} 더 많` : `${nameA}보다 ${d} ${item.unit} 더 적`;

    const explanation: MathExpr = [
      txt(`${nameA}는 ${nameB}의 ${k}배, ${nameC}는 ${cRel}습니다. `),
      txt(`${nameB}를 □라 하면: ${nameA} = ${k}×□. `),
      txt(`${nameC} = ${k}×□ ${cMore ? '+' : '−'} ${d}. `),
      txt(`합: ${k}×□ + □ + ${k}×□ ${cMore ? '+' : '−'} ${d} = ${N}. `),
      txt(`${2 * k + 1}×□ ${cMore ? '+' : '−'} ${d} = ${N}. `),
      txt(`${2 * k + 1}×□ = ${cMore ? N - d : N + d}. `),
      txt(`□ = ${B}. ${nameA} = ${A}${ida(item.unit)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `막대그래프에서 ${nameA}의 ${item.context}는 ${nameB}의 ${k}배이고, ${nameC}는 ${cRel}습니다. 전체 합계가 ${N}${item.unit}일 때 ${nameA}는 몇 ${item.unit}인가요?`,
      expr: [blank(0), txt(` ${item.unit}`)],
      blankAnswers: [A],
      explanation,
    };
  },
};

/**
 * ch41-bartwogroup  남녀 차 최대 반·최소 반의 합
 * 4개 반의 남·여 학생 수 → |남-여|가 가장 큰 반과 가장 작은 반의 (남+여) 합
 * fill-blanks 명
 */
const chBartwogroup: SkillDef = {
  id: 'ch41-bartwogroup',
  unitId: 'unitBarGraph',
  title: '남녀 차 최대 반·최소 반의 합',
  note: '4개 반 남녀, 차 동률 없음, 최대반+최소반 합, fill-blanks 명',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: 4개 반 각 [남, 여]
    let classData = [[15, 10], [12, 16], [14, 14], [18, 11]] as number[][];
    let maxClass = 0, minClass = 2, ans = classData[0][0] + classData[0][1] + classData[2][0] + classData[2][1];

    for (let tries = 0; tries < 2000; tries++) {
      const data: number[][] = [];
      for (let i = 0; i < 4; i++) {
        const m = rng.int(10, 20);
        const f = rng.int(10, 20);
        data.push([m, f]);
      }
      // 각 반 |남-여| 계산
      const diffs = data.map(([m, f]) => Math.abs(m - f));
      // 동률 없어야 함
      const uniqueDiffs = new Set(diffs);
      if (uniqueDiffs.size !== 4) continue;

      const maxD = Math.max(...diffs);
      const minD = Math.min(...diffs);
      const maxIdx = diffs.indexOf(maxD);
      const minIdx = diffs.indexOf(minD);

      const ans2 = data[maxIdx][0] + data[maxIdx][1] + data[minIdx][0] + data[minIdx][1];
      if (ans2 < 1) continue;

      classData = data;
      maxClass = maxIdx;
      minClass = minIdx;
      ans = ans2;
      break;
    }

    const diffs = classData.map(([m, f]) => Math.abs(m - f));
    const classNames = ['1반', '2반', '3반', '4반'];

    const explanation: MathExpr = [
      txt(`각 반의 남녀 차: ${classNames.map((n, i) => `${n} ${diffs[i]}명`).join(', ')}. `),
      txt(`차가 가장 큰 반: ${classNames[maxClass]}(차 ${diffs[maxClass]}명). `),
      txt(`차가 가장 작은 반: ${classNames[minClass]}(차 ${diffs[minClass]}명). `),
      txt(`두 반의 전체 학생 수 합: (${classData[maxClass][0]}+${classData[maxClass][1]}) + (${classData[minClass][0]}+${classData[minClass][1]}) = ${ans}${ida('명')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음은 각 반 남녀 학생 수입니다.\n${classData.map(([m, f], i) => `${classNames[i]}: 남 ${m}명, 여 ${f}명`).join(', ')}\n남녀 학생 수의 차가 가장 큰 반과 가장 작은 반의 전체 학생 수의 합은 몇 명인가요?`,
      expr: [blank(0), txt(' 명')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitFindRule — 규칙 찾기
// ═══════════════════════════════════════════════════════════════

/**
 * ch41-seqterm  차가 커지는 수열 n번째
 * f, f+d, f+3d, f+6d, … → k번째 = f + d×(k-1)k/2
 * fill-blanks
 */
const chSeqterm: SkillDef = {
  id: 'ch41-seqterm',
  unitId: 'unitFindRule',
  title: '차가 커지는 수열 n번째',
  note: 'f=5~20, d=5~10, k=4~8, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const f = rng.int(5, 20);
    const d = rng.int(5, 10);
    const k = rng.int(4, 8);
    const ans = f + d * ((k - 1) * k / 2);

    // 앞 4개 항 보여주기
    const terms: number[] = [];
    for (let i = 1; i <= 4; i++) {
      terms.push(f + d * ((i - 1) * i / 2));
    }
    const termStr = terms.join(', ');

    const explanation: MathExpr = [
      txt(`수열: ${termStr}, … `),
      txt(`차이를 보면: ${d}, ${2 * d}, ${3 * d}, … (d씩 커지는 규칙). `),
      txt(`k번째 항 = 처음 수 + d × (1+2+…+(k-1)). `),
      txt(`${k}번째 항 = ${f} + ${d} × (1+2+…+${k - 1}). `),
      txt(`1+2+…+${k - 1} = ${(k - 1) * k / 2}. `),
      txt(`${k}번째 항 = ${f} + ${d} × ${(k - 1) * k / 2} = ${f} + ${d * (k - 1) * k / 2} = ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${termStr}, … 과 같이 늘어나는 수열이 있습니다. 이웃한 두 수의 차가 ${d}, ${2 * d}, ${3 * d}, …으로 ${d}씩 커집니다. 이 수열의 ${k}번째 수는 얼마인가요?`,
      expr: [blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch41-oddsum  연속 홀수 합 규칙
 * 1+3+5+…+(2n-1) = n². 마지막 홀수 or n²번째까지 합
 * fill-blanks
 */
const chOddsum: SkillDef = {
  id: 'ch41-oddsum',
  unitId: 'unitFindRule',
  title: '연속 홀수 합 규칙',
  note: 'n=4~12, 두 변형 랜덤, fill-blanks',
  difficulty: 3,
  challenge: true,
  minVariety: 18,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const n = rng.int(4, 12);
    const lastOdd = 2 * n - 1;
    const sumVal = n * n;

    // 변형A: 합이 n²가 되는 덧셈식에서 마지막으로 더한 홀수는?
    // 변형B: 1+3+5+…을 n번째까지 더한 합은?
    const askLast = rng.chance(0.5);

    if (askLast) {
      // 합 sumVal이 주어지고 마지막 홀수 = 2n-1
      const explanation: MathExpr = [
        txt(`1+3+5+…처럼 홀수를 n개 더한 합은 n×n이에요. `),
        txt(`합 = ${sumVal} = ${n}×${n}이므로 n = ${n}. `),
        txt(`마지막으로 더한 홀수 = 2×${n} − 1 = ${ida(lastOdd)}.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `1+3+5+…와 같이 홀수를 차례로 더했더니 합이 ${sumVal}${josa(sumVal, '이/가')} 되었습니다. 마지막으로 더한 홀수는 얼마인가요?`,
        expr: [blank(0)],
        blankAnswers: [lastOdd],
        explanation,
      };
    } else {
      // n번째까지 합 = n×n
      const explanation: MathExpr = [
        txt(`1+3+5+…처럼 홀수를 n개 더한 합은 n×n이에요. `),
        txt(`${n}번째까지 더한 홀수: 1, 3, 5, …, ${lastOdd}. `),
        txt(`합 = ${n}×${n} = ${ida(sumVal)}.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `1+3+5+…와 같이 홀수를 차례로 더할 때 ${n}번째 홀수까지의 합은 얼마인가요?`,
        expr: [blank(0)],
        blankAnswers: [sumVal],
        explanation,
      };
    }
  },
};

/**
 * ch41-doublegrow  2배씩 증식 일수
 * 1마리 → d일마다 2배 → T=2^k마리 → 며칠?
 * fill-blanks 일
 */
const chDoublegrow: SkillDef = {
  id: 'ch41-doublegrow',
  unitId: 'unitFindRule',
  title: '2배씩 증식 일수',
  note: 'T=2^k, ans=d×k, d=3~7, k=3~9, fill-blanks 일',
  difficulty: 3,
  challenge: true,
  minVariety: 35,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const d = rng.int(3, 7);
    const k = rng.int(3, 9);
    const T = Math.pow(2, k); // T = 2^k ≤ 512
    const ans = d * k;

    const creatures = ['세균', '벌레', '미생물', '꽃잎', '씨앗'];
    const creature = rng.pick(creatures);

    // 증식 과정 보여주기 (최대 5단계)
    const steps: string[] = [];
    for (let i = 0; i <= Math.min(k, 4); i++) {
      steps.push(`${d * i}일 후: ${Math.pow(2, i)}마리`);
    }
    if (k > 4) steps.push(`… ${d * k}일 후: ${T}마리`);

    const explanation: MathExpr = [
      txt(`${d}일마다 2배로 늘어나요. `),
      txt(steps.join(', ') + '. '),
      txt(`${T}마리가 되려면 2배를 ${k}번 반복해야 해요. `),
      txt(`걸리는 일수: ${d} × ${k} = ${ans}${ida('일')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${creature} 1마리가 ${d}일마다 2배로 늘어납니다. ${T}마리가 되려면 적어도 며칠이 걸리나요?`,
      expr: [blank(0), txt(' 일')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  내보내기
// ═══════════════════════════════════════════════════════════════

export const challengeG4S1Skills: SkillDef[] = [
  // unitBigNum — 큰 수
  chPlacevalue,
  chChecks,
  chZerocount,
  // unitAngle — 각도
  chClockangle,
  chPolysum,
  chClockdiff,
  // unitMulDiv — 곱셈과 나눗셈
  chTraintunnel,
  chDivremmax,
  chLeftoveradd,
  // unitMove — 평면도형의 이동
  chRotnum,
  chRotsum,
  chRotcard,
  // unitBarGraph — 막대그래프
  chBarscale,
  chBarrel,
  chBartwogroup,
  // unitFindRule — 규칙 찾기
  chSeqterm,
  chOddsum,
  chDoublegrow,
];
