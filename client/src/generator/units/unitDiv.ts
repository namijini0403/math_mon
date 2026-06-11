/**
 * 단원: 약수와 배수 (2022 개정교육과정 5-1 2단원)
 * 성취기준: 약수와 배수의 의미를 알고, 최대공약수와 최소공배수를 구하며
 * 이를 문제 해결에 활용한다.
 */

import { RNG } from '../rng';
import { gcd, lcm } from '../fraction';
import { buildChoices } from '../choices';
import { ida, josa, nj } from '../josa';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;
const dec = (v: number): ChoiceValue => ({ kind: 'decimal', v });

/** N의 약수를 모두 구한다 */
function divisors(n: number): number[] {
  const result: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) result.push(i);
  }
  return result;
}

/** 소인수분해 곱셈식 문자열 (설명용) */
function primeFactorStr(n: number): string {
  if (n <= 1) return String(n);
  const factors: number[] = [];
  let x = n;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) {
      factors.push(p);
      x = Math.floor(x / p);
    }
  }
  if (x > 1) factors.push(x);
  if (factors.length <= 1) return String(n);
  return factors.join('×');
}

// ── 1. div-divisor-pick ────────────────────────────────────────────
const divisorPick: SkillDef = {
  id: 'div-divisor-pick',
  unitId: 'unitDiv',
  title: '약수 고르기',
  note: 'N의 약수를 4지선다에서 고른다. 약수 6개 이상인 N(12~60) 사용.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    // 약수가 6개 이상인 수 목록
    const candidates: number[] = [];
    for (let n = 12; n <= 60; n++) {
      if (divisors(n).length >= 6) candidates.push(n);
    }
    const N = rng.pick(candidates);
    const divs = divisors(N);

    // 정답: 1과 N 자체를 제외한 약수 중에서 고름
    const innerDivs = divs.filter((d) => d !== 1 && d !== N);
    const answer = innerDivs.length > 0 ? rng.pick(innerDivs) : rng.pick(divs);

    // 오답 후보: 약수가 아닌 수 — ±1 함정 포함
    const divSet = new Set(divs);
    const seen = new Set<number>([answer]);
    const nonDivCandidates: ChoiceValue[] = [];

    // ±1 함정 우선
    for (const d of divs) {
      for (const delta of [-1, 1]) {
        const v = d + delta;
        if (v >= 2 && v <= N && !divSet.has(v) && !seen.has(v)) {
          seen.add(v);
          nonDivCandidates.push(dec(v));
        }
      }
    }
    // 추가 후보 채우기
    for (let v = 2; v <= N && nonDivCandidates.length < 10; v++) {
      if (!divSet.has(v) && !seen.has(v)) {
        seen.add(v);
        nonDivCandidates.push(dec(v));
      }
    }

    const shuffled = rng.shuffle(nonDivCandidates);
    const { choices, answerIndex } = buildChoices(dec(answer), shuffled, rng);

    const explanation: MathExpr = [
      txt(`${N}의 약수는 ${N}${josa(N, '을/를')} 나누어 떨어지게 하는 수예요. `),
      txt(`${N}의 약수: ${divs.join(', ')}. `),
      txt(`그 중 ${nj(answer, '이/가')} 약수예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${N}의 약수를 고르세요.`,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 2. div-multiple-pick ───────────────────────────────────────────
const multiplePick: SkillDef = {
  id: 'div-multiple-pick',
  unitId: 'unitDiv',
  title: '배수 고르기',
  note: 'N의 배수를 4지선다에서 고른다. N(3~12)',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);
    const N = rng.int(3, 12);

    // 정답: N의 2~10배 중 하나
    const k = rng.int(2, 10);
    const answer = N * k;

    // N의 배수 집합
    const multSet = new Set<number>();
    for (let i = 1; i <= 15; i++) multSet.add(N * i);

    const seen = new Set<number>([answer]);
    const nonMultCandidates: ChoiceValue[] = [];

    // ±1 함정 — answer 인접
    for (const delta of [-1, 1]) {
      const v = answer + delta;
      if (v >= 1 && !multSet.has(v) && !seen.has(v)) {
        seen.add(v);
        nonMultCandidates.push(dec(v));
      }
    }
    // 인접 배수 ±1
    for (const ik of [k - 1, k + 1]) {
      if (ik < 1) continue;
      const base = N * ik;
      for (const delta of [-1, 1]) {
        const v = base + delta;
        if (v >= 1 && !multSet.has(v) && !seen.has(v)) {
          seen.add(v);
          nonMultCandidates.push(dec(v));
        }
      }
    }
    // 추가 후보
    for (let v = N * 2; v <= N * 12 && nonMultCandidates.length < 10; v++) {
      if (!multSet.has(v) && !seen.has(v)) {
        seen.add(v);
        nonMultCandidates.push(dec(v));
      }
    }

    const shuffled = rng.shuffle(nonMultCandidates);
    const { choices, answerIndex } = buildChoices(dec(answer), shuffled, rng);

    const multList = [N, N * 2, N * 3, N * 4, N * 5].join(', ');
    const explanation: MathExpr = [
      txt(`${N}의 배수는 ${N}에 자연수를 곱한 수예요. `),
      txt(`${N}의 배수: ${multList}, ... `),
      txt(`${nj(answer, '은/는')} ${N}×${k}=${ida(answer)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${N}의 배수를 고르세요.`,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 3. div-nth-multiple ────────────────────────────────────────────
const nthMultiple: SkillDef = {
  id: 'div-nth-multiple',
  unitId: 'unitDiv',
  title: 'N의 k번째 배수',
  note: 'N(2~12)의 배수 중 k번째 수를 빈칸으로 채운다. k(3~9)',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);
    const N = rng.int(2, 12);
    const k = rng.int(3, 12);
    const answer = N * k;

    const expr: MathExpr = [
      txt(`${N}의 ${k}번째 배수: `),
      { kind: 'blank', slot: 0 },
    ];

    const explanation: MathExpr = [
      txt(`${N}의 배수는 ${N}×1=${N}, ${N}×2=${N * 2}, ... 처럼 ${N}에 차례로 자연수를 곱해요. `),
      txt(`${k}번째 배수는 ${N}×${k}=${ida(answer)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${N}의 배수 중 ${k}번째 수는 무엇인가요?`,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 4. div-divisor-count ───────────────────────────────────────────
const divisorCount: SkillDef = {
  id: 'div-divisor-count',
  unitId: 'unitDiv',
  title: '약수의 개수 구하기',
  note: 'N(6~60)의 약수가 모두 몇 개인지 빈칸으로 채운다.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);
    const N = rng.int(6, 90);
    const divs = divisors(N);
    const answer = divs.length;

    const expr: MathExpr = [
      txt(`${N}의 약수의 수: `),
      { kind: 'blank', slot: 0 },
      txt('개'),
    ];

    const explanation: MathExpr = [
      txt(`${N}의 약수를 모두 구하면: ${divs.join(', ')}. `),
      txt(`모두 ${ida(answer)}개예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${N}의 약수는 모두 몇 개인가요?`,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 5. div-gcd ─────────────────────────────────────────────────────
const gcdSkill: SkillDef = {
  id: 'div-gcd',
  unitId: 'unitDiv',
  title: '최대공약수 구하기',
  note: '두 수(6~48)의 최대공약수를 빈칸으로 채운다. GCD ≥ 2인 쌍만.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    let a = 12, b = 18, g = 6;
    let guard = 0;
    do {
      a = rng.int(6, 48);
      b = rng.int(6, 48);
      g = gcd(a, b);
      guard++;
      if (guard > 300) { a = 12; b = 18; g = gcd(12, 18); break; }
    } while (g < 2 || a === b);

    const expr: MathExpr = [
      txt(`${nj(a, '과/와')} ${b}의 최대공약수: `),
      { kind: 'blank', slot: 0 },
    ];

    const explanation: MathExpr = [
      txt(`${a}의 약수: ${divisors(a).join(', ')}. `),
      txt(`${b}의 약수: ${divisors(b).join(', ')}. `),
      txt(`공약수 중 가장 큰 수(최대공약수)${josa(g, '은/는')} ${ida(g)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${nj(a, '과/와')} ${b}의 최대공약수를 구하세요.`,
      expr,
      blankAnswers: [g],
      explanation,
    };
  },
};

// ── 6. div-lcm ─────────────────────────────────────────────────────
const lcmSkill: SkillDef = {
  id: 'div-lcm',
  unitId: 'unitDiv',
  title: '최소공배수 구하기',
  note: '두 수(2~12)의 최소공배수를 빈칸으로 채운다. LCM ≤ 100.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    let a = 3, b = 4, l = lcm(3, 4);
    let guard = 0;
    do {
      a = rng.int(2, 12);
      b = rng.int(2, 12);
      l = lcm(a, b);
      guard++;
      if (guard > 300) { a = 3; b = 4; l = lcm(3, 4); break; }
    } while (l > 100 || a === b);

    const g = gcd(a, b);
    const expr: MathExpr = [
      txt(`${nj(a, '과/와')} ${b}의 최소공배수: `),
      { kind: 'blank', slot: 0 },
    ];

    const explanation: MathExpr = [
      txt(`${a}의 배수: ${a}, ${a * 2}, ${a * 3}, ${a * 4}, ... `),
      txt(`${b}의 배수: ${b}, ${b * 2}, ${b * 3}, ${b * 4}, ... `),
      txt(`공배수 중 가장 작은 수(최소공배수)${josa(l, '은/는')} `),
      txt(`${a}×${b}÷${g}=${ida(l)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${nj(a, '과/와')} ${b}의 최소공배수를 구하세요.`,
      expr,
      blankAnswers: [l],
      explanation,
    };
  },
};

// ── 7. div-gcd-word ────────────────────────────────────────────────
const gcdWordSkill: SkillDef = {
  id: 'div-gcd-word',
  unitId: 'unitDiv',
  title: '최대공약수 문장제',
  note: '최대공약수를 활용하는 문장제. 소재 5가지 풀.',
  difficulty: 3,
  word: true,
  generate(seed) {
    const rng = new RNG(seed);
    const templateIdx = rng.int(0, 4);

    let a: number, b: number, g: number;
    let prompt: string;
    let expr: MathExpr;
    let explanation: MathExpr;

    // 공통: GCD 조건 만족하는 쌍 생성 헬퍼 (인라인)
    // 소재 0: 물건 나누어 주기
    if (templateIdx === 0) {
      g = 2; a = 12; b = 18;
      let guard = 0;
      do {
        const gg = rng.int(2, 8);
        const fa = rng.int(2, 8);
        const fb = rng.int(2, 8);
        if (fa === fb) continue;
        const ca = gg * fa;
        const cb = gg * fb;
        if (ca > 60 || cb > 60) continue;
        if (gcd(ca, cb) !== gg) continue;
        a = ca; b = cb; g = gg;
        break;
      } while (++guard < 300);
      const itemA = rng.pick(['사과', '귤', '딸기', '포도', '바나나']);
      const itemB = rng.pick(['복숭아', '망고', '배', '키위', '오렌지']);
      prompt = `${itemA} ${a}개와 ${itemB} ${b}개를 최대한 많은 친구에게 똑같이 나누어 주려면 몇 명까지 줄 수 있을까요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('명')];
      explanation = [
        txt(`${nj(a, '과/와')} ${b}의 최대공약수를 구해요. `),
        txt(`${a}=${primeFactorStr(a)}, ${b}=${primeFactorStr(b)}. `),
        txt(`최대공약수는 ${g}이므로 최대 ${g}명에게 나눌 수 있어요.`),
      ];

    // 소재 1: 종이 자르기
    } else if (templateIdx === 1) {
      g = 2; a = 18; b = 24;
      let guard = 0;
      do {
        const gg = rng.int(2, 10);
        const fa = rng.int(2, 9);
        const fb = rng.int(2, 9);
        if (fa === fb) continue;
        const ca = gg * fa;
        const cb = gg * fb;
        if (ca > 72 || cb > 72) continue;
        if (gcd(ca, cb) !== gg) continue;
        a = ca; b = cb; g = gg;
        break;
      } while (++guard < 300);
      prompt = `가로 ${a} cm, 세로 ${b} cm인 종이를 남김없이 가장 큰 정사각형으로 자르려면 한 변의 길이는 몇 cm인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt(' cm')];
      explanation = [
        txt(`가장 큰 정사각형의 한 변은 ${nj(a, '과/와')} ${b}의 최대공약수예요. `),
        txt(`${a}=${primeFactorStr(a)}, ${b}=${primeFactorStr(b)}. `),
        txt(`최대공약수는 ${g}이므로 한 변의 길이는 ${g} cm예요.`),
      ];

    // 소재 2: 학생 모둠 나누기
    } else if (templateIdx === 2) {
      g = 2; a = 12; b = 18;
      let guard = 0;
      do {
        const gg = rng.int(2, 6);
        const fa = rng.int(2, 8);
        const fb = rng.int(2, 8);
        if (fa === fb) continue;
        const ca = gg * fa;
        const cb = gg * fb;
        if (ca > 48 || cb > 48) continue;
        if (gcd(ca, cb) !== gg) continue;
        a = ca; b = cb; g = gg;
        break;
      } while (++guard < 300);
      prompt = `남학생 ${a}명, 여학생 ${b}명을 남녀가 같은 수가 되도록 최대한 많은 모둠으로 나누려면 몇 모둠이 될까요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('모둠')];
      explanation = [
        txt(`${nj(a, '과/와')} ${b}의 최대공약수를 구해요. `),
        txt(`최대공약수는 ${g}이므로 ${g}모둠으로 나눌 수 있어요.`),
      ];

    // 소재 3: 정사각형 타일
    } else if (templateIdx === 3) {
      g = 2; a = 16; b = 24;
      let guard = 0;
      do {
        const gg = rng.int(2, 8);
        const fa = rng.int(2, 8);
        const fb = rng.int(2, 8);
        if (fa === fb) continue;
        const ca = gg * fa;
        const cb = gg * fb;
        if (ca > 64 || cb > 64) continue;
        if (gcd(ca, cb) !== gg) continue;
        a = ca; b = cb; g = gg;
        break;
      } while (++guard < 300);
      prompt = `가로 ${a} cm, 세로 ${b} cm 벽을 빈틈없이 가장 큰 정사각형 타일로 채우려면 타일 한 변의 길이는 몇 cm인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt(' cm')];
      explanation = [
        txt(`타일 한 변의 길이는 ${nj(a, '과/와')} ${b}의 최대공약수예요. `),
        txt(`최대공약수는 ${g}이므로 한 변은 ${g} cm예요.`),
      ];

    // 소재 4: 리본 자르기
    } else {
      g = 3; a = 18; b = 27;
      let guard = 0;
      do {
        const gg = rng.int(2, 9);
        const fa = rng.int(2, 9);
        const fb = rng.int(2, 9);
        if (fa === fb) continue;
        const ca = gg * fa;
        const cb = gg * fb;
        if (ca > 72 || cb > 72) continue;
        if (gcd(ca, cb) !== gg) continue;
        a = ca; b = cb; g = gg;
        break;
      } while (++guard < 300);
      const colorA = rng.pick(['빨간', '파란', '초록', '노란']);
      const colorB = rng.pick(['보라', '주황', '분홍', '하늘']);
      prompt = `${colorA} 리본 ${a} cm와 ${colorB} 리본 ${b} cm를 같은 길이로 남김없이 자르려면 가장 긴 한 도막의 길이는 몇 cm인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt(' cm')];
      explanation = [
        txt(`${nj(a, '과/와')} ${b}의 최대공약수를 구해요. `),
        txt(`최대공약수는 ${g}이므로 가장 긴 한 도막은 ${g} cm예요.`),
      ];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [g],
      explanation,
    };
  },
};

// ── 8. div-lcm-word ────────────────────────────────────────────────
const lcmWordSkill: SkillDef = {
  id: 'div-lcm-word',
  unitId: 'unitDiv',
  title: '최소공배수 문장제',
  note: '최소공배수를 활용하는 문장제. 소재 5가지 풀. LCM ≤ 120.',
  difficulty: 3,
  word: true,
  generate(seed) {
    const rng = new RNG(seed);
    const templateIdx = rng.int(0, 4);

    let a: number, b: number, l: number;
    let prompt: string;
    let expr: MathExpr;
    let explanation: MathExpr;

    /** LCM 조건 만족 쌍 생성 */
    const pickPair = (minV: number, maxV: number, maxLcm: number): [number, number, number] => {
      let _a = minV, _b = minV + 1, _l = lcm(_a, _b);
      let guard = 0;
      do {
        _a = rng.int(minV, maxV);
        _b = rng.int(minV, maxV);
        _l = lcm(_a, _b);
        guard++;
        if (guard > 300) { _a = minV; _b = minV + 1; _l = lcm(_a, _b); break; }
      } while (_a === _b || _l > maxLcm);
      return [_a, _b, _l];
    };

    // 소재 0: 버스 출발
    if (templateIdx === 0) {
      [a, b, l] = pickPair(3, 12, 120);
      prompt = `두 버스가 각각 ${a}분, ${b}분마다 출발합니다. 동시에 출발한 후 다시 동시에 출발하려면 몇 분 후인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('분 후')];
      explanation = [
        txt(`${nj(a, '과/와')} ${b}의 최소공배수를 구해요. `),
        txt(`${a}의 배수: ${a}, ${a * 2}, ${a * 3}, ... `),
        txt(`${b}의 배수: ${b}, ${b * 2}, ${b * 3}, ... `),
        txt(`최소공배수는 ${l}이므로 ${l}분 후에 동시에 출발해요.`),
      ];

    // 소재 1: 전구 깜빡임
    } else if (templateIdx === 1) {
      [a, b, l] = pickPair(2, 10, 120);
      prompt = `전구 두 개가 각각 ${a}초, ${b}초마다 깜빡입니다. 동시에 깜빡인 후 다시 함께 깜빡이려면 몇 초 후인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('초 후')];
      explanation = [
        txt(`${nj(a, '과/와')} ${b}의 최소공배수를 구해요. `),
        txt(`최소공배수는 ${l}이므로 ${l}초 후에 동시에 깜빡여요.`),
      ];

    // 소재 2: 톱니바퀴
    } else if (templateIdx === 2) {
      [a, b, l] = pickPair(2, 10, 120);
      prompt = `두 톱니바퀴가 각각 ${a}초, ${b}초마다 제자리로 돌아옵니다. 같이 출발한 후 처음으로 동시에 제자리에 오는 건 몇 초 후인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('초 후')];
      explanation = [
        txt(`${nj(a, '과/와')} ${b}의 최소공배수를 구해요. `),
        txt(`최소공배수는 ${l}이므로 ${l}초 후에 같은 위치에 와요.`),
      ];

    // 소재 3: 운동 주기
    } else if (templateIdx === 3) {
      [a, b, l] = pickPair(2, 10, 120);
      prompt = `민준이는 ${a}일마다, 서연이는 ${b}일마다 수영장에 갑니다. 오늘 함께 갔다면 다음에 함께 가는 날은 며칠 후인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('일 후')];
      explanation = [
        txt(`${nj(a, '과/와')} ${b}의 최소공배수를 구해요. `),
        txt(`최소공배수는 ${l}이므로 ${l}일 후에 함께 가요.`),
      ];

    // 소재 4: 약 복용 주기
    } else {
      [a, b, l] = pickPair(2, 10, 120);
      prompt = `두 알람이 각각 ${a}시간, ${b}시간마다 울립니다. 지금 동시에 울렸다면 다음에 동시에 울리는 건 몇 시간 후인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('시간 후')];
      explanation = [
        txt(`${nj(a, '과/와')} ${b}의 최소공배수를 구해요. `),
        txt(`최소공배수는 ${l}이므로 ${l}시간 후에 함께 먹어요.`),
      ];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [l],
      explanation,
    };
  },
};

export const unitDivSkills: SkillDef[] = [
  divisorPick,
  multiplePick,
  nthMultiple,
  divisorCount,
  gcdSkill,
  lcmSkill,
  gcdWordSkill,
  lcmWordSkill,
];
