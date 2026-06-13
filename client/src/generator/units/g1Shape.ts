/**
 * 단원: 여러 가지 모양 (2022 개정교육과정 1-1 2단원)
 * 성취기준: 공 모양, 상자 모양, 둥근기둥 모양을 구별하고 분류한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// 모양 3종
const SHAPES = ['공 모양 ⚽', '상자 모양 📦', '둥근기둥 모양 🥫'] as const;
type ShapeType = typeof SHAPES[number];

// 모양별 특징 (1학년 눈높이 — '왜 그 모양인지' 풀이에 사용)
const SHAPE_TRAIT: Record<ShapeType, string> = {
  '공 모양 ⚽': '어느 쪽에서 봐도 둥글어서 잘 굴러가요',
  '상자 모양 📦': '평평한 면이 있어서 잘 쌓을 수 있어요',
  '둥근기둥 모양 🥫': '위와 아래는 평평하고 옆은 둥글어요',
};

// 물건 풀 (모양별 분류)
const BALL_ITEMS = ['축구공', '농구공', '지구본', '오렌지', '수박', '야구공', '탁구공', '볼링공', '사탕', '구슬'];
const BOX_ITEMS = ['선물 상자', '과자 상자', '책', '지우개', '주사위', '벽돌', '휴지 상자', '냉장고', '세탁기', '텔레비전'];
const CYLINDER_ITEMS = ['음료수 캔', '김치통', '북', '두루마리 화장지', '프링글스 통', '붓통', '맥주캔', '우유갑', '연필통', '통조림'];

// ── 1. shape1-classify  물건 → 모양 분류 (choice)  난이도 1 ─────────────
const shape1Classify: SkillDef = {
  id: 'shape1-classify',
  unitId: 'unitShape1',
  difficulty: 1,
  title: '물건 모양 분류',
  note: '물건 이름을 보고 공/상자/둥근기둥 중 어떤 모양인지 고르기. choice. 물건 풀 30종.',
  minVariety: 30,
  generate(seed) {
    const rng = new RNG(seed);
    const which = rng.int(0, 2);
    let item: string;
    let correct: ShapeType;

    if (which === 0) {
      item = rng.pick(BALL_ITEMS);
      correct = '공 모양 ⚽';
    } else if (which === 1) {
      item = rng.pick(BOX_ITEMS);
      correct = '상자 모양 📦';
    } else {
      item = rng.pick(CYLINDER_ITEMS);
      correct = '둥근기둥 모양 🥫';
    }

    // 3가지 모양 + 오답 1개 추가로 4보기 만들기
    // 오답 추가: '알 수 없어요' 텍스트
    const answerVal = txc(correct);
    const cands: ChoiceValue[] = [
      ...SHAPES.filter(s => s !== correct).map(txc),
      txc('알 수 없어요'),
    ];
    const { choices, answerIndex } = buildChoices(answerVal, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${item}은(는) 어떤 모양인가요?`,
      choices,
      answerIndex,
      explanation: [txt(`${item}은(는) ${SHAPE_TRAIT[correct]}. 그래서 ${correct}이에요.`)],
    };
  },
};

// ── 2. shape1-same  같은 모양 물건 고르기 (choice)  난이도 1 ─────────────
const shape1Same: SkillDef = {
  id: 'shape1-same',
  unitId: 'unitShape1',
  difficulty: 1,
  title: '같은 모양 물건 고르기',
  note: '기준 물건과 같은 모양의 물건을 4보기에서 고르기. choice.',
  minVariety: 30,
  generate(seed) {
    const rng = new RNG(seed);
    const which = rng.int(0, 2);

    let referenceItem: string;
    let correctItem: string;
    let wrongItems: string[];

    if (which === 0) {
      // 기준: 공 모양, 정답도 공 모양
      const pool = rng.shuffle(BALL_ITEMS);
      referenceItem = pool[0];
      correctItem = pool[1];
      const boxes = rng.shuffle(BOX_ITEMS);
      wrongItems = [boxes[0], rng.pick(CYLINDER_ITEMS), boxes[1]];
    } else if (which === 1) {
      // 기준: 상자 모양
      const pool = rng.shuffle(BOX_ITEMS);
      referenceItem = pool[0];
      correctItem = pool[1];
      const balls = rng.shuffle(BALL_ITEMS);
      wrongItems = [balls[0], rng.pick(CYLINDER_ITEMS), balls[1]];
    } else {
      // 기준: 둥근기둥 모양
      const pool = rng.shuffle(CYLINDER_ITEMS);
      referenceItem = pool[0];
      correctItem = pool[1];
      const balls = rng.shuffle(BALL_ITEMS);
      wrongItems = [balls[0], rng.pick(BOX_ITEMS), balls[1]];
    }

    const answerVal = txc(correctItem);
    const cands: ChoiceValue[] = wrongItems.map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${referenceItem}과 같은 모양의 물건을 고르세요.`,
      choices,
      answerIndex,
      explanation: [
        txt(`${referenceItem}과 ${correctItem}은(는) 둘 다 ${SHAPES[which]}이라 같은 모양이에요.`),
      ],
    };
  },
};

// ── 3. shape1-count  모양별 개수 세기 (fill-blanks)  난이도 2 ────────────
const SHAPE_EMOJIS = ['⚽', '📦', '🥫'];

const shape1Count: SkillDef = {
  id: 'shape1-count',
  unitId: 'unitShape1',
  difficulty: 2,
  title: '모양별 개수 세기',
  note: '이모지로 나열된 여러 모양 중 한 종류를 세기. fill-blanks.',
  minVariety: 54,
  generate(seed) {
    const rng = new RNG(seed);
    // 3가지 모양 각각 개수 지정 (1~4)
    const counts = [rng.int(1, 4), rng.int(1, 4), rng.int(1, 4)];
    // 어떤 모양 개수를 물어볼지
    const ask = rng.int(0, 2);

    // 이모지 나열 (섞어서)
    const items: string[] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < counts[i]; j++) items.push(SHAPE_EMOJIS[i]);
    }
    const shuffled = rng.shuffle(items);
    const display = shuffled.join(' ');
    const shapeNames = ['공 모양 ⚽', '상자 모양 📦', '둥근기둥 모양 🥫'];

    const expr: MathExpr = [
      { kind: 'blank', slot: 0 },
      txt('개'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${display}\n${shapeNames[ask]}은(는) 몇 개인가요?`,
      expr,
      blankAnswers: [counts[ask]],
      explanation: [txt(`${shapeNames[ask]}만 하나씩 골라 세어 보면 ${counts[ask]}개예요.`)],
    };
  },
};

// ── 4. shape1-word  문장제 (fill-blanks)  난이도 2 ──────────────────────
const shape1Word: SkillDef = {
  id: 'shape1-word',
  unitId: 'unitShape1',
  difficulty: 2,
  word: true,
  title: '여러 가지 모양 문장제',
  note: '모양 분류·세기 1학년 수준 문장제. fill-blanks.',
  minVariety: 36,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 공 모양 개수
      const balls = rng.int(1, 5);
      const boxes = rng.int(1, 5);
      const cyls = rng.int(1, 5);
      answer = balls;
      promptStr = `바구니에 ⚽ ${balls}개, 📦 ${boxes}개, 🥫 ${cyls}개가 있어요. 공 모양은 몇 개인가요?`;
      explanation = [txt(`공 모양 ⚽만 골라 세면 ${balls}개예요.`)];
    } else if (pat === 1) {
      // 상자 모양 개수
      const balls = rng.int(1, 5);
      const boxes = rng.int(1, 5);
      const cyls = rng.int(1, 5);
      answer = boxes;
      promptStr = `선반에 ⚽ ${balls}개, 📦 ${boxes}개, 🥫 ${cyls}개가 있어요. 상자 모양은 몇 개인가요?`;
      explanation = [txt(`상자 모양 📦만 골라 세면 ${boxes}개예요.`)];
    } else {
      // 모양 합계
      const a = rng.int(1, 4);
      const b = rng.int(1, 4);
      answer = a + b;
      const which1 = rng.int(0, 2);
      const which2 = (which1 + 1) % 3;
      promptStr = `${SHAPE_EMOJIS[which1]} ${a}개와 ${SHAPE_EMOJIS[which2]} ${b}개가 있어요. 모두 몇 개인가요?`;
      explanation = [txt(`${a}개와 ${b}개를 모으면 ${a} + ${b} = ${answer}개예요.`)];
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
export const unitShape1Skills: SkillDef[] = [
  shape1Classify,
  shape1Same,
  shape1Count,
  shape1Word,
];
