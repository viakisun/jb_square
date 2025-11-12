/**
 * 🏠 JB SQUARE 메인 페이지
 *
 * 전북 바이오 산업 Knowledge Hub의 메인 랜딩 페이지
 * - Hero Section: 메인 비주얼 및 통합 검색
 * - Announcement Section: 지원사업 공고
 * - News & Event Section: 최신 뉴스 및 이벤트
 * - Incubator Status Section: 창업 보육센터 현황
 * - Partner Section: 주요 협력 기관
 * - Benefit Section: 회원 혜택 안내
 *
 * Figma 디자인 기반으로 구현
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { AnnouncementSection } from '@/components/home/AnnouncementSection';
import { NewsEventSection } from '@/components/home/NewsEventSection';
import { IncubatorStatusSection } from '@/components/home/IncubatorStatusSection';
import { PartnerSection } from '@/components/home/PartnerSection';
import { BenefitSection } from '@/components/home/BenefitSection';

const HomePage: React.FC = () => {
  const router = useRouter();

  const heroWrapperStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  };

  const heroBackgroundLayerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  };

  const heroBackgroundImageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'brightness(0.85)',
  };

  const heroGradientOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(0, 12, 40, 0.9) 0%, rgba(0, 18, 60, 0.35) 60%, rgba(0, 24, 78, 0.2) 100%)',
  };

  const heroContentWrapperStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
  };

  const heroContentOffsetStyle: React.CSSProperties = {
    marginTop: 'clamp(64px, 8vw, 128px)',
  };

  /**
   * 검색 실행 핸들러
   * Hero Section에서 검색 시 통합 검색 페이지로 이동
   */
  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div style={heroWrapperStyle}>
        <div aria-hidden style={heroBackgroundLayerStyle}>
          <img
            src="/images/fbe49440deeef8a3b9c073ee3447a3912ffa3cf7.jpg"
            alt=""
            style={heroBackgroundImageStyle}
          />
          <div style={heroGradientOverlayStyle} />
        </div>

        <div style={heroContentWrapperStyle}>
          <Header />
          <div style={heroContentOffsetStyle}>
            <HeroSection onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <main>
        {/* 1. Announcement Section - 지원사업 공고 */}
        <AnnouncementSection />

        {/* 2. News & Event Section - 최신 뉴스 */}
        <NewsEventSection />

        {/* 3. Incubator Status Section - 창업 보육센터 현황 */}
        <IncubatorStatusSection />

        {/* 4. Partner Section - 주요 협력 기관 */}
        <PartnerSection />

        {/* 5. Benefit Section - 회원 혜택 */}
        <BenefitSection />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
