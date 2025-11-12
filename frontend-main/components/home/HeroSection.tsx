/**
 * 🎯 Hero Section 컴포넌트
 *
 * 메인 페이지 최상단의 히어로 섹션
 * - 배경: 실험실 이미지 + 어두운 그라데이션 오버레이
 * - 타이틀: "전북 바이오 기술 산업의 Knowledge Hub,"
 * - 검색창: 통합 검색 기능
 * - Scroll 인디케이터
 *
 * Figma 디자인 기반으로 구현
 *
 * @example
 * <HeroSection onSearch={handleSearch} />
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useState } from 'react';
import {
  FONT_SIZES,
  RESPONSIVE,
  getResponsiveSpacing,
  getResponsiveFontSize,
} from '@/lib/utils/responsive';

interface HeroSectionProps {
  /** 검색 제출 핸들러 */
  onSearch?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const HERO_MIN_HEIGHT = 'clamp(520px, 85vh, 900px)';
  const HERO_PADDING_VERTICAL = getResponsiveSpacing(120, 12, 220);
  const HERO_PADDING_HORIZONTAL = getResponsiveSpacing(20, 6, 64);
  const CONTENT_WIDTH = 'clamp(320px, 52vw, 680px)';
  const CONTENT_GAP = getResponsiveSpacing(32, 3.5, 56);
  const TITLE_GAP = getResponsiveSpacing(16, 1.8, 24);
  const SEARCH_HEIGHT = getResponsiveSpacing(52, 4, 72);
  const SEARCH_GAP = getResponsiveSpacing(12, 1.2, 20);
  const SEARCH_BUTTON_SIZE = getResponsiveSpacing(48, 3.6, 60);
  const SCROLL_OFFSET = getResponsiveSpacing(32, 4, 56);
  const SCROLL_FONT_SIZE = getResponsiveFontSize(16, 1.2, 18);

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  /**
   * Enter 키 입력 핸들러
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: HERO_MIN_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        paddingTop: HERO_PADDING_VERTICAL,
        paddingBottom: HERO_PADDING_VERTICAL,
      }}
    >
      <div
        style={{
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: RESPONSIVE.CONTAINER_WIDTH,
            margin: '0 auto',
            paddingLeft: HERO_PADDING_HORIZONTAL,
            paddingRight: HERO_PADDING_HORIZONTAL,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <div
            style={{
              width: CONTENT_WIDTH,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: CONTENT_GAP,
              color: '#FFFFFF',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: TITLE_GAP,
                width: '100%',
              }}
            >
              <div
                style={{
                  fontSize: FONT_SIZES.HERO,
                  fontFamily: 'Pretendard GOV',
                  fontWeight: 700,
                  lineHeight: 1.3,
                  letterSpacing: '-0.02em',
                }}
              >
                전북 바이오 기술 산업의<br />Knowledge Hub,
              </div>
              <div
                style={{
                  fontSize: FONT_SIZES.BODY_LG,
                  fontFamily: 'Pretendard GOV',
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: '#F3F6FB',
                }}
              >
                전북 바이오산업의 지속 성장을 위한 이정표를 제시합니다.
              </div>
            </div>

            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: SEARCH_GAP,
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                paddingLeft: getResponsiveSpacing(16, 1.5, 20),
                paddingRight: getResponsiveSpacing(12, 1.1, 16),
                height: SEARCH_HEIGHT,
              }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="공고, 뉴스, 기업 정보를 검색하세요."
                style={{
                  flex: '1 1 auto',
                  color: '#3A3F49',
                  fontSize: FONT_SIZES.BODY_MD,
                  fontFamily: 'Pretendard GOV',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  minWidth: 0,
                }}
              />
              <button
                type="button"
                onClick={handleSearch}
                style={{
                  width: SEARCH_BUTTON_SIZE,
                  height: SEARCH_BUTTON_SIZE,
                  background: '#10409A',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{ width: '1.5rem', height: '1.5rem', position: 'relative' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '2px solid #F8F9FC',
                      position: 'absolute',
                      inset: 0,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -6,
                      right: -2,
                      width: 10,
                      height: 2,
                      backgroundColor: '#F8F9FC',
                      transform: 'rotate(-45deg)',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: SCROLL_OFFSET,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: getResponsiveSpacing(8, 0.8, 12),
              color: '#EBEFF5',
            }}
          >
            <span
              style={{
                fontSize: SCROLL_FONT_SIZE,
                fontFamily: 'Pretendard GOV',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Scroll
            </span>
            <div
              style={{
                width: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: getResponsiveSpacing(16, 1.2, 24),
                  backgroundColor: '#00BDDD',
                  borderRadius: 999,
                }}
              />
              <div
                style={{
                  width: '100%',
                  height: getResponsiveSpacing(56, 5, 72),
                  background: 'linear-gradient(360deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 100%)',
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
