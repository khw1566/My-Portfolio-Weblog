# My Portfolio Weblog

기계공학 포트폴리오 블로그입니다. 도면(Blueprint) 디자인에 형광펜·손그림 밑줄·펜 메모 같은 "노트 필기" 효과를 더했습니다.

- **Cloudflare Workers**: 사이트를 보여줍니다
- **Cloudflare D1**: 글과 프로필을 저장합니다
- **Cloudflare R2**: 이미지와 PDF 도면을 저장합니다
- **관리자 페이지** `/admin`: 브라우저에서 글을 쓰고 이미지를 올립니다

## 글 쓰는 법

1. `https://audreaming.com/admin`에 접속해 비밀번호로 로그인합니다.
2. **+ 새 글 쓰기**를 누르고 분류를 고릅니다.
   - **CAD 설계**: 첫 화면의 도면 카드로 보입니다. 대표 이미지를 꼭 올려 주세요.
   - **소프트웨어 · 임베디드**: 프로젝트 표로 보입니다. GitHub 주소를 넣어 주세요.
   - **설계 노트**: 블로그 글 목록으로 보입니다.
3. 본문은 마크다운으로 씁니다. 오른쪽에서 미리보기를 바로 볼 수 있습니다.
4. 이미지는 본문 칸에 **끌어다 놓거나 붙여넣기(Ctrl+V)** 하면 자동으로 올라가고 들어갑니다. PDF 도면도 올릴 수 있습니다.
5. **저장**을 누르면 사이트에 바로 반영됩니다. "공개하기"를 끄면 나만 보는 임시 글이 됩니다.

이름·이메일·첫 화면 문구·자기소개는 **프로필 · 첫 화면** 탭에서 고칩니다.

### 노트 필기 문법

| 쓰는 법 | 결과 |
| --- | --- |
| `==텍스트==` | 노란 형광펜 |
| `==m:텍스트==` | 민트 형광펜 |
| `==p:텍스트==` | 분홍 형광펜 |
| `++텍스트++` | 손으로 그은 밑줄 |
| `!!텍스트!!` | 파란 펜 손글씨 메모 |

제목, 한 줄 소개, 프로필 문구에도 쓸 수 있습니다. 편집기 위쪽 버튼을 눌러도 됩니다.

### 색이나 글꼴을 바꾸고 싶다면

`src/styles.css` 맨 위의 `:root { ... }` 부분만 바꾸면 사이트 전체에 적용됩니다.

## 처음 배포하기 (한 번만)

Node.js 20 이상이 필요합니다.

```bash
npm install
npx wrangler login                       # 브라우저에서 Cloudflare 계정 로그인

# 1) D1 데이터베이스 만들기 → 출력된 database_id 를 wrangler.toml 에 붙여넣기
npx wrangler d1 create portfolio-db

# 2) 이미지 저장소(R2) 만들기 (처음이면 Cloudflare 대시보드에서 R2를 먼저 활성화)
npx wrangler r2 bucket create portfolio-images

# 3) 표 만들기 + 초안 글 넣기
npm run db:migrate:remote

# 4) 관리자 비밀번호와 서명 키 등록 (각각 입력 창이 뜹니다)
npx wrangler secret put ADMIN_PASSWORD   # 길고 어려운 비밀번호로
npx wrangler secret put SESSION_SECRET   # 아무 긴 랜덤 문자열

# 5) 배포
npm run deploy
```

`wrangler.toml`의 `routes`가 `audreaming.com`을 이 Worker에 연결합니다. audreaming.com이 같은 Cloudflare 계정에 등록되어 있어야 합니다. 하위 도메인(예: `portfolio.audreaming.com`)을 쓰려면 `pattern`을 바꾸세요.

이후에는 코드를 고쳤을 때만 `npm run deploy`를 다시 실행하면 됩니다. 글과 이미지는 관리자 페이지에서 고치므로 배포가 필요 없습니다.

## 내 컴퓨터에서 실행해 보기

```bash
cp .dev.vars.example .dev.vars           # 로컬용 비밀번호 설정
npm run db:migrate:local
npm run dev                              # http://localhost:8787
```

## 파일 구조

```
migrations/0001_init.sql   D1 표 구조
migrations/0002_seed.sql   초안 글과 프로필 ([대괄호]는 직접 채울 자리)
src/index.js               주소별 처리 (공개 페이지, 관리자 API, 이미지)
src/render.js              공개 페이지 HTML
src/markdown.js            마크다운 + 노트 필기 문법
src/styles.css             디자인
src/admin.html             관리자 페이지
src/login.html             로그인 화면
src/auth.js                로그인 쿠키
```
