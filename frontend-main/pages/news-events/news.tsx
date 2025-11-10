/**
 * 📰 최신 뉴스 페이지
 *
 * 전북 바이오 산업 관련 최신 뉴스 목록 (RSS 뉴스)
 * - 식약처 뉴스 (source:news:mfds)
 * - 보건복지부 뉴스 (source:news:mohw)
 * - 뉴스 검색 및 필터링
 *
 * **주요 기능:**
 * - RSS 뉴스 목록 조회
 * - 소스별 필터링 (식약처/복지부)
 * - 검색 기능 (제목, 내용, 기관명)
 * - 페이지네이션 지원
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useState, useMemo } from "react";
import { useNotices } from "@/hooks/useNotices";
import { useNoticeSearch } from "@/hooks/useNoticeSearch";
import { NoticeCard } from "@/components/notices/NoticeCard";
import { SearchBar } from "@/components/sample-board/SearchBar";
import { Pagination } from "@/components/sample-board/Pagination";
import { NoticePageLayout } from "@/components/layout/NoticePageLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * 뉴스 소스 정보
 */
const NEWS_SOURCES = {
  "source:news:mfds": {
    name: "식약처",
    fullName: "식품의약품안전처",
    color: "bg-blue-100 text-blue-800",
    description: "의약품 승인, 안전 규제, 식품 위생 관련 공지사항",
  },
  "source:news:mohw": {
    name: "복지부",
    fullName: "보건복지부",
    color: "bg-green-100 text-green-800",
    description: "보건의료 정책, R&D 지원, 바이오 산업 보도자료",
  },
} as const;

/**
 * NewsPage 컴포넌트
 *
 * RSS 뉴스(식약처, 보건복지부)를 카드 형식으로 표시합니다.
 * 사업공고 및 행사 페이지와 동일한 레이아웃 패턴을 사용하여 일관성을 유지합니다.
 */
const NewsPage: React.FC = () => {
  // 소스 필터 상태 관리 (전체 | 식약처 | 복지부)
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  // 검색 모드 상태 관리
  const [isSearchMode, setIsSearchMode] = useState(false);

  // RSS 뉴스 목록 조회 (source:news:*)
  const { notices, loading, error, pagination, setPage, fetchNotices } =
    useNotices({
      status: "published",
      limit: 20,
      sort_by: "published_at",
      sort_order: "desc",
    });

  // 검색 기능
  const {
    searchQuery,
    setSearchQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
  } = useNoticeSearch({
    additionalFilters: {},
  });

  /**
   * RSS 뉴스만 필터링 (source:news:*)
   * 그리고 선택된 소스로 추가 필터링
   */
  const filteredNotices = useMemo(() => {
    const baseNotices = isSearchMode ? searchResults : notices;

    // 1단계: RSS 뉴스만 필터링
    let filtered = baseNotices.filter((notice) =>
      notice.crawler_source_id?.startsWith("source:news:"),
    );

    // 2단계: 선택된 소스로 필터링
    if (selectedSource) {
      filtered = filtered.filter(
        (notice) => notice.crawler_source_id === selectedSource,
      );
    }

    return filtered;
  }, [notices, searchResults, isSearchMode, selectedSource]);

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
    setSearchQuery("");
    setIsSearchMode(false);
    setSelectedSource(null);
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

  // 현재 로딩/에러 상태 결정
  const currentLoading = isSearchMode ? searchLoading : loading;
  const currentError = isSearchMode ? searchError : error;

  return (
    <NoticePageLayout
      pageTitle="최신 뉴스"
      pageSubtitle="전북 바이오 산업의 최신 소식을 확인하세요"
      breadcrumbCurrent="최신뉴스"
      categoryLabel="뉴스/행사"
      breadcrumbParent="뉴스/행사"
      breadcrumbParentHref="/news-events"
    >
      {/* 검색 바 */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="뉴스 제목, 내용, 기관명 등으로 검색하세요"
        />
      </div>

      {/* 소스 필터 버튼 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setSelectedSource(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedSource === null
              ? "bg-primary-blue text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          전체
        </button>
        {Object.entries(NEWS_SOURCES).map(([sourceId, source]) => (
          <button
            key={sourceId}
            onClick={() => setSelectedSource(sourceId)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSource === sourceId
                ? "bg-primary-blue text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {source.name}
          </button>
        ))}
      </div>

      {/* 검색 모드 표시 */}
      {isSearchMode && searchQuery.trim().length >= 2 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-blue-700">
              <strong>&quot;{searchQuery}&quot;</strong> 검색 결과{" "}
              {!searchLoading && (
                <span className="text-blue-600">
                  ({filteredNotices.length}건)
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
          message={isSearchMode ? "검색 중..." : "뉴스를 불러오는 중..."}
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
      {!currentLoading && !currentError && filteredNotices.length === 0 && (
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
              icon="document"
              title="등록된 뉴스가 없습니다"
              message={
                selectedSource
                  ? `${NEWS_SOURCES[selectedSource as keyof typeof NEWS_SOURCES].fullName}의 뉴스가 아직 없습니다.`
                  : "현재 등록된 RSS 뉴스가 없습니다."
              }
              description="새로운 뉴스가 등록되면 이곳에 표시됩니다."
            />
          )}
        </>
      )}

      {/* 뉴스 목록 (카드 레이아웃) */}
      {!currentLoading && !currentError && filteredNotices.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 mb-8">
            {filteredNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>

          {/* 페이지네이션 (검색 모드에서는 숨김) */}
          {!isSearchMode && pagination && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}

          {/* 검색 결과 요약 (검색 모드) */}
          {isSearchMode && (
            <div className="mt-8 text-center text-gray-600">
              <p>
                전체 <strong>{filteredNotices.length}건</strong>의 검색 결과
              </p>
            </div>
          )}
        </>
      )}
    </NoticePageLayout>
  );
};

export default NewsPage;
