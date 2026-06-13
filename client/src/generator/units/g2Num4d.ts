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
        explanation: [txt(`천 모형 ${th}개는 ${th * 1000}, 백 모형 ${h}개는 ${h * 100}, 십 모형 ${t}개는 ${t * 10}, 일 모형 ${u}개는 ${u}이에요. 모두 더하면 ${th * 1000} + ${h * 100} + ${t * 10} + ${u} = ${ans}이에요.`)],
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
        explanation: [txt(`${num}을 천·백·십·일로 나누면 천의 자리 숫자가 ${th}이에요. 그래서 천 모형은 ${th}개예요.`)],
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
        explanation: [txt(`${num}을 천·백·십·일로 나누면 백의 자리 숫자가 ${h}이에요. 그래서 백 모형은 ${h}개예요.`)],
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
      explanation: [txt(`${num}에서 ${posName}의 자리 숫자는 ${digit}이에요. ${posName}의 자리에 있으므로 ${ans}을 나타내요.`)],
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
      explanation: [txt(`${step}씩 뛰어 세면 ${step === 1000 ? '천' : step === 100 ? '백' : step === 10 ? '십' : '일'}의 자리 숫자가 1씩 커져요: ${nums.join(', ')}. 그래서 □에는 ${answer}가 들어가요.`)],
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
    const bigger = Math.max(a, b);
    const names = ['천', '백', '십', '일'];
    const digitsA = [Math.floor(a / 1000), Math.floor(a / 100) % 10, Math.floor(a / 10) % 10, a % 10];
    const digitsB = [Math.floor(b / 1000), Math.floor(b / 100) % 10, Math.floor(b / 10) % 10, b % 10];
    let diff = 0;
    while (diff < 4 && digitsA[diff] === digitsB[diff]) diff++;
    let reason: string;
    if (diff === 0) {
      reason = `천의 자리를 비교하면 ${digitsA[0]}과 ${digitsB[0]}이라서, ${bigger}가 더 큽니다`;
    } else {
      const same = names.slice(0, diff).join('·');
      reason = `높은 자리부터 비교해요. ${same}의 자리가 같으니 ${names[diff]}의 자리를 비교하면 ${digitsA[diff]}과 ${digitsB[diff]}이라서, ${bigger}가 더 큽니다`;
    }
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '두 수의 크기를 비교하세요.',
      left: [{ kind: 'decimal', v: a }],
      right: [{ kind: 'decimal', v: b }],
      answer,
      explanation: [txt(`${reason}. (${a} ${answer} ${b})`)],
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
        explanation: [txt(`1000개짜리 ${th}상자는 ${th * 1000}개, 100개짜리 ${h}묶음은 ${h * 100}개, 10개짜리 ${t}묶음은 ${t * 10}개, 낱개 ${u}개. 모두 더하면 ${th * 1000} + ${h * 100} + ${t * 10} + ${u} = ${ans}개예요.`)],
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
        explanation: [txt(`${step}씩 3번 뛰어 세요: ${start} → ${start + step} → ${start + step * 2} → ${ans}. 그래서 ${ans}이에요.`)],
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
