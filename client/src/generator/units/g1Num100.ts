/**
 * 단원: 100까지의 수 (2022 개정교육과정 1-2 1단원)
 * 성취기준: 100까지의 수를 몇십몇으로 나타내고, 순서·크기를 비교하며, 짝수·홀수를 안다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. num100-compose  몇십몇 구성 (fill-blanks)  난이도 1 ──────────────────
const num100Compose: SkillDef = {
  id: 'num100-compose',
  unitId: 'unitNum100',
  difficulty: 1,
  title: '몇십몇 구성',
  note: '10개씩 묶음 n개 + 낱개 m개 = ?. fill-blanks. 합 51~99.',
  minVariety: 45,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 묶음+낱개 → 수
      const bundles = rng.int(5, 9);
      const singles = rng.int(1, 9);
      const ans = bundles * 10 + singles;

      const expr: MathExpr = [{ kind: 'blank', slot: 0 }];

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
      const bundles = rng.int(5, 9);
      const singles = rng.int(1, 9);
      const total = bundles * 10 + singles;

      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];

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

// ── 2. num100-order  수 순서·사이 수 (fill-blanks)  난이도 1 ────────────────
const num100Order: SkillDef = {
  id: 'num100-order',
  unitId: 'unitNum100',
  difficulty: 1,
  title: '수 순서·사이 수',
  note: '1 큰 수, 1 작은 수, 사이 수. fill-blanks. 수 범위 51~99.',
  minVariety: 48,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;
    const expr: MathExpr = [{ kind: 'blank', slot: 0 }];

    if (pat === 0) {
      // 1 큰 수
      const n = rng.int(51, 99);
      answer = n + 1;
      promptStr = `${n}보다 1 큰 수는 얼마인가요?`;
      explanation = [txt(`${n} 다음 수를 세면 ${answer}이에요. 그래서 ${n}보다 1 큰 수는 ${answer}이에요.`)];
    } else if (pat === 1) {
      // 1 작은 수
      const n = rng.int(52, 100);
      answer = n - 1;
      promptStr = `${n}보다 1 작은 수는 얼마인가요?`;
      explanation = [txt(`${n} 바로 앞의 수는 ${answer}예요. 그래서 ${n}보다 1 작은 수는 ${answer}예요.`)];
    } else {
      // 사이 수: a, ?, a+2
      const a = rng.int(51, 98);
      answer = a + 1;
      promptStr = `${a}과 ${a + 2} 사이에 있는 수는 얼마인가요?`;
      explanation = [txt(`${a}, ${answer}, ${a + 2}을 순서대로 세어 보면 가운데 수는 ${answer}예요.`)];
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

// ── 3. num100-compare  크기 비교 (comparison)  난이도 2 ─────────────────────
const num100Compare: SkillDef = {
  id: 'num100-compare',
  unitId: 'unitNum100',
  difficulty: 2,
  title: '100까지 수 크기 비교',
  note: '50~100 두 수의 크기 비교. comparison 형식.',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    let a = 63, b = 75;
    for (let tries = 0; tries < 100; tries++) {
      const ta = rng.int(50, 100);
      const tb = rng.int(50, 100);
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
      // 부등호는 클릭 선택(ComparisonView). 풀이는 어느 수가 큰지 말로 + 기호 병기.
      explanation: [txt(`${a}와 ${b} 중에서 ${Math.max(a, b)}이 더 커요. 그래서 ${a} ${answer} ${b}예요.`)],
    };
  },
};

// ── 4. num100-evenodd  짝수·홀수 (choice)  난이도 2 ──────────────────────────
const num100EvenOdd: SkillDef = {
  id: 'num100-evenodd',
  unitId: 'unitNum100',
  difficulty: 2,
  title: '짝수·홀수',
  note: '주어진 수가 짝수인지 홀수인지 고르기. choice.',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    const n = rng.int(51, 99);
    const isEven = n % 2 === 0;
    const correctLabel = isEven ? '짝수' : '홀수';

    const answerVal = txc(correctLabel);
    const cands: ChoiceValue[] = [
      txc(isEven ? '홀수' : '짝수'),
      txc('모름'),
      txc('둘 다'),
    ];
    const { choices, answerIndex } = buildChoices(answerVal, cands, rng);

    // 1학년은 나눗셈을 배우기 전 — 짝수/홀수는 '둘씩 짝짓기'로 설명한다.
    const reason = isEven
      ? `${n}개를 둘씩 짝지으면 남는 것이 없어요. 그래서 ${n}은 짝수예요.`
      : `${n}개를 둘씩 짝지으면 하나가 남아요. 그래서 ${n}은 홀수예요.`;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${n}은 짝수인가요, 홀수인가요?`,
      choices,
      answerIndex,
      explanation: [txt(reason)],
    };
  },
};

// ── 5. num100-word  문장제 (fill-blanks)  난이도 2 ───────────────────────────
const BUNDLE_ITEMS = ['연필', '사탕', '구슬', '딸기', '꽃', '카드', '풍선', '단추', '도토리', '별사탕'];

const num100Word: SkillDef = {
  id: 'num100-word',
  unitId: 'unitNum100',
  difficulty: 2,
  word: true,
  title: '100까지의 수 문장제',
  note: '묶음·낱개 수 세기 1학년 수준 문장제. fill-blanks.',
  minVariety: 80,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const item = rng.pick(BUNDLE_ITEMS);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 묶음+낱개 → 합
      const bundles = rng.int(5, 9);
      const singles = rng.int(1, 9);
      answer = bundles * 10 + singles;
      promptStr = `${item}이 10개씩 ${bundles}묶음과 낱개 ${singles}개 있어요. 모두 몇 개인가요?`;
      explanation = [txt(`10개씩 ${bundles}묶음은 ${bundles * 10}개예요. 낱개 ${singles}개와 합치면 ${answer}개예요.`)];
    } else {
      // 몇 십 + 몇 개 더
      let base = 50, extra = 3;
      for (let tries = 0; tries < 100; tries++) {
        const tb = rng.int(5, 9) * 10;
        const te = rng.int(1, 9);
        if (tb + te <= 99) { base = tb; extra = te; break; }
      }
      answer = base + extra;
      promptStr = `${item}이 ${base}개 있었어요. ${extra}개를 더 가져오면 모두 몇 개인가요?`;
      explanation = [txt(`${base}개에 ${extra}개를 더하면 ${base} + ${extra} = ${answer}이에요. 모두 ${answer}개예요.`)];
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
export const unitNum100Skills: SkillDef[] = [
  num100Compose,
  num100Order,
  num100Compare,
  num100EvenOdd,
  num100Word,
];
