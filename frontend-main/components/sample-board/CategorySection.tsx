/**
 * 📂 공고 카테고리 섹션 컴포넌트
 *
 * 특정 카테고리의 공고를 표시하는 섹션입니다.
 * 메인 페이지에서 각 카테고리별로 3개의 공고를 미리보기 형태로 보여주고,
 * "더보기" 버튼을 통해 해당 카테고리의 전체 목록 페이지로 이동할 수 있습니다.
 *
 * 사용 예시:
 * ```typescript
 * <CategorySection
 *   title="정부 공고"
 *   description="정부 부처에서 발표하는 각종 지원 사업 공고"
 *   category="government"
 *   viewAllLink="/sample-board/government"
 * />
 * ```
 *
 * 초보자를 위한 설명:
 * - 이 컴포넌트는 공고를 카테고리별로 그룹화하여 보여줍니다
 * - API를 통해 자동으로 데이터를 불러오므로, 사용하는 곳에서는 카테고리 정보만 전달하면 됩니다
 * - 로딩 상태와 에러 상태를 자동으로 처리합니다
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Notice } from '@/lib/api/types';
import { NoticeCard } from './NoticeCard';
import api from '@/lib/api/client';

/**
 * CategorySection 컴포넌트 Props 인터페이스
 */
interface CategorySectionProps {
  /** 섹션 제목 (예: "정부 공고") */
  title: string;

  /** 섹션 설명 (예: "정부 부처에서 발표하는 각종 지원 사업 공고") */
  description?: string;

  /** 공고 카테고리 (데이터베이스 category 값) */
  category: 'government' | 'local_government' | 'business' | 'rnd' | 'startup';

  /** "더보기" 버튼 클릭 시 이동할 링크 */
  viewAllLink: string;

  /** 표시할 공고 개수 (기본값: 3) */
  limit?: number;

  /** 커스텀 스타일 클래스 */
  className?: string;
}

/**
 * 공고 카테고리 섹션 컴포넌트
 *
 * 작동 방식:
 * 1. 컴포넌트가 마운트되면 useEffect를 통해 API 호출
 * 2. category 파라미터를 사용하여 해당 카테고리의 공고만 필터링
 * 3. limit 개수만큼의 공고를 가져와서 NoticeCard로 표시
 * 4. "더보기" 버튼을 통해 전체 목록으로 이동 가능
 *
 * @param props - CategorySectionProps
 * @returns 카테고리 섹션 JSX
 */
export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  description,
  category,
  viewAllLink,
  limit = 3,
  className = ''
}) => {
  // ==================== 상태 관리 ====================

  /**
   * 공고 목록 상태
   * 초기값: 빈 배열
   * API 호출 성공 시 Notice 객체 배열로 업데이트됩니다
   */
  const [notices, setNotices] = useState<Notice[]>([]);

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
   * 전체 공고 개수
   * API 응답의 total 값을 저장
   * "더보기" 버튼에 전체 개수를 표시하는 데 사용
   */
  const [totalCount, setTotalCount] = useState<number>(0);

  // ==================== 데이터 로딩 ====================

  /**
   * 공고 데이터 로딩 함수
   *
   * 실행 순서:
   * 1. 로딩 상태를 true로 설정
   * 2. API 호출 (category, status, limit 파라미터 전달)
   * 3. 성공 시: notices와 totalCount 업데이트
   * 4. 실패 시: error 메시지 설정
   * 5. 최종: 로딩 상태를 false로 설정
   */
  const fetchNotices = async () => {
    try {
      // Step 1: 로딩 시작
      setLoading(true);
      setError(null);

      // Step 2: API 호출
      // api.notices.getList()는 backend의 /api/notices 엔드포인트를 호출합니다
      const response = await api.notices.getList({
        category,           // 특정 카테고리만 필터링
        status: 'published', // 게시된 공고만 가져오기
        limit,              // 표시할 개수
        skip: 0             // 첫 페이지부터 (offset 대신 skip 사용)
      });

      // Step 3: 데이터 업데이트
      setNotices(response.items);
      setTotalCount(response.total);

    } catch (err) {
      // Step 4: 에러 처리
      console.error(`Failed to fetch notices for category ${category}:`, err);
      setError('공고를 불러오는데 실패했습니다.');
    } finally {
      // Step 5: 로딩 종료
      setLoading(false);
    }
  };

  /**
   * useEffect: 컴포넌트 마운트 시 데이터 로딩
   *
   * 의존성 배열: [category, limit]
   * - category나 limit이 변경되면 다시 데이터를 불러옵니다
   * - 예: 사용자가 다른 카테고리 섹션을 보게 되었을 때
   */
  useEffect(() => {
    fetchNotices();
  }, [category, limit]);

  // ==================== 렌더링 로직 ====================

  /**
   * 로딩 중 UI
   *
   * 사용자 경험 개선:
   * - 데이터를 불러오는 동안 "로딩 중..." 메시지 표시
   * - Skeleton UI나 스피너를 사용하면 더 나은 UX 제공 가능
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
              onClick={fetchNotices}
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
   * - 공고가 없을 때 사용자에게 명확하게 안내
   * - 혼란을 방지하고 더 나은 사용자 경험 제공
   */
  if (notices.length === 0) {
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
              <p className="text-gray-500 text-lg">아직 등록된 공고가 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">새로운 공고가 등록되면 여기에 표시됩니다.</p>
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
   * 2. 공고 카드 그리드 (최대 3개)
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

          {/* 전체 공고 개수 표시 (우측 상단) */}
          <div className="text-sm text-gray-500">
            총 <span className="font-semibold text-gray-700">{totalCount}</span>개
          </div>
        </div>

        {/* ========== 공고 카드 그리드 ========== */}
        {/*
          그리드 레이아웃:
          - 모바일: 1열 (grid-cols-1)
          - 태블릿: 2열 (md:grid-cols-2)
          - 데스크톱: 3열 (lg:grid-cols-3)
          - gap-6: 카드 사이 간격 24px
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              variant="default"
            />
          ))}
        </div>

        {/* ========== 더보기 버튼 ========== */}
        {/*
          조건부 렌더링:
          - totalCount > limit인 경우에만 "더보기" 버튼 표시
          - 예: 전체 공고가 10개인데 3개만 표시한 경우
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

export default CategorySection;
