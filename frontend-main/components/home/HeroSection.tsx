/**
 * 🎯 Hero Section 컴포넌트
 *
 * 메인 페이지 최상단의 히어로 섹션
 * - 배경: 실험실 이미지 + 어두운 그라데이션 오버레이
 * - 타이틀: "전북 바이오 기술 산업의 Knowledge Hub, JB SQUARE"
 * - 검색창: 통합 검색 기능
 *
 * Figma 디자인 기반으로 구현
 *
 * @example
 * <HeroSection onSearch={handleSearch} />
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { SearchBar } from '@/components/sample-board/SearchBar';

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

  return (
    <section className="relative h-[600px] flex items-center overflow-hidden">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 z-0">
        {/* 배경 이미지 (fallback: 그라데이션) */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-blue via-gray-700 to-gray-900"
          style={{
            backgroundImage: 'url(/images/hero-background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* 어두운 오버레이 (텍스트 가독성 확보) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

        {/* 하단 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      </div>

      {/* 컨텐츠 */}
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* 메인 타이틀 */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              전북 바이오 기술 산업의
              <br />
              Knowledge Hub, <span className="text-primary-cyan">JB SQUARE</span>
            </h1>

            {/* 서브 타이틀 */}
            <p className="text-lg md:text-xl text-white/90 mb-8">
              전북 바이오산업의 기술 경쟁력 강화를 지원합니다.
            </p>

            {/* 검색창 */}
            <div className="max-w-2xl">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="무엇, 누구를 찾고 있으세요?"
                showSearchButton={true}
                onSearch={handleSearch}
                size="large"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 하단 그라데이션 (선택적) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-5" />
    </section>
  );
};

export default HeroSection;
