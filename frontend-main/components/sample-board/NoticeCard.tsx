/**
 * 공고 카드 컴포넌트
 *
 * 개별 공고를 카드 형태로 표시하는 재사용 가능한 컴포넌트입니다.
 *
 * 디자인 원칙:
 * - Sharp edges (라운딩 제거)
 * - Minimal colors (회색 중심)
 * - Clear typography
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React from 'react';
import Link from 'next/link';
import { Notice } from '@/lib/api/types';
import { formatDate, formatDateSimple, getDeadlineStatus, getDaysUntilDeadline } from '@/lib/utils/date';
import { getTagColorClasses } from '@/lib/utils/tagColors';

interface NoticeCardProps {
  notice: Notice;
  onClick?: (notice: Notice) => void;
  variant?: 'default' | 'compact' | 'detailed';
  openInNewTab?: boolean;
}

/**
 * Source ID로부터 표시 이름 가져오기
 */
function getSourceName(sourceId: string | undefined): string {
  if (!sourceId) return '미분류';

  const parts = sourceId.split(':');
  if (parts.length < 3) return '미분류';

  const organization = parts[1];
  const type = parts[2];

  if (organization === 'ntis') return '정부공고';
  if (organization === 'bizinfo') return '기업지원';
  if (organization === 'jbtp') {
    if (type === 'local') return '지자체공고';
    if (type === 'external') return '유관기관';
    if (type === 'events') return '뉴스/행사';
  }

  return '기타';
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onClick,
  variant = 'default',
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
  const sourceName = getSourceName(notice.crawler_source_id);
  const announcementDate = notice.announcement_date || notice.published_at;

  /**
   * Compact variant
   */
  if (variant === 'compact') {
    return (
      <Link
        href={`/notices/${notice.id}`}
        target={openInNewTab ? '_blank' : undefined}
        className="block group"
      >
        <div
          onClick={handleClick}
          className={`
            p-3 border transition-all
            ${isExpired ? 'border-gray-200 opacity-50' : 'border-gray-200 hover:border-gray-900'}
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium truncate flex-1 group-hover:text-black">
              {notice.title}
            </h3>

            {notice.deadline && (
              <span
                className={`
                  text-xs font-bold tracking-wide uppercase whitespace-nowrap px-2 py-0.5
                  ${isExpired ? 'text-gray-400' : isUrgent ? 'bg-black text-white' : 'text-gray-900'}
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
   * Detailed variant
   */
  if (variant === 'detailed') {
    return (
      <Link
        href={`/notices/${notice.id}`}
        target={openInNewTab ? '_blank' : undefined}
        className="block group"
      >
        <div
          onClick={handleClick}
          className={`
            relative bg-white border transition-all
            ${isExpired ? 'border-gray-200 opacity-50' : 'border-gray-200 hover:border-gray-900 hover:shadow-sm'}
          `}
        >
          {isUrgent && !isExpired && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
          )}

          <div className={`p-6 ${isUrgent && !isExpired ? 'pl-7' : ''}`}>
            {/* 헤더: 출처와 상태 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tracking-wider uppercase text-gray-600">
                  {sourceName}
                </span>

                <div className="w-px h-3 bg-gray-300"></div>

                {notice.deadline ? (
                  <span
                    className={`
                      text-xs font-bold tracking-wide uppercase px-2 py-0.5
                      ${isExpired ? 'text-gray-400' : isUrgent ? 'bg-black text-white font-extrabold' : 'text-gray-900'}
                    `}
                  >
                    {deadlineStatus}
                  </span>
                ) : (
                  <span className="text-xs font-bold tracking-wide uppercase text-green-600">
                    상시모집
                  </span>
                )}

                <div className="w-px h-3 bg-gray-300"></div>

                <span className={`text-xs font-semibold tracking-wide uppercase ${isOpen ? 'text-green-600' : 'text-gray-400'}`}>
                  {isOpen ? '접수중' : '마감'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                {announcementDate && (
                  <span>공고 {formatDateSimple(announcementDate)}</span>
                )}
                {notice.deadline && (
                  <>
                    <span>•</span>
                    <span>마감 {formatDateSimple(notice.deadline)}</span>
                  </>
                )}
              </div>
            </div>

            {/* 제목 */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-black transition-colors">
              {notice.title}
            </h3>

            {/* 내용 미리보기 */}
            {notice.content && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {notice.content}
              </p>
            )}

            {/* 태그 - Bio 태그 색상 적용 */}
            {notice.tags && notice.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {notice.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-0.5 ${getTagColorClasses(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 푸터 */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium">{notice.organization || '미지정'}</span>
              </div>

              <div className="text-gray-400 group-hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /**
   * Default variant - Figma 디자인 적용
   */
  return (
    <Link
      href={`/notices/${notice.id}`}
      target={openInNewTab ? '_blank' : undefined}
      className="block group"
    >
      <div
        onClick={handleClick}
        style={{
          width: '100%',
          padding: '24px',
          background: '#F8F9FC',
          borderRadius: '12px',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '20px',
          display: 'inline-flex',
          transition: 'all 0.2s',
          cursor: 'pointer'
        }}
        className={isExpired ? 'opacity-60' : 'hover:shadow-md'}
      >
        <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '16px', display: 'flex' }}>
          {/* 태그 */}
          <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'inline-flex' }}>
            {/* 카테고리 태그 (R&D 등) */}
            {notice.tags && notice.tags.length > 0 && (
              <div
                style={{
                  height: '24px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  background: '#00B8CD',
                  borderRadius: '4px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  display: 'flex'
                }}
              >
                <div style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: '15px', fontFamily: 'Pretendard GOV', fontWeight: '500', lineHeight: '21px', wordWrap: 'break-word' }}>
                  {notice.tags[0]}
                </div>
              </div>
            )}

            {/* 상태 태그 */}
            {notice.deadline && (
              <div
                style={{
                  height: '24px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  background: isExpired ? '#FFF3F3' : isUrgent ? '#FFF2E7' : '#EBEFF5',
                  borderRadius: '4px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  display: 'flex'
                }}
              >
                <div
                  style={{
                    justifyContent: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    color: isExpired ? '#E74D50' : isUrgent ? '#F8780F' : '#6C747E',
                    fontSize: '15px',
                    fontFamily: 'Pretendard GOV',
                    fontWeight: '500',
                    lineHeight: '22.5px',
                    wordWrap: 'break-word'
                  }}
                >
                  {isExpired ? '신청 마감' : isUrgent ? '마감 임박' : '신청예정'}
                </div>
              </div>
            )}
          </div>

          {/* 제목 */}
          <div
            style={{
              alignSelf: 'stretch',
              minHeight: '60px',
              color: '#121418',
              fontSize: '20px',
              fontFamily: 'Pretendard GOV',
              fontWeight: '600',
              lineHeight: '30px',
              wordWrap: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {notice.title}
          </div>

          {/* 신청 기간 */}
          {(notice.application_start || notice.application_end || notice.deadline) && (
            <div>
              <span style={{ color: '#24272D', fontSize: '16px', fontFamily: 'Pretendard GOV', fontWeight: '600', lineHeight: '22.4px', wordWrap: 'break-word' }}>
                신청 기간
              </span>
              <span style={{ color: '#24272D', fontSize: '16px', fontFamily: 'Pretendard GOV', fontWeight: '400', lineHeight: '22.4px', wordWrap: 'break-word' }}>
                {' '}
                {(() => {
                  const start = notice.application_start;
                  const end = notice.application_end || notice.deadline;

                  if (start && end) {
                    return `${formatDateSimple(start)}-${formatDateSimple(end)}`;
                  }
                  if (end) {
                    return `~ ${formatDateSimple(end)}`;
                  }
                  if (start) {
                    return `${formatDateSimple(start)} ~`;
                  }
                  return '상시접수';
                })()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NoticeCard;
