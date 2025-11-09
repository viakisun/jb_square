/**
 * 디버그 에러 메시지 컴포넌트
 *
 * 개발 및 디버깅 시 상세한 에러 정보를 표시합니다.
 * 모바일에서도 쉽게 확인할 수 있도록 접을 수 있는 형태로 제공합니다.
 */

import { useState } from 'react';

export interface ErrorDetails {
  /** 사용자에게 표시할 에러 메시지 */
  message: string;

  /** HTTP 상태 코드 */
  statusCode?: number;

  /** 백엔드 상세 에러 메시지 */
  detail?: string;

  /** 호출한 API URL */
  url?: string;

  /** 요청 파라미터 */
  params?: Record<string, any>;

  /** 에러 발생 시각 */
  timestamp?: string;

  /** 전체 에러 객체 (디버깅용) */
  raw?: any;
}

interface DebugErrorMessageProps {
  /** 에러 상세 정보 */
  error: ErrorDetails;

  /** 재시도 버튼 클릭 핸들러 */
  onRetry?: () => void;
}

/**
 * 상태 코드에 따른 색상 반환
 */
function getStatusCodeColor(statusCode?: number): string {
  if (!statusCode) return 'text-gray-600';
  if (statusCode >= 500) return 'text-red-600'; // 서버 에러
  if (statusCode >= 400) return 'text-orange-600'; // 클라이언트 에러
  if (statusCode >= 300) return 'text-blue-600'; // 리다이렉트
  if (statusCode >= 200) return 'text-green-600'; // 성공
  return 'text-gray-600';
}

/**
 * 디버그 에러 메시지 컴포넌트
 */
export default function DebugErrorMessage({ error, onRetry }: DebugErrorMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * 에러 정보를 클립보드에 복사
   */
  const copyToClipboard = async () => {
    const errorInfo = JSON.stringify({
      message: error.message,
      statusCode: error.statusCode,
      detail: error.detail,
      url: error.url,
      params: error.params,
      timestamp: error.timestamp,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
    }, null, 2);

    try {
      await navigator.clipboard.writeText(errorInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-red-200 p-6 space-y-4">
      {/* 에러 아이콘 */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      {/* 메인 에러 메시지 */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          오류가 발생했습니다
        </h3>
        <p className="text-gray-600 mb-4">{error.message}</p>

        {/* 상태 코드 표시 */}
        {error.statusCode && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
            <span className="text-sm text-gray-600">HTTP 상태:</span>
            <span className={`text-sm font-semibold ${getStatusCodeColor(error.statusCode)}`}>
              {error.statusCode}
            </span>
          </div>
        )}
      </div>

      {/* 상세 정보 토글 버튼 */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          {isExpanded ? '상세 정보 숨기기' : '상세 정보 보기'}
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 재시도 버튼 */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            다시 시도
          </button>
        )}
      </div>

      {/* 상세 정보 패널 */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          {/* 디버그 정보 */}
          <div className="space-y-3 text-sm">
            {/* API URL */}
            {error.url && (
              <div className="bg-gray-50 rounded p-3">
                <div className="font-semibold text-gray-700 mb-1">API Endpoint</div>
                <div className="text-gray-600 break-all font-mono text-xs">
                  {error.url}
                </div>
              </div>
            )}

            {/* 환경 변수 확인 */}
            <div className="bg-gray-50 rounded p-3">
              <div className="font-semibold text-gray-700 mb-1">API Base URL (환경 변수)</div>
              <div className="text-gray-600 break-all font-mono text-xs">
                {process.env.NEXT_PUBLIC_API_BASE_URL || '(설정되지 않음 - 기본값: http://localhost:8000)'}
              </div>
            </div>

            {/* 백엔드 상세 메시지 */}
            {error.detail && (
              <div className="bg-gray-50 rounded p-3">
                <div className="font-semibold text-gray-700 mb-1">서버 메시지</div>
                <div className="text-gray-600 break-all">{error.detail}</div>
              </div>
            )}

            {/* 요청 파라미터 */}
            {error.params && Object.keys(error.params).length > 0 && (
              <div className="bg-gray-50 rounded p-3">
                <div className="font-semibold text-gray-700 mb-1">요청 파라미터</div>
                <pre className="text-gray-600 text-xs overflow-x-auto">
                  {JSON.stringify(error.params, null, 2)}
                </pre>
              </div>
            )}

            {/* 타임스탬프 */}
            {error.timestamp && (
              <div className="bg-gray-50 rounded p-3">
                <div className="font-semibold text-gray-700 mb-1">발생 시각</div>
                <div className="text-gray-600 font-mono text-xs">{error.timestamp}</div>
              </div>
            )}

            {/* 디바이스 정보 */}
            <div className="bg-gray-50 rounded p-3">
              <div className="font-semibold text-gray-700 mb-1">디바이스 정보</div>
              <div className="text-gray-600 text-xs space-y-1">
                <div>User Agent: {navigator.userAgent}</div>
                <div>화면 크기: {window.innerWidth} x {window.innerHeight}</div>
                <div>온라인: {navigator.onLine ? '예' : '아니오'}</div>
              </div>
            </div>
          </div>

          {/* 복사 버튼 */}
          <div className="flex justify-center pt-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  복사됨!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  에러 정보 복사
                </>
              )}
            </button>
          </div>

          {/* 도움말 */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
            이 정보를 스크린샷으로 캡처하거나 복사하여 개발팀에 전달해주세요.
          </div>
        </div>
      )}
    </div>
  );
}
