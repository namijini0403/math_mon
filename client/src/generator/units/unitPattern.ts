/**
 * 단원: 규칙과 대응 (2022 개정교육과정 5-1 3단원)
 * 성취기준: 두 양 사이의 대응 관계를 찾아 식으로 나타내고, 규칙을 적용하여 미지수를 구한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import { nj } from '../josa';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;

// ○ = △ × k 또는 ○ = △ + k 규칙 타입
type RuleKind = 'mul' | 'add' | 'muladd';

interface Rule {
  kind: RuleKind;
  k: number;
  c: number; // muladd 에서만 사용: ○ = △ × k + c
}

/** △ 값 4개 생성 (1~5 범위, 연속 정수) */
function makeDeltaSeq(rng: RNG): number[] {
  const start = rng.int(1, 7);
  return [start, start + 1, start + 2, start + 3];
}

/** 규칙에 따라 ○ 값 계산 */
function applyRule(delta: number, rule: Rule): number {
  if (rule.kind === 'mul') return delta * rule.k;
  if (rule.kind === 'add') return delta + rule.k;
  return delta * rule.k + rule.c;
}

/** 규칙을 한국어 식 문자열로 표현 */
function ruleText(rule: Rule): string {
  if (rule.kind === 'mul') return `○ = △ × ${rule.k}`;
  if (rule.kind === 'add') return `○ = △ + ${rule.k}`;
  return `○ = △ × ${rule.k} + ${rule.c}`;
}

/** 규칙 생성 (pat-table-fill, pat-rule-pick용: mul 또는 add만) */
function makeSimpleRule(rng: RNG): Rule {
  const kind: RuleKind = rng.chance(0.5) ? 'mul' : 'add';
  const k = rng.int(2, 9);
  return { kind, k, c: 0 };
}

/** 결과값이 200 이하인지 검증하면서 muladd 규칙 생성 */
function makeMulAddRule(rng: RNG): Rule {
  // ○ = △ × k + c, △ 최대 5, 결과 ≤ 200
  const k = rng.int(2, 9);
  const c = rng.int(1, Math.min(9, 200 - 5 * k));
  return { kind: 'muladd', k, c };
}

// ─────────────────────────────────────────────────────────────
// 스킬 1: pat-table-fill — 대응표 빈칸 채우기
// ─────────────────────────────────────────────────────────────
const patTableFill: SkillDef = {
  id: 'pat-table-fill',
  unitId: 'unitPattern',
  difficulty: 1,
  title: '대응표 빈칸 채우기',
  note: '○ = △ × k 또는 ○ = △ + k 규칙의 대응표에서 □ 채우기',
  generate(seed) {
    const rng = new RNG(seed);
    const rule = makeSimpleRule(rng);
    const deltas = makeDeltaSeq(rng);
    const circles = deltas.map((d) => applyRule(d, rule));

    // 빈칸을 어느 위치에 만들지 (마지막 ○ 값)
    const blankAnswer = circles[3];

    // 최대값 안전 확인
    if (circles.some((v) => v > 200 || v < 1)) {
      // 안전한 범위 재설정: mul이면 k 축소
      const safeK = rule.kind === 'mul' ? 2 : rule.k;
      const safeRule: Rule = { ...rule, k: safeK };
      const safeCircles = deltas.map((d) => applyRule(d, safeRule));
      const safeAnswer = safeCircles[3];

      const expr: MathExpr = [
        txt(`△: ${deltas[0]}, ${deltas[1]}, ${deltas[2]}, ${deltas[3]}  →  ○: ${safeCircles[0]}, ${safeCircles[1]}, ${safeCircles[2]}, `),
        { kind: 'blank', slot: 0 },
      ];

      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: '대응표의 □ 안에 알맞은 수를 써넣으세요.',
        expr,
        blankAnswers: [safeAnswer],
        explanation: [
          txt(
            `△가 1씩 커질 때 ○는 ${safeK}씩 커져요. ${ruleText(safeRule)}이므로 △가 ${deltas[3]}이면 ○는 ${deltas[3]} ${safeRule.kind === 'mul' ? '×' : '+'} ${safeK} = ${safeAnswer}이에요.`,
          ),
        ],
      };
    }

    const expr: MathExpr = [
      txt(`△: ${deltas[0]}, ${deltas[1]}, ${deltas[2]}, ${deltas[3]}  →  ○: ${circles[0]}, ${circles[1]}, ${circles[2]}, `),
      { kind: 'blank', slot: 0 },
    ];

    const diffWord = rule.kind === 'mul' ? `${rule.k}배씩` : `${rule.k}씩`;
    const opWord = rule.kind === 'mul' ? '×' : '+';

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '대응표의 □ 안에 알맞은 수를 써넣으세요.',
      expr,
      blankAnswers: [blankAnswer],
      explanation: [
        txt(
          `△가 1씩 커질 때 ○는 ${diffWord} 커져요. ${ruleText(rule)}이므로 △가 ${deltas[3]}이면 ○는 ${deltas[3]} ${opWord} ${rule.k} = ${blankAnswer}이에요.`,
        ),
      ],
    };
  },
};

