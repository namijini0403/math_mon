/**
 * 2-1 심화 문제 생성기 (challenge: true, difficulty: 3)
 * 명세: docs/challenge/g2s1.md
 */

import { RNG } from '../rng';
import { ida, nj } from '../josa';
import type { MathExpr, MathToken, Problem, SkillDef } from '../types';

// ── 공통 토큰 헬퍼 ──────────────────────────────────────────
const txt = (t: string): MathToken => ({ kind: 'text', text: t });
const blank = (slot: number): MathToken => ({ kind: 'blank', slot });

// ═══════════════════════════════════════════════════════════════
//  unitNum3d — 세 자리 수
// ═══════════════════════════════════════════════════════════════

/**
 * ch21-card  숫자 카드로 세 자리 수 만들기 (몇 번째 큰/작은 수)
 * 서로 다른 숫자 카드 4장(0 포함 가능)에서 3장으로 세 자리 수
 */
const chCard: SkillDef = {
  id: 'ch21-card',
  unitId: 'unitNum3d',
  title: '숫자 카드로 몇 번째 큰/작은 세 자리 수',
  note: '4장 카드 순열, 백의 자리 0 제외, 중복 제거 후 n번째',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값
    let cards: number[] = [1, 2, 3, 0];
    let rankLabel = '두 번째로 작은';
    let ans = 120;
    let nums: number[] = [];

    for (let tries = 0; tries < 2000; tries++) {
      // 0 포함 여부 랜덤
      const includeZero = rng.chance(0.5);
      let pool: number[];
      if (includeZero) {
        // 0 + 1~9 중 3장
        const nonZero: number[] = [];
        while (nonZero.length < 3) {
          const d = rng.int(1, 9);
          if (!nonZero.includes(d)) nonZero.push(d);
        }
        pool = [0, ...nonZero];
      } else {
        // 1~9 중 4장
        const chosen: number[] = [];
        while (chosen.length < 4) {
          const d = rng.int(1, 9);
          if (!chosen.includes(d)) chosen.push(d);
        }
        pool = chosen;
      }

      // 3-순열 생성 (백의 자리 0 제외)
      const candidates: number[] = [];
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (j === i) continue;
          for (let k = 0; k < 4; k++) {
            if (k === i || k === j) continue;
            if (pool[i] === 0) continue; // 백의 자리 0 제외
            const num = pool[i] * 100 + pool[j] * 10 + pool[k];
            if (!candidates.includes(num)) candidates.push(num);
          }
        }
      }
      candidates.sort((a, b) => a - b);

      if (candidates.length < 6) continue;

      // 랜덤 순위 (2번째 작은, 2번째 큰, 3번째 작은 중 하나)
      const rankType = rng.int(0, 2);
      let rl: string;
      let a: number;
      if (rankType === 0) {
        rl = '두 번째로 작은'; a = candidates[1];
      } else if (rankType === 1) {
        rl = '두 번째로 큰'; a = candidates[candidates.length - 2];
      } else {
        rl = '세 번째로 작은'; a = candidates[2];
      }

      if (a < 100 || a > 999) continue;

      cards = pool;
      rankLabel = rl;
      ans = a;
      nums = candidates;
      break;
    }

    const explanation: MathExpr = [
      txt(`카드 ${cards.join(', ')} 중 3장으로 만든 세 자리 수를 작은 것부터 나열해요. `),
      txt(`(백의 자리에 0은 쓸 수 없어요.) `),
      txt(`나열: ${nums.slice(0, Math.min(6, nums.length)).join(', ')}${nums.length > 6 ? ', …' : ''}. `),
      txt(`${rankLabel} 수는 ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `카드 ${cards.join(', ')} 중 3장을 뽑아 만들 수 있는 세 자리 수 중 ${rankLabel} 수를 구하세요.`,
      expr: [txt(`${rankLabel} 세 자리 수 = `), blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch21-coin  동전 금액 / 몇 개 더 필요
 * (a) 합산: 500a+100b+50c+10d 원 (b) 부족분: 몇 개 더 있어야
 */
const chCoin: SkillDef = {
  id: 'ch21-coin',
  unitId: 'unitNum3d',
  title: '동전 금액 합산 / 부족분',
  note: '합산 또는 부족분 랜덤, 세 자리 수 보장, 답 양수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const variant = rng.chance(0.5); // true=합산, false=부족분

    if (variant) {
      // (a) 합산 변형
      let a = 0, b = 0, c = 0, d = 0, total = 0;
      for (let tries = 0; tries < 2000; tries++) {
        const a2 = rng.int(0, 3);
        const b2 = rng.int(0, 6);
        const c2 = rng.int(0, 6);
        const d2 = rng.int(0, 6);
        const t = 500 * a2 + 100 * b2 + 50 * c2 + 10 * d2;
        if (t < 100 || t > 999) continue;
        if (a2 + b2 + c2 + d2 === 0) continue;
        a = a2; b = b2; c = c2; d = d2; total = t;
        break;
      }
      if (total === 0) { a = 1; b = 2; c = 0; d = 0; total = 700; }

      const parts: string[] = [];
      if (a > 0) parts.push(`500원짜리 ${a}개`);
      if (b > 0) parts.push(`100원짜리 ${b}개`);
      if (c > 0) parts.push(`50원짜리 ${c}개`);
      if (d > 0) parts.push(`10원짜리 ${d}개`);

      const explanation: MathExpr = [
        txt(`각 동전의 금액을 계산해요. `),
        a > 0 ? txt(`500×${a}=${500 * a}원, `) : txt(''),
        b > 0 ? txt(`100×${b}=${100 * b}원, `) : txt(''),
        c > 0 ? txt(`50×${c}=${50 * c}원, `) : txt(''),
        d > 0 ? txt(`10×${d}=${10 * d}원, `) : txt(''),
        txt(`모두 더하면 ${total}${ida('원')}.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${parts.join(', ')}가 있습니다. 모두 얼마인가요?`,
        expr: [blank(0), txt(' 원')],
        blankAnswers: [total],
        explanation,
      };
    } else {
      // (b) 부족분 변형
      let T = 0, cur = 0, unit = 50, need = 0;
      for (let tries = 0; tries < 2000; tries++) {
        const unit2 = rng.chance(0.5) ? 50 : 100;
        // 목표 T: 세 자리, unit의 배수
        const tMult = rng.int(2, 9);
        const T2 = unit2 * tMult + rng.int(1, 5) * unit2; // 세 자리
        if (T2 < 100 || T2 > 999) continue;
        // 현재 금액: T보다 작고, unit의 배수
        const curMult = rng.int(1, tMult - 1);
        const cur2 = unit2 * curMult;
        if (cur2 <= 0 || cur2 >= T2) continue;
        const diff = T2 - cur2;
        if (diff % unit2 !== 0) continue;
        const need2 = diff / unit2;
        if (need2 < 1) continue;
        T = T2; cur = cur2; unit = unit2; need = need2;
        break;
      }
      if (need === 0) { T = 500; cur = 300; unit = 50; need = 4; }

      const explanation: MathExpr = [
        txt(`목표 금액 ${T}원에서 현재 ${cur}원을 빼면 ${T - cur}원이 부족해요. `),
        txt(`${unit}원짜리로 ${need}개씩 셌을 때: ${unit}×${need}=${T - cur}원이 되어 딱 맞아요.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `현재 ${cur}원이 있습니다. ${T}원이 되려면 ${unit}원짜리 동전이 몇 개 더 있어야 하나요?`,
        expr: [blank(0), txt(` 개`)],
        blankAnswers: [need],
        explanation,
      };
    }
  },
};

