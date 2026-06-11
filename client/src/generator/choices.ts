/** 보기(distractor) 구성 유틸 — 정답과 값이 겹치지 않는 오답만 채택한다 */

import type { ChoiceValue } from './types';
import type { RNG } from './rng';

/** 보기의 수치값 — 값이 같은 보기 두 개(복수 정답)를 막기 위한 비교 키 */
function numericKey(c: ChoiceValue): string {
  switch (c.kind) {
    case 'frac': {
      const whole = c.whole ?? 0;
      return `v:${(whole + c.n / c.d).toFixed(10)}`;
    }
    case 'decimal':
      return `v:${c.v.toFixed(10)}`;
    case 'text':
      return `t:${c.text}`;
  }
}

/** 표시 형태 키 — 화면에 똑같이 보이는 보기 중복 방지 */
function displayKey(c: ChoiceValue): string {
  switch (c.kind) {
    case 'frac':
      return `f:${c.whole ?? 0}:${c.n}/${c.d}`;
    case 'decimal':
      return `d:${c.v}`;
    case 'text':
      return `t:${c.text}`;
  }
}

/**
 * 정답 1개 + 오답 후보들로 4지선다 보기를 만든다.
 * - 정답과 값이 같은 후보, 서로 값이 같은 후보는 제거
 * - 후보가 부족하면 에러 (템플릿이 후보를 넉넉히 줘야 함)
 */
export function buildChoices(
  answer: ChoiceValue,
  candidates: ChoiceValue[],
  rng: RNG,
  count = 4,
): { choices: ChoiceValue[]; answerIndex: number } {
  const used = new Set<string>([numericKey(answer), displayKey(answer)]);
  const distractors: ChoiceValue[] = [];

  for (const c of candidates) {
    if (distractors.length >= count - 1) break;
    const nk = numericKey(c);
    const dk = displayKey(c);
    if (used.has(nk) || used.has(dk)) continue;
    // 음수 분자/분모 등 비정상 보기 차단
    if (c.kind === 'frac' && (c.n < 0 || c.d <= 0 || (c.whole ?? 0) < 0)) continue;
    used.add(nk);
    used.add(dk);
    distractors.push(c);
  }

  if (distractors.length < count - 1) {
    throw new Error(`not enough distractors: got ${distractors.length}, need ${count - 1}`);
  }

  const choices = rng.shuffle([answer, ...distractors]);
  return { choices, answerIndex: choices.indexOf(answer) };
}
