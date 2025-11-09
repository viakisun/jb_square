/**
 * 🪝 창업보육센터 데이터 관리 훅
 *
 * 창업보육센터 및 입주기업 목록 조회, 필터링을 관리하는 커스텀 훅입니다.
 * 로딩 상태, 에러 핸들링, 데이터 캐싱을 자동으로 처리합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { useBICenters } from '@/hooks/useBICenters';
 *
 * function CenterList() {
 *   const {
 *     centers,
 *     loading,
 *     error,
 *     fetchCenters
 *   } = useBICenters();
 *
 *   if (loading) return <div>로딩 중...</div>;
 *   if (error) return <div>에러: {error}</div>;
 *
 *   return (
 *     <div>
 *       {centers.map(center => <CenterCard key={center.id} center={center} />)}
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
import { BICenter, BICompany, BICenterListResponse } from '@/lib/api/types';
import { BICenterFilterParams, BICompanyListResponse } from '@/lib/api/endpoints/bi-centers';
import { getErrorMessage, logError } from '@/lib/utils/errors';

/**
 * 창업보육센터 목록 훅 반환 타입 정의
 */
interface UseBICentersReturn {
  /** 보육센터 목록 데이터 */
  centers: BICenter[];

  /** 로딩 상태 */
  loading: boolean;

  /** 에러 메시지 (에러 발생 시) */
  error: string | null;

  /** 전체 센터 개수 */
  total: number;

  /** 센터 목록 새로고침 함수 */
  fetchCenters: () => Promise<void>;

  /** 필터 변경 함수 */
  setFilters: (filters: Partial<BICenterFilterParams>) => void;

  /** 현재 필터 상태 */
  filters: BICenterFilterParams;
}

/**
 * 창업보육센터 목록 관리 훅
 *
 * @param initialFilters - 초기 필터 파라미터 (선택적)
 * @returns 센터 데이터 및 제어 함수들
 *
 * @example
 * ```typescript
 * // 기본 사용
 * const { centers, loading } = useBICenters();
 *
 * // 초기 필터 적용
 * const { centers } = useBICenters({ region: '전주시', limit: 10 });
 *
 * // 공실이 있는 센터만 조회
 * const { centers } = useBICenters({ has_vacancy: true });
 *
 * // 필터 변경
 * const { setFilters } = useBICenters();
 * setFilters({ region: '군산시', specialization: '바이오' });
 * ```
 */