/**
 * ch21-cond  세 조건을 만족하는 세 자리 수
 * 조건: ① A보다 크고 B보다 작다 ② 십의 자리=일의 자리 ③ 십의 자리=백의 자리+k
 * 해가 정확히 1개인 조합만 출제
 */
const chCond: SkillDef = {
  id: 'ch21-cond',
  unitId: 'unitNum3d',
  title: '세 조건 만족하는 세 자리 수',
  note: '범위+자리 조건으로 유일해 보장',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백 (백=1,십=일=2 → 122; 120보다 크고 130보다 작은 유일 후보)
    let A = 120, B = 130, k = 1, ans = 122;

    for (let tries = 0; tries < 2000; tries++) {
      const k2 = rng.int(1, 4);
      // 백의 자리 h, 십의 자리=일의 자리=h+k2 (1~9)
      // 가능한 후보 수를 먼저 생성
      const candidates: number[] = [];
      for (let h = 1; h <= 9; h++) {
        const t = h + k2;
        if (t < 0 || t > 9) continue;
        if (t === 0) continue; // 십의 자리 0이면 답이 xx0 형태 (valid하지만 조건상 fine)
        const num = h * 100 + t * 10 + t;
        candidates.push(num);
      }
      if (candidates.length < 2) continue;

      // A, B 범위를 잡아서 후보가 정확히 1개가 되도록
      // 먼저 목표 후보를 랜덤 선택
      const targetIdx = rng.int(0, candidates.length - 1);
      const target = candidates[targetIdx];

      // A < target < B 인 범위를 잡되, 다른 후보가 범위 안에 없도록
      // target보다 작은 후보 중 최대값
      const smaller = candidates.filter(c => c < target);
      const larger = candidates.filter(c => c > target);

      const A2 = smaller.length > 0 ? smaller[smaller.length - 1] : target - rng.int(50, 120);
      const B2 = larger.length > 0 ? larger[0] : target + rng.int(50, 120);

      if (A2 <= 0 || B2 > 999) continue;
      if (B2 - A2 < 10) continue; // 범위가 너무 좁으면 재시도

      // 실제로 범위 안에 후보가 1개인지 검증
      const inRange = candidates.filter(c => c > A2 && c < B2);
      if (inRange.length !== 1) continue;

      A = A2; B = B2; k = k2; ans = target;
      break;
    }

    const explanation: MathExpr = [
      txt(`세 조건을 차례로 적용해요. `),
      txt(`① ${A}보다 크고 ${B}보다 작은 세 자리 수. `),
      txt(`② 십의 자리 숫자와 일의 자리 숫자가 같아요. `),
      txt(`③ 십의 자리 숫자는 백의 자리 숫자보다 ${k} 더 커요. `),
      txt(`백의 자리를 □라 하면 십의 자리=일의 자리=□+${k}이고, `),
      txt(`조건 ①을 만족하는 수는 ${ans}뿐이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `세 조건을 모두 만족하는 세 자리 수를 구하세요.\n① ${A}보다 크고 ${B}보다 작습니다.\n② 십의 자리 숫자와 일의 자리 숫자가 같습니다.\n③ 십의 자리 숫자는 백의 자리 숫자보다 ${k} 더 큽니다.`,
      expr: [txt('조건을 만족하는 세 자리 수 = '), blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitFigure2 — 여러 가지 도형
// ═══════════════════════════════════════════════════════════════

/**
 * ch22-side  다각형 변·꼭짓점 수 사칙 조합
 * ㉠(도형)의 변의 수 + ㉡(도형)의 꼭짓점의 수 − ㉢(도형)의 변의 수
 */
const chSide: SkillDef = {
  id: 'ch21-side',
  unitId: 'unitFigure2',
  title: '다각형 변·꼭짓점 수 사칙 조합',
  note: '삼각형3·사각형4·오각형5·육각형6, 결과 양의 정수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const shapes = [
      { name: '삼각형', sides: 3 },
      { name: '사각형', sides: 4 },
      { name: '오각형', sides: 5 },
      { name: '육각형', sides: 6 },
    ];

    // 폴백
    let s1 = shapes[2], s2 = shapes[3], s3 = shapes[0];
    let attr1 = '변', attr2 = '꼭짓점', attr3 = '변';
    let ans = s1.sides + s2.sides - s3.sides; // 5+6-3=8

    for (let tries = 0; tries < 2000; tries++) {
      const i1 = rng.int(0, 3);
      const i2 = rng.int(0, 3);
      const i3 = rng.int(0, 3);
      const a1 = rng.chance(0.5) ? '변' : '꼭짓점';
      const a2 = rng.chance(0.5) ? '변' : '꼭짓점';
      const a3 = rng.chance(0.5) ? '변' : '꼭짓점';
      const v1 = shapes[i1].sides; // 변=꼭짓점 수 동일
      const v2 = shapes[i2].sides;
      const v3 = shapes[i3].sides;
      const result = v1 + v2 - v3;
      if (result <= 0) continue;
      s1 = shapes[i1]; s2 = shapes[i2]; s3 = shapes[i3];
      attr1 = a1; attr2 = a2; attr3 = a3;
      ans = result;
      break;
    }

    const explanation: MathExpr = [
      txt(`${s1.name}의 ${attr1}의 수: ${s1.sides}개. `),
      txt(`${s2.name}의 ${attr2}의 수: ${s2.sides}개. `),
      txt(`${s3.name}의 ${attr3}의 수: ${s3.sides}개. `),
      txt(`${s1.sides} + ${s2.sides} − ${s3.sides} = ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `㉠ ${s1.name}의 ${attr1}의 수 + ㉡ ${s2.name}의 ${attr2}의 수 − ㉢ ${s3.name}의 ${attr3}의 수를 구하세요.`,
      expr: [txt(`㉠ + ㉡ − ㉢ = `), blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-square-row  한 줄로 이어 붙인 정사각형에서 사각형 개수
 * n=3~6, 답 = n(n+1)/2
 */
const chSquareRow: SkillDef = {
  id: 'ch21-squarerow',
  unitId: 'unitFigure2',
  title: '이어 붙인 정사각형의 사각형 개수',
  note: 'n=3~6, 답=n(n+1)/2',
  difficulty: 3,
  challenge: true,
  minVariety: 4,
  generate(seed): Problem {
    const rng = new RNG(seed);
    const n = rng.int(3, 6);
    const ans = (n * (n + 1)) / 2;

    // 풀이: 1칸짜리 n개, 2칸짜리 n-1개, ...
    const breakdown: string[] = [];
    for (let size = 1; size <= n; size++) {
      breakdown.push(`${size}칸짜리 ${n - size + 1}개`);
    }

    const explanation: MathExpr = [
      txt(`정사각형 ${n}개를 한 줄로 이어 붙인 모양에서 사각형을 크기별로 세요. `),
      txt(breakdown.join(', ') + '. '),
      txt(`모두 더하면 ${Array.from({ length: n }, (_, i) => n - i).join(' + ')} = ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `정사각형 ${n}개를 한 줄로 이어 붙였을 때 찾을 수 있는 크고 작은 사각형은 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-fold  색종이 접어 자르기 (사각형 개수)
 * n=2~4번 접고 선 따라 자르면 사각형 2ⁿ개
 */
const chFold: SkillDef = {
  id: 'ch21-fold',
  unitId: 'unitFigure2',
  title: '색종이 접어 자르기 사각형 개수',
  note: 'n=2~4, 답=2ⁿ (4,8,16)',
  difficulty: 3,
  challenge: true,
  minVariety: 3,
  generate(seed): Problem {
    const rng = new RNG(seed);
    const n = rng.int(2, 4);
    const ans = Math.pow(2, n);

    const steps: string[] = [];
    let cur = 1;
    for (let i = 1; i <= n; i++) {
      cur *= 2;
      steps.push(`${i}번 접으면 ${cur}칸`);
    }

    const explanation: MathExpr = [
      txt(`한 번 접을 때마다 칸 수가 2배가 돼요. `),
      txt(steps.join(' → ') + '. '),
      txt(`${n}번 접으면 ${ans}칸 → 선을 따라 자르면 사각형이 ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `색종이를 같은 방향으로 ${n}번 접었다가 펼친 뒤 접힌 선을 따라 모두 자르면 사각형이 몇 개가 되나요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitAddSub2 — 덧셈과 뺄셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch23-between  두 식 사이 두 자리 수의 개수
 * (A+B)보다 크고 (C−D)보다 작은 두 자리 수 개수
 */
const chBetween: SkillDef = {
  id: 'ch21-between',
  unitId: 'unitAddSub2',
  title: '두 식 사이 두 자리 수 개수',
  note: '좌=A+B, 우=C-D, 답=우-좌-1, 2~9개',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let A = 23, B = 14, C = 85, D = 12, lo = 37, hi = 73, cnt = 35;

    for (let tries = 0; tries < 2000; tries++) {
      const A2 = rng.int(10, 50);
      const B2 = rng.int(10, 40);
      const lo2 = A2 + B2;
      if (lo2 < 10 || lo2 > 89) continue;

      const C2 = rng.int(50, 99);
      const D2 = rng.int(1, 30);
      const hi2 = C2 - D2;
      if (hi2 < 10 || hi2 > 99) continue;
      if (hi2 <= lo2) continue;

      const cnt2 = hi2 - lo2 - 1;
      if (cnt2 < 2 || cnt2 > 9) continue;

      A = A2; B = B2; C = C2; D = D2; lo = lo2; hi = hi2; cnt = cnt2;
      break;
    }

    const between: number[] = [];
    for (let n = lo + 1; n < hi; n++) between.push(n);

    const explanation: MathExpr = [
      txt(`먼저 두 식을 계산해요. `),
      txt(`${A}+${B}=${lo}, ${C}−${D}=${hi}. `),
      txt(`${lo}보다 크고 ${hi}보다 작은 두 자리 수: ${between.join(', ')}. `),
      txt(`모두 ${cnt}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `(${A}+${B})보다 크고 (${C}−${D})보다 작은 두 자리 수는 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [cnt],
      explanation,
    };
  },
};

/**
 * ch23-vertical  세로셈 빈칸 복원 (받아내림 포함 두 자리 덧뺄셈)
 * 완전한 식 먼저 만들고, 두 자리(㉠,㉡)를 가려서 복원
 */
const chVertical: SkillDef = {
  id: 'ch21-vertical',
  unitId: 'unitAddSub2',
  title: '세로셈 빈칸 복원',
  note: '받아내림/올림 있는 두 자리 ± 두 자리, 2칸 복원',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백 (받아내림 있는 뺄셈: 75-38=37, ㉠=7, ㉡=3)
    let isAdd = false;
    let a = 75, b = 38, result = 37;
    let hidden1 = 7, hidden2 = 3; // ㉠=십의 자리 of a, ㉡=일의 자리 of b

    for (let tries = 0; tries < 2000; tries++) {
      const doAdd = rng.chance(0.5);
      let a2: number, b2: number, res: number;

      if (doAdd) {
        // 받아올림 있는 두 자리 덧셈
        a2 = rng.int(10, 89);
        b2 = rng.int(10, 89);
        res = a2 + b2;
        if (res < 10 || res > 99) continue; // 결과도 두 자리
        // 받아올림 확인: 일의 자리 합이 10 이상
        if ((a2 % 10 + b2 % 10) < 10) continue;
      } else {
        // 받아내림 있는 두 자리 뺄셈
        a2 = rng.int(21, 99);
        b2 = rng.int(10, a2 - 1);
        res = a2 - b2;
        if (res < 10) continue; // 결과 두 자리 이상
        // 받아내림 확인: 일의 자리가 b > a
        if ((a2 % 10) >= (b2 % 10)) continue;
      }

      // 숨길 자리 선택: ㉠=a의 십의 자리, ㉡=b의 일의 자리
      const h1 = Math.floor(a2 / 10);
      const h2 = b2 % 10;
      if (h1 === 0 || h2 === 0) continue;

      isAdd = doAdd;
      a = a2; b = b2; result = res;
      hidden1 = h1; hidden2 = h2;
      break;
    }

    const op = isAdd ? '+' : '−';

    // ㉠ = 십의 자리 of a, ㉡ = 일의 자리 of b
    const aOnesDigit = a % 10;
    const bTensDigit = Math.floor(b / 10);

    const explanation: MathExpr = [
      txt(`세로셈을 일의 자리부터 계산해요. `),
      isAdd
        ? txt(`일의 자리: ${aOnesDigit}+${hidden2}=${aOnesDigit + hidden2}이므로 받아올림 발생. `)
        : txt(`일의 자리: ${aOnesDigit}에서 ${hidden2}을(를) 빼려면 받아내림 필요. `),
      txt(`십의 자리: ㉠=${hidden1}, ㉡의 십의 자리=${bTensDigit}. `),
      txt(`따라서 ㉠=${hidden1}, ㉡=${ida(hidden2)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `세로셈의 빈칸 ㉠과 ㉡에 들어갈 숫자를 구하세요.\n  ${Math.floor(a / 10) === hidden1 ? '㉠' : Math.floor(a / 10)}${aOnesDigit}\n${op} ${bTensDigit}${b % 10 === hidden2 ? '㉡' : b % 10}\n──────\n  ${result}`,
      expr: [txt('㉠ = '), blank(0), txt('  ㉡ = '), blank(1)],
      blankAnswers: [hidden1, hidden2],
      explanation,
    };
  },
};

/**
 * ch23-symbol  기호 연립 (대입으로 값 구하기)
 * ▲+●+●=S, ◆−▲=D, ●=p → ◆ 구하기
 */
const chSymbol: SkillDef = {
  id: 'ch21-symbol',
  unitId: 'unitAddSub2',
  title: '기호 연립 대입',
  note: '●=p → ▲=S-2p → ◆=▲+D, 모두 양의 정수 두 자리 이내',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: ●=3, ▲=7, ◆=12 (S=13, D=5)
    let p = 3, tri = 7, dia = 12, S = 13, D = 5;

    for (let tries = 0; tries < 2000; tries++) {
      const p2 = rng.int(2, 9);
      const tri2 = rng.int(2, 15);
      const S2 = tri2 + 2 * p2;
      const D2 = rng.int(1, 10);
      const dia2 = tri2 + D2;
      if (S2 > 30 || dia2 > 30) continue;
      if (tri2 <= 0 || dia2 <= 0) continue;
      p = p2; tri = tri2; dia = dia2; S = S2; D = D2;
      break;
    }

    const explanation: MathExpr = [
      txt(`●=${p}임을 이용해요. `),
      txt(`▲+●+● = ${S}에서 ▲+${p}+${p}=${S}, ▲=${S}−${2 * p}=${ida(tri)}. `),
      txt(`◆−▲=${D}에서 ◆=${tri}+${D}=${ida(dia)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `▲+●+● = ${S}, ◆−▲ = ${D}, ● = ${p}일 때 ◆는 얼마인가요?`,
      expr: [txt('◆ = '), blank(0)],
      blankAnswers: [dia],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitLength2 — 길이 재기
// ═══════════════════════════════════════════════════════════════

/**
 * ch24-iterate  단위 길이 환산 (몇 번)
 * A 1개의 길이가 B로 m번, A k개의 길이는 B로 몇 번?
 */
const chIterate: SkillDef = {
  id: 'ch21-iterate',
  unitId: 'unitLength2',
  title: '단위 반복 길이 환산',
  note: 'm,k=2~9, 곱≤81',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const units = [
      { a: '연필', b: '클립' },
      { a: '지우개', b: '동전' },
      { a: '책', b: '연필' },
      { a: '자', b: '지우개' },
      { a: '가위', b: '클립' },
    ];

    const unit = rng.pick(units);
    let m = 2, k = 2, ans = 4;

    for (let tries = 0; tries < 2000; tries++) {
      const m2 = rng.int(2, 9);
      const k2 = rng.int(2, 9);
      if (m2 * k2 > 81) continue;
      m = m2; k = k2; ans = m * k;
      break;
    }

    const explanation: MathExpr = [
      txt(`${unit.a} 1개의 길이가 ${unit.b}로 ${m}번이에요. `),
      txt(`${unit.a} ${k}개의 길이는 ${unit.b}로 ${m}번을 ${k}번 더한 것과 같아요. `),
      txt(`${m} × ${k} = ${ans}${ida('번')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${unit.a} 1개의 길이가 ${unit.b}로 ${m}번입니다. ${unit.a} ${k}개의 길이는 ${unit.b}로 몇 번인가요?`,
      expr: [blank(0), txt(' 번')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch24-diff  단위 반복 길이의 차
 * 두 사람의 걸음 길이 차이 또는 1cm 횟수 차이
 */
const chDiff: SkillDef = {
  id: 'ch21-diff',
  unitId: 'unitLength2',
  title: '반복 길이의 차',
  note: '걸음 변형 또는 cm 횟수 변형 랜덤, 결과 양수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const variant = rng.chance(0.5);

    if (variant) {
      // 걸음 변형: 한 걸음 a cm인 사람이 n걸음, 한 걸음 b cm인 사람이 n걸음
      let a = 0, b = 0, n = 0, ans = 0;
      for (let tries = 0; tries < 2000; tries++) {
        const a2 = rng.int(50, 90);
        const b2 = rng.int(30, a2 - 5);
        const n2 = rng.int(2, 9);
        const diff = n2 * (a2 - b2);
        if (diff <= 0) continue;
        a = a2; b = b2; n = n2; ans = diff;
        break;
      }
      if (ans === 0) { a = 70; b = 50; n = 3; ans = 60; }

      const names = [['가', '나'], ['민준', '서아'], ['지호', '수빈']];
      const [name1, name2] = rng.pick(names);

      const explanation: MathExpr = [
        txt(`${name1}의 ${n}걸음: ${a}×${n}=${a * n} cm. `),
        txt(`${name2}의 ${n}걸음: ${b}×${n}=${b * n} cm. `),
        txt(`차: ${a * n}−${b * n}=${ida(ans)} cm.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `한 걸음이 ${a} cm인 ${name1}이(가) ${n}걸음, 한 걸음이 ${b} cm인 ${name2}이(가) ${n}걸음 걸었습니다. 두 사람이 걸은 길이의 차는 몇 cm인가요?`,
        expr: [blank(0), txt(' cm')],
        blankAnswers: [ans],
        explanation,
      };
    } else {
      // cm 횟수 변형: ㉮가 p번, ㉯가 q번 → 차 = p-q cm
      let p = 0, q = 0, ans = 0;
      for (let tries = 0; tries < 2000; tries++) {
        const p2 = rng.int(5, 20);
        const q2 = rng.int(2, p2 - 1);
        const diff = p2 - q2;
        if (diff <= 0) continue;
        p = p2; q = q2; ans = diff;
        break;
      }
      if (ans === 0) { p = 15; q = 8; ans = 7; }

      const explanation: MathExpr = [
        txt(`1 cm짜리 막대가 ㉮에는 ${p}번, ㉯에는 ${q}번 들어가요. `),
        txt(`㉮의 길이: ${p} cm, ㉯의 길이: ${q} cm. `),
        txt(`차: ${p}−${q}=${ida(ans)} cm.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `1 cm짜리 막대로 재었더니 ㉮의 길이는 ${p}번, ㉯의 길이는 ${q}번이었습니다. ㉮와 ㉯의 길이의 차는 몇 cm인가요?`,
        expr: [blank(0), txt(' cm')],
        blankAnswers: [ans],
        explanation,
      };
    }
  },
};

/**
 * ch24-wire  철사로 직사각형 만들기 (네 변 합)
 * 가로 a cm, 세로 b cm, 사용한 철사 = a+b+a+b
 */
const chWire: SkillDef = {
  id: 'ch21-wire',
  unitId: 'unitLength2',
  title: '철사로 직사각형 만들기',
  note: 'a,b=2~12, 답=2(a+b)',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    let a = 5, b = 3;
    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(2, 12);
      const b2 = rng.int(2, 12);
      if (a2 === b2) continue;
      a = a2; b = b2;
      break;
    }
    const ans = a + b + a + b;

    const explanation: MathExpr = [
      txt(`직사각형의 네 변: 가로 ${a} cm, 세로 ${b} cm, 가로 ${a} cm, 세로 ${b} cm. `),
      txt(`네 변을 모두 더하면 ${a}+${b}+${a}+${b}=${ida(ans)} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `철사를 구부려 가로 ${a} cm, 세로 ${b} cm인 직사각형을 만들었습니다. 사용한 철사는 몇 cm인가요?`,
      expr: [blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitClassify — 분류하기
// ═══════════════════════════════════════════════════════════════

// 이모지 풀: 종류별
const EMOJI_SETS: Record<string, string[]> = {
  과일: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🍉'],
  곤충: ['🐝', '🦋', '🐛', '🐞', '🦗', '🐜', '🦟'],
  탈것: ['🚗', '🚌', '🚂', '✈️', '🚢', '🚲', '🛵'],
  동물: ['🐶', '🐱', '🐰', '🐸', '🦊', '🐼', '🐨'],
};

/**
 * ch25-count-diff  분류 후 최다−최소 개수의 차
 * 12~16개 이모지, 3~4종류 중 무작위 배치
 */
const chCountDiff: SkillDef = {
  id: 'ch21-countdiff',
  unitId: 'unitClassify',
  title: '분류 후 최다−최소 개수 차',
  note: '이모지 12~16개, 3~4종류, 차≥1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const categoryNames = Object.keys(EMOJI_SETS);

    // 폴백
    let categories: string[] = ['과일', '곤충'];
    let counts: number[] = [7, 6];
    let items: string[] = [];
    let answerVal = 1;

    for (let tries = 0; tries < 2000; tries++) {
      const numCats = rng.int(3, 4);
      // 랜덤으로 카테고리 선택
      const shuffled = [...categoryNames];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = rng.int(0, i);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const cats = shuffled.slice(0, numCats);

      const total = rng.int(12, 16);
      // 각 종류에 최소 1개씩 배분
      const cnts: number[] = Array(numCats).fill(1);
      let remaining = total - numCats;
      for (let i = 0; i < remaining; i++) {
        cnts[rng.int(0, numCats - 1)]++;
      }

      const maxCnt = Math.max(...cnts);
      const minCnt = Math.min(...cnts);
      const diff = maxCnt - minCnt;
      if (diff < 1) continue;

      // 이모지 목록 생성
      const allItems: string[] = [];
      for (let c = 0; c < numCats; c++) {
        const pool = EMOJI_SETS[cats[c]];
        for (let i = 0; i < cnts[c]; i++) {
          allItems.push(pool[i % pool.length]);
        }
      }

      // 셔플
      for (let i = allItems.length - 1; i > 0; i--) {
        const j = rng.int(0, i);
        [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
      }

      categories = cats;
      counts = cnts;
      items = allItems;
      answerVal = diff;
      break;
    }

    if (items.length === 0) {
      // 폴백
      items = ['🍎', '🍊', '🍋', '🐝', '🦋', '🐛', '🚗', '🚌', '🍎', '🍊', '🐝', '🚗'];
      categories = ['과일', '곤충', '탈것'];
      counts = [4, 3, 4]; // 실제 위 목록 기준과 무관하게 폴백
      answerVal = 1;
    }

    // 종류별 설명
    const catSummary = categories.map((c, i) => `${c} ${counts[i]}개`).join(', ');

    const explanation: MathExpr = [
      txt(`종류별로 분류하면: ${catSummary}. `),
      txt(`가장 많은 것: ${Math.max(...counts)}개, 가장 적은 것: ${Math.min(...counts)}개. `),
      txt(`차: ${Math.max(...counts)}−${Math.min(...counts)}=${answerVal}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 목록을 종류별로 분류했을 때, 가장 많은 것과 가장 적은 것의 수의 차는 몇 개인가요?\n${items.join(' ')}`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [answerVal],
      explanation,
    };
  },
};

/**
 * ch25-two-attr  두 기준 동시 만족 개수
 * 항목마다 (모양, 색) 두 속성, 두 조건 교집합
 */
const chTwoAttr: SkillDef = {
  id: 'ch21-twoattr',
  unitId: 'unitClassify',
  title: '두 기준 동시 만족 개수',
  note: '색+모양 두 속성 교집합, 답≥1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const colors = ['빨간', '파란', '노란', '초록'];
    const shapes = ['원', '삼각형', '사각형', '별'];
    // 이모지 매핑 (색+모양)
    const colorEmoji: Record<string, string> = {
      빨간: '🔴', 파란: '🔵', 노란: '🟡', 초록: '🟢',
    };
    const shapeEmoji: Record<string, string> = {
      원: '⭕', 삼각형: '🔺', 사각형: '🟥', 별: '⭐',
    };

    // 폴백
    let targetColor = '빨간';
    let targetShape = '원';
    let answerVal = 2;
    let promptItems: string[] = [];

    for (let tries = 0; tries < 2000; tries++) {
      const numItems = rng.int(10, 16);
      const tc = rng.pick(colors);
      const ts = rng.pick(shapes);

      // 각 항목 생성
      const generatedItems: Array<{ color: string; shape: string }> = [];
      for (let i = 0; i < numItems; i++) {
        generatedItems.push({
          color: rng.pick(colors),
          shape: rng.pick(shapes),
        });
      }

      // 두 조건 모두 만족 개수
      const cnt = generatedItems.filter(
        (item) => item.color === tc && item.shape === ts
      ).length;

      if (cnt < 1) continue;

      targetColor = tc;
      targetShape = ts;
      answerVal = cnt;
      promptItems = generatedItems.map(
        (item) => `${colorEmoji[item.color] ?? item.color}${shapeEmoji[item.shape] ?? item.shape}`
      );
      break;
    }

    if (promptItems.length === 0) {
      // 폴백 직접 구성
      promptItems = ['🔴⭕', '🔵🔺', '🔴⭕', '🟡🟥', '🔵⭕', '🔴⭕', '🟢⭐', '🔵🟥', '🟡🔺', '🔴🟥'];
      targetColor = '빨간'; targetShape = '원'; answerVal = 3;
    }

    const explanation: MathExpr = [
      txt(`${targetColor} 색이면서 ${targetShape} 모양인 것을 찾아요. `),
      txt(`목록에서 두 조건을 모두 만족하는 것: ${answerVal}개.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 도형 목록에서 ${targetColor} 색이면서 ${targetShape} 모양인 것은 몇 개인가요?\n${promptItems.join(' ')}`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [answerVal],
      explanation,
    };
  },
};

/**
 * ch25-relation  분류표 관계식으로 미지수 구하기
 * 다리 없음 x마리, 2개 y마리, 4개 z마리. 전체=N, 어떤 두 그룹 차=k
 */
const chRelation: SkillDef = {
  id: 'ch21-relation',
  unitId: 'unitClassify',
  title: '분류표 관계식으로 미지수 구하기',
  note: '합+차 조건, 정수해 유일',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const LABELS = ['다리가 없는 동물', '다리가 2개인 동물', '다리가 4개인 동물'];

    // 한 그룹(shown)의 값을 공개하고, 나머지 두 그룹의 차를 주어,
    // 나머지 두 그룹 중 하나(ask)를 묻는다 → 항상 유일하게 풀린다.
    // 폴백: 전체 21, 다리없음 8 공개, (2개)−(4개)=차, 2개를 물음
    let N = 21, shownIdx = 0, shownVal = 8;
    let bigIdx = 1, smallIdx = 2, diff = 2, askIdx = 1, ans = 7;

    for (let tries = 0; tries < 2000; tries++) {
      const v = [rng.int(2, 9), rng.int(2, 9), rng.int(2, 9)];
      const N2 = v[0] + v[1] + v[2];
      if (N2 < 8 || N2 > 24) continue;

      const sIdx = rng.int(0, 2);
      const others = [0, 1, 2].filter((i) => i !== sIdx);
      // 큰 그룹 / 작은 그룹
      const [bi, si] = v[others[0]] >= v[others[1]] ? [others[0], others[1]] : [others[1], others[0]];
      const d = v[bi] - v[si];
      if (d < 1) continue; // 차가 1 이상이어야 "더 많다"가 성립

      const aIdx = rng.chance(0.5) ? bi : si;

      N = N2; shownIdx = sIdx; shownVal = v[sIdx];
      bigIdx = bi; smallIdx = si; diff = d; askIdx = aIdx; ans = v[aIdx];
      break;
    }

    const pairSum = N - shownVal; // 나머지 두 그룹의 합
    const bigVal = (pairSum + diff) / 2;
    const smallVal = (pairSum - diff) / 2;

    const explanation: MathExpr = [
      txt(`전체 ${N}마리 중 ${LABELS[shownIdx]}이(가) ${shownVal}마리이므로, `),
      txt(`나머지 두 무리(${LABELS[bigIdx]}, ${LABELS[smallIdx]})의 합은 ${N}−${shownVal}=${pairSum}마리예요. `),
      txt(`${LABELS[bigIdx]}이(가) ${diff}마리 더 많으니, 차 ${nj(diff, '을/를')} 빼고 반으로 나누면 적은 쪽이 ${smallVal}마리, 더하면 많은 쪽이 ${bigVal}마리예요. `),
      txt(`따라서 ${LABELS[askIdx]}은 ${ans}${ida('마리')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `동물원 동물 ${N}마리를 다리 수로 분류했습니다. ${LABELS[shownIdx]}은 ${shownVal}마리입니다. ${LABELS[bigIdx]}이(가) ${LABELS[smallIdx]}보다 ${diff}마리 더 많을 때, ${LABELS[askIdx]}은 몇 마리인가요?`,
      expr: [blank(0), txt(' 마리')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitMulIntro — 곱셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch26-array  배열 곱셈 / 묶음 역산
 * (a) 한 상자 r개씩 c줄, b상자 → r×c×b
 * (b) 역산: g개씩 묶으면 몇 묶음?
 */
const chArray: SkillDef = {
  id: 'ch21-array',
  unitId: 'unitMulIntro',
  title: '배열 곱셈 / 묶음 역산',
  note: '정방향 r×c×b 또는 역산 T/g, 각 ≤6, 답 양수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const variant = rng.chance(0.5);

    if (variant) {
      // (a) 정방향: 한 상자에 r개씩 c줄, b상자
      let r = 2, c = 3, b = 2, ans = 12;
      for (let tries = 0; tries < 2000; tries++) {
        const r2 = rng.int(2, 6);
        const c2 = rng.int(2, 6);
        const b2 = rng.int(2, 4);
        const product = r2 * c2 * b2;
        if (product > 72) continue;
        r = r2; c = c2; b = b2; ans = product;
        break;
      }

      const items = ['구슬', '사탕', '쿠키', '카드', '딱지', '스티커'];
      const item = rng.pick(items);

      const explanation: MathExpr = [
        txt(`한 줄에 ${r}개씩 ${c}줄이면 한 상자에 ${r}×${c}=${r * c}개. `),
        txt(`${b}상자이면 ${r * c}×${b}=${ans}${ida('개')}.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `한 상자에 ${item}을(를) ${r}개씩 ${c}줄로 담고, 이런 상자가 ${b}개 있습니다. ${item}은(는) 모두 몇 개인가요?`,
        expr: [blank(0), txt(' 개')],
        blankAnswers: [ans],
        explanation,
      };
    } else {
      // (b) 역산: g씩 묶으면 몇 묶음?
      let g = 3, T = 18, ans = 6;
      for (let tries = 0; tries < 2000; tries++) {
        const g2 = rng.int(2, 6);
        const ans2 = rng.int(2, 9);
        const T2 = g2 * ans2;
        if (T2 > 54) continue;
        g = g2; T = T2; ans = ans2;
        break;
      }

      const instruments = ['기타', '바이올린', '피아노'];
      const instrument = rng.pick(instruments);

      const explanation: MathExpr = [
        txt(`${instrument}의 줄이 전체 ${T}개예요. `),
        txt(`${g}개씩 묶으면 ${g}×□=${T}, □=${ans}${ida('묶음')}.`),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${instrument} 1대에 줄이 ${g}개 있습니다. 전체 줄이 ${T}개일 때 ${instrument}는 몇 대인가요?`,
        expr: [blank(0), txt(' 대')],
        blankAnswers: [ans],
        explanation,
      };
    }
  },
};

/**
 * ch26-leftover  만들고 나눠 주고 남은 수
 * 사탕 p×q개에서 r×s개 나눠 주고 남은 것
 */
const chLeftover: SkillDef = {
  id: 'ch21-leftover',
  unitId: 'unitMulIntro',
  title: '만들고 나눠 주고 남은 수',
  note: 'p×q − r×s > 0, 두 곱 모두 두 자리 이하',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let p = 4, q = 5, r = 3, s = 4, ans = 8;

    for (let tries = 0; tries < 2000; tries++) {
      const p2 = rng.int(2, 9);
      const q2 = rng.int(2, 9);
      const total = p2 * q2;
      if (total > 60) continue;

      const r2 = rng.int(2, 6);
      const s2 = rng.int(2, 6);
      const given = r2 * s2;
      if (given >= total) continue;

      const rem = total - given;
      if (rem < 1) continue;

      p = p2; q = q2; r = r2; s = s2; ans = rem;
      break;
    }

    const explanation: MathExpr = [
      txt(`전체 사탕: ${p}×${q}=${p * q}개. `),
      txt(`나눠 준 사탕: ${r}×${s}=${r * s}개. `),
      txt(`남은 사탕: ${p * q}−${r * s}=${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 봉지에 사탕이 ${p}개씩 ${q}봉지 있습니다. 이 사탕을 ${r}개씩 ${s}명에게 나눠 주었을 때 남은 사탕은 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch26-combo  옷 조합 (몇 가지 방법)
 * 윗옷 m가지 × 치마 n가지 = m×n가지
 */
const chCombo: SkillDef = {
  id: 'ch21-combo',
  unitId: 'unitMulIntro',
  title: '옷 조합 경우의 수',
  note: 'm,n=2~6, 답=m×n',
  difficulty: 3,
  challenge: true,
  minVariety: 25,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const m = rng.int(2, 6);
    const n = rng.int(2, 6);
    const ans = m * n;

    const explanation: MathExpr = [
      txt(`윗옷 1가지마다 치마 ${n}가지를 짝지을 수 있어요. `),
      txt(`윗옷이 ${m}가지이므로 ${n}씩 ${m}묶음: ${n}×${m}=${ans}${ida('가지')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `윗옷 ${m}가지와 치마 ${n}가지를 짝지어 입는 방법은 모두 몇 가지인가요?`,
      expr: [blank(0), txt(' 가지')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  내보내기
// ═══════════════════════════════════════════════════════════════

export const challengeG2S1Skills: SkillDef[] = [
  // unitNum3d
  chCard,
  chCoin,
  chCond,
  // unitFigure2
  chSide,
  chSquareRow,
  chFold,
  // unitAddSub2
  chBetween,
  chVertical,
  chSymbol,
  // unitLength2
  chIterate,
  chDiff,
  chWire,
  // unitClassify
  chCountDiff,
  chTwoAttr,
  chRelation,
  // unitMulIntro
  chArray,
  chLeftover,
  chCombo,
];
