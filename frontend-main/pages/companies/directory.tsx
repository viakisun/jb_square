/**
 * 🏢 JB 기업정보 페이지
 *
 * 전북 지역 바이오 기업 디렉토리
 * - Organizations API를 통한 실시간 데이터 조회
 * - 검색 및 필터링 (산업분류, 기업규모, KSIC 코드)
 * - 카드 그리드 레이아웃 (responsive)
 * - 페이지네이션
 * - incubator/centers와 일관된 디자인
 *
 * @author JB SQUARE 개발팀
 * @version 3.0.0
 */

import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { NoticePageLayout } from '@/components/layout/NoticePageLayout';
import { useOrganizations } from '@/hooks/useOrganizations';

/**
 * 통계 카드 컴포넌트
 */
interface StatCardProps {
  title: string;
  value: number;
  unit: string;
}

function StatCard({ title, value, unit }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-primary-blue">{value.toLocaleString()}</span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  );
}

/**
 * 필터바 컴포넌트
 */
interface FilterBarProps {
  industryType: string;
  companyScale: string;
  searchQuery: string;
  onIndustryTypeChange: (value: string) => void;
  onCompanyScaleChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

function FilterBar({
  industryType,
  companyScale,
  searchQuery,
  onIndustryTypeChange,
  onCompanyScaleChange,
  onSearchChange,
  onSearch,
  onReset
}: FilterBarProps) {
  return (
    <section className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* 검색어 입력 */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기업명 / 대표자명 / 제품명
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch();
            }}
          />
        </div>

