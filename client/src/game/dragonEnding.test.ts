import { describe, expect, it } from 'vitest';
import {
  activityWeightedHumanEndingVariant,
  frontAscendHumanEndingSrc,
  type HumanEndingActivityWeights,
} from './dragonEnding';

const base: HumanEndingActivityWeights = {
  affinities: { sun: 0, moon: 0, star: 0, forest: 0 },
  lessonsCompleted: 0,
  perfectLessons: 0,
  sealedBosses: 0,
  attendanceDays: 0,
  feedCount: 0,
  rewardCardCount: 0,
  basicSets: 0,
  wordSets: 0,
  challengeSets: 0,
  challengeCleared: 0,
  finalExamsPassed: 0,
  reviewCleared: 0,
  stepGoalDays: 0,
};

describe('dragon ending variant', () => {
  it('uses the guardian-leaning adult variant for sun/forest and steady activity', () => {
    expect(activityWeightedHumanEndingVariant({
      ...base,
      affinities: { sun: 8, moon: 1, star: 0, forest: 6 },
      lessonsCompleted: 20,
      perfectLessons: 4,
      sealedBosses: 5,
      feedCount: 12,
      basicSets: 3,
    })).toBe('male');
  });

  it('uses the oracle-leaning adult variant for moon/star and challenge activity', () => {
    expect(activityWeightedHumanEndingVariant({
      ...base,
      affinities: { sun: 1, moon: 7, star: 8, forest: 0 },
      rewardCardCount: 15,
      wordSets: 4,
      challengeSets: 3,
      challengeCleared: 2,
      finalExamsPassed: 1,
    })).toBe('female');
  });

  it('keeps ties deterministic', () => {
    expect(activityWeightedHumanEndingVariant(base)).toBe('female');
    expect(activityWeightedHumanEndingVariant({ ...base, feedCount: 1 })).toBe('male');
  });

  it('maps variants to the front ascension assets', () => {
    expect(frontAscendHumanEndingSrc('male')).toContain('adult-male-front-ascend.png');
    expect(frontAscendHumanEndingSrc('female')).toContain('adult-female-front-ascend.png');
  });
});
