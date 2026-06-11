# 매스몬 이미지 에셋 명세서

이 문서만 있으면 어떤 이미지 생성 도구(Codex, Midjourney, DALL·E, Stable Diffusion 등)로도
필요한 에셋을 만들 수 있도록 작성했습니다. **완성된 PNG를 아래 경로에 넣으면 앱이 자동으로 사용합니다**
(에셋이 없으면 이모지/절차적 그래픽 플레이스홀더로 동작하므로, 일부만 넣어도 됩니다).

## 공통 스타일 가이드 (모든 프롬프트 앞에 붙이기)

> **Style prefix (영문):**
> "Cute cartoon game art for a children's math adventure app, vibrant colors on dark indigo
> night background (#1e1b4b), soft rounded shapes, thick outlines, glowing magical accents,
> Duolingo-meets-fantasy-RPG style, no text, no watermark"

- 전 에셋 동일 화풍 유지 (한 번에 같은 세션/시드로 뽑는 것을 권장)
- 텍스트·글자 없는 그림만 (이름/레벨 등은 앱이 코드로 합성)
- 초등학생 대상: 무섭지 않게, 보스도 "귀엽게 사악한" 느낌

## 1. 앱 아이콘 — `client/public/icons/`

| 파일 | 크기 | 배경 | 프롬프트 |
|---|---|---|---|
| `icon-512.png` | 512×512 | 불투명 | (스타일) + "app icon, a cute fox wizard holding a glowing number wand, centered, simple bold composition" |
| `icon-512-maskable.png` | 512×512 | 불투명, 중앙 80% 안에 주요 요소 | 위와 동일 + "safe margin around subject" |
| `icon-192.png` | 192×192 | 위 512를 축소 | — |

## 2. 마스코트 (여우 마법사) — `client/public/assets/mascot/`

투명 배경 PNG, 1024×1024.

| 파일 | 표정/포즈 | 프롬프트 추가 |
|---|---|---|
| `fox-default.png` | 기본, 미소 | "a cheerful fox wizard mascot, full body, waving" |
| `fox-happy.png` | 정답 축하 | "jumping with joy, confetti sparkles" |
| `fox-sad.png` | 오답 위로 | "gently encouraging, slightly worried but kind" |
| `fox-cheer.png` | 응원 | "cheering with a small flag" |

## 3. 보스 (단원별 1마리) — `client/public/assets/boss/`

투명 배경 PNG, 1024×1024. 각 보스당 1컷(기본)이 최소, 가능하면 피격(`-hit`)·패배(`-down`) 컷 추가.

| 파일 | 보스 | 컨셉 프롬프트 |
|---|---|---|
| `giant.png` | 계산의 거인 (혼합계산) | "a giant stone golem made of cracked number blocks, cute menacing grin" |
| `golem.png` | 약수 골렘 (약수와 배수) | "a robot golem built from interlocking gear-numbers, glowing blue core" |
| `owl.png` | 규칙 부엉이 (규칙과 대응) | "a mysterious owl professor with spiral pattern feathers, holding a rule scroll" |
| `dragon.png` | 분수 드래곤 (약분과 통분) | "a small chubby dragon whose belly is split like fraction pieces, green scales" |
| `demon.png` | 통분 마왕 (분수 덧뺄셈) | "a cute demon king juggling fraction pie slices, purple cape" |
| `spider.png` | 거미여왕 (다각형) | "an elegant spider queen weaving geometric polygon webs, jewel accents" |

## 4. 타로풍 인증카드 일러스트 — `client/public/assets/cards/`

**비율 중요:** 카드 중앙 창에 들어갈 일러스트만. 540×620 (가로:세로 ≈ 0.87), 불투명 배경.
테두리·별·이름·레벨은 앱이 합성하므로 **그림만**.

### 레벨 카드 (8티어)

| 파일 | 카드 이름 | 분위기 | 주 색상 | 프롬프트 |
|---|---|---|---|---|
| `tier1.png` | 새싹 모험가 | 시작, 희망 | 초록·라임 | "tarot card illustration, a tiny sprout adventurer with a wooden staff at dawn meadow" |
| `tier2.png` | 용감한 견습생 | 첫 도전 | 파랑·하늘 | "a young apprentice studying glowing runes by a blue lantern" |
| `tier3.png` | 분수의 기사 | 용기 | 보라 | "a knight whose shield is divided like fraction pieces, violet aura" |
| `tier4.png` | 통분의 마법사 | 지혜 | 핑크·자주 | "a magician balancing two glowing orbs to the same size, pink magic circle" |
| `tier5.png` | 숫자의 현자 | 통달 | 금색·호박 | "a sage surrounded by floating golden numbers and ancient books" |
| `tier6.png` | 별빛 수호자 | 신비 | 청록 | "a guardian holding a staff of starlight under aurora sky" |
| `tier7.png` | 달의 정복자 | 위엄 | 남색·은색 | "a conqueror standing on a crescent moon, silver cloak, indigo cosmos" |
| `tier8.png` | 수학의 전설 | 전설 | 진홍·금 | "a legendary hero crowned with golden laurel, radiant geometric halo" |

### 보스 격파 카드 (6종)

| 파일 | 카드 이름 | 프롬프트 |
|---|---|---|
| `sm-boss.png` | 계산의 거인 사냥꾼 | "a small hero standing triumphantly on a defeated stone giant's shoulder" |
| `sd-boss.png` | 골렘 파괴자 | "hero holding a glowing gear trophy from a broken robot golem" |
| `sp-boss.png` | 미로의 정복자 | "hero exiting a glowing spiral maze with an owl feather trophy" |
| `s1-boss.png` | 드래곤 슬레이어 | "hero high-fiving a tamed chubby green dragon, victory pose" |
| `s2-boss.png` | 마왕 정복자 | "hero holding the demon king's tiny crown, purple smoke" |
| `sg-boss.png` | 거미여왕 토벌자 | "hero wrapped in beautiful geometric silk ribbon, spider queen bowing" |

## 5. 배경 (선택) — `client/public/assets/bg/`

1920×1080, 어둡고 톤 다운된 배경 (UI 가독성 유지).

| 파일 | 용도 | 프롬프트 |
|---|---|---|
| `map.png` | 유닛맵 배경 | "a winding fantasy adventure path through six themed lands, night sky, very dark and subtle" |
| `boss.png` | 보스전 배경 | "a dark dungeon arena with magical torches, very dark, vignette" |

## 체크리스트

- [ ] PNG 형식, 지정 크기
- [ ] 마스코트/보스는 투명 배경, 카드/아이콘/배경은 불투명
- [ ] 글자 없음
- [ ] 전체 화풍 통일
- [ ] 파일명 정확히 일치 (소문자)
