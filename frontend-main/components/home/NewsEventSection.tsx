/**
 * 📰 NEWS & EVENT 섹션 컴포넌트
 *
 * 메인 페이지의 뉴스 & 이벤트 섹션
 * - 최신 뉴스/이벤트 6개 표시
 * - 3열 그리드 레이아웃 (반응형: 3→2→1)
 * - 카드 형태의 이미지 + 제목 + 요약 레이아웃
 *
 * Figma 디자인 기반으로 구현
 *
 * @example
 * <NewsEventSection />
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { useLatestNotices } from '@/hooks/useNotices';
import { formatDate } from '@/lib/utils/date';

export const NewsEventSection: React.FC = () => {
  /**
   * 최신 뉴스형 공고 조회
   * - 'business' 카테고리를 뉴스로 활용
   * - 최신 6개 항목
   */
  const { notices, loading, error } = useLatestNotices(6);

  return (
    <section className="py-16 bg-white">
      <Container>
        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              NEWS & EVENT
            </h2>
            <p className="text-gray-600">
              전북 바이오 산업의 최신 소식을 확인하세요
            </p>
          </div>

          {/* 더보기 링크 */}
          <Link
            href="/news-events/news"
            className="text-primary-blue hover:text-primary-cyan font-medium flex items-center gap-2 transition-colors"
          >
            더보기
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

        {/* 뉴스 목록 */}
        {loading ? (
          // 로딩 스켈레톤
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} variant="tall" />
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
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-cyan transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : notices.length === 0 ? (
          // 뉴스 없음
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
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              최신 뉴스가 없습니다.
            </p>
          </div>
        ) : (
          // 뉴스 카드 그리드
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/sample-board/${notice.id}`}
                className="block group"
              >
                <article className="bg-white rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-shadow h-full flex flex-col">
                  {/* 이미지 영역 (플레이스홀더) */}
                  <div className="aspect-video bg-gradient-to-br from-primary-blue/20 to-primary-cyan/20 relative overflow-hidden">
                    {/* 배경 패턴 */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <pattern id="news-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="10" cy="10" r="1.5" fill="currentColor" className="text-primary-blue" />
                          </pattern>
                        </defs>
                        <rect x="0" y="0" width="100" height="100" fill="url(#news-pattern)" />
                      </svg>
                    </div>

                    {/* 아이콘 */}
                    <div className="absolute inset-0 flex items-center justify-center">
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

                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-primary-blue/0 group-hover:bg-primary-blue/10 transition-colors" />
                  </div>

                  {/* 콘텐츠 영역 */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* 날짜 */}
                    <time className="text-sm text-gray-500 mb-2">
                      {formatDate(notice.published_at || notice.created_at)}
                    </time>

                    {/* 제목 */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-blue transition-colors">
                      {notice.title}
                    </h3>

                    {/* 요약 (content에서 추출) */}
                    {notice.content && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                        {notice.content.replace(/<[^>]*>/g, '').substring(0, 120)}
                        {notice.content.length > 120 ? '...' : ''}
                      </p>
                    )}

                    {/* 푸터 */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        {notice.organization || 'JB SQUARE'}
                      </span>

                      <span className="text-primary-blue text-sm font-medium flex items-center group-hover:gap-2 transition-all">
                        자세히 보기
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
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
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

export default NewsEventSection;
