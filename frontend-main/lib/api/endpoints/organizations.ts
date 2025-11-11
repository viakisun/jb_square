/**
 * 🏢 기업정보 관리 API 엔드포인트
 *
 * 이 파일은 기업/기관 정보 관련 모든 API 요청을 처리하는 함수들을 제공합니다.
 * 백엔드의 /api/organizations 라우터와 직접 연동됩니다.
 *
 * 사용 예시:
 * ```typescript
 * import { getOrganizations, getOrganizationById } from '@/lib/api/endpoints/organizations';
 *
 * // 기업 목록 조회
 * const { items, total } = await getOrganizations({ industry: '바이오의약품', page: 1 });
 *
 * // 단일 기업 상세
 * const company = await getOrganizationById(123);
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import { AxiosInstance } from 'axios';
import { Organization, PaginatedResponse } from '../types';

/**
 * 기업 목록 조회 필터 파라미터
 *
 * GET /api/organizations 엔드포인트에 전달되는 쿼리 파라미터입니다.
 * 백엔드 API 스펙과 1:1 매핑됩니다.
 */
export interface OrganizationFilterParams {
  /** 검색어 (업체명, 대표자명, 주요제품명에서 검색) */
  search?: string;

  /** 산업 분류 필터 (BIO_CORE/BIO_RELATED/NON_BIO) */
  industry_type?: string;

  /** 기업 규모 필터 (대기업/중견기업/중소기업) */
  company_scale?: string;

  /** 기업 상태 필터 (영업중/폐업/휴업) */
  company_status?: string;

  /** KSIC 10차 코드 필터 */
  ksic_10th_code?: string;

  /** 기업부설연구소 유무 */
  has_research_institute?: boolean;

  /** 건너뛸 항목 수 */
  skip?: number;

  /** 페이지당 항목 수 (기본값: 20, 최대: 100) */
  limit?: number;

  /** 페이지 번호 (1부터 시작, 기본값: 1) */
  page?: number;

  /** 연도별 데이터 구조화 여부 */
  include_yearly?: boolean;

  /** 정렬 기준 */
  sort_by?: string;

  /** 정렬 순서 ('asc': 오름차순, 'desc': 내림차순, 기본값: 'desc') */
  sort_order?: 'asc' | 'desc';
}

/**
 * 기업정보 API 엔드포인트 클래스
 *
 * axios 인스턴스를 주입받아 기업 정보 관련 모든 API 요청을 처리합니다.
 * 각 메서드는 타입 안전성을 보장하며 에러 핸들링이 포함되어 있습니다.
 */
export class OrganizationsAPI {
  private client: AxiosInstance;

  /**
   * OrganizationsAPI 생성자
   *
   * @param client - axios 인스턴스
   */
  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * 기업 목록 조회
   *
   * 페이지네이션, 필터링, 검색, 정렬 기능을 지원합니다.
   *
   * @param params - 필터 파라미터 (선택적)
   * @returns 기업 목록과 페이지네이션 정보
   *
   * @example
   * ```typescript
   * // 바이오의약품 기업 1페이지 조회
   * const result = await organizationsAPI.getList({ industry: '바이오의약품', page: 1 });
   *
   * // 검색어로 조회
   * const result = await organizationsAPI.getList({ search: '셀트리온', limit: 10 });
   *
   * // 기업명 기준 정렬
   * const result = await organizationsAPI.getList({ sort_by: 'name', sort_order: 'asc' });
   * ```
   */
  async getList(params?: OrganizationFilterParams): Promise<PaginatedResponse<Organization>> {
    const response = await this.client.get<PaginatedResponse<Organization>>('/api/organizations', {
      params
    });
    return response.data;
  }

  /**
   * 단일 기업 상세 조회
   *
   * 기업 ID를 사용하여 해당 기업의 전체 정보를 가져옵니다.
   *
   * @param id - 기업 ID
   * @returns 기업 상세 정보
   * @throws {APIError} 기업을 찾을 수 없는 경우 404 에러
   *
   * @example
   * ```typescript
   * const company = await organizationsAPI.getById(123);
   * console.log(company.name, company.ceo);
   * ```
   */
  async getById(id: number): Promise<Organization> {
    const response = await this.client.get<Organization>(`/api/organizations/${id}`);
    return response.data;
  }

