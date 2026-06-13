import { describe, it, expect } from 'vitest';
import { SEMESTERS } from './stages';
import {
  parseGradeSemester,
  semesterOfUnit,
  accessZone,
  accessZoneForSemester,
} from './gradeAccess';

describe('parseGradeSemester — 반코드 끝 2자리', () => {
  it('STAR52 → g5s2, TIGER31 → g3s1', () => {
    expect(parseGradeSemester('STAR52')).toBe('g5s2');
    expect(parseGradeSemester('TIGER31')).toBe('g3s1');
  });
  it('학년 범위/형식 벗어나면 null', () => {
    expect(parseGradeSemester('STAR53')).toBeNull(); // 학기 3 없음
    expect(parseGradeSemester('STAR72')).toBeNull(); // 7학년 없음
    expect(parseGradeSemester('CLASS')).toBeNull();
    expect(parseGradeSemester('')).toBeNull();
    expect(parseGradeSemester(null)).toBeNull();
  });
});

describe('accessZoneForSemester', () => {
  it('학생 미설정이면 항상 current', () => {
    expect(accessZoneForSemester(null, 'g3s1')).toBe('current');
  });
  it('같은 학기=current, 과거=review, 미래=ahead', () => {
    expect(accessZoneForSemester('g5s1', 'g5s1')).toBe('current');
    expect(accessZoneForSemester('g5s1', 'g4s2')).toBe('review');
    expect(accessZoneForSemester('g5s1', 'g1s1')).toBe('review');
    expect(accessZoneForSemester('g5s1', 'g5s2')).toBe('ahead');
    expect(accessZoneForSemester('g5s1', 'g6s2')).toBe('ahead');
  });
});

describe('accessZone — unitId 기반', () => {
  it('SEMESTERS의 모든 unit이 학기로 매핑된다', () => {
    for (const sem of SEMESTERS) {
      for (const u of sem.units) {
        expect(semesterOfUnit(u)).toBe(sem.id);
      }
    }
  });
  it('학생 g5s1 기준: 5-1 unit=current, 4-1 unit=review, 6-1 unit=ahead', () => {
    // g5s1 첫 단원 unitMix, g4s1 unitBigNum, g6s1 unitRatio
    expect(accessZone('g5s1', 'unitMix')).toBe('current');
    expect(accessZone('g5s1', 'unitBigNum')).toBe('review');
    expect(accessZone('g5s1', 'unitRatio')).toBe('ahead');
  });
  it('학기 미상 unitId는 current(폴백)', () => {
    expect(accessZone('g5s1', 'unitNonexistent')).toBe('current');
  });
});
