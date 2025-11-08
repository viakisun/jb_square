/**
 * 🌐 JB SQUARE API 게이트웨이 클라이언트
 *
 * 이 파일은 백엔드 API와 통신하는 **단일 진입점**입니다.
 * 모든 HTTP 요청은 이 클라이언트를 통해 처리되며, 타입 안전성과 에러 핸들링을 보장합니다.
 *
 * 주요 기능:
 * - Axios 기반의 HTTP 클라이언트
 * - 요청/응답 인터셉터를 통한 중앙 집중식 에러 핸들링
 * - 환경변수 기반의 API URL 관리
 * - 자동 타임아웃 설정
 * - 전체 API 엔드포인트 통합 접근
 *
 * 사용 예시:
 * ```typescript
 * import api from '@/lib/api/client';
 *
 * // 공고 목록 조회
 * const notices = await api.notices.getList({ category: 'government' });
 *
 * // 단일 공고 상세
 * const notice = await api.notices.getById(123);
 *
 * // 검색
 * const results = await api.notices.search('바이오');
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { createNoticesAPI, NoticesAPI } from './endpoints/notices';
import { APIError } from './types';

/**
 * API 클라이언트 설정
 *
 * 환경변수에서 API 기본 URL을 가져오거나, 없으면 기본값을 사용합니다.
 */
const API_CONFIG = {
  /** API 기본 URL (환경변수 NEXT_PUBLIC_API_BASE_URL 또는 기본값) */
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',

  /** 요청 타임아웃 (30초) */
  timeout: 30000,

  /** 공통 헤더 */
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

/**
 * Axios 인스턴스 생성
 *
 * 모든 API 요청에 사용되는 기본 axios 인스턴스를 생성합니다.
 */
const axiosInstance: AxiosInstance = axios.create(API_CONFIG);

/**
 * 요청 인터셉터
 *
 * API 요청이 전송되기 전에 실행됩니다.
 * 인증 토큰 추가, 로깅 등의 작업을 수행할 수 있습니다.
 *
 * @param config - Axios 요청 설정
 * @returns 수정된 요청 설정
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 개발 환경에서 요청 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }

    // 향후 인증 토큰 추가 예시:
    // const token = localStorage.getItem('access_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error: AxiosError) => {
    // 요청 생성 중 에러 발생 시
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 *
 * API 응답을 받은 후 실행됩니다.
 * 성공 응답 처리 및 에러 변환을 수행합니다.
 *
 * @param response - Axios 응답 객체
 * @returns 응답 데이터
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 개발 환경에서 응답 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }

    return response;
  },
  (error: AxiosError<APIError>) => {
    // 에러 응답 처리
    const errorResponse = handleAPIError(error);

    // 개발 환경에서 에러 로깅
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: errorResponse.message
      });
    }

    return Promise.reject(errorResponse);
  }
);

/**
 * API 에러 핸들러
 *
 * Axios 에러를 사용자 친화적인 에러 객체로 변환합니다.
 *
 * @param error - Axios 에러 객체
 * @returns 변환된 에러 정보
 */
function handleAPIError(error: AxiosError<APIError>) {
  // 네트워크 에러 (서버 미응답)
  if (!error.response) {
    return {
      message: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
      statusCode: 0,
      detail: error.message
    };
  }

  const { status, data } = error.response;

  // 백엔드에서 반환한 에러 메시지
  if (data?.detail) {
    return {
      message: data.detail,
      statusCode: status,
      detail: data.detail
    };
  }

  // HTTP 상태 코드별 기본 메시지
  switch (status) {
    case 400:
      return {
        message: '잘못된 요청입니다. 입력값을 확인해주세요.',
        statusCode: status,
        detail: '400 Bad Request'
      };
    case 401:
      return {
        message: '인증이 필요합니다. 로그인해주세요.',
        statusCode: status,
        detail: '401 Unauthorized'
      };
    case 403:
      return {
        message: '접근 권한이 없습니다.',
        statusCode: status,
        detail: '403 Forbidden'
      };
    case 404:
      return {
        message: '요청한 데이터를 찾을 수 없습니다.',
        statusCode: status,
        detail: '404 Not Found'
      };
    case 500:
      return {
        message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        statusCode: status,
        detail: '500 Internal Server Error'
      };
    case 502:
    case 503:
    case 504:
      return {
        message: '서버가 일시적으로 사용 불가능합니다. 잠시 후 다시 시도해주세요.',
        statusCode: status,
        detail: `${status} Service Unavailable`
      };
    default:
      return {
        message: '알 수 없는 오류가 발생했습니다.',
        statusCode: status,
        detail: `${status} Unknown Error`
      };
  }
}

/**
 * API 클라이언트 인터페이스
 *
 * 모든 API 엔드포인트 그룹을 포함하는 통합 인터페이스입니다.
 */
interface APIClient {
  /** 공고 관련 API */
  notices: NoticesAPI;

  /** Axios 인스턴스 (고급 사용자용) */
  client: AxiosInstance;
}

/**
 * JB SQUARE API 클라이언트 인스턴스
 *
 * 이 객체를 import하여 모든 API 요청을 수행하세요.
 *
 * @example
 * ```typescript
 * import api from '@/lib/api/client';
 *
 * // 공고 API 사용
 * const notices = await api.notices.getList();
 *
 * // 직접 axios 인스턴스 사용 (고급)
 * const response = await api.client.get('/custom-endpoint');
 * ```
 */
const api: APIClient = {
  notices: createNoticesAPI(axiosInstance),
  client: axiosInstance
};

/**
 * 기본 export: API 클라이언트
 */
export default api;

/**
 * Named exports: 필요한 경우 개별적으로 import 가능
 */
export { axiosInstance, handleAPIError };
export type { APIClient };
