/**
 * 단원: 시각과 시간 (2022 개정교육과정 2-2 4단원)
 * 성취기준: 몇 시 몇 분 읽기(서술→빈칸 2개), 시간↔분 변환(1시간=60분),
 * 걸린 시간 계산, 하루·1주일·1년 단위, 문장제.
 *
 * fill-blanks 답은 양의 정수 → 시간 0시는 피함.
 * 시간 변환에서 분이 0인 경우는 별도 처리.
 */

import { RNG } from '../rng';
import { nj } from '../josa';
import type { MathExpr, SkillDef } from '../types';

const txt = (text: string) => ({ kind: 'text' as const, text });

// ── 1. time2-read  몇 시 몇 분 읽기 (fill-blanks 빈칸 2개)  난이도 1 ──────────
const time2Read: SkillDef = {
  id: 'time2-read',
  unitId: 'unitTime2',
  difficulty: 1,
  title: '몇 시 몇 분 읽기',
  note: '짧은바늘·긴바늘 서술 → 몇 시 몇 분. fill-blanks 빈칸 2개 [시, 분]. 분은 5분 단위.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    // 시: 1~12, 분: 5분 단위(5~55) — 0분이면 빈칸이 0이 되어 양의정수 위반 → 제외
    let hour = 1, minute = 5;
    for (let tries = 0; tries < 200; tries++) {
      const th = rng.int(1, 12);
      const tm = rng.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const);
      if (th >= 1 && tm >= 5) { hour = th; minute = tm; break; }
    }
    const longHandPos = minute / 5; // 긴바늘이 가리키는 숫자

    const expr: MathExpr = [
      { kind: 'blank', slot: 0 }, txt(' 시 '),
      { kind: 'blank', slot: 1 }, txt(' 분'),
    ];
    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt: `짧은바늘이 ${hour}, 긴바늘이 ${nj(longHandPos, '을/를')} 가리켜요. 몇 시 몇 분인가요?`,
      expr,
      blankAnswers: [hour, minute],
      explanation: [txt(`짧은바늘이 ${nj(hour, '을/를')} 가리키면 ${hour}시예요. 긴바늘이 ${nj(longHandPos, '을/를')} 가리키면 5분씩 ${longHandPos}칸이라 ${minute}분이에요. 그래서 ${hour}시 ${minute}분이에요.`)],
    };
  },
};

// ── 2. time2-conv  시간↔분 변환 (fill-blanks)  난이도 1 ──────────────────────
const time2Conv: SkillDef = {
  id: 'time2-conv',
  unitId: 'unitTime2',
  difficulty: 1,
  title: '시간↔분 변환',
  note: '1시간=60분 관계 변환. fill-blanks. 정수 스케일. 패턴4개×(시간5종×분8종) = 약46종.',
  minVariety: 40,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 3);

    let prompt: string;
    let expr: MathExpr;
    let blankAnswers: number[];
    let expl: string;

    if (pat === 0) {
      // n시간 = ? 분
      const h = rng.int(1, 5);
      const mins = h * 60;
      prompt = `${h}시간은 몇 분인가요?`;
      expr = [txt(`${h}시간 = `), { kind: 'blank', slot: 0 }, txt('분')];
      blankAnswers = [mins];
      expl = `1시간은 60분이에요. ${h}시간은 60분씩 ${h}묶음이니 ${mins}분이에요.`;
    } else if (pat === 1) {
      // n분 = ? 시간 (60의 배수만)
      const h = rng.int(1, 5);
      const mins = h * 60;
      prompt = `${mins}분은 몇 시간인가요?`;
      expr = [txt(`${mins}분 = `), { kind: 'blank', slot: 0 }, txt('시간')];
      blankAnswers = [h];
      expl = `60분이 1시간이에요. ${mins}분은 60분씩 ${h}묶음이니 ${h}시간이에요.`;
    } else if (pat === 2) {
      // 1시간 n분 = ? 분
      const h = rng.int(1, 3);
      const extraMin = rng.pick([10, 15, 20, 25, 30, 35, 40, 45] as const);
      const total = h * 60 + extraMin;
      prompt = `${h}시간 ${extraMin}분은 모두 몇 분인가요?`;
      expr = [txt(`${h}시간 ${extraMin}분 = `), { kind: 'blank', slot: 0 }, txt('분')];
      blankAnswers = [total];
      expl = `${h}시간은 60분씩 ${h}묶음이라 ${h * 60}분이에요. 거기에 ${extraMin}분을 더하면 ${h * 60} + ${extraMin} = ${total}분이에요.`;
    } else {
      // ? 분 = n시간 ? 분 (역: 총 분 → 시, 분)
      const h = rng.int(1, 3);
      const extraMin = rng.pick([10, 15, 20, 30] as const);
      const total = h * 60 + extraMin;
      prompt = `${total}분은 몇 시간 몇 분인가요?`;
      expr = [
        { kind: 'blank', slot: 0 }, txt('시간 '),
        { kind: 'blank', slot: 1 }, txt('분'),
      ];
      blankAnswers = [h, extraMin];
      expl = `60분이 1시간이에요. ${total}분을 60분씩 묶으면 ${h}묶음(=${h}시간)이 되고 ${extraMin}분이 남아요 → ${h}시간 ${extraMin}분이에요.`;
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers,
      explanation: [txt(expl)],
    };
  },
};

