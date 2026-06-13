/**
 * 단원: 네 자리 수 (2022 개정교육과정 2-2 1단원)
 * 성취기준: 네 자리 수의 구조(천·백·십·일), 자릿값, 뛰어 세기, 크기 비교를 안다.
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. num4d-compose  천 단위 구성 (fill-blanks)  난이도 1 ────────────────────
const num4dCompose: SkillDef = {
  id: 'num4d-compose',
  unitId: 'unitNum4d',
  difficulty: 1,
  title: '네 자리 수 구성',
  note: '천·백·십·일 단위 구성 또는 역방향. fill-blanks. 1000~9999.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    if (pat === 0) {
      // 천+백+십+일 → 수
      const th = rng.int(1, 9);
      const h = rng.int(0, 9);
      const t = rng.int(0, 9);
      const u = rng.int(0, 9);
      const ans = th * 1000 + h * 100 + t * 10 + u;
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `천 모형이 ${th}개, 백 모형이 ${h}개, 십 모형이 ${t}개, 일 모형이 ${u}개이면 얼마인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${th}×1000 + ${h}×100 + ${t}×10 + ${u} = ${ans}`)],
      };
    } else if (pat === 1) {
      // 수 → 천 자리 숫자
      const th = rng.int(1, 9);
      const h = rng.int(0, 9);
      const t = rng.int(0, 9);
      const u = rng.int(0, 9);
      const num = th * 1000 + h * 100 + t * 10 + u;
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${num}은 천 모형이 몇 개인가요?`,
        expr,
        blankAnswers: [th],
        explanation: [txt(`${num}에서 천의 자리 숫자는 ${th}이에요. 천 모형 ${th}개예요.`)],
      };
    } else {
      // 수 → 백 자리 숫자
      const th = rng.int(1, 9);
      const h = rng.int(1, 9);
      const t = rng.int(0, 9);
      const u = rng.int(0, 9);
      const num = th * 1000 + h * 100 + t * 10 + u;
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${num}은 백 모형이 몇 개인가요?`,
        expr,
        blankAnswers: [h],
        explanation: [txt(`${num}에서 백의 자리 숫자는 ${h}이에요. 백 모형 ${h}개예요.`)],
      };
    }
  },
};

// ── 2. num4d-place  자릿값 (fill-blanks)  난이도 2 ──────────────────────────
const num4dPlace: SkillDef = {
  id: 'num4d-place',
  unitId: 'unitNum4d',
  difficulty: 2,
  title: '네 자리 수 자릿값',
  note: '특정 자리 숫자가 나타내는 값. fill-blanks. 수 범위 1000~9999.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const th = rng.int(1, 9);
    const h = rng.int(1, 9);
    const t = rng.int(1, 9);
    const u = rng.int(1, 9);
    const num = th * 1000 + h * 100 + t * 10 + u;
    const pos = rng.int(0, 3); // 0=천, 1=백, 2=십, 3=일

    let posName: string;
    let ans: number;
    if (pos === 0) { posName = '천'; ans = th * 1000; }
    else if (pos === 1) { posName = '백'; ans = h * 100; }
    else if (pos === 2) { posName = '십'; ans = t * 10; }
    else { posName = '일'; ans = u; }

    const digit = pos === 0 ? th : pos === 1 ? h : pos === 2 ? t : u;
    const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${num}에서 ${posName}의 자리 숫자가 나타내는 값은 얼마인가요?`,
      expr,
      blankAnswers: [ans],
      explanation: [txt(`${num}의 ${posName}의 자리 숫자는 ${digit}이고, 이것이 나타내는 값은 ${ans}이에요.`)],
    };
  },
};

// ── 3. num4d-skip  뛰어 세기 (fill-blanks)  난이도 2 ──────────────────────────
const num4dSkip: SkillDef = {
  id: 'num4d-skip',
  unitId: 'unitNum4d',
  difficulty: 2,
  title: '네 자리 수 뛰어 세기',
  note: '1000·100·10·1씩 뛰어 세기. fill-blanks. 빈칸 1개.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const stepOpts = [1000, 100, 10, 1] as const;
    const step = rng.pick(stepOpts);
    let start = 1000;
    for (let tries = 0; tries < 200; tries++) {
      const ts = rng.int(1000, 8000);
      if (ts + step * 4 <= 9999) { start = ts; break; }
    }
    const pos = rng.int(1, 3);
    const nums: number[] = [0, 1, 2, 3, 4].map((i) => start + step * i);
    const answer = nums[pos];
    const display = nums.map((n, i) => (i === pos ? '□' : String(n))).join(', ');

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${step}씩 뛰어 셀 때 □에 알맞은 수를 쓰세요.\n${display}`,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`${step}씩 뛰어 세면: ${nums.join(', ')}. □에는 ${answer}가 들어가요.`)],
    };
  },
};

// ── 4. num4d-compare  크기 비교 (comparison)  난이도 2 ──────────────────────
const num4dCompare: SkillDef = {
  id: 'num4d-compare',
  unitId: 'unitNum4d',
  difficulty: 2,
  title: '네 자리 수 크기 비교',
  note: '두 네 자리 수의 크기 비교. comparison 형식.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    let a = 1000, b = 2000;
    for (let tries = 0; tries < 200; tries++) {
      const ta = rng.int(1000, 9999);
      const tb = rng.int(1000, 9999);
      if (ta !== tb) { a = ta; b = tb; break; }
    }
    const answer: '<' | '>' | '=' = a < b ? '<' : '>';
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '두 수의 크기를 비교하세요.',
      left: [{ kind: 'decimal', v: a }],
      right: [{ kind: 'decimal', v: b }],
      answer,
      explanation: [txt(`${a}와 ${b}를 비교하면: ${a} ${answer} ${b}이에요.`)],
    };
  },
};

// ── 5. num4d-word  문장제 (fill-blanks)  난이도 2 ──────────────────────────
const ITEMS_4D = ['구슬', '카드', '도토리', '별사탕', '풍선', '단추', '스티커', '사탕', '블록', '조각'];
const num4dWord: SkillDef = {
  id: 'num4d-word',
  unitId: 'unitNum4d',
  difficulty: 2,
  word: true,
  title: '네 자리 수 문장제',
  note: '네 자리 수 구성 또는 뛰어 세기 문장제. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const item = rng.pick(ITEMS_4D);

    if (pat === 0) {
      const th = rng.int(1, 9);
      const h = rng.int(0, 9);
      const t = rng.int(0, 9);
      const u = rng.int(0, 9);
      const ans = th * 1000 + h * 100 + t * 10 + u;
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${item}이 1000개짜리 상자 ${th}개, 100개짜리 묶음 ${h}개, 10개짜리 묶음 ${t}개, 낱개 ${u}개 있어요. 모두 몇 개인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${th}×1000 + ${h}×100 + ${t}×10 + ${u} = ${ans}개`)],
      };
    } else {
      const step = rng.pick([1000, 100] as const);
      let start = 1000;
      for (let tries = 0; tries < 200; tries++) {
        const ts = rng.int(1000, 8000);
        if (ts + step * 3 <= 9999) { start = ts; break; }
      }
      const ans = start + step * 3;
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${start}에서 ${step}씩 3번 뛰어 세면 얼마인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${start} → ${start + step} → ${start + step * 2} → ${ans}`)],
      };
    }
  },
};

export const unitNum4dSkills: SkillDef[] = [
  num4dCompose,
  num4dPlace,
  num4dSkip,
  num4dCompare,
  num4dWord,
];
