/**
 * 🪝 공고 데이터 관리 훅
 *
 * 공고 목록 조회, 필터링, 페이지네이션을 관리하는 커스텀 훅입니다.
 * 로딩 상태, 에러 핸들링, 데이터 캐싱을 자동으로 처리합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { useNotices } from '@/hooks/useNotices';
 *
 * function NoticeList() {
 *   const {
 *     notices,
 *     loading,
 *     error,
 *     pagination,
 *     fetchNotices,
 *     setFilters
 *   } = useNotices();
 *
 *   if (loading) return <div>로딩 중...</div>;
 *   if (error) return <div>에러: {error}</div>;
 *
 *   return (
 *     <div>
 *       {notices.map(notice => <NoticeCard key={notice.id} notice={notice} />)}
 *     </div>
 *   );
 * }
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/client';
import { Notice, NoticeFilterParams, PaginatedResponse } from '@/lib/api/types';
import { getErrorMessage, logError } from '@/lib/utils/errors';
import { ErrorDetails } from '@/components/ui/DebugErrorMessage';

/**
 * 훅 반환 타입 정의
 */
interface UseNoticesReturn {
  /** 공고 목록 데이터 */
  notices: Notice[];

  /** 로딩 상태 */
  loading: boolean;

  /** 에러 메시지 (에러 발생 시) */
  error: string | null;

  /** 상세 에러 정보 (디버깅용) */
  errorDetails: ErrorDetails | null;

  /** 페이지네이션 정보 */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  /** 공고 목록 새로고침 함수 */
  fetchNotices: () => Promise<void>;

  /** 필터 변경 함수 */
  setFilters: (filters: Partial<NoticeFilterParams>) => void;

  /** 페이지 변경 함수 */
  setPage: (page: number) => void;

  /** 현재 필터 상태 */
  filters: NoticeFilterParams;
}

/**
 * 공고 목록 관리 훅
 *
 * @param initialFilters - 초기 필터 파라미터 (선택적)
 * @returns 공고 데이터 및 제어 함수들
 *
 * @example
 * ```typescript
 * // 기본 사용
 * const { notices, loading } = useNotices();
 *
 * // 초기 필터 적용
 * const { notices } = useNotices({ crawler_source_id: 'source:ntis:rss', limit: 10 });
 *
 * // 필터 변경
 * const { setFilters } = useNotices();
 * setFilters({ crawler_source_id: 'source:bizinfo:api', search: '바이오' });
 * ```
 */
export function useNotices(
  initialFilters: Partial<NoticeFilterParams> = {}
): UseNoticesReturn {
  // 상태 관리
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);
  const [pagination, setPagination] = useState<UseNoticesReturn['pagination']>(null);

  // 필터 상태 (기본값 설정)
  const [filters, setFiltersState] = useState<NoticeFilterParams>({
    page: 1,
    limit: 20,
    sort_order: 'desc',
    ...initialFilters
  });

  /**
   * 공고 목록 가져오기
   *
   * API를 호출하여 필터에 맞는 공고 목록을 가져옵니다.
   * 로딩 상태와 에러를 자동으로 처리합니다.
   */
  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);

    try {
      const response: PaginatedResponse<Notice> = await api.notices.getList(filters);

      // 성공: 데이터 업데이트
      setNotices(response.items);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.total_pages,
        hasNext: response.has_next,
        hasPrev: response.has_prev
      });
    } catch (err) {
      // 에러 처리
      const errorMessage = getErrorMessage(err, '공고를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);

      // 상세 에러 정보 수집
      const details: ErrorDetails = {
        message: errorMessage,
        statusCode: (err as any)?.statusCode,
        detail: (err as any)?.detail,
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/notices`,
        params: filters,
        timestamp: new Date().toISOString(),
        raw: err
      };
      setErrorDetails(details);

      logError(err, '공고 목록 조회 실패');

      // 에러 발생 시 빈 배열 설정
      setNotices([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * 필터 변경 함수
   *
   * 기존 필터에 새로운 필터를 병합하고, 페이지를 1로 리셋합니다.
   *
   * @param newFilters - 변경할 필터 (부분 업데이트)
   */
  const setFilters = useCallback((newFilters: Partial<NoticeFilterParams>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      // 필터 변경 시 페이지를 1로 리셋 (검색 결과가 달라지므로)
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  }, []);

  /**
   * 페이지 변경 함수
   *
   * @param page - 이동할 페이지 번호
   */
  const setPage = useCallback((page: number) => {
    setFiltersState(prev => ({ ...prev, page }));
  }, []);

  /**
   * 필터 변경 시 자동으로 데이터 새로고침
   *
   * filters 상태가 변경될 때마다 fetchNotices를 호출합니다.
   */
  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  return {
    notices,
    loading,
    error,
    errorDetails,
    pagination,
    fetchNotices,
    setFilters,
    setPage,
    filters
  };
}

/**
 * 단일 공고 상세 조회 훅
 *
 * 특정 ID의 공고 상세 정보를 가져옵니다.
 *
 * @param id - 공고 ID
 * @returns 공고 상세 데이터 및 로딩/에러 상태
 *
 * @example
 * ```typescript
 * function NoticeDetail({ id }: { id: number }) {
 *   const { notice, loading, error } = useNotice(id);
 *
 *   if (loading) return <div>로딩 중...</div>;
 *   if (error) return <div>에러: {error}</div>;
 *   if (!notice) return <div>공고를 찾을 수 없습니다.</div>;
 *
 *   return <div>{notice.title}</div>;
 * }
 * ```
 */
export function useNotice(id: number | null) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotice = useCallback(async () => {
    if (!id) {
      setNotice(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.notices.getById(id);
      setNotice(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err, '공고를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, `공고 상세 조회 실패 (ID: ${id})`);
      setNotice(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNotice();
  }, [fetchNotice]);

  return {
    notice,
    loading,
    error,
    refetch: fetchNotice
  };
}

/**
 * 최신 공고 조회 훅
 *
 * 홈페이지 메인 화면이나 사이드바에 표시할 최신 공고를 가져옵니다.
 *
 * @param limit - 조회할 공고 수 (기본값: 5)
 * @param sourceId - 출처 필터 (선택적, source:organization:type 형식)
 * @returns 최신 공고 목록 및 로딩/에러 상태
 *
 * @example
 * ```typescript
 * function LatestNotices() {
 *   const { notices, loading } = useLatestNotices(5, 'source:ntis:rss');
 *
 *   return (
 *     <div>
 *       <h2>최신 공고</h2>
 *       {notices.map(notice => <NoticeCard key={notice.id} notice={notice} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLatestNotices(limit: number = 5, sourceId?: string) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestNotices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.notices.getLatest({ limit, source_id: sourceId });
      setNotices(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err, '최신 공고를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, '최신 공고 조회 실패');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [limit, sourceId]);

  useEffect(() => {
    fetchLatestNotices();
  }, [fetchLatestNotices]);

  return {
    notices,
    loading,
    error,
    refetch: fetchLatestNotices
  };
}
