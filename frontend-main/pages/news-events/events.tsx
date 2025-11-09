/**
 * 🎉 바이오행사 일정 페이지
 *
 * 전북테크노파크 바이오행사 정보를 표시합니다.
 * 사업공고 페이지와 동일한 UI 패턴을 사용합니다.
 *
 * **주요 기능:**
 * - 바이오행사 목록 조회 (source:jbtp:events)
 * - 검색 기능 (제목, 내용, 주최기관)
 * - 페이지네이션 지원
 * - 카드 레이아웃으로 일관성 있는 UI
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useState } from 'react';
import { useNotices } from '@/hooks/useNotices';
import { useNoticeSearch } from '@/hooks/useNoticeSearch';
import { NoticeCard } from '@/components/notices/NoticeCard';
import { SearchBar } from '@/components/sample-board/SearchBar';
import { Pagination } from '@/components/sample-board/Pagination';
import { NoticePageLayout } from '@/components/layout/NoticePageLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

/**
 * EventsPage 컴포넌트
 *
 * 전북테크노파크 교육/행사 일정을 카드 형식으로 표시합니다.
 * 사업공고 페이지와 동일한 레이아웃 패턴을 사용하여 일관성을 유지합니다.
 */
const EventsPage: React.FC = () => {
  // 검색 모드 상태 관리
  const [isSearchMode, setIsSearchMode] = useState(false);

  // 공고 목록 조회 (source:jbtp:events)
  const {
    notices,
    loading,
    error,
    pagination,
    setPage,
    fetchNotices
  } = useNotices({
    source_id: 'source:jbtp:events',
    limit: 20,
    sort_order: 'desc'
  });

  // 검색 기능
  const {
    searchQuery,
    setSearchQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError
  } = useNoticeSearch({
    additionalFilters: {
      source_id: 'source:jbtp:events'
    }
  });

  /**
   * 검색어 변경 핸들러
   *
   * 검색어가 입력되면 검색 모드로 전환하고,
   * 검색어가 비워지면 일반 모드로 복귀합니다.
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (query.trim().length >= 2) {
      setIsSearchMode(true);
    } else if (query.trim().length === 0) {
      setIsSearchMode(false);
    }
  };

  /**
   * 검색 초기화 핸들러
   *
   * 검색어를 비우고 일반 모드로 복귀합니다.
   */
  const handleSearchReset = () => {
    setSearchQuery('');
    setIsSearchMode(false);
  };

  /**
   * 재시도 핸들러
   *
   * 에러 발생 시 데이터를 다시 불러옵니다.
   */
  const handleRetry = () => {
    if (isSearchMode) {
      setSearchQuery(searchQuery); // 검색 재실행
    } else {
      fetchNotices();
    }
  };

  // 현재 표시할 데이터 결정
  const currentNotices = isSearchMode ? searchResults : notices;
  const currentLoading = isSearchMode ? searchLoading : loading;
  const currentError = isSearchMode ? searchError : error;

  return (
    <NoticePageLayout
      categoryLabel="뉴스/행사"
      title="행사일정"
      subtitle="전북테크노파크 교육 및 행사 정보"
    >
      {/* 검색 바 */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleSearchReset}
          placeholder="행사명, 주최기관 등으로 검색하세요"
        />
      </div>

      {/* 검색 모드 표시 */}
      {isSearchMode && searchQuery.trim().length >= 2 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-blue-700">
              <strong>&quot;{searchQuery}&quot;</strong> 검색 결과{' '}
              {!searchLoading && (
                <span className="text-blue-600">
                  ({searchResults.length}건)
                </span>
              )}
            </p>
            <button
              onClick={handleSearchReset}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              검색 초기화
            </button>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {currentLoading && (
        <LoadingSpinner
          size="lg"
          message={isSearchMode ? '검색 중...' : '행사 정보를 불러오는 중...'}
        />
      )}

      {/* 에러 상태 */}
      {!currentLoading && currentError && (
        <ErrorMessage
          title="데이터 로딩 실패"
          message={currentError}
          onRetry={handleRetry}
          retryLabel="다시 시도"
        />
      )}

      {/* 데이터 없음 상태 */}
      {!currentLoading && !currentError && currentNotices.length === 0 && (
        <>
          {isSearchMode ? (
            <EmptyState
              icon="search"
              title="검색 결과 없음"
              message={`"${searchQuery}"에 대한 검색 결과가 없습니다.`}
              description="다른 키워드로 검색해보시거나, 철자가 정확한지 확인해주세요."
              actionLabel="검색 초기화"
              onAction={handleSearchReset}
            />
          ) : (
            <EmptyState
              icon="calendar"
              title="등록된 행사가 없습니다"
              message="현재 등록된 교육 및 행사 정보가 없습니다."
              description="새로운 행사 정보가 등록되면 이곳에 표시됩니다."
            />
          )}
        </>
      )}

      {/* 행사 목록 (카드 레이아웃) */}
      {!currentLoading && !currentError && currentNotices.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 mb-8">
            {currentNotices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
              />
            ))}
          </div>

          {/* 페이지네이션 (검색 모드에서는 숨김) */}
          {!isSearchMode && pagination && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.total_pages}
                onPageChange={setPage}
                hasNext={pagination.has_next}
                hasPrev={pagination.has_prev}
              />
            </div>
          )}

          {/* 검색 결과 요약 (검색 모드) */}
          {isSearchMode && (
            <div className="mt-8 text-center text-gray-600">
              <p>
                전체 <strong>{searchResults.length}건</strong>의 검색 결과
              </p>
            </div>
          )}
        </>
      )}
    </NoticePageLayout>
  );
};

export default EventsPage;
