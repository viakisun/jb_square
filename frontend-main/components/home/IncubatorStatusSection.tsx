/**
 * 🏢 창업 보육센터 현황 섹션 컴포넌트 (홈페이지용)
 *
 * 메인 페이지의 창업 보육센터 현황 섹션
 * - 공실 있는 센터 우선 표시
 * - 5개 센터 표시 (간략 정보)
 * - 간결한 리스트 형태 레이아웃
 *
 * Figma 디자인 기반으로 구현
 *
 * @example
 * <IncubatorStatusSection />
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { BICenter, BICenterListResponse } from '@/lib/api/types';
import api from '@/lib/api/client';

export const IncubatorStatusSection: React.FC = () => {
  /**
   * BI 센터 데이터 상태
   */
  const [centers, setCenters] = useState<BICenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  /**
   * BI 센터 데이터 조회
   */
  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.client.get<BICenterListResponse>('/api/bi-centers/list', {
        params: {
          has_vacancy: true,  // 공실 있는 센터만
          limit: 5,           // 5개만 표시
          skip: 0
        }
      });

      setCenters(response.data.items);
      setTotalCount(response.data.total);
    } catch (err) {
      console.error('Failed to fetch BI centers:', err);
      setError('창업보육센터 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 컴포넌트 마운트 시 데이터 로딩
   */
  useEffect(() => {
    fetchCenters();
  }, []);

  return (
    <section className="py-16 bg-white">
      <Container>
        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              창업 보육센터 현황
            </h2>
            <p className="text-gray-600">
              전북 지역 창업보육센터의 입주 가능 공간을 확인하세요
            </p>
          </div>

          {/* 더보기 링크 */}
          <Link
            href="/bio-cluster/incubators"
            className="text-primary-blue hover:text-primary-cyan font-medium flex items-center gap-2 transition-colors"
          >
            전체 보기
            <svg
              className="w-5 h-5"
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

        {/* 센터 목록 */}
        {loading ? (
          // 로딩 상태
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-24 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // 에러 메시지
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchCenters}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-cyan transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : centers.length === 0 ? (
          // 센터 없음
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              현재 입주 가능한 공간이 없습니다.
            </p>
          </div>
        ) : (
          // 센터 리스트
          <div className="space-y-4">
            {centers.map((center) => (
              <Link
                key={center.id}
                href={`/sample-board/incubators/${center.id}`}
                className="block group"
              >
                <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-card hover:border-primary-blue transition-all">
                  <div className="flex items-start justify-between">
                    {/* 센터 정보 */}
                    <div className="flex-1">
                      {/* 센터명 */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-blue transition-colors">
                          {center.center_name}
                        </h3>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-primary-blue transition-colors"
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
                      </div>

                      {/* 운영 기관 */}
                      <p className="text-gray-600 mb-3">{center.org_name}</p>

                      {/* 상세 정보 */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {/* 지역 */}
                        <div className="flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>
                            {center.region}
                            {center.city && ` ${center.city}`}
                          </span>
                        </div>

                        {/* 특화 분야 */}
                        {center.specialization && (
                          <div className="flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            <span>{center.specialization}</span>
                          </div>
                        )}

                        {/* 입주 기업 수 */}
                        {center.companies_count > 0 && (
                          <div className="flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <span className="font-medium">
                              입주기업 {center.companies_count}개
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 공실 정보 배지 */}
                    {center.vacant_rooms && center.vacant_rooms !== '0' && (
                      <div className="ml-6 flex-shrink-0">
                        <div className="px-5 py-3 bg-green-50 border-2 border-green-200 rounded-xl text-center group-hover:bg-green-100 transition-colors">
                          <div className="text-xs text-green-600 font-semibold mb-1">
                            입주 가능
                          </div>
                          <div className="text-2xl font-bold text-green-700">
                            {center.vacant_rooms}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 전체 개수 표시 (하단) */}
        {!loading && !error && totalCount > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            전체 {totalCount}개 센터 중 공실 있는 센터 {centers.length}개 표시
          </div>
        )}
      </Container>
    </section>
  );
};

export default IncubatorStatusSection;
