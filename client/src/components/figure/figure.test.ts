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
});