// ── 3. time2-elapsed  걸린 시간 계산 (fill-blanks)  난이도 2 ──────────────────
// 유형A: 끝 시각 구하기 (빈칸 2개: endH, endM) → endH,endM 모두 양의 정수 보장
// 유형B: 걸린 시간 구하기 (빈칸 1개: elapsed분) → elapsed 양의 정수 보장
const time2Elapsed: SkillDef = {
  id: 'time2-elapsed',
  unitId: 'unitTime2',
  difficulty: 2,
  title: '걸린 시간 계산',
  note: '시작 시각 + 걸린 시간 = 끝 시각, 또는 역산. fill-blanks. endH,endM,elapsed >= 1 보장.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);

    if (pat === 0) {
      // 유형A: 시작 + 걸린 시간(시간+분) = ? (빈칸 2개: 끝 시, 끝 분)
      // endM >= 1 보장: startM + elapsedMRem != 0 (60의 배수 아님)
      let startH = 9, startM = 10, elapsedH = 1, elapsedMRem = 30;
      let endH = 10, endM = 40;
      for (let tries = 0; tries < 300; tries++) {
        const sh = rng.int(9, 11);
        const sm = rng.pick([5, 10, 15, 20, 25, 30, 35, 40] as const);
        const eh = rng.int(1, 2);
        const emr = rng.pick([5, 10, 15, 20, 25, 30, 35, 40, 45] as const);
        const totalStart = sh * 60 + sm;
        const totalEnd = totalStart + eh * 60 + emr;
        const fendH = Math.floor(totalEnd / 60);
        const fendM = totalEnd % 60;
        if (fendH >= 1 && fendM >= 1 && fendH <= 23) {
          startH = sh; startM = sm; elapsedH = eh; elapsedMRem = emr;
          endH = fendH; endM = fendM;
          break;
        }
      }
      const expr: MathExpr = [
        { kind: 'blank', slot: 0 }, txt('시 '),
        { kind: 'blank', slot: 1 }, txt('분'),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${startH}시 ${startM}분에 시작하여 ${elapsedH}시간 ${elapsedMRem}분 후에 끝났어요. 끝난 시각은 몇 시 몇 분인가요?`,
        expr,
        blankAnswers: [endH, endM],
        explanation: [txt(`${startH}시 ${startM}분 + ${elapsedH}시간 ${elapsedMRem}분 = ${endH}시 ${endM}분`)],
      };
    } else {
      // 유형B: 시작 + ? 분 = 끝 (걸린 분 단위로만) — elapsed >= 1 보장(픽 목록에서 0 제외)
      const elapsed2 = rng.pick([20, 25, 30, 35, 40, 45, 50] as const);
      const startH2 = rng.int(9, 12);
      const startM2 = rng.pick([5, 10, 15, 20, 25, 30] as const);
      const total2 = startH2 * 60 + startM2 + elapsed2;
      const endH2 = Math.floor(total2 / 60);
      const endM2 = total2 % 60;
      const expr: MathExpr = [{ kind: 'blank', slot: 0 }, txt('분')];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${startH2}시 ${startM2}분에 시작하여 ${endH2}시 ${endM2}분에 끝났어요. 걸린 시간은 몇 분인가요?`,
        expr,
        blankAnswers: [elapsed2],
        explanation: [txt(`${endH2}시 ${endM2}분 − ${startH2}시 ${startM2}분 = ${elapsed2}분`)],
      };
    }
  },
};

