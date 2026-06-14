/**
 * 단원: 평면도형의 이동 (2022 개정교육과정 4-1 4단원)
 * 성취기준: 평면도형을 밀기·뒤집기·돌리기 하여 이동한 결과를 이해한다.
 * 그림 없이 텍스트로 성립하는 유형만 출제.
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import { buildChoices } from '../choices';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });
const txc = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 1. move-rotate-deg  돌리기 누적 → 총 각도 (fill-blanks)  난이도 1 ─
/**
 * 시계 방향 90°를 n번 돌리면 몇 도 돌린 것인지 구하기.
 * n: 1~8, 답: n×90. minVariety 낮게 설정 (n=1..8 → 8가지).
 */
const moveRotateDeg: SkillDef = {
  id: 'move-rotate-deg',
  unitId: 'unitMove',
  difficulty: 1,
  title: '돌리기 총 각도',
  note: '시계 방향 90°×n번이 몇 도인지. fill-blanks. 답은 90~720.',
  minVariety: 8,
  generate(seed) {
    const rng = new RNG(seed);
    const n = rng.int(1, 8);
    const answer = n * 90;

    const expr: MathExpr = [
      txt(`시계 방향으로 90°씩 ${n}번 돌리면 모두 `),
      { kind: 'blank', slot: 0 },
      txt('° 돌린 것입니다.'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `도형을 시계 방향으로 90°씩 ${n}번 돌렸습니다. 모두 몇 도 돌린 것인가요?`,
      expr,
      blankAnswers: [answer],
      explanation: [txt(`90° × ${n} = ${answer}°`)],
    };
  },
};

// ── 2. move-rotate-back  원위치 돌리기 횟수 (fill-blanks)  난이도 2 ───
/**
 * 시계 방향 90°씩 돌려서 처음 모양으로 돌아오려면 몇 번?
 * 답은 항상 4. 단, 먼저 몇 번 돌린 상태인지 제시하여 나머지 횟수를 구함.
 * 시작 횟수 s(1~3) → 추가 횟수 = 4 - s.
 */
const moveRotateBack: SkillDef = {
  id: 'move-rotate-back',
  unitId: 'unitMove',
  difficulty: 2,
  title: '원위치로 돌아오는 횟수',
  note: '시계 방향 90°씩 돌려 원위치로 돌아오는 추가 횟수. fill-blanks. 답 1~3.',
  minVariety: 3,
  generate(seed) {
    const rng = new RNG(seed);
    const done = rng.int(1, 3); // 이미 돌린 횟수
    const answer = 4 - done;

    const expr: MathExpr = [
      txt('앞으로 몇 번 더 돌려야 하나요? '),
      { kind: 'blank', slot: 0 },
      txt('번'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `도형을 시계 방향으로 90°씩 ${done}번 돌렸습니다. 처음 모양으로 돌아오려면 앞으로 몇 번 더 돌려야 하나요?`,
      expr,
      blankAnswers: [answer],
      explanation: [
        txt(`90°씩 4번 = 360°이면 원위치로 돌아와요.`),
        txt(`이미 ${done}번 돌렸으므로 ${4} - ${done} = ${answer}번 더 돌리면 됩니다.`),
      ],
    };
  },
};

// ── 3. move-flip-twice  뒤집기 2번 결과 (choice)  난이도 1 ─────────────
/**
 * 도형을 같은 축(가로/세로)으로 2번 뒤집으면 처음 모양으로 돌아옴.
 * 다른 축으로 뒤집으면 대각선 180° 회전과 동일.
 * 4지선다로 결과를 고름.
 */
const moveFlipTwice: SkillDef = {
  id: 'move-flip-twice',
  unitId: 'unitMove',
  difficulty: 1,
  title: '뒤집기 2번 결과',
  note: '같은 방향/다른 방향으로 2번 뒤집기 결과. 4지선다.',
  minVariety: 4,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    let prompt: string;
    let answer: string;
    const wrongOpts: string[] = [];

    if (pat === 0) {
      // 같은 방향 2번 → 처음 모양으로 돌아옴
      const dir = rng.pick(['왼쪽', '오른쪽'] as const);
      prompt = `도형을 ${nj(dir, '으로/로')} 뒤집기를 2번 하면 어떻게 되나요?`;
      answer = '처음 모양과 같아집니다.';
      wrongOpts.push(
        '위아래가 뒤집어진 모양이 됩니다.',
        '좌우가 뒤집어진 모양이 됩니다.',
        '180° 돌린 모양이 됩니다.',
      );
    } else {
      // 가로·세로 각 1번 → 180° 돌린 것과 같음
      const dirs = ['위', '오른쪽'] as const;
      const d1 = rng.pick(dirs);
      const d2 = d1 === '위' ? '오른쪽' : '위';
      prompt = `도형을 ${nj(d1, '으로/로')} 뒤집기 1번, ${nj(d2, '으로/로')} 뒤집기 1번을 하면 어떻게 되나요?`;
      answer = '180° 돌린 모양과 같아집니다.';
      wrongOpts.push(
        '처음 모양과 같아집니다.',
        '좌우만 뒤집어진 모양이 됩니다.',
        '위아래만 뒤집어진 모양이 됩니다.',
      );
    }

    const answerVal = txc(answer);
    const candidates = wrongOpts.map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt,
      choices,
      answerIndex,
      explanation: [
        txt(pat === 0
          ? '같은 방향으로 2번 뒤집으면 처음 모양으로 돌아와요.'
          : '서로 다른 방향으로 각 1번씩 뒤집으면 180° 돌린 모양과 같아져요.'),
      ],
    };
  },
};

