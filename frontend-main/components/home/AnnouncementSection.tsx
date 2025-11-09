/**
 * 📢 지원사업 공고 섹션 컴포넌트
 *
 * 메인 페이지의 지원사업 공고 섹션
 * - 탭 필터링 (전체, 정부, 민간, 창업, R&D)
 * - 4열 그리드 레이아웃 (반응형: 4→2→1)
 * - 최신 공고 8개 표시
 * - NoticeCard 컴포넌트 재사용
 *
 * Figma 디자인 기반으로 구현
 *
 * @example
 * <AnnouncementSection />
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { NoticeCard } from '@/components/sample-board/NoticeCard';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { useNotices } from '@/hooks/useNotices';
import { Notice } from '@/lib/api/types';

/**
 * 카테고리 탭 정의
 */
const CATEGORY_TABS = [
  { key: 'all', label: '전체', value: undefined },
  { key: 'government', label: '정부', value: 'government' as Notice['category'] },
  { key: 'business', label: '민간', value: 'business' as Notice['category'] },
  { key: 'startup', label: '창업', value: 'startup' as Notice['category'] },
  { key: 'rnd', label: 'R&D', value: 'rnd' as Notice['category'] },
] as const;

export const AnnouncementSection: React.FC = () => {
  /**
   * 현재 선택된 카테고리 탭
   */
  const [activeTab, setActiveTab] = useState<typeof CATEGORY_TABS[number]['key']>('all');

  /**
   * 선택된 탭에 해당하는 카테고리 값
   */
  const activeCategory = CATEGORY_TABS.find(tab => tab.key === activeTab)?.value;

  /**
   * 공고 데이터 조회
   * - 최신 공고 8개
   * - 상태: published (게시됨)
   * - 정렬: 게시일 기준 내림차순
   */
  const { notices, loading, error } = useNotices({
    category: activeCategory,
    status: 'published',
    limit: 8,
    sort_by: 'published_at',
    sort_order: 'desc',
  });

  /**
   * 탭 클릭 핸들러
   */
  const handleTabClick = (tabKey: typeof CATEGORY_TABS[number]['key']) => {
    setActiveTab(tabKey);
  };

  return (
    <section className="py-16 bg-gray-50">
      <Container>
        {/* 섹션 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              지원사업 공고
            </h2>
            <p className="text-gray-600">
              전북 바이오 산업을 위한 다양한 지원사업을 확인하세요
            </p>
          </div>

          {/* 더보기 링크 */}
          <Link
            href="/announcements/all"
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

        {/* 카테고리 탭 */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`
                px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all
                ${
                  activeTab === tab.key
                    ? 'bg-primary-blue text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 공고 목록 */}
        {loading ? (
          // 로딩 스켈레톤
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} variant="default" />
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
          // 공고 없음
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              해당 카테고리의 공고가 없습니다.
            </p>
          </div>
        ) : (
          // 공고 카드 그리드
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                variant="default"
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

export default AnnouncementSection;
