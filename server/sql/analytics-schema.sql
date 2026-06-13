-- =============================================================================
-- DRACONIS 학습분석 DB 스키마 (analytics)
-- 대상: Supabase #2 — 분석 전용 프로젝트 (Seoul 리전, 운영 DB와 접속키 완전 분리)
-- 실행: Supabase SQL Editor에 전체 붙여넣기 후 Run
-- 전제: 이 프로젝트의 public 스키마는 사용하지 않음; analytics 스키마 사용
-- 주의: 실행 전 학부모 동의 + 교육청 공문 수령 완료 확인 필수
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. 스키마 생성
-- ---------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS analytics;

-- 검색 경로 설정 (이 SQL 실행 세션 내)
SET search_path TO analytics, public;


-- ---------------------------------------------------------------------------
-- 1. 앱 레지스트리
--    앱 식별자를 중앙 관리 (수학, 독서, 영어 등)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics.app_registry (
    app_id       TEXT        PRIMARY KEY,         -- 'math', 'reading', 'english', ...
    display_name TEXT        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    deprecated   BOOLEAN     NOT NULL DEFAULT false
);

COMMENT ON TABLE  analytics.app_registry           IS '앱 식별자 레지스트리';
COMMENT ON COLUMN analytics.app_registry.app_id    IS '앱 식별자 (소문자 영문)';
COMMENT ON COLUMN analytics.app_registry.deprecated IS '사용 중단 여부 — events 신규 수집 차단용';

-- 초기 데이터
INSERT INTO analytics.app_registry (app_id, display_name) VALUES
    ('math',    'DRACONIS 수학'),
    ('reading', '독서'),
    ('english', '영어')
ON CONFLICT (app_id) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 2. 이벤트 유형 레지스트리 (버전 관리)
--    이벤트 스키마 변경 이력을 버전으로 추적
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics.event_type_registry (
    event_type   TEXT        NOT NULL,
    version      SMALLINT    NOT NULL DEFAULT 1,
    description  TEXT,
    schema_json  JSONB,                           -- 이벤트 필드 명세 (참고용)
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    deprecated   BOOLEAN     NOT NULL DEFAULT false,
    PRIMARY KEY (event_type, version)
);

COMMENT ON TABLE  analytics.event_type_registry             IS '이벤트 유형 버전 레지스트리';
COMMENT ON COLUMN analytics.event_type_registry.event_type  IS '이벤트 유형명';
COMMENT ON COLUMN analytics.event_type_registry.version     IS '스키마 버전 (변경 시 +1)';
COMMENT ON COLUMN analytics.event_type_registry.schema_json IS '이벤트 필드 명세 — 실제 검증은 서버 Zod 스키마 사용';

-- 초기 이벤트 유형 등록 (v1)
INSERT INTO analytics.event_type_registry (event_type, version, description) VALUES
    ('skill_attempt',    1, '스킬 문제 풀기 시도 (단일 문제)'),
    ('stage_complete',   1, '스테이지(레슨) 완료'),
    ('boss_attempt',     1, '보스 배틀 시도'),
    ('boss_defeat',      1, '보스 처치'),
    ('session_start',    1, '학습 세션 시작'),
    ('session_end',      1, '학습 세션 종료'),
    ('mission_complete', 1, '미션 완료'),
    ('card_earned',      1, '카드 획득')
