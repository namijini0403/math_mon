import { describe, expect, it } from 'vitest';
import {
  clearWrong,
  pushWrong,
  unitsWithWrong,
  wrongCountFor,
  MAX_PER_UNIT,
  type WrongLog,
} from './wrongLog';
import { generateProblem } from '../generator';

describe('wrongLog reducer', () => {
  it('오답을 단원별로 쌓고 최신순으로 맨 앞에 둔다', () => {
    let log: WrongLog = {};
    log = pushWrong(log, 'unitDiv', 'sk-a', 1, 100);
    log = pushWrong(log, 'unitDiv', 'sk-b', 2, 200);
    expect(log.unitDiv.map((e) => e.skillId)).toEqual(['sk-b', 'sk-a']);
    expect(wrongCountFor(log, 'unitDiv')).toBe(2);
  });

  it('같은 (skillId,seed) 재오답은 중복 없이 ts만 갱신하고 맨 앞으로', () => {
    let log: WrongLog = {};
    log = pushWrong(log, 'u', 'sk-a', 1, 100);
    log = pushWrong(log, 'u', 'sk-b', 2, 200);
    log = pushWrong(log, 'u', 'sk-a', 1, 300); // 같은 문제 또 틀림
    expect(log.u).toHaveLength(2);
    expect(log.u[0]).toEqual({ skillId: 'sk-a', seed: 1, ts: 300 });
  });

  it('같은 skill이라도 seed가 다르면 별개 항목', () => {
    let log: WrongLog = {};
    log = pushWrong(log, 'u', 'sk-a', 1, 100);
    log = pushWrong(log, 'u', 'sk-a', 2, 200);
    expect(log.u).toHaveLength(2);
  });

  it('clearWrong은 정확히 그 (skillId,seed)만 제거한다 (별 점등)', () => {
    let log: WrongLog = {};
    log = pushWrong(log, 'u', 'sk-a', 1, 100);
    log = pushWrong(log, 'u', 'sk-a', 2, 200);
    log = clearWrong(log, 'u', 'sk-a', 1);
    expect(log.u).toHaveLength(1);
    expect(log.u[0].seed).toBe(2);
  });

  it('단원의 마지막 항목을 제거하면 단원 키 자체가 사라진다', () => {
    let log: WrongLog = {};
    log = pushWrong(log, 'u', 'sk-a', 1, 100);
    log = clearWrong(log, 'u', 'sk-a', 1);
    expect(log.u).toBeUndefined();
    expect(wrongCountFor(log, 'u')).toBe(0);
  });

  it('일치 항목이 없으면 같은 참조를 그대로 반환(불필요 렌더 방지)', () => {
    let log: WrongLog = {};
    log = pushWrong(log, 'u', 'sk-a', 1, 100);
    const same = clearWrong(log, 'u', 'sk-z', 9);
    expect(same).toBe(log);
  });

  it('단원당 상한을 넘으면 가장 오래된 항목이 밀려난다', () => {
    let log: WrongLog = {};
    for (let i = 0; i < MAX_PER_UNIT + 5; i++) {
      log = pushWrong(log, 'u', `sk-${i}`, i, i);
    }
    expect(log.u).toHaveLength(MAX_PER_UNIT);
    // 가장 최근(seed 큰 것)이 앞, 오래된 seed 0~4는 제거됨
    expect(log.u[0].seed).toBe(MAX_PER_UNIT + 4);
    expect(log.u.some((e) => e.seed === 0)).toBe(false);
  });

  it('unitsWithWrong은 개수 많은 단원부터 정렬', () => {
    let log: WrongLog = {};
    log = pushWrong(log, 'a', 's1', 1, 1);
    log = pushWrong(log, 'b', 's1', 1, 1);
    log = pushWrong(log, 'b', 's2', 2, 2);
    expect(unitsWithWrong(log).map((u) => u.unitId)).toEqual(['b', 'a']);
  });
});

describe('회랑 재현성 — 저장한 (skillId,seed)로 같은 문제가 그대로 복원된다', () => {
  it('같은 seed면 prompt·정답·보기까지 동일', () => {
    const sample = generateProblem('div-gcd', 12345);
    const again = generateProblem('div-gcd', 12345);
    expect(again).toEqual(sample);
    expect(again.seed).toBe(12345);
  });

  it('seed가 다르면 (대개) 다른 문제 — 시드가 실제로 반영됨', () => {
    const a = generateProblem('div-lcm', 1);
    const b = generateProblem('div-lcm', 99999);
    // 재현성의 핵심은 seed→문제 매핑이 결정적이라는 것. 두 시드의 id는 달라야 한다.
    expect(a.id).not.toBe(b.id);
  });
});