        {/* 산업 분류 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            산업 분류
          </label>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-white"
            value={industryType}
            onChange={(e) => onIndustryTypeChange(e.target.value)}
          >
            <option value="">전체</option>
            <option value="BIO_CORE">바이오 핵심산업</option>
            <option value="BIO_RELATED">전후방 연관산업</option>
            <option value="NON_BIO">비바이오산업</option>
          </select>
        </div>

        {/* 기업 규모 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기업 규모
          </label>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all bg-white"
            value={companyScale}
            onChange={(e) => onCompanyScaleChange(e.target.value)}
          >
            <option value="">전체</option>
            <option value="대기업">대기업</option>
            <option value="중견기업">중견기업</option>
            <option value="중소기업">중소기업</option>
          </select>
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex gap-3">
        <button
          onClick={onSearch}
          className="flex-1 bg-primary-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors"
        >
          🔍 검색
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          초기화
        </button>
      </div>
    </section>
  );
}

/**
 * 산업 분류 표시 함수
 */
function getIndustryTypeLabel(industryType: string): string {
  switch (industryType) {
    case 'BIO_CORE':
      return '바이오 핵심산업';
    case 'BIO_RELATED':
      return '전후방 연관산업';
    case 'NON_BIO':
      return '비바이오산업';
    default:
      return industryType;
  }
}

/**
 * 기업 ID 기반 Unsplash 이미지 URL 생성
 * 산업 분류에 따라 관련된 키워드의 이미지 반환
 */
function getCompanyImageUrl(companyId: number, industryType: string): string {
  // 산업별 키워드 배열
  const keywords = industryType === 'BIO_CORE'
    ? ['biotech', 'laboratory', 'science', 'medical', 'research', 'dna', 'microscope', 'scientist']
    : industryType === 'BIO_RELATED'
    ? ['factory', 'manufacturing', 'industrial', 'technology', 'innovation', 'machinery', 'production', 'engineering']
    : ['office', 'business', 'corporate', 'workspace', 'building', 'team', 'modern', 'professional'];

  // 기업 ID를 사용하여 일관된 키워드 선택
  const keyword = keywords[companyId % keywords.length];

  // Unsplash Source API - 고정된 시드 값으로 일관성 유지
  // 크기: 800x600 (16:9 비율에 가까움)
  return `https://source.unsplash.com/800x600/?${keyword},${companyId}`;
}

/**
 * 기업명 기반 로고 오버레이 생성 (UI Avatars)
 * 이미지 위에 표시할 로고 뱃지용
 */
function getCompanyLogoOverlay(companyName: string, industryType: string): string {
  const initials = companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const bgColor = industryType === 'BIO_CORE'
    ? '0EA5E9' // cyan-500
    : industryType === 'BIO_RELATED'
    ? '3B82F6' // blue-500
    : '8B5CF6'; // violet-500

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&background=${bgColor}&color=ffffff&bold=true&font-size=0.5&rounded=true`;
}

/**
 * 산업 분류에 따른 그라디언트 색상
 */
function getIndustryGradient(industryType: string): string {
  switch (industryType) {
    case 'BIO_CORE':
      return 'from-cyan-100 to-cyan-50';
    case 'BIO_RELATED':
      return 'from-blue-100 to-blue-50';
    case 'NON_BIO':
      return 'from-violet-100 to-violet-50';
    default:
      return 'from-gray-100 to-gray-50';
  }
}

/**
 * 기업정보 디렉토리 페이지 컴포넌트
 */
export default function CompanyDirectoryPage() {
  // 필터 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustryType, setSelectedIndustryType] = useState('');
  const [selectedCompanyScale, setSelectedCompanyScale] = useState('');

  // Organizations API 훅 사용
  const { companies, loading, error, pagination, setFilters, setPage } = useOrganizations({
    limit: 12
  });

  /**
   * 통계 계산
   */
  const statistics = useMemo(() => {
    const total = pagination?.total || 0;
    const bioCore = companies.filter(c => c.industry_type === 'BIO_CORE').length;
    const bioRelated = companies.filter(c => c.industry_type === 'BIO_RELATED').length;
    const withRI = companies.filter(c => c.has_research_institute).length;

    return {
      total,
      bioCore,
      bioRelated,
      withRI
    };
  }, [companies, pagination]);

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = () => {
    setFilters({
      search: searchTerm || undefined,
      industry_type: selectedIndustryType || undefined,
      company_scale: selectedCompanyScale || undefined,
      page: 1
    });
  };

  /**
   * 필터 초기화 핸들러
   */
  const handleReset = () => {
    setSearchTerm('');
    setSelectedIndustryType('');
    setSelectedCompanyScale('');
    setFilters({ page: 1 });
  };

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* SEO를 위한 페이지 메타데이터 */}
      <Head>
        <title>JB 기업정보 - JB SQUARE</title>
        <meta
          name="description"
          content="전북 바이오 산업의 혁신 기업들을 만나보세요"
        />
      </Head>

      {/* 공통 레이아웃 사용 */}
      <NoticePageLayout
        pageTitle="JB 기업정보"
        pageSubtitle="전북 바이오 산업의 혁신 기업들을 만나보세요"
        breadcrumbCurrent="JB 기업정보"
      >
        {/* ==================== 통계 섹션 ==================== */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="전체 기업"
              value={statistics.total}
              unit="개"
            />
            <StatCard
              title="바이오 핵심산업"
              value={statistics.bioCore}
              unit="개"
            />
            <StatCard
              title="전후방 연관산업"
              value={statistics.bioRelated}
              unit="개"
            />
            <StatCard
              title="연구소 보유"
              value={statistics.withRI}
              unit="개"
            />
          </div>
        </section>

        {/* ==================== 필터 섹션 ==================== */}
        <FilterBar
          industryType={selectedIndustryType}
          companyScale={selectedCompanyScale}
          searchQuery={searchTerm}
          onIndustryTypeChange={setSelectedIndustryType}
          onCompanyScaleChange={setSelectedCompanyScale}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        {/* ==================== 결과 안내 ==================== */}
        {(searchTerm || selectedIndustryType || selectedCompanyScale) && !loading && pagination && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {searchTerm && (
                <>
                  <span className="font-semibold">"{searchTerm}"</span> 검색 결과:{' '}
                </>
              )}
              {selectedIndustryType && (
                <>
                  <span className="font-semibold">{getIndustryTypeLabel(selectedIndustryType)}</span>:{' '}
                </>
              )}
              {selectedCompanyScale && (
                <>
                  <span className="font-semibold">{selectedCompanyScale}</span>:{' '}
                </>
              )}
              <span className="font-semibold">{pagination.total}개</span> 기업
            </p>
          </div>
        )}

        {/* ==================== 로딩 상태 ==================== */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
              <p className="text-gray-600">기업 정보를 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* ==================== 에러 상태 ==================== */}
        {!loading && error && (
          <div className="py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* ==================== 기업 목록 ==================== */}
        {!loading && !error && (
          <>
            {/* 기업이 없을 때 */}
            {companies.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
                  <svg
                    className="w-16 h-16 text-gray-400"
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
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {searchTerm || selectedIndustryType || selectedCompanyScale
                    ? '검색 결과가 없습니다'
                    : '등록된 기업 정보가 없습니다'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || selectedIndustryType || selectedCompanyScale
                    ? '다른 검색 조건으로 시도해보세요'
                    : '나중에 다시 확인해주세요'}
                </p>
              </div>
            )}

            {/* 기업 카드 목록 */}
            {companies.length > 0 && (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {companies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/companies/${company.id}`}
                      className="group block"
                    >
                      <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-primary-blue overflow-hidden h-full flex flex-col">
                        {/* 기업 이미지 영역 */}
                        <div className="relative h-48 overflow-hidden group/image">
                          {/* 메인 이미지: Unsplash 산업별 이미지 */}
                          <img
                            src={getCompanyImageUrl(company.id, company.industry_type)}
                            alt={`${company.company_name}`}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              // 이미지 로드 실패 시 그라디언트 폴백
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const gradient = document.createElement('div');
                                gradient.className = `absolute inset-0 bg-gradient-to-br ${getIndustryGradient(company.industry_type)}`;
                                parent.appendChild(gradient);
                              }
                            }}
                          />

                          {/* 어두운 그라디언트 오버레이 (가독성 향상) */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                          {/* 산업 분류 배지 */}
                          {company.industry_type && (
                            <div className="absolute top-4 left-4 z-20">
                              <span className="px-3 py-1.5 bg-primary-blue/95 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg border border-white/30">
                                {getIndustryTypeLabel(company.industry_type)}
                              </span>
                            </div>
                          )}

                          {/* 연구소 보유 배지 */}
                          {company.has_research_institute && (
                            <div className="absolute top-4 right-4 z-20">
                              <span className="px-3 py-1.5 bg-green-500/95 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg border border-white/30">
                                🔬 연구소
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 기업 정보 */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-blue transition-colors">
                            {company.company_name}
                          </h3>

                          {company.ceo_name && (
                            <p className="text-sm text-gray-600 mb-3">
                              <span className="font-medium">대표:</span> {company.ceo_name}
                            </p>
                          )}

                          {company.main_products && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                              {company.main_products}
                            </p>
                          )}

                          {/* 메타 정보 */}
                          <div className="space-y-2 pt-4 border-t border-gray-100">
                            {company.ksic_10th_name && (
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
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                  />
                                </svg>
                                <span className="line-clamp-1">{company.ksic_10th_name}</span>
                              </div>
                            )}

                            {company.company_scale && (
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
                                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                  />
                                </svg>
                                <span>{company.company_scale}</span>
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
          </>
        )}

        {/* ==================== 안내 메시지 ==================== */}
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
      </NoticePageLayout>
    </>
  );
}
