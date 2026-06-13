import type { AnalyticsEvent } from './types';
import { popBatch, remove, size } from './queue';

export interface AnalyticsAdapter {
  send(events: AnalyticsEvent[]): Promise<{ ok: boolean; retriable?: boolean }>;
  /** 페이지 이탈 시 동기 전송 (sendBeacon). 실패해도 무시 */
  beacon?(events: AnalyticsEvent[]): void;
}

const BATCH_THRESHOLD = 20;
const INTERVAL_MS = 30_000;
const BACKOFF_STEPS = [30_000, 60_000, 120_000];

let currentAdapter: AnalyticsAdapter | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
let backoffStep = 0;
let backoffTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

/** 어댑터 교체 */
export function setAdapter(adapter: AnalyticsAdapter): void {
  currentAdapter = adapter;
}

/** 큐에서 배치를 꺼내 어댑터로 전송 */
export async function flush(useBeacon = false): Promise<void> {
  if (!currentAdapter || flushing) return;
  flushing = true;
  try {
    const batch = await popBatch(50);
    if (batch.length === 0) {
      flushing = false;
      return;
    }

    const events = batch.map((r) => r.event);
    const ids = batch.map((r) => r.id);

    if (useBeacon && currentAdapter.beacon) {
      currentAdapter.beacon(events);
      // beacon은 성공/실패 알 수 없으므로 낙관적으로 제거
      await remove(ids);
    } else {
      const result = await currentAdapter.send(events);
      if (result.ok) {
        await remove(ids);
        backoffStep = 0;
        // 남은 건이 있을 수 있으므로 재귀적으로 flush
        flushing = false;
        const remaining = await size();
        if (remaining > 0) {
          await flush();
          return;
        }
      } else if (result.retriable === false) {
        // 400 등 재시도 불가: 배치 폐기
        await remove(ids);
        backoffStep = 0;
      } else {
        // 네트워크·5xx 오류: 큐 보존 + 지수 백오프
        scheduleBackoff();
      }
    }
  } finally {
    flushing = false;
  }
}

/** 백오프 스케줄 */
function scheduleBackoff(): void {
  if (backoffTimer) return;
  const delay = BACKOFF_STEPS[Math.min(backoffStep, BACKOFF_STEPS.length - 1)];
  backoffStep = Math.min(backoffStep + 1, BACKOFF_STEPS.length - 1);
  backoffTimer = setTimeout(() => {
    backoffTimer = null;
    void flush();
  }, delay);
}

/** 큐에 이벤트가 도달한 뒤 호출 — 20건 도달 시 즉시 flush */
export async function onPushed(): Promise<void> {
  const s = await size();
  if (s >= BATCH_THRESHOLD) {
    await flush();
  }
}

/** 30초 인터벌 시작 */
export function startInterval(): void {
  if (intervalId) return;
  intervalId = setInterval(() => {
    void flush();
  }, INTERVAL_MS);
}

/** 인터벌 중지 (테스트·SSR용) */
export function stopInterval(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (backoffTimer) {
    clearTimeout(backoffTimer);
    backoffTimer = null;
  }
  backoffStep = 0;
  flushing = false;
}