// ── 4. move-digital-180  디지털 숫자 180° 돌리기 (fill-blanks)  난이도 2 ─
/**
 * 0,1,2,5,6,8,9를 180° 돌리면: 0→0, 1→1, 2→2, 5→5, 6→9, 8→8, 9→6.
 * 두~세 자리 수를 뒤집어 읽을 때 생기는 새 수.
 * 자릿수 역전 + 각 숫자 변환.
 */
const moveDigital180: SkillDef = {
  id: 'move-digital-180',
  unitId: 'unitMove',
  difficulty: 2,
  title: '디지털 숫자 180° 돌리기',
  note: '0/1/2/5/6/8/9로 만든 두~세 자리 수를 180° 돌렸을 때의 수. fill-blanks.',
  generate(seed) {
    const rng = new RNG(seed);
    // 180° 돌릴 수 있는 숫자
    const okDigits = [0, 1, 2, 5, 6, 8, 9] as const;
    const rotate180: Record<number, number> = { 0: 0, 1: 1, 2: 2, 5: 5, 6: 9, 8: 8, 9: 6 };

    // 두~세 자리 수 생성 (첫 자리 0 금지, 결과 첫 자리 0 금지)
    let digits: number[] = [];
    let answer = 0;
    digits = [1]; answer = 0; // 폴백
    for (let tries = 0; tries < 200; tries++) {
      const len = rng.int(2, 3);
      const td: number[] = [];
      // 첫 자리: 0 제외
      td.push(rng.pick([1, 2, 5, 6, 8, 9] as const));
      for (let i = 1; i < len; i++) {
        td.push(rng.pick(okDigits));
      }
      // 180° 뒤집기: 자릿수 역전 + 각 숫자 변환
      const rotated = [...td].reverse().map(d => rotate180[d]);
      if (rotated[0] === 0) continue; // 결과 첫 자리 0 금지
      const original = parseInt(td.join(''), 10);
      const result = parseInt(rotated.join(''), 10);
      if (result !== original) { // 자명하게 같은 수는 제외 (너무 쉬움)
        digits = td;
        answer = result;
        break;
      }
    }

    const originalNum = parseInt(digits.join(''), 10);

    const expr: MathExpr = [
      txt(`${nj(originalNum, '을/를')} 180° 돌리면 `),
      { kind: 'blank', slot: 0 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `디지털 시계처럼 생긴 수 ${nj(originalNum, '을/를')} 180° 돌리면 어떤 수가 되나요?`,
      expr,
      blankAnswers: [answer],
      explanation: [
        txt(`${originalNum}의 각 숫자를 180° 돌리고 순서를 뒤집으면:`),
        txt(`${digits.join('')} → 뒤집기 → ${[...digits].reverse().join('')} → 각 숫자 변환 → ${answer}`),
      ],
    };
  },
};

// ── 5. move-method-choice  이동 방법 설명 고르기 (choice)  난이도 1 ────
/**
 * 이동 방법(밀기·뒤집기·돌리기) 설명 문장을 보고 올바른 이동 방법을 고름.
 */
const moveMoveMethod: SkillDef = {
  id: 'move-method-choice',
  unitId: 'unitMove',
  difficulty: 1,
  title: '이동 방법 고르기',
  note: '밀기·뒤집기·돌리기 설명을 보고 해당 이동 방법을 고름. 4지선다.',
  minVariety: 10,
  generate(seed) {
    const rng = new RNG(seed);

    const descriptions = [
      { method: '밀기', desc: '도형을 모양 그대로 한 방향으로 옮기는 것' },
      { method: '밀기', desc: '도형의 모양과 크기가 변하지 않고 위치만 바뀌는 것' },
      { method: '밀기', desc: '도형을 위로 밀어서 옮겼을 때 모양은 그대로인 것' },
      { method: '뒤집기', desc: '도형을 거울에 비친 것처럼 뒤집는 것' },
      { method: '뒤집기', desc: '기준선을 중심으로 도형을 대칭 이동하는 것' },
      { method: '뒤집기', desc: '도형의 왼쪽과 오른쪽이 서로 바뀌는 것' },
      { method: '돌리기', desc: '도형을 일정한 각도만큼 회전시키는 것' },
      { method: '돌리기', desc: '한 점을 중심으로 도형을 시계 방향으로 90° 움직이는 것' },
      { method: '돌리기', desc: '도형을 360° 돌리면 처음 모양으로 돌아오는 것' },
    ];

    const chosen = rng.pick(descriptions);
    const answer = chosen.method;

    const allMethods = ['밀기', '뒤집기', '돌리기', '늘리기'];
    const answerVal = txc(answer);
    const candidates = allMethods.filter(m => m !== answer).map(txc);
    const { choices, answerIndex } = buildChoices(answerVal, candidates, rng);

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `다음 설명에 해당하는 이동 방법을 고르세요.\n"${chosen.desc}"`,
      choices,
      answerIndex,
      explanation: [txt(`"${chosen.desc}"는 ${answer}에 대한 설명이에요.`)],
    };
  },
};

