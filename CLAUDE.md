# DRACONIS 작업 하네스 (AI 전용 — 모든 모델이 동일 품질을 내기 위한 규약)

석암초 초등수학 듀오링고풍 PWA. 모노레포: client(React19+Vite+TS+Tailwind4+zustand persist+PWA) / server(Hono+pg).
런타임 LLM 0원 — 문제는 전부 코드 파라메트릭 생성기. 기준은 항상 **2022 개정교육과정**.

## 0. 오케스트레이션 원칙 (토큰 최적화 — 사용자 상시 요구)

- 메인 모델(너) = 계획·프롬프트 작성·검증·통합·커밋만. **대량 구현은 Sonnet 서브에이전트**에 위임.
- 에이전트 프롬프트에 반드시 포함: ① 절대 git 커밋 금지 ② 수정 가능 파일 경계(병렬 시 겹침 0) ③ 참조 구현 파일 경로 ④ 아래 §2 불변식 전문 ⑤ 자체 검증 루프(통과까지 수정) ⑥ 완료 보고 형식.
- 공유 파일(generator/index.ts, game/stages.ts, game/xp.ts)을 만지는 에이전트는 **순차** 실행. 서로 다른 파일만 만지면 병렬 가능.
- 에이전트가 중간에 죽으면(API 오류·세션 한도): 남긴 파일을 git status로 확인 → "이어받기" 에이전트를 재가동 (기존 산출물 검수 지시 포함).
- 검증·수학적 정확성 판단·설계 결정은 절대 위임하지 않는다.

## 1. 학년/학기 콘텐츠 추가 파이프라인 (3~6학년 전 학기에 동일 적용됨)

1. **청사진 작성** (메인): `docs/g{N}-design.md` — 단원표(unitId/스테이지 접두사/UNIT_TITLES/스킬 목록), 보스 12종(이름·이모지·image 파일명), 학기 emoji. 기존 docs/g3-design.md, g4-design.md 형식 그대로.
2. **스테이지 접두사 충돌 확인** (메인): stages.ts에서 기존 접두사 grep. 중복 시 청사진 수정.
3. **구현 에이전트 2~4개 순차 가동** (학기당 2개, 단원 3개씩): 각 에이전트가 ① units/g{N}*.ts 생성기 작성 ② generator/index.ts 등록 ③ stages.ts에 스테이지(단원당 레슨 3~4+보스 1)·SEMESTERS·UNIT_TITLES ④ xp.ts BOSS_CARDS(메달용 colors/accent/emoji — 이미지 불필요) ⑤ tsc+vitest 전체 통과까지 자체 수정. 첫 에이전트가 SEMESTERS 항목 생성, 다음 에이전트가 units 배열 append.
   - SEMESTERS는 **학년 오름차순** 유지 (PracticePage가 누적 학기 풀 사용).
