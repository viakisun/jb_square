/**
 * 검색바 컴포넌트
 *
 * 디바운싱이 적용된 실시간 검색 입력 컴포넌트입니다.
 * useNoticeSearch 훅과 함께 사용하여 사용자 친화적인 검색 경험을 제공합니다.
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  showSearchButton?: boolean;
  onSearch?: () => void;
  showClearButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  autoFocus?: boolean;
  theme?: 'light' | 'dark';
}

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const sizeStyles = {
    small: 'h-8 text-sm',
    medium: 'h-10 text-base',
    large: 'h-12 text-base'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-5 h-5'
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex items-center gap-2">
        {/* 검색 입력 필드 */}
        <div className="relative flex-1">
          {/* 검색 아이콘 */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              className={iconSizes[size]}
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

          {/* 입력 필드 */}
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`
              w-full pl-12 pr-12 border border-gray-300
              focus:outline-none focus:border-gray-900 transition-colors
              ${sizeStyles[size]}
              ${loading ? 'bg-gray-50' : 'bg-white'}
            `}
          />

          {/* 로딩 스피너 또는 초기화 버튼 */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-gray-900 border-t-transparent"></div>
            ) : (
              showClearButton && value && (
                <button
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                  aria-label="검색어 초기화"
                >
                  <svg
                    className={iconSizes[size]}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
              px-6 bg-gray-900 text-white
              hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors font-medium
              ${sizeStyles[size]}
            `}
          >
            검색
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
