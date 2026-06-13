/**
 * 드래곤 진화 — 보스 봉인 점수로 최종 캐릭터를 결정 (포켓몬/티니핑식 '봉인').
 *
 * - 보스는 '해치우는' 게 아니라 '봉인'한다. 각 보스는 고유의 봉인 속성·세기를 가지며,
 *   처음 봉인하는 순간 그 점수가 사용자(드래곤)에게 귀속된다.
 * - 누적 봉인 속성 분포 + 봉인한 보스 수가 성체 캐릭터를 결정한다.
 *   common(8) → rare(4 각성) → super-rare(2 전설). 보스를 모을수록 더 높은 티어로 '성장'한다.
 * - 난이도(점수) 조절: 한 학기 보스(~6)면 레어 가능, 두 학기(~12)+특수 조건이라야 슈퍼레어.
 *   → 엔딩을 자주 보지 못하고 꾸준히 해야 도달.
 */

import { AFFINITY_INFO, type Affinity } from './dragon';

const AFF_ORDER: Affinity[] = ['sun', 'moon', 'star', 'forest'];

/** 문자열 → 안정적 해시(양의 정수) */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * 보스 고유 봉인 — id로부터 고정된 속성·세기(3~5). 같은 보스는 항상 같은 값(재현성).
 * 보스마다 제각각이라 어떤 보스를 봉인했는지가 드래곤의 속성 분포를 만든다.
 */
export function bossSeal(bossStageId: string): { affinity: Affinity; power: number } {
  const h = hashStr(bossStageId);
  return { affinity: AFF_ORDER[h % 4], power: 3 + ((h >>> 2) % 3) }; // power 3~5
}

// ── 점수 임계값 (조절 포인트) ────────────────────────────────────────────────
/** 레어(각성) 도달 최소 봉인 보스 수 — 한 학기 보스 수 ≈ 6 */
export const SEAL_RARE_BOSSES = 6;
/** 슈퍼레어 도달 최소 봉인 보스 수 — 약 두 학기 분량 */
export const SEAL_SUPERRARE_BOSSES = 12;
/** 레어: 으뜸 속성이 2위의 1.4배 이상으로 뚜렷할 때 */
export const DOMINANCE_RARE = 1.4;
/** 슈퍼레어(편향형): 으뜸 속성이 2위의 2배 이상 */
export const DOMINANCE_SUPER = 2.0;
/** 슈퍼레어(균형형): 최저/최고 속성 비가 0.6 이상(네 속성 고루 높음) */
export const BALANCE_SUPER = 0.6;

export type EvolutionTier = 'common' | 'rare' | 'superrare';
export type AdultForm = 'human' | 'dragon';

export interface EvolutionResult {
  /** 캐릭터 고유 id (에셋·저장 키) */
  id: string;
  name: string;
  tier: EvolutionTier;
  emoji: string;
  /** 색·테마용 대표 속성 */
  affinity: Affinity;
  /** common만 형태 구분(인간형/드래곤형) */
  form?: AdultForm;
}

export function tierRank(t: EvolutionTier): number {
  return t === 'superrare' ? 2 : t === 'rare' ? 1 : 0;
}

// ── 레어(각성) 로스터 — 으뜸 속성별 1종 ──────────────────────────────────────
const RARE: Record<Affinity, { id: string; name: string; emoji: string }> = {
  sun: { id: 'rare-sun', name: '작열하는 태양 패왕룡', emoji: '☀️🐲' },
  moon: { id: 'rare-moon', name: '몽환의 월령 마도룡', emoji: '🌙🐲' },
  star: { id: 'rare-star', name: '천공의 성좌룡', emoji: '⭐🐲' },
  forest: { id: 'rare-forest', name: '세계수의 정령룡', emoji: '🌿🐲' },
};

// ── 슈퍼레어 로스터 — 2종(균형형/편향형) ─────────────────────────────────────
const SUPER_RAINBOW = { id: 'super-rainbow', name: '무지개 창세룡', emoji: '🌈🐉' };
const SUPER_OBSIDIAN = { id: 'super-obsidian', name: '흑요석 폭풍룡', emoji: '🌑🐉' };

/** 으뜸 속성 + 형태 → common 캐릭터 id (기존 mini/adult-{affinity}-{form}.png) */
export function commonId(affinity: Affinity, form: AdultForm): string {
  return `${affinity}-${form}`;
}

/**
 * 봉인 점수로 진화 결과 결정.
 * @param affinities 누적 봉인 속성 점수(보스 봉인 + 먹이 등)
 * @param sealedCount 봉인한(처음 잡은) 보스 수
 * @param rewardCardCount 보물 카드 종류 수(형태 결정: 10+ 인간형)
 */
export function decideEvolution(input: {
  affinities: Record<Affinity, number>;
  sealedCount: number;
  rewardCardCount: number;
}): EvolutionResult {
  const { affinities, sealedCount, rewardCardCount } = input;
  const sorted = AFF_ORDER.map((a) => [a, affinities[a] ?? 0] as [Affinity, number]).sort(
    (x, y) => y[1] - x[1],
  );
  const [topA, topV] = sorted[0];
  const secondV = sorted[1][1];
  const minV = sorted[3][1];
  const dominance = secondV > 0 ? topV / secondV : topV > 0 ? Infinity : 1;
  const balance = topV > 0 ? minV / topV : 0;
  const form: AdultForm = rewardCardCount >= 10 ? 'human' : 'dragon';

  // 슈퍼레어 — 두 학기+ 분량 봉인 + 특수 분포
  if (sealedCount >= SEAL_SUPERRARE_BOSSES && topV > 0) {
    if (balance >= BALANCE_SUPER)
      return { ...SUPER_RAINBOW, tier: 'superrare', affinity: topA };
    if (dominance >= DOMINANCE_SUPER)
      return { ...SUPER_OBSIDIAN, tier: 'superrare', affinity: topA };
  }
  // 레어(각성) — 한 학기+ 봉인 + 뚜렷한 으뜸 속성
  if (sealedCount >= SEAL_RARE_BOSSES && dominance >= DOMINANCE_RARE) {
    return { ...RARE[topA], tier: 'rare', affinity: topA };
  }
  // common — 으뜸 속성 × 형태
  const info = AFFINITY_INFO[topA];
  return {
    id: commonId(topA, form),
    name: form === 'human' ? info.adultHuman : info.adultDragon,
    tier: 'common',
    emoji: info.emoji + (form === 'human' ? '🧙' : '🐉'),
    affinity: topA,
    form,
  };
}
