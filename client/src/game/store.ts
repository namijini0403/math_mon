/** 게임 저장소 — zustand + localStorage persist. 서버 동기화는 베스트에포트(오프라인 허용) */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { levelFromXp, tierForLevel, XP_MISSION_REWARD } from './xp';
import { emptyDaily, todayStr, type DailyCounters } from './missions';
import { dailyRewardXp, newlyEarned, type BadgeDef, type BadgeStats } from './badges';
import { pushProgress } from '../api';

export interface EarnedCard {
  /** 'level' = 레벨업 카드, 'boss' = 보스 격파 카드 (구버전 저장은 undefined → level) */
  kind?: 'level' | 'boss';
  tier: number;
  level: number;
  date: string; // YYYY-MM-DD
  /** kind='boss'일 때 스테이지 id (예: 's1-boss') */
  bossId?: string;
}

export interface SkillStat {
  c: number; // 정답
  w: number; // 오답
}

interface GameState {
  nickname: string | null;
  classCode: string | null;
  studentId: string | null;
  xp: number;
  stages: Record<string, { stars: number }>;
  skillStats: Record<string, SkillStat>;
  cards: EarnedCard[];
  streak: { last: string; count: number };
  daily: DailyCounters;
  /** 최근 틀린 스킬 큐 — retrieval 재출제용 (최대 8개) */
  recentWrong: string[];
  /** 출석: 마지막 보상 수령일 + 누적 출석일 */
  attendance: { lastClaim: string; totalDays: number };
  /** 획득한 배지 id */
  badges: string[];
  /** 통산 기록 (배지 조건용) */
  records: { bestCombo: number; perfectLessons: number; lessonsCompleted: number };

  setProfile: (p: { nickname: string; classCode?: string; studentId?: string }) => void;
  recordAnswer: (skillId: string, correct: boolean) => void;
  /** XP 추가 + 레벨업 카드 발급. 새로 얻은 카드 목록 반환 */
  addXp: (amount: number) => EarnedCard[];
  /** 보스 격파 카드 발급 */
  addBossCard: (bossStageId: string) => EarnedCard;
  completeStage: (stageId: string, stars: number, perfect: boolean) => void;
  /** 레슨에서 도달한 최고 콤보 보고 (배지 조건) */
  reportCombo: (combo: number) => void;
  /** 오늘 출석 보상 수령. 이미 받았으면 null, 아니면 보상 내역 반환 */
  claimDailyReward: () => { xp: number; day: number; cards: EarnedCard[] } | null;
  /** 배지 조건 재평가 — 새로 얻은 배지 반환 */
  evaluateBadges: () => BadgeDef[];
  claimMission: (missionId: number) => EarnedCard[];
  /** 연습 모드 등에서 수동 서버 동기화 */
  syncNow: () => void;
  resetAll: () => void;
}

/** 날짜가 바뀌었으면 일일 카운터 리셋 */
function freshDaily(d: DailyCounters): DailyCounters {
  return d.date === todayStr() ? d : emptyDaily();
}

