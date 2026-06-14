/** math_mon 서버 — API + 빌드된 PWA 정적 서빙 (단일 Railway 서비스) */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { analyticsPool, bootstrap, pool } from './db.js';
import { signToken, scryptHash, scryptVerify, tokenRemainingSeconds, verifyToken } from './auth.js';

const app = new Hono();

// ── 기본 보안 헤더 (비파괴적 — SECURITY-PLAN.md M4) ──────────────────────────
// CSP는 PWA 인라인 스타일/워커 영향 검토 후 점진 적용 예정(3단계).
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
});

// ── 레거시 SHA-256 PIN 해시 (폴백용) ─────────────────────────────────────────
function pinHash(pin: string, classCode: string, nickname: string): string {
  return createHash('sha256').update(`${pin}:${classCode}:${nickname}`).digest('hex');
}

// ── Bearer 토큰 추출 헬퍼 ─────────────────────────────────────────────────────
function extractBearer(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

/** 교사 키 검증 (X-Teacher-Key 헤더) */
function teacherAuthorized(key: string | undefined): boolean {
  return !!process.env.TEACHER_KEY && key === process.env.TEACHER_KEY;
}

/** 문자열 좌표값을 안전하게 코어스 (없으면 null, 길이 제한) */
function str(v: unknown, max = 80): string | null {
  return typeof v === 'string' && v ? v.slice(0, max) : null;
}

// ── PIN 무차별 대입 방어 (인메모리, fail-open) — SECURITY-PLAN H1 ───────────────
// 정상 사용자엔 관대(15분 내 10회 실패 시 15분 잠금). 내부 오류는 무조건 통과(로그인 우선).
const PIN_MAX_FAILS = 10;
const PIN_WINDOW_MS = 15 * 60_000;
const PIN_LOCK_MS = 15 * 60_000;
const pinAttempts = new Map<string, { fails: number; first: number; lockUntil: number }>();

/** 잠겨 있으면 남은 초, 아니면 0. 오류 시 0(통과). */
function pinLockRemaining(key: string): number {
  try {
    const e = pinAttempts.get(key);
    if (!e) return 0;
    const now = Date.now();
    if (e.lockUntil > now) return Math.ceil((e.lockUntil - now) / 1000);
    // 창이 지났으면 리셋
    if (now - e.first > PIN_WINDOW_MS) pinAttempts.delete(key);
    return 0;
  } catch {
    return 0;
  }
}

function pinRecordFail(key: string): void {
  try {
    const now = Date.now();
    const e = pinAttempts.get(key);
    if (!e || now - e.first > PIN_WINDOW_MS) {
      pinAttempts.set(key, { fails: 1, first: now, lockUntil: 0 });
      return;
    }
    e.fails += 1;
    if (e.fails >= PIN_MAX_FAILS) e.lockUntil = now + PIN_LOCK_MS;
  } catch {
    /* fail-open */
  }
}

function pinClear(key: string): void {
  try { pinAttempts.delete(key); } catch { /* noop */ }
}

// ── 허용 event_type 목록 ──────────────────────────────────────────────────────
const ALLOWED_EVENT_TYPES = new Set([
  'session.start', 'session.end', 'auth.login',
  'lesson.start', 'lesson.answer', 'lesson.complete', 'lesson.fail', 'lesson.abandon',
  'boss.start', 'boss.answer', 'boss.defeat', 'boss.fail',
  'practice.answer', 'practice.set_complete',
  'exam.start', 'exam.answer', 'exam.complete',
  'daily_reward.claim', 'mission.claim', 'dragon.feed',
]);

// 허용 이벤트 필드 목록 (스트립 기준)
const ALLOWED_EVENT_FIELDS = new Set([
  'event_id', 'event_type', 'app_id', 'app_version',
  'unit_id', 'stage_id', 'skill_id', 'problem_id',
  'correct', 'score', 'elapsed_ms', 'attempt_no', 'stars',
  'session_id', 'semester_id', 'device_type', 'policy_tag', 'client_ts',
]);

type RawEvent = Record<string, unknown>;

interface CleanEvent {
  event_id: string;
  event_type: string;
  session_id: string;
  client_ts: string;
  [key: string]: unknown;
}

/** 이벤트 하나를 화이트리스트 검증·스트립. 필수 필드 누락이면 null 반환 */
function sanitizeEvent(raw: unknown): CleanEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as RawEvent;

  // 필수 필드 검사
  if (typeof e.event_id !== 'string' || !e.event_id) return null;
  if (typeof e.event_type !== 'string' || !ALLOWED_EVENT_TYPES.has(e.event_type)) return null;
  if (typeof e.session_id !== 'string' || !e.session_id) return null;
  if (typeof e.client_ts !== 'string' || !e.client_ts) return null;

  // 화이트리스트 스트립
  const clean: RawEvent = {};
  for (const key of ALLOWED_EVENT_FIELDS) {
    if (key in e) {
      // 추가 타입 검증
      if (key === 'correct' && typeof e[key] !== 'boolean') continue;
      if (key === 'score' && typeof e[key] !== 'number') continue;
      if (key === 'elapsed_ms') {
        if (typeof e[key] !== 'number' || (e[key] as number) < 0) continue;
      }
      if (key === 'stars') {
        const v = e[key] as number;
        if (typeof v !== 'number' || v < 0 || v > 3) continue;
      }
      if (key === 'device_type') {
        if (!['laptop', 'phone', 'unknown'].includes(e[key] as string)) continue;
      }
      clean[key] = e[key];
    }
  }

  return clean as CleanEvent;
}

