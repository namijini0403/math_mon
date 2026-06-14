# DRACONIS 에셋 명세 — 성체 진화 방 (직업 아이템 + 레어/슈퍼레어 신화 공간)

> 공통 스타일 가이드(ASSET_SPEC.md)와 **동일 화풍**:
> "cute cartoon, dark indigo night, thick outlines, glowing accents, no text".
> 드래곤·보스·보물카드·기존 방(ASSET_SPEC_ROOM.md)과 한 세계관. 채도·라이팅·외곽선 굵기 통일.
> **이미지가 없으면 앱이 기존 6단계 방/이모지로 폴백** → 파일명만 정확하면 자동 반영(블로커 아님).

## 0. 이 명세서가 다루는 것 (꼭 읽기)

기존 방은 "아이템 수"에 따른 **6단계 집(tier0~5)** 이다(ASSET_SPEC_ROOM.md, 그대로 유지).
이 명세서는 드래곤이 **성체(완전 성장)로 진화**했을 때 방을 **확 바꾸는** 별도 레이어다.
성체 등급은 3단계 — **일반(common) → 레어(rare) → 슈퍼레어(super)**.

- **일반(common, 12직업):** 기존 6단계 방 배경은 그대로 두고, 그 위에 **직업 시그니처 아이템**(투명 PNG)을
  얹어 "이 방의 주인은 ○○가 되었구나"가 느껴지게 한다. → 방 **분위기가 확 바뀜**.
- **레어(rare, 4속성):** 방 배경 **자체를 교체**한다. 평범한 집이 아니라 **신화적 공간**.
- **슈퍼레어(super, 2종):** 레어보다 **훨씬 더 웅장·신화적**인 공간.

성체 캐릭터/미니미 일러스트는 별도 명세(ASSET_SPEC_DRAGON_COMMON12.md, ASSET_SPEC_DRAGON.md)에서 다룬다.
**여기서는 "공간(방)"만** 만든다.

**학교용 절대 금지:** 무기·피·상처·해골·공포·징그러움. 슈퍼레어 흑요석도 "웅장·장엄"이지 무섭지 않게.

---

## 1. 일반(common) — 직업 시그니처 방 아이템 12종

직업당 **시그니처 대형 아이템 1개**(우선순위 1) + **소형 액센트 1개**(우선순위 2).
**투명 배경 PNG.** 기존 방(tierN) 위에 올려도 자연스럽게 어울리고, 바닥 그림자 약간(떠 보이지 않게).
슬러그는 ASSET_SPEC_DRAGON_COMMON12.md와 **동일**:
`librarian, athlete, chef, gardener, painter, musician, astronomer, carpenter, doctor, baker, explorer, farmer`

### 1-A. 시그니처 대형 아이템 (우선순위 1) — `client/public/assets/dragon/room/adult/common/`
- 파일: `{슬러그}-main.png`
- 규격: **투명 배경 PNG, 768×768**. 방 한쪽(좌/우)에 세워질 큰 가구/설비. 정중앙은 드래곤·캐릭터 자리이므로 **한쪽에 치우친 구도** 권장.

| # | 슬러그 | 직업 | 시그니처 대형 아이템 컨셉 (cozy·따뜻·은은한 발광) |
|---|---|---|---|
| 1 | `librarian` | 사서 | 천장까지 닿는 마법 책장 벽, 펼쳐진 책 몇 권이 부드럽게 떠다님, 따뜻한 독서 등 |
| 2 | `athlete` | 운동선수 | 우승 트로피·메달이 늘어선 진열 선반, 위에 작은 우승 깃발 |
| 3 | `chef` | 요리사 | 따뜻한 부엌 화덕과 냄비가 걸린 선반, 김이 모락모락, 매달린 허브 다발 |
| 4 | `gardener` | 정원사 | 빛나는 화분이 가득한 작은 실내 정원 아치, 덩굴과 반딧불 |
| 5 | `painter` | 화가 | 이젤에 올린 캔버스 + 팔레트, 곁에 물감통·붓이 꽂힌 통 |
| 6 | `musician` | 음악가 | 작은 무대 코너에 악기 거치대(기타·바이올린), 떠다니는 음표 등불 |
| 7 | `astronomer` | 천문학자 | 커다란 황동 망원경 + 빛나는 천구의(성좌 지구본), 별 지도 한 장 |
| 8 | `carpenter` | 목수 | 튼튼한 목공 작업대 + 나무판자 더미, 벽에 가지런한 공구걸이 |
| 9 | `doctor` | 의사 | 따뜻한 진료 코너(약초·약병 선반) + 작은 침상, 안심되는 분위기 |
| 10 | `baker` | 빵집주인 | 갓 구운 빵이 진열된 따뜻한 빵 화덕·진열장, 밀가루 포대 |
| 11 | `explorer` | 탐험가 | 지도·나침반이 펼쳐진 모험 테이블 + 작은 텐트 코너, 등불·배낭 |
| 12 | `farmer` | 농부 | 수확물 바구니 + 건초더미, 채소가 놓인 선반과 세워둔 삽 |

### 1-B. 소형 액센트 (우선순위 2) — 같은 폴더
- 파일: `{슬러그}-accent.png`
- 규격: **투명 배경 PNG, 384×384**. 바닥/구석에 흩뿌릴 작은 소품(직업 느낌 보강).
- 컨셉(예): 사서=떠다니는 책 한 권 / 운동선수=메달 걸이 / 요리사=허브 다발 / 정원사=작은 물뿌리개 /
  화가=물감 튜브 / 음악가=음표 등불 / 천문학자=별 지도 / 목수=망치+줄자 / 의사=청진기+약병 /
  빵집주인=롤링핀+밀가루 / 탐험가=등불+나침반 / 농부=채소 바구니. (직업이 한눈에 들어오게.)

