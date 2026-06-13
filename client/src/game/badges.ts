/** 배지(업적) 시스템 — 조건은 순수 함수, 획득 목록은 store에 저장.
 *  각 배지는 코드로 그리는 SVG 엠블럼(BadgeVisual)을 가진다. emoji는 토스트용 폴백. */

import type { BadgeVisual } from '../components/BadgeEmblem';

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
  /** 총괄평가 던전 90%↑ 통과 누적 횟수 */
  finalExamsPassed: number;
  /** 심화 탐험 클리어 누적 */
  challengeCleared: number;
  /** 명예의 시험(단원평가) 응시 누적 */
  examCount: number;
  /** 드래곤 먹이 준 횟수 */
  feedCount: number;
  /** 드래곤이 완전한 성체에 도달했는가 */
  dragonAdult: boolean;
  /** 복습(이전 학기) 스테이지 클리어 누적 */
  reviewCleared: number;
  /** 만보기 2000보 달성 누적일 */
  stepGoalDays: number;
}

export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  /** 희귀도: 1 브론즈 · 2 실버 · 3 골드 (UI 색상) */
  rarity: 1 | 2 | 3;
  /** 코드 렌더 엠블럼 디자인 */
  visual: BadgeVisual;
  earned: (s: BadgeStats) => boolean;
}

