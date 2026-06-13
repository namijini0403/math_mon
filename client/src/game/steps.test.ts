import { describe, it, expect } from 'vitest';
import {
  STEP_GOAL,
  MORNING_EVENT_ENABLED,
  emptySteps,
  rolloverSteps,
  addSteps,
  isWithinMorningWindow,
  isMorningEventActive,
} from './steps';

describe('steps — 누적·롤오버', () => {
  it('빈 상태에서 걸음을 더하면 today가 증가한다', () => {
    const r = addSteps(emptySteps(), 500, '2026-06-13');
    expect(r.state.today).toBe(500);
    expect(r.goalReached).toBe(false);
  });

  it('음수·0은 무시한다', () => {
    const base = addSteps(emptySteps(), 100, '2026-06-13').state;
    expect(addSteps(base, 0, '2026-06-13').state.today).toBe(100);
    expect(addSteps(base, -50, '2026-06-13').state.today).toBe(100);
  });

  it('날짜가 바뀌면 today가 0으로 리셋된다 (goalDays는 유지)', () => {
    let s = addSteps(emptySteps(), STEP_GOAL, '2026-06-13').state;
    expect(s.today).toBe(STEP_GOAL);
    s = rolloverSteps(s, '2026-06-14');
    expect(s.today).toBe(0);
    expect(s.goalDays).toBe(1);
  });
});

describe('steps — 목표 달성(2000보)', () => {
  it('처음 2000을 넘는 순간 goalReached=true, goalDays+1', () => {
    const r1 = addSteps(emptySteps(), 1900, '2026-06-13');
    expect(r1.goalReached).toBe(false);
    const r2 = addSteps(r1.state, 200, '2026-06-13'); // 2100
    expect(r2.goalReached).toBe(true);
    expect(r2.state.goalDays).toBe(1);
    expect(r2.state.lastGoalDate).toBe('2026-06-13');
  });

  it('같은 날 2000을 더 넘어도 보상은 1회만', () => {
    const reached = addSteps(emptySteps(), 2000, '2026-06-13');
    expect(reached.goalReached).toBe(true);
    const more = addSteps(reached.state, 1000, '2026-06-13');
    expect(more.goalReached).toBe(false);
    expect(more.state.goalDays).toBe(1);
  });

  it('다음 날 다시 2000을 넘으면 goalDays=2', () => {
    const day1 = addSteps(emptySteps(), 2000, '2026-06-13').state;
    const day2 = addSteps(day1, 2000, '2026-06-14');
    expect(day2.goalReached).toBe(true);
    expect(day2.state.goalDays).toBe(2);
  });
});

describe('steps — 아침 시간창 08:20~08:50', () => {
  const at = (h: number, m: number) => new Date(2026, 5, 13, h, m, 0);

  it('경계: 08:19 밖, 08:20 안, 08:49 안, 08:50 밖', () => {
    expect(isWithinMorningWindow(at(8, 19))).toBe(false);
    expect(isWithinMorningWindow(at(8, 20))).toBe(true);
    expect(isWithinMorningWindow(at(8, 49))).toBe(true);
    expect(isWithinMorningWindow(at(8, 50))).toBe(false);
  });

  it('이벤트 스위치는 현재 비활성 — 시간창 안이어도 발동하지 않는다', () => {
    expect(MORNING_EVENT_ENABLED).toBe(false);
    expect(isMorningEventActive(at(8, 30))).toBe(false);
  });
});
