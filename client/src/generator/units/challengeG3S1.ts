/**
 * 3-1 심화 문제 생성기 (challenge: true, difficulty: 3)
 * 명세: docs/challenge/g3s1.md
 */

import { RNG } from '../rng';
import { ida, nj } from '../josa';
import { gcd } from '../fraction';
import type { MathExpr, MathToken, Problem, SkillDef } from '../types';

// ── 공통 토큰 헬퍼 ──────────────────────────────────────────
const txt = (t: string): MathToken => ({ kind: 'text', text: t });
const blank = (slot: number): MathToken => ({ kind: 'blank', slot });

// ═══════════════════════════════════════════════════════════════
//  unitAdd3 — 덧셈과 뺄셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch31-vertical3  세 자리 세로셈 빈칸 복원
 * 완전식 생성 후 서로 다른 자리 2칸을 ㉠·㉡로 가림
 * fill-blanks 2칸(각 1~9)
 */
const chVertical3: SkillDef = {
  id: 'ch31-vertical3',
  unitId: 'unitAdd3',
  title: '세 자리 식 빈칸 복원',
  note: 'x+y=z 구조로 환원, 두 더해지는 수에서 서로 다른 자리 1칸씩 ㉠·㉡ 가림(유일해)',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    /** 세 자리 수의 한 자리(0=일,1=십,2=백)를 기호로 가린 문자열 */
    const maskDigit = (num: number, pos: number, sym: string): string => {
      const ds = [Math.floor(num / 100), Math.floor(num / 10) % 10, num % 10]; // 백,십,일
      const idx = 2 - pos; // pos 0(일)→idx2
      return ds.map((d, i) => (i === idx ? sym : String(d))).join('');
    };
    const digitAt = (num: number, pos: number) =>
      pos === 0 ? num % 10 : pos === 1 ? Math.floor(num / 10) % 10 : Math.floor(num / 100);

    // 폴백: 456 + 237 = 693, ㉠=a의 십(5), ㉡=b의 일(7)
    let isAdd = true, shown = 693, x = 456, y = 237;
    let posX = 1, posY = 0, ans0 = 5, ans1 = 7;

    for (let tries = 0; tries < 2000; tries++) {
      const add = rng.chance(0.5);
      // x + y = z(=shown) 구조로 통일. 덧셈: x=a,y=b,shown=합. 뺄셈 a−b=c: x=b,y=c,shown=a.
      let x2: number, y2: number, shown2: number;
      if (add) {
        x2 = rng.int(102, 897);
        y2 = rng.int(102, 999 - x2);
        if (y2 < 102) continue;
        shown2 = x2 + y2;
      } else {
        // a − b = c  →  b + c = a (= shown)
        const b2 = rng.int(102, 800);
        const c2 = rng.int(102, 999 - b2);
        if (c2 < 102) continue;
        x2 = b2; y2 = c2; shown2 = b2 + c2; // shown = a (피감수)
      }
      if (shown2 > 999 || shown2 < 100) continue;

      // 서로 다른 자리 1칸씩 가림 (유일해 보장: 두 가린 자리의 자릿값이 다름)
      const pX = rng.int(0, 2);
      let pY = rng.int(0, 2);
      if (pY === pX) pY = (pY + 1) % 3;
      const dX = digitAt(x2, pX);
      const dY = digitAt(y2, pY);
      if (dX < 1 || dX > 9 || dY < 1 || dY > 9) continue; // 0 금지

      isAdd = add; x = x2; y = y2; shown = shown2;
      posX = pX; posY = pY; ans0 = dX; ans1 = dY;
      break;
    }

    const mx = maskDigit(x, posX, '㉠');
    const my = maskDigit(y, posY, '㉡');
    const equation = isAdd ? `${mx} + ${my} = ${shown}` : `${shown} − ${mx} = ${my}`;
    const posName = ['일의', '십의', '백의'];

    const explanation: MathExpr = [
      txt(`각 자리를 맞춰 계산해요. `),
      isAdd
        ? txt(`${mx} + ${my} = ${shown}에서 일의 자리부터 받아올림을 따져요. `)
        : txt(`${shown} − ${mx} = ${my} 형태의 뺄셈식은 ${mx} + ${my} = ${nj(shown, '과/와')} 같아요. 일의 자리부터 따져요. `),
      txt(`㉠은 ${posName[posX]} 자리 숫자 ${ans0}, ㉡은 ${posName[posY]} 자리 숫자 ${ida(ans1)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 식에서 ㉠과 ㉡에 알맞은 숫자를 구하세요.\n${equation}`,
      expr: [txt('㉠ = '), blank(0), txt('  ㉡ = '), blank(1)],
      blankAnswers: [ans0, ans1],
      explanation,
    };
  },
};

