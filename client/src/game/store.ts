/** 게임 저장소 — zustand + localStorage persist. 서버 동기화는 베스트에포트(오프라인 허용) */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { levelFromXp, tierForLevel, XP_MISSION_REWARD } from './xp';
import { emptyDaily, todayStr, type DailyCounters } from './missions';
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

  setProfile: (p: { nickname: string; classCode?: string; studentId?: string }) => void;
  recordAnswer: (skillId: string, correct: boolean) => void;
  /** XP 추가 + 레벨업 카드 발급. 새로 얻은 카드 목록 반환 */
  addXp: (amount: number) => EarnedCard[];
  /** 보스 격파 카드 발급 */
  addBossCard: (bossStageId: string) => EarnedCard;
  completeStage: (stageId: string, stars: number, perfect: boolean) => void;
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
          };
        });
        // 서버 동기화 (실패해도 게임 진행에 영향 없음)
        const s = get();
        void pushProgress(s);
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
        }),
    }),
    { name: 'math-mon-save' },
  ),
);