4. **심화는 자동**: CHALLENGE_STAGES가 단원마다 ch-{unitId}를 자동 생성, 심화 스킬 없으면 difficulty-3 폴백. (심화 스킬은 참고문제 명세 docs/challenge/*.md 있는 학기만 — 5·6학년 완료.)
5. **통합 검증** (메인): §3 체크리스트 → 커밋·푸시(main 푸시 = Pages 자동 배포).
6. **에셋 명세** (메인): `assets/ASSET_SPEC_G{N}.md` — 보스 이미지 12종 프롬프트 표. Codex가 제작·커밋(§4).

## 2. 생성기 불변식 (vitest가 스킬당 1000샘플 속성 테스트로 강제 — 위반=실패)

- `Math.random()` 금지 → `new RNG(seed)`만. 같은 seed = 같은 문제 (재현성).
- 분수 분모 ≤ 60 (10/100/1000/10000 예외). **해설(explanation)의 frac 토큰 포함 전부**.
- 대분수 토큰(whole 포함)은 분수부 0 < n < d → **계산 결과가 정수가 될 수 있으면 재시도로 걸러라** (동분모 덧뺄셈에서 잘 터짐).
- fill-blanks: blankAnswers는 양의 정수 1개 이상. choice: 보기 4개 값 유일·정답 1개. decimal-input: 정답×10000 정수, **계산은 정수 스케일**(×100 등)로 — 부동소수점 직접 연산 금지(3.14는 ×100 스케일).
- 파라미터 조합 60가지 미만이면 `minVariety: N`(실제 조합 수 이하) 명시.
- 재시도 루프는 **"폴백값으로 초기화한 let + for(tries<N) + 성공 시 일괄 대입 후 break"** 패턴만.
  `do { ... continue ... } while(조건)` 금지 — 첫 반복 continue 시 미할당/불일치 탈출하는 실버그 전력 있음.
- 정답은 솔버로 계산, 오답 보기는 실제 오개념 기반(분모끼리 더함, 몫·나머지 바꿈, 받아내림 누락 등).
- 원문 문제 복제 금지(유형만, 숫자·소재 파라메트릭). 그림 필수 유형(전개도·쌓기나무 3면도·그래프 이미지) 제외 — 표·수치는 텍스트 서술로(bar-/line-/graph- 스킬 참조).
- 학년 어휘 수준 준수. 소재는 모험/판타지, 검·피·잔인·징그러움 금지(학교용).

## 3. 검증 루프 (커밋 전 필수, 순서대로)

```
npx tsc --noEmit -p client && npx tsc --noEmit -p server
npx vitest run --root client          # 전체 — 기존 테스트 포함 100% 통과해야 함
npm run build -w client               # PWA 빌드
# 콘텐츠 추가 시: stages.ts 스테이지 id 중복 검사 (대시 포함 id 그룹핑), BOSS_CARDS 키 수 확인
```
- 부분 실행: `npx vitest run --root client -t "<스킬접두사>"`.
- 결과 화면·연출 변경 시: 플렉스 justify-center는 내용이 화면보다 길면 위가 잘림 → 상단 정렬+여백. 절대배치 별/배지는 글씨 겹침 전력 → 일반 플로우 선호.

## 4. Codex(이미지 제작) 협업 체제

- 이미지는 절대 직접 생성하지 않는다. `assets/ASSET_SPEC*.md`에 명세만 작성(파일명·해상도·투명배경·스타일 가이드 "cute cartoon, dark indigo night, thick outlines, glowing accents, no text"·컨셉 프롬프트 영문).
- Codex가 `client/public/assets/`에 제작물 커밋 → **앱은 emoji/플레이스홀더 폴백이라 이미지 부재가 블로커 아님**. 파일명만 코드와 일치하면 자동 반영.
- Codex가 새 에셋·manifest를 커밋해 두면: 코드 연결 여부를 grep으로 확인 → 미연결이면 연결 작업(에이전트 위임 가능). manifest.json을 새로 쓰는 경우 한글 라벨 인코딩 깨짐 주의(UTF-8 확인).
- 타로 카드류는 **제작 중단됨** — 인증은 코드 렌더 메달(MedalView), 이미지 필요 없음. 이미지가 필요한 것: 보스 본체, 드래곤 성장 일러스트, 보물카드(rewardCards).

## 5. 게임 경제·UX 불변 결정 (사용자가 명시 — 되돌리지 말 것)

- **보물 카드는 드물게**: 드롭 경로는 첫 학습 1장 / 보스 **첫** 격파 / 심화 **첫** 클리어 / 히든 미션(1회성)뿐. 재클리어는 XP·별만. 출석은 XP+과일만(카드 뽑기 없음).
- 흔한 보상은 배지·메달로. 인증카드(타로) 폐기됨 — PNG 저장은 보물카드 기준(renderTreasurePng).
- 스테이지는 무한 재도전 가능(시드 매번 새로), 별은 최고 기록 유지(Math.max).
- 단원 잠금은 단원별 독립(첫 스테이지 항상 열림), 심화 스테이지는 항상 열린 선택 트랙.
- 학기 탭 localStorage 'mathmon-semester', 기기 유형 'draconis-device' — **localStorage 키와 zustand persist 키('math-mon-save')는 저장 호환 위해 변경 금지**.
- 교사 확인 코드 '0403' (ProfilePage 체험 도구).

## 6. 분석(LA)·개인정보 불변 결정

- 이벤트는 client/src/analytics/ 화이트리스트(21종)만. **자유 텍스트·닉네임을 events에 절대 넣지 않는다.** 새 이벤트 타입 추가 시 클라 types.ts + 서버 /api/events 허용 목록 + 분석 DDL event_type_registry 3곳 동기화.
- 자유 텍스트(독서·일기)는 원문=운영 DB, 분석 DB엔 마스킹본+지표만 (docs/analytics-design.md §7).
- 분석 DB(Supabase #2)와 운영 DB(#1)는 별도 프로젝트 — 코드에서 풀 혼용 금지(db.ts analyticsPool).
- ANALYTICS_DB_URL 미설정 = no-op은 **법적 안전장치**(동의 전 수집 방지) — 우회 코드 금지.

## 7. 환경·커밋 규약

- Windows + PowerShell 5.1. **커밋 메시지에 큰따옴표 금지**(인자 깨짐) — 단따옴표 here-string `@'...'@` 사용, 닫는 `'@`는 0열.
- 커밋 메시지 한국어, 말미에 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` (모델명은 실제 모델로).
- main 푸시 = GitHub Pages 자동 배포(테스트 게이트 포함). Pages는 base '/math_mon/'(GHPAGES env), Railway는 루트·서버 포함.
- 참고문제/ 폴더는 저작권 원본 — gitignore 유지, 절대 커밋 금지.
- 사용자(교사)가 직접 할 일이 생기면 코드가 아니라 docs/TEACHER-TODO.md에 추가.
- 메모리: 프로젝트 결정 변경 시 ~/.claude .../memory/math-mon-decisions.md, la-infra.md 갱신.

## 8. 자주 쓰는 사실

- 테스트 수 기준선: 905개(2026-06-13). 줄어들면 뭔가 깨진 것.
- 학기: g3s1~g6s2 (g3는 본 문서 작성 시점 진행 중). 스테이지 접두사 전체 목록은 stages.ts grep이 정답.
- 문제 형식: choice / fraction-input / decimal-input / comparison / fill-blanks / matching.
- 난이도 램프: 레슨 앞1/3 d1→d2→d3, 기초유지 게이트(정답률<50% 시 상승 중지), 오답 retrieval 25%, 보스 후반 30%는 심화 50% 혼합.
- 드래곤: game/dragon.ts — GP 5단계(0/50/120/300/600), 속성 4종(해/달/별/숲), 성체 분기 보물카드 10장, 레어 엔딩 15장.
