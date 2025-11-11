/**
 * 태그 색상 유틸리티
 *
 * Bio 태그(RED BIO, GREEN BIO, WHITE BIO)에 대해 색상을 적용합니다.
 *
 * 백엔드 color_schemes 테이블에서 관리되는 색상 정보를 기반으로 표시합니다.
 * Fallback: API 정보가 없을 경우 태그 이름으로 판단
 */

/**
 * Color scheme name to Tailwind class mapping
 */
const COLOR_SCHEME_MAP: Record<string, string> = {
  'red_bio': 'bg-bio-red text-white border-0',
  'green_bio': 'bg-bio-green text-white border-0',
  'white_bio': 'bg-bio-white text-black border-0',
  'gray_default': 'bg-gray-200 text-gray-900 border-0',
};

/**
 * 태그 이름에 따라 Tailwind CSS 클래스를 반환
 *
 * @param tagName - 태그 이름
 * @param colorScheme - API로부터 받은 color_scheme 정보 (optional)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getTagColorClasses(
  tagName: string,
  colorScheme?: { name: string; color_hex: string; text_color: string }
): string {
  // 1. API color_scheme이 있는 경우 우선 사용
  if (colorScheme && colorScheme.name) {
    const classes = COLOR_SCHEME_MAP[colorScheme.name];
    if (classes) {
      return classes;
    }
  }

  // 2. Fallback: 태그 이름으로 판단
  const upperTag = tagName.toUpperCase();

  // RED BIO 태그: 신약개발, 의료기기, 임상시험, 진단기술, 바이오의약품
  const redBioTags = ['신약개발', '의료기기', '임상시험', '진단기술', '바이오의약품'];
  if (redBioTags.includes(tagName) || upperTag.includes('RED BIO')) {
    return 'bg-bio-red text-white border-0';
  }

  // GREEN BIO 태그: 농생명, 환경정화, 식품바이오, 해양바이오, 바이오에너지
  const greenBioTags = ['농생명', '환경정화', '식품바이오', '해양바이오', '바이오에너지'];
  if (greenBioTags.includes(tagName) || upperTag.includes('GREEN BIO')) {
    return 'bg-bio-green text-white border-0';
  }

  // WHITE BIO 태그: 발효공학, 산업효소, 바이오소재, 바이오화학, 바이오플라스틱
  const whiteBioTags = ['발효공학', '산업효소', '바이오소재', '바이오화학', '바이오플라스틱'];
  if (whiteBioTags.includes(tagName) || upperTag.includes('WHITE BIO')) {
    return 'bg-bio-white text-black border-0';
  }

  // 나머지 태그: 회색 배경 + 검정 글씨
  return 'bg-gray-200 text-gray-900 border-0';
}
