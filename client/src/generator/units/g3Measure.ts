/**
 * 단원: 들이와 무게 (2022 개정교육과정 3-2 5단원)
 * 성취기준: L↔mL 변환, kg↔g·t 변환, 들이의 덧셈·뺄셈(mL 받아올림),
 * 무게의 덧셈·뺄셈, 알맞은 단위 고르기, 문장제
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

/**
 * 복합 단위(큰 단위 1000 = 작은 단위)의 덧셈·뺄셈을 작은 단위끼리·큰 단위끼리 단계로 설명한다.
 * carry: 덧셈이면 받아올림, 뺄셈이면 받아내림 발생 여부. bigU/smallU: 단위 라벨(L/mL, kg/g).
 */
function compoundAddSubExplain(o: {
  big1: number; small1: number; big2: number; small2: number;
  rBig: number; rSmall: number; isAdd: boolean; carry: boolean;
  bigU: string; smallU: string;
}): string {
  const { big1, small1, big2, small2, rBig, rSmall, isAdd, carry, bigU, smallU } = o;
  if (isAdd) {
    const sum = small1 + small2;
    const smallStep = carry
      ? `${smallU}끼리 더하면 ${small1} + ${small2} = ${sum} ${smallU}이에요. 1000 ${nj(smallU, '은/는')} 1 ${bigU}니 1 ${bigU}로 받아올림하고 ${sum - 1000} ${nj(smallU, '이/가')} 남아요.`
      : `${smallU}끼리 더하면 ${small1} + ${small2} = ${rSmall} ${smallU}이에요.`;
    const bigStep = `${bigU}끼리 더하면 ${big1} + ${big2}${carry ? ' + 1(받아올림)' : ''} = ${rBig} ${bigU}이에요.`;
    return `${smallStep} ${bigStep} 그래서 ${rBig} ${bigU} ${rSmall} ${smallU}이에요.`;
  }
  const smallStep = carry
    ? `${smallU}끼리 빼요. ${small1} ${smallU}에서 ${small2} ${nj(smallU, '을/를')} 뺄 수 없으니 1 ${bigU}(1000 ${smallU})를 받아내림해서 ${small1} + 1000 - ${small2} = ${rSmall} ${smallU}예요.`
    : `${smallU}끼리 빼면 ${small1} - ${small2} = ${rSmall} ${smallU}이에요.`;
  const bigStep = `${bigU}끼리 빼면 ${big1}${carry ? ' - 1(받아내림)' : ''} - ${big2} = ${rBig} ${bigU}이에요.`;
  return `${smallStep} ${bigStep} 그래서 ${rBig} ${bigU} ${rSmall} ${smallU}이에요.`;
}

// ── 1. meas3-liquid-conv  L↔mL 변환 (fill-blanks) ──────────────────
const meas3LiquidConv: SkillDef = {
  id: 'meas3-liquid-conv',
  unitId: 'unitMeasure3',
  difficulty: 1,
  title: 'L↔mL 단위 변환',
  note: '1 L = 1000 mL 관계 변환. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let expr: MathExpr;
    let ans: number;
    let expl: string;

    if (pat === 0) {
      // L → mL (정수 L)
      const l = rng.int(1, 9);
      ans = l * 1000;
      prompt = `${l} L는 몇 mL인가요?`;
      expr = [txt(`${l} L = `), { kind: 'blank', slot: 0 }, txt(' mL')];
      expl = `1 L = 1000 mL이므로 ${l} L = ${ans} mL`;
    } else if (pat === 1) {
      // mL → L (1000의 배수)
      const l = rng.int(1, 9);
      const ml = l * 1000;
      ans = l;
      prompt = `${ml} mL는 몇 L인가요?`;
      expr = [txt(`${ml} mL = `), { kind: 'blank', slot: 0 }, txt(' L')];
      expl = `1000 mL = 1 L이므로 ${ml} mL = ${ans} L`;
    } else if (pat === 2) {
      // L + mL → mL (복합 단위)
      const l = rng.int(1, 5);
      const ml = rng.int(1, 9) * 100;
      ans = l * 1000 + ml;
      prompt = `${l} L ${ml} mL는 몇 mL인가요?`;
      expr = [txt(`${l} L ${ml} mL = `), { kind: 'blank', slot: 0 }, txt(' mL')];
      expl = `${l} L = ${l * 1000} mL, ${l * 1000} + ${ml} = ${ans} mL`;
    } else {
      // mL → L와 나머지 mL (빈칸 두 개 [L, mL])
      const l = rng.int(1, 5);
      const ml = rng.int(1, 9) * 100;
      const total = l * 1000 + ml;
      prompt = `${total} mL는 몇 L 몇 mL인가요?`;
      expr = [
        txt(`${total} mL = `),
        { kind: 'blank', slot: 0 },
        txt(' L '),
        { kind: 'blank', slot: 1 },
        txt(' mL'),
      ];
      expl = `${total} ÷ 1000 = ${l} L, 나머지 ${ml} mL`;
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt,
        expr,
        blankAnswers: [l, ml],
        explanation: [txt(expl)],
      };
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [ans],
      explanation: [txt(expl)],
    };
  },
};

