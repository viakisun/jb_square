/**
 * ⚠️ 에러 메시지 컴포넌트
 *
 * API 에러, 유효성 검사 실패 등의 에러 상황을 사용자에게 표시하는 재사용 가능한 컴포넌트입니다.
 * 다양한 스타일과 액션 버튼을 지원합니다.
 *
 * **사용 예시:**
 * ```tsx
 * import { ErrorMessage } from '@/components/ui/ErrorMessage';
 *
 * // 기본 사용
 * <ErrorMessage message="데이터를 불러오는 데 실패했습니다." />
 *
 * // 재시도 버튼 포함
 * <ErrorMessage
 *   message="서버 오류가 발생했습니다."
 *   onRetry={() => fetchData()}
 * />
 *
 * // 풀스크린 에러
 * <ErrorMessage message="치명적인 오류" fullscreen />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';

/**
 * ErrorMessage Props 인터페이스
 */
export interface ErrorMessageProps {
  /** 에러 메시지 */
  message: string;

  /** 에러 제목 (선택적) */
  title?: string;

  /** 재시도 콜백 함수 (제공 시 재시도 버튼 표시) */
  onRetry?: () => void;

  /** 재시도 버튼 레이블 */
  retryLabel?: string;

  /** 에러 타입 (스타일 결정) */
  variant?: 'error' | 'warning' | 'info';

  /** 풀스크린 오버레이로 표시 여부 */
  fullscreen?: boolean;

  /** 아이콘 표시 여부 */
  showIcon?: boolean;
}

/**
 * 에러 타입별 스타일 매핑
 */
const VARIANT_STYLES = {
  error: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    icon: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
    button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    icon: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
} as const;

/**
 * ErrorMessage 컴포넌트
 *
 * @param props - 컴포넌트 props
 * @returns React 컴포넌트
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = '오류',
  onRetry,
  retryLabel = '다시 시도',
  variant = 'error',
  fullscreen = false,
  showIcon = true,
}) => {
  const styles = VARIANT_STYLES[variant];

  const errorContent = (
    <div className="text-center">
      {showIcon && (
        <div className={`inline-flex items-center justify-center w-16 h-16 ${styles.bg} rounded-full mb-4`}>
          <svg
            className={`w-8 h-8 ${styles.icon}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {variant === 'error' && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
            {variant === 'warning' && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            )}
            {variant === 'info' && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
          </svg>
        </div>
      )}

      <h3 className={`text-lg font-semibold mb-2 ${styles.text}`}>{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${styles.button}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {retryLabel}
        </button>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        <div className="max-w-md mx-4">{errorContent}</div>
      </div>
    );
  }

  return (
    <div className="py-12">
      {errorContent}
    </div>
  );
};

/**
 * InlineErrorMessage - 인라인 에러 메시지 컴포넌트
 *
 * 폼 필드나 작은 영역에 표시되는 간결한 에러 메시지입니다.
 *
 * **사용 예시:**
 * ```tsx
 * import { InlineErrorMessage } from '@/components/ui/ErrorMessage';
 *
 * <InlineErrorMessage message="이메일 형식이 올바르지 않습니다." />
 * ```
 */
export interface InlineErrorMessageProps {
  /** 에러 메시지 */
  message: string;

  /** 여백 크기 */
  spacing?: 'sm' | 'md' | 'lg';
}

export const InlineErrorMessage: React.FC<InlineErrorMessageProps> = ({
  message,
  spacing = 'md',
}) => {
  const spacingClasses = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-3 text-base',
    lg: 'py-3 px-4 text-lg',
  };

  return (
    <div
      className={`flex items-center gap-2 ${spacingClasses[spacing]} bg-red-50 border border-red-200 rounded-lg text-red-700`}
      role="alert"
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