export const BADGES: BadgeDef[] = [
  // ── 진행(레슨) ──
  { id: 'first-step', name: '모험의 시작', desc: '첫 레슨을 완료했어요', emoji: '⚔️', rarity: 1,
    visual: { shape: 'banner', palette: 'emerald', glyph: 'sprout' }, earned: (s) => s.lessonsCompleted >= 1 },
  { id: 'lessons-25', name: '꾸준한 탐험가', desc: '레슨 25개 완료', emoji: '📘', rarity: 2,
    visual: { shape: 'banner', palette: 'emerald', glyph: 'book' }, earned: (s) => s.lessonsCompleted >= 25 },
  { id: 'lessons-100', name: '백 개의 발자국', desc: '레슨 100개 완료', emoji: '📚', rarity: 3,
    visual: { shape: 'banner', palette: 'gold', glyph: 'book', ring: true }, earned: (s) => s.lessonsCompleted >= 100 },

  // ── 콤보 ──
  { id: 'combo-5', name: '연속 베기', desc: '5문제 연속 정답', emoji: '🔥', rarity: 1,
    visual: { shape: 'starburst', palette: 'amber', glyph: 'flame' }, earned: (s) => s.bestCombo >= 5 },
  { id: 'combo-10', name: '폭풍의 검', desc: '10문제 연속 정답', emoji: '⚡', rarity: 2,
    visual: { shape: 'starburst', palette: 'rose', glyph: 'bolt' }, earned: (s) => s.bestCombo >= 10 },
  { id: 'combo-20', name: '무아지경', desc: '20문제 연속 정답', emoji: '🌪️', rarity: 3,
    visual: { shape: 'starburst', palette: 'gold', glyph: 'bolt', ring: true }, earned: (s) => s.bestCombo >= 20 },

  // ── 정답 수 ──
  { id: 'correct-100', name: '백전백승', desc: '100문제 정답', emoji: '💯', rarity: 1,
    visual: { shape: 'hexagon', palette: 'sky', glyph: 'sigma' }, earned: (s) => s.totalCorrect >= 100 },
  { id: 'correct-500', name: '수련의 달인', desc: '500문제 정답', emoji: '🥋', rarity: 2,
    visual: { shape: 'hexagon', palette: 'sky', glyph: 'target' }, earned: (s) => s.totalCorrect >= 500 },
  { id: 'correct-1000', name: '천 개의 검', desc: '1,000문제 정답', emoji: '🗡️', rarity: 3,
    visual: { shape: 'hexagon', palette: 'gold', glyph: 'sigma', ring: true }, earned: (s) => s.totalCorrect >= 1000 },
  { id: 'correct-3000', name: '무한의 탐구자', desc: '3,000문제 정답', emoji: '♾️', rarity: 3,
    visual: { shape: 'hexagon', palette: 'violet', glyph: 'infinity', ring: true }, earned: (s) => s.totalCorrect >= 3000 },

  // ── 연속 접속 ──
  { id: 'streak-3', name: '작은 불씨', desc: '3일 연속 접속', emoji: '🕯️', rarity: 1,
    visual: { shape: 'roundel', palette: 'bronze', glyph: 'flame' }, earned: (s) => s.streakDays >= 3 },
  { id: 'streak-7', name: '일주일의 불꽃', desc: '7일 연속 접속', emoji: '🔥', rarity: 2,
    visual: { shape: 'roundel', palette: 'silver', glyph: 'flame', ring: true }, earned: (s) => s.streakDays >= 7 },
  { id: 'streak-30', name: '꺼지지 않는 화염', desc: '30일 연속 접속', emoji: '☄️', rarity: 3,
    visual: { shape: 'roundel', palette: 'gold', glyph: 'flame', ring: true }, earned: (s) => s.streakDays >= 30 },
  { id: 'streak-100', name: '백일의 약속', desc: '100일 연속 접속', emoji: '🌟', rarity: 3,
    visual: { shape: 'roundel', palette: 'violet', glyph: 'sun', ring: true }, earned: (s) => s.streakDays >= 100 },

  // ── 출석 누적 ──
  { id: 'attend-10', name: '개근 용사', desc: '총 10일 출석', emoji: '📅', rarity: 1,
    visual: { shape: 'roundel', palette: 'emerald', glyph: 'sun' }, earned: (s) => s.attendanceDays >= 10 },
  { id: 'attend-50', name: '성실의 수호자', desc: '총 50일 출석', emoji: '🏛️', rarity: 3,
    visual: { shape: 'roundel', palette: 'gold', glyph: 'sun', ring: true }, earned: (s) => s.attendanceDays >= 50 },
  { id: 'attend-100', name: '백일의 수호자', desc: '총 100일 출석', emoji: '🎖️', rarity: 3,
    visual: { shape: 'roundel', palette: 'violet', glyph: 'medal', ring: true }, earned: (s) => s.attendanceDays >= 100 },

  // ── 보스 봉인 ──
  { id: 'boss-1', name: '첫 봉인', desc: '보스 1마리 봉인', emoji: '🔮', rarity: 1,
    visual: { shape: 'shield', palette: 'bronze', glyph: 'sword' }, earned: (s) => s.bossesCleared >= 1 },
  { id: 'boss-6', name: '봉인술사', desc: '보스 6마리 봉인', emoji: '🛡️', rarity: 2,
    visual: { shape: 'shield', palette: 'silver', glyph: 'shield' }, earned: (s) => s.bossesCleared >= 6 },
  { id: 'boss-12', name: '한 학기의 정복자', desc: '보스 12마리 봉인', emoji: '⚔️', rarity: 3,
    visual: { shape: 'shield', palette: 'gold', glyph: 'crown', ring: true }, earned: (s) => s.bossesCleared >= 12 },
  { id: 'boss-24', name: '용을 다루는 자', desc: '보스 24마리 봉인', emoji: '🐉', rarity: 3,
    visual: { shape: 'shield', palette: 'violet', glyph: 'dragon', ring: true }, earned: (s) => s.bossesCleared >= 24 },
  { id: 'boss-48', name: '전설의 봉인가', desc: '모든 보스 봉인', emoji: '👑', rarity: 3,
    visual: { shape: 'shield', palette: 'indigo', glyph: 'crown', ring: true }, earned: (s) => s.bossesCleared >= 48 },

  // ── 완벽 클리어 ──
  { id: 'perfect-5', name: '완벽주의자', desc: '하트 무손실 클리어 5회', emoji: '💎', rarity: 2,
    visual: { shape: 'gem', palette: 'sky', glyph: 'gem' }, earned: (s) => s.perfectLessons >= 5 },
  { id: 'perfect-25', name: '무결점의 현자', desc: '하트 무손실 클리어 25회', emoji: '✨', rarity: 3,
    visual: { shape: 'gem', palette: 'violet', glyph: 'sparkle', ring: true }, earned: (s) => s.perfectLessons >= 25 },

  // ── 메달 ──
  { id: 'card-10', name: '메달 수집가', desc: '인증 메달 10개 모으기', emoji: '🏅', rarity: 2,
    visual: { shape: 'roundel', palette: 'silver', glyph: 'medal' }, earned: (s) => s.cardCount >= 10 },
  { id: 'card-25', name: '명예의 전당', desc: '인증 메달 25개 모으기', emoji: '🏆', rarity: 3,
    visual: { shape: 'roundel', palette: 'gold', glyph: 'medal', ring: true }, earned: (s) => s.cardCount >= 25 },

  // ── 레벨 ──
  { id: 'level-10', name: '베테랑 모험가', desc: '레벨 10 달성', emoji: '⭐', rarity: 2,
    visual: { shape: 'starburst', palette: 'violet', glyph: 'star' }, earned: (s) => s.level >= 10 },
  { id: 'level-20', name: '별을 모으는 자', desc: '레벨 20 달성', emoji: '🌠', rarity: 3,
    visual: { shape: 'starburst', palette: 'gold', glyph: 'crown', ring: true }, earned: (s) => s.level >= 20 },
  { id: 'level-30', name: '하늘의 영웅', desc: '레벨 30 달성', emoji: '👑', rarity: 3,
    visual: { shape: 'starburst', palette: 'indigo', glyph: 'crown', ring: true }, earned: (s) => s.level >= 30 },

  // ── 심화 탐험 ──
  { id: 'challenge-1', name: '심연의 첫걸음', desc: '심화 탐험 1회 클리어', emoji: '🌌', rarity: 2,
    visual: { shape: 'gem', palette: 'violet', glyph: 'sparkle' }, earned: (s) => s.challengeCleared >= 1 },
  { id: 'challenge-10', name: '심연의 정복자', desc: '심화 탐험 10회 클리어', emoji: '💠', rarity: 3,
    visual: { shape: 'gem', palette: 'indigo', glyph: 'infinity', ring: true }, earned: (s) => s.challengeCleared >= 10 },

  // ── 단원평가(명예의 시험장) ──
  { id: 'exam-5', name: '시험장의 도전자', desc: '단원평가 5회 도전', emoji: '🏟️', rarity: 2,
    visual: { shape: 'hexagon', palette: 'amber', glyph: 'target' }, earned: (s) => s.examCount >= 5 },
  { id: 'exam-20', name: '시험장의 달인', desc: '단원평가 20회 도전', emoji: '🎯', rarity: 3,
    visual: { shape: 'hexagon', palette: 'gold', glyph: 'compass', ring: true }, earned: (s) => s.examCount >= 20 },

  // ── 학기말 총괄평가 ──
  { id: 'final-1', name: '총괄의 증표', desc: '총괄평가 던전 1회 통과(90점↑)', emoji: '🏰', rarity: 2,
    visual: { shape: 'banner', palette: 'gold', glyph: 'castle' }, earned: (s) => s.finalExamsPassed >= 1 },
  { id: 'final-5', name: '학기의 정복자', desc: '총괄평가 던전 5회 통과', emoji: '👑', rarity: 3,
    visual: { shape: 'banner', palette: 'indigo', glyph: 'castle', ring: true }, earned: (s) => s.finalExamsPassed >= 5 },

  // ── 만보기(운동) ──
  { id: 'steps-first', name: '첫 만보 모험', desc: '하루 2000보를 걸었어요', emoji: '👟', rarity: 1,
    visual: { shape: 'roundel', palette: 'emerald', glyph: 'sprout' }, earned: (s) => s.stepGoalDays >= 1 },
  { id: 'steps-7', name: '아침 산책가', desc: '2000보 7일 달성', emoji: '🏃', rarity: 2,
    visual: { shape: 'roundel', palette: 'sky', glyph: 'sun' }, earned: (s) => s.stepGoalDays >= 7 },
  { id: 'steps-30', name: '운동장의 바람', desc: '2000보 30일 달성', emoji: '🌬️', rarity: 3,
    visual: { shape: 'roundel', palette: 'gold', glyph: 'sun', ring: true }, earned: (s) => s.stepGoalDays >= 30 },

  // ── 복습(시간여행) ──
  { id: 'time-traveler', name: '시간여행자', desc: '복습으로 이전 학기를 탐험했어요', emoji: '⏳', rarity: 1,
    visual: { shape: 'hexagon', palette: 'violet', glyph: 'compass' }, earned: (s) => s.reviewCleared >= 1 },
  { id: 'time-traveler-20', name: '시간의 수호자', desc: '복습 20회 — 기초를 단단히', emoji: '⌛', rarity: 3,
    visual: { shape: 'hexagon', palette: 'indigo', glyph: 'compass', ring: true }, earned: (s) => s.reviewCleared >= 20 },

  // ── 드래곤 ──
  { id: 'feed-50', name: '다정한 조련사', desc: '드래곤에게 먹이 50번 주기', emoji: '🍎', rarity: 2,
    visual: { shape: 'roundel', palette: 'rose', glyph: 'sprout' }, earned: (s) => s.feedCount >= 50 },
  { id: 'dragon-grow', name: '드래곤 마스터', desc: '드래곤을 완전한 성체로 키우기', emoji: '🐲', rarity: 3,
    visual: { shape: 'roundel', palette: 'emerald', glyph: 'dragon', ring: true }, earned: (s) => s.dragonAdult },
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
