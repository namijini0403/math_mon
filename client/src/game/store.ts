/** 게임 저장소 — zustand + localStorage persist. 서버 동기화는 베스트에포트(오프라인 허용) */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { levelFromXp, tierForLevel, XP_MISSION_REWARD } from './xp';
import { emptyDaily, todayStr, type DailyCounters } from './missions';
import { dailyRewardXp, newlyEarned, type BadgeDef, type BadgeStats } from './badges';
import { drawRewardCard, DUPLICATE_XP, type RewardCardDef } from './rewardCards';
import {
  AFFINITY_SOURCES,
  DRAGON_ITEMS,
  decideAdultForm,
  emptyDragon,
  FRUITS,
  getFruit,
  GP_REWARDS,
  currentFullness,
  stageForGp,
  topAffinity,
  type Affinity,
  type DragonItemDef,
  type DragonState,
} from './dragon';
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
  /** 모은 출석 보상 카드 id (중복 없음) */
  rewardCards: string[];
  /** 통산 기록 (배지 조건용) */
  records: { bestCombo: number; perfectLessons: number; lessonsCompleted: number };
  /** 드래곤 육성 상태 */
  dragon: DragonState;
  /** 연습 모드 누적 (10문제 = 1세트) */
  practice: { basicAnswered: number; wordAnswered: number; basicSets: number; wordSets: number };

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
  claimDailyReward: () => {
    xp: number;
    day: number;
    cards: EarnedCard[];
    drawn: RewardCardDef;
    duplicate: boolean;
  } | null;
  /** 배지 조건 재평가 — 새로 얻은 배지 반환 */
  evaluateBadges: () => BadgeDef[];
  /** 드래곤 성장 포인트·속성·과일 지급 (내부 공용) */
  dragonGain: (gain: {
    gp?: number;
    affinity?: Partial<Record<Affinity, number>>;
    fruits?: number;
  }) => void;
  /** 먹이 주기. 성공 시 true (과일이 없으면 false) */
  feedDragon: (fruitId: string) => boolean;
  /** 연습 1문제 기록 — 10문제마다 세트 완성 (세트 완성 시 'basic'|'word' 반환) */
  addPracticeAnswer: (mode: 'basic' | 'word') => 'basic' | 'word' | null;
  /** 드래곤 아이템 조건 재평가 — 새로 얻은 아이템 반환 (아이템당 +20 GP) */
  evaluateDragonItems: () => DragonItemDef[];
  /** 보물 카드 1장 뽑기 (보스 격파 보상용). 중복이면 +10 XP */
  drawTreasureCard: () => { drawn: RewardCardDef; duplicate: boolean };
  claimMission: (missionId: number) => EarnedCard[];
  /** 연습 모드 등에서 수동 서버 동기화 */
  syncNow: () => void;
  /** [교사용] 정답 미리보기 표시 여부 */
  showAnswers: boolean;
  toggleShowAnswers: () => void;
  /** [교사용] 모든 스테이지 잠금 해제 (체험·시연용) */
  devUnlockAll: (stageIds: string[]) => void;
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
      rewardCards: [],
      records: { bestCombo: 0, perfectLessons: 0, lessonsCompleted: 0 },
      dragon: emptyDragon(),
      practice: { basicAnswered: 0, wordAnswered: 0, basicSets: 0, wordSets: 0 },

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
        // 드래곤 성장: 보스는 크게, 레슨은 보통 + 과일 보상
        const isBoss = stageId.endsWith('-boss');
        get().dragonGain({
          gp: isBoss ? GP_REWARDS.boss : GP_REWARDS.lesson,
          fruits: isBoss ? 2 : 1,
          affinity: {
            ...(isBoss ? AFFINITY_SOURCES.boss : {}),
            ...(perfect ? AFFINITY_SOURCES.perfectLesson : {}),
          },
        });
        get().evaluateDragonItems();
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
        // 보상 카드 뽑기 — 중복이면 카드 대신 보너스 XP
        const drawn = drawRewardCard(streak.count);
        const duplicate = s.rewardCards.includes(drawn.id);
        set({
          attendance: { lastClaim: today, totalDays: s.attendance.totalDays + 1 },
          streak,
          rewardCards: duplicate ? s.rewardCards : [...s.rewardCards, drawn.id],
        });
        const xp = dailyRewardXp(streak.count) + (duplicate ? DUPLICATE_XP : 0);
        const cards = get().addXp(xp);
        get().dragonGain({ gp: GP_REWARDS.attendance, affinity: AFFINITY_SOURCES.attendance });
        get().evaluateDragonItems();
        return { xp, day: streak.count, cards, drawn, duplicate };
      },

      drawTreasureCard: () => {
        const s = get();
        const drawn = drawRewardCard(s.streak.count);
        const duplicate = s.rewardCards.includes(drawn.id);
        if (duplicate) {
          get().addXp(DUPLICATE_XP);
        } else {
          set({ rewardCards: [...s.rewardCards, drawn.id] });
        }
        return { drawn, duplicate };
      },

      dragonGain: ({ gp = 0, affinity = {}, fruits = 0 }) => {
        set((s) => {
          const d = s.dragon;
          const affinities = { ...d.affinities };
          for (const [k, v] of Object.entries(affinity)) {
            affinities[k as Affinity] += v ?? 0;
          }
          const newFruits = { ...d.fruits };
          for (let i = 0; i < fruits; i++) {
            const f = FRUITS[Math.floor(Math.random() * FRUITS.length)];
            newFruits[f.id] = (newFruits[f.id] ?? 0) + 1;
          }
          const gpTotal = d.gp + gp;
          let adult = d.adult;
          // 성체 도달 순간 속성·형태 확정 (1회)
          if (!adult && stageForGp(gpTotal) >= 4) {
            adult = {
              affinity: topAffinity(affinities),
              form: decideAdultForm(s.rewardCards.length),
            };
          }
          return { dragon: { ...d, gp: gpTotal, affinities, fruits: newFruits, adult } };
        });
      },

      feedDragon: (fruitId) => {
        const s = get();
        const fruit = getFruit(fruitId);
        const have = s.dragon.fruits[fruitId] ?? 0;
        if (!fruit || have <= 0) return false;
        const today = todayStr();
        const now = currentFullness(s.dragon, today);
        set({
          dragon: {
            ...s.dragon,
            fruits: { ...s.dragon.fruits, [fruitId]: have - 1 },
            lastFed: today,
            fullnessAtFed: Math.min(100, now + fruit.fill),
            feedCount: s.dragon.feedCount + 1,
          },
        });
        get().dragonGain({
          gp: GP_REWARDS.feed,
          affinity: { ...AFFINITY_SOURCES.feed, [fruit.affinity]: 1 },
        });
        return true;
      },

      addPracticeAnswer: (mode) => {
        const s = get();
        const p = { ...s.practice };
        let completed: 'basic' | 'word' | null = null;
        if (mode === 'basic') {
          p.basicAnswered += 1;
          if (p.basicAnswered % 10 === 0) {
            p.basicSets += 1;
            completed = 'basic';
          }
        } else {
          p.wordAnswered += 1;
          if (p.wordAnswered % 10 === 0) {
            p.wordSets += 1;
            completed = 'word';
          }
        }
        set({ practice: p });
        if (completed) {
          get().dragonGain({
            gp: GP_REWARDS.practiceSet,
            affinity: completed === 'basic' ? AFFINITY_SOURCES.basicSet : AFFINITY_SOURCES.wordSet,
          });
        }
        return completed;
      },

      evaluateDragonItems: () => {
        const s = get();
        const stats = {
          lessonsCompleted: s.records.lessonsCompleted,
          bossesCleared: Object.keys(s.stages).filter(
            (id) => id.endsWith('-boss') && (s.stages[id]?.stars ?? 0) > 0,
          ).length,
          basicSets: s.practice.basicSets,
          wordSets: s.practice.wordSets,
          attendanceDays: s.attendance.totalDays,
          feedCount: s.dragon.feedCount,
          rewardCardCount: s.rewardCards.length,
        };
        const earned = DRAGON_ITEMS.filter((it) => !s.dragon.items.includes(it.id) && it.earned(stats));
        if (earned.length > 0) {
          set({
            dragon: { ...get().dragon, items: [...get().dragon.items, ...earned.map((i) => i.id)] },
          });
          get().dragonGain({ gp: GP_REWARDS.item * earned.length });
        }
        return earned;
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

      showAnswers: false,
      toggleShowAnswers: () => set((s) => ({ showAnswers: !s.showAnswers })),

      devUnlockAll: (stageIds) =>
        set((s) => ({
          stages: {
            ...Object.fromEntries(stageIds.map((id) => [id, { stars: 1 }])),
            ...s.stages,
          },
        })),

      claimMission: (missionId) => {
        const s = get();
        const daily = freshDaily(s.daily);
        if (daily.claimed.includes(missionId)) return [];
        set({ daily: { ...daily, claimed: [...daily.claimed, missionId] } });
        get().dragonGain({ gp: GP_REWARDS.mission, fruits: 1 });
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
          rewardCards: [],
          records: { bestCombo: 0, perfectLessons: 0, lessonsCompleted: 0 },
          dragon: emptyDragon(),
          practice: { basicAnswered: 0, wordAnswered: 0, basicSets: 0, wordSets: 0 },
        }),
    }),
    { name: 'math-mon-save' },
  ),
);
