import { describe, expect, it } from 'vitest';
import {
  isValidCubeNet,
  VALID_CUBE_NETS,
  INVALID_CUBE_NETS,
  pickCubeNetChoices,
  type Cell,
} from './cubeNet';
import { RNG } from './rng';

describe('isValidCubeNet (주사위 굴리기 판정)', () => {
  it('대표적인 정답 전개도(십자/계단/1-4-1)를 정답으로 판정', () => {
    const crossPlus: Cell[] = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]];
    const tCross: Cell[] = [[1, 0], [1, 1], [0, 1], [2, 1], [1, 2], [1, 3]]; // 1-4-1 세로
    const stairs: Cell[] = [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]];
    expect(isValidCubeNet(crossPlus)).toBe(true);
    expect(isValidCubeNet(tCross)).toBe(true);
    expect(isValidCubeNet(stairs)).toBe(true);
  });

  it('대표적인 오답(직사각형/한 줄/면 부족)을 오답으로 판정', () => {
    const rect2x3: Cell[] = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]];
    const row6: Cell[] = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]];
    const oneFive: Cell[] = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [0, 1]];
    expect(isValidCubeNet(rect2x3)).toBe(false);
    expect(isValidCubeNet(row6)).toBe(false);
    expect(isValidCubeNet(oneFive)).toBe(false);
  });

  it('칸 수가 6이 아니거나 끊어진 모양은 오답', () => {
    expect(isValidCubeNet([[0, 0], [1, 0]])).toBe(false); // 2칸
    expect(isValidCubeNet([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [10, 10]])).toBe(false); // 끊김
  });

  it('1-4-1 계열 16가지는 모두 정답이어야 한다', () => {
    let count = 0;
    for (let a = 0; a < 4; a++) {
      for (let b = 0; b < 4; b++) {
        const net: Cell[] = [[0, 1], [1, 1], [2, 1], [3, 1], [a, 0], [b, 2]];
        expect(isValidCubeNet(net)).toBe(true);
        count++;
      }
    }
    expect(count).toBe(16);
  });
});

describe('후보 풀 + 보기 선택', () => {
  it('정답 풀·오답 풀 모두 충분히 있다', () => {
    expect(VALID_CUBE_NETS.length).toBeGreaterThanOrEqual(16);
    expect(INVALID_CUBE_NETS.length).toBeGreaterThanOrEqual(3);
    // 풀 자체의 무결성: 분류가 실제 판정과 일치
    for (const n of VALID_CUBE_NETS) expect(isValidCubeNet(n)).toBe(true);
    for (const n of INVALID_CUBE_NETS) expect(isValidCubeNet(n)).toBe(false);
  });

  it('pickCubeNetChoices: 보기 4개, 정답 정확히 1개, answerIndex 정확', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = new RNG(seed);
      const { nets, answerIndex } = pickCubeNetChoices(rng);
      expect(nets).toHaveLength(4);
      const validFlags = nets.map(isValidCubeNet);
      expect(validFlags.filter(Boolean)).toHaveLength(1);
      expect(validFlags[answerIndex]).toBe(true);
    }
  });
});