export function useBICenters(
  initialFilters: Partial<BICenterFilterParams> = {}
): UseBICentersReturn {
  // 상태 관리
  const [centers, setCenters] = useState<BICenter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  // 필터 상태 (기본값 설정)
  const [filters, setFiltersState] = useState<BICenterFilterParams>({
    limit: 50,
    skip: 0,
    ...initialFilters
  });

  /**
   * 보육센터 목록 가져오기
   *
   * API를 호출하여 필터에 맞는 센터 목록을 가져옵니다.
   * 로딩 상태와 에러를 자동으로 처리합니다.
   */
  const fetchCenters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: BICenterListResponse = await api.biCenters.getList(filters);

      // 성공: 데이터 업데이트
      setCenters(response.items);
      setTotal(response.total);
    } catch (err) {
      // 에러 처리
      const errorMessage = getErrorMessage(err, '보육센터 정보를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, '보육센터 목록 조회 실패');

      // 에러 발생 시 빈 배열 설정
      setCenters([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * 필터 변경 함수
   *
   * 기존 필터에 새로운 필터를 병합합니다.
   *
   * @param newFilters - 변경할 필터 (부분 업데이트)
   */
  const setFilters = useCallback((newFilters: Partial<BICenterFilterParams>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  /**
   * 필터 변경 시 자동으로 데이터 새로고침
   *
   * filters 상태가 변경될 때마다 fetchCenters를 호출합니다.
   */
  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  return {
    centers,
    loading,
    error,
    total,
    fetchCenters,
    setFilters,
    filters
  };
}

/**
 * 단일 보육센터 상세 조회 훅
 *
 * 특정 ID의 보육센터 상세 정보를 가져옵니다.
 *
 * @param id - 센터 ID
 * @returns 센터 상세 데이터 및 로딩/에러 상태
 *
 * @example
 * ```typescript
 * function CenterDetail({ id }: { id: number }) {
 *   const { center, loading, error } = useBICenter(id);
 *
 *   if (loading) return <div>로딩 중...</div>;
 *   if (error) return <div>에러: {error}</div>;
 *   if (!center) return <div>센터를 찾을 수 없습니다.</div>;
 *
 *   return <div>{center.center_name}</div>;
 * }
 * ```
 */
export function useBICenter(id: number | null) {
  const [center, setCenter] = useState<BICenter | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenter = useCallback(async () => {
    if (!id) {
      setCenter(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.biCenters.getById(id);
      setCenter(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err, '보육센터 정보를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, `보육센터 상세 조회 실패 (ID: ${id})`);
      setCenter(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCenter();
  }, [fetchCenter]);

  return {
    center,
    loading,
    error,
    refetch: fetchCenter
  };
}

/**
 * 공실이 있는 보육센터 조회 훅
 *
 * 현재 공실이 있는 센터만 조회합니다.
 * 입주를 희망하는 창업자에게 유용한 정보입니다.
 *
 * @param limit - 조회할 센터 수 (기본값: 10)
 * @returns 공실이 있는 센터 목록 및 로딩/에러 상태
 *
 * @example
 * ```typescript
 * function VacantCenters() {
 *   const { centers, loading } = useVacantCenters(5);
 *
 *   return (
 *     <div>
 *       <h2>공실이 있는 센터</h2>
 *       {centers.map(center => <CenterCard key={center.id} center={center} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useVacantCenters(limit: number = 10) {
  const [centers, setCenters] = useState<BICenter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVacantCenters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.biCenters.getVacancies(limit);
      setCenters(response.items);
    } catch (err) {
      const errorMessage = getErrorMessage(err, '공실 정보를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, '공실 센터 조회 실패');
      setCenters([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchVacantCenters();
  }, [fetchVacantCenters]);

  return {
    centers,
    loading,
    error,
    refetch: fetchVacantCenters
  };
}

/**
 * 입주기업 목록 훅 반환 타입 정의
 */
interface UseBICompaniesReturn {
  /** 입주기업 목록 데이터 */
  companies: BICompany[];

  /** 로딩 상태 */
  loading: boolean;

  /** 에러 메시지 (에러 발생 시) */
  error: string | null;

  /** 전체 기업 개수 */
  total: number;

  /** 기업 목록 새로고침 함수 */
  fetchCompanies: () => Promise<void>;
}

/**
 * 입주기업 목록 조회 훅
 *
 * 특정 센터 또는 전체 센터의 입주기업을 조회합니다.
 *
 * @param centerId - 센터 ID (null이면 전체 입주기업 조회)
 * @param businessField - 사업 분야 필터 (선택적)
 * @returns 입주기업 목록 및 로딩/에러 상태
 *
 * @example
 * ```typescript
 * // 특정 센터의 입주기업
 * const { companies, loading } = useBICompanies(123);
 *
 * // 전체 입주기업 중 바이오 분야
 * const { companies } = useBICompanies(null, '바이오');
 * ```
 */
export function useBICompanies(
  centerId: number | null = null,
  businessField?: string
): UseBICompaniesReturn {
  const [companies, setCompanies] = useState<BICompany[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response: BICompanyListResponse;

      if (centerId) {
        // 특정 센터의 입주기업 조회
        response = await api.biCenters.getCompaniesByCenter(centerId, { business_field: businessField });
      } else {
        // 전체 입주기업 조회
        response = await api.biCenters.getAllCompanies({ business_field: businessField });
      }

      setCompanies(response.items);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = getErrorMessage(err, '입주기업 정보를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, '입주기업 목록 조회 실패');
      setCompanies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [centerId, businessField]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    total,
    fetchCompanies
  };
}

/**
 * 보육센터 통계 조회 훅
 *
 * 전체 센터의 통계 정보를 조회합니다.
 *
 * @returns 센터 통계 정보 및 로딩/에러 상태
 *
 * @example
 * ```typescript
 * function CenterStatistics() {
 *   const { stats, loading } = useBICenterStatistics();
 *
 *   if (loading) return <div>로딩 중...</div>;
 *
 *   return (
 *     <div>
 *       <p>총 센터 수: {stats.total_centers}개</p>
 *       <p>총 입주기업: {stats.total_companies}개</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBICenterStatistics() {
  const [stats, setStats] = useState<{
    total_centers: number;
    total_companies: number;
    vacant_centers: number;
    by_region: Record<string, number>;
    by_specialization: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.biCenters.getStatistics();
      setStats(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err, '통계 정보를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, '센터 통계 조회 실패');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStatistics
  };
}