// ─────────────────────────────────────────────────────────────
// 스킬 2: pat-rule-pick — 대응표 보고 관계식 고르기
// ─────────────────────────────────────────────────────────────
const patRulePick: SkillDef = {
  id: 'pat-rule-pick',
  unitId: 'unitPattern',
  difficulty: 2,
  title: '대응 관계식 고르기',
  note: '대응표를 보여주고 규칙에 맞는 관계식을 4지선다로 고르기',
  generate(seed) {
    const rng = new RNG(seed);
    const rule = makeSimpleRule(rng);
    const deltas = makeDeltaSeq(rng);
    const circles = deltas.map((d) => applyRule(d, rule));

    // 안전 범위 확인
    const k = circles.every((v) => v >= 1 && v <= 200) ? rule.k : 2;
    const safeRule: Rule = { ...rule, k };
    const safeCircles = deltas.map((d) => applyRule(d, safeRule));

    const answerText = ruleText(safeRule);
    const answer: ChoiceValue = { kind: 'text', text: answerText };

    // 오답 후보: 다른 연산 / 다른 수
    const otherK1 = k === 2 ? 3 : k - 1;
    const otherK2 = k === 9 ? 8 : k + 1;
    const otherK3 = k >= 5 ? k - 2 : k + 2;
    const flipKind: RuleKind = safeRule.kind === 'mul' ? 'add' : 'mul';

    const candidates: ChoiceValue[] = [
      { kind: 'text', text: ruleText({ ...safeRule, k: otherK1 }) },
      { kind: 'text', text: ruleText({ ...safeRule, k: otherK2 }) },
      { kind: 'text', text: ruleText({ kind: flipKind, k, c: 0 }) },
      { kind: 'text', text: ruleText({ ...safeRule, k: otherK3 }) },
      { kind: 'text', text: ruleText({ kind: flipKind, k: otherK1, c: 0 }) },
      { kind: 'text', text: ruleText({ kind: flipKind, k: otherK2, c: 0 }) },
    ];

    const { choices, answerIndex } = buildChoices(answer, candidates, rng);

    const tableText = `△: ${deltas[0]}, ${deltas[1]}, ${deltas[2]}, ${deltas[3]}  →  ○: ${safeCircles[0]}, ${safeCircles[1]}, ${safeCircles[2]}, ${safeCircles[3]}`;
    const opWord = safeRule.kind === 'mul' ? `×${k}` : `+${k}`;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: '대응표를 보고 ○와 △의 관계를 나타낸 식을 고르세요.',
      expr: [txt(tableText)],
      choices,
      answerIndex,
      explanation: [
        txt(
          `△에 ${opWord}하면 ○가 돼요. 따라서 두 양의 대응 관계는 ${answerText}이에요.`,
        ),
      ],
    };
  },
};

// ─────────────────────────────────────────────────────────────
// 스킬 3: pat-apply — 관계식 적용하기
// ─────────────────────────────────────────────────────────────
const patApply: SkillDef = {
  id: 'pat-apply',
  unitId: 'unitPattern',
  difficulty: 2,
  title: '관계식 적용하기',
  note: '○ = △ × k + c 관계식 주고 △ 값 대입해 ○ 구하기',
  generate(seed) {
    const rng = new RNG(seed);
    // 절반은 muladd, 나머지는 단순 mul
    const useMulAdd = rng.chance(0.5);
    const rule: Rule = useMulAdd ? makeMulAddRule(rng) : { kind: 'mul', k: rng.int(2, 9), c: 0 };

    // △ 값: 결과가 200 이하이고 1 이상인 값 선택
    let delta = rng.int(3, 15);
    let result = applyRule(delta, rule);
    // 범위 안에 들어오도록 조정
    if (result > 200) {
      delta = rng.int(2, Math.floor((200 - rule.c) / rule.k));
      result = applyRule(delta, rule);
    }
    if (result < 1) {
      delta = 3;
      result = applyRule(3, rule);
    }

    const exprText = useMulAdd
      ? `○ = △ × ${rule.k} + ${rule.c}`
      : `○ = △ × ${rule.k}`;

    const calcText = useMulAdd
      ? `${delta} × ${rule.k} + ${rule.c} = ${delta * rule.k} + ${rule.c} = ${result}`
      : `${delta} × ${rule.k} = ${result}`;

    const expr: MathExpr = [
      txt(`${exprText}일 때, △가 ${delta}이면 ○는 얼마인가요?`),
      txt('  ○ = '),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '관계식을 이용하여 □ 안에 알맞은 수를 구하세요.',
      expr,
      blankAnswers: [result],
      explanation: [
        txt(
          `${exprText}이므로 △에 ${nj(delta, '을/를')} 넣으면 ○ = ${calcText}이에요.`,
        ),
      ],
    };
  },
};

