/** 배지(업적) 시스템 — 조건은 순수 함수, 획득 목록은 store에 저장 */

export interface BadgeStats {
  totalCorrect: number;
  streakDays: number;
  bestCombo: number;
  perfectLessons: number;
  bossesCleared: number;
  cardCount: number;
  level: number;
  attendanceDays: number;
  lessonsCompleted: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  /** 희귀도: 1 브론즈 · 2 실버 · 3 골드 (UI 색상) */
  rarity: 1 | 2 | 3;
  earned: (s: BadgeStats) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: 'first-step', name: '모험의 시작', desc: '첫 레슨을 완료했어요', emoji: '⚔️', rarity: 1, earned: (s) => s.lessonsCompleted >= 1 },
  { id: 'combo-5', name: '연속 베기', desc: '5문제 연속 정답', emoji: '🔥', rarity: 1, earned: (s) => s.bestCombo >= 5 },
  { id: 'combo-10', name: '폭풍의 검', desc: '10문제 연속 정답', emoji: '⚡', rarity: 2, earned: (s) => s.bestCombo >= 10 },
  { id: 'combo-20', name: '무아지경', desc: '20문제 연속 정답', emoji: '🌪️', rarity: 3, earned: (s) => s.bestCombo >= 20 },
  { id: 'correct-100', name: '백전백승', desc: '100문제 정답', emoji: '💯', rarity: 1, earned: (s) => s.totalCorrect >= 100 },
  { id: 'correct-500', name: '수련의 달인', desc: '500문제 정답', emoji: '🥋', rarity: 2, earned: (s) => s.totalCorrect >= 500 },
  { id: 'correct-1000', name: '천 개의 검', desc: '1,000문제 정답', emoji: '🗡️', rarity: 3, earned: (s) => s.totalCorrect >= 1000 },
  { id: 'streak-3', name: '작은 불씨', desc: '3일 연속 접속', emoji: '🕯️', rarity: 1, earned: (s) => s.streakDays >= 3 },
  { id: 'streak-7', name: '일주일의 불꽃', desc: '7일 연속 접속', emoji: '🔥', rarity: 2, earned: (s) => s.streakDays >= 7 },
  { id: 'streak-30', name: '꺼지지 않는 화염', desc: '30일 연속 접속', emoji: '☄️', rarity: 3, earned: (s) => s.streakDays >= 30 },
  { id: 'attend-10', name: '개근 용사', desc: '총 10일 출석', emoji: '📅', rarity: 1, earned: (s) => s.attendanceDays >= 10 },
  { id: 'attend-50', name: '성실의 수호자', desc: '총 50일 출석', emoji: '🏛️', rarity: 3, earned: (s) => s.attendanceDays >= 50 },
  { id: 'boss-1', name: '첫 사냥', desc: '보스 1마리 격파', emoji: '🏹', rarity: 1, earned: (s) => s.bossesCleared >= 1 },
  { id: 'boss-6', name: '보스 헌터', desc: '보스 6마리 격파', emoji: '🛡️', rarity: 2, earned: (s) => s.bossesCleared >= 6 },
  { id: 'boss-12', name: '전설의 사냥꾼', desc: '모든 보스 격파', emoji: '👑', rarity: 3, earned: (s) => s.bossesCleared >= 12 },
  { id: 'perfect-5', name: '완벽주의자', desc: '하트 무손실 클리어 5회', emoji: '💎', rarity: 2, earned: (s) => s.perfectLessons >= 5 },
  { id: 'card-10', name: '카드 수집가', desc: '인증카드 10장 모으기', emoji: '🃏', rarity: 2, earned: (s) => s.cardCount >= 10 },
  { id: 'level-10', name: '베테랑 모험가', desc: '레벨 10 달성', emoji: '🦊', rarity: 2, earned: (s) => s.level >= 10 },
];

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}

/** 새로 달성한 배지 id 목록 */
export function newlyEarned(stats: BadgeStats, owned: string[]): BadgeDef[] {
  return BADGES.filter((b) => !owned.includes(b.id) && b.earned(stats));
}

/** 출석 보상: 연속 접속일에 따라 커지는 XP (7일 주기로 상한) */
export function dailyRewardXp(streakDays: number): number {
  const day = Math.min(Math.max(streakDays, 1), 7);
  return [0, 10, 15, 20, 25, 30, 40, 50][day];
}

/** 콤보 마일스톤 보너스 XP (해당 콤보 도달 순간 1회) */
export const COMBO_BONUS: Record<number, number> = { 5: 5, 10: 15, 20: 30 };
