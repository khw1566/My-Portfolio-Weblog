// 공개 페이지 HTML 을 만드는 함수들
// view = { hr: 인사담당자 모드 여부, quizError: 퀴즈 오답 여부, path: 현재 주소 }
import { renderMarkdown, renderInline, plainText } from './markdown.js';
import { FIELDS, SCALES, FIELD_LABEL, parseFields } from './fields.js';

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
  if (/^https?:\/\//i.test(s) || (s.startsWith('/') && !s.startsWith('//'))) return s;
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
const LOCK_SVG =
  '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="4" y="11" width="16" height="10" rx="1"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>';

const underlined = (html) => `<span class="ul">${html}${UL_SVG}</span>`;
const hrTag = (p) => (p.audience === 'hr' ? '<span class="hr-tag">HR 전용</span>' : '');
const siteName = (s) => plainText(s.public_name) || 'Portfolio';

export function layout({ title, description, body, s, view }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${view.hr ? '<meta name="robots" content="noindex">' : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
${view.hr ? `<div class="hr-bar"><span>${LOCK_SVG} 인사담당자 모드 · 이력과 연락처, 전용 글이 모두 보입니다</span>
<form method="post" action="/hr/lock"><button type="submit">다시 잠그기</button></form></div>` : ''}
<div class="wrap">
<header class="site-header">
<a class="logo" href="/">${esc(siteName(s))} / ${esc(s.site_title || 'PORTFOLIO')}</a>
<nav class="site-nav" aria-label="주요 메뉴">
<a href="/#hire">00 소개</a>
<a href="/#projects">01 프로젝트</a>
<a href="/#posts">02 기록</a>
${view.hr ? '<a href="/#resume">03 이력서</a>' : '<a href="/#hr">인사담당자 열람</a>'}
</nav>
</header>
${body}
<footer class="site-footer">
<span>© ${new Date().getFullYear()} ${esc(siteName(s))} · DWG NO. ${esc(s.drawing_no || '')}</span>
<a href="/admin">관리</a>
</footer>
</div>
</body>
</html>`;
}

/** "인사담당자이신가요?" 퀴즈 카드 */
function quizCard(s, view, next = '/') {
  return `<form id="hr" class="quiz" method="post" action="/hr/unlock">
<span class="sticky quiz-sticky">HR 전용 ✎</span>
<p class="quiz-q">${renderInline(s.quiz_question || '인사담당자이신가요? 제 이름이 뭘까요?')}</p>
<p class="quiz-help">정답을 입력하시면 학력·경력·자격증·연락처와 전용 글을 모두 보실 수 있습니다.</p>
<input type="hidden" name="next" value="${esc(next)}">
<label class="sr-only" for="hr-answer">정답</label>
<div class="quiz-row">
<input id="hr-answer" name="answer" autocomplete="off" required placeholder="이름 세 글자">
<button class="btn btn-dark" type="submit">열람하기</button>
</div>
${view.quizError ? '<p class="quiz-error" role="alert"><span class="pen">앗, 다시 한 번!</span> 정답이 아니에요. 지원서에 적힌 이름을 입력해 주세요.</p>' : ''}
</form>`;
}

const fieldTags = (p) => {
  const fs = parseFields(p.fields);
  return fs.length ? `<span class="field-tags">${fs.map((f) => `<span class="field-tag">${esc(FIELD_LABEL[f])}</span>`).join('')}</span>` : '';
};

function projectCard(p) {
  const img = p.cover_url
    ? `<img src="${esc(safeUrl(p.cover_url))}" alt="" loading="lazy">`
    : '[대표 이미지]';
  return `<a class="card" href="/posts/${esc(p.slug)}">
${p.badge ? `<span class="sticky">${esc(p.badge)}</span>` : ''}
<div class="card-img">${img}</div>
<div class="card-body">
${fieldTags(p)}
<h3>${renderInline(p.title)} ${hrTag(p)}</h3>
${p.pen_note ? `<span class="pen card-pen">${esc(p.pen_note)}</span>` : ''}
<p>${renderInline(p.summary)}</p>
</div>
<div class="card-meta"><span>${esc(p.code)}</span><span>${esc(p.tools)}</span><span>${esc(p.year)}</span></div>
</a>`;
}

function miniRow(p) {
  const code = p.badge ? `<span class="circle">${esc(p.code)}${CIRCLE_SVG}</span>` : esc(p.code);
  const repo = safeUrl(p.repo_url);
  return `<tr>
<td class="sw-code">${code}</td>
<td class="sw-title"><a href="/posts/${esc(p.slug)}">${renderInline(p.title)}</a> ${hrTag(p)}${p.pen_note ? `<span class="pen">${esc(p.pen_note)}</span>` : ''}</td>
<td class="sw-desc">${renderInline(p.summary)}${repo ? `<br><a class="repo" href="${esc(repo)}">GitHub →</a>` : ''}</td>
<td class="sw-kind">${fieldTags(p) || esc(p.tools)}</td>
</tr>`;
}

/** 분야 · 규모 필터 (링크로 동작해서 자바스크립트 없이도 됩니다) */
function filterBar(projects, view) {
  const href = (field, scale) => {
    const q = new URLSearchParams();
    if (field) q.set('field', field);
    if (scale) q.set('scale', scale);
    const qs = q.toString();
    return `/${qs ? '?' + qs : ''}#projects`;
  };
  const inScale = projects.filter((p) => !view.scale || p.scale === view.scale);
  const inField = projects.filter((p) => !view.field || parseFields(p.fields).includes(view.field));
  const chip = (label, count, url, on) =>
    count === 0 && !on
      ? `<span class="chip chip-off" aria-disabled="true">${esc(label)} <span class="chip-n">0</span></span>`
      : `<a class="chip" href="${url}"${on ? ' aria-current="true"' : ''}>${esc(label)} <span class="chip-n">${count}</span></a>`;
  return `<nav class="filters" aria-label="프로젝트 필터">
<div class="filter-row"><span class="filter-label">분야</span>
${chip('전체', inScale.length, href('', view.scale), !view.field)}
${FIELDS.map((f) => chip(f.label, inScale.filter((p) => parseFields(p.fields).includes(f.key)).length, href(f.key, view.scale), view.field === f.key)).join('')}
</div>
<div class="filter-row"><span class="filter-label">규모</span>
${chip('전체', inField.length, href(view.field, ''), !view.scale)}
${SCALES.map((x) => chip(x.label, inField.filter((p) => p.scale === x.key).length, href(view.field, x.key), view.scale === x.key)).join('')}
</div>
</nav>`;
}

function noteItem(p) {
  return `<a class="note" href="/posts/${esc(p.slug)}">
<span class="note-meta">${esc(p.year)}${p.tools ? ' · ' + esc(p.tools) : ''} ${hrTag(p)}</span>
<span class="note-title">${renderInline(p.title)}</span>
<span class="note-sum">${renderInline(p.summary)}</span>
</a>`;
}

function contactList(s, github) {
  const email = /^[^\s@]+@[^\s@]+$/.test(s.email || '') ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : esc(s.email);
  return `<dl class="contact">
<dt>NAME</dt><dd>${renderInline(s.name)}</dd>
<dt>EMAIL</dt><dd>${email}</dd>
${s.phone ? `<dt>PHONE</dt><dd>${esc(s.phone)}</dd>` : ''}
${github ? `<dt>GITHUB</dt><dd><a href="${esc(github)}">${esc(github.replace(/^https?:\/\//, ''))}</a></dd>` : ''}
</dl>`;
}

export function homePage(s, posts, view) {
  const projects = posts.filter((p) => p.category === 'project');
  const shown = projects.filter((p) => (!view.field || parseFields(p.fields).includes(view.field)) && (!view.scale || p.scale === view.scale));
  const shownNormal = shown.filter((p) => p.scale !== 'mini');
  const shownMini = shown.filter((p) => p.scale === 'mini');
  const notes = posts.filter((p) => p.category === 'note');
  const github = safeUrl(s.github);
  const empty = (msg) => `<p class="empty">${msg}</p>`;

  const titleBlock = view.hr
    ? `<tr><th scope="row">NAME</th><td>${renderInline(s.name)}</td></tr>
<tr><th scope="row">SCHOOL</th><td>${renderInline(s.school)}</td></tr>
<tr><th scope="row">GRAD.</th><td>${renderInline(s.graduation)}</td></tr>
<tr><th scope="row">CERT.</th><td>${renderInline(s.certificates)}</td></tr>
<tr><th scope="row">TOOLS</th><td>${renderInline(s.tools)}</td></tr>`
    : `<tr><th scope="row">FIELD</th><td>${renderInline(s.field)}</td></tr>
<tr><th scope="row">STATUS</th><td>${renderInline(s.status)}</td></tr>
<tr><th scope="row">TOOLS</th><td>${renderInline(s.tools)}</td></tr>
<tr><th scope="row">PROFILE</th><td><a href="#hr">${LOCK_SVG} 인사담당자 열람</a></td></tr>`;

  const body = `
<section id="top" class="hero">
<div class="hero-text">
<p class="eyebrow">SHEET 00 — 표제</p>
<h1>${renderInline(s.hero_title)}</h1>
${s.hero_note ? `<p class="pen hero-note">${esc(s.hero_note)}</p>` : ''}
<p class="hero-desc">${renderInline(s.hero_desc)}</p>
<div class="btns">
<a class="btn btn-dark" href="#projects">프로젝트 보기</a>
${github ? `<a class="btn" href="${esc(github)}">GitHub</a>` : ''}
</div>
</div>
<table class="title-block">
<tbody>
${titleBlock}
<tr><th scope="row">DWG NO.</th><td class="mono">${esc(s.drawing_no)}</td></tr>
</tbody>
</table>
</section>

<section id="hire" class="section">
<div class="section-head">
<h2><span class="section-no">00</span>${underlined('이런 엔지니어입니다')}</h2>
</div>
<div class="appeal-grid">
<div class="appeal">
${renderMarkdown(s.appeal_md)}
${s.appeal_note ? `<p class="pen appeal-note">${esc(s.appeal_note)}</p>` : ''}
</div>
${view.hr
    ? `<div class="quiz quiz-open">
<p class="quiz-q">반갑습니다 <span class="pen">:)</span></p>
<p class="quiz-help">아래 <a href="#resume">이력서</a>에서 학력·경력·자격증을 보실 수 있습니다.</p>
${contactList(s, github)}
</div>`
    : quizCard(s, view, '/#resume')}
</div>
</section>

<section id="projects" class="section">
<div class="section-head">
<h2><span class="section-no">01</span>${underlined('프로젝트')}${s.cad_note ? `<span class="pen">${esc(s.cad_note)}</span>` : ''}</h2>
${github ? `<a class="more" href="${esc(github)}">${esc(github.replace(/^https?:\/\//, ''))} →</a>` : ''}
</div>
${filterBar(projects, view)}
${shownNormal.length ? `<div class="cards">${shownNormal.map(projectCard).join('')}</div>` : ''}
${shownMini.length ? `<div class="mini-head"><h3>미니 프로젝트</h3><span class="pen">심심풀이로 가볍게 만든 것들</span></div>
<div class="table-box"><table class="sw-table">
<thead><tr><th scope="col">NO.</th><th scope="col">프로젝트</th><th scope="col">설명</th><th scope="col">분야</th></tr></thead>
<tbody>${shownMini.map(miniRow).join('')}</tbody>
</table></div>` : ''}
${!shownNormal.length && !shownMini.length ? empty('이 조건에 맞는 프로젝트가 아직 없습니다.') : ''}
</section>

<section id="posts" class="section">
<div class="section-head">
<h2><span class="section-no">02</span><mark class="hl">설계 노트</mark></h2>
</div>
${notes.length ? `<div class="notes">${notes.map(noteItem).join('')}</div>` : empty('아직 글이 없습니다.')}
</section>

${view.hr
    ? `<section id="resume" class="about">
<div class="about-text">
<h2><span class="section-no">03</span> ${underlined('이력서')}</h2>
<p>${renderInline(s.about)}</p>
${s.about_note ? `<p class="pen">${esc(s.about_note)}</p>` : ''}
${contactList(s, github)}
</div>
<div class="prose resume">${renderMarkdown(s.resume_md)}</div>
</section>`
    : `<section class="about about-locked">
<div class="about-text">
<h2><span class="section-no">03</span> ${underlined('이력서')} <span class="hr-tag">HR 전용</span></h2>
<p>학력·경력·자격증과 연락처는 인사담당자분께만 공개하고 있습니다.</p>
<p><a class="btn" href="#hr">${LOCK_SVG}&nbsp;퀴즈 풀고 열람하기</a></p>
</div>
</section>`}`;

  return layout({
    title: `${siteName(s)} | 기계공학 포트폴리오`,
    description: plainText(s.hero_desc),
    body,
    s,
    view,
  });
}

const CATEGORY_LABEL = { project: '프로젝트', note: '설계 노트' };
const CATEGORY_ANCHOR = { project: 'projects', note: 'posts' };

export function postPage(s, p, view) {
  const repo = safeUrl(p.repo_url);
  const rows = [
    p.code && ['NO.', esc(p.code)],
    p.category === 'project' && ['FIELD', esc(parseFields(p.fields).map((f) => FIELD_LABEL[f]).join(' · ') || '—')],
    p.category === 'project' && ['SCALE', p.scale === 'mini' ? '미니' : '일반'],
    p.tools && ['TOOLS', esc(p.tools)],
    p.year && ['DATE', esc(p.year)],
    repo && ['REPO', `<a href="${esc(repo)}">${esc(repo.replace(/^https?:\/\/(www\.)?github\.com\//, ''))}</a>`],
  ].filter(Boolean);

  const body = `
<article>
<header class="post-head">
<a class="back" href="/#${CATEGORY_ANCHOR[p.category]}">← ${CATEGORY_LABEL[p.category]}</a>
<h1>${renderInline(p.title)} ${hrTag(p)}</h1>
${p.summary ? `<p class="lead">${renderInline(p.summary)}</p>` : ''}
${rows.length ? `<table class="post-sheet"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>` : ''}
</header>
${p.cover_url && !String(p.body_md || '').includes(p.cover_url) ? `<figure class="post-cover"><img src="${esc(safeUrl(p.cover_url))}" alt=""></figure>` : ''}
<div class="prose">${renderMarkdown(p.body_md)}</div>
</article>`;

  return layout({
    title: `${plainText(p.title)} | ${siteName(s)}`,
    description: plainText(p.summary),
    body,
    s,
    view,
  });
}

/** 인사담당자 전용 글에 퀴즈 없이 들어왔을 때 */
export function lockedPage(s, view) {
  return layout({
    title: `인사담당자 전용 글 | ${siteName(s)}`,
    description: '',
    body: `<section class="section locked">
<a class="back" href="/">← 처음으로</a>
<h1>${LOCK_SVG} 인사담당자 전용 글입니다</h1>
${quizCard(s, view, view.path)}
</section>`,
    s,
    view,
  });
}

export function notFoundPage(s, view) {
  return layout({
    title: '페이지를 찾을 수 없습니다',
    description: '',
    body: `<section class="section"><h1>404 — 도면에 없는 페이지입니다</h1><p><a href="/">처음으로 돌아가기</a></p></section>`,
    s,
    view,
  });
}
