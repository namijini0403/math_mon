import { describe, expect, it } from 'vitest';
import {
  ADULT_REQ,
  qualifiesForAdult,
  adultToGraduate,
  graduateMiniSrc,
  type AdultEffortStats,
  type DragonState,
} from './dragon';

const fullEffort: AdultEffortStats = {
  lessonsCompleted: ADULT_REQ.lessons,
  basicSets: ADULT_REQ.basicSets,
  wordSets: ADULT_REQ.wordSets,
  bossesCleared: ADULT_REQ.bosses,
};

describe('qualifiesForAdult — 성체 자격(열심히 해야 성체)', () => {
  it('네 조건을 모두 채우면 자격 있음', () => {
    expect(qualifiesForAdult(fullEffort)).toBe(true);
  });

  it('출석·먹이만 쌓아 GP만 높은(=학습 0) 경우 자격 없음', () => {
    expect(qualifiesForAdult({ lessonsCompleted: 0, basicSets: 0, wordSets: 0, bossesCleared: 0 })).toBe(false);
  });

  it('한 조건이라도 모자라면 자격 없음', () => {
    for (const k of ['lessonsCompleted', 'basicSets', 'wordSets', 'bossesCleared'] as const) {
      expect(qualifiesForAdult({ ...fullEffort, [k]: (fullEffort[k] as number) - 1 })).toBe(false);
    }
  });

  it('기준을 초과해도 자격 있음', () => {
    expect(qualifiesForAdult({ lessonsCompleted: 99, basicSets: 99, wordSets: 99, bossesCleared: 99 })).toBe(true);
  });
});

describe('adultToGraduate / graduateMiniSrc — 졸업생 미니미', () => {
  it('common 성체는 mini/adult-{속성}-{형태} 경로', () => {
    const adult: NonNullable<DragonState['adult']> = { affinity: 'sun', form: 'dragon' };
    const g = adultToGraduate(adult);
    expect(g.tier).toBe('common');
    expect(g.affinity).toBe('sun');
    expect(g.form).toBe('dragon');
    expect(graduateMiniSrc(g)).toBe('assets/dragon/mini/adult-sun-dragon.png');
  });

  it('rare/super 성체는 진화 id로 전용 폴더 경로', () => {
    const rare = adultToGraduate({
      affinity: 'star', form: 'human',
      evolution: { id: 'rare-star-human', name: '천공을 읽는 대점성왕', tier: 'rare', emoji: '⭐🧙' },
    });
    expect(rare.tier).toBe('rare');
    expect(rare.name).toBe('천공을 읽는 대점성왕');
    expect(graduateMiniSrc(rare)).toBe('assets/dragon/rare/rare-star-human.png');

    const sup = adultToGraduate({
      affinity: 'moon', form: 'dragon',
      evolution: { id: 'super-rainbow-dragon', name: '무지개 창세룡', tier: 'superrare', emoji: '🌈🐉' },
    });
    expect(graduateMiniSrc(sup)).toBe('assets/dragon/super/super-rainbow-dragon.png');
  });
});