/**
 * ch31-between3  부등식 만족 세 자리 수
 * (A+B)보다 크고 (C−D)보다 작은 세 자리 수는 모두 몇 개?
 */
const chBetween3: SkillDef = {
  id: 'ch31-between3',
  unitId: 'unitAdd3',
  title: '부등식 만족 세 자리 수 개수',
  note: '부등호 OK, 범위 안 세 자리 수 개수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let lo = 312, hi = 345, ans = 32;

    for (let tries = 0; tries < 2000; tries++) {
      // A+B 값 (100~799)
      const loBase = rng.int(100, 799);
      // hi - lo = 5~50 사이, 세 자리 수 포함
      const spread = rng.int(5, 50);
      const hiBase = loBase + spread + 1;
      if (hiBase > 999) continue;

      // lo+1 ~ hi-1 안에 세 자리 수 개수
      const lo2 = loBase;
      const hi2 = hiBase;
      const cnt = hi2 - 1 - (lo2 + 1) + 1;
      if (cnt < 2) continue;

      lo = lo2; hi = hi2; ans = cnt;
      break;
    }

    const explanation: MathExpr = [
      txt(`${lo}보다 크고 ${hi}보다 작은 자연수는 ${lo + 1}부터 ${hi - 1}까지예요. `),
      txt(`세 자리 수의 범위인 100~999 안에 있는지 확인하면 모두 해당돼요. `),
      txt(`개수 = ${hi - 1} − ${lo + 1} + 1 = ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${lo}보다 크고 ${hi}보다 작은 세 자리 자연수는 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch31-overlapset  두 집합 포함배제
 * 국어 좋아 a명, 수학 좋아 b명, 둘 중 적어도 하나 좋아 t명
 * 둘 다 좋아하는 학생 = a+b−t (>0)
 */
const chOverlapSet: SkillDef = {
  id: 'ch31-overlapset',
  unitId: 'unitAdd3',
  title: '두 집합 포함배제 원리',
  note: 'a+b−t = 둘 다 개수, 양수 보장',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const topics = [
      ['국어', '수학'],
      ['사과', '포도'],
      ['농구', '축구'],
      ['강아지', '고양이'],
      ['그림', '음악'],
    ];

    // 폴백
    let a = 15, b = 12, t = 20, ans = 7;
    let topicA = '국어', topicB = '수학';

    for (let tries = 0; tries < 2000; tries++) {
      const [tA, tB] = rng.pick(topics);
      const both = rng.int(2, 8);
      const onlyA = rng.int(3, 12);
      const onlyB = rng.int(3, 12);
      const a2 = both + onlyA;
      const b2 = both + onlyB;
      const t2 = both + onlyA + onlyB;
      if (a2 + b2 - t2 !== both) continue;
      if (t2 > 35) continue;
      a = a2; b = b2; t = t2; ans = both;
      topicA = tA; topicB = tB;
      break;
    }

    const explanation: MathExpr = [
      txt(`포함배제 원리: 둘 다 좋아하는 학생 수 = ${topicA} 좋아하는 수 + ${topicB} 좋아하는 수 − 적어도 하나 좋아하는 수. `),
      txt(`= ${a} + ${b} − ${t} = ${ans}${ida('명')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${topicA}을(를) 좋아하는 학생은 ${a}명, ${topicB}을(를) 좋아하는 학생은 ${b}명, 둘 중 적어도 하나를 좋아하는 학생은 ${t}명입니다. 두 가지를 모두 좋아하는 학생은 몇 명인가요?`,
      expr: [blank(0), txt(' 명')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitPlane3 — 평면도형
// ═══════════════════════════════════════════════════════════════

/**
 * ch31-pointsline  점으로 그리는 반직선/선분 수
 * n개 점 중 2개 → 반직선 n(n-1), 선분 n(n-1)/2
 * n=4~7, minVariety 명시
 */
const chPointsLine: SkillDef = {
  id: 'ch31-pointsline',
  unitId: 'unitPlane3',
  title: '점으로 그리는 반직선/선분 수',
  note: 'n=4~7 → 8종 내외, minVariety:8',
  difficulty: 3,
  challenge: true,
  minVariety: 8,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const n = rng.int(4, 7);
    const isRay = rng.chance(0.5);

    const ans = isRay ? n * (n - 1) : (n * (n - 1)) / 2;
    const kindName = isRay ? '반직선' : '선분';

    const explanation: MathExpr = [
      txt(`서로 다른 점 ${n}개 중 2개를 골라 ${kindName}을 그려요. `),
      isRay
        ? txt(`반직선은 시작점과 방향이 중요하므로 순서가 다르면 다른 반직선이에요. ${n}×${n - 1} = ${ans}${ida('개')}.`)
        : txt(`선분은 양 끝점이 같으면 같은 선분이에요. ${n}×${n - 1}÷2 = ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `서로 다른 점 ${n}개 중 2개를 이어 그릴 수 있는 ${kindName}은 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch31-wirerect  정사각형 철사로 직사각형
 * 한 변 a cm 정사각형 → 철사 펴서 세로 b cm 직사각형 → 가로 = 2a−b
 */
const chWireRect: SkillDef = {
  id: 'ch31-wirerect',
  unitId: 'unitPlane3',
  title: '정사각형 철사로 직사각형 만들기',
  note: '가로 = 2a−b > 0, fill-blanks cm',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let a = 15, b = 8, ans = 22;

    for (let tries = 0; tries < 2000; tries++) {
      const a2 = rng.int(8, 25);
      const b2 = rng.int(2, a2 - 1);
      const ans2 = 2 * a2 - b2;
      if (ans2 < 1) continue;
      if (ans2 === b2) continue; // 정사각형 되면 문제가 자명해짐
      a = a2; b = b2; ans = ans2;
      break;
    }

    const total = 4 * a;

    const explanation: MathExpr = [
      txt(`정사각형의 둘레 = 4×${a} = ${total} cm. `),
      txt(`직사각형의 둘레도 ${total} cm이므로 2×(가로+세로) = ${total}. `),
      txt(`가로+세로 = ${total}÷2 = ${total / 2} cm. `),
      txt(`가로 = ${total / 2}−${b} = ${ans} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 변이 ${a} cm인 정사각형 모양의 철사를 펴서 세로가 ${b} cm인 직사각형을 만들었습니다. 가로는 몇 cm인가요?`,
      expr: [txt('가로 = '), blank(0), txt(' cm')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch31-cutsquares  큰 정사각형을 작은 정사각형으로
 * 한 변 L cm → 한 변 s cm, L = k×s (k=4~9)
 * 개수 = k²
 */
const chCutSquares: SkillDef = {
  id: 'ch31-cutsquares',
  unitId: 'unitPlane3',
  title: '정사각형 종이를 작은 정사각형으로 자르기',
  note: 'L=k×s (k=4~9, s=2~8), 개수=k², 6×7=42종',
  difficulty: 3,
  challenge: true,
  minVariety: 42,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const k = rng.int(4, 9);
    const s = rng.int(2, 8);
    const L = k * s;
    const ans = k * k;

    const explanation: MathExpr = [
      txt(`한 변 ${L} cm를 한 변 ${s} cm로 자르면 한 줄에 ${L}÷${s} = ${k}개씩 잘려요. `),
      txt(`가로 ${k}개, 세로 ${k}개이므로 ${k}×${k} = ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `한 변이 ${L} cm인 정사각형 종이를 한 변이 ${s} cm인 정사각형으로 남김없이 자르면 모두 몇 개인가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitDiv3 — 나눗셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch31-treeplant  나무 간격
 * 길이 L m 도로 한쪽에 처음부터 끝까지 g그루 → 간격 = L÷(g−1)
 */
const chTreePlant: SkillDef = {
  id: 'ch31-treeplant',
  unitId: 'unitDiv3',
  title: '나무 심기 간격',
  note: 'L÷(g−1) 정수, fill-blanks m',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let L = 48, g = 7, ans = 8;

    for (let tries = 0; tries < 2000; tries++) {
      const g2 = rng.int(3, 9); // 그루 수
      const gaps = g2 - 1;      // 간격 수
      const interval = rng.int(2, 12);
      const L2 = interval * gaps;
      if (L2 < 10 || L2 > 100) continue;
      L = L2; g = g2; ans = interval;
      break;
    }

    const explanation: MathExpr = [
      txt(`나무 ${g}그루를 처음부터 끝까지 심으면 간격은 ${g} − 1 = ${g - 1}군데예요. `),
      txt(`간격 = ${L} ÷ ${g - 1} = ${ans} m.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `길이가 ${L} m인 도로 한쪽에 처음부터 끝까지 나무를 ${g}그루 심으려고 합니다. 나무 사이의 간격을 똑같이 하면 몇 m 간격으로 심어야 하나요?`,
      expr: [blank(0), txt(' m')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch31-leftoverdiv  만들고 먹고 나눠 주기
 * 한 통에 p개씩 q통 사서 r개 먹고 s명에게 나누기
 * 한 사람 몫 = (p×q−r)/s (정수·양수)
 */
const chLeftOverDiv: SkillDef = {
  id: 'ch31-leftoverdiv',
  unitId: 'unitDiv3',
  title: '사서 먹고 나눠 주기',
  note: '(p×q−r)/s 정수·양수, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let p = 8, q = 5, r = 4, s = 6, ans = 6;

    for (let tries = 0; tries < 2000; tries++) {
      const s2 = rng.int(2, 8);
      const ans2 = rng.int(2, 9);
      const total = s2 * ans2; // p×q−r
      // p×q를 total+r로 만들기
      const r2 = rng.int(1, total - 1);
      const pq = total + r2;
      if (pq > 81) continue;
      // 인수 찾기
      const factors: Array<[number, number]> = [];
      for (let pp = 2; pp <= 9; pp++) {
        if (pq % pp === 0) {
          const qq = pq / pp;
          if (qq >= 2 && qq <= 9) factors.push([pp, qq]);
        }
      }
      if (!factors.length) continue;
      const [p2, q2] = rng.pick(factors);

      p = p2; q = q2; r = r2; s = s2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`전체 개수: ${p}×${q} = ${p * q}${ida('개')}. `),
      txt(`먹고 남은 개수: ${p * q} − ${r} = ${p * q - r}${ida('개')}. `),
      txt(`한 사람 몫: ${p * q - r} ÷ ${s} = ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `과자가 한 봉지에 ${p}개씩 ${q}봉지 있습니다. 그 중 ${r}개를 먹고, 남은 것을 ${s}명에게 똑같이 나누어 주면 한 사람에게 몇 개씩 줄 수 있나요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch31-legs  다리 수 같게
 * A는 다리 m개, B는 다리 k개
 * A가 x마리일 때 다리 수가 같으려면 B는 몇 마리? = (m×x)/k (정수)
 */
const chLegs: SkillDef = {
  id: 'ch31-legs',
  unitId: 'unitDiv3',
  title: '다리 수 같게 만들기',
  note: '(m×x)/k 정수 보장, fill-blanks 마리',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const animals: Array<[string, number]> = [
      ['닭', 2], ['소', 4], ['개', 4], ['문어', 8], ['거미', 8],
      ['말', 4], ['고양이', 4], ['사자', 4],
    ];

    // 폴백
    let mName = '닭', kName = '소', m = 2, k = 4, x = 6, ans = 3;

    for (let tries = 0; tries < 2000; tries++) {
      const [an1, m2] = rng.pick(animals);
      const [an2, k2] = rng.pick(animals);
      if (an1 === an2 || m2 === k2) continue;
      const x2 = rng.int(2, 9);
      const num = m2 * x2;
      if (num % k2 !== 0) continue;
      const ans2 = num / k2;
      if (ans2 < 1) continue;
      mName = an1; kName = an2; m = m2; k = k2; x = x2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`${mName} ${x}마리의 다리 수: ${m}×${x} = ${m * x}${ida('개')}. `),
      txt(`${kName} ${ans}마리의 다리 수: ${k}×${ans} = ${k * ans}${ida('개')}. `),
      txt(`두 값이 같으므로 ${kName}는 ${ans}${ida('마리')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${mName}은 다리가 ${m}개, ${kName}은 다리가 ${k}개입니다. ${mName}이 ${x}마리일 때 다리 수가 같으려면 ${kName}는 몇 마리여야 하나요?`,
      expr: [blank(0), txt(' 마리')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitMul31 — 곱셈
// ═══════════════════════════════════════════════════════════════

/**
 * ch31-ringgap  둘레 화분+가로등
 * 원 모양 연못 둘레 g×n, 가로등 h 간격 → 개수 = g×n/h
 */
const chRingGap: SkillDef = {
  id: 'ch31-ringgap',
  unitId: 'unitMul31',
  title: '둘레에 화분·가로등 배치',
  note: 'g×n/h 정수, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let g = 4, n = 9, h = 6, total = 36, ans = 6;

    for (let tries = 0; tries < 2000; tries++) {
      const g2 = rng.int(2, 6);
      const n2 = rng.int(4, 12);
      const total2 = g2 * n2;
      if (total2 > 60) continue;
      // h는 total2의 약수 중 g2와 다른 것
      const divs: number[] = [];
      for (let d = 2; d <= total2; d++) {
        if (total2 % d === 0 && d !== g2 && d !== n2 && d !== 1) divs.push(d);
      }
      if (!divs.length) continue;
      const h2 = rng.pick(divs);
      const ans2 = total2 / h2;
      if (ans2 < 2) continue;
      g = g2; n = n2; h = h2; total = total2; ans = ans2;
      break;
    }

    const explanation: MathExpr = [
      txt(`연못 둘레 = ${g} m × ${n} = ${total} m. `),
      txt(`가로등 수 = ${total} ÷ ${h} = ${ans}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `원 모양 연못 둘레에 화분을 ${g} m 간격으로 ${n}개 놓았습니다. 이 둘레에 가로등을 ${h} m 간격으로 세우면 몇 개 필요한가요?`,
      expr: [blank(0), txt(' 개')],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch31-doublefold  배수 접기 역산
 * 첫날 □개, 다음 날부터 매일 2배씩 접어 k일째 N개 → 첫날 = N/2^(k-1)
 * k=3~5, 정수 보장
 */
const chDoubleFold: SkillDef = {
  id: 'ch31-doublefold',
  unitId: 'unitMul31',
  title: '2배 접기 역산',
  note: 'k=3~5 × first=2~8 = 21종, minVariety:21',
  difficulty: 3,
  challenge: true,
  minVariety: 21,
  generate(seed): Problem {
    const rng = new RNG(seed);

    const k = rng.int(3, 5);
    const pow = Math.pow(2, k - 1);
    const first = rng.int(2, 8);
    const N = first * pow;

    const explanation: MathExpr = [
      txt(`매일 2배씩 늘어나므로 ${k}일째 수 = 첫날 × ${pow}. `),
      txt(`${k}일째 날 ${N}${ida('개')}를 접었으므로, 첫날 × ${pow} = ${N}. `),
      txt(`첫날 = ${N} ÷ ${pow} = ${first}${ida('개')}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `첫날 □개를 종이접기 하고, 다음 날부터 매일 전날의 2배씩 접었습니다. ${k}일째 날 ${N}개를 접었다면 첫날은 몇 개를 접었나요?`,
      expr: [txt('첫날 = '), blank(0), txt(' 개')],
      blankAnswers: [first],
      explanation,
    };
  },
};

/**
 * ch31-comparemul  배수 차로 구하기
 * B = A의 m배, C = A의 k배 (m>k), B−C = d → C = A×k
 */
const chCompareMul: SkillDef = {
  id: 'ch31-comparemul',
  unitId: 'unitMul31',
  title: '배수 차로 C 구하기',
  note: 'A=d/(m-k) 정수, C=A×k, fill-blanks',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let m = 5, k = 3, A = 6, d = 12, C = 18;

    for (let tries = 0; tries < 2000; tries++) {
      const m2 = rng.int(3, 7);
      const k2 = rng.int(1, m2 - 1);
      const A2 = rng.int(2, 10);
      const d2 = (m2 - k2) * A2;
      const C2 = A2 * k2;
      if (d2 < 2 || C2 < 2) continue;
      m = m2; k = k2; A = A2; d = d2; C = C2;
      break;
    }

    const explanation: MathExpr = [
      txt(`B는 A의 ${m}배, C는 A의 ${k}배이므로 B − C = A × (${m} − ${k}) = A × ${m - k}. `),
      txt(`A × ${m - k} = ${d}이므로 A = ${d} ÷ ${m - k} = ${A}. `),
      txt(`C = ${A} × ${k} = ${C}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `B는 A의 ${m}배이고 C는 A의 ${k}배입니다. B가 C보다 ${d} 많을 때 C는 얼마인가요?`,
      expr: [txt('C = '), blank(0)],
      blankAnswers: [C],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitTime3 — 길이와 시간
// ═══════════════════════════════════════════════════════════════

/**
 * ch31-lendiff  길이 최대-최소 차 (cm mm)
 * mm·cm 혼합 표기 길이 4개 → 최장−최단 [cm, mm] 2칸, 각 ≥1
 */
const chLenDiff: SkillDef = {
  id: 'ch31-lendiff',
  unitId: 'unitTime3',
  title: '길이 최대-최소 차 (cm mm)',
  note: '4개 길이 mm 단위 → 차 cm≥1 mm≥1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let lensMm = [152, 87, 210, 123]; // mm 단위
    let ansCm = 1, ansMm = 2;

    for (let tries = 0; tries < 2000; tries++) {
      // 4개 길이 (50~300 mm)
      const ls = Array.from({ length: 4 }, () => rng.int(50, 300));
      const maxL = Math.max(...ls);
      const minL = Math.min(...ls);
      if (maxL === minL) continue;
      const diff = maxL - minL;
      const dc = Math.floor(diff / 10); // cm
      const dm = diff % 10;             // mm
      if (dc < 1 || dm < 1) continue;
      lensMm = ls;
      ansCm = dc;
      ansMm = dm;
      break;
    }

    // 표현: 각 길이를 cm mm 또는 mm 형태로
    const displays = lensMm.map((mm, i) => {
      if (i % 2 === 0) {
        const c = Math.floor(mm / 10);
        const m = mm % 10;
        return `${c} cm ${m} mm`;
      } else {
        return `${mm} mm`;
      }
    });

    const maxL = Math.max(...lensMm);
    const minL = Math.min(...lensMm);

    const explanation: MathExpr = [
      txt(`모두 mm로 바꾸면: ${lensMm.join(' mm, ')} mm. `),
      txt(`가장 긴 길이: ${maxL} mm, 가장 짧은 길이: ${minL} mm. `),
      txt(`차: ${maxL} − ${minL} = ${maxL - minL} mm = ${ansCm} cm ${ansMm} mm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `다음 길이 중 가장 긴 것과 가장 짧은 것의 차는 몇 cm 몇 mm인가요?\n${displays.join(', ')}`,
      expr: [blank(0), txt(' cm '), blank(1), txt(' mm')],
      blankAnswers: [ansCm, ansMm],
      explanation,
    };
  },
};

/**
 * ch31-elapsedhms  경과 시간 (시간 분 초)
 * H1시 M1분 S1초 ~ H2시 M2분 S2초, [시간, 분, 초] 3칸 각 ≥1
 */
const chElapsedHms: SkillDef = {
  id: 'ch31-elapsedhms',
  unitId: 'unitTime3',
  title: '경과 시간 (시간 분 초)',
  note: '[시간,분,초] 3칸 각 ≥1, 60초=1분 60분=1시간',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let H1 = 9, M1 = 15, S1 = 20;
    let ansH = 1, ansM = 25, ansS = 30;

    for (let tries = 0; tries < 2000; tries++) {
      const eH = rng.int(1, 3);
      const eM = rng.int(1, 58);
      const eS = rng.int(1, 58);

      const h1 = rng.int(8, 14);
      const m1 = rng.int(0, 59);
      const s1 = rng.int(0, 59);

      const totalSec1 = h1 * 3600 + m1 * 60 + s1;
      const elapsedSec = eH * 3600 + eM * 60 + eS;
      const totalSec2 = totalSec1 + elapsedSec;

      const h2 = Math.floor(totalSec2 / 3600);

      if (h2 > 20) continue;
      // 모든 칸 ≥1 보장
      if (eH < 1 || eM < 1 || eS < 1) continue;

      H1 = h1; M1 = m1; S1 = s1;
      ansH = eH; ansM = eM; ansS = eS;

      // 검증: 역계산
      const check = totalSec2 - totalSec1;
      const cH = Math.floor(check / 3600);
      const cM = Math.floor((check % 3600) / 60);
      const cS = check % 60;
      if (cH !== eH || cM !== eM || cS !== eS) continue;

      // 끝 시각도 저장 (문제 표현용)
      break;
    }

    const totalSec1 = H1 * 3600 + M1 * 60 + S1;
    const elapsedSec = ansH * 3600 + ansM * 60 + ansS;
    const totalSec2 = totalSec1 + elapsedSec;
    const H2 = Math.floor(totalSec2 / 3600);
    const M2 = Math.floor((totalSec2 % 3600) / 60);
    const S2 = totalSec2 % 60;

    const explanation: MathExpr = [
      txt(`시작: ${H1}시 ${M1}분 ${S1}초, 끝: ${H2}시 ${M2}분 ${S2}초. `),
      txt(`초로 계산하면 ${totalSec2} − ${totalSec1} = ${elapsedSec}초. `),
      txt(`60초씩 묶으면 ${Math.floor(elapsedSec / 60)}분이고 ${elapsedSec % 60}초가 남아요. `),
      txt(`다시 60분씩 묶으면 ${ansH}시간 ${ansM}분 ${ansS}초예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${H1}시 ${M1}분 ${S1}초에 시작해서 ${H2}시 ${M2}분 ${S2}초에 끝났습니다. 걸린 시간은 몇 시간 몇 분 몇 초인가요?`,
      expr: [blank(0), txt(' 시간 '), blank(1), txt(' 분 '), blank(2), txt(' 초')],
      blankAnswers: [ansH, ansM, ansS],
      explanation,
    };
  },
};

/**
 * ch31-speeddist  일정 빠르기 거리 (km m)
 * t1분 동안 D(km m) 가는 기차가 t2분 동안 가는 거리
 * t2 = 배수×t1 (2~4배) → D×배수 → km m
 * [km, m] 각 ≥1
 */
const chSpeedDist: SkillDef = {
  id: 'ch31-speeddist',
  unitId: 'unitTime3',
  title: '일정 빠르기 거리 (km m)',
  note: 't2=n배×t1, D×n → [km,m] 각 ≥1',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백
    let t1 = 3, km1 = 2, m1 = 400, mult = 3;
    let ansKm = 7, ansM = 200;

    for (let tries = 0; tries < 2000; tries++) {
      const t1_2 = rng.int(2, 6);
      const mult2 = rng.int(2, 4);
      // D in m (기본 거리)
      const km1_2 = rng.int(1, 5);
      const m1_2 = rng.int(100, 900); // 100m 단위로 만들면 쉬움
      // m1_2 × mult2 에서 받아올림 확인
      const totalM = (km1_2 * 1000 + m1_2) * mult2;
      const resKm = Math.floor(totalM / 1000);
      const resM = totalM % 1000;
      if (resKm < 1 || resM < 1) continue;
      // m1_2도 ≥1 체크 (이미 100이상)
      t1 = t1_2; km1 = km1_2; m1 = m1_2; mult = mult2;
      ansKm = resKm; ansM = resM;
      break;
    }

    const t2 = t1 * mult;

    const explanation: MathExpr = [
      txt(`${t2}분 = ${t1}분 × ${mult}이므로 거리도 ${mult}배예요. `),
      txt(`${km1} km ${m1} m × ${mult} = ${km1 * mult} km ${m1 * mult} m. `),
      txt(`${m1 * mult} m = ${Math.floor(m1 * mult / 1000)}km ${m1 * mult % 1000}m이므로 `),
      txt(`전체 = ${km1 * mult + Math.floor(m1 * mult / 1000)} km ${m1 * mult % 1000} m = ${ansKm} km ${ansM} m.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `기차가 ${t1}분 동안 ${km1} km ${m1} m를 달립니다. 같은 빠르기로 ${t2}분 동안 달리면 몇 km 몇 m를 가나요?`,
      expr: [blank(0), txt(' km '), blank(1), txt(' m')],
      blankAnswers: [ansKm, ansM],
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  unitFrac3 — 분수와 소수
// ═══════════════════════════════════════════════════════════════

/**
 * ch31-tapedec  색테이프 남은 길이 (소수 cm)
 * L cm 색 테이프를 e mm씩 n번 잘라 사용
 * 남은 mm = L×10 − e×n > 0, 답 = 남은mm/10 (decimal-input)
 */
const chTapeDec: SkillDef = {
  id: 'ch31-tapedec',
  unitId: 'unitFrac3',
  title: '색테이프 남은 길이 (소수 cm)',
  note: 'decimal-input, mm 스케일 계산, 답×10 정수',
  difficulty: 3,
  challenge: true,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: 20cm 테이프에서 15mm씩 5번 → 남은 = 200-75 = 125mm = 12.5cm
    let L = 20, e = 15, n = 5;
    let remainMm = 125; // = L*10 - e*n

    for (let tries = 0; tries < 2000; tries++) {
      const L2 = rng.int(15, 40); // cm
      const e2 = rng.int(5, 20);  // mm
      const n2 = rng.int(2, 6);
      const used = e2 * n2;
      const total = L2 * 10; // mm
      const remain = total - used;
      if (remain <= 0) continue;
      if (remain % 10 === 0) continue; // 소수점 아래 있어야 의미있음 (0.x 형태)
      // 답은 remain/10 cm (소수 한 자리)
      L = L2; e = e2; n = n2; remainMm = remain;
      break;
    }

    // decimal-input: answer = remainMm/10 (×10000이 정수 자동 충족 — 소수 한 자리)
    const ansNumerator = remainMm; // answer × 10 = remainMm (정수)
    // answer = remainMm / 10

    const explanation: MathExpr = [
      txt(`${L} cm = ${L * 10} mm. `),
      txt(`사용한 길이: ${e} mm × ${n} = ${e * n} mm. `),
      txt(`남은 길이: ${L * 10} − ${e * n} = ${remainMm} mm = ${remainMm / 10} cm.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'decimal-input',
      prompt: `${L} cm짜리 색 테이프를 ${e} mm씩 ${n}번 잘라 사용했습니다. 남은 색 테이프의 길이는 몇 cm인가요?`,
      answer: ansNumerator / 10,
      explanation,
    };
  },
};

/**
 * ch31-unitfrac  단위분수 사이
 * 1/a 보다 크고 1/b 보다 작은 단위분수(분자 1)
 * b < □ < a → □ = b+1 (a = b+2), b=3~40
 * minVariety: 30
 */
const chUnitFrac: SkillDef = {
  id: 'ch31-unitfrac',
  unitId: 'unitFrac3',
  title: '단위분수 사이의 단위분수',
  note: 'b=3~40, a=b+2, 분모=b+1 유일해, minVariety:30',
  difficulty: 3,
  challenge: true,
  minVariety: 30,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // b=3~40 → 38종 (충분히 30이상)
    const b = rng.int(3, 40);
    const a = b + 2;
    const ans = b + 1; // 분모

    const explanation: MathExpr = [
      txt(`1/${b}보다 크고 1/${a}보다 작은 단위분수의 분모를 □라 해요. `),
      txt(`단위분수는 분모가 클수록 작은 값이에요. `),
      txt(`1/${a} < 1/□ < 1/${b}이면 ${b} < □ < ${a}. `),
      txt(`${nj(b, '과/와')} ${a} 사이의 자연수는 ${ans}뿐이에요. `),
      txt(`따라서 분모는 ${ida(ans)}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `1/${b}보다 크고 1/${a}보다 작은 단위분수(분자가 1인 분수)를 구하세요. 그 분모를 쓰세요.`,
      expr: [txt('분모 = '), blank(0)],
      blankAnswers: [ans],
      explanation,
    };
  },
};

/**
 * ch31-fracremain  부분의 부분 빼고 남은 분수
 * 화단 전체의 a/d에 ㉮, ㉮의 2배 넓이에 ㉯
 * 남은 부분 = (d−a−2a)/d = (d−3a)/d, 기약·진분수·양수
 * fraction-input(mixed=false, requireIrreducible)
 */
const chFracRemain: SkillDef = {
  id: 'ch31-fracremain',
  unitId: 'unitFrac3',
  title: '부분의 부분 빼고 남은 분수',
  note: '(d-3a)/d 기약 진분수 양수, fraction-input, d=5~12 × a 범위 ≤17종',
  difficulty: 3,
  challenge: true,
  minVariety: 17,
  generate(seed): Problem {
    const rng = new RNG(seed);

    // 폴백: d=7, a=2 → 남은=(7-6)/7 = 1/7
    let d = 7, a = 2, remN = 1, remD = 7;

    for (let tries = 0; tries < 2000; tries++) {
      const d2 = rng.int(5, 12);
      // a는 작게 (1~floor(d/4))
      const aMax = Math.floor((d2 - 1) / 3); // d - 3a > 0 → a < d/3
      if (aMax < 1) continue;
      const a2 = rng.int(1, aMax);
      const remNumerator = d2 - 3 * a2;
      if (remNumerator <= 0) continue;
      const g = gcd(remNumerator, d2);
      const rn = remNumerator / g;
      const rd = d2 / g;
      if (rn >= rd) continue; // 진분수 아닌 경우 제외
      if (rd > 60) continue;
      d = d2; a = a2; remN = rn; remD = rd;
      break;
    }

    const explanation: MathExpr = [
      txt(`화단 전체의 ${a}/${d}에 ㉮를 심었어요. `),
      txt(`㉮의 2배 넓이 = ${a}/${d} × 2 = ${2 * a}/${d}에 ㉯를 심었어요. `),
      txt(`심은 부분 합 = ${a}/${d} + ${2 * a}/${d} = ${3 * a}/${d}. `),
      txt(`남은 부분 = 1 − ${3 * a}/${d} = ${d - 3 * a}/${d}`),
    ];

    // 기약분수로 표현
    const g = gcd(d - 3 * a, d);
    if (g > 1) {
      explanation.push(txt(` = ${remN}/${remD}.`));
    } else {
      explanation.push(txt(`예요.`));
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fraction-input',
      prompt: `화단 전체의 ${a}/${d}에 ㉮를 심었습니다. ㉮의 2배 넓이에 ㉯를 심었다면 아무것도 심지 않은 부분은 전체의 얼마인가요? (기약분수로 나타내세요)`,
      mixed: false,
      requireIrreducible: true,
      answer: { n: remN, d: remD },
      explanation,
    };
  },
};

// ═══════════════════════════════════════════════════════════════
//  내보내기
// ═══════════════════════════════════════════════════════════════

export const challengeG3S1Skills: SkillDef[] = [
  // unitAdd3
  chVertical3,
  chBetween3,
  chOverlapSet,
  // unitPlane3
  chPointsLine,
  chWireRect,
  chCutSquares,
  // unitDiv3
  chTreePlant,
  chLeftOverDiv,
  chLegs,
  // unitMul31
  chRingGap,
  chDoubleFold,
  chCompareMul,
  // unitTime3
  chLenDiff,
  chElapsedHms,
  chSpeedDist,
  // unitFrac3
  chTapeDec,
  chUnitFrac,
  chFracRemain,
];
