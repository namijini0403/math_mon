/** XP·레벨·인증카드 티어 규칙 */

export const XP_PER_CORRECT = 2;
export const XP_LESSON_CLEAR = 10;
export const XP_BOSS_CLEAR = 50;
export const XP_PERFECT_BONUS = 5; // 하트를 안 잃고 클리어
export const XP_MISSION_REWARD = 15;

/** 레벨 n → n+1에 필요한 XP */
export function xpForNext(level: number): number {
  return 60 + (level - 1) * 30;
}

/** 누적 XP → 현재 레벨 (1부터 시작) */
export function levelFromXp(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let rest = xp;
  while (rest >= xpForNext(level)) {
    rest -= xpForNext(level);
    level += 1;
  }
  return { level, into: rest, need: xpForNext(level) };
}

/** 타로풍 인증카드 티어 */
export interface CardTier {
  tier: number;
  name: string;
  subtitle: string;
  minLevel: number;
  /** 카드 배경 그라데이션 */
  colors: [string, string];
  accent: string;
  numeral: string;
}

export const CARD_TIERS: CardTier[] = [
  { tier: 1, name: '새싹 모험가', subtitle: 'THE SPROUT', minLevel: 2, colors: ['#14532d', '#65a30d'], accent: '#d9f99d', numeral: 'I' },
  { tier: 2, name: '용감한 견습생', subtitle: 'THE APPRENTICE', minLevel: 4, colors: ['#1e3a5f', '#0ea5e9'], accent: '#bae6fd', numeral: 'II' },
  { tier: 3, name: '분수의 기사', subtitle: 'KNIGHT OF FRACTIONS', minLevel: 6, colors: ['#3b1d5f', '#8b5cf6'], accent: '#ddd6fe', numeral: 'III' },
  { tier: 4, name: '통분의 마법사', subtitle: 'THE MAGICIAN', minLevel: 8, colors: ['#5b1d3f', '#ec4899'], accent: '#fbcfe8', numeral: 'IV' },
  { tier: 5, name: '숫자의 현자', subtitle: 'THE SAGE', minLevel: 10, colors: ['#713f12', '#f59e0b'], accent: '#fde68a', numeral: 'V' },
  { tier: 6, name: '별빛 수호자', subtitle: 'STAR GUARDIAN', minLevel: 13, colors: ['#155e75', '#22d3ee'], accent: '#a5f3fc', numeral: 'VI' },
  { tier: 7, name: '달의 정복자', subtitle: 'MOON CONQUEROR', minLevel: 16, colors: ['#312e81', '#818cf8'], accent: '#c7d2fe', numeral: 'VII' },
  { tier: 8, name: '수학의 전설', subtitle: 'THE LEGEND', minLevel: 20, colors: ['#7c2d12', '#fbbf24'], accent: '#fef3c7', numeral: 'VIII' },
];

/** 해당 레벨에서 획득하는 카드 티어 (없으면 null) */
export function tierForLevel(level: number): CardTier | null {
  let best: CardTier | null = null;
  for (const t of CARD_TIERS) if (level >= t.minLevel) best = t;
  return best;
}

/** 보스 격파 카드 디자인 (스테이지 id 기준) */
export interface BossCardDef {
  name: string;
  subtitle: string;
  colors: [string, string];
  accent: string;
  emoji: string;
}

