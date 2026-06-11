/**
 * 단원: 자연수의 혼합 계산 (2022 개정교육과정 5-1 1단원)
 * 성취기준: 덧셈·뺄셈·곱셈·나눗셈이 섞인 식을 계산하고, 괄호가 있는 식의
 * 계산 순서를 이해하며, 혼합 계산을 활용한 문장제를 풀 수 있다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const tv = (v: number): ChoiceValue => ({ kind: 'decimal', v });

// ────────────────────────────────────────────────────────────────
// 1. mix-add-sub  덧셈·뺄셈 혼합 (괄호 없음, 3항)  난이도 1
// ────────────────────────────────────────────────────────────────
const mixAddSub: SkillDef = {
  id: 'mix-add-sub',
  unitId: 'unitMix',
  difficulty: 1,
  title: '덧셈·뺄셈 혼합 계산',
  note: '괄호 없는 3항 덧뺄셈. 중간·최종 결과 모두 ≥ 1.',
  generate(seed) {
    const rng = new RNG(seed);
    let a: number, b: number, c: number, op1: '+' | '-', op2: '+' | '-', mid: number, ans: number;
    let guard = 0;
    do {
      a = rng.int(10, 80);
      b = rng.int(2, 40);
      c = rng.int(2, 30);
      op1 = rng.chance(0.5) ? '+' : '-';
      op2 = rng.chance(0.5) ? '+' : '-';
      mid = op1 === '+' ? a + b : a - b;
      ans = op2 === '+' ? mid + c : mid - c;
      guard++;
    } while ((mid < 1 || ans < 1 || ans > 500) && guard < 300);

    const sym1 = op1 === '+' ? '+' : '−';
    const sym2 = op2 === '+' ? '+' : '−';
    const exprStr = `${a} ${sym1} ${b} ${sym2} ${c} = `;
    const expr: MathExpr = [txt(exprStr), { kind: 'blank', slot: 0 }];

    const explanation: MathExpr = [
      txt(`덧셈과 뺄셈은 앞에서부터 차례로 계산해요. `),
      txt(`${a} ${sym1} ${b} = ${mid}, `),
      txt(`${mid} ${sym2} ${c} = ${ans}`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ────────────────────────────────────────────────────────────────
// 2. mix-mul-div  곱셈·나눗셈 혼합 (3항, 나누어떨어지게)  난이도 1
// ────────────────────────────────────────────────────────────────
const mixMulDiv: SkillDef = {
  id: 'mix-mul-div',
  unitId: 'unitMix',
  difficulty: 1,
  title: '곱셈·나눗셈 혼합 계산',
  note: '괄호 없는 3항 곱나눗셈. 나누어떨어지고 결과 ≥ 1.',
  generate(seed) {
    const rng = new RNG(seed);
    let a = 0, b = 0, c = 0;
    let op1: '×' | '÷' = '×';
    let op2: '×' | '÷' = '÷';
    let mid = 0, ans = 0;
    let guard = 0;
    do {
      // 나누어 떨어지도록 생성: a ÷ b × c 또는 a × b ÷ c 등
      const pat = rng.int(0, 2); // 0: ×÷, 1: ÷×, 2: ÷÷
      if (pat === 0) {
        // a × b ÷ c → c | (a*b)
        a = rng.int(2, 12);
        b = rng.int(2, 9);
        const prod = a * b;
        const divs: number[] = [];
        for (let d = 2; d <= prod && d <= 20; d++) if (prod % d === 0 && prod / d >= 1) divs.push(d);
        if (divs.length === 0) { guard++; continue; }
        c = rng.pick(divs);
        op1 = '×'; op2 = '÷';
        mid = a * b;
        ans = mid / c;
      } else if (pat === 1) {
        // a ÷ b × c
        b = rng.int(2, 9);
        const multiples: number[] = [];
        for (let m = b; m <= 90; m += b) multiples.push(m);
        a = rng.pick(multiples);
        c = rng.int(2, 8);
        op1 = '÷'; op2 = '×';
        mid = a / b;
        ans = mid * c;
      } else {
        // a ÷ b ÷ c → need c | (a/b)
        b = rng.int(2, 9);
        const multiples: number[] = [];
        for (let m = b; m <= 90; m += b) multiples.push(m);
        a = rng.pick(multiples);
        const midVal = a / b;
        const divs2: number[] = [];
        for (let d = 2; d <= midVal && d <= 9; d++) if (midVal % d === 0 && midVal / d >= 1) divs2.push(d);
        if (divs2.length === 0) { guard++; continue; }
        c = rng.pick(divs2);
        op1 = '÷'; op2 = '÷';
        mid = midVal;
        ans = mid / c;
      }
      guard++;
    } while ((mid < 1 || ans < 1 || ans > 500) && guard < 300);

    const exprStr = `${a} ${op1} ${b} ${op2} ${c} = `;
    const expr: MathExpr = [txt(exprStr), { kind: 'blank', slot: 0 }];

    const explanation: MathExpr = [
      txt(`곱셈과 나눗셈은 앞에서부터 차례로 계산해요. `),
      txt(`${a} ${op1} ${b} = ${mid}, `),
      txt(`${mid} ${op2} ${c} = ${ans}`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ────────────────────────────────────────────────────────────────
// 3. mix-paren-addsub  괄호 있는 덧뺄셈  난이도 2
// ────────────────────────────────────────────────────────────────
const mixParenAddSub: SkillDef = {
  id: 'mix-paren-addsub',
  unitId: 'unitMix',
  difficulty: 2,
  title: '괄호 있는 덧셈·뺄셈',
  note: '괄호가 계산 순서를 바꾸는 경우만. 결과 ≥ 1.',
  generate(seed) {
    const rng = new RNG(seed);
    // 형태: A op1 (B op2 C) 단, 괄호 순서와 괄호 없는 순서가 달라야 함
    // 괄호 없으면: (A op1 B) op2 C  vs  괄호 있으면: A op1 (B op2 C)
    let a: number, b: number, c: number;
    let op1: '+' | '-', op2: '+' | '-';
    let withParen: number, withoutParen: number, innerVal: number;
    let guard = 0;

    do {
      a = rng.int(10, 70);
      b = rng.int(2, 30);
      c = rng.int(2, 20);
      op1 = rng.chance(0.5) ? '+' : '-';
      op2 = rng.chance(0.5) ? '+' : '-';

      innerVal = op2 === '+' ? b + c : b - c;
      withParen = op1 === '+' ? a + innerVal : a - innerVal;

      const step1 = op1 === '+' ? a + b : a - b;
      withoutParen = op2 === '+' ? step1 + c : step1 - c;
      guard++;
    } while (
      (innerVal < 1 || withParen < 1 || withParen === withoutParen || withParen > 500) &&
      guard < 300
    );

    const sym1 = op1 === '+' ? '+' : '−';
    const sym2 = op2 === '+' ? '+' : '−';
    const exprStr = `${a} ${sym1} (${b} ${sym2} ${c}) = `;
    const expr: MathExpr = [txt(exprStr), { kind: 'blank', slot: 0 }];

    const explanation: MathExpr = [
      txt(`괄호 안을 먼저 계산해요. `),
      txt(`(${b} ${sym2} ${c}) = ${innerVal}, `),
      txt(`${a} ${sym1} ${innerVal} = ${withParen}`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [withParen],
      explanation,
    };
  },
};

// ────────────────────────────────────────────────────────────────
// 4. mix-all-noparen  사칙연산 혼합 괄호 없음 (×÷ 먼저)  난이도 2
// ────────────────────────────────────────────────────────────────
const mixAllNoParen: SkillDef = {
  id: 'mix-all-noparen',
  unitId: 'unitMix',
  difficulty: 2,
  title: '사칙연산 혼합 (괄호 없음)',
  note: '×÷ 먼저, 그 다음 +-. choice 형식. 오개념 보기 3개.',
  generate(seed) {
    const rng = new RNG(seed);
    // 형태: a + b ÷ c × d - e  (×÷ 먼저 계산)
    let a: number, b: number, c: number, d: number, e: number;
    let mulDivResult: number, ans: number;
    let guard = 0;

    do {
      a = rng.int(2, 20);
      // b ÷ c × d: c|b, 결과 ≥ 1
      c = rng.int(2, 6);
      const multiples: number[] = [];
      for (let m = c; m <= 60; m += c) multiples.push(m);
      b = rng.pick(multiples);
      d = rng.int(2, 8);
      e = rng.int(1, 15);

      mulDivResult = (b / c) * d;   // ÷ then ×, left to right
      ans = a + mulDivResult - e;
      guard++;
    } while ((mulDivResult < 1 || ans < 1 || ans > 500 || !Number.isInteger(mulDivResult)) && guard < 300);

    const exprStr = `${a} + ${b} ÷ ${c} × ${d} − ${e}`;
    const answer = ans;

    // 오개념 보기 후보 (넉넉히 생성)
    // 1. 왼쪽부터 차례로: ((((a+b)÷c)×d)−e)
    const leftRight = (((a + b) / c) * d) - e;
    // 2. 곱셈만 먼저, 나눗셈을 +-와 같은 우선순위
    const mulFirst = a + b / (c * d) - e;
    // 3. 오프셋 실수 후보들 (±1 ~ ±5)
    const offsets = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5];
    // 4. 나눗셈 먼저 but 곱셈 나중에 오개념
    const altOp = a + b / c - e + d;
    // 5. 모든 연산을 왼쪽부터 (+ - 무시)
    const allLeft = ((a + b) - c) * d - e;
    // 6. 덧셈만 먼저 오개념: (a+b-e) * 나머지
    const addFirst = (a - e) + mulDivResult + 1;

    const rawCandidates = [
      leftRight, mulFirst, altOp, allLeft, addFirst,
      ...offsets.map(o => answer + o),
    ];
    const candidates: ChoiceValue[] = rawCandidates
      .filter(v => Number.isFinite(v) && Number.isInteger(v) && v >= 1 && v <= 500)
      .map(v => tv(Math.round(v)));

    const { choices, answerIndex } = buildChoices(tv(answer), candidates, rng);

    const explanation: MathExpr = [
      txt(`괄호가 없으면 곱셈과 나눗셈을 먼저 계산해요. `),
      txt(`${b} ÷ ${c} = ${b / c}, ${b / c} × ${d} = ${mulDivResult} → `),
      txt(`${a} + ${mulDivResult} − ${e} = ${answer}`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: '계산하세요.',
      expr: [txt(exprStr)],
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ────────────────────────────────────────────────────────────────
// 5. mix-paren-all  사칙연산 + 괄호  난이도 3
// ────────────────────────────────────────────────────────────────
const mixParenAll: SkillDef = {
  id: 'mix-paren-all',
  unitId: 'unitMix',
  difficulty: 3,
  title: '사칙연산과 괄호',
  note: '괄호+사칙연산 혼합. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 형태: (a - b) × c + d ÷ e
    // 혹은: a × (b + c) ÷ d - e  등 패턴 2가지
    let a: number, b: number, c: number, d: number, e: number;
    let parenVal: number, mulDivPart: number, ans: number;
    let exprStr: string;
    let step1Desc: string, step2Desc: string, step3Desc: string;
    let guard = 0;

    const pat = new RNG(seed + 1).int(0, 1);

    if (pat === 0) {
      // (a − b) × c + d ÷ e
      do {
        a = rng.int(10, 30);
        b = rng.int(2, a - 1);
        c = rng.int(2, 9);
        e = rng.int(2, 6);
        const multiples: number[] = [];
        for (let m = e; m <= 60; m += e) multiples.push(m);
        d = rng.pick(multiples);

        parenVal = a - b;
        mulDivPart = d / e;
        ans = parenVal * c + mulDivPart;
        guard++;
      } while ((parenVal < 1 || mulDivPart < 1 || ans < 1 || ans > 500 || !Number.isInteger(mulDivPart)) && guard < 300);

      exprStr = `(${a} − ${b}) × ${c} + ${d} ÷ ${e} = `;
      step1Desc = `괄호 먼저: (${a} − ${b}) = ${parenVal}`;
      step2Desc = `× ÷ 계산: ${parenVal} × ${c} = ${parenVal * c}, ${d} ÷ ${e} = ${mulDivPart}`;
      step3Desc = `+ − 계산: ${parenVal * c} + ${mulDivPart} = ${ans}`;
    } else {
      // a × (b + c) − d ÷ e
      do {
        b = rng.int(2, 10);
        c = rng.int(2, 10);
        a = rng.int(2, 8);
        e = rng.int(2, 6);
        const multiples: number[] = [];
        for (let m = e; m <= 60; m += e) multiples.push(m);
        d = rng.pick(multiples);

        parenVal = b + c;
        mulDivPart = d / e;
        ans = a * parenVal - mulDivPart;
        guard++;
      } while ((parenVal < 1 || mulDivPart < 1 || ans < 1 || ans > 500 || !Number.isInteger(mulDivPart)) && guard < 300);

      exprStr = `${a} × (${b} + ${c}) − ${d} ÷ ${e} = `;
      step1Desc = `괄호 먼저: (${b} + ${c}) = ${parenVal}`;
      step2Desc = `× ÷ 계산: ${a} × ${parenVal} = ${a * parenVal}, ${d} ÷ ${e} = ${mulDivPart}`;
      step3Desc = `+ − 계산: ${a * parenVal} − ${mulDivPart} = ${ans}`;
    }

    const expr: MathExpr = [txt(exprStr), { kind: 'blank', slot: 0 }];
    const explanation: MathExpr = [
      txt(`계산 순서: ① 괄호 → ② ×÷ → ③ +−. `),
      txt(`${step1Desc}. `),
      txt(`${step2Desc}. `),
      txt(`${step3Desc}`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '계산하세요.',
      expr,
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ────────────────────────────────────────────────────────────────
// 6. mix-missing  □ 역산  난이도 3
// ────────────────────────────────────────────────────────────────
const mixMissing: SkillDef = {
  id: 'mix-missing',
  unitId: 'unitMix',
  difficulty: 3,
  title: '□ 안에 알맞은 수 구하기',
  note: '혼합계산 역산. □ 결과 ≥ 1.',
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴 선택: 4가지
    // 0: a − □ × b = c  → □ = (a−c) / b
    // 1: □ × a + b = c  → □ = (c−b) / a
    // 2: a + b ÷ □ = c  → □ = b / (c−a)
    // 3: (a + □) × b = c  → □ = c/b − a
    const pat = rng.int(0, 3);
    let exprStr: string, boxAnswer: number;
    let explanation: MathExpr;
    let guard = 0;

    if (pat === 0) {
      // a − □ × b = c → □ = (a−c)/b, need b|(a−c), a−c>0
      let a: number, b: number, box: number, c: number;
      do {
        b = rng.int(2, 9);
        box = rng.int(1, 12);
        a = rng.int(box * b + 1, box * b + 30);
        c = a - box * b;
        guard++;
      } while ((c < 1 || box < 1 || a > 100 || c > 100) && guard < 300);
      exprStr = `${a} − □ × ${b} = ${c}`;
      boxAnswer = box;
      explanation = [
        txt(`□ × ${b}의 값을 먼저 구해요. ${a} − □ × ${b} = ${c} → □ × ${b} = ${a} − ${c} = ${a - c}. `),
        txt(`□ = ${a - c} ÷ ${b} = ${box}`),
      ];
    } else if (pat === 1) {
      // □ × a + b = c → □ = (c−b)/a
      let a: number, b: number, box: number, c: number;
      do {
        a = rng.int(2, 9);
        box = rng.int(1, 12);
        b = rng.int(1, 20);
        c = box * a + b;
        guard++;
      } while ((box < 1 || c < 1 || c > 200 || a > 100) && guard < 300);
      exprStr = `□ × ${a} + ${b} = ${c}`;
      boxAnswer = box;
      explanation = [
        txt(`□ × ${a}의 값을 먼저 구해요. □ × ${a} = ${c} − ${b} = ${c - b}. `),
        txt(`□ = ${c - b} ÷ ${a} = ${box}`),
      ];
    } else if (pat === 2) {
      // a + b ÷ □ = c → □ = b / (c−a), need (c−a)|b
      let a: number, b: number, box: number, c: number;
      do {
        box = rng.int(2, 9);
        b = box * rng.int(2, 8);
        a = rng.int(1, 20);
        c = a + b / box;
        guard++;
      } while ((box < 1 || c < 1 || b / box < 1 || c > 200 || !Number.isInteger(c)) && guard < 300);
      exprStr = `${a} + ${b} ÷ □ = ${c}`;
      boxAnswer = box;
      explanation = [
        txt(`${b} ÷ □의 값을 구해요. ${b} ÷ □ = ${c} − ${a} = ${c - a}. `),
        txt(`□ = ${b} ÷ ${c - a} = ${box}`),
      ];
    } else {
      // (a + □) × b = c → □ = c/b − a
      let a: number, b: number, box: number, c: number;
      do {
        b = rng.int(2, 8);
        box = rng.int(1, 15);
        a = rng.int(1, 20);
        c = (a + box) * b;
        guard++;
      } while ((box < 1 || c < 1 || c > 300 || a > 50) && guard < 300);
      exprStr = `(${a} + □) × ${b} = ${c}`;
      boxAnswer = box;
      explanation = [
        txt(`(${a} + □)의 값을 먼저 구해요. (${a} + □) = ${c} ÷ ${b} = ${c / b}. `),
        txt(`□ = ${c / b} − ${a} = ${box}`),
      ];
    }

    const expr: MathExpr = [txt(exprStr + ' 에서 □ = '), { kind: 'blank', slot: 0 }];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '□ 안에 알맞은 수를 써넣으세요.',
      expr,
      blankAnswers: [boxAnswer],
      explanation,
    };
  },
};

// ────────────────────────────────────────────────────────────────
// 7. mix-word  혼합계산 문장제  난이도 3
// ────────────────────────────────────────────────────────────────
interface WordProblemTemplate {
  /** 답의 단위 (권, 개, 장, 원 등) */
  unit: string;
  makePrompt: (rng: RNG) => { question: string; answer: number; exprDesc: string };
}

