/**
 * 5-1 심화 문제 생성기 (challenge: true, difficulty: 3)
 * 명세: docs/challenge/g5s1.md
 */

import { RNG } from '../rng';
import {
  gcd,
  lcm,
  add,
  sub,
  simplify,
  toMixed,
  isIrreducible,
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
//  unitMix — 자연수의 혼합 계산
// ═══════════════════════════════════════════════════════════════

/**
 * ch51-promise  약속 연산
 * "가★나 = 가×나−가" 등 정의 4종, (a★b)★c 계산
 */
const chPromise: SkillDef = {
  id: 'ch51-promise',
  unitId: 'unitMix',
  title: '약속 연산 두 단계',
  note: '연산 정의 4종 중 하나, (a★b)★c, 중간·최종 자연수·양수 역산 보장',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 연산 정의 4종
    const defs = [
      {
        name: '가★나 = 가×나−가',
        fn: (x: number, y: number) => x * y - x,
        label: (a: string, b: string) => `${a}×${b}−${a}`,
      },
      {
        name: '가★나 = 가×(가−나)',
        fn: (x: number, y: number) => x * (x - y),
        label: (a: string, b: string) => `${a}×(${a}−${b})`,
      },
      {
        name: '가★나 = 가+나×2',
        fn: (x: number, y: number) => x + y * 2,
        label: (a: string, b: string) => `${a}+${b}×2`,
      },
      {
        name: '가★나 = (가+나)×나',
        fn: (x: number, y: number) => (x + y) * y,
        label: (a: string, b: string) => `(${a}+${b})×${b}`,
      },
    ];

    const def = rng.pick(defs);

    // 파라미터 역산: 중간값·최종값 모두 자연수·양수
    let a: number, b: number, c: number, mid: number, final: number;
    let tries = 0;
    do {
      a = rng.int(2, 9);
      b = rng.int(2, 9);
      c = rng.int(2, 9);
      mid = def.fn(a, b);
      final = def.fn(mid, c);
      tries++;
      if (tries > 2000) { a = 3; b = 2; c = 2; mid = def.fn(a, b); final = def.fn(mid, c); break; }
    } while (mid <= 0 || !Number.isInteger(mid) || final <= 0 || !Number.isInteger(final));

    const expr: MathExpr = [
      txt(`(${a}★${b})★${c}`)
    ];

    const explanation: MathExpr = [
      txt(`약속한 연산 정의에 따라 가★나 = ${def.label('가', '나')}예요. `),
      txt(`먼저 안쪽을 계산해요. `),
      txt(`${a}★${b} = ${def.label(String(a), String(b))} = ${mid}. `),
      txt(`이제 바깥쪽을 계산해요. `),
      txt(`${mid}★${c} = ${def.label(String(mid), String(c))} = ${final}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 약속을 보고 (${a}★${b})★${c}${nj(final, '을/를')} 구하세요.`,
      expr: [txt(`${def.name},  `), ...expr, txt(' = '), blank(0)],
      blankAnswers: [final],
      explanation,
    };
  },
};

/**
 * ch51-op-place  기호 배치 최대값
 * a □ b □ c □ d에 +, −, × 한 번씩, 연산 순서 적용해 최대값
 */
const chOpPlace: SkillDef = {
  id: 'ch51-op-place',
  unitId: 'unitMix',
  title: '기호 배치 최대값',
  note: '+,−,× 6가지 순열 계산, 모든 배치 자연수·양수 보장',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 연산자 순열 6가지
    const perms: Array<['+' | '-' | '*', '+' | '-' | '*', '+' | '-' | '*']> = [
      ['+', '-', '*'], ['+', '*', '-'],
      ['-', '+', '*'], ['-', '*', '+'],
      ['*', '+', '-'], ['*', '-', '+'],
    ];

    /** 연산 순서(×우선)를 적용해 a op1 b op2 c op3 d를 계산 */
    function evalWithPrecedence(
      a: number, b: number, c: number, d: number,
      ops: ['+' | '-' | '*', '+' | '-' | '*', '+' | '-' | '*']
    ): number {
      // 피연산자·연산자 배열로 만들고, × 먼저 처리
      const nums: number[] = [a, b, c, d];
      const opsArr: ('+' | '-' | '*')[] = [...ops];

      // × 우선 처리
      for (let i = opsArr.length - 1; i >= 0; i--) {
        if (opsArr[i] === '*') {
          const product = nums[i] * nums[i + 1];
          nums.splice(i, 2, product);
          opsArr.splice(i, 1);
        }
      }
      // 남은 +/- 왼쪽부터
      let result = nums[0];
      for (let i = 0; i < opsArr.length; i++) {
        result = opsArr[i] === '+' ? result + nums[i + 1] : result - nums[i + 1];
      }
      return result;
    }

    let a: number, b: number, c: number, d: number, best: number;
    let tries = 0;
    outer: for (;;) {
      a = rng.int(2, 9);
      b = rng.int(2, 9);
      c = rng.int(2, 9);
      d = rng.int(2, 9);
      tries++;
      if (tries > 3000) { a = 3; b = 4; c = 2; d = 5; }
      // 모든 순열에서 중간값·최종값이 자연수·양수인지 확인
      for (const perm of perms) {
        const v = evalWithPrecedence(a, b, c, d, perm);
        if (!Number.isInteger(v) || v <= 0) continue outer;
        // × 앞뒤 곱 중간값도 검사
        const nums2: number[] = [a, b, c, d];
        const ops2 = [...perm];
        for (let i = ops2.length - 1; i >= 0; i--) {
          if (ops2[i] === '*') {
            const mid2 = nums2[i] * nums2[i + 1];
            if (mid2 <= 0 || !Number.isInteger(mid2)) continue outer;
            nums2.splice(i, 2, mid2);
            ops2.splice(i, 1);
          }
        }
      }
      // 최대값 계산
      best = Math.max(...perms.map(p => evalWithPrecedence(a, b, c, d, p)));
      break;
    }

    const opSymbol = (op: '+' | '-' | '*') => op === '*' ? '×' : op;
    const allResults = perms.map(p => {
      const val = evalWithPrecedence(a, b, c, d, p);
      return `${a}${opSymbol(p[0])}${b}${opSymbol(p[1])}${c}${opSymbol(p[2])}${d}=${val}`;
    });

    const explanation: MathExpr = [
      txt('+, −, ×를 한 번씩 넣는 방법은 6가지예요. ×는 +, −보다 먼저 계산해요. '),
      txt('모든 경우: '),
      txt(allResults.join(' / ')),
      txt(`  가장 큰 값은 ${ida(best)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${a} □ ${b} □ ${c} □ ${d}에 +, −, ×를 한 번씩 넣어 만들 수 있는 가장 큰 값을 구하세요. (×는 +, −보다 먼저 계산해요)`,
      expr: [txt(`${a} □ ${b} □ ${c} □ ${d} 의 최댓값 = `), blank(0)],
      blankAnswers: [best],
      explanation,
    };
  },
};

/**
 * ch51-ineq  부등식 최대 자연수
 * (A−B)÷C×D > E×□  에서 □의 최대 자연수
 */
const chIneq: SkillDef = {
  id: 'ch51-ineq',
  unitId: 'unitMix',
  title: '부등식에서 □ 최대 자연수',
  note: '(A−B)÷C×D > E×□, 좌변 자연수 보장, 답 ≥ 1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    let A: number, B: number, C: number, D: number, E: number, lhs: number, ans: number;
    let tries = 0;
    do {
      // (A−B)이 C의 배수가 되도록 역산
      C = rng.int(2, 6);
      const diff = C * rng.int(2, 8); // C의 배수
      B = rng.int(2, 8);
      A = diff + B;
      D = rng.int(2, 6);
      E = rng.int(2, 8);
      lhs = (A - B) / C * D; // 자연수 보장
      // □의 최대값 = floor(lhs/E - ε) = ceil(lhs/E) - 1
      ans = Math.ceil(lhs / E) - 1;
      tries++;
      if (tries > 2000) { C = 3; B = 2; A = 8; D = 3; E = 4; lhs = (A - B) / C * D; ans = Math.ceil(lhs / E) - 1; break; }
    } while (!Number.isInteger(lhs) || lhs <= 0 || ans < 1);

    const explanation: MathExpr = [
      txt(`먼저 좌변을 계산해요. `),
      txt(`(${A}−${B})÷${C}×${D} = ${A - B}÷${C}×${D} = ${(A - B) / C}×${D} = ${lhs}. `),
      txt(`부등식은 ${lhs} > ${E}×□가 돼요. ${E}×□가 ${lhs}보다 작아야 해요. `),
      txt(`${E}×${ans} = ${E * ans}(은)는 ${lhs}보다 작고, ${E}×${ans + 1} = ${E * (ans + 1)}(은)는 ${lhs}보다 작지 않아요. `),
      txt(`따라서 □에 들어갈 수 있는 가장 큰 자연수는 ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `부등식 (${A}−${B})÷${C}×${D} > ${E}×□를 만족하는 □에 들어갈 수 있는 가장 큰 자연수를 구하세요.`,
      expr: [txt(`(${A}−${B})÷${C}×${D} > ${E}×□, □ 최대 = `), blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitDiv — 약수와 배수
// ═══════════════════════════════════════════════════════════════

/**
 * ch51-gcdlcm  역산 — 최대공약수·최소공배수로 두 수 구하기
 * G, L 주어질 때 두 수(작은 수, 큰 수) fill-blanks 2칸
 */
const chGcdLcm: SkillDef = {
  id: 'ch51-gcdlcm',
  unitId: 'unitDiv',
  title: '최대공약수·최소공배수로 두 수 구하기',
  note: 'G·(p,q 서로소 소수쌍), L=G·p·q, 유일 해 보장',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 소수 목록 (작은 것부터)
    const primes = [2, 3, 5, 7, 11, 13];

    // 두 수를 모두 '두 자리 수'로 제약 → (G×1, G×p×q) 대안 쌍은 큰 수가 세 자리(=L≥100)라
    // 제외되어 (G×p, G×q)가 유일한 답이 된다.
    let G: number, p: number, q: number, small: number, large: number, L: number;
    let tries = 0;
    do {
      G = rng.int(2, 12);
      // p < q, 둘 다 소수 → 서로소 & 유일 분해 보장
      const pi = rng.int(0, primes.length - 2);
      p = primes[pi];
      q = primes[rng.int(pi + 1, primes.length - 1)];
      small = G * p;
      large = G * q;
      L = G * p * q;
      tries++;
      if (tries > 2000) { G = 3; p = 5; q = 7; small = 15; large = 21; L = 105; break; }
    } while (small < 10 || large > 99 || L < 100 || small === large);

    const explanation: MathExpr = [
      txt(`두 수는 모두 최대공약수 ${G}의 배수이고, ${G}×㉮, ${G}×㉯ (㉮<㉯, ㉮와 ㉯는 서로소)로 나타낼 수 있어요. `),
      txt(`최소공배수 = ${G}×㉮×㉯ = ${L}이므로 ㉮×㉯ = ${L}÷${G} = ${p * q}이에요. `),
      txt(`㉮×㉯ = ${nj(p * q, '이/가')} 되는 서로소인 쌍은 (1, ${p * q})와 (${p}, ${q})가 있어요. `),
      txt(`(1, ${p * q})이면 두 수가 ${nj(G, '과/와')} ${L}인데 ${nj(L, '은/는')} 두 자리 수가 아니라서 제외돼요. `),
      txt(`두 수가 모두 두 자리 수인 (${p}, ${q})를 골라요. `),
      txt(`따라서 두 수는 ${G}×${p} = ${small}, ${G}×${q} = ${ida(large)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `두 자리 수인 두 자연수의 최대공약수가 ${G}, 최소공배수가 ${L}일 때, 두 수를 작은 수부터 차례로 구하세요.`,
      expr: [txt('작은 수: '), blank(0), txt('  큰 수: '), blank(1)],
      blankAnswers: [small, large],
      explanation,
    };
  },
};

/**
 * ch51-remainder  나머지 공통
 * A로 나누면 A−k, B로 나누면 B−k → 수+k가 lcm(A,B) 배수
 */
const chRemainder: SkillDef = {
  id: 'ch51-remainder',
  unitId: 'unitDiv',
  title: '나머지 조건 공통 문제',
  note: 'A로 나누면 A−k, B로 나누면 B−k 남는 수 중 N에 가장 가까운 것',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값으로 시작 — 재시도 안에서 조건을 못 맞추면 이 조합으로 출제
    let A = 4, B = 6, k = 2, L = 12, N = 50, ans = 46;
    for (let tries = 0; tries < 2000; tries++) {
      const A2 = rng.int(3, 9);
      const B2 = rng.int(3, 9);
      if (A2 === B2) continue;
      const k2 = rng.int(1, 3);
      if (k2 >= A2 || k2 >= B2) continue;
      const L2 = lcm(A2, B2);
      const N2 = rng.int(30, 120);
      // 조건 만족 수 = L·m − k (m=1,2,…)
      // N에 가장 가까운 값 선택
      const mApprox = (N2 + k2) / L2;
      const candidates: number[] = [];
      for (let m = Math.max(1, Math.floor(mApprox) - 2); m <= Math.ceil(mApprox) + 2; m++) {
        const v = L2 * m - k2;
        if (v > 0) candidates.push(v);
      }
      if (!candidates.length) continue;
      const best = candidates.reduce((acc, v) => (Math.abs(v - N2) < Math.abs(acc - N2) ? v : acc));
      if (best <= 0) continue;
      A = A2; B = B2; k = k2; L = L2; N = N2; ans = best;
      break;
    }

    const explanation: MathExpr = [
      txt(`어떤 수를 □라 하면, □를 ${A}로 나누면 ${nj(A - k, '이/가')} 남고, ${B}로 나누면 ${nj(B - k, '이/가')} 남아요. `),
      txt(`즉, □+${nj(k, '은/는')} ${A}의 배수이기도 하고 ${B}의 배수이기도 해요. `),
      txt(`${nj(A, '과/와')} ${B}의 최소공배수는 ${L}이므로, □+${k} = ${L}×(자연수)예요. `),
      txt(`조건을 만족하는 수: ${L}-${k}=${L - k}, ${2 * L}-${k}=${2 * L - k}, … `),
      txt(`이 중 ${N}에 가장 가까운 수는 ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `어떤 자연수를 ${A}로 나누면 ${nj(A - k, '이/가')} 남고, ${B}로 나누면 ${nj(B - k, '이/가')} 남습니다. 이런 수 중 ${N}에 가장 가까운 수를 구하세요.`,
      expr: [txt('가장 가까운 수 = '), blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch51-gear  톱니바퀴
 * 톱니 a개·b개 → 처음 위치로 돌아올 때까지 작은 바퀴 바퀴 수 = lcm(a,b)÷min(a,b)
 */
const chGear: SkillDef = {
  id: 'ch51-gear',
  unitId: 'unitDiv',
  title: '톱니바퀴 바퀴 수',
  note: 'lcm(a,b)÷min(a,b) = 작은 바퀴 회전 수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const pairs: Array<[number, number]> = [
      [6, 9], [8, 12], [10, 15], [6, 10], [4, 6], [9, 12], [8, 20], [6, 14], [10, 25], [12, 18],
    ];
    const [a, b] = rng.pick(pairs);
    const small = Math.min(a, b);
    const L = lcm(a, b);
    const ans = L / small;

    const explanation: MathExpr = [
      txt(`톱니 ${a}개짜리와 ${b}개짜리 톱니바퀴가 맞물려 돌아요. `),
      txt(`처음 위치로 돌아오려면 두 바퀴가 맞물린 톱니 수가 같아야 해요. `),
      txt(`${nj(a, '과/와')} ${b}의 최소공배수는 ${L}이에요. `),
      txt(`작은 바퀴(톱니 ${small}개)가 ${L}개의 톱니를 돌리면 ${L}÷${small} = ${ans}바퀴 돌아요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `톱니가 ${a}개인 바퀴와 ${b}개인 바퀴가 맞물려 돌고 있습니다. 두 바퀴가 동시에 처음 위치로 돌아올 때까지 작은 바퀴는 몇 바퀴 돌까요?`,
      expr: [txt('작은 바퀴 회전 수 = '), blank(0), txt(' 바퀴')],
      blankAnswers: [ans],
      explanation,
    };
  },
  minVariety: 10,
};

// ═══════════════════════════════════════════════════════════════
//  unitPattern — 규칙과 대응
// ═══════════════════════════════════════════════════════════════

/**
 * ch51-compose  이중 대응
 * ○=□+a, ◎=○×b, □=x → ◎ (또는 역방향)
 */
const chCompose: SkillDef = {
  id: 'ch51-compose',
  unitId: 'unitPattern',
  title: '이중 대응 계산',
  note: '○=□+a, ◎=○×b, 정방향/역방향 랜덤',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);
    const a = rng.int(2, 10);
    const b = rng.int(2, 8);
    const forward = rng.chance(0.5);

    let prompt: string;
    let expr: MathExpr;
    let ans: number;
    let explanation: MathExpr;

    if (forward) {
      const x = rng.int(2, 15);
      const circle = x + a;
      ans = circle * b;
      prompt = `○=□+${a}, ◎=○×${b}일 때, □=${x}이면 ◎는 얼마인가요?`;
      expr = [txt(`□=${x} → ◎ = `), blank(0)];
      explanation = [
        txt(`○=□+${a}에 □=${nj(x, '을/를')} 대입하면 ○=${x}+${a}=${ida(circle)}. `),
        txt(`◎=○×${b}에 ○=${nj(circle, '을/를')} 대입하면 ◎=${circle}×${b}=${ida(ans)}.`),
      ];
    } else {
      // 역방향: ◎ 주고 □ 구하기
      // ◎ = (□+a)×b → □ = ◎/b − a, 자연수 보장
      let result: number, x: number;
      let tries = 0;
      do {
        result = b * (rng.int(3, 15) + a);
        x = result / b - a;
        tries++;
        if (tries > 500) { result = b * (5 + a); x = 5; break; }
      } while (x <= 0 || !Number.isInteger(x));
      ans = x;
      const circle = result / b;
      prompt = `○=□+${a}, ◎=○×${b}일 때, ◎=${result}이면 □는 얼마인가요?`;
      expr = [txt(`◎=${result} → □ = `), blank(0)];
      explanation = [
        txt(`◎=○×${b}에서 ○=${result}÷${b}=${ida(circle)}. `),
        txt(`○=□+${a}에서 □=${circle}−${a}=${ida(x)}.`),
      ];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch51-age  나이 N배 — 아빠 나이가 아이의 n배가 되는 건 몇 년 후?
 * x = (A−nB)/(n−1), 양의 정수 보장
 */
const chAge: SkillDef = {
  id: 'ch51-age',
  unitId: 'unitPattern',
  title: '나이 배수 문제',
  note: 'x=(A−nB)/(n−1) 양의 정수 조합만',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    let A: number, B: number, n: number, x: number;
    let tries = 0;
    do {
      n = rng.int(2, 5);
      B = rng.int(3, 12);
      A = rng.int(B + 10, 45);
      const num = A - n * B;
      const den = n - 1;
      x = num / den;
      tries++;
      if (tries > 2000) { n = 3; B = 8; A = 34; x = (A - n * B) / (n - 1); break; }
    } while (x <= 0 || !Number.isInteger(x) || A + x > 70);

    const futureA = A + x;
    const futureB = B + x;

    const explanation: MathExpr = [
      txt(`구하는 햇수를 □라고 해요. □년 후 아빠 나이는 ${A}+□, 아이 나이는 ${B}+□가 돼요. `),
      txt(`조건: ${A}+□ = ${n}×(${B}+□). `),
      txt(`괄호를 풀면 ${A}+□ = ${n * B}+${n}×□이고, 정리하면 ${n - 1}×□ = ${A}−${n * B} = ${A - n * B}. `),
      txt(`□ = ${A - n * B}÷${n - 1} = ${x}. `),
      txt(`${x}년 후 아빠 ${futureA}세, 아이 ${futureB}세 → ${nj(futureA, '은/는')} ${futureB}의 ${n}배가 맞아요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `아빠는 ${A}세, 아이는 ${B}세입니다. 아빠 나이가 아이 나이의 ${n}배가 되는 것은 몇 년 후인가요?`,
      expr: [blank(0), txt(' 년 후')],
      blankAnswers: [x],
      explanation,
    };
  },
};

/**
 * ch51-arith  등차수열
 * f, f+d, f+2d, … 에서 처음으로 X보다 커지는 수는 몇 번째?
 */
const chArith: SkillDef = {
  id: 'ch51-arith',
  unitId: 'unitPattern',
  title: '등차수열 — 처음으로 X보다 커지는 번째',
  note: '답 = ceil((X−f)/d)+1 자연수 보장',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const f = rng.int(2, 15);
    const d = rng.int(3, 9);
    const X = rng.int(f + d * 3, f + d * 12);
    // n번째 항 = f + (n-1)×d > X → n-1 > (X-f)/d → n > (X-f)/d + 1
    const ans = Math.floor((X - f) / d) + 2; // 처음으로 X보다 커지는 번째
    const ansVal = f + (ans - 1) * d;
    const prevVal = f + (ans - 2) * d;

    const explanation: MathExpr = [
      txt(`수열: ${f}, ${f + d}, ${f + 2 * d}, … (첫째 항 ${f}, 일정하게 ${d}씩 커져요). `),
      txt(`□번째 항 = ${f}+(□−1)×${d}예요. 이 값이 ${X}보다 처음 커지는 □를 찾아요. `),
      txt(`${ans - 1}번째 항은 ${prevVal}(으)로 아직 ${X}보다 크지 않고, ${ans}번째 항은 ${ansVal}(으)로 ${X}보다 커요. `),
      txt(`따라서 처음으로 ${X}보다 커지는 수는 ${ans}번째예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${f}, ${f + d}, ${f + 2 * d}, ${f + 3 * d}, …에서 처음으로 ${X}보다 커지는 수는 몇 번째인가요?`,
      expr: [blank(0), txt(' 번째')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unit1 — 약분과 통분
// ═══════════════════════════════════════════════════════════════

/**
 * ch51-frac-range  기약분수 개수
 * a/b로 기약 시 되는 분수 중 분모가 P 초과 Q 미만인 것 개수
 */
const chFracRange: SkillDef = {
  id: 'ch51-frac-range',
  unitId: 'unit1',
  title: '조건을 만족하는 기약분수 개수',
  note: 'bk 범위에서 k 개수, 2~6개',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값으로 시작 — 재시도 안에서 조건을 못 맞추면 이 조합으로 출제
    let a = 1, b = 3, P = 5, Q = 22, count = 5;
    for (let tries = 0; tries < 2000; tries++) {
      const b2 = rng.int(2, 8);
      const a2 = rng.int(1, b2 - 1);
      if (gcd(a2, b2) !== 1) continue;
      // k 범위: P < b·k < Q, 즉 P/b < k < Q/b
      const kMin = rng.int(2, 5);
      const kMax = kMin + rng.int(2, 5); // 범위 안에 2~6개
      const cnt = kMax - kMin + 1;
      if (cnt < 2 || cnt > 6) continue;
      a = a2; b = b2;
      P = b2 * kMin - 1; // P < b·kMin
      Q = b2 * kMax + 1; // b·kMax < Q
      count = cnt;
      break;
    }

    const kMin = (P + 1) / b; // P = b·kMin − 1 이므로 정수
    const kMax = (Q - 1) / b; // Q = b·kMax + 1 이므로 정수
    const explanation: MathExpr = [
      txt(`기약분수 ${a}/${nj(b, '과/와')} 크기가 같은 분수는 ${a}×□ / ${b}×□ (□=1,2,3,…)로 만들 수 있어요. `),
      txt(`분모 ${b}×□가 ${P} 초과 ${Q} 미만이 되려면, `),
      txt(`□=${kMin}이면 분모 ${b * kMin}, □=${kMax}이면 분모 ${b * kMax}로 모두 범위 안이에요. `),
      txt(`따라서 □는 ${kMin}부터 ${kMax}까지 ${count}개예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `기약분수로 나타내면 ${a}/${nj(b, '이/가')} 되는 분수 중 분모가 ${P}보다 크고 ${Q}보다 작은 것은 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [count],
      explanation,
    };
  },
};

/**
 * ch51-frac-add-same  분모·분자에 같은 수 더하기
 * a/b의 분모·분자에 □를 더해 c/d와 같아지는 □
 * □ = (a·d − b·c) / (c − d), 양의 정수 보장
 */
const chFracAddSame: SkillDef = {
  id: 'ch51-frac-add-same',
  unitId: 'unit1',
  title: '분모·분자에 같은 수 더해 같은 분수 만들기',
  note: '□=(ad−bc)/(c−d) 양의 정수 조합',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값으로 시작: (1+8)/(4+8) = 9/12 = 3/4
    let a = 1, b = 4, c = 3, d = 4, box = 8;
    for (let tries = 0; tries < 2000; tries++) {
      const b2 = rng.int(3, 12);
      const a2 = rng.int(1, b2 - 1);
      if (gcd(a2, b2) !== 1) continue;
      const box2 = rng.int(2, 15);
      // (a+□)/(b+□) = c/d, 기약으로
      const rawN = a2 + box2;
      const rawD = b2 + box2;
      const g = gcd(rawN, rawD);
      const c2 = rawN / g;
      const d2 = rawD / g;
      if (c2 - d2 >= 0) continue; // 진분수 유지 (c < d)
      a = a2; b = b2; c = c2; d = d2; box = box2;
      break;
    }

    const explanation: MathExpr = [
      txt(`${a}/${b}의 분모·분자에 같은 수 □를 더하면 (${a}+□)/(${b}+□) = ${c}/${d}. `),
      txt(`(${a}+□)×${d} = ${c}×(${b}+□). `),
      txt(`${a * d}+${d}□ = ${b * c}+${c}□ → (${d}−${c})□ = ${b * c}−${a * d} → ${d - c}□ = ${b * c - a * d}. `),
      txt(`□ = ${b * c - a * d}÷${d - c} = ${ida(box)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `분수 ${a}/${b}의 분자와 분모에 같은 수를 더하여 ${c}/${nj(d, '과/와')} 같은 분수를 만들려고 합니다. 더한 수를 구하세요.`,
      expr: [txt('더한 수 = '), blank(0)],
      blankAnswers: [box],
      explanation,
    };
  },
};

/**
 * ch51-frac-ineq  부등식 — a/b < □/N < c/d, □에 들어갈 자연수 개수
 * 통분 가능한 N, 분모 lcm ≤ 60, 개수 2~8 보장
 */
const chFracIneq: SkillDef = {
  id: 'ch51-frac-ineq',
  unitId: 'unit1',
  title: '분수 부등식에서 자연수 개수',
  note: 'a/b < □/N < c/d, lcm ≤ 60, 개수 2~8',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백값으로 시작: 1/2 < □/12 < 3/4 → 6 < □ < 9 → 7, 8 (2개)
    let a = 1, b = 2, c = 3, d = 4, N = 12, count = 2;
    let lo = 6;
    for (let tries = 0; tries < 3000; tries++) {
      const b2 = rng.int(2, 8);
      const d2 = rng.int(2, 8);
      if (b2 === d2) continue;
      const L = lcm(b2, d2);
      if (L > 30) continue;
      // N: b와 d 모두로 통분 가능하도록 lcm(b,d)의 배수들 중 선택
      const nCandidates: number[] = [];
      for (let k = 1; k * L <= 60; k++) nCandidates.push(k * L);
      if (!nCandidates.length) continue;
      const N2 = rng.pick(nCandidates);
      if (lcm(b2, lcm(d2, N2)) > 60) continue;

      const a2 = rng.int(1, b2 - 1);
      if (gcd(a2, b2) !== 1) continue;
      const c2 = rng.int(1, d2 - 1);
      if (gcd(c2, d2) !== 1) continue;

      // a/b < □/N < c/d — N이 lcm의 배수이므로 lo·hi는 항상 정수
      const lo2 = (a2 / b2) * N2; // lo < □
      const hi2 = (c2 / d2) * N2; // □ < hi
      if (lo2 >= hi2) continue;
      const cnt = Math.max(0, hi2 - 1 - (lo2 + 1) + 1);
      if (cnt < 2 || cnt > 8) continue;
      a = a2; b = b2; c = c2; d = d2; N = N2; lo = lo2; count = cnt;
      break;
    }

    const loInt = Math.floor(lo) + 1;
    const hiInt = Number.isInteger((c / d) * N) ? (c / d) * N - 1 : Math.floor((c / d) * N);

    const explanation: MathExpr = [
      txt(`${a}/${b} < □/${N} < ${c}/${nj(d, '을/를')} ${nj(N, '을/를')} 분모로 통분해요. `),
      txt(`${a}/${b} = ${a * (N / b)}/${N},  ${c}/${d} = ${c * (N / d)}/${N}. `),
      txt(`따라서 ${a * (N / b)} < □ < ${c * (N / d)}. `),
      txt(`이를 만족하는 자연수 □: ${loInt}~${hiInt}, 총 ${count}개예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${a}/${b} < □/${N} < ${c}/${nj(d, '을/를')} 만족하는 자연수 □는 모두 몇 개인가요?`,
      expr: [txt(`${a}/${b} < □/${N} < ${c}/${d}, 자연수 □의 개수 = `), blank(0)],
      blankAnswers: [count],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unit2 — 분수의 덧셈과 뺄셈 (심화)
// ═══════════════════════════════════════════════════════════════

/**
 * ch51-tape  테이프 잇기
 * 대분수 m 테이프 n장, e/f m씩 겹치게, 전체 길이
 */
const chTape: SkillDef = {
  id: 'ch51-tape',
  unitId: 'unit2',
  title: '테이프 이어 붙이기 전체 길이',
  note: 'n·L − (n-1)·overlap, 분모 ≤ 60, mixed fraction-input',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: 2와 1/2 m 테이프 3장, 1/3 m 겹침 → 15/2 − 2/3 = 41/6 = 6과 5/6
    let n = 3;
    let lenF: Frac = { n: 5, d: 2 };
    let overlapF: Frac = { n: 1, d: 3 };
    let total: Frac = { n: 41, d: 6 };
    for (let tries = 0; tries < 3000; tries++) {
      const n2 = rng.int(3, 5);
      // 길이: 대분수 1~3 + 진분수
      const lWhole = rng.int(1, 3);
      const lD = rng.int(2, 6);
      const lNOpts: number[] = [];
      for (let nn = 1; nn < lD; nn++) if (gcd(nn, lD) === 1) lNOpts.push(nn);
      if (!lNOpts.length) continue;
      const lN = rng.pick(lNOpts);
      const lenF2: Frac = { n: lWhole * lD + lN, d: lD };

      // 겹침: 단순 진분수
      const oD = rng.int(2, 8);
      const oNOpts: number[] = [];
      for (let nn = 1; nn < oD; nn++) if (gcd(nn, oD) === 1) oNOpts.push(nn);
      if (!oNOpts.length) continue;
      const overlapF2: Frac = { n: rng.pick(oNOpts), d: oD };

      // 겹침 < 길이 보장
      if (compare(overlapF2, lenF2) >= 0) continue;

      // 전체 = n·len − (n−1)·overlap
      const nLen: Frac = { n: lenF2.n * n2, d: lenF2.d };
      const nOvlp: Frac = { n: overlapF2.n * (n2 - 1), d: overlapF2.d };
      const total2 = simplify(sub(nLen, nOvlp));

      if (total2.d > 60 || total2.n <= 0) continue;
      // 정수 답 금지 (대분수 토큰 불변식: 분수부 0 < n < d)
      const tm2 = toMixed(total2);
      if (tm2.n === 0) continue;
      n = n2; lenF = lenF2; overlapF = overlapF2; total = total2;
      break;
    }

    const lenM = toMixed(lenF);
    const tm = toMixed(total);
    const answer = tm.whole === 0
      ? { n: tm.n, d: tm.d }
      : { whole: tm.whole, n: tm.n, d: tm.d };

    const explanation: MathExpr = [
      txt(`테이프 ${n}장의 합계: ${n}×`),
      { kind: 'frac', whole: lenM.whole, n: lenM.n, d: lenM.d },
      txt(` = `),
      frT({ n: lenF.n * n, d: lenF.d }),
      txt(`. 겹친 부분 ${n - 1}군데: ${n - 1}×`),
      frT(overlapF),
      txt(` = `),
      frT({ n: overlapF.n * (n - 1), d: overlapF.d }),
      txt(`. 전체 길이 = `),
      mixT(total),
      txt(' m.'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `길이가 ${nj(lenM.whole, '과/와')} ${lenM.n}/${lenM.d} m인 테이프 ${n}장을 ${overlapF.n}/${overlapF.d} m씩 겹쳐서 이어 붙였습니다. 전체 길이는 몇 m인가요? (대분수로 나타내세요)`,
      mixed: tm.whole > 0,
      requireIrreducible: true,
      answer,
      explanation,
    };
  },
};

/**
 * ch51-sumdiff  합·차로 두 수 구하기
 * ㉮+㉯=S, ㉮−㉯=D → ㉮=(S+D)/2
 */
const chSumDiff: SkillDef = {
  id: 'ch51-sumdiff',
  unitId: 'unit2',
  title: '합과 차로 두 분수 구하기',
  note: '㉮=(S+D)/2, 분모 ≤ 60, 기약 진분수/대분수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    let S: Frac, D: Frac, result: Frac;
    let tries = 0;
    for (;;) {
      // 먼저 ㉮, ㉯를 역산으로 구성
      const d1 = rng.int(2, 8);
      const d2 = rng.int(2, 8);
      const L = lcm(d1, d2);
      if (L > 20) { tries++; if (tries > 3000) break; continue; }
      const n1opts: number[] = [];
      const n2opts: number[] = [];
      for (let n = 1; n < d1; n++) if (gcd(n, d1) === 1) n1opts.push(n);
      for (let n = 1; n < d2; n++) if (gcd(n, d2) === 1) n2opts.push(n);
      if (!n1opts.length || !n2opts.length) { tries++; continue; }
      const ga: Frac = { n: rng.pick(n1opts) + rng.int(0, 2) * d1, d: d1 }; // 대분수 가능
      const na: Frac = { n: rng.pick(n2opts), d: d2 };

      if (compare(ga, na) <= 0) { tries++; continue; }

      S = simplify(add(ga, na));
      D = simplify(sub(ga, na));

      // ㉮ = (S+D)/2
      const twice = add(S, D);
      if ((twice.n * 1) % 2 !== 0 && twice.d % 2 !== 0) { tries++; continue; }
      result = simplify({ n: twice.n, d: twice.d * 2 });

      if (result.d > 60 || result.n <= 0) { tries++; continue; }
      if (S.d > 60 || D.d > 60) { tries++; continue; }
      // S·D·S+D가 정수면 대분수 토큰 불변식(분수부 0 < n < d) 위반 → 재시도
      if (toMixed(S).n === 0 || toMixed(D).n === 0 || toMixed(simplify(twice)).n === 0) { tries++; continue; }

      const rm = toMixed(result);
      // 진분수 또는 대분수 (분수부 진분수이고 기약)
      if (rm.n === 0) { tries++; continue; } // 정수 답 금지
      if (!isIrreducible({ n: rm.n, d: rm.d })) { tries++; continue; }
      break;
    }

    if (!S! || !D! || !result!) {
      // 안전 fallback
      S = { n: 5, d: 6 }; D = { n: 1, d: 6 };
      result = simplify(add(S, D)); result = simplify({ n: add(S, D).n, d: add(S, D).d * 2 });
      // ㉮ = (5/6+1/6)/2 = 1/2 → fallback to simple
      S = { n: 5, d: 4 }; D = { n: 1, d: 4 };
      result = simplify({ n: (S.n + D.n), d: S.d * 2 }); // (6/4)/2 = 3/4
    }

    const rm = toMixed(result!);
    const answer = rm.whole === 0
      ? { n: rm.n, d: rm.d }
      : { whole: rm.whole, n: rm.n, d: rm.d };

    const sM = toMixed(S!);
    const dM = toMixed(D!);

    const explanation: MathExpr = [
      txt('㉮+㉯와 ㉮−㉯를 더하면 ㉮×2가 돼요. '),
      txt('㉮×2 = '),
      mixT(S!),
      txt(' + '),
      mixT(D!),
      txt(' = '),
      mixT(add(S!, D!)),
      txt('. '),
      txt('㉮ = '),
      mixT(add(S!, D!)),
      txt(' ÷ 2 = '),
      mixT(result!),
      txt('.'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `㉮+㉯ = ${sM.whole > 0 ? nj(sM.whole, '과/와') + ' ' : ''}${sM.n}/${sM.d},  ㉮−㉯ = ${dM.n}/${dM.d}일 때 ㉮를 구하세요.`,
      mixed: rm.whole > 0,
      requireIrreducible: true,
      answer,
      explanation,
    };
  },
};

/**
 * ch51-telescope  단위분수 연속합 망원 소거
 * 1/(1×2)+1/(2×3)+…+1/(n(n+1)) = n/(n+1), n=4~9
 */
const chTelescope: SkillDef = {
  id: 'ch51-telescope',
  unitId: 'unit2',
  title: '단위분수 연속합 (망원 소거)',
  note: '1/(k(k+1)) = 1/k − 1/(k+1), 합 = n/(n+1)',
  difficulty: 3,
  challenge: true,
  minVariety: 4,
  generate(seed): Problem {
    const rng = new RNG(seed);
    // n ≤ 7: 마지막 항 분모 n(n+1) ≤ 56 (분모 ≤ 60 불변식)
    const n = rng.int(4, 7);
    const ans: Frac = simplify({ n, d: n + 1 });

    // 풀이 과정 토큰 (망원 소거)
    const telescopeSteps: MathToken[] = [];
    for (let k = 1; k <= Math.min(n, 4); k++) {
      if (k > 1) telescopeSteps.push(txt(' + '));
      telescopeSteps.push(frT({ n: 1, d: k * (k + 1) }));
    }
    if (n > 4) telescopeSteps.push(txt(` + … + `), frT({ n: 1, d: n * (n + 1) }));

    const explanation: MathExpr = [
      txt(`1/(□×(□+1)) = 1/□ − 1/(□+1) 성질을 이용해요. `),
      txt(`각 항을 분해하면: (1/1−1/2)+(1/2−1/3)+…+(1/${n}−1/${n + 1}). `),
      txt(`앞뒤 항이 소거되어(망원 소거) 1 − 1/${n + 1} = ${n}/${n + 1}만 남아요. `),
      txt(`따라서 합 = `),
      frT(ans),
      txt(`예요.`),
    ];

    const termTokens: MathToken[] = [...telescopeSteps];
    const expr: MathExpr = termTokens;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `다음 합을 기약분수로 나타내세요.`,
      expr,
      mixed: false,
      requireIrreducible: true,
      answer: { n: ans.n, d: ans.d },
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitPoly — 다각형의 둘레와 넓이
// ═══════════════════════════════════════════════════════════════

/**
 * ch51-stairs  계단 도형 둘레
 * 정사각형 n개 계단 → 둘레 = 4·n·a
 */
const chStairs: SkillDef = {
  id: 'ch51-stairs',
  unitId: 'unitPoly',
  title: '계단 도형 둘레',
  note: '정사각형 n개 계단, 둘레 = 4na (외접 직사각형과 같음)',
  difficulty: 3,
  challenge: true,
  minVariety: 30, // a(7가지)×n(5가지) = 35조합
  generate(seed): Problem {
    const rng = new RNG(seed);
    const a = rng.int(2, 8);
    const n = rng.int(3, 7);
    const ans = 4 * n * a;

    const explanation: MathExpr = [
      txt(`한 변이 ${a} cm인 정사각형 ${n}개를 계단 모양으로 쌓은 도형을 생각해요. `),
      txt(`가로 방향 선분을 합치면 ${n}×${a}×2 = ${2 * n * a} cm, `),
      txt(`세로 방향 선분을 합치면 ${n}×${a}×2 = ${2 * n * a} cm예요. `),
      txt(`이것은 계단 형태를 외접 직사각형(가로 ${n * a} cm, 세로 ${n * a} cm)의 둘레와 같아요. `),
      txt(`둘레 = 4×${n}×${a} = ${ans} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 변의 길이가 ${a} cm인 정사각형 ${n}개를 계단 모양으로 이어 붙인 도형의 둘레는 몇 cm인가요?`,
      expr: [txt('둘레 = '), blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
      figure: { kind: 'staircase', squares: n, side: a },
    };
  },
};

/**
 * ch51-overlap  겹친 넓이
 * 직사각형(w×h) + 정사각형(s²) 겹침 = 정사각형의 1/k → 전체 = wh + s² − s²/k
 */
const chOverlap: SkillDef = {
  id: 'ch51-overlap',
  unitId: 'unitPoly',
  title: '겹친 도형 전체 넓이',
  note: '직사각형+정사각형, 겹침=s²/k, 전체=wh+s²−s²/k 정수 보장',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    let w: number, h: number, s: number, k: number, overlap: number, ans: number;
    let tries = 0;
    do {
      w = rng.int(4, 12);
      h = rng.int(3, 10);
      // s²가 k의 배수여야 정수 보장
      k = rng.int(2, 5);
      // s를 k의 배수로 선택
      const sBase = rng.int(2, 5);
      s = sBase * (Number.isInteger(Math.sqrt(k)) ? 1 : k); // s²/k 정수
      // s² % k === 0 이면 OK
      overlap = (s * s) / k;
      if (!Number.isInteger(overlap)) {
        // s = k * t → s² = k²t² → s²/k = k*t² 정수
        s = k * rng.int(1, 4);
        overlap = (s * s) / k;
      }
      ans = w * h + s * s - overlap;
      tries++;
      if (tries > 1000) { w = 6; h = 5; s = 4; k = 4; overlap = 4; ans = 30 + 16 - 4; break; }
    } while (!Number.isInteger(overlap) || overlap <= 0 || ans <= 0 || s > w || s > h + 2);

    const explanation: MathExpr = [
      txt(`직사각형 넓이 = ${w}×${h} = ${w * h} cm². `),
      txt(`정사각형 넓이 = ${s}×${s} = ${s * s} cm². `),
      txt(`겹친 부분 = 정사각형의 1/${k} = ${s * s}÷${k} = ${overlap} cm². `),
      txt(`전체 넓이 = ${w * h}+${s * s}−${overlap} = ${ans} cm².`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `가로 ${w} cm, 세로 ${h} cm인 직사각형과 한 변이 ${s} cm인 정사각형이 겹쳐 있습니다. 겹친 부분이 정사각형 넓이의 1/${k}일 때, 두 도형 전체의 넓이를 구하세요.`,
      expr: [txt('전체 넓이 = '), blank(0), txt(' cm²')],
      blankAnswers: [ans],
      explanation,
      figure: { kind: 'overlap-rect-square', w, h, s, k },
    };
  },
};

/**
 * ch51-peri-eq  둘레 같은 정다각형
 * 정m각형과 정n각형 둘레 같이 P, 한 변 차 = P/m − P/n
 */
const chPeriEq: SkillDef = {
  id: 'ch51-peri-eq',
  unitId: 'unitPoly',
  title: '둘레 같은 두 정다각형 한 변 차이',
  note: 'P = lcm(m,n)의 배수, 한 변 차 = P/m − P/n 정수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const pairs: Array<[number, number]> = [
      [3, 4], [3, 6], [4, 6], [4, 8], [3, 9], [5, 10], [6, 9], [4, 12], [3, 12], [6, 12],
    ];
    const [m, n] = rng.pick(pairs); // m < n
    const L = lcm(m, n);
    const mult = rng.int(2, 8);
    const P = L * mult;

    const sideM = P / m;
    const sideN = P / n;
    const ans = sideM - sideN; // m < n이므로 sideM > sideN

    const explanation: MathExpr = [
      txt(`정${m}각형의 한 변 = ${P}÷${m} = ${sideM} cm. `),
      txt(`정${n}각형의 한 변 = ${P}÷${n} = ${sideN} cm. `),
      txt(`한 변 길이의 차 = ${sideM}−${sideN} = ${ans} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `둘레가 똑같이 ${P} cm인 정${m}각형과 정${n}각형이 있습니다. 두 정다각형의 한 변 길이의 차는 몇 cm인가요?`,
      expr: [txt('한 변 길이의 차 = '), blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch51-rhombus-scale  마름모 대각선 k배 → 넓이 k²배
 */
const chRhombusScale: SkillDef = {
  id: 'ch51-rhombus-scale',
  unitId: 'unitPoly',
  title: '마름모 대각선 k배 확대 → 넓이 배율',
  note: '두 대각선 각각 k배 → 넓이 k²배',
  difficulty: 3,
  challenge: true,
  minVariety: 4,
  generate(seed): Problem {
    const rng = new RNG(seed);
    const k = rng.int(2, 5);
    const kSq = k * k;

    const explanation: MathExpr = [
      txt(`마름모의 넓이 = (대각선1 × 대각선2) ÷ 2예요. `),
      txt(`두 대각선을 각각 ${k}배로 늘리면 `),
      txt(`넓이 = (${k}×대각선1) × (${k}×대각선2) ÷ 2 `),
      txt(`= ${k}×${k} × (대각선1 × 대각선2 ÷ 2) `),
      txt(`= ${kSq} × 원래 넓이. `),
      txt(`따라서 넓이는 ${kSq}배가 돼요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `마름모의 두 대각선의 길이를 각각 ${k}배로 늘리면 넓이는 몇 배가 되나요?`,
      expr: [blank(0), txt(' 배')],
      blankAnswers: [kSq],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  내보내기
// ═══════════════════════════════════════════════════════════════

export const challengeG5S1Skills: SkillDef[] = [
  // unitMix
  chPromise,
  chOpPlace,
  chIneq,
  // unitDiv
  chGcdLcm,
  chRemainder,
  chGear,
  // unitPattern
  chCompose,
  chAge,
  chArith,
  // unit1
  chFracRange,
  chFracAddSame,
  chFracIneq,
  // unit2
  chTape,
  chSumDiff,
  chTelescope,
  // unitPoly
  chStairs,
  chOverlap,
  chPeriEq,
  chRhombusScale,
];
