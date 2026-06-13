/**
 * 단원: 시계 보기와 규칙 찾기 (2022 개정교육과정 1-2 5단원)
 * 성취기준: 몇 시, 몇 시 30분을 읽고, 반복 규칙과 수 배열 규칙을 찾을 수 있다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. clock1-oclock  몇 시 (fill-blanks)  난이도 1 ──────────────────────────
const clock1OClock: SkillDef = {
  id: 'clock1-oclock',
  unitId: 'unitClock1',
  difficulty: 1,
  title: '몇 시',
  note: '서술형 시계 읽기 → 시(時) fill-blanks. 긴바늘이 12를 가리키는 경우.',
  minVariety: 12,
  generate(seed) {
    const rng = new RNG(seed);
    const hour = rng.int(1, 12);

    const expr: MathExpr = [
      { kind: 'blank', slot: 0 },
      txt('시'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `짧은바늘이 ${hour}, 긴바늘이 12를 가리켜요. 몇 시인가요?`,
      expr,
      blankAnswers: [hour],
      explanation: [txt(`긴바늘이 12를 가리키면 정각이에요. 짧은바늘이 ${hour}이므로 ${hour}시예요.`)],
    };
  },
};

// ── 2. clock1-half  몇 시 30분 (fill-blanks 2칸)  난이도 1 ──────────────────
const clock1Half: SkillDef = {
  id: 'clock1-half',
  unitId: 'unitClock1',
  difficulty: 1,
  title: '몇 시 30분',
  note: '긴바늘 6 서술 → [시, 분] 두 칸 fill-blanks.',
  minVariety: 12,
  generate(seed) {
    const rng = new RNG(seed);
    const hour = rng.int(1, 12);
    const nextHour = hour === 12 ? 1 : hour + 1;

    const expr: MathExpr = [
      { kind: 'blank', slot: 0 },
      txt('시 '),
      { kind: 'blank', slot: 1 },
      txt('분'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `짧은바늘이 ${hour}과 ${nextHour} 사이, 긴바늘이 6을 가리켜요. 몇 시 몇 분인가요?`,
      expr,
      blankAnswers: [hour, 30],
      explanation: [txt(`긴바늘이 6을 가리키면 30분이에요. 짧은바늘이 ${hour}과 ${nextHour} 사이이므로 ${hour}시 30분이에요.`)],
    };
  },
};

// ── 3. clock1-pattern  반복 규칙 (choice)  난이도 2 ─────────────────────────
// 이모지 패턴: A, B, A, B, ? 또는 A, B, C, A, B, C, ?
const EMOJI_POOLS = [
  ['🍎', '🍌'],
  ['⭐', '🌸'],
  ['🚗', '⚽'],
  ['🐰', '🐶'],
  ['🌷', '🌻'],
  ['🎈', '🍇'],
  ['🌙', '☀️'],
  ['🐱', '🐸'],
];

const clock1Pattern: SkillDef = {
  id: 'clock1-pattern',
  unitId: 'unitClock1',
  difficulty: 2,
  title: '반복 규칙',
  note: '이모지 AB 반복 패턴에서 다음 이모지 고르기. choice.',
  minVariety: 8,
  generate(seed) {
    const rng = new RNG(seed);
    const pool = rng.pick(EMOJI_POOLS);
    const [a, b] = pool;
    // 패턴: A B A B A B ?  → 다음은 A
    // 또는 A B A B A ?     → 다음은 B
    const shown = rng.int(4, 6); // 보여주는 개수
    const sequence = Array.from({ length: shown }, (_, i) => (i % 2 === 0 ? a : b));
    const nextIsA = shown % 2 === 0; // 다음이 A인지
    const correct = txc(nextIsA ? a : b);
    const wrong = txc(nextIsA ? b : a);

    const cands: ChoiceValue[] = [wrong, txc('?'), txc('❓')];
    const { choices, answerIndex } = buildChoices(correct, cands, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${sequence.join(' ')} ?  다음에 올 것은 무엇인가요?`,
      choices,
      answerIndex,
      explanation: [txt(`${a}, ${b}가 반복되는 규칙이에요. 다음은 ${nextIsA ? a : b}예요.`)],
    };
  },
};

// ── 4. clock1-numrule  수 배열 규칙 (fill-blanks)  난이도 2 ─────────────────
// +1, +2, +5, +10 씩 뛰어 세기
const clock1NumRule: SkillDef = {
  id: 'clock1-numrule',
  unitId: 'unitClock1',
  difficulty: 2,
  title: '수 배열 규칙',
  note: '+1/+2/+5/+10씩 뛰어 세기에서 빈칸 채우기. fill-blanks.',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    const steps = [1, 2, 5, 10];
    const step = rng.pick(steps);

    // 시작 수 결정
    let start = 1;
    if (step === 1) start = rng.int(1, 10);
    else if (step === 2) start = rng.int(1, 10) * 2;
    else if (step === 5) start = rng.int(1, 10) * 5;
    else start = rng.int(1, 8) * 10;

    // 5항 수열, 빈칸은 3번째(인덱스 2)
    const seq = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step];
    const blankPos = rng.int(2, 3); // 3번째 또는 4번째 빈칸
    const answer = seq[blankPos];

    const seqDisplay = seq.map((v, i) => i === blankPos ? '□' : `${v}`).join(', ');

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${seqDisplay}  □에 알맞은 수는 얼마인가요?`,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`${step}씩 커지는 규칙이에요. □ = ${answer}`)],
    };
  },
};

// ── 5. clock1-word  문장제 (fill-blanks)  난이도 2 ───────────────────────────
const clock1Word: SkillDef = {
  id: 'clock1-word',
  unitId: 'unitClock1',
  difficulty: 2,
  word: true,
  title: '시계 보기와 규칙 찾기 문장제',
  note: '시각 읽기 문장제(몇 시). fill-blanks.',
  minVariety: 12,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    let promptStr: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 몇 시 문장제
      const hour = rng.int(1, 12);
      answer = hour;
      promptStr = `민준이가 시계를 보니 짧은바늘이 ${hour}, 긴바늘이 12를 가리켜요. 지금은 몇 시인가요?`;
      explanation = [txt(`긴바늘이 12를 가리키면 정각이에요. 짧은바늘이 ${hour}이므로 ${hour}시예요.`)];
    } else {
      // 수 배열 규칙 문장제
      const step = rng.pick([1, 2, 5, 10]);
      const start = rng.int(1, 5) * step;
      const n = rng.int(3, 5); // n번째를 물어봄
      answer = start + (n - 1) * step;
      promptStr = `${start}부터 ${step}씩 커지는 규칙으로 수를 쓰고 있어요. ${n}번째 수는 얼마인가요?`;
      explanation = [txt(`${start}부터 ${step}씩 더해 가며 세면 ${n}번째 수는 ${answer}예요.`)];
    }

    const expr: MathExpr = [{ kind: 'blank', slot: 0 }];

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
export const unitClock1Skills: SkillDef[] = [
  clock1OClock,
  clock1Half,
  clock1Pattern,
  clock1NumRule,
  clock1Word,
];
