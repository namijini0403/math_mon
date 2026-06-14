/**
 * 단원: 큰 수 (2022 개정교육과정 4-1 1단원)
 * 성취기준: 만·억·조 단위의 큰 수를 읽고 쓰며, 자릿값과 뛰어 세기,
 * 크기 비교를 할 수 있다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import { ida } from '../josa';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const dec = (v: number): ChoiceValue => ({ kind: 'decimal', v });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 한국식 큰 수 헬퍼 ───────────────────────────────────────────────

/** 네 자리 이하 수를 한국어로 읽기 (1234 → '천이백삼십사') */
function read4(n: number): string {
  if (n === 0) return '';
  const units = ['', '십', '백', '천'];
  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  let s = '';
  const str = String(n).padStart(4, '0');
  for (let i = 0; i < 4; i++) {
    const d = Number(str[i]);
    if (d === 0) continue;
    s += (d === 1 && i > 0 ? '' : digits[d]) + units[3 - i];
  }
  return s;
}

/** 큰 수를 한국어로 읽기 */
function readBigNum(n: number): string {
  if (n <= 0) return '영';
  const parts: string[] = [];
  const unitNames = ['', '만', '억', '조'];
  const divisors = [1, 10000, 100000000, 1000000000000];

  let rest = n;
  for (let i = 3; i >= 0; i--) {
    const div = divisors[i];
    if (rest >= div) {
      const q = Math.floor(rest / div);
      rest = rest - q * div;
      const r4 = read4(q);
      if (r4) parts.push(r4 + unitNames[i]);
    }
  }
  return parts.join('');
}

/** 숫자를 한국식 4자리 묶음 표기로 (123456789 → '1억 2345만 6789') */
function formatKorean(n: number): string {
  if (n === 0) return '0';
  if (n < 0) return '-' + formatKorean(-n);
  const unitNames = ['', '만 ', '억 ', '조 '];
  const divisors = [1, 10000, 100000000, 1000000000000];
  const parts: string[] = [];

  let rest = n;
  for (let i = 3; i >= 0; i--) {
    const div = divisors[i];
    if (rest >= div) {
      const q = Math.floor(rest / div);
      rest = rest - q * div;
      parts.push(String(q) + unitNames[i]);
    }
  }
  return parts.join('').trim();
}

