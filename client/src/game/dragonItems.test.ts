import { describe, it, expect } from 'vitest';
import { GACHA_ITEMS, FIXED_ITEMS, rollGachaItems } from './dragon';

/** 0,0,0... 처럼 정해진 난수열을 주입 */
function seqRand(seq: number[]): () => number {
  let i = 0;
  return () => seq[i++ % seq.length];
}

describe('아이템 고정/가챠 분류', () => {
  it('고정 5종(성장 서사), 가챠 8종(수집형)', () => {
    expect(FIXED_ITEMS.map((i) => i.id).sort()).toEqual(
      ['crown-seed', 'first-meal', 'incubator', 'rainbow-ribbon', 'warm-lamp'].sort(),
    );
    expect(GACHA_ITEMS.length).toBe(8);
    expect(FIXED_ITEMS.length + GACHA_ITEMS.length).toBe(13);
  });
});

describe('rollGachaItems — 랜덤 뽑기', () => {
  it('티켓 0이면 아무것도 안 뽑는다', () => {
    expect(rollGachaItems(0, [], Math.random)).toEqual([]);
  });

  it('티켓 2·보유 0 → 서로 다른 가챠 2종', () => {
    const got = rollGachaItems(2, [], seqRand([0, 0, 0]));
    expect(got).toHaveLength(2);
    expect(new Set(got).size).toBe(2);
    got.forEach((id) => expect(GACHA_ITEMS.map((i) => i.id)).toContain(id));
  });

  it('티켓 3·이미 가챠 2개 보유 → 1개만 추가', () => {
    const owned = GACHA_ITEMS.slice(0, 2).map((i) => i.id);
    const got = rollGachaItems(3, owned, seqRand([0]));
    expect(got).toHaveLength(1);
    expect(owned).not.toContain(got[0]);
  });

  it('티켓이 풀보다 많아도 풀 크기까지만', () => {
    const got = rollGachaItems(99, [], seqRand([0.1, 0.5, 0.9, 0.3]));
    expect(got).toHaveLength(GACHA_ITEMS.length);
    expect(new Set(got).size).toBe(GACHA_ITEMS.length);
  });

  it('보유 수가 티켓 이상이면 추가 없음', () => {
    const owned = GACHA_ITEMS.slice(0, 3).map((i) => i.id);
    expect(rollGachaItems(2, owned, Math.random)).toEqual([]);
  });
});
