// 프로젝트 분야와 규모 목록. 분야를 더하거나 이름을 바꾸려면 여기만 고치면 됩니다.
// key 는 데이터베이스에 저장되는 영문 이름이라, 한 번 쓰기 시작한 key 는 바꾸지 마세요.
export const FIELDS = [
  { key: '3d', label: '3D 설계' },
  { key: 'circuit', label: '회로 설계' },
  { key: 'kinematics', label: '기구학' },
  { key: 'embedded', label: '임베디드' },
  { key: 'web', label: '웹' },
  { key: 'mobile', label: '모바일 앱' },
  { key: 'aero', label: '항공' },
];

export const SCALES = [
  { key: 'normal', label: '일반' },
  { key: 'mini', label: '미니' },
];

export const FIELD_LABEL = Object.fromEntries(FIELDS.map((f) => [f.key, f.label]));

/** '3d, web' → ['3d', 'web'] (모르는 key 는 버림) */
export function parseFields(v) {
  return String(v || '')
    .split(',')
    .map((x) => x.trim())
    .filter((x) => FIELD_LABEL[x]);
}