// ── 1. big-read  만·억·조 읽기 (choice)  난이도 1 ──────────────────
const bigRead: SkillDef = {
  id: 'big-read',
  unitId: 'unitBigNum',
  difficulty: 1,
  title: '큰 수 읽기',
  note: '만~조 범위 큰 수를 한국어로 읽기. 4지선다.',
  generate(seed) {
    const rng = new RNG(seed);
    const level = rng.int(0, 2);
    let n: number;
    if (level === 0) {
      n = rng.int(1, 9999) * 10000 + rng.int(1, 9999);
    } else if (level === 1) {
      n = rng.int(1, 99) * 100000000 + rng.int(1, 9999) * 10000 + rng.int(1, 9999);
    } else {
      n = rng.int(1, 9) * 1000000000000 + rng.int(1, 9999) * 100000000;
    }

    const answer = readBigNum(n);

    // 오개념 오답
    const wrongCandidates: ChoiceValue[] = [];
    if (level === 0) {
      wrongCandidates.push(txc(readBigNum(n * 100)));
      wrongCandidates.push(txc(readBigNum(n + 10000)));
    } else if (level === 1) {
      wrongCandidates.push(txc(readBigNum(Math.floor(n / 10000))));
      wrongCandidates.push(txc(readBigNum(n + 10000)));
    } else {
      wrongCandidates.push(txc(readBigNum(Math.floor(n / 10000))));
      wrongCandidates.push(txc(readBigNum(Math.floor(n / 100000000))));
    }
    wrongCandidates.push(txc(readBigNum(n + 1000000)));
    wrongCandidates.push(txc(readBigNum(Math.max(10000, n - 1000000))));

    const { choices, answerIndex } = buildChoices(txc(answer), wrongCandidates, rng);

    const nStr = String(n).replace(/\B(?=(\d{4})+(?!\d))/g, ',');
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${nStr}을 읽어 보세요.`,
      expr: [txt(nStr)],
      choices,
      answerIndex,
      explanation: [
        txt(`오른쪽에서 네 자리씩 끊어 읽어요: ${nStr}.`),
        txt(`네 자리 묶음마다 만·억·조 단위를 붙이면 ${answer}이에요.`),
      ],
    };
  },
};

// ── 2. big-write  큰 수 쓰기 (choice)  난이도 1 ────────────────────
const bigWrite: SkillDef = {
  id: 'big-write',
  unitId: 'unitBigNum',
  difficulty: 1,
  title: '큰 수 쓰기',
  note: '한국어로 읽힌 큰 수를 숫자로 선택. 4지선다.',
  generate(seed) {
    const rng = new RNG(seed);
    const level = rng.int(0, 2);
    let n: number;
    if (level === 0) {
      n = rng.int(1, 999) * 10000;
    } else if (level === 1) {
      n = rng.int(1, 99) * 100000000;
    } else {
      n = rng.int(1, 9) * 100000000 + rng.int(1, 9999) * 10000;
    }
    const readStr = readBigNum(n);

    const wrongNums = [
      n + 10000,
      Math.max(10000, n - 10000),
      n * 10,
      n + 100000000,
    ].filter(v => v > 0 && v !== n);

    const answerVal = dec(n);
    const candidates: ChoiceValue[] = wrongNums.map(v => dec(v));
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    const nStr = String(n).replace(/\B(?=(\d{4})+(?!\d))/g, ',');
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `'${readStr}'을 수로 나타내면?`,
      choices,
      answerIndex,
      explanation: [
        txt(`'${readStr}'을 만·억·조 단위로 끊어 각 자리 수를 써요.`),
        txt(`네 자리씩 묶으면 ${nStr}, 곧 ${ida(n)}.`),
      ],
    };
  },
};

// ── 3. big-place  자릿수 구하기 (fill-blanks)  난이도 2 ────────────
const bigPlace: SkillDef = {
  id: 'big-place',
  unitId: 'unitBigNum',
  difficulty: 2,
  title: '자릿수의 숫자 구하기',
  note: '큰 수에서 특정 자리의 숫자(0~9). fill-blanks. 정답은 1~9만 허용.',
  generate(seed) {
    const rng = new RNG(seed);
    // 1억~9억9999만9999 사이
    let n = 0;
    const digits: number[] = [];
    for (let i = 0; i < 9; i++) {
      digits.push(rng.int(1, 9));
    }
    // 9자리 수 (1억대)
    n = digits[0] * 100000000 + digits[1] * 10000000 + digits[2] * 1000000
      + digits[3] * 100000 + digits[4] * 10000 + digits[5] * 1000
      + digits[6] * 100 + digits[7] * 10 + digits[8];

    const places = [
      { name: '억', pos: 0 },
      { name: '천만', pos: 1 },
      { name: '백만', pos: 2 },
      { name: '십만', pos: 3 },
      { name: '만', pos: 4 },
    ];
    const place = rng.pick(places);
    const answer = digits[place.pos]; // 1~9 (0이 나올 수 없음)

    const nStr = String(n).replace(/\B(?=(\d{4})+(?!\d))/g, ',');
    const expr: MathExpr = [
      txt(`${nStr}에서 ${place.name} 자리 숫자: `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${nStr}에서 ${place.name} 자리의 숫자를 구하세요.`,
      expr,
      blankAnswers: [answer],
      explanation: [
        txt(`오른쪽에서 네 자리씩 끊으면 ${place.name} 자리를 찾기 쉬워요.`),
        txt(`${nStr}에서 ${place.name} 자리 숫자는 ${ida(answer)}.`),
      ],
    };
  },
};

