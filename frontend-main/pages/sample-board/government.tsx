/**
 * 📋 정부 공고 전체 목록 페이지
 *
 * 정부 부처에서 발표하는 각종 지원 사업 및 공고를 전체 목록으로 보여주는 페이지입니다.
 * category='government' 필터가 자동으로 적용됩니다.
 *
 * 초보자를 위한 설명:
 * - useNotices 훅을 사용하여 정부 공고만 필터링하여 가져옵니다
 * - 검색, 필터링, 페이지네이션 기능을 모두 제공합니다
 * - 메인 페이지의 "더보기" 버튼을 통해 이 페이지로 이동할 수 있습니다
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useNotices } from '@/hooks/useNotices';
import { useNoticeSearch } from '@/hooks/useNoticeSearch';
import { NoticeCard } from '@/components/sample-board/NoticeCard';
import { SearchBar } from '@/components/sample-board/SearchBar';
import { Pagination } from '@/components/sample-board/Pagination';

/**
 * 정부 공고 전체 목록 페이지 컴포넌트
 *
 * @returns 정부 공고 목록 페이지 JSX
 */
export default function GovernmentNoticesPage() {
  /**
   * 검색 모드 상태
   * false: 일반 목록 모드, true: 검색 모드
   */
  const [isSearchMode, setIsSearchMode] = useState(false);

  /**
   * useNotices 훅 - 정부 공고만 필터링
   * category: 'government'를 기본값으로 설정
   */
  const {
    notices,
    loading: listLoading,
    error: listError,
    pagination,
    setPage,
    fetchNotices
  } = useNotices({
    category: 'government',  // 정부 공고만 필터링
    limit: 20,
    sort_order: 'desc'
  });

  /**
   * useNoticeSearch 훅 - 검색 기능
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
    category: 'government',  // 정부 공고 내에서만 검색
    debounceDelay: 500,
    minLength: 2
  });

  /**
   * 검색어 변경 핸들러
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(query.trim().length >= 2);
  };

  /**
   * 현재 표시할 데이터와 상태 결정
   */
  const displayNotices = isSearchMode ? searchResults : notices;
  const displayLoading = isSearchMode ? searchLoading : listLoading;
  const displayError = isSearchMode ? searchError : listError;

  return (
    <>
      {/* 페이지 메타데이터 */}
      <Head>
        <title>정부 공고 - JB SQUARE</title>
        <meta name="description" content="정부 부처의 각종 지원 사업 및 공고" />
      </Head>

      {/* 메인 컨테이너 */}
      <div className="min-h-screen bg-gray-50">

        {/* 헤더 */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                {/* 뒤로가기 링크 */}
                <Link
                  href="/sample-board"
                  className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
                >
                  ← 공고 게시판으로 돌아가기
                </Link>

                <h1 className="text-3xl font-bold text-gray-900">
                  정부 공고
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  정부 부처에서 발표하는 각종 지원 사업 및 공고
                </p>
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
              placeholder="정부 공고 검색..."
              size="large"
            />
          </div>

          {/* 검색 결과 안내 */}
          {isSearchMode && hasSearched && !searchLoading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
              {displayNotices.length === 0 && (
                <div className="py-20 text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {isSearchMode ? '검색 결과가 없습니다' : '등록된 정부 공고가 없습니다'}
                  </h3>
                  <p className="text-gray-500">
                    {isSearchMode ? '다른 검색어로 시도해보세요' : '나중에 다시 확인해주세요'}
                  </p>
                </div>
              )}

              {/* 공고 카드 그리드 */}
              {displayNotices.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {displayNotices.map(notice => (
                      <NoticeCard
                        key={notice.id}
                        notice={notice}
                        variant="default"
                      />
                    ))}
                  </div>

                  {/* 페이지네이션 */}
                  {!isSearchMode && pagination && (
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={setPage}
                      size="medium"
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
