# DRACONIS 학습분석(LA) 인프라 설계

> 인천 석암초등학교 | 45학급 × 24명 ≈ 1,080명  
> 수학 PWA(DRACONIS)를 시작으로 독서·생활·영어 등 교내 전 앱의 학생 행동 로그를 수집·분석하는 인프라.  
> 인천시 최초 교내 LS/LA 사례 — 타 학교 확산 가능성 전제.

---

## 목차

1. [전체 아키텍처](#1-전체-아키텍처)
2. [분석 DB 스키마](#2-분석-db-스키마)
3. [운영 DB 변경](#3-운영-db-변경)
4. [가명화·법령 준수](#4-가명화법령-준수)
5. [인증·기기 등록](#5-인증기기-등록)
6. [교사 웹 대시보드 (3단계)](#6-교사-웹-대시보드-3단계)
7. [자유 텍스트 파이프라인 + 교내 게이트웨이 노드](#7-자유-텍스트-파이프라인--교내-게이트웨이-노드)
8. [리스크·미해결 질문](#8-리스크미해결-질문)
9. [로드맵](#9-로드맵)

---

## 1. 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│  학생 단말 (인천시 지급 노트북 + 개인 휴대폰)                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │  학생 PWA (React + Vite)                                │       │
│  │                                                         │       │
│  │  ┌─────────────────────────────────────────────────┐   │       │
│  │  │  Analytics Layer                               │   │       │
│  │  │  ① 화이트리스트 이벤트만 캡처                   │   │       │
│  │  │  ② IndexedDB 큐에 버퍼링                       │   │       │
│  │  │  ③ 30초 또는 50건마다 JWT Bearer 배치 전송      │   │       │
│  │  │  ④ 오프라인 시 큐 보존 → 재연결 시 재전송       │   │       │
│  │  └─────────────────────────────────────────────────┘   │       │
│  └─────────────────────────────────────────────────────────┘       │
└─────────────────────────┬───────────────────────────────────────────┘
                          │  HTTPS  JWT Bearer
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Hono / Railway  (운영 서버)                                         │
│                                                                     │
│  POST /api/events                                                   │
│  ① JWT 검증 (Bearer 토큰 → pseudonym_id 추출)                       │
│  ② 이벤트 스키마 검증 (Zod)                                         │
│  ③ pseudonym_id 부착 + server_ts = now() 주입                      │
│  ④ ANALYTICS_DB_URL 있으면 분석 DB INSERT                          │
│     없으면 no-op (콘솔 경고만)                                      │
│                                                                     │
│  POST /api/auth/join  (기존 + JWT 발급 추가)                        │
│  POST /api/auth/refresh  (refresh 토큰 → 새 access 토큰)           │
└───────────────────────┬─────────────────────────────────────────────┘
           │운영 DB      │분석 DB
           ▼             ▼
┌──────────────┐  ┌──────────────────────────────────────────────────┐
│ Supabase #1  │  │ Supabase #2  (분석 전용, Seoul 리전)             │
│ (운영 DB)    │  │                                                  │
│ public 스키마│  │ analytics 스키마                                 │
│ students     │  │ ├─ app_registry                                  │
│ progress     │  │ ├─ event_type_registry                           │
│ classes      │  │ ├─ pseudonym_registry                            │
│              │  │ ├─ events (월 RANGE 파티션)                      │
│              │  │ ├─ v_student_daily_summary (집계 뷰)             │
│              │  │ └─ v_skill_difficulty      (집계 뷰)             │
│ *접속키 분리*│  │ *접속키 완전 분리*                               │
└──────────────┘  └──────────────────────────────────────────────────┘

                  ┌──────────────────────────────────────────────────┐
                  │ 교사 웹 대시보드  (3단계)                         │
                  │ ① 분석 DB에서 가명 집계 fetch                    │
                  │ ② 교사 브라우저에 반별 CSV 로컬 업로드           │
                  │ ③ 메모리 내에서만 조인 (서버 전송 없음)          │
                  └──────────────────────────────────────────────────┘

                  ┌──────────────────────────────────────────────────┐
                  │ 교내 게이트웨이 노드  (자유 텍스트 단계)          │
                  │ ※ 학생 트래픽 경로에 인라인 배치하지 않음        │
                  │ Railway가 아웃바운드 전용 터널로 호출:           │
                  │ ① 자유 텍스트 2차 마스킹 (야간 배치, 로컬 LLM)  │
                  │ ② 외부 LLM API 프록시 (마스킹 통과본만 송출)    │
                  │ ③ 운영·분석 DB 암호화 백업 + 감사 로그 보관     │
                  └──────────────────────────────────────────────────┘
```

### 핵심 설계 원칙

| 원칙 | 내용 |
|------|------|
| **DB만으로 역추적 불가** | 분석 DB에는 실명·닉네임·원본 반코드가 없음. pseudonym_id(UUID)가 운영↔분석의 유일한 연결고리 |
| **save JSONB 미전송** | 운영 DB의 progress.save(전체 게임 상태)는 분석 DB에 절대 전송하지 않음 |
| **구조화 로그 = PII 불포함** | 수학 이벤트는 unit_id, skill_id, correct 등 구조화 데이터만 → LLM 비식별화 불필요(4단계까지 게이트웨이 불요) |
| **no-op 어댑터** | ANALYTICS_DB_URL 미설정 시 이벤트 수신 후 조용히 버림 — 동의 완료 전 수집 방지 |
| **인증 마찰 최소화** | QR 카드 첫 로그인 → 기기 등록 → 영구 자동 로그인 |

---

## 2. 분석 DB 스키마

### 2-1. 테이블 구성 요약

| 테이블 | 역할 |
|--------|------|
| `app_registry` | 앱 식별자 등록 (math, reading, english …) |
| `event_type_registry` | 이벤트 유형 버전 관리 (skill_attempt v1, v2 …) |
| `pseudonym_registry` | 가명 학생 정보 (실명·닉네임·원본 반코드 없음) |
| `events` | 모든 학습 행동 로그 (월 RANGE 파티션) |

### 2-2. pseudonym_registry

```sql
CREATE TABLE analytics.pseudonym_registry (
    pseudonym_id    UUID PRIMARY KEY,   -- 운영 DB students.pseudonym_id와 동일 값
    school_code     TEXT NOT NULL,      -- 'SEOAM' 등 학교 식별자
    anon_class_code TEXT NOT NULL,      -- HMAC-SHA256(class_code, HMAC_SECRET) 앞 16자
    grade           SMALLINT NOT NULL,  -- 학년만 보존 (반 번호 미보존)
    enrolled_at     DATE NOT NULL,
    left_at         DATE                -- 졸업/전학 시점
);
```

**준식별자 최소화**: grade(학년)만 보존, 반 번호는 HMAC 가명처리 후에도 미저장. 단독으로는 개인 특정 불가.

### 2-3. events (월 파티션 테이블)

```sql
CREATE TABLE analytics.events (
    event_id     UUID        NOT NULL,  -- 클라이언트 생성, 멱등 키
    pseudonym_id UUID        NOT NULL,
    event_type   TEXT        NOT NULL,  -- 'skill_attempt', 'stage_complete', ...
    app_id       TEXT        NOT NULL,  -- 'math', 'reading', ...
    app_version  TEXT,
    unit_id      TEXT,
    stage_id     TEXT,
    skill_id     TEXT,
    problem_id   TEXT,
    correct      BOOLEAN,
    score        SMALLINT,              -- 0~100
    elapsed_ms   INT,
    attempt_no   SMALLINT,
    stars        SMALLINT,              -- 0~3
    session_id   UUID        NOT NULL,
    semester_id  TEXT,                  -- 'g4s1', 'g5s2', ...
    device_type  TEXT,                  -- 'laptop', 'phone' (로그인 시 사용자 선택)
    policy_tag   TEXT,                  -- A/B 실험·정책 태그
    client_ts    TIMESTAMPTZ NOT NULL,
    server_ts    TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (server_ts);
```

**중복 방지**: `event_id UNIQUE` + `ON CONFLICT (event_id) DO NOTHING` — 네트워크 재전송으로 인한 중복 이벤트를 멱등하게 처리.

### 2-4. 인덱스 전략

| 인덱스 | 컬럼 | 용도 |
|--------|------|------|
| `idx_events_student_ts` | `(pseudonym_id, server_ts DESC)` | 학생별 시계열 조회 |
| `idx_events_stage_skill` | `(stage_id, skill_id)` | 단원·스킬별 난이도 분석 |
| `idx_events_type_ts` | `(event_type, server_ts DESC)` | 이벤트 유형별 집계 |
| `idx_events_session` | `(session_id)` | 세션 재구성 |
| `idx_events_policy` | `(policy_tag)` WHERE policy_tag IS NOT NULL | A/B 비교 (partial) |

### 2-5. RLS 정책

```
anon 역할      → 전면 차단 (SELECT/INSERT/UPDATE/DELETE 불가)
authenticated  → 전면 차단
service_role   → INSERT 허용 (서버 → 분석 DB 전송 전용)
analytics_reader → SELECT 허용 (교사 대시보드 읽기 전용)
```

교사 대시보드 백엔드는 `analytics_reader` 역할(별도 Supabase API key)로 연결.

### 2-6. 집계 뷰

**v_student_daily_summary** — 학생×날짜 단위 집계 (k-익명 주의: 개인 행으로 존재하나 교사 대시보드에서 반 단위 이상으로만 노출)

```
pseudonym_id | date | app_id | event_count | correct_count | total_elapsed_ms | sessions
```

**v_skill_difficulty** — 스킬별 정답률·소요시간 실측 집계

```
app_id | unit_id | skill_id | attempt_count | correct_rate | avg_elapsed_ms | p95_elapsed_ms
```

### 2-7. 규모 추정

| 항목 | 값 |
|------|-----|
| 학생 수 | 1,080명 |
| 연간 학습일 | 200일 |
| 1일 평균 이벤트 | 30건 |
| **연간 예상 행 수** | **≈ 650만 행/년** |
| 파티션 단위 | 월 RANGE (12 파티션/년) |
| 파티션 자동 생성 | pg_partman 또는 Supabase cron 함수 |

---

## 3. 운영 DB 변경

### 3-1. students 테이블 추가 컬럼

```sql
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS pseudonym_id   UUID UNIQUE DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS device_tokens  JSONB NOT NULL DEFAULT '[]';
```

**백필**: 기존 행에 `pseudonym_id = gen_random_uuid()` 설정 (가입 당시 값 없는 학생 대상).

```sql
UPDATE students SET pseudonym_id = gen_random_uuid() WHERE pseudonym_id IS NULL;
```

### 3-2. PIN 해시 scrypt 전환

현재 `pin_hash = SHA256(pin:class:nick)` — 무차별 대입에 취약.  
전환 계획:

| 단계 | 내용 |
|------|------|
| **1단계 (이번)** | 신규 가입자는 scrypt 적용. `pin_hash_v2` 컬럼 추가 |
| **2단계** | 로그인 성공 시 SHA256 검증 후 scrypt로 재해시 저장 |
| **3단계 (90일 후)** | `pin_hash_v2 IS NULL` 인 계정 비활성화 + `pin_hash` 컬럼 삭제 |

```sql
ALTER TABLE students ADD COLUMN IF NOT EXISTS pin_hash_v2 TEXT;
```

### 3-3. 운영↔분석 DB 연결고리

```
운영 DB: students.pseudonym_id  ←──→  분석 DB: pseudonym_registry.pseudonym_id
```

- 분석 DB 단독으로는 `pseudonym_id`만으로 실제 학생 특정 불가.
- 운영 DB 단독으로는 학습 이벤트 열람 불가.
- 두 DB의 **동시 접근 + 매핑 CSV**가 있어야만 역추적 가능 → 접근 통제 이중화.

---

## 4. 가명화·법령 준수

### 4-1. 준거 법령

| 조항 | 내용 |
|------|------|
| 개인정보보호법 제28조의2 | 가명정보 처리 특례 — 통계작성·연구·공익 목적 가능 |
| 개인정보보호법 제22조의2 | 14세 미만 법정대리인 동의 필수 (초등학생 전원 해당) |
| 개인정보보호법 제28조의8 | 국외 이전 시 사전 고지 및 동의 (Supabase AWS Seoul 리전 명기) |

### 4-2. 동의서 필수 8항목

1. **수집 항목**: pseudonym_id, 학년, 가명 반코드, 학습 이벤트(단원·스킬·정답 여부·소요시간 등), 기기 유형, 세션 ID
2. **수집·이용 목적**: 학습 분석 연구, 교육 품질 개선, 인천시 확산 연구 자료
3. **보유 기간**: 재학 기간 + 졸업 후 3년 후 파기
4. **제3자 제공**: 현재 없음 (연구 목적 제3자 제공 시 별도 동의)
5. **위탁 및 국외이전**: Supabase (AWS Seoul 리전, 대한민국 데이터 처리), Railway (운영 서버)
6. **가명 처리 사실**: 실명·원본 반코드 미수집, pseudonym_id(무작위 UUID)로 대체 처리
7. **열람·정정·삭제 청구 방법**: 담임교사 → 학교 개인정보보호책임자 경유
8. **거부 권리 및 불이익**: 수집 거부 가능, 거부 시 학습 앱 사용 가능하나 개인화 분석 기능 미제공

### 4-3. 매핑 CSV 관리 절차

```
매핑 CSV 구조: pseudonym_id, 실명, 학번(NEIS), 반, 번호
```

| 단계 | 절차 |
|------|------|
| **생성** | 행정실(NEIS 연동) 또는 담임교사가 최초 생성. 외부 이메일·클라우드 업로드 금지 |
| **배부** | 교내망 공유 폴더 또는 USB 전달. 인쇄본은 잠금 서랍 보관 |
| **갱신** | 전학·입학·졸업 시 담임교사가 개인정보보호책임자에게 신청 → 갱신 |
| **파기** | 졸업 3년 후 분석 DB `pseudonym_id` 기준 DELETE + 매핑 CSV 파쇄/덮어쓰기 삭제 |

### 4-4. 재식별 통제 체계

- **save JSONB 미전송**: 운영 DB의 전체 게임 상태(드래곤 덱, 카드 목록 등)는 분석 DB로 전송하지 않음
- **준식별자 최소화**: grade(학년)만 보존, 반 번호는 HMAC 가명화 후에도 미저장
- **k-익명 집계 뷰 검토**: 교사 대시보드 쿼리는 5명 미만 그룹을 `<5명`으로 표시 처리
- **졸업 파기 자동화**: Supabase cron으로 `left_at < now() - interval '3 years'` 행 DELETE + 알림 발송

### 4-5. 수집 시작 전 필수 체크리스트

- [ ] 개인정보처리방침 학교 홈페이지 공개
- [ ] 학부모 서면 동의 징수 완료 (법정대리인 서명)
- [ ] 학교 개인정보보호책임자 지정 문서화
- [ ] 교육청 공문 승인 수령
- [ ] `ANALYTICS_DB_URL` 환경변수 설정 (no-op 해제)

---

## 5. 인증·기기 등록

### 5-1. JWT 구조

| 토큰 | 유효기간 | 저장 위치 | 갱신 방법 |
|------|---------|----------|----------|
| access token | 1시간 | 메모리(Zustand) | refresh 토큰으로 자동 갱신 |
| refresh token | 90일 | localStorage + IndexedDB 이중 저장 | /api/auth/refresh |

**iOS Safari 대응**: Safari의 localStorage 7일 만료 정책 때문에 IndexedDB에도 이중 저장. PWA 설치(홈 화면 추가) 유도 시 제한 없음.

### 5-2. 첫 로그인 흐름 (QR 카드)

```
담임교사 → QR 카드 배부 (반코드 + 학생코드 인쇄)
         ↓
학생 → PWA에서 QR 스캔 또는 코드 직접 입력
         ↓
PIN 4자리 설정 (신규) 또는 입력 (기존)
         ↓
서버: 학생 생성/검증 → access + refresh 토큰 발급 → pseudonym_id 포함
         ↓
기기 등록: device_tokens에 {device_id, device_type, registered_at} 추가
         ↓
이후 앱 진입 시 자동 로그인 (토큰 갱신만)
```

### 5-3. 기기 유형 선택

로그인 시 사용자가 직접 선택:

```
[노트북]  [휴대폰]
```

선택 값이 `device_type` 필드로 모든 이벤트에 자동 부착.  
→ 기기별 학습 패턴 분석(노트북 vs 휴대폰) 가능.

### 5-4. 다중 기기 지원

- 노트북/휴대폰 각각 독립 등록 가능
- device_tokens JSONB 배열: 기기 수 제한 없음 (분실 시 교사가 특정 기기 토큰 무효화 가능)

---

## 6. 교사 웹 대시보드 (3단계)

### 6-1. 아키텍처 — 개인정보 서버 미전송 원칙

```
교사 브라우저
│
├── ① 분석 DB에서 가명 집계 fetch (analytics_reader 키)
│       결과: { pseudonym_id, date, skill_id, correct_rate, ... }
│
├── ② 반별 매핑 CSV 로컬 업로드 (파일 선택 → FileReader API)
│       결과: { pseudonym_id → 실명, 번호, 반 }  (메모리 내 Map)
│
├── ③ 브라우저 메모리에서 JOIN
│       가명 집계 × 매핑 Map → 화면 렌더링
│
└── [서버로 실명 전송 없음] ← 핵심 보안 원칙
```

### 6-2. 화면 5종

| 화면 | 내용 |
|------|------|
| **학급 개요** | 반 전체 XP 추이, 활성 학생 수, 일별 이벤트 수 |
| **학생 상세 히트맵** | 학생별 스킬×날짜 히트맵 (정답률 색상) |
| **단원 난이도 실측** | v_skill_difficulty 기반, 정답률·소요시간 분포 |
| **종단 변화** | 학기 초→말 정답률 변화, 이탈 위험 학생 (연속 0일 알림) |
| **policy_tag 전후·A/B 비교** | policy_tag 기준 이전/이후 지표 비교 (이벤트 분포, 정답률 변화) |

---

## 7. 자유 텍스트 파이프라인 + 교내 게이트웨이 노드

> 2026-06-13 개정: 독서·생활지원(감사 일기 등) 앱이 **조기 도입**될 예정이라 자유 텍스트 설계를 앞당기고,
> 외부 검토안(인라인 프록시 + GPU 워크스테이션)을 반영·수정함.

### 7-1. 배치 원칙 — 인라인 프록시는 채택하지 않음

"학생 앱 → 교내 프록시 → 외부"처럼 교내 서버를 **트래픽 경로 중간에 인라인 배치하는 안은 우리 구조와 충돌**한다:

| 문제 | 이유 |
|------|------|
| 외부망 접속 | 학생은 휴대폰·가정에서도 접속 → 교내 서버가 경로에 있으면 학교망 **인바운드 개방**(포트포워딩) 필요. 행정·보안상 사실상 불가 |
| 단일 장애점 | 정전·방학·네트워크 장애 = 전체 서비스 다운. 클라우드(Railway) 가용성을 교내 장비 수준으로 끌어내림 |
| 이미 존재하는 통제 계층 | 구조화 로그의 "외부로 나가기 전 통제"는 Railway `/api/events`의 화이트리스트 검증이 이미 수행 중 |

**채택 구조**: 교내 노드는 경로 밖에 두고, Railway가 **아웃바운드 전용 터널**(Cloudflare Tunnel — 교내에서 밖으로 거는 연결만 사용, 인바운드 포트 개방 없음 + 서비스 토큰 인증)로 호출하는 **마스킹 마이크로서비스 + 백업·감사 노드**로 운영한다. 교내 노드가 꺼져 있어도 학생 서비스는 무중단(마스킹 배치만 지연).

### 7-2. 자유 텍스트 데이터 흐름 (독서 감상문·감사 일기)

핵심 규칙: **원문은 분석 DB에 절대 넣지 않는다.** 자유 텍스트는 구조화 이벤트와 달리 본문에 실명·민감정보("○○가 나를 때렸다")가 들어올 수 있으므로 화이트리스트로 못 막는다.

```
학생 제출 (감사 일기 / 독서 감상문)
   ↓
[운영 DB] journal_entries — 원문 보관 (교사 열람용 콘텐츠, 접근 통제·보존기간 적용)
   ↓ ① 즉시: 1차 규칙 마스킹 (Railway 서버 내, 장비 불필요)
   │    정규식: 전화번호·주민번호·주소 패턴 + 학급 명부 이름 사전 치환
   ↓ ② 야간 배치: 2차 LLM/NER 마스킹 (교내 노드, 터널 경유)
   │    감상문·일기는 실시간 분석이 필요 없는 배치성 워크로드 → GPU 불필요
   ↓
[분석 DB] text_artifacts — 마스킹 통과본 + 파생 지표(글자수·감정·주제 태그)만
   ↓ (선택) 외부 LLM API 호출이 필요한 기능(피드백 생성 등)도 마스킹 통과본만 송출
```

분석 DB 추가 테이블(2단계 DDL에 포함 예정):

```sql
CREATE TABLE analytics.text_artifacts (
  artifact_id   UUID PRIMARY KEY,
  pseudonym_id  UUID NOT NULL,
  app_id        TEXT NOT NULL,           -- 'reading', 'gratitude' ...
  kind          TEXT NOT NULL,           -- 'masked_text' | 'summary' | 'metrics'
  masked_text   TEXT,                    -- 2차 마스킹 통과본 (원문 아님!)
  metrics       JSONB,                   -- {chars, sentiment, topics[]} 등
  mask_version  TEXT NOT NULL,           -- 마스킹 파이프라인 버전 (재처리 추적)
  client_ts     TIMESTAMPTZ NOT NULL,
  server_ts     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**도입 순서**: 자유 텍스트 기능은 교내 장비 없이도 시작 가능 — 1차 규칙 마스킹만으로 분석 DB 적재를 시작하고(보수적으로 metrics만 적재, masked_text 보류 가능), 교내 노드 가동 후 2차 마스킹을 소급 적용(mask_version으로 추적).

### 7-3. 하드웨어 — "버려지지 않을 것"만 (예산 500만원 내)

GPU 워크스테이션(24GB VRAM)은 이번 예산에서 **제외**한다: ① 중고(RTX 3090) 조달 불가 ② 신품 4090은 예산 초과 ③ 16GB급 신품은 애매한 성능으로 가장 먼저 버려질 장비 ④ 결정적으로, 마스킹 워크로드는 야간 배치라 **8~14B급 소형 모델로 충분**하고 실시간 동시 사용자가 없다. GPU는 실시간 교내 챗봇 같은 용도가 생기는 시점에 교육청 추가 예산으로.

| 항목 | 사양 | 예상 비용 |
|------|------|----------|
| **게이트웨이 노드** Mac mini M4 Pro 64GB | 마스킹 LLM(14B Q4) + cloudflared + 감사 로그. 신품 조달 용이(Apple 교육 구매), 저전력·무소음 | ≈ 250만원 |
| **NAS 백업** 2베이 + 8TB×2 (RAID1) | 운영·분석 DB 일일 암호화 백업(데이터 주권·파기 증빙·벤더 락인 대비), 매핑 파일 금고 | ≈ 90~110만원 |
| **UPS** 1000VA급 | 노드+NAS 정전 보호 | ≈ 30만원 |
| 네트워크·설치 잡비 | 케이블, (필요시) 소형 스위치 | ≈ 15~25만원 |
| **합계** | | **≈ 385~415만원** |
| **잔여 (보존)** | 차기 확장·수리 예비 | ≈ 85~115만원 |

- x86 대안(Ubuntu/Docker 표준 운영 선호 시): Ryzen 7/i7 신품 미니서버 + RAM 64GB + NVMe 2TB ≈ 150~180만원. CPU 추론도 야간 배치엔 가능하나 14B 기준 Mac mini 대비 수 배 느림 — 텍스트 양이 많아지면(전교생 일기) Mac mini 권장.
- GPT 안과의 비교: "2대 구조(프록시 서버 + GPU 워크스테이션)" 대신 **1노드(게이트웨이·추론 겸용) + NAS + UPS**. 호출자가 Railway 하나뿐이라 부하 분리가 불필요하고, 백업 인프라가 GPU보다 먼저다.

### 7-4. 구동 모델 (ollama 서빙, 야간 배치)

| 모델 | 크기 (Q4) | 용도 |
|------|-----------|------|
| Qwen2.5-14B-Instruct Q4 | ≈ 9GB | 한국어 PII 마스킹(이름·관계·장소), 주제 태깅 |
| Gemma2-12B Q4 | ≈ 8GB | 감정·정서 지표 추출 (생활지원 분석) |
| Llama-3.1-8B Q4 | ≈ 5GB | 빠른 분류·1차 필터 |

마스킹 품질 검증 절차: 도입 시 표본 200건을 교사가 직접 검수(이름 누락률 측정) → 기준 미달이면 규칙 사전 보강 + 모델 교체. 마스킹 실패 가능성을 전제로 **분석 DB의 masked_text 열람 권한도 analytics_reader로 제한**.

---

## 8. 리스크·미해결 질문

| # | 리스크/질문 | 현재 상태 | 해결 방향 |
|---|------------|----------|----------|
| 1 | **닉네임 실명 가능성** | 학생이 본인 실명으로 닉네임 설정 시 가명화 무력화 | 가입 화면에 "실명 금지, 별명만" 강제 안내 + 기존 데이터 검토 요청 |
| 2 | **처리방침 미공개** | 학교 홈페이지 미게시 | 수집 시작 전 필수 — ANALYTICS_DB_URL no-op으로 물리적 차단 중 |
| 3 | **아동 동의 주체** | 14세 미만 → 법정대리인 동의 필수 | 학부모 총회 or 가정통신문 동의서 배부 |
| 4 | **교육청 공문 전 수집 금지** | 미승인 상태 | 공문 수령 전 no-op 유지 |
| 5 | **이벤트 중복** | 네트워크 재전송 시 동일 이벤트 복수 수신 가능 | `event_id` UUID + `ON CONFLICT DO NOTHING` 멱등 처리로 해소 |
| 6 | **device_type 신뢰성** | 서버가 단말 종류를 판별 불가 | 로그인 시 사용자 직접 선택 → 분석 시 참고 데이터로만 활용 |
| 7 | **시 확산 시 멀티테넌시** | 단일 school_code 운영 중 | 확산 시 `school_code + RLS` vs 학교별 Supabase 프로젝트 분리 재검토 |
| 8 | **매핑 CSV 최초 생성 주체** | 미정 | 행정실(NEIS 학생 DB) 또는 담임교사 직접 생성 — 학교 결정 필요 |
| 9 | **졸업생 파기 자동화 책임** | 미정 | Supabase cron 설정 + 학교 개인정보보호책임자 연간 확인 체계 수립 |

---

## 9. 로드맵

```
1단계 (현재)
├── 클라이언트 Analytics Layer 구현
│     - IndexedDB 이벤트 큐
│     - 화이트리스트 이벤트 캡처
│     - JWT Bearer 배치 전송
├── 서버 JWT 인증 보강
│     - /api/auth/join → access + refresh 토큰 발급
│     - /api/auth/refresh 엔드포인트 추가
│     - /api/events 엔드포인트 (no-op 어댑터)
└── 운영 DB 컬럼 추가
      - students.pseudonym_id
      - students.device_tokens
      - students.pin_hash_v2 (scrypt)

2단계 (동의 완료 후, 1~2주 내)
├── Supabase #2 프로젝트 생성 (Seoul 리전)
├── analytics-schema.sql 실행
├── ANALYTICS_DB_URL 환경변수 설정 (no-op 해제)
├── 학부모 동의 완료 + 교육청 공문 수령 확인
└── 수집 시작 + pseudonym_registry 초기 투입

3단계 (2~3개월 후)
├── 교사 웹 대시보드 구현
│     - analytics_reader 역할 설정
│     - 가명 집계 API
│     - CSV 로컬 조인 UI
└── 5종 분석 화면 구현

2.5단계 (독서·생활지원 앱 도입 시 — 조기 예정)
├── 운영 DB journal_entries + 분석 DB text_artifacts 테이블 추가
├── 1차 규칙 마스킹 (Railway 내, 장비 불필요: 정규식 + 학급 명부 사전)
└── 자유 텍스트 지표(metrics)만 분석 DB 적재 시작 (masked_text는 2차 마스킹 후)

4단계 (교내 게이트웨이 노드 구축 — 예산 집행 ≈400만)
├── Mac mini M4 Pro 64GB + NAS(RAID1) + UPS 구매·설치
├── cloudflared 아웃바운드 터널 + 서비스 토큰 (인바운드 개방 없음)
├── ollama 설치 + 야간 배치 2차 마스킹 (소급 재처리, mask_version 추적)
├── 운영·분석 DB 일일 암호화 백업 → NAS
└── 외부 LLM API 프록시 (마스킹 통과본만 송출)
```

---

*최종 수정: 2026-06-13 | 담당: 석암초 DRACONIS 개발팀*
