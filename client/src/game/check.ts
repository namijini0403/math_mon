/** 사용자 답안 판정 */

import { equals, fromMixed, isIrreducible } from '../generator/fraction';
import type { Problem } from '../generator/types';

export type UserAnswer =
  | { kind: 'choice'; index: number }
  | { kind: 'fraction'; whole: number | null; n: number | null; d: number | null }
  | { kind: 'comparison'; symbol: '<' | '=' | '>' }
  | { kind: 'blanks'; values: (number | null)[] }
  | { kind: 'matching'; mistakes: number };

export function checkAnswer(p: Problem, a: UserAnswer): boolean {
  switch (p.format) {
    case 'choice':
      return a.kind === 'choice' && a.index === p.answerIndex;
    case 'comparison':
      return a.kind === 'comparison' && a.symbol === p.answer;
    case 'fill-blanks':
      return (
        a.kind === 'blanks' &&
        a.values.length === p.blankAnswers.length &&
        p.blankAnswers.every((v, i) => a.values[i] === v)
      );
    case 'matching':
      // 매칭은 뷰에서 완주 — 한 번도 틀리지 않아야 정답 처리
      return a.kind === 'matching' && a.mistakes === 0;
    case 'fraction-input': {
      if (a.kind !== 'fraction' || a.n === null || a.d === null || a.d === 0) return false;
      const input = { whole: a.whole ?? 0, n: a.n, d: a.d };
      const target = { n: (p.answer.whole ?? 0) * p.answer.d + p.answer.n, d: p.answer.d };
      const inputFrac = fromMixed(input);
      if (!equals(inputFrac, target)) return false;
      if (p.requireIrreducible && input.n > 0 && !isIrreducible({ n: input.n, d: input.d }))
        return false;
      // 대분수 요구 시 분수 부분은 진분수여야 함 (예: 정답 1 1/2에 3/2 입력 → 오답)
      if (p.mixed && input.n >= input.d) return false;
      return true;
    }
  }
}

/** 입력이 채워져서 확인 버튼을 누를 수 있는 상태인지 */
export function isAnswerReady(p: Problem, a: UserAnswer | null): boolean {
  if (!a) return false;
  switch (a.kind) {
    case 'choice':
    case 'comparison':
      return true;
    case 'fraction':
      return a.n !== null && a.d !== null && (p.format !== 'fraction-input' || !p.mixed || a.whole !== null);
    case 'blanks':
      return a.values.every((v) => v !== null);
    case 'matching':
      return true;
  }
}
