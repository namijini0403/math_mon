/**
 * 단원: 길이 재기 (2022 개정교육과정 2-2 3단원)
 * 성취기준: m↔cm 단위 변환(1m=100cm), 길이의 합(받아올림 포함, 빈칸 2개 [m,cm]),
 * 길이의 차, 알맞은 단위 선택(choice), 문장제.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. len22-conv  m↔cm 변환 (fill-blanks)  난이도 1 ──────────────────────────
const len22Conv: SkillDef = {
  id: 'len22-conv',
  unitId: 'unitLength22',
  difficulty: 1,
  title: 'm↔cm 단위 변환',
  note: '1m=100cm 관계 변환. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let expr: MathExpr;
    let blankAnswers: number[];
    let expl: string;

    if (pat === 0) {
      // n m = ? cm
      const m = rng.int(1, 9);
      const ans = m * 100;
      prompt = `${m} m는 몇 cm인가요?`;
      expr = [txt(`${m} m = `), { kind: 'blank', slot: 0 }, txt(' cm')];
      blankAnswers = [ans];
      expl = `1 m는 100 cm예요. ${m} m는 100 cm씩 ${m}묶음이니 ${ans} cm예요.`;
    } else if (pat === 1) {
      // ? cm = n m (100의 배수)
      const m = rng.int(1, 9);
      const cm = m * 100;
      prompt = `${cm} cm는 몇 m인가요?`;
      expr = [txt(`${cm} cm = `), { kind: 'blank', slot: 0 }, txt(' m')];
      blankAnswers = [m];
      expl = `100 cm가 1 m예요. ${cm} cm는 100 cm씩 ${m}묶음이니 ${m} m예요.`;
    } else if (pat === 2) {
      // n m m cm = ? cm
      const m = rng.int(1, 9);
      const cm = rng.int(1, 99);
      const ans = m * 100 + cm;
      prompt = `${m} m ${cm} cm는 모두 몇 cm인가요?`;
      expr = [txt(`${m} m ${cm} cm = `), { kind: 'blank', slot: 0 }, txt(' cm')];
      blankAnswers = [ans];
      expl = `${m} m는 100 cm씩 ${m}묶음이라 ${m * 100} cm예요. 거기에 ${cm} cm를 더하면 ${m * 100} + ${cm} = ${ans} cm예요.`;
    } else {
      // ? m ? cm = n cm (n을 m, cm로 변환)
      const m = rng.int(1, 8);
      const cm = rng.int(1, 99);
      const total = m * 100 + cm;
      prompt = `${total} cm는 몇 m 몇 cm인가요?`;
      expr = [
        { kind: 'blank', slot: 0 }, txt(' m '),
        { kind: 'blank', slot: 1 }, txt(' cm'),
      ];
      blankAnswers = [m, cm];
      expl = `100 cm가 1 m예요. ${total} cm를 100 cm씩 묶으면 ${m}묶음(=${m} m)이 되고 ${cm} cm가 남아요 → ${m} m ${cm} cm예요.`;
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers,
      explanation: [txt(expl)],
    };
  },
};

// ── 2. len22-add  길이의 합 (fill-blanks 빈칸 2개 [m,cm])  난이도 2 ──────────
const len22Add: SkillDef = {
  id: 'len22-add',
  unitId: 'unitLength22',
  difficulty: 2,
  title: '길이의 합',
  note: '(n m m1 cm)+(p m m2 cm) 계산. 받아올림 포함. fill-blanks 빈칸 2개 [m,cm]. ansCm >= 1 보장.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    // ansCm >= 1 보장: cm1 + cm2 !== 100, 또한 ansCm >= 1
    let m1 = 1, cm1 = 10, m2 = 1, cm2 = 20;
    let ansM = 2, ansCm = 30;
    for (let tries = 0; tries < 300; tries++) {
      const tm1 = rng.int(1, 5);
      const tcm1 = rng.int(1, 98);
      const tm2 = rng.int(1, 4);
      const tcm2 = rng.int(1, 98);
      const totalCm = tcm1 + tcm2;
      let tam: number, tacm: number;
      if (totalCm >= 100) { tam = tm1 + tm2 + 1; tacm = totalCm - 100; }
      else { tam = tm1 + tm2; tacm = totalCm; }
      if (tacm >= 1) { m1 = tm1; cm1 = tcm1; m2 = tm2; cm2 = tcm2; ansM = tam; ansCm = tacm; break; }
    }

    const totalCm = cm1 + cm2;
    const carryNote = totalCm >= 100 ? ` (${cm1}+${cm2}=${totalCm}cm → 1m ${totalCm - 100}cm 받아올림)` : '';
    const expr: MathExpr = [
      txt(`${m1} m ${cm1} cm + ${m2} m ${cm2} cm = `),
      { kind: 'blank', slot: 0 }, txt(' m '),
      { kind: 'blank', slot: 1 }, txt(' cm'),
    ];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '길이의 합을 구하세요.',
      expr,
      blankAnswers: [ansM, ansCm],
      explanation: [txt(`m끼리: ${m1}+${m2}=${m1 + m2}m, cm끼리: ${cm1}+${cm2}=${totalCm}cm${carryNote} → ${ansM} m ${ansCm} cm`)],
    };
  },
};

// ── 3. len22-sub  길이의 차 (fill-blanks 빈칸 2개 [m,cm])  난이도 2 ──────────
const len22Sub: SkillDef = {
  id: 'len22-sub',
  unitId: 'unitLength22',
  difficulty: 2,
  title: '길이의 차',
  note: '(n m m1 cm)−(p m m2 cm) 계산. 받아내림 포함. fill-blanks 빈칸 2개 [m,cm]. ansM,ansCm >= 1 보장.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    let m1 = 3, cm1 = 50, m2 = 1, cm2 = 20;
    let ansM = 2, ansCm = 30;
    for (let tries = 0; tries < 300; tries++) {
      const tm1 = rng.int(2, 9);
      const tcm1 = rng.int(1, 99);
      const tm2 = rng.int(1, tm1 - 1);
      const tcm2 = rng.int(1, 99);
      if (tcm1 === tcm2) continue; // ansCm이 0이 되는 경우 제외
      const total1 = tm1 * 100 + tcm1;
      const total2 = tm2 * 100 + tcm2;
      if (total1 <= total2) continue;
      let tam: number, tacm: number;
      if (tcm1 >= tcm2) { tam = tm1 - tm2; tacm = tcm1 - tcm2; }
      else { tam = tm1 - tm2 - 1; tacm = tcm1 + 100 - tcm2; }
      if (tam >= 1 && tacm >= 1) {
        m1 = tm1; cm1 = tcm1; m2 = tm2; cm2 = tcm2; ansM = tam; ansCm = tacm;
        break;
      }
    }

    const borrowNote = cm1 < cm2 ? ` (${cm1}cm < ${cm2}cm → 1m 빌려서 ${cm1 + 100}-${cm2}=${ansCm}cm)` : '';
    const expr: MathExpr = [
      txt(`${m1} m ${cm1} cm − ${m2} m ${cm2} cm = `),
      { kind: 'blank', slot: 0 }, txt(' m '),
      { kind: 'blank', slot: 1 }, txt(' cm'),
    ];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '길이의 차를 구하세요.',
      expr,
      blankAnswers: [ansM, ansCm],
      explanation: [txt(`m끼리: ${m1}-${m2}=${m1 - m2}m, cm끼리: ${cm1}-${cm2}${borrowNote} → ${ansM} m ${ansCm} cm`)],
    };
  },
};

// ── 4. len22-unit  알맞은 단위 (choice)  난이도 1 ──────────────────────────────
const len22Unit: SkillDef = {
  id: 'len22-unit',
  unitId: 'unitLength22',
  difficulty: 1,
  title: '알맞은 단위 선택',
  note: '물건의 길이에 알맞은 단위(cm/m) 선택. choice 4지선다.',
  minVariety: 20,
  generate(seed) {
    const rng = new RNG(seed);

    // m 단위가 맞는 것: 교실 긴 쪽, 복도, 운동장, 나무 높이, 건물 높이, 수영장
    const mItems = [
      { item: '교실의 긴 쪽', answer: 'm', reason: '교실의 긴 쪽은 약 9 m예요.' },
      { item: '학교 복도의 길이', answer: 'm', reason: '복도의 길이는 수십 m예요.' },
      { item: '농구대의 높이', answer: 'm', reason: '농구대의 높이는 약 3 m예요.' },
      { item: '키 큰 나무의 높이', answer: 'm', reason: '큰 나무는 10 m 이상이에요.' },
      { item: '수영장의 길이', answer: 'm', reason: '수영장의 길이는 25 m 또는 50 m예요.' },
      { item: '아파트 건물의 높이', answer: 'm', reason: '아파트 한 층은 약 3 m예요.' },
    ];
    // cm 단위가 맞는 것: 연필, 책, 손가락, 지우개, 공책
    const cmItems = [
      { item: '연필의 길이', answer: 'cm', reason: '연필은 약 17 cm예요.' },
      { item: '책의 긴 쪽', answer: 'cm', reason: '책의 긴 쪽은 약 26 cm예요.' },
      { item: '손가락의 길이', answer: 'cm', reason: '손가락은 약 5~7 cm예요.' },
      { item: '지우개의 길이', answer: 'cm', reason: '지우개는 약 5 cm예요.' },
      { item: '공책의 긴 쪽', answer: 'cm', reason: '공책의 긴 쪽은 약 29 cm예요.' },
      { item: '스마트폰의 길이', answer: 'cm', reason: '스마트폰은 약 15 cm예요.' },
    ];

    const allItems = [...mItems, ...cmItems];
    const chosen = rng.pick(allItems);
    const answerVal = txc(chosen.answer);
    const wrong = chosen.answer === 'm' ? 'cm' : 'm';
    const { choices, answerIndex } = buildChoices(
      answerVal,
      [txc(wrong), txc('mm'), txc('km')],
      rng,
      4,
    );
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${chosen.item}을 나타낼 때 알맞은 단위를 고르세요.`,
      choices,
      answerIndex,
      explanation: [txt(chosen.reason)],
    };
  },
};

// ── 5. len22-word  길이 문장제 (fill-blanks)  난이도 2 ──────────────────────────
const NAMES_LEN = ['민준', '수아', '지호', '하은', '도현', '유나'];
const len22Word: SkillDef = {
  id: 'len22-word',
  unitId: 'unitLength22',
  difficulty: 2,
  word: true,
  title: '길이 문장제',
  note: '길이의 합·차 문장제. fill-blanks 빈칸 2개 [m,cm] 또는 1개.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const name1 = rng.pick(NAMES_LEN);
    const name2 = rng.pick(NAMES_LEN.filter((n) => n !== name1));

    if (pat === 0) {
      // 두 길이의 합 (ansCm >= 1 보장)
      let m1 = 1, cm1 = 10, m2 = 1, cm2 = 20;
      let ansM = 2, ansCm = 30;
      for (let tries = 0; tries < 300; tries++) {
        const tm1 = rng.int(1, 4);
        const tcm1 = rng.int(1, 88);
        const tm2 = rng.int(1, 4);
        const tcm2 = rng.int(1, 88);
        const totalCm = tcm1 + tcm2;
        let tam: number, tacm: number;
        if (totalCm >= 100) { tam = tm1 + tm2 + 1; tacm = totalCm - 100; }
        else { tam = tm1 + tm2; tacm = totalCm; }
        if (tacm >= 1) { m1 = tm1; cm1 = tcm1; m2 = tm2; cm2 = tcm2; ansM = tam; ansCm = tacm; break; }
      }
      const expr: MathExpr = [
        txt('답: '), { kind: 'blank', slot: 0 }, txt(' m '),
        { kind: 'blank', slot: 1 }, txt(' cm'),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${name1}이의 리본은 ${m1} m ${cm1} cm, ${name2}이의 리본은 ${m2} m ${cm2} cm예요. 두 리본의 길이의 합은 얼마인가요?`,
        expr,
        blankAnswers: [ansM, ansCm],
        explanation: [txt(`m끼리, cm끼리 더해요. ${m1} m ${cm1} cm + ${m2} m ${cm2} cm = ${ansM} m ${ansCm} cm예요.${cm1 + cm2 >= 100 ? ` (cm가 ${cm1 + cm2}이라 100 cm를 1 m로 받아올렸어요.)` : ''}`)],
      };
    } else {
      // 두 길이의 차 (ansM >= 1, ansCm >= 1 보장)
      let m1 = 3, cm1 = 50, m2 = 1, cm2 = 20;
      let ansM = 2, ansCm = 30;
      for (let tries = 0; tries < 300; tries++) {
        const tm1 = rng.int(2, 8);
        const tcm1 = rng.int(1, 99);
        const tm2 = rng.int(1, tm1 - 1);
        const tcm2 = rng.int(1, 99);
        if (tcm1 === tcm2) continue;
        const total1 = tm1 * 100 + tcm1;
        const total2 = tm2 * 100 + tcm2;
        if (total1 <= total2) continue;
        let tam: number, tacm: number;
        if (tcm1 >= tcm2) { tam = tm1 - tm2; tacm = tcm1 - tcm2; }
        else { tam = tm1 - tm2 - 1; tacm = tcm1 + 100 - tcm2; }
        if (tam >= 1 && tacm >= 1) {
          m1 = tm1; cm1 = tcm1; m2 = tm2; cm2 = tcm2; ansM = tam; ansCm = tacm; break;
        }
      }
      const expr: MathExpr = [
        txt('답: '), { kind: 'blank', slot: 0 }, txt(' m '),
        { kind: 'blank', slot: 1 }, txt(' cm'),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${name1}이의 줄넘기는 ${m1} m ${cm1} cm, ${name2}이의 줄넘기는 ${m2} m ${cm2} cm예요. 두 줄넘기의 길이의 차는 얼마인가요?`,
        expr,
        blankAnswers: [ansM, ansCm],
        explanation: [txt(`m끼리, cm끼리 빼요. ${m1} m ${cm1} cm − ${m2} m ${cm2} cm = ${ansM} m ${ansCm} cm예요.${cm1 < cm2 ? ` (cm가 모자라 1 m를 100 cm로 받아내렸어요.)` : ''}`)],
      };
    }
  },
};

export const unitLength22Skills: SkillDef[] = [
  len22Conv,
  len22Add,
  len22Sub,
  len22Unit,
  len22Word,
];
