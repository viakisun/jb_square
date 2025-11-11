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

interface HeroSectionProps {
  /** 검색 제출 핸들러 */
  onSearch?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

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
    <div style={{ width: '100%', height: '900px', position: 'relative', background: 'black', overflow: 'hidden', marginTop: '-80px', paddingTop: '80px' }}>
      {/* 배경 이미지 */}
      <div
        style={{
          width: 2223,
          height: 1250,
          left: -254,
          top: -150,
          position: 'absolute'
        }}
      >
        <img
          style={{
            width: '100%',
            height: '100%',
            opacity: 0.50
          }}
          src="/images/fbe49440deeef8a3b9c073ee3447a3912ffa3cf7.jpg"
          alt="Hero Background"
        />
      </div>

      {/* 그라데이션 블러 효과 */}
      <div
        style={{
          width: 993,
          height: 512,
          left: 146,
          top: 247,
          position: 'absolute',
          opacity: 0.50,
          background: 'linear-gradient(90deg, #354D60 0%, rgba(53, 77, 96, 0) 100%)',
          boxShadow: '150px 150px 150px',
          borderRadius: 9999,
          filter: 'blur(75px)'
        }}
      />

      {/* 상단 그라데이션 */}
      <div
        style={{
          width: 1920,
          height: 303,
          left: 0,
          top: -18,
          position: 'absolute',
          background: 'linear-gradient(180deg, black 0%, rgba(0, 0, 0, 0) 100%)'
        }}
      />

      {/* 메인 컨텐츠 */}
      <div
        style={{
          width: 857,
          left: 200,
          top: 328,
          position: 'absolute',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 56,
          display: 'inline-flex'
        }}
      >
        {/* 타이틀 섹션 */}
        <div
          style={{
            alignSelf: 'stretch',
            position: 'relative',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 16,
            display: 'flex'
          }}
        >
          {/* 메인 타이틀 */}
          <div
            style={{
              alignSelf: 'stretch',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
              fontSize: 64,
              fontFamily: 'Pretendard GOV',
              fontWeight: '700',
              lineHeight: '83.2px',
              wordWrap: 'break-word'
            }}
          >
            전북 바이오 기술 산업의<br />Knowledge Hub,
          </div>

          {/* 서브 타이틀 */}
          <div
            style={{
              alignSelf: 'stretch',
              justifyContent: 'center',
              display: 'flex',
              flexDirection: 'column',
              color: '#F3F6FB',
              fontSize: 20,
              fontFamily: 'Pretendard GOV',
              fontWeight: '500',
              lineHeight: '26px',
              wordWrap: 'break-word'
            }}
          >
            전북 바이오산업의 지속 성장을 위한 이정표를 제시합니다.
          </div>

          {/* 하이라이트 박스 (디자인용) */}
          <div
            style={{
              width: 331,
              height: 56,
              left: 506,
              top: 101,
              position: 'absolute',
              background: 'white',
              opacity: 0
            }}
          />
        </div>

        {/* 검색창 */}
        <div
          style={{
            width: 600,
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 20,
            paddingRight: 8,
            background: 'white',
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            display: 'inline-flex'
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="공고, 뉴스, 기업 정보를 검색하세요."
            style={{
              flex: '1 1 0',
              color: '#808892',
              fontSize: 18,
              fontFamily: 'Pretendard GOV',
              fontWeight: '500',
              lineHeight: '23.4px',
              wordWrap: 'break-word',
              border: 'none',
              outline: 'none',
              background: 'transparent'
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              width: 48,
              height: 48,
              background: '#10409A',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              display: 'flex',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{ width: 24, height: 24, position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  left: 4,
                  top: 4,
                  position: 'absolute',
                  outline: '1.50px #F8F9FC solid',
                  outlineOffset: '-0.75px',
                  borderRadius: '50%'
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Scroll 인디케이터 */}
      <div
        style={{
          left: 936,
          top: 832,
          position: 'absolute',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 8,
          display: 'inline-flex'
        }}
      >
        <div
          style={{
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#EBEFF5',
            fontSize: 18,
            fontFamily: 'Pretendard GOV',
            fontWeight: '500',
            lineHeight: '23.40px',
            wordWrap: 'break-word'
          }}
        >
          Scroll
        </div>
        <div
          style={{
            width: 4,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 1,
            display: 'flex'
          }}
        >
          <div
            style={{
              alignSelf: 'stretch',
              height: 4,
              background: '#00BDDD',
              borderRadius: 50
            }}
          />
          <div
            style={{
              width: 4,
              height: 72,
              background: 'linear-gradient(360deg, white 0%, rgba(255, 255, 255, 0) 100%)',
              borderRadius: 1
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
