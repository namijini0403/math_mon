/**
 * 단원: 규칙 찾기 (2022 개정교육과정 2-2 6단원)
 * 성취기준: 수 배열 규칙 다음 수, 덧셈표·곱셈표 빈칸, 반복 모양 규칙(이모지 n번째),
 * 쌓기 개수 규칙(1,3,5,…), 문장제.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. rule2-numseq  수 배열 규칙 다음 수 (fill-blanks)  난이도 1 ──────────────
const rule2NumSeq: SkillDef = {
  id: 'rule2-numseq',
  unitId: 'unitRule2',
  difficulty: 1,
  title: '수 배열 규칙 다음 수',
  note: '등차 수열 다음 수. fill-blanks. 간격: +2~+10, 또는 ×2·×3.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let seq: number[];
    let ruleDesc: string;

    if (pat === 0) {
      // 덧셈 규칙 (+d)
      const d = rng.int(2, 10);
      const start = rng.int(1, 30);
      seq = [0, 1, 2, 3, 4].map((i) => start + d * i);
      ruleDesc = `${d}씩 더하는 규칙`;
    } else if (pat === 1) {
      // 뺄셈 규칙 (-d): 감소 수열
      const d = rng.int(2, 8);
      const start = rng.int(30, 80);
      seq = [0, 1, 2, 3, 4].map((i) => start - d * i);
      // 모든 값이 양수인지 확인
      if (seq[4] < 1) {
        // 폴백: 덧셈
        const fd = rng.int(2, 5);
        const fstart = rng.int(1, 20);
        seq = [0, 1, 2, 3, 4].map((i) => fstart + fd * i);
        ruleDesc = `${fd}씩 더하는 규칙`;
      } else {
        ruleDesc = `${d}씩 빼는 규칙`;
      }
    } else {
      // 2배 규칙 (곱)
      const start = rng.int(1, 5);
      seq = [start, start * 2, start * 4, start * 8, start * 16];
      ruleDesc = '2배씩 커지는 규칙';
    }

    // 빈칸: 마지막 수
    const answer = seq[4];
    const display = [...seq.slice(0, 4), '□'].join(', ');
    const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `규칙을 찾아 □에 알맞은 수를 쓰세요.\n${display}`,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`${ruleDesc}이에요. □ = ${answer}`)],
    };
  },
};

// ── 2. rule2-table  덧셈표·곱셈표 빈칸 (fill-blanks)  난이도 2 ──────────────────
const rule2Table: SkillDef = {
  id: 'rule2-table',
  unitId: 'unitRule2',
  difficulty: 2,
  title: '덧셈표·곱셈표 빈칸',
  note: '덧셈표 또는 곱셈표에서 빈칸 1개. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const isAdd = rng.chance(0.5);

    if (isAdd) {
      // 덧셈표: 행 + 열 = 칸 값
      const rowVal = rng.int(1, 9);
      const colVal = rng.int(1, 9);
      const ans = rowVal + colVal;
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `덧셈표에서 ${rowVal} 행과 ${colVal} 열이 만나는 칸에 알맞은 수는 얼마인가요?\n(행 값 + 열 값 = 칸 값)`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${rowVal} + ${colVal} = ${ans}`)],
      };
    } else {
      // 곱셈표: 행 × 열 = 칸 값
      const rowVal = rng.int(2, 9);
      const colVal = rng.int(2, 9);
      const ans = rowVal * colVal;
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `곱셈표에서 ${rowVal} 행과 ${colVal} 열이 만나는 칸에 알맞은 수는 얼마인가요?\n(행 값 × 열 값 = 칸 값)`,
        expr,
        blankAnswers: [ans],
        explanation: [txt(`${rowVal} × ${colVal} = ${ans}`)],
      };
    }
  },
};

// ── 3. rule2-shape  반복 모양 규칙(n번째) (choice)  난이도 2 ──────────────────
const SHAPE_PATTERNS = [
  ['🍎', '🍌', '🍇'],
  ['⭐', '🌙', '☀️'],
  ['🐰', '🐶', '🐱'],
  ['🔺', '🔷', '⭕'],
  ['🎈', '🎀', '🎁'],
  ['🍎', '🍌'],
  ['⭐', '🌙'],
  ['🐰', '🐶'],
] as const;

const rule2Shape: SkillDef = {
  id: 'rule2-shape',
  unitId: 'unitRule2',
  difficulty: 2,
  title: '반복 모양 규칙 n번째',
  note: '이모지 반복 패턴에서 n번째 모양 선택. choice 4지선다.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pattern = rng.pick(SHAPE_PATTERNS);
    const period = pattern.length;
    // 보여줄 반복: 패턴 2~3번 반복
    const repeatCount = rng.int(2, 3);
    const shown = Array(repeatCount * period).fill(0).map((_, i) => pattern[i % period]);
    const shownStr = shown.join('');

    // n번째 물어볼 위치 (표시된 것 이후 ~ 표시된 것의 두 배 이내)
    const basePos = shown.length;
    const nthPos = basePos + rng.int(1, period * 2);
    const answer = pattern[(nthPos - 1) % period];

    const answerVal = txc(answer);
    // 오답: 패턴의 다른 이모지
    const otherEmojis = pattern.filter((e) => e !== answer) as string[];
    // 추가 오답: 다른 패턴에서 뽑기
    const extraEmojis = ['🌸', '🚀', '🎵', '🌈', '🦋', '🔥'];
    const allDistractors: ChoiceValue[] = [
      ...otherEmojis.map((e) => txc(e)),
      ...extraEmojis.filter((e) => !(pattern as readonly string[]).includes(e)).slice(0, 3).map((e) => txc(e)),
    ];
    const { choices, answerIndex } = buildChoices(answerVal, allDistractors, rng, 4);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `모양의 규칙을 찾아 ${nthPos}번째에 올 모양을 고르세요.\n${shownStr} …`,
      choices,
      answerIndex,
      explanation: [txt(`패턴이 ${pattern.join('')}(${period}개)씩 반복돼요. ${nthPos} ÷ ${period} = 몫 ${Math.floor((nthPos - 1) / period)}, 나머지 ${(nthPos - 1) % period}+1=${(nthPos - 1) % period + 1}번째 → ${answer}`)],
    };
  },
};

// ── 4. rule2-stack  쌓기 개수 규칙 (fill-blanks)  난이도 2 ──────────────────────
const rule2Stack: SkillDef = {
  id: 'rule2-stack',
  unitId: 'unitRule2',
  difficulty: 2,
  title: '쌓기 개수 규칙',
  note: '1, 3, 5, 7, … 또는 1, 4, 7, 10, … 규칙으로 쌓기 개수 예측. fill-blanks. 3패턴×(시작값+간격) ≈ 20종.',
  minVariety: 20,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let seq: number[];
    let ruleDesc: string;
    let context: string;

    if (pat === 0) {
      // 홀수 수열: 1, 3, 5, 7, 9
      seq = [1, 3, 5, 7, 9];
      ruleDesc = '2씩 늘어나는 규칙';
      context = '블록을 계단 모양으로 쌓을 때 층마다 쌓는 개수예요.';
    } else if (pat === 1) {
      // +d 수열 (d=2~5)
      const d = rng.int(2, 5);
      const start = rng.int(1, 5);
      seq = [0, 1, 2, 3, 4].map((i) => start + d * i);
      ruleDesc = `${d}씩 늘어나는 규칙`;
      context = '탑을 쌓을 때 층마다 쌓는 블록 수예요.';
    } else {
      // 제곱형: 1, 4, 9, 16, 25 (간단히 패턴 제시)
      seq = [1, 4, 9, 16, 25];
      ruleDesc = '정사각형 모양의 블록 수 (1²=1, 2²=4, 3²=9, ...)';
      context = '정사각형 모양으로 블록을 놓는 개수예요.';
    }

    const answer = seq[4];
    const display = [...seq.slice(0, 4), '□'].join(', ');
    const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('개')];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${context}\n${display}\n□에 알맞은 수는 얼마인가요?`,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`${ruleDesc}이에요. □ = ${answer}개`)],
    };
  },
};

// ── 5. rule2-word  규칙 찾기 문장제 (fill-blanks)  난이도 2 ──────────────────────
const rule2Word: SkillDef = {
  id: 'rule2-word',
  unitId: 'unitRule2',
  difficulty: 2,
  word: true,
  title: '규칙 찾기 문장제',
  note: '수 배열 또는 반복 이모지 규칙을 이용한 문장제. fill-blanks.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 수 배열 규칙 문장제
      const d = rng.int(2, 8);
      const start = rng.int(1, 20);
      const seq = [0, 1, 2, 3].map((i) => start + d * i);
      const answer = start + d * 4;
      const scenarios = [
        `계단의 각 층에 있는 빛나는 별이 ${seq.join(', ')} 개예요.`,
        `나무의 가지에 앉은 새가 ${seq.join(', ')} 마리예요.`,
        `상점의 선반에 있는 물건이 ${seq.join(', ')} 개예요.`,
      ];
      const scenario = rng.pick(scenarios);
      const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `규칙을 찾아 5번째에 올 수를 구하세요.\n${scenario}\n5번째에 올 수는 얼마인가요?`,
        expr,
        blankAnswers: [answer],
        explanation: [txt(`${d}씩 더하는 규칙: ${[...seq, answer].join(', ')} → ${answer}`)],
      };
    } else {
      // 반복 규칙 문장제
      const patterns = [
        { emojis: ['🍎', '🍌', '🍇'], name: '과일' },
        { emojis: ['⭐', '🌙', '☀️'], name: '별' },
        { emojis: ['🐰', '🐶', '🐱'], name: '동물' },
      ];
      const chosen = rng.pick(patterns);
      const period = chosen.emojis.length;
      const nthPos = rng.int(7, 15);
      const answer = chosen.emojis[(nthPos - 1) % period];
      const shown = Array(6).fill(0).map((_, i) => chosen.emojis[i % period]).join('');

      // 이모지를 순서 숫자로 변환 (choice가 아닌 순서 숫자로 fill-blanks)
      const posInPattern = (nthPos - 1) % period + 1; // 패턴 내 위치
      // 정답을 수로 나타낼 수 없으니 → 패턴 내 위치(1,2,3)를 정수 답으로
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt(`번째 ${chosen.name}`)];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${chosen.name}이 ${shown} … 순서로 반복돼요.\n${nthPos}번째에 오는 것은 ${chosen.emojis[0]}이 '1번째', ${chosen.emojis[1]}이 '2번째'처럼 패턴에서 몇 번째 ${chosen.name}인가요?`,
        expr,
        blankAnswers: [posInPattern],
        explanation: [txt(`패턴이 ${period}개씩 반복돼요. ${nthPos} ÷ ${period} = 몫 ${Math.floor((nthPos - 1) / period)}, 나머지 ${(nthPos - 1) % period} → 패턴에서 ${posInPattern}번째(${answer})`)],
      };
    }
  },
};

export const unitRule2Skills: SkillDef[] = [
  rule2NumSeq,
  rule2Table,
  rule2Shape,
  rule2Stack,
  rule2Word,
];
