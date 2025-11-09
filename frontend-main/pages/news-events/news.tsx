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

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';
import { useLatestNotices } from '@/hooks/useNotices';
import { LoadingSkeletons, ErrorMessage, EmptyState } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils/date';

const NewsPage: React.FC = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '뉴스/행사', href: '/news-events' },
    { label: '최신뉴스' },
  ];

  /**
   * useLatestNotices 훅으로 최신 뉴스 관리
   * - 로딩/에러 상태 자동 처리
   * - 최신순 정렬 자동 적용
   */
  const { notices, loading, error, refetch } = useLatestNotices(20);

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
          {/* 로딩 상태 - 재사용 가능한 스켈레톤 컴포넌트 */}
          {loading && <LoadingSkeletons count={6} type="card" />}

          {/* 에러 상태 - 재사용 가능한 에러 메시지 컴포넌트 (재시도 버튼 포함) */}
          {error && (
            <ErrorMessage
              message={error}
              title="뉴스 로딩 실패"
              onRetry={refetch}
              retryLabel="다시 시도"
            />
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

                        {/* 메타 정보 - 상대 시간 표시 (재사용 가능한 유틸리티 함수) */}
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
                          <span>{formatRelativeTime(news.created_at)}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* 데이터 없음 - 재사용 가능한 빈 상태 컴포넌트 */}
              {notices.length === 0 && (
                <EmptyState
                  icon="document"
                  message="등록된 뉴스가 없습니다."
                  description="아직 등록된 뉴스가 없습니다. 나중에 다시 확인해주세요."
                />
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
