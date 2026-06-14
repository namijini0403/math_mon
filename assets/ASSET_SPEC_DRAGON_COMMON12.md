# 매스몬 아트 명세서 — 성체 일반(common) 12직업 캐릭터 (Codex용)

## 0. 배경 (꼭 읽기)

매스몬은 아이가 드래곤을 키워 **전설의 동반자**로 성장시키는 학습 앱이다.
성체(완전 성장) 등급은 **일반(common) → 레어(rare) → 슈퍼레어(super)** 3단계.
- 레어/슈퍼레어는 이미 제작됨(신비로운 용+사람, `dragon/rare`·`dragon/super`·`dragon/evolution-card`).
- **이 명세서는 "일반(common)" 12종만 다룬다.**

**일반(common) 컨셉 — 기존 신비풍과 다르다:**
> 레어/슈퍼레어가 "신비로운 마법사·대현자"라면, **일반은 우리 주변의 다정한 어른들**이다.
> 용·뿔·꼬리·마법 로브 **없음**. 평범한 **직업을 가진 보통 사람**을, **편안하고 친근한
> 일상복/작업복**으로 그린다. ("열심히 했지만 평범하게 성장한" 따뜻한 엔딩 느낌.)

**학교용 절대 금지:** 무기·피·상처·해골·공포·징그러움. 모두 밝고 다정하게.

---

## 1. ⚠️ 직업–성별 고정관념 금지 (최우선 지침)

직업당 **1명**, 세트 전체 **남 6 / 여 6**. 아래 표의 **성별은 고정관념을 일부러 뒤집어**
배정했다. **반드시 표에 적힌 성별로** 그릴 것(임의로 바꾸지 말 것):
- 목수·천문학자·운동선수·탐험가·농부 = **여성**
- 사서·의사 = **남성**

추가 규칙:
- **피부색·머리색·체형을 12명이 골고루 다양하게** (다인종, 같은 톤 반복 금지).
- 성별을 과장하는 표현 금지(과한 화장·근육·몸매 강조 X). 직업 자체로 멋지게.
- 안경·체형·연령(20~40대 사이 다양)도 섞어서 자연스럽게.

---

## 2. 캐릭터 12종 (직업 · 성별 · 컨셉)

| # | 파일 슬러그 | 직업 | 성별 | 복장·소품·분위기 (편안·친근) |
|---|---|---|---|---|
| 1 | `librarian` | 사서 | **남** | 포근한 카디건/스웨터, 안경, 책 한 권을 펼쳐 든 채 따뜻한 미소. 옆에 책 몇 권 |
| 2 | `athlete` | 운동선수 | **여** | 트랙 점퍼/운동복, 운동화, 목에 메달 또는 물병. 활기차고 당당한 자세, 묶은 머리 |
| 3 | `chef` | 요리사 | **여** | 셰프 코트+앞치마, 두건/토크, 나무 주걱·냄비. 밝게 웃으며 살짝 묻은 밀가루 |
| 4 | `gardener` | 정원사 | **남** | 멜빵바지, 챙모자, 장갑, 물뿌리개·화분. 잎사귀 사이에서 온화한 미소 |
| 5 | `painter` | 화가 | **남** | 물감 묻은 앞치마, 팔레트와 붓, 편안한 셔츠. 느긋하고 창의적인 분위기 |
| 6 | `musician` | 음악가 | **남** | 캐주얼한 옷, 기타 또는 바이올린, 목에 헤드폰. 즐겁게 연주하는 느낌 |
| 7 | `astronomer` | 천문학자 | **여** | 포근한 재킷, 작은 망원경 또는 별 지구본, 안경. 호기심 가득 위를 바라봄 |
| 8 | `carpenter` | 목수 | **여** | 작업 앞치마+공구벨트, 망치·줄자와 나무판자, 걷어올린 소매. 자신감 있는 표정 |
| 9 | `doctor` | 의사 | **남** | 편한 옷 위 흰 가운, 청진기, 클립보드. 안심시키는 다정한 미소 |
| 10 | `baker` | 빵집주인 | **남** | 앞치마, 제빵사 모자, 갓 구운 빵 쟁반(크루아상 등). 발그레한 볼, 푸근함 |
| 11 | `explorer` | 탐험가 | **여** | 편안한 아웃도어 차림, 배낭, 지도·나침반, 챙모자. 모험심 가득한 환한 웃음 |
| 12 | `farmer` | 농부 | **여** | 멜빵바지/체크셔츠, 밀짚모자, 채소 바구니, 장화. 건강하고 활기찬 미소 |