// ─────────────────────────────────────────────────────────────
// 스킬 4: pat-inverse — 역방향: ○ 알 때 △ 구하기
// ─────────────────────────────────────────────────────────────
const patInverse: SkillDef = {
  id: 'pat-inverse',
  unitId: 'unitPattern',
  difficulty: 3,
  title: '역방향으로 △ 구하기',
  note: '○ = △ × k에서 ○ 값 주고 △ 역산. 나누어떨어지는 값만 출제',
  generate(seed) {
    const rng = new RNG(seed);
    const k = rng.int(2, 9);
    // 나누어떨어지는 ○ 만들기: delta × k, delta는 2~20 범위
    const delta = rng.int(2, Math.min(20, Math.floor(200 / k)));
    const circle = delta * k;

    const expr: MathExpr = [
      txt(`○ = △ × ${k}일 때, ○가 ${circle}이면 △는 얼마인가요?`),
      txt('  △ = '),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '관계식을 이용하여 □ 안에 알맞은 수를 구하세요.',
      expr,
      blankAnswers: [delta],
      explanation: [
        txt(
          `○ = △ × ${k}이므로 △ = ○ ÷ ${k}이에요. ${circle} ÷ ${k} = ${delta}이에요.`,
        ),
      ],
    };
  },
};

// ─────────────────────────────────────────────────────────────
// 스킬 5: pat-word — 실생활 대응 문장제
// ─────────────────────────────────────────────────────────────

interface WordTemplate {
  /** 문제 문장 생성 함수 */
  makePromptText: (n: number) => string;
  /** 설명 문장 생성 함수 */
  makeExplain: (n: number, answer: number, rule: Rule) => string;
  rule: Rule;
  /** △의 최솟값 */
  deltaMin: number;
  /** △의 최댓값 (결과 ≤ 200 기준) */
  deltaMax: number;
}

