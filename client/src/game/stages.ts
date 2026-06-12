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

  // ════════ 2학기 ════════
  // ── 2-1단원: 수의 범위와 어림하기 ──
  {
    id: 'sr-1', unitId: 'unitRange', title: '경계의 들판', type: 'lesson', emoji: '🚧',
    skillIds: ['range-include', 'range-boundary'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sr-2', unitId: 'unitRange', title: '어림 안개숲', type: 'lesson', emoji: '🌫️',
    skillIds: ['round-up', 'round-down', 'round-half'], reviewSkillIds: ['range-boundary'], problemCount: 9,
  },
  {
    id: 'sr-3', unitId: 'unitRange', title: '이야기 늪', type: 'lesson', emoji: '🐸',
    skillIds: ['range-word', 'round-word', 'round-pick'], reviewSkillIds: ['round-half'], problemCount: 8,
  },
  {
    id: 'sr-boss', unitId: 'unitRange', title: '안개 마녀', type: 'boss', emoji: '🧙',
    skillIds: ['range-include', 'range-boundary', 'range-word', 'round-up', 'round-down', 'round-half', 'round-word', 'round-pick'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '안개 마녀', emoji: '🧙', hp: 10, image: 'assets/boss/witch.png', taunt: '내 안개 속에선 어림도 못 할걸!' },
  },
  // ── 2-2단원: 분수의 곱셈 ──
  {
    id: 'sf-1', unitId: 'unitFracMul', title: '곱셈 과수원', type: 'lesson', emoji: '🍎',
    skillIds: ['fmul-nat', 'fmul-nat2'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sf-2', unitId: 'unitFracMul', title: '분수 제빵소', type: 'lesson', emoji: '🥐',
    skillIds: ['fmul-proper'], reviewSkillIds: ['fmul-nat'], problemCount: 8,
  },
  {
    id: 'sf-3', unitId: 'unitFracMul', title: '대분수 산맥', type: 'lesson', emoji: '⛰️',
    skillIds: ['fmul-mixed', 'fmul-word'], reviewSkillIds: ['fmul-proper'], problemCount: 8,
  },
  {
    id: 'sf-boss', unitId: 'unitFracMul', title: '케이크 타이탄', type: 'boss', emoji: '🍰',
    skillIds: ['fmul-nat', 'fmul-nat2', 'fmul-proper', 'fmul-mixed', 'fmul-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '케이크 타이탄', emoji: '🍰', hp: 10, image: 'assets/boss/titan.png', taunt: '내 케이크 조각은 아무도 못 나눈다!' },
  },
  // ── 2-3단원: 합동과 대칭 ──
  {
    id: 'sy-1', unitId: 'unitSym', title: '합동 거울방', type: 'lesson', emoji: '🪞',
    skillIds: ['sym-corr-side', 'sym-corr-angle'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sy-2', unitId: 'unitSym', title: '대칭 회랑', type: 'lesson', emoji: '🏯',
    skillIds: ['sym-axis-count', 'sym-line-dist'], reviewSkillIds: ['sym-corr-side'], problemCount: 8,
  },
  {
    id: 'sy-3', unitId: 'unitSym', title: '수수께끼 미궁', type: 'lesson', emoji: '🌀',
    skillIds: ['sym-peri', 'sym-word'], reviewSkillIds: ['sym-line-dist'], problemCount: 8,
  },
  {
    id: 'sy-boss', unitId: 'unitSym', title: '거울 유령', type: 'boss', emoji: '👻',
    skillIds: ['sym-corr-side', 'sym-corr-angle', 'sym-peri', 'sym-axis-count', 'sym-line-dist', 'sym-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '거울 유령', emoji: '👻', hp: 10, image: 'assets/boss/ghost.png', taunt: '어느 쪽이 진짜 나일까~?' },
  },
  // ── 2-4단원: 소수의 곱셈 ──
  {
    id: 'sdm-1', unitId: 'unitDecMul', title: '소수점 도장', type: 'lesson', emoji: '⚒️',
    skillIds: ['dmul-nat', 'dmul-nat2'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sdm-2', unitId: 'unitDecMul', title: '그림자 시장', type: 'lesson', emoji: '🏮',
    skillIds: ['dmul-dec', 'dmul-point'], reviewSkillIds: ['dmul-nat'], problemCount: 8,
  },
  {
    id: 'sdm-3', unitId: 'unitDecMul', title: '닌자의 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['dmul-dec2', 'dmul-word'], reviewSkillIds: ['dmul-dec'], problemCount: 8,
  },
  {
    id: 'sdm-boss', unitId: 'unitDecMul', title: '소수점 닌자', type: 'boss', emoji: '🥷',
    skillIds: ['dmul-nat', 'dmul-nat2', 'dmul-dec', 'dmul-dec2', 'dmul-point', 'dmul-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '소수점 닌자', emoji: '🥷', hp: 10, image: 'assets/boss/ninja.png', taunt: '소수점은 내가 훔쳐 간다!' },
  },
  // ── 2-5단원: 직육면체 ──
  {
    id: 'scb-1', unitId: 'unitCuboid', title: '큐브 광장', type: 'lesson', emoji: '🧊',
    skillIds: ['cub-count', 'cub-face-pair'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'scb-2', unitId: 'unitCuboid', title: '모서리 협곡', type: 'lesson', emoji: '🏔️',
    skillIds: ['cub-edge-sum', 'cub-cube-edge'], reviewSkillIds: ['cub-count'], problemCount: 8,
  },
  {
    id: 'scb-3', unitId: 'unitCuboid', title: '제왕의 금고', type: 'lesson', emoji: '🗝️',
    skillIds: ['cub-edge-missing', 'cub-word'], reviewSkillIds: ['cub-edge-sum'], problemCount: 8,
  },
  {
    id: 'scb-boss', unitId: 'unitCuboid', title: '큐브 제왕', type: 'boss', emoji: '🎲',
    skillIds: ['cub-count', 'cub-face-pair', 'cub-edge-sum', 'cub-cube-edge', 'cub-edge-missing', 'cub-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '큐브 제왕', emoji: '🎲', hp: 10, image: 'assets/boss/cube.png', taunt: '내 성의 모서리를 다 셀 수 있겠나!' },
  },
  // ── 2-6단원: 평균과 가능성 ──
  {
    id: 'sa-1', unitId: 'unitAvg', title: '평균 평원', type: 'lesson', emoji: '⚖️',
    skillIds: ['avg-calc', 'avg-sum'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sa-2', unitId: 'unitAvg', title: '가능성 천문대', type: 'lesson', emoji: '🔭',
    skillIds: ['chance-word', 'chance-num'], reviewSkillIds: ['avg-calc'], problemCount: 8,
  },
  {
    id: 'sa-3', unitId: 'unitAvg', title: '운명의 제단', type: 'lesson', emoji: '🕯️',
    skillIds: ['avg-missing', 'avg-compare', 'avg-word'], reviewSkillIds: ['avg-sum'], problemCount: 9,
  },
  {
    id: 'sa-boss', unitId: 'unitAvg', title: '운명의 점술사', type: 'boss', emoji: '🔮',
    skillIds: ['avg-calc', 'avg-sum', 'avg-missing', 'avg-compare', 'chance-word', 'chance-num', 'avg-word'],
    reviewSkillIds: [], problemCount: 12,
    boss: { name: '운명의 점술사', emoji: '🔮', hp: 12, image: 'assets/boss/oracle.png', taunt: '네가 이길 가능성은... 0이다!' },
  },

  // ════════ 6학년 1학기 ════════
  // ── 6-1-1: 분수의 나눗셈 ──
  { id: 'fd1-1', unitId: 'unitFracDiv1', title: '나눗셈 항구', type: 'lesson', emoji: '⚓', skillIds: ['fdiv1-nat-nat', 'fdiv1-frac-nat'], reviewSkillIds: [], problemCount: 8 },
  { id: 'fd1-2', unitId: 'unitFracDiv1', title: '분모의 바다', type: 'lesson', emoji: '🌊', skillIds: ['fdiv1-frac-nat2'], reviewSkillIds: ['fdiv1-frac-nat'], problemCount: 8 },
  { id: 'fd1-3', unitId: 'unitFracDiv1', title: '대분수 등대', type: 'lesson', emoji: '🗼', skillIds: ['fdiv1-mixed-nat', 'fdiv1-word'], reviewSkillIds: ['fdiv1-frac-nat2'], problemCount: 8 },
  {
    id: 'fd1-boss', unitId: 'unitFracDiv1', title: '문어 선장', type: 'boss', emoji: '🐙',
    skillIds: ['fdiv1-nat-nat', 'fdiv1-frac-nat', 'fdiv1-frac-nat2', 'fdiv1-mixed-nat', 'fdiv1-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '문어 선장', emoji: '🐙', hp: 10, image: 'assets/boss/octopus.png', taunt: '내 보물은 똑같이 나눌 수 없다!' },
  },
  // ── 6-1-2: 각기둥과 각뿔 ──
  { id: 'pr-1', unitId: 'unitPrism', title: '수정 기둥 광장', type: 'lesson', emoji: '🔷', skillIds: ['prism-count', 'pyramid-count'], reviewSkillIds: [], problemCount: 8 },
  { id: 'pr-2', unitId: 'unitPrism', title: '거꾸로 동굴', type: 'lesson', emoji: '🕳️', skillIds: ['prism-inverse', 'pyramid-inverse'], reviewSkillIds: ['prism-count'], problemCount: 8 },
  { id: 'pr-3', unitId: 'unitPrism', title: '지혜의 전망대', type: 'lesson', emoji: '🔭', skillIds: ['prism-pick', 'prism-word'], reviewSkillIds: ['pyramid-inverse'], problemCount: 8 },
  {
    id: 'pr-boss', unitId: 'unitPrism', title: '수정 정령', type: 'boss', emoji: '💎',
    skillIds: ['prism-count', 'pyramid-count', 'prism-inverse', 'pyramid-inverse', 'prism-pick', 'prism-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '수정 정령', emoji: '💎', hp: 10, image: 'assets/boss/crystal.png', taunt: '내 모서리를 전부 셀 수 있을까?' },
  },
  // ── 6-1-3: 소수의 나눗셈 ──
  { id: 'dd1-1', unitId: 'unitDecDiv1', title: '유랑단 천막', type: 'lesson', emoji: '🎪', skillIds: ['ddiv1-basic', 'ddiv1-natnat'], reviewSkillIds: [], problemCount: 8 },
  { id: 'dd1-2', unitId: 'unitDecDiv1', title: '곡예의 줄', type: 'lesson', emoji: '🎭', skillIds: ['ddiv1-carry', 'ddiv1-zero'], reviewSkillIds: ['ddiv1-basic'], problemCount: 8 },
  { id: 'dd1-3', unitId: 'unitDecDiv1', title: '마술 상자', type: 'lesson', emoji: '🎁', skillIds: ['ddiv1-point', 'ddiv1-word'], reviewSkillIds: ['ddiv1-carry'], problemCount: 8 },
  {
    id: 'dd1-boss', unitId: 'unitDecDiv1', title: '유랑단장', type: 'boss', emoji: '🎩',
    skillIds: ['ddiv1-basic', 'ddiv1-carry', 'ddiv1-zero', 'ddiv1-natnat', 'ddiv1-point', 'ddiv1-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '소수점 유랑단장', emoji: '🎩', hp: 10, image: 'assets/boss/ringmaster.png', taunt: '소수점이 어디로 갔는지 맞혀 보시지!' },
  },
  // ── 6-1-4: 비와 비율 ──
  { id: 'rt-1', unitId: 'unitRatio', title: '여우 시장', type: 'lesson', emoji: '🏪', skillIds: ['ratio-express', 'ratio-value'], reviewSkillIds: [], problemCount: 8 },
  { id: 'rt-2', unitId: 'unitRatio', title: '백분율 골목', type: 'lesson', emoji: '💯', skillIds: ['ratio-percent', 'percent-of', 'percent-apply'], reviewSkillIds: ['ratio-value'], problemCount: 9 },
  { id: 'rt-3', unitId: 'unitRatio', title: '흥정의 광장', type: 'lesson', emoji: '⚖️', skillIds: ['ratio-compare', 'ratio-word'], reviewSkillIds: ['percent-apply'], problemCount: 8 },
  {
    id: 'rt-boss', unitId: 'unitRatio', title: '여우 상인', type: 'boss', emoji: '🦊',
    skillIds: ['ratio-express', 'ratio-value', 'ratio-percent', 'percent-of', 'percent-apply', 'ratio-compare', 'ratio-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '비율 여우 상인', emoji: '🦊', hp: 10, image: 'assets/boss/foxmerchant.png', taunt: '이 거래, 너에게 유리할 비율은 없어!' },
  },
  // ── 6-1-5: 여러 가지 그래프 ──
  { id: 'gr-1', unitId: 'unitGraph', title: '띠그래프 들판', type: 'lesson', emoji: '📊', skillIds: ['graph-read', 'graph-most'], reviewSkillIds: [], problemCount: 8 },
  { id: 'gr-2', unitId: 'unitGraph', title: '원그래프 호수', type: 'lesson', emoji: '🥧', skillIds: ['graph-percent', 'graph-missing'], reviewSkillIds: ['graph-read'], problemCount: 8 },
  { id: 'gr-3', unitId: 'unitGraph', title: '해석의 정원', type: 'lesson', emoji: '🌷', skillIds: ['graph-times', 'graph-word'], reviewSkillIds: ['graph-missing'], problemCount: 8 },
  {
    id: 'gr-boss', unitId: 'unitGraph', title: '그래프 카멜레온', type: 'boss', emoji: '🦎',
    skillIds: ['graph-read', 'graph-most', 'graph-percent', 'graph-missing', 'graph-times', 'graph-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '그래프 카멜레온', emoji: '🦎', hp: 10, image: 'assets/boss/chameleon.png', taunt: '내 색깔 속에 숨은 숫자를 찾아봐!' },
  },
  // ── 6-1-6: 직육면체의 부피와 겉넓이 ──
  { id: 'vl-1', unitId: 'unitVolume', title: '부피의 항만', type: 'lesson', emoji: '📦', skillIds: ['vol-rect', 'vol-cube'], reviewSkillIds: [], problemCount: 8 },
  { id: 'vl-2', unitId: 'unitVolume', title: '겉넓이 부두', type: 'lesson', emoji: '🚢', skillIds: ['surf-rect', 'surf-cube'], reviewSkillIds: ['vol-rect'], problemCount: 8 },
  { id: 'vl-3', unitId: 'unitVolume', title: '깊은 바다 창고', type: 'lesson', emoji: '🌊', skillIds: ['vol-missing', 'vol-unit', 'vol-word'], reviewSkillIds: ['surf-rect'], problemCount: 9 },
  {
    id: 'vl-boss', unitId: 'unitVolume', title: '부피 고래', type: 'boss', emoji: '🐋',
    skillIds: ['vol-rect', 'vol-cube', 'vol-missing', 'surf-rect', 'surf-cube', 'vol-unit', 'vol-word'],
    reviewSkillIds: [], problemCount: 12,
    boss: { name: '부피 고래', emoji: '🐋', hp: 12, image: 'assets/boss/whale.png', taunt: '내 뱃속의 부피를 잴 수 있겠어?' },
  },

  // ════════ 6학년 2학기 ════════
  // ── 6-2-1: 분수의 나눗셈 ──
  { id: 'fd2-1', unitId: 'unitFracDiv2', title: '역수의 무대', type: 'lesson', emoji: '🎪', skillIds: ['fdiv2-same', 'fdiv2-nat-frac'], reviewSkillIds: [], problemCount: 8 },
  { id: 'fd2-2', unitId: 'unitFracDiv2', title: '뒤집기 거울방', type: 'lesson', emoji: '🪞', skillIds: ['fdiv2-diff'], reviewSkillIds: ['fdiv2-same'], problemCount: 8 },
  { id: 'fd2-3', unitId: 'unitFracDiv2', title: '환상의 천장', type: 'lesson', emoji: '🎠', skillIds: ['fdiv2-mixed', 'fdiv2-word'], reviewSkillIds: ['fdiv2-diff'], problemCount: 8 },
  {
    id: 'fd2-boss', unitId: 'unitFracDiv2', title: '역수 마술사', type: 'boss', emoji: '🎩',
    skillIds: ['fdiv2-same', 'fdiv2-nat-frac', 'fdiv2-diff', 'fdiv2-mixed', 'fdiv2-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '역수 마술사', emoji: '🎩', hp: 10, image: 'assets/boss/magician.png', taunt: '뒤집어라, 뒤집어! 뭐가 진짜일까?' },
  },
  // ── 6-2-2: 소수의 나눗셈 ──
  { id: 'dd2-1', unitId: 'unitDecDiv2', title: '너구리 가게', type: 'lesson', emoji: '🏮', skillIds: ['ddiv2-same', 'ddiv2-nat'], reviewSkillIds: [], problemCount: 8 },
  { id: 'dd2-2', unitId: 'unitDecDiv2', title: '저울의 방', type: 'lesson', emoji: '⚖️', skillIds: ['ddiv2-diff', 'ddiv2-round'], reviewSkillIds: ['ddiv2-same'], problemCount: 8 },
  { id: 'dd2-3', unitId: 'unitDecDiv2', title: '나눔 창고', type: 'lesson', emoji: '🛖', skillIds: ['ddiv2-share', 'ddiv2-word'], reviewSkillIds: ['ddiv2-diff'], problemCount: 8 },
  {
    id: 'dd2-boss', unitId: 'unitDecDiv2', title: '소수점 너구리', type: 'boss', emoji: '🦝',
    skillIds: ['ddiv2-same', 'ddiv2-diff', 'ddiv2-nat', 'ddiv2-round', 'ddiv2-share', 'ddiv2-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '소수점 너구리', emoji: '🦝', hp: 10, image: 'assets/boss/raccoon.png', taunt: '소수점을 슬쩍 옮겨놨지롱~!' },
  },
  // ── 6-2-3: 공간과 입체 ──
  { id: 'spc-1', unitId: 'unitSpace', title: '쌓기나무 언덕', type: 'lesson', emoji: '🧱', skillIds: ['space-layers', 'space-cube'], reviewSkillIds: [], problemCount: 8 },
  { id: 'spc-2', unitId: 'unitSpace', title: '얼음 블록 협곡', type: 'lesson', emoji: '🧊', skillIds: ['space-need', 'space-hidden'], reviewSkillIds: ['space-cube'], problemCount: 8 },
  { id: 'spc-3', unitId: 'unitSpace', title: '설산의 탑', type: 'lesson', emoji: '🏔️', skillIds: ['space-word'], reviewSkillIds: ['space-need'], problemCount: 8 },
  {
    id: 'spc-boss', unitId: 'unitSpace', title: '쌓기나무 예티', type: 'boss', emoji: '☃️',
    skillIds: ['space-layers', 'space-cube', 'space-need', 'space-hidden', 'space-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '쌓기나무 예티', emoji: '☃️', hp: 10, image: 'assets/boss/yeti.png', taunt: '내가 쌓은 탑, 몇 개인지 알아맞혀 봐!' },
  },
  // ── 6-2-4: 비례식과 비례배분 ──
  { id: 'pp-1', unitId: 'unitProportion', title: '균형의 다리', type: 'lesson', emoji: '🌉', skillIds: ['prop-simplify', 'prop-simplify2'], reviewSkillIds: [], problemCount: 8 },
  { id: 'pp-2', unitId: 'unitProportion', title: '저울 게의 집', type: 'lesson', emoji: '🦀', skillIds: ['prop-solve', 'prop-property'], reviewSkillIds: ['prop-simplify'], problemCount: 8 },
  { id: 'pp-3', unitId: 'unitProportion', title: '나눔의 해변', type: 'lesson', emoji: '🏖️', skillIds: ['prop-divide', 'prop-word'], reviewSkillIds: ['prop-solve'], problemCount: 8 },
  {
    id: 'pp-boss', unitId: 'unitProportion', title: '비례 게 장군', type: 'boss', emoji: '🦀',
    skillIds: ['prop-simplify', 'prop-simplify2', 'prop-solve', 'prop-property', 'prop-divide', 'prop-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '비례 게 장군', emoji: '🦀', hp: 10, image: 'assets/boss/crab.png', taunt: '내 집게의 균형을 무너뜨릴 수 있겠나!' },
  },
  // ── 6-2-5: 원의 넓이 ──
  { id: 'cir-1', unitId: 'unitCircle', title: '바퀴의 길', type: 'lesson', emoji: '🛞', skillIds: ['circ-circum', 'circ-circum-inv'], reviewSkillIds: [], problemCount: 8 },
  { id: 'cir-2', unitId: 'unitCircle', title: '둥근 들판', type: 'lesson', emoji: '⭕', skillIds: ['circ-area', 'circ-point'], reviewSkillIds: ['circ-circum'], problemCount: 8 },
  { id: 'cir-3', unitId: 'unitCircle', title: '반달 정원', type: 'lesson', emoji: '🌗', skillIds: ['circ-half', 'circ-word'], reviewSkillIds: ['circ-area'], problemCount: 8 },
  {
    id: 'cir-boss', unitId: 'unitCircle', title: '바퀴 정령', type: 'boss', emoji: '🛞',
    skillIds: ['circ-circum', 'circ-circum-inv', 'circ-area', 'circ-half', 'circ-point', 'circ-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '바퀴 정령', emoji: '🛞', hp: 10, image: 'assets/boss/wheel.png', taunt: '빙글빙글~ 내 둘레를 따라잡아 봐!' },
  },
  // ── 6-2-6: 원기둥, 원뿔, 구 ──
  { id: 'r3-1', unitId: 'unitRound3d', title: '회전목마 입구', type: 'lesson', emoji: '🎠', skillIds: ['round3d-parts', 'round3d-rotate'], reviewSkillIds: [], problemCount: 8 },
  { id: 'r3-2', unitId: 'unitRound3d', title: '둥근 지붕 마을', type: 'lesson', emoji: '🏰', skillIds: ['round3d-pick', 'round3d-size'], reviewSkillIds: ['round3d-parts'], problemCount: 8 },
  { id: 'r3-3', unitId: 'unitRound3d', title: '별빛 대관람차', type: 'lesson', emoji: '🎡', skillIds: ['round3d-word'], reviewSkillIds: ['round3d-size'], problemCount: 8 },
  {
    id: 'r3-boss', unitId: 'unitRound3d', title: '회전목마 왕', type: 'boss', emoji: '🎠',
    skillIds: ['round3d-parts', 'round3d-pick', 'round3d-rotate', 'round3d-size', 'round3d-word'],
    reviewSkillIds: [], problemCount: 12,
    boss: { name: '회전목마 왕', emoji: '🎠', hp: 12, image: 'assets/boss/carousel.png', taunt: '돌고 도는 내 왕국에서 길을 잃어 보렴!' },
  },
];

/** 학기별 단원 구성 (2022 개정교육과정) — 유닛맵 탭 */
export interface SemesterDef {
  id: string;
  label: string;
  emoji: string;
  units: string[];
}

export const SEMESTERS: SemesterDef[] = [
  {
    id: 'g5s1', label: '5학년 1학기', emoji: '🌱',
    units: ['unitMix', 'unitDiv', 'unitPattern', 'unit1', 'unit2', 'unitPoly'],
  },
  {
    id: 'g5s2', label: '5학년 2학기', emoji: '🍁',
    units: ['unitRange', 'unitFracMul', 'unitSym', 'unitDecMul', 'unitCuboid', 'unitAvg'],
  },
  {
    id: 'g6s1', label: '6학년 1학기', emoji: '🌸',
    units: ['unitFracDiv1', 'unitPrism', 'unitDecDiv1', 'unitRatio', 'unitGraph', 'unitVolume'],
  },
  {
    id: 'g6s2', label: '6학년 2학기', emoji: '❄️',
    units: ['unitFracDiv2', 'unitDecDiv2', 'unitSpace', 'unitProportion', 'unitCircle', 'unitRound3d'],
  },
];

export const UNIT_TITLES: Record<string, string> = {
  unitMix: '1. 자연수의 혼합 계산',
  unitDiv: '2. 약수와 배수',
  unitPattern: '3. 규칙과 대응',
  unit1: '4. 약분과 통분',
  unit2: '5. 분수의 덧셈과 뺄셈',
  unitPoly: '6. 다각형의 둘레와 넓이',
  unitRange: '1. 수의 범위와 어림하기',
  unitFracMul: '2. 분수의 곱셈',
  unitSym: '3. 합동과 대칭',
  unitDecMul: '4. 소수의 곱셈',
  unitCuboid: '5. 직육면체',
  unitAvg: '6. 평균과 가능성',
  unitFracDiv1: '1. 분수의 나눗셈',
  unitPrism: '2. 각기둥과 각뿔',
  unitDecDiv1: '3. 소수의 나눗셈',
  unitRatio: '4. 비와 비율',
  unitGraph: '5. 여러 가지 그래프',
  unitVolume: '6. 직육면체의 부피와 겉넓이',
  unitFracDiv2: '1. 분수의 나눗셈',
  unitDecDiv2: '2. 소수의 나눗셈',
  unitSpace: '3. 공간과 입체',
  unitProportion: '4. 비례식과 비례배분',
  unitCircle: '5. 원의 넓이',
  unitRound3d: '6. 원기둥, 원뿔, 구',
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
