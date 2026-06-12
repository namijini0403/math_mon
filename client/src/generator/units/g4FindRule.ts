/**
 * 단원: 규칙 찾기 (2022 개정교육과정 4-1 6단원)
 * 성취기준: 수나 도형의 배열에서 규칙을 찾고, 규칙을 이용하여 여러 가지 문제를 해결한다.
 */

import { RNG } from '../rng';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. rule-next-term  수 배열 다음 항 (fill-blanks)  난이도 1 ─────────
/**
 * 등차·등비·증가폭 증가 수열의 다음 항 구하기.
 */
const ruleNextTerm: SkillDef = {
  id: 'rule-next-term',
  unitId: 'unitFindRule',
  difficulty: 1,
  title: '수 배열 다음 항',
  note: '등차·등비·증가폭증가 수열의 다음 항. fill-blanks. 답은 양의 정수.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let sequence: number[] = [];
    let answer = 0;
    let ruleDesc = '';

    if (pat === 0) {
      // 등차수열 (공차 2~9)
      const start = rng.int(1, 20);
      const diff = rng.int(2, 9);
      sequence = Array.from({ length: 5 }, (_, i) => start + diff * i);
      answer = start + diff * 5;
      ruleDesc = `${diff}씩 더하는 규칙`;
    } else if (pat === 1) {
      // 등비수열 (공비 2~3, 항수 5)
      const start = rng.int(1, 5);
      const ratio = rng.pick([2, 3] as const);
      sequence = Array.from({ length: 5 }, (_, i) => start * Math.pow(ratio, i));
      answer = start * Math.pow(ratio, 5);
      ruleDesc = `${ratio}배씩 곱하는 규칙`;
    } else {
      // 증가폭 증가 (계차수열): 1,2,3,4씩 증가
      const start = rng.int(1, 10);
      const firstDiff = rng.int(1, 4);
      const diffs = [firstDiff, firstDiff + 1, firstDiff + 2, firstDiff + 3, firstDiff + 4];
      sequence = [start];
      for (let i = 0; i < 4; i++) sequence.push(sequence[i] + diffs[i]);
      answer = sequence[4] + diffs[4];
      ruleDesc = `더하는 수가 ${firstDiff}, ${firstDiff + 1}, ${firstDiff + 2}, ...으로 1씩 커지는 규칙`;
    }

    const seqStr = sequence.join(', ');
    const expr: MathExpr = [txt(`${seqStr}, `), { kind: 'blank', slot: 0 }];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 수의 배열에서 규칙을 찾아 □에 알맞은 수를 구하세요.\n${seqStr}, □`,
      expr,
      blankAnswers: [answer],
      explanation: [
        txt(`규칙: ${ruleDesc}`),
        txt(`다음 수: ${answer}`),
      ],
    };
  },
};

// ── 2. rule-formula-nth  계산식 규칙 n번째 (fill-blanks)  난이도 2 ─────
/**
 * 예: 1×9+2=11, 12×9+3=111, 123×9+4=1111, ... 패턴에서 n번째 결과.
 * 또는: 11×11=121, 111×111=12321, ... 패턴.
 * 텍스트로 패턴을 제시하고 n번째 결과를 구함.
 */
const ruleFormulaNth: SkillDef = {
  id: 'rule-formula-nth',
  unitId: 'unitFindRule',
  difficulty: 2,
  title: '계산식 규칙 n번째',
  note: '계산식 패턴의 n번째 값 구하기. fill-blanks. 답 양의 정수.',
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴 4종 + 넓은 n 범위로 다양성 확보
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 덧셈 누적 패턴: 1=1, 1+2=3, 1+2+3=6 → n번째 = n(n+1)/2
      const n = rng.int(5, 20);
      answer = (n * (n + 1)) / 2;
      prompt = `다음 계산식의 규칙을 찾아 ${n}번째 결과를 구하세요.\n1 = 1\n1 + 2 = 3\n1 + 2 + 3 = 6\n1 + 2 + 3 + 4 = 10\n...\n(${n}번째) = □`;
      explanation = [
        txt(`규칙: n번째 = 1+2+...+n = n×(n+1)÷2`),
        txt(`${n}번째: ${n}×${n + 1}÷2 = ${answer}`),
      ];
    } else if (pat === 1) {
      // 곱셈 패턴: 1×1=1, 2×2=4, 3×3=9 → n번째 = n²
      const n = rng.int(6, 25);
      answer = n * n;
      prompt = `다음 계산식의 규칙을 찾아 ${n}번째 결과를 구하세요.\n1 × 1 = 1\n2 × 2 = 4\n3 × 3 = 9\n4 × 4 = 16\n...\n(${n}번째) = □`;
      explanation = [
        txt(`규칙: n번째 = n × n`),
        txt(`${n}번째: ${n} × ${n} = ${answer}`),
      ];
    } else if (pat === 2) {
      // 등차 계산식 패턴: 1×3=3, 2×3=6, 3×3=9 → n번째 = n×k
      const k = rng.int(2, 9);
      const n = rng.int(6, 20);
      answer = n * k;
      prompt = `다음 계산식의 규칙을 찾아 ${n}번째 결과를 구하세요.\n1 × ${k} = ${k}\n2 × ${k} = ${2 * k}\n3 × ${k} = ${3 * k}\n4 × ${k} = ${4 * k}\n...\n(${n}번째) = □`;
      explanation = [
        txt(`규칙: n번째 = n × ${k}`),
        txt(`${n}번째: ${n} × ${k} = ${answer}`),
      ];
    } else {
      // 더하기 누적 패턴: 1+3=4, 1+3+5=9, 1+3+5+7=16 → n번째 홀수합 = n²
      const n = rng.int(5, 18);
      answer = n * n;
      prompt = `다음 계산식의 규칙을 찾아 ${n}번째 결과를 구하세요.\n1 = 1\n1 + 3 = 4\n1 + 3 + 5 = 9\n1 + 3 + 5 + 7 = 16\n...\n(${n}번째 홀수까지의 합) = □`;
      explanation = [
        txt(`규칙: n번째 홀수까지의 합 = n²`),
        txt(`${n}번째: ${n} × ${n} = ${answer}`),
      ];
    }

    const expr: MathExpr = [txt('결과: '), { kind: 'blank', slot: 0 }];

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

// ── 3. rule-shape-count  도형 배열 n번째 개수 (fill-blanks)  난이도 2 ───
/**
 * 정사각형 배열: 1번째=1개, 2번째=4개, 3번째=9개 (n²) 패턴.
 * 또는 직선 배열: n번째=n개, n×2+1 등.
 */
const ruleShapeCount: SkillDef = {
  id: 'rule-shape-count',
  unitId: 'unitFindRule',
  difficulty: 2,
  title: '도형 배열 n번째 개수',
  note: '도형 배열에서 n번째 개수를 구함. fill-blanks. 답은 양의 정수.',
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴 4종 + 넓은 n 범위
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 정사각형 n×n 배열: n번째 = n²
      const n = rng.int(5, 20);
      const examples = [1, 2, 3, 4].map(i => `${i}번째: ${i * i}개`).join(', ');
      answer = n * n;
      prompt = `정사각형을 다음과 같이 배열합니다.\n${examples}\n${n}번째에 놓이는 정사각형은 몇 개인가요?`;
      explanation = [
        txt(`규칙: n번째 = n × n`),
        txt(`${n}번째: ${n} × ${n} = ${answer}개`),
      ];
    } else if (pat === 1) {
      // 삼각형 배열: 1, 3, 6, 10, ... (삼각수 = n(n+1)/2)
      const n = rng.int(5, 18);
      answer = (n * (n + 1)) / 2;
      const examples = [1, 2, 3, 4].map(i => `${i}번째: ${(i * (i + 1)) / 2}개`).join(', ');
      prompt = `삼각형을 다음과 같이 쌓습니다.\n${examples}\n${n}번째에 필요한 삼각형은 모두 몇 개인가요?`;
      explanation = [
        txt(`규칙: n번째 = n×(n+1)÷2`),
        txt(`${n}번째: ${n}×${n + 1}÷2 = ${answer}개`),
      ];
    } else if (pat === 2) {
      // 성냥개비 패턴: 정사각형 n개 이어 붙이기 → 3n+1
      const n = rng.int(5, 20);
      answer = 3 * n + 1;
      const examples = [1, 2, 3, 4].map(i => `${i}번째: ${3 * i + 1}개`).join(', ');
      prompt = `성냥개비로 정사각형을 옆으로 이어 붙입니다.\n${examples}\n${n}번째에 필요한 성냥개비는 몇 개인가요?`;
      explanation = [
        txt(`규칙: n번째 = 3 × n + 1`),
        txt(`${n}번째: 3 × ${n} + 1 = ${answer}개`),
      ];
    } else {
      // 성냥개비 삼각형 패턴: 삼각형 n개 이어 붙이기 → 2n+1
      const n = rng.int(5, 30);
      answer = 2 * n + 1;
      const examples = [1, 2, 3, 4].map(i => `${i}번째: ${2 * i + 1}개`).join(', ');
      prompt = `성냥개비로 삼각형을 옆으로 이어 붙입니다.\n${examples}\n${n}번째에 필요한 성냥개비는 몇 개인가요?`;
      explanation = [
        txt(`규칙: n번째 = 2 × n + 1`),
        txt(`${n}번째: 2 × ${n} + 1 = ${answer}개`),
      ];
    }

    const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }, txt('개')];

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

// ── 4. rule-inverse  대응 규칙 역산 (fill-blanks)  난이도 2 ───────────
/**
 * y = ax + b 형태의 대응 규칙이 주어질 때, y 값을 알고 x 구하기.
 */
const ruleInverse: SkillDef = {
  id: 'rule-inverse',
  unitId: 'unitFindRule',
  difficulty: 2,
  title: '대응 규칙 역산',
  note: '대응 규칙 y=ax+b에서 y가 주어졌을 때 x 구하기. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);

    // a: 2~5, b: 1~10, x: 2~10 → y = ax+b
    let a = 2, b = 1, xVal = 2, yVal = 6;
    for (let tries = 0; tries < 200; tries++) {
      const ta = rng.int(2, 5);
      const tb = rng.int(1, 10);
      const tx = rng.int(2, 10);
      const ty = ta * tx + tb;
      if (ty > 0 && ty <= 100) {
        a = ta; b = tb; xVal = tx; yVal = ty;
        break;
      }
    }

    // 표를 제시 (x: 1,2,3,□ 와 y 대응)
    const tableRows = [1, 2, 3].map(i => `x=${i} → y=${a * i + b}`);
    tableRows.push(`x=□ → y=${yVal}`);
    const tableText = tableRows.join(', ');

    const expr: MathExpr = [txt('□ = '), { kind: 'blank', slot: 0 }];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 표를 보고 □에 알맞은 수를 구하세요.\n${tableText}`,
      expr,
      blankAnswers: [xVal],
      explanation: [
        txt(`규칙: y = ${a} × x + ${b}`),
        txt(`${yVal} = ${a} × □ + ${b} → □ = (${yVal} - ${b}) ÷ ${a} = ${xVal}`),
      ],
    };
  },
};

