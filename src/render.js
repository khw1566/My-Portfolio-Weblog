// 공개 페이지 HTML 을 만드는 함수들
import { renderMarkdown, renderInline, plainText } from './markdown.js';

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** http(s) 또는 사이트 내부 경로만 링크로 허용 */
export function safeUrl(u) {
  const s = String(u ?? '').trim();
  if (/^https?:\/\//i.test(s) || s.startsWith('/')) return s;
  return '';
}

const FONTS =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+KR:wght@400;500;700&family=Nanum+Pen+Script&display=swap';

const UL_SVG =
  '<svg aria-hidden="true" class="ul-line" viewBox="0 0 200 12" preserveAspectRatio="none">' +
  '<path d="M3 7 C 45 3, 90 10, 135 6 S 185 4, 197 7" vector-effect="non-scaling-stroke"></path></svg>';
const CIRCLE_SVG =
  '<svg aria-hidden="true" viewBox="0 0 100 40" preserveAspectRatio="none">' +
  '<path d="M60 4 C 20 0, 2 12, 6 24 C 10 38, 80 40, 94 26 C 102 14, 80 2, 48 5" vector-effect="non-scaling-stroke"></path></svg>';

const underlined = (html) => `<span class="ul">${html}${UL_SVG}</span>`;

export function layout({ title, description, body, s }) {
  const name = plainText(s.name) || 'Portfolio';
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<div class="wrap">
<header class="site-header">
<a class="logo" href="/">${esc(name)} / ${esc(s.site_title || 'MECH.PORTFOLIO')}</a>
<nav class="site-nav" aria-label="주요 메뉴">
<a href="/#cad">01 CAD 설계</a>
<a href="/#code">02 소프트웨어</a>
<a href="/#posts">03 기록</a>
<a href="/#about">04 소개</a>
</nav>
</header>
${body}
<footer class="site-footer">
<span>© ${new Date().getFullYear()} ${esc(name)} · DWG NO. ${esc(s.drawing_no || '')}</span>
<a href="/admin">관리</a>
</footer>
</div>
</body>
</html>`;
}

function cadCard(p) {
  const img = p.cover_url
    ? `<img src="${esc(safeUrl(p.cover_url))}" alt="" loading="lazy">`
    : '[대표 이미지]';
  return `<a class="card" href="/posts/${esc(p.slug)}">
${p.badge ? `<span class="sticky">${esc(p.badge)}</span>` : ''}
<div class="card-img">${img}</div>
<div class="card-body">
<h3>${renderInline(p.title)}</h3>
<p>${renderInline(p.summary)}</p>
</div>
<div class="card-meta"><span>${esc(p.code)}</span><span>${esc(p.tools)}</span><span>${esc(p.year)}</span></div>
</a>`;
}

function swRow(p, i) {
  const code = i === 0 ? `<span class="circle">${esc(p.code)}${CIRCLE_SVG}</span>` : esc(p.code);
  const repo = safeUrl(p.repo_url);
  return `<tr>
<td class="sw-code">${code}</td>
<td class="sw-title"><a href="/posts/${esc(p.slug)}">${renderInline(p.title)}</a>${p.pen_note ? `<span class="pen">${esc(p.pen_note)}</span>` : ''}</td>
<td class="sw-desc">${renderInline(p.summary)}${repo ? `<br><a class="repo" href="${esc(repo)}">GitHub →</a>` : ''}</td>
<td class="sw-kind">${esc(p.tools)}</td>
</tr>`;
}

function noteItem(p) {
  return `<a class="note" href="/posts/${esc(p.slug)}">
<span class="note-meta">${esc(p.year)}${p.tools ? ' · ' + esc(p.tools) : ''}</span>
<span class="note-title">${renderInline(p.title)}</span>
<span class="note-sum">${renderInline(p.summary)}</span>
</a>`;
}

export function homePage(s, posts) {
  const cad = posts.filter((p) => p.category === 'cad');
  const sw = posts.filter((p) => p.category === 'software');
  const notes = posts.filter((p) => p.category === 'note');
  const github = safeUrl(s.github);
  const empty = (msg) => `<p class="empty">${msg}</p>`;

  const body = `
<section id="top" class="hero">
<div class="hero-text">
<p class="eyebrow">SHEET 00 — 표제</p>
<h1>${renderInline(s.hero_title)}</h1>
${s.hero_note ? `<p class="pen hero-note">${esc(s.hero_note)}</p>` : ''}
<p class="hero-desc">${renderInline(s.hero_desc)}</p>
<div class="btns">
<a class="btn btn-dark" href="#cad">프로젝트 보기</a>
${github ? `<a class="btn" href="${esc(github)}">GitHub</a>` : ''}
</div>
</div>
<table class="title-block">
<tbody>
<tr><th scope="row">NAME</th><td>${renderInline(s.name)}</td></tr>
<tr><th scope="row">SCHOOL</th><td>${renderInline(s.school)}</td></tr>
<tr><th scope="row">GRAD.</th><td>${renderInline(s.graduation)}</td></tr>
<tr><th scope="row">TOOLS</th><td>${renderInline(s.tools)}</td></tr>
<tr><th scope="row">DWG NO.</th><td class="mono">${esc(s.drawing_no)}</td></tr>
</tbody>
</table>
</section>

<section id="cad" class="section">
<div class="section-head">
<h2><span class="section-no">01</span>${underlined('CAD 설계 프로젝트')}${s.cad_note ? `<span class="pen">${esc(s.cad_note)}</span>` : ''}</h2>
</div>
${cad.length ? `<div class="cards">${cad.map(cadCard).join('')}</div>` : empty('아직 CAD 프로젝트가 없습니다. 관리 페이지에서 추가해 주세요.')}
</section>

<section id="code" class="section">
<div class="section-head">
<h2><span class="section-no">02</span>${underlined('소프트웨어 · 임베디드')}</h2>
${github ? `<a class="more" href="${esc(github)}">${esc(github.replace(/^https?:\/\//, ''))} →</a>` : ''}
</div>
${sw.length ? `<div class="table-box"><table class="sw-table">
<thead><tr><th scope="col">NO.</th><th scope="col">프로젝트</th><th scope="col">설명</th><th scope="col">분류</th></tr></thead>
<tbody>${sw.map(swRow).join('')}</tbody>
</table></div>` : empty('아직 소프트웨어 프로젝트가 없습니다.')}
</section>

<section id="posts" class="section">
<div class="section-head">
<h2><span class="section-no">03</span><mark class="hl">설계 노트</mark></h2>
</div>
${notes.length ? `<div class="notes">${notes.map(noteItem).join('')}</div>` : empty('아직 글이 없습니다.')}
</section>

<section id="about" class="about">
<div class="about-text">
<h2><span class="section-no">04</span> ${underlined('소개 · 연락처')}</h2>
<p>${renderInline(s.about)}</p>
${s.about_note ? `<p class="pen">${esc(s.about_note)}</p>` : ''}
</div>
<dl class="contact">
<dt>EMAIL</dt><dd>${/^[^\s@]+@[^\s@]+$/.test(s.email || '') ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : esc(s.email)}</dd>
${github ? `<dt>GITHUB</dt><dd><a href="${esc(github)}">${esc(github.replace(/^https?:\/\//, ''))}</a></dd>` : ''}
<dt>자격증</dt><dd>${renderInline(s.certificates)}</dd>
</dl>
</section>`;

  return layout({
    title: `${plainText(s.name)} | 기계공학 포트폴리오`,
    description: plainText(s.hero_desc),
    body,
    s,
  });
}

const CATEGORY_LABEL = { cad: 'CAD 설계', software: '소프트웨어 · 임베디드', note: '설계 노트' };

export function postPage(s, p) {
  const repo = safeUrl(p.repo_url);
  const rows = [
    p.code && ['NO.', esc(p.code)],
    p.tools && ['TOOLS', esc(p.tools)],
    p.year && ['DATE', esc(p.year)],
    repo && ['REPO', `<a href="${esc(repo)}">${esc(repo.replace(/^https?:\/\/(www\.)?github\.com\//, ''))}</a>`],
  ].filter(Boolean);

  const body = `
<article>
<header class="post-head">
<a class="back" href="/#${p.category === 'cad' ? 'cad' : p.category === 'software' ? 'code' : 'posts'}">← ${CATEGORY_LABEL[p.category]}</a>
<h1>${renderInline(p.title)}</h1>
${p.summary ? `<p class="lead">${renderInline(p.summary)}</p>` : ''}
${rows.length ? `<table class="post-sheet"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>` : ''}
</header>
${p.cover_url ? `<figure class="post-cover"><img src="${esc(safeUrl(p.cover_url))}" alt=""></figure>` : ''}
<div class="prose">${renderMarkdown(p.body_md)}</div>
</article>`;

  return layout({
    title: `${plainText(p.title)} | ${plainText(s.name)}`,
    description: plainText(p.summary),
    body,
    s,
  });
}

export function notFoundPage(s) {
  return layout({
    title: '페이지를 찾을 수 없습니다',
    description: '',
    body: `<section class="section"><h1>404 — 도면에 없는 페이지입니다</h1><p><a href="/">처음으로 돌아가기</a></p></section>`,
    s,
  });
}
