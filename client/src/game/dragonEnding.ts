import { type Affinity } from './dragon';

export type HumanEndingVariant = 'male' | 'female';

export interface HumanEndingActivityWeights {
  affinities: Record<Affinity, number>;
  lessonsCompleted: number;
  perfectLessons: number;
  sealedBosses: number;
  attendanceDays: number;
  feedCount: number;
  rewardCardCount: number;
  basicSets: number;
  wordSets: number;
  challengeSets: number;
  challengeCleared: number;
  finalExamsPassed: number;
  reviewCleared: number;
  stepGoalDays: number;
}

export function frontAscendHumanEndingSrc(variant: HumanEndingVariant): string {
  return variant === 'female'
    ? 'assets/dragon/ending-final/adult-female-front-ascend.png'
    : 'assets/dragon/ending-final/adult-male-front-ascend.png';
}

export function activityWeightedHumanEndingVariant(input: HumanEndingActivityWeights): HumanEndingVariant {
  const { affinities } = input;
  const guardianWeight =
    affinities.sun * 3 +
    affinities.forest * 3 +
    input.lessonsCompleted +
    input.perfectLessons * 4 +
    input.sealedBosses * 8 +
    input.attendanceDays * 2 +
    input.feedCount * 2 +
    input.basicSets * 5 +
    input.stepGoalDays * 3;
  const oracleWeight =
    affinities.moon * 3 +
    affinities.star * 3 +
    input.rewardCardCount * 2 +
    input.wordSets * 5 +
    input.challengeSets * 7 +
    input.challengeCleared * 9 +
    input.finalExamsPassed * 11 +
    input.reviewCleared * 6;

  if (oracleWeight === guardianWeight) {
    const total =
      Object.values(affinities).reduce((sum, v) => sum + v, 0) +
      input.lessonsCompleted +
      input.rewardCardCount +
      input.feedCount;
    return total % 2 === 0 ? 'female' : 'male';
  }
  return oracleWeight > guardianWeight ? 'female' : 'male';
}
