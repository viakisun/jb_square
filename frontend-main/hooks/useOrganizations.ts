/**
 * 🪝 기업정보 데이터 관리 훅
 *
 * 기업 목록 조회, 필터링, 페이지네이션을 관리하는 커스텀 훅입니다.
 * 로딩 상태, 에러 핸들링, 데이터 캐싱을 자동으로 처리합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { useOrganizations } from '@/hooks/useOrganizations';
 *
 * function CompanyList() {
 *   const {
 *     companies,
 *     loading,
 *     error,
 *     pagination,
 *     fetchCompanies,
 *     setFilters
 *   } = useOrganizations();
 *
 *   if (loading) return <div>로딩 중...</div>;
 *   if (error) return <div>에러: {error}</div>;
 *
 *   return (
 *     <div>
 *       {companies.map(company => <CompanyCard key={company.id} company={company} />)}
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
import { Organization, PaginatedResponse } from '@/lib/api/types';
import { OrganizationFilterParams } from '@/lib/api/endpoints/organizations';
import { getErrorMessage, logError } from '@/lib/utils/errors';

/**
 * 훅 반환 타입 정의
 */
interface UseOrganizationsReturn {
  /** 기업 목록 데이터 */
  companies: Organization[];

  /** 로딩 상태 */
  loading: boolean;

  /** 에러 메시지 (에러 발생 시) */
  error: string | null;

  /** 페이지네이션 정보 */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  /** 기업 목록 새로고침 함수 */
  fetchCompanies: () => Promise<void>;

  /** 필터 변경 함수 */
  setFilters: (filters: Partial<OrganizationFilterParams>) => void;

  /** 페이지 변경 함수 */
  setPage: (page: number) => void;

  /** 현재 필터 상태 */
  filters: OrganizationFilterParams;
}

/**
 * 기업 목록 관리 훅
 *
 * @param initialFilters - 초기 필터 파라미터 (선택적)
 * @returns 기업 데이터 및 제어 함수들
 *
 * @example
 * ```typescript
 * // 기본 사용
 * const { companies, loading } = useOrganizations();
 *
 * // 초기 필터 적용
 * const { companies } = useOrganizations({ industry: '바이오의약품', limit: 10 });
 *
 * // 필터 변경
 * const { setFilters } = useOrganizations();
 * setFilters({ industry: '의료기기', region: '전주' });
 * ```
 */
export function useOrganizations(
  initialFilters: Partial<OrganizationFilterParams> = {}
): UseOrganizationsReturn {
  // 상태 관리
  const [companies, setCompanies] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseOrganizationsReturn['pagination']>(null);

  // 필터 상태 (기본값 설정)
  const [filters, setFiltersState] = useState<OrganizationFilterParams>({
    page: 1,
    limit: 20,
    sort_order: 'desc',
    ...initialFilters
  });

  /**
   * 기업 목록 가져오기
   *
   * API를 호출하여 필터에 맞는 기업 목록을 가져옵니다.
   * 로딩 상태와 에러를 자동으로 처리합니다.
   */
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 페이지 번호를 skip 값으로 변환
      const skip = filters.page ? (filters.page - 1) * (filters.limit || 20) : 0;
      const apiParams = {
        ...filters,
        skip,
        page: undefined // skip을 사용하므로 page는 제거
      };

      const response = await api.organizations.getList(apiParams);

      // 성공: 데이터 업데이트
      setCompanies(response.items);

      // 페이지네이션 계산
      const total = response.total || 0;
      const limit = filters.limit || 20;
      const totalPages = Math.ceil(total / limit);
      const currentPage = filters.page || 1;

      setPagination({
        page: currentPage,
        limit: limit,
        total: total,
        totalPages: totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      });
    } catch (err) {
      // 에러 처리
      const errorMessage = getErrorMessage(err, '기업 정보를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, '기업 목록 조회 실패');

      // 에러 발생 시 빈 배열 설정
      setCompanies([]);
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
  const setFilters = useCallback((newFilters: Partial<OrganizationFilterParams>) => {
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
   * filters 상태가 변경될 때마다 fetchCompanies를 호출합니다.
   */
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    pagination,
    fetchCompanies,
    setFilters,
    setPage,
    filters
  };
}

/**
 * 단일 기업 상세 조회 훅
 *
 * 특정 ID의 기업 상세 정보를 가져옵니다.
 *
 * @param id - 기업 ID
 * @returns 기업 상세 데이터 및 로딩/에러 상태
 *
 * @example
 * ```typescript
 * function CompanyDetail({ id }: { id: number }) {
 *   const { company, loading, error } = useOrganization(id);
 *
 *   if (loading) return <div>로딩 중...</div>;
 *   if (error) return <div>에러: {error}</div>;
 *   if (!company) return <div>기업을 찾을 수 없습니다.</div>;
 *
 *   return <div>{company.name}</div>;
 * }
 * ```
 */
export function useOrganization(id: number | null) {
  const [company, setCompany] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!id) {
      setCompany(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.organizations.getById(id);
      setCompany(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err, '기업 정보를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, `기업 상세 조회 실패 (ID: ${id})`);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return {
    company,
    loading,
    error,
    refetch: fetchCompany
  };
}

/**
 * 최신 등록 기업 조회 훅
 *
 * 홈페이지 메인 화면이나 사이드바에 표시할 최신 등록 기업을 가져옵니다.
 *
 * @param limit - 조회할 기업 수 (기본값: 5)
 * @param industry - 산업 분야 필터 (선택적)
 * @returns 최신 기업 목록 및 로딩/에러 상태
 *
 * @example
 * ```typescript
 * function LatestCompanies() {
 *   const { companies, loading } = useLatestOrganizations(5, '바이오의약품');
 *
 *   return (
 *     <div>
 *       <h2>최신 등록 기업</h2>
 *       {companies.map(company => <CompanyCard key={company.id} company={company} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLatestOrganizations(limit: number = 5, industry?: string) {
  const [companies, setCompanies] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.organizations.getLatest(limit);
      // industry 필터가 있으면 클라이언트 측에서 필터링
      const filtered = industry
        ? response.items.filter(c => c.industry === industry)
        : response.items;
      setCompanies(filtered);
    } catch (err) {
      const errorMessage = getErrorMessage(err, '최신 기업 정보를 불러오는 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, '최신 기업 조회 실패');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [limit, industry]);

  useEffect(() => {
    fetchLatestCompanies();
  }, [fetchLatestCompanies]);

  return {
    companies,
    loading,
    error,
    refetch: fetchLatestCompanies
  };
}
