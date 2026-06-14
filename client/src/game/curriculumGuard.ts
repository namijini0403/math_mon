/**
 * 교육과정 표기 가드 — 풀이(explanation)·문제 텍스트에 학년에 맞지 않는 표기가 섞이지 않게 한다.
 * (2022 개정. 예: 1학년 풀이에 곱셈기호(×), 3학년 전 분수·소수, 초등에 지수(2²) 등 금지.)
 *
 * 여기서 강제하는 것은 **명백한 표기 위반**뿐이다(어느 교과서에서도 그 학년엔 안 나오는 것).
 * 부등호(<,>)처럼 도입 학년이 모호한 것은 단원별 풀이 정비 때 수동으로 '말'로 바꾼다(docs/curriculum 참조).
 */

import type { MathExpr } from '../generator/types';
import { semesterOfUnit } from './gradeAccess';

/**
 * 풀이 교육과정 정비를 마친 단원 목록 (1단원부터 순차 audit).
 * 가드 테스트는 이 목록의 단원만 위반=실패로 강제한다.
 * 한 단원의 풀이를 학년 수준으로 정비하고 표기 위반 0을 확인하면 여기 추가한다.
 * 미등록 단원의 알려진 위반은 docs/curriculum/notation-violations.md에 추적.
 */
export const AUDITED_UNITS: ReadonlySet<string> = new Set<string>([
  // 1-1
  'unitNum9', // ① 9까지의 수
  'unitShape1', // ② 여러 가지 모양
  'unitAddSub1', // ③ 덧셈과 뺄셈
  'unitCompare1', // ④ 비교하기
  'unitNum50', // ⑤ 50까지의 수
  // 1-2
  'unitNum100', // ① 100까지의 수
  'unitAS12a', // ② 덧셈과 뺄셈(1)
  'unitShape12', // ③ 여러 가지 모양
  'unitAS12b', // ④ 덧셈과 뺄셈(2)
  'unitClock1', // ⑤ 시계 보기와 규칙 찾기
  'unitAS12c', // ⑥ 덧셈과 뺄셈(3)
  // 2-1
  'unitNum3d', // ① 세 자리 수
  'unitFigure2', // ② 여러 가지 도형
  'unitAddSub2', // ③ 덧셈과 뺄셈
  'unitLength2', // ④ 길이 재기
  'unitClassify', // ⑤ 분류하기
  'unitMulIntro', // ⑥ 곱셈
  // 2-2
  'unitNum4d', // ① 네 자리 수
  'unitGugu', // ② 곱셈구구
  'unitLength22', // ③ 길이 재기
  'unitTime2', // ④ 시각과 시간
  'unitTableGraph', // ⑤ 표와 그래프
  'unitRule2', // ⑥ 규칙 찾기
  // 3-1 (÷·분수·소수 도입 — 가드 자동 허용. 학기 내 단원 순서는 docs/curriculum/g3.md)
  'unitAdd3', // ① 덧셈과 뺄셈
  'unitPlane3', // ② 평면도형
  'unitDiv3', // ③ 나눗셈
  'unitMul31', // ④ 곱셈
  'unitTime3', // ⑤ 길이와 시간
  'unitFrac3', // ⑥ 분수와 소수
  // 3-2
  'unitMul32', // ① 곱셈
  'unitDiv32', // ② 나눗셈
  'unitCircle3', // ③ 원
  'unitFrac32', // ④ 분수
  'unitMeasure3', // ⑤ 들이와 무게
  'unitData3', // ⑥ 자료의 정리
  // 4-1 (큰 수·각도(°)·곱셈나눗셈·도형이동·막대그래프·규칙. 학기 내 순서는 docs/curriculum/g4.md)
  'unitBigNum', // ① 큰 수
  'unitAngle', // ② 각도
  'unitMulDiv', // ③ 곱셈과 나눗셈
  'unitMove', // ④ 평면도형의 이동
  'unitBarGraph', // ⑤ 막대그래프
  'unitFindRule', // ⑥ 규칙 찾기
  // 4-2 (분수 덧뺄(분모 같은)·삼각형·소수 덧뺄(0.01/0.001)·사각형·꺾은선그래프·다각형)
  'unitFracAS4', // ① 분수의 덧셈과 뺄셈 (약분 미도입 — 분모 유지)
  'unitTriangle', // ② 삼각형
  'unitDecAS', // ③ 소수의 덧셈과 뺄셈
  'unitQuad', // ④ 사각형
  'unitLineGraph', // ⑤ 꺾은선그래프
  'unitPolygon', // ⑥ 다각형
]);