ON CONFLICT (event_type, version) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 3. 가명 레지스트리
--    실명·닉네임·원본 반코드 없음 — DB 단독으로 학생 역추적 불가
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics.pseudonym_registry (
    pseudonym_id    UUID        PRIMARY KEY,  -- 운영 DB students.pseudonym_id 와 동일 값
    school_code     TEXT        NOT NULL,     -- 학교 식별자 (예: 'SEOAM')
    -- 반 번호 미저장: HMAC-SHA256(class_code, HMAC_SECRET) 앞 16자로 가명화
    anon_class_code TEXT        NOT NULL,
    grade           SMALLINT    NOT NULL CHECK (grade BETWEEN 1 AND 6),
    enrolled_at     DATE        NOT NULL,
    left_at         DATE,                     -- 졸업/전학 시점 (재학 중이면 NULL)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  analytics.pseudonym_registry                IS '가명 학생 레지스트리 — 실명·닉네임·원본 반코드 미포함';
COMMENT ON COLUMN analytics.pseudonym_registry.pseudonym_id   IS '무작위 UUID, 운영 DB와의 유일한 연결고리';
COMMENT ON COLUMN analytics.pseudonym_registry.school_code    IS '학교 식별자 (타교 확산 대비)';
COMMENT ON COLUMN analytics.pseudonym_registry.anon_class_code IS 'HMAC-SHA256(원본_반코드, HMAC_SECRET) 앞 16자 — 반 번호 직접 저장 안 함';
COMMENT ON COLUMN analytics.pseudonym_registry.grade          IS '학년만 보존 (준식별자 최소화)';
COMMENT ON COLUMN analytics.pseudonym_registry.left_at        IS '졸업/전학 시 기록 → 3년 후 자동 파기 대상';

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_pseudonym_school
    ON analytics.pseudonym_registry (school_code, grade);

CREATE INDEX IF NOT EXISTS idx_pseudonym_left_at
    ON analytics.pseudonym_registry (left_at)
    WHERE left_at IS NOT NULL;


-- ---------------------------------------------------------------------------
-- 4. 이벤트 테이블 (월 RANGE 파티션)
--    모든 학습 행동 로그의 핵심 테이블
--    규모 추정: 1,080명 × 200일 × 30이벤트 ≈ 650만 행/년
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics.events (
    -- 식별
    event_id     UUID        NOT NULL,           -- 클라이언트 생성 UUID (멱등 키)
    pseudonym_id UUID        NOT NULL,           -- pseudonym_registry 참조
    event_type   TEXT        NOT NULL,           -- 'skill_attempt', 'stage_complete', ...
    app_id       TEXT        NOT NULL,           -- 'math', 'reading', ...
    app_version  TEXT,                           -- 앱 버전 ('1.3.0')

    -- 학습 문맥
    unit_id      TEXT,                           -- 'unitBigNum', 'unitAngle', ...
    stage_id     TEXT,                           -- 'bn-1', 'bn-boss', ...
    skill_id     TEXT,                           -- 'big-place', 'big-read', ...
    problem_id   TEXT,                           -- 문제 식별자 (시드 기반)
    semester_id  TEXT,                           -- 'g4s1', 'g5s2', ...

    -- 결과
    correct      BOOLEAN,
    score        SMALLINT    CHECK (score IS NULL OR (score BETWEEN 0 AND 100)),
    elapsed_ms   INT         CHECK (elapsed_ms IS NULL OR elapsed_ms >= 0),
    attempt_no   SMALLINT    CHECK (attempt_no IS NULL OR attempt_no >= 1),
    stars        SMALLINT    CHECK (stars IS NULL OR (stars BETWEEN 0 AND 3)),

    -- 세션·기기
    session_id   UUID        NOT NULL,           -- 같은 세션 내 이벤트 묶음
    device_type  TEXT        CHECK (device_type IN ('laptop', 'phone', 'tablet', 'unknown')),

    -- 정책·실험
    policy_tag   TEXT,                           -- A/B 실험·이벤트 정책 태그

    -- 타임스탬프
    client_ts    TIMESTAMPTZ NOT NULL,           -- 클라이언트 로컬 시간
    server_ts    TIMESTAMPTZ NOT NULL DEFAULT now()  -- 서버 수신 시간 (파티션 키)

) PARTITION BY RANGE (server_ts);

COMMENT ON TABLE  analytics.events             IS '학습 이벤트 로그 — 월 RANGE 파티션, 연 650만 행 예상';
COMMENT ON COLUMN analytics.events.event_id    IS '클라이언트 생성 UUID — ON CONFLICT DO NOTHING으로 중복 전송 멱등 처리';
COMMENT ON COLUMN analytics.events.pseudonym_id IS '가명 학생 ID — 운영 DB 매핑 없이는 역추적 불가';
COMMENT ON COLUMN analytics.events.policy_tag  IS 'A/B 실험 또는 이벤트 정책 식별자 (NULL이면 일반 수집)';
COMMENT ON COLUMN analytics.events.client_ts   IS '클라이언트 로컬 시간 — 분석 시 server_ts 기준 사용 권장';
COMMENT ON COLUMN analytics.events.server_ts   IS '서버 수신 시간 — 파티션 키, 인덱스 기준';


-- ---------------------------------------------------------------------------
-- 5. 초기 파티션 생성 (3개월치 + 이전 데이터 처리용 기본 파티션)
--    파티션명 규칙: events_YYYY_MM
-- ---------------------------------------------------------------------------

-- 기본 파티션 (범위 외 데이터 처리 — 운영 중 삭제 금지)
CREATE TABLE IF NOT EXISTS analytics.events_default
    PARTITION OF analytics.events DEFAULT;

COMMENT ON TABLE analytics.events_default IS '범위 밖 이벤트 임시 보관 — 수동 파티션 이동 후 비워야 함';

-- 2026년 6월
CREATE TABLE IF NOT EXISTS analytics.events_2026_06
    PARTITION OF analytics.events
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- 2026년 7월
CREATE TABLE IF NOT EXISTS analytics.events_2026_07
    PARTITION OF analytics.events
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- 2026년 8월
CREATE TABLE IF NOT EXISTS analytics.events_2026_08
    PARTITION OF analytics.events
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- 2026년 9월
CREATE TABLE IF NOT EXISTS analytics.events_2026_09
    PARTITION OF analytics.events
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

COMMENT ON TABLE analytics.events_2026_06 IS '2026-06 파티션';
COMMENT ON TABLE analytics.events_2026_07 IS '2026-07 파티션';
COMMENT ON TABLE analytics.events_2026_08 IS '2026-08 파티션';
COMMENT ON TABLE analytics.events_2026_09 IS '2026-09 파티션';


-- ---------------------------------------------------------------------------
-- 6. 파티션 자동 생성 함수
--    Supabase cron (pg_cron) 또는 pg_partman 으로 매월 1일 호출
--    사용: SELECT analytics.create_monthly_partition('2026-10-01');
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION analytics.create_monthly_partition(target_month DATE)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    partition_name TEXT;
    start_date     DATE;
    end_date       DATE;
    sql_text       TEXT;
BEGIN
    -- 입력 날짜를 해당 월의 1일로 정규화
    start_date := date_trunc('month', target_month)::DATE;
    end_date   := (start_date + INTERVAL '1 month')::DATE;
    partition_name := 'events_' || to_char(start_date, 'YYYY_MM');

    -- 이미 존재하면 스킵
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'analytics' AND c.relname = partition_name
    ) THEN
        RETURN partition_name || ' already exists';
    END IF;

    -- 파티션 생성
    sql_text := format(
        'CREATE TABLE analytics.%I PARTITION OF analytics.events FOR VALUES FROM (%L) TO (%L)',
        partition_name,
        start_date,
        end_date
    );
    EXECUTE sql_text;

    RETURN 'Created: ' || partition_name || ' (' || start_date || ' ~ ' || end_date || ')';
