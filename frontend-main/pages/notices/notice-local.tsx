/**
 * 📋 지자체공고 페이지
 *
 * 전라북도 및 산하 지방자치단체에서 발표하는 바이오 산업 관련 지원 사업 및 공고를 보여주는 페이지입니다.
 *
 * **주요 기능:**
 * - 지자체공고(source_id='source:jbtp:local') 필터링
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
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { useNotices } from '@/hooks/useNotices';
import { useNoticeSearch } from '@/hooks/useNoticeSearch';
import { NoticeCard } from '@/components/notices/NoticeCard';
import { SearchBar } from '@/components/sample-board/SearchBar';
import { Pagination } from '@/components/sample-board/Pagination';
import { NoticePageLayout } from '@/components/layout/NoticePageLayout';

/**
 * 지자체공고 페이지 컴포넌트
 */
export default function LocalGovernmentNoticePage() {
  /**
   * 검색 모드 상태
   * - false: 전체 목록 보기 (페이지네이션 있음)
   * - true: 검색 결과 보기 (페이지네이션 없음)
   */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /**
   * useNotices 훅 - 지자체공고 데이터 가져오기
   *
   * source_id: 'source:jbtp:local' - JBTP 지자체 공고만 필터링 (전북 지역 공고)
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
    source_id: 'source:jbtp:local',
    limit: 20,
    sort_order: 'desc'
  });

  /**
   * useNoticeSearch 훅 - 검색 기능
   *
   * additionalFilters: source_id를 'source:jbtp:local'로 고정하여
   * JBTP 지자체 공고 내에서만 검색하도록 제한
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
    additionalFilters: {
      source_id: 'source:jbtp:local'
    },
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

  return (
    <>
      {/* SEO를 위한 페이지 메타데이터 */}
      <Head>
        <title>지자체공고 - JB SQUARE</title>
        <meta name="description" content="전라북도 및 산하 지방자치단체에서 발표하는 바이오 산업 관련 지원 사업 및 공고" />
      </Head>

      {/* 공통 레이아웃 사용 */}
      <NoticePageLayout
        pageTitle="지자체공고"
        pageSubtitle="전라북도 및 산하 지방자치단체에서 발표하는 바이오 산업 관련 지원 사업 및 공고"
        breadcrumbCurrent="지자체공고"
      >
        {/* 검색바 */}
        <div className="mb-12">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            loading={searchLoading}
            placeholder="지자체공고 검색 (제목, 내용, 기관명)"
            size="large"
            showClearButton={true}
          />
        </div>

        {/* 검색 결과 안내 */}
        {isSearchMode && hasSearched && !searchLoading && (
          <div className="mb-8 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">"{searchQuery}"</span> 검색 결과
              <span className="ml-2 font-semibold text-gray-900">{totalResults}개</span>
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
            {displayNotices.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {isSearchMode ? '검색 결과가 없습니다' : '등록된 지자체공고가 없습니다'}
                </h3>
                <p className="text-gray-500">
                  {isSearchMode ? '다른 검색어로 시도해보세요' : '나중에 다시 확인해주세요'}
                </p>
              </div>
            )}

            {/* 공고 카드 목록 - 단일 컬럼 (1단) */}
            {displayNotices.length > 0 && (
              <>
                {/*
                  IMPORTANT: 데스크톱에서도 1단 레이아웃 사용
                  - grid-cols-1: 모든 화면 크기에서 1단
                  - gap-6: 카드 간 간격 24px
                */}
                <div className="grid grid-cols-1 gap-6 mb-12">
                  {displayNotices.map(notice => (
                    <NoticeCard
                      key={notice.id}
                      notice={notice}
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