/** 학생 가입/로그인 — 같은 (반, 닉네임)이 있으면 PIN 검증, 없으면 생성 */
app.post('/api/auth/join', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  const { classCode, nickname, pin } = await c.req.json<{
    classCode?: string;
    nickname?: string;
    pin?: string;
  }>();
  if (!classCode || !nickname || !pin || !/^\d{4}$/.test(pin) || nickname.length > 10) {
    return c.json({ error: 'bad request' }, 400);
  }

  const cls = await pool.query('SELECT code FROM classes WHERE code = $1', [classCode]);
  if (cls.rowCount === 0) return c.json({ error: 'class not found' }, 404);

  const legacyHash = pinHash(pin, classCode, nickname);
  const existing = await pool.query(
    'SELECT id, pin_hash, pin_scrypt, pseudonym_id FROM students WHERE class_code = $1 AND nickname = $2',
    [classCode, nickname],
  );

  if (existing.rowCount && existing.rowCount > 0) {
    const row = existing.rows[0] as {
      id: string;
      pin_hash: string;
      pin_scrypt: string | null;
      pseudonym_id: string;
    };

    // PIN 무차별 대입 방어 — 잠겨 있으면 잠시 차단 (정상 사용자엔 영향 없음)
    const limitKey = `${classCode}:${nickname}`;
    const lockSec = pinLockRemaining(limitKey);
    if (lockSec > 0) {
      return c.json({ error: 'too many attempts', retryAfter: lockSec }, 429);
    }

    // PIN 검증: scrypt 우선 → 없으면 sha256 폴백
    let pinOk = false;
    if (row.pin_scrypt) {
      pinOk = await scryptVerify(pin, row.pin_scrypt);
    } else {
      pinOk = row.pin_hash === legacyHash;
      // 성공 시 scrypt로 재해시 저장
      if (pinOk) {
        const newScrypt = await scryptHash(pin);
        await pool.query('UPDATE students SET pin_scrypt = $1 WHERE id = $2', [newScrypt, row.id]);
      }
    }
    if (!pinOk) {
      pinRecordFail(limitKey);
      return c.json({ error: 'wrong pin' }, 403);
    }
    pinClear(limitKey);

    // 저장된 세이브 반환
    const saved = await pool.query('SELECT save FROM progress WHERE student_id = $1', [row.id]);

    // JWT 발급
    const accessToken = signToken({ sid: row.id, pid: row.pseudonym_id }, 60 * 60); // 1h
    const refreshToken = signToken(
      { sid: row.id, pid: row.pseudonym_id, typ: 'refresh' },
      90 * 24 * 60 * 60, // 90d
    );

    return c.json({
      studentId: row.id,
      nickname,
      classCode,
      save: saved.rows[0]?.save ?? null,
      // 분석용 추가 필드
      pseudonymId: row.pseudonym_id,
      accessToken,
      refreshToken,
    });
  }

  // 신규 가입
  const newScrypt = await scryptHash(pin);
  const inserted = await pool.query(
    'INSERT INTO students (class_code, nickname, pin_hash, pin_scrypt) VALUES ($1, $2, $3, $4) RETURNING id, pseudonym_id',
    [classCode, nickname, legacyHash, newScrypt],
  );
  const newRow = inserted.rows[0] as { id: string; pseudonym_id: string };

  const accessToken = signToken({ sid: newRow.id, pid: newRow.pseudonym_id }, 60 * 60);
  const refreshToken = signToken(
    { sid: newRow.id, pid: newRow.pseudonym_id, typ: 'refresh' },
    90 * 24 * 60 * 60,
  );

  return c.json({
    studentId: newRow.id,
    nickname,
    classCode,
    save: null,
    pseudonymId: newRow.pseudonym_id,
    accessToken,
    refreshToken,
  });
});

