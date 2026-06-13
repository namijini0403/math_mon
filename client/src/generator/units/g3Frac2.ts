/**
 * 단원: 분수 (2022 개정교육과정 3-2 4단원)
 * 성취기준: 전체의 분수만큼, 진/가/대분수 분류, 대분수↔가분수 변환,
 * 분모 같은 분수·가분수 크기 비교, 문장제
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. frac32-of-whole  전체의 분수만큼은 몇 (fill-blanks) ─────────
// 예: 12의 3/4은 몇? → 12 ÷ 4 × 3 = 9 (정수 답 보장: total는 d의 배수)
const frac32OfWhole: SkillDef = {
  id: 'frac32-of-whole',
  unitId: 'unitFrac32',
  difficulty: 1,
  title: '전체의 분수만큼은 몇',
  note: '전체의 n/d 만큼. total = d × k (정수 답 보장). 분모 ≤ 12. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 분모 2~12, 분자 1~d-1, 묶음크기 1~9
    const d = rng.int(2, 12);
    const n = rng.int(1, d - 1);
    const k = rng.int(1, 9);
    const total = d * k;
    const ans = k * n; // total ÷ d × n

    const themes = [
      { item: '구슬', container: '주머니' },
      { item: '사과', container: '바구니' },
      { item: '별 모양 쿠키', container: '상자' },
      { item: '마법 돌', container: '가방' },
    ];
    const theme = rng.pick(themes);

    const prompt = `${theme.container}에 ${theme.item} ${total}개가 있어요. 그 중 ${n}/${d}만큼은 몇 개인가요?`;
    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt(' 개'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [ans],
      explanation: [
        txt(`${total} ÷ ${d} × ${n} = ${k} × ${n} = ${ans}개`),
      ],
    };
  },
};

// ── 2. frac32-classify  진/가/대분수 분류 (choice) ──────────────────
const frac32Classify: SkillDef = {
  id: 'frac32-classify',
  unitId: 'unitFrac32',
  difficulty: 1,
  title: '진분수·가분수·대분수 분류',
  note: '하나의 분수를 보고 진분수/가분수/대분수 중 고르기. 4지선다(오답 3개는 나머지 종류+혼합). 분모 ≤ 12. choice.',
  generate(seed) {
    const rng = new RNG(seed);
    // 0=진분수 1=가분수 2=대분수
    const kind = rng.int(0, 2);

    let fracStr: string;
    let answer: string;

    if (kind === 0) {
      // 진분수: n < d
      const d = rng.int(2, 12);
      const n = rng.int(1, d - 1);
      fracStr = `${n}/${d}`;
      answer = '진분수';
    } else if (kind === 1) {
      // 가분수: n >= d
      const d = rng.int(2, 12);
      const n = rng.int(d, d * 2);
      fracStr = `${n}/${d}`;
      answer = '가분수';
    } else {
      // 대분수: whole + n/d (n < d)
      const d = rng.int(2, 12);
      const whole = rng.int(1, 5);
      const n = rng.int(1, d - 1);
      fracStr = `${whole}과 ${n}/${d}`;
      answer = '대분수';
    }

    const answerVal = txc(answer);
    const allTypes = ['진분수', '가분수', '대분수', '자연수'];
    const candidates = allTypes.filter(t => t !== answer).map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `"${fracStr}" 은(는) 어떤 분수인가요?`,
      choices,
      answerIndex,
      explanation: [
        txt(`진분수: 분자 < 분모, 가분수: 분자 ≥ 분모, 대분수: 자연수 + 진분수. "${fracStr}"은 ${answer}예요.`),
      ],
    };
  },
};

// ── 3. frac32-convert  대분수↔가분수 변환 (fraction-input) ──────────
const frac32Convert: SkillDef = {
  id: 'frac32-convert',
  unitId: 'unitFrac32',
  difficulty: 2,
  title: '대분수↔가분수 변환',
  note: '대분수→가분수 또는 가분수→대분수. fraction-input. 분모 ≤ 12.',
  generate(seed) {
    const rng = new RNG(seed);
    const dir = rng.int(0, 1); // 0=대→가, 1=가→대
    const d = rng.int(2, 12);

    let prompt: string;
    let ansN: number;
    let ansD: number;
    let ansWhole: number | undefined;
    let mixed: boolean;

    if (dir === 0) {
      // 대분수 → 가분수
      const whole = rng.int(1, 5);
      const n = rng.int(1, d - 1);
      const impN = whole * d + n;
      prompt = `${whole}과 ${n}/${d}을 가분수로 나타내세요.`;
      ansN = impN;
      ansD = d;
      ansWhole = undefined;
      mixed = false;
    } else {
      // 가분수 → 대분수 (whole >= 1 보장: impN >= d + 1)
      const whole = rng.int(1, 5);
      const remN = rng.int(1, d - 1);
      const impN = whole * d + remN;
      prompt = `${impN}/${d}을 대분수로 나타내세요.`;
      ansN = remN;
      ansD = d;
      ansWhole = whole;
      mixed = true;
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt,
      mixed,
      answer: { n: ansN, d: ansD, whole: ansWhole },
      requireIrreducible: false,
      explanation: dir === 0
        ? [
            txt(`${ansWhole === undefined ? '' : ''}분자 = 자연수 × 분모 + 분자. `),
            { kind: 'frac', n: ansN, d: ansD },
          ]
        : [
            txt(`${ansN + (ansWhole ?? 0) * ansD}/${ansD} = ${ansWhole}과 `),
            { kind: 'frac', n: ansN, d: ansD, whole: ansWhole },
          ],
    };
  },
};

// ── 4. frac32-cmp  분모 같은 분수·가분수 크기 비교 (comparison) ──────
const frac32Cmp: SkillDef = {
  id: 'frac32-cmp',
  unitId: 'unitFrac32',
  difficulty: 2,
  title: '분모 같은 분수·가분수 크기 비교',
  note: '같은 분모의 두 분수(가분수 포함) 크기 비교. comparison. 분모 ≤ 12.',
  generate(seed) {
    const rng = new RNG(seed);
    const d = rng.int(2, 12);
    // 분자 범위를 1~(d*2)로 해서 가분수 포함
    let n1: number;
    let n2: number;
    n1 = 1; n2 = 2;

    for (let tries = 0; tries < 300; tries++) {
      const tn1 = rng.int(1, d * 2);
      const tn2 = rng.int(1, d * 2);
      if (tn1 !== tn2) { n1 = tn1; n2 = tn2; break; }
    }

    const left: MathExpr = [{ kind: 'frac', n: n1, d }];
    const right: MathExpr = [{ kind: 'frac', n: n2, d }];
    const answer: '<' | '>' = n1 < n2 ? '<' : '>';

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'comparison',
      prompt: '두 분수의 크기를 비교하여 ○에 >, =, < 를 써넣으세요.',
      left,
      right,
      answer,
      explanation: [
        txt(`분모가 같을 때 분자가 클수록 커요. ${n1} ${n1 < n2 ? '<' : '>'} ${n2}이므로 `),
        { kind: 'frac', n: n1, d },
        txt(` ${answer} `),
        { kind: 'frac', n: n2, d },
      ],
    };
  },
};

// ── 5. frac32-word  분수 문장제 (fill-blanks) ───────────────────────
const frac32Word: SkillDef = {
  id: 'frac32-word',
  unitId: 'unitFrac32',
  difficulty: 3,
  word: true,
  title: '분수 문장제',
  note: '전체의 분수만큼, 변환, 비교 소재 문장제. 소재 3가지.',
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 2);

    let prompt: string;
    let ans: number;
    let unit: string;
    let expl: string;

    if (pat === 0) {
      // 전체의 분수만큼 묶음
      const d = rng.int(2, 8);
      const n = rng.int(1, d - 1);
      const k = rng.int(2, 6);
      const total = d * k;
      ans = k * n;
      unit = '개';
      prompt = `요정이 보물 ${total}개를 ${d}묶음으로 똑같이 나누었어요. 그 중 ${n}묶음은 몇 개인가요?`;
      // 3학년은 혼합계산(÷×) 전이므로 두 단계로 따로 설명
      expl = `한 묶음은 ${total} ÷ ${d} = ${k}개예요. ${n}묶음은 ${k} × ${n} = ${ans}개예요.`;
    } else if (pat === 1) {
      // 가분수→대분수 변환 후 자연수부 구하기
      const d = rng.int(2, 10);
      const whole = rng.int(1, 4);
      const remN = rng.int(1, d - 1);
      const impN = whole * d + remN;
      ans = whole;
      unit = '';
      prompt = `${impN}/${d}을 대분수로 나타낼 때, 자연수 부분은 얼마인가요?`;
      expl = `${impN} ÷ ${d} = ${whole} 나머지 ${remN} → ${whole}과 ${remN}/${d}. 자연수 부분: ${whole}`;
    } else {
      // 분수 크기 비교: 더 큰 쪽의 분자
      const d = rng.int(3, 10);
      const n1 = rng.int(1, d + 3);
      const n2 = rng.int(1, d + 3);
      const maxN = Math.max(n1, n2);
      if (maxN <= 0) {
        ans = 2;
        unit = '조각';
        prompt = `피자를 ${d}조각으로 나누었어요. 드래곤이 1/${d}을 먹었어요. 남은 조각은 몇 조각인가요?`;
        expl = `${d} - 1 = ${d - 1}조각`;
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt,
          expr: [txt('답: '), { kind: 'blank', slot: 0 }, txt(' ' + unit)],
          blankAnswers: [d - 1],
          explanation: [txt(expl)],
        };
      }
      ans = maxN;
      unit = '개';
      prompt = `분모가 ${d}인 두 분수 ${n1}/${d}과 ${n2}/${d} 중 더 큰 분수의 분자는 얼마인가요?`;
      expl = `분모가 같을 때 분자가 클수록 커요. ${n1} ${n1 < n2 ? '<' : '>'} ${n2}이므로 더 큰 분수의 분자는 ${maxN}이에요.`;
    }

    if (ans <= 0) { ans = 1; }

    const expr: MathExpr = [
      txt('답: '),
      { kind: 'blank', slot: 0 },
      txt(unit ? ' ' + unit : ''),
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
export const unitFrac32Skills: SkillDef[] = [
  frac32OfWhole,
  frac32Classify,
  frac32Convert,
  frac32Cmp,
  frac32Word,
];
