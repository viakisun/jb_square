/**
 * 🔍 검색바 컴포넌트
 *
 * 디바운싱이 적용된 실시간 검색 입력 컴포넌트입니다.
 * useNoticeSearch 훅과 함께 사용하여 사용자 친화적인 검색 경험을 제공합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { SearchBar } from '@/components/sample-board/SearchBar';
 * import { useNoticeSearch } from '@/hooks/useNoticeSearch';
 *
 * function SearchPage() {
 *   const { searchQuery, setSearchQuery, results, loading } = useNoticeSearch();
 *
 *   return (
 *     <div>
 *       <SearchBar
 *         value={searchQuery}
 *         onChange={setSearchQuery}
 *         loading={loading}
 *         placeholder="공고를 검색하세요"
 *       />
 *       {results.map(notice => <NoticeCard key={notice.id} notice={notice} />)}
 *     </div>
 *   );
 * }
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';

/**
 * SearchBar 컴포넌트 Props 인터페이스
 */
interface SearchBarProps {
  /** 현재 검색어 */
  value: string;

  /** 검색어 변경 핸들러 */
  onChange: (value: string) => void;

  /** 로딩 상태 (검색 중 표시) */
  loading?: boolean;

  /** 입력 필드 플레이스홀더 */
  placeholder?: string;

  /** 검색 버튼 표시 여부 (기본값: false) */
  showSearchButton?: boolean;

  /** 검색 버튼 클릭 핸들러 (showSearchButton이 true일 때만 사용) */
  onSearch?: () => void;

  /** 초기화 버튼 표시 여부 (기본값: true) */
  showClearButton?: boolean;

  /** 입력 필드 크기 (기본값: 'medium') */
  size?: 'small' | 'medium' | 'large';

  /** 커스텀 CSS 클래스 */
  className?: string;

  /** 자동 포커스 여부 (기본값: false) */
  autoFocus?: boolean;

  /** 테마 (기본값: 'light') */
  theme?: 'light' | 'dark';
}

/**
 * 검색바 컴포넌트
 *
 * @param props - SearchBarProps
 * @returns 검색바 JSX
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  loading = false,
  placeholder = '검색어를 입력하세요',
  showSearchButton = false,
  onSearch,
  showClearButton = true,
  size = 'medium',
  className = '',
  autoFocus = false,
  theme = 'light'
}) => {
  /**
   * 입력 필드 변경 핸들러
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  /**
   * 초기화 버튼 클릭 핸들러
   */
  const handleClear = () => {
    onChange('');
  };

  /**
   * 검색 버튼 클릭 핸들러
   */
  const handleSearchClick = () => {
    if (onSearch) {
      onSearch();
    }
  };

  /**
   * Enter 키 입력 핸들러
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  /**
   * 크기별 스타일 맵핑
   */
  const sizeStyles = {
    small: 'h-8 text-sm',
    medium: 'h-10 text-base',
    large: 'h-12 text-lg'
  };

  /**
   * 크기별 아이콘 크기
   */
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex items-center gap-2">
        {/* 검색 입력 필드 */}
        <div className="relative flex-1">
          {/* 검색 아이콘 */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              className={iconSizes[size]}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* 입력 필드 */}
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`
              w-full pl-10 pr-10 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${sizeStyles[size]}
              ${loading ? 'bg-gray-50' : 'bg-white'}
            `}
          />

          {/* 로딩 스피너 또는 초기화 버튼 */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              /* 로딩 스피너 */
              <svg
                className={`animate-spin text-blue-500 ${iconSizes[size]}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              /* 초기화 버튼 */
              showClearButton && value && (
                <button
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="검색어 초기화"
                >
                  <svg
                    className={iconSizes[size]}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )
            )}
          </div>
        </div>

        {/* 검색 버튼 (선택적) */}
        {showSearchButton && (
          <button
            onClick={handleSearchClick}
            disabled={loading || !value.trim()}
            className={`
              px-6 bg-blue-600 text-white rounded-lg
              hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors font-semibold
              ${sizeStyles[size]}
            `}
          >
            검색
          </button>
        )}
      </div>

      {/* 검색 가이드 텍스트 */}
      {!loading && !value && (
        <p className={`mt-2 text-xs ${
          theme === 'dark'
            ? 'text-white/90 drop-shadow-lg'
            : 'text-gray-500'
        }`}>
          💡 공고 제목, 내용, 기관명으로 검색할 수 있습니다
        </p>
      )}

      {/* 검색 중 안내 텍스트 */}
      {loading && (
        <p className={`mt-2 text-xs ${
          theme === 'dark'
            ? 'text-white/90 drop-shadow-lg'
            : 'text-blue-600'
        }`}>
          🔍 검색 중입니다...
        </p>
      )}
    </div>
  );
};

export default SearchBar;
