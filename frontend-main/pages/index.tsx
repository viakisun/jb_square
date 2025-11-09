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

  /**
   * 검색 실행 핸들러
   * Hero Section에서 검색 시 통합 검색 페이지로 이동
   */
  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* 1. Hero Section - 메인 비주얼 & 검색 */}
        <HeroSection onSearch={handleSearch} />

        {/* 2. Announcement Section - 지원사업 공고 */}
        <AnnouncementSection />

        {/* 3. News & Event Section - 최신 뉴스 */}
        <NewsEventSection />

        {/* 4. Incubator Status Section - 창업 보육센터 현황 */}
        <IncubatorStatusSection />

        {/* 5. Partner Section - 주요 협력 기관 */}
        <PartnerSection />

        {/* 6. Benefit Section - 회원 혜택 */}
        <BenefitSection />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
