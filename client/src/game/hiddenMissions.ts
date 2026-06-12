/**
 * 히든 미션 — 목록을 공개하지 않고, 조건이 갖춰지는 순간 보물 카드가 "갑자기" 나온다.
 * (카드 남발 방지: 일반 카드는 첫 학습·심화 클리어·보스 격파·히든 미션에서만)
 */

export interface HiddenMissionStats {
  streakDays: number;
  lessonsCompleted: number;
  basicSets: number;
  wordSets: number;
  challengeSets: number;
  examCount: number;
  perfectLessons: number;
  feedCount: number;
  challengeCleared: number;
}

export interface HiddenMissionDef {
  id: string;
  /** 달성 순간 보여줄 칭호 (목록엔 비공개) */
  name: string;
  desc: string;
  earned: (s: HiddenMissionStats) => boolean;
}

export const HIDDEN_MISSIONS: HiddenMissionDef[] = [
  { id: 'hm-streak10', name: '꾸준함의 보물', desc: '10일 연속 불꽃을 지키며 레슨 20개를 완료했어요', earned: (s) => s.streakDays >= 10 && s.lessonsCompleted >= 20 },
  { id: 'hm-basic5', name: '계산 수련생', desc: '기초 연산 연습 5세트 달성', earned: (s) => s.basicSets >= 5 },
  { id: 'hm-basic15', name: '계산의 고수', desc: '기초 연산 연습 15세트 달성', earned: (s) => s.basicSets >= 15 },
  { id: 'hm-word5', name: '이야기 탐험가', desc: '문장제 연습 5세트 달성', earned: (s) => s.wordSets >= 5 },
  { id: 'hm-word15', name: '이야기의 현자', desc: '문장제 연습 15세트 달성', earned: (s) => s.wordSets >= 15 },
  { id: 'hm-challenge5', name: '심연의 도전자', desc: '심화 연습 5세트 달성', earned: (s) => s.challengeSets >= 5 },
  { id: 'hm-exam3', name: '시험장의 단골', desc: '명예의 시험 3회 응시', earned: (s) => s.examCount >= 3 },
  { id: 'hm-perfect10', name: '무결점의 증표', desc: '하트 무손실 클리어 10회', earned: (s) => s.perfectLessons >= 10 },
  { id: 'hm-feed20', name: '드래곤의 단짝', desc: '드래곤에게 먹이 20번 주기', earned: (s) => s.feedCount >= 20 },
];

export function newlyCompletedHidden(
  stats: HiddenMissionStats,
  done: string[],
): HiddenMissionDef[] {
  return HIDDEN_MISSIONS.filter((m) => !done.includes(m.id) && m.earned(stats));
}
