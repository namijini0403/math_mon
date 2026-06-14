/**
 * 단원: 덧셈과 뺄셈 (2022 개정교육과정 2-1 3단원)
 * 성취기준: 받아올림/받아내림이 있는 (두 자리)+(두 자리), (두 자리)−(두 자리),
 * 세 수 계산, □ 구하기를 할 수 있다.
 */

import { RNG } from '../rng';
import { nj, ida } from '../josa';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. as2-add  받아올림 덧셈 (fill-blanks)  난이도 1 ────────────────────────
const as2Add: SkillDef = {
  id: 'as2-add',
  unitId: 'unitAddSub2',
  difficulty: 1,
  title: '받아올림 덧셈',
  note: '받아올림이 있는 (두 자리)+(두 자리). fill-blanks. 합 18~99.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    let a = 28, b = 35;
    for (let tries = 0; tries < 200; tries++) {
      const ta = rng.int(11, 89);
      const tb = rng.int(11, 89);
      const tans = ta + tb;
      // 받아올림 있는 경우: 일의 자리 합 >= 10
      const u1 = ta % 10;
      const u2 = tb % 10;
      if (u1 + u2 >= 10 && tans <= 99) {
        a = ta; b = tb; break;
      }
    }
    const ans = a + b;
    const expr: MathExpr = [txt(`${a} + ${b} = `), { kind: 'blank', slot: 0 }];
    const u1 = a % 10, u2 = b % 10, at = Math.floor(a / 10), bt = Math.floor(b / 10);
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation: [txt(`일의 자리끼리 더하면 ${u1} + ${u2} = ${u1 + u2}이라서, 10을 십의 자리로 받아올려요. 십의 자리는 ${at} + ${bt}에 받아올린 1을 더해 ${ida(at + bt + 1)}. 그래서 ${a} + ${b} = ${ida(ans)}.`)],
    };
  },
};

// ── 2. as2-sub  받아내림 뺄셈 (fill-blanks)  난이도 1 ────────────────────────
const as2Sub: SkillDef = {
  id: 'as2-sub',
  unitId: 'unitAddSub2',
  difficulty: 1,
  title: '받아내림 뺄셈',
  note: '받아내림이 있는 (두 자리)−(두 자리). fill-blanks. 차 양수.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    let a = 53, b = 28;
    for (let tries = 0; tries < 200; tries++) {
      const ta = rng.int(21, 99);
      const tb = rng.int(11, ta - 1);
      const u1 = ta % 10;
      const u2 = tb % 10;
      if (u1 < u2 && ta - tb > 0) {
        a = ta; b = tb; break;
      }
    }
    const ans = a - b;
    const expr: MathExpr = [txt(`${a} - ${b} = `), { kind: 'blank', slot: 0 }];
    const u1 = a % 10, u2 = b % 10, at = Math.floor(a / 10), bt = Math.floor(b / 10);
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation: [txt(`일의 자리 ${u1}에서 ${nj(u2, '을/를')} 뺄 수 없어요. 십의 자리에서 10을 받아내리면 ${10 + u1} - ${u2} = ${ida(10 + u1 - u2)}. 십의 자리는 1을 빌려줬으니 ${at} - 1 - ${bt} = ${ida(at - 1 - bt)}. 그래서 ${a} - ${b} = ${ida(ans)}.`)],
    };
  },
};

// ── 3. as2-three  세 수 계산 (fill-blanks)  난이도 2 ─────────────────────────
const as2Three: SkillDef = {
  id: 'as2-three',
  unitId: 'unitAddSub2',
  difficulty: 2,
  title: '세 수 계산',
  note: '두 자리 수 세 수 덧뺄셈. fill-blanks. 결과 0~99.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    let ans = 30, opStr = '';
    let n1 = 10, n2 = 10, n3 = 10;
    const pat = rng.int(0, 2);
    for (let tries = 0; tries < 200; tries++) {
      let ta: number, tb: number, tc: number, tans: number, top: string;
      if (pat === 0) {
        // a + b + c
        ta = rng.int(10, 40);
        tb = rng.int(10, 30);
        tc = rng.int(1, 20);
        tans = ta + tb + tc;
        top = `${ta} + ${tb} + ${tc}`;
        if (tans <= 99) { ans = tans; opStr = top; n1 = ta; n2 = tb; n3 = tc; break; }
      } else if (pat === 1) {
        // a + b - c
        ta = rng.int(10, 50);
        tb = rng.int(10, 50);
        tc = rng.int(1, 20);
        tans = ta + tb - tc;
        top = `${ta} + ${tb} - ${tc}`;
        if (tans > 0 && tans <= 99) { ans = tans; opStr = top; n1 = ta; n2 = tb; n3 = tc; break; }
      } else {
        // a - b + c
        ta = rng.int(30, 99);
        tb = rng.int(10, ta - 10);
        tc = rng.int(1, 20);
        tans = ta - tb + tc;
        top = `${ta} - ${tb} + ${tc}`;
        if (tans > 0 && tans <= 99) { ans = tans; opStr = top; n1 = ta; n2 = tb; n3 = tc; break; }
      }
    }
    // 앞에서부터 두 수씩 차례로 계산하는 풀이
    let step1: number, expStr: string;
    if (pat === 0) {
      step1 = n1 + n2;
      expStr = `앞에서부터 차례로 계산해요. 먼저 ${n1} + ${n2} = ${step1}, 거기에 ${nj(n3, '을/를')} 더하면 ${step1} + ${n3} = ${ida(ans)}.`;
    } else if (pat === 1) {
      step1 = n1 + n2;
      expStr = `앞에서부터 차례로 계산해요. 먼저 ${n1} + ${n2} = ${step1}, 거기서 ${nj(n3, '을/를')} 빼면 ${step1} - ${n3} = ${ida(ans)}.`;
    } else {
      step1 = n1 - n2;
      expStr = `앞에서부터 차례로 계산해요. 먼저 ${n1} - ${n2} = ${step1}, 거기에 ${nj(n3, '을/를')} 더하면 ${step1} + ${n3} = ${ida(ans)}.`;
    }
    const expr: MathExpr = [txt(`${opStr} = `), { kind: 'blank', slot: 0 }];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation: [txt(expStr)],
    };
  },
};