const wordTemplates: WordProblemTemplate[] = [
  // 0: 공책 묶음
  {
    unit: '권',
    makePrompt(rng) {
      const perBundle = rng.int(8, 15);
      const bundles = rng.int(2, 5);
      const given = rng.int(3, 15);
      const answer = perBundle * bundles - given;
      return {
        question: `공책이 한 묶음에 ${perBundle}권씩 ${bundles}묶음 있었는데 ${given}권을 나눠 줬어요. 남은 공책은 몇 권인가요?`,
        answer,
        exprDesc: `${perBundle} × ${bundles} − ${given} = ${perBundle * bundles} − ${given} = ${answer}`,
      };
    },
  },
  // 1: 사탕 나누기
  {
    unit: '개',
    makePrompt(rng) {
      const total = rng.int(20, 60);
      const people = rng.int(3, 6);
      const extra = rng.int(2, 8);
      // total을 people로 나눠떨어지도록 조정
      const base = Math.floor(total / people) * people;
      const each = base / people;
      const answer = each + extra;
      return {
        question: `사탕 ${base}개를 ${people}명이 똑같이 나누고, 한 명에게 ${extra}개를 더 줬어요. 한 명이 받은 사탕은 모두 몇 개인가요?`,
        answer,
        exprDesc: `${base} ÷ ${people} + ${extra} = ${each} + ${extra} = ${answer}`,
      };
    },
  },
  // 2: 과자 봉지
  {
    unit: '개',
    makePrompt(rng) {
      const perBag = rng.int(5, 12);
      const bags = rng.int(3, 7);
      const ate = rng.int(2, 10);
      const answer = perBag * bags - ate;
      return {
        question: `과자가 한 봉지에 ${perBag}개씩 ${bags}봉지 있어요. 그 중 ${ate}개를 먹었다면 남은 과자는 몇 개인가요?`,
        answer,
        exprDesc: `${perBag} × ${bags} − ${ate} = ${perBag * bags} − ${ate} = ${answer}`,
      };
    },
  },
  // 3: 색종이 나눠주기
  {
    unit: '장',
    makePrompt(rng) {
      const total = rng.int(20, 80);
      const groups = rng.int(2, 5);
      // 나누어 떨어지도록
      const base = Math.floor(total / groups) * groups;
      const each = base / groups;
      const extra = rng.int(2, 8);
      const answer = each - extra;
      if (answer < 1) {
        // fallback
        return {
          question: `색종이 ${base}장을 ${groups}모둠에 똑같이 나눠 주고, 각 모둠에서 ${1}장씩 사용했어요. 각 모둠에 남은 색종이는 몇 장인가요?`,
          answer: each - 1,
          exprDesc: `${base} ÷ ${groups} − 1 = ${each} − 1 = ${each - 1}`,
        };
      }
      return {
        question: `색종이 ${base}장을 ${groups}모둠에 똑같이 나눠 주고, 각 모둠에서 ${extra}장씩 사용했어요. 각 모둠에 남은 색종이는 몇 장인가요?`,
        answer,
        exprDesc: `${base} ÷ ${groups} − ${extra} = ${each} − ${extra} = ${answer}`,
      };
    },
  },
  // 4: 연필 구매
  {
    unit: '원',
    makePrompt(rng) {
      const price = rng.int(3, 9) * 100;
      const qty = rng.int(3, 6);
      const discount = rng.int(1, 3) * 100;
      const answer = price * qty - discount;
      return {
        question: `연필 한 자루에 ${price}원이에요. ${qty}자루를 사고 ${discount}원 할인을 받았다면 실제로 낸 돈은 얼마인가요?`,
        answer,
        exprDesc: `${price} × ${qty} − ${discount} = ${price * qty} − ${discount} = ${answer}`,
      };
    },
  },
  // 5: 붕어빵 나누기
  {
    unit: '개',
    makePrompt(rng) {
      const perPack = rng.int(4, 8);
      const packs = rng.int(3, 6);
      const friends = rng.int(2, 4);
      const total = perPack * packs;
      // friends가 total을 나눌 수 있도록 조정
      const base = Math.floor(total / friends) * friends;
      const each = base / friends;
      return {
        question: `붕어빵이 한 봉지에 ${perPack}개씩 ${packs}봉지 있어요. 이것을 ${friends}명이 똑같이 나누면 한 명이 받는 붕어빵은 몇 개인가요?`,
        answer: each,
        exprDesc: `${perPack} × ${packs} ÷ ${friends} = ${total} ÷ ${friends} = ${each}`,
      };
    },
  },
  // 6: 도서관 책
  {
    unit: '권',
    makePrompt(rng) {
      const shelves = rng.int(3, 6);
      const perShelf = rng.int(8, 15);
      const returned = rng.int(3, 12);
      const borrowed = rng.int(2, 8);
      const answer = shelves * perShelf + returned - borrowed;
      return {
        question: `도서관에 책이 ${shelves}칸에 ${perShelf}권씩 꽂혀 있어요. 오늘 ${returned}권이 반납되고 ${borrowed}권이 대출됐다면 지금 책은 몇 권인가요?`,
        answer,
        exprDesc: `${shelves} × ${perShelf} + ${returned} − ${borrowed} = ${shelves * perShelf} + ${returned} − ${borrowed} = ${answer}`,
      };
    },
  },
];

const mixWord: SkillDef = {
  id: 'mix-word',
  unitId: 'unitMix',
  difficulty: 3,
  word: true,
  title: '혼합계산 문장제',
  note: '실생활 문장제. 소재 풀 7개에서 RNG로 선택.',
  generate(seed) {
    const rng = new RNG(seed);
    const templateIdx = rng.int(0, wordTemplates.length - 1);
    const tmpl = wordTemplates[templateIdx];

    let result: { question: string; answer: number; exprDesc: string };
    let guard = 0;
    do {
      result = tmpl.makePrompt(new RNG(seed + guard * 7919));
      guard++;
    } while ((result.answer < 1 || result.answer > 500) && guard < 50);

    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt(tmpl.unit),
    ];

    const explanation: MathExpr = [
      txt(`식: ${result.exprDesc}`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: result.question,
      expr,
      blankAnswers: [result.answer],
      explanation,
    };
  },
};

// ────────────────────────────────────────────────────────────────
// Export
// ────────────────────────────────────────────────────────────────
export const unitMixSkills: SkillDef[] = [
  mixAddSub,
  mixMulDiv,
  mixParenAddSub,
  mixAllNoParen,
  mixParenAll,
  mixMissing,
  mixWord,
];
