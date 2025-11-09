/**
 * 📋 유관기관공고 페이지
 *
 * 바이오 산업 관련 유관기관에서 발표하는 지원 사업 및 공고를 보여주는 페이지입니다.
 *
 * **주요 기능:**
 * - 유관기관공고 필터링 (NTIS, K-STARTUP, 창업진흥원, 기술보증기금 등)
 * - 검색 기능 (제목, 내용, 기관명)
 * - 단일 컬럼 레이아웃 (데스크톱에서도 1단)
 * - 페이지네이션
 *
 * **디자인:**
 * - bio-cluster/cluster.tsx와 동일한 디자인 언어
 * - NoticePageLayout 재사용으로 중복 코드 최소화
 *
 * **초보자를 위한 설명:**
 * 1. useNotices: 백엔드 API에서 공고 데이터를 가져오는 훅
 * 2. useNoticeSearch: 검색 기능을 제공하는 훅
 * 3. NoticePageLayout: 공통 레이아웃 (제목, 설명, Info Box)
 * 4. NoticeCard: 개별 공고를 카드 형태로 표시
 * 5. Pagination: 페이지 전환 버튼
 *
 * **NOTE:**
 * 유관기관공고는 별도 category가 없어 crawler_source_id로 필터링합니다.
 * NTIS, K-STARTUP 등의 공고를 포함합니다.
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { useNotices } from '@/hooks/useNotices';
import { useNoticeSearch } from '@/hooks/useNoticeSearch';
import { NoticeCard } from '@/components/sample-board/NoticeCard';
import { SearchBar } from '@/components/sample-board/SearchBar';
import { Pagination } from '@/components/sample-board/Pagination';
import { NoticePageLayout } from '@/components/layout/NoticePageLayout';

/**
 * 유관기관공고 페이지 컴포넌트
 */
