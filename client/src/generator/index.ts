/** 생성기 공개 API — 스킬 레지스트리와 문제 생성 진입점 */

import { unit1Skills } from './units/unit1';
import { unit2Skills } from './units/unit2';
import { unitMixSkills } from './units/unitMix';
import { unitDivSkills } from './units/unitDiv';
import { unitPatternSkills } from './units/unitPattern';
import { unitPolySkills } from './units/unitPoly';
import { unitRangeSkills } from './units/unitRange';
import { unitFracMulSkills } from './units/unitFracMul';
import { unitSymSkills } from './units/unitSym';
import { unitDecMulSkills } from './units/unitDecMul';
import { unitCuboidSkills } from './units/unitCuboid';
import { unitAvgSkills } from './units/unitAvg';
import { unitFracDiv1Skills } from './units/unitFracDiv1';
import { unitPrismSkills } from './units/unitPrism';
import { unitDecDiv1Skills } from './units/unitDecDiv1';
import { unitRatioSkills } from './units/unitRatio';
import { unitGraphSkills } from './units/unitGraph';
import { unitVolumeSkills } from './units/unitVolume';
import { unitFracDiv2Skills } from './units/unitFracDiv2';
import { unitDecDiv2Skills } from './units/unitDecDiv2';
import { unitSpaceSkills } from './units/unitSpace';
import { unitProportionSkills } from './units/unitProportion';
import { unitCircleSkills } from './units/unitCircle';
import { unitRound3dSkills } from './units/unitRound3d';
import { challengeG5S1Skills } from './units/challengeG5S1';
import { challengeG5S2Skills } from './units/challengeG5S2';
import { challengeG6S1Skills } from './units/challengeG6S1';
import { challengeG6S2Skills } from './units/challengeG6S2';
import type { Problem, SkillDef, UnitDef } from './types';
import { randomSeed } from './rng';

/** 2022 개정교육과정 단원 순서 (5-1 → 5-2 → 6-1 → 6-2) */
export const SKILLS: SkillDef[] = [
  ...unitMixSkills,
  ...unitDivSkills,
  ...unitPatternSkills,
  ...unit1Skills,
  ...unit2Skills,
  ...unitPolySkills,
  ...unitRangeSkills,
  ...unitFracMulSkills,
  ...unitSymSkills,
  ...unitDecMulSkills,
  ...unitCuboidSkills,
  ...unitAvgSkills,
  ...unitFracDiv1Skills,
  ...unitPrismSkills,
  ...unitDecDiv1Skills,
  ...unitRatioSkills,
  ...unitGraphSkills,
  ...unitVolumeSkills,
  ...unitFracDiv2Skills,
  ...unitDecDiv2Skills,
  ...unitSpaceSkills,
  ...unitProportionSkills,
  ...unitCircleSkills,
  ...unitRound3dSkills,
  // 심화 (최고수준 2·3단계 유형화 — 단원 id에 귀속, challenge: true)
  ...challengeG5S1Skills,
  ...challengeG5S2Skills,
  ...challengeG6S1Skills,
  ...challengeG6S2Skills,
];

const skillMap = new Map(SKILLS.map((s) => [s.id, s]));

export const UNITS: UnitDef[] = [
  { id: 'unitMix', title: '5-1 자연수의 혼합 계산', skillIds: unitMixSkills.map((s) => s.id) },
  { id: 'unitDiv', title: '5-1 약수와 배수', skillIds: unitDivSkills.map((s) => s.id) },
  { id: 'unitPattern', title: '5-1 규칙과 대응', skillIds: unitPatternSkills.map((s) => s.id) },
  { id: 'unit1', title: '5-1 약분과 통분', skillIds: unit1Skills.map((s) => s.id) },
  { id: 'unit2', title: '5-1 분수의 덧셈과 뺄셈', skillIds: unit2Skills.map((s) => s.id) },
  { id: 'unitPoly', title: '5-1 다각형의 둘레와 넓이', skillIds: unitPolySkills.map((s) => s.id) },
  { id: 'unitRange', title: '5-2 수의 범위와 어림하기', skillIds: unitRangeSkills.map((s) => s.id) },
  { id: 'unitFracMul', title: '5-2 분수의 곱셈', skillIds: unitFracMulSkills.map((s) => s.id) },
  { id: 'unitSym', title: '5-2 합동과 대칭', skillIds: unitSymSkills.map((s) => s.id) },
  { id: 'unitDecMul', title: '5-2 소수의 곱셈', skillIds: unitDecMulSkills.map((s) => s.id) },
  { id: 'unitCuboid', title: '5-2 직육면체', skillIds: unitCuboidSkills.map((s) => s.id) },
  { id: 'unitAvg', title: '5-2 평균과 가능성', skillIds: unitAvgSkills.map((s) => s.id) },
  { id: 'unitFracDiv1', title: '6-1 분수의 나눗셈', skillIds: unitFracDiv1Skills.map((s) => s.id) },
  { id: 'unitPrism', title: '6-1 각기둥과 각뿔', skillIds: unitPrismSkills.map((s) => s.id) },
  { id: 'unitDecDiv1', title: '6-1 소수의 나눗셈', skillIds: unitDecDiv1Skills.map((s) => s.id) },
  { id: 'unitRatio', title: '6-1 비와 비율', skillIds: unitRatioSkills.map((s) => s.id) },
  { id: 'unitGraph', title: '6-1 여러 가지 그래프', skillIds: unitGraphSkills.map((s) => s.id) },
  { id: 'unitVolume', title: '6-1 직육면체의 부피와 겉넓이', skillIds: unitVolumeSkills.map((s) => s.id) },
  { id: 'unitFracDiv2', title: '6-2 분수의 나눗셈', skillIds: unitFracDiv2Skills.map((s) => s.id) },
  { id: 'unitDecDiv2', title: '6-2 소수의 나눗셈', skillIds: unitDecDiv2Skills.map((s) => s.id) },
  { id: 'unitSpace', title: '6-2 공간과 입체', skillIds: unitSpaceSkills.map((s) => s.id) },
  { id: 'unitProportion', title: '6-2 비례식과 비례배분', skillIds: unitProportionSkills.map((s) => s.id) },
  { id: 'unitCircle', title: '6-2 원의 넓이', skillIds: unitCircleSkills.map((s) => s.id) },
  { id: 'unitRound3d', title: '6-2 원기둥, 원뿔, 구', skillIds: unitRound3dSkills.map((s) => s.id) },
];

export function getSkill(skillId: string): SkillDef {
  const s = skillMap.get(skillId);
  if (!s) throw new Error(`unknown skill: ${skillId}`);
  return s;
}

export function generateProblem(skillId: string, seed: number = randomSeed()): Problem {
  return getSkill(skillId).generate(seed);
}

export * from './types';
export * from './fraction';
export { RNG, randomSeed } from './rng';
