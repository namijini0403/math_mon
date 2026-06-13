/**
 * 틀린 문제 기록 — 단원별로 (skillId, seed)를 저장해 '그 문제 그대로' 다시 풀 수 있게 한다.
 * 문제는 시드 기반 파라메트릭(generateProblem(skillId, seed))이라 seed만 있으면 완전 재현.
 * 「흐려진 별의 회랑」(틀린 문제 다시보기)의 데이터 토대.
 */

export interface WrongEntry {
  skillId: string;
  seed: number;
  /** 마지막으로 틀린 시각(ms) — 최신순 정렬·만료에 사용 */
  ts: number;
}

/** key = unitId, value = 그 단원에서 틀린 문제들(최신순) */
export type WrongLog = Record<string, WrongEntry[]>;

/** 단원당 보관 상한 (오래된 것부터 밀려남) */
export const MAX_PER_UNIT = 40;

function sameProblem(e: WrongEntry, skillId: string, seed: number): boolean {
  return e.skillId === skillId && e.seed === seed;
}

/** 오답 기록 추가 — 같은 (skillId,seed)는 ts만 갱신하며 맨 앞으로. 상한 초과 시 오래된 것 제거. */
export function pushWrong(
  log: WrongLog,
  unitId: string,
  skillId: string,
  seed: number,
  ts: number,
): WrongLog {
  const arr = log[unitId] ?? [];
  const without = arr.filter((e) => !sameProblem(e, skillId, seed));
  const next = [{ skillId, seed, ts }, ...without].slice(0, MAX_PER_UNIT);
  return { ...log, [unitId]: next };
}

/** 해당 문제를 목록에서 제거 (회랑에서 다시 맞히면 '별 점등' = 졸업). 변화 없으면 원본 반환. */
export function clearWrong(
  log: WrongLog,
  unitId: string,
  skillId: string,
  seed: number,
): WrongLog {
  const arr = log[unitId];
  if (!arr || arr.length === 0) return log;
  const next = arr.filter((e) => !sameProblem(e, skillId, seed));
  if (next.length === arr.length) return log;
  if (next.length === 0) {
    const { [unitId]: _omit, ...rest } = log;
    return rest;
  }
  return { ...log, [unitId]: next };
}

/** 단원의 흐려진 별(틀린 문제) 개수 */
export function wrongCountFor(log: WrongLog, unitId: string): number {
  return log[unitId]?.length ?? 0;
}

/** 틀린 문제가 하나라도 있는 단원 id 목록 (개수 많은 순) */
export function unitsWithWrong(log: WrongLog): { unitId: string; count: number }[] {
  return Object.entries(log)
    .map(([unitId, arr]) => ({ unitId, count: arr.length }))
    .filter((u) => u.count > 0)
    .sort((a, b) => b.count - a.count);
}
