/**
 * 출석 보상 카드 (수집형) — Codex 제작 일러스트 20종.
 * 매일 출석 보물상자에서 1장씩 뽑는다. 중복이면 보너스 XP로 전환.
 */

export type RewardRarity = 'common' | 'rare' | 'legendary';

export interface RewardCardDef {
  id: string;
  rarity: RewardRarity;
  /** 카드 한국어 이름 */
  name: string;
  /** 원제 (카드 하단 장식용) */
  title: string;
  src: string;
}

export const REWARD_CARDS: RewardCardDef[] = [
  { id: 'reward-common-01', rarity: 'common', name: '별빛 나침반', title: 'Astral Compass', src: 'assets/reward-cards/reward-common-01.png' },
  { id: 'reward-common-02', rarity: 'common', name: '달빛 주판', title: 'Moonlit Abacus', src: 'assets/reward-cards/reward-common-02.png' },
  { id: 'reward-common-03', rarity: 'common', name: '수정 다각형 정원', title: 'Crystal Polygon Garden', src: 'assets/reward-cards/reward-common-03.png' },
  { id: 'reward-common-04', rarity: 'common', name: '분수의 성배', title: 'Fraction Chalice', src: 'assets/reward-cards/reward-common-04.png' },
  { id: 'reward-common-05', rarity: 'common', name: '침묵의 마법서', title: 'The Silent Spellbook', src: 'assets/reward-cards/reward-common-05.png' },
  { id: 'reward-common-06', rarity: 'common', name: '기하학의 문', title: 'Geometric Gate', src: 'assets/reward-cards/reward-common-06.png' },
  { id: 'reward-common-07', rarity: 'common', name: '별의 모래시계', title: 'Starlit Hourglass', src: 'assets/reward-cards/reward-common-07.png' },
  { id: 'reward-common-08', rarity: 'common', name: '신비한 자', title: 'Mystic Ruler', src: 'assets/reward-cards/reward-common-08.png' },
  { id: 'reward-common-09', rarity: 'common', name: '오로라 도서관', title: 'Aurora Library', src: 'assets/reward-cards/reward-common-09.png' },
  { id: 'reward-common-10', rarity: 'common', name: '프리즘 과수원', title: 'Prism Orchard', src: 'assets/reward-cards/reward-common-10.png' },
  { id: 'reward-common-11', rarity: 'common', name: '황금비 조개', title: 'Golden Ratio Shell', src: 'assets/reward-cards/reward-common-11.png' },
  { id: 'reward-common-12', rarity: 'common', name: '등불 미궁', title: 'Lantern Labyrinth', src: 'assets/reward-cards/reward-common-12.png' },
  { id: 'reward-rare-01', rarity: 'rare', name: '천상의 현자', title: 'Celestial Sage', src: 'assets/reward-cards/reward-rare-01.png' },
  { id: 'reward-rare-02', rarity: 'rare', name: '분수 왕관의 기사', title: 'Fraction Crown Knight', src: 'assets/reward-cards/reward-rare-02.png' },
  { id: 'reward-rare-03', rarity: 'rare', name: '무한의 천문대', title: 'Infinity Observatory', src: 'assets/reward-cards/reward-rare-03.png' },
  { id: 'reward-rare-04', rarity: 'rare', name: '사파이어 용 학자', title: 'Sapphire Dragon Scholar', src: 'assets/reward-cards/reward-rare-04.png' },
  { id: 'reward-rare-05', rarity: 'rare', name: '해와 달의 제단', title: 'Sun-Moon Equation Altar', src: 'assets/reward-cards/reward-rare-05.png' },
  { id: 'reward-rare-06', rarity: 'rare', name: '비전의 연꽃', title: 'Arcane Lotus', src: 'assets/reward-cards/reward-rare-06.png' },
  { id: 'reward-dragon-rare-04', rarity: 'rare', name: '성좌 나침반의 용현자', title: 'Astral Compass Dragon Sage', src: 'assets/reward-cards-dragon/reward-dragon-rare-04.png' },
  { id: 'reward-dragon-rare-05', rarity: 'rare', name: '별등 숲의 용신탁자', title: 'Starlit Grove Dragon Oracle', src: 'assets/reward-cards-dragon/reward-dragon-rare-05.png' },
  { id: 'reward-legendary-01', rarity: 'legendary', name: '빛나는 기하학자', title: 'Radiant Geometer', src: 'assets/reward-cards/reward-legendary-01.png' },
  { id: 'reward-legendary-02', rarity: 'legendary', name: '무한한 별들의 왕관', title: 'Crown of Infinite Stars', src: 'assets/reward-cards/reward-legendary-02.png' },
  { id: 'reward-dragon-legendary-02', rarity: 'legendary', name: '무한성좌의 대점성왕', title: 'Grand Astrologer of Infinite Stars', src: 'assets/reward-cards-dragon/reward-dragon-legendary-02.png' },
  { id: 'reward-dragon-legendary-03', rarity: 'legendary', name: '수정천문의 성좌군주', title: 'Crystal Observatory Star Monarch', src: 'assets/reward-cards-dragon/reward-dragon-legendary-03.png' },
  { id: 'reward-dragon-legendary-04', rarity: 'legendary', name: '달빛 수정연꽃의 대현자', title: 'Moonlit Crystal Lotus Oracle', src: 'assets/reward-cards-dragon/reward-dragon-legendary-04.png' },
  { id: 'reward-dragon-legendary-05', rarity: 'legendary', name: '별빛 정원의 신탁여제', title: 'Empress Oracle of the Star Garden', src: 'assets/reward-cards-dragon/reward-dragon-legendary-05.png' },
];

export const RARITY_LABEL: Record<RewardRarity, string> = {
  common: '커먼',
  rare: '레어 ✦',
  legendary: '전설 ✦✦✦',
};

export const RARITY_COLOR: Record<RewardRarity, string> = {
  common: '#94a3b8',
  rare: '#60a5fa',
  legendary: '#fbbf24',
};

/** 중복 카드를 뽑았을 때 추가로 받는 XP */
export const DUPLICATE_XP = 10;

/**
 * 카드 뽑기 — 연속 출석일이 길수록 좋은 카드 확률이 올라간다.
 * 기본: 전설 5% / 레어 25%. 스트릭 1일당 전설 +0.5%p, 레어 +1%p (7일 상한).
 * (카드는 희귀 이벤트에서만 나오므로 등급 확률은 너그럽게)
 */
export function drawRewardCard(streakDays: number): RewardCardDef {
  const s = Math.min(Math.max(streakDays, 1), 7);
  const legendary = 0.05 + s * 0.005;
  const rare = 0.25 + s * 0.01;
  const roll = Math.random();
  const rarity: RewardRarity = roll < legendary ? 'legendary' : roll < legendary + rare ? 'rare' : 'common';
  const pool = REWARD_CARDS.filter((c) => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
