/**
 * ℹ️ 공고 메타 정보 컴포넌트
 *
 * 공고의 핵심 메타 정보를 깔끔하게 표시합니다.
 *
 * **표시 항목:**
 * - 기관명 (organization)
 * - 공고일 (announcement_date 또는 published_at)
 * - 마감일 (deadline)
 * - 접수 기간 (application_start ~ application_end)
 * - 담당 부서 (department)
 * - 연락처 (contact)
 *
 * **사용 예시:**
 * ```tsx
 * import { NoticeMetaInfo } from '@/components/notices/NoticeMetaInfo';
 *
 * <NoticeMetaInfo notice={notice} />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import { Notice } from '@/lib/api/types';
import { formatDate } from '@/lib/utils/date';

/**
 * 컴포넌트 Props 인터페이스
 */
interface NoticeMetaInfoProps {
  /** 메타 정보를 표시할 공고 데이터 */
  notice: Notice;
}

/**
 * 공고 메타 정보 컴포넌트
 *
 * @param props - NoticeMetaInfoProps
 * @returns 메타 정보 JSX
 */
export const NoticeMetaInfo: React.FC<NoticeMetaInfoProps> = ({ notice }) => {
  /**
   * 공고일 결정
   * announcement_date가 있으면 우선 사용, 없으면 published_at 사용
   */
  const announcementDate = notice.announcement_date || notice.published_at;

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
      {/* 기관명 */}
      {notice.organization && (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span>{notice.organization}</span>
        </div>
      )}

      {/* 담당 부서 */}
      {notice.department && (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>{notice.department}</span>
        </div>
      )}

      {/* 공고일 */}
      {announcementDate && (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>공고일: {formatDate(announcementDate)}</span>
        </div>
      )}

      {/* 접수 기간 */}
      {notice.application_start && notice.application_end && (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>
            접수: {formatDate(notice.application_start)} ~ {formatDate(notice.application_end)}
          </span>
        </div>
      )}

      {/* 마감일 (접수 기간이 없는 경우에만 별도 표시) */}
      {notice.deadline && !notice.application_end && (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>마감일: {formatDate(notice.deadline)}</span>
        </div>
      )}

      {/* 연락처 */}
      {notice.contact && (
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span>{notice.contact}</span>
        </div>
      )}
    </div>
  );
};

export default NoticeMetaInfo;