  /**
   * 기업 검색
   *
   * 기업명, 대표자명, 제품명 등에서 키워드를 검색합니다.
   * getList 메서드의 search 파라미터를 사용하는 편의 메서드입니다.
   *
   * @param query - 검색 키워드
   * @param additionalParams - 추가 필터 파라미터
   * @returns 검색 결과 (페이지네이션 포함)
   *
   * @example
   * ```typescript
   * // '바이오' 키워드 검색
   * const results = await organizationsAPI.search('바이오');
   *
   * // 특정 산업 분야에서 검색
   * const results = await organizationsAPI.search('의료기기', { industry: '의료기기' });
   * ```
   */
  async search(
    query: string,
    additionalParams?: Omit<OrganizationFilterParams, 'search'>
  ): Promise<PaginatedResponse<Organization>> {
    return this.getList({ ...additionalParams, search: query });
  }

  /**
   * 산업 분류별 기업 조회
   *
   * 특정 산업 분류의 기업만 필터링하여 조회합니다.
   *
   * @param industryType - 산업 분류 (BIO_CORE: 바이오 핵심산업, BIO_RELATED: 전후방 연관산업, NON_BIO: 비바이오산업)
   * @param additionalParams - 추가 필터 파라미터
   * @returns 산업 분류별 기업 목록
   *
   * @example
   * ```typescript
   * // 바이오 핵심산업 기업 전체
   * const bioCore = await organizationsAPI.getByIndustryType('BIO_CORE');
   *
   * // 전후방 연관산업 기업 2페이지
   * const bioRelated = await organizationsAPI.getByIndustryType('BIO_RELATED', { page: 2 });
   * ```
   */
  async getByIndustryType(
    industryType: string,
    additionalParams?: Omit<OrganizationFilterParams, 'industry_type'>
  ): Promise<PaginatedResponse<Organization>> {
    return this.getList({ ...additionalParams, industry_type: industryType });
  }

  /**
   * 기업 규모별 조회
   *
   * 특정 기업 규모의 기업만 필터링하여 조회합니다.
   *
   * @param scale - 기업 규모 (대기업/중견기업/중소기업)
   * @param additionalParams - 추가 필터 파라미터
   * @returns 기업 규모별 기업 목록
   *
   * @example
   * ```typescript
   * // 중소기업 전체
   * const smes = await organizationsAPI.getByScale('중소기업');
   *
   * // 대기업 중 바이오 핵심산업
   * const largeCoreBio = await organizationsAPI.getByScale('대기업', { industry_type: 'BIO_CORE' });
   * ```
   */
  async getByScale(
    scale: string,
    additionalParams?: Omit<OrganizationFilterParams, 'company_scale'>
  ): Promise<PaginatedResponse<Organization>> {
    return this.getList({ ...additionalParams, company_scale: scale });
  }

  /**
   * KSIC 코드별 기업 조회
   *
   * 특정 KSIC 10차 코드의 기업만 필터링하여 조회합니다.
   *
   * @param ksicCode - KSIC 10차 코드
   * @param additionalParams - 추가 필터 파라미터
   * @returns KSIC 코드별 기업 목록
   *
   * @example
   * ```typescript
   * // 특정 KSIC 코드의 기업
   * const companies = await organizationsAPI.getByKSIC('21101');
   * ```
   */
  async getByKSIC(
    ksicCode: string,
    additionalParams?: Omit<OrganizationFilterParams, 'ksic_10th_code'>
  ): Promise<PaginatedResponse<Organization>> {
    return this.getList({ ...additionalParams, ksic_10th_code: ksicCode });
  }

  /**
   * 최신 등록 기업 조회
   *
   * 최근 등록된 기업을 조회합니다.
   * 홈페이지 메인 화면이나 사이드바에 표시할 때 유용합니다.
   *
   * @param limit - 조회할 기업 수 (기본값: 10)
   * @returns 최신 등록 기업 목록
   *
   * @example
   * ```typescript
   * // 최신 5개 기업
   * const latest = await organizationsAPI.getLatest(5);
   * ```
   */
  async getLatest(limit: number = 10): Promise<PaginatedResponse<Organization>> {
    return this.getList({
      sort_by: 'created_at',
      sort_order: 'desc',
      limit
    });
  }
}

/**
 * 기업정보 API 인스턴스 생성 헬퍼 함수
 *
 * axios 클라이언트를 주입받아 OrganizationsAPI 인스턴스를 생성합니다.
 *
 * @param client - axios 인스턴스
 * @returns OrganizationsAPI 인스턴스
 *
 * @example
 * ```typescript
 * import axios from 'axios';
 * import { createOrganizationsAPI } from '@/lib/api/endpoints/organizations';
 *
 * const client = axios.create({ baseURL: 'http://localhost:8000' });
 * const organizationsAPI = createOrganizationsAPI(client);
 * ```
 */
export function createOrganizationsAPI(client: AxiosInstance): OrganizationsAPI {
  return new OrganizationsAPI(client);
}
