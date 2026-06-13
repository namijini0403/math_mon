# 3학년 단원·스킬 설계 (2022 개정교육과정)

4·5·6학년과 동일 구성. 구현 파이프라인·불변식은 루트 `CLAUDE.md` 참조 (이 문서는 내용 청사진만).
3학년 특이점: **받아올림/내림·구구단 기반**이라 수 범위가 작음. 어휘는 3학년 수준(짧은 문장, 쉬운 낱말).

## 3-1 (semester id: g3s1, label '3학년 1학기', emoji 🐣)

units 순서: unitAdd3, unitPlane3, unitDiv3, unitMul31, unitTime3, unitFrac3

| 단원 | unitId | 스테이지 접두사 | UNIT_TITLES | 스킬(접두사)과 유형 |
|---|---|---|---|---|
| 1. 덧셈과 뺄셈 | unitAdd3 | a3 | '1. 덧셈과 뺄셈' | add3-: 세 자리 덧셈(받아올림 0→1→2회 램프), 세 자리 뺄셈(받아내림), 어림셈(몇백으로 어림, choice), □가 있는 식(덧뺄 역산), 문장제 |
| 2. 평면도형 | unitPlane3 | p3 | '2. 평면도형' | plane3-: 선분·직선·반직선 구분(choice), 도형에서 각·직각 개수(정사각형 4개 등 서술형), 직각삼각형 판별(choice), 직사각형·정사각형 둘레/변 역산, 문장제 |
| 3. 나눗셈 | unitDiv3 | d31 | '3. 나눗셈' | div3-: 똑같이 나누기 식 세우기, 곱셈식↔나눗셈식 관계(빈칸), 곱셈구구로 몫 구하기, 문장제 |
| 4. 곱셈 | unitMul31 | m31 | '4. 곱셈' | mul31-: (두 자리)×(한 자리) 올림 없음/있음, (몇십)×(몇), 어림(choice), 문장제 |
| 5. 길이와 시간 | unitTime3 | t3 | '5. 길이와 시간' | time3-: cm↔mm·km↔m 변환, 분↔초 변환, 시간의 덧셈(받아올림: 분→시), 시간의 뺄셈, 문장제 |
| 6. 분수와 소수 | unitFrac3 | f31 | '6. 분수와 소수' | frac3-: 전체-부분으로 분수 쓰기(서술→fraction-input), 단위분수 크기 비교(comparison), 분모 같은 분수 비교, 소수 한 자리(0.□ = □/10 관계), 소수 크기 비교, 문장제 |

보스(hp 10, image 'assets/boss/<파일>.png' — ASSET_SPEC_G3.md와 일치시킬 것):
a3-boss 받아올림 다람쥐 🐿️ squirrel3.png / p3-boss 직각 거북 🐢 turtle.png / d31-boss 나눔 비버 🦫 beaver.png / m31-boss 곱셈 꿀벌 🐝 bee.png / t3-boss 시계 토끼 🐇 clockrabbit.png / f31-boss 분수 케이크 요정 🧁 cupcake.png

## 3-2 (semester id: g3s2, label '3학년 2학기', emoji 🍄)

units 순서: unitMul32, unitDiv32, unitCircle3, unitFrac32, unitMeasure3, unitData3

| 단원 | unitId | 스테이지 접두사 | UNIT_TITLES | 스킬(접두사)과 유형 |
|---|---|---|---|---|
| 1. 곱셈 | unitMul32 | m32 | '1. 곱셈' | mul32-: (세 자리)×(한 자리), (몇십)×(몇십), (두 자리)×(두 자리), 문장제 |
| 2. 나눗셈 | unitDiv32 | d32 | '2. 나눗셈' | div32-: (몇십)÷(몇), (두 자리)÷(한 자리) 나머지 없음/있음, 검산식(나머지 역산), 문장제 |
| 3. 원 | unitCircle3 | c31 | '3. 원' | circ3-: 반지름↔지름 관계, 원의 중심·반지름 성질(choice), 원 여러 개 이어붙인 선분 길이(반지름 합산), 문장제 |
| 4. 분수 | unitFrac32 | f32 | '4. 분수' | frac32-: 전체의 분수만큼은 몇(묶음 계산: 12의 3/4), 진분수·가분수·대분수 분류(choice), 대분수↔가분수 변환(fraction-input), 분모 같은 분수·가분수 비교, 문장제 |
| 5. 들이와 무게 | unitMeasure3 | ms3 | '5. 들이와 무게' | meas3-: L↔mL 변환, kg↔g·t 변환, 들이의 덧셈·뺄셈(받아올림: mL→L), 무게의 덧셈·뺄셈, 알맞은 단위 고르기(choice: 물병 들이는 mL? L?), 문장제 |
| 6. 자료의 정리 | unitData3 | dt3 | '6. 자료의 정리' | data3-: 표를 텍스트 제시 → 합계·차, 그림그래프 계산(큰 그림=10·작은 그림=1 개수→값, 값→그림 개수 역산), 가장 많은/적은 항목(choice), 문장제 |

보스: m32-boss 곱셈 코끼리 🐘 elephant.png / d32-boss 나머지 햄스터 🐹 hamster.png / c31-boss 동그라미 물범 🦭 seal.png / f32-boss 가분수 캥거루 🦘 kangaroo.png / ms3-boss 저울 곰 🐻 bear3.png / dt3-boss 그래프 앵무 🦜 parrot.png

## 3학년 전용 주의사항

- 수 범위: 곱셈구구·세 자리 수 안에서. 4학년 스킬(g4MulDiv 등)과 난이도가 겹치지 않게 한 단계 아래로.
- 분수: 3-1은 분수 "개념"(전체-부분), 3-2에서 가/대분수 — **분모 ≤ 12** 권장 (불변식 60보다 보수적으로).
- 시간·들이·무게 계산은 fill-blanks 복수 빈칸(시/분, L/mL 두 칸) 가능 — blankAnswers 배열로.
- 그림그래프·표는 텍스트 서술로 제시 (기존 bar-/line- 스킬 참조). 컴퍼스 작도 등 그림 필수 유형 제외.
- SEMESTERS 삽입 위치: **배열 맨 앞** (g3s1, g3s2 → 기존 g4s1 앞). PracticePage가 누적 학기 풀을 쓰므로 학년 오름차순 유지 필수.
