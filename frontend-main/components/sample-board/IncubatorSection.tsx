/**
 * 🏢 창업보육센터 섹션 컴포넌트
 *
 * 창업보육센터(BI Center) 현황을 표시하는 섹션입니다.
 * 메인 페이지에서 공실이 있는 센터를 요약하여 보여주고,
 * "더보기" 버튼을 통해 전체 센터 목록 페이지로 이동할 수 있습니다.
 *
 * 사용 예시:
 * ```typescript
 * <IncubatorSection
 *   title="창업보육센터"
 *   description="전북 지역 창업보육센터 공실 현황"
 *   viewAllLink="/sample-board/incubators"
 * />
 * ```
 *
 * 초보자를 위한 설명:
 * - 이 컴포넌트는 창업보육센터 데이터를 보여줍니다
 * - 특히 '공실이 있는' 센터를 우선적으로 표시합니다
 * - API를 통해 자동으로 데이터를 불러오므로, 사용하는 곳에서는 제목과 링크만 전달하면 됩니다
 * - 로딩 상태와 에러 상태를 자동으로 처리합니다
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BICenter, BICenterListResponse } from '@/lib/api/types';
import api from '@/lib/api/client';

/**
 * IncubatorSection 컴포넌트 Props 인터페이스
 */
interface IncubatorSectionProps {
  /** 섹션 제목 (예: "창업보육센터") */
  title: string;

  /** 섹션 설명 (예: "전북 지역 창업보육센터 공실 현황") */
  description?: string;

  /** "더보기" 버튼 클릭 시 이동할 링크 */
  viewAllLink: string;

  /** 표시할 센터 개수 (기본값: 5) */
  limit?: number;

  /** 공실 있는 센터만 표시 여부 (기본값: true) */
  onlyVacant?: boolean;

  /** 커스텀 스타일 클래스 */
  className?: string;
}

/**
 * 창업보육센터 섹션 컴포넌트
 *
 * 작동 방식:
 * 1. 컴포넌트가 마운트되면 useEffect를 통해 API 호출
 * 2. has_vacancy=true 파라미터를 사용하여 공실이 있는 센터만 필터링
 * 3. limit 개수만큼의 센터를 가져와서 카드 형태로 표시
 * 4. "더보기" 버튼을 통해 전체 목록으로 이동 가능
 *
 * @param props - IncubatorSectionProps
 * @returns 창업보육센터 섹션 JSX
 */
