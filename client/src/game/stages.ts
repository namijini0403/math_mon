/** 유닛맵 스테이지 구성 — 레슨 노드와 보스 노드 */

export interface BossInfo {
  name: string;
  emoji: string; // 에셋 이미지 준비 전 플레이스홀더
  hp: number;
  /** assets 폴더의 보스 이미지 (없으면 emoji 사용) */
  image?: string;
  taunt: string;
}

export interface StageDef {
  id: string;
  unitId: string;
  title: string;
  type: 'lesson' | 'boss';
  emoji: string;
  /** 이 스테이지에서 출제되는 스킬 */
  skillIds: string[];
  /** 복습으로 섞이는 이전 스킬 */
  reviewSkillIds: string[];
  problemCount: number;
  boss?: BossInfo;
}

export const STAGES: StageDef[] = [
  // ── 1단원: 자연수의 혼합 계산 ──
  {
    id: 'sm-1', unitId: 'unitMix', title: '계산 골짜기', type: 'lesson', emoji: '🏞️',
    skillIds: ['mix-add-sub', 'mix-mul-div'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sm-2', unitId: 'unitMix', title: '괄호의 정원', type: 'lesson', emoji: '🌿',
    skillIds: ['mix-paren-addsub', 'mix-all-noparen'], reviewSkillIds: ['mix-add-sub'], problemCount: 8,
  },
  {
    id: 'sm-3', unitId: 'unitMix', title: '순서의 신전', type: 'lesson', emoji: '🏛️',
    skillIds: ['mix-paren-all', 'mix-missing'], reviewSkillIds: ['mix-all-noparen'], problemCount: 8,
  },
  {
    id: 'sm-4', unitId: 'unitMix', title: '이야기 오두막', type: 'lesson', emoji: '🛖',
    skillIds: ['mix-word'], reviewSkillIds: ['mix-paren-all'], problemCount: 8,
  },
  {
    id: 'sm-boss', unitId: 'unitMix', title: '계산의 거인', type: 'boss', emoji: '🗿',
    skillIds: ['mix-add-sub', 'mix-mul-div', 'mix-paren-addsub', 'mix-all-noparen', 'mix-paren-all', 'mix-missing', 'mix-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '계산의 거인', emoji: '🗿', hp: 10, image: 'assets/boss/giant.png', taunt: '계산 순서 따위 무시해 버려라!' },
  },
  // ── 2단원: 약수와 배수 ──
  {
    id: 'sd-1', unitId: 'unitDiv', title: '약수 광산', type: 'lesson', emoji: '⛏️',
    skillIds: ['div-divisor-pick', 'div-divisor-count'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sd-2', unitId: 'unitDiv', title: '배수 폭포', type: 'lesson', emoji: '💧',
    skillIds: ['div-multiple-pick', 'div-nth-multiple'], reviewSkillIds: ['div-divisor-pick'], problemCount: 8,
  },
  {
    id: 'sd-3', unitId: 'unitDiv', title: '공약수 요새', type: 'lesson', emoji: '🏰',
    skillIds: ['div-gcd', 'div-lcm'], reviewSkillIds: ['div-divisor-count'], problemCount: 8,
  },
  {
    id: 'sd-4', unitId: 'unitDiv', title: '수수께끼 시장', type: 'lesson', emoji: '🎪',
    skillIds: ['div-gcd-word', 'div-lcm-word'], reviewSkillIds: ['div-gcd', 'div-lcm'], problemCount: 8,
  },
  {
    id: 'sd-boss', unitId: 'unitDiv', title: '약수 골렘', type: 'boss', emoji: '🤖',
    skillIds: ['div-divisor-pick', 'div-multiple-pick', 'div-nth-multiple', 'div-divisor-count', 'div-gcd', 'div-lcm', 'div-gcd-word', 'div-lcm-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '약수 골렘', emoji: '🤖', hp: 10, image: 'assets/boss/golem.png', taunt: '내 몸은 소수로 만들어져 나눌 수 없다!' },
  },
  // ── 3단원: 규칙과 대응 ──
  {
    id: 'sp-1', unitId: 'unitPattern', title: '규칙의 오솔길', type: 'lesson', emoji: '🍂',
    skillIds: ['pat-table-fill', 'pat-rule-pick'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sp-2', unitId: 'unitPattern', title: '대응의 다리', type: 'lesson', emoji: '🌉',
    skillIds: ['pat-apply', 'pat-inverse'], reviewSkillIds: ['pat-rule-pick'], problemCount: 8,
  },
  {
    id: 'sp-3', unitId: 'unitPattern', title: '이야기 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['pat-word'], reviewSkillIds: ['pat-apply', 'pat-inverse'], problemCount: 8,
  },
  {
    id: 'sp-boss', unitId: 'unitPattern', title: '규칙 부엉이', type: 'boss', emoji: '🦉',
    skillIds: ['pat-table-fill', 'pat-rule-pick', 'pat-apply', 'pat-inverse', 'pat-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '규칙 부엉이', emoji: '🦉', hp: 10, image: 'assets/boss/owl.png', taunt: '내 규칙은 아무도 알아낼 수 없지!' },
  },
  // ── 4단원: 약분과 통분 ──
  {
    id: 's1-1', unitId: 'unit1', title: '크기가 같은 분수', type: 'lesson', emoji: '🌱',
    skillIds: ['u1-eq-make', 'u1-eq-find'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 's1-2', unitId: 'unit1', title: '약분의 숲', type: 'lesson', emoji: '🌳',
    skillIds: ['u1-simplify', 'u1-irreducible'], reviewSkillIds: ['u1-eq-find'], problemCount: 8,
  },
  {
    id: 's1-3', unitId: 'unit1', title: '통분의 동굴', type: 'lesson', emoji: '⛰️',
    skillIds: ['u1-common-denom', 'u1-eq-match'], reviewSkillIds: ['u1-simplify'], problemCount: 8,
  },
  {
    id: 's1-4', unitId: 'unit1', title: '크기 비교의 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['u1-compare2', 'u1-compare3', 'u1-frac-dec'], reviewSkillIds: ['u1-common-denom'], problemCount: 9,
  },
  {
    id: 's1-boss', unitId: 'unit1', title: '분수 드래곤', type: 'boss', emoji: '🐲',
    skillIds: ['u1-eq-make', 'u1-eq-find', 'u1-simplify', 'u1-irreducible', 'u1-common-denom', 'u1-compare2', 'u1-compare3', 'u1-frac-dec'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '분수 드래곤', emoji: '🐲', hp: 10, image: 'assets/boss/dragon.png', taunt: '내 비늘은 약분할 수 없다!' },
  },
  // ── 5단원: 분수의 덧셈과 뺄셈 ──
  {
    id: 's2-1', unitId: 'unit2', title: '덧셈의 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['u2-add-proper-1', 'u2-add-proper-2'], reviewSkillIds: ['u1-common-denom'], problemCount: 8,
  },
  {
    id: 's2-2', unitId: 'unit2', title: '뺄셈의 강', type: 'lesson', emoji: '🌊',
    skillIds: ['u2-sub-proper'], reviewSkillIds: ['u2-add-proper-1'], problemCount: 8,
  },
  {
    id: 's2-3', unitId: 'unit2', title: '대분수 화산', type: 'lesson', emoji: '🌋',
    skillIds: ['u2-add-mixed', 'u2-sub-mixed'], reviewSkillIds: ['u2-sub-proper'], problemCount: 8,
  },
  {
    id: 's2-4', unitId: 'unit2', title: '받아내림 빙하', type: 'lesson', emoji: '🧊',
    skillIds: ['u2-sub-mixed-borrow'], reviewSkillIds: ['u2-add-mixed', 'u2-sub-mixed'], problemCount: 8,
  },
  {
    id: 's2-5', unitId: 'unit2', title: '이야기 미궁', type: 'lesson', emoji: '📜',
    skillIds: ['u2-word', 'u2-missing'], reviewSkillIds: ['u2-sub-mixed-borrow'], problemCount: 8,
  },
  {
    id: 's2-boss', unitId: 'unit2', title: '통분 마왕', type: 'boss', emoji: '👹',
    skillIds: ['u2-add-proper-1', 'u2-add-proper-2', 'u2-sub-proper', 'u2-add-mixed', 'u2-sub-mixed', 'u2-sub-mixed-borrow', 'u2-word', 'u2-missing'],
    reviewSkillIds: [], problemCount: 12,
    boss: { name: '통분 마왕', emoji: '👹', hp: 12, image: 'assets/boss/demon.png', taunt: '너는 분모를 맞출 수 없을 것이다!' },
  },
  // ── 6단원: 다각형의 둘레와 넓이 ──
  {
    id: 'sg-1', unitId: 'unitPoly', title: '둘레 평원', type: 'lesson', emoji: '🌾',
    skillIds: ['poly-peri-regular', 'poly-peri-rect'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sg-2', unitId: 'unitPoly', title: '넓이 호수', type: 'lesson', emoji: '🏞️',
    skillIds: ['poly-area-rect', 'poly-missing-side'], reviewSkillIds: ['poly-peri-rect'], problemCount: 8,
  },
  {
    id: 'sg-3', unitId: 'unitPoly', title: '도형의 숲', type: 'lesson', emoji: '🌲',
    skillIds: ['poly-area-para', 'poly-area-tri'], reviewSkillIds: ['poly-area-rect'], problemCount: 8,
  },
  {
    id: 'sg-4', unitId: 'unitPoly', title: '신비한 유적', type: 'lesson', emoji: '🗿',
    skillIds: ['poly-area-trap', 'poly-word'], reviewSkillIds: ['poly-area-tri'], problemCount: 8,
  },
  {
    id: 'sg-boss', unitId: 'unitPoly', title: '거미여왕', type: 'boss', emoji: '🕷️',
    skillIds: ['poly-peri-regular', 'poly-peri-rect', 'poly-area-rect', 'poly-missing-side', 'poly-area-para', 'poly-area-tri', 'poly-area-trap', 'poly-word'],
    reviewSkillIds: [], problemCount: 12,
    boss: { name: '거미여왕', emoji: '🕷️', hp: 12, image: 'assets/boss/spider.png', taunt: '내 거미줄의 넓이를 잴 수 있을까?' },
  },
];

/** 유닛맵 표시 순서 (교육과정 순서) */
export const UNIT_ORDER = ['unitMix', 'unitDiv', 'unitPattern', 'unit1', 'unit2', 'unitPoly'] as const;

export const UNIT_TITLES: Record<string, string> = {
  unitMix: '1. 자연수의 혼합 계산',
  unitDiv: '2. 약수와 배수',
  unitPattern: '3. 규칙과 대응',
  unit1: '4. 약분과 통분',
  unit2: '5. 분수의 덧셈과 뺄셈',
  unitPoly: '6. 다각형의 둘레와 넓이',
};

export function getStage(id: string): StageDef {
  const s = STAGES.find((s) => s.id === id);
  if (!s) throw new Error(`unknown stage: ${id}`);
  return s;
}

/** 스테이지 순서 (잠금 해제 판단용) */
export function stageIndex(id: string): number {
  return STAGES.findIndex((s) => s.id === id);
}