/** 토큰 갱신 — refreshToken → 새 accessToken (+ 만료 임박 시 새 refreshToken) */
app.post('/api/auth/refresh', async (c) => {
  const body = await c.req
    .json<{ refreshToken?: string }>()
    .catch(() => ({ refreshToken: undefined }));
  const token = body.refreshToken;
  if (!token) return c.json({ error: 'missing token' }, 401);

  const payload = verifyToken(token);
  if (!payload || payload.typ !== 'refresh') return c.json({ error: 'invalid token' }, 401);

  const newAccessToken = signToken({ sid: payload.sid, pid: payload.pid }, 60 * 60);

  // 남은 기간 30일 미만이면 refreshToken도 재발급
  const remaining = tokenRemainingSeconds(token);
  const thirtyDays = 30 * 24 * 60 * 60;
  const newRefreshToken =
    remaining < thirtyDays
      ? signToken({ sid: payload.sid, pid: payload.pid, typ: 'refresh' }, 90 * 24 * 60 * 60)
      : undefined;

  const refreshResp: { accessToken: string; refreshToken?: string } = {
    accessToken: newAccessToken,
  };
  if (newRefreshToken) refreshResp.refreshToken = newRefreshToken;
  return c.json(refreshResp);
});

/** 학습 이벤트 수집 */
app.post('/api/events', async (c) => {
  // 인증: Authorization 헤더 또는 body._token (sendBeacon은 헤더 불가)
  let tokenStr: string | null = extractBearer(c.req.header('Authorization'));
  let rawBody: Record<string, unknown>;
  try {
    rawBody = await c.req.json<Record<string, unknown>>();
  } catch {
    return c.json({ error: 'invalid json' }, 400);
  }

  if (!tokenStr && typeof rawBody._token === 'string') {
    tokenStr = rawBody._token;
  }
  if (!tokenStr) return c.json({ error: 'unauthorized' }, 401);

  const payload = verifyToken(tokenStr);
  if (!payload) return c.json({ error: 'invalid token' }, 401);
  // refresh 토큰은 이벤트 인증에 사용 불가
  if (payload.typ === 'refresh') return c.json({ error: 'invalid token type' }, 401);

  // events 배열 검사
  const eventsRaw = rawBody.events;
  if (!Array.isArray(eventsRaw)) return c.json({ error: 'events must be array' }, 400);
  if (eventsRaw.length > 100) return c.json({ error: 'too many events (max 100)' }, 400);

  const serverTs = new Date().toISOString();
  const pseudonymId = payload.pid;

  const cleaned: CleanEvent[] = [];
  let dropped = 0;
  for (const raw of eventsRaw) {
    const e = sanitizeEvent(raw);
    if (!e) { dropped++; continue; }
    cleaned.push({ ...e, pseudonym_id: pseudonymId, server_ts: serverTs });
  }

  // analyticsPool 있으면 배치 인서트
  let flushed = 0;
  if (analyticsPool && cleaned.length > 0) {
    try {
      // analytics.events 테이블에 배치 인서트 (ON CONFLICT DO NOTHING — 중복 멱등)
      const values: unknown[] = [];
      const placeholders: string[] = [];
      cleaned.forEach((e, i) => {
        const base = i * 5;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
        values.push(
          e.event_id,
          e.event_type,
          pseudonymId,
          e.client_ts,
          JSON.stringify(e),
        );
      });
      await analyticsPool.query(
        `INSERT INTO analytics.events (event_id, event_type, pseudonym_id, client_ts, payload)
         VALUES ${placeholders.join(', ')}
         ON CONFLICT (event_id) DO NOTHING`,
        values,
      );
      flushed = cleaned.length;
    } catch (err) {
      // DB 오류는 클라이언트에 전파하지 않음 (분석은 best-effort)
      console.error('[events] analytics insert error:', err);
      dropped += cleaned.length;
      flushed = 0;
    }
  } else {
    // analyticsPool 없음 — 검증까지만 하고 성공 응답 (no-op)
    flushed = cleaned.length;
  }

  return c.json({ ok: true, flushed, dropped });
});

