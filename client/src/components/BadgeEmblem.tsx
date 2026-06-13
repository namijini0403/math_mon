/**
 * BadgeEmblem — 코드로 그리는 SVG 휘장(배지). 이모지 대신 대학 문장/공로배지풍 벡터 엠블럼.
 * 부품 조합으로 무한히 다양: shape(외형) × palette(색) × glyph(중앙 심볼) × ring(월계관).
 * 획득 못한 배지는 회색 실루엣. 텍스트(배지 이름)는 컴포넌트 밖에서 표시.
 */

import type { ReactNode } from 'react';

export type EmblemShape = 'shield' | 'roundel' | 'starburst' | 'banner' | 'hexagon' | 'gem';
export type EmblemPalette =
  | 'bronze' | 'silver' | 'gold'
  | 'sky' | 'violet' | 'emerald' | 'rose' | 'amber' | 'indigo';
export type EmblemGlyph =
  | 'sprout' | 'flame' | 'bolt' | 'star' | 'crown' | 'sword' | 'shield' | 'book'
  | 'target' | 'gem' | 'infinity' | 'medal' | 'sun' | 'moon' | 'compass'
  | 'sigma' | 'dragon' | 'sparkle' | 'ribbon' | 'castle';

export interface BadgeVisual {
  shape: EmblemShape;
  palette: EmblemPalette;
  glyph: EmblemGlyph;
  /** 월계관 링 추가 (꾸준함·명예 계열에 어울림) */
  ring?: boolean;
}

/** [deep, dark, base, light] */
const PALETTES: Record<EmblemPalette, [string, string, string, string]> = {
  bronze: ['#3a2410', '#7c4a21', '#cd7f32', '#f0b27a'],
  silver: ['#1f2937', '#64748b', '#cbd5e1', '#f8fafc'],
  gold: ['#3a2a06', '#a16207', '#fbbf24', '#fef3c7'],
  sky: ['#08304a', '#0369a1', '#38bdf8', '#bae6fd'],
  violet: ['#2a1456', '#5b21b6', '#a78bfa', '#ede9fe'],
  emerald: ['#04372a', '#047857', '#34d399', '#d1fae5'],
  rose: ['#4c0519', '#9f1239', '#fb7185', '#ffe4e6'],
  amber: ['#3a2406', '#b45309', '#f59e0b', '#fde68a'],
  indigo: ['#1e1b4b', '#3730a3', '#818cf8', '#e0e7ff'],
};

/** 외형 플레이트 (viewBox 0 0 100 112 기준) */
function Plate({ shape, gradId, rim }: { shape: EmblemShape; gradId: string; rim: string }) {
  const fill = `url(#${gradId})`;
  const common = { fill, stroke: rim, strokeWidth: 4, strokeLinejoin: 'round' as const };
  switch (shape) {
    case 'shield':
      return <path d="M50 6 L90 20 V56 C90 84 50 106 50 106 C50 106 10 84 10 56 V20 Z" {...common} />;
    case 'roundel':
      return <circle cx="50" cy="56" r="46" {...common} />;
    case 'hexagon':
      return <polygon points="50,6 90,30 90,82 50,106 10,82 10,30" {...common} />;
    case 'gem':
      return <polygon points="50,6 84,42 50,106 16,42" {...common} />;
    case 'banner':
      return (
        <>
          <rect x="14" y="14" width="72" height="74" rx="14" {...common} />
          <polygon points="26,84 50,98 74,84 74,104 50,94 26,104" fill={rim} opacity="0.9" />
        </>
      );
    case 'starburst': {
      // 12갈래 별 + 내부 원
      const pts: string[] = [];
      const cx = 50, cy = 56;
      for (let i = 0; i < 24; i++) {
        const r = i % 2 === 0 ? 48 : 33;
        const a = (Math.PI / 12) * i - Math.PI / 2;
        pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
      }
      return (
        <>
          <polygon points={pts.join(' ')} {...common} />
          <circle cx={cx} cy={cy} r="30" fill={fill} stroke={rim} strokeWidth="2" />
        </>
      );
    }
  }
}

/** 월계관 링 (양쪽 잎) */
function Laurel({ color }: { color: string }) {
  const leaf = (x: number, y: number, rot: number) => (
    <ellipse cx={x} cy={y} rx="3.4" ry="6.6" fill={color} transform={`rotate(${rot} ${x} ${y})`} />
  );
  const left: ReactNode[] = [];
  const right: ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    const a = Math.PI * (0.55 + t * 0.72); // 왼쪽 호
    const x = 50 + 40 * Math.cos(a);
    const y = 58 + 40 * Math.sin(a);
    left.push(<g key={`l${i}`}>{leaf(x, y, (a * 180) / Math.PI + 100)}</g>);
    right.push(<g key={`r${i}`}>{leaf(100 - x, y, -((a * 180) / Math.PI) - 100)}</g>);
  }
  return <g opacity="0.9">{left}{right}</g>;
}

