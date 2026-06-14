/**
 * 단원: 나눗셈 (2022 개정교육과정 3-1 3단원)
 * 성취기준: 똑같이 나누기(몫)를 구구단 범위에서 이해하고,
 * 곱셈식↔나눗셈식의 관계를 알며, 곱셈구구로 몫을 구한다.
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. div3-equal  똑같이 나누기 (몫, 구구단 범위) (fill-blanks)  난이도 1 ──
const div3Equal: SkillDef = {
  id: 'div3-equal',
  unitId: 'unitDiv3',
  difficulty: 1,
  title: '똑같이 나누기',
  note: '구구단 범위 나눗셈. a ÷ b = □ (나누어떨어짐). fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 구구단 범위: 2~9단, 몫 1~9
    const b = rng.int(2, 9);
    const q = rng.int(1, 9);
    const a = b * q;

    const expr: MathExpr = [
      txt(`${a} ÷ ${b} = `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [q],
      explanation: [
        txt(`${b} × ${q} = ${a}이므로 ${a} ÷ ${b} = ${q}예요.`),
      ],
    };
  },
};

// ── 2. div3-rel  곱셈식↔나눗셈식 빈칸 (fill-blanks)  난이도 1 ─────
const div3Rel: SkillDef = {
  id: 'div3-rel',
  unitId: 'unitDiv3',
  difficulty: 1,
  title: '곱셈식↔나눗셈식 관계',
  note: 'a × b = c 에서 □ 채우기 또는 나눗셈식으로 변환. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const b = rng.int(2, 9);
    const q = rng.int(1, 9);
    const a = b * q;

    // 패턴 0: □ × b = a → □ = q
    // 패턴 1: a × □ = b*q → □ = b (a가 몫, b가 제수)
    // 패턴 2: a ÷ □ = q → □ = b
    // 패턴 3: a ÷ b = □ 로 변환 (직접 나눗셈)
    const pat = rng.int(0, 3);

    let expr: MathExpr;
    let answer: number;
    let promptStr: string;
    let explStr: string;

    if (pat === 0) {
      // □ × b = a
      answer = q;
      promptStr = `□ × ${b} = ${a}일 때, □를 구하세요.`;
      expr = [txt('□ = '), { kind: 'blank', slot: 0 }];
      explStr = `어떤 수에 ${nj(b, '을/를')} 곱해 ${nj(a, '이/가')} 되었어요. 곱셈을 거꾸로 하면 나눗셈이에요. ${a} ÷ ${b} = ${q}이니 □ = ${q}예요.`;
    } else if (pat === 1) {
      // q × □ = a (곱셈식에서 □ 다른 위치)
      answer = b;
      promptStr = `${q} × □ = ${a}일 때, □를 구하세요.`;
      expr = [txt('□ = '), { kind: 'blank', slot: 0 }];
      explStr = `${q}에 어떤 수를 곱해 ${nj(a, '이/가')} 되었어요. ${a} ÷ ${q} = ${b}이니 □ = ${b}예요.`;
    } else if (pat === 2) {
      // a ÷ □ = q
      answer = b;
      promptStr = `${a} ÷ □ = ${q}일 때, □를 구하세요.`;
      expr = [txt('□ = '), { kind: 'blank', slot: 0 }];
      explStr = `${nj(a, '을/를')} □로 나눠 몫이 ${q}예요. 나눗셈을 곱셈으로 바꾸면 □ × ${q} = ${a}이니, ${a} ÷ ${q} = ${b}, □ = ${b}예요.`;
    } else {
      // 나눗셈식 완성: a ÷ b = □
      answer = q;
      promptStr = `${b} × ${q} = ${nj(a, '을/를')} 나눗셈식으로 나타낼 때, ${a} ÷ ${b} = □를 구하세요.`;
      expr = [txt(`${a} ÷ ${b} = `), { kind: 'blank', slot: 0 }];
      explStr = `곱셈식 ${b} × ${q} = ${nj(a, '은/는')} 나눗셈식으로 바꿀 수 있어요. ${a} ÷ ${b} = ${q}예요.`;
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptStr,
      expr,
      blankAnswers: [answer],
      explanation: [txt(explStr)],
    };
  },
};

// ── 3. div3-times  곱셈구구로 몫 구하기 (choice)  난이도 2 ──────────
const div3Times: SkillDef = {
  id: 'div3-times',
  unitId: 'unitDiv3',
  difficulty: 2,
  title: '곱셈구구로 몫 구하기',
  note: '나눗셈을 곱셈구구로 생각하여 몫 고르기. choice(몫 4개).',
  generate(seed) {
    const rng = new RNG(seed);
    const b = rng.int(2, 9);
    const q = rng.int(1, 9);
    const a = b * q;

    const answerVal = txc(`${q}`);

    // 오답: 인접한 몫 값들 (1~9 범위에서 q 제외, 최소 3개 보장)
    const wrongSet = new Set<number>();
    // 가까운 값부터 넣기
    for (const delta of [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8]) {
      const w = q + delta;
      if (w >= 1 && w <= 9 && w !== q) wrongSet.add(w);
      if (wrongSet.size >= 3) break;
    }
    const candidates: ChoiceValue[] = [...wrongSet].slice(0, 3).map(w => txc(`${w}`));

    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${a} ÷ ${b}의 몫은 얼마인가요?`,
      expr: [txt(`${a} ÷ ${b}`)],
      choices,
      answerIndex,
      explanation: [
        txt(`${b}단 곱셈구구: ${b} × ${q} = ${a}이므로 ${a} ÷ ${b} = ${q}예요.`),
      ],
    };
  },
};

// ── 4. div3-word  나눗셈 문장제 (fill-blanks)  난이도 3 ─────────────
const div3Word: SkillDef = {
  id: 'div3-word',
  unitId: 'unitDiv3',
  difficulty: 3,
  word: true,
  title: '나눗셈 문장제',
  note: '구구단 범위 나눗셈 모험 소재 문장제. 소재 4가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;
    let unit: string;

    // 구구단 범위 생성 공통
    const b = rng.int(2, 9);
    const q = rng.int(1, 9);
    const a = b * q;

    if (pat === 0) {
      unit = '개';
      prompt = `마법사 ${a}명이 ${b}명씩 모둠을 만들면, 모둠이 몇 개 생기나요?`;
      answer = q;
      explanation = [txt(`전체 ${a}명을 ${b}명씩 묶으면 묶음(모둠)이 몇 개인지 구해요. ${a} ÷ ${b} = ${q}이라 ${q}개예요.`)];
    } else if (pat === 1) {
      unit = '개';
      prompt = `보물이 ${a}개 있어요. ${b}명의 용사에게 똑같이 나누면, 한 명이 몇 개씩 받나요?`;
      answer = q;
      explanation = [txt(`${a}개를 ${b}명에게 똑같이 나누면 한 명의 몫이에요. ${a} ÷ ${b} = ${q}이라 한 명이 ${q}개씩 받아요.`)];
    } else if (pat === 2) {
      unit = '개';
      prompt = `마법 약 ${a}개를 한 상자에 ${b}개씩 담으면, 상자가 몇 개 필요한가요?`;
      answer = q;
      explanation = [txt(`${a}개를 ${b}개씩 묶으면 상자가 몇 개 필요한지 구해요. ${a} ÷ ${b} = ${q}이라 ${q}개예요.`)];
    } else {
      unit = '줄';
      prompt = `별 스티커 ${a}개를 한 줄에 ${b}개씩 붙이면, 몇 줄이 되나요?`;
      answer = q;
      explanation = [txt(`${a}개를 한 줄에 ${b}개씩 놓으면 줄 수를 구해요. ${a} ÷ ${b} = ${q}이라 ${q}줄이에요.`)];
    }

    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt(' ' + unit),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitDiv3Skills: SkillDef[] = [
  div3Equal,
  div3Rel,
  div3Times,
  div3Word,
];
