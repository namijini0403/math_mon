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
  challengeSets: number;
  examCount: number;
  challengeCleared: number;
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
  { id: 'challenge-gem', name: '심연의 보석', emoji: '💠', desc: '심화 탐험을 정복한 자의 증표', hint: '심화 탐험을 1번 클리어하면', earned: (s) => s.challengeCleared >= 1 },
  { id: 'scholar-quill', name: '현자의 깃펜', emoji: '🪶', desc: '어려운 문제를 사랑하는 마음', hint: '심화 연습 3세트를 마치면', earned: (s) => s.challengeSets >= 3 },
  { id: 'exam-medal', name: '명예의 메달', emoji: '🎖️', desc: '시험장을 누빈 용사의 메달', hint: '명예의 시험에 3번 도전하면', earned: (s) => s.examCount >= 3 },
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
  /** 방에 배치한 장식 id 목록 */
  placedDecor?: string[];
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
    placedDecor: [],
  };
}

// ── 방 꾸미기: 배치 장식 ─────────────────────────────────────────────
// 미션·활동으로 해금하고, 방의 정해진 슬롯에 배치한다.
// Codex PNG(assets/dragon/decor/{id}.png) 우선, 없으면 이모지 폴백.

export type RoomSlot = 'floorLeft' | 'floorRight' | 'floorCenter' | 'wallLeft' | 'wallRight';

/** 방 박스(상대 좌표) 내 슬롯 위치 — left/bottom %, 크기(px) */
export const ROOM_SLOTS: Record<RoomSlot, { left: string; bottom: string; size: number }> = {
  floorLeft: { left: '8%', bottom: '6%', size: 52 },
  floorRight: { left: '72%', bottom: '6%', size: 52 },
  floorCenter: { left: '42%', bottom: '2%', size: 48 },
  wallLeft: { left: '9%', bottom: '44%', size: 44 },
  wallRight: { left: '75%', bottom: '44%', size: 44 },
};

export interface RoomDecorDef {
  id: string;
  name: string;
  /** 이미지 부재 시 폴백 이모지 */
  emoji: string;
  /** 기본 배치 슬롯 */
  slot: RoomSlot;
  /** 해금 조건 설명 */
  hint: string;
  earned: (s: DragonItemStats) => boolean;
}

export const ROOM_DECOR: RoomDecorDef[] = [
  { id: 'rug', name: '별무늬 양탄자', emoji: '🟣', slot: 'floorCenter', hint: '첫 보스를 물리치면', earned: (s) => s.bossesCleared >= 1 },
  { id: 'torch', name: '벽 횃불', emoji: '🔥', slot: 'wallLeft', hint: '레슨 10개를 완료하면', earned: (s) => s.lessonsCompleted >= 10 },
  { id: 'chest', name: '보물 상자', emoji: '🧰', slot: 'floorLeft', hint: '보물 카드 3장을 모으면', earned: (s) => s.rewardCardCount >= 3 },
  { id: 'plant', name: '빛나는 화분', emoji: '🪴', slot: 'floorRight', hint: '10일 출석하면', earned: (s) => s.attendanceDays >= 10 },
  { id: 'banner', name: '드래곤 깃발', emoji: '🚩', slot: 'wallRight', hint: '보스 6마리를 물리치면', earned: (s) => s.bossesCleared >= 6 },
  { id: 'lantern', name: '별빛 등불', emoji: '🏮', slot: 'wallRight', hint: '7일 연속 접속하면', earned: (s) => s.attendanceDays >= 7 },
  { id: 'bookshelf', name: '마법 책장', emoji: '📚', slot: 'floorLeft', hint: '문장제 연습 3세트를 마치면', earned: (s) => s.wordSets >= 3 },
  { id: 'cushion', name: '포근한 방석', emoji: '🛋️', slot: 'floorCenter', hint: '먹이를 10번 주면', earned: (s) => s.feedCount >= 10 },
  { id: 'crystal', name: '수정 장식', emoji: '🔮', slot: 'wallLeft', hint: '심화 탐험을 1회 클리어하면', earned: (s) => s.challengeCleared >= 1 },
  { id: 'trophy', name: '명예의 트로피', emoji: '🏆', slot: 'floorRight', hint: '단원평가에 5번 도전하면', earned: (s) => s.examCount >= 5 },
];

/** 해금된 장식 목록 */
export function earnedDecor(stats: DragonItemStats): RoomDecorDef[] {
  return ROOM_DECOR.filter((d) => d.earned(stats));
}

export function getDecor(id: string): RoomDecorDef | undefined {
  return ROOM_DECOR.find((d) => d.id === id);
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

/** 성체 형태 결정 — 보물 카드(종류 기준)를 많이 모았으면 인간형, 아니면 드래곤형 */
export function decideAdultForm(rewardCardCount: number): 'human' | 'dragon' {
  return rewardCardCount >= 10 ? 'human' : 'dragon';
}

/** 성체 이름 */
export function adultTitle(adult: { affinity: Affinity; form: 'human' | 'dragon' }): string {
  const info = AFFINITY_INFO[adult.affinity];
  return adult.form === 'human' ? info.adultHuman : info.adultDragon;
}

/** 레어 엔딩 조건: 성체 + 보물 카드 15종 이상 (카드는 희귀 이벤트에서만 나옴) */
export const RARE_ENDING_CARDS = 15;

/**
 * 드래곤 방(집) 단계 — 육성 아이템(집 재료)을 모을수록 외양간→궁전으로 업그레이드.
 * 아이들이 시각적으로 성장의 보람을 느끼도록. need = 보유 아이템 수 임계값.
 */
export const ROOM_TIERS = [
  { tier: 0, name: '지푸라기 둥지', need: 0, hint: '알이 태어난 따뜻한 외양간' },
  { tier: 1, name: '아늑한 나무 둥지', need: 2, hint: '통나무로 포근하게' },
  { tier: 2, name: '포근한 오두막', need: 4, hint: '지붕과 창문이 생겼어요' },
  { tier: 3, name: '튼튼한 벽돌집', need: 6, hint: '굴뚝에서 연기가 나요' },
  { tier: 4, name: '드래곤의 성', need: 9, hint: '깃발 휘날리는 성채' },
  { tier: 5, name: '찬란한 궁전', need: 12, hint: '황금 돔의 궁전!' },
] as const;

/** 보유 아이템(집 재료) 수 → 방 단계 */
export function roomTier(itemCount: number): number {
  let t = 0;
  for (const r of ROOM_TIERS) if (itemCount >= r.need) t = r.tier;
  return t;
}

/** 현재 드래곤 모습 이모지 — 홈/프로필 아바타용 (알 → 성체로 아바타도 자란다) */
export function dragonEmoji(d: DragonState): string {
  if (d.adult) return d.adult.form === 'dragon' ? '🐉' : '🧙';
  return DRAGON_STAGES[stageForGp(d.gp)].emoji;
}
