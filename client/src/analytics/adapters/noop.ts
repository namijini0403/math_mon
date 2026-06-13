import type { AnalyticsAdapter } from '../dispatcher';
import type { AnalyticsEvent } from '../types';

/** 개발용 noop 어댑터 — 콘솔에 출력 후 성공 반환 */
export const noopAdapter: AnalyticsAdapter = {
  send: async (events: AnalyticsEvent[]) => {
    console.debug('[analytics]', events);
    return { ok: true };
  },
};
