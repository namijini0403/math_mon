/** 한국어 조사 자동 선택 — 받침 유무에 따라 이/가, 을/를 등을 고른다 */

/** 숫자 끝자리의 한글 읽기 받침 여부 (영일이삼사오육칠팔구) */
const DIGIT_BATCHIM = [true, true, false, true, false, false, true, true, true, false];
/** ㄹ 받침으로 끝나는 숫자 (일·칠·팔) — '로'를 쓴다 */
const DIGIT_RIEUL = [false, true, false, false, false, false, false, true, true, false];

export function hasBatchim(word: string | number): boolean {
  const s = String(word);
  const last = s[s.length - 1];
  if (/[0-9]/.test(last)) return DIGIT_BATCHIM[Number(last)];
  const code = last.charCodeAt(0) - 0xac00;
  if (code < 0 || code >= 11172) return false;
  return code % 28 !== 0;
}

type JosaPair = '이/가' | '을/를' | '은/는' | '과/와' | '으로/로';

export function josa(word: string | number, pair: JosaPair): string {
  const b = hasBatchim(word);
  switch (pair) {
    case '이/가':
      return b ? '이' : '가';
    case '을/를':
      return b ? '을' : '를';
    case '은/는':
      return b ? '은' : '는';
    case '과/와':
      return b ? '과' : '와';
    case '으로/로': {
      if (!b) return '로';
      const s = String(word);
      const last = s[s.length - 1];
      if (/[0-9]/.test(last)) return DIGIT_RIEUL[Number(last)] ? '로' : '으로';
      const jong = (last.charCodeAt(0) - 0xac00) % 28;
      return jong === 8 ? '로' : '으로'; // ㄹ 받침은 '로'
    }
  }
}

/** 단어 + 조사 결합: nj(4, '을/를') → "4를" */
export function nj(word: string | number, pair: JosaPair): string {
  return `${word}${josa(word, pair)}`;
}

/** '이에요/예요' 어미만: yo(3) → "이에요", yo(2) → "예요" */
export function yo(word: string | number): string {
  return hasBatchim(word) ? '이에요' : '예요';
}

/** '이에요/예요' 선택: ida(3) → "3이에요", ida(2) → "2예요" */
export function ida(word: string | number): string {
  return `${word}${yo(word)}`;
}

/** 이름 + 주격: 받침 있으면 '지민이가', 없으면 '지우가' */
export function nameSubject(name: string): string {
  return name + (hasBatchim(name) ? '이가' : '가');
}