const WORD_TEMPLATES: WordTemplate[] = [
  // 탁자·의자 (× 4)
  {
    rule: { kind: 'mul', k: 4, c: 0 },
    deltaMin: 2,
    deltaMax: 20,
    makePromptText: (n) =>
      `탁자 1개에 의자가 4개씩 놓여 있어요. 탁자가 ${n}개이면 의자는 모두 몇 개인가요?  의자 수 = `,
    makeExplain: (n, ans) =>
      `탁자 수(△)와 의자 수(○) 사이의 관계는 ○ = △ × 4이에요. △가 ${n}이면 ○ = ${n} × 4 = ${ans}이에요.`,
  },
  // 자동차·바퀴 (× 4)
  {
    rule: { kind: 'mul', k: 4, c: 0 },
    deltaMin: 2,
    deltaMax: 20,
    makePromptText: (n) =>
      `자동차 한 대에 바퀴가 4개씩 있어요. 자동차가 ${n}대이면 바퀴는 모두 몇 개인가요?  바퀴 수 = `,
    makeExplain: (n, ans) =>
      `자동차 수(△)와 바퀴 수(○) 사이의 관계는 ○ = △ × 4이에요. △가 ${n}이면 ○ = ${n} × 4 = ${ans}이에요.`,
  },
  // 1분에 물 5 L (× 5)
  {
    rule: { kind: 'mul', k: 5, c: 0 },
    deltaMin: 2,
    deltaMax: 20,
    makePromptText: (n) =>
      `수도에서 1분에 물이 5 L씩 나와요. ${n}분 동안 받은 물은 몇 L인가요?  물의 양 = `,
    makeExplain: (n, ans) =>
      `시간(△)과 물의 양(○) 사이의 관계는 ○ = △ × 5이에요. △가 ${n}이면 ○ = ${n} × 5 = ${ans} L이에요.`,
  },
  // 성냥개비·삼각형 이어붙이기 (× 2 + 1)
  {
    rule: { kind: 'muladd', k: 2, c: 1 },
    deltaMin: 2,
    deltaMax: 20,
    makePromptText: (n) =>
      `성냥개비로 삼각형을 이어 붙여요. 삼각형 1개는 성냥개비 3개, 2개부터는 1개씩 추가할 때마다 2개씩 늘어나요. 삼각형 ${n}개를 만들려면 성냥개비가 몇 개 필요한가요?  성냥개비 수 = `,
    makeExplain: (n, ans) =>
      `삼각형 수(△)와 성냥개비 수(○) 사이의 관계는 ○ = △ × 2 + 1이에요. △가 ${n}이면 ○ = ${n} × 2 + 1 = ${ans}이에요.`,
  },
  // 언니는 나보다 3살 많아요 (+ 3)
  {
    rule: { kind: 'add', k: 3, c: 0 },
    deltaMin: 6,
    deltaMax: 15,
    makePromptText: (n) =>
      `언니는 나보다 3살 많아요. 내 나이가 ${n}살이면 언니의 나이는 몇 살인가요?  언니 나이 = `,
    makeExplain: (n, ans) =>
      `내 나이(△)와 언니 나이(○) 사이의 관계는 ○ = △ + 3이에요. △가 ${n}이면 ○ = ${n} + 3 = ${ans}살이에요.`,
  },
  // 정사각형 변의 수 (× 4)
  {
    rule: { kind: 'mul', k: 4, c: 0 },
    deltaMin: 2,
    deltaMax: 15,
    makePromptText: (n) =>
      `정사각형 1개는 변이 4개예요. 정사각형 ${n}개의 변은 모두 몇 개인가요?  변의 수 = `,
    makeExplain: (n, ans) =>
      `정사각형 수(△)와 변의 수(○) 사이의 관계는 ○ = △ × 4이에요. △가 ${n}이면 ○ = ${n} × 4 = ${ans}이에요.`,
  },
  // 한 묶음에 6권씩 (× 6)
  {
    rule: { kind: 'mul', k: 6, c: 0 },
    deltaMin: 2,
    deltaMax: 15,
    makePromptText: (n) =>
      `공책을 한 묶음에 6권씩 묶어요. ${n}묶음에 공책은 몇 권인가요?  공책 수 = `,
    makeExplain: (n, ans) =>
      `묶음 수(△)와 공책 수(○) 사이의 관계는 ○ = △ × 6이에요. △가 ${n}이면 ○ = ${n} × 6 = ${ans}이에요.`,
  },
  // 사탕 3개씩 남겨 두기 (× k + 3)
  {
    rule: { kind: 'muladd', k: 3, c: 3 },
    deltaMin: 2,
    deltaMax: 15,
    makePromptText: (n) =>
      `상자에 사탕이 3개 있고, 친구 한 명이 올 때마다 사탕을 3개씩 더 가져와요. 친구가 ${n}명이면 사탕은 모두 몇 개인가요?  사탕 수 = `,
    makeExplain: (n, ans) =>
      `친구 수(△)와 사탕 수(○) 사이의 관계는 ○ = △ × 3 + 3이에요. △가 ${n}이면 ○ = ${n} × 3 + 3 = ${n * 3} + 3 = ${ans}이에요.`,
  },
];

const patWord: SkillDef = {
  id: 'pat-word',
  unitId: 'unitPattern',
  difficulty: 3,
  word: true,
  title: '대응 관계 문장제',
  note: '실생활 소재로 두 양의 대응 관계를 파악하고 미지수 구하기',
  generate(seed) {
    const rng = new RNG(seed);
    const tmpl = rng.pick(WORD_TEMPLATES);
    const rule = tmpl.rule;

    // 결과가 200 이하인 delta 범위 내에서 선택
    const maxDelta =
      rule.kind === 'muladd'
        ? Math.min(tmpl.deltaMax, Math.floor((200 - rule.c) / rule.k))
        : rule.kind === 'mul'
        ? Math.min(tmpl.deltaMax, Math.floor(200 / rule.k))
        : tmpl.deltaMax;

    const delta = rng.int(tmpl.deltaMin, Math.max(tmpl.deltaMin, maxDelta));
    const answer = applyRule(delta, rule);

    const promptText = tmpl.makePromptText(delta);
    const explainText = tmpl.makeExplain(delta, answer, rule);

    const expr: MathExpr = [
      txt(promptText),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '식을 세워서 □ 안에 알맞은 수를 구하세요.',
      expr,
      blankAnswers: [answer],
      explanation: [txt(explainText)],
    };
  },
};

export const unitPatternSkills: SkillDef[] = [
  patTableFill,
  patRulePick,
  patApply,
  patInverse,
  patWord,
];
