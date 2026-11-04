// 마크다운 → HTML 변환. 기본 마크다운에 "노트 필기" 문법 3가지를 더했습니다.
//
//   ==텍스트==      노란 형광펜
//   ==m:텍스트==    민트 형광펜
//   ==p:텍스트==    분홍 형광펜
//   ++텍스트++      손으로 그은 밑줄
//   !!텍스트!!      파란 펜 손글씨 메모
import { Marked } from 'marked';

const UNDERLINE_SVG =
  '<svg aria-hidden="true" class="ul-line" viewBox="0 0 200 12" preserveAspectRatio="none">' +
  '<path d="M3 7 C 45 3, 90 10, 135 6 S 185 4, 197 7" vector-effect="non-scaling-stroke"></path></svg>';

const HL_CLASS = { y: 'hl', m: 'hl-mint', p: 'hl-pink' };

const noteExtensions = [
  {
    name: 'highlight',
    level: 'inline',
    start(src) {
      const i = src.indexOf('==');
      return i < 0 ? undefined : i;
    },
    tokenizer(src) {
      const m = /^==(?:([ymp]):)?([^\n]+?)==/.exec(src);
      if (!m) return;
      return {
        type: 'highlight',
        raw: m[0],
        color: m[1] || 'y',
        tokens: this.lexer.inlineTokens(m[2]),
      };
    },
    renderer(token) {
      return `<mark class="${HL_CLASS[token.color]}">${this.parser.parseInline(token.tokens)}</mark>`;
    },
  },
  {
    name: 'handUnderline',
    level: 'inline',
    start(src) {
      const i = src.indexOf('++');
      return i < 0 ? undefined : i;
    },
    tokenizer(src) {
      const m = /^\+\+([^\n]+?)\+\+/.exec(src);
      if (!m) return;
      return { type: 'handUnderline', raw: m[0], tokens: this.lexer.inlineTokens(m[1]) };
    },
    renderer(token) {
      return `<span class="ul">${this.parser.parseInline(token.tokens)}${UNDERLINE_SVG}</span>`;
    },
  },
  {
    name: 'penNote',
    level: 'inline',
    start(src) {
      const i = src.indexOf('!!');
      return i < 0 ? undefined : i;
    },
    tokenizer(src) {
      const m = /^!!([^\n!][^\n]*?)!!/.exec(src);
      if (!m) return;
      return { type: 'penNote', raw: m[0], tokens: this.lexer.inlineTokens(m[1]) };
    },
    renderer(token) {
      return `<span class="pen">${this.parser.parseInline(token.tokens)}</span>`;
    },
  },
];

const marked = new Marked({ gfm: true, breaks: true });
marked.use({ extensions: noteExtensions });

/** 본문 전체(문단, 제목, 목록 등)를 변환합니다. */
export function renderMarkdown(md) {
  return marked.parse(md || '');
}

/** 제목·요약처럼 한 줄짜리 글을 변환합니다. 줄바꿈은 <br>이 됩니다. */
export function renderInline(md) {
  return (md || '')
    .split('\n')
    .map((line) => marked.parseInline(line))
    .join('<br>');
}

/** 마크다운 기호를 모두 지운 순수 텍스트 (페이지 <title> 등에 사용) */
export function plainText(md) {
  return (md || '')
    .replace(/==(?:[ymp]:)?(.+?)==/g, '$1')
    .replace(/\+\+(.+?)\+\+/g, '$1')
    .replace(/!!(.+?)!!/g, '$1')
    .replace(/[*_`#>\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
