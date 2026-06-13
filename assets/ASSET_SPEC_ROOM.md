# DRACONIS 에셋 명세 — 드래곤 방 배경 6단계 + 배치 장식 아이콘

> 공통 스타일 가이드(ASSET_SPEC.md)와 **반드시 동일 화풍**:
> "cute cartoon, dark indigo night, thick outlines, glowing accents, no text".
> 드래곤·보스·보물카드와 한 세계관으로 보여야 함. 채도·라이팅·외곽선 굵기 통일.
> 이미지가 없으면 앱이 코드 렌더 SVG로 폴백하므로 **파일명만 정확하면 자동 반영**(블로커 아님).

## 1. 방 배경 6단계 — `client/public/assets/dragon/room/`

가로형 장면. **권장 1024×640 PNG(불투명)**, 하단 1/3은 바닥(드래곤이 그 위에 섬), 상단은 벽/하늘.
드래곤 스프라이트가 중앙 위에 겹쳐지므로 **정중앙은 비교적 비워**둘 것. 단계가 오를수록 명확히 화려해져야 함(아이 동기 부여).

| 파일 | 단계 | 컨셉 프롬프트 |
|---|---|---|
| `tier0.png` | 지푸라기 둥지(외양간) | "cozy barn corner at night, warm straw nest on dirt floor, wooden fence posts, soft lantern glow, dark indigo background" |
| `tier1.png` | 아늑한 나무 둥지 | "small log-cabin nook, stacked timber wall, straw bedding, hanging warm lantern, indigo night" |
| `tier2.png` | 포근한 오두막 | "snug cottage interior, wooden walls, a glowing window, small rug, warm hearth light, dark indigo palette" |
| `tier3.png` | 튼튼한 벽돌집 | "brick house room with a fireplace and chimney smoke, two warm windows, sturdy and homey, indigo night" |
| `tier4.png` | 드래곤의 성 | "stone castle chamber, battlement window arches, hanging banners, torches, regal but cozy, indigo night glow" |
| `tier5.png` | 찬란한 궁전 | "golden palace hall, marble columns, golden domes, red velvet banners, sparkling chandeliers, majestic, indigo-gold night" |

## 2. 배치 장식 아이콘 — `client/public/assets/dragon/decor/`

**투명 배경 PNG, 256×256**, 정사각 안에 중앙 배치(여백 10%). 방 위에 올려도 떠 보이지 않게 바닥 그림자 약간.
같은 화풍(굵은 외곽선·은은한 발광). 아이콘 단독으로도 귀엽고 또렷해야 함.

| 파일 | 이름 | 컨셉 | 획득(예시 조건, 코드에서 확정) |
|---|---|---|---|
| `rug.png` | 별무늬 양탄자 | "round night-sky rug with star pattern" | 첫 보스 격파 |
| `torch.png` | 벽 횃불 | "wall torch with warm glowing flame" | 레슨 10개 |
| `chest.png` | 보물 상자 | "small treasure chest glowing gold" | 보물 카드 3장 |
| `plant.png` | 빛나는 화분 | "potted glowing magic plant" | 출석 10일 |
| `banner.png` | 드래곤 깃발 | "hanging pennant banner with dragon crest" | 보스 6마리 |
| `lantern.png` | 별빛 등불 | "floating star lantern" | 연속 7일 |
| `bookshelf.png` | 마법 책장 | "small bookshelf with glowing spellbooks" | 문장제 연습 3세트 |
| `cushion.png` | 포근한 방석 | "fluffy round cushion for the dragon" | 먹이 10번 |
| `crystal.png` | 수정 장식 | "glowing crystal cluster on a stand" | 심화 1회 클리어 |
| `trophy.png` | 명예의 트로피 | "golden trophy" | 단원평가 5회 |
| `painting.png` | 영웅 초상화 | "framed portrait of a hero, ornate gold frame" | 레벨 10 |
| `fountain.png` | 작은 분수 | "tiny ornamental fountain with glowing water" | 총괄평가 통과 |

## 우선순위
1. 방 배경 tier0~tier5 (가장 큰 시각 임팩트)
2. 장식 아이콘 12종

## 코드 연동 메모
- 방 배경: `DragonRoom`이 `assets/dragon/room/tierN.png`를 우선 표시, 실패 시 코드 SVG 폴백.
- 장식: 카탈로그는 `client/src/game/dragon.ts`의 `ROOM_DECOR`. 배치 상태는 store `dragon.placedDecor`.
  각 장식은 `src`(PNG) + 코드 SVG/이모지 폴백을 가져 PNG 부재 시에도 동작.
