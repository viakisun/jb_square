/**
 * 📰 최신 뉴스 페이지
 *
 * 전북 바이오 산업 관련 최신 뉴스 목록
 * - 뉴스 검색 및 필터링
 * - 카테고리별 분류
 * - 뉴스 카드 목록
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import api from '@/lib/api/client';
import type { Notice } from '@/lib/api/types';

const NewsPage: React.FC = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '뉴스/행사', href: '/news-events' },
    { label: '최신뉴스' },
  ];

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.client.get<{ items: Notice[]; total: number }>('/api/notices/latest/list', {
          params: { limit: 20 }
        });
        setNotices(response.data.items);
      } catch (err) {
        setError('뉴스를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* 페이지 헤더 */}
      <section className="bg-gradient-to-r from-primary-blue to-primary-cyan py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            최신 뉴스
          </h1>
          <p className="text-xl text-white/90">
            전북 바이오 산업의 최신 소식을 확인하세요
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* 로딩 상태 */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
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
              <p className="text-gray-600">뉴스를 불러오는데 실패했습니다.</p>
            </div>
          )}

          {/* 뉴스 목록 */}
          {!loading && !error && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {notices.map((news) => (
                  <Link
                    key={news.id}
                    href={`/sample-board/${news.id}`}
                    className="group block"
                  >
                    <article className="bg-white rounded-xl shadow-sm hover:shadow-card transition-all border border-gray-100 hover:border-primary-blue overflow-hidden h-full flex flex-col">
                      {/* 이미지 영역 (플레이스홀더) */}
                      <div className="relative h-48 bg-gradient-to-br from-primary-blue/10 to-primary-cyan/10 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-primary-blue/30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      </div>

                      {/* 콘텐츠 영역 */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-blue transition-colors line-clamp-2">
                          {news.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                          {news.content || '내용 없음'}
                        </p>

                        {/* 메타 정보 */}
                        <div className="flex items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            {news.created_at
                              ? formatDistanceToNow(new Date(news.created_at), {
                                  addSuffix: true,
                                  locale: ko,
                                })
                              : '날짜 정보 없음'}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* 데이터 없음 */}
              {notices.length === 0 && (
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600">등록된 뉴스가 없습니다.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsPage;