// ── 4. time2-units  하루·1주일·1년 단위 (fill-blanks)  난이도 1 ────────────────
const time2Units: SkillDef = {
  id: 'time2-units',
  unitId: 'unitTime2',
  difficulty: 1,
  title: '하루·1주일·1년 단위',
  note: '1일=24시간, 1주일=7일, 1년=12개월=365일. fill-blanks. 6패턴×조합 = 약20종.',
  minVariety: 18,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 5);

    let prompt: string;
    let expr: MathExpr;
    let blankAnswers: number[];
    let expl: string;

    if (pat === 0) {
      // n일 = ? 시간
      const d = rng.int(1, 7);
      const ans = d * 24;
      prompt = `${d}일은 몇 시간인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('시간')];
      blankAnswers = [ans];
      expl = `하루는 24시간이에요. ${d}일은 24시간씩 ${d}묶음이니 ${ans}시간이에요.`;
    } else if (pat === 1) {
      // n주일 = ? 일
      const w = rng.int(1, 4);
      const ans = w * 7;
      prompt = `${w}주일은 몇 일인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('일')];
      blankAnswers = [ans];
      expl = `1주일은 7일이에요. ${w}주일은 7일씩 ${w}묶음이니 ${ans}일이에요.`;
    } else if (pat === 2) {
      // 1년 = ? 개월
      prompt = `1년은 몇 개월인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('개월')];
      blankAnswers = [12];
      expl = `1년 = 12개월`;
    } else if (pat === 3) {
      // 1년 = ? 일
      prompt = `1년은 몇 일인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('일')];
      blankAnswers = [365];
      expl = `1년 = 365일`;
    } else if (pat === 4) {
      // n개월 = ? 주일 (12개월 이내, 4의 배수 주일)
      const months = rng.int(1, 4);
      const approxWeeks = months * 4;
      prompt = `${months}개월은 약 몇 주일인가요? (한 달은 4주로 계산하세요.)`;
      expr = [{ kind: 'blank', slot: 0 }, txt('주일')];
      blankAnswers = [approxWeeks];
      expl = `한 달은 약 4주예요. ${months}개월은 4주씩 ${months}묶음이니 약 ${approxWeeks}주일이에요.`;
    } else {
      // ? 시간 = n일
      const h = rng.pick([24, 48, 72] as const);
      const days = h / 24;
      prompt = `${h}시간은 며칠인가요?`;
      expr = [{ kind: 'blank', slot: 0 }, txt('일')];
      blankAnswers = [days];
      expl = `24시간이 하루예요. ${h}시간을 24시간씩 묶으면 ${days}묶음이니 ${days}일이에요.`;
    }

    return {
      id: `${this.id}:${seed}`,
      skillId: this.id,
      seed,
      format: 'fill-blanks',
      prompt,
      expr,
      blankAnswers,
      explanation: [txt(expl)],
    };
  },
};