export const IncubatorSection: React.FC<IncubatorSectionProps> = ({
  title,
  description,
  viewAllLink,
  limit = 5,
  onlyVacant = true,
  className = ''
}) => {
  // ==================== 상태 관리 ====================

  /**
   * BI 센터 목록 상태
   * 초기값: 빈 배열
   * API 호출 성공 시 BICenter 객체 배열로 업데이트됩니다
   */
  const [centers, setCenters] = useState<BICenter[]>([]);

  /**
   * 로딩 상태
   * true: 데이터를 불러오는 중
   * false: 로딩 완료 (성공/실패 무관)
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * 에러 상태
   * null: 에러 없음
   * string: 에러 메시지
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * 전체 센터 개수
   * API 응답의 total 값을 저장
   * "더보기" 버튼에 전체 개수를 표시하는 데 사용
   */
  const [totalCount, setTotalCount] = useState<number>(0);

  // ==================== 데이터 로딩 ====================

  /**
   * BI 센터 데이터 로딩 함수
   *
   * 실행 순서:
   * 1. 로딩 상태를 true로 설정
   * 2. API 호출 (/api/bi-centers/list)
   * 3. 성공 시: centers와 totalCount 업데이트
   * 4. 실패 시: error 메시지 설정
   * 5. 최종: 로딩 상태를 false로 설정
   */
  const fetchCenters = async () => {
    try {
      // Step 1: 로딩 시작
      setLoading(true);
      setError(null);

      // Step 2: API 호출
      // api.client.get을 사용하여 /api/bi-centers/list 엔드포인트 호출
      const response = await api.client.get<BICenterListResponse>('/api/bi-centers/list', {
        params: {
          has_vacancy: onlyVacant ? true : undefined,  // 공실 있는 센터만 필터링
          limit,                                        // 표시할 개수
          skip: 0                                       // 첫 페이지부터
        }
      });

      // Step 3: 데이터 업데이트
      setCenters(response.data.items);
      setTotalCount(response.data.total);

    } catch (err) {
      // Step 4: 에러 처리
      console.error('Failed to fetch BI centers:', err);
      setError('창업보육센터 정보를 불러오는데 실패했습니다.');
    } finally {
      // Step 5: 로딩 종료
      setLoading(false);
    }
  };

  /**
   * useEffect: 컴포넌트 마운트 시 데이터 로딩
   *
   * 의존성 배열: [limit, onlyVacant]
   * - limit이나 onlyVacant가 변경되면 다시 데이터를 불러옵니다
   */
  useEffect(() => {
    fetchCenters();
  }, [limit, onlyVacant]);

  // ==================== 렌더링 로직 ====================

  /**
   * 로딩 중 UI
   *
   * 사용자 경험 개선:
   * - 데이터를 불러오는 동안 "로딩 중..." 메시지 표시
   * - Skeleton UI를 사용하면 더 나은 UX 제공 가능
   */
  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          {/* 섹션 헤더 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-gray-600 mt-2">{description}</p>
            )}
          </div>

          {/* 로딩 인디케이터 */}
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </section>
    );
  }

  /**
   * 에러 발생 시 UI
   *
   * 에러 처리 전략:
   * - 사용자에게 친절한 에러 메시지 표시
   * - "다시 시도" 버튼을 제공하여 재시도 가능
   */
  if (error) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          {/* 섹션 헤더 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-gray-600 mt-2">{description}</p>
            )}
          </div>

          {/* 에러 메시지와 재시도 버튼 */}
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchCenters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </section>
    );
  }

  /**
   * 데이터가 없는 경우 UI
   *
   * 빈 상태(Empty State) 처리:
   * - 센터가 없을 때 사용자에게 명확하게 안내
   * - 혼란을 방지하고 더 나은 사용자 경험 제공
   */
  if (centers.length === 0) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          {/* 섹션 헤더 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-gray-600 mt-2">{description}</p>
            )}
          </div>

          {/* 빈 상태 메시지 */}
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-500 text-lg">
                {onlyVacant ? '현재 공실이 있는 센터가 없습니다.' : '등록된 센터가 없습니다.'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {onlyVacant ? '입주 공간이 생기면 여기에 표시됩니다.' : '센터 정보가 등록되면 여기에 표시됩니다.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /**
   * 정상 데이터 렌더링
   *
   * 레이아웃 구조:
   * 1. 섹션 헤더 (제목 + 설명)
   * 2. 센터 카드 리스트 (테이블 형태)
   * 3. "더보기" 버튼
   */
  return (
    <section className={`py-8 border-b border-gray-200 last:border-b-0 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* ========== 섹션 헤더 ========== */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {/* 섹션 제목 */}
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

            {/* 섹션 설명 (선택적) */}
            {description && (
              <p className="text-gray-600 mt-2">{description}</p>
            )}
          </div>

          {/* 전체 센터 개수 표시 (우측 상단) */}
          <div className="text-sm text-gray-500">
            {onlyVacant && '공실 있음 '}
            총 <span className="font-semibold text-gray-700">{totalCount}</span>개
          </div>
        </div>

        {/* ========== 센터 카드 리스트 ========== */}
        {/*
          각 센터를 카드 형태로 표시
          - 센터명, 운영기관, 지역, 공실 정보 등을 보여줌
        */}
        <div className="space-y-4 mb-6">
          {centers.map((center) => (
            <div
              key={center.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                {/* 좌측: 센터 정보 */}
                <div className="flex-1">
                  {/* 센터명 */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {center.center_name}
                  </h3>

                  {/* 운영 기관명 */}
                  <p className="text-sm text-gray-600 mb-2">
                    {center.org_name}
                  </p>

                  {/* 하단 정보: 지역, 특화분야 */}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    {/* 지역 정보 */}
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{center.region}{center.city ? ` ${center.city}` : ''}</span>
                    </div>

                    {/* 특화 분야 */}
                    {center.specialization && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>{center.specialization}</span>
                      </div>
                    )}

                    {/* 입주 기업 수 */}
                    {center.companies_count > 0 && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>입주기업 {center.companies_count}개</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 우측: 공실 정보 */}
                {center.vacant_rooms && (
                  <div className="ml-4 flex-shrink-0">
                    <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-xs text-green-600 font-medium mb-1">공실</div>
                      <div className="text-lg font-bold text-green-700">
                        {center.vacant_rooms}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 연락처 정보 (있는 경우) */}
              {center.contact && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  <span className="font-medium">문의:</span> {center.contact}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ========== 더보기 버튼 ========== */}
        {/*
          조건부 렌더링:
          - totalCount > limit인 경우에만 "더보기" 버튼 표시
          - 예: 전체 센터가 10개인데 5개만 표시한 경우
        */}
        {totalCount > limit && (
          <div className="flex justify-center">
            <Link
              href={viewAllLink}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <span>더보기</span>
              {/* 우측 화살표 아이콘 */}
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default IncubatorSection;
