/**
 * 숫자-조사 가드: 전 스킬을 생성해 '숫자 + 조사'가 받침 규칙(josa.ts)과 어긋나면 실패.
 * 숫자는 한글 단어의 일부가 될 수 없고 조사 뒤 단어 경계만 보므로 오탐이 거의 없다.
 * (한글 명사 뒤 조사는 nj()가 런타임 받침으로 자동 처리 — 이 가드는 숫자 회귀만 잡음.)
 * 하드코딩 ${값}조사 대신 nj(값, '쌍')을 쓰면 통과한다.
 */

import { describe, it } from 'vitest';
import { SKILLS } from './index';
import { hasBatchim } from './josa';
import type { MathToken, Problem } from './types';

function collectText(p: Problem): string[] {
  const out: string[] = [p.prompt];
  const fromTokens = (tokens?: MathToken[]) => {
    for (const t of tokens ?? []) if (t.kind === 'text') out.push(t.text);
  };
  fromTokens(p.expr);
  fromTokens(p.explanation);
  if (p.format === 'comparison') { fromTokens(p.left); fromTokens(p.right); }
  if (p.format === 'choice') for (const c of p.choices) if (c.kind === 'text') out.push(c.text);
  if (p.format === 'matching') for (const pr of p.pairs) {
    if (pr.left.kind === 'text') out.push(pr.left.text);
    if (pr.right.kind === 'text') out.push(pr.right.text);
  }
  return out;
}

// 조사 → 받침 필요 여부
const JOSA_NEEDS_BATCHIM: Record<string, boolean> = {
  '이': true, '가': false,
  '은': true, '는': false,
  '을': true, '를': false,
  '과': true, '와': false,
};
// 숫자 바로 뒤 조사, 조사 뒤는 단어 경계(공백/문장부호/끝)일 때만 — 'N가지' 같은 의존명사 오탐 방지
const RE = /([0-9])(이|가|은|는|을|를|과|와)(?=[\s,.?!)」』]|$)/g;

describe('숫자-조사 감사', () => {
  it('숫자 뒤 조사가 받침 규칙과 일치', () => {
    const violations = new Set<string>();
    for (const skill of SKILLS) {
      for (let seed = 0; seed < 60; seed++) {
        let p: Problem;
        try { p = skill.generate(seed); } catch { continue; }
        for (const s of collectText(p)) {
          for (const m of s.matchAll(RE)) {
            const digit = Number(m[1]);
            const josaCh = m[2];
            if (hasBatchim(digit) !== JOSA_NEEDS_BATCHIM[josaCh]) {
              const idx = m.index ?? 0;
              const ctx = s.slice(Math.max(0, idx - 8), idx + 10);
              violations.add(`${skill.id}: …${ctx}… ("${m[1]}${m[2]}")`);
            }
          }
        }
      }
    }
    if (violations.size > 0) {
      throw new Error(`숫자-조사 위반 ${violations.size}건:\n` + [...violations].sort().join('\n'));
    }
  });
});
