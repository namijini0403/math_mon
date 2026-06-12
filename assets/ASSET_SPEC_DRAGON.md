# 매스몬 아트 명세서 3차 — 드래곤 육성 + 그림체 통일 (Codex용)

## 0. 세계관 & 그림체 통일 가이드 (모든 에셋 공통)

**세계관 한 줄:** *"수학의 별빛이 흐르는 밤하늘 왕국. 아이는 신비한 드래곤의 알을 맡아,
문제를 풀어 모은 별빛으로 드래곤을 키워 전설의 동반자로 성장시킨다."*

**그림체 기준은 `client/public/assets/reward-cards/`의 보물 카드 시리즈** (이미 제작된
Astral Compass, Celestial Sage 등). 모든 신규·재작업 에셋은 이 화풍에 맞춘다:

> **Master style prefix (모든 프롬프트 앞에):**
> "Luxurious storybook fantasy illustration, deep indigo night sky with golden starlight,
> ornate art-nouveau details, soft glowing magic, rich jewel tones, elegant and dreamy,
> suitable for children, no text, no watermark"

**절대 금지 (학교용 학습 앱):** 무기(검·창·화살), 피·상처, 해골, 공포스럽거나 징그러운 표현
(곤충 떼, 점액 등), 어두운 표정의 위협. 보스도 "장난꾸러기 라이벌" 느낌으로 귀엽게 사악하게.

**두 가지 해상도 체계:**
- **고급 일러스트** (위 마스터 스타일 그대로): 첫 화면, 엔딩, 카드, 보스전 배경용
- **미니미(SD/치비)**: 게임 플레이 중 표시. 같은 세계관·색감을 유지하되
  "chibi version of the same character, big head small body, simple soft shading,
  transparent background, sticker style" 를 덧붙여 제작

---

## 1. 드래곤 성장 단계 — 최우선 ⭐

> 드래곤 기본 디자인은 선생님이 따로 제공 예정. 아래는 **슬롯(파일 규격)** 명세.
> 디자인 시안이 정해지면 동일 캐릭터로 전 단계를 통일할 것.

### 1-A. 미니미 (게임 플레이용) — `client/public/assets/dragon/mini/`
투명 배경 PNG 768×768, 치비 스타일.

| 파일 | 단계 | 컨셉 |
|---|---|---|
| `stage0.png` | 신비한 알 | 별자리 무늬가 빛나는 알, 포근한 둥지 위 |
| `stage1.png` | 금이 간 알 | 금 사이로 황금빛이 새어 나오고 꼬리 끝이 빼꼼 |
| `stage2.png` | 아기 드래곤 | 알 껍질 모자를 쓴 아기, 크고 반짝이는 눈 |
| `stage3.png` | 어린 드래곤 | 작은 날개로 살짝 떠 있는 호기심 많은 어린이 |

### 1-B. 성체 8종 (속성 4 × 형태 2) — `client/public/assets/dragon/mini/`
투명 배경 PNG 768×768, 치비. 같은 드래곤이 속성에 따라 다르게 성장한 모습.

| 파일 | 속성/형태 | 컨셉 (색·소품) |
|---|---|---|
| `adult-sun-dragon.png` | ☀️ 태양·드래곤형 | 황금빛 비늘, 태양 문양 목걸이, 당당한 자세 |
| `adult-sun-human.png` | ☀️ 태양·인간형 | 금발에 작은 뿔과 꼬리가 남은 소년/소녀 기사단장, 망토(무기 없음) |
| `adult-moon-dragon.png` | 🌙 달·드래곤형 | 은보라 비늘, 초승달 무늬, 신비로운 안개 |
| `adult-moon-human.png` | 🌙 달·인간형 | 보랏빛 로브의 대마법사, 달 지팡이(별이 달린 부드러운 지팡이) |
| `adult-star-dragon.png` | ⭐ 별·드래곤형 | 푸른 비늘에 별자리가 빛나는 몸, 정밀한 느낌 |
| `adult-star-human.png` | ⭐ 별·인간형 | 별 망원경을 든 점성술사, 푸른 별 망토 |
| `adult-forest-dragon.png` | 🌿 숲·드래곤형 | 비취색 비늘, 꽃과 잎이 자라는 등, 온화한 미소 |
| `adult-forest-human.png` | 🌿 숲·인간형 | 잎사귀 왕관의 숲 수호자, 어깨에 작은 새 |

### 1-C. 엔딩 일러스트 8종 — `client/public/assets/dragon/ending/`
**고급 일러스트** (마스터 스타일), 불투명 1280×1810 (세로 카드 비율).
위 성체 8종과 1:1 대응 — 같은 캐릭터의 "전설이 된 순간"을 웅장하고 감동적으로.

| 파일 | 장면 컨셉 |
|---|---|
| `sun-dragon.png` / `sun-human.png` | 떠오르는 태양 위를 나는 황금룡 / 태양 왕좌 앞에 선 기사단장 |
| `moon-dragon.png` / `moon-human.png` | 보름달을 배경으로 비상하는 은빛룡 / 달의 탑 꼭대기의 대마법사 |
| `star-dragon.png` / `star-human.png` | 은하수를 가르는 별룡 / 별의 천문대에서 새 별자리를 그리는 점성술사 |
| `forest-dragon.png` / `forest-human.png` | 거대한 세계수를 휘감은 숲룡 / 빛나는 숲의 제단에 선 수호자 |

