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
