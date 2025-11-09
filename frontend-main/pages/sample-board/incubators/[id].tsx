/**
 * 🏢 창업보육센터 상세 페이지
 *
 * 특정 창업보육센터의 상세 정보와 입주기업 목록을 표시합니다.
 * 센터 정보, 공실 현황, 입주기업 리스트를 카드 형태로 보여줍니다.
 *
 * URL: /sample-board/incubators/[id]
 * 예: /sample-board/incubators/32
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BICenter, BICompany, BICompanyListResponse } from '@/lib/api/types';
import api from '@/lib/api/client';

export default function IncubatorDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [center, setCenter] = useState<BICenter | null>(null);
  const [companies, setCompanies] = useState<BICompany[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCompanies, setTotalCompanies] = useState<number>(0);

  /**
   * 센터 상세 정보 및 입주기업 목록 로딩
   */
  const fetchCenterDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // 센터 정보와 입주기업 목록을 동시에 가져오기
      const response = await api.client.get<BICompanyListResponse>(
        `/api/bi-centers/${id}/companies`,
        {
          params: {
            limit: 100,
            skip: 0
          }
        }
      );

      setCenter(response.data.center || null);
      setCompanies(response.data.items);
      setTotalCompanies(response.data.total);
    } catch (err: any) {
      console.error('Failed to fetch center detail:', err);
      if (err.response?.status === 404) {
        setError('센터 정보를 찾을 수 없습니다.');
      } else {
        setError('센터 정보를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenterDetail();
  }, [id]);

  /**
   * 로딩 중 UI
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">센터 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * 에러 발생 시 UI
   */
  if (error || !center) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/sample-board/incubators"
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← 창업보육센터 목록으로 돌아가기
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h3>
            <p className="text-red-600 mb-4">{error || '센터 정보를 찾을 수 없습니다.'}</p>
            <button
              onClick={fetchCenterDetail}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{center.center_name} - 창업보육센터 - JB SQUARE</title>
        <meta name="description" content={`${center.center_name} 상세 정보 및 입주기업 현황`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* ========== 헤더 ========== */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/sample-board/incubators"
              className="text-sm text-blue-600 hover:text-blue-800 mb-3 inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              창업보육센터 목록으로 돌아가기
            </Link>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {center.center_name}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {center.org_name}
                </p>

                {/* 센터 기본 정보 */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">{center.region}{center.city ? ` ${center.city}` : ''}</span>
                  </div>

                  {center.specialization && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>특화분야: <span className="font-medium">{center.specialization}</span></span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>입주기업: <span className="font-medium">{totalCompanies}개</span></span>
                  </div>
                </div>
              </div>

              {/* 공실 정보 배지 */}
              {center.vacant_rooms && center.vacant_rooms !== '0' && (
                <div className="ml-6 flex-shrink-0">
                  <div className="px-6 py-4 bg-green-50 border-2 border-green-200 rounded-xl text-center">
                    <div className="text-xs text-green-600 font-semibold mb-1 uppercase tracking-wide">공실 있음</div>
                    <div className="text-3xl font-bold text-green-700">
                      {center.vacant_rooms}
                    </div>
                    <div className="text-xs text-green-600 mt-1">실</div>
                  </div>
                </div>
              )}
            </div>

            {/* 연락처 및 위치 정보 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {center.contact && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">연락처</div>
                      <div className="text-sm text-gray-700 font-medium">{center.contact}</div>
                    </div>
                  </div>
                )}

                {center.location && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">위치</div>
                      <div className="text-sm text-gray-700 font-medium">{center.location}</div>
                    </div>
                  </div>
                )}

                {center.center_url && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">웹사이트</div>
                      <a
                        href={center.center_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        {center.center_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ========== 입주기업 목록 ========== */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              입주기업 목록
            </h2>
            <p className="text-sm text-gray-600">
              총 <span className="font-semibold text-gray-900">{totalCompanies}</span>개의 기업이 입주해 있습니다
            </p>
          </div>

          {companies.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">입주기업 정보가 없습니다</h3>
              <p className="text-gray-500">아직 등록된 입주기업 정보가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  {/* 기업명 */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                      {company.business_field || company.company_name}
                    </h3>
                    {company.business_field && company.company_name !== company.business_field && (
                      <p className="text-sm text-gray-500">
                        {company.company_name}
                      </p>
                    )}
                  </div>

                  {/* 사업 분야 */}
                  {company.product && (
                    <div className="mb-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">사업분야</div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {company.product}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