> 색감은 앱 세계관(따뜻한 밤하늘 톤)과 어울리되, **로브·마법 장식은 넣지 말 것.**
> 부드러운 빛 번짐(soft glow) 정도의 은은한 동화풍 마감은 OK.

---

## 3. 각 캐릭터마다 3종 세트 (총 12 × 3 = 36 파일)

> 12명 모두 동일 인물로 3종을 일관되게(같은 얼굴·헤어·복장) 제작.

### 3-A. 미니미 (게임 플레이·동반자용) — `client/public/assets/dragon/common/mini/`
- 파일: `common-{슬러그}.png` (예: `common-librarian.png`)
- 규격: **투명 배경 PNG, 768×768, 치비/SD**.
- 프롬프트 꼬리: *"chibi sticker style, big head small body, simple soft shading,
  cheerful, full body, transparent background, no text"*
- 설정상 반드시 **성인**(소년·소녀로 보이면 안 됨). 직업 소품을 작게 하나 들려서 식별되게.

### 3-B. 성체 캐릭터 (카드급 디테일, 단독 전신) — `client/public/assets/dragon/common/character/`
- 파일: `common-{슬러그}.png`
- 규격: **투명 배경 PNG, 세로 인물, 1536×2048 권장(최소 1024 폭)**, 풀 디테일.
- 엔딩 화면에서 빛 연출과 함께 떠오르는 **주인공 단독 전신 일러스트**.
  카드 프레임 없이 캐릭터만(배경 투명). **청소년처럼 애매하지 않게, 분명한 성인.**
- 프롬프트 꼬리: *"detailed character illustration, full body, warm friendly,
  soft glowing accents, transparent background, no text, no watermark"*

### 3-C. 기념 카드 (수집용, 프레임 포함) — `client/public/assets/dragon/common/card/`
- 파일: `common-{슬러그}.png`
- 규격: **PNG, 1280×1810(세로 카드 비율)**. 배경/프레임 포함(투명 아님).
- `client/public/assets/reward-cards/`의 카드 화풍과 어울리는 **단정하고 예쁜 일반 등급 프레임**
  (레어/슈퍼레어보다 화려함은 절제). 캐릭터를 중앙에 크게, 직업이 느껴지는 배경 소품 약간.
- 하단에 영문/한글 제목 텍스트는 **넣지 말 것**(앱이 코드로 렌더). 카드 안에 글자 금지.

---

## 4. 파일명 총정리 (36개)

슬러그 12: `librarian, athlete, chef, gardener, painter, musician, astronomer, carpenter, doctor, baker, explorer, farmer`

```
client/public/assets/dragon/common/mini/common-{슬러그}.png        (768×768, 투명, 치비)
client/public/assets/dragon/common/character/common-{슬러그}.png   (1536×2048, 투명, 풀디테일)
client/public/assets/dragon/common/card/common-{슬러그}.png        (1280×1810, 프레임 포함)
```

제작 후 그대로 커밋하면 된다(앱은 이모지/기존 에셋 폴백이라 부재가 블로커는 아니며,
코드 연결은 선생님 쪽에서 별도로 진행). manifest는 필요 없음.

---

## 5. 마스터 스타일 프리픽스 (모든 프롬프트 앞)

> "Warm storybook character illustration, friendly and approachable adult,
> cute cartoon with thick clean outlines, soft glowing magical accents,
> cozy everyday clothing (NOT robes, NOT mystical armor, NO horns/tail/wings),
> rich but gentle colors, suitable for children, no text, no watermark"

여기에 3-A/3-B/3-C의 꼬리 문구와 표의 직업·성별·소품을 덧붙여 12명을 제작한다.
