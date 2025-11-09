/**
 * 🏢 창업보육센터 페이지
 *
 * 전북 바이오 산업 창업보육센터 및 입주기업 정보를 제공하는 페이지입니다.
 *
 * **주요 기능:**
 * - 통계 카드 (총 센터, 총 입주기업, 공실 센터, 평균 입주율)
 * - 지역/검색/정렬 필터
 * - 확장 가능한 센터 카드 목록
 * - 센터별 입주기업 테이블
 * - 완전한 모바일 반응형 디자인
 *
 * **디자인:**
 * - notice-government와 동일한 디자인 언어
 * - NoticePageLayout 사용
 * - 모든 컴포넌트 분리로 깔끔한 구조
 *
 * @author JB SQUARE 개발팀
 * @version 3.0.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { NoticePageLayout } from '@/components/layout/NoticePageLayout';
import { BICenterStatCard } from '@/components/bi-centers/BICenterStatCard';
import { BICenterFilterBar, SortOption } from '@/components/bi-centers/BICenterFilterBar';
import { BICenterCard } from '@/components/bi-centers/BICenterCard';
import { BICenterMapView } from '@/components/bi-centers/BICenterMapView';
import { useBICenters, useBICompanies } from '@/hooks/useBICenters';
import { BICompany } from '@/lib/api/types';

/**
 * 창업보육센터 페이지 컴포넌트
 */
export default function BICentersPage() {
  /**
   * 필터 상태 관리
   */
  const [region, setRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);

  /**
   * API 데이터 가져오기
   */
  const { centers, loading, error, total } = useBICenters({
    region: region === 'all' ? undefined : region,
    limit: 100, // 모든 센터 가져오기
  });

  /**
   * 선택된 센터의 입주기업 가져오기
   */
  const {
    companies,
    loading: companiesLoading,
    fetchCompanies,
  } = useBICompanies(selectedCenterId, undefined);

  /**
   * 필터링 및 정렬된 센터 목록
   */
  const filteredAndSortedCenters = useMemo(() => {
    let result = [...centers];

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (center) =>
          center.center_name.toLowerCase().includes(query) ||
          center.org_name.toLowerCase().includes(query) ||
          center.location?.toLowerCase().includes(query) ||
          center.city?.toLowerCase().includes(query)
      );
    }

    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.center_name.localeCompare(b.center_name);
        case 'latest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'companies':
          return b.companies_count - a.companies_count;
        default:
          return 0;
      }
    });

    return result;
  }, [centers, searchQuery, sortBy]);

  /**
   * 통계 계산
   */
  const statistics = useMemo(() => {
    const totalCenters = centers.length;
    const totalCompanies = centers.reduce((sum, center) => sum + center.companies_count, 0);
    const centersWithVacancy = centers.filter(
      (c) => c.vacant_rooms && c.vacant_rooms !== '없음'
    ).length;
    const avgCompaniesPerCenter =
      totalCenters > 0 ? Math.round((totalCompanies / totalCenters) * 10) / 10 : 0;

    return {
      totalCenters,
      totalCompanies,
      centersWithVacancy,
      avgCompaniesPerCenter,
    };
  }, [centers]);

  /**
   * 센터 카드 클릭 핸들러
   */
  const handleCenterClick = (centerId: number) => {
    if (selectedCenterId === centerId) {
      // 이미 선택된 센터를 다시 클릭하면 닫기
      setSelectedCenterId(null);
    } else {
      // 새로운 센터 선택
      setSelectedCenterId(centerId);
    }
  };

  /**
   * 센터별 입주기업 데이터 맵
   */
  const [companiesByCenter, setCompaniesByCenter] = useState<Record<number, BICompany[]>>({});

  /**
   * 입주기업 데이터가 로드되면 저장
   */
  useEffect(() => {
    if (selectedCenterId && companies.length > 0) {
      setCompaniesByCenter((prev) => ({
        ...prev,
        [selectedCenterId]: companies,
      }));
    }
  }, [selectedCenterId, companies]);

  return (
    <>
      {/* SEO를 위한 페이지 메타데이터 */}
      <Head>
        <title>창업보육센터 - JB SQUARE</title>
        <meta
          name="description"
          content="전북 바이오 산업 창업보육센터 및 입주기업 현황 정보"
        />
      </Head>

      {/* 공통 레이아웃 사용 */}
      <NoticePageLayout
        pageTitle="창업보육센터"
        pageSubtitle="전북 바이오 산업 창업보육센터 및 입주기업 현황"
        breadcrumbCurrent="창업보육센터"
      >
        {/* ==================== 통계 섹션 ==================== */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <BICenterStatCard
              title="총 센터"
              value={statistics.totalCenters}
              unit="개"
            />
            <BICenterStatCard
              title="총 입주기업"
              value={statistics.totalCompanies}
              unit="개"
            />
            <BICenterStatCard
              title="공실 센터"
              value={statistics.centersWithVacancy}
              unit="개"
            />
            <BICenterStatCard
              title="평균 입주기업"
              value={statistics.avgCompaniesPerCenter}
              unit="개"
            />
          </div>
        </section>

        {/* ==================== 필터 섹션 ==================== */}
        <BICenterFilterBar
          region={region}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onRegionChange={setRegion}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
        />

        {/* ==================== 결과 안내 ==================== */}
        {(searchQuery || region !== 'all') && !loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {searchQuery && (
                <>
                  <span className="font-semibold">"{searchQuery}"</span> 검색 결과:{' '}
                </>
              )}
              {region !== 'all' && (
                <>
                  <span className="font-semibold">{region}</span> 지역:{' '}
                </>
              )}
              <span className="font-semibold">{filteredAndSortedCenters.length}개</span> 센터
            </p>
          </div>
        )}

        {/* ==================== 로딩 상태 ==================== */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
              <p className="text-gray-600">센터 정보를 불러오는 중...</p>
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

        {/* ==================== 센터 목록 ==================== */}
        {!loading && !error && (
          <>
            {/* 센터가 없을 때 */}
            {filteredAndSortedCenters.length === 0 && (
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
                  {searchQuery || region !== 'all'
                    ? '검색 결과가 없습니다'
                    : '등록된 창업보육센터가 없습니다'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery || region !== 'all'
                    ? '다른 검색어나 지역으로 시도해보세요'
                    : '나중에 다시 확인해주세요'}
                </p>
              </div>
            )}

            {/* 센터 카드 목록 - 단일 컬럼 */}
            {filteredAndSortedCenters.length > 0 && (
              <>
                <div className="space-y-4 mb-12">
                  {filteredAndSortedCenters.map((center) => (
                    <BICenterCard
                      key={center.id}
                      center={center}
                      companies={companiesByCenter[center.id] || []}
                      companiesLoading={companiesLoading && selectedCenterId === center.id}
                      isExpanded={selectedCenterId === center.id}
                      onClick={() => handleCenterClick(center.id)}
                    />
                  ))}
                </div>

                {/* 지도 섹션 */}
                <BICenterMapView centers={filteredAndSortedCenters} />
              </>
            )}
          </>
        )}
      </NoticePageLayout>
    </>
  );
}
