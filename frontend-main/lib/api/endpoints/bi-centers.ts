/**
 * 🏢 창업보육센터 관리 API 엔드포인트
 *
 * 이 파일은 창업보육센터(BI Center) 및 입주기업 관련 모든 API 요청을 처리하는 함수들을 제공합니다.
 * 백엔드의 /api/bi-centers 라우터와 직접 연동됩니다.
 *
 * 사용 예시:
 * ```typescript
 * import { getBICenters, getBICenterById } from '@/lib/api/endpoints/bi-centers';
 *
 * // 보육센터 목록 조회
 * const { items, total } = await getBICenters({ region: '전주', page: 1 });
 *
 * // 단일 센터 상세
 * const center = await getBICenterById(123);
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import { AxiosInstance } from 'axios';
import { BICenter, BICompany, BICenterListResponse } from '../types';

/**
 * 창업보육센터 목록 조회 필터 파라미터
 *
 * GET /api/bi-centers/list 엔드포인트에 전달되는 쿼리 파라미터입니다.
 */
export interface BICenterFilterParams {
  /** 지역 필터 (예: '전주시', '군산시', '익산시') */
  region?: string;

  /** 도시 필터 */
  city?: string;

  /** 특화 분야 필터 (예: '바이오', 'IT', '제조') */
  specialization?: string;

  /** 공실 있는 센터만 조회 (true인 경우 vacant_rooms가 null이 아닌 센터만) */
  has_vacancy?: boolean;

  /** 페이지 번호 (기본값: 1) */
  skip?: number;

  /** 페이지당 항목 수 (기본값: 20) */
  limit?: number;
}

/**
 * 입주기업 목록 조회 필터 파라미터
 *
 * GET /api/bi-centers/{center_id}/companies 엔드포인트에 전달되는 쿼리 파라미터입니다.
 */
export interface BICompanyFilterParams {
  /** 센터 ID (특정 센터의 입주기업만 조회) */
  center_id?: number;

  /** 사업 분야 필터 (예: 'IT', '바이오', '제조') */
  business_field?: string;

  /** 입주 상태 필터 (예: 'active': 입주중, 'graduated': 졸업) */
  status?: string;

  /** 지역 필터 (해당 지역 센터의 입주기업 조회) */
  region?: string;

  /** 페이지 번호 (기본값: 0) */
  skip?: number;

  /** 페이지당 항목 수 (기본값: 50) */
  limit?: number;
}

/**
 * 입주기업 목록 응답 인터페이스
 */
export interface BICompanyListResponse {
  /** 입주기업 목록 */
  items: BICompany[];

  /** 전체 기업 개수 */
  total: number;
}

/**
 * 창업보육센터 API 엔드포인트 클래스
 *
 * axios 인스턴스를 주입받아 창업보육센터 관련 모든 API 요청을 처리합니다.
 * 각 메서드는 타입 안전성을 보장하며 에러 핸들링이 포함되어 있습니다.
 */
export class BICentersAPI {
  private client: AxiosInstance;

  /**
   * BICentersAPI 생성자
   *
   * @param client - axios 인스턴스
   */
  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * 창업보육센터 목록 조회
   *
   * 페이지네이션, 필터링 기능을 지원합니다.
   *
   * @param params - 필터 파라미터 (선택적)
   * @returns 보육센터 목록과 전체 개수
   *
   * @example
   * ```typescript
   * // 전주 지역 보육센터 조회
   * const result = await biCentersAPI.getList({ region: '전주시', limit: 10 });
   *
   * // 공실이 있는 센터만 조회
   * const vacantCenters = await biCentersAPI.getList({ has_vacancy: true });
   *
   * // 바이오 특화 센터 조회
   * const bioCenters = await biCentersAPI.getList({ specialization: '바이오' });
   * ```
   */
  async getList(params?: BICenterFilterParams): Promise<BICenterListResponse> {
    const response = await this.client.get<BICenterListResponse>('/api/bi-centers/list', {
      params
    });
    return response.data;
  }

  /**
   * 단일 창업보육센터 상세 조회
   *
   * 센터 ID를 사용하여 해당 센터의 전체 정보를 가져옵니다.
   *
   * @param id - 센터 ID
   * @returns 센터 상세 정보
   * @throws {APIError} 센터를 찾을 수 없는 경우 404 에러
   *
   * @example
   * ```typescript
   * const center = await biCentersAPI.getById(123);
   * console.log(center.center_name, center.location);
   * ```
   */
  async getById(id: number): Promise<BICenter> {
    const response = await this.client.get<BICenter>(`/api/bi-centers/${id}`);
    return response.data;
  }

  /**
   * 공실이 있는 보육센터 조회
   *
   * 현재 공실이 있는 센터만 필터링하여 조회합니다.
   * 입주를 희망하는 창업자에게 유용한 정보입니다.
   *
   * @param limit - 조회할 센터 수 (기본값: 10)
   * @returns 공실이 있는 보육센터 목록
   *
   * @example
   * ```typescript
   * // 공실이 있는 센터 5개 조회
   * const vacantCenters = await biCentersAPI.getVacancies(5);
   * ```
   */
  async getVacancies(limit: number = 10): Promise<BICenterListResponse> {
    return this.getList({
      has_vacancy: true,
      limit
    });
  }