// ── 4. as2-missing  □ 구하기 (fill-blanks)  난이도 2 ────────────────────────
const as2Missing: SkillDef = {
  id: 'as2-missing',
  unitId: 'unitAddSub2',
  difficulty: 2,
  title: '□ 구하기',
  note: '덧뺄셈 관계를 이용한 □ 구하기. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    let a = 25, b = 13, ans = 0;
    let promptStr = '';
    let expStr = '';

    if (pat === 0) {
      // □ + b = a+b  →  □ = a
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(11, 59);
        const tb = rng.int(11, 59);
        if (ta + tb <= 99) { a = ta; b = tb; break; }
      }
      ans = a;
      const total = a + b;
      promptStr = `□ + ${b} = ${total}`;
      expStr = `□와 ${nj(b, '을/를')} 더해 ${nj(total, '이/가')} 되었어요. □를 구하려면 전체 ${total}에서 ${nj(b, '을/를')} 빼면 돼요: ${total} - ${b} = ${ans}.`;
    } else {
      // a - □ = a-b  →  □ = b
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(21, 99);
        const tb = rng.int(11, ta - 1);
        if (ta - tb > 0) { a = ta; b = tb; break; }
      }
      ans = b;
      const diff = a - b;
      promptStr = `${a} - □ = ${diff}`;
      expStr = `${a}에서 □를 빼서 ${nj(diff, '이/가')} 남았어요. □를 구하려면 ${a}에서 남은 ${nj(diff, '을/를')} 빼면 돼요: ${a} - ${diff} = ${ans}.`;
    }

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `□에 알맞은 수를 구하세요.\n${promptStr}`,
      expr,
      blankAnswers: [ans],
      explanation: [txt(expStr)],
    };
  },
};

// ── 5. as2-word  문장제 (fill-blanks)  난이도 2 ────────────────────────────
const ITEMS_AS2 = ['사탕', '색연필', '구슬', '카드', '스티커', '도토리', '풍선', '딸기', '공책', '지우개'];
const as2Word: SkillDef = {
  id: 'as2-word',
  unitId: 'unitAddSub2',
  difficulty: 2,
  word: true,
  title: '덧셈과 뺄셈 문장제',
  note: '받아올림/받아내림 두 자리 덧뺄셈 문장제. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const item = rng.pick(ITEMS_AS2);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 덧셈 문장제
      let a = 28, b = 35;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(15, 60);
        const tb = rng.int(15, 60);
        const u1 = ta % 10;
        const u2 = tb % 10;
        if (u1 + u2 >= 10 && ta + tb <= 99) { a = ta; b = tb; break; }
      }
      const ans = a + b;
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${nj(item, '이/가')} ${a}개 있었어요. ${b}개를 더 받았어요. 모두 몇 개인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`처음 ${a}개에 받은 ${b}개를 더해요. ${a} + ${b} = ${ans}개예요.`)],
      };
    } else {
      // 뺄셈 문장제
      let a = 53, b = 28;
      for (let tries = 0; tries < 200; tries++) {
        const ta = rng.int(30, 99);
        const tb = rng.int(11, ta - 5);
        const u1 = ta % 10;
        const u2 = tb % 10;
        if (u1 < u2) { a = ta; b = tb; break; }
      }
      const ans = a - b;
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${nj(item, '이/가')} ${a}개 있었어요. ${b}개를 먹었어요. 남은 것은 몇 개인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`처음 ${a}개에서 먹은 ${b}개를 빼요. ${a} - ${b} = ${ans}개예요.`)],
      };
    }
  },
};

export const unitAddSub2Skills: SkillDef[] = [
  as2Add,
  as2Sub,
  as2Three,
  as2Missing,
  as2Word,
];
