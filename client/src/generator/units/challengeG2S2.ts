/**
 * 2-2 심화 문제 생성기 (challenge: true, difficulty: 3)
 * 명세: docs/challenge/g2s2.md
 */

import { RNG } from '../rng';
import { ida, nj } from '../josa';
import type { MathExpr, MathToken, Problem, SkillDef } from '../types';

// ── 공통 토큰 헬퍼 ──────────────────────────────────────────
const txt = (t: string): MathToken => ({ kind: 'text', text: t });
const blank = (slot: number): MathToken => ({ kind: 'blank', slot });

// ═══════════════════════════════════════════════════════════════
//  unitNum4d — 네 자리 수
// ═══════════════════════════════════════════════════════════════

/**
 * ch22-card4  수 카드로 가장 큰/작은 네 자리 수
 * 서로 다른 숫자 카드 5~6장(0 포함) 중 4장으로 네 자리 수
 */
const chCard4: SkillDef = {
  id: 'ch22-card4',
  unitId: 'unitNum4d',
  title: '숫자 카드로 가장 큰/작은 네 자리 수',
  note: '5~6장 카드 중 4장, 천의 자리 0 제외',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let cards: number[] = [0, 1, 3, 5, 7];
    let isLargest = true;
    let ans = 7531;

    for (let tries = 0; tries < 2000; tries++) {
      const numCards = rng.chance(0.5) ? 5 : 6;
      const includeZero = rng.chance(0.6);
      const pool: number[] = [];

      if (includeZero) {
        pool.push(0);
        while (pool.length < numCards) {
          const d = rng.int(1, 9);
          if (!pool.includes(d)) pool.push(d);
        }
      } else {
        while (pool.length < numCards) {
          const d = rng.int(1, 9);
          if (!pool.includes(d)) pool.push(d);
        }
      }

      const sorted = [...pool].sort((a, b) => a - b);
      const isLargest2 = rng.chance(0.5);

      let ans2: number;
      if (isLargest2) {
        // 가장 큰 수: 큰 숫자 4개 내림차순
        const top4 = sorted.slice(-4).reverse();
        ans2 = top4[0] * 1000 + top4[1] * 100 + top4[2] * 10 + top4[3];
      } else {
        // 가장 작은 수: 작은 숫자 4개 오름차순, 단 천의 자리 0 불가
        const bot4 = sorted.slice(0, 4);
        if (bot4[0] === 0) {
          // 0은 두 번째 자리로, 1번째(작은 비영 숫자)를 앞으로
          const firstNonZero = bot4.find((d) => d !== 0)!;
          const rest = bot4.filter((d) => d !== firstNonZero);
          ans2 = firstNonZero * 1000 + rest[0] * 100 + rest[1] * 10 + rest[2];
        } else {
          ans2 = bot4[0] * 1000 + bot4[1] * 100 + bot4[2] * 10 + bot4[3];
        }
      }

      if (ans2 < 1000 || ans2 > 9999) continue;

      cards = pool;
      isLargest = isLargest2;
      ans = ans2;
      break;
    }

    const label = isLargest ? '가장 큰' : '가장 작은';

    const explanation: MathExpr = [
      txt(`카드 ${cards.join(', ')} 중 4장을 뽑아 ${label} 네 자리 수를 만들어요. `),
      isLargest
        ? txt(`가장 큰 수는 큰 숫자부터 천의 자리, 백의 자리, 십의 자리, 일의 자리 순으로 놓아요. `)
        : txt(`가장 작은 수는 작은 숫자부터 놓되, 천의 자리에는 0이 올 수 없어요. `),
      txt(`따라서 ${label} 네 자리 수는 ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `카드 ${cards.join(', ')} 중 4장을 뽑아 만들 수 있는 ${label} 네 자리 수를 구하세요.`,
      expr: [txt(`${label} 네 자리 수 = `), blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-cond4  세 조건을 만족하는 네 자리 수 (회문형)
 * 천=일, 백=십 → 2t+2h=S 로 유일하게 결정
 */
const chCond4: SkillDef = {
  id: 'ch22-cond4',
  unitId: 'unitNum4d',
  title: '세 조건을 만족하는 네 자리 수 (회문)',
  note: '천=일, 백=십, 자리합=S, 유일해',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: t=2, h=3 → 2323, S=10, 범위: 2000<x<3000
    let t = 2, h = 3, ans = 2332, S = 10, A = 2200, B = 2400;

    for (let tries = 0; tries < 2000; tries++) {
      const t2 = rng.int(1, 9);
      const h2 = rng.int(0, 9);
      const S2 = 2 * t2 + 2 * h2;
      if (S2 < 4 || S2 > 36) continue;
      if (h2 === 0) continue; // 백의 자리 0이면 문제가 자명해짐

      const num = t2 * 1000 + h2 * 100 + h2 * 10 + t2;

      // A보다 크고 B보다 작은 범위: 천의 자리 같은 구간
      // A, B를 천의 자리 t2 고정, 해당 수 하나만 포함되도록 설정
      const base = t2 * 1000;
      const A2 = base + rng.int(0, (h2 - 1) * 100 + 50); // num보다 작게
      const B2 = num + rng.int(50, 200); // num보다 크게
      if (A2 >= num || B2 <= num) continue;
      if (B2 > 9999) continue;

      // 범위 내에 다른 회문수가 없는지 검사
      let unique = true;
      for (let tt = 1; tt <= 9; tt++) {
        for (let hh = 0; hh <= 9; hh++) {
          if (2 * tt + 2 * hh !== S2) continue;
          const candidate = tt * 1000 + hh * 100 + hh * 10 + tt;
          if (candidate === num) continue;
          if (candidate > A2 && candidate < B2) { unique = false; break; }
        }
        if (!unique) break;
      }
      if (!unique) continue;

      t = t2; h = h2; ans = num; S = S2; A = A2; B = B2;
      break;
    }

    const explanation: MathExpr = [
      txt(`세 조건을 차례로 적용해요. `),
      txt(`① ${A}보다 크고 ${B}보다 작으므로 천의 자리는 ${nj(t, '이/가')} 돼요. `),
      txt(`② 앞에서 읽으나 뒤에서 읽으나 같으므로 천의 자리=일의 자리=${t}, 백의 자리=십의 자리예요. `),
      txt(`③ 자리 숫자의 합=${S}이므로 2×${t}+2×(백의 자리)=${S}, 백의 자리=${nj(h, '이/가')} 나와요. `),
      txt(`따라서 구하는 수는 ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `세 조건을 모두 만족하는 네 자리 수를 구하세요.\n① ${A}보다 크고 ${B}보다 작습니다.\n② 앞에서 읽으나 뒤에서 읽으나 같습니다.\n③ 각 자리 숫자의 합은 ${S}입니다.`,
      expr: [txt('조건을 만족하는 네 자리 수 = '), blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-jump4  뛰어 세기 역산
 * 어떤 수에서 d씩 k번 뛰어 세었더니 N이 됨 → 어떤 수?
 */
const chJump4: SkillDef = {
  id: 'ch22-jump4',
  unitId: 'unitNum4d',
  title: '뛰어 세기 역산',
  note: 'd∈{10,50,100,1000}, k=3~7, 결과 네 자리',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const dOptions = [10, 50, 100, 1000];

    // 폴백
    let d = 100, k = 5, N = 3500, start = 3000, goUp = true;

    for (let tries = 0; tries < 2000; tries++) {
      const d2 = rng.pick(dOptions);
      const k2 = rng.int(3, 7);
      const goUp2 = rng.chance(0.5);
      // 목표 N을 먼저 고른 뒤 역산
      const N2 = rng.int(1000, 9999);
      const start2 = goUp2 ? N2 - d2 * k2 : N2 + d2 * k2;
      if (start2 < 1000 || start2 > 9999) continue;
      if (N2 < 1000 || N2 > 9999) continue;

      d = d2; k = k2; N = N2; start = start2; goUp = goUp2;
      break;
    }

    const direction = goUp ? '커지게' : '작아지게';
    const midValues: number[] = [];
    for (let i = 1; i < Math.min(k, 4); i++) {
      midValues.push(goUp ? start + d * i : start - d * i);
    }

    const explanation: MathExpr = [
      txt(`${d}씩 ${k}번 ${direction} 뛰어 세면 ${d}×${k}=${d * k}만큼 ${goUp ? '커져요' : '작아져요'}. `),
      txt(`결과가 ${N}${nj(N, '이/가')} 되었으므로, 어떤 수 = ${N} ${goUp ? '−' : '+'} ${d * k} = ${ida(start)}.`),
      txt(`확인: ${start} → ${midValues.join(' → ')}${midValues.length > 0 ? ' → ' : ''}… → ${N}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `어떤 수에서 ${d}씩 ${direction} ${k}번 뛰어 세었더니 ${N}${nj(N, '이/가')} 되었습니다. 어떤 수는 얼마인가요?`,
      expr: [txt('어떤 수 = '), blank(0)],
      blankAnswers: [start],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitGugu — 곱셈구구
// ═══════════════════════════════════════════════════════════════

/**
 * ch22-shapesides  도형 변의 수 합 (곱셈구구)
 * 삼각형 a개 + 사각형 b개 + 오각형 c개 = 3a+4b+5c
 */
const chShapeSides: SkillDef = {
  id: 'ch22-shapesides',
  unitId: 'unitGugu',
  title: '도형 변의 수 합 (곱셈구구)',
  note: 'a,b,c=2~6, 답=3a+4b+5c',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const a = rng.int(2, 6);
    const b = rng.int(2, 6);
    const c = rng.int(2, 6);
    const ans = 3 * a + 4 * b + 5 * c;

    const explanation: MathExpr = [
      txt(`삼각형의 변의 수: 3×${a}=${3 * a}개. `),
      txt(`사각형의 변의 수: 4×${b}=${4 * b}개. `),
      txt(`오각형의 변의 수: 5×${c}=${5 * c}개. `),
      txt(`모두 더하면 ${3 * a}+${4 * b}+${5 * c}=${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `삼각형 ${a}개, 사각형 ${b}개, 오각형 ${c}개를 그렸습니다. 변은 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-target  과녁 점수 총합
 * 4가지 점수대별 횟수 → 총점
 */
const chTarget: SkillDef = {
  id: 'ch22-target',
  unitId: 'unitGugu',
  title: '과녁 점수 총합',
  note: '점수 4종 × 횟수 1~4, 총점 두 자리 이상',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let scores = [9, 7, 5, 3];
    let hits = [2, 1, 3, 1];

    // 점수 배열은 고정 패턴에서 고름
    const scoreOptions = [
      [9, 7, 5, 3],
      [10, 8, 6, 4],
      [8, 6, 4, 2],
      [9, 6, 4, 1],
      [10, 7, 5, 2],
    ];

    let ans = 9 * 2 + 7 * 1 + 5 * 3 + 3 * 1;

    for (let tries = 0; tries < 2000; tries++) {
      const sc = rng.pick(scoreOptions);
      const h = [rng.int(0, 4), rng.int(0, 4), rng.int(0, 4), rng.int(0, 4)];
      const t = sc[0] * h[0] + sc[1] * h[1] + sc[2] * h[2] + sc[3] * h[3];
      if (t < 10) continue;
      if (h.every((x) => x === 0)) continue;
      scores = sc;
      hits = h;
      ans = t;
      break;
    }

    // 표 형태 프롬프트
    const tableRows = scores.map((s, i) => `${s}점: ${hits[i]}번`).join(', ');

    const explanation: MathExpr = [
      ...scores.map((s, i) =>
        hits[i] > 0
          ? txt(`${s}점×${hits[i]}번=${s * hits[i]}점. `)
          : txt('')
      ),
      txt(`모두 더하면 ${ans}${ida('점')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `과녁에 화살을 쏘아 다음 결과를 얻었습니다. 총점은 몇 점인가요?\n${tableRows}`,
      expr: [blank(0), txt(' 점')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-factortimes  곱셈구구 거꾸로 + 몇 배
 * 어떤 수의 a배=P, 어떤 수의 b배=?
 * a×□=P → □=P/a, 답=b×□
 */
const chFactorTimes: SkillDef = {
  id: 'ch22-factortimes',
  unitId: 'unitGugu',
  title: '곱셈구구 거꾸로 + 몇 배',
  note: 'a,b=2~9, □=2~9, P=a×□',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let a = 3, b = 5, base = 4, P = 12, ans = 20;

    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(2, 9);
      const b2 = rng.int(2, 9);
      if (a2 === b2) continue;
      const base2 = rng.int(2, 9);
      const P2 = a2 * base2;
      const ans2 = b2 * base2;
      if (P2 > 81 || ans2 > 81) continue;
      a = a2; b = b2; base = base2; P = P2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`어떤 수의 ${a}배가 ${P}이므로, ${a}×□=${P}에서 □=${ida(base)}. `),
      txt(`어떤 수가 ${base}이므로, ${base}의 ${b}배 = ${b}×${base} = ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `어떤 수의 ${a}배는 ${P}입니다. 어떤 수의 ${b}배는 얼마인가요?`,
      expr: [blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitLength22 — 길이 재기 (m와 cm)
// ═══════════════════════════════════════════════════════════════

/**
 * ch22-mcmdiff  여러 길이 중 가장 긴 것과 가장 짧은 것의 차
 * 차의 m≥1, cm≥1 보장
 */
const chMcmDiff: SkillDef = {
  id: 'ch22-mcmdiff',
  unitId: 'unitLength22',
  title: '길이 최대-최소 차 (m cm)',
  note: '4개 길이, 차 m≥1 cm≥1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: 4개 길이 (cm 단위)
    let lensCm = [219, 172, 256, 184];
    let ansM = 0, ansCm = 0;

    for (let tries = 0; tries < 2000; tries++) {
      // 4개 길이 생성 (100~499 cm)
      const ls = Array.from({ length: 4 }, () => rng.int(100, 499));
      const maxL = Math.max(...ls);
      const minL = Math.min(...ls);
      if (maxL === minL) continue;
      const diff = maxL - minL;
      const dm = Math.floor(diff / 100);
      const dc = diff % 100;
      if (dm < 1 || dc < 1) continue;
      lensCm = ls;
      ansM = dm;
      ansCm = dc;
      break;
    }

    // 표현: 각 길이를 m cm 또는 cm 형태로 번갈아 제시
    const displays = lensCm.map((cm, i) => {
      if (i % 2 === 0) {
        // m cm 형태
        const m = Math.floor(cm / 100);
        const c = cm % 100;
        return `${m} m ${c} cm`;
      } else {
        return `${cm} cm`;
      }
    });

    const maxL = Math.max(...lensCm);
    const minL = Math.min(...lensCm);

    const explanation: MathExpr = [
      txt(`모두 cm로 바꾸면: ${lensCm.join(' cm, ')} cm. `),
      txt(`가장 긴 길이: ${maxL} cm, 가장 짧은 길이: ${minL} cm. `),
      txt(`차: ${maxL}−${minL}=${maxL - minL} cm = ${ansM} m ${ansCm} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 길이 중 가장 긴 것과 가장 짧은 것의 차는 몇 m 몇 cm인가요?\n${displays.join(', ')}`,
      expr: [blank(0), txt(' m '), blank(1), txt(' cm')],
      blankAnswers: [ansM, ansCm],
      explanation,
    };
  },
};

/**
 * ch22-tapeoverlap  색 테이프 이어 붙이기 전체 길이
 * n장, 각 L(m,cm), e cm씩 겹침 → 전체 = n×L − (n−1)×e
 */
const chTapeOverlap: SkillDef = {
  id: 'ch22-tapeoverlap',
  unitId: 'unitLength22',
  title: '색 테이프 이어 붙이기',
  note: 'n=3~5, L=2~3m+cm, e=20~40, 결과 m≥1 cm≥1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let n = 3, Lm = 2, Lcm = 50, e = 30, ansM = 1, ansCm = 30;

    for (let tries = 0; tries < 2000; tries++) {
      const n2 = rng.int(3, 5);
      const Lm2 = rng.int(2, 3);
      const Lcm2 = rng.int(10, 80);
      const e2 = rng.int(20, 40);
      const Ltotal = Lm2 * 100 + Lcm2; // cm
      const total = n2 * Ltotal - (n2 - 1) * e2;
      if (total < 100) continue;
      const dm = Math.floor(total / 100);
      const dc = total % 100;
      if (dm < 1 || dc < 1) continue;
      n = n2; Lm = Lm2; Lcm = Lcm2; e = e2; ansM = dm; ansCm = dc;
      break;
    }

    const Ltotal = Lm * 100 + Lcm;
    const tapeTotal = n * Ltotal;
    const overlapTotal = (n - 1) * e;
    const resultCm = tapeTotal - overlapTotal;

    const explanation: MathExpr = [
      txt(`색 테이프 ${n}장의 길이 합: ${Lm} m ${Lcm} cm × ${n} = ${tapeTotal} cm. `),
      txt(`겹친 부분 합: ${e} cm × ${n - 1}군데 = ${overlapTotal} cm. `),
      txt(`전체 길이: ${tapeTotal}−${overlapTotal}=${resultCm} cm = ${ansM} m ${ansCm} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `길이가 ${Lm} m ${Lcm} cm인 색 테이프 ${n}장을 ${e} cm씩 겹치게 이어 붙였습니다. 전체 길이는 몇 m 몇 cm인가요?`,
      expr: [blank(0), txt(' m '), blank(1), txt(' cm')],
      blankAnswers: [ansM, ansCm],
      explanation,
    };
  },
};

/**
 * ch22-heightrel  키 관계 연쇄
 * ㉮ = 기준 + p, ㉯ = ㉮ − q, ㉰ = ㉯ − r → ㉰의 키
 */
const chHeightRel: SkillDef = {
  id: 'ch22-heightrel',
  unitId: 'unitLength22',
  title: '키 관계 연쇄',
  note: '연쇄 가감, 최종 m≥1 cm≥1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let baseM = 1, baseCm = 50, p = 8, q = 5, r = 3, ansM = 1, ansCm = 50;

    for (let tries = 0; tries < 2000; tries++) {
      const bm = 1; // 기준은 항상 1m대
      const bc = rng.int(40, 80);
      const p2 = rng.int(3, 15);
      const q2 = rng.int(2, 12);
      const r2 = rng.int(2, 12);

      const baseTotalCm = bm * 100 + bc;
      const ka = baseTotalCm + p2;  // ㉮
      const kb = ka - q2;            // ㉯
      const kc = kb - r2;            // ㉰

      if (kc < 100) continue;
      const dm = Math.floor(kc / 100);
      const dc = kc % 100;
      if (dm < 1 || dc < 1) continue;

      baseM = bm; baseCm = bc; p = p2; q = q2; r = r2;
      ansM = dm; ansCm = dc;
      break;
    }

    const baseTotalCm = baseM * 100 + baseCm;
    const ka = baseTotalCm + p;
    const kaM = Math.floor(ka / 100);
    const kaCm = ka % 100;
    const kb = ka - q;
    const kbM = Math.floor(kb / 100);
    const kbCm = kb % 100;

    const explanation: MathExpr = [
      txt(`㉮의 키: ${baseM} m ${baseCm} cm + ${p} cm = ${kaM} m ${kaCm} cm. `),
      txt(`㉯의 키: ${kaM} m ${kaCm} cm − ${q} cm = ${kbM} m ${kbCm} cm. `),
      txt(`㉰의 키: ${kbM} m ${kbCm} cm − ${r} cm = ${ansM} m ${ansCm} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `㉮는 ${baseM} m ${baseCm} cm보다 ${p} cm 더 큽니다.\n㉯는 ㉮보다 ${q} cm 더 작습니다.\n㉰는 ㉯보다 ${r} cm 더 작습니다.\n㉰의 키는 몇 m 몇 cm인가요?`,
      expr: [blank(0), txt(' m '), blank(1), txt(' cm')],
      blankAnswers: [ansM, ansCm],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitTime2 — 시각과 시간
// ═══════════════════════════════════════════════════════════════

/**
 * ch22-elapsed  경과 시간 (몇 시간 몇 분)
 * 시간≥1, 분≥1 보장
 */
const chElapsed: SkillDef = {
  id: 'ch22-elapsed',
  unitId: 'unitTime2',
  title: '경과 시간 (시간 분)',
  note: '경과 시간≥1, 분≥1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let H1 = 9, M1 = 30, H2 = 11, M2 = 50, ansH = 2, ansM = 20;

    for (let tries = 0; tries < 2000; tries++) {
      const h1 = rng.int(8, 14);
      const m1 = rng.int(1, 59);
      const totalMin1 = h1 * 60 + m1;
      // 경과 시간: 1시간 이상 5시간 이하
      const eH = rng.int(1, 4);
      const eM = rng.int(1, 59); // 분 부분 ≥1
      const totalMin2 = totalMin1 + eH * 60 + eM;
      const h2 = Math.floor(totalMin2 / 60);
      const m2 = totalMin2 % 60;
      if (h2 > 20) continue;
      if (m2 < 1) continue; // 분 부분 ≥1

      H1 = h1; M1 = m1; H2 = h2; M2 = m2; ansH = eH; ansM = eM;
      break;
    }

    const timeLabel = (h: number, m: number) => {
      if (h < 12) return `오전 ${h}시 ${m}분`;
      if (h === 12) return `오후 12시 ${m}분`;
      return `오후 ${h - 12}시 ${m}분`;
    };

    const explanation: MathExpr = [
      txt(`시작: ${timeLabel(H1, M1)}, 끝: ${timeLabel(H2, M2)}. `),
      txt(`분으로 계산하면 ${H2 * 60 + M2}−${H1 * 60 + M1}=${ansH * 60 + ansM}분. `),
      txt(`60분씩 묶으면 ${ansH}묶음이고 ${ansM}분이 남아요. `),
      txt(`따라서 머문 시간은 ${ansH}시간 ${ansM}${ida('분')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `어떤 곳에 ${timeLabel(H1, M1)}에 들어가서 ${timeLabel(H2, M2)}에 나왔습니다. 머문 시간은 몇 시간 몇 분인가요?`,
      expr: [blank(0), txt(' 시간 '), blank(1), txt(' 분')],
      blankAnswers: [ansH, ansM],
      explanation,
    };
  },
};

/**
 * ch22-calendar  달력 같은 요일 날짜 추론
 * 첫째 ○요일이 D일 → n째 ○요일 = D + 7×(n−1)
 */
const chCalendar: SkillDef = {
  id: 'ch22-calendar',
  unitId: 'unitTime2',
  title: '달력 같은 요일 날짜 추론',
  note: 'D=1~7, n=2~4, 답≤28',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

    let D = 3, n = 3, dayName = '화', ans = 17;

    for (let tries = 0; tries < 2000; tries++) {
      const D2 = rng.int(1, 7);
      const n2 = rng.int(2, 4);
      const ans2 = D2 + 7 * (n2 - 1);
      if (ans2 > 28) continue;
      D = D2; n = n2; dayName = rng.pick(DAYS); ans = ans2;
      break;
    }

    const ordinal = ['', '첫째', '둘째', '셋째', '넷째'];

    const explanation: MathExpr = [
      txt(`같은 요일은 7일마다 반복돼요. `),
      txt(`${ordinal[1]} ${dayName}요일이 ${D}일이면, `),
      txt(`${ordinal[n]} ${dayName}요일 = ${D} + 7×${n - 1} = ${D} + ${7 * (n - 1)} = ${ans}${ida('일')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `이번 달 ${ordinal[1]} ${dayName}요일이 ${D}일입니다. ${ordinal[n]} ${dayName}요일은 며칠인가요?`,
      expr: [blank(0), txt(' 일')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-bus  일정 간격 출발 횟수
 * 첫차 H시 M분, I분 간격, 낮 12시까지 몇 대?
 */
const chBus: SkillDef = {
  id: 'ch22-bus',
  unitId: 'unitTime2',
  title: '일정 간격 출발 횟수',
  note: 'I=30~60분, 답≥2',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let H = 7, M = 0, I = 30, ans = 11;

    for (let tries = 0; tries < 2000; tries++) {
      const I2 = rng.int(30, 60);
      const H2 = rng.int(6, 9);
      const M2 = rng.int(0, 59);
      const startMin = H2 * 60 + M2;
      const noonMin = 12 * 60;
      if (startMin >= noonMin) continue;
      let count = 0;
      let cur = startMin;
      while (cur <= noonMin) {
        count++;
        cur += I2;
      }
      if (count < 2) continue;
      H = H2; M = M2; I = I2; ans = count;
      break;
    }

    // 출발 시각 나열
    const times: string[] = [];
    let cur = H * 60 + M;
    while (cur <= 12 * 60) {
      const hh = Math.floor(cur / 60);
      const mm = cur % 60;
      times.push(`${hh}시 ${mm > 0 ? mm + '분' : '정각'}`);
      cur += I;
    }

    const explanation: MathExpr = [
      txt(`첫차부터 ${I}분 간격으로 출발 시각을 나열해요. `),
      txt(times.slice(0, 6).join(', ') + (times.length > 6 ? ', …' : '') + '. '),
      txt(`낮 12시까지 출발하는 차는 모두 ${ans}${ida('대')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `첫차가 ${H}시 ${M > 0 ? M + '분' : '정각'}에 출발하고 ${I}분 간격으로 운행합니다. 낮 12시(정오)까지 출발하는 차는 모두 몇 대인가요?`,
      expr: [blank(0), txt(' 대')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitTableGraph — 표와 그래프
// ═══════════════════════════════════════════════════════════════

/**
 * ch22-tablemissing  합계로 빠진 항목 수 구하기
 * 4~5항목, 한 항목 빈칸, 합계 주어짐
 */
const chTableMissing: SkillDef = {
  id: 'ch22-tablemissing',
  unitId: 'unitTableGraph',
  title: '합계로 빠진 항목 수 구하기',
  note: '4~5항목, 빈칸 답≥1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const categoryGroups = [
      { label: '좋아하는 계절', items: ['봄', '여름', '가을', '겨울'] },
      { label: '좋아하는 과목', items: ['국어', '수학', '과학', '체육', '미술'] },
      { label: '반려동물', items: ['강아지', '고양이', '물고기', '햄스터'] },
      { label: '좋아하는 색', items: ['빨강', '파랑', '노랑', '초록', '보라'] },
    ];

    const group = rng.pick(categoryGroups);
    const n = group.items.length;

    // 폴백
    let values: number[] = Array(n).fill(3);
    let total = n * 3;
    let missingIdx = 0;
    let ans = 3;

    for (let tries = 0; tries < 2000; tries++) {
      const vals = Array.from({ length: n }, () => rng.int(2, 8));
      const t = vals.reduce((a, b) => a + b, 0);
      const mi = rng.int(0, n - 1);
      const missing = vals[mi];
      if (missing < 1) continue;
      values = vals;
      total = t;
      missingIdx = mi;
      ans = missing;
      break;
    }

    const knownSum = values.reduce((a, b) => a + b, 0) - values[missingIdx];
    const tableStr = group.items
      .map((item, i) => (i === missingIdx ? `${item}: ?명` : `${item}: ${values[i]}명`))
      .join(', ');

    const explanation: MathExpr = [
      txt(`합계 ${total}명에서 나머지 항목 합 ${knownSum}명을 빼면 `),
      txt(`${total}−${knownSum}=${ans}${ida('명')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `학생 ${total}명을 ${group.label}로 조사했습니다. 표의 빈칸에 들어갈 학생 수는 몇 명인가요?\n${tableStr}, 합계: ${total}명`,
      expr: [blank(0), txt(' 명')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-maxsecond  가장 많은 것 + 두 번째로 적은 것의 합
 * 5항목, 값 유일
 */
const chMaxSecond: SkillDef = {
  id: 'ch22-maxsecond',
  unitId: 'unitTableGraph',
  title: '가장 많은 것 + 두 번째로 적은 것',
  note: '5항목 값 유일, 합 답',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const categoryGroups = [
      { label: '좋아하는 운동', items: ['축구', '농구', '달리기', '수영', '배드민턴'] },
      { label: '좋아하는 간식', items: ['과자', '아이스크림', '빵', '사탕', '과일'] },
      { label: '반 학생 취미', items: ['독서', '게임', '그림', '음악', '운동'] },
    ];

    const group = rng.pick(categoryGroups);

    // 폴백
    let values: number[] = [8, 5, 12, 3, 7];
    let ans = 12 + 5; // max + second_min

    for (let tries = 0; tries < 2000; tries++) {
      const pool: number[] = [];
      while (pool.length < 5) {
        const v = rng.int(2, 15);
        if (!pool.includes(v)) pool.push(v);
      }
      const sorted = [...pool].sort((a, b) => a - b);
      const maxVal = sorted[4];
      const secondMin = sorted[1];
      const ans2 = maxVal + secondMin;
      if (ans2 < 5) continue;
      values = pool;
      ans = ans2;
      break;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const maxVal = sorted[4];
    const secondMin = sorted[1];
    const tableStr = group.items.map((item, i) => `${item}: ${values[i]}명`).join(', ');

    const explanation: MathExpr = [
      txt(`학생 수를 작은 것부터 나열하면: ${sorted.join(', ')}. `),
      txt(`가장 많은 것: ${maxVal}명, 두 번째로 적은 것: ${secondMin}명. `),
      txt(`합: ${maxVal}+${secondMin}=${ans}${ida('명')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `학생들이 좋아하는 ${group.label}을(를) 조사했습니다. 가장 많은 항목과 두 번째로 적은 항목의 학생 수의 합은 몇 명인가요?\n${tableStr}`,
      expr: [blank(0), txt(' 명')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-tablerel  관계 조건으로 항목 수 구하기
 * A=B, 합계 N → C−D = ?
 */
const chTableRel: SkillDef = {
  id: 'ch22-tablerel',
  unitId: 'unitTableGraph',
  title: '관계 조건으로 항목 수 구하기',
  note: 'A=B 조건, 합계로 C-D 구하기, 답≥1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 항목 4개: A, B, C, D. A=B, 합계=N, C와 D는 공개, A(=B)는 미정
    // 답: C-D (또는 A값 자체를 물을 수도 있음)
    const groups = [
      { label: '좋아하는 색', items: ['빨강', '파랑', '노랑', '초록'] },
      { label: '가고 싶은 나라', items: ['한국', '미국', '일본', '프랑스'] },
      { label: '좋아하는 계절', items: ['봄', '여름', '가을', '겨울'] },
    ];
    const group = rng.pick(groups);

    // A(=B)는 미정, C·D 공개, 합계 N → A = (N−C−D)/2 를 묻는다 (관계 필요).
    // 폴백 (A=B=8, C=12, D=5, N=33, ans=8)
    let N = 33, C = 12, D = 5, ans = 8;

    for (let tries = 0; tries < 2000; tries++) {
      const A2 = rng.int(3, 10);     // A=B의 실제 값(=정답)
      const C2 = rng.int(5, 12);
      const D2 = rng.int(2, 8);
      if (C2 === D2) continue;        // C·D는 서로 다르게(표가 자연스럽게)
      const N2 = 2 * A2 + C2 + D2;
      if (N2 < 15 || N2 > 45) continue;
      N = N2; C = C2; D = D2; ans = A2;
      break;
    }

    const [nameA, nameB, nameC, nameD] = group.items;

    const explanation: MathExpr = [
      txt(`${nameC}(${C}명)과 ${nameD}(${D}명)을 합계에서 빼면 ${nameA}과(와) ${nameB}의 합이 나와요. `),
      txt(`${nameA}+${nameB} = ${N}−${C}−${D} = ${N - C - D}명. `),
      txt(`두 수가 같으므로 ${N - C - D}을(를) 2로 똑같이 나누면 ${nameA} = ${ans}${ida('명')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `학생 ${N}명을 ${group.label}로 조사했더니 ${nameA}과(와) ${nameB}을(를) 좋아하는 학생 수가 같았습니다. ${nameC}은(는) ${C}명, ${nameD}은(는) ${D}명일 때 ${nameA}을(를) 좋아하는 학생은 몇 명인가요?`,
      expr: [blank(0), txt(' 명')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitRule2 — 규칙 찾기
// ═══════════════════════════════════════════════════════════════

/**
 * ch22-stacktri  삼각형으로 쌓기 (n층 누적 = n²)
 * 답 = a²−b² (a>b)
 */
const chStackTri: SkillDef = {
  id: 'ch22-stacktri',
  unitId: 'unitRule2',
  title: '삼각형으로 쌓기 (n²)',
  note: 'a=4~8, b=2~(a-1), 답=a²-b²',
  difficulty: 3,
  challenge: true,
  minVariety: 20,
  generate(seed): Problem {
    const rng = new RNG(seed);

    let a = 5, b = 3, ans = 16;

    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(4, 8);
      const b2 = rng.int(2, a2 - 1);
      const diff = a2 * a2 - b2 * b2;
      if (diff < 1) continue;
      a = a2; b = b2; ans = diff;
      break;
    }

    const explanation: MathExpr = [
      txt(`규칙: n층으로 쌓으면 ▲는 n×n=n²개예요. `),
      txt(`${a}층으로 쌓으면 ${a}×${a}=${a * a}개. `),
      txt(`${b}층으로 쌓으면 ${b}×${b}=${b * b}개. `),
      txt(`차: ${a * a}−${b * b}=${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `규칙에 따라 ▲를 쌓습니다. 1층 1개, 2층 4개, 3층 9개, …로 늘어납니다. ${a}층으로 쌓으면 ${b}층으로 쌓을 때보다 ▲가 몇 개 더 필요한가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-stairs  계단식 상자 쌓기 (1+2+…+a)
 * 답 = a(a+1)/2
 */
const chStairs: SkillDef = {
  id: 'ch22-stairs',
  unitId: 'unitRule2',
  title: '계단식 상자 쌓기',
  note: 'a=4~9, 답=a(a+1)/2',
  difficulty: 3,
  challenge: true,
  minVariety: 6,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const a = rng.int(4, 9);
    const ans = (a * (a + 1)) / 2;

    const layers = Array.from({ length: a }, (_, i) => i + 1);

    const explanation: MathExpr = [
      txt(`계단처럼 쌓으면 1층에 1개, 2층에 2개, …, ${a}층에 ${a}개가 필요해요. `),
      txt(`모두 더하면 ${layers.join('+')}=${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `규칙에 따라 상자를 계단처럼 쌓습니다. 맨 위층부터 1개, 2개, 3개, … 씩 늘어납니다. ${a}층으로 쌓으려면 상자는 모두 몇 개 필요한가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch22-seq  수 배열 규칙 (등차) n번째 수
 * 답 = f + (k−1)×d
 */
const chSeq: SkillDef = {
  id: 'ch22-seq',
  unitId: 'unitRule2',
  title: '수 배열 규칙 (등차) n번째 수',
  note: 'f=1~9, d=2~6, k=5~9',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const f = rng.int(1, 9);
    const d = rng.int(2, 6);
    const k = rng.int(5, 9);
    const ans = f + (k - 1) * d;

    // 앞 4개 나열
    const seq = Array.from({ length: 4 }, (_, i) => f + i * d);

    const explanation: MathExpr = [
      txt(`수가 ${d}씩 커지는 규칙이에요. `),
      txt(`첫 번째 수가 ${f}이므로, k번째 수 = ${f}+(k−1)×${d}. `),
      txt(`${k}번째 수 = ${f}+(${k}−1)×${d} = ${f}+${(k - 1) * d} = ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `규칙에 따라 수를 늘어놓았습니다: ${seq.join(', ')}, … ${k}번째 수는 얼마인가요?`,
      expr: [blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  내보내기
// ═══════════════════════════════════════════════════════════════

export const challengeG2S2Skills: SkillDef[] = [
  // unitNum4d
  chCard4,
  chCond4,
  chJump4,
  // unitGugu
  chShapeSides,
  chTarget,
  chFactorTimes,
  // unitLength22
  chMcmDiff,
  chTapeOverlap,
  chHeightRel,
  // unitTime2
  chElapsed,
  chCalendar,
  chBus,
  // unitTableGraph
  chTableMissing,
  chMaxSecond,
  chTableRel,
  // unitRule2
  chStackTri,
  chStairs,
  chSeq,
];
