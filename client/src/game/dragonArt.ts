/**
 * dragonArt — 게임 단계·배부름을 Codex 일러스트 경로에 매핑
 *
 * 성장 단계 매핑 (DRAGON_STAGES 기준):
 *   stage 0 (신비한 알, GP 0-49)   → egg-default
 *     GP 40+ (부화 임박)            → egg-light-default
 *     GP 45+ (직전)                 → cracked-default (연출)
 *   stage 1 (금이 간 알, GP 50-119)→ cracked-default
 *   stage 2 (아기 드래곤, GP 120-299) → toddler-default + mood 변형
 *   stage 3 (어린 드래곤, GP 300-599)
 *     GP 300-449                    → child-04-05-default + mood 변형
 *     GP 450+                       → child-07-10-default (GP 300~449) / preteen-11-14-default (GP 450+)
 *   stage 4 (완전한 성체, GP 600+, adult 미확정) → teen-default
 *   adult 확정 후                   → 기존 동작(이모지/기존 에셋)
 *
 * 무드 변형:
 *   fullness < 30  → hungry
 *   fullness >= 80 → best (toddler) / happy (child-04-05)
 *   그 외          → happy (toddler·child-04-05)
 * 활동 오버라이드:
 *   eat   → 먹이 주기 직후 잠깐 표시
 *   sleep → 기운 없는 상태에서 누워 쉬는 컷
 *   study → 학습/훈련 직후 표시할 수 있는 컷
 *   proud → 성취/칭찬 직후 표시할 수 있는 컷
 *   sad   → 실패/속상함 상태에서 표시할 수 있는 컷
 *   welcome → 입장/재회 시 표시할 수 있는 컷
 *   best    → 최고 기분·큰 성공 직후 표시할 수 있는 컷
 */

import { type DragonState, DRAGON_STAGES, AFFINITY_INFO, stageForGp } from './dragon';

export interface DragonArtResult {
  /** 공개 경로 (public/ 기준 상대경로). Pages base 에 맞춘 assets/... 형식 */
  src: string;
  /** img 로드 실패 시 표시할 이모지 */
  fallbackEmoji: string;
}

export type DragonArtActivity = 'eat' | 'sleep' | 'study' | 'proud' | 'sad' | 'welcome' | 'best';

/** fullness(0-100) 기준 toddler 무드 파일명 접미사를 반환 */
function toddlerMoodSuffix(fullness: number): string {
  if (fullness < 30) return 'hungry';
  if (fullness >= 80) return 'best';
  return 'happy';
}

/** fullness(0-100) 기준 child-04-05 무드 파일명 접미사를 반환 */
function child0405MoodSuffix(fullness: number): string {
  if (fullness < 30) return 'hungry';
  return 'happy';
}

/**
 * dragon 상태와 fullness(0-100)를 받아 Codex 일러스트 경로와 폴백 이모지를 반환.
 * adult 가 확정된 경우 src = '' 를 반환하며 기존 동작(이모지)으로 폴백.
 */
export function dragonArt(dragon: DragonState, fullness: number, activity?: DragonArtActivity): DragonArtResult {
  const stagesArr = DRAGON_STAGES as readonly {
    stage: number;
    name: string;
    emoji: string;
    minGp: number;
  }[];

  // 성체 → 진화 티어별 에셋. rare/super는 전용 폴더, common은 기존 mini/adult-*.png.
  if (dragon.adult) {
    const ad = dragon.adult;
    const ev = ad.evolution;
    const affinityEmoji = AFFINITY_INFO[ad.affinity].emoji;
    const formEmoji = ad.form === 'human' ? '🧑' : '🐉';
    const src =
      ev?.tier === 'rare'
        ? `assets/dragon/rare/${ev.id}.png`
        : ev?.tier === 'superrare'
          ? `assets/dragon/super/${ev.id}.png`
          : `assets/dragon/mini/adult-${ad.affinity}-${ad.form}.png`;
    return { src, fallbackEmoji: ev?.emoji || affinityEmoji + formEmoji };
  }

  const stage = stageForGp(dragon.gp);
  const gp = dragon.gp;

  // stage 0: 신비한 알
  if (stage === 0) {
    let artId: string;
    if (gp >= 45) {
      artId = 'cracked-default';
    } else if (gp >= 40) {
      artId = 'egg-light-default';
    } else {
      artId = 'egg-default';
    }
    return {
      src: `assets/dragon/evolution/full/${artId}.png`,
      fallbackEmoji: stagesArr[0].emoji,
    };
  }

  // stage 1: 금이 간 알
  if (stage === 1) {
    return {
      src: 'assets/dragon/evolution/full/cracked-default.png',
      fallbackEmoji: stagesArr[1].emoji,
    };
  }

  // stage 2: 아기 드래곤 → toddler + moods
  if (stage === 2) {
    const suffix = activity ?? toddlerMoodSuffix(fullness);
    // hungry / welcome / happy / best 파일 존재
    // welcome은 무드 조건 없이 여기선 미사용 (happy로 퉁)
    return {
      src: `assets/dragon/evolution/moods/toddler/toddler-${suffix}.png`,
      fallbackEmoji: stagesArr[2].emoji,
    };
  }

  // stage 3: 어린 드래곤
  if (stage === 3) {
    if (gp < 450) {
      // child-04-05 + moods
      const suffix = activity ?? child0405MoodSuffix(fullness);
      return {
        src: `assets/dragon/evolution/moods/child-04-05/child-04-05-${suffix}.png`,
        fallbackEmoji: stagesArr[3].emoji,
      };
    }
    if (gp < 550) {
      return {
        src: activity
          ? `assets/dragon/evolution/moods/child-07-10/child-07-10-${activity}.png`
          : 'assets/dragon/evolution/full/child-07-10-default.png',
        fallbackEmoji: stagesArr[3].emoji,
      };
    }
    return {
      src: activity
        ? `assets/dragon/evolution/moods/preteen-11-14/preteen-11-14-${activity}.png`
        : 'assets/dragon/evolution/full/preteen-11-14-default.png',
      fallbackEmoji: stagesArr[3].emoji,
    };
  }

  // stage 4: 완전한 성체 (adult 미확정)
  if (stage === 4) {
    return {
      src: activity
        ? `assets/dragon/evolution/moods/teen/teen-${activity}.png`
        : 'assets/dragon/evolution/full/teen-default.png',
      fallbackEmoji: stagesArr[4]?.emoji ?? '✨',
    };
  }

  // 예상 밖 단계 → 기본 이모지
  return {
    src: '',
    fallbackEmoji: '🐲',
  };
}

/**
 * DragonWidget 전용 mini 크기 이미지 경로 반환.
 * evolution/mini/ 폴더가 없으므로 full 이미지 경로를 그대로 사용하고
 * CSS 크기를 작게 렌더링하는 방식으로 처리.
 * adult 확정 시 기존 mini/stage*.png 경로 반환.
 */
export function dragonMiniArt(dragon: DragonState, fullness: number, activity?: DragonArtActivity): DragonArtResult {
  // adult 이전 단계는 dragonArt 와 동일 경로 (위젯에서 작게 렌더링)
  return dragonArt(dragon, fullness, activity);
}
