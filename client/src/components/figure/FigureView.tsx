/**
 * FigureView — 문제 도해를 코드로 그리는 SVG 렌더러.
 * 이미지 파일 없이 시드로 결정된 파라미터(FigureSpec)만으로 그림을 그린다.
 * 앱 철학과 일치: 배지(BadgeEmblem)·메달(MedalView)도 전부 코드 렌더 SVG.
 * 미구현 kind는 빈 폴백 박스 → 앱 안 깨짐. 접근성: 모든 svg에 한국어 aria-label.
 */

import type { ReactNode } from 'react';
import type { FigureSpec } from '../../generator/types';

// 앱 다크 인디고 톤
const FILL = '#312e81'; // indigo-900
const FILL2 = '#3730a3'; // indigo-800
const FILL3 = '#4338ca'; // indigo-700 (윗면 밝게)
const STROKE = '#a5b4fc'; // indigo-300
const EDGE = '#1e1b4b'; // 칸 경계
const HILITE = '#f59e0b'; // amber — 색칠된 면
const LABEL = '#c7d2fe';
const ANG = '#fbbf24'; // amber-300 — 각도 호·라벨
const TARGET = '#fcd34d'; // amber-200 — 구하는 각 ⓐ
const AXIS = '#f472b6'; // pink-400 — 대칭축 점선

// 각도 기하 헬퍼 (수학각: +x 기준 반시계, 단 SVG는 y가 아래로 → sin 부호 반전)
const rad = (deg: number) => (deg * Math.PI) / 180;
function pAt(cx: number, cy: number, r: number, deg: number) {
  return { x: cx + r * Math.cos(rad(deg)), y: cy - r * Math.sin(rad(deg)) };
}
/** (cx,cy) 중심, 반지름 r, 수학각 d0→d1 호 path. SVG(y하향)에서 각 증가=시계방향=sweep 1 */
function arcPath(cx: number, cy: number, r: number, d0: number, d1: number) {
  const s = pAt(cx, cy, r, d0);
  const e = pAt(cx, cy, r, d1);
  const large = Math.abs(d1 - d0) > 180 ? 1 : 0;
  const sweep = d1 > d0 ? 1 : 0;
  return `M${s.x.toFixed(1)},${s.y.toFixed(1)} A${r},${r} 0 ${large} ${sweep} ${e.x.toFixed(1)},${e.y.toFixed(1)}`;
}