// ── 5. time2-word  시각과 시간 문장제 (fill-blanks)  난이도 2 ──────────────────
const NAMES_TIME = ['민준', '수아', '지호', '하은', '도현', '유나'];
const time2Word: SkillDef = {
  id: 'time2-word',
  unitId: 'unitTime2',
  difficulty: 2,
  word: true,
  title: '시각과 시간 문장제',
  note: '시각·시간 관련 문장제. fill-blanks 빈칸 1~2개.',
  minVariety: 60,
  generate(seed) {
    const rng = new RNG(seed);
    const pat = rng.int(0, 1);
    const name = rng.pick(NAMES_TIME);

    if (pat === 0) {
      // 걸린 시간 문장제 (endH, endM 모두 양의 정수 보장)
      let startH = 9, startM = 10, elapsed = 35;
      let endH = 9, endM = 45;
      for (let tries = 0; tries < 300; tries++) {
        const sh = rng.int(9, 12);
        const sm = rng.pick([5, 10, 15, 20, 25, 30] as const);
        const el = rng.pick([25, 30, 35, 40, 45, 50] as const);
        const total = sh * 60 + sm + el;
        const fendH = Math.floor(total / 60);
        const fendM = total % 60;
        if (fendH >= 1 && fendM >= 1) {
          startH = sh; startM = sm; elapsed = el; endH = fendH; endM = fendM; break;
        }
      }
      const acts = ['도서관 공부', '수학 숙제', '그림 그리기', '피아노 연습', '책 읽기'];
      const act = rng.pick(acts);
      const expr: MathExpr = [
        { kind: 'blank', slot: 0 }, txt('시 '),
        { kind: 'blank', slot: 1 }, txt('분'),
      ];
      return {
        id: `${this.id}:${seed}`,
        skillId: this.id,
        seed,
        format: 'fill-blanks',
        prompt: `${name}이는 ${startH}시 ${startM}분에 ${nj(act, '을/를')} 시작하여 ${elapsed}분 동안 했어요. ${nj(act, '이/가')} 끝난 시각은 몇 시 몇 분인가요?`,
        expr,
        blankAnswers: [endH, endM],
        explanation: [txt(`${startH}시 ${startM}분 + ${elapsed}분 = ${endH}시 ${endM}분`)],
      };
    } else {
      // 시간 변환 문장제
      const h = rng.int(1, 3);
      const extra = rng.pick([10, 15, 20, 30] as const);
      const totalMin = h * 60 + extra;
      const acts = ['마라톤 달리기', '버스 타기', '영화 보기', '게임 하기', '자전거 타기'];
      const act = rng.pick(acts);
      let expr: MathExpr;
      let blankAnswers: number[];
      let expl: string;
      if (extra > 0) {
        expr = [{ kind: 'blank', slot: 0 }, txt('분')];
        blankAnswers = [totalMin];
        expl = `${h}시간은 60분씩 ${h}묶음이라 ${h * 60}분이에요. 거기에 ${extra}분을 더하면 ${h * 60} + ${extra} = ${totalMin}분이에요.`;
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `${name}이는 ${nj(act, '을/를')} ${h}시간 ${extra}분 했어요. 모두 몇 분인가요?`,
          expr,
          blankAnswers,
          explanation: [txt(expl)],
        };
      } else {
        expr = [{ kind: 'blank', slot: 0 }, txt('분')];
        blankAnswers = [h * 60];
        expl = `${h}시간은 60분씩 ${h}묶음이니 ${h * 60}분이에요.`;
        return {
          id: `${this.id}:${seed}`,
          skillId: this.id,
          seed,
          format: 'fill-blanks',
          prompt: `${name}이는 ${nj(act, '을/를')} ${h}시간 했어요. 모두 몇 분인가요?`,
          expr,
          blankAnswers,
          explanation: [txt(expl)],
        };
      }
    }
  },
};

export const unitTime2Skills: SkillDef[] = [
  time2Read,
  time2Conv,
  time2Elapsed,
  time2Units,
  time2Word,
];
