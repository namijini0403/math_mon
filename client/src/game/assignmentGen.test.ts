import { describe, expect, it } from 'vitest';
import {
  allocate,
  buildAssignment,
  studentSeed,
  tierOf,
  type AssignmentConfig,
  type SkillStats,
} from './assignmentGen';
import { SKILLS, generateProblem, getSkill } from '../generator';

// 실재하는 단원 id 몇 개 (학년별 분포 확인용)
const UNIT_WITH_CHALLENGE = 'unitMix'; // 5-1 자연수 혼합계산 — 심화(challengeG5S1) 존재
const UNIT_NO_CHALLENGE = 'unitNum9'; // 1-1 9까지의 수 — 심화 없음

describe('tierOf 분류', () => {
  it('challenge → high, word → mid, 그 외 → low', () => {
    for (const s of SKILLS) {
      const t = tierOf(s);
      if (s.challenge) expect(t).toBe('high');
      else if (s.word) expect(t).toBe('mid');
      else expect(t).toBe('low');
    }
  });
});

describe('allocate 비율 배분', () => {
  it('합이 항상 total과 같다 (최대 잔여법)', () => {
    for (const total of [5, 7, 10, 13, 20]) {
      for (const mix of [
        { low: 1, mid: 1, high: 1 },
        { low: 2, mid: 1, high: 0 },
        { low: 0, mid: 0, high: 1 },
        { low: 3, mid: 2, high: 1 },
      ]) {
        const a = allocate(mix, total);
        expect(a.low + a.mid + a.high).toBe(total);
        expect(a.low).toBeGreaterThanOrEqual(0);
        expect(a.mid).toBeGreaterThanOrEqual(0);
        expect(a.high).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('모든 비율 0이면 균등 분배(합 유지)', () => {
    const a = allocate({ low: 0, mid: 0, high: 0 }, 9);
    expect(a.low + a.mid + a.high).toBe(9);
    expect(a.low).toBe(3);
    expect(a.mid).toBe(3);
    expect(a.high).toBe(3);
  });

  it('한쪽 100%면 전부 그쪽', () => {
    const a = allocate({ low: 0, mid: 1, high: 0 }, 10);
    expect(a.mid).toBe(10);
    expect(a.low).toBe(0);
    expect(a.high).toBe(0);
  });
});

describe('buildAssignment', () => {
  const baseConfig: AssignmentConfig = {
    unitIds: [UNIT_WITH_CHALLENGE],
    count: 10,
    mix: { low: 1, mid: 1, high: 1 },
  };

  it('항상 count개를 채운다', () => {
    for (const count of [5, 8, 10, 15]) {
      const items = buildAssignment({ ...baseConfig, count }, 12345);
      expect(items).toHaveLength(count);
    }
  });

  it('생성된 모든 항목은 실재 스킬이고 그대로 문제가 생성된다(재현성)', () => {
    const items = buildAssignment(baseConfig, 999);
    for (const it of items) {
      expect(() => getSkill(it.skillId)).not.toThrow();
      const p1 = generateProblem(it.skillId, it.seed);
      const p2 = generateProblem(it.skillId, it.seed);
      expect(p1.id).toBe(p2.id);
      expect(p1.prompt).toBe(p2.prompt);
    }
  });

  it('같은 (config, seed)는 항상 같은 결과', () => {
    const a = buildAssignment(baseConfig, 42);
    const b = buildAssignment(baseConfig, 42);
    expect(a).toEqual(b);
  });

  it('다른 seed는 (거의 항상) 다른 결과', () => {
    const a = buildAssignment(baseConfig, 1);
    const b = buildAssignment(baseConfig, 2);
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it('심화 없는 단원도 high 배정을 폴백해 count를 채운다', () => {
    const items = buildAssignment(
      { unitIds: [UNIT_NO_CHALLENGE], count: 10, mix: { low: 0, mid: 0, high: 1 } },
      7,
    );
    expect(items).toHaveLength(10);
    // 심화 스킬이 없으니 전부 비심화여야 한다
    for (const it of items) {
      expect(getSkill(it.skillId).challenge).not.toBe(true);
    }
  });

  it('잘못된 단원이면 빈 배열', () => {
    expect(buildAssignment({ unitIds: ['__nope__'], count: 10, mix: { low: 1, mid: 0, high: 0 } }, 1)).toEqual([]);
  });

  it('weakWeight=true면 자주 틀린 스킬을 더 자주 뽑는다', () => {
    const lowSkills = SKILLS.filter((s) => s.unitId === UNIT_WITH_CHALLENGE && tierOf(s) === 'low');
    expect(lowSkills.length).toBeGreaterThan(1);
    const weakId = lowSkills[0].id;
    const stats: SkillStats = {};
    // weakId는 거의 다 틀림, 나머지는 거의 다 맞음
    for (const s of lowSkills) stats[s.id] = s.id === weakId ? { c: 0, w: 20 } : { c: 20, w: 0 };

    const cfg: AssignmentConfig = {
      unitIds: [UNIT_WITH_CHALLENGE],
      count: 12,
      mix: { low: 1, mid: 0, high: 0 },
      weakWeight: true,
    };
    // 여러 시드 합산해 분포 확인
    let weakHits = 0;
    let total = 0;
    for (let seed = 0; seed < 40; seed++) {
      for (const it of buildAssignment(cfg, seed, stats)) {
        total++;
        if (it.skillId === weakId) weakHits++;
      }
    }
    // 균등 기대치(1/n)보다 확연히 높아야 한다
    expect(weakHits / total).toBeGreaterThan(1 / lowSkills.length);
  });
});

describe('studentSeed', () => {
  it('같은 입력은 같은 시드, 다른 학생은 다른 시드', () => {
    expect(studentSeed(100, 'kim')).toBe(studentSeed(100, 'kim'));
    expect(studentSeed(100, 'kim')).not.toBe(studentSeed(100, 'lee'));
    expect(studentSeed(100, 'kim')).not.toBe(studentSeed(200, 'kim'));
  });

  it('항상 부호 없는 32비트 정수', () => {
    for (const k of ['a', 'student-uuid-123', '학생']) {
      const v = studentSeed(randomBase(), k);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(0xffffffff);
    }
  });
});

function randomBase() {
  return Math.floor(Math.random() * 0xffffffff);
}
