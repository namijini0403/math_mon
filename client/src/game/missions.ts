/** 일일 미션 정의 — daily 카운터 기반 */

export interface DailyCounters {
  date: string;
  solved: number; // 오늘 푼 문제 수 (정답)
  lessons: number; // 오늘 완료한 레슨 수
  perfect: number; // 하트를 잃지 않고 클리어한 레슨 수
  claimed: number[]; // 보상 수령한 미션 id
}

export interface MissionDef {
  id: number;
  label: string;
  emoji: string;
  target: number;
  progress: (d: DailyCounters) => number;
}

export const DAILY_MISSIONS: MissionDef[] = [
  { id: 0, label: '문제 15개 맞히기', emoji: '🎯', target: 15, progress: (d) => d.solved },
  { id: 1, label: '레슨 2개 완료하기', emoji: '📚', target: 2, progress: (d) => d.lessons },
  { id: 2, label: '하트를 잃지 않고 레슨 클리어', emoji: '💖', target: 1, progress: (d) => d.perfect },
];

export function todayStr(): string {
  return new Date().toLocaleDateString('sv'); // YYYY-MM-DD
}

export function emptyDaily(): DailyCounters {
  return { date: todayStr(), solved: 0, lessons: 0, perfect: 0, claimed: [] };
}
