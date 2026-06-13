/**
 * DragonRoom — 드래곤이 사는 방 배경(코드 렌더 SVG). 집 재료를 모을수록 6단계로 업그레이드.
 *   0 지푸라기 둥지 → 1 나무 둥지 → 2 포근한 오두막 → 3 튼튼한 벽돌집 → 4 드래곤의 성 → 5 찬란한 궁전
 * 드래곤(DragonStage)은 이 배경 위(앞)에 겹쳐 그린다.
 * Codex 페인터리 방 배경(assets/dragon/room/tierN.png)이 있으면 우선 사용하고,
 * 없으면 아래 코드 렌더 SVG로 폴백한다(파일명만 맞으면 자동 업그레이드).
 */

import { useState } from 'react';

const VB_W = 320;
const VB_H = 210;
const FLOOR_Y = 168; // 바닥선

/** 공통 바닥 (재료에 따라 색이 달라짐) */
function Floor({ top, front }: { top: string; front: string }) {
  return (
    <>
      <rect x="0" y={FLOOR_Y} width={VB_W} height={VB_H - FLOOR_Y} fill={front} />
      <ellipse cx={VB_W / 2} cy={FLOOR_Y} rx={VB_W / 2} ry="16" fill={top} />
    </>
  );
}

/** 따뜻한 빛무리 (드래곤 뒤 후광) */
function Glow({ color }: { color: string }) {
  return <ellipse cx="160" cy="120" rx="92" ry="74" fill={color} opacity="0.25" />;
}

function Straw() {
  // 지푸라기 더미
  const blades = [];
  for (let i = 0; i < 22; i++) {
    const x = 96 + i * 5.6;
    const h = 14 + ((i * 37) % 13);
    blades.push(
      <line key={i} x1={x} y1={FLOOR_Y} x2={x + (i % 2 ? 4 : -4)} y2={FLOOR_Y - h} stroke="#d9a441" strokeWidth="2.2" strokeLinecap="round" />,
    );
  }
  return (
    <g>
      <ellipse cx="160" cy={FLOOR_Y + 2} rx="78" ry="20" fill="#b9822f" />
      <ellipse cx="160" cy={FLOOR_Y} rx="74" ry="16" fill="#e3b457" />
      {blades}
    </g>
  );
}

function Tier0() {
  // 외양간 — 흙바닥 + 지푸라기 둥지 + 울타리 기둥
  return (
    <g>
      <Floor top="#6b4f2a" front="#4a371d" />
      <Glow color="#fbbf24" />
      {/* 뒤편 나무 울타리 */}
      {[40, 80, 240, 280].map((x) => (
        <rect key={x} x={x} y={FLOOR_Y - 44} width="8" height="44" rx="2" fill="#5b3f22" />
      ))}
      <rect x="36" y={FLOOR_Y - 36} width="56" height="6" rx="2" fill="#6b4a28" />
      <rect x="236" y={FLOOR_Y - 36} width="56" height="6" rx="2" fill="#6b4a28" />
      <Straw />
    </g>
  );
}

function Tier1() {
  // 나무 둥지 — 통나무 바닥 + 뒤 통나무벽 + 지푸라기
  return (
    <g>
      <Floor top="#a9772f" front="#6f4a23" />
      <Glow color="#fbbf24" />
      {/* 통나무 뒷벽 */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="78" y={FLOOR_Y - 70 + i * 16} width="164" height="15" rx="7" fill={i % 2 ? '#8a5a2b' : '#9c682f'} stroke="#5b3a1c" strokeWidth="1.5" />
      ))}
      <Straw />
    </g>
  );
}

function House({
  wall, wallDark, roof, roofDark, door, window: win, withChimney,
}: { wall: string; wallDark: string; roof: string; roofDark: string; door: string; window: string; withChimney?: boolean }) {
  return (
    <g>
      {withChimney && <rect x="206" y="58" width="18" height="34" rx="2" fill={roofDark} />}
      {/* 지붕 */}
      <polygon points="160,52 250,104 70,104" fill={roof} stroke={roofDark} strokeWidth="3" strokeLinejoin="round" />
      <polygon points="160,52 160,104 70,104" fill={roofDark} opacity="0.25" />
      {/* 벽 */}
      <rect x="86" y="104" width="148" height={FLOOR_Y - 104} fill={wall} stroke={wallDark} strokeWidth="2" />
      <rect x="86" y="104" width="20" height={FLOOR_Y - 104} fill={wallDark} opacity="0.25" />
      {/* 문 */}
      <rect x="144" y="128" width="32" height={FLOOR_Y - 128} rx="14" fill={door} stroke={wallDark} strokeWidth="2" />
      <circle cx="169" cy="150" r="2.4" fill="#fde68a" />
      {/* 창문 (빛) */}
      <rect x="104" y="116" width="24" height="24" rx="3" fill={win} stroke={wallDark} strokeWidth="2" />
      <rect x="192" y="116" width="24" height="24" rx="3" fill={win} stroke={wallDark} strokeWidth="2" />
    </g>
  );
}

function Tier2() {
  // 포근한 오두막 (나무집)
  return (
    <g>
      <Floor top="#9c7a45" front="#5f4527" />
      <Glow color="#fcd34d" />
      <House wall="#c89b5e" wallDark="#7a5526" roof="#9c5a2c" roofDark="#6e3c17" door="#7a4a22" window="#fde68a" />
    </g>
  );
}

