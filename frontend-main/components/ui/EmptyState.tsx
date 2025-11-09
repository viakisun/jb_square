/**
 * 📭 빈 상태 컴포넌트
 *
 * 데이터가 없을 때 표시되는 재사용 가능한 빈 상태 컴포넌트입니다.
 * 다양한 아이콘과 액션 버튼을 지원합니다.
 *
 * **사용 예시:**
 * ```tsx
 * import { EmptyState } from '@/components/ui/EmptyState';
 *
 * // 기본 사용
 * <EmptyState message="등록된 공고가 없습니다." />
 *
 * // 커스텀 아이콘과 액션
 * <EmptyState
 *   icon="search"
 *   title="검색 결과 없음"
 *   message="다른 키워드로 검색해보세요."
 *   actionLabel="검색 초기화"
 *   onAction={() => resetSearch()}
 * />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';

/**
 * EmptyState Props 인터페이스
 */
export interface EmptyStateProps {
  /** 메인 메시지 */
  message: string;

  /** 제목 (선택적) */
  title?: string;

  /** 부가 설명 (선택적) */
  description?: string;

  /** 아이콘 타입 */
  icon?: 'document' | 'search' | 'inbox' | 'calendar' | 'folder' | 'database';

  /** 액션 버튼 레이블 (제공 시 버튼 표시) */
  actionLabel?: string;

  /** 액션 버튼 클릭 핸들러 */
  onAction?: () => void;

  /** 컴포넌트 크기 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 아이콘 SVG 컴포넌트 매핑
 */
const ICON_PATHS: Record<NonNullable<EmptyStateProps['icon']>, JSX.Element> = {
  document: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  ),
  search: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  ),
  inbox: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  ),
  calendar: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  ),
  folder: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  ),
  database: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
    />
  ),
};

/**
 * 크기별 스타일 매핑
 */
const SIZE_STYLES = {
  sm: {
    iconSize: 'w-12 h-12',
    iconBg: 'w-16 h-16',
    titleSize: 'text-base',
    messageSize: 'text-sm',
    padding: 'py-8',
  },
  md: {
    iconSize: 'w-16 h-16',
    iconBg: 'w-20 h-20',
    titleSize: 'text-lg',
    messageSize: 'text-base',
    padding: 'py-12',
  },
  lg: {
    iconSize: 'w-20 h-20',
    iconBg: 'w-24 h-24',
    titleSize: 'text-xl',
    messageSize: 'text-lg',
    padding: 'py-16',
  },
} as const;

/**
 * EmptyState 컴포넌트
 *
 * @param props - 컴포넌트 props
 * @returns React 컴포넌트
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  title,
  description,
  icon = 'document',
  actionLabel,
  onAction,
  size = 'md',
}) => {
  const styles = SIZE_STYLES[size];

  return (
    <div className={`text-center ${styles.padding}`}>
      {/* 아이콘 */}
      <div className="flex justify-center mb-4">
        <div className={`inline-flex items-center justify-center ${styles.iconBg} bg-gray-100 rounded-full`}>
          <svg
            className={`${styles.iconSize} text-gray-400`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {ICON_PATHS[icon]}
          </svg>
        </div>
      </div>

      {/* 제목 (선택적) */}
      {title && (
        <h3 className={`font-bold text-gray-900 mb-2 ${styles.titleSize}`}>
          {title}
        </h3>
      )}

      {/* 메인 메시지 */}
      <p className={`text-gray-600 mb-2 ${styles.messageSize}`}>
        {message}
      </p>

      {/* 부가 설명 (선택적) */}
      {description && (
        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {/* 액션 버튼 (선택적) */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary-blue hover:bg-primary-cyan text-white rounded-lg font-medium transition-colors duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/**
 * EmptySearchResults - 검색 결과 없음 컴포넌트
 *
 * 검색 결과가 없을 때 사용하는 특화된 컴포넌트입니다.
 *
 * **사용 예시:**
 * ```tsx
 * import { EmptySearchResults } from '@/components/ui/EmptyState';
 *
 * <EmptySearchResults
 *   searchQuery="바이오"
 *   onReset={() => setSearchQuery('')}
 * />
 * ```
 */
export interface EmptySearchResultsProps {
  /** 검색 쿼리 */
  searchQuery: string;

  /** 검색 초기화 핸들러 */
  onReset?: () => void;
}

export const EmptySearchResults: React.FC<EmptySearchResultsProps> = ({
  searchQuery,
  onReset,
}) => {
  return (
    <EmptyState
      icon="search"
      title="검색 결과 없음"
      message={`"${searchQuery}"에 대한 검색 결과가 없습니다.`}
      description="다른 키워드로 다시 검색해보시거나, 철자가 정확한지 확인해주세요."
      actionLabel={onReset ? '검색 초기화' : undefined}
      onAction={onReset}
    />
  );
};

/**
 * EmptyDataPlaceholder - 데이터 없음 플레이스홀더
 *
 * 리스트나 테이블에 데이터가 없을 때 사용하는 간결한 컴포넌트입니다.
 *
 * **사용 예시:**
 * ```tsx
 * import { EmptyDataPlaceholder } from '@/components/ui/EmptyState';
 *
 * {items.length === 0 && <EmptyDataPlaceholder message="등록된 항목이 없습니다." />}
 * ```
 */
export interface EmptyDataPlaceholderProps {
  /** 메시지 */
  message: string;

  /** 아이콘 타입 */
  icon?: EmptyStateProps['icon'];
}

export const EmptyDataPlaceholder: React.FC<EmptyDataPlaceholderProps> = ({
  message,
  icon = 'inbox',
}) => {
  return (
    <EmptyState
      icon={icon}
      message={message}
      size="sm"
    />
  );
};

export default EmptyState;
