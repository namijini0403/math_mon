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
import type { Problem, SkillDef, UnitDef } from './types';
import { randomSeed } from './rng';

/** 2022 개정교육과정 5학년 단원 순서 (1학기 → 2학기) */
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
];

const skillMap = new Map(SKILLS.map((s) => [s.id, s]));

export const UNITS: UnitDef[] = [
  { id: 'unitMix', title: '1. 자연수의 혼합 계산', skillIds: unitMixSkills.map((s) => s.id) },
  { id: 'unitDiv', title: '2. 약수와 배수', skillIds: unitDivSkills.map((s) => s.id) },
  { id: 'unitPattern', title: '3. 규칙과 대응', skillIds: unitPatternSkills.map((s) => s.id) },
  { id: 'unit1', title: '4. 약분과 통분', skillIds: unit1Skills.map((s) => s.id) },
  { id: 'unit2', title: '5. 분수의 덧셈과 뺄셈', skillIds: unit2Skills.map((s) => s.id) },
  { id: 'unitPoly', title: '6. 다각형의 둘레와 넓이', skillIds: unitPolySkills.map((s) => s.id) },
  { id: 'unitRange', title: '2학기 1. 수의 범위와 어림하기', skillIds: unitRangeSkills.map((s) => s.id) },
  { id: 'unitFracMul', title: '2학기 2. 분수의 곱셈', skillIds: unitFracMulSkills.map((s) => s.id) },
  { id: 'unitSym', title: '2학기 3. 합동과 대칭', skillIds: unitSymSkills.map((s) => s.id) },
  { id: 'unitDecMul', title: '2학기 4. 소수의 곱셈', skillIds: unitDecMulSkills.map((s) => s.id) },
  { id: 'unitCuboid', title: '2학기 5. 직육면체', skillIds: unitCuboidSkills.map((s) => s.id) },
  { id: 'unitAvg', title: '2학기 6. 평균과 가능성', skillIds: unitAvgSkills.map((s) => s.id) },
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
