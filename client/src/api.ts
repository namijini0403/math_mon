/** 서버 API 클라이언트 — 오프라인/서버 없음 환경에서도 앱이 동작하도록 베스트에포트 */

export interface JoinResult {
  studentId: string;
  nickname: string;
  classCode: string;
  /** 서버에 저장된 전체 게임 상태 (기존 학생 재로그인 시 복원용) */
  save?: Record<string, unknown> | null;
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
  'records',
  'dragon',
  'practice',
] as const;

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

/** 진도 스냅샷 + 전체 세이브 업로드 */
export function pushProgress(s: {
  studentId: string | null;
  xp: number;
  stages: Record<string, { stars: number }>;
  skillStats: Record<string, { c: number; w: number }>;
  cards: unknown[];
  streak: { last: string; count: number };
}) {
  if (!s.studentId) return Promise.resolve(null);
  const save: Record<string, unknown> = {};
  const anyState = s as unknown as Record<string, unknown>;
  for (const k of SAVE_KEYS) save[k] = anyState[k];
  return post('/api/progress', {
    studentId: s.studentId,
    xp: s.xp,
    stages: s.stages,
    skillStats: s.skillStats,
    cardCount: s.cards.length,
    streak: s.streak.count,
    save,
  });
}