/** 진도 스냅샷 업서트 */
app.post('/api/progress', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);

  const body = await c.req.json<{
    studentId?: string;
    xp?: number;
    stages?: unknown;
    skillStats?: unknown;
    cardCount?: number;
    streak?: number;
    save?: unknown;
  }>();
  if (!body.studentId) return c.json({ error: 'bad request' }, 400);

  // Bearer 토큰 필수 — 토큰의 studentId와 일치할 때만 진도 저장 (SECURITY-PLAN M1).
  // 클라는 항상 토큰을 보내며(api.ts), 없으면 로컬 저장으로 graceful 폴백.
  const bearerToken = extractBearer(c.req.header('Authorization'));
  if (!bearerToken) return c.json({ error: 'unauthorized' }, 401);
  const payload = verifyToken(bearerToken);
  if (!payload || payload.typ === 'refresh') return c.json({ error: 'invalid token' }, 401);
  if (payload.sid !== body.studentId) return c.json({ error: 'forbidden' }, 403);

  await pool.query(
    `INSERT INTO progress (student_id, xp, stages, skill_stats, card_count, streak, save, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     ON CONFLICT (student_id) DO UPDATE SET
       xp = EXCLUDED.xp, stages = EXCLUDED.stages, skill_stats = EXCLUDED.skill_stats,
       card_count = EXCLUDED.card_count, streak = EXCLUDED.streak, save = EXCLUDED.save,
       updated_at = now()`,
    [
      body.studentId,
      body.xp ?? 0,
      JSON.stringify(body.stages ?? {}),
      JSON.stringify(body.skillStats ?? {}),
      body.cardCount ?? 0,
      body.streak ?? 0,
      JSON.stringify(body.save ?? null),
    ],
  );
  return c.json({ ok: true });
});

/** 교사용 — 반 생성 (TEACHER_KEY 필요) */
app.post('/api/teacher/class', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  const { code, name, key } = await c.req.json<{ code?: string; name?: string; key?: string }>();
  if (!process.env.TEACHER_KEY || key !== process.env.TEACHER_KEY)
    return c.json({ error: 'forbidden' }, 403);
  if (!code || !/^[A-Z0-9]{3,8}$/.test(code)) return c.json({ error: 'bad code' }, 400);
  await pool.query(
    'INSERT INTO classes (code, name) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
    [code, name ?? ''],
  );
  return c.json({ ok: true, code });
});

/** 교사용 — 반 현황 (키는 헤더로 — URL 쿼리 로그 노출 방지, SECURITY-PLAN M2) */
app.get('/api/teacher/:classCode', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  const key = c.req.header('X-Teacher-Key');
  if (!process.env.TEACHER_KEY || key !== process.env.TEACHER_KEY)
    return c.json({ error: 'forbidden' }, 403);
  const rows = await pool.query(
    `SELECT s.nickname, p.xp, p.stages, p.skill_stats, p.card_count, p.streak, p.updated_at
     FROM students s LEFT JOIN progress p ON p.student_id = s.id
     WHERE s.class_code = $1 ORDER BY p.xp DESC NULLS LAST`,
    [c.req.param('classCode')],
  );
  return c.json({ students: rows.rows });
});

