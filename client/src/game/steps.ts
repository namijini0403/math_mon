/**
 * 만보기(걸음수) 1단계 — 순수 로직 (docs/future-ideas.md §2)
 * - 앱 켠 동안 측정한 걸음을 누적, 하루 2000보 달성 시 보상(드래곤 과일 + 배지).
 * - 측정 어댑터(pedometer.ts)와 분리해 테스트 가능하게 유지.
 * - 아침 운동장 이벤트 시간창(08:20~08:50)은 "세팅만, 발동 안 함"(MORNING_EVENT_ENABLED=false).
 *   운영 결정 시 스위치만 켜면 활성화.
 */

/** 하루 목표 걸음 (아침 운동장 15~20분 ≈ 2000보) */
export const STEP_GOAL = 2000;

/** 아침 운동장 이벤트 시간창 (자정 기준 분). 08:20 ~ 08:50. */
export const MORNING_WINDOW = { startMin: 8 * 60 + 20, endMin: 8 * 60 + 50 };

/**
 * 아침 시간창 이벤트 활성 스위치 — **현재 비활성(세팅만, 발동 안 함).**
 * 운영(동의·문화 정착) 준비되면 true로 바꾸면 시간창 안에서만 이벤트가 열린다.
 */
export const MORNING_EVENT_ENABLED = false;

export interface StepState {
  /** 오늘 날짜 (YYYY-MM-DD) — 바뀌면 today 리셋 */
  date: string;
  /** 오늘 걸음수 */
  today: number;
  /** 2000보 달성 누적일 (배지용) */
  goalDays: number;
  /** 마지막 목표 달성일 (하루 1회 보상 판정) */
  lastGoalDate: string;
}

export function emptySteps(): StepState {
  return { date: '', today: 0, goalDays: 0, lastGoalDate: '' };
}

/** 날짜가 바뀌었으면 오늘 걸음을 0으로 리셋한 새 상태 반환 (아니면 그대로) */
export function rolloverSteps(s: StepState, today: string): StepState {
  if (s.date === today) return s;
  return { ...s, date: today, today: 0 };
}

export interface StepIngestResult {
  state: StepState;
  /** 이번 추가로 오늘 목표를 처음 넘었는가 (그날 1회만 true) */
  goalReached: boolean;
}

/**
 * 걸음 count(양수)를 오늘 누적에 더한다. 2000보를 처음 넘는 순간(그날 1회) goalReached=true.
 * 음수·0은 무시. 날짜 롤오버 포함.
 */
export function addSteps(s: StepState, count: number, today: string): StepIngestResult {
  const base = rolloverSteps(s, today);
  if (!Number.isFinite(count) || count <= 0) return { state: base, goalReached: false };
  const before = base.today;
  const after = before + Math.floor(count);
  const newlyReached = before < STEP_GOAL && after >= STEP_GOAL && base.lastGoalDate !== today;
  const state: StepState = {
    ...base,
    today: after,
    goalDays: newlyReached ? base.goalDays + 1 : base.goalDays,
    lastGoalDate: newlyReached ? today : base.lastGoalDate,
  };
  return { state, goalReached: newlyReached };
}

/** 현재 시각이 아침 시간창(08:20~08:50) 안인지 — 순수 판정(스위치와 무관) */
export function isWithinMorningWindow(d: Date): boolean {
  const m = d.getHours() * 60 + d.getMinutes();
  return m >= MORNING_WINDOW.startMin && m < MORNING_WINDOW.endMin;
}

/** 아침 운동장 이벤트가 지금 발동 상태인지 — 스위치 AND 시간창 (현재 스위치 off라 항상 false) */
export function isMorningEventActive(d: Date = new Date()): boolean {
  return MORNING_EVENT_ENABLED && isWithinMorningWindow(d);
}
