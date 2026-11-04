-- 초안 데이터. 관리자 페이지(/admin)에서 자유롭게 고치거나 지우세요.
-- [대괄호] 부분은 직접 채워야 하는 자리입니다.

INSERT INTO settings (key, value) VALUES
  ('name', '[이름]'),
  ('school', '울산과학대학교 기계공학과 (3년제)'),
  ('graduation', '==p:2027년 2월 졸업 예정=='),
  ('tools', '[CAD 툴 예: SolidWorks · AutoCAD] · Python · Arduino/ESP32'),
  ('drawing_no', 'PF-2026-REV.A'),
  ('hero_title', '도면으로 ==설계==하고,
코드로 ==검증==하는
++기계공학도++입니다.'),
  ('hero_note', '↳ 설계 + 코드 = 나의 강점!'),
  ('hero_desc', '울산과학대학교 기계공학과에서 ==m:CAD 설계와 임베디드·소프트웨어 프로젝트==를 함께 해왔습니다. 손으로 만든 결과물과 그 과정을 이곳에 기록합니다.'),
  ('cad_note', '← 제일 보여주고 싶은 것'),
  ('about', '도면 한 장이 실제 부품이 되기까지의 과정을 좋아합니다. ==설계 의도를 숫자로 설명할 수 있는 엔지니어==가 되는 것이 목표입니다. [자기소개를 자유롭게 고쳐주세요]'),
  ('about_note', '편하게 연락 주세요 :)'),
  ('email', '[이메일 주소]'),
  ('github', 'https://github.com/khw1566'),
  ('certificates', '[예: 기계설계산업기사 · 전산응용기계제도기능사]');

-- CAD 설계 프로젝트 (예시 자리)
INSERT INTO posts (slug, category, code, title, summary, body_md, tools, year, badge, sort_order) VALUES
('cad-project-1', 'cad', 'DWG-001', '[CAD 프로젝트 1 제목]',
 '예) 1단 평기어 감속기 설계. ==요구 감속비에서 출발해== 모듈, 잇수, 축 지름을 정하고 3D 모델과 부품도까지 작성했습니다.',
 '## 설계 목표

[무엇을, 왜 설계했는지 적어주세요. 예: 입력 회전수 1,750rpm을 1/5로 줄이는 감속기]

## 설계 과정

1. 요구 조건 정리: [감속비, 토크, 크기 제한]
2. 기어 사양 결정: [모듈, 잇수, 압력각]
3. 축과 베어링 선정: [축 지름, 베어링 번호]
4. 3D 모델링과 조립: [사용 툴]

![조립도 이미지를 여기에 올려주세요](/images/example.png)

## 결과와 배운 점

- ++간섭 검사++에서 [발견한 문제]를 고쳤습니다.
- !!다음엔 공차를 더 꼼꼼히!!',
 '[툴]', '[연도]', 'BEST ★', 1),
('cad-project-2', 'cad', 'DWG-002', '[CAD 프로젝트 2 제목]',
 '예) 지그·고정구 설계. 가공 공정을 고려해 ==m:공차와 끼워맞춤==을 지정하고, 조립도와 부품표(BOM)를 정리했습니다.',
 '## 설계 목표

[내용을 적어주세요]',
 '[툴]', '[연도]', '', 2),
('cad-project-3', 'cad', 'DWG-003', '[CAD 프로젝트 3 제목]',
 '예) 기구 메커니즘 모델링. ==p:조립 구속과 간섭 검사==로 동작 범위를 확인하고, 시제품 제작을 위한 출력 파일을 준비했습니다.',
 '## 설계 목표

[내용을 적어주세요]',
 '[툴]', '[연도]', '', 3);

-- 소프트웨어 · 임베디드 (GitHub 저장소)
INSERT INTO posts (slug, category, code, title, summary, body_md, tools, year, repo_url, pen_note, sort_order) VALUES
('gear-design-assistant', 'software', 'S-01', 'Gear Design Assistant',
 '기어 설계 계산을 돕는 프로그램. ==m:기계설계 지식을 코드로 옮긴== 대표 프로젝트',
 '## 왜 만들었나

기계요소설계 시간에 가장 많이 시간을 쓴 건 사실 설계가 아니라 ==계산==이었습니다. 값 하나를 바꾸면 그 뒤의 계산을 처음부터 다시 해야 했죠. 그래서 이 과정을 프로그램으로 만들어 보기로 했습니다.

## 무엇을 하나

- [입력값: 예) 동력, 회전수, 감속비]
- [출력값: 예) 모듈, 잇수, 피치원 지름, 중심거리]
- [추가 기능]

## 어떻게 만들었나

교재의 설계 공식을 정리해 ++입력 → 계산 → 결과 확인++ 흐름으로 구현했습니다. [사용 언어와 구조를 적어주세요]

## 결과

[계산 시간 단축, 오류 감소 등 실제로 달라진 점을 적어주세요]

!!다음 목표: 강도 검토까지 자동화!!',
 '설계 × SW', '2026', 'https://github.com/khw1566/Gear-Design-Assistant-Program', '★ 대표작, 꼭 보기!', 1),
('esp32-mini-web-server', 'software', 'S-02', 'ESP32 Mini Web Server',
 'ESP32로 만든 소형 웹서버. [기능 한 줄 설명]',
 '## 개요

[내용을 적어주세요]', '임베디드', '2026', 'https://github.com/khw1566/ESP32-miniWebServer-Project', '', 2),
('lab-qr-access', 'software', 'S-03', 'Lab QR Access',
 'QR 코드 기반 실습실 출입 관리. [기능 한 줄 설명]',
 '## 개요

[내용을 적어주세요]', '웹 · 시스템', '2026', 'https://github.com/khw1566/lab-qr-access', '', 3),
('fc-simulation', 'software', 'S-04', 'FC Simulation',
 '[시뮬레이션 대상과 목적 한 줄 설명]',
 '## 개요

[내용을 적어주세요]', '시뮬레이션', '2026', 'https://github.com/khw1566/FC_Simulation', '', 4),
('usb-cam-app', 'software', 'S-05', 'USB CAM APP',
 'USB 카메라 활용 앱. [기능 한 줄 설명]',
 '## 개요

[내용을 적어주세요]', '앱', '2026', 'https://github.com/khw1566/USB-CAM-APP', '', 5);

-- 설계 노트 (블로그 글)
INSERT INTO posts (slug, category, title, summary, body_md, tools, year, sort_order) VALUES
('why-gear-program', 'note', '기어 설계 계산을 ++프로그램으로++ 만든 이유',
 '수업에서 반복하던 모듈·잇수 계산을 자동화하며 배운 점을 정리했습니다.',
 '기어 설계 과제를 할 때마다 같은 계산을 반복했습니다. 이 글에서는 그 계산을 ==프로그램으로 옮기며 배운 점==을 정리합니다.

## 손계산의 문제

[느꼈던 불편함을 적어주세요]

## 코드로 옮기며 배운 것

[배운 점을 적어주세요]

관련 저장소: [Gear-Design-Assistant-Program](https://github.com/khw1566/Gear-Design-Assistant-Program)',
 '기어설계', '2026.11', 1),
('esp32-web-monitor', 'note', 'ESP32로 장비 상태를 웹에서 보기',
 '[글 요약을 한두 문장으로 적어주세요]',
 '[본문을 적어주세요]', '임베디드', '2026.10', 2),
('cad-retrospective', 'note', '[CAD 작업 회고 글 제목]',
 '[글 요약을 한두 문장으로 적어주세요]',
 '[본문을 적어주세요]', 'CAD', '[날짜]', 3);