> 12명 직업·소품은 ASSET_SPEC_DRAGON_COMMON12.md의 캐릭터 설정과 **일관**되게(같은 소품 모티프).

---

## 2. 레어(rare) — 속성별 신화 공간 4종 (방 배경 교체)

레어 성체는 평범한 집을 벗어나 **신화적 공간**에 산다. 속성(sun/moon/star/forest)별 1장.
- 파일: `client/public/assets/dragon/room/adult/rare-{속성}.png`
  (`rare-sun.png`, `rare-moon.png`, `rare-star.png`, `rare-forest.png`)
- 규격: **불투명 PNG, 가로형 1024×640**. 기존 방과 동일하게 **하단 1/3은 바닥(캐릭터가 그 위에 섬)**,
  **정중앙은 비교적 비워**둘 것(드래곤/성체가 겹쳐짐). 6단계 방보다 **명확히 장엄·신비**.

| 속성 | 파일 | 공간 컨셉 (장엄·신비, 비폭력) |
|---|---|---|
| sun ☀️ | `rare-sun.png` | 여명의 성소 — 황금빛 일출 사원, 떠다니는 태양 원반, 따뜻한 빛기둥, 남청+금빛 |
| moon 🌙 | `rare-moon.png` | 월령의 신전 — 달빛 사원, 초승달 아치, 은빛 안개, 빛나는 달 오브, 남보라 |
| star ⭐ | `rare-star.png` | 성좌의 천문전 — 천체 관측 대전, 천장 가득한 성좌, 떠다니는 별 지도, 깊은 남색 |
| forest 🌿 | `rare-forest.png` | 세계수의 정원 — 거대한 빛나는 세계수, 덩굴과 이끼 계단, 반딧불, 에메랄드 발광 |

---

## 3. 슈퍼레어(super) — 전설의 공간 2종 (가장 웅장)

레어보다 **한 단계 더 압도적**으로. 화면을 가득 채우는 스케일·디테일·발광.
- 파일: `client/public/assets/dragon/room/adult/super-rainbow.png`, `super-obsidian.png`
- 규격: **불투명 PNG, 가로형 1024×640**. 하단 1/3 바닥 + 정중앙 비움 동일. **앱 최고 등급 비주얼.**

| 종류 | 파일 | 공간 컨셉 (최상위 신화, 비폭력) |
|---|---|---|
| 무지개(균형) 🌈 | `super-rainbow.png` | 창세의 무지개 대성전 — 무지개 빛다리, 4속성(해·달·별·숲) 원소 오브가 공중에 떠 도는 우주적 오로라 홀. 가장 화려·찬란 |
| 흑요석(편향) 🌑 | `super-obsidian.png` | 흑요석 뇌광의 옥좌전 — 검은 수정 기둥, 보랏빛 번개 아크, 금빛 장식의 장엄한 옥좌 공간. **웅장·장엄하되 무섭지 않게**(폭력·공포 요소 0) |

---

## 4. 파일명 총정리

```
# 일반 12직업 — 방 아이템 (투명, 기존 방 위에 오버레이)
client/public/assets/dragon/room/adult/common/{슬러그}-main.png    (768×768, 투명) ★우선
client/public/assets/dragon/room/adult/common/{슬러그}-accent.png  (384×384, 투명)
  슬러그: librarian athlete chef gardener painter musician astronomer carpenter doctor baker explorer farmer

# 레어 4속성 — 방 배경 교체 (불투명, 가로형)
client/public/assets/dragon/room/adult/rare-sun.png      (1024×640)
client/public/assets/dragon/room/adult/rare-moon.png
client/public/assets/dragon/room/adult/rare-star.png
client/public/assets/dragon/room/adult/rare-forest.png

# 슈퍼레어 2종 — 방 배경 교체 (불투명, 가로형, 최상위)
client/public/assets/dragon/room/adult/super-rainbow.png  (1024×640)
client/public/assets/dragon/room/adult/super-obsidian.png
```
총 **24+6 = 30 파일** (일반 12×2 + 레어 4 + 슈퍼 2). 제작 후 그대로 커밋.

## 5. 우선순위
1. **레어 4 + 슈퍼레어 2** (방 배경 교체 — 시각 임팩트 최대, 6장)
2. 일반 12 시그니처 `-main` (12장)
3. 일반 12 액센트 `-accent` (12장, 여유 시)

## 6. 마스터 스타일 프리픽스
- **공통:** "cute cartoon, dark indigo night palette, thick clean outlines, soft glowing accents,
  cohesive with a children's dragon-raising game, no text, no watermark"
- **레어/슈퍼:** 위에 + "epic mythical sanctum, awe-inspiring, magical light, grand scale" (단, 공포·폭력 금지)
- **일반 아이템:** 위에 + "cozy warm everyday object, soft shadow, gentle glow, transparent background"

## 7. 코드 연동 메모 (선생님/Stage 6에서 진행 — Codex는 제작만)
- 성체 등급/속성/직업 판정은 `client/src/game/dragonEvolution.ts`(rare id=`rare-{속성}-{form}`,
  super id=`super-{rainbow|obsidian}-{form}`; common은 현재 `{속성}-{form}` 8종 → **12직업으로 데이터모델 변경 예정**).
- `DragonRoom`/`DragonPage`가 성체 시 위 PNG를 우선 사용, 부재 시 기존 6단계 방으로 폴백.
- 한글 라벨 인코딩(UTF-8) 주의(manifest 새로 쓰는 경우). manifest는 필수 아님(파일명 규약으로 충분).
