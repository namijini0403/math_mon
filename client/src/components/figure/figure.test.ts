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

  it('bar-graph: svg와 aria-label(항목·값)을 그린다', () => {
    const html = renderFigure({ kind: 'bar-graph', labels: ['사과', '바나나', '포도'], values: [7, 4, 6], unit: '명' });
    expect(html).toContain('<svg');
    expect(html).toContain('막대그래프');
    expect(html).toContain('사과');
    expect(html).toContain('<rect');
  });

  it('bar-graph: highlight 인덱스는 강조색(amber)으로 칠한다', () => {
    const html = renderFigure({ kind: 'bar-graph', labels: ['가', '나'], values: [5, 8], unit: '개', highlight: [1] });
    expect(html.toLowerCase()).toContain('#f59e0b');
  });

  it('line-graph: svg·polyline·점·라벨을 그린다', () => {
    const html = renderFigure({ kind: 'line-graph', labels: ['9시', '10시', '11시'], values: [5, 12, 8], unit: '도' });
    expect(html).toContain('<svg');
    expect(html).toContain('꺾은선그래프');
    expect(html).toContain('<polyline');
    expect(html).toContain('9시');
  });

  it('ratio-graph band: 띠그래프·범례·눈금을 그린다', () => {
    const html = renderFigure({ kind: 'ratio-graph', variant: 'band', labels: ['사과', '포도', '귤', '수박'], percents: [40, 25, 20, 15] });
    expect(html).toContain('<svg');
    expect(html).toContain('띠그래프');
    expect(html).toContain('사과 40%');
    expect(html).toContain('<rect');
  });

  it('ratio-graph pie: 원그래프·부채꼴(path)·범례를 그린다', () => {
    const html = renderFigure({ kind: 'ratio-graph', variant: 'pie', labels: ['봄', '여름', '가을', '겨울'], percents: [30, 35, 20, 15] });
    expect(html).toContain('원그래프');
    expect(html).toContain('<path');
    expect(html).toContain('겨울 15%');
  });

  it('solid-gon 각기둥: 겨냥도(숨은 모서리 점선)와 aria-label', () => {
    const html = renderFigure({ kind: 'solid-gon', shape: 'prism', n: 5 });
    expect(html).toContain('<svg');
    expect(html).toContain('오각기둥');
    expect(html).toContain('dasharray'); // 숨은 모서리 점선
  });

  it('solid-gon 각뿔: 겨냥도와 aria-label(n각뿔)', () => {
    const html = renderFigure({ kind: 'solid-gon', shape: 'pyramid', n: 6 });
    expect(html).toContain('육각뿔');
    expect(html).toContain('dasharray');
  });

  it('solid-gon: n=3~10 전부 렌더 오류 없이 그려진다', () => {
    for (let n = 3; n <= 10; n++) {
      for (const shape of ['prism', 'pyramid'] as const) {
        const html = renderFigure({ kind: 'solid-gon', shape, n });
        expect(html).toContain('<svg');
        expect(html).not.toContain('NaN');
      }
    }
  });

  it('cube-stack: 세 면(윗·앞오른쪽·앞왼쪽) 칸 격자와 aria-label', () => {
    const html = renderFigure({ kind: 'cube-stack', w: 3, d: 2, h: 4 });
    expect(html).toContain('<svg');
    expect(html).toContain('가로 3개, 세로 2개, 높이 4개');
    expect(html).toContain('<polygon');
    expect(html).not.toContain('NaN');
  });

  it('cylinder-net: 직사각형 옆면·원 2개·높이/반지름 라벨', () => {
    const html = renderFigure({ kind: 'cylinder-net', r: 5, h: 12 });
    expect(html).toContain('<svg');
    expect(html).toContain('<rect');
    expect(html).toContain('<circle');
    expect(html).toContain('밑면 둘레');
    expect(html).toContain('반지름 5 cm'); // aria-label
    expect(html).not.toContain('NaN');
  });

  it('cube-net-choice: 보기 4개(①②③④)와 정사각형 칸들', () => {
    const nets = [
      { cells: [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [1, 2]] as [number, number][] },
      { cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]] as [number, number][] },
      { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]] as [number, number][] },
      { cells: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]] as [number, number][] },
    ];
    const html = renderFigure({ kind: 'cube-net-choice', nets });
    expect(html).toContain('<svg');
    expect(html).toContain('①');
    expect(html).toContain('④');
    expect(html).toContain('<rect');
    expect(html).not.toContain('NaN');
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

  it('막대그래프 합계 스킬(bar-total·data3-table-sum·tbg2-total): figure.values 합 = 정답', () => {
    for (const id of ['bar-total', 'data3-table-sum', 'tbg2-total']) {
      const skill = SKILLS.find((s) => s.id === id);
      expect(skill, id).toBeDefined();
      for (let seed = 0; seed < 120; seed++) {
        const p = skill!.generate(seed);
        if (p.format !== 'fill-blanks') continue;
        const f = p.figure as Extract<FigureSpec, { kind: 'bar-graph' }>;
        expect(f.kind, id).toBe('bar-graph');
        expect(f.labels.length).toBe(f.values.length);
        expect(f.values.every((v) => Number.isInteger(v) && v > 0)).toBe(true);
        expect(f.values.reduce((a, b) => a + b, 0)).toBe(p.blankAnswers[0]);
      }
    }
  });

  it('꺾은선 합계(line-total): figure.values 합 = 정답, 막대 합계와 동일 구조', () => {
    const skill = SKILLS.find((s) => s.id === 'line-total');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 120; seed++) {
      const p = skill!.generate(seed);
      if (p.format !== 'fill-blanks') continue;
      const f = p.figure as Extract<FigureSpec, { kind: 'line-graph' }>;
      expect(f.kind).toBe('line-graph');
      expect(f.labels.length).toBe(f.values.length);
      expect(f.values.reduce((a, b) => a + b, 0)).toBe(p.blankAnswers[0]);
    }
  });

  it('line-max-change: figure 점들의 최대 변화 구간이 정답 구간과 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'line-max-change');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 120; seed++) {
      const p = skill!.generate(seed);
      if (p.format !== 'choice') continue;
      const f = p.figure as Extract<FigureSpec, { kind: 'line-graph' }>;
      let maxIdx = 0, maxCh = -1;
      for (let i = 0; i < f.values.length - 1; i++) {
        const c = Math.abs(f.values[i + 1] - f.values[i]);
        if (c > maxCh) { maxCh = c; maxIdx = i; }
      }
      const answerLabel = `${f.labels[maxIdx]} ~ ${f.labels[maxIdx + 1]}`;
      const chosen = p.choices[p.answerIndex];
      expect(chosen.kind === 'text' && chosen.text).toBe(answerLabel);
    }
  });

  it('line-word: 값을 가리는 패턴(?)에는 꺾은선 그림을 붙이지 않는다', () => {
    const skill = SKILLS.find((s) => s.id === 'line-word');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      // 값을 가린 자료는 "9시: ?도"처럼 ': ?' 패턴을 포함(문장 끝 '인가요?'와 구별)
      if (p.prompt.includes(': ?')) expect(p.figure).toBeUndefined();
    }
  });

  it('prism-count/pyramid-count: solid-gon 그림의 shape·n이 문제와 일치', () => {
    for (const [id, shape] of [['prism-count', 'prism'], ['pyramid-count', 'pyramid']] as const) {
      const skill = SKILLS.find((s) => s.id === id);
      expect(skill, id).toBeDefined();
      for (let seed = 0; seed < 200; seed++) {
        const p = skill!.generate(seed);
        const f = p.figure as Extract<FigureSpec, { kind: 'solid-gon' }>;
        expect(f.kind, id).toBe('solid-gon');
        expect(f.shape).toBe(shape);
        expect(f.n).toBeGreaterThanOrEqual(3);
        expect(f.n).toBeLessThanOrEqual(10);
        // 문제 prompt가 n각형 이름을 포함(예: 오각기둥/오각뿔)
        const name = { 3: '삼각', 4: '사각', 5: '오각', 6: '육각', 7: '칠각', 8: '팔각', 9: '구각', 10: '십각' }[f.n];
        expect(p.prompt).toContain(name!);
      }
    }
  });

  it('prism-inverse/pyramid-inverse: 답(n)을 노출하지 않도록 그림을 붙이지 않는다', () => {
    for (const id of ['prism-inverse', 'pyramid-inverse']) {
      const skill = SKILLS.find((s) => s.id === id);
      expect(skill, id).toBeDefined();
      for (let seed = 0; seed < 60; seed++) {
        expect(skill!.generate(seed).figure, id).toBeUndefined();
      }
    }
  });

  it('space-cube/space-hidden: cube-stack의 w·d·h 곱이 정답(쌓기나무 개수)과 일치', () => {
    for (const id of ['space-cube', 'space-hidden']) {
      const skill = SKILLS.find((s) => s.id === id);
      expect(skill, id).toBeDefined();
      for (let seed = 0; seed < 200; seed++) {
        const p = skill!.generate(seed);
        if (p.format !== 'fill-blanks') continue;
        const f = p.figure as Extract<FigureSpec, { kind: 'cube-stack' }>;
        expect(f.kind, id).toBe('cube-stack');
        expect(f.w * f.d * f.h).toBe(p.blankAnswers[0]);
        expect(Math.min(f.w, f.d, f.h)).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('띠/원그래프 스킬(graph-read·graph-most·graph-times): percents 합 100, variant가 그래프 이름과 일치', () => {
    for (const id of ['graph-read', 'graph-most', 'graph-times']) {
      const skill = SKILLS.find((s) => s.id === id);
      expect(skill, id).toBeDefined();
      for (let seed = 0; seed < 120; seed++) {
        const p = skill!.generate(seed);
        const f = p.figure as Extract<FigureSpec, { kind: 'ratio-graph' }>;
        expect(f.kind, id).toBe('ratio-graph');
        expect(f.labels.length).toBe(f.percents.length);
        expect(f.percents.reduce((a, b) => a + b, 0)).toBe(100);
        // 원그래프면 pie, 띠그래프면 band
        const wantPie = p.prompt.includes('원그래프');
        expect(f.variant).toBe(wantPie ? 'pie' : 'band');
      }
    }
  });

  it('ch62-cylinder-net: figure.r/h가 문제 prompt 수치와 일치', () => {
    const skill = SKILLS.find((s) => s.id === 'ch62-cylinder-net');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      expect(p.figure!.kind).toBe('cylinder-net');
      const f = p.figure as Extract<FigureSpec, { kind: 'cylinder-net' }>;
      expect(p.prompt).toContain(`반지름이 ${f.r} cm`);
      expect(p.prompt).toContain(`높이가 ${f.h} cm`);
    }
  });

  it('cub-net: 보기 4개, 정답(answerIndex)의 전개도만 실제로 접힌다', async () => {
    const { isValidCubeNet } = await import('../../generator/cubeNet');
    const skill = SKILLS.find((s) => s.id === 'cub-net');
    expect(skill).toBeDefined();
    for (let seed = 0; seed < 200; seed++) {
      const p = skill!.generate(seed);
      if (p.format !== 'choice') continue;
      const f = p.figure as Extract<FigureSpec, { kind: 'cube-net-choice' }>;
      expect(f.nets).toHaveLength(4);
      const valids = f.nets.map((n) => isValidCubeNet(n.cells));
      expect(valids.filter(Boolean)).toHaveLength(1);
      expect(valids[p.answerIndex]).toBe(true);
    }
  });
});
