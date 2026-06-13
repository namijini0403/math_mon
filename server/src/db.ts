/** Postgres 연결 + 부팅 시 스키마 부트스트랩 (마이그레이션 도구 없이 운영 단순화) */

import pg from 'pg';

export const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
  : null;

/**
 * 학습분석 전용 풀 — ANALYTICS_DB_URL이 없으면 null.
 * 운영 풀(pool)과 절대 혼용 금지.
 */
export const analyticsPool = process.env.ANALYTICS_DB_URL
  ? new pg.Pool({ connectionString: process.env.ANALYTICS_DB_URL, max: 3 })
  : null;

export async function bootstrap() {
  if (!pool) {
    console.warn('DATABASE_URL 없음 — DB 기능 비활성화 (로컬 개발 모드)');
    return;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS classes (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS students (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_code TEXT NOT NULL REFERENCES classes(code),
      nickname TEXT NOT NULL,
      pin_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (class_code, nickname)
    );
    CREATE TABLE IF NOT EXISTS progress (
      student_id UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
      xp INT NOT NULL DEFAULT 0,
      stages JSONB NOT NULL DEFAULT '{}',
      skill_stats JSONB NOT NULL DEFAULT '{}',
      card_count INT NOT NULL DEFAULT 0,
      streak INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // 구버전 테이블에 세이브 컬럼 추가 (전체 게임 상태 — 기기 변경 시 복원용)
  await pool.query(`ALTER TABLE progress ADD COLUMN IF NOT EXISTS save JSONB`);

  // ── 학습분석 지원 컬럼 추가 ────────────────────────────────────────────────
  // pseudonym_id: 분석용 가명 식별자 (UUID). 학생 ID와 직접 연결 안 됨.
  await pool.query(
    `ALTER TABLE students ADD COLUMN IF NOT EXISTS pseudonym_id UUID NOT NULL DEFAULT gen_random_uuid()`,
  );
  // UNIQUE 인덱스 (없으면 생성)
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'students' AND indexname = 'students_pseudonym_id_key'
      ) THEN
        ALTER TABLE students ADD CONSTRAINT students_pseudonym_id_key UNIQUE (pseudonym_id);
      END IF;
    END$$;
  `);
  // pin_scrypt: scrypt 방식 PIN 해시 (기존 sha256 pin_hash 폴백 유지)
  await pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS pin_scrypt TEXT`);

  console.log('DB 스키마 준비 완료');
}
