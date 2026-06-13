# 1·2학년 단원·스킬 설계 (2022 개정교육과정)

3~6학년과 동일 구성. 파이프라인·불변식은 루트 `CLAUDE.md` 참조.

## 1·2학년 전용 원칙

- **이모지 = 시각 자료**: 그림 대신 prompt에 이모지 나열 활용 ("🍎🍎🍎🍎🍎 사과는 몇 개인가요?"). 이모지 소재 풀 10종 이상(🍎🍌🍇🐰🐶⭐🌸🚗⚽🎈 등)으로 다양성 확보 — minVariety는 (이모지 종류 × 수 범위)로 계산.
- 수 범위 엄수: 1학년은 받아올림 한 자리, 2학년은 두 자리·구구단. 어휘는 매우 짧고 쉬운 문장(한 문장 문장제).
- 문제 수: 레슨 problemCount 8 유지(짧은 문제라 부담 적음). choice 보기도 쉬운 오개념(1 차이, 자릿수 혼동).
- 시계·달력·길이는 텍스트 서술("짧은바늘이 3, 긴바늘이 12를 가리켜요. 몇 시인가요?").
- 그림 필수 유형(칠교 맞추기, 거울 모양, 자로 직접 재기, 쌓기나무 모양 보고 등) 제외.

## 1-1 (g1s1, label '1학년 1학기', emoji 🌷) — 5단원

units: unitNum9, unitShape1, unitAddSub1, unitCompare1, unitNum50

| 단원 | unitId | 접두사 | UNIT_TITLES | 스킬(접두사)과 유형 |
|---|---|---|---|---|
| 1. 9까지의 수 | unitNum9 | n9 | '1. 9까지의 수' | num9-: 이모지 세기(개수→fill-blanks), 수 순서(1 큰 수·1 작은 수·사이 수), 크기 비교(comparison), 몇째(서수: 앞에서 셋째는? choice), 문장제 |
| 2. 여러 가지 모양 | unitShape1 | sh1 | '2. 여러 가지 모양' | shape1-: 물건→모양 분류(choice: 공 모양⚽/상자 모양📦/둥근기둥 모양🥫 — 물건 풀 20종+), 같은 모양 물건 고르기, 모양별 개수 세기(이모지 나열), 문장제 |
| 3. 덧셈과 뺄셈 | unitAddSub1 | as1 | '3. 덧셈과 뺄셈' | as1-: 모으기·가르기(빈칸), 합 9 이하 덧셈, 9 이하 뺄셈, 0의 덧셈·뺄셈, □ 구하기, 문장제 |
| 4. 비교하기 | unitCompare1 | cp1 | '4. 비교하기' | comp1-: 개수 비교(이모지 두 묶음→더 많은 쪽 choice), 키·길이 비교 서술(셋 중 가장 ~한 것: 수치 단서 제시 choice), 더 많다/적다 어휘(choice), 문장제 |
| 5. 50까지의 수 | unitNum50 | n50 | '5. 50까지의 수' | num50-: 10개씩 묶음 n개+낱개 m개=?, 십몇 가르기, 50까지 수 순서, 크기 비교, 문장제 |

보스: n9-boss 숫자 병아리 🐤 chick.png / sh1-boss 모양 두더지? → 모양 문어 🐙(fd1 🐙 중복 허용) shapes-octo.png / as1-boss 모으기 너구리? → 덧셈 강아지 🐶 puppy.png / cp1-boss 비교 기린 🦒 giraffe.png / n50-boss 묶음 양 🐑 sheep.png

## 1-2 (g1s2, label '1학년 2학기', emoji ⭐) — 6단원

units: unitNum100, unitAS12a, unitShape12, unitAS12b, unitClock1, unitAS12c

