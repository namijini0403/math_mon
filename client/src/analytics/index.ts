import { type AnalyticsEvent, type EventType, sanitizeEvent } from './types';
import { push } from './queue';
import {
  type AnalyticsAdapter,
  flush,
  onPushed,
  setAdapter,
  startInterval,
  stopInterval,
} from './dispatcher';
import { noopAdapter } from './adapters/noop';

export type { EventType, AnalyticsAdapter };
export { flush as flushAnalytics };

export const APP_VERSION = '1.0.0';

let sessionId = '';

/** 세션 ID (초기화 후 유효) */
export function getSessionId(): string {
  return sessionId;
}

/** 앱 부팅 시 한 번 호출. session.start 트랙 + 30초 인터벌 + visibilitychange 리스너 등록 */
export function initAnalytics(adapter?: AnalyticsAdapter): void {
  setAdapter(adapter ?? noopAdapter);

  // 세션 ID 생성
  sessionId = crypto.randomUUID();

  // session.start
  void track('session.start');

  // 페이지 이탈/숨김 감지
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibility);
  }

  // 30초 인터벌 flush
  startInterval();
}

function handleVisibility(): void {
  if (document.visibilityState === 'hidden') {
    void track('session.end');
    // beacon 경로로 flush
    void flush(true);
  }
}

/** 어댑터 런타임 교체 (2단계 전환용) */
export function setAnalyticsAdapter(adapter: AnalyticsAdapter): void {
  setAdapter(adapter);
}

/** 이벤트 트래킹 */
export async function track(
  type: EventType,
  fields?: Partial<Omit<AnalyticsEvent, 'event_type' | 'event_id' | 'app_id' | 'app_version' | 'session_id' | 'client_ts' | 'device_type'>>,
): Promise<void> {
  // device_type: localStorage에서 읽기 (없으면 unknown)
  let device_type: 'laptop' | 'phone' | 'unknown' = 'unknown';
  try {
    const stored = localStorage.getItem('draconis-device');
    if (stored === 'laptop' || stored === 'phone') device_type = stored;
  } catch {
    // localStorage 접근 불가
  }

  // semester_id: localStorage에서 읽기
  let semester_id: string | undefined;
  try {
    const sem = localStorage.getItem('mathmon-semester');
    if (sem) semester_id = sem;
  } catch {
    // localStorage 접근 불가
  }

  const raw: Record<string, unknown> = {
    event_id: crypto.randomUUID(),
    event_type: type,
    app_id: 'draconis',
    app_version: APP_VERSION,
    session_id: sessionId,
    device_type,
    client_ts: new Date().toISOString(),
    ...(semester_id ? { semester_id } : {}),
    ...fields,
  };

  const sanitized = sanitizeEvent(raw);
  if (!sanitized) {
    console.warn('[analytics] sanitizeEvent returned null for', raw);
    return;
  }

  await push(sanitized);
  await onPushed();
}

/** 테스트/SSR 종료 시 정리 */
export function teardownAnalytics(): void {
  stopInterval();
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibility);
  }
}
