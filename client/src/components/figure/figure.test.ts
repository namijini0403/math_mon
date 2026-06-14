/**
 * 도해(FigureView) 시스템 검증.
 * - 그림 연결된 스킬은 figure 스펙을 내며, 그 수치가 문제 수치와 일치한다(불일치 0).
 * - FigureView를 정적 마크업으로 렌더 → aria-label 있는 svg가 그려지는지 확인(DOM 불필요).
 */

import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FigureView } from './FigureView';
import { SKILLS } from '../../generator';
import type { FigureSpec } from '../../generator/types';

function renderFigure(spec: FigureSpec): string {
  return renderToStaticMarkup(createElement(FigureView, { spec }));
}

describe('FigureView 렌더 스모크', () => {
  it('staircase: svg와 aria-label(변 길이·개수)을 그린다', () => {
    const html = renderFigure({ kind: 'staircase', squares: 5, side: 4 });
    expect(html).toContain('<svg');
    expect(html).toContain('aria-label');
    expect(html).toContain('4 cm');
    expect(html).toContain('5개');
  });

  it('painted-cube: svg와 aria-label((n-2)×(n-2))을 그린다', () => {
    const html = renderFigure({ kind: 'painted-cube', n: 5, highlight: 'one-face' });
    expect(html).toContain('<svg');
    expect(html).toContain('3×3'); // n-2 = 3
    // 면 중앙 칸 강조색(amber)이 들어간다
    expect(html.toLowerCase()).toContain('#f59e0b');
  });

  it('congruent-parallelogram: ⓐ=a+b를 aria-label에 표기', () => {
    const html = renderFigure({ kind: 'congruent-parallelogram', a: 35, b: 65 });
    expect(html).toContain('<svg');
    expect(html).toContain('35°');
    expect(html).toContain('65°');
    expect(html).toContain('100°'); // a+b
  });

  it('paper-fold: ①과 ②를 aria-label에 표기', () => {
    const html = renderFigure({ kind: 'paper-fold', fold: 30 });
    expect(html).toContain('<svg');
    expect(html).toContain('30°'); // ①
    expect(html).toContain('60°'); // ② = 90-30
  });

  it('rhombus-symmetry: 대칭축(점선)과 두 각을 그린다', () => {
    const html = renderFigure({ kind: 'rhombus-symmetry', given: 70 });
    expect(html).toContain('<svg');
    expect(html).toContain('70°');
    expect(html).toContain('110°'); // 180-70
    expect(html).toContain('dasharray'); // 대칭축
  });

  it('overlap-rect-square: 두 도형과 교집합 음영', () => {
    const html = renderFigure({ kind: 'overlap-rect-square', w: 6, h: 5, s: 4, k: 4 });
    expect(html).toContain('<svg');
    expect(html).toContain('직사각형');
    expect(html).toContain('정사각형');
    expect(html.toLowerCase()).toContain('#f59e0b'); // 교집합 음영
  });

  it('cuboid: 치수 라벨과 겨냥도(숨은 모서리 점선)', () => {
    const html = renderFigure({ kind: 'cuboid', w: 8, h: 3, d: 5, dims: { w: '8', h: '3', d: '5' } });
    expect(html).toContain('<svg');
    expect(html).toContain('dasharray'); // 숨은 모서리 3개 점선
    expect(html).toContain('가로 8'); // aria-label에 치수
  });

  it('congruent-triangle-pair: 두 삼각형과 ㄱ·ㄹ 라벨', () => {
    const html = renderFigure({ kind: 'congruent-triangle-pair' });
    expect(html).toContain('<svg');
    expect(html).toContain('ㄱ');
    expect(html).toContain('ㄹ');
  });

  it('number-line 이상: 닫힌 점(●)과 수직선', () => {
    const html = renderFigure({ kind: 'number-line', min: 7, max: 13, lo: { v: 10, closed: true } });
    expect(html).toContain('<svg');
    expect(html).toContain('수직선');
    expect(html).toContain('이상');
  });

  it('number-line 미만: 열린 점(○, 배경색 채움)', () => {
    const html = renderFigure({ kind: 'number-line', min: 7, max: 13, hi: { v: 10, closed: false } });
    expect(html).toContain('미만');
    expect(html.toLowerCase()).toContain('#1e1b4b'); // 열린 점 = 배경색 fill
  });
});