// ── 4. big-placevalue  몇 억·만인지 (fill-blanks)  난이도 2 ─────────
const bigPlaceValue: SkillDef = {
  id: 'big-placevalue',
  unitId: 'unitBigNum',
  difficulty: 2,
  title: '몇 만/억인지 구하기',
  note: '만/억 단위 묶음 개수 구하기. fill-blanks. 답은 1~99의 정수.',
  generate(seed) {
    const rng = new RNG(seed);
    const placeUnits: { name: string; unit: number }[] = [
      { name: '만', unit: 10000 },
      { name: '십만', unit: 100000 },
      { name: '백만', unit: 1000000 },
      { name: '천만', unit: 10000000 },
      { name: '억', unit: 100000000 },
    ];
    const place = rng.pick(placeUnits);
    const count = rng.int(1, 99);
    const value = count * place.unit;
    const valueStr = formatKorean(value);

    const expr: MathExpr = [
      txt(`${valueStr}은 ${place.name}이 몇 개인가요? `),
      { kind: 'blank', slot: 0 },
      txt('개'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${valueStr}은 ${place.name}이 몇 개인가요?`,
      expr,
      blankAnswers: [count],
      explanation: [
        txt(`${valueStr} = ${count} × ${formatKorean(place.unit)}`),
        txt(`따라서 ${place.name}이 ${ida(count)}개예요.`),
      ],
    };
  },
};

// ── 5. big-skip  뛰어 세기 (fill-blanks)  난이도 2 ──────────────────
const bigSkip: SkillDef = {
  id: 'big-skip',
  unitId: 'unitBigNum',
  difficulty: 2,
  title: '뛰어 세기',
  note: '일정한 수씩 뛰어 세기. 빈칸 채우기. 답은 만 단위 이상.',
  generate(seed) {
    const rng = new RNG(seed);
    const steps = [10000, 100000, 1000000, 10000000, 100000000];
    const step = rng.pick(steps);
    const startMultiple = rng.int(1, 30);
    const start = step * startMultiple;
    const blankPos = rng.int(1, 3); // 5개 중 1~3번 위치를 빈칸으로

    const sequence = Array.from({ length: 5 }, (_, i) => start + step * i);
    const answer = sequence[blankPos];

    const seqParts = sequence.map((v, i) =>
      i === blankPos ? '□' : formatKorean(v)
    );

    // expr: 빈칸 앞뒤 텍스트
    const before = seqParts.slice(0, blankPos).join(', ');
    const after = seqParts.slice(blankPos + 1).join(', ');
    const expr: MathExpr = before
      ? [txt(`${before}, `), { kind: 'blank', slot: 0 }, txt(`, ${after}`)]
      : [{ kind: 'blank', slot: 0 }, txt(`, ${after}`)];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${formatKorean(step)}씩 뛰어 세었을 때 □에 알맞은 수를 구하세요.`,
      expr,
      blankAnswers: [answer],
      explanation: [
        txt(`${formatKorean(step)}씩 뛰어 세면: `),
        txt(sequence.map(v => formatKorean(v)).join(' → ')),
      ],
    };
  },
};

// ── 6. big-compare  크기 비교 (comparison)  난이도 2 ────────────────
const bigCompare: SkillDef = {
  id: 'big-compare',
  unitId: 'unitBigNum',
  difficulty: 2,
  title: '큰 수 크기 비교',
  note: '두 큰 수의 크기 비교. comparison 형식.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number;
    const pat = rng.int(0, 2);
    if (pat === 0) {
      // 자릿수 다른 경우 (8자리 vs 9자리)
      a = rng.int(1000, 9999) * 10000 + rng.int(0, 9999);
      b = rng.int(1, 9) * 100000000 + rng.int(0, 9999) * 10000;
      if (rng.chance(0.5)) { const tmp = a; a = b; b = tmp; }
    } else if (pat === 1) {
      // 같은 자릿수, 다른 앞자리
      const base = rng.int(1, 9) * 100000000;
      const da = rng.int(0, 9);
      let db = rng.int(0, 9);
      while (db === da) db = rng.int(0, 9);
      a = base + da * 10000000 + rng.int(0, 9999) * 10000;
      b = base + db * 10000000 + rng.int(0, 9999) * 10000;
    } else {
      // 만 단위 vs 억 단위
      a = rng.int(100, 9999) * 10000;
      b = rng.int(1, 9) * 100000000;
    }

    const answer: '<' | '>' | '=' = a < b ? '<' : a > b ? '>' : '=';
    const sameLen = String(a).length === String(b).length;
    const bigger = a > b ? a : b;

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '두 수의 크기를 비교하세요.',
      // decimal 토큰으로 숫자 값 전달 (테스트 불변식: numeric token 필요)
      left: [{ kind: 'decimal', v: a }],
      right: [{ kind: 'decimal', v: b }],
      answer,
      explanation: [
        txt(`${formatKorean(a)} 와(과) ${formatKorean(b)} 의 크기를 비교해요.`),
        txt(sameLen
          ? `자리 수가 같으니 가장 높은 자리부터 차례로 비교하면 ${formatKorean(bigger)}이(가) 더 큽니다.`
          : `자리 수가 더 많은 ${formatKorean(bigger)}이(가) 더 큽니다.`),
        txt(a > b ? `${formatKorean(a)} > ${formatKorean(b)}` : `${formatKorean(a)} < ${formatKorean(b)}`),
      ],
    };
  },
};

