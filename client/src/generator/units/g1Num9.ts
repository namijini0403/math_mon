/**
 * 단원: 9까지의 수 (2022 개정교육과정 1-1 1단원)
 * 성취기준: 9까지의 수를 세고, 순서·크기를 비교하며, 서수를 이해한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// 이모지 풀 10종
const EMOJIS = ['🍎', '🍌', '🍇', '🐰', '🐶', '⭐', '🌸', '🚗', '⚽', '🎈'];

// ── 1. num9-count  이모지 세기 (fill-blanks)  난이도 1 ──────────────────
const num9Count: SkillDef = {
  id: 'num9-count',
  unitId: 'unitNum9',
  difficulty: 1,
  title: '이모지 세기',
  note: '이모지를 나열하고 개수를 센다. fill-blanks. 수 범위 1~9.',
  minVariety: 90,
  generate(seed) {
    const rng = new RNG(seed);
    const emoji = rng.pick(EMOJIS);
    const count = rng.int(1, 9);
    const display = emoji.repeat(count);

    const expr: MathExpr = [
      { kind: 'blank', slot: 0 },
      txt('개'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${display}\n개수를 세어 쓰세요.`,
      expr,
      blankAnswers: [count],
      explanation: [txt(`하나씩 차례로 세어 보면 ${emoji}이(가) 모두 ${count}개예요.`)],
    };
  },
};

// ── 2. num9-order  수 순서 (1 큰 수·1 작은 수·사이 수) (fill-blanks)  난이도 1 ─
const num9Order: SkillDef = {
  id: 'num9-order',
  unitId: 'unitNum9',
  difficulty: 1,
  title: '수 순서',
  note: '1 큰 수, 1 작은 수, 사이 수. fill-blanks. 수 범위 1~9.',
  minVariety: 21,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2); // 0: 1 큰 수, 1: 1 작은 수, 2: 사이 수

    let promptStr: string;
    let answer: number;
    const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
    let explanation: MathExpr;

    if (pat === 0) {
      // 1 큰 수: 1~8 → 2~9
      const n = rng.int(1, 8);
      answer = n + 1;
      promptStr = `${n}보다 1 큰 수는 얼마인가요?`;
      explanation = [txt(`${n} 다음 수를 세면 ${answer}이에요. 그래서 ${n}보다 1 큰 수는 ${answer}이에요.`)];
    } else if (pat === 1) {
      // 1 작은 수: 2~9 → 1~8
      const n = rng.int(2, 9);
      answer = n - 1;
      promptStr = `${n}보다 1 작은 수는 얼마인가요?`;
      explanation = [txt(`${n} 바로 앞의 수는 ${answer}예요. 그래서 ${n}보다 1 작은 수는 ${answer}예요.`)];
    } else {
      // 사이 수: a, _, a+2 → 빈칸에 a+1
      const a = rng.int(1, 7);
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

// ── 3. num9-compare  크기 비교 (comparison)  난이도 1 ──────────────────
const num9Compare: SkillDef = {
  id: 'num9-compare',
  unitId: 'unitNum9',
  difficulty: 1,
  title: '수 크기 비교',
  note: '1~9 두 수의 크기 비교. comparison 형식.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number;
    a = 3; b = 5;
    for (let tries = 0; tries < 100; tries++) {
      const ta = rng.int(1, 9);
      const tb = rng.int(1, 9);
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
      // 부등호는 '클릭 선택'(ComparisonView)으로만 입력. 풀이는 말로 짚어 주고 기호도 함께 보여준다.
      explanation: [
        txt(`수를 순서대로 늘어놓으면 뒤에 오는 수가 더 커요. ${a}은(는) ${b}보다 ${a < b ? '작아요' : '커요'}. 그래서 ${a} ${answer} ${b} 예요.`),
      ],
    };
  },
};

// ── 4. num9-ordinal  몇째 서수 (choice)  난이도 2 ──────────────────────
const ORDINALS = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'];

const num9Ordinal: SkillDef = {
  id: 'num9-ordinal',
  unitId: 'unitNum9',
  difficulty: 2,
  title: '몇째 서수',
  note: '이모지 줄에서 앞에서/뒤에서 몇째인지 고르기. choice.',
  minVariety: 45,
  generate(seed) {
    const rng = new RNG(seed);
    const len = rng.int(4, 9);
    const emojis = rng.sample(EMOJIS, Math.min(len, EMOJIS.length));
    // 배열 길이가 len보다 작을 수 있으므로 pad
    while (emojis.length < len) emojis.push(rng.pick(EMOJIS));
    const pos = rng.int(0, len - 1); // 0-indexed
    const fromFront = rng.chance(0.5);

    const ordinalIdx = fromFront ? pos : len - 1 - pos;
    const answer = ORDINALS[ordinalIdx];
    const display = emojis.join('');

    const answerVal = txc(answer);
    // 오답: 인접 서수들
    const cands: ChoiceValue[] = [];
    for (let i = 0; i < 9 && cands.length < 3; i++) {
      if (i !== ordinalIdx) cands.push(txc(ORDINALS[i]));
    }
    const { choices, answerIndex } = buildChoices(answerVal, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${display}\n${fromFront ? '앞' : '뒤'}에서 ${emojis[pos]}은(는) 몇째인가요?`,
      choices,
      answerIndex,
      explanation: [
        txt(`${fromFront ? '앞' : '뒤'}에서부터 하나씩 세면 ${ordinalIdx + 1}번째에 있어요. 그래서 ${answer}예요.`),
      ],
    };
  },
};

// ── 5. num9-word  문장제 (fill-blanks)  난이도 2 ───────────────────────
const ITEMS = ['사과', '바나나', '포도', '딸기', '귤', '별', '풍선', '공', '꽃', '구슬'];

const num9Word: SkillDef = {
  id: 'num9-word',
  unitId: 'unitNum9',
  difficulty: 2,
  word: true,
  title: '9까지의 수 문장제',
  note: '수 세기·비교·순서 관련 1학년 수준 문장제. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);
    const item = rng.pick(ITEMS);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 더 세기: a개 있는데 b개 더 받으면 (합 ≤ 9)
      let a = 2, b = 3;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(1, 7);
        const tb = rng.int(1, 9 - ta);
        if (tb >= 1) { a = ta; b = tb; break; }
      }
      answer = a + b;
      promptStr = `${item}가 ${a}개 있어요. ${b}개를 더 받으면 모두 몇 개인가요?`;
      explanation = [txt(`${a}개에서 ${b}개를 더 세면 ${a} + ${b} = ${answer}이에요. 모두 ${answer}개예요.`)];
    } else if (pat === 1) {
      // 남은 수 세기: a개에서 b개 먹으면 (차 ≥ 1)
      let a = 5, b = 2;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(2, 9);
        const tb = rng.int(1, ta - 1);
        a = ta; b = tb; break;
      }
      answer = a - b;
      promptStr = `${item}가 ${a}개 있어요. ${b}개를 먹으면 몇 개가 남나요?`;
      explanation = [txt(`${a}개에서 ${b}개를 덜어 내면 ${a} − ${b} = ${answer}이에요. ${answer}개가 남아요.`)];
    } else {
      // 비교: 두 묶음 중 더 많은 쪽
      let a = 3, b = 5;
      for (let tries = 0; tries < 100; tries++) {
        const ta = rng.int(1, 8);
        const tb = rng.int(1, 9);
        if (ta !== tb) { a = ta; b = tb; break; }
      }
      answer = Math.max(a, b);
      const item2 = rng.pick(ITEMS.filter(i => i !== item));
      promptStr = `${item}가 ${a}개, ${item2}가 ${b}개 있어요. 더 많은 것은 몇 개인가요?`;
      explanation = [txt(`${a}개와 ${b}개를 비교하면 ${answer}개가 더 많아요. 그래서 답은 ${answer}개예요.`)];
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
export const unitNum9Skills: SkillDef[] = [
  num9Count,
  num9Order,
  num9Compare,
  num9Ordinal,
  num9Word,
];
