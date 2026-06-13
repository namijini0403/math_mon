/**
 * 단원: 여러 가지 도형 (2022 개정교육과정 2-1 2단원)
 * 성취기준: 삼각형·사각형·오각형·육각형의 변·꼭짓점 수를 알고,
 * 도형을 이름으로 분류하며, 원의 특징을 안다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// 도형 정보
const SHAPES = [
  { name: '삼각형', sides: 3, vertices: 3, emoji: '🔺' },
  { name: '사각형', sides: 4, vertices: 4, emoji: '🟦' },
  { name: '오각형', sides: 5, vertices: 5, emoji: '⭐' },
  { name: '육각형', sides: 6, vertices: 6, emoji: '🔷' },
] as const;

// ── 1. fig2-sides  변·꼭짓점 수 (fill-blanks)  난이도 1 ─────────────────────
const fig2Sides: SkillDef = {
  id: 'fig2-sides',
  unitId: 'unitFigure2',
  difficulty: 1,
  title: '도형의 변·꼭짓점 수',
  note: '삼각형~육각형의 변 또는 꼭짓점 수. fill-blanks. 조합 8가지.',
  minVariety: 8,
  generate(seed) {
    const rng = new RNG(seed);
    const shape = rng.pick(SHAPES);
    const askSides = rng.int(0, 1) === 0;

    const ans = askSides ? shape.sides : shape.vertices;
    const thing = askSides ? '변' : '꼭짓점';

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${shape.emoji} ${shape.name}의 ${thing}은 몇 개인가요?`,
      expr,
      blankAnswers: [ans],
      explanation: [txt(`${shape.name}의 ${thing}은 ${ans}개예요.`)],
    };
  },
};

// ── 2. fig2-name  도형 이름 맞히기 (choice)  난이도 1 ──────────────────────
const fig2Name: SkillDef = {
  id: 'fig2-name',
  unitId: 'unitFigure2',
  difficulty: 1,
  title: '도형 이름',
  note: '변 또는 꼭짓점 수를 보고 도형 이름 고르기. choice.',
  minVariety: 8,
  generate(seed) {
    const rng = new RNG(seed);
    const shape = rng.pick(SHAPES);
    const bySides = rng.int(0, 1) === 0;
    const num = bySides ? shape.sides : shape.vertices;
    const thing = bySides ? '변' : '꼭짓점';

    const answerVal = txc(shape.name);
    const others = SHAPES.filter((s) => s.name !== shape.name).map((s) => txc(s.name));
    const cands = rng.shuffle(others).slice(0, 3);
    const { choices, answerIndex } = buildChoices(answerVal, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${thing}이 ${num}개인 도형의 이름은 무엇인가요?`,
      choices,
      answerIndex,
      explanation: [txt(`${thing}이 ${num}개인 도형은 ${shape.name}이에요.`)],
    };
  },
};

// ── 3. fig2-classify  도형 분류 (choice)  난이도 2 ──────────────────────────
// 이모지 목록을 주고 특정 도형 개수 세기
const SHAPE_NAMES_MAP: Record<string, string> = {
  '🔺': '삼각형', '🔻': '삼각형',
  '🟦': '사각형', '🟥': '사각형', '🟩': '사각형',
  '⭐': '오각형',
  '🔷': '육각형',
  '⭕': '원',
};

const fig2Classify: SkillDef = {
  id: 'fig2-classify',
  unitId: 'unitFigure2',
  difficulty: 2,
  title: '도형 분류',
  note: '이모지 목록에서 특정 도형 개수 세기. fill-blanks. 타깃 최소 1개 보장.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const targetEmoji = rng.pick(['🔺', '🟦', '⭐', '🔷', '⭕'] as const);
    const targetName = SHAPE_NAMES_MAP[targetEmoji];
    // 타깃 최소 1개 먼저 추가, 나머지는 random
    const pool = ['🔺', '🟦', '⭐', '🔷', '⭕', '🔻', '🟥'];
    const total = rng.int(6, 10);
    const items: string[] = [targetEmoji]; // 최소 1개 보장
    for (let i = 1; i < total; i++) {
      items.push(rng.pick(pool));
    }
    // 셔플
    const shuffled = rng.shuffle(items);
    const count = shuffled.filter((e) => SHAPE_NAMES_MAP[e] === targetName).length;

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 도형들 중에서 ${targetName}은 몇 개인가요?\n${shuffled.join(' ')}`,
      expr,
      blankAnswers: [count],
      explanation: [txt(`${targetName}은 ${count}개예요.`)],
    };
  },
};

// ── 4. fig2-circle  원의 특징 (choice)  난이도 2 ────────────────────────────
const CIRCLE_FACTS = [
  { q: '원에는 꼭짓점이 몇 개인가요?', a: '없어요(0개)', wrong: ['1개', '2개', '4개'] },
  { q: '원에는 변이 몇 개인가요?', a: '없어요(0개)', wrong: ['1개', '2개', '4개'] },
  { q: '원의 중심에서 원 위의 점까지 거리는 어떤가요?', a: '모두 같아요', wrong: ['제각각이에요', '중심에서 멀수록 길어요', '중심에서 가까울수록 길어요'] },
  { q: '원을 반으로 접었을 때 포개어지나요?', a: '완전히 포개어져요', wrong: ['조금 어긋나요', '안 포개어져요', '한쪽이 더 커요'] },
];

const fig2Circle: SkillDef = {
  id: 'fig2-circle',
  unitId: 'unitFigure2',
  difficulty: 2,
  title: '원의 특징',
  note: '원의 특징에 대한 choice 문제. 4가지 질문 중 1개.',
  minVariety: 4,
  generate(seed) {
    const rng = new RNG(seed);
    const fact = rng.pick(CIRCLE_FACTS);
    const answerVal = txc(fact.a);
    const cands = fact.wrong.map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, cands, rng);
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: fact.q,
      choices,
      answerIndex,
      explanation: [txt(`${fact.q.replace('?', '')}? → ${fact.a}`)],
    };
  },
};

// ── 5. fig2-word  문장제 (fill-blanks / choice)  난이도 2 ─────────────────
const fig2Word: SkillDef = {
  id: 'fig2-word',
  unitId: 'unitFigure2',
  difficulty: 2,
  word: true,
  title: '도형 문장제',
  note: '도형 변·꼭짓점 관련 문장제. fill-blanks.',
  minVariety: 16,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // N개의 도형 → 변(꼭짓점) 합계
      const shape = rng.pick(SHAPES);
      const count = rng.int(2, 5);
      const askSides = rng.int(0, 1) === 0;
      const perShape = askSides ? shape.sides : shape.vertices;
      const ans = perShape * count;
      const thing = askSides ? '변' : '꼭짓점';
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${shape.name} ${count}개의 ${thing}은 모두 몇 개인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${shape.name} 1개에 ${thing}이 ${perShape}개이므로, ${count}개면 ${perShape}×${count}=${ans}개`)],
      };
    } else {
      // 도형 이름 맞히기 문장제
      const shape = rng.pick(SHAPES);
      const ans = shape.sides;
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `민지가 그린 도형의 이름은 ${shape.name}이에요. 이 도형의 변은 몇 개인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${shape.name}의 변은 ${ans}개예요.`)],
      };
    }
  },
};

export const unitFigure2Skills: SkillDef[] = [
  fig2Sides,
  fig2Name,
  fig2Classify,
  fig2Circle,
  fig2Word,
];