// ── 2. meas3-weight-conv  kg↔g(·t) 변환 (fill-blanks) ───────────────
const meas3WeightConv: SkillDef = {
  id: 'meas3-weight-conv',
  unitId: 'unitMeasure3',
  difficulty: 1,
  title: 'kg↔g·t 단위 변환',
  note: '1 kg = 1000 g, 1 t = 1000 kg 관계 변환. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let expr: MathExpr;
    let ans: number;
    let expl: string;

    if (pat === 0) {
      // kg → g
      const kg = rng.int(1, 9);
      ans = kg * 1000;
      prompt = `${kg} kg는 몇 g인가요?`;
      expr = [txt(`${kg} kg = `), { kind: 'blank', slot: 0 }, txt(' g')];
      expl = `1 kg = 1000 g이므로 ${kg} kg = ${ans} g`;
    } else if (pat === 1) {
      // g → kg (1000의 배수)
      const kg = rng.int(1, 9);
      const g = kg * 1000;
      ans = kg;
      prompt = `${g} g는 몇 kg인가요?`;
      expr = [txt(`${g} g = `), { kind: 'blank', slot: 0 }, txt(' kg')];
      expl = `1000 g = 1 kg이므로 ${g} g = ${ans} kg`;
    } else if (pat === 2) {
      // t → kg
      const t = rng.int(1, 5);
      ans = t * 1000;
      prompt = `${t} t는 몇 kg인가요?`;
      expr = [txt(`${t} t = `), { kind: 'blank', slot: 0 }, txt(' kg')];
      expl = `1 t = 1000 kg이므로 ${t} t = ${ans} kg`;
    } else {
      // kg + g → g (복합 단위)
      const kg = rng.int(1, 5);
      const g = rng.int(1, 9) * 100;
      ans = kg * 1000 + g;
      prompt = `${kg} kg ${g} g는 몇 g인가요?`;
      expr = [txt(`${kg} kg ${g} g = `), { kind: 'blank', slot: 0 }, txt(' g')];
      expl = `${kg} kg = ${kg * 1000} g, ${kg * 1000} + ${g} = ${ans} g`;
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [ans],
      explanation: [txt(expl)],
    };
  },
};

