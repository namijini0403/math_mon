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