/** 「길잡이 별」 도움 요청 — 학생 토큰 필요. 닉네임·반은 토큰에서 신뢰 도출 */
app.post('/api/help', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  const token = extractBearer(c.req.header('Authorization'));
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.typ === 'refresh') return c.json({ error: 'unauthorized' }, 401);
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({} as Record<string, unknown>));
  const stu = await pool.query('SELECT class_code, nickname FROM students WHERE id = $1', [payload.sid]);
  if (stu.rowCount === 0) return c.json({ error: 'student not found' }, 404);
  const { class_code, nickname } = stu.rows[0] as { class_code: string; nickname: string };
  await pool.query(
    `INSERT INTO help_requests (student_id, class_code, nickname, skill_id, unit_id, stage_id, problem_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [payload.sid, class_code, nickname, str(body.skillId), str(body.unitId), str(body.stageId), str(body.problemId)],
  );
  return c.json({ ok: true });
});

/** 오류 신고 — 토큰 있으면 학생 귀속, 없으면 클라 식별값 폴백(표시용) */
app.post('/api/report', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({} as Record<string, unknown>));
  const kind = body.kind === 'feature' ? 'feature' : 'problem';
  const message = typeof body.message === 'string' ? body.message.slice(0, 1000) : null;
  const context = body.context && typeof body.context === 'object' ? body.context : {};
  const token = extractBearer(c.req.header('Authorization'));
  const payload = token ? verifyToken(token) : null;
  let studentId: string | null = null;
  let classCode: string | null = null;
  let nickname: string | null = null;
  if (payload && payload.typ !== 'refresh') {
    const stu = await pool.query('SELECT class_code, nickname FROM students WHERE id = $1', [payload.sid]);
    if (stu.rowCount && stu.rowCount > 0) {
      studentId = payload.sid as string;
      classCode = (stu.rows[0] as { class_code: string }).class_code;
      nickname = (stu.rows[0] as { nickname: string }).nickname;
    }
  }
  if (!classCode) classCode = str(body.classCode, 8);
  if (!nickname) nickname = str(body.nickname, 20);
  await pool.query(
    `INSERT INTO error_reports (student_id, class_code, nickname, kind, message, context)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [studentId, classCode, nickname, kind, message, JSON.stringify(context).slice(0, 4000)],
  );
  return c.json({ ok: true });
});

/** 교사 — 「길잡이 별」 집계 (반 누적 + 학생별 + 최근) */
app.get('/api/teacher/:classCode/help', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  if (!teacherAuthorized(c.req.header('X-Teacher-Key'))) return c.json({ error: 'forbidden' }, 403);
  const code = c.req.param('classCode');
  const [classTotals, byStudent, recent] = await Promise.all([
    pool.query(
      `SELECT skill_id, unit_id, count(*)::int AS n FROM help_requests
       WHERE class_code = $1 GROUP BY skill_id, unit_id ORDER BY n DESC LIMIT 100`, [code]),
    pool.query(
      `SELECT nickname, skill_id, unit_id, count(*)::int AS n FROM help_requests
       WHERE class_code = $1 GROUP BY nickname, skill_id, unit_id ORDER BY nickname ASC, n DESC`, [code]),
    pool.query(
      `SELECT nickname, skill_id, unit_id, stage_id, created_at FROM help_requests
       WHERE class_code = $1 ORDER BY created_at DESC LIMIT 100`, [code]),
  ]);
  return c.json({ classTotals: classTotals.rows, byStudent: byStudent.rows, recent: recent.rows });
});

/** 교사 — 오류 신고 목록 (해당 반 + 익명) */
app.get('/api/teacher/:classCode/reports', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  if (!teacherAuthorized(c.req.header('X-Teacher-Key'))) return c.json({ error: 'forbidden' }, 403);
  const code = c.req.param('classCode');
  const rows = await pool.query(
    `SELECT id, nickname, kind, message, context, status, created_at FROM error_reports
     WHERE class_code = $1 OR class_code IS NULL ORDER BY created_at DESC LIMIT 300`, [code]);
  return c.json({ reports: rows.rows });
});

