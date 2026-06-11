/** 서버 API 클라이언트 — 오프라인/서버 없음 환경에서도 앱이 동작하도록 베스트에포트 */

export interface JoinResult {
  studentId: string;
  nickname: string;
  classCode: string;
}

async function post<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** 반 코드 + 닉네임 + PIN으로 가입/로그인 (서버가 같은 닉네임이면 PIN 검증) */
export function join(classCode: string, nickname: string, pin: string) {
  return post<JoinResult>('/api/auth/join', { classCode, nickname, pin });
}

/** 진도 스냅샷 업로드 */
export function pushProgress(s: {
  studentId: string | null;
  xp: number;
  stages: Record<string, { stars: number }>;
  skillStats: Record<string, { c: number; w: number }>;
  cards: unknown[];
  streak: { last: string; count: number };
}) {
  if (!s.studentId) return Promise.resolve(null);
  return post('/api/progress', {
    studentId: s.studentId,
    xp: s.xp,
    stages: s.stages,
    skillStats: s.skillStats,
    cardCount: s.cards.length,
    streak: s.streak.count,
  });
}
