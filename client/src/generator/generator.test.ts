/**
 * 생성기 속성 테스트 — 스킬당 1,000 샘플을 생성해 불변식을 검증한다.
 * 불변식: 정답 정확성, 보기 유일성(복수 정답 금지), 5학년 수 범위, 재현성.
 */

import { describe, expect, it } from 'vitest';
import { SKILLS } from './index';
import { equals, gcd, isProper, simplify, type Frac } from './fraction';
import type { ChoiceValue, MathToken, Problem } from './types';

const SAMPLES = 1000;
/** 통분 후 분모 상한 (5학년 수준) */
const MAX_DENOM = 60;

function choiceNum(c: ChoiceValue): number {
  switch (c.kind) {
    case 'frac':
      return (c.whole ?? 0) + c.n / c.d;
    case 'decimal':
      return c.v;
    case 'text':
      return NaN;
  }
}

function tokenNum(t: MathToken): number {
  if (t.kind === 'frac') return (t.whole ?? 0) + t.n / t.d;
  if (t.kind === 'decimal') return t.v;
  return NaN;
}

/** 문제 안의 모든 분수 토큰 수집 (expr + 해설 + 보기) */
function collectFracs(p: Problem): { n: number; d: number; whole?: number }[] {
  const out: { n: number; d: number; whole?: number }[] = [];
  const fromTokens = (tokens: MathToken[] | undefined) => {
    for (const t of tokens ?? []) {
      if (t.kind === 'frac') out.push(t);
      if (t.kind === 'fracBlank' && typeof t.n === 'number' && typeof t.d === 'number')
        out.push({ n: t.n, d: t.d });
    }
  };
  fromTokens(p.expr);
  fromTokens(p.explanation);
  if (p.format === 'comparison') {
    fromTokens(p.left);
    fromTokens(p.right);
  }
  if (p.format === 'choice') {
    for (const c of p.choices) if (c.kind === 'frac') out.push(c);
  }
  if (p.format === 'matching') {
    for (const pair of p.pairs) {
      if (pair.left.kind === 'frac') out.push(pair.left);
      if (pair.right.kind === 'frac') out.push(pair.right);
    }
  }
  return out;
}

function checkCommon(p: Problem, skillId: string, seed: number) {
  expect(p.skillId).toBe(skillId);
  expect(p.id).toBe(`${skillId}:${seed}`);
  expect(p.prompt.length).toBeGreaterThan(0);
  expect(p.explanation.length).toBeGreaterThan(0);

  // 수 범위: 분모 양수·상한, 분자 0 이상, 자연수부 0 이상
  for (const f of collectFracs(p)) {
    expect(f.d).toBeGreaterThan(0);
    expect(f.d).toBeLessThanOrEqual(MAX_DENOM);
    expect(f.n).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(f.n) && Number.isInteger(f.d)).toBe(true);
    if (f.whole !== undefined) {
      expect(f.whole).toBeGreaterThanOrEqual(0);
      // 대분수 표기는 진분수 부분이 분모보다 작아야 함
      expect(f.n).toBeLessThan(f.d);
      expect(f.n).toBeGreaterThan(0);
    }
  }
}

function checkFormat(p: Problem) {
  switch (p.format) {
    case 'choice': {
      expect(p.choices.length).toBe(4);
      expect(p.answerIndex).toBeGreaterThanOrEqual(0);
      expect(p.answerIndex).toBeLessThan(4);
      // 복수 정답 금지: 모든 보기의 값(텍스트 보기는 문자열)이 서로 달라야 함
      const keys = p.choices.map((c) => {
        const n = choiceNum(c);
        return Number.isNaN(n) ? `t:${c.kind === 'text' ? c.text : ''}` : `n:${n.toFixed(9)}`;
      });
      expect(new Set(keys).size).toBe(4);
      break;
    }
    case 'fraction-input': {
      const a = p.answer;
      expect(a.d).toBeGreaterThan(0);
      if (p.requireIrreducible) expect(gcd(a.n, a.d)).toBe(1);
      if (p.mixed) {
        expect(a.whole ?? 0).toBeGreaterThanOrEqual(1);
        expect(a.n).toBeLessThan(a.d);
      } else {
        expect(a.whole).toBeUndefined();
      }
      break;
    }
    case 'comparison': {
      // 정답 기호가 실제 값 비교와 일치해야 함
      const l = tokenNum(p.left.find((t) => !Number.isNaN(tokenNum(t)))!);
      const r = tokenNum(p.right.find((t) => !Number.isNaN(tokenNum(t)))!);
      const actual = Math.abs(l - r) < 1e-9 ? '=' : l < r ? '<' : '>';
      expect(p.answer).toBe(actual);
      break;
    }
    case 'fill-blanks': {
      const slots = (p.expr ?? []).flatMap((t) => {
        const s: number[] = [];
        if (t.kind === 'blank') s.push(t.slot);
        if (t.kind === 'fracBlank') {
          if (typeof t.n !== 'number') s.push(t.n.slot);
          if (typeof t.d !== 'number') s.push(t.d.slot);
        }
        return s;
      });
      expect(slots.length).toBe(p.blankAnswers.length);
      expect([...slots].sort((a, b) => a - b)).toEqual(p.blankAnswers.map((_, i) => i));
      for (const a of p.blankAnswers) {
        expect(Number.isInteger(a)).toBe(true);
        expect(a).toBeGreaterThan(0);
      }
      break;
    }
    case 'matching': {
      expect(p.pairs.length).toBe(4);
      // 쌍 안에서는 값이 같고, 쌍끼리는 값이 달라야 함 (유일한 매칭 보장)
      const vals = p.pairs.map((pair) => {
        const l = choiceNum(pair.left);
        const r = choiceNum(pair.right);
        expect(Math.abs(l - r)).toBeLessThan(1e-9);
        return l;
      });
      for (let i = 0; i < vals.length; i++)
        for (let j = i + 1; j < vals.length; j++)
          expect(Math.abs(vals[i] - vals[j])).toBeGreaterThan(1e-9);
      break;
    }
  }
}

