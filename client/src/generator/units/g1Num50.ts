/**
 * 단원: 50까지의 수 (2022 개정교육과정 1-1 5단원)
 * 성취기준: 50까지의 수를 10개씩 묶음·낱개로 나타내고, 순서·크기를 비교한다.
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. num50-compose  묶음+낱개 구성 (fill-blanks)  난이도 1 ────────────
const num50Compose: SkillDef = {
  id: 'num50-compose',
  unitId: 'unitNum50',
  difficulty: 1,
  title: '묶음+낱개 구성',
  note: '10개씩 묶음 n개 + 낱개 m개 = ?. fill-blanks. 합 ≤ 50.',
  minVariety: 45,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 묶음+낱개 → 수
      const bundles = rng.int(1, 4);
      const singles = rng.int(1, 9);
      const ans = bundles * 10 + singles;

      const expr: MathExpr = [
        { kind: 'blank', slot: 0 },
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `10개씩 묶음이 ${bundles}개, 낱개가 ${singles}개이면 모두 몇 개인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`10개씩 ${bundles}묶음은 ${bundles * 10}개예요. 낱개 ${singles}개와 합치면 ${ans}개예요.`)],
      };
    } else {
      // 수 → 낱개 개수 물어보기
      const bundles = rng.int(1, 4);
      const singles = rng.int(1, 9);
      const total = bundles * 10 + singles;

      const expr: MathExpr = [
        { kind: 'blank', slot: 0 },
        txt('개'),
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${total}은 10개씩 묶음 ${bundles}개와 낱개 몇 개인가요?`,
        expr,
        blankAnswers: [singles],
        explanation: [txt(`${total}은 10개씩 ${bundles}묶음(${bundles * 10}개)과 낱개로 이루어져요. 그래서 낱개는 ${singles}개예요.`)],
      };
    }
  },
};

// ── 2. num50-split  십몇 가르기 (fill-blanks)  난이도 1 ─────────────────
const num50Split: SkillDef = {
  id: 'num50-split',
  unitId: 'unitNum50',
  difficulty: 1,
  title: '십몇 가르기',
  note: '10과 낱개로 가르기. fill-blanks. 수 범위 11~19.',
  minVariety: 9,
  generate(seed) {
    const rng = new RNG(seed);
    const singles = rng.int(1, 9);
    const total = 10 + singles;
    // 패턴: total은 10과 singles로 가를 수 있어요
    // 빈칸: 낱개 수

    const expr: MathExpr = [
      txt(`${total}은 10과 `),
      { kind: 'blank', slot: 0 },
      txt('으로 가를 수 있어요.'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${total}을 10과 얼마로 가를 수 있나요?`,
      expr,
      blankAnswers: [singles],
      explanation: [txt(`${total} = 10 + ${singles}이에요.`)],
    };
  },
};

// ── 3. num50-order  수 순서 (fill-blanks)  난이도 1 ────────────────────
const num50Order: SkillDef = {
  id: 'num50-order',
  unitId: 'unitNum50',
  difficulty: 1,
  title: '50까지 수 순서',
  note: '1 큰 수, 1 작은 수, 사이 수. fill-blanks. 수 범위 10~50.',
  minVariety: 39,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;
    const expr: MathExpr = [{ kind: 'blank', slot: 0 }];

    if (pat === 0) {
      // 1 큰 수
      const n = rng.int(10, 49);
      answer = n + 1;
      promptStr = `${n}보다 1 큰 수는 얼마인가요?`;
      explanation = [txt(`${n} 다음 수를 세면 ${answer}이에요. 그래서 ${n}보다 1 큰 수는 ${answer}이에요.`)];
    } else if (pat === 1) {
      // 1 작은 수
      const n = rng.int(11, 50);
      answer = n - 1;
      promptStr = `${n}보다 1 작은 수는 얼마인가요?`;
      explanation = [txt(`${n} 바로 앞의 수는 ${answer}예요. 그래서 ${n}보다 1 작은 수는 ${answer}예요.`)];
    } else {
      // 사이 수: a, ?, a+2
      const a = rng.int(10, 48);
      answer = a + 1;
      promptStr = `${a}과(와) ${a + 2} 사이에 있는 수는 얼마인가요?`;
      explanation = [txt(`${a}, ${answer}, ${a + 2}을(를) 순서대로 세어 보면 가운데 수는 ${answer}예요.`)];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptStr,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 4. num50-compare  크기 비교 (comparison)  난이도 2 ─────────────────
const num50Compare: SkillDef = {
  id: 'num50-compare',
  unitId: 'unitNum50',
  difficulty: 2,
  title: '50까지 수 크기 비교',
  note: '10~50 두 수의 크기 비교. comparison 형식.',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number;
    a = 23; b = 35;
    for (let tries = 0; tries < 100; tries++) {
      const ta = rng.int(10, 50);
      const tb = rng.int(10, 50);
      if (ta !== tb) { a = ta; b = tb; break; }
    }

    const answer: '<' | '>' | '=' = a < b ? '<' : a > b ? '>' : '=';

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '두 수의 크기를 비교하세요.',
      left: [{ kind: 'decimal', v: a }],
      right: [{ kind: 'decimal', v: b }],
      answer,
      // 부등호는 클릭 선택(ComparisonView). 풀이는 어느 수가 큰지 말로 짚고 기호도 함께.
      explanation: [
        txt(`${a}와(과) ${b} 중에서 ${Math.max(a, b)}이(가) 더 커요. 그래서 ${a} ${answer} ${b}예요.`),
      ],
    };
  },
};

// ── 5. num50-word  문장제 (fill-blanks)  난이도 2 ──────────────────────
const BUNDLE_ITEMS = ['연필', '사탕', '구슬', '딸기', '꽃', '카드', '풍선', '단추'];

const num50Word: SkillDef = {
  id: 'num50-word',
  unitId: 'unitNum50',
  difficulty: 2,
  word: true,
  title: '50까지의 수 문장제',
  note: '묶음·낱개 수 세기 1학년 수준 문장제. fill-blanks.',
  minVariety: 64,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const item = rng.pick(BUNDLE_ITEMS);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 묶음+낱개 → 합
      const bundles = rng.int(1, 4);
      const singles = rng.int(1, 9);
      answer = bundles * 10 + singles;
      promptStr = `${item}이 10개씩 ${bundles}묶음과 낱개 ${singles}개 있어요. 모두 몇 개인가요?`;
      explanation = [txt(`10개씩 ${bundles}묶음은 ${bundles * 10}개예요. 낱개 ${singles}개와 합치면 ${answer}개예요.`)];
    } else {
      // 두 묶음 합산
      let a = 13, b = 25;
      for (let tries = 0; tries < 100; tries++) {
        const bA = rng.int(1, 2);
        const sA = rng.int(1, 9);
        const bB = rng.int(1, 2);
        const sB = rng.int(1, 9);
        const ta = bA * 10 + sA;
        const tb = bB * 10 + sB;
        if (ta + tb <= 50) { a = ta; b = tb; break; }
      }
      answer = a + b;
      const item2 = rng.pick(BUNDLE_ITEMS.filter(i => i !== item));
      promptStr = `${item}이 ${a}개, ${item2}이 ${b}개 있어요. 모두 몇 개인가요?`;
      explanation = [txt(`${a}개와 ${b}개를 더하면 ${a} + ${b} = ${answer}이에요. 모두 ${answer}개예요.`)];
    }

    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt('개'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptStr,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitNum50Skills: SkillDef[] = [
  num50Compose,
  num50Split,
  num50Order,
  num50Compare,
  num50Word,
];
