# 4학년 단원·스킬 설계 (2022 개정교육과정)

5·6학년과 동일 구성: 단원별 레슨 3~4개 + 보스 1개, 스킬은 difficulty 1~3 램프 + 문장제(-word).
심화 스테이지(ch-)는 CHALLENGE_STAGES가 자동 생성 — 심화 스킬이 없으면 difficulty-3 폴백으로 동작하므로 별도 작업 불필요.

## 공통 규칙

- 시드 RNG만 사용 (Math.random 금지), 정답은 솔버로 계산, 오답은 오개념 기반.
- fill-blanks 답은 양의 정수. decimal-input은 ×10000 정수(정수 스케일 계산). choice 4개 값 유일.
- 분수 분모 ≤ 60. 대분수 토큰 분수부 0 < n < d (정수 결과 재시도로 제거).
- 재시도 루프 = 폴백값 초기화 + for(tries) + 성공 시 일괄 대입 후 break.
- 그림 필수 유형 금지 — 표·수치는 텍스트로 서술 가능한 것만 (기존 unitGraph 스킬 참조).
- 4학년 어휘 수준. 소재는 모험/판타지, 검·피·잔인함 금지.

## 4-1 (semester id: g4s1, label '4학년 1학기', emoji 🌼)

units 순서: unitBigNum, unitAngle, unitMulDiv, unitMove, unitBarGraph, unitFindRule

| 단원 | unitId | 스테이지 접두사 | UNIT_TITLES | 스킬(접두사) |
|---|---|---|---|---|
| 1. 큰 수 | unitBigNum | bn | '1. 큰 수' | big-: 만·억·조 읽기/쓰기(choice), 자릿값(자릿수의 숫자가 나타내는 값), 뛰어 세기(fill-blanks), 크기 비교(comparison), 문장제 |
| 2. 각도 | unitAngle | ag | '2. 각도' | ang-: 예각·둔각·직각 분류(choice), 각도의 합·차(fill-blanks), 직선/완전한 바퀴에서 나머지 각, 삼각형 세 각의 합(나머지 각 구하기), 사각형 네 각의 합, 문장제 |
| 3. 곱셈과 나눗셈 | unitMulDiv | md | '3. 곱셈과 나눗셈' | md4-: (세 자리)×(몇십), (세 자리)×(두 자리), (두/세 자리)÷(몇십) 몫·나머지, (세 자리)÷(두 자리), 검산(나머지 역산), 문장제 |
| 4. 평면도형의 이동 | unitMove | mv | '4. 평면도형의 이동' | move-: 돌리기 누적(시계 방향 90°를 n번 = 몇 도/원위치), 뒤집기 2번 결과(choice), 디지털 숫자 180° 돌리기(0/1/2/5/6/8/9로 만든 수, fill-blanks), 이동 설명 고르기(choice), 문장제 |
| 5. 막대그래프 | unitBarGraph | bg | '5. 막대그래프' | bar-: 표를 텍스트로 제시(항목: 값 나열) → 가장 많은/적은 항목(choice), 두 항목 차(fill-blanks), 전체 합(fill-blanks), 눈금 한 칸 크기 역산, 문장제 |
| 6. 규칙 찾기 | unitFindRule | fr | '6. 규칙 찾기' | rule-: 수 배열 다음 항(등차·등비·증가폭 증가), 계산식 규칙(예: 1×9+2=11 패턴의 n번째), 도형 배열 개수(n번째 정사각형 수), 대응 규칙 역산, 문장제 |

보스(제안 — 자유 변경 가능, hp 10, image 'assets/boss/<영문>.png'):
bn-boss 수의 콜로서스 🏛️ / ag-boss 각도 매 🦅 / md-boss 계산 황소 🐂 / mv-boss 거울 나비 🦋 / bg-boss 그래프 펭귄 🐧 / fr-boss 규칙 스핑크스 🐈

## 4-2 (semester id: g4s2, label '4학년 2학기', emoji 🍂)

units 순서: unitFracAS4, unitTriangle, unitDecAS, unitQuad, unitLineGraph, unitPolygon

| 단원 | unitId | 스테이지 접두사 | UNIT_TITLES | 스킬(접두사) |
|---|---|---|---|---|
| 1. 분수의 덧셈과 뺄셈 | unitFracAS4 | f4 | '1. 분수의 덧셈과 뺄셈' | f4-: 분모 같은 진분수 덧셈/뺄셈, 대분수 덧셈(받아올림 유무), 대분수 뺄셈(받아내림), 1−진분수, (자연수)−(대분수), 문장제. ※모두 동분모! 분모 2~15 |
| 2. 삼각형 | unitTriangle | tr | '2. 삼각형' | tri-: 이등변삼각형 각 구하기(꼭지각/밑각), 정삼각형 변·둘레, 예각/직각/둔각삼각형 분류(세 각 제시, choice), 이등변 둘레에서 변 역산, 문장제 |
| 3. 소수의 덧셈과 뺄셈 | unitDecAS | da | '3. 소수의 덧셈과 뺄셈' | dec4-: 소수 두·세 자리 자릿값(숫자가 나타내는 값), 크기 비교(comparison), 소수의 덧셈(decimal-input), 뺄셈, 10배·1/10 관계, 문장제 |
| 4. 사각형 | unitQuad | qd | '4. 사각형' | quad-: 평행사변형 각·변 구하기, 마름모 성질(각/둘레), 사다리꼴·평행사변형·마름모 판별(choice), 둘레에서 변 역산, 문장제 |
| 5. 꺾은선그래프 | unitLineGraph | lg | '5. 꺾은선그래프' | line-: 표 텍스트 제시(시각: 값) → 변화량 최대 구간(choice), 두 시점 차(fill-blanks), 중간 시점 어림(물결선), 합계, 문장제 |
| 6. 다각형 | unitPolygon | pg | '6. 다각형' | pgon-: 정다각형 둘레(변 수×길이), 둘레에서 한 변 역산, 대각선 개수 n(n−3)/2, 정다각형 한 각(육각형 이하), 문장제 |

보스(제안): f4-boss 분수 토끼 🐰 / tr-boss 삼각 수리부엉이 🦉(이미 sp-boss가 🦉 → 다른 이모지 권장 🦚) / da-boss 소수점 수달 🦦 / qd-boss 사각 두더지 🦔 / lg-boss 꺾은선 학 🦢 / pg-boss 다각형 공작 🦚

## 통합 체크리스트 (메인 세션)

- SEMESTERS 배열 맨 앞에 g4s1, g4s2 삽입 (PracticePage가 누적 학기 풀을 쓰므로 순서 = 학년순).
- UNIT_TITLES 12개 추가, STAGES에 각 단원 레슨 3~4 + 보스 1.
- xp.ts BOSS_CARDS에 12개 보스 메달 추가 (colors/accent/emoji — MedalView용, 이미지 불필요).
- generator/index.ts에 단원 파일 import + SKILLS 등록.
- assets/ASSET_SPEC_G4.md — 보스 12종 이미지 명세 (Codex용, 이미지 없으면 emoji 폴백으로 동작).
