/**
 * 📢 공고 카드 컴포넌트
 *
 * 개별 공고를 카드 형태로 표시하는 재사용 가능한 컴포넌트입니다.
 * 공고 제목, 카테고리, 마감일, 태그 등을 시각적으로 표현합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { NoticeCard } from '@/components/sample-board/NoticeCard';
 *
 * function NoticeList() {
 *   const { notices } = useNotices();
 *
 *   return (
 *     <div>
 *       {notices.map(notice => (
 *         <NoticeCard key={notice.id} notice={notice} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import Link from 'next/link';
import { Notice } from '@/lib/api/types';
import { formatDate, getDeadlineStatus, getDaysUntilDeadline } from '@/lib/utils/date';

/**
 * NoticeCard 컴포넌트 Props 인터페이스
 */
interface NoticeCardProps {
  /** 표시할 공고 데이터 */
  notice: Notice;

  /** 클릭 시 실행될 함수 (선택적) */
  onClick?: (notice: Notice) => void;

  /** 카드 스타일 변형 (기본값: 'default') */
  variant?: 'default' | 'compact' | 'detailed';

  /** 새 탭에서 열기 여부 (기본값: false) */
  openInNewTab?: boolean;
}

/**
 * Source ID로부터 표시 이름과 색상을 가져오는 함수
 *
 * source_id는 'source:organization:type' 형식입니다.
 * 예: 'source:ntis:rss', 'source:bizinfo:api', 'source:jbtp:local', 'source:jbtp:external'
 */
function getSourceDisplay(sourceId: string | undefined): { name: string; bg: string; text: string } {
  if (!sourceId) {
    return { name: '미분류', bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  // source_id 파싱
  const parts = sourceId.split(':');
  if (parts.length < 3) {
    return { name: '미분류', bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  const organization = parts[1]; // ntis, bizinfo, jbtp
  const type = parts[2]; // rss, api, local, external

  // 조직과 타입에 따라 표시 정보 반환
  if (organization === 'ntis') {
    return { name: '정부공고', bg: 'bg-blue-100', text: 'text-blue-800' };
  } else if (organization === 'bizinfo') {
    return { name: '기업지원', bg: 'bg-green-100', text: 'text-green-800' };
  } else if (organization === 'jbtp') {
    if (type === 'local') {
      return { name: '지자체공고', bg: 'bg-teal-100', text: 'text-teal-800' };
    } else if (type === 'external') {
      return { name: '유관기관', bg: 'bg-purple-100', text: 'text-purple-800' };
    }
  }

  return { name: '기타', bg: 'bg-gray-100', text: 'text-gray-800' };
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
  variant = 'default',
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
   * 출처 표시 정보 (이름, 배경색, 텍스트색)
   */
  const sourceDisplay = getSourceDisplay(notice.crawler_source_id);

  /**
   * 컴팩트 변형 렌더링
   */
  if (variant === 'compact') {
    return (
      <Link
        href={`/sample-board/${notice.id}`}
        target={openInNewTab ? '_blank' : undefined}
        className="block"
      >
        <div
          onClick={handleClick}
          className={`
            p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer
            ${isExpired ? 'bg-gray-50 opacity-60' : 'bg-white'}
          `}
        >
          <div className="flex items-center justify-between gap-3">
            {/* 제목 */}
            <h3 className="text-sm font-medium truncate flex-1">
              {notice.title}
            </h3>

            {/* 마감일 */}
            {notice.deadline && (
              <span
                className={`
                  text-xs px-2 py-1 rounded-full whitespace-nowrap
                  ${isExpired ? 'bg-gray-200 text-gray-600' : ''}
                  ${isUrgent && !isExpired ? 'bg-red-100 text-red-700 font-semibold' : ''}
                  ${!isUrgent && !isExpired ? 'bg-gray-100 text-gray-700' : ''}
                `}
              >
                {deadlineStatus}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  /**
   * 상세 변형 렌더링
   */
  if (variant === 'detailed') {
    return (
      <Link
        href={`/sample-board/${notice.id}`}
        target={openInNewTab ? '_blank' : undefined}
        className="block"
      >
        <div
          onClick={handleClick}
          className={`
            p-6 border rounded-lg hover:shadow-lg transition-all cursor-pointer
            ${isExpired ? 'bg-gray-50 opacity-70' : 'bg-white'}
          `}
        >
          {/* 헤더: 출처와 마감일 */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${sourceDisplay.bg} ${sourceDisplay.text}
              `}
            >
              {sourceDisplay.name}
            </span>

            {notice.deadline && (
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${isExpired ? 'bg-gray-200 text-gray-600' : ''}
                  ${isUrgent && !isExpired ? 'bg-red-500 text-white' : ''}
                  ${!isUrgent && !isExpired ? 'bg-gray-200 text-gray-700' : ''}
                `}
              >
                {deadlineStatus}
              </span>
            )}
          </div>

          {/* 제목 */}
          <h3 className="text-lg font-bold mb-3 line-clamp-2">
            {notice.title}
          </h3>

          {/* 내용 미리보기 */}
          {notice.content && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {notice.content}
            </p>
          )}

          {/* 태그 */}
          {notice.tags && notice.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {notice.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
              {notice.tags.length > 5 && (
                <span className="text-xs text-gray-500">
                  +{notice.tags.length - 5}개 더
                </span>
              )}
            </div>
          )}

          {/* 푸터: 기관명, 게시일 */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
            <span>{notice.organization || '미지정'}</span>
            <span>{formatDate(notice.published_at)}</span>
          </div>
        </div>
      </Link>
    );
  }

  /**
   * 기본 변형 렌더링 (default)
   */
  return (
    <Link
      href={`/sample-board/${notice.id}`}
      target={openInNewTab ? '_blank' : undefined}
      className="block"
    >
      <div
        onClick={handleClick}
        className={`
          p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer
          ${isExpired ? 'bg-gray-50 opacity-70' : 'bg-white'}
        `}
      >
        {/* 헤더: 출처와 마감일 */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`
              px-2 py-1 rounded-full text-xs font-semibold
              ${sourceDisplay.bg} ${sourceDisplay.text}
            `}
          >
            {sourceDisplay.name}
          </span>

          {notice.deadline && (
            <span
              className={`
                px-2 py-1 rounded-full text-xs font-semibold
                ${isExpired ? 'bg-gray-200 text-gray-600' : ''}
                ${isUrgent && !isExpired ? 'bg-red-500 text-white' : ''}
                ${!isUrgent && !isExpired ? 'bg-gray-200 text-gray-700' : ''}
              `}
            >
              {deadlineStatus}
            </span>
          )}
        </div>

        {/* 제목 */}
        <h3 className="text-base font-bold mb-3 line-clamp-2">
          {notice.title}
        </h3>

        {/* 태그 */}
        {notice.tags && notice.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {notice.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
            {notice.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{notice.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 푸터: 기관명, 마감일 */}
        <div className="flex flex-col gap-1 pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {notice.organization || '미지정'}
            </span>
            {notice.deadline && (
              <span className="flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                마감: {formatDate(notice.deadline)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NoticeCard;
