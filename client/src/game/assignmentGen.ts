/**
 * Phase D 단원평가 출제 엔진 — 교사가 배포하는 특별 시험의 문제 구성을 결정적으로 생성한다.
 *
 * 핵심: 시드(+학생 식별자)만 있으면 누구나 같은 문제 집합을 재현할 수 있다.
 *  - 반 전체 동일 시험: 같은 seed → 모두 같은 구성.
 *  - 학생별 다른 시험(약점 중심): seed를 학생별로 흔들어 변형 + 그 학생 약점 가중.
 * 교사 결과 보드는 저장된 (skillId, seed)로 학생이 푼 문제를 그대로 재현한다.
 *
 * 난이도 3단계 = 스킬 메타 매핑(2022 개정, 풀이 교육과정 가드와 별개):
 *  - 하(low)  = 계산 중심  : !challenge && !word
 *  - 중(mid)  = 문장제 중심 : !challenge &&  word
 *  - 상(high) = 심화 중심  :  challenge
 */

import { SKILLS } from '../generator';
import { RNG, randomSeed } from '../generator/rng';
import type { SkillDef } from '../generator/types';

export type DifficultyTier = 'low' | 'mid' | 'high';

export interface DifficultyMix {
  /** 계산 중심(하) 비율 */
  low: number;
  /** 문장제 중심(중) 비율 */
  mid: number;
  /** 심화 중심(상) 비율 */
  high: number;
}

export interface AssignmentConfig {
  /** 출제 대상 단원 id들 (1개 이상) */
  unitIds: string[];
  /** 총 문항 수 */
  count: number;
  /** 난이도 비율(합이 0만 아니면 정규화). 예: {low:1,mid:1,high:0} */
  mix: DifficultyMix;
  /** 약점 가중 출제 — skillStats/helpLog로 자주 틀린 유형을 더 자주 낸다 */
  weakWeight?: boolean;
}

export interface AssignmentItem {
  skillId: string;
  /** 문제 생성 시드 — generateProblem(skillId, seed)로 그대로 재현 */
  seed: number;
}

export type SkillStats = Record<string, { c: number; w: number }>;

/** 스킬을 난이도 3단계로 분류 */
export function tierOf(skill: SkillDef): DifficultyTier {
  if (skill.challenge) return 'high';
  if (skill.word) return 'mid';
  return 'low';
}

/** unitIds에 속한 스킬을 난이도 단계별 풀로 모은다 */
function poolsFor(unitIds: string[]): Record<DifficultyTier, SkillDef[]> {
  const pools: Record<DifficultyTier, SkillDef[]> = { low: [], mid: [], high: [] };
  const set = new Set(unitIds);
  for (const s of SKILLS) {
    if (set.has(s.unitId)) pools[tierOf(s)].push(s);
  }
  return pools;
}

/**
 * 비율 → 정수 문항 배분 (최대 잔여법). 합은 정확히 total.
 * 모든 비율이 0이면 균등 분배.
 */
export function allocate(mix: DifficultyMix, total: number): Record<DifficultyTier, number> {
  const tiers: DifficultyTier[] = ['low', 'mid', 'high'];
  let weights = tiers.map((t) => Math.max(0, mix[t]));
  let sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    weights = [1, 1, 1];
    sum = 3;
  }
  const exact = weights.map((w) => (w / sum) * total);
  const floor = exact.map((x) => Math.floor(x));
  let used = floor.reduce((a, b) => a + b, 0);
  // 잔여를 소수부 큰 순으로 1씩 분배
  const order = exact
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);
  let k = 0;
  while (used < total) {
    floor[order[k % order.length].i] += 1;
    used += 1;
    k += 1;
  }
  return { low: floor[0], mid: floor[1], high: floor[2] };
}

/** 빈 풀의 배정량을 비어있지 않은 풀로 이관 (우선순위 mid→low→high) */
function redistribute(
  alloc: Record<DifficultyTier, number>,
  pools: Record<DifficultyTier, SkillDef[]>,
): Record<DifficultyTier, number> {
  const out = { ...alloc };
  const priority: DifficultyTier[] = ['mid', 'low', 'high'];
  for (const tier of ['low', 'mid', 'high'] as DifficultyTier[]) {
    if (out[tier] > 0 && pools[tier].length === 0) {
      const moved = out[tier];
      out[tier] = 0;
      const target = priority.find((t) => pools[t].length > 0);
      if (target) out[target] += moved;
    }
  }
  return out;
}

/**
 * 약점 가중 픽 (결정적, RNG 사용).
 * 정답률이 낮을수록(틀린 비율↑) + 길잡이 별을 띄울수록 더 자주 뽑는다.
 */
function pickWeighted(
  pool: SkillDef[],
  rng: RNG,
  stats: SkillStats,
  helpLog: Record<string, number>,
): SkillDef {
  const entries = pool.map((s) => {
    const st = stats[s.id];
    const base = !st || st.c + st.w === 0 ? 1 : 1 + 2 * (st.w / (st.c + st.w));
    const w = base + Math.min(3, (helpLog[s.id] ?? 0) * 1.5);
    return { s, w };
  });
  const totalW = entries.reduce((a, e) => a + e.w, 0);
  let r = rng.float() * totalW;
  for (const e of entries) {
    r -= e.w;
    if (r <= 0) return e.s;
  }
  return entries[entries.length - 1].s;
}

/**
 * 시험 문제 구성을 결정적으로 생성한다.
 * 같은 (config, seed, stats)면 항상 같은 결과. count개를 항상 채운다(풀이 하나라도 있으면).
 */
export function buildAssignment(
  config: AssignmentConfig,
  seed: number,
  stats: SkillStats = {},
  helpLog: Record<string, number> = {},
): AssignmentItem[] {
  const count = Math.max(1, Math.min(50, Math.floor(config.count)));
  const pools = poolsFor(config.unitIds);
  // 풀이 전부 비었으면(잘못된 unitId) 빈 배열
  if (pools.low.length + pools.mid.length + pools.high.length === 0) return [];

  const alloc = redistribute(allocate(config.mix, count), pools);
  const rng = new RNG(seed >>> 0);
  const items: AssignmentItem[] = [];

  for (const tier of ['low', 'mid', 'high'] as DifficultyTier[]) {
    const pool = pools[tier];
    if (pool.length === 0) continue;
    for (let i = 0; i < alloc[tier]; i++) {
      const skill = config.weakWeight
        ? pickWeighted(pool, rng, stats, helpLog)
        : pool[rng.int(0, pool.length - 1)];
      items.push({ skillId: skill.id, seed: rng.int(1, 0x7fffffff) });
    }
  }

  // 난이도 오름차순으로 섞지 않고(낮→높 자연 정렬) 반환 — 시험은 쉬운 문제부터.
  return items;
}

/** 학생별 시드 — 같은 학생은 항상 같은 변형(재현 가능), 학생마다 다른 시험 */
export function studentSeed(baseSeed: number, studentKey: string): number {
  let h = baseSeed >>> 0;
  for (let i = 0; i < studentKey.length; i++) {
    h = (Math.imul(h ^ studentKey.charCodeAt(i), 0x01000193) >>> 0);
  }
  return h >>> 0;
}

export { randomSeed };
