/**
 * 📄 페이지네이션 컴포넌트
 *
 * 공고 목록의 페이지 탐색을 제공하는 컴포넌트입니다.
 * useNotices 훅의 pagination과 setPage와 함께 사용합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { Pagination } from '@/components/sample-board/Pagination';
 * import { useNotices } from '@/hooks/useNotices';
 *
 * function NoticeList() {
 *   const { notices, pagination, setPage } = useNotices();
 *
 *   return (
 *     <div>
 *       {notices.map(notice => <NoticeCard key={notice.id} notice={notice} />)}
 *       {pagination && (
 *         <Pagination
 *           currentPage={pagination.page}
 *           totalPages={pagination.totalPages}
 *           onPageChange={setPage}
 *         />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';

/**
 * Pagination 컴포넌트 Props 인터페이스
 */
interface PaginationProps {
  /** 현재 페이지 번호 (1부터 시작) */
  currentPage: number;

  /** 전체 페이지 수 */
  totalPages: number;

  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void;

  /** 한 번에 표시할 페이지 번호 개수 (기본값: 5) */
  maxPageButtons?: number;

  /** 이전/다음 버튼 표시 여부 (기본값: true) */
  showPrevNext?: boolean;

  /** 처음/마지막 버튼 표시 여부 (기본값: true) */
  showFirstLast?: boolean;

  /** 페이지 정보 표시 여부 (기본값: true) */
  showPageInfo?: boolean;

  /** 버튼 크기 (기본값: 'medium') */
  size?: 'small' | 'medium' | 'large';

  /** 커스텀 CSS 클래스 */
  className?: string;
}

/**
 * 페이지네이션 컴포넌트
 *
 * @param props - PaginationProps
 * @returns 페이지네이션 JSX
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPageButtons = 5,
  showPrevNext = true,
  showFirstLast = true,
  showPageInfo = true,
  size = 'medium',
  className = ''
}) => {
  /**
   * 페이지가 1개 이하면 페이지네이션을 표시하지 않음
   */
  if (totalPages <= 1) {
    return null;
  }

  /**
   * 표시할 페이지 번호 범위 계산
   *
   * 현재 페이지를 중심으로 maxPageButtons 개의 페이지 번호를 표시합니다.
   * 예: 현재 페이지가 5이고 maxPageButtons가 5이면 [3, 4, 5, 6, 7]을 표시
   */
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const halfMax = Math.floor(maxPageButtons / 2);

    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, currentPage + halfMax);

    // 시작 부분에서 페이지 수가 부족하면 끝에서 더 가져옴
    if (currentPage - halfMax < 1) {
      endPage = Math.min(totalPages, endPage + (halfMax - currentPage + 1));
    }

    // 끝 부분에서 페이지 수가 부족하면 시작에서 더 가져옴
    if (currentPage + halfMax > totalPages) {
      startPage = Math.max(1, startPage - (currentPage + halfMax - totalPages));
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  /**
   * 페이지 버튼 클릭 핸들러
   */
  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    onPageChange(page);
  };

  /**
   * 이전 페이지로 이동
   */
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  /**
   * 다음 페이지로 이동
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  /**
   * 첫 페이지로 이동
   */
  const handleFirstPage = () => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  /**
   * 마지막 페이지로 이동
   */
  const handleLastPage = () => {
    if (currentPage !== totalPages) {
      onPageChange(totalPages);
    }
  };

  /**
   * 크기별 스타일 맵핑
   */
  const sizeStyles = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  const buttonSize = sizeStyles[size];

  /**
   * 버튼 공통 스타일
   */
  const buttonBaseClass = `
    ${buttonSize} border rounded-lg transition-all font-medium
  `;

  /**
   * 활성 버튼 스타일
   */
  const activeButtonClass = `
    ${buttonBaseClass} bg-blue-600 text-white border-blue-600
  `;

  /**
   * 비활성 버튼 스타일
   */
  const inactiveButtonClass = `
    ${buttonBaseClass} bg-white text-gray-700 border-gray-300 hover:bg-gray-100
  `;

  /**
   * 비활성화된 버튼 스타일
   */
  const disabledButtonClass = `
    ${buttonBaseClass} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed
  `;

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* 페이지 정보 */}
      {showPageInfo && (
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-blue-600">{currentPage}</span>
          <span className="mx-1">/</span>
          <span>{totalPages}</span>
          <span className="ml-1">페이지</span>
        </div>
      )}

      {/* 페이지네이션 버튼 */}
      <div className="flex items-center gap-1">
        {/* 처음 버튼 */}
        {showFirstLast && (
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className={currentPage === 1 ? disabledButtonClass : inactiveButtonClass}
            aria-label="첫 페이지"
          >
            &lt;&lt;
          </button>
        )}

        {/* 이전 버튼 */}
        {showPrevNext && (
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={currentPage === 1 ? disabledButtonClass : inactiveButtonClass}
            aria-label="이전 페이지"
          >
            &lt;
          </button>
        )}

        {/* 페이지 번호 버튼 */}
        {pageNumbers.map(pageNum => (
          <button
            key={pageNum}
            onClick={() => handlePageClick(pageNum)}
            className={pageNum === currentPage ? activeButtonClass : inactiveButtonClass}
            aria-label={`${pageNum} 페이지`}
            aria-current={pageNum === currentPage ? 'page' : undefined}
          >
            {pageNum}
          </button>
        ))}

        {/* 다음 버튼 */}
        {showPrevNext && (
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={currentPage === totalPages ? disabledButtonClass : inactiveButtonClass}
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        )}

        {/* 마지막 버튼 */}
        {showFirstLast && (
          <button
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            className={currentPage === totalPages ? disabledButtonClass : inactiveButtonClass}
            aria-label="마지막 페이지"
          >
            &gt;&gt;
          </button>
        )}
      </div>

      {/* 모바일용 간단한 페이지네이션 */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`
            flex-1 px-4 py-2 text-sm font-medium rounded-lg
            ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }
          `}
        >
          이전
        </button>

        <div className="px-4 py-2 text-sm text-gray-600">
          {currentPage} / {totalPages}
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`
            flex-1 px-4 py-2 text-sm font-medium rounded-lg
            ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }
          `}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default Pagination;