// ── 3. meas3-liquid-add  들이의 덧셈 (mL 받아올림, 빈칸 [L, mL]) ───
const meas3LiquidAdd: SkillDef = {
  id: 'meas3-liquid-add',
  unitId: 'unitMeasure3',
  difficulty: 2,
  title: '들이의 덧셈',
  note: 'L와 mL로 나타낸 두 들이 더하기. mL 합이 1000 이상이면 받아올림. 빈칸 [L, mL].',
  generate(seed) {
    const rng = new RNG(seed);
    const carry = rng.int(0, 1) === 1;

    let l1: number, ml1: number, l2: number, ml2: number;
    let rl: number, rml: number;

    l1 = 1; ml1 = 200; l2 = 2; ml2 = 300; rl = 3; rml = 500;

    for (let tries = 0; tries < 300; tries++) {
      const tl1 = rng.int(1, 8);
      const tl2 = rng.int(1, 8);
      // mL는 100의 배수로, 100~900 범위
      const tml1 = rng.int(1, 9) * 100;
      const tml2 = rng.int(1, 9) * 100;
      const totalMl = tml1 + tml2;
      const hasCarry = totalMl >= 1000;
      if (carry !== hasCarry) continue;
      const trl = tl1 + tl2 + (hasCarry ? 1 : 0);
      const trml = totalMl - (hasCarry ? 1000 : 0);
      if (trl <= 15 && trml >= 100 && trml <= 900) {
        l1 = tl1; ml1 = tml1; l2 = tl2; ml2 = tml2;
        rl = trl; rml = trml; break;
      }
    }

    const expr: MathExpr = [
      txt(`${l1} L ${ml1} mL + ${l2} L ${ml2} mL = `),
      { kind: 'blank', slot: 0 },
      txt(' L '),
      { kind: 'blank', slot: 1 },
      txt(' mL'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [rl, rml],
      explanation: [txt(compoundAddSubExplain({
        big1: l1, small1: ml1, big2: l2, small2: ml2,
        rBig: rl, rSmall: rml, isAdd: true, carry, bigU: 'L', smallU: 'mL',
      }))],
    };
  },
};

// ── 4. meas3-liquid-sub  들이의 뺄셈 (빈칸 [L, mL]) ─────────────────
const meas3LiquidSub: SkillDef = {
  id: 'meas3-liquid-sub',
  unitId: 'unitMeasure3',
  difficulty: 2,
  title: '들이의 뺄셈',
  note: 'L와 mL로 나타낸 두 들이 빼기. mL 부족 시 1 L = 1000 mL 받아내림. 빈칸 [L, mL].',
  generate(seed) {
    const rng = new RNG(seed);
    const borrow = rng.int(0, 1) === 1;

    let l1: number, ml1: number, l2: number, ml2: number;
    let rl: number, rml: number;

    l1 = 5; ml1 = 700; l2 = 2; ml2 = 300; rl = 3; rml = 400;

    for (let tries = 0; tries < 300; tries++) {
      const tl1 = rng.int(3, 9);
      const tl2 = rng.int(1, tl1 - 2);
      const tml1 = rng.int(1, 9) * 100;
      const tml2 = rng.int(1, 9) * 100;
      const hasBorrow = tml1 < tml2;
      if (borrow !== hasBorrow) continue;
      const trl = tl1 - tl2 - (hasBorrow ? 1 : 0);
      const trml = tml1 - tml2 + (hasBorrow ? 1000 : 0);
      if (trl >= 1 && trml >= 100 && trml <= 900) {
        l1 = tl1; ml1 = tml1; l2 = tl2; ml2 = tml2;
        rl = trl; rml = trml; break;
      }
    }

    const expr: MathExpr = [
      txt(`${l1} L ${ml1} mL - ${l2} L ${ml2} mL = `),
      { kind: 'blank', slot: 0 },
      txt(' L '),
      { kind: 'blank', slot: 1 },
      txt(' mL'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [rl, rml],
      explanation: [txt(compoundAddSubExplain({
        big1: l1, small1: ml1, big2: l2, small2: ml2,
        rBig: rl, rSmall: rml, isAdd: false, carry: borrow, bigU: 'L', smallU: 'mL',
      }))],
    };
  },
};

// ── 5. meas3-weight-add  무게의 덧셈·뺄셈 (fill-blanks, 빈칸 [kg, g]) ─
const meas3WeightAdd: SkillDef = {
  id: 'meas3-weight-add',
  unitId: 'unitMeasure3',
  difficulty: 2,
  title: '무게의 덧셈·뺄셈',
  note: 'kg와 g로 나타낸 두 무게의 덧셈 또는 뺄셈. 받아올림/내림 포함. 빈칸 [kg, g].',
  generate(seed) {
    const rng = new RNG(seed);
    const isAdd = rng.int(0, 1) === 0;
    const carry = rng.int(0, 1) === 1;

    let kg1: number, g1: number, kg2: number, g2: number;
    let rkg: number, rg: number;

    kg1 = 2; g1 = 500; kg2 = 1; g2 = 300; rkg = 3; rg = 800;

    for (let tries = 0; tries < 300; tries++) {
      const g100 = () => rng.int(1, 9) * 100;

      if (isAdd) {
        const tkg1 = rng.int(1, 7);
        const tkg2 = rng.int(1, 7);
        const tg1 = g100();
        const tg2 = g100();
        const totalG = tg1 + tg2;
        const hasCarry = totalG >= 1000;
        if (carry !== hasCarry) continue;
        const trkg = tkg1 + tkg2 + (hasCarry ? 1 : 0);
        const trg = totalG - (hasCarry ? 1000 : 0);
        if (trkg <= 15 && trg >= 100 && trg <= 900) {
          kg1 = tkg1; g1 = tg1; kg2 = tkg2; g2 = tg2;
          rkg = trkg; rg = trg; break;
        }
      } else {
        const tkg1 = rng.int(3, 9);
        const tkg2 = rng.int(1, tkg1 - 2);
        const tg1 = g100();
        const tg2 = g100();
        const hasBorrow = tg1 < tg2;
        if (carry !== hasBorrow) continue;
        const trkg = tkg1 - tkg2 - (hasBorrow ? 1 : 0);
        const trg = tg1 - tg2 + (hasBorrow ? 1000 : 0);
        if (trkg >= 1 && trg >= 100 && trg <= 900) {
          kg1 = tkg1; g1 = tg1; kg2 = tkg2; g2 = tg2;
          rkg = trkg; rg = trg; break;
        }
      }
    }

    const op = isAdd ? '+' : '-';
    const expr: MathExpr = [
      txt(`${kg1} kg ${g1} g ${op} ${kg2} kg ${g2} g = `),
      { kind: 'blank', slot: 0 },
      txt(' kg '),
      { kind: 'blank', slot: 1 },
      txt(' g'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [rkg, rg],
      explanation: [txt(compoundAddSubExplain({
        big1: kg1, small1: g1, big2: kg2, small2: g2,
        rBig: rkg, rSmall: rg, isAdd, carry, bigU: 'kg', smallU: 'g',
      }))],
    };
  },
};

// ── 6. meas3-unit-pick  알맞은 단위 고르기 (choice) ──────────────────
const meas3UnitPick: SkillDef = {
  id: 'meas3-unit-pick',
  unitId: 'unitMeasure3',
  difficulty: 1,
  title: '알맞은 단위 고르기',
  note: '일상 물건의 들이·무게에 알맞은 단위 고르기. choice. 보기 4개.',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);

    interface UnitItem {
      name: string;
      answer: string;
      category: 'liquid' | 'weight';
    }
    const items: UnitItem[] = [
      { name: '물병(500 mL짜리)', answer: 'mL', category: 'liquid' },
      { name: '욕조에 담긴 물', answer: 'L', category: 'liquid' },
      { name: '종이컵', answer: 'mL', category: 'liquid' },
      { name: '수영장 물', answer: 'L', category: 'liquid' },
      { name: '주사기 약', answer: 'mL', category: 'liquid' },
      { name: '커다란 어항', answer: 'L', category: 'liquid' },
      { name: '눈물 한 방울', answer: 'mL', category: 'liquid' },
      { name: '냄비에 담은 국물', answer: 'L', category: 'liquid' },
      { name: '사과 한 개', answer: 'g', category: 'weight' },
      { name: '코끼리', answer: 't', category: 'weight' },
      { name: '볼펜 한 자루', answer: 'g', category: 'weight' },
      { name: '승용차', answer: 't', category: 'weight' },
      { name: '책가방', answer: 'kg', category: 'weight' },
      { name: '쌀 한 포대', answer: 'kg', category: 'weight' },
      { name: '동전 한 개', answer: 'g', category: 'weight' },
      { name: '기차', answer: 't', category: 'weight' },
    ];

    const item = rng.pick(items);
    const answerVal = txc(item.answer);

    // 오답 후보: 같은 카테고리의 다른 단위
    const liquidUnits = ['mL', 'L'];
    const weightUnits = ['g', 'kg', 't'];
    const allUnits = item.category === 'liquid' ? liquidUnits : weightUnits;
    const wrongUnits = allUnits.filter(u => u !== item.answer);
    // 다른 카테고리 단위도 섞기
    const otherCat = item.category === 'liquid' ? weightUnits : liquidUnits;
    const candidates = [...wrongUnits, ...otherCat].map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `"${item.name}"의 들이(무게)를 나타내기에 알맞은 단위는 무엇인가요?`,
      choices,
      answerIndex,
      explanation: [txt(`${item.name}의 ${nj(item.category === 'liquid' ? '들이' : '무게', '은/는')} ${item.answer}로 나타내요.`)],
    };
  },
};

