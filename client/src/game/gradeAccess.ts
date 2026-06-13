/**
 * 학년별 콘텐츠 접근 정책 (docs/grade-access-policy.md)
 * - 학생 현재 학기는 인증(반)코드 끝 2자리(학년+학기)에서 파생 — 별도 저장 안 함.
 * - 스테이지가 학생 현재 학기보다 과거면 '복습(review)', 미래면 '선행(ahead)', 같으면 'current'.
 * - 코드에 학년 정보 없으면(미인증·체험) 전부 'current'로 폴백(전체 열림).
 */

import { SEMESTERS } from './stages';

export type AccessZone = 'current' | 'review' | 'ahead';

/** 학기 순서 (g1s1 → g6s2). SEMESTERS는 학년 오름차순 유지가 불변식. */
const SEMESTER_ORDER: string[] = SEMESTERS.map((s) => s.id);

/** unitId → semesterId 역매핑 */
const UNIT_TO_SEMESTER = new Map<string, string>();
for (const s of SEMESTERS) for (const u of s.units) UNIT_TO_SEMESTER.set(u, s.id);

/** 반코드 끝 2자리([1-6][1-2])에서 학생 현재 학기('g{N}s{M}')를 파싱. 없으면 null. */
export function parseGradeSemester(classCode: string | null | undefined): string | null {
  if (!classCode) return null;
  const m = classCode.trim().match(/([1-6])([12])$/);
  return m ? `g${m[1]}s${m[2]}` : null;
}

/** unitId가 속한 학기 id. 못 찾으면 undefined. */
export function semesterOfUnit(unitId: string): string | undefined {
  return UNIT_TO_SEMESTER.get(unitId);
}

/** 학기 정렬 인덱스(없으면 -1) */
export function semesterIndex(semesterId: string | null | undefined): number {
  return semesterId ? SEMESTER_ORDER.indexOf(semesterId) : -1;
}

/**
 * 학생 현재 학기와 대상 학기로 접근 영역 판정.
 * 학생 학기 미설정 또는 학기 미상이면 'current'(제한 없음).
 */
export function accessZoneForSemester(studentSemester: string | null, semesterId: string): AccessZone {
  if (!studentSemester) return 'current';
  const si = SEMESTER_ORDER.indexOf(studentSemester);
  const gi = SEMESTER_ORDER.indexOf(semesterId);
  if (si < 0 || gi < 0 || gi === si) return 'current';
  return gi < si ? 'review' : 'ahead';
}

/**
 * 학생 현재 학기와 스테이지(unitId)로 접근 영역 판정.
 * 스테이지 학기 미상이면 'current'(제한 없음).
 */
export function accessZone(studentSemester: string | null, unitId: string): AccessZone {
  if (!studentSemester) return 'current';
  const stageSemester = UNIT_TO_SEMESTER.get(unitId);
  if (!stageSemester) return 'current';
  return accessZoneForSemester(studentSemester, stageSemester);
}
