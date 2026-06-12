# 매스몬 추가 에셋 명세서 (2차 — 5-2학기 + 게임 요소)

> **기존 `ASSET_SPEC.md`의 공통 스타일 가이드를 그대로 적용** (cute cartoon, dark indigo night,
> thick outlines, glowing accents, no text). 이 문서는 추가분만 다룹니다.

## 1. 5-2학기 보스 6종 — `client/public/assets/boss/`

투명 배경 PNG, 1024×1024. "귀엽게 사악한" 톤 유지.

| 파일 | 보스 (단원) | 컨셉 프롬프트 |
|---|---|---|
| `witch.png` | 안개 마녀 (수의 범위와 어림하기) | "a mischievous witch floating in rounded fog clouds, holding a blurry crystal ball with fuzzy numbers" |
| `titan.png` | 케이크 타이탄 (분수의 곱셈) | "a giant golem made of stacked cake layers, slices missing like fractions, cherry crown" |
| `ghost.png` | 거울 유령 (합동과 대칭) | "a playful ghost emerging from an ornate hand mirror, its reflection mirrored symmetrically" |
| `ninja.png` | 소수점 닌자 (소수의 곱셈) | "a tiny ninja stealing a glowing decimal point dot, red scarf, sneaky pose" |
| `cube.png` | 큐브 제왕 (직육면체) | "a regal king made of stacked geometric cubes and boxes, tiny crown on a cube head" |
| `oracle.png` | 운명의 점술사 (평균과 가능성) | "a mysterious fortune teller with dice and a spinning probability wheel, purple robes" |

## 2. 5-2 보스 격파 카드 6종 — `client/public/assets/cards/`

540×620 불투명 (기존 카드와 동일 규격, 그림만 — 테두리/텍스트는 앱이 합성).

| 파일 | 카드 이름 | 프롬프트 |
|---|---|---|
| `sr-boss.png` | 안개를 걷는 자 | "hero walking out of parting fog holding a clear crystal lantern" |
| `sf-boss.png` | 타이탄 슬레이어 | "hero sitting on top of a defeated cake golem eating a victory slice" |
| `sy-boss.png` | 거울 파괴자 | "hero and their mirror reflection high-fiving through a cracked mirror frame" |
| `sdm-boss.png` | 닌자 사냥꾼 | "hero catching a tiny ninja in a glass jar, decimal point glowing inside" |
| `scb-boss.png` | 큐브 정복자 | "hero standing on a staircase of conquered cubes planting a flag" |
| `sa-boss.png` | 운명의 승부사 | "hero flipping a giant glowing coin while the fortune teller watches in awe" |

## 3. (선택) 출석 보물상자 — `client/public/assets/ui/`

현재는 이모지(🎁)로 동작하므로 선택 사항. 제작 시:

| 파일 | 크기 | 프롬프트 |
|---|---|---|
| `chest-closed.png` | 512×512 투명 | "a cute magical treasure chest, closed, soft glow leaking from the lid" |
| `chest-open.png` | 512×512 투명 | "the same treasure chest burst open with golden light and sparkles" |

## 4. (선택) 배지 아이콘

배지는 현재 이모지+색 테두리로 충분히 동작하므로 **제작 불필요**.
나중에 원하면 18종 배지를 64×64 투명 PNG로 (`client/public/assets/badges/{badge-id}.png`,
id 목록은 `client/src/game/badges.ts` 참고) — 앱 수정도 함께 필요하니 제작 전에 알려주세요.

## 우선순위

1. 5-2 보스 6종 (보스전 몰입감에 직접 영향)
2. 5-2 보스 카드 6종
3. 1차 명세서의 미완성분 (티어 카드 8종, 1학기 보스 6종, 마스코트)
4. 보물상자 (선택)