export function isAuditedUnit(unitId: string): boolean {
  return AUDITED_UNITS.has(unitId);
}

/** unitId → 학년(1~6). 학기 미상이면 null(판정 보류). */
export function gradeOfUnit(unitId: string): number | null {
  const sem = semesterOfUnit(unitId); // 'g{N}s{M}'
  if (!sem) return null;
  const n = Number(sem[1]);
  return Number.isFinite(n) ? n : null;
}

interface TextRule {
  pattern: RegExp;
  /** 이 표기가 허용되는 최소 학년. 그 미만 학년에서 나오면 위반. (99 = 초등 전 학년 금지) */
  minGrade: number;
  label: string;
}

/**
 * 텍스트 표기 규칙.
 * - 곱셈기호(×): 곱셈은 2학년부터.
 * - 나눗셈기호(÷): 나눗셈은 3학년부터.
 * - 숫자 거듭제곱(2², 3^2): 초등 전 학년 금지(지수는 중등). 단 cm²·m³ 같은 '단위'는 글자+위첨자라 제외.
 * - 제곱근(√): 중등.
 */
const TEXT_RULES: TextRule[] = [
  { pattern: /×/, minGrade: 2, label: '곱셈기호(×)' },
  { pattern: /÷/, minGrade: 3, label: '나눗셈기호(÷)' },
  { pattern: /[0-9]\s*[²³⁴⁵⁶⁷⁸⁹]/, minGrade: 99, label: '숫자 거듭제곱(예: 2²)' },
  { pattern: /[0-9]\s*\^\s*[0-9]/, minGrade: 99, label: '거듭제곱(^) 표기' },
  { pattern: /√/, minGrade: 99, label: '제곱근(√)' },
];

interface Flat {
  text: string;
  hasFraction: boolean;
  /** 정수가 아닌 소수(소수점 값) 토큰이 있는가 (정수값 decimal 토큰은 제외) */
  hasRealDecimal: boolean;
}

/** explanation 토큰을 스캔용 문자열 + 분수/소수 토큰 유무로 평탄화 */
export function flattenExpr(expr: MathExpr): Flat {
  let text = '';
  let hasFraction = false;
  let hasRealDecimal = false;
  for (const t of expr) {
    switch (t.kind) {
      case 'text':
        text += t.text;
        break;
      case 'op':
        text += ` ${t.op} `;
        break;
      case 'blank':
        text += '□';
        break;
      case 'decimal':
        text += String(t.v);
        if (!Number.isInteger(t.v)) hasRealDecimal = true;
        break;
      case 'frac':
        hasFraction = true;
        text += `${t.whole ?? ''} ${t.n}/${t.d}`;
        break;
      case 'fracBlank':
        hasFraction = true;
        break;
    }
  }
  return { text, hasFraction, hasRealDecimal };
}

/**
 * 한 explanation이 해당 학년에서 위반하는 표기 라벨 목록을 반환(없으면 빈 배열).
 * grade가 null이면 판정 보류(빈 배열).
 */
export function findViolations(expr: MathExpr, grade: number | null): string[] {
  if (grade == null) return [];
  const flat = flattenExpr(expr);
  const out: string[] = [];
  for (const r of TEXT_RULES) {
    if (grade < r.minGrade && r.pattern.test(flat.text)) out.push(r.label);
  }
  // 분수·소수는 3학년부터
  if (grade < 3 && flat.hasFraction) out.push('분수 표기(3학년 전)');
  if (grade < 3 && flat.hasRealDecimal) out.push('소수 표기(3학년 전)');
  return out;
}
