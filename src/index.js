// Cloudflare Worker 진입점: 주소(URL)에 따라 알맞은 페이지/API 로 연결합니다.
import styles from './styles.css';
import adminHtml from './admin.html';
import loginHtml from './login.html';
import { homePage, postPage, notFoundPage } from './render.js';
import { renderMarkdown } from './markdown.js';
import { checkPassword, makeSessionCookie, clearSessionCookie, isLoggedIn } from './auth.js';

const POST_FIELDS = ['slug', 'category', 'code', 'title', 'summary', 'body_md', 'cover_url', 'tools', 'year', 'repo_url', 'badge', 'pen_note', 'sort_order', 'published'];
const CATEGORIES = ['cad', 'software', 'note'];
const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'application/pdf': 'pdf' };
const MAX_UPLOAD = 20 * 1024 * 1024; // 20MB

const html = (body, status = 200, headers = {}) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers } });
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

async function getSettings(env) {
  const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
  const s = Object.fromEntries(results.map((r) => [r.key, r.value]));
  s.site_title = env.SITE_TITLE;
  return s;
}

async function handlePublic(request, env, url) {
  const path = url.pathname;

  if (path === '/styles.css') {
    return new Response(styles, { headers: { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
  }

  if (path.startsWith('/images/')) {
    const key = decodeURIComponent(path.slice('/images/'.length));
    const obj = await env.IMAGES.get(key);
    if (!obj) return new Response('Not found', { status: 404 });
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('etag', obj.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('X-Content-Type-Options', 'nosniff');
    if (headers.get('Content-Type') === 'image/svg+xml') headers.set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    return new Response(obj.body, { headers });
  }

  const s = await getSettings(env);

  if (path === '/') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM posts WHERE published = 1 ORDER BY sort_order ASC, id ASC'
    ).all();
    return html(homePage(s, results));
  }

  const m = /^\/posts\/([^/]+)\/?$/.exec(path);
  if (m) {
    const post = await env.DB.prepare('SELECT * FROM posts WHERE slug = ? AND published = 1')
      .bind(decodeURIComponent(m[1]))
      .first();
    if (post) return html(postPage(s, post));
  }

  return html(notFoundPage(s), 404);
}

function cleanPost(input) {
  const p = {};
  for (const f of POST_FIELDS) if (f in input) p[f] = input[f];
  if ('slug' in p) {
    p.slug = String(p.slug).trim().toLowerCase().replace(/[^a-z0-9가-힣-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!p.slug) throw new Error('주소(slug)를 입력해 주세요.');
  }
  if ('category' in p && !CATEGORIES.includes(p.category)) throw new Error('분류가 올바르지 않습니다.');
  if ('title' in p && !String(p.title).trim()) throw new Error('제목을 입력해 주세요.');
  if ('sort_order' in p) p.sort_order = Number(p.sort_order) || 0;
  if ('published' in p) p.published = p.published ? 1 : 0;
  for (const k of Object.keys(p)) if (typeof p[k] === 'string') p[k] = p[k].replace(/\r\n/g, '\n');
  return p;
}

async function handleAdminApi(request, env, url) {
  const path = url.pathname.slice('/api/admin'.length);
  const method = request.method;

  if (path === '/posts' && method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT id, slug, category, code, title, published, sort_order, updated_at FROM posts ORDER BY category, sort_order, id'
    ).all();
    return json(results);
  }

  if (path === '/posts' && method === 'POST') {
    const p = cleanPost(await request.json());
    if (!p.slug || !p.title || !p.category) throw new Error('제목, 주소, 분류는 꼭 입력해 주세요.');
    const cols = Object.keys(p);
    const row = await env.DB.prepare(
      `INSERT INTO posts (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')}) RETURNING id`
    ).bind(...cols.map((c) => p[c])).first();
    return json({ id: row.id }, 201);
  }

  const pm = /^\/posts\/(\d+)$/.exec(path);
  if (pm) {
    const id = Number(pm[1]);
    if (method === 'GET') {
      const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
      return post ? json(post) : json({ error: '글이 없습니다.' }, 404);
    }
    if (method === 'PUT') {
      const p = cleanPost(await request.json());
      const cols = Object.keys(p);
      if (!cols.length) return json({ ok: true });
      await env.DB.prepare(
        `UPDATE posts SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`
      ).bind(...cols.map((c) => p[c]), id).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
  }

  if (path === '/settings' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
    return json(Object.fromEntries(results.map((r) => [r.key, r.value])));
  }

  if (path === '/settings' && method === 'PUT') {
    const data = await request.json();
    const stmt = env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    const batch = Object.entries(data)
      .filter(([k]) => /^[a-z_]{1,40}$/.test(k))
      .map(([k, v]) => stmt.bind(k, String(v ?? '').replace(/\r\n/g, '\n')));
    if (batch.length) await env.DB.batch(batch);
    return json({ ok: true });
  }

  if (path === '/preview' && method === 'POST') {
    const { md } = await request.json();
    return json({ html: renderMarkdown(md) });
  }

  if (path === '/images' && method === 'POST') {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') throw new Error('파일이 없습니다.');
    const ext = IMAGE_TYPES[file.type];
    if (!ext) throw new Error('PNG, JPG, GIF, WEBP, SVG, PDF 파일만 올릴 수 있습니다.');
    if (file.size > MAX_UPLOAD) throw new Error('20MB 이하 파일만 올릴 수 있습니다.');
    const base = (file.name || 'image').replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9가-힣-]+/g, '-').slice(0, 40) || 'image';
    const key = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;
    await env.IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
    return json({ url: `/images/${key}`, name: file.name, type: file.type }, 201);
  }

  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const secure = url.protocol === 'https:';

    try {
      if (path === '/admin' || path === '/admin/') {
        if (!(await isLoggedIn(request, env))) return html(loginHtml, 200, { 'Cache-Control': 'no-store' });
        return html(adminHtml, 200, { 'Cache-Control': 'no-store' });
      }

      if (path === '/admin/login' && request.method === 'POST') {
        const form = await request.formData();
        if (await checkPassword(env, form.get('password') || '')) {
          return new Response(null, { status: 303, headers: { Location: '/admin', 'Set-Cookie': await makeSessionCookie(env, secure) } });
        }
        return html(loginHtml.replace('<!--ERROR-->', '<p class="error" role="alert">비밀번호가 맞지 않습니다.</p>'), 401);
      }

      if (path === '/admin/logout' && request.method === 'POST') {
        return new Response(null, { status: 303, headers: { Location: '/', 'Set-Cookie': clearSessionCookie() } });
      }

      if (path.startsWith('/api/admin')) {
        if (!(await isLoggedIn(request, env))) return json({ error: '로그인이 필요합니다.' }, 401);
        // 다른 사이트에서 보낸 요청 차단
        const origin = request.headers.get('Origin');
        if (request.method !== 'GET' && origin && origin !== url.origin) return json({ error: 'Forbidden' }, 403);
        try {
          return await handleAdminApi(request, env, url);
        } catch (e) {
          const msg = String(e.message || e);
          if (msg.includes('UNIQUE')) return json({ error: '같은 주소(slug)를 쓰는 글이 이미 있습니다.' }, 400);
          return json({ error: msg }, 400);
        }
      }

      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
      return await handlePublic(request, env, url);
    } catch (e) {
      console.error(e);
      return new Response('서버 오류가 발생했습니다: ' + (e.message || e), { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  },
};
