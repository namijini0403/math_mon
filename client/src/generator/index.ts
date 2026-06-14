/** 생성기 공개 API — 스킬 레지스트리와 문제 생성 진입점 */

import { unitNum9Skills } from './units/g1Num9';
import { unitShape1Skills } from './units/g1Shape';
import { unitAddSub1Skills } from './units/g1AddSub';
import { unitCompare1Skills } from './units/g1Compare';
import { unitNum50Skills } from './units/g1Num50';
import { unitNum100Skills } from './units/g1Num100';
import { unitAS12aSkills } from './units/g1AS2a';
import { unitShape12Skills } from './units/g1Shape2';
import { unitAS12bSkills } from './units/g1AS2b';
import { unitClock1Skills } from './units/g1Clock';
import { unitAS12cSkills } from './units/g1AS2c';
import { unitNum3dSkills } from './units/g2Num3d';
import { unitFigure2Skills } from './units/g2Figure';
import { unitAddSub2Skills } from './units/g2AddSub';
import { unitLength2Skills } from './units/g2Length';
import { unitClassifySkills } from './units/g2Classify';
import { unitMulIntroSkills } from './units/g2MulIntro';
import { unitNum4dSkills } from './units/g2Num4d';
import { unitGuguSkills } from './units/g2Gugu';
import { unitLength22Skills } from './units/g2Length2';
import { unitTime2Skills } from './units/g2Time';
import { unitTableGraphSkills } from './units/g2TableGraph';
import { unitRule2Skills } from './units/g2Rule';
import { unitAdd3Skills } from './units/g3Add';
import { unitPlane3Skills } from './units/g3Plane';
import { unitDiv3Skills } from './units/g3Div';
import { unitMul31Skills } from './units/g3Mul';
import { unitTime3Skills } from './units/g3Time';
import { unitFrac3Skills } from './units/g3Frac';
import { unitMul32Skills } from './units/g3Mul2';
import { unitDiv32Skills } from './units/g3Div2';
import { unitCircle3Skills } from './units/g3Circle';
import { unitFrac32Skills } from './units/g3Frac2';
import { unitMeasure3Skills } from './units/g3Measure';
import { unitData3Skills } from './units/g3Data';
import { unitBigNumSkills } from './units/g4BigNum';
import { unitAngleSkills } from './units/g4Angle';
import { unitMulDivSkills } from './units/g4MulDiv';
import { unitMoveSkills } from './units/g4Move';
import { unitBarGraphSkills } from './units/g4BarGraph';
import { unitFindRuleSkills } from './units/g4FindRule';
import { unitFracAS4Skills } from './units/g4FracAS';
import { unitTriangleSkills } from './units/g4Triangle';
import { unitDecASSkills } from './units/g4DecAS';
import { unitQuadSkills } from './units/g4Quad';
import { unitLineGraphSkills } from './units/g4LineGraph';
import { unitPolygonSkills } from './units/g4Polygon';
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
import { challengeG2S1Skills } from './units/challengeG2S1';
import { challengeG2S2Skills } from './units/challengeG2S2';
import { challengeG3S1Skills } from './units/challengeG3S1';
import { challengeG3S2Skills } from './units/challengeG3S2';
import { challengeG4S1Skills } from './units/challengeG4S1';
import { challengeG4S2Skills } from './units/challengeG4S2';
import { challengeG5S1Skills } from './units/challengeG5S1';
import { challengeG5S2Skills } from './units/challengeG5S2';
import { challengeG6S1Skills } from './units/challengeG6S1';
import { challengeG6S2Skills } from './units/challengeG6S2';
import type { Problem, SkillDef, UnitDef } from './types';
import { randomSeed } from './rng';

