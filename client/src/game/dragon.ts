/**
 * 드래곤 육성 시스템 (다마고치 + 프린세스메이커)
 * - 게임 시작 시 알 1개. 학습 활동으로 성장 포인트(GP)를 모아 5단계로 성장.
 * - 성체(완전체)는 대략 "한 학기 6단원 완주 + 연산 연습 6세트 + 문장제 6세트" 분량.
 * - 활동·먹이의 속성 가중치가 쌓여 성체의 속성(해/달/별/숲)과 모습(인간형/드래곤형)이 결정된다.
 * - 매일 안 들어오면 배고파짐 (퇴화·죽음은 없음 — 슬퍼하기만 한다).
 */

export type Affinity = 'sun' | 'moon' | 'star' | 'forest';

export const AFFINITY_INFO: Record<
  Affinity,
  { name: string; emoji: string; color: string; adultHuman: string; adultDragon: string; desc: string }
> = {
  sun: {
    name: '태양', emoji: '☀️', color: '#f59e0b',
    adultHuman: '태양의 기사단장', adultDragon: '황금 태양룡',
    desc: '보스를 많이 물리친 용감한 모험가의 길',
  },
  moon: {
    name: '달', emoji: '🌙', color: '#a78bfa',
    adultHuman: '달빛 대마법사', adultDragon: '은빛 달룡',
    desc: '문장제를 깊이 생각한 지혜로운 현자의 길',
  },
  star: {
    name: '별', emoji: '⭐', color: '#60a5fa',
    adultHuman: '별의 점성술사', adultDragon: '푸른 별룡',
    desc: '연산을 갈고닦은 정확한 탐구자의 길',
  },
  forest: {
    name: '숲', emoji: '🌿', color: '#34d399',
    adultHuman: '숲의 수호자', adultDragon: '비취 숲룡',
    desc: '매일 꾸준히 돌본 성실한 수호자의 길',
  },
};

/** 성장 단계 */
export const DRAGON_STAGES = [
  { stage: 0, name: '신비한 알', emoji: '🥚', minGp: 0 },
  { stage: 1, name: '금이 간 알', emoji: '🐣', minGp: 50 },
  { stage: 2, name: '아기 드래곤', emoji: '🐲', minGp: 120 },
  { stage: 3, name: '어린 드래곤', emoji: '🐉', minGp: 300 },
  { stage: 4, name: '완전한 성체', emoji: '✨', minGp: 600 },
] as const;

export function stageForGp(gp: number): number {
  let s = 0;
  for (const st of DRAGON_STAGES) if (gp >= st.minGp) s = st.stage;
  return s;
}

/** 활동별 성장 포인트 */
export const GP_REWARDS = {
  lesson: 10,
  boss: 40,
  practiceSet: 15, // 연습 10문제 = 1세트
  mission: 5,
  attendance: 5,
  item: 20, // 아이템 획득 보너스
  feed: 2,
} as const;

/** 활동별 속성 가중치 */
export const AFFINITY_SOURCES: Record<string, Partial<Record<Affinity, number>>> = {
  boss: { sun: 3 },
  perfectLesson: { star: 2 },
  basicSet: { star: 3 },
  wordSet: { moon: 3 },
  attendance: { forest: 2 },
  feed: { forest: 1 },
};

/** 먹이 과일 — 미션·레슨 보상. 먹이면 배부름 + 해당 속성 약간 상승 */
export interface FruitDef {
  id: string;
  name: string;
  emoji: string;
  affinity: Affinity;
  fill: number; // 배부름 회복량
}

export const FRUITS: FruitDef[] = [
  { id: 'sun-apple', name: '해사과', emoji: '🍎', affinity: 'sun', fill: 30 },
  { id: 'moon-grape', name: '달이슬 포도', emoji: '🍇', affinity: 'moon', fill: 30 },
  { id: 'star-berry', name: '별열매', emoji: '⭐', affinity: 'star', fill: 30 },
  { id: 'forest-melon', name: '숲수박', emoji: '🍉', affinity: 'forest', fill: 30 },
];

export function getFruit(id: string): FruitDef | undefined {
  return FRUITS.find((f) => f.id === id);
}

/** 육성 아이템 — 마일스톤 달성 시 획득, 각각 1회 GP 보너스 */
export interface DragonItemDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  /** 획득 조건 설명 (UI 표시용) */
  hint: string;
  earned: (s: DragonItemStats) => boolean;
}

export interface DragonItemStats {
  lessonsCompleted: number;
  bossesCleared: number;
  basicSets: number;
  wordSets: number;
  attendanceDays: number;
  feedCount: number;
  rewardCardCount: number;
}