/** 교사 — 오류 신고 상태 변경(처리완료 표시) */
app.post('/api/teacher/:classCode/reports/resolve', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  if (!teacherAuthorized(c.req.header('X-Teacher-Key'))) return c.json({ error: 'forbidden' }, 403);
  const body = await c.req.json<{ ids?: string[]; status?: string }>().catch(() => ({} as Record<string, unknown>));
  const ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === 'string').slice(0, 300) : [];
  const status = body.status === 'open' ? 'open' : 'resolved';
  if (ids.length === 0) return c.json({ ok: true, updated: 0 });
  const res = await pool.query(`UPDATE error_reports SET status = $1 WHERE id = ANY($2::uuid[])`, [status, ids]);
  return c.json({ ok: true, updated: res.rowCount ?? 0 });
});

// ── Phase D 단원평가 배포 ─────────────────────────────────────────────────────

/** 교사 — 단원평가 발행 (X-Teacher-Key) */
app.post('/api/teacher/:classCode/assignments', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  if (!teacherAuthorized(c.req.header('X-Teacher-Key'))) return c.json({ error: 'forbidden' }, 403);
  const classCode = c.req.param('classCode');
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({} as Record<string, unknown>));

  const title = str(body.title, 60) ?? '';
  const targetType = body.targetType === 'student' ? 'student' : 'class';
  const targetNickname = targetType === 'student' ? str(body.targetNickname, 20) : null;
  if (targetType === 'student' && !targetNickname) return c.json({ error: 'target nickname required' }, 400);

  // config 검증 — 신뢰 가능한 형태로만 보관 (출제 엔진 입력)
  const rawCfg = (body.config && typeof body.config === 'object' ? body.config : {}) as Record<string, unknown>;
  const unitIds = Array.isArray(rawCfg.unitIds)
    ? rawCfg.unitIds.filter((x): x is string => typeof x === 'string').slice(0, 30)
    : [];
  if (unitIds.length === 0) return c.json({ error: 'unitIds required' }, 400);
  const count = Math.max(1, Math.min(50, Math.floor(Number(rawCfg.count) || 10)));
  const rawMix = (rawCfg.mix && typeof rawCfg.mix === 'object' ? rawCfg.mix : {}) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && v >= 0 && Number.isFinite(v) ? v : 0);
  const mix = { low: num(rawMix.low), mid: num(rawMix.mid), high: num(rawMix.high) };
  const focusSkillIds = Array.isArray(rawCfg.focusSkillIds)
    ? rawCfg.focusSkillIds.filter((x): x is string => typeof x === 'string').slice(0, 50)
    : [];
  const config = { unitIds, count, mix, weakWeight: rawCfg.weakWeight === true, focusSkillIds };

  const seed =
    typeof body.seed === 'number' && Number.isFinite(body.seed)
      ? Math.floor(body.seed) >>> 0
      : Math.floor(Math.random() * 0xffffffff);

  const inserted = await pool.query(
    `INSERT INTO assignments (class_code, title, target_type, target_nickname, config, seed)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
    [classCode, title, targetType, targetNickname, JSON.stringify(config), seed],
  );
  const row = inserted.rows[0] as { id: string; created_at: string };
  return c.json({ ok: true, id: row.id, seed, createdAt: row.created_at });
});

/** 교사 — 발행 목록 + 응시 결과 (X-Teacher-Key) */
app.get('/api/teacher/:classCode/assignments', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  if (!teacherAuthorized(c.req.header('X-Teacher-Key'))) return c.json({ error: 'forbidden' }, 403);
  const classCode = c.req.param('classCode');
  const [assignments, results] = await Promise.all([
    pool.query(
      `SELECT id, title, target_type, target_nickname, config, seed, status, created_at
       FROM assignments WHERE class_code = $1 ORDER BY created_at DESC LIMIT 200`,
      [classCode],
    ),
    pool.query(
      `SELECT r.assignment_id, r.nickname, r.score, r.total, r.items, r.submitted_at
       FROM assignment_results r JOIN assignments a ON a.id = r.assignment_id
       WHERE a.class_code = $1 ORDER BY r.submitted_at ASC`,
      [classCode],
    ),
  ]);
  return c.json({ assignments: assignments.rows, results: results.rows });
});

/** 교사 — 발행 마감/재개 (X-Teacher-Key) */
app.post('/api/teacher/:classCode/assignments/:id/status', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  if (!teacherAuthorized(c.req.header('X-Teacher-Key'))) return c.json({ error: 'forbidden' }, 403);
  const body = await c.req.json<{ status?: string }>().catch(() => ({} as Record<string, unknown>));
  const status = body.status === 'closed' ? 'closed' : 'open';
  const res = await pool.query(
    `UPDATE assignments SET status = $1 WHERE id = $2 AND class_code = $3`,
    [status, c.req.param('id'), c.req.param('classCode')],
  );
  return c.json({ ok: true, updated: res.rowCount ?? 0 });
});

/** 학생 — 나에게 도착한(미응시) 시험 목록 (Bearer 토큰) */
app.get('/api/student/assignments', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  const token = extractBearer(c.req.header('Authorization'));
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.typ === 'refresh') return c.json({ error: 'unauthorized' }, 401);
  const stu = await pool.query('SELECT class_code, nickname FROM students WHERE id = $1', [payload.sid]);
  if (stu.rowCount === 0) return c.json({ error: 'student not found' }, 404);
  const { class_code, nickname } = stu.rows[0] as { class_code: string; nickname: string };

  const rows = await pool.query(
    `SELECT a.id, a.title, a.target_type, a.config, a.seed, a.created_at
     FROM assignments a
     WHERE a.class_code = $1 AND a.status = 'open'
       AND (a.target_type = 'class' OR (a.target_type = 'student' AND a.target_nickname = $2))
       AND NOT EXISTS (
         SELECT 1 FROM assignment_results r WHERE r.assignment_id = a.id AND r.student_id = $3
       )
     ORDER BY a.created_at DESC LIMIT 50`,
    [class_code, nickname, payload.sid],
  );
  return c.json({ assignments: rows.rows });
});

/** 학생 — 시험 제출 (Bearer 토큰, 1회) */
app.post('/api/student/assignments/:id/submit', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  const token = extractBearer(c.req.header('Authorization'));
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.typ === 'refresh') return c.json({ error: 'unauthorized' }, 401);
  const stu = await pool.query('SELECT class_code, nickname FROM students WHERE id = $1', [payload.sid]);
  if (stu.rowCount === 0) return c.json({ error: 'student not found' }, 404);
  const { class_code, nickname } = stu.rows[0] as { class_code: string; nickname: string };

  const assignmentId = c.req.param('id');
  const asg = await pool.query('SELECT class_code FROM assignments WHERE id = $1', [assignmentId]);
  if (asg.rowCount === 0) return c.json({ error: 'assignment not found' }, 404);
  if ((asg.rows[0] as { class_code: string }).class_code !== class_code) return c.json({ error: 'forbidden' }, 403);

  const body = await c.req.json<Record<string, unknown>>().catch(() => ({} as Record<string, unknown>));
  const total = Math.max(0, Math.min(50, Math.floor(Number(body.total) || 0)));
  const score = Math.max(0, Math.min(total, Math.floor(Number(body.score) || 0)));
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];

  const res = await pool.query(
    `INSERT INTO assignment_results (assignment_id, student_id, nickname, score, total, items)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (assignment_id, student_id) DO NOTHING
     RETURNING id`,
    [assignmentId, payload.sid, nickname, score, total, JSON.stringify(items)],
  );
  return c.json({ ok: true, recorded: (res.rowCount ?? 0) > 0 });
});

app.get('/api/health', (c) => c.json({ ok: true, db: !!pool }));

// ── 정적 서빙 (client 빌드 결과) ──
const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(here, '../../client/dist');
if (existsSync(clientDist)) {
  const root = path.relative(process.cwd(), clientDist);
  app.use('/*', serveStatic({ root }));
  app.get('*', serveStatic({ root, path: 'index.html' }));
}

const port = Number(process.env.PORT ?? 3000);
await bootstrap();
serve({ fetch: app.fetch, port }, () => {
  console.log(`math_mon 서버 시작: http://localhost:${port}`);
});