| 단원 | unitId | 접두사 | UNIT_TITLES | 스킬 |
|---|---|---|---|---|
| 1. 100까지의 수 | unitNum100 | n100 | '1. 100까지의 수' | num100-: 몇십몇 구성(묶음·낱개), 수 순서·사이 수, 크기 비교, 짝수·홀수(choice), 문장제 |
| 2. 덧셈과 뺄셈(1) | unitAS12a | asa | '2. 덧셈과 뺄셈(1)' | as12a-: 받아올림 없는 (몇십몇)+(몇), (몇십몇)−(몇), (몇십)±(몇십), 세 수 계산, 문장제 |
| 3. 여러 가지 모양 | unitShape12 | sh2 | '3. 여러 가지 모양' | shape12-: 평면 모양 분류(choice: 네모/세모/동그라미 — 물건 풀 20종+), 모양 개수 세기(이모지), 본뜬 모양(상자를 본뜨면? choice), 문장제 |
| 4. 덧셈과 뺄셈(2) | unitAS12b | asb | '4. 덧셈과 뺄셈(2)' | as12b-: 10이 되는 더하기(빈칸), 10에서 빼기, 10을 이용한 세 수(7+3+5), 이어 세기 덧셈, 문장제 |
| 5. 시계 보기와 규칙 찾기 | unitClock1 | ck | '5. 시계 보기와 규칙 찾기' | clock1-: 몇 시(긴바늘 12 서술→fill-blanks), 몇 시 30분, 반복 규칙(이모지 패턴 🍎🍌🍎🍌… 다음은? choice), 수 배열 규칙(+1·+2·+5·+10), 문장제 |
| 6. 덧셈과 뺄셈(3) | unitAS12c | asc | '6. 덧셈과 뺄셈(3)' | as12c-: 받아올림 (몇)+(몇)=십몇, 받아내림 (십몇)−(몇), 덧뺄 관계식(빈칸), □ 구하기, 문장제 |

보스: n100-boss 백점 부엉이? → 100 거북 🐢(turtle 중복 — 숫자 고래 🐳) whale100.png / asa-boss 덧셈 판다 🐼 panda.png / sh2-boss 모양 개구리 🐸 frog.png / asb-boss 십 만들기 다람쥐 🐿️(squirrel3 중복 허용, 파일 ten-squirrel.png) / ck-boss 시계 수탉 🐓 rooster.png / asc-boss 받아올림 고양이 🐱 cat.png

## 2-1 (g2s1, label '2학년 1학기', emoji 🌈) — 6단원

units: unitNum3d, unitFigure2, unitAddSub2, unitLength2, unitClassify, unitMulIntro

| 단원 | unitId | 접두사 | UNIT_TITLES | 스킬 |
|---|---|---|---|---|
| 1. 세 자리 수 | unitNum3d | n3d | '1. 세 자리 수' | num3d-: 백·십·일 구성, 자릿값(3이 나타내는 값), 뛰어 세기(100·10·1씩), 크기 비교, 문장제 |
| 2. 여러 가지 도형 | unitFigure2 | fig | '2. 여러 가지 도형' | fig2-: 도형의 변·꼭짓점 수(삼각형~육각형), 도형 이름(choice), 도형 분류(이모지·서술), 원의 특징(choice), 문장제 |
| 3. 덧셈과 뺄셈 | unitAddSub2 | as2 | '3. 덧셈과 뺄셈' | as2-: 받아올림 (두 자리)+(두 자리), 받아내림 (두 자리)−(두 자리), 세 수 계산, □ 구하기(덧뺄 관계), 문장제 |
| 4. 길이 재기 | unitLength2 | ln2 | '4. 길이 재기' | len2-: cm 읽기·쓰기(서술), 뼘·연필 단위 세기(임의 단위: 몇 번?), 길이 어림·비교, 문장제 |
| 5. 분류하기 | unitClassify | cl2 | '5. 분류하기' | class2-: 기준에 따라 세기(이모지 목록→ 빨간 것 몇 개?), 분류 표 빈칸, 가장 많은 종류(choice), 문장제 |
| 6. 곱셈 | unitMulIntro | mi | '6. 곱셈' | muli-: 묶어 세기(2씩 5묶음=?), 몇의 몇 배, 곱셈식으로 나타내기(빈칸 2개 [a,b]), 덧셈식↔곱셈식, 문장제 |

