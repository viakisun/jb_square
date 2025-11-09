/**
 * 🔄 로딩 스피너 컴포넌트
 *
 * 데이터 로딩 중 표시되는 재사용 가능한 스피너 컴포넌트입니다.
 * 다양한 크기와 스타일을 지원합니다.
 *
 * **사용 예시:**
 * ```tsx
 * import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
 *
 * // 기본 사용
 * <LoadingSpinner />
 *
 * // 큰 크기
 * <LoadingSpinner size="lg" />
 *
 * // 커스텀 메시지
 * <LoadingSpinner message="데이터를 불러오는 중..." />
 *
 * // 풀스크린 오버레이
 * <LoadingSpinner fullscreen />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';

/**
 * LoadingSpinner Props 인터페이스
 */
export interface LoadingSpinnerProps {
  /** 스피너 크기 */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** 표시할 메시지 (선택적) */
  message?: string;

  /** 풀스크린 오버레이로 표시 여부 */
  fullscreen?: boolean;

  /** 스피너 색상 (Tailwind CSS 클래스) */
  color?: string;
}

/**
 * 크기별 스피너 클래스 매핑
 */
const SIZE_CLASSES = {
  sm: 'w-6 h-6',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
} as const;

/**
 * LoadingSpinner 컴포넌트
 *
 * @param props - 컴포넌트 props
 * @returns React 컴포넌트
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  fullscreen = false,
  color = 'border-cyan-600',
}) => {
  const sizeClass = SIZE_CLASSES[size];

  const spinner = (
    <div
      className={`inline-block animate-spin rounded-full border-b-2 ${sizeClass} ${color}`}
      role="status"
      aria-label="로딩 중"
    />
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          {spinner}
          {message && (
            <p className="mt-4 text-gray-600 text-lg font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {spinner}
      {message && (
        <p className="mt-4 text-gray-600 text-base">{message}</p>
      )}
    </div>
  );
};

/**
 * LoadingSkeletons - 스켈레톤 UI 컴포넌트
 *
 * 콘텐츠가 로딩되는 동안 표시되는 플레이스홀더입니다.
 *
 * **사용 예시:**
 * ```tsx
 * import { LoadingSkeletons } from '@/components/ui/LoadingSpinner';
 *
 * <LoadingSkeletons count={6} type="card" />
 * ```
 */
export interface LoadingSkeletonsProps {
  /** 스켈레톤 개수 */
  count?: number;

  /** 스켈레톤 타입 */
  type?: 'card' | 'list' | 'table';
}

export const LoadingSkeletons: React.FC<LoadingSkeletonsProps> = ({
  count = 3,
  type = 'card',
}) => {
  if (type === 'card') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4">
            <div className="bg-gray-200 h-16 w-16 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="bg-gray-200 h-12 flex-1 rounded"></div>
            <div className="bg-gray-200 h-12 w-32 rounded"></div>
            <div className="bg-gray-200 h-12 w-32 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;