describe('그림 연결 스킬의 figure 스펙 일관성', () => {
  it('ch51-stairs: figure.squares/side가 문제 수치(둘레=4·n·a)와 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'ch51-stairs');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      expect(p.format).toBe('fill-blanks');
      expect(p.figure).toBeDefined();
      expect(p.figure!.kind).toBe('staircase');
      const f = p.figure as Extract<FigureSpec, { kind: 'staircase' }>;
      if (p.format !== 'fill-blanks') continue;
      expect(p.blankAnswers[0]).toBe(4 * f.squares * f.side);
      expect(f.squares).toBeGreaterThanOrEqual(3);
      expect(f.side).toBeGreaterThanOrEqual(2);
    }
  });

  it('ch52-paintcut: figure.n이 문제 수치(한 면만=6·(n-2)²)와 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'ch52-paintcut');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      expect(p.format).toBe('fill-blanks');
      expect(p.figure).toBeDefined();
      expect(p.figure!.kind).toBe('painted-cube');
      const f = p.figure as Extract<FigureSpec, { kind: 'painted-cube' }>;
      if (p.format !== 'fill-blanks') continue;
      expect(f.n).toBeGreaterThanOrEqual(3);
      expect(p.blankAnswers[0]).toBe(6 * (f.n - 2) * (f.n - 2));
    }
  });

  it('ch52-congtriangle: figure.a+b가 ⓐ(정답)와 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'ch52-congtriangle');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      if (p.format !== 'fill-blanks') continue;
      expect(p.figure!.kind).toBe('congruent-parallelogram');
      const f = p.figure as Extract<FigureSpec, { kind: 'congruent-parallelogram' }>;
      expect(f.a + f.b).toBe(p.blankAnswers[0]);
      expect(f.a).toBeGreaterThan(0);
      expect(f.b).toBeGreaterThan(0);
    }
  });

  it('ch52-paperfold: figure.fold가 문제 수치(차=90−2·fold)와 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'ch52-paperfold');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      if (p.format !== 'fill-blanks') continue;
      expect(p.figure!.kind).toBe('paper-fold');
      const f = p.figure as Extract<FigureSpec, { kind: 'paper-fold' }>;
      expect(f.fold).toBeGreaterThan(0);
      expect(f.fold).toBeLessThan(45);
      expect(p.blankAnswers[0]).toBe(90 - 2 * f.fold);
    }
  });

  it('ch52-symaxis: figure.given이 문제 수치(ⓐ=180−given)와 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'ch52-symaxis');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      if (p.format !== 'fill-blanks') continue;
      expect(p.figure!.kind).toBe('rhombus-symmetry');
      const f = p.figure as Extract<FigureSpec, { kind: 'rhombus-symmetry' }>;
      expect(p.blankAnswers[0]).toBe(180 - f.given);
    }
  });

  it('ch51-overlap: figure(w,h,s,k)가 전체 넓이(정답)와 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'ch51-overlap');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      if (p.format !== 'fill-blanks') continue;
      expect(p.figure!.kind).toBe('overlap-rect-square');
      const f = p.figure as Extract<FigureSpec, { kind: 'overlap-rect-square' }>;
      expect(p.blankAnswers[0]).toBe(f.w * f.h + f.s * f.s - (f.s * f.s) / f.k);
    }
  });

  it('cub-edge-sum: cuboid 치수 합×4가 모서리 합(정답)과 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'cub-edge-sum');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      if (p.format !== 'fill-blanks') continue;
      expect(p.figure!.kind).toBe('cuboid');
      const f = p.figure as Extract<FigureSpec, { kind: 'cuboid' }>;
      expect(p.blankAnswers[0]).toBe(4 * (f.w + f.h + f.d));
    }
  });

  it('cub-edge-missing: cuboid 높이(figure.h)가 정답과 일치, 높이 라벨은 ?', () => {
    const skill = SKILLS.find((s) => s.id === 'cub-edge-missing');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      if (p.format !== 'fill-blanks') continue;
      const f = p.figure as Extract<FigureSpec, { kind: 'cuboid' }>;
      expect(f.h).toBe(p.blankAnswers[0]);
      expect(f.dims?.h).toBe('?');
    }
  });

  it('sym-corr-side/angle: 합동 삼각형 그림이 부착됨', () => {
    for (const id of ['sym-corr-side', 'sym-corr-angle']) {
      const skill = SKILLS.find((s) => s.id === id);
      expect(skill).toBeDefined();
      const p = skill!.generate(7);
      expect(p.figure!.kind).toBe('congruent-triangle-pair');
    }
  });

  it('range-include: 수직선 경계(닫힘/열림)가 이상·이하·초과·미만과 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'range-include');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 120; seed++) {
      const p = skill!.generate(seed);
      const f = p.figure as Extract<FigureSpec, { kind: 'number-line' }>;
      expect(f.kind).toBe('number-line');
      // 정확히 한쪽 경계만
      expect(!!f.lo !== !!f.hi).toBe(true);
      if (p.prompt.includes('이상')) expect(f.lo).toEqual({ v: expect.any(Number), closed: true });
      else if (p.prompt.includes('초과')) expect(f.lo).toEqual({ v: expect.any(Number), closed: false });
      else if (p.prompt.includes('이하')) expect(f.hi).toEqual({ v: expect.any(Number), closed: true });
      else if (p.prompt.includes('미만')) expect(f.hi).toEqual({ v: expect.any(Number), closed: false });
    }
  });

  it('range-boundary: 양쪽 경계, closed가 이상/이하와 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'range-boundary');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 120; seed++) {
      const p = skill!.generate(seed);
      const f = p.figure as Extract<FigureSpec, { kind: 'number-line' }>;
      expect(f.lo).toBeDefined();
      expect(f.hi).toBeDefined();
      expect(f.lo!.closed).toBe(p.prompt.includes(`${f.lo!.v} 이상`));
      expect(f.hi!.closed).toBe(p.prompt.includes(`${f.hi!.v} 이하`));
    }
  });
});