// ── 5. rule-word  문장제 (fill-blanks)  난이도 3 ─────────────────────
const ruleWord: SkillDef = {
  id: 'rule-word',
  unitId: 'unitFindRule',
  difficulty: 3,
  word: true,
  title: '규칙 찾기 문장제',
  note: '규칙 찾기를 활용한 모험/판타지 소재 문장제.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    if (pat === 0) {
      // 등차수열 문장제
      const start = rng.int(5, 30);
      const diff = rng.int(3, 8);
      const n = rng.int(5, 10);
      answer = start + diff * (n - 1);
      prompt = `마법 도서관에 책이 매일 ${diff}권씩 늘어납니다. 처음에 책이 ${start}권 있었다면 ${n}일째 되는 날에는 책이 몇 권인가요?`;
      explanation = [txt(`${start} + ${diff} × (${n} - 1) = ${start} + ${diff * (n - 1)} = ${answer}권`)];
    } else if (pat === 1) {
      // 도형 배열 문장제 (성냥개비)
      const n = rng.int(5, 10);
      answer = 3 * n + 1;
      prompt = `요정 마을에서 성냥개비로 정사각형을 옆으로 이어 붙이고 있습니다. 1개 이어 붙이면 4개, 2개 이어 붙이면 7개, 3개 이어 붙이면 10개가 필요합니다. ${n}개를 이어 붙이려면 성냥개비가 몇 개 필요한가요?`;
      explanation = [txt(`규칙: 3 × n + 1 → 3 × ${n} + 1 = ${answer}개`)];
    } else if (pat === 2) {
      // 삼각수 문장제
      const n = rng.int(5, 9);
      answer = (n * (n + 1)) / 2;
      prompt = `탐험대가 삼각형 모양으로 마법 구슬을 쌓습니다. 1층=1개, 2층=3개, 3층=6개로 쌓는다면 ${n}층까지 쌓으면 구슬은 모두 몇 개인가요?`;
      explanation = [txt(`규칙: n×(n+1)÷2 → ${n}×${n + 1}÷2 = ${answer}개`)];
    } else {
      // 대응 규칙 문장제
      const pricePerUnit = rng.int(3, 8) * 100;
      const fixed = rng.int(1, 5) * 100;
      const n = rng.int(5, 15);
      answer = pricePerUnit * n + fixed;
      prompt = `마법 재료를 살 때 기본 배달비 ${fixed}원에 재료 1개당 ${pricePerUnit}원입니다. 재료를 ${n}개 사면 총 얼마를 내야 하나요?`;
      explanation = [txt(`${pricePerUnit} × ${n} + ${fixed} = ${answer}원`)];
    }

    const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }];

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
export const unitFindRuleSkills: SkillDef[] = [
  ruleNextTerm,
  ruleFormulaNth,
  ruleShapeCount,
  ruleInverse,
  ruleWord,
];