---

## 2. 과일 & 육성 아이템 (미니미 스타일)

### 과일 4종 — `client/public/assets/dragon/fruits/`
투명 PNG 512×512. 반짝이는 마법 과일 느낌.

| 파일 | 이름 | 컨셉 |
|---|---|---|
| `sun-apple.png` | 해사과 | 작은 태양처럼 빛나는 주황 사과 |
| `moon-grape.png` | 달이슬 포도 | 은보라색, 이슬방울이 맺힌 포도 |
| `star-berry.png` | 별열매 | 별 모양 단면이 보이는 푸른 열매 |
| `forest-melon.png` | 숲수박 | 잎무늬가 새겨진 비취색 수박 |

### 육성 아이템 10종 — `client/public/assets/dragon/items/`
투명 PNG 512×512.

| 파일 | 이름 | 컨셉 |
|---|---|---|
| `incubator.png` | 드래곤 부화기 | 별빛이 도는 유리 돔 둥지 |
| `warm-lamp.png` | 온기의 랜턴 | 부드러운 주황빛 마법 랜턴 |
| `first-meal.png` | 아기 수저 | 별 손잡이의 은수저 |
| `star-mobile.png` | 별빛 모빌 | 숫자·별이 도는 아기 모빌 |
| `story-book.png` | 이야기 그림책 | 금장식 동화책, 빛나는 페이지 |
| `brave-scale.png` | 용기의 비늘 | 태양빛 비늘 한 장 (방패 아님, 보석처럼) |
| `cloud-saddle.png` | 구름 안장 | 폭신한 구름 모양 안장 |
| `crown-seed.png` | 왕관 새싹 | 작은 금관 모양 꽃봉오리 새싹 |
| `treasure-pouch.png` | 보물 주머니 | 별자수 벨벳 주머니 |
| `rainbow-ribbon.png` | 무지개 리본 | 은은한 무지개빛 리본 |

---

## 3. 화면 배경 (고급 일러스트)

| 파일 | 용도 | 컨셉 |
|---|---|---|
| `client/public/assets/bg/title.png` | 첫 화면(로그인) | 1920×1080. 밤하늘 왕국 전경, 중앙에 빛나는 드래곤 알, 마스터 스타일 풀 퀄리티 |
| `client/public/assets/bg/boss.png` | 보스전 (재작업) | 기존 파일 교체. 마법 결계가 펼쳐진 별빛 투기장, 어둡되 무섭지 않게 |
| `client/public/assets/bg/map.png` | 유닛맵 (재작업) | 기존 파일 교체. 12개 단원 땅이 이어진 왕국 지도, 매우 어둡고 은은하게 (UI 가독성) |

---

## 4. 기존 에셋 재작업 (그림체 통일)

기존 `boss/`, `mascot/`, `cards/` 에셋을 마스터 스타일로 점진 교체.
**파일명·크기는 기존과 동일하게 덮어쓰기만 하면 됨.**

1. **보스 12종 재작업** — 기존 6종(`giant/golem/owl/dragon/demon/spider`) + 신규 6종
   (`witch/titan/ghost/ninja/cube/oracle`, 컨셉은 ASSET_SPEC_52.md 참조).
   전부 "귀엽게 사악한 장난꾸러기" 톤, 무기 금지. **각 보스당 미니미 버전도 추가**:
   `boss/mini/{이름}.png` (768×768 투명, 보스전 화면용).
2. **마스코트 여우 4종** — 세계관에 맞춰 "별빛 여우 안내자"로 재해석 (별 망토).
3. **티어 카드 8종 + 보스 카드 12종** — 보물 카드와 같은 화풍으로 통일.

---

## 5. 보상 카드 60종 확장 (진행 중인 작업)

현재 20종(`reward-cards/`)과 같은 화풍·규격으로 총 60종까지 확장.
- 등급 분포 권장: **커먼 36 / 레어 18 / 전설 6**
- 소재 풀: 마법 도구, 천체, 수학 유물(황금 컴퍼스·무한 모래시계류), 환상 정원,
  별자리 동물, 드래곤의 유산(알 화석, 첫 비늘...) — 세계관 안에서 자유롭게
- **`reward-cards/manifest.json`에 같은 형식으로 추가** (id는 `reward-{rarity}-{번호}`).
  매니페스트가 갱신되면 앱 코드에 바로 연결해 드림 (한국어 이름은 앱 쪽에서 붙임).
- 게임 규칙: 매일 출석 뽑기 1장 + 보스 격파 시 추가 획득(추후), **30장 이상 모으면 전설 엔딩 해금**

## 우선순위

1. 드래곤 미니미 단계 4종 + 성체 8종 (1-A, 1-B) — 게임의 심장
2. 과일 4종 + 아이템 10종
3. 엔딩 8종 + 첫 화면 배경
4. 보상 카드 60종 확장 (진행 중)
5. 기존 에셋 재작업 (보스→마스코트→카드 순)
