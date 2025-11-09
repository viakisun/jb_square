/**
 * 📋 지자체 사업 공고 전체 목록 페이지
 *
 * 지방자치단체에서 발표하는 지역 맞춤형 지원 사업 공고를 전체 목록으로 보여주는 페이지입니다.
 * source_id='source:jbtp:local' 필터가 자동으로 적용됩니다.
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

export default function LocalGovernmentNoticesPage() {
  const [isSearchMode, setIsSearchMode] = useState(false);

  const {
    notices,
    loading: listLoading,
    error: listError,
    pagination,
    setPage,
    fetchNotices
  } = useNotices({
    source_id: 'source:jbtp:local',  // 지자체 공고만 필터링
    limit: 20,
    sort_order: 'desc'
  });

  const {
    searchQuery,
    setSearchQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    totalResults,
    hasSearched
  } = useNoticeSearch({
    additionalFilters: {
      source_id: 'source:jbtp:local'  // 지자체 공고 내에서만 검색
    },
    debounceDelay: 500,
    minLength: 2
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(query.trim().length >= 2);
  };

  const displayNotices = isSearchMode ? searchResults : notices;
  const displayLoading = isSearchMode ? searchLoading : listLoading;
  const displayError = isSearchMode ? searchError : listError;

  return (
    <>
      <Head>
        <title>지자체 사업 공고 - JB SQUARE</title>
        <meta name="description" content="지방자치단체의 지역 맞춤형 지원 사업" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/sample-board"
                  className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
                >
                  ← 공고 게시판으로 돌아가기
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  지자체 사업 공고
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  지방자치단체의 지역 맞춤형 지원 사업
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              loading={searchLoading}
              placeholder="지자체 사업 공고 검색..."
              size="large"
            />
          </div>

          {isSearchMode && hasSearched && !searchLoading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">"{searchQuery}"</span> 검색 결과:
                <span className="ml-2 font-semibold">{totalResults}개</span> 공고
              </p>
            </div>
          )}

          {displayLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">공고를 불러오는 중...</p>
              </div>
            </div>
          )}

          {!displayLoading && displayError && (
            <div className="py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h3>
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

          {!displayLoading && !displayError && (
            <>
              {displayNotices.length === 0 && (
                <div className="py-20 text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {isSearchMode ? '검색 결과가 없습니다' : '등록된 지자체 공고가 없습니다'}
                  </h3>
                  <p className="text-gray-500">
                    {isSearchMode ? '다른 검색어로 시도해보세요' : '나중에 다시 확인해주세요'}
                  </p>
                </div>
              )}

              {displayNotices.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {displayNotices.map(notice => (
                      <NoticeCard key={notice.id} notice={notice} variant="default" />
                    ))}
                  </div>

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