// ── 6. move-word  문장제 (fill-blanks)  난이도 3 ──────────────────────
const moveWord: SkillDef = {
  id: 'move-word',
  unitId: 'unitMove',
  difficulty: 3,
  word: true,
  title: '평면도형의 이동 문장제',
  note: '돌리기·뒤집기를 활용한 모험/판타지 소재 문장제.',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    // 패턴 6종으로 다양성 확보
    const pat = rng.int(0, 5);

    let prompt: string;
    let answer: number;
    let explanation: MathExpr;

    const subjects = ['마법사 루나', '탐험가 카이', '요정 피아', '마법 기사 레온', '마법 학생 아리'] as const;
    const subject = rng.pick(subjects);

    if (pat === 0) {
      // 총 돌린 각도 계산 (n=2..8)
      const n = rng.int(2, 8);
      answer = n * 90;
      prompt = `${nj(subject, '은/는')} 마법 거울을 시계 방향으로 90°씩 ${n}번 돌렸습니다. 마법 거울은 모두 몇 도 돌아간 건가요?`;
      explanation = [txt(`90° × ${n} = ${answer}°`)];
    } else if (pat === 1) {
      // 총 각도가 주어졌을 때 횟수 구하기
      const n = rng.int(2, 8);
      const totalDeg = n * 90;
      answer = n;
      prompt = `${nj(subject, '은/는')} 보물 상자 뚜껑을 시계 방향으로 90°씩 돌려 ${totalDeg}° 돌렸습니다. 뚜껑을 몇 번 돌린 건가요?`;
      explanation = [txt(`${totalDeg}° ÷ 90° = ${answer}번`)];
    } else if (pat === 2) {
      // 원위치까지 남은 횟수 (done=1..3)
      const done = rng.int(1, 3);
      answer = 4 - done;
      prompt = `${nj(subject, '은/는')} 마법 자물쇠를 시계 방향으로 90°씩 ${done}번 돌렸습니다. 처음 모양으로 되돌리려면 같은 방향으로 몇 번 더 돌려야 하나요?`;
      explanation = [txt(`4번 돌리면 360°로 원위치. ${4} - ${done} = ${answer}번`)];
    } else if (pat === 3) {
      // 디지털 숫자 돌리기 → 두 수 합 (더 넓은 조합)
      const singleDigits = [1, 2, 5, 6, 8, 9] as const;
      const a = rng.pick(singleDigits);
      const b = rng.pick(singleDigits);
      const flipMap: Record<number, number> = { 1: 1, 2: 2, 5: 5, 6: 9, 8: 8, 9: 6 };
      const fa = flipMap[a];
      const fb = flipMap[b];
      answer = fa + fb;
      prompt = `디지털 시계에 ${nj(a, '과/와')} ${nj(b, '이/가')} 표시되어 있습니다. 두 수를 각각 180° 돌리면 어떤 수가 되는지 구하고, 그 두 수의 합을 구하세요.`;
      explanation = [
        txt(`${a} → 180° 돌리면 → ${fa}`),
        txt(`${b} → 180° 돌리면 → ${fb}`),
        txt(`${fa} + ${fb} = ${answer}`),
      ];
    } else if (pat === 4) {
      // 뒤집기: 같은 방향으로 몇 번 뒤집어야 처음 모양으로 돌아오는가 → 2번
      answer = 2;
      prompt = `${nj(subject, '은/는')} 나뭇잎 도형을 같은 방향으로 뒤집고 있습니다. 처음 모양으로 돌아오려면 적어도 몇 번 뒤집어야 하나요?`;
      explanation = [
        txt(`한 번 뒤집으면 거울에 비친 듯 좌우(또는 위아래)가 바뀌어요.`),
        txt(`같은 방향으로 한 번 더, 모두 2번 뒤집으면 처음 모양으로 돌아옵니다.`),
      ];
    } else {
      // 여러 번 돌린 뒤 결과 각도 (누적 계산)
      const n1 = rng.int(1, 4);
      const n2 = rng.int(1, 4);
      answer = (n1 + n2) * 90;
      prompt = `${nj(subject, '은/는')} 마법 나침반을 먼저 시계 방향으로 90°씩 ${n1}번, 그다음 90°씩 ${n2}번 돌렸습니다. 나침반은 모두 몇 도 돌아간 건가요?`;
      explanation = [txt(`(${n1} + ${n2}) × 90° = ${n1 + n2} × 90° = ${answer}°`)];
    }

    const expr: MathExpr = [txt('답: '), { kind: 'blank', slot: 0 }];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── Export ──────────────────────────────────────────────────────────
export const unitMoveSkills: SkillDef[] = [
  moveRotateDeg,
  moveRotateBack,
  moveFlipTwice,
  moveDigital180,
  moveMoveMethod,
  moveWord,
];
