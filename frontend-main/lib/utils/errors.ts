/**
 * ⚠️ 에러 처리 유틸리티
 *
 * API 에러 및 일반 에러를 사용자 친화적인 메시지로 변환하거나
 * 에러 로깅, 알림 표시 등의 기능을 제공합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { getErrorMessage, showErrorToast, logError } from '@/lib/utils/errors';
 *
 * try {
 *   await api.notices.getList();
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   showErrorToast(message);
 *   logError(error, '공고 목록 조회 실패');
 * }
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

/**
 * 에러 객체에서 사용자 친화적인 메시지 추출
 *
 * 다양한 형태의 에러 객체에서 적절한 에러 메시지를 추출합니다.
 * - Axios 에러
 * - API 에러 응답
 * - 일반 JavaScript 에러
 * - 커스텀 에러 객체
 *
 * @param error - 에러 객체 (any 타입)
 * @param defaultMessage - 기본 메시지 (에러 메시지를 추출할 수 없을 때 사용)
 * @returns 사용자 친화적인 에러 메시지
 *
 * @example
 * ```typescript
 * try {
 *   await api.notices.getList();
 * } catch (error) {
 *   const message = getErrorMessage(error, '공고를 불러올 수 없습니다.');
 *   alert(message);
 * }
 * ```
 */
export function getErrorMessage(error: any, defaultMessage: string = '오류가 발생했습니다.'): string {
  // Axios 에러 응답 (우리의 handleAPIError에서 변환된 객체)
  if (error?.message) {
    return error.message;
  }

  // API 에러 응답 (detail 필드)
  if (error?.detail) {
    return error.detail;
  }

  // JavaScript Error 객체
  if (error instanceof Error) {
    return error.message;
  }

  // 문자열 에러
  if (typeof error === 'string') {
    return error;
  }

  // 기타 에러: 기본 메시지 반환
  return defaultMessage;
}

/**
 * HTTP 상태 코드에 따른 사용자 친화적 메시지 생성
 *
 * @param statusCode - HTTP 상태 코드
 * @returns 상태 코드에 맞는 한국어 메시지
 *
 * @example
 * ```typescript
 * getStatusCodeMessage(404);  // '요청한 데이터를 찾을 수 없습니다.'
 * getStatusCodeMessage(500);  // '서버 오류가 발생했습니다.'
 * ```
 */
export function getStatusCodeMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return '잘못된 요청입니다. 입력값을 확인해주세요.';
    case 401:
      return '인증이 필요합니다. 로그인해주세요.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 데이터를 찾을 수 없습니다.';
    case 408:
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    case 409:
      return '데이터 충돌이 발생했습니다.';
    case 429:
      return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    case 502:
      return '게이트웨이 오류가 발생했습니다.';
    case 503:
      return '서비스를 일시적으로 사용할 수 없습니다.';
    case 504:
      return '게이트웨이 시간 초과가 발생했습니다.';
    default:
      return `오류가 발생했습니다. (상태 코드: ${statusCode})`;
  }
}

/**
 * 에러 로깅 (콘솔 및 선택적으로 외부 로깅 서비스로 전송)
 *
 * 개발 환경에서는 콘솔에 상세 로그를 출력하고,
 * 프로덕션 환경에서는 외부 로깅 서비스(Sentry 등)로 전송할 수 있습니다.
 *
 * @param error - 에러 객체
 * @param context - 에러 발생 컨텍스트 (어디서 발생했는지 설명)
 *
 * @example
 * ```typescript
 * try {
 *   await fetchData();
 * } catch (error) {
 *   logError(error, '데이터 가져오기 실패');
 * }
 * ```
 */
export function logError(error: any, context?: string): void {
  const errorMessage = getErrorMessage(error);
  const timestamp = new Date().toISOString();

  // 콘솔 로깅 (개발 환경)
  if (process.env.NODE_ENV === 'development') {
    console.group(`[에러 로그] ${timestamp}`);
    if (context) {
      console.log('컨텍스트:', context);
    }
    console.log('메시지:', errorMessage);
    console.log('원본 에러:', error);
    if (error?.stack) {
      console.log('스택 트레이스:', error.stack);
    }
    console.groupEnd();
  } else {
    // 프로덕션 환경: 외부 로깅 서비스로 전송
    // 예시: Sentry, LogRocket 등
    // Sentry.captureException(error, { contexts: { custom: { context } } });
    console.error(`[에러] ${context || '알 수 없음'}:`, errorMessage);
  }
}

