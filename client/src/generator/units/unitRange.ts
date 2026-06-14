/**
 * 단원: 수의 범위와 어림하기 (2022 개정교육과정 5-2 1단원)
 * 성취기준: 이상, 이하, 초과, 미만의 의미를 알고, 올림·버림·반올림을 이해하여
 * 생활 속 문제를 해결한다.
 */

import { RNG } from '../rng';
import { buildChoices } from '../choices';
import { ida, josa, nj } from '../josa';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;
const dec = (v: number): ChoiceValue => ({ kind: 'decimal', v });
const textChoice = (text: string): ChoiceValue => ({ kind: 'text', text });

// ── 올림 헬퍼 ────────────────────────────────────────────────────────
function roundUp(n: number, place: number): number {
  // place: 10, 100, 1000
  const floored = Math.floor(n / place) * place;
  return floored < n ? floored + place : floored;
}

function roundDown(n: number, place: number): number {
  return Math.floor(n / place) * place;
}

function roundHalf(n: number, place: number): number {
  // 사사오입: place 아래 첫째 자리에서 반올림
  return Math.round(n / place) * place;
}

const PLACE_LABELS: Record<number, string> = {
  10: '십',
  100: '백',
  1000: '천',
};

// ── 1. range-include ───────────────────────────────────────────────
const rangeInclude: SkillDef = {
  id: 'range-include',
  unitId: 'unitRange',
  title: '수의 범위 고르기',
  note: '이상/이하/초과/미만 조건에 맞는 수를 4지선다에서 고른다. 경계값 함정 포함.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    const N = rng.int(10, 100);
    const rangeType = rng.pick(['이상', '이하', '초과', '미만'] as const);

    // 정답 생성: 조건을 만족하는 수
    let answer: number;
    if (rangeType === '이상') {
      // N 이상: N, N+1, N+2, ... 중 하나
      answer = N + rng.int(0, 15);
    } else if (rangeType === '이하') {
      // N 이하: N-15 ~ N 중 하나
      answer = N - rng.int(0, 15);
      if (answer < 0) answer = 0;
    } else if (rangeType === '초과') {
      // N 초과: N+1, N+2, ... 중 하나
      answer = N + rng.int(1, 15);
    } else {
      // N 미만: N-15 ~ N-1 중 하나
      answer = N - rng.int(1, 15);
      if (answer < 0) answer = 1;
    }

    // 오답 후보: 조건 위반 + 경계값 함정
    const candidates: ChoiceValue[] = [];
    const usedVals = new Set<number>([answer]);

    const addCandidate = (v: number) => {
      if (v >= 0 && !usedVals.has(v)) {
        usedVals.add(v);
        candidates.push(dec(v));
      }
    };

    // 경계값 함정 (가장 중요)
    if (rangeType === '이상') {
      // 이상: N 자체는 정답 가능. N-1, N-2 는 오답
      addCandidate(N - 1);
      addCandidate(N - 2);
      addCandidate(N - rng.int(3, 8));
      addCandidate(N - rng.int(9, 14));
    } else if (rangeType === '이하') {
      // 이하: N 자체는 정답 가능. N+1, N+2 는 오답
      addCandidate(N + 1);
      addCandidate(N + 2);
      addCandidate(N + rng.int(3, 8));
      addCandidate(N + rng.int(9, 14));
    } else if (rangeType === '초과') {
      // 초과: N 자체가 오답 함정
      addCandidate(N);
      addCandidate(N - 1);
      addCandidate(N - rng.int(2, 7));
      addCandidate(N - rng.int(8, 13));
    } else {
      // 미만: N 자체가 오답 함정
      addCandidate(N);
      addCandidate(N + 1);
      addCandidate(N + rng.int(2, 7));
      addCandidate(N + rng.int(8, 13));
    }

    const { choices, answerIndex } = buildChoices(dec(answer), candidates, rng);

    const borderNote =
      rangeType === '이상' || rangeType === '이하'
        ? `${N}${josa(N, '은/는')} 포함돼요.`
        : `${N}${josa(N, '은/는')} 포함되지 않아요.`;

    const explanation: MathExpr = [
      txt(`'${N} ${rangeType}'이란 ${N}보다 `),
      txt(
        rangeType === '이상'
          ? '크거나 같은 수예요. '
          : rangeType === '이하'
            ? '작거나 같은 수예요. '
            : rangeType === '초과'
              ? '큰 수예요. '
              : '작은 수예요. ',
      ),
      txt(borderNote),
      txt(` ${nj(answer, '이/가')} 조건을 만족해요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `${N} ${rangeType}인 수를 고르세요.`,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 2. range-boundary ─────────────────────────────────────────────
const rangeBoundary: SkillDef = {
  id: 'range-boundary',
  unitId: 'unitRange',
  title: '범위 안의 자연수 개수',
  note: 'a 이상/초과 b 이하/미만 범위의 자연수 개수를 빈칸으로 채운다. 개수 3~10개.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // 이상/초과 × 이하/미만 4조합
    const leftType = rng.pick(['이상', '초과'] as const);
    const rightType = rng.pick(['이하', '미만'] as const);

    // 개수가 3~10이 되도록 범위 생성
    let a: number, b: number, count: number;
    let guard = 0;
    do {
      a = rng.int(5, 50);
      b = a + rng.int(2, 14);
      const lo = leftType === '이상' ? a : a + 1;
      const hi = rightType === '이하' ? b : b - 1;
      count = hi >= lo ? hi - lo + 1 : 0;
      guard++;
      if (guard > 300) { a = 10; b = 17; break; }
    } while (count < 3 || count > 10);

    const lo = leftType === '이상' ? a : a + 1;
    const hi = rightType === '이하' ? b : b - 1;
    count = hi >= lo ? hi - lo + 1 : 0;

    const expr: MathExpr = [
      txt(`${a} ${leftType} b ${rightType}인 자연수: `),
      { kind: 'blank', slot: 0 },
      txt('개'),
    ];

    // 범위 안의 실제 수 나열 (최대 5개 + ... 생략)
    const listNums: number[] = [];
    for (let v = lo; v <= hi && listNums.length <= 5; v++) listNums.push(v);
    const listStr =
      listNums.length > 5 ? listNums.slice(0, 5).join(', ') + ', ...' : listNums.join(', ');

    const explanation: MathExpr = [
      txt(`${a} ${leftType}: 포함 기준이 ${leftType === '이상' ? a : a + 1}부터 시작해요. `),
      txt(`${b} ${rightType}: 포함 기준이 ${rightType === '이하' ? b : b - 1}까지예요. `),
      txt(`해당 자연수: ${listStr}. `),
      txt(`모두 ${ida(count)}개예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${a} ${leftType} ${b} ${rightType}인 자연수는 모두 몇 개인가요?`,
      expr,
      blankAnswers: [count],
      explanation,
    };
  },
};

// ── 3. range-word ──────────────────────────────────────────────────
const rangeWord: SkillDef = {
  id: 'range-word',
  unitId: 'unitRange',
  title: '범위 문장제',
  note: '생활 속 수의 범위 조건을 만족하는 사람/사물을 고르는 4지선다. 소재 4가지 풀.',
  difficulty: 2,
  word: true,
  generate(seed) {
    const rng = new RNG(seed);
    const templateIdx = rng.int(0, 3);

    const NAMES = ['지민', '수아', '하준', '서연', '민준', '유나', '도윤', '지우'] as const;
    const picked4 = rng.sample(NAMES, 4);

    let prompt: string;
    let choices: ChoiceValue[];
    let answerIndex: number;
    let explanation: MathExpr;

    if (templateIdx === 0) {
      // 놀이기구 키 (N cm 이상)
      const threshold = rng.int(120, 145);
      // 정답자 키: threshold 이상
      const answerHeight = threshold + rng.int(0, 20);
      // 오답자 키: threshold 미만
      const wrong1 = threshold - rng.int(1, 10);
      const wrong2 = threshold - rng.int(11, 20);
      const wrong3 = threshold - rng.int(21, 30);

      const heights = [answerHeight, wrong1, wrong2, wrong3];
      const nameHeights = picked4.map((name, i) => ({ name, h: heights[i] }));
      const shuffled = rng.shuffle(nameHeights);

      const answerEntry = shuffled.find((e) => e.h === answerHeight)!;
      choices = shuffled.map((e) => textChoice(`${e.name} (${e.h} cm)`));
      answerIndex = shuffled.indexOf(answerEntry);

      prompt = `키가 ${threshold} cm 이상이어야 탈 수 있는 놀이기구가 있어요. 탈 수 있는 사람을 고르세요.`;
      explanation = [
        txt(`'${threshold} cm 이상'이란 ${threshold} cm보다 크거나 같은 것을 뜻해요. `),
        txt(`${answerEntry.name}${josa(answerEntry.name, '은/는')} ${answerEntry.h} cm${josa(answerEntry.h, '으로/로')} 탈 수 있어요.`),
      ];
    } else if (templateIdx === 1) {
      // 택배 무게 N kg 이하
      const threshold = rng.int(3, 8);
      const answerWeight = threshold - rng.int(0, 1); // threshold 이하
      const wrong1 = threshold + rng.int(1, 3);
      const wrong2 = threshold + rng.int(4, 6);
      const wrong3 = threshold + rng.int(7, 10);

      const weights = [answerWeight, wrong1, wrong2, wrong3];
      const nameWeights = picked4.map((name, i) => ({ name, w: weights[i] }));
      const shuffled = rng.shuffle(nameWeights);

      const answerEntry = shuffled.find((e) => e.w === answerWeight)!;
      choices = shuffled.map((e) => textChoice(`${e.name} (${e.w} kg)`));
      answerIndex = shuffled.indexOf(answerEntry);

      prompt = `택배 무게가 ${threshold} kg 이하인 물건만 보낼 수 있어요. 보낼 수 있는 택배를 고르세요.`;
      explanation = [
        txt(`'${threshold} kg 이하'란 ${threshold} kg보다 작거나 같은 것을 뜻해요. `),
        txt(`${answerEntry.name}${josa(answerEntry.name, '은/는')} ${answerEntry.w} kg${josa(answerEntry.w, '으로/로')} 보낼 수 있어요.`),
      ];
    } else if (templateIdx === 2) {
      // 영화 관람 나이 (N세 이상)
      const threshold = rng.int(8, 15);
      const answerAge = threshold + rng.int(0, 5);
      const wrong1 = threshold - rng.int(1, 3);
      const wrong2 = threshold - rng.int(4, 6);
      const wrong3 = threshold - rng.int(7, 9);

      const ages = [answerAge, wrong1, wrong2, wrong3];
      const nameAges = picked4.map((name, i) => ({ name, age: ages[i] }));
      const shuffled = rng.shuffle(nameAges);

      const answerEntry = shuffled.find((e) => e.age === answerAge)!;
      choices = shuffled.map((e) => textChoice(`${e.name} (${e.age}세)`));
      answerIndex = shuffled.indexOf(answerEntry);

      prompt = `이 영화는 ${threshold}세 이상만 관람할 수 있어요. 관람할 수 있는 사람을 고르세요.`;
      explanation = [
        txt(`'${threshold}세 이상'이란 ${threshold}세보다 많거나 같은 것을 뜻해요. `),
        txt(`${answerEntry.name}${josa(answerEntry.name, '은/는')} ${answerEntry.age}세${josa(answerEntry.age, '으로/로')} 관람할 수 있어요.`),
      ];
    } else {
      // 엘리베이터 정원 N명 이하 → 초과면 탑승 불가 (미만 조건: 정원 초과 물건 무게)
      // 소재: 엘리베이터 최대 하중 N kg 미만
      const threshold = rng.int(200, 500);
      const answerLoad = threshold - rng.int(1, 50); // 미만: threshold보다 작아야
      const wrong1 = threshold; // 경계값 함정
      const wrong2 = threshold + rng.int(1, 30);
      const wrong3 = threshold + rng.int(31, 60);

      const loads = [answerLoad, wrong1, wrong2, wrong3];
      const nameLoads = picked4.map((name, i) => ({ name, load: loads[i] }));
      const shuffled = rng.shuffle(nameLoads);

      const answerEntry = shuffled.find((e) => e.load === answerLoad)!;
      choices = shuffled.map((e) => textChoice(`${e.name}네 짐 (${e.load} kg)`));
      answerIndex = shuffled.indexOf(answerEntry);

      prompt = `엘리베이터에 실을 수 있는 무게가 ${threshold} kg 미만이에요. 실을 수 있는 짐을 고르세요.`;
      explanation = [
        txt(`'${threshold} kg 미만'이란 ${threshold} kg보다 작은 것을 뜻해요. `),
        txt(`${threshold} kg${josa(threshold, '은/는')} 포함되지 않아요. `),
        txt(`${answerEntry.name}네 짐${josa(answerEntry.name + '네 짐', '은/는')} ${answerEntry.load} kg${josa(answerEntry.load, '으로/로')} 실을 수 있어요.`),
      ];
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt,
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 4. round-up ───────────────────────────────────────────────────
const roundUpSkill: SkillDef = {
  id: 'round-up',
  unitId: 'unitRange',
  title: '올림',
  note: '3~4자리 수를 올림하여 십/백/천의 자리까지 나타내는 빈칸 문제.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    const places = [10, 100, 1000] as const;
    const place = rng.pick(places);

    // 90% 확률로 값이 실제로 바뀌는 수 생성
    let n: number;
    let guard = 0;
    do {
      if (place === 10) {
        n = rng.int(100, 9999);
      } else if (place === 100) {
        n = rng.int(100, 9999);
      } else {
        n = rng.int(1000, 9999);
      }
      guard++;
      if (guard > 300) break;
      // 90% 확률: 실제로 값이 바뀌어야 함
      const changesValue = n % place !== 0;
      if (changesValue || rng.chance(0.1)) break;
    } while (true);

    const answer = roundUp(n, place);
    const placeLabel = PLACE_LABELS[place];

    const expr: MathExpr = [
      txt(`${nj(n, '을/를')} 올림하여 ${placeLabel}의 자리까지: `),
      { kind: 'blank', slot: 0 },
    ];

    const remainder = n % place;
    const explanation: MathExpr = [
      txt(`올림은 구하는 자리 아래 수가 0이 아니면 윗자리 수를 1 올려요. `),
      txt(
        remainder === 0
          ? `${n}${josa(n, '은/는')} ${placeLabel}의 자리 아래가 이미 0이므로 그대로 ${ida(answer)}.`
          : `${n}의 ${placeLabel}의 자리 아래 수 ${remainder}${josa(remainder, '은/는')} 0이 아니므로 올려서 ${ida(answer)}.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${n}${josa(n, '을/를')} 올림하여 ${placeLabel}의 자리까지 나타내세요.`,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 5. round-down ─────────────────────────────────────────────────
const roundDownSkill: SkillDef = {
  id: 'round-down',
  unitId: 'unitRange',
  title: '버림',
  note: '3~4자리 수를 버림하여 십/백/천의 자리까지 나타내는 빈칸 문제.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    const places = [10, 100, 1000] as const;
    const place = rng.pick(places);

    let n: number;
    let guard = 0;
    do {
      if (place === 10) {
        n = rng.int(100, 9999);
      } else if (place === 100) {
        n = rng.int(100, 9999);
      } else {
        n = rng.int(1000, 9999);
      }
      guard++;
      if (guard > 300) break;
      const changesValue = n % place !== 0;
      if (changesValue || rng.chance(0.1)) break;
    } while (true);

    const answer = roundDown(n, place);
    const placeLabel = PLACE_LABELS[place];

    const expr: MathExpr = [
      txt(`${nj(n, '을/를')} 버림하여 ${placeLabel}의 자리까지: `),
      { kind: 'blank', slot: 0 },
    ];

    const remainder = n % place;
    const explanation: MathExpr = [
      txt(`버림은 구하는 자리 아래 수를 모두 0으로 만들어요. `),
      txt(
        remainder === 0
          ? `${n}${josa(n, '은/는')} ${placeLabel}의 자리 아래가 이미 0이므로 그대로 ${ida(answer)}.`
          : `${n}의 ${placeLabel}의 자리 아래 수 ${remainder}${josa(remainder, '을/를')} 버려서 ${ida(answer)}.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${n}${josa(n, '을/를')} 버림하여 ${placeLabel}의 자리까지 나타내세요.`,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 6. round-half ─────────────────────────────────────────────────
const roundHalfSkill: SkillDef = {
  id: 'round-half',
  unitId: 'unitRange',
  title: '반올림',
  note: '3~4자리 수를 반올림하여 십/백/천의 자리까지 나타내는 빈칸 문제.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    const places = [10, 100, 1000] as const;
    const place = rng.pick(places);

    let n: number;
    if (place === 10) {
      n = rng.int(100, 9999);
    } else if (place === 100) {
      n = rng.int(100, 9999);
    } else {
      n = rng.int(1000, 9999);
    }

    const answer = roundHalf(n, place);
    const placeLabel = PLACE_LABELS[place];

    // 반올림 기준 자리: 십이면 일의 자리, 백이면 십의 자리, 천이면 백의 자리
    const digitPlace = place / 10;
    const keyDigit = Math.floor(n / digitPlace) % 10;

    const expr: MathExpr = [
      txt(`${nj(n, '을/를')} 반올림하여 ${placeLabel}의 자리까지: `),
      { kind: 'blank', slot: 0 },
    ];

    const digitPlaceLabel = PLACE_LABELS[digitPlace] ?? '일';
    const explanation: MathExpr = [
      txt(`반올림은 ${digitPlaceLabel}의 자리 숫자를 보고 5 이상이면 올리고, 5 미만이면 버려요. `),
      txt(`${n}의 ${digitPlaceLabel}의 자리 숫자는 ${keyDigit}이므로 `),
      txt(
        keyDigit >= 5
          ? `5 이상이어서 올려 ${ida(answer)}.`
          : `5 미만이어서 버려 ${ida(answer)}.`,
      ),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${n}${josa(n, '을/를')} 반올림하여 ${placeLabel}의 자리까지 나타내세요.`,
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 7. round-word ─────────────────────────────────────────────────
const roundWordSkill: SkillDef = {
  id: 'round-word',
  unitId: 'unitRange',
  title: '어림 문장제',
  note: '올림·버림을 활용하는 생활 속 문장제. 소재 5가지 풀.',
  difficulty: 3,
  word: true,
  generate(seed) {
    const rng = new RNG(seed);
    const templateIdx = rng.int(0, 4);

    let prompt: string;
    let expr: MathExpr;
    let answer: number;
    let explanation: MathExpr;

    if (templateIdx === 0) {
      // 올림: 보트 — N명이 10명씩 타는 보트
      const N = rng.int(21, 99);
      answer = Math.ceil(N / 10);
      prompt = `학생 ${N}명이 한 척에 10명씩 탈 수 있는 보트를 모두 타려면 보트가 최소 몇 척 필요한가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('척')];
      explanation = [
        txt(`모든 학생이 탈 수 있으려면 남은 학생을 위한 보트도 필요해요. `),
        txt(`${N}÷10=${Math.floor(N / 10)}…${N % 10}이므로 `),
        txt(`올림하면 최소 ${answer}척이 필요해요.`),
      ];
    } else if (templateIdx === 1) {
      // 버림: 동전 → 1000원 지폐
      const N = rng.int(1100, 9900);
      answer = Math.floor(N / 1000);
      prompt = `${N}원을 1000원짜리 지폐로 바꾸면 최대 몇 장을 받을 수 있나요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('장')];
      explanation = [
        txt(`1000원 단위로만 바꿀 수 있으므로 버림을 사용해요. `),
        txt(`${N}÷1000=${answer}…${N % 1000}이므로 `),
        txt(`최대 ${answer}장을 받을 수 있어요.`),
      ];
    } else if (templateIdx === 2) {
      // 버림: 공장 — N개를 100개들이 상자에 담아 팔기
      const N = rng.int(110, 990);
      answer = Math.floor(N / 100);
      prompt = `공장에서 물건 ${N}개를 100개들이 상자에 담아 팔 때, 팔 수 있는 상자는 몇 상자인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('상자')];
      explanation = [
        txt(`상자를 가득 채워야 팔 수 있으므로 버림을 사용해요. `),
        txt(`${N}÷100=${answer}…${N % 100}이므로 `),
        txt(`팔 수 있는 상자는 ${answer}상자예요.`),
      ];
    } else if (templateIdx === 3) {
      // 올림: 끈 — N cm를 1 m 단위로 구매
      const N = rng.int(101, 999);
      answer = Math.ceil(N / 100); // 1 m = 100 cm
      prompt = `끈 ${N} cm를 사려고 해요. 끈을 1 m 단위로만 살 수 있을 때 최소 몇 m를 사야 하나요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt(' m')];
      explanation = [
        txt(`필요한 양보다 짧으면 안 되므로 올림을 사용해요. `),
        txt(`${N} cm = ${Math.floor(N / 100)} m ${N % 100} cm이므로 `),
        txt(`올림하면 최소 ${answer} m를 사야 해요.`),
      ];
    } else {
      // 올림: 의자 — N명이 한 줄에 8명씩 앉을 때 줄 수
      const groupSize = rng.pick([5, 6, 8, 9] as const);
      const N = rng.int(groupSize + 1, groupSize * 9 + groupSize - 1);
      answer = Math.ceil(N / groupSize);
      prompt = `학생 ${N}명이 한 줄에 ${groupSize}명씩 앉으려면 줄이 최소 몇 줄 필요한가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('줄')];
      explanation = [
        txt(`남은 학생도 앉아야 하므로 올림을 사용해요. `),
        txt(`${N}÷${groupSize}=${Math.floor(N / groupSize)}…${N % groupSize}이므로 `),
        txt(`올림하면 최소 ${answer}줄이 필요해요.`),
      ];
    }

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

// ── 8. round-pick ─────────────────────────────────────────────────
const roundPick: SkillDef = {
  id: 'round-pick',
  unitId: 'unitRange',
  title: '반올림 역추론',
  note: '반올림하면 특정 값이 되는 수를 4지선다에서 고른다. 경계값 함정 포함.',
  difficulty: 3,
  generate(seed) {
    const rng = new RNG(seed);

    // 반올림 자리: 백 또는 십
    const place = rng.pick([100, 10] as const);
    const placeLabel = PLACE_LABELS[place];
    const halfPlace = place / 2; // 50 or 5

    // 목표 값 생성
    let target: number;
    if (place === 100) {
      target = rng.int(10, 90) * 100; // 1000~9000 (100단위)
    } else {
      target = rng.int(10, 990) * 10; // 100~9900 (10단위)
    }

    // 반올림하면 target이 되는 범위: [target - halfPlace, target + halfPlace - 1]
    const lo = target - halfPlace;
    const hi = target + halfPlace - 1;

    // 정답: 범위 안에서 경계 근처를 피한 중간값
    const answer = lo + rng.int(0, hi - lo);

    // 오답 후보:
    // 경계 함정: lo-1, hi+1 (범위 바로 밖)
    // 추가: lo-2, hi+2, target 자체(경계 혼동용), target-place, target+place
    const candidateVals: number[] = [];
    const usedVals = new Set<number>([answer]);

    const addCand = (v: number) => {
      if (v > 0 && !usedVals.has(v)) {
        usedVals.add(v);
        candidateVals.push(v);
      }
    };

    addCand(lo - 1);  // 경계 바로 밖 (함정)
    addCand(hi + 1);  // 경계 바로 밖 (함정)
    addCand(lo - 2);
    addCand(hi + 2);
    addCand(target);  // 목표값 자체 (혼동 함정)
    addCand(target - place);
    addCand(target + place);

    const candidates: ChoiceValue[] = rng.shuffle(candidateVals.map(dec));
    const { choices, answerIndex } = buildChoices(dec(answer), candidates, rng);

    const explanation: MathExpr = [
      txt(`반올림하여 ${placeLabel}의 자리까지 나타내면 ${nj(target, '이/가')} 되려면 `),
      txt(`${placeLabel} 아래 자리 숫자가 5 이상이면 올려서 ${target}, 5 미만이면 버려서 ${nj(target, '이/가')} 돼야 해요. `),
      txt(`그 범위는 ${lo} 이상 ${hi} 이하예요. `),
      txt(`${nj(answer, '이/가')} 이 범위에 속해요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: `반올림하여 ${placeLabel}의 자리까지 나타내면 ${nj(target, '이/가')} 되는 수를 고르세요.`,
      choices,
      answerIndex,
      explanation,
    };
  },
};

export const unitRangeSkills: SkillDef[] = [
  rangeInclude,
  rangeBoundary,
  rangeWord,
  roundUpSkill,
  roundDownSkill,
  roundHalfSkill,
  roundWordSkill,
  roundPick,
];