END;
$$;

COMMENT ON FUNCTION analytics.create_monthly_partition(DATE) IS
    '월별 파티션 자동 생성 함수. Supabase cron에서 매월 호출: SELECT analytics.create_monthly_partition(date_trunc(''month'', now() + interval ''1 month'')::date)';


-- ---------------------------------------------------------------------------
-- 7. 파티션별 인덱스 생성 헬퍼
--    각 파티션 생성 후 호출하거나, 파티션 테이블에 직접 생성
--    (파티션드 테이블에 생성한 인덱스는 새 파티션에 자동 적용됨)
-- ---------------------------------------------------------------------------

-- (a) 학생별 시계열 조회 — 가장 빈번한 쿼리
CREATE INDEX IF NOT EXISTS idx_events_student_ts
    ON analytics.events (pseudonym_id, server_ts DESC);

-- (b) 단원·스킬별 난이도 분석
CREATE INDEX IF NOT EXISTS idx_events_stage_skill
    ON analytics.events (stage_id, skill_id)
    WHERE stage_id IS NOT NULL;

-- (c) 이벤트 유형별 집계 (교사 대시보드 활동량 화면)
CREATE INDEX IF NOT EXISTS idx_events_type_ts
    ON analytics.events (event_type, server_ts DESC);

-- (d) 세션 재구성 (세션 분석, 이탈 지점 탐색)
CREATE INDEX IF NOT EXISTS idx_events_session
    ON analytics.events (session_id);

-- (e) A/B 실험·정책 비교 (partial — policy_tag 있는 행만)
CREATE INDEX IF NOT EXISTS idx_events_policy
    ON analytics.events (policy_tag, server_ts DESC)
    WHERE policy_tag IS NOT NULL;

-- (f) app_id 기준 (앱별 집계)
CREATE INDEX IF NOT EXISTS idx_events_app_ts
    ON analytics.events (app_id, server_ts DESC);


