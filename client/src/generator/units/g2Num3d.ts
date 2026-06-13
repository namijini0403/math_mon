/**
 * 단원: 세 자리 수 (2022 개정교육과정 2-1 1단원)
 * 성취기준: 세 자리 수의 구조(백·십·일), 자릿값, 뛰어 세기, 크기 비교를 안다.
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. num3d-compose  백·십·일 구성 (fill-blanks)  난이도 1 ────────────────
const num3dCompose: SkillDef = {
  id: 'num3d-compose',
  unitId: 'unitNum3d',
  difficulty: 1,
  title: '세 자리 수 구성',
  note: '백 단위 n개 + 십 단위 m개 + 일 단위 k개 = ? 또는 역방향. fill-blanks. 100~999.',
  minVariety: 54,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    if (pat === 0) {
      // 백+십+일 → 수
      const h = rng.int(1, 9);
      const t = rng.int(0, 9);
      const u = rng.int(0, 9);
      const ans = h * 100 + t * 10 + u;
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `백 모형이 ${h}개, 십 모형이 ${t}개, 일 모형이 ${u}개이면 얼마인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${h}×100 + ${t}×10 + ${u} = ${ans}`)],
      };
    } else if (pat === 1) {
      // 수 → 백 자리 숫자
      const h = rng.int(1, 9);
      const t = rng.int(0, 9);
      const u = rng.int(0, 9);
      const num = h * 100 + t * 10 + u;
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
    } else {
      // 수 → 십 자리 숫자
      const h = rng.int(1, 9);
      const t = rng.int(1, 9);
      const u = rng.int(0, 9);
      const num = h * 100 + t * 10 + u;
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${num}은 십 모형이 몇 개인가요?`,
        expr,
        blankAnswers: [t],
        explanation: [txt(`${num}에서 십의 자리 숫자는 ${t}이에요. 십 모형 ${t}개예요.`)],
      };
    }
  },
};

// ── 2. num3d-place  자릿값 (fill-blanks)  난이도 2 ──────────────────────────
const num3dPlace: SkillDef = {
  id: 'num3d-place',
  unitId: 'unitNum3d',
  difficulty: 2,
  title: '자릿값',
  note: '특정 자리 숫자가 나타내는 값. fill-blanks. 수 범위 100~999.',
  minVariety: 54,
  generate(seed) {
    const rng = new RNG(seed);
    const h = rng.int(1, 9);
    const t = rng.int(1, 9);
    const u = rng.int(1, 9);
    const num = h * 100 + t * 10 + u;
    const pos = rng.int(0, 2); // 0=백, 1=십, 2=일

    let posName: string;
    let ans: number;
    if (pos === 0) {
      posName = '백';
      ans = h * 100;
    } else if (pos === 1) {
      posName = '십';
      ans = t * 10;
    } else {
      posName = '일';
      ans = u;
    }

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${num}에서 ${posName}의 자리 숫자가 나타내는 값은 얼마인가요?`,
      expr,
      blankAnswers: [ans],
      explanation: [txt(`${num}의 ${posName}의 자리 숫자는 ${pos === 0 ? h : pos === 1 ? t : u}이고, 이것이 나타내는 값은 ${ans}이에요.`)],
    };
  },
};

// ── 3. num3d-skip  뛰어 세기 (fill-blanks)  난이도 2 ──────────────────────────
const num3dSkip: SkillDef = {
  id: 'num3d-skip',
  unitId: 'unitNum3d',
  difficulty: 2,
  title: '뛰어 세기',
  note: '100·10·1씩 뛰어 세기. fill-blanks. 빈칸 1개.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const stepOpts = [100, 10, 1];
    const step = rng.pick(stepOpts);
    // 시작값: step에 따라 범위 설정
    let start = 100;
    for (let tries = 0; tries < 200; tries++) {
      const ts = rng.int(100, 800);
      if (ts + step * 4 <= 999) { start = ts; break; }
    }
    const pos = rng.int(1, 3); // 빈칸 위치 (0-indexed: 1,2,3번)
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

// ── 4. num3d-compare  크기 비교 (comparison)  난이도 2 ──────────────────────
const num3dCompare: SkillDef = {
  id: 'num3d-compare',
  unitId: 'unitNum3d',
  difficulty: 2,
  title: '세 자리 수 크기 비교',
  note: '두 세 자리 수의 크기 비교. comparison 형식.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    let a = 100, b = 200;
    for (let tries = 0; tries < 200; tries++) {
      const ta = rng.int(100, 999);
      const tb = rng.int(100, 999);
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

// ── 5. num3d-word  문장제 (fill-blanks)  난이도 2 ──────────────────────────
const ITEMS_3D = ['색연필', '공책', '구슬', '카드', '도토리', '별사탕', '풍선', '단추', '스티커', '조개'];
const num3dWord: SkillDef = {
  id: 'num3d-word',
  unitId: 'unitNum3d',
  difficulty: 2,
  word: true,
  title: '세 자리 수 문장제',
  note: '세 자리 수 구성 또는 뛰어 세기 문장제. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const item = rng.pick(ITEMS_3D);

    if (pat === 0) {
      const h = rng.int(1, 9);
      const t = rng.int(0, 9);
      const u = rng.int(0, 9);
      const ans = h * 100 + t * 10 + u;
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${item}이 100개짜리 상자 ${h}개, 10개짜리 묶음 ${t}개, 낱개 ${u}개 있어요. 모두 몇 개인가요?`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${h}×100 + ${t}×10 + ${u} = ${ans}개`)],
      };
    } else {
      const step = rng.pick([100, 10] as const);
      let start = 100;
      for (let tries = 0; tries < 200; tries++) {
        const ts = rng.int(100, 700);
        if (ts + step * 3 <= 999) { start = ts; break; }
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

export const unitNum3dSkills: SkillDef[] = [
  num3dCompose,
  num3dPlace,
  num3dSkip,
  num3dCompare,
  num3dWord,
];
