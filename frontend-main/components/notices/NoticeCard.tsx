/**
 * 공고 카드 컴포넌트 (정식 버전)
 *
 * 공고 목록 페이지에서 사용하는 카드 컴포넌트입니다.
 * 사용자가 이미 특정 카테고리 페이지에 있으므로 카테고리 태그는 표시하지 않으며,
 * 마감일 정보를 강조하여 표시합니다.
 *
 * 주요 특징:
 * - 미니멀한 디자인 (과도한 라운딩 제거)
 * - 선명한 타이포그래피
 * - 컬러 사용 최소화
 * - 명확한 정보 계층
 *
 * @author JB SQUARE 개발팀
 * @version 3.0.0
 */

import React from 'react';
import Link from 'next/link';
import { Notice } from '@/lib/api/types';
import { formatDateSimple, getDeadlineStatus, getDaysUntilDeadline } from '@/lib/utils/date';
import { getTagColorClasses } from '@/lib/utils/tagColors';

interface NoticeCardProps {
  notice: Notice;
  onClick?: (notice: Notice) => void;
  openInNewTab?: boolean;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onClick,
  openInNewTab = false
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(notice);
    }
  };

  const daysLeft = getDaysUntilDeadline(notice.deadline);
  const deadlineStatus = getDeadlineStatus(notice.deadline);
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isOpen = !isExpired;
  const detailUrl = `/notices/${notice.id}`;
  const announcementDate = notice.announcement_date || notice.published_at;

  return (
    <Link
      href={detailUrl}
      target={openInNewTab ? '_blank' : undefined}
      className="block group"
    >
      <div
        onClick={handleClick}
        className={`
          relative bg-white border transition-all duration-150
          ${isExpired
            ? 'border-gray-200 opacity-50'
            : 'border-gray-200 hover:border-gray-900 hover:shadow-sm'
          }
        `}
      >
        {/* 마감 임박 시 좌측 강조 라인 */}
        {isUrgent && !isExpired && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
        )}

        <div className={`p-6 ${isUrgent && !isExpired ? 'pl-7' : ''}`}>
          {/* 상단: 상태 + 태그 + 일자 정보 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* D-day 상태 - 강조 (D-7 이하는 검은 배경) */}
              {notice.deadline ? (
                <span
                  className={`
                    text-xs font-bold tracking-wide uppercase px-2 py-0.5
                    ${isExpired
                      ? 'text-gray-400'
                      : isUrgent
                      ? 'bg-black text-white font-extrabold'
                      : 'text-gray-900 font-bold'
                    }
                  `}
                >
                  {deadlineStatus}
                </span>
              ) : (
                <span className="text-xs font-bold tracking-wide uppercase text-green-600">
                  상시모집
                </span>
              )}

              {/* 구분선 */}
              <div className="w-px h-3 bg-gray-300"></div>

              {/* 접수 상태 */}
              <span
                className={`
                  text-xs font-semibold tracking-wide uppercase
                  ${isOpen ? 'text-green-600' : 'text-gray-400'}
                `}
              >
                {isOpen ? '접수중' : '마감'}
              </span>

              {/* 태그 표시 (최대 4개) - Bio 태그 색상 적용 */}
              {notice.tags && notice.tags.length > 0 && (
                <>
                  <div className="w-px h-3 bg-gray-300"></div>
                  {notice.tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-0.5 ${getTagColorClasses(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </>
              )}
            </div>

            {/* 일자 정보 */}
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
              {announcementDate && (
                <span>공고 {formatDateSimple(announcementDate)}</span>
              )}
              {notice.deadline && (
                <>
                  <span>•</span>
                  <span>
                    마감 {formatDateSimple(notice.deadline)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 제목 */}
          <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-black transition-colors">
            {notice.title}
          </h3>

          {/* 하단: 기관명 */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
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
              <span className="font-medium">{notice.organization || '미지정'}</span>
            </div>

            {/* 화살표 */}
            <div className="text-gray-400 group-hover:text-gray-900 transition-colors">
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NoticeCard;
