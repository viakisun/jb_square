/**
 * 🏢 창업보육센터 전체 목록 페이지
 *
 * 전북 지역 창업보육센터의 전체 목록을 보여주는 페이지입니다.
 * 공실 여부, 지역별 필터링 기능을 제공합니다.
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { BICenter, BICenterListResponse } from '@/lib/api/types';
import api from '@/lib/api/client';

export default function IncubatorsPage() {
  const [centers, setCenters] = useState<BICenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [vacancyFilter, setVacancyFilter] = useState<'all' | 'vacant' | 'full'>('all');

  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasVacancy = vacancyFilter === 'all' ? undefined : vacancyFilter === 'vacant';

      const response = await api.client.get<BICenterListResponse>('/api/bi-centers/list', {
        params: {
          has_vacancy: hasVacancy,
          limit: 100,
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

  useEffect(() => {
    fetchCenters();
  }, [vacancyFilter]);

  return (
    <>
      <Head>
        <title>창업보육센터 - JB SQUARE</title>
        <meta name="description" content="전북 지역 창업보육센터 현황" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/sample-board"
                  className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block"
                >
                  ← 공고 게시판으로 돌아가기
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  창업보육센터
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  전북 지역 창업보육센터 입주 공간 현황
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 필터 버튼 */}
          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">필터:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setVacancyFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  vacancyFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setVacancyFilter('vacant')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  vacancyFilter === 'vacant'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                공실 있음
              </button>
              <button
                onClick={() => setVacancyFilter('full')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  vacancyFilter === 'full'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                만실
              </button>
            </div>
            <span className="ml-auto text-sm text-gray-500">
              총 <span className="font-semibold text-gray-700">{totalCount}</span>개
            </span>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">센터 정보를 불러오는 중...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchCenters}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {centers.length === 0 && (
                <div className="py-20 text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {vacancyFilter === 'vacant' ? '공실이 있는 센터가 없습니다' : '등록된 센터가 없습니다'}
                  </h3>
                  <p className="text-gray-500">나중에 다시 확인해주세요</p>
                </div>
              )}

              {centers.length > 0 && (
                <div className="space-y-4">
                  {centers.map((center) => (
                    <div
                      key={center.id}
                      className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {center.center_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {center.org_name}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{center.region}{center.city ? ` ${center.city}` : ''}</span>
                            </div>

                            {center.specialization && (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span>{center.specialization}</span>
                              </div>
                            )}

                            {center.companies_count > 0 && (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>입주기업 {center.companies_count}개</span>
                              </div>
                            )}

                            {center.location && (
                              <div className="flex items-center gap-2 col-span-full">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                <span>{center.location}</span>
                              </div>
                            )}
                          </div>

                          {center.contact && (
                            <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                              <span className="font-medium">문의:</span> {center.contact}
                            </div>
                          )}
                        </div>

                        {center.vacant_rooms && (
                          <div className="ml-6 flex-shrink-0">
                            <div className="px-5 py-3 bg-green-50 border border-green-200 rounded-lg text-center">
                              <div className="text-xs text-green-600 font-medium mb-1">공실</div>
                              <div className="text-2xl font-bold text-green-700">
                                {center.vacant_rooms}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
