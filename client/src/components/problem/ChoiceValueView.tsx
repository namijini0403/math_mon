import type { ChoiceValue } from '../../generator/types';
import { Fraction } from '../MathView';

export function ChoiceValueView({ value, size = 'lg' }: { value: ChoiceValue; size?: 'md' | 'lg' }) {
  switch (value.kind) {
    case 'frac':
      return <Fraction n={value.n} d={value.d} whole={value.whole} size={size} />;
    case 'decimal':
      return <span className="text-2xl font-bold">{value.v}</span>;
    case 'text':
      return <span className="text-xl">{value.text}</span>;
  }
}