-- ---------------------------------------------------------------------------
-- 8. UNIQUE 제약 — 멱등 처리
--    event_id가 파티션 부모 테이블에 UNIQUE로 존재해야 ON CONFLICT 동작
--    파티션드 테이블에서는 각 파티션에 걸림 (Postgres 11+)
-- ---------------------------------------------------------------------------
-- 참고: 파티션드 테이블에서 global unique index는 Postgres 17 미만에서 지원 안 됨.
--       서버 레이어에서 event_id 중복 체크 + 파티션별 unique 인덱스로 대응.
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_event_id_2026_06
    ON analytics.events_2026_06 (event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_event_id_2026_07
    ON analytics.events_2026_07 (event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_event_id_2026_08
    ON analytics.events_2026_08 (event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_event_id_2026_09
    ON analytics.events_2026_09 (event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_event_id_default
    ON analytics.events_default (event_id);


-- ---------------------------------------------------------------------------
-- 9. RLS (Row Level Security)
--    anon / authenticated → 전면 차단
--    service_role         → INSERT 허용 (서버 → 분석 DB 전송)
--    analytics_reader     → SELECT 허용 (교사 대시보드 읽기)
-- ---------------------------------------------------------------------------

-- pseudonym_registry RLS
ALTER TABLE analytics.pseudonym_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role can insert pseudonym"
    ON analytics.pseudonym_registry
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "service_role can update pseudonym"
    ON analytics.pseudonym_registry
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "analytics_reader can select pseudonym"
    ON analytics.pseudonym_registry
    FOR SELECT
    TO analytics_reader
    USING (true);

-- events RLS (파티션 부모에 적용 → 각 파티션에 자동 적용)
ALTER TABLE analytics.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role can insert events"
    ON analytics.events
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "analytics_reader can select events"
    ON analytics.events
    FOR SELECT
    TO analytics_reader
    USING (true);

-- app_registry / event_type_registry: 읽기 허용
ALTER TABLE analytics.app_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.event_type_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role manage app_registry"
    ON analytics.app_registry FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "analytics_reader read app_registry"
    ON analytics.app_registry FOR SELECT TO analytics_reader USING (true);

CREATE POLICY "service_role manage event_type_registry"
    ON analytics.event_type_registry FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "analytics_reader read event_type_registry"
    ON analytics.event_type_registry FOR SELECT TO analytics_reader USING (true);


-- ---------------------------------------------------------------------------
-- 10. analytics_reader 역할 생성
--     Supabase에서는 역할을 SQL로 직접 생성할 수 없는 경우가 있음.
--     아래 명령이 실패하면 Supabase 대시보드 > Settings > Database > Roles에서 수동 생성.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'analytics_reader') THEN
        CREATE ROLE analytics_reader NOLOGIN;
        COMMENT ON ROLE analytics_reader IS '교사 대시보드 읽기 전용 역할 — SELECT만 허용';
    END IF;
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'analytics_reader 역할 생성 권한 없음 — Supabase 대시보드에서 수동 생성 필요';
END;
$$;

-- analytics_reader에게 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA analytics TO analytics_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO analytics_reader;
-- 향후 새 테이블에도 자동 부여
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics
    GRANT SELECT ON TABLES TO analytics_reader;


-- ---------------------------------------------------------------------------
-- 11. 집계 뷰
-- ---------------------------------------------------------------------------

-- (a) 학생 일별 요약
--     교사 대시보드 학급 개요 · 학생 상세 화면에서 사용
--     k-익명 주의: 교사 대시보드에서 반 단위 이상으로만 노출할 것
CREATE OR REPLACE VIEW analytics.v_student_daily_summary AS
SELECT
    e.pseudonym_id,
    date_trunc('day', e.server_ts AT TIME ZONE 'Asia/Seoul')::DATE AS activity_date,
    e.app_id,
    count(*)                                                        AS event_count,
    count(*) FILTER (WHERE e.correct = true)                        AS correct_count,
    count(*) FILTER (WHERE e.correct = false)                       AS wrong_count,
    sum(e.elapsed_ms)                                               AS total_elapsed_ms,
    count(DISTINCT e.session_id)                                    AS session_count,
    count(DISTINCT e.skill_id) FILTER (WHERE e.skill_id IS NOT NULL) AS distinct_skills
FROM  analytics.events e
WHERE e.event_type = 'skill_attempt'
GROUP BY 1, 2, 3;

COMMENT ON VIEW analytics.v_student_daily_summary IS
    '학생×날짜×앱 단위 일별 요약. 교사 대시보드 열람 시 5명 미만 그룹은 UI에서 마스킹 처리 필요.';


-- (b) 스킬 난이도 실측
--     단원 난이도 설계 보정·수업 연구에 활용
CREATE OR REPLACE VIEW analytics.v_skill_difficulty AS
SELECT
    e.app_id,
    e.unit_id,
    e.skill_id,
    e.semester_id,
    count(*)                                                             AS attempt_count,
    round(
        (count(*) FILTER (WHERE e.correct = true))::NUMERIC / NULLIF(count(*), 0) * 100,
        1
    )                                                                    AS correct_rate_pct,
    round(avg(e.elapsed_ms)::NUMERIC, 0)::INT                           AS avg_elapsed_ms,
    percentile_cont(0.95) WITHIN GROUP (ORDER BY e.elapsed_ms)::INT     AS p95_elapsed_ms,
    count(DISTINCT e.pseudonym_id)                                       AS student_count
FROM  analytics.events e
WHERE e.event_type = 'skill_attempt'
  AND e.skill_id IS NOT NULL
GROUP BY 1, 2, 3, 4;

COMMENT ON VIEW analytics.v_skill_difficulty IS
    '스킬별 정답률·소요시간 실측. attempt_count < 10이면 통계 신뢰도 낮음 — UI에서 표시 주의.';


-- (c) 세션 요약
--     세션 길이, 이탈 패턴 분석용
CREATE OR REPLACE VIEW analytics.v_session_summary AS
SELECT
    e.session_id,
    e.pseudonym_id,
    e.app_id,
    date_trunc('day', min(e.server_ts) AT TIME ZONE 'Asia/Seoul')::DATE AS session_date,
    min(e.server_ts)                                                     AS session_start,
    max(e.server_ts)                                                     AS session_end,
    extract(EPOCH FROM (max(e.server_ts) - min(e.server_ts)))::INT       AS duration_sec,
    count(*)                                                             AS event_count,
    count(*) FILTER (WHERE e.event_type = 'skill_attempt')              AS skill_attempt_count,
    count(*) FILTER (WHERE e.correct = true)                            AS correct_count,
    e.device_type
FROM  analytics.events e
GROUP BY e.session_id, e.pseudonym_id, e.app_id, e.device_type;

COMMENT ON VIEW analytics.v_session_summary IS
    '세션별 요약. 교사 대시보드 종단 변화 화면에서 이탈 위험 학생(연속 0일) 탐색에 활용.';


-- ---------------------------------------------------------------------------
-- 12. 졸업 파기 함수
--     개인정보보호법: 졸업 후 3년 후 pseudonym_id 단위 파기
--     Supabase cron 또는 연 1회 수동 실행
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION analytics.purge_graduated_students(dry_run BOOLEAN DEFAULT true)
RETURNS TABLE (
    purged_pseudonym_id UUID,
    left_at             DATE,
    events_deleted      BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    del_count BIGINT;
BEGIN
    FOR rec IN
        SELECT pseudonym_id, pr.left_at
        FROM   analytics.pseudonym_registry pr
        WHERE  pr.left_at IS NOT NULL
          AND  pr.left_at < (CURRENT_DATE - INTERVAL '3 years')
    LOOP
        IF dry_run THEN
            -- 실제 삭제 없이 대상만 반환
            SELECT count(*) INTO del_count
            FROM analytics.events
            WHERE pseudonym_id = rec.pseudonym_id;
        ELSE
            -- 이벤트 먼저 삭제
            DELETE FROM analytics.events WHERE pseudonym_id = rec.pseudonym_id;
            GET DIAGNOSTICS del_count = ROW_COUNT;
            -- 가명 레지스트리 삭제
            DELETE FROM analytics.pseudonym_registry WHERE pseudonym_id = rec.pseudonym_id;
        END IF;

        purged_pseudonym_id := rec.pseudonym_id;
        left_at             := rec.left_at;
        events_deleted      := del_count;
        RETURN NEXT;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION analytics.purge_graduated_students(BOOLEAN) IS
    '졸업 3년 후 학생 데이터 파기. dry_run=true(기본): 삭제 대상만 조회. dry_run=false: 실제 삭제.
     실행 전 반드시 dry_run=true로 대상 확인 후 학교 개인정보보호책임자 승인 받을 것.
     예: SELECT * FROM analytics.purge_graduated_students(false);';


-- ---------------------------------------------------------------------------
-- 13. Supabase cron 등록 예시 (pg_cron 확장 필요)
--     Supabase 대시보드 > Database > Extensions에서 pg_cron 활성화 후 실행
-- ---------------------------------------------------------------------------

/*
-- 매월 25일 09:00 KST에 다음 달 파티션 미리 생성
SELECT cron.schedule(
    'create-next-month-partition',
    '0 0 25 * *',   -- UTC 00:00 = KST 09:00
    $$SELECT analytics.create_monthly_partition(
        (date_trunc('month', now()) + interval '1 month')::date
    )$$
);

-- 매년 3월 1일 졸업 파기 대상 조회 알림 (dry_run)
SELECT cron.schedule(
    'check-purge-targets',
    '0 1 1 3 *',
    $$
    DO $$
    DECLARE cnt INT;
    BEGIN
        SELECT count(*) INTO cnt FROM analytics.purge_graduated_students(true);
        IF cnt > 0 THEN
            RAISE LOG 'purge 대상 % 명 — 개인정보보호책임자 확인 필요', cnt;
        END IF;
    END;
    $$
    $$
);
*/


-- ---------------------------------------------------------------------------
-- 14. 이벤트 INSERT 헬퍼 함수 (서버에서 호출)
--     ON CONFLICT DO NOTHING으로 멱등 보장
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION analytics.insert_event(
    p_event_id     UUID,
    p_pseudonym_id UUID,
    p_event_type   TEXT,
    p_app_id       TEXT,
    p_app_version  TEXT,
    p_unit_id      TEXT,
    p_stage_id     TEXT,
    p_skill_id     TEXT,
    p_problem_id   TEXT,
    p_correct      BOOLEAN,
    p_score        SMALLINT,
    p_elapsed_ms   INT,
    p_attempt_no   SMALLINT,
    p_stars        SMALLINT,
    p_session_id   UUID,
    p_semester_id  TEXT,
    p_device_type  TEXT,
    p_policy_tag   TEXT,
    p_client_ts    TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
    INSERT INTO analytics.events (
        event_id, pseudonym_id, event_type, app_id, app_version,
        unit_id, stage_id, skill_id, problem_id,
        correct, score, elapsed_ms, attempt_no, stars,
        session_id, semester_id, device_type, policy_tag, client_ts
    ) VALUES (
        p_event_id, p_pseudonym_id, p_event_type, p_app_id, p_app_version,
        p_unit_id, p_stage_id, p_skill_id, p_problem_id,
        p_correct, p_score, p_elapsed_ms, p_attempt_no, p_stars,
        p_session_id, p_semester_id, p_device_type, p_policy_tag, p_client_ts
    )
    ON CONFLICT DO NOTHING;   -- event_id 중복 시 조용히 무시 (멱등)
$$;

COMMENT ON FUNCTION analytics.insert_event IS
    '이벤트 단건 INSERT (멱등). 서버 /api/events 핸들러에서 배치로 호출.
     ON CONFLICT DO NOTHING으로 네트워크 재전송으로 인한 중복 이벤트 자동 처리.';


-- ---------------------------------------------------------------------------
-- 15. 최종 확인 쿼리 (실행 후 검증용)
-- ---------------------------------------------------------------------------

/*
-- 스키마 내 테이블 목록 확인
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'analytics'
ORDER BY table_type, table_name;

-- 파티션 목록 확인
SELECT
    parent.relname  AS parent_table,
    child.relname   AS partition_name,
    pg_get_expr(child.relpartbound, child.oid) AS partition_bound
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child  ON pg_inherits.inhrelid  = child.oid
JOIN pg_namespace n  ON parent.relnamespace   = n.oid
WHERE n.nspname = 'analytics' AND parent.relname = 'events'
ORDER BY child.relname;

-- RLS 정책 확인
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'analytics'
ORDER BY tablename, policyname;

-- 인덱스 확인
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'analytics'
ORDER BY tablename, indexname;

-- 집계 뷰 확인
SELECT table_name FROM information_schema.views
WHERE table_schema = 'analytics';
*/

-- =============================================================================
-- 완료: analytics 스키마 생성 완료
-- 다음 단계:
--   1. analytics_reader 역할을 Supabase 대시보드에서 생성 (SQL 실행 권한 없는 경우)
--   2. ANALYTICS_DB_URL 환경변수를 Railway 서버에 설정
--   3. 학부모 동의 + 교육청 공문 수령 확인 후 수집 시작
--   4. Supabase cron(pg_cron) 활성화 후 파티션 자동 생성 스케줄 등록
-- =============================================================================
