/**
 * 📋 공고 목록 페이지
 *
 * 실제로 동작하는 공고 게시판 목록 페이지입니다.
 * API 게이트웨이, 커스텀 훅, 컴포넌트를 모두 통합하여 구현한 샘플 페이지입니다.
 *
 * 이 페이지는 초보 개발자가 참고할 수 있도록 작성되었습니다:
 * - API 게이트웨이 사용법
 * - 커스텀 훅 활용법
 * - 컴포넌트 조합 방법
 * - 로딩/에러 상태 처리
 * - 필터링과 페이지네이션
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
import { FilterBar } from '@/components/sample-board/FilterBar';
import { Pagination } from '@/components/sample-board/Pagination';

/**
 * 공고 목록 페이지 컴포넌트
 *
 * @returns 공고 목록 페이지 JSX
 */
export default function SampleBoardPage() {
  /**
   * 검색 모드 상태 관리
   * - false: 일반 목록 모드 (필터링 + 페이지네이션)
   * - true: 검색 모드 (검색 결과 표시)
   */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /**
   * useNotices 훅 사용
   *
   * 공고 목록, 로딩 상태, 에러, 페이지네이션, 필터 등을 관리합니다.
   */
  const {
    notices,
    loading: listLoading,
    error: listError,
    pagination,
    setPage,
    filters,
    setFilters,
    fetchNotices
  } = useNotices({
    limit: 20,
    sort_order: 'desc'
  });

  /**
   * useNoticeSearch 훅 사용
   *
   * 검색어 입력, 검색 결과, 디바운싱 등을 관리합니다.
   */
  const {
    searchQuery,
    setSearchQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    totalResults,
    hasSearched
  } = useNoticeSearch({
    debounceDelay: 500,
    minLength: 2
  });

  /**
   * 검색어 변경 핸들러
   *
   * 검색어가 입력되면 검색 모드로 전환하고,
   * 검색어가 비어있으면 일반 목록 모드로 전환합니다.
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (query.trim().length >= 2) {
      setIsSearchMode(true);
    } else {
      setIsSearchMode(false);
    }
  };

  /**
   * 현재 표시할 데이터 결정
   * - 검색 모드: 검색 결과
   * - 일반 모드: 필터링된 목록
   */
  const displayNotices = isSearchMode ? searchResults : notices;
  const displayLoading = isSearchMode ? searchLoading : listLoading;
  const displayError = isSearchMode ? searchError : listError;

  return (
    <>
      {/* 페이지 메타데이터 */}
      <Head>
        <title>공고 게시판 - JB SQUARE</title>
        <meta name="description" content="JB SQUARE 공고 게시판 샘플 페이지" />
      </Head>

      {/* 메인 컨테이너 */}
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  공고 게시판
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  정부, 민간, R&D, 스타트업 공고를 한 곳에서 확인하세요
                </p>
              </div>

              {/* API 문서 링크 */}
              <div className="flex items-center gap-4">
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  📚 API 문서 보기
                </a>
                <a
                  href="/docs/API_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  📖 개발 가이드
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 검색바 */}
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              loading={searchLoading}
              placeholder="공고 제목, 내용, 기관명으로 검색..."
              size="large"
              autoFocus={false}
            />
          </div>

          {/* 검색 결과 안내 */}
          {isSearchMode && hasSearched && !searchLoading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">"{searchQuery}"</span> 검색 결과:
                <span className="ml-2 font-semibold">{totalResults}개</span> 공고를 찾았습니다
              </p>
            </div>
          )}

          {/* 필터바 (검색 모드가 아닐 때만 표시) */}
          {!isSearchMode && (
            <div className="mb-6">
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                layout="horizontal"
              />
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
                <svg
                  className="mx-auto h-12 w-12 text-red-400 mb-4"
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
                <div className="py-20">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {isSearchMode ? '검색 결과가 없습니다' : '등록된 공고가 없습니다'}
                    </h3>
                    <p className="text-gray-500">
                      {isSearchMode
                        ? '다른 검색어로 시도해보세요'
                        : '나중에 다시 확인해주세요'}
                    </p>
                  </div>
                </div>
              )}

              {/* 공고 카드 그리드 */}
              {displayNotices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {displayNotices.map(notice => (
                    <NoticeCard
                      key={notice.id}
                      notice={notice}
                      variant="default"
                    />
                  ))}
                </div>
              )}

              {/* 페이지네이션 (검색 모드가 아니고 공고가 있을 때만 표시) */}
              {!isSearchMode && displayNotices.length > 0 && pagination && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                    size="medium"
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* 푸터 */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">
                이 페이지는 JB SQUARE 프론트엔드 개발을 위한 샘플 페이지입니다.
              </p>
              <p>
                <span className="font-semibold">사용된 기술:</span>
                {' '}API Gateway, Custom Hooks (useNotices, useNoticeSearch),
                Component Library (NoticeCard, SearchBar, FilterBar, Pagination)
              </p>
              <div className="mt-4 flex items-center justify-center gap-6">
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Swagger API 문서
                </a>
                <a
                  href="http://localhost:8000/redoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  ReDoc API 문서
                </a>
                <a
                  href="/docs/API_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  개발자 가이드
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