function grantLevelUpCards(prevXp: number, nextXp: number): EarnedCard[] {
  const prev = levelFromXp(prevXp).level;
  const next = levelFromXp(nextXp).level;
  const cards: EarnedCard[] = [];
  for (let lv = prev + 1; lv <= next; lv++) {
    const tier = tierForLevel(lv);
    if (tier) cards.push({ tier: tier.tier, level: lv, date: todayStr() });
  }
  return cards;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      nickname: null,
      classCode: null,
      studentId: null,
      xp: 0,
      stages: {},
      skillStats: {},
      cards: [],
      streak: { last: '', count: 0 },
      daily: emptyDaily(),
      recentWrong: [],
      attendance: { lastClaim: '', totalDays: 0 },
      badges: [],
      records: { bestCombo: 0, perfectLessons: 0, lessonsCompleted: 0 },

      setProfile: ({ nickname, classCode, studentId }) =>
        set({ nickname, classCode: classCode ?? null, studentId: studentId ?? null }),

      recordAnswer: (skillId, correct) =>
        set((s) => {
          const stat = s.skillStats[skillId] ?? { c: 0, w: 0 };
          const daily = freshDaily(s.daily);
          // 틀리면 retrieval 큐에 추가, 맞히면 큐에서 하나 제거 (졸업)
          let recentWrong = s.recentWrong;
          if (correct) {
            const i = recentWrong.indexOf(skillId);
            if (i >= 0) recentWrong = [...recentWrong.slice(0, i), ...recentWrong.slice(i + 1)];
          } else if (!recentWrong.includes(skillId)) {
            recentWrong = [skillId, ...recentWrong].slice(0, 8);
          }
          return {
            skillStats: {
              ...s.skillStats,
              [skillId]: { c: stat.c + (correct ? 1 : 0), w: stat.w + (correct ? 0 : 1) },
            },
            daily: { ...daily, solved: daily.solved + (correct ? 1 : 0) },
            recentWrong,
          };
        }),

      addXp: (amount) => {
        const prevXp = get().xp;
        const nextXp = prevXp + amount;
        const newCards = grantLevelUpCards(prevXp, nextXp);
        set((s) => ({ xp: nextXp, cards: [...s.cards, ...newCards] }));
        return newCards;
      },

      addBossCard: (bossStageId) => {
        const card: EarnedCard = {
          kind: 'boss',
          tier: 0,
          bossId: bossStageId,
          level: levelFromXp(get().xp).level,
          date: todayStr(),
        };
        set((s) => ({ cards: [...s.cards, card] }));
        return card;
      },

      completeStage: (stageId, stars, perfect) => {
        set((s) => {
          const today = todayStr();
          const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv');
          const streak =
            s.streak.last === today
              ? s.streak
              : { last: today, count: s.streak.last === yesterday ? s.streak.count + 1 : 1 };
          const daily = freshDaily(s.daily);
          const prev = s.stages[stageId]?.stars ?? 0;
          return {
            stages: { ...s.stages, [stageId]: { stars: Math.max(prev, stars) } },
            streak,
            daily: {
              ...daily,
              lessons: daily.lessons + 1,
              perfect: daily.perfect + (perfect ? 1 : 0),
            },
            records: {
              ...s.records,
              lessonsCompleted: s.records.lessonsCompleted + 1,
              perfectLessons: s.records.perfectLessons + (perfect ? 1 : 0),
            },
          };
        });
        // 서버 동기화 (실패해도 게임 진행에 영향 없음)
        const s = get();
        void pushProgress(s);
      },

      reportCombo: (combo) =>
        set((s) => ({
          records: { ...s.records, bestCombo: Math.max(s.records.bestCombo, combo) },
        })),

      claimDailyReward: () => {
        const s = get();
        const today = todayStr();
        if (s.attendance.lastClaim === today) return null;
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv');
        // 출석 자체도 스트릭을 이어준다 (레슨을 안 해도 접속 보상)
        const streak =
          s.streak.last === today
            ? s.streak
            : { last: today, count: s.streak.last === yesterday ? s.streak.count + 1 : 1 };
        set({
          attendance: { lastClaim: today, totalDays: s.attendance.totalDays + 1 },
          streak,
        });
        const xp = dailyRewardXp(streak.count);
        const cards = get().addXp(xp);
        return { xp, day: streak.count, cards };
      },

      evaluateBadges: () => {
        const s = get();
        const stats: BadgeStats = {
          totalCorrect: Object.values(s.skillStats).reduce((a, v) => a + v.c, 0),
          streakDays: s.streak.count,
          bestCombo: s.records.bestCombo,
          perfectLessons: s.records.perfectLessons,
          bossesCleared: Object.keys(s.stages).filter(
            (id) => id.endsWith('-boss') && (s.stages[id]?.stars ?? 0) > 0,
          ).length,
          cardCount: s.cards.length,
          level: levelFromXp(s.xp).level,
          attendanceDays: s.attendance.totalDays,
          lessonsCompleted: s.records.lessonsCompleted,
        };
        const earned = newlyEarned(stats, s.badges);
        if (earned.length > 0) {
          set({ badges: [...s.badges, ...earned.map((b) => b.id)] });
        }
        return earned;
      },

      syncNow: () => {
        void pushProgress(get());
      },

      claimMission: (missionId) => {
        const s = get();
        const daily = freshDaily(s.daily);
        if (daily.claimed.includes(missionId)) return [];
        set({ daily: { ...daily, claimed: [...daily.claimed, missionId] } });
        return get().addXp(XP_MISSION_REWARD);
      },

      resetAll: () =>
        set({
          nickname: null,
          classCode: null,
          studentId: null,
          xp: 0,
          stages: {},
          skillStats: {},
          cards: [],
          streak: { last: '', count: 0 },
          daily: emptyDaily(),
          recentWrong: [],
          attendance: { lastClaim: '', totalDays: 0 },
          badges: [],
          records: { bestCombo: 0, perfectLessons: 0, lessonsCompleted: 0 },
        }),
    }),
    { name: 'math-mon-save' },
  ),
);
