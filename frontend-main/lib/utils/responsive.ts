/**
 * 📐 반응형 디자인 유틸리티
 *
 * CSS clamp()를 사용하여 뷰포트에 따라 자연스럽게 크기가 조절되는
 * 반응형 값들을 생성합니다.
 *
 * 기준:
 * - Desktop (1920px): 최대 크기 (100%)
 * - Laptop (1600px): 약 83% 크기
 * - Small Laptop (1400px): 최소 크기 (79%)
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

/**
 * 반응형 컨테이너 너비
 *
 * @example
 * <div style={{ maxWidth: RESPONSIVE.CONTAINER_WIDTH }}>
 */
export const RESPONSIVE = {
  /** 메인 컨테이너 너비: 1920px에서 1520px, 1400px에서 1200px */
  CONTAINER_WIDTH: 'clamp(1200px, 79.17vw, 1520px)',

  /** 좁은 컨테이너 너비 */
  CONTAINER_NARROW: 'clamp(800px, 52.6vw, 1010px)',
} as const;

/**
 * 반응형 폰트 크기 생성 함수
 *
 * @param min - 최소 픽셀 값 (1400px 이하)
 * @param ideal - 이상적인 vw 값
 * @param max - 최대 픽셀 값 (1920px 이상)
 * @returns CSS clamp() 문자열
 *
 * @example
 * fontSize: getResponsiveFontSize(32, 3, 48) // "clamp(32px, 3vw, 48px)"
 */
export function getResponsiveFontSize(min: number, ideal: number, max: number): string {
  return `clamp(${min}px, ${ideal}vw, ${max}px)`;
}

/**
 * 반응형 간격 생성 함수
 *
 * @param min - 최소 픽셀 값
 * @param ideal - 이상적인 vw 값
 * @param max - 최대 픽셀 값
 * @returns CSS clamp() 문자열
 *
 * @example
 * gap: getResponsiveSpacing(40, 5, 80) // "clamp(40px, 5vw, 80px)"
 */
export function getResponsiveSpacing(min: number, ideal: number, max: number): string {
  return `clamp(${min}px, ${ideal}vw, ${max}px)`;
}

/**
 * 사전 정의된 반응형 폰트 크기
 *
 * @example
 * <h1 style={{ fontSize: FONT_SIZES.HEADING_XL }}>Title</h1>
 */
export const FONT_SIZES = {
  /** 64px → 48px (Hero 메인 타이틀) */
  HERO: getResponsiveFontSize(48, 4, 64),

  /** 48px → 32px (섹션 메인 타이틀) */
  HEADING_XL: getResponsiveFontSize(32, 3, 48),

  /** 32px → 24px (섹션 서브 타이틀) */
  HEADING_LG: getResponsiveFontSize(24, 2, 32),

  /** 24px → 20px (카드 타이틀) */
  HEADING_MD: getResponsiveFontSize(20, 1.5, 24),

  /** 20px → 16px (본문 강조) */
  BODY_LG: getResponsiveFontSize(16, 1.25, 20),

  /** 18px → 14px (본문) */
  BODY_MD: getResponsiveFontSize(14, 1.125, 18),

  /** 16px → 14px (작은 텍스트) */
  BODY_SM: getResponsiveFontSize(14, 1, 16),
} as const;

/**
 * 사전 정의된 반응형 간격
 *
 * @example
 * <section style={{ paddingTop: SPACING.SECTION }}>
 */
export const SPACING = {
  /** 80px → 40px (섹션 간격) */
  SECTION: getResponsiveSpacing(40, 5, 80),

  /** 60px → 30px (큰 간격) */
  XL: getResponsiveSpacing(30, 3.75, 60),

  /** 40px → 20px (중간 간격) */
  LG: getResponsiveSpacing(20, 2.5, 40),

  /** 24px → 16px (작은 간격) */
  MD: getResponsiveSpacing(16, 1.5, 24),

  /** 16px → 12px (최소 간격) */
  SM: getResponsiveSpacing(12, 1, 16),
} as const;

/**
 * 반응형 브레이크포인트 (참고용)
 */
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  LAPTOP: 1400,
  DESKTOP: 1920,
} as const;
