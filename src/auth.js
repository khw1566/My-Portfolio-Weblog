// 관리자 로그인: 비밀번호 확인 후 서명된 쿠키를 발급합니다.
// 비밀번호(ADMIN_PASSWORD)와 서명 키(SESSION_SECRET)는 Cloudflare 비밀값으로 넣습니다.

const COOKIE = 'pf_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7일

const enc = new TextEncoder();

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** 길이가 달라도 시간이 일정한 문자열 비교 */
async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(String(a))),
    crypto.subtle.digest('SHA-256', enc.encode(String(b))),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function secretOf(env) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    throw new Error('ADMIN_PASSWORD 와 SESSION_SECRET 비밀값을 설정해 주세요.');
  }
  return env.SESSION_SECRET + ':' + env.ADMIN_PASSWORD;
}

export async function checkPassword(env, password) {
  secretOf(env);
  return safeEqual(password, env.ADMIN_PASSWORD);
}

const COOKIES = { admin: COOKIE, hr: 'pf_hr' };
const SAMESITE = { admin: 'Strict', hr: 'Lax' };

/** scope: 'admin' = 관리자, 'hr' = 인사담당자 퀴즈 통과 */
export async function makeSessionCookie(env, secure, scope = 'admin') {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const token = `${exp}.${await hmac(secretOf(env), scope + ':' + exp)}`;
  return `${COOKIES[scope]}=${token}; Path=/; HttpOnly; SameSite=${SAMESITE[scope]}; Max-Age=${MAX_AGE}${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie(scope = 'admin') {
  return `${COOKIES[scope]}=; Path=/; HttpOnly; SameSite=${SAMESITE[scope]}; Max-Age=0`;
}

export async function hasSession(request, env, scope) {
  const cookie = request.headers.get('Cookie') || '';
  const m = new RegExp(`(?:^|;\\s*)${COOKIES[scope]}=([^;]+)`).exec(cookie);
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await hmac(secretOf(env), scope + ':' + exp));
}

export const isLoggedIn = (request, env) => hasSession(request, env, 'admin');

/** 인사담당자 퀴즈 정답 비교: 띄어쓰기·대소문자 무시 */
export function quizMatches(answer, expected) {
  const norm = (x) => String(x || '').replace(/\s+/g, '').toLowerCase();
  return !!norm(expected) && norm(answer) === norm(expected);
}
