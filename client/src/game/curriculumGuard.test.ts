import { describe, expect, it } from 'vitest';
import { SKILLS, generateProblem } from '../generator';
import { findViolations, flattenExpr, gradeOfUnit, isAuditedUnit } from './curriculumGuard';

const SEEDS = 25;

// 풀이 정비를 마친(audit) 단원만 표기 위반=실패로 강제한다. 나머지는 순차 도달 시 audit.
describe.each(SKILLS.filter((s) => isAuditedUnit(s.unitId)).map((s) => [s.id, s.unitId] as const))(
  '교육과정 표기 가드 — %s',
  (skillId, unitId) => {
    const grade = gradeOfUnit(unitId);
    it(`${grade ?? '?'}학년 풀이에 학년 부적합 표기가 없다`, () => {
      const offenders: string[] = [];
      for (let s = 0; s < SEEDS; s++) {
        const p = generateProblem(skillId, s * 101 + 7);
        const v = findViolations(p.explanation, grade);
        if (v.length > 0) {
          offenders.push(`seed ${s * 101 + 7}: ${v.join(', ')} | "${flattenExpr(p.explanation).text}"`);
        }
      }
      expect(offenders).toEqual([]);
    });
  },
);

describe('가드 단위 동작', () => {
  it('1학년 풀이에 곱셈기호가 있으면 위반으로 잡는다', () => {
    expect(findViolations([{ kind: 'text', text: '3 × 2 = 6' }], 1)).toContain('곱셈기호(×)');
  });
  it('2학년부터는 곱셈기호 허용', () => {
    expect(findViolations([{ kind: 'text', text: '3 × 2 = 6' }], 2)).toHaveLength(0);
  });
  it('2학년 풀이에 나눗셈기호가 있으면 위반', () => {
    expect(findViolations([{ kind: 'text', text: '6 ÷ 2 = 3' }], 2)).toContain('나눗셈기호(÷)');
  });
  it('숫자 거듭제곱(2²)은 초등 전 학년 금지', () => {
    expect(findViolations([{ kind: 'text', text: '12 = 2² × 3' }], 6).length).toBeGreaterThan(0);
  });
  it("단위 cm²(글자+위첨자)는 거듭제곱 위반이 아니다", () => {
    expect(findViolations([{ kind: 'text', text: '넓이는 12 cm²' }], 5)).toHaveLength(0);
  });
  it('3학년 전에는 분수 토큰이 위반', () => {
    expect(findViolations([{ kind: 'frac', n: 1, d: 2 }], 2)).toContain('분수 표기(3학년 전)');
  });
  it('정수값 decimal 토큰은 소수 위반이 아니다(1학년 수 비교용)', () => {
    expect(findViolations([{ kind: 'decimal', v: 5 }], 1)).toHaveLength(0);
  });
  it('소수점 값 decimal 토큰은 3학년 전 위반', () => {
    expect(findViolations([{ kind: 'decimal', v: 3.14 }], 2)).toContain('소수 표기(3학년 전)');
  });
});
