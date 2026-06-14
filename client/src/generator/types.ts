/** 문제 표현 타입 — UI가 분수를 예쁘게 렌더할 수 있도록 구조화된 토큰을 사용한다 */

/** 수식 토큰. whole이 있으면 대분수로 렌더 */
export type MathToken =
  | { kind: 'text'; text: string }
  | { kind: 'frac'; n: number; d: number; whole?: number }
  | { kind: 'decimal'; v: number }
  | { kind: 'op'; op: '+' | '-' | '=' | '<' | '>' | '○' }
  | { kind: 'blank'; slot: number }
  /** 분자/분모 일부가 빈칸인 분수 (통분·크기가 같은 분수 만들기용) */
  | { kind: 'fracBlank'; n: number | { slot: number }; d: number | { slot: number }; whole?: number };

export type MathExpr = MathToken[];

/**
 * 문제 도해 명세 — 있으면 prompt 아래에 코드 렌더 SVG 그림을 그린다(FigureView).
 * 순수·결정적: 시드로 정해진 숫자/문자열만 담는다. 그림과 풀이의 수치는 generator가 같은 변수에서 만든다.
 * 미구현 kind는 FigureView가 빈 박스로 폴백(앱 안 깨짐). 없으면 기존 문제와 완전히 동일.
 */
export type FigureSpec =
  /** 한 변 side cm 정사각형 squares개를 대각 계단으로 이어 붙인 도형 (둘레=4·n·a) */
  | { kind: 'staircase'; squares: number; side: number }
  /** n×n×n 정육면체 겉면 색칠 후 1칸씩 자르기 — 한 면만 색칠된 칸(면 중앙) 강조 */
  | { kind: 'painted-cube'; n: number; highlight: 'one-face' }
  /** 합동 삼각형 둘을 이어 붙인 평행사변형 — 한 꼭짓점 각 ⓐ = a + b (위·아래 소각으로 분해 표시) */
  | { kind: 'congruent-parallelogram'; a: number; b: number }
  /** 정사각형 종이의 한 꼭짓점(90°)을 접음 — 크레아스가 90°를 ①(fold)과 ②(90−fold)로 나눔 */
  | { kind: 'paper-fold'; fold: number }
  /** 선대칭 마름모 — 한 각 given, 이웃각 ⓐ=180−given. 세로 대칭축 점선 */
  | { kind: 'rhombus-symmetry'; given: number }
  /** 직사각형(w×h)과 정사각형(s)이 일부 겹친 그림 — 교집합 음영 */
  | { kind: 'overlap-rect-square'; w: number; h: number; s: number; k: number };

/** 보기·매칭 카드에 들어가는 값 */
export type ChoiceValue =
  | { kind: 'frac'; n: number; d: number; whole?: number }
  | { kind: 'decimal'; v: number }
  | { kind: 'text'; text: string };

interface ProblemBase {
  /** `${skillId}:${seed}` — 재현 가능 */
  id: string;
  skillId: string;
  seed: number;
  /** 지시문 (예: "기약분수로 나타내세요") */
  prompt: string;
  /** 본문 수식 — 있으면 카드 중앙에 크게 렌더 */
  expr?: MathExpr;
  /** 해설 — 오답 시 표시 */
  explanation: MathExpr;
  /** 도해 — 있으면 prompt 아래에 SVG 그림을 그린다. 없으면 기존과 동일(비파괴) */
  figure?: FigureSpec;
}

/** 4지선다 */
export interface ChoiceProblem extends ProblemBase {
  format: 'choice';
  choices: ChoiceValue[];
  answerIndex: number;
}

/** 소수 직접 입력 (소수의 곱셈 등) */
export interface DecimalInputProblem extends ProblemBase {
  format: 'decimal-input';
  /** 정답 — 소수점 이하 최대 4자리의 정확한 십진수 */
  answer: number;
  /** 입력 칸 뒤에 붙는 단위 (예: 'cm') */
  unit?: string;
}

/** 분수 직접 입력 (mixed=true면 자연수 칸 포함) */
export interface FractionInputProblem extends ProblemBase {
  format: 'fraction-input';
  mixed: boolean;
  /** 정답 (기약, mixed면 whole 포함 표현) */
  answer: { n: number; d: number; whole?: number };
  /** true면 기약분수가 아닌 같은 값 입력은 오답 처리 */
  requireIrreducible: boolean;
}

/** 크기 비교: left ○ right 에 <, =, > 채우기 */
export interface ComparisonProblem extends ProblemBase {
  format: 'comparison';
  left: MathExpr;
  right: MathExpr;
  answer: '<' | '=' | '>';
}

/** 빈칸 채우기 — expr 안의 blank 토큰 slot 순서대로 정수 답 */
export interface FillBlanksProblem extends ProblemBase {
  format: 'fill-blanks';
  blankAnswers: number[];
}

/** 짝맞추기 — 카드 쌍 (UI에서 양쪽 셔플) */
export interface MatchingProblem extends ProblemBase {
  format: 'matching';
  pairs: { left: ChoiceValue; right: ChoiceValue }[];
}

export type Problem =
  | ChoiceProblem
  | FractionInputProblem
  | DecimalInputProblem
  | ComparisonProblem
  | FillBlanksProblem
  | MatchingProblem;

export type ProblemFormat = Problem['format'];

/** 스킬(문제 유형) 정의 — 시드를 받아 항상 같은 문제를 생성한다 */
export interface SkillDef {
  id: string;
  unitId: string;
  title: string;
  /** 출제 의도/성취기준 메모 (개발용) */
  note: string;
  /** 난이도: 1 기초 · 2 보통 · 3 도전 (레슨 내 난이도 램프와 보스전 출제에 사용) */
  difficulty: 1 | 2 | 3;
  /** 문장제 여부 (연습 모드 분류용) */
  word?: boolean;
  /** 심화 유형 여부 — 심화 스테이지·심화 연습·보스전 후반에만 출제 */
  challenge?: boolean;
  /**
   * 다양성 하한 (1000샘플 중 고유 문제 수). 기본 60.
   * 개념 암기형 스킬(예: 직육면체 면 개수)은 가짓수가 본질적으로 적으므로 낮게 지정.
   */
  minVariety?: number;
  generate: (seed: number) => Problem;
}

export interface UnitDef {
  id: string;
  title: string;
  /** 유닛맵에 표시될 순서대로의 스킬 id */
  skillIds: string[];
}