  /**
   * 지역별 보육센터 조회
   *
   * 특정 지역의 보육센터만 필터링하여 조회합니다.
   *
   * @param region - 지역 (예: '전주시', '군산시', '익산시', '정읍시', '남원시', '김제시')
   * @param additionalParams - 추가 필터 파라미터
   * @returns 지역별 보육센터 목록
   *
   * @example
   * ```typescript
   * // 전주 지역 센터 전체
   * const jeonjuCenters = await biCentersAPI.getByRegion('전주시');
   *
   * // 군산 지역 바이오 특화 센터
   * const gunsanBio = await biCentersAPI.getByRegion('군산시', { specialization: '바이오' });
   * ```
   */
  async getByRegion(
    region: string,
    additionalParams?: Omit<BICenterFilterParams, 'region'>
  ): Promise<BICenterListResponse> {
    return this.getList({ ...additionalParams, region });
  }

  /**
   * 특정 센터의 입주기업 목록 조회
   *
   * 센터 ID를 사용하여 해당 센터의 입주기업 전체를 조회합니다.
   *
   * @param centerId - 센터 ID
   * @param params - 추가 필터 파라미터
   * @returns 입주기업 목록
   *
   * @example
   * ```typescript
   * // 특정 센터의 입주기업 전체
   * const companies = await biCentersAPI.getCompaniesByCenter(123);
   *
   * // 특정 센터의 바이오 분야 기업
   * const bioCompanies = await biCentersAPI.getCompaniesByCenter(123, { business_field: '바이오' });
   * ```
   */
  async getCompaniesByCenter(
    centerId: number,
    params?: Omit<BICompanyFilterParams, 'center_id'>
  ): Promise<BICompanyListResponse> {
    const response = await this.client.get<BICompanyListResponse>(
      `/api/bi-centers/${centerId}/companies`,
      { params }
    );
    return response.data;
  }

  /**
   * 전체 입주기업 목록 조회
   *
   * 모든 보육센터의 입주기업을 조회합니다.
   * 사업 분야, 지역 등으로 필터링 가능합니다.
   *
   * @param params - 필터 파라미터
   * @returns 입주기업 목록
   *
   * @example
   * ```typescript
   * // 전체 입주기업 조회
   * const allCompanies = await biCentersAPI.getAllCompanies();
   *
   * // 바이오 분야 입주기업만 조회
   * const bioCompanies = await biCentersAPI.getAllCompanies({ business_field: '바이오' });
   *
   * // 전주 지역 입주기업 조회
   * const jeonjuCompanies = await biCentersAPI.getAllCompanies({ region: '전주시' });
   * ```
   */
  async getAllCompanies(params?: BICompanyFilterParams): Promise<BICompanyListResponse> {
    const response = await this.client.get<BICompanyListResponse>('/api/bi-centers/companies/all', {
      params
    });
    return response.data;
  }

  /**
   * 사업 분야별 입주기업 조회
   *
   * 특정 사업 분야의 입주기업만 필터링하여 조회합니다.
   *
   * @param businessField - 사업 분야 (예: 'IT', '바이오', '제조')
   * @param additionalParams - 추가 필터 파라미터
   * @returns 사업 분야별 입주기업 목록
   *
   * @example
   * ```typescript
   * // IT 분야 입주기업 전체
   * const itCompanies = await biCentersAPI.getCompaniesByField('IT');
   *
   * // 바이오 분야 중 active 상태 기업
   * const activeBio = await biCentersAPI.getCompaniesByField('바이오', { status: 'active' });
   * ```
   */
  async getCompaniesByField(
    businessField: string,
    additionalParams?: Omit<BICompanyFilterParams, 'business_field'>
  ): Promise<BICompanyListResponse> {
    return this.getAllCompanies({ ...additionalParams, business_field: businessField });
  }

  /**
   * 센터 통계 정보 조회
   *
   * 전체 센터의 통계 정보를 조회합니다.
   * (총 센터 수, 총 입주기업 수, 공실 현황 등)
   *
   * @returns 센터 통계 정보
   *
   * @example
   * ```typescript
   * const stats = await biCentersAPI.getStatistics();
   * console.log(`총 센터 수: ${stats.total_centers}개`);
   * console.log(`총 입주기업: ${stats.total_companies}개`);
   * ```
   */
  async getStatistics(): Promise<{
    total_centers: number;
    total_companies: number;
    vacant_centers: number;
    by_region: Record<string, number>;
    by_specialization: Record<string, number>;
  }> {
    const response = await this.client.get('/api/bi-centers/statistics');
    return response.data;
  }
}

/**
 * 창업보육센터 API 인스턴스 생성 헬퍼 함수
 *
 * axios 클라이언트를 주입받아 BICentersAPI 인스턴스를 생성합니다.
 *
 * @param client - axios 인스턴스
 * @returns BICentersAPI 인스턴스
 *
 * @example
 * ```typescript
 * import axios from 'axios';
 * import { createBICentersAPI } from '@/lib/api/endpoints/bi-centers';
 *
 * const client = axios.create({ baseURL: 'http://localhost:8000' });
 * const biCentersAPI = createBICentersAPI(client);
 * ```
 */
export function createBICentersAPI(client: AxiosInstance): BICentersAPI {
  return new BICentersAPI(client);
}
