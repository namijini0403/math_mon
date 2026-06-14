/**
 * 단원: 비례식과 비례배분 (2022 개정교육과정 6-2 4단원)
 * 성취기준: 비의 성질을 이해하고, 비례식을 알며, 비례배분을 문제 해결에 활용한다.
 */

import { RNG } from '../rng';
import { gcd } from '../fraction';
import { buildChoices } from '../choices';
import { josa, nj } from '../josa';
import type { ChoiceValue, MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text', text }) as const;

// ── 1. prop-simplify ──────────────────────────────────────────────────
// 간단한 자연수의 비: "12 : 18을 가장 간단한 자연수의 비로 나타내세요" → 2 : 3
const propSimplify: SkillDef = {
  id: 'prop-simplify',
  unitId: 'unitProportion',
  title: '자연수의 비 간단히 나타내기',
  note: 'gcd ≥ 2인 자연수 쌍을 골라 가장 간단한 자연수의 비로 약분. fill-blanks 2칸.',
  difficulty: 1,
  generate(seed) {
    const rng = new RNG(seed);

    // gcd ≥ 2인 쌍 생성 (결과 비의 각 항이 1~20)
    let p = 2, q = 3, g = 1, a = 4, b = 6;
    let guard = 0;
    do {
      p = rng.int(2, 15);
      q = rng.int(2, 15);
      g = rng.int(2, 9);
      a = p * g;
      b = q * g;
      // gcd(p,q)=1 이어야 결과가 서로소
      guard++;
      if (guard > 300) { p = 2; q = 3; g = 4; a = 8; b = 12; break; }
    } while (p === q || gcd(p, q) !== 1 || a > 90 || b > 90);

    const expr: MathExpr = [
      txt(`${a} : ${b} = `),
      { kind: 'blank', slot: 0 },
      txt(' : '),
      { kind: 'blank', slot: 1 },
    ];

    const explanation: MathExpr = [
      txt(`${nj(a, '과/와')} ${b}의 최대공약수는 ${g}예요. `),
      txt(`두 수를 각각 ${g}으로 나누면: ${a}÷${g}=${p}, ${b}÷${g}=${q}. `),
      txt(`가장 간단한 자연수의 비는 ${p} : ${q}예요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${a} : ${b}${josa(b, '을/를')} 가장 간단한 자연수의 비로 나타내세요.`,
      expr,
      blankAnswers: [p, q],
      explanation,
    };
  },
};

// ── 2. prop-simplify2 ─────────────────────────────────────────────────
// 소수/분수의 비를 자연수 비로: "0.3 : 0.7" → 3:7, "1/2 : 1/3" → 3:2
const propSimplify2: SkillDef = {
  id: 'prop-simplify2',
  unitId: 'unitProportion',
  title: '소수·분수의 비를 자연수 비로 나타내기',
  note: '소수끼리 또는 분수끼리인 비를 정수 배 해서 서로소 자연수 비로 변환. fill-blanks 2칸.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);
    const kind = rng.chance(0.5) ? 'decimal' : 'fraction';

    let promptText = '';
    let p = 1, q = 1;
    let exprLabel = '';
    let explanationTokens: MathExpr = [];

    if (kind === 'decimal') {
      // 소수 1자리: 0.a : 0.b → a:b 서로소
      let da = 1, db = 1;
      let guard = 0;
      do {
        da = rng.int(1, 9);
        db = rng.int(1, 9);
        guard++;
        if (guard > 200) { da = 3; db = 7; break; }
      } while (da === db || gcd(da, db) !== 1);
      p = da;
      q = db;
      const dp = (da / 10).toFixed(1);
      const dq = (db / 10).toFixed(1);
      promptText = `${dp} : ${dq}${josa(dq, '을/를')} 가장 간단한 자연수의 비로 나타내세요.`;
      exprLabel = `${dp} : ${dq} = `;
      explanationTokens = [
        txt(`소수 한 자리 수이므로 두 수에 10을 곱해요. `),
        txt(`${dp}×10=${da}, ${dq}×10=${db}. `),
        txt(`${nj(da, '과/와')} ${db}의 최대공약수는 1이므로 가장 간단한 자연수의 비는 ${p} : ${q}예요.`),
      ];
    } else {
      // 분수: 1/d1 : 1/d2 → d2 : d1 (분모 곱하기)
      // 결과가 서로소이려면 gcd(d2, d1)=1
      let d1 = 2, d2 = 3;
      let guard = 0;
      do {
        d1 = rng.int(2, 9);
        d2 = rng.int(2, 9);
        guard++;
        if (guard > 200) { d1 = 2; d2 = 3; break; }
      } while (d1 === d2 || gcd(d1, d2) !== 1);
      // 1/d1 : 1/d2 × (d1*d2) → d2 : d1
      p = d2;
      q = d1;
      promptText = `1/${d1} : 1/${d2}${josa(d2, '을/를')} 가장 간단한 자연수의 비로 나타내세요.`;
      exprLabel = `1/${d1} : 1/${d2} = `;
      explanationTokens = [
        txt(`분모의 최소공배수 ${nj(d1 * d2, '을/를')} 두 수에 곱해요. `),
        txt(`(1/${d1})×${d1 * d2}=${d2}, (1/${d2})×${d1 * d2}=${d1}. `),
        txt(`${nj(d2, '과/와')} ${d1}의 최대공약수는 1이므로 가장 간단한 자연수의 비는 ${p} : ${q}예요.`),
      ];
    }

    const expr: MathExpr = [
      txt(exprLabel),
      { kind: 'blank', slot: 0 },
      txt(' : '),
      { kind: 'blank', slot: 1 },
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: promptText,
      expr,
      blankAnswers: [p, q],
      explanation: explanationTokens,
    };
  },
};

// ── 3. prop-solve ─────────────────────────────────────────────────────
// 비례식에서 □: "3 : 4 = 9 : □" → 12. □ 위치 4곳 랜덤.
const propSolve: SkillDef = {
  id: 'prop-solve',
  unitId: 'unitProportion',
  title: '비례식에서 □ 구하기',
  note: '외항·내항의 곱이 같음을 이용해 □를 구한다. □ 위치 4곳 랜덤.',
  difficulty: 2,
  generate(seed) {
    const rng = new RNG(seed);

    // a : b = c : d 에서 a*d = b*c
    // 값들이 깔끔하게: a, b 서로소, k배 해서 c=a*k, d=b*k
    let a = 2, b = 3, k = 4;
    let guard = 0;
    do {
      a = rng.int(2, 9);
      b = rng.int(2, 9);
      k = rng.int(2, 9);
      guard++;
      if (guard > 300) { a = 3; b = 4; k = 3; break; }
    } while (a === b || gcd(a, b) !== 1 || a * k > 81 || b * k > 81);

    const c = a * k; // a * k
    const d = b * k; // b * k
    // a : b = c : d

    // □ 위치 0=a, 1=b, 2=c, 3=d
    const blankPos = rng.int(0, 3);
    const vals = [a, b, c, d];
    const answer = vals[blankPos];

    // 비례식 문자열 구성
    const slot = (pos: number): MathExpr =>
      pos === blankPos ? [{ kind: 'blank', slot: 0 }] : [txt(String(vals[pos]))];

    const expr: MathExpr = [
      ...slot(0), txt(' : '), ...slot(1),
      txt(' = '),
      ...slot(2), txt(' : '), ...slot(3),
    ];

    // 해설: 어느 위치가 □인지에 따른 풀이 설명
    let expl: string;
    if (blankPos === 0) {
      expl = `외항의 곱 = 내항의 곱: □×${d} = ${b}×${c} → □×${d} = ${b * c} → □ = ${b * c}÷${d} = ${answer}`;
    } else if (blankPos === 1) {
      expl = `외항의 곱 = 내항의 곱: ${a}×${d} = □×${c} → ${a * d} = □×${c} → □ = ${a * d}÷${c} = ${answer}`;
    } else if (blankPos === 2) {
      expl = `외항의 곱 = 내항의 곱: ${a}×${d} = ${b}×□ → ${a * d} = ${b}×□ → □ = ${a * d}÷${b} = ${answer}`;
    } else {
      expl = `외항의 곱 = 내항의 곱: ${a}×□ = ${b}×${c} → ${a}×□ = ${b * c} → □ = ${b * c}÷${a} = ${answer}`;
    }

    const explanation: MathExpr = [
      txt('비례식에서 외항의 곱과 내항의 곱은 같아요. '),
      txt(expl + '예요.'),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: '비례식에서 □에 알맞은 수를 구하세요.',
      expr,
      blankAnswers: [answer],
      explanation,
    };
  },
};

// ── 4. prop-property ──────────────────────────────────────────────────
// 비례식 찾기 choice: 비율이 같은 두 비로 이루어진 비례식을 고르세요.
const propProperty: SkillDef = {
  id: 'prop-property',
  unitId: 'unitProportion',
  title: '비례식 고르기',
  note: '비율이 같은 두 비로 이루어진 비례식을 4지선다에서 고른다. 후보 풀 6개 이상.',
  difficulty: 2,
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);

    // 정답 후보 풀: 실제 비례식인 것 (a:b = ka:kb)
    const correctPool: [number, number, number, number][] = [
      [2, 3, 4, 6],
      [3, 4, 6, 8],
      [2, 5, 4, 10],
      [3, 5, 6, 10],
      [4, 5, 8, 10],
      [2, 7, 4, 14],
      [3, 7, 6, 14],
      [1, 3, 3, 9],
      [2, 9, 4, 18],
      [5, 6, 10, 12],
    ];

    // 오답 후보 풀: 비율이 다른 것
    const wrongPool: [number, number, number, number][] = [
      [2, 3, 6, 4],
      [2, 3, 4, 9],
      [3, 2, 4, 6],
      [3, 4, 6, 10],
      [4, 5, 10, 8],
      [2, 5, 6, 10],
      [3, 5, 9, 10],
      [4, 6, 8, 12],  // 이건 실제 비례식이므로 제외해야 함
      [2, 7, 6, 14],
      [5, 3, 10, 9],
      [3, 8, 6, 14],
      [4, 7, 8, 11],
    ];

    // wrongPool에서 실제 비례식인 것 제거
    const trueWrongPool = wrongPool.filter(([a, b, c, d]) => a * d !== b * c);

    const correctTuple = rng.pick(correctPool);
    const [ca, cb, cc, cd] = correctTuple;
    const correctText = `${ca}:${cb} = ${cc}:${cd}`;
    const answer: ChoiceValue = { kind: 'text', text: correctText };

    // 오답 3개 선택 (정답과 텍스트 중복 방지)
    const shuffledWrong = rng.shuffle(trueWrongPool);
    const distrators: ChoiceValue[] = [];
    const usedTexts = new Set<string>([correctText]);
    for (const [a, b, c, d] of shuffledWrong) {
      if (distrators.length >= 3) break;
      const t = `${a}:${b} = ${c}:${d}`;
      if (usedTexts.has(t)) continue;
      usedTexts.add(t);
      distrators.push({ kind: 'text', text: t });
    }

    const { choices, answerIndex } = buildChoices(answer, distrators, rng);

    const explanation: MathExpr = [
      txt(`비례식은 비율이 같은 두 비로 이루어진 등식이에요. `),
      txt(`${ca}:${cb}의 비율 = ${ca}÷${cb}, ${cc}:${cd}의 비율 = ${cc}÷${cd}로 같아요. `),
      txt(`외항의 곱 ${ca}×${cd}=${ca * cd}, 내항의 곱 ${cb}×${cc}=${cb * cc}로 같으므로 비례식이에요.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'choice',
      prompt: '비율이 같은 두 비로 이루어진 비례식을 고르세요.',
      choices,
      answerIndex,
      explanation,
    };
  },
};

// ── 5. prop-divide ────────────────────────────────────────────────────
// 비례배분: "사탕 35개를 3:4로 나누어 가지면 각각 몇 개씩?"
const propDivide: SkillDef = {
  id: 'prop-divide',
  unitId: 'unitProportion',
  title: '비례배분',
  note: '전체를 주어진 비로 나누기. 전체가 (a+b)의 배수 보장. fill-blanks 2칸.',
  difficulty: 3,
  generate(seed) {
    const rng = new RNG(seed);

    // 이름 풀
    const namePairs: [string, string][] = [
      ['지민', '서연'],
      ['준호', '하은'],
      ['민준', '유나'],
      ['지우', '수아'],
      ['태양', '나은'],
      ['현우', '지아'],
    ];
    const [nameA, nameB] = rng.pick(namePairs);

    // 소재 풀
    const items: { name: string; unit: string }[] = [
      { name: '사탕', unit: '개' },
      { name: '구슬', unit: '개' },
      { name: '색종이', unit: '장' },
      { name: '스티커', unit: '장' },
      { name: '초콜릿', unit: '개' },
    ];
    const item = rng.pick(items);

    // a:b, 전체 = (a+b)*k
    let a = 2, b = 3, total = 10;
    let guard = 0;
    do {
      a = rng.int(2, 7);
      b = rng.int(2, 7);
      const k = rng.int(2, 8);
      total = (a + b) * k;
      guard++;
      if (guard > 300) { a = 3; b = 4; total = 35; break; }
    } while (a === b || total > 100 || total < 10);

    const shareA = Math.round(total * a / (a + b));
    const shareB = total - shareA;

    const expr: MathExpr = [
      { kind: 'blank', slot: 0 },
      txt(`${item.unit}, `),
      { kind: 'blank', slot: 1 },
      txt(item.unit),
    ];

    const explanation: MathExpr = [
      txt(`비례배분은 전체를 각 항의 비율만큼 나눠요. `),
      txt(`${nameA}: ${total} × ${a}/(${a}+${b}) = ${total} × ${a}/${a + b} = ${shareA}${item.unit}. `),
      txt(`${nameB}: ${total} × ${b}/(${a}+${b}) = ${total} × ${b}/${a + b} = ${shareB}${item.unit}.`),
    ];

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `${item.name} ${total}${item.unit}${josa(total, '을/를')} ${nameA}${josa(nameA, '과/와')} ${nameB}${josa(nameB, '이/가')} ${a} : ${b}로 나누어 가지면 각각 몇 ${item.unit}씩일까요?`,
      expr,
      blankAnswers: [shareA, shareB],
      explanation,
    };
  },
};

// ── 6. prop-word ──────────────────────────────────────────────────────
// 비례식 활용 문장제 (소재 5개 이상)
const propWord: SkillDef = {
  id: 'prop-word',
  unitId: 'unitProportion',
  title: '비례식 활용 문장제',
  note: '비례식을 세워 문제를 해결하는 문장제. 소재 6가지 풀. 모두 정수 답 보장.',
  difficulty: 3,
  word: true,
  generate(seed) {
    const rng = new RNG(seed);
    const templateIdx = rng.int(0, 5);

    let prompt = '';
    let answer = 0;
    let expr: MathExpr = [];
    let explanation: MathExpr = [];

    if (templateIdx === 0) {
      // 소재 0: 천 구입 — 3 m에 a원인 천을 x m 사면?
      const unitPrice = rng.pick([600, 800, 900, 1200, 1500, 2000]);
      const refLen = rng.pick([2, 3, 4, 5]);
      const buyLen = rng.pick([6, 7, 8, 9, 10, 12, 15]);
      const refCost = unitPrice * refLen;
      answer = unitPrice * buyLen;
      prompt = `${refLen} m에 ${refCost.toLocaleString()}원인 천을 ${buyLen} m 사려면 얼마가 필요할까요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('원')];
      explanation = [
        txt(`비례식: ${refLen} : ${refCost} = ${buyLen} : □. `),
        txt(`외항의 곱 = 내항의 곱: ${refLen}×□ = ${refCost}×${buyLen}. `),
        txt(`□ = ${refCost * buyLen}÷${refLen} = ${answer}원이에요.`),
      ];

    } else if (templateIdx === 1) {
      // 소재 1: 매실 주스 — 물과 원액을 p:q로 섞어 total mL 만들기 → 원액은?
      let p = 3, q = 2, total = 350;
      let guard = 0;
      do {
        p = rng.int(3, 7);
        q = rng.int(1, 4);
        const k = rng.int(2, 8);
        total = (p + q) * k * 10;
        guard++;
        if (guard > 200) { p = 5; q = 2; total = 350; break; }
      } while (p <= q || total > 600 || total < 100);
      answer = total * q / (p + q);
      prompt = `물과 매실 원액을 ${p} : ${q}로 섞어 주스 ${total} mL를 만들려고 해요. 매실 원액은 몇 mL 필요할까요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt(' mL')];
      explanation = [
        txt(`전체 ${total} mL를 물 : 원액 = ${p} : ${q}로 비례배분해요. `),
        txt(`원액: ${total} × ${q}/(${p}+${q}) = ${total} × ${q}/${p + q} = ${answer} mL예요.`),
      ];

    } else if (templateIdx === 2) {
      // 소재 2: 톱니바퀴 — A가 a번 돌 때 B가 b번. A가 n번 돌면 B는?
      let tA = 2, tB = 3, nA = 6;
      let guard = 0;
      do {
        tA = rng.int(2, 6);
        tB = rng.int(2, 6);
        const k = rng.int(2, 6);
        nA = tA * k;
        guard++;
        if (guard > 200) { tA = 2; tB = 3; nA = 6; break; }
      } while (tA === tB || gcd(tA, tB) !== 1 || nA > 36);
      answer = tB * (nA / tA);
      prompt = `톱니바퀴 가가 ${tA}번 돌 때 나가 ${tB}번 돕니다. 가가 ${nA}번 돌면 나는 몇 번 돌까요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('번')];
      explanation = [
        txt(`비례식: ${tA} : ${tB} = ${nA} : □. `),
        txt(`외항의 곱 = 내항의 곱: ${tA}×□ = ${tB}×${nA}. `),
        txt(`□ = ${tB * nA}÷${tA} = ${answer}번이에요.`),
      ];

    } else if (templateIdx === 3) {
      // 소재 3: 그림자 — 막대 a m에 그림자 b m → 나무 그림자 c m면 나무 높이?
      let stickH = 1, shadowS = 2, shadowT = 8;
      let guard = 0;
      do {
        stickH = rng.int(1, 3);
        shadowS = rng.int(2, 5);
        const k = rng.int(2, 6);
        shadowT = shadowS * k;
        guard++;
        if (guard > 200) { stickH = 1; shadowS = 2; shadowT = 8; break; }
      } while (shadowS === stickH || shadowT > 30 || (stickH * shadowT) % shadowS !== 0);
      answer = stickH * shadowT / shadowS;
      prompt = `높이가 ${stickH} m인 막대의 그림자 길이가 ${shadowS} m일 때, 나무의 그림자 길이가 ${shadowT} m이면 나무의 높이는 몇 m일까요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt(' m')];
      explanation = [
        txt(`같은 시각 그림자는 높이에 비례해요. `),
        txt(`비례식: ${stickH} : ${shadowS} = □ : ${shadowT}. `),
        txt(`외항의 곱 = 내항의 곱: ${stickH}×${shadowT} = ${shadowS}×□. `),
        txt(`□ = ${stickH * shadowT}÷${shadowS} = ${answer} m예요.`),
      ];

    } else if (templateIdx === 4) {
      // 소재 4: 지도 — 지도에서 a cm는 실제 b km. 지도에서 c cm면 실제 몇 km?
      let mapA = 2, realB = 5, mapC = 6;
      let guard = 0;
      do {
        mapA = rng.int(1, 4);
        realB = rng.int(2, 8);
        const k = rng.int(2, 5);
        mapC = mapA * k;
        guard++;
        if (guard > 200) { mapA = 2; realB = 5; mapC = 6; break; }
      } while (mapC > 20);
      answer = realB * mapC / mapA;
      prompt = `지도에서 ${mapA} cm가 실제 ${realB} km를 나타낼 때, 지도에서 ${mapC} cm인 거리는 실제 몇 km일까요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt(' km')];
      explanation = [
        txt(`비례식: ${mapA} : ${realB} = ${mapC} : □. `),
        txt(`외항의 곱 = 내항의 곱: ${mapA}×□ = ${realB}×${mapC}. `),
        txt(`□ = ${realB * mapC}÷${mapA} = ${answer} km예요.`),
      ];

    } else {
      // 소재 5: 속력 일정 — a분에 b m 걷는 사람, c분에 몇 m?
      let minA = 3, distB = 210, minC = 5;
      let guard = 0;
      do {
        const speed = rng.pick([60, 70, 80, 90, 100, 120]);
        minA = rng.int(2, 5);
        distB = speed * minA;
        minC = rng.int(3, 8);
        guard++;
        if (guard > 200) { minA = 3; distB = 210; minC = 5; break; }
      } while (minA === minC || (distB * minC) % minA !== 0);
      answer = distB * minC / minA;
      prompt = `일정한 빠르기로 ${minA}분에 ${distB} m를 걷는 사람이 ${minC}분 동안 걸으면 몇 m를 걸을까요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt(' m')];
      explanation = [
        txt(`비례식: ${minA} : ${distB} = ${minC} : □. `),
        txt(`외항의 곱 = 내항의 곱: ${minA}×□ = ${distB}×${minC}. `),
        txt(`□ = ${distB * minC}÷${minA} = ${answer} m예요.`),
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

export const unitProportionSkills: SkillDef[] = [
  propSimplify,
  propSimplify2,
  propSolve,
  propProperty,
  propDivide,
  propWord,
];
