-- 글(프로젝트, 설계 노트) 테이블
CREATE TABLE posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,              -- 주소에 쓰이는 이름 (예: gear-design)
  category    TEXT NOT NULL DEFAULT 'note'       -- project = 프로젝트 / note = 설계 노트(블로그 글)
              CHECK (category IN ('project', 'note')),
  fields      TEXT NOT NULL DEFAULT '',          -- 분야, 쉼표로 여러 개 (3d,circuit,kinematics,embedded,web,mobile,aero)
  scale       TEXT NOT NULL DEFAULT 'normal'     -- normal = 일반 / mini = 미니(가볍게 만든 것)
              CHECK (scale IN ('normal', 'mini')),
  code        TEXT NOT NULL DEFAULT '',          -- 도면번호 스타일 표기 (예: DWG-001, S-01)
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL DEFAULT '',          -- 카드/목록에 보이는 한두 줄 소개
  body_md     TEXT NOT NULL DEFAULT '',          -- 본문 (마크다운)
  cover_url   TEXT NOT NULL DEFAULT '',          -- 대표 이미지 주소
  tools       TEXT NOT NULL DEFAULT '',          -- 사용 툴 / 분류 (예: SolidWorks)
  year        TEXT NOT NULL DEFAULT '',          -- 연도 또는 날짜 (예: 2026, 2026.11)
  repo_url    TEXT NOT NULL DEFAULT '',          -- GitHub 저장소 주소
  badge       TEXT NOT NULL DEFAULT '',          -- 손글씨 포스트잇 문구 (예: BEST ★)
  pen_note    TEXT NOT NULL DEFAULT '',          -- 목록 옆 파란 펜 메모 (예: ★ 대표작, 꼭 보기!)
  sort_order  INTEGER NOT NULL DEFAULT 0,        -- 작은 숫자가 먼저 보임
  published   INTEGER NOT NULL DEFAULT 1,        -- 1 = 게시, 0 = 임시저장(나만 보기)
  audience    TEXT NOT NULL DEFAULT 'public'     -- public = 모두 / hr = 인사담당자 퀴즈 통과자만
              CHECK (audience IN ('public', 'hr')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_posts_category ON posts (category, published, sort_order);

-- 프로필/소개 같은 사이트 설정 (key-value)
-- 어떤 키가 인사담당자 전용인지는 src/index.js 의 PRIVATE_KEYS 에 적혀 있습니다.
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
