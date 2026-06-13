import { describe, it, expect } from 'vitest';
import type { Affinity } from './dragon';
import { bossSeal, decideEvolution } from './dragonEvolution';

const aff = (sun = 0, moon = 0, star = 0, forest = 0): Record<Affinity, number> => ({
  sun, moon, star, forest,
});

describe('bossSeal — 보스 고유 봉인', () => {
  it('같은 보스 id는 항상 같은 값(재현성)', () => {
    expect(bossSeal('mix-boss')).toEqual(bossSeal('mix-boss'));
  });
  it('속성은 4종 중 하나, 세기는 3~5', () => {
    for (const id of ['mix-boss', 'div-boss', 'ratio-boss', 'frac-boss', 'n9-boss', 'gugu-boss']) {
      const s = bossSeal(id);
      expect(['sun', 'moon', 'star', 'forest']).toContain(s.affinity);
      expect(s.power).toBeGreaterThanOrEqual(3);
      expect(s.power).toBeLessThanOrEqual(5);
    }
  });
});

describe('decideEvolution — 티어 결정', () => {
  it('봉인 보스 적으면 common (으뜸 속성 × 형태)', () => {
    const r = decideEvolution({ affinities: aff(20, 5, 5, 5), sealedCount: 3, rewardCardCount: 0 });
    expect(r.tier).toBe('common');
    expect(r.affinity).toBe('sun');
    expect(r.form).toBe('dragon');
    expect(r.id).toBe('sun-dragon');
  });

  it('보물카드 10+ 면 common 인간형', () => {
    const r = decideEvolution({ affinities: aff(5, 20, 5, 5), sealedCount: 3, rewardCardCount: 10 });
    expect(r.tier).toBe('common');
    expect(r.id).toBe('moon-human');
  });

  it('한 학기 봉인(6) + 뚜렷한 으뜸 → rare(각성)', () => {
    const r = decideEvolution({ affinities: aff(20, 10, 8, 6), sealedCount: 6, rewardCardCount: 0 });
    expect(r.tier).toBe('rare');
    expect(r.id).toBe('rare-sun');
  });

  it('봉인 6이어도 으뜸이 안 뚜렷하면 common', () => {
    const r = decideEvolution({ affinities: aff(11, 10, 9, 9), sealedCount: 6, rewardCardCount: 0 });
    expect(r.tier).toBe('common');
  });

  it('두 학기 봉인(12) + 균형 분포 → 슈퍼레어 무지개', () => {
    const r = decideEvolution({ affinities: aff(15, 14, 13, 12), sealedCount: 12, rewardCardCount: 0 });
    expect(r.tier).toBe('superrare');
    expect(r.id).toBe('super-rainbow');
  });

  it('두 학기 봉인(12) + 극단 편향 → 슈퍼레어 흑요석', () => {
    const r = decideEvolution({ affinities: aff(40, 10, 8, 6), sealedCount: 12, rewardCardCount: 0 });
    expect(r.tier).toBe('superrare');
    expect(r.id).toBe('super-obsidian');
  });

  it('봉인 11이면 아직 슈퍼레어 아님(레어로)', () => {
    const r = decideEvolution({ affinities: aff(40, 10, 8, 6), sealedCount: 11, rewardCardCount: 0 });
    expect(r.tier).toBe('rare');
  });

  it('속성 점수 전무면 common sun-dragon (안전 폴백)', () => {
    const r = decideEvolution({ affinities: aff(0, 0, 0, 0), sealedCount: 20, rewardCardCount: 0 });
    expect(r.tier).toBe('common');
    expect(r.id).toBe('sun-dragon');
  });
});