export const BOSS_CARDS: Record<string, BossCardDef> = {
  // ── 4-1 보스 ──
  'bn-boss': { name: '콜로서스 격파자', subtitle: 'COLOSSUS BREAKER', colors: ['#1c1917', '#a16207'], accent: '#fef9c3', emoji: '🏛️' },
  // ── 4-2 보스 (전반) ──
  'f4-boss': { name: '토끼 정복자', subtitle: 'RABBIT CONQUEROR', colors: ['#4a1942', '#db2777'], accent: '#fce7f3', emoji: '🐰' },
  'tr-boss': { name: '공작의 눈', subtitle: 'PEACOCK EYE', colors: ['#14532d', '#16a34a'], accent: '#dcfce7', emoji: '🦚' },
  'da-boss': { name: '수달의 친구', subtitle: 'OTTER FRIEND', colors: ['#0c4a6e', '#0ea5e9'], accent: '#e0f2fe', emoji: '🦦' },
  // ── 4-2 보스 (후반) ──
  'qd-boss': { name: '두더지 정복자', subtitle: 'MOLE CONQUEROR', colors: ['#292524', '#a16207'], accent: '#fef9c3', emoji: '🦔' },
  'lg-boss': { name: '학의 친구', subtitle: 'CRANE FRIEND', colors: ['#0f4c81', '#38bdf8'], accent: '#e0f2fe', emoji: '🦢' },
  'pg-boss': { name: '공작의 날개', subtitle: 'PEACOCK WING', colors: ['#14532d', '#84cc16'], accent: '#ecfccb', emoji: '🦚' },
  'ag-boss': { name: '매의 눈', subtitle: 'HAWK EYE', colors: ['#0c4a6e', '#0369a1'], accent: '#bae6fd', emoji: '🦅' },
  'md-boss': { name: '황소 정복자', subtitle: 'OX CONQUEROR', colors: ['#14532d', '#15803d'], accent: '#d9f99d', emoji: '🐂' },
  'mv-boss': { name: '나비의 날개', subtitle: 'BUTTERFLY WING', colors: ['#4a044e', '#c026d3'], accent: '#f5d0fe', emoji: '🦋' },
  'bg-boss': { name: '펭귄 분석가', subtitle: 'PENGUIN ANALYST', colors: ['#0f172a', '#0ea5e9'], accent: '#bae6fd', emoji: '🐧' },
  'fr-boss': { name: '스핑크스의 친구', subtitle: 'SPHINX FRIEND', colors: ['#422006', '#d97706'], accent: '#fde68a', emoji: '🐈' },
  // ── 5-1 보스 ──
  's1-boss': { name: '드래곤 슬레이어', subtitle: 'DRAGON SLAYER', colors: ['#450a0a', '#ea580c'], accent: '#fed7aa', emoji: '🐲' },
  's2-boss': { name: '마왕 정복자', subtitle: 'DEMON CONQUEROR', colors: ['#2e1065', '#dc2626'], accent: '#fecaca', emoji: '👹' },
  'sm-boss': { name: '계산의 거인 사냥꾼', subtitle: 'GIANT HUNTER', colors: ['#1c1917', '#65a30d'], accent: '#d9f99d', emoji: '🗿' },
  'sd-boss': { name: '골렘 파괴자', subtitle: 'GOLEM BREAKER', colors: ['#0c4a6e', '#0ea5e9'], accent: '#bae6fd', emoji: '🤖' },
  'sp-boss': { name: '미로의 정복자', subtitle: 'MAZE MASTER', colors: ['#3f2d12', '#d97706'], accent: '#fde68a', emoji: '🦉' },
  'sg-boss': { name: '거미여왕 토벌자', subtitle: 'QUEEN SLAYER', colors: ['#172554', '#7c3aed'], accent: '#ddd6fe', emoji: '🕷️' },
  // ── 5-2 보스 ──
  'sr-boss': { name: '안개를 걷는 자', subtitle: 'MIST WALKER', colors: ['#1e293b', '#94a3b8'], accent: '#e2e8f0', emoji: '🧙' },
  'sf-boss': { name: '타이탄 슬레이어', subtitle: 'TITAN SLAYER', colors: ['#451a03', '#f472b6'], accent: '#fce7f3', emoji: '🍰' },
  'sy-boss': { name: '거울 파괴자', subtitle: 'MIRROR BREAKER', colors: ['#0f172a', '#22d3ee'], accent: '#cffafe', emoji: '🪞' },
  'sdm-boss': { name: '닌자 사냥꾼', subtitle: 'NINJA HUNTER', colors: ['#18181b', '#ef4444'], accent: '#fecaca', emoji: '🥷' },
  'scb-boss': { name: '큐브 정복자', subtitle: 'CUBE CONQUEROR', colors: ['#14532d', '#34d399'], accent: '#d1fae5', emoji: '🎲' },
  'sa-boss': { name: '운명의 승부사', subtitle: 'FATE GAMBLER', colors: ['#2e1065', '#f59e0b'], accent: '#fef3c7', emoji: '🔮' },
  // ── 6-1 보스 ──
  'fd1-boss': { name: '심해의 항해사', subtitle: 'DEEP SEA NAVIGATOR', colors: ['#082f49', '#06b6d4'], accent: '#cffafe', emoji: '🐙' },
  'pr-boss': { name: '수정 정령의 친구', subtitle: 'CRYSTAL FRIEND', colors: ['#1e1b4b', '#a78bfa'], accent: '#ede9fe', emoji: '💎' },
  'dd1-boss': { name: '유랑단의 별', subtitle: 'STAR OF THE TROUPE', colors: ['#3f1d2e', '#f43f5e'], accent: '#ffe4e6', emoji: '🎩' },
  'rt-boss': { name: '황금 저울의 주인', subtitle: 'GOLDEN SCALE MASTER', colors: ['#451a03', '#f59e0b'], accent: '#fef3c7', emoji: '🦊' },
  'gr-boss': { name: '색깔의 지배자', subtitle: 'COLOR SOVEREIGN', colors: ['#14532d', '#84cc16'], accent: '#ecfccb', emoji: '🦎' },
  'vl-boss': { name: '고래의 길잡이', subtitle: 'WHALE GUIDE', colors: ['#0c4a6e', '#38bdf8'], accent: '#e0f2fe', emoji: '🐋' },
  // ── 6-2 보스 ──
  'fd2-boss': { name: '마술사의 후계자', subtitle: 'MAGICIAN HEIR', colors: ['#312e81', '#c084fc'], accent: '#f3e8ff', emoji: '🎩' },
  'dd2-boss': { name: '너구리의 맞수', subtitle: 'RACCOON RIVAL', colors: ['#292524', '#fb923c'], accent: '#ffedd5', emoji: '🦝' },
  'spc-boss': { name: '설산의 친구', subtitle: 'YETI FRIEND', colors: ['#1e3a5f', '#e2e8f0'], accent: '#f8fafc', emoji: '☃️' },
  'pp-boss': { name: '균형의 달인', subtitle: 'BALANCE MASTER', colors: ['#7c2d12', '#fbbf24'], accent: '#fef9c3', emoji: '🦀' },
  'cir-boss': { name: '원의 현자', subtitle: 'SAGE OF CIRCLES', colors: ['#1e1b4b', '#22d3ee'], accent: '#cffafe', emoji: '🛞' },
  'r3-boss': { name: '회전목마의 주인', subtitle: 'CAROUSEL KEEPER', colors: ['#4a044e', '#f0abfc'], accent: '#fae8ff', emoji: '🎠' },
};
