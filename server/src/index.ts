/** math_mon 서버 — API + 빌드된 PWA 정적 서빙 (단일 Railway 서비스) */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { bootstrap, pool } from './db.js';

const app = new Hono();

function pinHash(pin: string, classCode: string, nickname: string): string {
  return createHash('sha256').update(`${pin}:${classCode}:${nickname}`).digest('hex');
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

  const hash = pinHash(pin, classCode, nickname);
  const existing = await pool.query(
    'SELECT id, pin_hash FROM students WHERE class_code = $1 AND nickname = $2',
    [classCode, nickname],
  );
  if (existing.rowCount && existing.rowCount > 0) {
    if (existing.rows[0].pin_hash !== hash) return c.json({ error: 'wrong pin' }, 403);
    return c.json({ studentId: existing.rows[0].id, nickname, classCode });
  }
  const inserted = await pool.query(
    'INSERT INTO students (class_code, nickname, pin_hash) VALUES ($1, $2, $3) RETURNING id',
    [classCode, nickname, hash],
  );
  return c.json({ studentId: inserted.rows[0].id, nickname, classCode });
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
  }>();
  if (!body.studentId) return c.json({ error: 'bad request' }, 400);
  await pool.query(
    `INSERT INTO progress (student_id, xp, stages, skill_stats, card_count, streak, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (student_id) DO UPDATE SET
       xp = EXCLUDED.xp, stages = EXCLUDED.stages, skill_stats = EXCLUDED.skill_stats,
       card_count = EXCLUDED.card_count, streak = EXCLUDED.streak, updated_at = now()`,
    [
      body.studentId,
      body.xp ?? 0,
      JSON.stringify(body.stages ?? {}),
      JSON.stringify(body.skillStats ?? {}),
      body.cardCount ?? 0,
      body.streak ?? 0,
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
