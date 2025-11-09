/**
 * 🏢 JB BIO 클러스터 > 클러스터 현황 페이지
 *
 * Figma 디자인(CLUSTER_DEV_CLUSTER)을 100% 반영하여 구현
 * - 페이지 타이틀 + Breadcrumb
 * - 바이오클러스터란? 인포 박스
 * - 바이오 삼각벨트 구축 (인포그래픽 + 테이블 2개)
 * - 바이오 클러스터 주요 도시 (지역 지도)
 *
 * @author JB SQUARE 개발팀
 * @version 3.0.0 - Figma Design Implementation
 */

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BioClusterPage: React.FC = () => {
  /**
   * 📋 Breadcrumb 데이터
   */
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB BIO 클러스터', href: '#' },
    { label: '클러스터 현황', href: '#', active: true }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content Container - 1060px width */}
      <main className="max-w-[1060px] mx-auto px-4 py-12">

        {/* ============================================
            1. PAGE TITLE + BREADCRUMB (y=168px)
            ============================================ */}
        <section className="mb-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 text-sm">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <span
                  className={`px-3 py-1.5 rounded ${
                    item.active
                      ? 'bg-white border border-gray-200 text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Category Label */}
          <div className="mb-4">
            <span className="text-[#00B8CC] font-semibold text-base tracking-tight">
              JB BIO 클러스터
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-[60px] font-bold leading-[84px] text-[#121418]">
            클러스터 현황
          </h1>
        </section>

        {/* ============================================
            2. INFO BOX: "바이오클러스터란?" (y=358px)
            ============================================ */}
        <section className="mb-20">
          <div className="bg-[#F4F6FB] rounded-2xl p-8 md:px-16 md:py-8 flex flex-col md:flex-row items-start gap-8">
            {/* Icon - Left */}
            <div className="flex-shrink-0">
              <div className="w-[100px] h-[100px] bg-white rounded-full flex items-center justify-center shadow-sm">
                {/* Bio Icon Placeholder - 실제로는 SVG 아이콘 사용 */}
                <svg className="w-12 h-12 text-[#00B8CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>

            {/* Text Content - Right */}
            <div className="flex-1">
              {/* Title */}
              <h2
                className="text-[32px] font-bold leading-[44.8px] text-[#121418] mb-4"
                style={{ letterSpacing: '-0.32px' }}
              >
                바이오클러스터란?
              </h2>

              {/* Description - Exact Figma content, no bold highlights */}
              <p
                className="text-lg leading-[27px] text-[#24272D]"
                style={{ letterSpacing: '-0.18px' }}
              >
                바이오클러스터는 연구개발, 임상, 생산 등 바이오 산업의 전주기를 하나의 체계로 연결해 기업·대학·연구기관이 협력하는 산업 생태계를 의미합니다.
                <br /><br />
                전라북도는 이러한 바이오클러스터를 중심으로 연구개발특구와 기회발전특구를 연계하여 지역별 특화 역량을 모은 전북형 바이오 삼각벨트를 구축하고 있습니다.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================
            3. SECTION 1: "바이오 삼각벨트 구축" (y=671px)
            ============================================ */}
        <section className="mb-20">
          {/* Section Title */}
          <h2
            className="text-[40px] font-bold leading-[56px] text-[#121418] mb-6"
            style={{ letterSpacing: '-0.4px' }}
          >
            바이오 삼각벨트 구축
          </h2>

          {/* A. Triangle Infographic - Figma Design */}
          <div className="bg-[#F8F8FB] rounded-2xl p-12 mb-10">
            {/* Infographic Image from Figma */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-4xl">
                <Image
                  src="/images/infographic.png"
                  alt="바이오 삼각벨트 - 전주, 정읍, 익산을 연결하는 전북 바이오 클러스터 인포그래픽"
                  width={1060}
                  height={716}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>

          {/* B. Tables: Special Zone Benefits */}
          <div className="space-y-6">
            {/* Table 1: 연구개발특구 */}
            <div className="border border-[#D5DBE0] rounded-lg overflow-hidden">
              {/* Table Title */}
              <div className="bg-gray-50 px-6 py-4 border-b border-[#D5DBE0]">
                <h4 className="text-2xl font-semibold text-[#24272D]">
                  연구개발특구(전주, 정읍, 완주, 익산(예정))
                </h4>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#D5DBE0]">
                      <th className="px-6 py-4 text-left text-lg font-normal text-[#24272D] w-32">구분</th>
                      <th className="px-6 py-4 text-left text-lg font-normal text-[#24272D]">국세(법인세)</th>
                      <th className="px-6 py-4 text-left text-lg font-normal text-[#24272D]">지방세(재산/취득세)</th>
                      <th className="px-6 py-4 text-left text-lg font-normal text-[#24272D]">기타</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-6 py-6 text-lg text-[#24272D] border-b border-[#D5DBE0] bg-gray-50">지원내용</td>
                      <td className="px-6 py-6 text-lg text-[#24272D] border-b border-[#D5DBE0]">
                        3년 100% + 2년 50% 감면
                      </td>
                      <td className="px-6 py-6 text-lg text-[#24272D] border-b border-[#D5DBE0]">
                        재산세 7년 100% + 3년 50% 감면<br />
                        취득세 면제
                      </td>
                      <td className="px-6 py-6 text-lg text-[#24272D] border-b border-[#D5DBE0]">
                        사업 참여 가점, 기반시설 등
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footnote */}
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600">
                * 소재·부품·장비 R&D 집중 투자 업종 최대 7년간 100% 감면
              </div>
            </div>

            {/* Table 2: 기회발전특구 */}
            <div className="border border-[#D5DBE0] rounded-lg overflow-hidden">
              {/* Table Title */}
              <div className="bg-gray-50 px-6 py-4 border-b border-[#D5DBE0]">
                <h4 className="text-2xl font-semibold text-[#24272D]">
                  기회발전특구(전주, 정읍, 익산, 김제)
                </h4>
              </div>

              {/* Table Content */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#D5DBE0]">
                      <th className="px-6 py-4 text-left text-lg font-normal text-[#24272D] w-32">구분</th>
                      <th className="px-6 py-4 text-left text-lg font-normal text-[#24272D]">법인세·소득세</th>
                      <th className="px-6 py-4 text-left text-lg font-normal text-[#24272D]">취득세·재산세</th>
                      <th className="px-6 py-4 text-left text-lg font-normal text-[#24272D]">규제·정주</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-6 py-6 text-lg text-[#24272D] border-b border-[#D5DBE0] bg-gray-50">지원내용</td>
                      <td className="px-6 py-6 text-lg text-[#24272D] border-b border-[#D5DBE0]">
                        5년 100% + 2년 50% 감면
                      </td>
                      <td className="px-6 py-6 text-lg text-[#24272D] border-b border-[#D5DBE0]">
                        취득세 100% 감면<br />
                        재산세 5년 100% + 5년 50% 감면
                      </td>
                      <td className="px-6 py-6 text-lg text-[#24272D] border-b border-[#D5DBE0]">
                        규제특례· 주택공급·교육 등
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footnote */}
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600">
                * 업종별 세부 지원 내용은 관할 지자체에 문의 바랍니다
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            4. SECTION 2: "바이오 클러스터 주요 도시" (y=2053px)
            ============================================ */}
        <section className="mb-20">
          {/* Section Title */}
          <h2
            className="text-[40px] font-bold leading-[56px] text-[#121418] mb-6"
            style={{ letterSpacing: '-0.4px' }}
          >
            바이오 클러스터 주요 도시
          </h2>

          {/* Map Container - Figma Design */}
          <div className="bg-[#F8F8FB] rounded-2xl p-[60px]">
            {/* Map Image from Figma */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-5xl">
                <Image
                  src="/images/Map.png"
                  alt="전라북도 바이오 클러스터 지도 - 익산, 전주, 김제, 정읍 등 주요 도시 및 산업단지"
                  width={1060}
                  height={964}
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            5. CONTACT SECTION (Optional - CTA)
            ============================================ */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-[#104099] to-[#00B8CD] rounded-2xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">입주 및 투자 문의</h2>
            <p className="text-lg mb-8 text-white/90">
              JB BIO 클러스터의 입주 및 투자에 대해 궁금하신 사항이 있으시면 문의해 주세요.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-8 py-4 border border-white/20">
                <div className="text-sm text-white/80 mb-1">전화문의</div>
                <div className="text-xl font-bold">063-219-3600</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-8 py-4 border border-white/20">
                <div className="text-sm text-white/80 mb-1">이메일</div>
                <div className="text-xl font-bold">info@jbbia.or.kr</div>
              </div>
            </div>

            <p className="mt-8 text-sm text-white/70">
              📍 전북 정읍시 산내면 첨단과학산업단지
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default BioClusterPage;