/** 2022 개정교육과정 단원 순서 (1-1 → 1-2 → 2-1 → 3-1 → 4-1 → 4-2 → 5-1 → 5-2 → 6-1 → 6-2) */
export const SKILLS: SkillDef[] = [
  // ── 1-1 ──
  ...unitNum9Skills,
  ...unitShape1Skills,
  ...unitAddSub1Skills,
  ...unitCompare1Skills,
  ...unitNum50Skills,
  // ── 1-2 ──
  ...unitNum100Skills,
  ...unitAS12aSkills,
  ...unitShape12Skills,
  ...unitAS12bSkills,
  ...unitClock1Skills,
  ...unitAS12cSkills,
  // ── 2-1 ──
  ...unitNum3dSkills,
  ...unitFigure2Skills,
  ...unitAddSub2Skills,
  ...unitLength2Skills,
  ...unitClassifySkills,
  ...unitMulIntroSkills,
  // ── 2-2 ──
  ...unitNum4dSkills,
  ...unitGuguSkills,
  ...unitLength22Skills,
  ...unitTime2Skills,
  ...unitTableGraphSkills,
  ...unitRule2Skills,
  // ── 3-1 (전반) ──
  ...unitAdd3Skills,
  ...unitPlane3Skills,
  ...unitDiv3Skills,
  // ── 3-1 (후반) ──
  ...unitMul31Skills,
  ...unitTime3Skills,
  ...unitFrac3Skills,
  // ── 3-2 ──
  ...unitMul32Skills,
  ...unitDiv32Skills,
  ...unitCircle3Skills,
  ...unitFrac32Skills,
  ...unitMeasure3Skills,
  ...unitData3Skills,
  // ── 4-1 ──
  ...unitBigNumSkills,
  ...unitAngleSkills,
  ...unitMulDivSkills,
  ...unitMoveSkills,
  ...unitBarGraphSkills,
  ...unitFindRuleSkills,
  // ── 4-2 (전반) ──
  ...unitFracAS4Skills,
  ...unitTriangleSkills,
  ...unitDecASSkills,
  // ── 4-2 (후반) ──
  ...unitQuadSkills,
  ...unitLineGraphSkills,
  ...unitPolygonSkills,
  // ── 5-1 ──
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
  ...challengeG2S1Skills,
  ...challengeG2S2Skills,
  ...challengeG3S1Skills,
  ...challengeG3S2Skills,
  ...challengeG4S1Skills,
  ...challengeG4S2Skills,
  ...challengeG5S1Skills,
  ...challengeG5S2Skills,
  ...challengeG6S1Skills,
  ...challengeG6S2Skills,
];

const skillMap = new Map(SKILLS.map((s) => [s.id, s]));

