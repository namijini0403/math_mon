export type EventType =
  | 'session.start' | 'session.end'
  | 'auth.login'
  | 'lesson.start' | 'lesson.answer' | 'lesson.complete' | 'lesson.fail' | 'lesson.abandon'
  | 'boss.start' | 'boss.answer' | 'boss.defeat' | 'boss.fail'
  | 'practice.answer' | 'practice.set_complete'
  | 'exam.start' | 'exam.answer' | 'exam.complete'
  | 'daily_reward.claim' | 'mission.claim' | 'dragon.feed';

export interface AnalyticsEvent {
  event_id: string;            // 클라이언트 UUID (crypto.randomUUID) — 서버 멱등 처리용
  event_type: EventType;
  app_id: 'draconis';
  app_version: string;
  unit_id?: string; stage_id?: string; skill_id?: string; problem_id?: string;
  correct?: boolean; score?: number; elapsed_ms?: number; attempt_no?: number; stars?: number;
  session_id: string;
  semester_id?: string;
  device_type: 'laptop' | 'phone' | 'unknown';
  policy_tag?: string;
  client_ts: string;           // ISO8601
}

/** 허용된 EventType 집합 */
const VALID_EVENT_TYPES = new Set<string>([
  'session.start', 'session.end',
  'auth.login',
  'lesson.start', 'lesson.answer', 'lesson.complete', 'lesson.fail', 'lesson.abandon',
  'boss.start', 'boss.answer', 'boss.defeat', 'boss.fail',
  'practice.answer', 'practice.set_complete',
  'exam.start', 'exam.answer', 'exam.complete',
  'daily_reward.claim', 'mission.claim', 'dragon.feed',
]);

/** 화이트리스트 기반 검증: 허용 필드만 통과, 타입 불일치 시 null 반환 */
export function sanitizeEvent(raw: Record<string, unknown>): AnalyticsEvent | null {
  // 필수 문자열 필드 검증
  if (typeof raw['event_id'] !== 'string' || !raw['event_id']) return null;
  if (typeof raw['event_type'] !== 'string') return null;
  if (!VALID_EVENT_TYPES.has(raw['event_type'] as string)) return null;
  if (raw['app_id'] !== 'draconis') return null;
  if (typeof raw['app_version'] !== 'string') return null;
  if (typeof raw['session_id'] !== 'string' || !raw['session_id']) return null;
  if (typeof raw['client_ts'] !== 'string') return null;

  // device_type 검증
  const device_type = raw['device_type'];
  if (device_type !== 'laptop' && device_type !== 'phone' && device_type !== 'unknown') return null;

  const event: AnalyticsEvent = {
    event_id: raw['event_id'] as string,
    event_type: raw['event_type'] as EventType,
    app_id: 'draconis',
    app_version: raw['app_version'] as string,
    session_id: raw['session_id'] as string,
    device_type,
    client_ts: raw['client_ts'] as string,
  };

  // 선택 문자열 필드
  if (typeof raw['unit_id'] === 'string') event.unit_id = raw['unit_id'];
  if (typeof raw['stage_id'] === 'string') event.stage_id = raw['stage_id'];
  if (typeof raw['skill_id'] === 'string') event.skill_id = raw['skill_id'];
  if (typeof raw['problem_id'] === 'string') event.problem_id = raw['problem_id'];
  if (typeof raw['semester_id'] === 'string') event.semester_id = raw['semester_id'];
  if (typeof raw['policy_tag'] === 'string') event.policy_tag = raw['policy_tag'];

  // 선택 숫자 필드
  if (typeof raw['score'] === 'number') event.score = raw['score'];
  if (typeof raw['elapsed_ms'] === 'number') event.elapsed_ms = raw['elapsed_ms'];
  if (typeof raw['attempt_no'] === 'number') event.attempt_no = raw['attempt_no'];
  if (typeof raw['stars'] === 'number') event.stars = raw['stars'];

  // 선택 불리언 필드
  if (typeof raw['correct'] === 'boolean') event.correct = raw['correct'];

  return event;
}
