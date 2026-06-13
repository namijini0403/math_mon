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
  type: 'lesson' | 'boss' | 'challenge';
  emoji: string;
  /** 이 스테이지에서 출제되는 스킬 */
  skillIds: string[];
  /** 복습으로 섞이는 이전 스킬 */
  reviewSkillIds: string[];
  problemCount: number;
  boss?: BossInfo;
}

export const STAGES: StageDef[] = [
  // ════════ 1학년 1학기 ════════
  // ── 1-1-1: 9까지의 수 ──
  {
    id: 'n9-1', unitId: 'unitNum9', title: '수 세기 마을', type: 'lesson', emoji: '🌷',
    skillIds: ['num9-count', 'num9-order'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'n9-2', unitId: 'unitNum9', title: '크기 비교 들판', type: 'lesson', emoji: '🌻',
    skillIds: ['num9-compare', 'num9-ordinal'], reviewSkillIds: ['num9-count'], problemCount: 8,
  },
  {
    id: 'n9-3', unitId: 'unitNum9', title: '수 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['num9-word'], reviewSkillIds: ['num9-compare', 'num9-ordinal'], problemCount: 8,
  },
  {
    id: 'n9-boss', unitId: 'unitNum9', title: '숫자 병아리', type: 'boss', emoji: '🐤',
    skillIds: ['num9-count', 'num9-order', 'num9-compare', 'num9-ordinal', 'num9-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '숫자 병아리', emoji: '🐤', hp: 10, image: 'assets/boss/chick.png', taunt: '9까지 셀 수 있겠어? 도전해 봐!' },
  },
  // ── 1-1-2: 여러 가지 모양 ──
  {
    id: 'sh1-1', unitId: 'unitShape1', title: '모양 분류 마을', type: 'lesson', emoji: '⚽',
    skillIds: ['shape1-classify', 'shape1-same'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sh1-2', unitId: 'unitShape1', title: '모양 세기 들판', type: 'lesson', emoji: '📦',
    skillIds: ['shape1-count'], reviewSkillIds: ['shape1-classify'], problemCount: 8,
  },
  {
    id: 'sh1-3', unitId: 'unitShape1', title: '모양 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['shape1-word'], reviewSkillIds: ['shape1-same', 'shape1-count'], problemCount: 8,
  },
  {
    id: 'sh1-boss', unitId: 'unitShape1', title: '모양 문어', type: 'boss', emoji: '🐙',
    skillIds: ['shape1-classify', 'shape1-same', 'shape1-count', 'shape1-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '모양 문어', emoji: '🐙', hp: 10, image: 'assets/boss/shapes-octo.png', taunt: '공, 상자, 기둥 모양을 모두 알고 있니?' },
  },
  // ── 1-1-3: 덧셈과 뺄셈 ──
  {
    id: 'as1-1', unitId: 'unitAddSub1', title: '모으기·가르기 마을', type: 'lesson', emoji: '➕',
    skillIds: ['as1-gather', 'as1-add'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'as1-2', unitId: 'unitAddSub1', title: '뺄셈 들판', type: 'lesson', emoji: '➖',
    skillIds: ['as1-sub', 'as1-zero'], reviewSkillIds: ['as1-add'], problemCount: 8,
  },
  {
    id: 'as1-3', unitId: 'unitAddSub1', title: '□ 구하기 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['as1-missing', 'as1-word'], reviewSkillIds: ['as1-sub', 'as1-zero'], problemCount: 8,
  },
  {
    id: 'as1-boss', unitId: 'unitAddSub1', title: '덧셈 강아지', type: 'boss', emoji: '🐶',
    skillIds: ['as1-gather', 'as1-add', 'as1-sub', 'as1-zero', 'as1-missing', 'as1-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '덧셈 강아지', emoji: '🐶', hp: 10, image: 'assets/boss/puppy.png', taunt: '9까지 더하고 빼는 거 쉬워 보이지? 해 봐!' },
  },
  // ── 1-1-4: 비교하기 ──
  {
    id: 'cp1-1', unitId: 'unitCompare1', title: '이모지 비교 마을', type: 'lesson', emoji: '🌈',
    skillIds: ['comp1-emoji', 'comp1-vocab'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'cp1-2', unitId: 'unitCompare1', title: '가장 ~한 것 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['comp1-most'], reviewSkillIds: ['comp1-emoji'], problemCount: 8,
  },
  {
    id: 'cp1-3', unitId: 'unitCompare1', title: '비교 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['comp1-word'], reviewSkillIds: ['comp1-most', 'comp1-vocab'], problemCount: 8,
  },
  {
    id: 'cp1-boss', unitId: 'unitCompare1', title: '비교 기린', type: 'boss', emoji: '🦒',
    skillIds: ['comp1-emoji', 'comp1-most', 'comp1-vocab', 'comp1-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '비교 기린', emoji: '🦒', hp: 10, image: 'assets/boss/giraffe.png', taunt: '누가 더 많은지, 더 큰지 알 수 있겠어?' },
  },
  // ── 1-1-5: 50까지의 수 ──
  {
    id: 'n50-1', unitId: 'unitNum50', title: '묶음·낱개 마을', type: 'lesson', emoji: '🔢',
    skillIds: ['num50-compose', 'num50-split'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'n50-2', unitId: 'unitNum50', title: '수 순서 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['num50-order', 'num50-compare'], reviewSkillIds: ['num50-compose'], problemCount: 8,
  },
  {
    id: 'n50-3', unitId: 'unitNum50', title: '50까지 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['num50-word'], reviewSkillIds: ['num50-order', 'num50-compare'], problemCount: 8,
  },
  {
    id: 'n50-boss', unitId: 'unitNum50', title: '묶음 양', type: 'boss', emoji: '🐑',
    skillIds: ['num50-compose', 'num50-split', 'num50-order', 'num50-compare', 'num50-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '묶음 양', emoji: '🐑', hp: 10, image: 'assets/boss/sheep.png', taunt: '50까지 셀 수 있어? 양을 다 세어 봐!' },
  },
  // ════════ 1학년 2학기 ════════
  // ── 1-2-1: 100까지의 수 ──
  {
    id: 'n100-1', unitId: 'unitNum100', title: '묶음·낱개 마을', type: 'lesson', emoji: '🔢',
    skillIds: ['num100-compose', 'num100-order'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'n100-2', unitId: 'unitNum100', title: '크기 비교 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['num100-compare', 'num100-evenodd'], reviewSkillIds: ['num100-compose'], problemCount: 8,
  },
  {
    id: 'n100-3', unitId: 'unitNum100', title: '100까지 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['num100-word'], reviewSkillIds: ['num100-compare', 'num100-evenodd'], problemCount: 8,
  },
  {
    id: 'n100-boss', unitId: 'unitNum100', title: '숫자 고래', type: 'boss', emoji: '🐳',
    skillIds: ['num100-compose', 'num100-order', 'num100-compare', 'num100-evenodd', 'num100-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '숫자 고래', emoji: '🐳', hp: 10, image: 'assets/boss/whale100.png', taunt: '100까지 셀 수 있겠어? 고래만큼 큰 수도 알아 봐!' },
  },
  // ── 1-2-2: 덧셈과 뺄셈(1) ──
  {
    id: 'asa-1', unitId: 'unitAS12a', title: '받아올림 없는 덧셈 마을', type: 'lesson', emoji: '➕',
    skillIds: ['as12a-add1', 'as12a-sub1'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'asa-2', unitId: 'unitAS12a', title: '몇십 더하기 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['as12a-tens'], reviewSkillIds: ['as12a-add1'], problemCount: 8,
  },
  {
    id: 'asa-3', unitId: 'unitAS12a', title: '세 수 계산 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['as12a-three', 'as12a-word'], reviewSkillIds: ['as12a-tens'], problemCount: 8,
  },
  {
    id: 'asa-boss', unitId: 'unitAS12a', title: '덧셈 판다', type: 'boss', emoji: '🐼',
    skillIds: ['as12a-add1', 'as12a-sub1', 'as12a-tens', 'as12a-three', 'as12a-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '덧셈 판다', emoji: '🐼', hp: 10, image: 'assets/boss/panda.png', taunt: '받아올림 없는 덧뺄셈, 판다도 할 수 있어! 해 봐!' },
  },
  // ── 1-2-3: 여러 가지 모양 ──
  {
    id: 'sh2-1', unitId: 'unitShape12', title: '모양 분류 광장', type: 'lesson', emoji: '🔺',
    skillIds: ['shape12-classify', 'shape12-count'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'sh2-2', unitId: 'unitShape12', title: '본뜬 모양 들판', type: 'lesson', emoji: '🟦',
    skillIds: ['shape12-trace'], reviewSkillIds: ['shape12-classify'], problemCount: 8,
  },
  {
    id: 'sh2-3', unitId: 'unitShape12', title: '모양 이야기 마을', type: 'lesson', emoji: '🌟',
    skillIds: ['shape12-word'], reviewSkillIds: ['shape12-count', 'shape12-trace'], problemCount: 8,
  },
  {
    id: 'sh2-boss', unitId: 'unitShape12', title: '모양 개구리', type: 'boss', emoji: '🐸',
    skillIds: ['shape12-classify', 'shape12-count', 'shape12-trace', 'shape12-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '모양 개구리', emoji: '🐸', hp: 10, image: 'assets/boss/frog.png', taunt: '네모, 세모, 동그라미 모두 알아? 나를 이겨 봐!' },
  },
  // ── 1-2-4: 덧셈과 뺄셈(2) ──
  {
    id: 'asb-1', unitId: 'unitAS12b', title: '10 만들기 마을', type: 'lesson', emoji: '🔟',
    skillIds: ['as12b-make10', 'as12b-from10'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'asb-2', unitId: 'unitAS12b', title: '이어 세기 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['as12b-use10', 'as12b-counting'], reviewSkillIds: ['as12b-make10'], problemCount: 8,
  },
  {
    id: 'asb-3', unitId: 'unitAS12b', title: '10 이용 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['as12b-word'], reviewSkillIds: ['as12b-use10', 'as12b-counting'], problemCount: 8,
  },
  {
    id: 'asb-boss', unitId: 'unitAS12b', title: '십 만들기 다람쥐', type: 'boss', emoji: '🐿️',
    skillIds: ['as12b-make10', 'as12b-from10', 'as12b-use10', 'as12b-counting', 'as12b-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '십 만들기 다람쥐', emoji: '🐿️', hp: 10, image: 'assets/boss/ten-squirrel.png', taunt: '10을 만들면 쉬워져! 다람쥐처럼 빠르게 계산해 봐!' },
  },
  // ── 1-2-5: 시계 보기와 규칙 찾기 ──
  {
    id: 'ck-1', unitId: 'unitClock1', title: '시계 마을', type: 'lesson', emoji: '🕐',
    skillIds: ['clock1-oclock', 'clock1-half'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'ck-2', unitId: 'unitClock1', title: '반복 규칙 들판', type: 'lesson', emoji: '🔁',
    skillIds: ['clock1-pattern', 'clock1-numrule'], reviewSkillIds: ['clock1-oclock'], problemCount: 8,
  },
  {
    id: 'ck-3', unitId: 'unitClock1', title: '시계와 규칙 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['clock1-word'], reviewSkillIds: ['clock1-pattern', 'clock1-numrule'], problemCount: 8,
  },
  {
    id: 'ck-boss', unitId: 'unitClock1', title: '시계 수탉', type: 'boss', emoji: '🐓',
    skillIds: ['clock1-oclock', 'clock1-half', 'clock1-pattern', 'clock1-numrule', 'clock1-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '시계 수탉', emoji: '🐓', hp: 10, image: 'assets/boss/rooster.png', taunt: '꼬끼오! 몇 시인지 맞혀 봐! 규칙도 찾아야 해!' },
  },
  // ── 1-2-6: 덧셈과 뺄셈(3) ──
  {
    id: 'asc-1', unitId: 'unitAS12c', title: '받아올림 덧셈 마을', type: 'lesson', emoji: '➕',
    skillIds: ['as12c-carry', 'as12c-borrow'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'asc-2', unitId: 'unitAS12c', title: '관계식 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['as12c-relation', 'as12c-missing'], reviewSkillIds: ['as12c-carry'], problemCount: 8,
  },
  {
    id: 'asc-3', unitId: 'unitAS12c', title: '받아올림 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['as12c-word'], reviewSkillIds: ['as12c-borrow', 'as12c-relation'], problemCount: 8,
  },
  {
    id: 'asc-boss', unitId: 'unitAS12c', title: '받아올림 고양이', type: 'boss', emoji: '🐱',
    skillIds: ['as12c-carry', 'as12c-borrow', 'as12c-relation', 'as12c-missing', 'as12c-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '받아올림 고양이', emoji: '🐱', hp: 10, image: 'assets/boss/cat.png', taunt: '십몇이 되는 덧셈, 나한테 통하지 않아! 해 봐!' },
  },
  // ════════ 2학년 1학기 ════════
  // ── 2-1-1: 세 자리 수 ──
  {
    id: 'n3d-1', unitId: 'unitNum3d', title: '백·십·일 마을', type: 'lesson', emoji: '🏛️',
    skillIds: ['num3d-compose', 'num3d-place'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'n3d-2', unitId: 'unitNum3d', title: '뛰어 세기 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['num3d-skip', 'num3d-compare'], reviewSkillIds: ['num3d-compose'], problemCount: 8,
  },
  {
    id: 'n3d-3', unitId: 'unitNum3d', title: '세 자리 수 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['num3d-word'], reviewSkillIds: ['num3d-skip', 'num3d-compare'], problemCount: 8,
  },
  {
    id: 'n3d-boss', unitId: 'unitNum3d', title: '백 단위 코뿔소', type: 'boss', emoji: '🦏',
    skillIds: ['num3d-compose', 'num3d-place', 'num3d-skip', 'num3d-compare', 'num3d-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '백 단위 코뿔소', emoji: '🦏', hp: 10, image: 'assets/boss/rhino.png', taunt: '세 자리 수도 알아? 백의 자리까지 도전해 봐!' },
  },
  // ── 2-1-2: 여러 가지 도형 ──
  {
    id: 'fig-1', unitId: 'unitFigure2', title: '도형 변·꼭짓점 마을', type: 'lesson', emoji: '🔺',
    skillIds: ['fig2-sides', 'fig2-name'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'fig-2', unitId: 'unitFigure2', title: '도형 분류 들판', type: 'lesson', emoji: '🟦',
    skillIds: ['fig2-classify', 'fig2-circle'], reviewSkillIds: ['fig2-sides'], problemCount: 8,
  },
  {
    id: 'fig-3', unitId: 'unitFigure2', title: '도형 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['fig2-word'], reviewSkillIds: ['fig2-name', 'fig2-classify'], problemCount: 8,
  },
  {
    id: 'fig-boss', unitId: 'unitFigure2', title: '도형 펭귄', type: 'boss', emoji: '🐧',
    skillIds: ['fig2-sides', 'fig2-name', 'fig2-classify', 'fig2-circle', 'fig2-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '도형 펭귄', emoji: '🐧', hp: 10, image: 'assets/boss/figure-penguin.png', taunt: '삼각형, 사각형, 원까지! 도형을 다 알고 있니?' },
  },
  // ── 2-1-3: 덧셈과 뺄셈 ──
  {
    id: 'as2-1', unitId: 'unitAddSub2', title: '받아올림 덧셈 마을', type: 'lesson', emoji: '➕',
    skillIds: ['as2-add', 'as2-sub'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'as2-2', unitId: 'unitAddSub2', title: '세 수 계산 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['as2-three', 'as2-missing'], reviewSkillIds: ['as2-add'], problemCount: 8,
  },
  {
    id: 'as2-3', unitId: 'unitAddSub2', title: '덧뺄셈 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['as2-word'], reviewSkillIds: ['as2-sub', 'as2-three'], problemCount: 8,
  },
  {
    id: 'as2-boss', unitId: 'unitAddSub2', title: '받아올림 여우', type: 'boss', emoji: '🦊',
    skillIds: ['as2-add', 'as2-sub', 'as2-three', 'as2-missing', 'as2-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '받아올림 여우', emoji: '🦊', hp: 10, image: 'assets/boss/carry-fox.png', taunt: '두 자리 덧뺄셈, 받아올림까지 잘 할 수 있어?' },
  },
  // ── 2-1-4: 길이 재기 ──
  {
    id: 'ln2-1', unitId: 'unitLength2', title: 'cm 재기 마을', type: 'lesson', emoji: '📏',
    skillIds: ['len2-cm', 'len2-unit'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'ln2-2', unitId: 'unitLength2', title: '길이 비교 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['len2-compare'], reviewSkillIds: ['len2-cm'], problemCount: 8,
  },
  {
    id: 'ln2-3', unitId: 'unitLength2', title: '길이 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['len2-word'], reviewSkillIds: ['len2-unit', 'len2-compare'], problemCount: 8,
  },
  {
    id: 'ln2-boss', unitId: 'unitLength2', title: '길이 악어', type: 'boss', emoji: '🐊',
    skillIds: ['len2-cm', 'len2-unit', 'len2-compare', 'len2-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '길이 악어', emoji: '🐊', hp: 10, image: 'assets/boss/croc.png', taunt: '내 꼬리 길이가 몇 cm인지 맞혀 봐!' },
  },
  // ── 2-1-5: 분류하기 ──
  {
    id: 'cl2-1', unitId: 'unitClassify', title: '기준 분류 마을', type: 'lesson', emoji: '🍎',
    skillIds: ['class2-count', 'class2-table'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'cl2-2', unitId: 'unitClassify', title: '분류 표 들판', type: 'lesson', emoji: '📊',
    skillIds: ['class2-most'], reviewSkillIds: ['class2-count'], problemCount: 8,
  },
  {
    id: 'cl2-3', unitId: 'unitClassify', title: '분류 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['class2-word'], reviewSkillIds: ['class2-table', 'class2-most'], problemCount: 8,
  },
  {
    id: 'cl2-boss', unitId: 'unitClassify', title: '정리 코알라', type: 'boss', emoji: '🐨',
    skillIds: ['class2-count', 'class2-table', 'class2-most', 'class2-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '정리 코알라', emoji: '🐨', hp: 10, image: 'assets/boss/koala.png', taunt: '기준에 따라 분류할 수 있겠어? 나를 이겨 봐!' },
  },
  // ── 2-1-6: 곱셈 ──
  {
    id: 'mi-1', unitId: 'unitMulIntro', title: '묶어 세기 마을', type: 'lesson', emoji: '✖️',
    skillIds: ['muli-group', 'muli-times'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'mi-2', unitId: 'unitMulIntro', title: '곱셈식 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['muli-expr', 'muli-convert'], reviewSkillIds: ['muli-group'], problemCount: 8,
  },
  {
    id: 'mi-3', unitId: 'unitMulIntro', title: '곱셈 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['muli-word'], reviewSkillIds: ['muli-times', 'muli-expr'], problemCount: 8,
  },
  {
    id: 'mi-boss', unitId: 'unitMulIntro', title: '곱셈 문어', type: 'boss', emoji: '🐙',
    skillIds: ['muli-group', 'muli-times', 'muli-expr', 'muli-convert', 'muli-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '곱셈 문어', emoji: '🐙', hp: 10, image: 'assets/boss/multi-octo.png', taunt: '다리가 몇 개씩 몇 묶음인지 계산해 봐!' },
  },
  // ════════ 2학년 2학기 ════════
  // ── 2-2-1: 네 자리 수 ──
  {
    id: 'n4d-1', unitId: 'unitNum4d', title: '천·백·십·일 마을', type: 'lesson', emoji: '🏛️',
    skillIds: ['num4d-compose', 'num4d-place'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'n4d-2', unitId: 'unitNum4d', title: '뛰어 세기 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['num4d-skip', 'num4d-compare'], reviewSkillIds: ['num4d-compose'], problemCount: 8,
  },
  {
    id: 'n4d-3', unitId: 'unitNum4d', title: '네 자리 수 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['num4d-word'], reviewSkillIds: ['num4d-skip', 'num4d-compare'], problemCount: 8,
  },
  {
    id: 'n4d-boss', unitId: 'unitNum4d', title: '사천왕 거위', type: 'boss', emoji: '🦢',
    skillIds: ['num4d-compose', 'num4d-place', 'num4d-skip', 'num4d-compare', 'num4d-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '사천왕 거위', emoji: '🦢', hp: 10, image: 'assets/boss/goose.png', taunt: '천 단위까지 셀 수 있어? 나를 이겨 봐!' },
  },
  // ── 2-2-2: 곱셈구구 ──
  {
    id: 'gg-1', unitId: 'unitGugu', title: '2단·5단 마을', type: 'lesson', emoji: '✖️',
    skillIds: ['gugu-25', 'gugu-zero'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'gg-2', unitId: 'unitGugu', title: '3단·6단·4단·8단 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['gugu-36', 'gugu-48'], reviewSkillIds: ['gugu-25'], problemCount: 8,
  },
  {
    id: 'gg-3', unitId: 'unitGugu', title: '7단·9단·빈칸 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['gugu-79', 'gugu-missing', 'gugu-word'], reviewSkillIds: ['gugu-36', 'gugu-48'], problemCount: 8,
  },
  {
    id: 'gg-boss', unitId: 'unitGugu', title: '구구 공룡', type: 'boss', emoji: '🦕',
    skillIds: ['gugu-25', 'gugu-36', 'gugu-48', 'gugu-79', 'gugu-missing', 'gugu-zero', 'gugu-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '구구 공룡', emoji: '🦕', hp: 10, image: 'assets/boss/dino.png', taunt: '구구단을 다 외웠어? 나를 이겨 봐!' },
  },
  // ── 2-2-3: 길이 재기 ──
  {
    id: 'ln3-1', unitId: 'unitLength22', title: 'm↔cm 변환 마을', type: 'lesson', emoji: '📏',
    skillIds: ['len22-conv', 'len22-unit'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'ln3-2', unitId: 'unitLength22', title: '길이 합·차 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['len22-add', 'len22-sub'], reviewSkillIds: ['len22-conv'], problemCount: 8,
  },
  {
    id: 'ln3-3', unitId: 'unitLength22', title: '길이 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['len22-word'], reviewSkillIds: ['len22-add', 'len22-sub'], problemCount: 8,
  },
  {
    id: 'ln3-boss', unitId: 'unitLength22', title: '길이 지렁이', type: 'boss', emoji: '🐛',
    skillIds: ['len22-conv', 'len22-add', 'len22-sub', 'len22-unit', 'len22-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '길이 지렁이', emoji: '🐛', hp: 10, image: 'assets/boss/worm.png', taunt: '내 몸길이는 몇 m 몇 cm일까? 계산해 봐!' },
  },
  // ── 2-2-4: 시각과 시간 ──
  {
    id: 'tk2-1', unitId: 'unitTime2', title: '시계 마을', type: 'lesson', emoji: '🕐',
    skillIds: ['time2-read', 'time2-units'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'tk2-2', unitId: 'unitTime2', title: '시간 변환 들판', type: 'lesson', emoji: '⏱️',
    skillIds: ['time2-conv', 'time2-elapsed'], reviewSkillIds: ['time2-read'], problemCount: 8,
  },
  {
    id: 'tk2-3', unitId: 'unitTime2', title: '시각과 시간 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['time2-word'], reviewSkillIds: ['time2-conv', 'time2-elapsed'], problemCount: 8,
  },
  {
    id: 'tk2-boss', unitId: 'unitTime2', title: '시간 올빼미', type: 'boss', emoji: '🦉',
    skillIds: ['time2-read', 'time2-conv', 'time2-elapsed', 'time2-units', 'time2-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '시간 올빼미', emoji: '🦉', hp: 10, image: 'assets/boss/time-owl.png', taunt: '몇 시 몇 분인지 맞혀 봐! 시간은 기다려 주지 않아!' },
  },
  // ── 2-2-5: 표와 그래프 ──
  {
    id: 'tg-1', unitId: 'unitTableGraph', title: '표 채우기 마을', type: 'lesson', emoji: '📊',
    skillIds: ['tbg2-table', 'tbg2-total'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'tg-2', unitId: 'unitTableGraph', title: '그래프 들판', type: 'lesson', emoji: '📈',
    skillIds: ['tbg2-graph', 'tbg2-most'], reviewSkillIds: ['tbg2-table'], problemCount: 8,
  },
  {
    id: 'tg-3', unitId: 'unitTableGraph', title: '표와 그래프 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['tbg2-word'], reviewSkillIds: ['tbg2-total', 'tbg2-most'], problemCount: 8,
  },
  {
    id: 'tg-boss', unitId: 'unitTableGraph', title: '그래프 돌고래', type: 'boss', emoji: '🐬',
    skillIds: ['tbg2-table', 'tbg2-graph', 'tbg2-total', 'tbg2-most', 'tbg2-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '그래프 돌고래', emoji: '🐬', hp: 10, image: 'assets/boss/dolphin.png', taunt: '표와 그래프를 읽을 수 있어? 나를 이겨 봐!' },
  },
  // ── 2-2-6: 규칙 찾기 ──
  {
    id: 'rl2-1', unitId: 'unitRule2', title: '수 규칙 마을', type: 'lesson', emoji: '🔢',
    skillIds: ['rule2-numseq', 'rule2-stack'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'rl2-2', unitId: 'unitRule2', title: '표·모양 규칙 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['rule2-table', 'rule2-shape'], reviewSkillIds: ['rule2-numseq'], problemCount: 8,
  },
  {
    id: 'rl2-3', unitId: 'unitRule2', title: '규칙 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['rule2-word'], reviewSkillIds: ['rule2-table', 'rule2-shape'], problemCount: 8,
  },
  {
    id: 'rl2-boss', unitId: 'unitRule2', title: '규칙 카멜레온', type: 'boss', emoji: '🦎',
    skillIds: ['rule2-numseq', 'rule2-table', 'rule2-shape', 'rule2-stack', 'rule2-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '규칙 카멜레온', emoji: '🦎', hp: 10, image: 'assets/boss/rule-chameleon.png', taunt: '내 색깔 변화에서 규칙을 찾을 수 있어?' },
  },

  // ════════ 3학년 1학기 (전반) ════════
  // ── 3-1-1: 덧셈과 뺄셈 ──
  {
    id: 'a3-1', unitId: 'unitAdd3', title: '덧셈 마을', type: 'lesson', emoji: '➕',
    skillIds: ['add3-add'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'a3-2', unitId: 'unitAdd3', title: '뺄셈 요새', type: 'lesson', emoji: '➖',
    skillIds: ['add3-sub'], reviewSkillIds: ['add3-add'], problemCount: 8,
  },
  {
    id: 'a3-3', unitId: 'unitAdd3', title: '어림셈 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['add3-round', 'add3-missing'], reviewSkillIds: ['add3-sub'], problemCount: 8,
  },
  {
    id: 'a3-4', unitId: 'unitAdd3', title: '이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['add3-word'], reviewSkillIds: ['add3-round', 'add3-missing'], problemCount: 8,
  },
  {
    id: 'a3-boss', unitId: 'unitAdd3', title: '받아올림 다람쥐', type: 'boss', emoji: '🐿️',
    skillIds: ['add3-add', 'add3-sub', 'add3-round', 'add3-missing', 'add3-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '받아올림 다람쥐', emoji: '🐿️', hp: 10, image: 'assets/boss/squirrel3.png', taunt: '받아올림이 몇 번인지 셀 수 있겠어?' },
  },
  // ── 3-1-2: 평면도형 ──
  {
    id: 'p3-1', unitId: 'unitPlane3', title: '선의 나라', type: 'lesson', emoji: '📏',
    skillIds: ['plane3-line'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'p3-2', unitId: 'unitPlane3', title: '각의 정원', type: 'lesson', emoji: '📐',
    skillIds: ['plane3-angle'], reviewSkillIds: ['plane3-line'], problemCount: 8,
  },
  {
    id: 'p3-3', unitId: 'unitPlane3', title: '직각 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['plane3-right-tri', 'plane3-perimeter'], reviewSkillIds: ['plane3-angle'], problemCount: 8,
  },
  {
    id: 'p3-4', unitId: 'unitPlane3', title: '도형 이야기 마을', type: 'lesson', emoji: '🏘️',
    skillIds: ['plane3-word'], reviewSkillIds: ['plane3-right-tri', 'plane3-perimeter'], problemCount: 8,
  },
  {
    id: 'p3-boss', unitId: 'unitPlane3', title: '직각 거북', type: 'boss', emoji: '🐢',
    skillIds: ['plane3-line', 'plane3-angle', 'plane3-right-tri', 'plane3-perimeter', 'plane3-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '직각 거북', emoji: '🐢', hp: 10, image: 'assets/boss/turtle.png', taunt: '내 등딱지의 각도를 맞혀 봐!' },
  },
  // ── 3-1-3: 나눗셈 ──
  {
    id: 'd31-1', unitId: 'unitDiv3', title: '나누기 광장', type: 'lesson', emoji: '➗',
    skillIds: ['div3-equal'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'd31-2', unitId: 'unitDiv3', title: '곱셈↔나눗셈 다리', type: 'lesson', emoji: '🌉',
    skillIds: ['div3-rel'], reviewSkillIds: ['div3-equal'], problemCount: 8,
  },
  {
    id: 'd31-3', unitId: 'unitDiv3', title: '구구단 숲', type: 'lesson', emoji: '🌲',
    skillIds: ['div3-times', 'div3-word'], reviewSkillIds: ['div3-rel'], problemCount: 8,
  },
  {
    id: 'd31-boss', unitId: 'unitDiv3', title: '나눔 비버', type: 'boss', emoji: '🦫',
    skillIds: ['div3-equal', 'div3-rel', 'div3-times', 'div3-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '나눔 비버', emoji: '🦫', hp: 10, image: 'assets/boss/beaver.png', taunt: '내 댐의 나무를 똑같이 나눠 봐!' },
  },

  // ── 3-1-4: 곱셈 ──
  {
    id: 'm31-1', unitId: 'unitMul31', title: '곱셈 마을', type: 'lesson', emoji: '✖️',
    skillIds: ['mul31-no-carry'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'm31-2', unitId: 'unitMul31', title: '올림 요새', type: 'lesson', emoji: '🏰',
    skillIds: ['mul31-carry', 'mul31-tens'], reviewSkillIds: ['mul31-no-carry'], problemCount: 8,
  },
  {
    id: 'm31-3', unitId: 'unitMul31', title: '어림 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['mul31-estimate'], reviewSkillIds: ['mul31-carry'], problemCount: 8,
  },
  {
    id: 'm31-4', unitId: 'unitMul31', title: '곱셈 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['mul31-word'], reviewSkillIds: ['mul31-estimate', 'mul31-tens'], problemCount: 8,
  },
  {
    id: 'm31-boss', unitId: 'unitMul31', title: '곱셈 꿀벌', type: 'boss', emoji: '🐝',
    skillIds: ['mul31-no-carry', 'mul31-carry', 'mul31-tens', 'mul31-estimate', 'mul31-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '곱셈 꿀벌', emoji: '🐝', hp: 10, image: 'assets/boss/bee.png', taunt: '내 벌집의 칸이 몇 개인지 곱셈으로 구해 봐!' },
  },

  // ── 3-1-5: 길이와 시간 ──
  {
    id: 't3-1', unitId: 'unitTime3', title: '길이 단위 마을', type: 'lesson', emoji: '📏',
    skillIds: ['time3-len'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 't3-2', unitId: 'unitTime3', title: '시간 변환 광장', type: 'lesson', emoji: '⏱️',
    skillIds: ['time3-minsec'], reviewSkillIds: ['time3-len'], problemCount: 8,
  },
  {
    id: 't3-3', unitId: 'unitTime3', title: '시간 덧셈 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['time3-add', 'time3-sub'], reviewSkillIds: ['time3-minsec'], problemCount: 8,
  },
  {
    id: 't3-4', unitId: 'unitTime3', title: '시간 이야기 숲', type: 'lesson', emoji: '🌲',
    skillIds: ['time3-word'], reviewSkillIds: ['time3-add', 'time3-sub'], problemCount: 8,
  },
  {
    id: 't3-boss', unitId: 'unitTime3', title: '시계 토끼', type: 'boss', emoji: '🐇',
    skillIds: ['time3-len', 'time3-minsec', 'time3-add', 'time3-sub', 'time3-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '시계 토끼', emoji: '🐇', hp: 10, image: 'assets/boss/clockrabbit.png', taunt: '시간은 기다려 주지 않아! 얼른 풀어 봐!' },
  },

  // ── 3-1-6: 분수와 소수 ──
  {
    id: 'f31-1', unitId: 'unitFrac3', title: '분수 개념 마을', type: 'lesson', emoji: '🍕',
    skillIds: ['frac3-part'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'f31-2', unitId: 'unitFrac3', title: '단위분수 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['frac3-unit-cmp', 'frac3-same-denom-cmp'], reviewSkillIds: ['frac3-part'], problemCount: 8,
  },
  {
    id: 'f31-3', unitId: 'unitFrac3', title: '소수 다리', type: 'lesson', emoji: '🌉',
    skillIds: ['frac3-dec-rel', 'frac3-dec-cmp'], reviewSkillIds: ['frac3-unit-cmp'], problemCount: 8,
  },
  {
    id: 'f31-4', unitId: 'unitFrac3', title: '분수·소수 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['frac3-word'], reviewSkillIds: ['frac3-dec-rel', 'frac3-same-denom-cmp'], problemCount: 8,
  },
  {
    id: 'f31-boss', unitId: 'unitFrac3', title: '분수 케이크 요정', type: 'boss', emoji: '🧁',
    skillIds: ['frac3-part', 'frac3-unit-cmp', 'frac3-same-denom-cmp', 'frac3-dec-rel', 'frac3-dec-cmp', 'frac3-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '분수 케이크 요정', emoji: '🧁', hp: 10, image: 'assets/boss/cupcake.png', taunt: '케이크를 공평하게 나눌 수 있겠어?' },
  },

  // ════════ 3학년 2학기 (전반) ════════
  // ── 3-2-1: 곱셈 ──
  {
    id: 'm32-1', unitId: 'unitMul32', title: '세 자리 곱셈 광장', type: 'lesson', emoji: '✖️',
    skillIds: ['mul32-3by1'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'm32-2', unitId: 'unitMul32', title: '몇십 곱하기 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['mul32-tens-tens'], reviewSkillIds: ['mul32-3by1'], problemCount: 8,
  },
  {
    id: 'm32-3', unitId: 'unitMul32', title: '두 자리 곱셈 요새', type: 'lesson', emoji: '🏰',
    skillIds: ['mul32-2by2'], reviewSkillIds: ['mul32-tens-tens'], problemCount: 8,
  },
  {
    id: 'm32-4', unitId: 'unitMul32', title: '곱셈 이야기 마을', type: 'lesson', emoji: '🏘️',
    skillIds: ['mul32-word'], reviewSkillIds: ['mul32-2by2'], problemCount: 8,
  },
  {
    id: 'm32-boss', unitId: 'unitMul32', title: '곱셈 코끼리', type: 'boss', emoji: '🐘',
    skillIds: ['mul32-3by1', 'mul32-tens-tens', 'mul32-2by2', 'mul32-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '곱셈 코끼리', emoji: '🐘', hp: 10, image: 'assets/boss/elephant.png', taunt: '내 코로 계산하면 세 자리 곱셈도 한 번에 끝이야!' },
  },

  // ── 3-2-2: 나눗셈 ──
  {
    id: 'd32-1', unitId: 'unitDiv32', title: '몇십 나눗셈 광장', type: 'lesson', emoji: '➗',
    skillIds: ['div32-tens'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'd32-2', unitId: 'unitDiv32', title: '나머지 없는 나눗셈 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['div32-no-rem'], reviewSkillIds: ['div32-tens'], problemCount: 8,
  },
  {
    id: 'd32-3', unitId: 'unitDiv32', title: '나머지 있는 나눗셈 협곡', type: 'lesson', emoji: '🏔️',
    skillIds: ['div32-rem'], reviewSkillIds: ['div32-no-rem'], problemCount: 8,
  },
  {
    id: 'd32-4', unitId: 'unitDiv32', title: '검산식 이야기 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['div32-verify', 'div32-word'], reviewSkillIds: ['div32-rem'], problemCount: 8,
  },
  {
    id: 'd32-boss', unitId: 'unitDiv32', title: '나머지 햄스터', type: 'boss', emoji: '🐹',
    skillIds: ['div32-tens', 'div32-no-rem', 'div32-rem', 'div32-verify', 'div32-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '나머지 햄스터', emoji: '🐹', hp: 10, image: 'assets/boss/hamster.png', taunt: '나머지를 빼먹으면 안 돼! 내가 꼭 찾아낸다!' },
  },

  // ── 3-2-3: 원 ──
  {
    id: 'c31-1', unitId: 'unitCircle3', title: '반지름 다리', type: 'lesson', emoji: '⭕',
    skillIds: ['circ3-rel'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'c31-2', unitId: 'unitCircle3', title: '원의 성질 정원', type: 'lesson', emoji: '🌷',
    skillIds: ['circ3-prop'], reviewSkillIds: ['circ3-rel'], problemCount: 8,
  },
  {
    id: 'c31-3', unitId: 'unitCircle3', title: '원 이어붙이기 미로', type: 'lesson', emoji: '🌀',
    skillIds: ['circ3-line', 'circ3-mixed-line'], reviewSkillIds: ['circ3-prop'], problemCount: 8,
  },
  {
    id: 'c31-4', unitId: 'unitCircle3', title: '원 이야기 마을', type: 'lesson', emoji: '🏘️',
    skillIds: ['circ3-word'], reviewSkillIds: ['circ3-line', 'circ3-mixed-line'], problemCount: 8,
  },
  {
    id: 'c31-boss', unitId: 'unitCircle3', title: '동그라미 물범', type: 'boss', emoji: '🦭',
    skillIds: ['circ3-rel', 'circ3-prop', 'circ3-line', 'circ3-mixed-line', 'circ3-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '동그라미 물범', emoji: '🦭', hp: 10, image: 'assets/boss/seal.png', taunt: '내 코끝에서 원을 몇 개나 굴릴 수 있을까?' },
  },

  // ── 3-2-4: 분수 ──
  {
    id: 'f32-1', unitId: 'unitFrac32', title: '분수 묶음 마을', type: 'lesson', emoji: '🍕',
    skillIds: ['frac32-of-whole'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'f32-2', unitId: 'unitFrac32', title: '분수 분류 광장', type: 'lesson', emoji: '📐',
    skillIds: ['frac32-classify'], reviewSkillIds: ['frac32-of-whole'], problemCount: 8,
  },
  {
    id: 'f32-3', unitId: 'unitFrac32', title: '변환의 다리', type: 'lesson', emoji: '🌉',
    skillIds: ['frac32-convert', 'frac32-cmp'], reviewSkillIds: ['frac32-classify'], problemCount: 8,
  },
  {
    id: 'f32-4', unitId: 'unitFrac32', title: '분수 이야기 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['frac32-word'], reviewSkillIds: ['frac32-convert', 'frac32-cmp'], problemCount: 8,
  },
  {
    id: 'f32-boss', unitId: 'unitFrac32', title: '가분수 캥거루', type: 'boss', emoji: '🦘',
    skillIds: ['frac32-of-whole', 'frac32-classify', 'frac32-convert', 'frac32-cmp', 'frac32-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '가분수 캥거루', emoji: '🦘', hp: 10, image: 'assets/boss/kangaroo.png', taunt: '내 주머니 속에 가분수가 몇 개인지 맞혀 봐!' },
  },

  // ── 3-2-5: 들이와 무게 ──
  {
    id: 'ms3-1', unitId: 'unitMeasure3', title: '들이 단위 광장', type: 'lesson', emoji: '💧',
    skillIds: ['meas3-liquid-conv'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'ms3-2', unitId: 'unitMeasure3', title: '무게 단위 들판', type: 'lesson', emoji: '⚖️',
    skillIds: ['meas3-weight-conv', 'meas3-unit-pick'], reviewSkillIds: ['meas3-liquid-conv'], problemCount: 8,
  },
  {
    id: 'ms3-3', unitId: 'unitMeasure3', title: '들이 계산 요새', type: 'lesson', emoji: '🏰',
    skillIds: ['meas3-liquid-add', 'meas3-liquid-sub'], reviewSkillIds: ['meas3-weight-conv'], problemCount: 8,
  },
  {
    id: 'ms3-4', unitId: 'unitMeasure3', title: '무게·이야기 마을', type: 'lesson', emoji: '🏘️',
    skillIds: ['meas3-weight-add', 'meas3-word'], reviewSkillIds: ['meas3-liquid-add', 'meas3-liquid-sub'], problemCount: 8,
  },
  {
    id: 'ms3-boss', unitId: 'unitMeasure3', title: '저울 곰', type: 'boss', emoji: '🐻',
    skillIds: ['meas3-liquid-conv', 'meas3-weight-conv', 'meas3-liquid-add', 'meas3-liquid-sub', 'meas3-weight-add', 'meas3-unit-pick', 'meas3-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '저울 곰', emoji: '🐻', hp: 10, image: 'assets/boss/bear3.png', taunt: '내 꿀단지의 무게를 정확하게 재 봐!' },
  },

  // ── 3-2-6: 자료의 정리 ──
  {
    id: 'dt3-1', unitId: 'unitData3', title: '표 읽기 마을', type: 'lesson', emoji: '📊',
    skillIds: ['data3-table-sum'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'dt3-2', unitId: 'unitData3', title: '차이 계산 광장', type: 'lesson', emoji: '📋',
    skillIds: ['data3-table-diff', 'data3-most-least'], reviewSkillIds: ['data3-table-sum'], problemCount: 8,
  },
  {
    id: 'dt3-3', unitId: 'unitData3', title: '그림그래프 정원', type: 'lesson', emoji: '🌷',
    skillIds: ['data3-picto-read', 'data3-picto-inv'], reviewSkillIds: ['data3-table-diff'], problemCount: 8,
  },
  {
    id: 'dt3-4', unitId: 'unitData3', title: '자료 이야기 숲', type: 'lesson', emoji: '🌲',
    skillIds: ['data3-word'], reviewSkillIds: ['data3-picto-read', 'data3-picto-inv', 'data3-most-least'], problemCount: 8,
  },
  {
    id: 'dt3-boss', unitId: 'unitData3', title: '그래프 앵무', type: 'boss', emoji: '🦜',
    skillIds: ['data3-table-sum', 'data3-table-diff', 'data3-picto-read', 'data3-picto-inv', 'data3-most-least', 'data3-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '그래프 앵무', emoji: '🦜', hp: 10, image: 'assets/boss/parrot.png', taunt: '내 그래프를 제대로 읽을 수 있겠어? 폴리 원해!' },
  },

  // ════════ 4학년 1학기 ════════
  // ── 4-1-1: 큰 수 ──
  {
    id: 'bn-1', unitId: 'unitBigNum', title: '만·억·조의 마을', type: 'lesson', emoji: '🏛️',
    skillIds: ['big-read', 'big-write'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'bn-2', unitId: 'unitBigNum', title: '자릿값 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['big-place', 'big-placevalue'], reviewSkillIds: ['big-read'], problemCount: 8,
  },
  {
    id: 'bn-3', unitId: 'unitBigNum', title: '뛰어 세기 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['big-skip', 'big-compare'], reviewSkillIds: ['big-placevalue'], problemCount: 8,
  },
  {
    id: 'bn-4', unitId: 'unitBigNum', title: '수의 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['big-word'], reviewSkillIds: ['big-skip', 'big-compare'], problemCount: 8,
  },
  {
    id: 'bn-boss', unitId: 'unitBigNum', title: '수의 콜로서스', type: 'boss', emoji: '🏛️',
    skillIds: ['big-read', 'big-write', 'big-place', 'big-placevalue', 'big-skip', 'big-compare', 'big-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '수의 콜로서스', emoji: '🏛️', hp: 10, image: 'assets/boss/colossus.png', taunt: '억·조 단위를 읽을 수 있겠느냐?' },
  },
  // ── 4-1-2: 각도 ──
  {
    id: 'ag-1', unitId: 'unitAngle', title: '각도 학교', type: 'lesson', emoji: '📐',
    skillIds: ['ang-classify', 'ang-add-sub'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'ag-2', unitId: 'unitAngle', title: '직선과 바퀴 광장', type: 'lesson', emoji: '🎡',
    skillIds: ['ang-line', 'ang-round'], reviewSkillIds: ['ang-classify'], problemCount: 8,
  },
  {
    id: 'ag-3', unitId: 'unitAngle', title: '도형 각도의 숲', type: 'lesson', emoji: '🌲',
    skillIds: ['ang-triangle', 'ang-quad'], reviewSkillIds: ['ang-line', 'ang-round'], problemCount: 8,
  },
  {
    id: 'ag-4', unitId: 'unitAngle', title: '각도 이야기 정원', type: 'lesson', emoji: '🌷',
    skillIds: ['ang-word'], reviewSkillIds: ['ang-triangle', 'ang-quad'], problemCount: 8,
  },
  {
    id: 'ag-boss', unitId: 'unitAngle', title: '각도 매', type: 'boss', emoji: '🦅',
    skillIds: ['ang-classify', 'ang-add-sub', 'ang-line', 'ang-round', 'ang-triangle', 'ang-quad', 'ang-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '각도 매', emoji: '🦅', hp: 10, image: 'assets/boss/hawk.png', taunt: '180°와 360°의 비밀을 풀 수 있겠나?' },
  },
  // ── 4-1-3: 곱셈과 나눗셈 ──
  {
    id: 'md-1', unitId: 'unitMulDiv', title: '몇십 곱셈 도장', type: 'lesson', emoji: '⚒️',
    skillIds: ['md4-mul-tens'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'md-2', unitId: 'unitMulDiv', title: '두 자리 곱셈 요새', type: 'lesson', emoji: '🏰',
    skillIds: ['md4-mul-two'], reviewSkillIds: ['md4-mul-tens'], problemCount: 8,
  },
  {
    id: 'md-3', unitId: 'unitMulDiv', title: '나눗셈 협곡', type: 'lesson', emoji: '🏔️',
    skillIds: ['md4-div-tens', 'md4-div-two'], reviewSkillIds: ['md4-mul-two'], problemCount: 8,
  },
  {
    id: 'md-4', unitId: 'unitMulDiv', title: '검산과 이야기 시장', type: 'lesson', emoji: '🎪',
    skillIds: ['md4-verify', 'md4-word'], reviewSkillIds: ['md4-div-two'], problemCount: 8,
  },
  {
    id: 'md-boss', unitId: 'unitMulDiv', title: '계산 황소', type: 'boss', emoji: '🐂',
    skillIds: ['md4-mul-tens', 'md4-mul-two', 'md4-div-tens', 'md4-div-two', 'md4-verify', 'md4-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '계산 황소', emoji: '🐂', hp: 10, image: 'assets/boss/ox.png', taunt: '나눗셈 검산으로 나를 막아 보렴!' },
  },
  // ── 4-1-4: 평면도형의 이동 ──
  {
    id: 'mv-1', unitId: 'unitMove', title: '돌리기 연습장', type: 'lesson', emoji: '🌀',
    skillIds: ['move-rotate-deg', 'move-rotate-back'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'mv-2', unitId: 'unitMove', title: '뒤집기 거울방', type: 'lesson', emoji: '🪞',
    skillIds: ['move-flip-twice', 'move-method-choice'], reviewSkillIds: ['move-rotate-deg'], problemCount: 8,
  },
  {
    id: 'mv-3', unitId: 'unitMove', title: '디지털 돌리기 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['move-digital-180'], reviewSkillIds: ['move-flip-twice'], problemCount: 8,
  },
  {
    id: 'mv-4', unitId: 'unitMove', title: '이동 이야기 광장', type: 'lesson', emoji: '🌟',
    skillIds: ['move-word'], reviewSkillIds: ['move-digital-180', 'move-rotate-back'], problemCount: 8,
  },
  {
    id: 'mv-boss', unitId: 'unitMove', title: '거울 나비', type: 'boss', emoji: '🦋',
    skillIds: ['move-rotate-deg', 'move-rotate-back', 'move-flip-twice', 'move-digital-180', 'move-method-choice', 'move-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '거울 나비', emoji: '🦋', hp: 10, image: 'assets/boss/butterfly.png', taunt: '날갯짓 한 번에 세상이 뒤집힌다!' },
  },
  // ── 4-1-5: 막대그래프 ──
  {
    id: 'bg-1', unitId: 'unitBarGraph', title: '자료 읽기 들판', type: 'lesson', emoji: '📊',
    skillIds: ['bar-most'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'bg-2', unitId: 'unitBarGraph', title: '비교의 다리', type: 'lesson', emoji: '🌉',
    skillIds: ['bar-diff', 'bar-total'], reviewSkillIds: ['bar-most'], problemCount: 8,
  },
  {
    id: 'bg-3', unitId: 'unitBarGraph', title: '눈금의 정원', type: 'lesson', emoji: '🌷',
    skillIds: ['bar-scale'], reviewSkillIds: ['bar-diff'], problemCount: 8,
  },
  {
    id: 'bg-4', unitId: 'unitBarGraph', title: '그래프 이야기 마을', type: 'lesson', emoji: '🏘️',
    skillIds: ['bar-word'], reviewSkillIds: ['bar-total', 'bar-scale'], problemCount: 8,
  },
  {
    id: 'bg-boss', unitId: 'unitBarGraph', title: '그래프 펭귄', type: 'boss', emoji: '🐧',
    skillIds: ['bar-most', 'bar-diff', 'bar-total', 'bar-scale', 'bar-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '그래프 펭귄', emoji: '🐧', hp: 10, image: 'assets/boss/penguin.png', taunt: '내 자료를 제대로 읽을 수 있겠어?' },
  },
  // ── 4-1-6: 규칙 찾기 ──
  {
    id: 'fr-1', unitId: 'unitFindRule', title: '수 배열의 오솔길', type: 'lesson', emoji: '🍂',
    skillIds: ['rule-next-term'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'fr-2', unitId: 'unitFindRule', title: '계산식 패턴 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['rule-formula-nth'], reviewSkillIds: ['rule-next-term'], problemCount: 8,
  },
  {
    id: 'fr-3', unitId: 'unitFindRule', title: '도형 배열 광장', type: 'lesson', emoji: '🔷',
    skillIds: ['rule-shape-count', 'rule-inverse'], reviewSkillIds: ['rule-formula-nth'], problemCount: 8,
  },
  {
    id: 'fr-4', unitId: 'unitFindRule', title: '규칙 이야기 미궁', type: 'lesson', emoji: '📜',
    skillIds: ['rule-word'], reviewSkillIds: ['rule-shape-count', 'rule-inverse'], problemCount: 8,
  },
  {
    id: 'fr-boss', unitId: 'unitFindRule', title: '규칙 스핑크스', type: 'boss', emoji: '🐈',
    skillIds: ['rule-next-term', 'rule-formula-nth', 'rule-shape-count', 'rule-inverse', 'rule-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '규칙 스핑크스', emoji: '🐈', hp: 10, image: 'assets/boss/sphinx.png', taunt: '내 수수께끼 규칙을 풀 수 있겠느냐?' },
  },

  // ════════ 4학년 2학기 (전반) ════════
  // ── 4-2-1: 분수의 덧셈과 뺄셈 ──
  {
    id: 'f4-1', unitId: 'unitFracAS4', title: '분수 덧셈 광장', type: 'lesson', emoji: '🌼',
    skillIds: ['f4-add-proper-lt1', 'f4-add-proper-ge1'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'f4-2', unitId: 'unitFracAS4', title: '분수 뺄셈 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['f4-sub-proper', 'f4-nat-sub-frac'], reviewSkillIds: ['f4-add-proper-lt1'], problemCount: 8,
  },
  {
    id: 'f4-3', unitId: 'unitFracAS4', title: '대분수 화산', type: 'lesson', emoji: '🌋',
    skillIds: ['f4-add-mixed', 'f4-sub-mixed'], reviewSkillIds: ['f4-sub-proper'], problemCount: 8,
  },
  {
    id: 'f4-4', unitId: 'unitFracAS4', title: '분수 이야기 마을', type: 'lesson', emoji: '🏘️',
    skillIds: ['f4-word'], reviewSkillIds: ['f4-add-mixed', 'f4-sub-mixed'], problemCount: 8,
  },
  {
    id: 'f4-boss', unitId: 'unitFracAS4', title: '분수 토끼', type: 'boss', emoji: '🐰',
    skillIds: ['f4-add-proper-lt1', 'f4-add-proper-ge1', 'f4-sub-proper', 'f4-add-mixed', 'f4-sub-mixed', 'f4-nat-sub-frac', 'f4-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '분수 토끼', emoji: '🐰', hp: 10, image: 'assets/boss/rabbit.png', taunt: '동분모 분수는 껌이지! 받아내림이 두렵지 않으니?' },
  },
  // ── 4-2-2: 삼각형 ──
  {
    id: 'tr-1', unitId: 'unitTriangle', title: '이등변삼각형 언덕', type: 'lesson', emoji: '🔺',
    skillIds: ['tri-isosceles-apex', 'tri-isosceles-base'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'tr-2', unitId: 'unitTriangle', title: '정삼각형 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['tri-equilateral', 'tri-perimeter-inv'], reviewSkillIds: ['tri-isosceles-apex'], problemCount: 8,
  },
  {
    id: 'tr-3', unitId: 'unitTriangle', title: '삼각형 분류 광장', type: 'lesson', emoji: '📐',
    skillIds: ['tri-classify'], reviewSkillIds: ['tri-equilateral'], problemCount: 8,
  },
  {
    id: 'tr-4', unitId: 'unitTriangle', title: '삼각형 이야기 숲', type: 'lesson', emoji: '🌲',
    skillIds: ['tri-word'], reviewSkillIds: ['tri-classify', 'tri-perimeter-inv'], problemCount: 8,
  },
  {
    id: 'tr-boss', unitId: 'unitTriangle', title: '삼각 공작', type: 'boss', emoji: '🦚',
    skillIds: ['tri-isosceles-apex', 'tri-isosceles-base', 'tri-equilateral', 'tri-classify', 'tri-perimeter-inv', 'tri-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '삼각 공작', emoji: '🦚', hp: 10, image: 'assets/boss/peacock-tri.png', taunt: '내 꼬리 깃털은 완벽한 이등변삼각형! 각도를 맞춰 봐!' },
  },
  // ── 4-2-3: 소수의 덧셈과 뺄셈 ──
  {
    id: 'da-1', unitId: 'unitDecAS', title: '소수 자릿값 광장', type: 'lesson', emoji: '🔢',
    skillIds: ['dec4-placevalue', 'dec4-compare'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'da-2', unitId: 'unitDecAS', title: '소수 덧셈 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['dec4-add'], reviewSkillIds: ['dec4-placevalue'], problemCount: 8,
  },
  {
    id: 'da-3', unitId: 'unitDecAS', title: '소수 뺄셈 협곡', type: 'lesson', emoji: '🏔️',
    skillIds: ['dec4-sub', 'dec4-scale'], reviewSkillIds: ['dec4-add'], problemCount: 8,
  },
  {
    id: 'da-4', unitId: 'unitDecAS', title: '소수 이야기 시장', type: 'lesson', emoji: '🎪',
    skillIds: ['dec4-word'], reviewSkillIds: ['dec4-sub', 'dec4-scale'], problemCount: 8,
  },
  {
    id: 'da-boss', unitId: 'unitDecAS', title: '소수점 수달', type: 'boss', emoji: '🦦',
    skillIds: ['dec4-placevalue', 'dec4-compare', 'dec4-add', 'dec4-sub', 'dec4-scale', 'dec4-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '소수점 수달', emoji: '🦦', hp: 10, image: 'assets/boss/otter.png', taunt: '소수점을 슬쩍 옮기면 아무도 모르겠지?' },
  },

  // ── 4-2-4: 사각형 ──
  {
    id: 'qd-1', unitId: 'unitQuad', title: '평행사변형 각도 요새', type: 'lesson', emoji: '📐',
    skillIds: ['quad-para-angle'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'qd-2', unitId: 'unitQuad', title: '변의 길이 들판', type: 'lesson', emoji: '🌾',
    skillIds: ['quad-para-side', 'quad-rhombus'], reviewSkillIds: ['quad-para-angle'], problemCount: 8,
  },
  {
    id: 'qd-3', unitId: 'unitQuad', title: '사각형 분류 광장', type: 'lesson', emoji: '🔷',
    skillIds: ['quad-classify'], reviewSkillIds: ['quad-rhombus'], problemCount: 8,
  },
  {
    id: 'qd-4', unitId: 'unitQuad', title: '사각형 이야기 마을', type: 'lesson', emoji: '🏘️',
    skillIds: ['quad-word'], reviewSkillIds: ['quad-para-side', 'quad-classify'], problemCount: 8,
  },
  {
    id: 'qd-boss', unitId: 'unitQuad', title: '사각 두더지', type: 'boss', emoji: '🦔',
    skillIds: ['quad-para-angle', 'quad-para-side', 'quad-rhombus', 'quad-classify', 'quad-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '사각 두더지', emoji: '🦔', hp: 10, image: 'assets/boss/mole.png', taunt: '내 굴은 완벽한 평행사변형이야! 각도를 맞혀 봐!' },
  },

  // ── 4-2-5: 꺾은선그래프 ──
  {
    id: 'lg-1', unitId: 'unitLineGraph', title: '변화 구간 탐색', type: 'lesson', emoji: '📈',
    skillIds: ['line-max-change'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'lg-2', unitId: 'unitLineGraph', title: '두 시점 비교의 다리', type: 'lesson', emoji: '🌉',
    skillIds: ['line-two-diff', 'line-total'], reviewSkillIds: ['line-max-change'], problemCount: 8,
  },
  {
    id: 'lg-3', unitId: 'unitLineGraph', title: '눈금 비밀 정원', type: 'lesson', emoji: '🌷',
    skillIds: ['line-scale'], reviewSkillIds: ['line-two-diff'], problemCount: 8,
  },
  {
    id: 'lg-4', unitId: 'unitLineGraph', title: '꺾은선 이야기 탑', type: 'lesson', emoji: '🗼',
    skillIds: ['line-word'], reviewSkillIds: ['line-total', 'line-scale'], problemCount: 8,
  },
  {
    id: 'lg-boss', unitId: 'unitLineGraph', title: '꺾은선 학', type: 'boss', emoji: '🦢',
    skillIds: ['line-max-change', 'line-two-diff', 'line-total', 'line-scale', 'line-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '꺾은선 학', emoji: '🦢', hp: 10, image: 'assets/boss/crane.png', taunt: '내 날갯짓의 변화량을 읽을 수 있겠어?' },
  },

  // ── 4-2-6: 다각형 ──
  {
    id: 'pg-1', unitId: 'unitPolygon', title: '정다각형 둘레 광장', type: 'lesson', emoji: '🔶',
    skillIds: ['pgon-perimeter', 'pgon-side-inv'], reviewSkillIds: [], problemCount: 8,
  },
  {
    id: 'pg-2', unitId: 'unitPolygon', title: '대각선의 숲', type: 'lesson', emoji: '🌲',
    skillIds: ['pgon-diagonal', 'pgon-name'], reviewSkillIds: ['pgon-perimeter'], problemCount: 8,
  },
  {
    id: 'pg-3', unitId: 'unitPolygon', title: '다각형 이야기 미궁', type: 'lesson', emoji: '📜',
    skillIds: ['pgon-word'], reviewSkillIds: ['pgon-diagonal', 'pgon-side-inv'], problemCount: 8,
  },
  {
    id: 'pg-boss', unitId: 'unitPolygon', title: '다각형 공작', type: 'boss', emoji: '🦚',
    skillIds: ['pgon-perimeter', 'pgon-side-inv', 'pgon-diagonal', 'pgon-name', 'pgon-word'],
    reviewSkillIds: [], problemCount: 10,
    boss: { name: '다각형 공작', emoji: '🦚', hp: 10, image: 'assets/boss/peacock.png', taunt: '내 꼬리 깃털의 다각형 개수를 맞혀 봐!' },
  },

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

// ── 심화 탐험 (선택 트랙): 단원마다 1개, 10문제 중 8개 이상 맞히면 클리어 + 보물 카드 ──
// skillIds는 비워두고 런타임에 해당 단원의 challenge 스킬로 채운다 (lesson.ts)
const ALL_UNIT_IDS = [...new Set(STAGES.map((s) => s.unitId))];
export const CHALLENGE_STAGES: StageDef[] = ALL_UNIT_IDS.map((unitId) => ({
  id: `ch-${unitId}`,
  unitId,
  title: '심화 탐험 (선택)',
  type: 'challenge',
  emoji: '🌌',
  skillIds: [],
  reviewSkillIds: [],
  problemCount: 10,
}));
STAGES.push(...CHALLENGE_STAGES);

/** 심화 클리어 기준: 10문제 중 8개 이상 */
export const CHALLENGE_PASS = 8;

/** 학기별 단원 구성 (2022 개정교육과정) — 유닛맵 탭 */
export interface SemesterDef {
  id: string;
  label: string;
  emoji: string;
  units: string[];
}

export const SEMESTERS: SemesterDef[] = [
  {
    id: 'g1s1', label: '1학년 1학기', emoji: '🌷',
    units: ['unitNum9', 'unitShape1', 'unitAddSub1', 'unitCompare1', 'unitNum50'],
  },
  {
    id: 'g1s2', label: '1학년 2학기', emoji: '⭐',
    units: ['unitNum100', 'unitAS12a', 'unitShape12', 'unitAS12b', 'unitClock1', 'unitAS12c'],
  },
  {
    id: 'g2s1', label: '2학년 1학기', emoji: '🌈',
    units: ['unitNum3d', 'unitFigure2', 'unitAddSub2', 'unitLength2', 'unitClassify', 'unitMulIntro'],
  },
  {
    id: 'g2s2', label: '2학년 2학기', emoji: '🎈',
    units: ['unitNum4d', 'unitGugu', 'unitLength22', 'unitTime2', 'unitTableGraph', 'unitRule2'],
  },
  {
    id: 'g3s1', label: '3학년 1학기', emoji: '🐣',
    units: ['unitAdd3', 'unitPlane3', 'unitDiv3', 'unitMul31', 'unitTime3', 'unitFrac3'],
  },
  {
    id: 'g3s2', label: '3학년 2학기', emoji: '🍄',
    units: ['unitMul32', 'unitDiv32', 'unitCircle3', 'unitFrac32', 'unitMeasure3', 'unitData3'],
  },
  {
    id: 'g4s1', label: '4학년 1학기', emoji: '🌼',
    units: ['unitBigNum', 'unitAngle', 'unitMulDiv', 'unitMove', 'unitBarGraph', 'unitFindRule'],
  },
  {
    id: 'g4s2', label: '4학년 2학기', emoji: '🍂',
    units: ['unitFracAS4', 'unitTriangle', 'unitDecAS', 'unitQuad', 'unitLineGraph', 'unitPolygon'],
  },
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
  unitNum9: '1. 9까지의 수',
  unitShape1: '2. 여러 가지 모양',
  unitAddSub1: '3. 덧셈과 뺄셈',
  unitCompare1: '4. 비교하기',
  unitNum50: '5. 50까지의 수',
  unitNum100: '1. 100까지의 수',
  unitAS12a: '2. 덧셈과 뺄셈(1)',
  unitShape12: '3. 여러 가지 모양',
  unitAS12b: '4. 덧셈과 뺄셈(2)',
  unitClock1: '5. 시계 보기와 규칙 찾기',
  unitAS12c: '6. 덧셈과 뺄셈(3)',
  unitNum3d: '1. 세 자리 수',
  unitFigure2: '2. 여러 가지 도형',
  unitAddSub2: '3. 덧셈과 뺄셈',
  unitLength2: '4. 길이 재기',
  unitClassify: '5. 분류하기',
  unitMulIntro: '6. 곱셈',
  unitNum4d: '1. 네 자리 수',
  unitGugu: '2. 곱셈구구',
  unitLength22: '3. 길이 재기',
  unitTime2: '4. 시각과 시간',
  unitTableGraph: '5. 표와 그래프',
  unitRule2: '6. 규칙 찾기',
  unitAdd3: '1. 덧셈과 뺄셈',
  unitPlane3: '2. 평면도형',
  unitDiv3: '3. 나눗셈',
  unitMul31: '4. 곱셈',
  unitTime3: '5. 길이와 시간',
  unitFrac3: '6. 분수와 소수',
  unitMul32: '1. 곱셈',
  unitDiv32: '2. 나눗셈',
  unitCircle3: '3. 원',
  unitFrac32: '4. 분수',
  unitMeasure3: '5. 들이와 무게',
  unitData3: '6. 자료의 정리',
  unitBigNum: '1. 큰 수',
  unitAngle: '2. 각도',
  unitFracAS4: '1. 분수의 덧셈과 뺄셈',
  unitTriangle: '2. 삼각형',
  unitDecAS: '3. 소수의 덧셈과 뺄셈',
  unitQuad: '4. 사각형',
  unitLineGraph: '5. 꺾은선그래프',
  unitPolygon: '6. 다각형',
  unitMulDiv: '3. 곱셈과 나눗셈',
  unitMove: '4. 평면도형의 이동',
  unitBarGraph: '5. 막대그래프',
  unitFindRule: '6. 규칙 찾기',
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
