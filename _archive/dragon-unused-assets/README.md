# 보관 에셋 (DRACONIS에서 미사용 — 다른 앱 재활용 대비)

2026-06-14 정리. 아래는 **코드 0참조**라 앱에서 빠진 이미지들. `client/` 밖이라
PWA 번들/배포에 포함되지 않는다. 필요하면 다시 가져다 쓰면 됨.

| 폴더 | 원위치 | 내용 | 뺀 이유 |
|---|---|---|---|
| `mascot/` | client/public/assets/mascot | 여우 마스코트 4종(cheer·default·happy·sad) | 응원 연출이 드래곤(CompanionCheer)으로 바뀌어 미사용 |
| `cards/` | client/public/assets/cards | 옛 카드 아트 14종(s1·s2·sd·sg·sm·sp-boss, tier1~8) | reward-cards 시스템으로 대체 |
| `dragon-mini-stages/` | client/public/assets/dragon/mini | stage1~3 (stage0은 로그인에서 사용해 유지) | 미사용 |
| `dragon-ending-old/` | client/public/assets/dragon/ending | adult-ending-{male,female}{,-character,-large} 6종 | ending-final 정본으로 대체 |

※ 그대로 두고 쓰는 것: boss/ 전부(보스 71종), dragon/ending/{해달별숲}-{dragon,human} 8종,
ending-final/front-ascend, rare·super·evolution-card, reward-cards 4세트 등.
