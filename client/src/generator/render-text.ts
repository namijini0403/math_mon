/** 토큰 → 일반 텍스트 렌더 (콘솔 미리보기·디버그·테스트용) */

import type { ChoiceValue, MathExpr, MathToken } from './types';

export function tokenToText(t: MathToken): string {
  switch (t.kind) {
    case 'text':
      return t.text;
    case 'frac':
      return t.whole !== undefined ? `${t.whole} ${t.n}/${t.d}` : `${t.n}/${t.d}`;
    case 'decimal':
      return String(t.v);
    case 'op':
      return ` ${t.op} `;
    case 'blank':
      return '□';
    case 'fracBlank': {
      const n = typeof t.n === 'number' ? t.n : '□';
      const d = typeof t.d === 'number' ? t.d : '□';
      return `${n}/${d}`;
    }
  }
}

export function exprToText(expr: MathExpr): string {
  return expr.map(tokenToText).join('');
}

export function choiceToText(c: ChoiceValue): string {
  switch (c.kind) {
    case 'frac':
      return c.whole !== undefined ? `${c.whole} ${c.n}/${c.d}` : `${c.n}/${c.d}`;
    case 'decimal':
      return String(c.v);
    case 'text':
      return c.text;
  }
}

/** 문제의 정답을 한 줄 텍스트로 (교사용 정답 미리보기) */
export function answerToText(p: import('./types').Problem): string {
  switch (p.format) {
    case 'choice':
      return choiceToText(p.choices[p.answerIndex]);
    case 'fraction-input':
      return p.answer.whole !== undefined
        ? `${p.answer.whole} ${p.answer.n}/${p.answer.d}`
        : `${p.answer.n}/${p.answer.d}`;
    case 'decimal-input':
      return `${p.answer}${p.unit ?? ''}`;
    case 'comparison':
      return p.answer;
    case 'fill-blanks':
      return p.blankAnswers.join(', ');
    case 'matching':
      return '같은 값끼리 짝짓기';
  }
}
