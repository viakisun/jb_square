/**
 * 📢 공고 관리 API 엔드포인트
 *
 * 이 파일은 공고 관련 모든 API 요청을 처리하는 함수들을 제공합니다.
 * 백엔드의 /api/notices 라우터와 직접 연동됩니다.
 *
 * 사용 예시:
 * ```typescript
 * import { getNotices, getNoticeById } from '@/lib/api/endpoints/notices';
 *
 * // 공고 목록 조회
 * const { items, total } = await getNotices({ category: 'government', page: 1 });
 *
 * // 단일 공고 상세
 * const notice = await getNoticeById(123);
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import { AxiosInstance } from 'axios';
import {
  Notice,
  NoticeFilterParams,
  PaginatedResponse,
  LatestNoticesParams
} from '../types';

/**
 * 공고 API 엔드포인트 클래스
 *
 * axios 인스턴스를 주입받아 공고 관련 모든 API 요청을 처리합니다.
 * 각 메서드는 타입 안전성을 보장하며 에러 핸들링이 포함되어 있습니다.
 */
export class NoticesAPI {
  private client: AxiosInstance;

  /**
   * NoticesAPI 생성자
   *
   * @param client - axios 인스턴스
   */
  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * 공고 목록 조회
   *
   * 페이지네이션, 필터링, 검색, 정렬 기능을 지원합니다.
   *
   * @param params - 필터 파라미터 (선택적)
   * @returns 공고 목록과 페이지네이션 정보
   *
   * @example
   * ```typescript
   * // 정부 공고 1페이지 조회
   * const result = await noticesAPI.getList({ category: 'government', page: 1 });
   *
   * // 검색어로 조회
   * const result = await noticesAPI.getList({ search: '바이오', limit: 10 });
   *
   * // 마감일 기준 정렬
   * const result = await noticesAPI.getList({ sort_by: 'deadline', sort_order: 'asc' });
   * ```
   */
  async getList(params?: NoticeFilterParams): Promise<PaginatedResponse<Notice>> {
    const response = await this.client.get<PaginatedResponse<Notice>>('/api/notices', {
      params
    });
    return response.data;
  }

  /**
   * 단일 공고 상세 조회
   *
   * 공고 ID를 사용하여 해당 공고의 전체 정보를 가져옵니다.
   *
   * @param id - 공고 ID
   * @returns 공고 상세 정보
   * @throws {APIError} 공고를 찾을 수 없는 경우 404 에러
   *
   * @example
   * ```typescript
   * const notice = await noticesAPI.getById(123);
   * console.log(notice.title, notice.content);
   * ```
   */
  async getById(id: number): Promise<Notice> {
    const response = await this.client.get<Notice>(`/api/notices/${id}`);
    return response.data;
  }

  /**
   * 최신 공고 목록 조회
   *
   * 최근 게시된 공고를 조회합니다.
   * 홈페이지 메인 화면이나 사이드바에 표시할 때 유용합니다.
   *
   * @param params - 조회 파라미터 (limit, category)
   * @returns 최신 공고 목록
   *
   * @example
   * ```typescript
   * // 최신 5개 공고
   * const latest = await noticesAPI.getLatest({ limit: 5 });
   *
   * // 정부 공고 최신 10개
   * const govLatest = await noticesAPI.getLatest({ limit: 10, category: 'government' });
   * ```
   */
  async getLatest(params?: LatestNoticesParams): Promise<Notice[]> {
    const response = await this.client.get<Notice[]>('/api/notices/latest/list', {
      params
    });
    return response.data;
  }

  /**
   * 공고 검색
   *
   * 제목, 내용, 기관명 등에서 키워드를 검색합니다.
   * getList 메서드의 search 파라미터를 사용하는 편의 메서드입니다.
   *
   * @param query - 검색 키워드
   * @param additionalParams - 추가 필터 파라미터
   * @returns 검색 결과 (페이지네이션 포함)
   *
   * @example
   * ```typescript
   * // '바이오' 키워드 검색
   * const results = await noticesAPI.search('바이오');
   *
   * // 특정 카테고리에서 검색
   * const results = await noticesAPI.search('연구개발', { category: 'rnd' });
   * ```
   */
  async search(
    query: string,
    additionalParams?: Omit<NoticeFilterParams, 'search'>
  ): Promise<PaginatedResponse<Notice>> {
    return this.getList({ ...additionalParams, search: query });
  }

  /**
   * 카테고리별 공고 조회
   *
   * 특정 카테고리의 공고만 필터링하여 조회합니다.
   *
   * @param category - 공고 카테고리
   * @param additionalParams - 추가 필터 파라미터
   * @returns 카테고리 공고 목록
   *
   * @example
   * ```typescript
   * // 정부 공고 전체
   * const govNotices = await noticesAPI.getByCategory('government');
   *
   * // R&D 공고 2페이지
   * const rndNotices = await noticesAPI.getByCategory('rnd', { page: 2 });
   * ```
   */
  async getByCategory(
    category: 'government' | 'business' | 'rnd' | 'startup',
    additionalParams?: Omit<NoticeFilterParams, 'category'>
  ): Promise<PaginatedResponse<Notice>> {
    return this.getList({ ...additionalParams, category });
  }

  /**
   * 태그별 공고 조회
   *
   * 특정 태그가 포함된 공고를 조회합니다.
   *
   * @param tags - 태그 이름 (여러 개인 경우 콤마로 구분)
   * @param additionalParams - 추가 필터 파라미터
   * @returns 태그 필터링된 공고 목록
   *
   * @example
   * ```typescript
   * // '바이오' 태그 공고
   * const bioNotices = await noticesAPI.getByTags('바이오');
   *
   * // 여러 태그로 필터링
   * const notices = await noticesAPI.getByTags('바이오,제조업');
   * ```
   */
  async getByTags(
    tags: string,
    additionalParams?: Omit<NoticeFilterParams, 'tags'>
  ): Promise<PaginatedResponse<Notice>> {
    return this.getList({ ...additionalParams, tags });
  }

  /**
   * 마감 임박 공고 조회
   *
   * 마감일이 가까운 순서대로 공고를 조회합니다.
   *
   * @param limit - 조회할 공고 수
   * @returns 마감 임박 공고 목록
   *
   * @example
   * ```typescript
   * // 마감 임박 10개 공고
   * const urgentNotices = await noticesAPI.getUpcoming(10);
   * ```
   */
  async getUpcoming(limit: number = 10): Promise<PaginatedResponse<Notice>> {
    return this.getList({
      sort_by: 'deadline',
      sort_order: 'asc',
      limit,
      status: 'published'
    });
  }
}

/**
 * 공고 API 인스턴스 생성 헬퍼 함수
 *
 * axios 클라이언트를 주입받아 NoticesAPI 인스턴스를 생성합니다.
 *
 * @param client - axios 인스턴스
 * @returns NoticesAPI 인스턴스
 *
 * @example
 * ```typescript
 * import axios from 'axios';
 * import { createNoticesAPI } from '@/lib/api/endpoints/notices';
 *
 * const client = axios.create({ baseURL: 'http://localhost:8000' });
 * const noticesAPI = createNoticesAPI(client);
 * ```
 */
export function createNoticesAPI(client: AxiosInstance): NoticesAPI {
  return new NoticesAPI(client);
}
