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
7. [로컬 LLM 게이트웨이 (4단계)](#7-로컬-llm-게이트웨이-4단계)
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
                  │ 맥미니 LLM 게이트웨이  (4단계)                   │
                  │ 자유 텍스트 앱(독서 감상문 등) 등장 시           │
                  │ NER 마스킹 + 외부 LLM API 프록시 용도            │
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

## 7. 로컬 LLM 게이트웨이 (4단계)

### 7-1. 수학 로그에 LLM 비식별화가 불필요한 근거

DRACONIS 수학 앱의 이벤트는 구조화 데이터만 포함:
- `unit_id: "unitBigNum"`, `skill_id: "big-place"`, `correct: true`, `elapsed_ms: 8230`

자유 텍스트 필드 없음 → 앱이 PII를 애초에 담지 않으면 LLM 비식별화 단계 불필요.

**게이트웨이가 필요해지는 시점**: 독서 감상문, 영어 작문 등 자유 텍스트 입력 앱 추가 시.

### 7-2. 게이트웨이 용도

1. **NER 마스킹**: 자유 텍스트에서 이름·주소·전화번호 등 개체명 인식 후 마스킹
2. **외부 LLM API 프록시**: 마스킹된 텍스트만 외부 API(Claude, GPT 등)로 전달
3. **로컬 추론**: 교내망 내 LLM으로 민감 데이터 외부 유출 차단

### 7-3. 하드웨어 구성 (예산 500만원 내)

| 항목 | 사양 | 예상 비용 |
|------|------|----------|
| Mac mini M4 Pro 64GB | 통합 메모리 64GB, M4 Pro 칩 | ≈ 250만원 |
| UPS | 무정전 전원 장치 | ≈ 12만원 |
| 외장 SSD 2TB | 모델 가중치 + 로그 저장 | ≈ 20만원 |
| 설치·네트워크 구성비 | 교내망 연결, 방화벽 설정 | 30~50만원 |
| **합계** | | **≈ 312~332만원** |
| 예비 예산 | | ≈ 30만원 |
| **총 예산 사용** | | **≈ 342~362만원 (예산 500만원 내)** |

### 7-4. 구동 모델 (ollama 서빙)

| 모델 | 크기 (Q4) | 용도 |
|------|-----------|------|
| Qwen2.5-14B-Instruct Q4 | ≈ 9GB | NER 마스킹, 문서 분류 |
| Gemma2-12B Q4 | ≈ 8GB | 학습 진단 리포트 생성 |
| Llama-3.1-8B Q4 | ≈ 5GB | 빠른 분류·태깅 |

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

4단계 (자유 텍스트 앱 추가 시)
├── Mac mini M4 Pro 구매 (예산 집행)
├── ollama 설치 + 모델 배포
└── NER 마스킹 파이프라인 구현
```

---

*최종 수정: 2026-06-13 | 담당: 석암초 DRACONIS 개발팀*