/**
 * 에러 알림 표시 (향후 Toast 컴포넌트와 연동 가능)
 *
 * 사용자에게 에러 메시지를 알림으로 표시합니다.
 * 현재는 alert로 구현되어 있으나, Toast 컴포넌트로 교체 가능합니다.
 *
 * @param error - 에러 객체 또는 메시지
 * @param title - 알림 제목 (선택적)
 *
 * @example
 * ```typescript
 * try {
 *   await saveData();
 * } catch (error) {
 *   showErrorToast(error, '저장 실패');
 * }
 * ```
 */
export function showErrorToast(error: any, title?: string): void {
  const message = getErrorMessage(error);

  // TODO: Toast 컴포넌트로 교체
  // toast.error(message, { title });

  // 임시: alert 사용
  if (title) {
    alert(`${title}\n${message}`);
  } else {
    alert(message);
  }
}

/**
 * 네트워크 에러 여부 확인
 *
 * @param error - 에러 객체
 * @returns 네트워크 에러이면 true
 *
 * @example
 * ```typescript
 * try {
 *   await api.notices.getList();
 * } catch (error) {
 *   if (isNetworkError(error)) {
 *     alert('인터넷 연결을 확인해주세요.');
 *   }
 * }
 * ```
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('Network Error') ||
    error?.message?.includes('서버에 연결할 수 없습니다') ||
    error?.statusCode === 0 ||
    !error?.statusCode
  );
}

/**
 * 인증 에러 여부 확인
 *
 * @param error - 에러 객체
 * @returns 인증 에러이면 true (401, 403)
 *
 * @example
 * ```typescript
 * try {
 *   await api.notices.getById(123);
 * } catch (error) {
 *   if (isAuthError(error)) {
 *     // 로그인 페이지로 리다이렉트
 *     router.push('/login');
 *   }
 * }
 * ```
 */
export function isAuthError(error: any): boolean {
  return error?.statusCode === 401 || error?.statusCode === 403;
}

/**
 * 서버 에러 여부 확인
 *
 * @param error - 에러 객체
 * @returns 서버 에러이면 true (5xx)
 *
 * @example
 * ```typescript
 * try {
 *   await api.notices.getList();
 * } catch (error) {
 *   if (isServerError(error)) {
 *     alert('서버에 일시적인 문제가 발생했습니다.');
 *   }
 * }
 * ```
 */
export function isServerError(error: any): boolean {
  const statusCode = error?.statusCode;
  return statusCode >= 500 && statusCode < 600;
}

/**
 * 에러 재시도 헬퍼 함수
 *
 * 네트워크 일시적 오류 등으로 실패한 작업을 자동으로 재시도합니다.
 *
 * @param fn - 재시도할 비동기 함수
 * @param maxRetries - 최대 재시도 횟수 (기본값: 3)
 * @param delay - 재시도 간 대기 시간(ms) (기본값: 1000)
 * @returns 함수 실행 결과
 *
 * @example
 * ```typescript
 * const data = await retryOnError(
 *   () => api.notices.getList(),
 *   3,  // 최대 3번 재시도
 *   1000  // 1초 대기
 * );
 * ```
 */
export async function retryOnError<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 인증 에러나 클라이언트 에러는 재시도하지 않음
      if (isAuthError(error) || ((error as any)?.statusCode >= 400 && (error as any)?.statusCode < 500)) {
        throw error;
      }

      // 마지막 시도였다면 에러를 던짐
      if (attempt === maxRetries) {
        break;
      }

      // 지수 백오프 (1초, 2초, 4초...)
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      console.log(`재시도 ${attempt}/${maxRetries} (${backoffDelay}ms 후)`);

      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
}

/**
 * 에러 타입 정의
 *
 * 커스텀 에러 클래스를 정의하여 특정 에러 타입을 구별할 수 있습니다.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = '요청한 데이터를 찾을 수 없습니다.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = '인증이 필요합니다.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
