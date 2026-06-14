/**
 * FigureView — 문제 도해를 코드로 그리는 SVG 렌더러.
 * 이미지 파일 없이 시드로 결정된 파라미터(FigureSpec)만으로 그림을 그린다.
 * 앱 철학과 일치: 배지(BadgeEmblem)·메달(MedalView)도 전부 코드 렌더 SVG.
 * 미구현 kind는 빈 폴백 박스 → 앱 안 깨짐. 접근성: 모든 svg에 한국어 aria-label.
 */

import type { FigureSpec } from '../../generator/types';

// 앱 다크 인디고 톤
const FILL = '#312e81'; // indigo-900
const FILL2 = '#3730a3'; // indigo-800
const FILL3 = '#4338ca'; // indigo-700 (윗면 밝게)
const STROKE = '#a5b4fc'; // indigo-300
const EDGE = '#1e1b4b'; // 칸 경계
const HILITE = '#f59e0b'; // amber — 색칠된 면
const LABEL = '#c7d2fe';

export function FigureView({ spec }: { spec: FigureSpec }) {
  let svg;
  switch (spec.kind) {
    case 'staircase':
      svg = <Staircase squares={spec.squares} side={spec.side} />;
      break;
    case 'painted-cube':
      svg = <PaintedCube n={spec.n} />;
      break;
    default:
      // 미구현 kind 폴백 (타입상 도달 불가지만 방어적으로)
      svg = (
        <svg viewBox="0 0 100 40" width={120} role="img" aria-label="도해 준비 중">
          <rect x="2" y="2" width="96" height="36" rx="6" fill="none" stroke={STROKE}
            strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        </svg>
      );
  }
  return <div className="flex justify-center w-full">{svg}</div>;
}

// ── 계단 도형: 정사각형 n개를 대각으로 이어 붙인 도형 ──────────────────
function Staircase({ squares, side }: { squares: number; side: number }) {
  const n = Math.max(1, squares);
  const cell = n <= 5 ? 34 : 26;
  const pad = 16;
  const size = n * cell + pad * 2;

  const rects = [];
  for (let k = 0; k < n; k++) {
    const x = pad + k * cell;
    const y = pad + (n - 1 - k) * cell; // 왼쪽 아래 → 오른쪽 위로 오르는 계단
    rects.push(
      <rect
        key={k}
        x={x}
        y={y}
        width={cell}
        height={cell}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />,
    );
  }

  // 맨 아래(왼쪽) 칸 아래에 한 변 길이 표시
  const labelY = pad + n * cell + 12;

  return (
    <svg
      viewBox={`0 0 ${size} ${size + 18}`}
      width={Math.min(size, 230)}
      role="img"
      aria-label={`한 변 ${side} cm인 정사각형 ${n}개를 계단 모양으로 이어 붙인 도형`}
    >
      {rects}
      <text
        x={pad + cell / 2}
        y={labelY}
        textAnchor="middle"
        fontSize="13"
        fill={LABEL}
      >
        {side} cm
      </text>
    </svg>
  );
}

// ── 정육면체 칠하기: 등각 투상 + 면 중앙 (n-2)² 칸 강조 ────────────────
function PaintedCube({ n }: { n: number }) {
  const c = Math.max(9, Math.min(24, Math.floor(150 / n))); // 칸 크기(px)
  // 등각 축 벡터 (2D 투영)
  const ax = { x: c, y: c * 0.5 }; // 오른쪽-아래 (가로)
  const ay = { x: -c, y: c * 0.5 }; // 왼쪽-아래 (깊이)
  const az = { x: 0, y: -c }; // 위 (높이)
  const proj = (x: number, y: number, z: number) => ({
    X: x * ax.x + y * ay.x + z * az.x,
    Y: x * ax.y + y * ay.y + z * az.y,
  });

  // 8 꼭짓점으로 bbox 계산 → 패딩 오프셋
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const x of [0, n]) for (const y of [0, n]) for (const z of [0, n]) {
    const p = proj(x, y, z);
    minX = Math.min(minX, p.X); maxX = Math.max(maxX, p.X);
    minY = Math.min(minY, p.Y); maxY = Math.max(maxY, p.Y);
  }
  const pad = 10;
  const off = { x: pad - minX, y: pad - minY };
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;

  const pt = (x: number, y: number, z: number) => {
    const p = proj(x, y, z);
    return `${(p.X + off.x).toFixed(1)},${(p.Y + off.y).toFixed(1)}`;
  };

  const interior = (i: number, j: number) => i > 0 && i < n - 1 && j > 0 && j < n - 1;

  type Cell = { pts: string; fill: string };
  const cells: Cell[] = [];

  // 윗면 (z = n): x,y 평면
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    cells.push({
      pts: `${pt(i, j, n)} ${pt(i + 1, j, n)} ${pt(i + 1, j + 1, n)} ${pt(i, j + 1, n)}`,
      fill: interior(i, j) ? HILITE : FILL3,
    });
  }
  // 앞-오른쪽 면 (y = 0): x,z 평면
  for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) {
    cells.push({
      pts: `${pt(i, 0, k)} ${pt(i + 1, 0, k)} ${pt(i + 1, 0, k + 1)} ${pt(i, 0, k + 1)}`,
      fill: interior(i, k) ? HILITE : FILL2,
    });
  }
  // 앞-왼쪽 면 (x = 0): y,z 평면
  for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
    cells.push({
      pts: `${pt(0, j, k)} ${pt(0, j + 1, k)} ${pt(0, j + 1, k + 1)} ${pt(0, j, k + 1)}`,
      fill: interior(j, k) ? HILITE : FILL,
    });
  }

  return (
    <svg
      viewBox={`0 0 ${w.toFixed(1)} ${h.toFixed(1)}`}
      width={Math.min(w, 240)}
      role="img"
      aria-label={`한 모서리를 ${n}등분한 정육면체. 각 면 중앙의 ${n - 2}×${n - 2}칸이 한 면만 색칠된 작은 정육면체`}
    >
      {cells.map((cell, idx) => (
        <polygon key={idx} points={cell.pts} fill={cell.fill} stroke={EDGE} strokeWidth={1} strokeLinejoin="round" />
      ))}
    </svg>
  );
}
