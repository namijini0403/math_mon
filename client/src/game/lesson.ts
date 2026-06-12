/**
 * 출제 엔진
 * - 레슨 내 난이도 램프: 앞 1/3 기초 → 중간 보통 → 마지막 1/3 도전
 * - 기초 유지: 현재 난이도 단계의 정답률이 낮으면(50% 미만) 위 단계로 올라가지 않음
 * - 오답 retrieval: 최근에 틀린 유형을 25% 확률로 다시 출제 (복습 배지 표시)
 * - 보스전: HP가 깎일수록 난이도 상승 (마지막엔 도전 문제만)
 */

import { generateProblem, getSkill, randomSeed, SKILLS } from '../generator';
import type { Problem, SkillDef } from '../generator/types';
import type { StageDef } from './stages';
import type { SkillStat } from './store';

export interface Served {
  problem: Problem;
  /** 오답 복습으로 나온 문제인지 (UI 배지) */
  isReview: boolean;
  /** 보스전 제한시간(초) — 레슨이면 null */
  timeLimit: number | null;
}

/** 스킬의 최근 정답률 (시도 없으면 null) */
function accuracy(stat: SkillStat | undefined): number | null {
  if (!stat || stat.c + stat.w < 4) return null;
  return stat.c / (stat.c + stat.w);
}

/** 정답률이 낮을수록 가중치 ↑ (1.0 ~ 3.0) */
function weight(stat: SkillStat | undefined): number {
  if (!stat || stat.c + stat.w === 0) return 1.5;
  return 1 + 2 * (stat.w / (stat.c + stat.w));
}

function pickWeighted(entries: { skill: SkillDef; w: number }[]): SkillDef {
  const total = entries.reduce((s, e) => s + e.w, 0);
  let r = Math.random() * total;
  for (const e of entries) {
    r -= e.w;
    if (r <= 0) return e.skill;
  }
  return entries[entries.length - 1].skill;
}

/** 진행도(0~1) → 목표 난이도. 단, 현재 단계 정답률이 낮으면 그 단계에 머문다 */
function targetDifficulty(
  progress: number,
  skills: SkillDef[],
  stats: Record<string, SkillStat>,
): 1 | 2 | 3 {
  const wanted: 1 | 2 | 3 = progress < 1 / 3 ? 1 : progress < 2 / 3 ? 2 : 3;
  // 기초 유지 게이트: d단계로 올라가려면 d-1단계 스킬들의 정답률이 50% 이상이어야 함
  for (let d = 2 as 2 | 3; d <= wanted; d++) {
    const below = skills.filter((s) => s.difficulty === ((d - 1) as 1 | 2));
    const accs = below.map((s) => accuracy(stats[s.id])).filter((a): a is number => a !== null);
    if (accs.length > 0 && accs.reduce((x, y) => x + y, 0) / accs.length < 0.5) {
      return (d - 1) as 1 | 2;
    }
  }
  return wanted;
}

/** 난이도별 보스전 제한시간(초) — 쉬운 문제일수록 짧다 */
export function bossTimeLimit(difficulty: 1 | 2 | 3): number {
  return { 1: 15, 2: 25, 3: 45 }[difficulty];
}

/** 단원의 심화 스킬 (challenge: true) */
export function challengeSkillsOf(unitId: string): SkillDef[] {
  return SKILLS.filter((s) => s.unitId === unitId && s.challenge === true);
}

export function nextProblem(
  stage: StageDef,
  stats: Record<string, SkillStat>,
  /** 지금까지 맞힌 문제 수 */
  position: number,
  recentWrong: string[],
): Served {
  // ── 심화 탐험: 해당 단원의 심화 스킬만 출제 (없으면 도전 난이도 스킬로 대체) ──
  if (stage.type === 'challenge') {
    let pool = challengeSkillsOf(stage.unitId);
    if (pool.length === 0) {
      pool = SKILLS.filter((s) => s.unitId === stage.unitId && s.difficulty === 3);
    }
    const skill = pool[Math.floor(Math.random() * pool.length)];
    return { problem: generateProblem(skill.id, randomSeed()), isReview: false, timeLimit: null };
  }

  const progress = position / stage.problemCount;
  const stageSkills = stage.skillIds.map(getSkill);

  // ── 보스전 후반: 심화 문제 1~2개 혼합 (마지막 30% 구간에서 50% 확률) ──
  if (stage.type === 'boss' && progress >= 0.7) {
    const chPool = challengeSkillsOf(stage.unitId);
    if (chPool.length > 0 && Math.random() < 0.5) {
      const skill = chPool[Math.floor(Math.random() * chPool.length)];
      return {
        problem: generateProblem(skill.id, randomSeed()),
        isReview: false,
        timeLimit: 60, // 심화는 넉넉히
      };
    }
  }

  // 오답 retrieval: 첫 문제 이후 25% 확률로 최근 틀린 유형 재출제
  if (position > 0 && recentWrong.length > 0 && Math.random() < 0.25) {
    const skillId = recentWrong[Math.floor(Math.random() * recentWrong.length)];
    if (SKILLS.some((s) => s.id === skillId)) {
      const skill = getSkill(skillId);
      return {
        problem: generateProblem(skillId, randomSeed()),
        isReview: true,
        timeLimit: stage.type === 'boss' ? bossTimeLimit(skill.difficulty) : null,
      };
    }
  }

  // 보스전은 기초 유지 게이트 없이 무조건 난이도가 올라간다 (도전적이어야 함)
  const target: 1 | 2 | 3 =
    stage.type === 'boss'
      ? progress < 1 / 3
        ? 1
        : progress < 2 / 3
          ? 2
          : 3
      : targetDifficulty(progress, stageSkills, stats);

  // 목표 난이도의 스킬 우선, 없으면 가까운 난이도로
  let pool = stageSkills.filter((s) => s.difficulty === target);
  if (pool.length === 0) {
    pool = stageSkills.filter((s) => Math.abs(s.difficulty - target) === 1);
  }
  if (pool.length === 0) pool = stageSkills;

  // 복습 스킬은 낮은 가중치로 섞기 (레슨만)
  const entries = pool.map((skill) => ({ skill, w: weight(stats[skill.id]) }));
  if (stage.type === 'lesson') {
    for (const id of stage.reviewSkillIds) {
      const skill = getSkill(id);
      entries.push({ skill, w: weight(stats[id]) * 0.35 });
    }
  }

  const skill = pickWeighted(entries);
  return {
    problem: generateProblem(skill.id, randomSeed()),
    isReview: false,
    timeLimit: stage.type === 'boss' ? bossTimeLimit(skill.difficulty) : null,
  };
}
