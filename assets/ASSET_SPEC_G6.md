# 매스몬 아트 명세서 4차 — 6학년 보스 12종 (Codex용)

> 스타일은 `ASSET_SPEC_DRAGON.md`의 마스터 가이드를 그대로 따름
> (storybook fantasy, 밤하늘 왕국 세계관, 귀엽게 사악한 톤, 무기·피·공포 금지).
> 보스 본체: 투명 PNG 1024×1024 → `client/public/assets/boss/`
> 보스 격파 카드: 540×620 불투명 → `client/public/assets/cards/` (파일명 = 스테이지 id)

## 6학년 1학기 보스

| 보스 파일 | 보스 | 컨셉 프롬프트 | 카드 파일 | 카드 이름 |
|---|---|---|---|---|
| `octopus.png` | 문어 선장 (분수의 나눗셈) | "a jolly octopus sea captain hugging treasure chests with all eight arms, sailor hat" | `fd1-boss.png` | 심해의 항해사 |
| `crystal.png` | 수정 정령 (각기둥과 각뿔) | "a gentle spirit made of floating prism and pyramid crystals, glowing facets" | `pr-boss.png` | 수정 정령의 친구 |
| `ringmaster.png` | 소수점 유랑단장 (소수의 나눗셈) | "a flamboyant circus ringmaster juggling glowing decimal points, top hat and cape" | `dd1-boss.png` | 유랑단의 별 |
| `foxmerchant.png` | 비율 여우 상인 (비와 비율) | "a sly but charming fox merchant with golden balance scales and coin pouches" | `rt-boss.png` | 황금 저울의 주인 |
| `chameleon.png` | 그래프 카멜레온 (여러 가지 그래프) | "a chameleon whose body shifts through pie-chart color segments, curious eyes" | `gr-boss.png` | 색깔의 지배자 |
| `whale.png` | 부피 고래 (부피와 겉넓이) | "a colossal friendly whale carrying glowing cube blocks on its back like a city" | `vl-boss.png` | 고래의 길잡이 |

## 6학년 2학기 보스

| 보스 파일 | 보스 | 컨셉 프롬프트 | 카드 파일 | 카드 이름 |
|---|---|---|---|---|
| `magician.png` | 역수 마술사 (분수의 나눗셈) | "an upside-down magician whose hat and cape flip mirror-wise, playing cards floating inverted" | `fd2-boss.png` | 마술사의 후계자 |
| `raccoon.png` | 소수점 너구리 (소수의 나눗셈) | "a mischievous raccoon sneaking away with a glowing decimal point in a lantern-lit shop" | `dd2-boss.png` | 너구리의 맞수 |
| `yeti.png` | 쌓기나무 예티 (공간과 입체) | "a fluffy friendly yeti stacking glowing ice blocks into towers on a snowy peak" | `spc-boss.png` | 설산의 친구 |
| `crab.png` | 비례 게 장군 (비례식과 비례배분) | "a proud general crab balancing golden weights on both claws like perfect scales" | `pp-boss.png` | 균형의 달인 |
| `wheel.png` | 바퀴 정령 (원의 넓이) | "a spirit living inside an ornate spinning wheel of starlight, circular halo patterns" | `cir-boss.png` | 원의 현자 |
| `carousel.png` | 회전목마 왕 (원기둥, 원뿔, 구) | "a whimsical king whose crown is a tiny carousel, cylinder cone and sphere shapes orbiting him" | `r3-boss.png` | 회전목마의 주인 |

## 비고

- 가능하면 각 보스의 **미니미 버전**도 함께: `boss/mini/{파일명}` 768×768 투명 (보스전 화면용).
- 우선순위는 드래곤(3차 명세) > 6학년 보스(이 문서) > 기존 에셋 재작업.