/** 중앙 심볼 (대략 38~64 범위에 그려지도록, fill=light) */
function Glyph({ glyph, color, dark }: { glyph: EmblemGlyph; color: string; dark: string }) {
  const c = color;
  switch (glyph) {
    case 'star':
      return <path d="M50 34 L56 50 L73 50 L59 60 L64 77 L50 67 L36 77 L41 60 L27 50 L44 50 Z" fill={c} />;
    case 'sparkle':
      return (
        <g fill={c}>
          <path d="M50 32 L54 52 L74 56 L54 60 L50 80 L46 60 L26 56 L46 52 Z" />
          <circle cx="68" cy="38" r="3" />
          <circle cx="33" cy="72" r="2.5" />
        </g>
      );
    case 'flame':
      return <path d="M50 32 C58 44 64 48 60 60 C58 70 50 74 50 74 C50 74 42 70 40 60 C37 50 46 50 44 40 C49 44 47 38 50 32 Z" fill={c} />;
    case 'bolt':
      return <path d="M54 32 L38 60 L48 60 L44 80 L64 52 L53 52 Z" fill={c} />;
    case 'crown':
      return <path d="M32 68 L30 44 L42 54 L50 38 L58 54 L70 44 L68 68 Z" fill={c} />;
    case 'sword':
      return (
        <g fill={c}>
          <path d="M50 30 L55 35 L52 66 L48 66 L45 35 Z" />
          <rect x="40" y="66" width="20" height="5" rx="2" />
          <rect x="47" y="71" width="6" height="12" rx="2" />
        </g>
      );
    case 'shield':
      return <path d="M50 34 L66 40 V56 C66 68 50 76 50 76 C50 76 34 68 34 56 V40 Z" fill={c} />;
    case 'book':
      return (
        <g fill={c}>
          <path d="M50 40 C44 36 34 36 30 38 V70 C34 68 44 68 50 72 Z" />
          <path d="M50 40 C56 36 66 36 70 38 V70 C66 68 56 68 50 72 Z" opacity="0.85" />
        </g>
      );
    case 'target':
      return (
        <g fill="none" stroke={c} strokeWidth="4">
          <circle cx="50" cy="55" r="18" />
          <circle cx="50" cy="55" r="9" />
          <circle cx="50" cy="55" r="2.5" fill={c} />
        </g>
      );
    case 'gem':
      return (
        <g fill={c}>
          <polygon points="50,36 64,46 50,74 36,46" />
          <polygon points="50,36 64,46 50,52 36,46" fill={dark} opacity="0.35" />
        </g>
      );
    case 'infinity':
      return (
        <path
          d="M40 55 a8 8 0 1 1 8 8 a8 8 0 1 0 8 -8 a8 8 0 1 1 -8 -8 a8 8 0 1 0 -8 8 Z"
          fill="none"
          stroke={c}
          strokeWidth="5"
        />
      );
    case 'medal':
      return (
        <g fill={c}>
          <circle cx="50" cy="58" r="15" />
          <circle cx="50" cy="58" r="8" fill={dark} opacity="0.4" />
          <path d="M44 40 L40 30 L48 30 L50 40 Z M56 40 L60 30 L52 30 L50 40 Z" />
        </g>
      );
    case 'sun':
      return (
        <g fill={c}>
          <circle cx="50" cy="56" r="12" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (Math.PI / 4) * i;
            const x1 = 50 + 17 * Math.cos(a), y1 = 56 + 17 * Math.sin(a);
            const x2 = 50 + 24 * Math.cos(a), y2 = 56 + 24 * Math.sin(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="4" strokeLinecap="round" />;
          })}
        </g>
      );
    case 'moon':
      return <path d="M60 38 A20 20 0 1 0 60 74 A15 15 0 1 1 60 38 Z" fill={c} />;
    case 'compass':
      return (
        <g>
          <circle cx="50" cy="56" r="18" fill="none" stroke={c} strokeWidth="3.5" />
          <polygon points="50,42 55,56 50,70 45,56" fill={c} />
        </g>
      );
    case 'sigma':
      return (
        <path d="M38 38 H62 V44 L48 56 L62 68 V74 H38 V68 L52 56 L38 44 Z" fill={c} />
      );
    case 'sprout':
      return (
        <g fill={c}>
          <rect x="48" y="52" width="4" height="22" rx="2" />
          <path d="M50 54 C40 54 34 46 34 38 C44 38 50 44 50 54 Z" />
          <path d="M50 54 C60 54 66 46 66 38 C56 38 50 44 50 54 Z" opacity="0.85" />
        </g>
      );
    case 'dragon':
      return (
        <g fill={c}>
          <path d="M36 64 C36 48 48 40 60 42 C56 46 58 50 64 50 C60 58 52 62 44 62 L44 70 L38 70 Z" />
          <circle cx="56" cy="48" r="2.2" fill={dark} />
        </g>
      );
    case 'ribbon':
      return (
        <g fill={c}>
          <circle cx="50" cy="50" r="13" />
          <circle cx="50" cy="50" r="6" fill={dark} opacity="0.4" />
          <path d="M44 60 L40 78 L50 72 L60 78 L56 60 Z" />
        </g>
      );
    case 'castle':
      return (
        <g fill={c}>
          <path d="M32 72 V46 H38 V40 H44 V46 H48 V40 H52 V46 H56 V40 H62 V46 H68 V72 Z" />
          <rect x="46" y="58" width="8" height="14" fill={dark} opacity="0.4" />
        </g>
      );
  }
}

export function BadgeEmblem({
  visual,
  owned = true,
  size = 56,
  id,
}: {
  visual: BadgeVisual;
  owned?: boolean;
  size?: number;
  /** 그라데이션 id 충돌 방지용 고유 키 */
  id: string;
}) {
  const [deep, dark, base, light] = PALETTES[visual.palette];
  const gradId = `bg-${id}`;
  return (
    <svg
      viewBox="0 0 100 112"
      width={size}
      height={size * 1.12}
      className={owned ? '' : 'opacity-30 grayscale'}
      role="img"
    >
      <defs>
        <radialGradient id={gradId} cx="38%" cy="32%" r="80%">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={base} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
      </defs>
      {visual.ring && <Laurel color={light} />}
      <Plate shape={visual.shape} gradId={gradId} rim={light} />
      {/* 상단 광택 */}
      <ellipse cx="40" cy="30" rx="20" ry="10" fill="#ffffff" opacity="0.18" />
      <Glyph glyph={visual.glyph} color={light} dark={deep} />
    </svg>
  );
}
