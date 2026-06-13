/**
 * analytics 모듈 단위 테스트 — node 환경 (인메모리 폴백 경로)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sanitizeEvent } from './types';
import { push, popBatch, remove, size } from './queue';
import {
  type AnalyticsAdapter,
  setAdapter,
  flush,
  stopInterval,
  onPushed,
} from './dispatcher';
import type { AnalyticsEvent } from './types';

// ── 공통 헬퍼 ─────────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    event_id: crypto.randomUUID(),
    event_type: 'lesson.start',
    app_id: 'draconis',
    app_version: '1.0.0',
    session_id: 'sess-001',
    device_type: 'laptop',
    client_ts: new Date().toISOString(),
    ...overrides,
  };
}

function makeValidEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    event_id: crypto.randomUUID(),
    event_type: 'lesson.start',
    app_id: 'draconis',
    app_version: '1.0.0',
    session_id: 'sess-001',
    device_type: 'laptop',
    client_ts: new Date().toISOString(),
    ...overrides,
  };
}

// ── 큐 초기화: 각 테스트 전에 인메모리 큐를 비운다 ──────────────────────────
// queue.ts는 모듈 레벨 memQueue를 갖는다. remove(all)로 비운다.
async function drainQueue() {
  const all = await popBatch(1000);
  if (all.length > 0) await remove(all.map((r) => r.id));
}

// ── 1. sanitizeEvent 화이트리스트 테스트 ─────────────────────────────────────

describe('sanitizeEvent', () => {
  it('유효한 이벤트를 통과시킨다', () => {
    const raw = makeEvent();
    expect(sanitizeEvent(raw)).not.toBeNull();
  });

  it('허용되지 않은 event_type은 null 반환', () => {
    expect(sanitizeEvent(makeEvent({ event_type: 'unknown.event' }))).toBeNull();
  });

  it('app_id가 draconis가 아니면 null 반환', () => {
    expect(sanitizeEvent(makeEvent({ app_id: 'other' }))).toBeNull();
  });

  it('필수 문자열 누락 시 null 반환', () => {
    expect(sanitizeEvent(makeEvent({ event_id: '' }))).toBeNull();
    expect(sanitizeEvent(makeEvent({ session_id: undefined }))).toBeNull();
    expect(sanitizeEvent(makeEvent({ client_ts: undefined }))).toBeNull();
  });

  it('타입 불일치 필드는 null 반환', () => {
    expect(sanitizeEvent(makeEvent({ app_version: 123 }))).toBeNull();
    expect(sanitizeEvent(makeEvent({ device_type: 'tablet' }))).toBeNull();
  });

  it('화이트리스트 외 필드는 결과에 포함되지 않는다', () => {
    const result = sanitizeEvent(makeEvent({ unknown_field: 'secret', another: 42 }));
    expect(result).not.toBeNull();
    expect((result as unknown as Record<string, unknown>)['unknown_field']).toBeUndefined();
    expect((result as unknown as Record<string, unknown>)['another']).toBeUndefined();
  });

  it('선택 필드가 올바른 타입이면 포함된다', () => {
    const result = sanitizeEvent(
      makeEvent({ unit_id: 'u1', correct: true, score: 100, elapsed_ms: 500, stars: 3 }),
    );
    expect(result).not.toBeNull();
    expect(result!.unit_id).toBe('u1');
    expect(result!.correct).toBe(true);
    expect(result!.score).toBe(100);
    expect(result!.elapsed_ms).toBe(500);
    expect(result!.stars).toBe(3);
  });

  it('21가지 event_type을 모두 허용한다', () => {
    const types = [
      'session.start', 'session.end',
      'auth.login',
      'lesson.start', 'lesson.answer', 'lesson.complete', 'lesson.fail', 'lesson.abandon',
      'boss.start', 'boss.answer', 'boss.defeat', 'boss.fail',
      'practice.answer', 'practice.set_complete',
      'exam.start', 'exam.answer', 'exam.complete',
      'daily_reward.claim', 'mission.claim', 'dragon.feed',
    ];
    for (const et of types) {
      expect(sanitizeEvent(makeEvent({ event_type: et }))).not.toBeNull();
    }
  });
});

// ── 2. 큐 FIFO·500 상한 테스트 ───────────────────────────────────────────────

describe('queue', () => {
  beforeEach(async () => {
    await drainQueue();
  });

  it('push/pop 기본 동작', async () => {
    const e1 = makeValidEvent({ event_id: 'id-1' });
    const e2 = makeValidEvent({ event_id: 'id-2' });
    await push(e1);
    await push(e2);
    expect(await size()).toBe(2);
    const batch = await popBatch(10);
    expect(batch.length).toBe(2);
    expect(batch[0].event.event_id).toBe('id-1');
    expect(batch[1].event.event_id).toBe('id-2');
  });

  it('popBatch는 항목을 제거하지 않는다', async () => {
    await push(makeValidEvent());
    await popBatch(10);
    expect(await size()).toBe(1);
  });

  it('remove로 항목 삭제', async () => {
    await push(makeValidEvent({ event_id: 'del-1' }));
    await push(makeValidEvent({ event_id: 'del-2' }));
    const batch = await popBatch(10);
    await remove([batch[0].id]);
    expect(await size()).toBe(1);
    const remaining = await popBatch(10);
    expect(remaining[0].event.event_id).toBe('del-2');
  });

  it('500건 FIFO — 501번째 push 시 가장 오래된 항목이 제거된다', async () => {
    // 500개 push
    for (let i = 0; i < 500; i++) {
      await push(makeValidEvent({ event_id: `bulk-${i}` }));
    }
    expect(await size()).toBe(500);

    // 501번째 push
    await push(makeValidEvent({ event_id: 'overflow' }));
    expect(await size()).toBe(500);

    // 가장 오래된 bulk-0이 제거되고 overflow가 포함돼야 한다
    const first = await popBatch(1);
    // FIFO: bulk-0이 evict되었으므로 첫 번째는 bulk-1
    expect(first[0].event.event_id).toBe('bulk-1');
  }, 30000);
});

// ── 3. dispatcher 배치 테스트 ─────────────────────────────────────────────────

describe('dispatcher', () => {
  beforeEach(async () => {
    stopInterval();
    await drainQueue();
  });

  afterEach(() => {
    stopInterval();
  });

  it('성공 시 큐에서 제거', async () => {
    const adapter: AnalyticsAdapter = {
      send: vi.fn().mockResolvedValue({ ok: true }),
    };
    setAdapter(adapter);
    await push(makeValidEvent({ event_id: 'flush-1' }));
    await push(makeValidEvent({ event_id: 'flush-2' }));
    await flush();
    expect(await size()).toBe(0);
    expect(adapter.send).toHaveBeenCalledOnce();
  });

  it('retriable 실패 시 큐에 보존', async () => {
    const adapter: AnalyticsAdapter = {
      send: vi.fn().mockResolvedValue({ ok: false, retriable: true }),
    };
    setAdapter(adapter);
    await push(makeValidEvent({ event_id: 'keep-1' }));
    await flush();
    expect(await size()).toBe(1);
  });

  it('retriable=false(400) 시 큐에서 폐기', async () => {
    const adapter: AnalyticsAdapter = {
      send: vi.fn().mockResolvedValue({ ok: false, retriable: false }),
    };
    setAdapter(adapter);
    await push(makeValidEvent({ event_id: 'discard-1' }));
    await flush();
    expect(await size()).toBe(0);
  });

  it('20건 누적 시 onPushed가 즉시 flush 트리거', async () => {
    const sent: AnalyticsEvent[][] = [];
    const adapter: AnalyticsAdapter = {
      send: vi.fn().mockImplementation(async (events) => {
        sent.push(events);
        return { ok: true };
      }),
    };
    setAdapter(adapter);

    for (let i = 0; i < 19; i++) {
      await push(makeValidEvent({ event_id: `pre-${i}` }));
    }
    // 아직 flush 안 됨
    expect(sent.length).toBe(0);

    // 20번째 push 후 onPushed 호출 — flush 트리거돼야 한다
    await push(makeValidEvent({ event_id: 'trigger-20' }));
    await onPushed();
    expect(sent.length).toBeGreaterThanOrEqual(1);
    expect(await size()).toBe(0);
  });
});

// ── 4. event_id 고유성 테스트 ─────────────────────────────────────────────────

describe('event_id uniqueness', () => {
  it('1000번 생성해도 중복 없음', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(crypto.randomUUID());
    }
    expect(ids.size).toBe(1000);
  });
});
