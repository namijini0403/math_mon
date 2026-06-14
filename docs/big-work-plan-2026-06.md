# 대형 작업 계획 (2026-06-14 사용자 요청, compact 대비 박제)

> 사용자: "계획 세워 나눠서, CLAUDE.md대로 꼼꼼하게. compact 필요하면 말해라."
> 오케스트레이션(§0): 메인=계획·검증·통합·커밋, 대량 구현=Sonnet 위임, 수학/설계/검증=메인.

## 현황
- 심화(challenge)는 **5·6학년만** 실제 구현(challengeG5S1/S2, G6S1/S2). 3·4학년 ch-는 d3 폴백, 1·2학년 없음.
- 참고 원본: `참고문제/초등_최고수준수학_{2-1..6-2}_부록_교사_*.pdf` (gitignore, **저작권 원본 — 절대 커밋 금지, 유형만 추출**).
- 심화 명세: `docs/challenge/g5s1.md`·g5s2·g6s1·g6s2 (형식 = 단원별 ch-{n} 유형 서술).

## ✅ Stage 1 — 심화 토글 게이트 (완료, 커밋 0d86268)
`unitHasChallenge(unitId)`로 심화 스킬 있는 단원만 심화 노출(지도 노드+허브 모드). 1학년 영구 숨김, 2~4학년은 채워지면 자동 노출. STAGES/테스트 기준선 불변.

## Stage 2 — 2~4학년 심화 콘텐츠 채우기 ⭐ 가장 큼 (per-semester)
- 대상 학기 6개: 2-1, 2-2, 3-1, 3-2, 4-1, 4-2. (1학년 제외 — 토글 숨김으로 충분.)
- 절차(학기마다): ①메인이 해당 PDF 읽고 **2~3단계 유형만**(4단계 제외) 추출 → `docs/challenge/g{N}s{M}.md` 명세 작성(**숫자·표현 전부 새로, 원문 복제 금지, 유형/구조만**). ②Sonnet 서브에이전트가 `challengeG{N}S{M}.ts` 생성기 구현(challenge:true, difficulty:3, §2 불변식 준수) + generator/index.ts 등록(공유파일=순차). ③메인이 tsc+vitest+build+curriculumGuard 검증(해당 단원 AUDITED라 심화 풀이도 표기 가드 강제) → 커밋·푸시.
- 단원당 심화 스킬 3개 내외(기존 5·6학년과 동일 밀도). 그림 의존 유형은 figure로 그리거나 단순화/제외(§2).
- ⚠️ 학년 어휘·교육과정 수준 엄수(2학년은 곱셈기호 ×부터, 부등호는 말로 등 — curriculumGuard + docs/curriculum/g{N}.md 기준).

## Stage 3 — 보스전 UI 개편 (포켓몬GO식 봉인 연출)
- 사용자: 보스가 너무 작음 → 보스 크게·특징 부각. "문제로 잡아 봉인" 느낌. 문제 맞힐 때마다 보스 P(기력) 바가 깎임. **폭력 요소 0**(봉인·별가루 등 비폭력 연출).
- 대상: LessonPage 보스전 뷰. 보스 일러스트 확대 + 기력 게이지(맞히면 감소 애니) + 봉인 임팩트 연출. 패배 조건(오답 3·시간초과)은 유지.

## Stage 4 — 레벨업/진화 연출 (방과 따로 노는 UI 해결)
- 사용자: 첫 레벨업·성체 진화 시 **화면 가득 크게 → 다시 작아지며 방에 자연스럽게 안착**.
- 대상: DragonPage(성장/진화 트리거)·DragonRoom. 풀스크린 등장 후 스프링으로 방 슬롯에 축소 착지.

## Stage 5 — 각기둥/각뿔 전개도 figure 확장
- `prism-net`/`pyramid-net` figure kind 추가(옆면 직사각형 줄 + 밑면 n각형). 계산형 6학년 스킬에 연결. (cube-net-choice·cylinder-net은 완료=d1d2149.)

## Stage 6 — Codex 에셋 일괄 연결 (Codex 제작 완료 후)
- 미연결: evolution/mini 9, ending-final character/v1/v2, 성체 일반 12직업(ASSET_SPEC_DRAGON_COMMON12), teen-female.
- common 등급을 4속성×form(8) → 직업 12로 바꾸는 dragonEvolution/dragonArt/DragonPage 데이터모델 변경 포함.

## 권장 순서·compact
- **Stage 2(콘텐츠)는 PDF 6개 읽기+구현이라 매우 무거움 → 시작 전 compact 권장.**
- 추천: 2 → 3 → 4 → 5 → 6. (UI 먼저 원하면 3·4를 앞당겨도 됨.)
- 각 Stage 종료: tsc(c+s)→vitest→build→(가능시 Playwright)→커밋·푸시.