// ── 7. big-word  문장제 (fill-blanks)  난이도 3 ─────────────────────
const bigWord: SkillDef = {
  id: 'big-word',
  unitId: 'unitBigNum',
  difficulty: 3,
  word: true,
  title: '큰 수 문장제',
  note: '큰 수를 활용한 모험/판타지 소재 문장제. 소재 4가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;
    let unit: string;

    if (pat === 0) {
      // 뛰어 세기 활용
      const step = rng.pick([10000, 100000, 1000000, 10000000]);
      const startMultiple = rng.int(2, 20);
      const start = startMultiple * step;
      const count = rng.int(3, 7);
      answer = start + step * count;
      prompt = `마법 성의 보물 상자에 금화가 ${formatKorean(start)}개 있었어요. 매일 ${formatKorean(step)}개씩 ${count}일 동안 더 쌓였다면 지금 금화는 모두 몇 개인가요?`;
      unit = '개';
      explanation = [
        txt(`매일 ${formatKorean(step)}개씩 ${count}일이면 ${formatKorean(step)} × ${count} = ${formatKorean(step * count)}개 늘어요.`),
        txt(`처음 금화에 더하면 ${formatKorean(start)} + ${formatKorean(step * count)} = ${formatKorean(answer)}개.`),
      ];
    } else if (pat === 1) {
      // 자릿값 묶음 개수 활용
      const digit = rng.int(2, 9);
      const placeVal = rng.pick([10000, 100000, 1000000, 100000000]);
      const total = digit * placeVal;
      answer = digit;
      prompt = `탐험대 금고에 ${formatKorean(total)}골드가 있어요. ${formatKorean(placeVal)}짜리 금덩이로만 가득 쌓여 있다면 금덩이는 모두 몇 개인가요?`;
      unit = '개';
      explanation = [
        txt(`${formatKorean(placeVal)}짜리로 ${formatKorean(total)}을 채우려면 ${formatKorean(total)} ÷ ${formatKorean(placeVal)} 을 구해요.`),
        txt(`${formatKorean(total)}은 ${formatKorean(placeVal)}이 ${ida(digit)}개 모인 수예요.`),
      ];
    } else if (pat === 2) {
      // 큰 수 덧셈
      const a = rng.int(1, 9) * 100000000 + rng.int(1, 9999) * 10000;
      const b = rng.int(1, 9) * 100000000 + rng.int(1, 9999) * 10000;
      answer = a + b;
      prompt = `왕국 A의 인구는 ${formatKorean(a)}명이고, 왕국 B의 인구는 ${formatKorean(b)}명이에요. 두 왕국의 인구를 합치면 몇 명인가요?`;
      unit = '명';
      explanation = [
        txt(`두 왕국의 인구를 더해요.`),
        txt(`${formatKorean(a)} + ${formatKorean(b)} = ${formatKorean(answer)}명.`),
      ];
    } else {
      // 뛰어 세기 역산 (과거값 = 지금보다 큼)
      const step = rng.pick([10000, 100000, 1000000]);
      const count = rng.int(3, 6);
      const endMultiple = rng.int(10, 50);
      const end = endMultiple * step;
      answer = end + step * count;
      prompt = `마법사가 주문을 걸 때마다 마나가 ${formatKorean(step)}씩 줄어들어요. 지금 마나가 ${formatKorean(end)}이고, ${count}번 주문을 걸기 전에는 마나가 얼마였나요?`;
      unit = '';
      explanation = [
        txt(`주문을 걸수록 마나가 줄었으니, 걸기 전에는 지금보다 더 많았어요.`),
        txt(`줄어든 양은 ${formatKorean(step)} × ${count} = ${formatKorean(step * count)}.`),
        txt(`지금 마나에 도로 더하면 ${formatKorean(end)} + ${formatKorean(step * count)} = ${formatKorean(answer)}.`),
      ];
    }

    const expr: MathExpr = unit
      ? [txt('답: '), { kind: 'blank', slot: 0 }, txt(' ' + unit)]
      : [txt('답: '), { kind: 'blank', slot: 0 }];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitBigNumSkills: SkillDef[] = [
  bigRead,
  bigWrite,
  bigPlace,
  bigPlaceValue,
  bigSkip,
  bigCompare,
  bigWord,
];