// ── 7. meas3-word  들이와 무게 문장제 (fill-blanks) ──────────────────
const meas3Word: SkillDef = {
  id: 'meas3-word',
  unitId: 'unitMeasure3',
  difficulty: 3,
  word: true,
  title: '들이·무게 문장제',
  note: '들이 또는 무게 단위 변환·덧셈·뺄셈 문장제. 소재 3가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let prompt: string;
    let ans: number;
    let unit: string;
    let expl: string;

    if (pat === 0) {
      // 들이 덧셈 문장제
      const l1 = rng.int(1, 4);
      const ml1 = rng.int(1, 9) * 100;
      const l2 = rng.int(1, 4);
      const ml2 = rng.int(1, 9) * 100;
      const totalMl = ml1 + ml2;
      const rl = l1 + l2 + (totalMl >= 1000 ? 1 : 0);
      const rml = totalMl - (totalMl >= 1000 ? 1000 : 0);
      ans = rml;
      unit = 'mL';
      prompt = `드래곤이 물통에 ${l1} L ${ml1} mL를 담고 요정이 ${l2} L ${ml2} mL를 더 넣었어요. 전체는 ${rl} L 몇 mL인가요?`;
      expl = `mL끼리 더하면 ${ml1} + ${ml2} = ${totalMl} mL예요.${totalMl >= 1000 ? ` 1000 mL는 1 L로 받아올림해서 ${rml} mL가 남아요.` : ''} 그래서 ${rl} L ${rml} mL, 답은 ${ans} mL예요.`;
    } else if (pat === 1) {
      // 무게 뺄셈 문장제
      const kg1 = rng.int(3, 8);
      const g1 = rng.int(2, 9) * 100;
      const kg2 = rng.int(1, kg1 - 1);
      const g2 = rng.int(1, g1 / 100 - 1) * 100;
      const rkg = kg1 - kg2;
      const rg = g1 - g2;
      ans = rg;
      unit = 'g';
      prompt = `보물 상자의 무게가 ${kg1} kg ${g1} g이고, 보물만 꺼냈더니 ${kg2} kg ${g2} g가 되었어요. 꺼낸 보물의 무게는 ${rkg} kg 몇 g인가요?`;
      expl = `g끼리 빼면 ${g1} - ${g2} = ${rg} g, kg끼리 빼면 ${kg1} - ${kg2} = ${rkg} kg이에요. 꺼낸 보물은 ${rkg} kg ${rg} g, 답은 ${ans} g예요.`;
    } else {
      // 단위 변환 문장제
      const l = rng.int(2, 5);
      const ml = rng.int(1, 9) * 100;
      const totalMl = l * 1000 + ml;
      ans = totalMl;
      unit = 'mL';
      prompt = `마법사가 물약을 ${l} L ${ml} mL 만들었어요. 이것은 모두 몇 mL인가요?`;
      expl = `1 L = 1000 mL이니 ${l} L = ${l * 1000} mL예요. 여기에 ${ml} mL를 더하면 ${l * 1000} + ${ml} = ${totalMl} mL예요.`;
    }

    if (ans <= 0) { ans = 100; }

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
      blankAnswers: [ans],
      explanation: [txt(expl)],
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitMeasure3Skills: SkillDef[] = [
  meas3LiquidConv,
  meas3WeightConv,
  meas3LiquidAdd,
  meas3LiquidSub,
  meas3WeightAdd,
  meas3UnitPick,
  meas3Word,
];
