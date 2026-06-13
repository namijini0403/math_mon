/**
 * auth.ts — JWT (HS256) + scrypt PIN 해시 유틸
 * 외부 의존성 없이 node:crypto만 사용
 */

import { createHmac, randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';

// ── 비밀키 ──────────────────────────────────────────────────────────────────
let jwtSecret: string;
if (process.env.JWT_SECRET) {
  jwtSecret = process.env.JWT_SECRET;
} else {
  jwtSecret = randomBytes(32).toString('hex');
  console.warn(
    '[auth] JWT_SECRET 환경변수가 없어 랜덤 키로 초기화되었습니다. ' +
      '서버 재시작 시 기존 토큰이 모두 무효화됩니다. 운영 환경에서는 반드시 JWT_SECRET을 설정하세요.',
  );
}

// ── Base64url 인코더/디코더 ──────────────────────────────────────────────────
function b64uEncode(data: string | Buffer): string {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64uDecode(str: string): Buffer {
  // padding 복원
  const padded = str + '==='.slice((str.length + 3) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

// ── HS256 JWT ────────────────────────────────────────────────────────────────
const JWT_HEADER = b64uEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

function hmac256(message: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(message).digest();
}

export interface TokenPayload {
  sid: string;    // studentId
  pid: string;    // pseudonymId
  typ?: 'refresh';
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, expiresInSec: number): string {
  const now = Math.floor(Date.now() / 1000);
  const full = { ...payload, iat: now, exp: now + expiresInSec } as TokenPayload;
  const headerPayload = `${JWT_HEADER}.${b64uEncode(JSON.stringify(full))}`;
  const sig = b64uEncode(hmac256(headerPayload, jwtSecret));
  return `${headerPayload}.${sig}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payloadB64, sigB64] = parts;

    // 서명 검증 (timing-safe)
    const expected = b64uEncode(hmac256(`${header}.${payloadB64}`, jwtSecret));
    const expectedBuf = Buffer.from(expected, 'utf8');
    const givenBuf = Buffer.from(sigB64, 'utf8');
    if (expectedBuf.length !== givenBuf.length) return null;
    if (!timingSafeEqual(expectedBuf, givenBuf)) return null;

    // payload 파싱
    const payload = JSON.parse(b64uDecode(payloadB64).toString('utf8')) as TokenPayload;

    // exp 검증
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}

/** 토큰 만료까지 남은 초. 유효하지 않은 토큰이면 0 반환 */
export function tokenRemainingSeconds(token: string): number {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return 0;
    const payload = JSON.parse(b64uDecode(parts[1]).toString('utf8')) as TokenPayload;
    if (typeof payload.exp !== 'number') return 0;
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  } catch {
    return 0;
  }
}

// ── scrypt PIN 해시 ──────────────────────────────────────────────────────────
/** node:crypto scrypt를 Promise로 래핑 (options 포함) */
function scryptAsync(
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    _scrypt(password, salt, keylen, options, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 32;
const SCRYPT_VERSION = 'v1';

/**
 * PIN을 scrypt로 해시. 반환값 형식: "v1:salt(hex):hash(hex)"
 * salt가 제공되지 않으면 랜덤 생성.
 */
export async function scryptHash(pin: string, existingSalt?: string): Promise<string> {
  const salt = existingSalt ?? randomBytes(16).toString('hex');
  const key = (await scryptAsync(pin, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })) as Buffer;
  return `${SCRYPT_VERSION}:${salt}:${key.toString('hex')}`;
}

/**
 * PIN이 scrypt 해시와 일치하는지 검증 (timing-safe)
 * 형식: "v1:salt:hash"
 */
export async function scryptVerify(pin: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split(':');
    if (parts.length !== 3 || parts[0] !== SCRYPT_VERSION) return false;
    const [, salt, hashHex] = parts;
    const key = (await scryptAsync(pin, salt, SCRYPT_KEYLEN, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
    })) as Buffer;
    const storedBuf = Buffer.from(hashHex, 'hex');
    if (key.length !== storedBuf.length) return false;
    return timingSafeEqual(key, storedBuf);
  } catch {
    return false;
  }
}