/** expr이 [분수, ±, 분수] 형태면 계산해서 정답과 대조 */
function checkArithmetic(p: Problem) {
  if (!p.expr) return;
  const sig = p.expr.filter((t) => t.kind === 'frac' || t.kind === 'op');
  if (sig.length !== 3) return;
  const [a, op, b] = sig;
  if (a.kind !== 'frac' || op.kind !== 'op' || b.kind !== 'frac') return;
  if (op.op !== '+' && op.op !== '-') return;

  const av = tokenNum(a);
  const bv = tokenNum(b);
  const expected = op.op === '+' ? av + bv : av - bv;

  if (p.format === 'fraction-input') {
    const got = (p.answer.whole ?? 0) + p.answer.n / p.answer.d;
    expect(Math.abs(got - expected)).toBeLessThan(1e-9);
  } else if (p.format === 'choice') {
    expect(Math.abs(choiceNum(p.choices[p.answerIndex]) - expected)).toBeLessThan(1e-9);
  }
}

/** 스킬별 추가 불변식 */
function checkSkillSpecific(p: Problem) {
  switch (p.skillId) {
    case 'u1-simplify': {
      // 주어진 분수는 약분 가능해야 하고 정답은 그 기약분수여야 함
      const given = p.expr!.find((t) => t.kind === 'frac')!;
      if (given.kind !== 'frac') throw new Error('unreachable');
      const g: Frac = { n: given.n, d: given.d };
      expect(gcd(g.n, g.d)).toBeGreaterThan(1);
      if (p.format === 'fraction-input') {
        expect(equals(simplify(g), { n: p.answer.n, d: p.answer.d })).toBe(true);
        expect(isProper({ n: p.answer.n, d: p.answer.d })).toBe(true);
      }
      break;
    }
    case 'u1-eq-make': {
      // 빈칸을 채우면 주어진 분수와 크기가 같아야 함
      if (p.format !== 'fill-blanks') throw new Error('format');
      const given = p.expr!.find((t) => t.kind === 'frac')!;
      const blank = p.expr!.find((t) => t.kind === 'fracBlank')!;
      if (given.kind !== 'frac' || blank.kind !== 'fracBlank') throw new Error('unreachable');
      const n = typeof blank.n === 'number' ? blank.n : p.blankAnswers[blank.n.slot];
      const d = typeof blank.d === 'number' ? blank.d : p.blankAnswers[blank.d.slot];
      expect(equals({ n: given.n, d: given.d }, { n, d })).toBe(true);
      break;
    }
    case 'u1-common-denom': {
      // 채운 분수가 원래 분수와 크기가 같고 분모가 공통이어야 함
      if (p.format !== 'fill-blanks') throw new Error('format');
      const fracs = p.expr!.filter((t) => t.kind === 'frac');
      const blanks = p.expr!.filter((t) => t.kind === 'fracBlank');
      expect(fracs.length).toBe(2);
      expect(blanks.length).toBe(2);
      blanks.forEach((blank, i) => {
        if (blank.kind !== 'fracBlank' || typeof blank.d !== 'number' || typeof blank.n === 'number')
          throw new Error('shape');
        const orig = fracs[i];
        if (orig.kind !== 'frac') throw new Error('unreachable');
        expect(equals({ n: orig.n, d: orig.d }, { n: p.blankAnswers[blank.n.slot], d: blank.d })).toBe(
          true,
        );
      });
      const [b0, b1] = blanks;
      if (b0.kind === 'fracBlank' && b1.kind === 'fracBlank') expect(b0.d).toBe(b1.d);
      break;
    }
    case 'u2-add-proper-1':
      if (p.format === 'fraction-input') expect(p.mixed).toBe(false);
      break;
    case 'u2-add-proper-2':
      if (p.format === 'fraction-input') expect(p.mixed).toBe(true);
      break;
  }
}

describe.each(SKILLS.map((s) => [s.id, s] as const))('%s', (skillId, skill) => {
  it(`${SAMPLES}개 샘플이 모든 불변식을 만족한다`, () => {
    for (let i = 0; i < SAMPLES; i++) {
      const seed = i * 7919 + 13;
      const p = skill.generate(seed);
      checkCommon(p, skillId, seed);
      checkFormat(p);
      checkArithmetic(p);
      checkSkillSpecific(p);
    }
  });

  it('같은 시드는 같은 문제를 만든다 (재현성)', () => {
    for (const seed of [1, 42, 9999, 123456]) {
      expect(skill.generate(seed)).toEqual(skill.generate(seed));
    }
  });

  it('다양한 문제가 나온다 (1000개 중 고유 문제 60개 이상)', () => {
    const set = new Set<string>();
    for (let i = 0; i < SAMPLES; i++) {
      const p = skill.generate(i * 31 + 7);
      const { id, seed, ...rest } = p;
      set.add(JSON.stringify(rest));
    }
    expect(set.size).toBeGreaterThanOrEqual(60);
  });
});