function Tier3() {
  // 튼튼한 벽돌집 + 굴뚝
  return (
    <g>
      <Floor top="#7d8597" front="#3f4656" />
      <Glow color="#fcd34d" />
      <House wall="#c2553f" wallDark="#7e2f22" roof="#3b4252" roofDark="#232834" door="#5b3a22" window="#fde68a" withChimney />
      {/* 벽돌 줄눈 */}
      {[112, 126, 140, 154].map((y) => (
        <line key={y} x1="86" y1={y} x2="234" y2={y} stroke="#7e2f22" strokeWidth="1" opacity="0.5" />
      ))}
      {/* 굴뚝 연기 */}
      <circle cx="215" cy="50" r="5" fill="#cbd5e1" opacity="0.5" />
      <circle cx="222" cy="40" r="6" fill="#cbd5e1" opacity="0.4" />
    </g>
  );
}

function Tier4() {
  // 드래곤의 성 — 돌벽 + 흉벽 + 탑 + 깃발
  const merlon = (x: number) => <rect key={x} x={x} y="70" width="14" height="12" fill="#8b93a7" />;
  return (
    <g>
      <Floor top="#6b7280" front="#374151" />
      <Glow color="#a78bfa" />
      {/* 본성 벽 */}
      <rect x="78" y="82" width="164" height={FLOOR_Y - 82} fill="#9aa3b5" stroke="#6b7280" strokeWidth="2" />
      {/* 흉벽 */}
      {[78, 100, 122, 144, 166, 188, 210, 228].map(merlon)}
      {/* 좌우 탑 */}
      <rect x="56" y="64" width="30" height={FLOOR_Y - 64} fill="#aab2c4" stroke="#6b7280" strokeWidth="2" />
      <rect x="234" y="64" width="30" height={FLOOR_Y - 64} fill="#aab2c4" stroke="#6b7280" strokeWidth="2" />
      <polygon points="56,64 86,64 71,44" fill="#7c3aed" />
      <polygon points="234,64 264,64 249,44" fill="#7c3aed" />
      {/* 깃발 */}
      <line x1="71" y1="44" x2="71" y2="28" stroke="#cbd5e1" strokeWidth="2" />
      <polygon points="71,28 90,33 71,38" fill="#f59e0b" />
      {/* 아치문 */}
      <path d="M144 168 V128 a16 16 0 0 1 32 0 V168 Z" fill="#3b3f4a" stroke="#6b7280" strokeWidth="2" />
      {/* 창 */}
      <rect x="100" y="100" width="16" height="26" rx="8" fill="#fde68a" />
      <rect x="204" y="100" width="16" height="26" rx="8" fill="#fde68a" />
    </g>
  );
}

function Tier5() {
  // 찬란한 궁전 — 황금 돔 + 기둥 + 현수막 + 반짝임
  return (
    <g>
      <Floor top="#c9b27a" front="#5b4a22" />
      <Glow color="#fbbf24" />
      {/* 본관 */}
      <rect x="74" y="92" width="172" height={FLOOR_Y - 92} fill="#efe2bf" stroke="#caa64e" strokeWidth="2" />
      {/* 기둥 */}
      {[88, 120, 200, 232].map((x) => (
        <rect key={x} x={x} y="100" width="10" height={FLOOR_Y - 100} fill="#f7eecb" stroke="#caa64e" strokeWidth="1.5" />
      ))}
      {/* 중앙 황금 돔 */}
      <path d="M128 92 a32 28 0 0 1 64 0 Z" fill="#f6c453" stroke="#b8860b" strokeWidth="2" />
      <circle cx="160" cy="56" r="4" fill="#fff7d6" />
      {/* 좌우 작은 돔 */}
      <path d="M78 92 a18 16 0 0 1 36 0 Z" fill="#e9b949" stroke="#b8860b" strokeWidth="2" />
      <path d="M206 92 a18 16 0 0 1 36 0 Z" fill="#e9b949" stroke="#b8860b" strokeWidth="2" />
      {/* 현수막 */}
      <polygon points="150,100 170,100 170,124 160,118 150,124" fill="#b91c1c" />
      {/* 황금 아치문 */}
      <path d="M146 168 V132 a14 14 0 0 1 28 0 V168 Z" fill="#caa64e" />
      {/* 반짝임 */}
      {[[96, 70], [224, 66], [160, 40], [120, 110], [200, 110]].map(([x, y], i) => (
        <g key={i} fill="#fff7d6">
          <path d={`M${x} ${y - 5} L${x + 1.5} ${y} L${x + 6} ${y} L${x + 1.5} ${y + 1.5} L${x} ${y + 6} L${x - 1.5} ${y + 1.5} L${x - 6} ${y} L${x - 1.5} ${y} Z`} />
        </g>
      ))}
    </g>
  );
}

const TIERS = [Tier0, Tier1, Tier2, Tier3, Tier4, Tier5];

export function DragonRoom({ tier, className }: { tier: number; className?: string }) {
  const t = Math.max(0, Math.min(5, tier));
  const Scene = TIERS[t];
  const [rasterOk, setRasterOk] = useState(true);
  const rasterSrc = `assets/dragon/room/tier${t}.png`;

  // Codex 페인터리 배경이 있으면 우선 사용
  if (rasterOk) {
    return (
      <img
        src={rasterSrc}
        alt=""
        aria-hidden="true"
        className={`${className ?? ''} object-cover object-bottom`}
        onError={() => setRasterOk(false)}
      />
    );
  }
  // 폴백: 코드 렌더 SVG 방
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={className} preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <Scene />
    </svg>
  );
}
