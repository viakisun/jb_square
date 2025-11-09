/**
 * 🔍 BI Center 필터 바 컴포넌트
 *
 * 창업보육센터 목록을 필터링하고 정렬하는 컨트롤을 제공합니다.
 *
 * **주요 기능:**
 * - 지역 선택 필터
 * - 검색어 입력
 * - 정렬 옵션 (이름순, 최신순, 입주기업 많은 순)
 * - 모바일 반응형 레이아웃 (세로 스택 → 가로 배치)
 *
 * **사용 예시:**
 * ```tsx
 * import { BICenterFilterBar } from '@/components/bi-centers/BICenterFilterBar';
 *
 * <BICenterFilterBar
 *   region={region}
 *   searchQuery={searchQuery}
 *   sortBy={sortBy}
 *   onRegionChange={setRegion}
 *   onSearchChange={setSearchQuery}
 *   onSortChange={setSortBy}
 * />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';

/**
 * 정렬 옵션 타입
 */
export type SortOption = 'name' | 'latest' | 'companies';

/**
 * 컴포넌트 Props 인터페이스
 */
interface BICenterFilterBarProps {
  /** 선택된 지역 */
  region: string;
  /** 검색어 */
  searchQuery: string;
  /** 정렬 기준 */
  sortBy: SortOption;
  /** 지역 변경 핸들러 */
  onRegionChange: (region: string) => void;
  /** 검색어 변경 핸들러 */
  onSearchChange: (query: string) => void;
  /** 정렬 변경 핸들러 */
  onSortChange: (sortBy: SortOption) => void;
}

/**
 * 지역 옵션 목록
 */
const REGIONS = [
  { value: 'all', label: '전체 지역' },
  { value: '전주시', label: '전주시' },
  { value: '익산시', label: '익산시' },
  { value: '군산시', label: '군산시' },
  { value: '정읍시', label: '정읍시' },
  { value: '남원시', label: '남원시' },
  { value: '김제시', label: '김제시' },
  { value: '완주군', label: '완주군' },
  { value: '기타', label: '기타' },
];

/**
 * 정렬 옵션 목록
 */
const SORT_OPTIONS = [
  { value: 'name' as SortOption, label: '이름순' },
  { value: 'latest' as SortOption, label: '최신순' },
  { value: 'companies' as SortOption, label: '입주기업 많은 순' },
];

/**
 * BI Center 필터 바 컴포넌트
 *
 * @param props - BICenterFilterBarProps
 * @returns 필터 바 JSX
 */
export const BICenterFilterBar: React.FC<BICenterFilterBarProps> = ({
  region,
  searchQuery,
  sortBy,
  onRegionChange,
  onSearchChange,
  onSortChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* 지역 선택 */}
        <div className="flex-1">
          <label htmlFor="region-select" className="block text-sm font-medium text-gray-700 mb-2">
            지역
          </label>
          <select
            id="region-select"
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
          >
            {REGIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 검색어 입력 */}
        <div className="flex-1">
          <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
            검색
          </label>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="센터명, 주소 검색..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* 정렬 선택 */}
        <div className="flex-1">
          <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
            정렬
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default BICenterFilterBar;
