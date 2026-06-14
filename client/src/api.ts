/** 서버 API 클라이언트 — 오프라인/서버 없음 환경에서도 앱이 동작하도록 베스트에포트 */

import { setAnalyticsAdapter } from './analytics';
import { createServerAdapter } from './analytics/adapters/server';

export interface JoinResult {
  studentId: string;
  nickname: string;
  classCode: string;
  /** 서버에 저장된 전체 게임 상태 (기존 학생 재로그인 시 복원용) */
  save?: Record<string, unknown> | null;
  /** 분석용 가명 식별자 */
  pseudonymId?: string;
  /** access 토큰 (1시간) */
  accessToken?: string;
  /** refresh 토큰 (90일) */
  refreshToken?: string;
}

/** 서버에 통째로 저장하는 게임 상태 필드 (프로필 식별자는 제외) */
export const SAVE_KEYS = [
  'xp',
  'stages',
  'skillStats',
  'cards',
  'streak',
  'daily',
  'recentWrong',
  'attendance',
  'badges',
  'rewardCards',
  'rewardCardCounts',
  'hiddenDone',
  'examCount',
  'finalExamCleared',
  'records',
  'dragon',
  'practice',
  'helpLog',
] as const;

// ── 토큰 저장소 ──────────────────────────────────────────────────────────────
const LS_REFRESH_KEY = 'draconis-refresh';
const IDB_DB_NAME = 'draconis-auth';
const IDB_STORE = 'tokens';
const IDB_REFRESH_KEY = 'refresh';

/** 모듈 메모리에 보관하는 access 토큰 */
let _accessToken: string | null = null;

/** 다른 모듈(analytics ServerAdapter 등)이 사용하는 계약 */
export function getAccessToken(): string | null {
  return _accessToken;
}

/** access 토큰 JWT payload의 exp(epoch seconds) 반환. 파싱 실패 시 0 */
function getTokenExp(token: string): number {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return 0;
    const padded = parts[1] + '==='.slice((parts[1].length + 3) % 4);
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { exp?: number };
    return payload.exp ?? 0;
  } catch {
    return 0;
  }
}

/** access 토큰이 유효하고 만료까지 5분 이상 남아있으면 true */
function isTokenFresh(token: string | null): boolean {
  if (!token) return false;
  const exp = getTokenExp(token);
  const nowSec = Math.floor(Date.now() / 1000);
  return exp - nowSec > 5 * 60; // 5분 여유
}

// ── IndexedDB 헬퍼 (iOS Safari 7일 만료 대응 이중 저장) ────────────────────
function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: string): Promise<void> {
  try {
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB 실패는 무시 (localStorage 폴백으로 충분)
  }
}

async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await openIdb();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/** refresh 토큰을 localStorage + IndexedDB(이중)에 저장 */
async function storeRefreshToken(token: string): Promise<void> {
  try { localStorage.setItem(LS_REFRESH_KEY, token); } catch { /* noop */ }
  await idbSet(IDB_REFRESH_KEY, token);
}

/** refresh 토큰을 IndexedDB에서 삭제 */
async function idbDel(key: string): Promise<void> {
  try {
    const db = await openIdb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* noop */
  }
}

/**
 * 로그아웃/기기 전환 — 메모리·localStorage·IndexedDB의 인증 흔적을 모두 제거.
 * (공유 기기에서 다음 학생이 이전 학생 계정에 접근하지 못하게. SECURITY-PLAN H2)
 */
export async function clearAuth(): Promise<void> {
  _accessToken = null;
  _serverAnalyticsOn = false;
  try { localStorage.removeItem(LS_REFRESH_KEY); } catch { /* noop */ }
  await idbDel(IDB_REFRESH_KEY);
}

/** refresh 토큰을 읽기 (localStorage 우선, 없으면 IndexedDB) */
async function loadRefreshToken(): Promise<string | null> {
  try {
    const ls = localStorage.getItem(LS_REFRESH_KEY);
    if (ls) return ls;
  } catch { /* noop */ }
  return idbGet(IDB_REFRESH_KEY);
}

/** join 응답에서 토큰들을 메모리/영구 저장소에 저장 */
async function storeTokens(data: JoinResult): Promise<void> {
  if (data.accessToken) _accessToken = data.accessToken;
  if (data.refreshToken) await storeRefreshToken(data.refreshToken);
}

// ── analytics 어댑터 전환 ────────────────────────────────────────────────────
// 서버 모드가 확인되는 순간(로그인·토큰 갱신 성공) no-op → 서버 전송으로 전환.
// GitHub Pages 등 서버 없는 배포에서는 호출되지 않아 no-op 유지.
let _serverAnalyticsOn = false;
function enableServerAnalytics(): void {
  if (_serverAnalyticsOn || !_accessToken) return;
  _serverAnalyticsOn = true;
  setAnalyticsAdapter(createServerAdapter({ baseUrl: '', getToken: getAccessToken }));
}

/**
 * access 토큰이 없거나 만료 임박 시 refresh 엔드포인트로 갱신.
 * 실패해도 기존 동작에 영향 없음 (오프라인·로컬 모드 무영향).
 */
