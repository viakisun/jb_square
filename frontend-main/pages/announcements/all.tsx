/**
 * 📢 최신공고 모아보기 페이지
 *
 * 모든 부처/기관의 지원사업 공고를 통합하여 표시
 * - 검색 및 필터링 기능
 * - 카테고리별 공고 분류
 * - 공고 목록 및 상세 정보
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { CategorySection } from '@/components/sample-board/CategorySection';

const AllAnnouncementsPage: React.FC = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '지원사업공고', href: '/announcements' },
    { label: '최신공고 모아보기' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* 페이지 헤더 */}
      <section className="bg-gradient-to-r from-primary-blue to-primary-cyan py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            최신공고 모아보기
          </h1>
          <p className="text-xl text-white/90">
            모든 부처/기관의 지원사업 공고를 한 곳에서 확인하세요
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* CategorySection 컴포넌트 재사용 - sourceId 없이 전체 공고 표시 */}
          <CategorySection
            title="전체 지원사업 공고"
            viewAllLink="/announcements/all"
            limit={20}
          />

          {/* 안내 메시지 */}
          <div className="mt-12 bg-blue-50 border-l-4 border-primary-blue p-6 rounded-r-lg">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-primary-blue mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  공고 정보 안내
                </h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• 공고는 매일 자동으로 업데이트됩니다.</li>
                  <li>• 관심 공고는 북마크하여 나중에 확인할 수 있습니다.</li>
                  <li>• 상세한 지원 요건은 각 공고의 원문을 확인해주세요.</li>
                  <li>• 문의사항은 해당 기관으로 직접 연락하시기 바랍니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllAnnouncementsPage;