export const UNITS: UnitDef[] = [
  { id: 'unitNum9', title: '1-1 9까지의 수', skillIds: unitNum9Skills.map((s) => s.id) },
  { id: 'unitShape1', title: '1-1 여러 가지 모양', skillIds: unitShape1Skills.map((s) => s.id) },
  { id: 'unitAddSub1', title: '1-1 덧셈과 뺄셈', skillIds: unitAddSub1Skills.map((s) => s.id) },
  { id: 'unitCompare1', title: '1-1 비교하기', skillIds: unitCompare1Skills.map((s) => s.id) },
  { id: 'unitNum50', title: '1-1 50까지의 수', skillIds: unitNum50Skills.map((s) => s.id) },
  { id: 'unitNum100', title: '1-2 100까지의 수', skillIds: unitNum100Skills.map((s) => s.id) },
  { id: 'unitAS12a', title: '1-2 덧셈과 뺄셈(1)', skillIds: unitAS12aSkills.map((s) => s.id) },
  { id: 'unitShape12', title: '1-2 여러 가지 모양', skillIds: unitShape12Skills.map((s) => s.id) },
  { id: 'unitAS12b', title: '1-2 덧셈과 뺄셈(2)', skillIds: unitAS12bSkills.map((s) => s.id) },
  { id: 'unitClock1', title: '1-2 시계 보기와 규칙 찾기', skillIds: unitClock1Skills.map((s) => s.id) },
  { id: 'unitAS12c', title: '1-2 덧셈과 뺄셈(3)', skillIds: unitAS12cSkills.map((s) => s.id) },
  { id: 'unitNum3d', title: '2-1 세 자리 수', skillIds: unitNum3dSkills.map((s) => s.id) },
  { id: 'unitFigure2', title: '2-1 여러 가지 도형', skillIds: unitFigure2Skills.map((s) => s.id) },
  { id: 'unitAddSub2', title: '2-1 덧셈과 뺄셈', skillIds: unitAddSub2Skills.map((s) => s.id) },
  { id: 'unitLength2', title: '2-1 길이 재기', skillIds: unitLength2Skills.map((s) => s.id) },
  { id: 'unitClassify', title: '2-1 분류하기', skillIds: unitClassifySkills.map((s) => s.id) },
  { id: 'unitMulIntro', title: '2-1 곱셈', skillIds: unitMulIntroSkills.map((s) => s.id) },
  { id: 'unitNum4d', title: '2-2 네 자리 수', skillIds: unitNum4dSkills.map((s) => s.id) },
  { id: 'unitGugu', title: '2-2 곱셈구구', skillIds: unitGuguSkills.map((s) => s.id) },
  { id: 'unitLength22', title: '2-2 길이 재기', skillIds: unitLength22Skills.map((s) => s.id) },
  { id: 'unitTime2', title: '2-2 시각과 시간', skillIds: unitTime2Skills.map((s) => s.id) },
  { id: 'unitTableGraph', title: '2-2 표와 그래프', skillIds: unitTableGraphSkills.map((s) => s.id) },
  { id: 'unitRule2', title: '2-2 규칙 찾기', skillIds: unitRule2Skills.map((s) => s.id) },
  { id: 'unitAdd3', title: '3-1 덧셈과 뺄셈', skillIds: unitAdd3Skills.map((s) => s.id) },
  { id: 'unitPlane3', title: '3-1 평면도형', skillIds: unitPlane3Skills.map((s) => s.id) },
  { id: 'unitDiv3', title: '3-1 나눗셈', skillIds: unitDiv3Skills.map((s) => s.id) },
  { id: 'unitMul31', title: '3-1 곱셈', skillIds: unitMul31Skills.map((s) => s.id) },
  { id: 'unitTime3', title: '3-1 길이와 시간', skillIds: unitTime3Skills.map((s) => s.id) },
  { id: 'unitFrac3', title: '3-1 분수와 소수', skillIds: unitFrac3Skills.map((s) => s.id) },
  { id: 'unitMul32', title: '3-2 곱셈', skillIds: unitMul32Skills.map((s) => s.id) },
  { id: 'unitDiv32', title: '3-2 나눗셈', skillIds: unitDiv32Skills.map((s) => s.id) },
  { id: 'unitCircle3', title: '3-2 원', skillIds: unitCircle3Skills.map((s) => s.id) },
  { id: 'unitFrac32', title: '3-2 분수', skillIds: unitFrac32Skills.map((s) => s.id) },
  { id: 'unitMeasure3', title: '3-2 들이와 무게', skillIds: unitMeasure3Skills.map((s) => s.id) },
  { id: 'unitData3', title: '3-2 자료의 정리', skillIds: unitData3Skills.map((s) => s.id) },
  { id: 'unitBigNum', title: '4-1 큰 수', skillIds: unitBigNumSkills.map((s) => s.id) },
  { id: 'unitAngle', title: '4-1 각도', skillIds: unitAngleSkills.map((s) => s.id) },
  { id: 'unitMulDiv', title: '4-1 곱셈과 나눗셈', skillIds: unitMulDivSkills.map((s) => s.id) },
  { id: 'unitMove', title: '4-1 평면도형의 이동', skillIds: unitMoveSkills.map((s) => s.id) },
  { id: 'unitBarGraph', title: '4-1 막대그래프', skillIds: unitBarGraphSkills.map((s) => s.id) },
  { id: 'unitFindRule', title: '4-1 규칙 찾기', skillIds: unitFindRuleSkills.map((s) => s.id) },
  { id: 'unitFracAS4', title: '4-2 분수의 덧셈과 뺄셈', skillIds: unitFracAS4Skills.map((s) => s.id) },
  { id: 'unitTriangle', title: '4-2 삼각형', skillIds: unitTriangleSkills.map((s) => s.id) },
  { id: 'unitDecAS', title: '4-2 소수의 덧셈과 뺄셈', skillIds: unitDecASSkills.map((s) => s.id) },
  { id: 'unitQuad', title: '4-2 사각형', skillIds: unitQuadSkills.map((s) => s.id) },
  { id: 'unitLineGraph', title: '4-2 꺾은선그래프', skillIds: unitLineGraphSkills.map((s) => s.id) },
  { id: 'unitPolygon', title: '4-2 다각형', skillIds: unitPolygonSkills.map((s) => s.id) },
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

/** 단원에 실제 심화(challenge) 스킬이 1개 이상 있는지 — 심화 UI 노출 게이트 */
export function unitHasChallenge(unitId: string): boolean {
  return SKILLS.some((s) => s.unitId === unitId && s.challenge === true);
}

export * from './types';
export * from './fraction';
export { RNG, randomSeed } from './rng';
