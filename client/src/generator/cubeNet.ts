/**
 * 정육면체 전개도 판정 — "주사위 굴리기" 시뮬레이션.
 *
 * 전개도의 한 칸에 주사위 바닥면을 대고, 이웃 칸으로 이동할 때마다 주사위를 그 방향으로
 * 굴린다. 6칸이 각각 서로 다른 면(바닥)에 대응되면 그 전개도는 정육면체로 접힌다.
 * → 정답을 사람이 손으로 검증하지 않고 코드가 보장한다.
 *
 * 좌표계: cell = [col, row]. row는 아래로 갈수록 증가(SVG와 동일).
 */

export type Cell = [number, number];

interface Orient {
  U: number; D: number; N: number; S: number; E: number; W: number;
}

// 굴리기: 면 위치 재배치 (E=col+, S=row+)
const rollEast = (o: Orient): Orient => ({ U: o.W, D: o.E, E: o.U, W: o.D, N: o.N, S: o.S });
const rollWest = (o: Orient): Orient => ({ U: o.E, D: o.W, W: o.U, E: o.D, N: o.N, S: o.S });
const rollNorth = (o: Orient): Orient => ({ U: o.S, D: o.N, N: o.U, S: o.D, E: o.E, W: o.W });
const rollSouth = (o: Orient): Orient => ({ U: o.N, D: o.S, S: o.U, N: o.D, E: o.E, W: o.W });

const key = (c: number, r: number) => `${c},${r}`;

/** 6칸 연결 폴리오미노가 정육면체로 접히는지 판정 */
export function isValidCubeNet(cells: Cell[]): boolean {
  if (cells.length !== 6) return false;
  const set = new Map<string, Cell>();
  for (const [c, r] of cells) set.set(key(c, r), [c, r]);
  if (set.size !== 6) return false; // 중복 칸

  const start: Orient = { U: 0, D: 1, N: 2, S: 3, E: 4, W: 5 };
  const downOf = new Map<string, number>();
  const visited = new Set<string>();
  const [c0, r0] = cells[0];
  const queue: { c: number; r: number; o: Orient }[] = [{ c: c0, r: r0, o: start }];
  visited.add(key(c0, r0));
  downOf.set(key(c0, r0), start.D);

  while (queue.length) {
    const { c, r, o } = queue.shift()!;
    const steps: [number, number, Orient][] = [
      [c + 1, r, rollEast(o)],
      [c - 1, r, rollWest(o)],
      [c, r - 1, rollNorth(o)],
      [c, r + 1, rollSouth(o)],
    ];
    for (const [nc, nr, no] of steps) {
      const k = key(nc, nr);
      if (!set.has(k) || visited.has(k)) continue;
      visited.add(k);
      downOf.set(k, no.D);
      queue.push({ c: nc, r: nr, o: no });
    }
  }

  if (visited.size !== 6) return false; // 연결되지 않음
  const faces = new Set(downOf.values());
  return faces.size === 6; // 6면 모두 서로 다름
}

/** 칸 좌표를 (0,0) 기준으로 정규화 */
export function normalizeCells(cells: Cell[]): Cell[] {
  const minC = Math.min(...cells.map((c) => c[0]));
  const minR = Math.min(...cells.map((c) => c[1]));
  return cells.map(([c, r]) => [c - minC, r - minR] as Cell);
}

const ser = (cells: Cell[]) =>
  normalizeCells(cells)
    .map(([c, r]) => `${c},${r}`)
    .sort()
    .join('|');

// ── 후보 풀 ──────────────────────────────────────────────────────────────────
// 1-4-1 계열: 가운데 가로 4칸 + 위 1칸(col a) + 아래 1칸(col b). a,b ∈ 0..3 (전부 정답).
const oneFourOne: Cell[][] = [];
for (let a = 0; a < 4; a++) {
  for (let b = 0; b < 4; b++) {
    oneFourOne.push(normalizeCells([[0, 1], [1, 1], [2, 1], [3, 1], [a, 0], [b, 2]]));
  }
}

// 손으로 넣는 후보(정답·오답 섞임) — 판정은 isValidCubeNet이 한다.
const handShapes: Cell[][] = [
  // 2-3-1 계열 (정답 후보)
  [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], // 계단 2-2-2
  [[0, 1], [1, 1], [2, 1], [1, 0], [1, 2], [3, 1]], // T+꼬리 (오답 가능)
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]], // 3-3 오프셋
  // 오답 후보
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], // 2×3 직사각형 (오답)
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [0, 1]], // 1-5 (오답)
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], // 1-6 한 줄 (오답)
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]], // 2×2 + 꼬리2 (오답 가능)
  [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1]], // 위2 아래4 (오답)
  [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1]], // 위 양끝 + 아래4 (오답)
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2]], // ㄴ자 변형 (오답 가능)
];

const allCandidates = [...oneFourOne, ...handShapes];
// 중복 제거
const uniqueCandidates: Cell[][] = [];
const seen = new Set<string>();
for (const s of allCandidates) {
  const k = ser(s);
  if (!seen.has(k)) {
    seen.add(k);
    uniqueCandidates.push(normalizeCells(s));
  }
}

export const VALID_CUBE_NETS: Cell[][] = uniqueCandidates.filter(isValidCubeNet);
export const INVALID_CUBE_NETS: Cell[][] = uniqueCandidates.filter((s) => !isValidCubeNet(s));

interface MiniRng {
  int(min: number, max: number): number;
  shuffle<T>(arr: readonly T[]): T[];
}

/**
 * 보기 4개(정답 전개도 1 + 오답 3)를 골라 섞어 반환.
 * answerIndex = 정답(접히는 전개도)의 위치.
 */
export function pickCubeNetChoices(rng: MiniRng): { nets: Cell[][]; answerIndex: number } {
  const valid = VALID_CUBE_NETS[rng.int(0, VALID_CUBE_NETS.length - 1)];
  const invalids = rng.shuffle(INVALID_CUBE_NETS).slice(0, 3);
  const combined = rng.shuffle([valid, ...invalids]);
  return { nets: combined, answerIndex: combined.indexOf(valid) };
}
