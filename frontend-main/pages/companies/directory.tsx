/**
 * 🏢 JB 기업정보 페이지
 *
 * 전북 지역 바이오 기업 디렉토리
 * - Organizations API를 통한 실시간 데이터 조회
 * - 검색 및 필터링 (산업분야, 지역, 성장단계)
 * - 카드 그리드 레이아웃 (responsive)
 * - 페이지네이션
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';
import { useOrganizations } from '@/hooks/useOrganizations';

const CompanyDirectoryPage: React.FC = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB 기업정보' },
  ];

  // 필터 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStage, setSelectedStage] = useState('');

  // Organizations API 훅 사용
  const { companies, loading, error, pagination, setFilters, setPage } = useOrganizations({
    limit: 12
  });

  /**
   * 산업 분야 목록
   * 전북 바이오 산업의 주요 분야
   */
  const industries = [
    '바이오의약품',
    '의료기기',
    '농생명',
    '화장품',
    '디지털헬스'
  ];

  /**
   * 전북 지역 목록
   * 14개 시/군
   */
  const regions = [
    '전주시',
    '군산시',
    '익산시',
    '정읍시',
    '남원시',
    '김제시',
    '완주군',
    '진안군',
    '무주군',
    '장수군',
    '임실군',
    '순창군',
    '고창군',
    '부안군'
  ];

  /**
   * 성장 단계 목록
   */
  const stages = [
    '예비창업',
    '창업초기',
    '성장기',
    '성숙기',
    '상장기업'
  ];

  /**
   * 검색 실행 핸들러
   * 사용자가 검색 버튼을 클릭하거나 엔터를 누를 때 실행됩니다.
   */
  const handleSearch = () => {
    setFilters({
      search: searchTerm || undefined,
      industry: selectedIndustry || undefined,
      region: selectedRegion || undefined,
      stage: selectedStage || undefined,
      page: 1 // 검색 시 첫 페이지로 리셋
    });
  };

  /**
   * 필터 초기화 핸들러
   */
  const handleReset = () => {
    setSearchTerm('');
    setSelectedIndustry('');
    setSelectedRegion('');
    setSelectedStage('');
    setFilters({ page: 1 });
  };

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // 스크롤을 맨 위로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-blue to-primary-cyan py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            JB 기업정보
          </h1>
          <p className="text-xl text-white/90">
            전북 바이오 산업의 혁신 기업들을 만나보세요
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* 검색 및 필터 섹션 */}
          <section className="mb-12 bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 검색어 입력 */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기업명 / 대표자명 / 제품명
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all"
                  placeholder="검색어를 입력하세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
              </div>

              {/* 산업 분야 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  산업 분야
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all bg-white"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option value="">전체</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* 지역 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지역
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all bg-white"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="">전체</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* 성장 단계 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성장 단계
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all bg-white"
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                >
                  <option value="">전체</option>
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSearch}
                className="flex-1 bg-primary-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors"
              >
                🔍 검색
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                초기화
              </button>
            </div>
          </section>

          {/* 검색 결과 정보 */}
          {pagination && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                총 <span className="font-bold text-primary-blue">{pagination.total}</span>개 기업
                {(searchTerm || selectedIndustry || selectedRegion || selectedStage) && (
                  <span className="text-sm text-gray-500 ml-2">
                    (필터링됨)
                  </span>
                )}
              </p>
              <div className="text-sm text-gray-500">
                {pagination.page} / {pagination.totalPages} 페이지
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-6 rounded w-3/4 mb-3"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 기업 목록 */}
          {!loading && !error && (
            <>
              {companies.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {companies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/companies/${company.id}`}
                      className="group block"
                    >
                      <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-primary-blue overflow-hidden h-full flex flex-col">
                        {/* 기업 로고 영역 (플레이스홀더) */}
                        <div className="relative h-48 bg-gradient-to-br from-primary-blue/10 to-primary-cyan/10 flex items-center justify-center">
                          <div className="text-6xl">🏢</div>

                          {/* 산업 분야 배지 */}
                          {company.industry && (
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 bg-primary-blue text-white text-xs font-semibold rounded-full">
                                {company.industry}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 기업 정보 */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-blue transition-colors">
                            {company.name}
                          </h3>

                          {company.ceo && (
                            <p className="text-sm text-gray-600 mb-3">
                              <span className="font-medium">대표:</span> {company.ceo}
                            </p>
                          )}

                          {company.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                              {company.description}
                            </p>
                          )}

                          {/* 메타 정보 */}
                          <div className="space-y-2 pt-4 border-t border-gray-100">
                            {company.address && (
                              <div className="flex items-start text-xs text-gray-500">
                                <svg
                                  className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="line-clamp-1">{company.address}</span>
                              </div>
                            )}

                            {company.website && (
                              <div className="flex items-center text-xs text-gray-500">
                                <svg
                                  className="w-4 h-4 mr-1.5 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                  />
                                </svg>
                                <span className="line-clamp-1">{company.website}</span>
                              </div>
                            )}

                            {company.established_date && (
                              <div className="flex items-center text-xs text-gray-500">
                                <svg
                                  className="w-4 h-4 mr-1.5 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>설립: {new Date(company.established_date).getFullYear()}년</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {searchTerm || selectedIndustry || selectedRegion || selectedStage
                      ? '검색 조건에 맞는 기업이 없습니다.'
                      : '등록된 기업 정보가 없습니다.'}
                  </p>
                  {(searchTerm || selectedIndustry || selectedRegion || selectedStage) && (
                    <button
                      onClick={handleReset}
                      className="mt-4 px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
                    >
                      필터 초기화
                    </button>
                  )}
                </div>
              )}

              {/* 페이지네이션 */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center gap-2">
                    {/* 이전 페이지 버튼 */}
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      이전
                    </button>

                    {/* 페이지 번호 */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      // 현재 페이지 주변 페이지만 표시
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 border rounded-lg transition-all ${
                            pagination.page === pageNum
                              ? 'bg-primary-blue text-white border-primary-blue'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* 다음 페이지 버튼 */}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      다음
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}

          {/* 안내 메시지 */}
          <div className="mt-16 bg-blue-50 border-l-4 border-primary-blue p-6 rounded-r-lg">
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
                  기업 정보 안내
                </h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• 기업 정보는 정기적으로 업데이트됩니다.</li>
                  <li>• 상세한 기업 정보는 각 기업 카드를 클릭하여 확인하실 수 있습니다.</li>
                  <li>• 기업 정보 등록 및 수정 문의는 전북바이오융합산업진흥원으로 연락해주세요.</li>
                  <li>• 전화: 063-219-3600 / 이메일: info@jbbia.or.kr</li>
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

export default CompanyDirectoryPage;
