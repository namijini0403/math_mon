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
    if (!pinOk) return c.json({ error: 'wrong pin' }, 403);

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

  // TODO(2단계): Bearer 토큰을 필수로 강제 전환 예정.
  // 현재는 토큰이 있으면 검증 + studentId 일치 확인, 없으면 기존 동작(하위호환) 유지.
  const authHeader = c.req.header('Authorization');
  const bearerToken = extractBearer(authHeader);
  if (bearerToken) {
    const payload = verifyToken(bearerToken);
    if (!payload) return c.json({ error: 'invalid token' }, 401);
    if (payload.sid !== body.studentId) return c.json({ error: 'forbidden' }, 403);
  }

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

/** 교사용 — 반 현황 */
app.get('/api/teacher/:classCode', async (c) => {
  if (!pool) return c.json({ error: 'db unavailable' }, 503);
  const key = c.req.query('key');
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