export default function InstitutionsNoticePage() {
  /**
   * 검색 모드 상태
   * - false: 전체 목록 보기 (페이지네이션 있음)
   * - true: 검색 결과 보기 (페이지네이션 없음)
   */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /**
   * useNotices 훅 - 유관기관공고 데이터 가져오기
   *
   * 유관기관공고는 별도 category가 없을 수 있으므로
   * 일단 전체 공고를 가져온 후 검색으로 필터링하거나,
   * 백엔드에서 지원하는 필터를 사용합니다.
   *
   * limit: 20 - 한 페이지에 20개씩 표시
   * sort_order: 'desc' - 최신순 정렬
   */
  const {
    notices,              // 공고 목록 배열
    loading: listLoading, // 로딩 중인지 여부
    error: listError,     // 에러 메시지
    pagination,           // 페이지 정보 (현재 페이지, 전체 페이지 수 등)
    setPage,              // 페이지 변경 함수
    fetchNotices          // 데이터 새로고침 함수
  } = useNotices({
    // 유관기관 필터링: 백엔드 API가 지원하는 경우 category 또는 tags 사용
    // 현재는 검색으로 필터링
    limit: 20,
    sort_order: 'desc'
  });

  /**
   * useNoticeSearch 훅 - 검색 기능
   *
   * 유관기관 관련 키워드로 검색할 수 있도록 설정
   */
  const {
    searchQuery,          // 현재 검색어
    setSearchQuery,       // 검색어 변경 함수
    results: searchResults, // 검색 결과 배열
    loading: searchLoading, // 검색 중인지 여부
    error: searchError,   // 검색 에러
    totalResults,         // 검색 결과 총 개수
    hasSearched           // 검색을 실행했는지 여부
  } = useNoticeSearch({
    additionalFilters: {},
    debounceDelay: 500,   // 검색어 입력 후 500ms 대기
    minLength: 2          // 최소 2글자 이상 입력해야 검색
  });

  /**
   * 검색어 변경 핸들러
   *
   * 검색어가 2글자 이상이면 검색 모드로 전환,
   * 그렇지 않으면 일반 목록 모드로 복귀
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(query.trim().length >= 2);
  };

  /**
   * 현재 표시할 데이터 결정
   *
   * 검색 모드: 검색 결과 표시
   * 일반 모드: 전체 공고 목록 표시
   */
  const displayNotices = isSearchMode ? searchResults : notices;
  const displayLoading = isSearchMode ? searchLoading : listLoading;
  const displayError = isSearchMode ? searchError : listError;

  /**
   * 유관기관 공고 필터링 (클라이언트 사이드)
   *
   * NTIS, K-STARTUP 등 유관기관 소스의 공고만 필터링
   * 백엔드에서 필터링을 지원하지 않는 경우 사용
   */
  const filteredNotices = displayNotices.filter(notice => {
    // crawler_source_id 또는 organization으로 유관기관 판별
    const institutionSources = ['ntis', 'k-startup', 'ntis_rss'];
    const institutionOrgs = ['NTIS', 'K-STARTUP', '창업진흥원', '기술보증기금', '신용보증기금'];

    return institutionSources.includes(notice.crawler_source_id) ||
           (notice.organization && institutionOrgs.some(org => notice.organization?.includes(org)));
  });

  return (
    <>
      {/* SEO를 위한 페이지 메타데이터 */}
      <Head>
        <title>유관기관공고 - JB SQUARE</title>
        <meta name="description" content="NTIS, K-STARTUP, 창업진흥원 등 바이오 산업 관련 유관기관의 지원 사업 및 공고" />
      </Head>

      {/* 공통 레이아웃 사용 */}
      <NoticePageLayout
        pageTitle="유관기관공고"
        pageSubtitle="NTIS, K-STARTUP, 창업진흥원 등 바이오 산업 관련 유관기관의 지원 사업 및 공고"
        infoTitle="유관기관공고란?"
        infoDescription={
          <>
            유관기관공고는 NTIS(국가과학기술지식정보서비스), K-STARTUP(창업넷), 창업진흥원, 기술보증기금, 신용보증기금 등 바이오 산업 관련 유관기관에서 발표하는 지원 사업 공고입니다.
            <br /><br />
            R&D 과제, 창업 지원, 보증 지원, 투자 유치 등 다양한 형태의 지원 사업 정보를 한눈에 확인할 수 있습니다.
          </>
        }
        breadcrumbCurrent="유관기관공고"
      >
        {/* 검색바 */}
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            loading={searchLoading}
            placeholder="유관기관공고 검색 (제목, 내용, 기관명)"
            size="large"
            showClearButton={true}
          />
        </div>

        {/* 검색 결과 안내 */}
        {isSearchMode && hasSearched && !searchLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">"{searchQuery}"</span> 검색 결과:
              <span className="ml-2 font-semibold">{totalResults}개</span> 공고
            </p>
          </div>
        )}

        {/* 로딩 상태 */}
        {displayLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">공고를 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {!displayLoading && displayError && (
          <div className="py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                오류가 발생했습니다
              </h3>
              <p className="text-red-600 mb-4">{displayError}</p>
              <button
                onClick={fetchNotices}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* 공고 목록 */}
        {!displayLoading && !displayError && (
          <>
            {/* 공고가 없을 때 */}
            {filteredNotices.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {isSearchMode ? '검색 결과가 없습니다' : '등록된 유관기관공고가 없습니다'}
                </h3>
                <p className="text-gray-500">
                  {isSearchMode ? '다른 검색어로 시도해보세요' : '나중에 다시 확인해주세요'}
                </p>
              </div>
            )}

            {/* 공고 카드 목록 - 단일 컬럼 (1단) */}
            {filteredNotices.length > 0 && (
              <>
                {/*
                  IMPORTANT: 데스크톱에서도 1단 레이아웃 사용
                  - grid-cols-1: 모든 화면 크기에서 1단
                  - gap-6: 카드 간 간격 24px
                */}
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {filteredNotices.map(notice => (
                    <NoticeCard
                      key={notice.id}
                      notice={notice}
                      variant="detailed"  // 상세 변형 사용 (더 많은 정보 표시)
                    />
                  ))}
                </div>

                {/* 페이지네이션 - 검색 모드가 아닐 때만 표시 */}
                {!isSearchMode && pagination && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={setPage}
                      size="large"
                      showPageInfo={true}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </NoticePageLayout>
    </>
  );
}