export const DRAGON_ITEMS: DragonItemDef[] = [
  { id: 'incubator', name: '드래곤 부화기', emoji: '🪺', desc: '알을 따뜻하게 품어 주는 마법 둥지', hint: '첫 레슨을 완료하면', earned: (s) => s.lessonsCompleted >= 1 },
  { id: 'warm-lamp', name: '온기의 랜턴', emoji: '🏮', desc: '알에서 콩콩 소리가 들리기 시작해요', hint: '레슨 5개를 완료하면', earned: (s) => s.lessonsCompleted >= 5 },
  { id: 'first-meal', name: '아기 수저', emoji: '🥄', desc: '아기 드래곤의 첫 식사 도구', hint: '먹이를 3번 주면', earned: (s) => s.feedCount >= 3 },
  { id: 'star-mobile', name: '별빛 모빌', emoji: '🌠', desc: '연산의 별이 빙글빙글 도는 모빌', hint: '기초 연산 연습 3세트를 마치면', earned: (s) => s.basicSets >= 3 },
  { id: 'story-book', name: '이야기 그림책', emoji: '📖', desc: '드래곤이 가장 좋아하는 잠자리 동화', hint: '문장제 연습 3세트를 마치면', earned: (s) => s.wordSets >= 3 },
  { id: 'brave-scale', name: '용기의 비늘', emoji: '🛡️', desc: '첫 보스를 이긴 기념 비늘', hint: '보스를 1마리 물리치면', earned: (s) => s.bossesCleared >= 1 },
  { id: 'cloud-saddle', name: '구름 안장', emoji: '☁️', desc: '언젠가 함께 하늘을 날 준비', hint: '보스를 3마리 물리치면', earned: (s) => s.bossesCleared >= 3 },
  { id: 'crown-seed', name: '왕관 새싹', emoji: '🌱', desc: '성체가 되면 피어날 왕관의 씨앗', hint: '10일 출석하면', earned: (s) => s.attendanceDays >= 10 },
  { id: 'treasure-pouch', name: '보물 주머니', emoji: '👝', desc: '보물 카드를 소중히 담는 주머니', hint: '보물 카드를 10장 모으면', earned: (s) => s.rewardCardCount >= 10 },
  { id: 'rainbow-ribbon', name: '무지개 리본', emoji: '🎀', desc: '완전한 성체를 축하하는 리본', hint: '보스를 6마리 물리치면', earned: (s) => s.bossesCleared >= 6 },
];

/** 드래곤 저장 상태 */
export interface DragonState {
  gp: number;
  affinities: Record<Affinity, number>;
  /** 과일 보유량 */
  fruits: Record<string, number>;
  /** 획득한 육성 아이템 id */
  items: string[];
  /** 마지막으로 먹이 준 날 (YYYY-MM-DD) + 그 시점 배부름 */
  lastFed: string;
  fullnessAtFed: number;
  feedCount: number;
  /** 성체 확정 정보 (성체 도달 시 1회 결정) */
  adult?: { affinity: Affinity; form: 'human' | 'dragon' };
}

export function emptyDragon(): DragonState {
  return {
    gp: 0,
    affinities: { sun: 0, moon: 0, star: 0, forest: 0 },
    fruits: {},
    items: [],
    lastFed: '',
    fullnessAtFed: 70,
    feedCount: 0,
  };
}

/** 현재 배부름 (하루 25씩 감소) */
export function currentFullness(d: DragonState, today: string): number {
  if (!d.lastFed) return 60;
  const days = Math.max(
    0,
    Math.round((new Date(today).getTime() - new Date(d.lastFed).getTime()) / 86400000),
  );
  return Math.max(0, Math.min(100, d.fullnessAtFed - days * 25));
}

export type DragonMood = 'happy' | 'normal' | 'hungry' | 'sad';

export function dragonMood(fullness: number, streakActive: boolean): DragonMood {
  if (fullness >= 70 && streakActive) return 'happy';
  if (fullness >= 40) return 'normal';
  if (fullness >= 15) return 'hungry';
  return 'sad';
}

export const MOOD_INFO: Record<DragonMood, { label: string; emoji: string; line: string }> = {
  happy: { label: '행복해요', emoji: '💖', line: '오늘도 같이 모험하자!' },
  normal: { label: '평온해요', emoji: '😊', line: '문제를 풀면 과일이 생겨!' },
  hungry: { label: '배고파요', emoji: '🥺', line: '꼬르륵... 과일이 먹고 싶어...' },
  sad: { label: '쓸쓸해요', emoji: '💧', line: '오랜만이야... 보고 싶었어!' },
};

/** 가장 높은 속성 (동률이면 sun > moon > star > forest 순) */
export function topAffinity(aff: Record<Affinity, number>): Affinity {
  const order: Affinity[] = ['sun', 'moon', 'star', 'forest'];
  return order.reduce((best, a) => (aff[a] > aff[best] ? a : best), 'sun' as Affinity);
}

/** 성체 형태 결정 — 보물 카드를 많이 모았으면 인간형, 아니면 드래곤형 */
export function decideAdultForm(rewardCardCount: number): 'human' | 'dragon' {
  return rewardCardCount >= 12 ? 'human' : 'dragon';
}

/** 성체 이름 */
export function adultTitle(adult: { affinity: Affinity; form: 'human' | 'dragon' }): string {
  const info = AFFINITY_INFO[adult.affinity];
  return adult.form === 'human' ? info.adultHuman : info.adultDragon;
}

/** 레어 엔딩 조건: 성체 + 보물 카드 30장 이상 */
export const RARE_ENDING_CARDS = 30;

/** 현재 드래곤 모습 이모지 — 홈/프로필 아바타용 (알 → 성체로 아바타도 자란다) */
export function dragonEmoji(d: DragonState): string {
  if (d.adult) return d.adult.form === 'dragon' ? '🐉' : '🧙';
  return DRAGON_STAGES[stageForGp(d.gp)].emoji;
}
