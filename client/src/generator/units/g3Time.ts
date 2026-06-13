/**
 * 단원: 길이와 시간 (2022 개정교육과정 3-1 5단원)
 * 성취기준: cm↔mm·km↔m 변환, 분↔초 변환,
 * 시간의 덧셈(분 받아올림: 빈칸 [시,분]), 시간의 뺄셈, 문장제
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. time3-len  cm↔mm·km↔m 변환 (fill-blanks) ──────────────────
const time3Len: SkillDef = {
  id: 'time3-len',
  unitId: 'unitTime3',
  difficulty: 1,
  title: '길이 단위 변환',
  note: 'cm↔mm, km↔m 단위 변환. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let expr: MathExpr;
    let ans: number;
    let expl: string;

    if (pat === 0) {
      // cm → mm (1cm = 10mm)
      const cm = rng.int(1, 99);
      ans = cm * 10;
      prompt = `${cm} cm는 몇 mm인가요?`;
      expr = [txt(`${cm} cm = `), { kind: 'blank', slot: 0 }, txt(' mm')];
      expl = `1 cm = 10 mm이므로 ${cm} cm = ${cm} × 10 = ${ans} mm`;
    } else if (pat === 1) {
      // mm → cm (받아떨어지는 수: 10의 배수)
      const cm = rng.int(1, 99);
      const mm = cm * 10;
      ans = cm;
      prompt = `${mm} mm는 몇 cm인가요?`;
      expr = [txt(`${mm} mm = `), { kind: 'blank', slot: 0 }, txt(' cm')];
      expl = `10 mm = 1 cm이므로 ${mm} mm = ${mm} ÷ 10 = ${ans} cm`;
    } else if (pat === 2) {
      // km → m (1km = 1000m)
      const km = rng.int(1, 9);
      ans = km * 1000;
      prompt = `${km} km는 몇 m인가요?`;
      expr = [txt(`${km} km = `), { kind: 'blank', slot: 0 }, txt(' m')];
      expl = `1 km = 1000 m이므로 ${km} km = ${km} × 1000 = ${ans} m`;
    } else {
      // m → km (받아떨어지는 수: 1000의 배수)
      const km = rng.int(1, 9);
      const m = km * 1000;
      ans = km;
      prompt = `${m} m는 몇 km인가요?`;
      expr = [txt(`${m} m = `), { kind: 'blank', slot: 0 }, txt(' km')];
      expl = `1000 m = 1 km이므로 ${m} m = ${m} ÷ 1000 = ${ans} km`;
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

// ── 2. time3-minsec  분↔초 변환 (fill-blanks) ─────────────────────
const time3MinSec: SkillDef = {
  id: 'time3-minsec',
  unitId: 'unitTime3',
  difficulty: 1,
  title: '분과 초 변환',
  note: '1분 = 60초 관계 변환. fill-blanks.',
  minVariety: 18,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    let prompt: string;
    let expr: MathExpr;
    let ans: number;
    let expl: string;

    if (pat === 0) {
      // 분 → 초
      const min = rng.int(1, 9);
      ans = min * 60;
      prompt = `${min}분은 몇 초인가요?`;
      expr = [txt(`${min}분 = `), { kind: 'blank', slot: 0 }, txt(' 초')];
      expl = `1분 = 60초이므로 ${min}분 = ${min} × 60 = ${ans}초`;
    } else {
      // 초 → 분 (받아떨어지는 수)
      const min = rng.int(1, 9);
      const sec = min * 60;
      ans = min;
      prompt = `${sec}초는 몇 분인가요?`;
      expr = [txt(`${sec}초 = `), { kind: 'blank', slot: 0 }, txt(' 분')];
      expl = `60초 = 1분이므로 ${sec}초 = ${sec} ÷ 60 = ${ans}분`;
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

// ── 3. time3-add  시간의 덧셈 (분 받아올림: [시, 분] 두 빈칸) ──────
const time3Add: SkillDef = {
  id: 'time3-add',
  unitId: 'unitTime3',
  difficulty: 2,
  title: '시간의 덧셈',
  note: '시:분 두 수 더하기. 분의 합이 60 이상이면 받아올림(시+1, 분-60). 빈칸 두 개 [시, 분]. 결과 분 >= 1 보장.',
  generate(seed) {
    const rng = new RNG(seed);
    // 받아올림이 생기는 경우와 없는 경우를 50:50
    const carry = rng.int(0, 1) === 1;

    let h1: number, m1: number, h2: number, m2: number;
    let rh: number, rm: number;

    h1 = 1; m1 = 20; h2 = 2; m2 = 31; rh = 3; rm = 51;

    for (let tries = 0; tries < 300; tries++) {
      const th1 = rng.int(1, 10);
      const th2 = rng.int(1, 10);
      // 분은 1~58 범위로 제한 — 0이나 59를 피해 결과가 1~58 사이가 되도록
      const tm1 = rng.int(1, 58);
      const tm2 = rng.int(1, 58);
      const totalMin = tm1 + tm2;
      const hasCarry = totalMin >= 60;
      if (carry !== hasCarry) continue;
      const trh = th1 + th2 + (hasCarry ? 1 : 0);
      const trm = totalMin - (hasCarry ? 60 : 0);
      // 결과 분 >= 1 보장
      if (trh <= 23 && trm >= 1 && trm <= 59) {
        h1 = th1; m1 = tm1; h2 = th2; m2 = tm2;
        rh = trh; rm = trm; break;
      }
    }

    const expr: MathExpr = [
      txt(`${h1}시간 ${m1}분 + ${h2}시간 ${m2}분 = `),
      { kind: 'blank', slot: 0 },
      txt('시간 '),
      { kind: 'blank', slot: 1 },
      txt('분'),
    ];

    const carryNote = carry ? ' 분이 60 이상이므로 1시간을 받아올림해요.' : '';

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [rh, rm],
      explanation: [txt(`${h1}시간 ${m1}분 + ${h2}시간 ${m2}분 = ${rh}시간 ${rm}분.${carryNote}`)],
    };
  },
};

// ── 4. time3-sub  시간의 뺄셈 (fill-blanks) ───────────────────────
const time3Sub: SkillDef = {
  id: 'time3-sub',
  unitId: 'unitTime3',
  difficulty: 2,
  title: '시간의 뺄셈',
  note: '시:분 두 수 빼기. 분에서 받아내림이 생길 수 있음. 빈칸 두 개 [시, 분]. 결과 시간 >= 1, 분 >= 1 보장.',
  generate(seed) {
    const rng = new RNG(seed);
    const borrow = rng.int(0, 1) === 1;

    let h1: number, m1: number, h2: number, m2: number;
    let rh: number, rm: number;

    h1 = 5; m1 = 40; h2 = 2; m2 = 20; rh = 3; rm = 20;

    for (let tries = 0; tries < 300; tries++) {
      const th1 = rng.int(3, 12);
      const th2 = rng.int(1, th1 - 2); // th1 - th2 >= 2 so after borrow still >= 1
      const tm1 = rng.int(1, 58);
      const tm2 = rng.int(1, 58);
      const hasBorrow = tm1 < tm2;
      if (borrow !== hasBorrow) continue;
      const trh = th1 - th2 - (hasBorrow ? 1 : 0);
      const trm = tm1 - tm2 + (hasBorrow ? 60 : 0);
      // 결과 시간 >= 1, 분 >= 1 보장
      if (trh >= 1 && trm >= 1 && trm <= 59) {
        h1 = th1; m1 = tm1; h2 = th2; m2 = tm2;
        rh = trh; rm = trm; break;
      }
    }

    const expr: MathExpr = [
      txt(`${h1}시간 ${m1}분 - ${h2}시간 ${m2}분 = `),
      { kind: 'blank', slot: 0 },
      txt('시간 '),
      { kind: 'blank', slot: 1 },
      txt('분'),
    ];

    const borrowNote = borrow ? ' 분이 부족하므로 1시간을 받아내림해요.' : '';

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [rh, rm],
      explanation: [txt(`${h1}시간 ${m1}분 - ${h2}시간 ${m2}분 = ${rh}시간 ${rm}분.${borrowNote}`)],
    };
  },
};

// ── 5. time3-word  길이와 시간 문장제 (fill-blanks) ───────────────
const time3Word: SkillDef = {
  id: 'time3-word',
  unitId: 'unitTime3',
  difficulty: 3,
  word: true,
  title: '길이·시간 문장제',
  note: '길이 또는 시간 계산 모험 소재 문장제. 소재 3가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let prompt: string;
    let ans: number;
    let unit: string;
    let expl: string;

    if (pat === 0) {
      // 거리 단위 변환 문장제
      const km = rng.int(1, 5);
      const extraM = rng.int(1, 9) * 100;
      const totalM = km * 1000 + extraM;
      ans = totalM;
      unit = 'm';
      prompt = `용사가 마법 숲까지 ${km} km ${extraM} m를 걸어갔어요. 몇 m를 걸은 건가요?`;
      expl = `${km} km = ${km * 1000} m, 합계 ${km * 1000} + ${extraM} = ${totalM} m`;
    } else if (pat === 1) {
      // 시간 덧셈 문장제
      const m1 = rng.int(20, 50);
      const m2 = rng.int(20, 50);
      const totalMin = m1 + m2;
      if (totalMin >= 60) {
        ans = totalMin - 60;
        unit = '분';
        prompt = `드래곤이 ${m1}분 동안 하늘을 날고, 다시 ${m2}분 더 날았어요. 두 번째 날기가 끝난 때는 처음 날기 시작 후 1시간 몇 분인가요?`;
        expl = `${m1} + ${m2} = ${totalMin}분 = 1시간 ${totalMin - 60}분`;
      } else {
        ans = totalMin;
        unit = '분';
        prompt = `요정이 마법 배우기를 ${m1}분, 날기 연습을 ${m2}분 했어요. 모두 몇 분인가요?`;
        expl = `${m1} + ${m2} = ${totalMin}분`;
      }
    } else {
      // 시간 뺄셈 문장제
      const totalH = rng.int(2, 5);
      const totalM = rng.int(10, 59);
      const usedH = rng.int(0, totalH - 1);
      const usedM = rng.int(0, 59);
      let leftH = totalH - usedH;
      let leftM = totalM - usedM;
      if (leftM < 0) { leftH -= 1; leftM += 60; }
      if (leftH < 1) {
        // 재계산: 단순히 분만 뺌
        const a = rng.int(40, 99);
        const b = rng.int(1, a - 1);
        ans = a - b;
        unit = '분';
        prompt = `마법 수업이 ${a}분 동안 있어요. 이미 ${b}분이 지났다면 남은 시간은 몇 분인가요?`;
        expl = `${a} - ${b} = ${ans}분`;
      } else {
        ans = leftM;
        unit = '분';
        prompt = `모험이 ${totalH}시간 ${totalM}분 걸려요. 이미 ${usedH}시간 ${usedM}분이 지났다면 남은 시간은 몇 시간 몇 분인가요? (분만 구하세요)`;
        expl = `${totalH}시간 ${totalM}분 - ${usedH}시간 ${usedM}분 = ${leftH}시간 ${leftM}분`;
      }
    }

    if (ans <= 0) { ans = 1; }

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
export const unitTime3Skills: SkillDef[] = [
  time3Len,
  time3MinSec,
  time3Add,
  time3Sub,
  time3Word,
];