export function FigureView({ spec }: { spec: FigureSpec }) {
  let svg;
  switch (spec.kind) {
    case 'staircase':
      svg = <Staircase squares={spec.squares} side={spec.side} />;
      break;
    case 'painted-cube':
      svg = <PaintedCube n={spec.n} />;
      break;
    case 'congruent-parallelogram':
      svg = <CongruentParallelogram a={spec.a} b={spec.b} />;
      break;
    case 'paper-fold':
      svg = <PaperFold fold={spec.fold} />;
      break;
    case 'rhombus-symmetry':
      svg = <RhombusSymmetry given={spec.given} />;
      break;
    case 'overlap-rect-square':
      svg = <OverlapRectSquare w={spec.w} h={spec.h} s={spec.s} k={spec.k} />;
      break;
    case 'cuboid':
      svg = <Cuboid w={spec.w} h={spec.h} d={spec.d} dims={spec.dims} />;
      break;
    case 'congruent-triangle-pair':
      svg = <CongruentTrianglePair />;
      break;
    case 'number-line':
      svg = <NumberLine min={spec.min} max={spec.max} lo={spec.lo} hi={spec.hi} />;
      break;
    case 'bar-graph':
      svg = <BarGraph labels={spec.labels} values={spec.values} unit={spec.unit} highlight={spec.highlight} />;
      break;
    case 'line-graph':
      svg = <LineGraph labels={spec.labels} values={spec.values} unit={spec.unit} />;
      break;
    case 'ratio-graph':
      svg = <RatioGraph variant={spec.variant} labels={spec.labels} percents={spec.percents} />;
      break;
    case 'solid-gon':
      svg = <SolidGon shape={spec.shape} n={spec.n} />;
      break;
    case 'cube-stack':
      svg = <CubeStack w={spec.w} d={spec.d} h={spec.h} />;
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

// ── 합동 삼각형 → 평행사변형: 한 꼭짓점 ⓐ = a + b (위 소각 a, 아래 소각 b) ──
function CongruentParallelogram({ a, b }: { a: number; b: number }) {
  const base = 150;
  const ta = Math.tan(rad(a));
  const tb = Math.tan(rad(b));
  const Rx = (base * tb) / (ta + tb); // 위 꼭짓점 R의 x
  const Rh = Rx * ta; // 높이
  const pad = 30;
  // 꼭짓점: P(왼쪽 공유), Q(오른쪽 공유), R(위), Rp(아래)
  const P = { x: pad, y: pad + Rh };
  const Q = { x: pad + base, y: pad + Rh };
  const R = { x: pad + Rx, y: pad }; // 위 (y 작음)
  const Rp = { x: pad + base - Rx, y: pad + 2 * Rh }; // 아래
  const w = base + pad * 2;
  const h = 2 * Rh + pad * 2;

  // P 코너의 소각: 위(대각선 PQ ~ +x 방향, 0°)→PR(+a°), 아래 PQ→PRp(−b°)
  const aArc = arcPath(P.x, P.y, 20, 0, a);
  const bArc = arcPath(P.x, P.y, 20, 0, -b);
  const aLab = pAt(P.x, P.y, 34, a / 2);
  const bLab = pAt(P.x, P.y, 34, -b / 2);
  const tLab = pAt(P.x, P.y, 60, (a - b) / 2); // ⓐ는 코너 전체 바깥쪽

  return (
    <svg
      viewBox={`0 0 ${w.toFixed(1)} ${h.toFixed(1)}`}
      width={Math.min(w, 250)}
      role="img"
      aria-label={`합동인 두 삼각형을 이어 붙인 평행사변형. 한 삼각형의 두 각 ${a}°와 ${b}°가 한 꼭짓점에서 만나 ⓐ = ${a + b}°를 이룬다`}
    >
      <polygon
        points={`${P.x},${P.y} ${R.x},${R.y} ${Q.x},${Q.y} ${Rp.x},${Rp.y}`}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* 두 삼각형 경계(공유 대각선 PQ) */}
      <line x1={P.x} y1={P.y} x2={Q.x} y2={Q.y} stroke={STROKE} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.8} />
      <path d={aArc} fill="none" stroke={ANG} strokeWidth={1.5} />
      <path d={bArc} fill="none" stroke={ANG} strokeWidth={1.5} />
      <text x={aLab.x} y={aLab.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={ANG}>{a}°</text>
      <text x={bLab.x} y={bLab.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={ANG}>{b}°</text>
      <text x={tLab.x} y={tLab.y} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="bold" fill={TARGET}>ⓐ</text>
    </svg>
  );
}

// ── 정사각형 종이접기: 90° 코너를 크레아스가 ①(fold)·②(90−fold)로 나눔 ──
function PaperFold({ fold }: { fold: number }) {
  const S = 120;
  const pad = 26;
  const C = { x: pad, y: pad + S }; // 접는 꼭짓점(왼쪽 아래)
  // 정사각형: C(좌하), (좌상), (우상), (우하)
  const sq = `${pad},${pad} ${pad + S},${pad} ${pad + S},${pad + S} ${pad},${pad + S}`;
  // 크레아스: C에서 수학각 fold 방향 → 오른쪽 변(x=pad+S)에서 나감
  const M = { x: pad + S, y: C.y - S * Math.tan(rad(fold)) };
  // 접히는 플랩: 바닥변 위 점 P1 = C + (d,0), 크레아스 대칭 → P1' (수학각 2·fold)
  const d = S * 0.6;
  const P1 = { x: C.x + d, y: C.y };
  const P1p = pAt(C.x, C.y, d, 2 * fold);
  const w = S + pad * 2;
  const h = S + pad * 2;

  const a1 = arcPath(C.x, C.y, 22, 0, fold); // ① 바닥↔크레아스
  const a2 = arcPath(C.x, C.y, 30, fold, 90); // ② 크레아스↔왼쪽변
  const l1 = pAt(C.x, C.y, 40, fold / 2);
  const l2 = pAt(C.x, C.y, 46, (fold + 90) / 2);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={Math.min(w, 200)}
      role="img"
      aria-label={`정사각형 종이의 90° 꼭짓점을 접어 ①=${fold}°와 ②=${90 - fold}°로 나눈 그림`}
    >
      <polygon points={sq} fill={FILL} stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      {/* 접힌 플랩 */}
      <polygon points={`${C.x},${C.y} ${P1.x},${P1.y} ${P1p.x.toFixed(1)},${P1p.y.toFixed(1)}`} fill={HILITE} opacity={0.55} stroke={HILITE} strokeWidth={1} />
      {/* 크레아스 */}
      <line x1={C.x} y1={C.y} x2={M.x} y2={M.y} stroke={TARGET} strokeWidth={2} />
      <path d={a1} fill="none" stroke={ANG} strokeWidth={1.5} />
      <path d={a2} fill="none" stroke={ANG} strokeWidth={1.5} />
      <text x={l1.x} y={l1.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={ANG}>①</text>
      <text x={l2.x} y={l2.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={ANG}>②</text>
    </svg>
  );
}

// ── 선대칭 마름모: 한 각 given, 이웃각 ⓐ=180−given, 세로 대칭축 ──
function RhombusSymmetry({ given }: { given: number }) {
  const p = 70; // 세로 반대각선
  const q = p * Math.tan(rad(given / 2)); // 가로 반대각선
  const pad = 30;
  const cx = pad + q;
  const cy = pad + p;
  const T = { x: cx, y: pad }; // 위
  const Bo = { x: cx, y: pad + 2 * p }; // 아래
  const L = { x: pad, y: cy }; // 왼
  const Rr = { x: pad + 2 * q, y: cy }; // 오른
  const w = 2 * q + pad * 2;
  const h = 2 * p + pad * 2;

  // T 각(given): 두 변 T→L, T→R 사이. ⓐ는 오른쪽 꼭짓점 R(=180−given)
  const tLab = { x: cx, y: pad + 20 };
  const aLab = { x: Rr.x + 11, y: cy }; // 꼭짓점 바깥에 두어 그 각을 가리킴

  return (
    <svg
      viewBox={`0 0 ${w.toFixed(1)} ${h.toFixed(1)}`}
      width={Math.min(w, 210)}
      role="img"
      aria-label={`선대칭 마름모. 한 각 ${given}°, 이웃한 각 ⓐ = ${180 - given}°. 세로 대칭축`}
    >
      {/* 세로 대칭축 */}
      <line x1={cx} y1={pad - 12} x2={cx} y2={pad + 2 * p + 12} stroke={AXIS} strokeWidth={1.5} strokeDasharray="6 4" />
      <polygon
        points={`${T.x},${T.y} ${Rr.x},${Rr.y} ${Bo.x},${Bo.y} ${L.x},${L.y}`}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <text x={tLab.x} y={tLab.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={ANG}>{given}°</text>
      <text x={aLab.x} y={aLab.y} textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="bold" fill={TARGET}>ⓐ</text>
    </svg>
  );
}

// ── 직사각형 + 정사각형 겹침: 교집합 음영(개념 도해) ──
function OverlapRectSquare({ w, h, s, k }: { w: number; h: number; s: number; k: number }) {
  const maxPx = 150;
  const scale = Math.min(maxPx / (w + s * 0.6), maxPx / Math.max(h, s));
  const pad = 16;
  const RW = w * scale;
  const RH = h * scale;
  const SQ = s * scale;
  // 정사각형을 직사각형 오른쪽-위 모서리에 겹치게: 왼쪽 변이 직사각형 안으로 (s/k 폭 만큼)
  const inset = (s / k) * scale; // 겹치는 가로 폭
  const rectX = pad;
  const rectY = pad + Math.max(0, SQ - RH); // 바닥 정렬 비슷하게
  const sqX = rectX + RW - inset;
  const sqY = pad;
  // 교집합(직사각형 ∩ 정사각형)
  const ix0 = Math.max(rectX, sqX);
  const iy0 = Math.max(rectY, sqY);
  const ix1 = Math.min(rectX + RW, sqX + SQ);
  const iy1 = Math.min(rectY + RH, sqY + SQ);
  const totalW = (sqX + SQ) - rectX + pad * 2;
  const totalH = Math.max(rectY + RH, sqY + SQ) - pad + pad * 2;

  return (
    <svg
      viewBox={`0 0 ${totalW.toFixed(1)} ${totalH.toFixed(1)}`}
      width={Math.min(totalW, 240)}
      role="img"
      aria-label={`가로 ${w}cm 세로 ${h}cm 직사각형과 한 변 ${s}cm 정사각형이 일부 겹친 그림. 겹친 부분은 정사각형의 1/${k}`}
    >
      <rect x={rectX} y={rectY} width={RW} height={RH} fill={FILL} stroke={STROKE} strokeWidth={2.5} />
      <rect x={sqX} y={sqY} width={SQ} height={SQ} fill={FILL2} fillOpacity={0.85} stroke={STROKE} strokeWidth={2.5} />
      {ix1 > ix0 && iy1 > iy0 && (
        <rect x={ix0} y={iy0} width={ix1 - ix0} height={iy1 - iy0} fill={HILITE} opacity={0.6} />
      )}
      <text x={rectX + RW / 2} y={rectY + RH - 5} textAnchor="middle" fontSize="10" fill={LABEL}>직사각형</text>
      <text x={sqX + SQ / 2} y={sqY + 12} textAnchor="middle" fontSize="10" fill={LABEL}>정사각형</text>
    </svg>
  );
}

// ── 직육면체 겨냥도: 보이는 모서리 실선·숨은 모서리 3개 점선 ──
function Cuboid({ w, h, d, dims }: { w: number; h: number; d: number; dims?: { w: string; h: string; d: string } }) {
  const maxDim = Math.max(w, h, d);
  const per = 80 / maxDim;
  const W = Math.max(30, w * per); // 앞면 가로
  const H = Math.max(24, h * per); // 앞면 높이
  const D = Math.max(24, d * per) * 0.5; // 깊이(캐비닛 투상: 0.5배, 45°)
  const dx = D * 0.82;
  const dyv = -D * 0.82; // 위로
  const padL = 22, padT = 22 - dyv, padR = 30, padB = 26;
  const ox = padL, oy = padT;
  // 앞면: D좌상 C우상 A좌하 B우하
  const Dp = { x: ox, y: oy }; // top-left front
  const C = { x: ox + W, y: oy };
  const A = { x: ox, y: oy + H }; // bottom-left front
  const B = { x: ox + W, y: oy + H };
  // 뒷면 (+깊이)
  const Db = { x: Dp.x + dx, y: Dp.y + dyv };
  const Cb = { x: C.x + dx, y: C.y + dyv };
  const Ab = { x: A.x + dx, y: A.y + dyv }; // 숨은 꼭짓점
  const Bb = { x: B.x + dx, y: B.y + dyv };
  const totW = ox + W + dx + padR;
  const totH = oy + H + padB;

  const E = (p1: { x: number; y: number }, p2: { x: number; y: number }, hidden = false) => (
    <line
      x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
      stroke={STROKE} strokeWidth={2} strokeLinecap="round"
      strokeDasharray={hidden ? '4 4' : undefined as unknown as string}
      opacity={hidden ? 0.6 : 1}
    />
  );

  return (
    <svg
      viewBox={`0 0 ${totW.toFixed(1)} ${totH.toFixed(1)}`}
      width={Math.min(totW, 230)}
      role="img"
      aria-label={dims
        ? `직육면체 겨냥도. 가로 ${dims.w}, 세로 ${dims.d}, 높이 ${dims.h}`
        : '직육면체 겨냥도. 보이는 모서리는 실선, 숨은 모서리 3개는 점선'}
    >
      {/* 뒷면 채움(옅게) */}
      <polygon points={`${Db.x},${Db.y} ${Cb.x},${Cb.y} ${Bb.x},${Bb.y} ${Ab.x},${Ab.y}`} fill={FILL} opacity={0.35} />
      {/* 앞면 채움 */}
      <polygon points={`${Dp.x},${Dp.y} ${C.x},${C.y} ${B.x},${B.y} ${A.x},${A.y}`} fill={FILL} opacity={0.7} />
      {/* 숨은 모서리(점선): 숨은 꼭짓점 Ab의 세 모서리 */}
      {E(A, Ab, true)}
      {E(Ab, Bb, true)}
      {E(Ab, Db, true)}
      {/* 보이는 모서리(실선) 9개 */}
      {E(Dp, C)}{E(C, B)}{E(B, A)}{E(A, Dp)}
      {E(Db, Cb)}{E(Cb, Bb)}
      {E(Dp, Db)}{E(C, Cb)}{E(B, Bb)}
      {dims && (
        <>
          <text x={(A.x + B.x) / 2} y={A.y + 14} textAnchor="middle" fontSize="11" fill={LABEL}>{dims.w}</text>
          <text x={A.x - 6} y={(A.y + Dp.y) / 2} textAnchor="end" dominantBaseline="middle" fontSize="11" fill={LABEL}>{dims.h}</text>
          <text x={(B.x + Bb.x) / 2 + 6} y={(B.y + Bb.y) / 2 - 2} textAnchor="start" dominantBaseline="middle" fontSize="11" fill={LABEL}>{dims.d}</text>
        </>
      )}
    </svg>
  );
}

// ── 두 합동 삼각형 ㄱㄴㄷ·ㄹㅁㅂ (대응 꼭짓점 같은 배치) ──
function CongruentTrianglePair() {
  const TW = 76, TH = 64, gap = 40, pad = 20;
  // 삼각형 한 개의 꼭짓점(좌하·우하·apex). apex는 왼쪽으로 치우친 부등변
  const tri = (ox: number) => ({
    bl: { x: ox, y: pad + TH }, // 좌하
    br: { x: ox + TW, y: pad + TH }, // 우하
    ap: { x: ox + TW * 0.3, y: pad }, // apex
  });
  const t1 = tri(pad);
  const t2 = tri(pad + TW + gap);
  const totW = pad + TW + gap + TW + pad;
  const totH = pad + TH + 22;
  const poly = (t: ReturnType<typeof tri>) => `${t.ap.x},${t.ap.y} ${t.bl.x},${t.bl.y} ${t.br.x},${t.br.y}`;

  return (
    <svg
      viewBox={`0 0 ${totW} ${totH}`}
      width={Math.min(totW, 250)}
      role="img"
      aria-label="서로 합동인 두 삼각형 ㄱㄴㄷ과 ㄹㅁㅂ. ㄱ-ㄹ, ㄴ-ㅁ, ㄷ-ㅂ이 대응"
    >
      <polygon points={poly(t1)} fill={FILL} stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      <polygon points={poly(t2)} fill={FILL} stroke={STROKE} strokeWidth={2.5} strokeLinejoin="round" />
      {/* 합동 기호 */}
      <text x={pad + TW + gap / 2} y={pad + TH * 0.62} textAnchor="middle" dominantBaseline="middle" fontSize="16" fill={TARGET}>≅</text>
      {/* 꼭짓점 라벨 (ㄱㄴㄷ / ㄹㅁㅂ) */}
      <text x={t1.ap.x} y={t1.ap.y - 6} textAnchor="middle" fontSize="13" fill={LABEL}>ㄱ</text>
      <text x={t1.bl.x - 4} y={t1.bl.y + 13} textAnchor="middle" fontSize="13" fill={LABEL}>ㄴ</text>
      <text x={t1.br.x + 4} y={t1.br.y + 13} textAnchor="middle" fontSize="13" fill={LABEL}>ㄷ</text>
      <text x={t2.ap.x} y={t2.ap.y - 6} textAnchor="middle" fontSize="13" fill={LABEL}>ㄹ</text>
      <text x={t2.bl.x - 4} y={t2.bl.y + 13} textAnchor="middle" fontSize="13" fill={LABEL}>ㅁ</text>
      <text x={t2.br.x + 4} y={t2.br.y + 13} textAnchor="middle" fontSize="13" fill={LABEL}>ㅂ</text>
    </svg>
  );
}

// ── 수직선 위 범위: 이상/이하=● 초과/미만=○, 한쪽만이면 화살표 반직선 ──
function NumberLine({
  min, max, lo, hi,
}: {
  min: number; max: number;
  lo?: { v: number; closed: boolean };
  hi?: { v: number; closed: boolean };
}) {
  const range = Math.max(1, max - min);
  const step = Math.max(13, Math.min(30, Math.floor(230 / range)));
  const padL = 20, padR = 20, padT = 16;
  const W = range * step;
  const axisY = padT + 4;
  const total = padL + W + padR;
  const height = axisY + 30;
  const X = (v: number) => padL + (v - min) * step;
  const labelEvery = range <= 10 ? 1 : 2;

  // 범위 띠 양 끝
  const bandStart = lo ? X(lo.v) : padL + 2;
  const bandEnd = hi ? X(hi.v) : padL + W - 2;

  const ticks = [];
  for (let v = min; v <= max; v++) {
    const x = X(v);
    ticks.push(<line key={`t${v}`} x1={x} y1={axisY - 4} x2={x} y2={axisY + 4} stroke={STROKE} strokeWidth={1.2} />);
    if ((v - min) % labelEvery === 0 || v === lo?.v || v === hi?.v) {
      ticks.push(
        <text key={`l${v}`} x={x} y={axisY + 18} textAnchor="middle" fontSize="10" fill={LABEL}>{v}</text>,
      );
    }
  }

  const circle = (b: { v: number; closed: boolean }, key: string) => (
    <circle
      key={key}
      cx={X(b.v)}
      cy={axisY}
      r={4.5}
      fill={b.closed ? ANG : '#1e1b4b'}
      stroke={ANG}
      strokeWidth={2}
    />
  );

  return (
    <svg
      viewBox={`0 0 ${total} ${height}`}
      width={Math.min(total, 260)}
      role="img"
      aria-label={`수직선 ${min}부터 ${max}까지. ${lo ? `${lo.v} ${lo.closed ? '이상' : '초과'}` : ''}${lo && hi ? ', ' : ''}${hi ? `${hi.v} ${hi.closed ? '이하' : '미만'}` : ''} 범위`}
    >
      {/* 축 + 화살표 */}
      <line x1={padL - 6} y1={axisY} x2={padL + W + 6} y2={axisY} stroke={STROKE} strokeWidth={1.5} />
      <polygon points={`${padL - 6},${axisY} ${padL - 1},${axisY - 3.5} ${padL - 1},${axisY + 3.5}`} fill={STROKE} />
      <polygon points={`${padL + W + 6},${axisY} ${padL + W + 1},${axisY - 3.5} ${padL + W + 1},${axisY + 3.5}`} fill={STROKE} />
      {/* 범위 띠 */}
      <line x1={bandStart} y1={axisY} x2={bandEnd} y2={axisY} stroke={TARGET} strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      {ticks}
      {lo && circle(lo, 'lo')}
      {hi && circle(hi, 'hi')}
    </svg>
  );
}

/** 항목별 눈금 최대값·간격을 정수로 잡는다(가로 격자선 4칸) */
function axisTop(maxV: number) {
  const step = Math.max(1, Math.ceil(maxV / 4));
  return { step, top: step * 4 };
}

// ── 막대그래프: 항목별 세로 막대 + 값 라벨 + 가로 격자선 ──
function BarGraph({ labels, values, unit, highlight }: {
  labels: string[]; values: number[]; unit: string; highlight?: number[];
}) {
  const n = values.length;
  const maxV = Math.max(...values, 1);
  const { step, top } = axisTop(maxV);
  const barW = n <= 4 ? 30 : 24;
  const gap = n <= 4 ? 22 : 14;
  const padL = 28, padR = 14, padT = 16, padB = 30;
  const chartH = 116;
  const plotW = n * barW + (n - 1) * gap;
  const W = padL + plotW + padR;
  const H = padT + chartH + padB;
  const baseY = padT + chartH;
  const yOf = (v: number) => baseY - (v / top) * chartH;
  const isHi = (i: number) => highlight?.includes(i) ?? false;

  // 가로 격자선 (0, step, 2step, 3step, 4step)
  const grid = [];
  for (let g = 0; g <= 4; g++) {
    const v = g * step;
    const y = yOf(v);
    grid.push(<line key={`g${g}`} x1={padL} y1={y} x2={padL + plotW} y2={y} stroke={STROKE} strokeWidth={g === 0 ? 1.5 : 0.7} opacity={g === 0 ? 1 : 0.3} />);
    grid.push(<text key={`gl${g}`} x={padL - 5} y={y + 3} textAnchor="end" fontSize="9" fill={LABEL}>{v}</text>);
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={Math.min(W, 280)}
      role="img"
      aria-label={`막대그래프. ${labels.map((l, i) => `${l} ${values[i]}${unit}`).join(', ')}`}
    >
      {grid}
      {values.map((v, i) => {
        const x = padL + i * (barW + gap);
        const y = yOf(v);
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={baseY - y} fill={isHi(i) ? HILITE : FILL2} stroke={STROKE} strokeWidth={1.5} />
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9.5" fill={LABEL}>{v}</text>
            <text x={x + barW / 2} y={baseY + 13} textAnchor="middle" fontSize="9" fill={LABEL}>{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 꺾은선그래프: 시점별 점을 선으로 이음 + 값 라벨 + 가로 격자선 ──
function LineGraph({ labels, values, unit }: { labels: string[]; values: number[]; unit: string }) {
  const n = values.length;
  const maxV = Math.max(...values, 1);
  const { step, top } = axisTop(maxV);
  const colW = n <= 5 ? 44 : 36;
  const padL = 28, padR = 18, padT = 16, padB = 30;
  const chartH = 116;
  const plotW = (n - 1) * colW;
  const W = padL + plotW + padR;
  const H = padT + chartH + padB;
  const baseY = padT + chartH;
  const xOf = (i: number) => padL + i * colW;
  const yOf = (v: number) => baseY - (v / top) * chartH;

  const grid = [];
  for (let g = 0; g <= 4; g++) {
    const v = g * step;
    const y = yOf(v);
    grid.push(<line key={`g${g}`} x1={padL} y1={y} x2={padL + plotW} y2={y} stroke={STROKE} strokeWidth={g === 0 ? 1.5 : 0.7} opacity={g === 0 ? 1 : 0.3} />);
    grid.push(<text key={`gl${g}`} x={padL - 5} y={y + 3} textAnchor="end" fontSize="9" fill={LABEL}>{v}</text>);
  }

  const poly = values.map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={Math.min(W, 280)}
      role="img"
      aria-label={`꺾은선그래프. ${labels.map((l, i) => `${l} ${values[i]}${unit}`).join(', ')}`}
    >
      {grid}
      <polyline points={poly} fill="none" stroke={TARGET} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <g key={i}>
          <circle cx={xOf(i)} cy={yOf(v)} r={3.5} fill={HILITE} stroke={TARGET} strokeWidth={1.5} />
          <text x={xOf(i)} y={yOf(v) - 7} textAnchor="middle" fontSize="9.5" fill={LABEL}>{v}</text>
          <text x={xOf(i)} y={baseY + 13} textAnchor="middle" fontSize="9" fill={LABEL}>{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}

// 띠/원 그래프 항목 색(다크 배경에서 서로 구분되는 밝은 톤)
const SEG_COLORS = ['#6366f1', '#f59e0b', '#ec4899', '#22d3ee', '#a3e635', '#fb923c'];

// ── 띠그래프·원그래프: 항목별 백분율(합 100) + 범례 ──
function RatioGraph({ variant, labels, percents }: {
  variant: 'band' | 'pie'; labels: string[]; percents: number[];
}) {
  const n = labels.length;
  const color = (i: number) => SEG_COLORS[i % SEG_COLORS.length];
  const ariaLabel = `${variant === 'band' ? '띠그래프' : '원그래프'}. ${labels.map((l, i) => `${l} ${percents[i]}%`).join(', ')}`;
  // 범례(아래): 항목당 한 줄
  const rowH = 15;
  const legendY0 = variant === 'band' ? 66 : 150;
  const legend = labels.map((l, i) => (
    <g key={`lg${i}`}>
      <rect x={14} y={legendY0 + i * rowH - 8} width={10} height={10} rx={2} fill={color(i)} />
      <text x={29} y={legendY0 + i * rowH} fontSize="10" fill={LABEL}>{l} {percents[i]}%</text>
    </g>
  ));

  if (variant === 'band') {
    const padL = 14, barW = 232, barH = 30, top = 12;
    const total = percents.reduce((a, b) => a + b, 0) || 100;
    let acc = 0;
    const segs = percents.map((p, i) => {
      const x = padL + (acc / total) * barW;
      const w = (p / total) * barW;
      acc += p;
      return (
        <g key={i}>
          <rect x={x} y={top} width={w} height={barH} fill={color(i)} stroke={EDGE} strokeWidth={0.8} />
          {w >= 22 && (
            <text x={x + w / 2} y={top + barH / 2 + 3} textAnchor="middle" fontSize="9" fill="#1e1b4b" fontWeight="bold">{p}</text>
          )}
        </g>
      );
    });
    const H = legendY0 + n * rowH;
    return (
      <svg viewBox={`0 0 260 ${H}`} width={Math.min(260, 260)} role="img" aria-label={ariaLabel}>
        {segs}
        {/* 0~100 눈금 */}
        {[0, 25, 50, 75, 100].map((t) => (
          <text key={t} x={padL + (t / 100) * barW} y={top + barH + 11} textAnchor="middle" fontSize="8" fill={LABEL}>{t}</text>
        ))}
        {legend}
      </svg>
    );
  }

  // pie
  const cx = 70, cy = 70, R = 56;
  const total = percents.reduce((a, b) => a + b, 0) || 100;
  const ptAt = (frac: number) => {
    const th = rad(-90 + frac * 360);
    return { x: cx + R * Math.cos(th), y: cy + R * Math.sin(th) };
  };
  let accP = 0;
  const sectors = percents.map((p, i) => {
    const f0 = accP / total;
    accP += p;
    const f1 = accP / total;
    const a = ptAt(f0), b = ptAt(f1);
    const large = (f1 - f0) > 0.5 ? 1 : 0;
    const d = `M${cx},${cy} L${a.x.toFixed(1)},${a.y.toFixed(1)} A${R},${R} 0 ${large} 1 ${b.x.toFixed(1)},${b.y.toFixed(1)} Z`;
    // 라벨: 중간각 위치에 백분율
    const mid = ptAt((f0 + f1) / 2);
    const lx = cx + (mid.x - cx) * 0.6;
    const ly = cy + (mid.y - cy) * 0.6;
    return (
      <g key={i}>
        <path d={d} fill={color(i)} stroke={EDGE} strokeWidth={1} />
        {p >= 8 && <text x={lx} y={ly + 3} textAnchor="middle" fontSize="9" fill="#1e1b4b" fontWeight="bold">{p}</text>}
      </g>
    );
  });
  const H = legendY0 + n * rowH;
  return (
    <svg viewBox={`0 0 200 ${H}`} width={Math.min(200, 200)} role="img" aria-label={ariaLabel}>
      {sectors}
      {legend}
    </svg>
  );
}

// ── n각기둥·n각뿔 겨냥도 — 보이는 모서리 실선·숨은 모서리 점선 ──
// 밑면을 세로로 납작하게(등각 비슷) 그려 위·옆에서 본 입체로 표현. 구성 요소 세기용.
function SolidGon({ shape, n }: { shape: 'prism' | 'pyramid'; n: number }) {
  const N = Math.max(3, Math.min(10, n));
  const R = 46;       // 밑면 가로 반지름
  const Ry = 15;      // 세로 납작(원근) — 위에서 비스듬히 본 효과
  const H = 76;       // 기둥 높이 / 뿔 높이
  const phase = Math.PI / 2 + Math.PI / N; // 앞쪽에 한 모서리가 오도록
  const ang = (i: number) => (2 * Math.PI * i) / N + phase;
  const co = (i: number) => Math.cos(ang(i));
  const si = (i: number) => Math.sin(ang(i)); // si>0 = 앞(화면 아래), si<0 = 뒤

  // 면 가시성으로 숨은 모서리 판정(볼록 입체를 위·앞에서 봄):
  // 옆면 i(꼭짓점 i~i+1)의 바깥 법선 앞뒤 = si(i)+si(i+1) 부호. 정면 옆에서 봐
  // 법선이 화면과 평행(합≈0)한 면은 윤곽선(실루엣)이라 그 모서리는 항상 보인다(EPS로 처리).
  const EPS = 1e-6;
  const faceFront = (i: number) => si(i) + si((i + 1) % N) > EPS;  // 앞면(옆면 칠하기)
  const faceBack = (i: number) => si(i) + si((i + 1) % N) < -EPS;  // 확실히 뒤면
  const rimHidden = (i: number) => faceBack(i); // 밑면 모서리: 옆면이 확실히 뒤면일 때만 숨음
  const vertHidden = (i: number) => faceBack((i - 1 + N) % N) && faceBack(i); // 세로/옆 모서리: 양옆 면 모두 뒤면

  // 좌표 (밑면 중심 y=0 기준). 기둥은 윗면 y=-H, 뿔은 꼭대기 y=-H.
  const baseV = (i: number) => ({ x: R * co(i), y: Ry * si(i) });
  const topV = (i: number) => ({ x: R * co(i), y: -H + Ry * si(i) }); // 기둥 윗면
  const apex = { x: 0, y: -H };

  // bbox
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < N; i++) { pts.push(baseV(i)); pts.push(shape === 'prism' ? topV(i) : apex); }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const pad = 16;
  const ox = pad - minX, oy = pad - minY;
  const totW = maxX - minX + pad * 2;
  const totH = maxY - minY + pad * 2;
  const P = (p: { x: number; y: number }) => ({ x: p.x + ox, y: p.y + oy });
  const xy = (p: { x: number; y: number }) => `${(p.x + ox).toFixed(1)},${(p.y + oy).toFixed(1)}`;

  const edge = (a: { x: number; y: number }, b: { x: number; y: number }, hidden: boolean, key: string) => {
    const pa = P(a), pb = P(b);
    return (
      <line key={key} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
        stroke={STROKE} strokeWidth={2} strokeLinecap="round"
        strokeDasharray={hidden ? '4 4' : undefined as unknown as string}
        opacity={hidden ? 0.55 : 1} />
    );
  };
  const fills: ReactNode[] = [];
  const hidden: ReactNode[] = [];
  const solid: ReactNode[] = [];

  if (shape === 'prism') {
    // 앞쪽 옆면 채움(반투명)
    for (let i = 0; i < N; i++) {
      if (faceFront(i)) {
        const j = (i + 1) % N;
        fills.push(<polygon key={`sf${i}`}
          points={`${xy(topV(i))} ${xy(topV(j))} ${xy(baseV(j))} ${xy(baseV(i))}`}
          fill={FILL2} opacity={0.5} />);
      }
    }
    // 윗면 채움
    fills.push(<polygon key="top" points={Array.from({ length: N }, (_, i) => xy(topV(i))).join(' ')}
      fill={FILL3} opacity={0.85} />);
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      // 윗면 모서리: 항상 보임
      solid.push(edge(topV(i), topV(j), false, `te${i}`));
      // 밑면 모서리: 인접 옆면이 뒤면 숨음
      (rimHidden(i) ? hidden : solid).push(edge(baseV(i), baseV(j), rimHidden(i), `be${i}`));
      // 세로 모서리: 양옆 면 모두 뒤면 숨음
      (vertHidden(i) ? hidden : solid).push(edge(topV(i), baseV(i), vertHidden(i), `ve${i}`));
    }
  } else {
    // 뿔: 밑면 채움(반투명) + 앞쪽 옆삼각형 채움
    fills.push(<polygon key="base" points={Array.from({ length: N }, (_, i) => xy(baseV(i))).join(' ')}
      fill={FILL} opacity={0.3} />);
    for (let i = 0; i < N; i++) {
      if (faceFront(i)) {
        const j = (i + 1) % N;
        fills.push(<polygon key={`lf${i}`}
          points={`${xy(apex)} ${xy(baseV(j))} ${xy(baseV(i))}`}
          fill={FILL2} opacity={0.5} />);
      }
    }
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      // 밑면 모서리: 인접 옆면이 뒤면 숨음
      (rimHidden(i) ? hidden : solid).push(edge(baseV(i), baseV(j), rimHidden(i), `be${i}`));
      // 옆(빗) 모서리: 양옆 면 모두 뒤면 숨음
      (vertHidden(i) ? hidden : solid).push(edge(apex, baseV(i), vertHidden(i), `le${i}`));
    }
  }

  return (
    <svg viewBox={`0 0 ${totW.toFixed(1)} ${totH.toFixed(1)}`} width={Math.min(totW, 200)}
      role="img"
      aria-label={`${POLYGON_NAME[N]}${shape === 'prism' ? '기둥' : '뿔'}의 겨냥도. 보이는 모서리는 실선, 숨은 모서리는 점선`}>
      {fills}
      {hidden}
      {solid}
    </svg>
  );
}

const POLYGON_NAME: Record<number, string> = {
  3: '삼각', 4: '사각', 5: '오각', 6: '육각', 7: '칠각', 8: '팔각', 9: '구각', 10: '십각',
};

// ── 쌓기나무 직육면체 블록(등각 투상) — 가로 w·세로 d·높이 h개 단위 정육면체 ──
function CubeStack({ w, d, h }: { w: number; d: number; h: number }) {
  const maxDim = Math.max(w, d, h);
  const c = Math.max(12, Math.min(30, Math.floor(150 / maxDim))); // 단위칸 크기(px)
  const ax = { x: c, y: c * 0.5 };   // 가로(오른쪽-아래)
  const ay = { x: -c, y: c * 0.5 };  // 세로/깊이(왼쪽-아래)
  const az = { x: 0, y: -c };        // 높이(위)
  const proj = (x: number, y: number, z: number) => ({
    X: x * ax.x + y * ay.x + z * az.x,
    Y: x * ax.y + y * ay.y + z * az.y,
  });

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const x of [0, w]) for (const y of [0, d]) for (const z of [0, h]) {
    const p = proj(x, y, z);
    minX = Math.min(minX, p.X); maxX = Math.max(maxX, p.X);
    minY = Math.min(minY, p.Y); maxY = Math.max(maxY, p.Y);
  }
  const pad = 10;
  const off = { x: pad - minX, y: pad - minY };
  const W = maxX - minX + pad * 2;
  const Hh = maxY - minY + pad * 2;
  const pt = (x: number, y: number, z: number) => {
    const p = proj(x, y, z);
    return `${(p.X + off.x).toFixed(1)},${(p.Y + off.y).toFixed(1)}`;
  };

  type Cell = { pts: string; fill: string };
  const cells: Cell[] = [];
  // 윗면 (z=h): x,y 격자
  for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) {
    cells.push({ pts: `${pt(i, j, h)} ${pt(i + 1, j, h)} ${pt(i + 1, j + 1, h)} ${pt(i, j + 1, h)}`, fill: FILL3 });
  }
  // 앞-오른쪽 면 (y=0): x,z 격자
  for (let i = 0; i < w; i++) for (let k = 0; k < h; k++) {
    cells.push({ pts: `${pt(i, 0, k)} ${pt(i + 1, 0, k)} ${pt(i + 1, 0, k + 1)} ${pt(i, 0, k + 1)}`, fill: FILL2 });
  }
  // 앞-왼쪽 면 (x=0): y,z 격자
  for (let j = 0; j < d; j++) for (let k = 0; k < h; k++) {
    cells.push({ pts: `${pt(0, j, k)} ${pt(0, j + 1, k)} ${pt(0, j + 1, k + 1)} ${pt(0, j, k + 1)}`, fill: FILL });
  }

  return (
    <svg viewBox={`0 0 ${W.toFixed(1)} ${Hh.toFixed(1)}`} width={Math.min(W, 230)}
      role="img"
      aria-label={`쌓기나무를 가로 ${w}개, 세로 ${d}개, 높이 ${h}개로 쌓은 직육면체 모양`}>
      {cells.map((cell, idx) => (
        <polygon key={idx} points={cell.pts} fill={cell.fill} stroke={EDGE} strokeWidth={1} strokeLinejoin="round" />
      ))}
    </svg>
  );
}
