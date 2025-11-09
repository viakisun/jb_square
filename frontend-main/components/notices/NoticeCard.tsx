/**
 * 📢 공고 카드 컴포넌트 (정식 버전)
 *
 * 공고 목록 페이지에서 사용하는 카드 컴포넌트입니다.
 * 사용자가 이미 특정 카테고리 페이지에 있으므로 카테고리 태그는 표시하지 않으며,
 * 마감일 정보를 강조하여 표시합니다.
 *
 * **주요 특징:**
 * - 카테고리 태그 제거 (이미 카테고리별 페이지에서 보고 있음)
 * - 마감일 D-day 강조 표시
 * - 반응형 디자인
 * - 단일 컬럼 레이아웃에 최적화
 *
 * **사용 예시:**
 * ```tsx
 * import { NoticeCard } from '@/components/notices/NoticeCard';
 *
 * <NoticeCard notice={notice} />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React from 'react';
import Link from 'next/link';
import { Notice } from '@/lib/api/types';
import { formatDateSimple, getDeadlineStatus, getDaysUntilDeadline } from '@/lib/utils/date';

/**
 * NoticeCard 컴포넌트 Props 인터페이스
 */
interface NoticeCardProps {
  /** 표시할 공고 데이터 */
  notice: Notice;

  /** 클릭 시 실행될 함수 (선택적) */
  onClick?: (notice: Notice) => void;

  /** 새 탭에서 열기 여부 (기본값: false) */
  openInNewTab?: boolean;
}

/**
 * 공고 카드 컴포넌트
 *
 * @param props - NoticeCardProps
 * @returns 공고 카드 JSX
 */
export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onClick,
  openInNewTab = false
}) => {
  /**
   * 카드 클릭 핸들러
   */
  const handleClick = () => {
    if (onClick) {
      onClick(notice);
    }
  };

  /**
   * 마감일까지 남은 일수
   */
  const daysLeft = getDaysUntilDeadline(notice.deadline);

  /**
   * 마감 상태 표시 (D-day, 오늘 마감, 마감 등)
   */
  const deadlineStatus = getDeadlineStatus(notice.deadline);

  /**
   * 마감 임박 여부 (7일 이내)
   */
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

  /**
   * 마감된 공고 여부
   */
  const isExpired = daysLeft !== null && daysLeft < 0;

  /**
   * 접수 중 여부 판단
   * - 마감일이 없으면 일단 접수중으로 표시
   * - 마감일이 지나지 않았으면 접수중
   */
  const isOpen = !isExpired;

  /**
   * 공고 상세 페이지 URL
   * notice-detail 페이지로 이동 (카테고리별로 분리하지 않음)
   */
  const detailUrl = `/notices/${notice.id}`;

  /**
   * 공고일 표시 (announcement_date 우선, 없으면 published_at)
   */
  const announcementDate = notice.announcement_date || notice.published_at;

  return (
    <Link
      href={detailUrl}
      target={openInNewTab ? '_blank' : undefined}
      className="block"
    >
      <div
        onClick={handleClick}
        className={`
          relative p-4 border rounded-lg hover:shadow-lg transition-all cursor-pointer
          ${isExpired ? 'bg-gray-50 opacity-70 border-gray-300' : 'bg-white border-gray-200'}
        `}
      >
        {/* ============================================
            1. 상단: D-day 배지 + 공고일 + 마감일 (한 줄)
            ============================================ */}
        <div className="flex items-center gap-3 mb-3 text-sm">
          {/* D-day 배지 또는 상시공고 배지 */}
          {notice.deadline ? (
            <span
              className={`
                inline-flex items-center justify-center
                px-3 py-1 rounded-md text-xs font-bold
                ${isExpired ? 'bg-gray-500 text-white' : ''}
                ${isUrgent && !isExpired ? 'bg-red-500 text-white' : ''}
                ${!isUrgent && !isExpired ? 'bg-blue-500 text-white' : ''}
              `}
            >
              {deadlineStatus}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-bold bg-green-500 text-white">
              상시공고
            </span>
          )}

          {/* 공고일 */}
          {announcementDate && (
            <span className="text-gray-600">
              공고: {formatDateSimple(announcementDate)}
            </span>
          )}

          {/* 마감일 (마감일이 있는 경우만) */}
          {notice.deadline && (
            <>
              <span className="text-gray-300">|</span>
              <span className={`${isUrgent && !isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                마감: {formatDateSimple(notice.deadline)}
              </span>
            </>
          )}
        </div>

        {/* ============================================
            2. 공고 제목
            ============================================ */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
          {notice.title}
        </h3>

        {/* ============================================
            3. 하단: 기관명 + 접수중/마감 버튼
            ============================================ */}
        <div className="flex items-center justify-between">
          {/* 왼쪽: 기관명 */}
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-gray-400"
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
            <span>{notice.organization || '미지정'}</span>
          </div>

          {/* 오른쪽: 접수중/마감 버튼 */}
          <div>
            <button
              type="button"
              className={`
                px-3 py-1.5 rounded-md text-xs font-semibold transition-colors
                ${isOpen
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-400 text-white cursor-not-allowed'
                }
              `}
              disabled={!isOpen}
            >
              {isOpen ? '접수중' : '마감'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NoticeCard;
