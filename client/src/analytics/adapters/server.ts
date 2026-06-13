import type { AnalyticsAdapter } from '../dispatcher';
import type { AnalyticsEvent } from '../types';

interface ServerAdapterOptions {
  baseUrl: string;
  getToken: () => string | null;
}

/** 서버 전송 어댑터 — POST /api/events + Authorization: Bearer */
export function createServerAdapter(opts: ServerAdapterOptions): AnalyticsAdapter {
  const { baseUrl, getToken } = opts;
  const url = `${baseUrl}/api/events`;

  return {
    send: async (events: AnalyticsEvent[]) => {
      const token = getToken();
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ events }),
        });

        if (res.status === 401) {
          // 인증 오류 — 재시도 가능 (토큰 갱신 후 다시)
          return { ok: false, retriable: true };
        }
        if (res.status === 400) {
          // 잘못된 요청 — 폐기
          return { ok: false, retriable: false };
        }
        if (res.status >= 500) {
          return { ok: false, retriable: true };
        }

        return { ok: res.ok };
      } catch {
        // 네트워크 오류 — 재시도 가능
        return { ok: false, retriable: true };
      }
    },

    beacon: (events: AnalyticsEvent[]) => {
      // sendBeacon은 쿼리 파라미터로 토큰을 전달할 수 없으므로 body에 _token 포함
      const token = getToken();
      const payload = token ? { events, _token: token } : { events };
      try {
        navigator.sendBeacon(
          url,
          new Blob([JSON.stringify(payload)], { type: 'application/json' }),
        );
      } catch {
        // 이탈 시 전송 실패는 무시
      }
    },
  };
}
