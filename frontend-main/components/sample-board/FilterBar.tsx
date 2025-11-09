/**
 * 🎯 필터바 컴포넌트
 *
 * 공고 목록을 상태, 정렬 기준으로 필터링하는 컴포넌트입니다.
 * useNotices 훅의 setFilters와 함께 사용합니다.
 *
 * Note: Category filtering removed - use source_id based filtering at page level instead.
 *
 * 사용 예시:
 * ```typescript
 * import { FilterBar } from '@/components/sample-board/FilterBar';
 * import { useNotices } from '@/hooks/useNotices';
 *
 * function NoticeList() {
 *   const { notices, filters, setFilters } = useNotices();
 *
 *   return (
 *     <div>
 *       <FilterBar
 *         filters={filters}
 *         onFilterChange={setFilters}
 *       />
 *       {notices.map(notice => <NoticeCard key={notice.id} notice={notice} />)}
 *     </div>
 *   );
 * }
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import { NoticeFilterParams } from '@/lib/api/types';

/**
 * FilterBar 컴포넌트 Props 인터페이스
 */
interface FilterBarProps {
  /** 현재 적용된 필터 */
  filters: NoticeFilterParams;

  /** 필터 변경 핸들러 */
  onFilterChange: (filters: Partial<NoticeFilterParams>) => void;

  /** 레이아웃 방향 (기본값: 'horizontal') */
  layout?: 'horizontal' | 'vertical';

  /** 초기화 버튼 표시 여부 (기본값: true) */
  showResetButton?: boolean;

  /** 커스텀 CSS 클래스 */
  className?: string;
}

// TODO: Category filtering removed - source_id based filtering should be done at page level, not in FilterBar

/**
 * 상태 옵션 정의
 */
const STATUS_OPTIONS: Array<{
  value: NoticeFilterParams['status'];
  label: string;
}> = [
  { value: undefined, label: '전체' },
  { value: 'published', label: '게시됨' },
  { value: 'pending', label: '대기중' },
  { value: 'archived', label: '보관됨' }
];

/**
 * 정렬 기준 옵션
 */
const SORT_BY_OPTIONS: Array<{
  value: NoticeFilterParams['sort_by'];
  label: string;
}> = [
  { value: 'published_at', label: '게시일' },
  { value: 'deadline', label: '마감일' },
  { value: 'created_at', label: '등록일' }
];

/**
 * 정렬 순서 옵션
 */
const SORT_ORDER_OPTIONS: Array<{
  value: NoticeFilterParams['sort_order'];
  label: string;
  icon: string;
}> = [
  { value: 'desc', label: '내림차순', icon: '↓' },
  { value: 'asc', label: '오름차순', icon: '↑' }
];

/**
 * 필터바 컴포넌트
 *
 * @param props - FilterBarProps
 * @returns 필터바 JSX
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  layout = 'horizontal',
  showResetButton = true,
  className = ''
}) => {
  /**
   * 상태 변경 핸들러
   */
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value || undefined;
    onFilterChange({ status: status as NoticeFilterParams['status'], page: 1 });
  };

  /**
   * 정렬 기준 변경 핸들러
   */
  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort_by = e.target.value || 'published_at';
    onFilterChange({ sort_by: sort_by as NoticeFilterParams['sort_by'], page: 1 });
  };

  /**
   * 정렬 순서 변경 핸들러
   */
  const handleSortOrderChange = (sort_order: NoticeFilterParams['sort_order']) => {
    onFilterChange({ sort_order, page: 1 });
  };

  /**
   * 필터 초기화 핸들러
   */
  const handleReset = () => {
    onFilterChange({
      status: undefined,
      sort_by: 'published_at',
      sort_order: 'desc',
      page: 1
    });
  };

  /**
   * 활성화된 필터 개수 계산
   */
  const activeFilterCount = [
    filters.status,
    filters.sort_by !== 'published_at',
    filters.sort_order !== 'desc'
  ].filter(Boolean).length;

  /**
   * 수평 레이아웃 렌더링
   */
  if (layout === 'horizontal') {
    return (
      <div className={`bg-white border rounded-lg p-4 ${className}`}>
        {/* 필터 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            필터
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {activeFilterCount}개 적용
              </span>
            )}
          </h3>

          {/* 초기화 버튼 */}
          {showResetButton && activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              초기화
            </button>
          )}
        </div>

        {/* 필터 컨트롤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 상태 필터 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              상태
            </label>
            <select
              value={filters.status || ''}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.label} value={option.value || ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 정렬 기준 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              정렬 기준
            </label>
            <select
              value={filters.sort_by || 'published_at'}
              onChange={handleSortByChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_BY_OPTIONS.map(option => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 정렬 순서 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              정렬 순서
            </label>
            <div className="flex gap-2">
              {SORT_ORDER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleSortOrderChange(option.value)}
                  className={`
                    flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      filters.sort_order === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * 수직 레이아웃 렌더링
   */
  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      {/* 필터 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          필터
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>

        {/* 초기화 버튼 */}
        {showResetButton && activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            초기화
          </button>
        )}
      </div>

      {/* 필터 컨트롤 (세로 정렬) */}
      <div className="space-y-4">
        {/* 상태 필터 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            상태
          </label>
          <select
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.label} value={option.value || ''}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 정렬 기준 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            정렬 기준
          </label>
          <select
            value={filters.sort_by || 'published_at'}
            onChange={handleSortByChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_BY_OPTIONS.map(option => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 정렬 순서 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            정렬 순서
          </label>
          <div className="space-y-2">
            {SORT_ORDER_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleSortOrderChange(option.value)}
                className={`
                  w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left
                  ${
                    filters.sort_order === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