보스: n3d-boss 백 단위 코뿔소 🦏 rhino.png / fig-boss 도형 펭귄 🐧(bg 🐧 중복 허용, figure-penguin.png) / as2-boss 받아올림 여우 🦊(rt 🦊 중복 허용, carry-fox.png) / ln2-boss 길이 악어 🐊 croc.png / cl2-boss 분류 판다? → 정리 코알라 🐨 koala.png / mi-boss 곱셈 문어 🐙 multi-octo.png

## 2-2 (g2s2, label '2학년 2학기', emoji 🎈) — 6단원

units: unitNum4d, unitGugu, unitLength22, unitTime2, unitTableGraph, unitRule2

| 단원 | unitId | 접두사 | UNIT_TITLES | 스킬 |
|---|---|---|---|---|
| 1. 네 자리 수 | unitNum4d | n4d | '1. 네 자리 수' | num4d-: 천 단위 구성, 자릿값, 뛰어 세기, 크기 비교, 문장제 |
| 2. 곱셈구구 | unitGugu | gg | '2. 곱셈구구' | gugu-: 2·5단, 3·6단, 4·8단, 7·9단(난이도 램프), 구구 빈칸(□×4=28), 0과 1의 곱, 문장제 |
| 3. 길이 재기 | unitLength22 | ln3 | '3. 길이 재기' | len22-: m↔cm 변환, 길이의 합(받아올림 [m,cm] 빈칸 2개), 길이의 차, 알맞은 단위(choice), 문장제 |
| 4. 시각과 시간 | unitTime2 | tk2 | '4. 시각과 시간' | time2-: 몇 시 몇 분(서술→빈칸 2개), 시간↔분 변환(1시간 30분=몇 분), 걸린 시간 계산, 하루·1주일·1년 단위(빈칸), 문장제 |
| 5. 표와 그래프 | unitTableGraph | tg | '5. 표와 그래프' | tbg2-: 자료 목록(이모지)→표 빈칸, ○그래프 높이 비교(텍스트), 합계, 가장 많은 항목(choice), 문장제 |
| 6. 규칙 찾기 | unitRule2 | rl2 | '6. 규칙 찾기' | rule2-: 수 배열 규칙 다음 수, 덧셈표·곱셈표 빈칸, 반복 모양 규칙(이모지, n번째는? choice), 쌓기 개수 규칙(1,3,5,…), 문장제 |

보스: n4d-boss 천 마리 학? → 사천왕 거위 🦢(lg 🦢 중복 허용, goose.png) / gg-boss 구구 공룡 🦕 dino.png / ln3-boss 미터 캥거루 🦘(kangaroo 중복 — 길이 지렁이 🐛 worm.png) / tk2-boss 시간 올빼미 🦉(sp 🦉 중복 허용, time-owl.png) / tg-boss 그래프 펠리컨 🦤? → 그래프 돌고래 🐬 dolphin.png / rl2-boss 규칙 카멜레온 🦎(gr 🦎 중복 허용, rule-chameleon.png)

## 통합 주의

- SEMESTERS 삽입: **g1s1, g1s2를 배열 맨 앞에**, 그 다음 g2s1, g2s2 → 기존 g3s1 앞. (학년 오름차순 필수 — PracticePage 누적 풀.)
- 1-1은 5단원(다른 학기와 달리 6이 아님) — UnitMapPage는 units 배열 길이에 의존하지 않으므로 문제 없음.
- 에이전트 분할: 학기당 1에이전트 × 4 (1학년 스킬은 단순해서 학기 전체 가능). 순차 실행.