export async function ensureFreshToken(): Promise<void> {
  if (isTokenFresh(_accessToken)) return;

  const refreshToken = await loadRefreshToken();
  if (!refreshToken) return;

  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
    if (data.accessToken) _accessToken = data.accessToken;
    if (data.refreshToken) await storeRefreshToken(data.refreshToken);
    enableServerAnalytics();
  } catch {
    // 오프라인이거나 서버 없음 — 무시
  }
}

// ── 기본 POST 헬퍼 ────────────────────────────────────────────────────────────
async function post<T>(
  path: string,
  body: unknown,
  options?: { bearerToken?: string },
): Promise<T | null> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options?.bearerToken) {
      headers['Authorization'] = `Bearer ${options.bearerToken}`;
    }
    const res = await fetch(path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type JoinOutcome =
  | { kind: 'ok'; data: JoinResult }
  | { kind: 'wrong-pin' }
  | { kind: 'no-class' }
  | { kind: 'no-server' };

/** 반 코드 + 닉네임 + PIN으로 가입/로그인 — 실패 원인을 구분해 반환 */
export async function join(classCode: string, nickname: string, pin: string): Promise<JoinOutcome> {
  try {
    const res = await fetch('/api/auth/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classCode, nickname, pin }),
    });
    if (res.ok) {
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('json')) return { kind: 'no-server' };
      const data = (await res.json()) as JoinResult;
      // 토큰 저장 (실패해도 무시)
      await storeTokens(data).catch(() => undefined);
      enableServerAnalytics();
      return { kind: 'ok', data };
    }
    if (res.status === 403) return { kind: 'wrong-pin' };
    if (res.status === 404) {
      // 서버의 "반 없음" 응답(JSON)과 정적 호스팅의 404 페이지(HTML)를 구분
      const ct = res.headers.get('content-type') ?? '';
      return ct.includes('json') ? { kind: 'no-class' } : { kind: 'no-server' };
    }
    return { kind: 'no-server' };
  } catch {
    return { kind: 'no-server' };
  }
}

// ── 길잡이 별(도움 요청) + 오류 신고 — 베스트에포트 전송 + 오프라인 큐 ──────────
const LS_HELP_QUEUE = 'mathmon-help-queue';
const LS_REPORT_QUEUE = 'mathmon-report-queue';

function readQueue(key: string): unknown[] {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function writeQueue(key: string, arr: unknown[]): void {
  try { localStorage.setItem(key, JSON.stringify(arr.slice(-50))); } catch { /* noop */ }
}

/** 인증 토큰 갱신 후 POST. 성공 여부(boolean) 반환 */
async function postAuthed(path: string, body: unknown): Promise<boolean> {
  await ensureFreshToken().catch(() => undefined);
  const res = await post(path, body, _accessToken ? { bearerToken: _accessToken } : undefined);
  return res !== null;
}

export interface HelpPayload {
  skillId?: string;
  unitId?: string;
  stageId?: string;
  problemId?: string;
}

/** 「길잡이 별」 도움 요청 전송 — 실패 시 로컬 큐에 보관해 다음에 재전송 */
export async function sendHelpRequest(p: HelpPayload): Promise<boolean> {
  const ok = await postAuthed('/api/help', p);
  if (!ok) writeQueue(LS_HELP_QUEUE, [...readQueue(LS_HELP_QUEUE), p]);
  return ok;
}

export interface ReportPayload {
  kind: 'problem' | 'feature';
  message?: string;
  context?: Record<string, unknown>;
  classCode?: string | null;
  nickname?: string | null;
}

/** 오류 신고 전송 — 실패 시 로컬 큐에 보관 */
export async function sendErrorReport(p: ReportPayload): Promise<boolean> {
  const ok = await postAuthed('/api/report', p);
  if (!ok) writeQueue(LS_REPORT_QUEUE, [...readQueue(LS_REPORT_QUEUE), p]);
  return ok;
}

/** 앱 시작 시 호출 — 큐에 쌓인 도움 요청/오류 신고를 재전송 */
export async function flushReportQueues(): Promise<void> {
  for (const [key, path] of [[LS_HELP_QUEUE, '/api/help'], [LS_REPORT_QUEUE, '/api/report']] as const) {
    const q = readQueue(key);
    if (q.length === 0) continue;
    const remaining: unknown[] = [];
    for (const item of q) {
      if (!(await postAuthed(path, item))) remaining.push(item);
    }
    writeQueue(key, remaining);
  }
}

/** 진도 스냅샷 + 전체 세이브 업로드 */
export async function pushProgress(s: {
  studentId: string | null;
  xp: number;
  stages: Record<string, { stars: number }>;
  skillStats: Record<string, { c: number; w: number }>;
  cards: unknown[];
  streak: { last: string; count: number };
}) {
  if (!s.studentId) return Promise.resolve(null);

  // access 토큰 갱신 시도 (실패해도 계속)
  await ensureFreshToken().catch(() => undefined);

  const save: Record<string, unknown> = {};
  const anyState = s as unknown as Record<string, unknown>;
  for (const k of SAVE_KEYS) save[k] = anyState[k];

  return post(
    '/api/progress',
    {
      studentId: s.studentId,
      xp: s.xp,
      stages: s.stages,
      skillStats: s.skillStats,
      cardCount: s.cards.length,
      streak: s.streak.count,
      save,
    },
    _accessToken ? { bearerToken: _accessToken } : undefined,
  );
}
