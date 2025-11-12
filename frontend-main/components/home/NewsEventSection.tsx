/**
 * 📰 NEWS & EVENT 섹션 컴포넌트
 *
 * 메인 페이지의 뉴스 & 이벤트 섹션
 * - 좌측: 메인 이벤트 (511px)
 * - 우측: 최신 뉴스 3개
 * - 가로 간격: 80px
 *
 * Figma 디자인 기반으로 구현
 *
 * @example
 * <NewsEventSection />
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLatestNotices } from '@/hooks/useNotices';
import { formatDate } from '@/lib/utils/date';
import { RESPONSIVE, FONT_SIZES, SPACING } from '@/lib/utils/responsive';
import { Notice } from '@/lib/api/types';

export const NewsEventSection: React.FC = () => {
  /**
   * 최신 뉴스/이벤트 조회
   * - 4개 항목 (1개 이벤트 + 3개 뉴스)
   */
  const { notices, loading, error } = useLatestNotices(4);

  /**
   * 이벤트와 뉴스 분리
   * 첫 번째 항목을 이벤트로, 나머지를 뉴스로 사용
   */
  const featuredEvent = notices[0];
  const newsItems = notices.slice(1, 4);

  /**
   * 날짜 범위 계산 (이벤트용)
   */
  const getEventDateRange = (notice: Notice): string => {
    if (!notice) return '';
    const startDate = notice.application_start || notice.published_at || notice.created_at;
    const endDate = notice.application_end || notice.deadline;

    if (startDate && endDate) {
      return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    }
    return formatDate(startDate);
  };

  /**
   * 진행률 계산 (이벤트용)
   */
  const calculateProgress = (notice: Notice): number => {
    if (!notice?.application_start || !notice?.application_end) return 0;

    const now = new Date().getTime();
    const start = new Date(notice.application_start).getTime();
    const end = new Date(notice.application_end).getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    const progress = ((now - start) / (end - start)) * 100;
    return Math.round(progress);
  };

  return (
    <section style={{ paddingTop: SPACING.SECTION, paddingBottom: SPACING.SECTION, backgroundColor: '#FFFFFF' }}>
      <div style={{ maxWidth: RESPONSIVE.CONTAINER_WIDTH, margin: '0 auto', padding: '0 20px' }}>
        {/* 섹션 헤더 */}
        <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-end', display: 'flex', marginBottom: SPACING.LG }}>
          <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '4px', display: 'inline-flex' }}>
            <h2 style={{ color: '#121418', fontSize: FONT_SIZES.HEADING_XL, fontWeight: '700', lineHeight: '1.5', wordWrap: 'break-word' }}>
              NEWS & EVENT
            </h2>
            <p style={{ color: '#6C747E', fontSize: FONT_SIZES.BODY_LG, fontWeight: '400', lineHeight: '1.3', wordWrap: 'break-word' }}>
              전북 바이오 산업의 최신 뉴스와 이벤트를 확인하세요.
            </p>
          </div>
          <Link
            href="/news-events/news"
            style={{
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '12px',
              paddingBottom: '12px',
              background: '#FFFFFF',
              borderRadius: '8px',
              outline: '1px #D6DBE1 solid',
              outlineOffset: '-1px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              display: 'flex',
              flexShrink: 0
            }}
          >
            <span style={{ color: '#24272D', fontSize: FONT_SIZES.BODY_MD, fontWeight: '500', lineHeight: '1.5', wordWrap: 'break-word' }}>
              더보기
            </span>
            <div style={{ width: '24px', height: '24px', position: 'relative', overflow: 'hidden' }}>
              <svg style={{ width: '10px', height: '5px', position: 'absolute', left: '9.5px', top: '17px', transform: 'rotate(-90deg)', transformOrigin: 'top left' }} fill="none" viewBox="0 0 10 5">
                <path d="M0 0L5 5L10 0" stroke="#24272D" strokeWidth="1.5" />
              </svg>
            </div>
          </Link>
        </div>

        {/* 콘텐츠 영역 */}
        {loading ? (
          // 로딩 스켈레톤
          <div className="flex" style={{ gap: '80px' }}>
            <div className="animate-pulse" style={{ width: '511px', height: '527px', backgroundColor: '#E1E6EC', borderRadius: '8px' }} />
            <div className="flex flex-col flex-1" style={{ gap: '32px' }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex animate-pulse" style={{ gap: '24px', height: '150px' }}>
                  <div style={{ flex: 1, backgroundColor: '#E1E6EC', borderRadius: '4px' }} />
                  <div style={{ width: '239px', height: '150px', backgroundColor: '#E1E6EC', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          // 에러 메시지
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-900 text-white hover:bg-black transition-colors rounded-lg"
            >
              다시 시도
            </button>
          </div>
        ) : notices.length === 0 ? (
          // 콘텐츠 없음
          <div className="text-center py-12">
            <p className="text-gray-600">등록된 뉴스 및 이벤트가 없습니다.</p>
          </div>
        ) : (
          // 메인 콘텐츠
          <div className="flex" style={{ gap: '80px', alignItems: 'flex-start' }}>
            {/* 좌측: 메인 이벤트 */}
            {featuredEvent && (
              <div style={{ width: '511px', flexShrink: 0, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '24px', display: 'inline-flex' }}>
                {/* 이벤트 이미지 */}
                <div style={{ alignSelf: 'stretch', height: '321px', position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F3F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* 이벤트 정보 */}
                <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px', display: 'flex' }}>
                  {/* EVENT 태그 */}
                  <div style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '4px', paddingBottom: '4px', background: '#FFF1E6', borderRadius: '4px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ color: '#F27633', fontSize: '15px', fontWeight: '600', lineHeight: '22.50px', wordWrap: 'break-word' }}>
                      EVENT
                    </span>
                  </div>

                  {/* 제목 */}
                  <Link href={`/notices/${featuredEvent.id}`}>
                    <h3 style={{ alignSelf: 'stretch', color: '#121418', fontSize: '24px', fontWeight: '700', lineHeight: '36px', wordWrap: 'break-word', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {featuredEvent.title}
                    </h3>
                  </Link>

                  {/* 설명 */}
                  <p style={{ alignSelf: 'stretch', color: '#6C747E', fontSize: '18px', fontWeight: '400', lineHeight: '27px', wordWrap: 'break-word', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {featuredEvent.content?.replace(/<[^>]*>/g, '').substring(0, 100) || '전북 바이오 산업의 주요 이벤트입니다.'}
                  </p>

                  {/* 날짜 */}
                  <div style={{ alignSelf: 'stretch', paddingTop: '16px', paddingBottom: '16px', borderTop: '1px #E1E6EC solid', borderBottom: '1px #E1E6EC solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
                    <span style={{ color: '#6C747E', fontSize: '18px', fontWeight: '400', lineHeight: '27px', wordWrap: 'break-word' }}>
                      {getEventDateRange(featuredEvent)}
                    </span>
                  </div>

                  {/* 프로그레스 바 */}
                  <div style={{ alignSelf: 'stretch', height: '36px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'flex' }}>
                    <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
                      <span style={{ color: '#6C747E', fontSize: '16px', fontWeight: '500', lineHeight: '24px', wordWrap: 'break-word' }}>
                        진행률
                      </span>
                      <span style={{ color: '#565B64', fontSize: '16px', fontWeight: '500', lineHeight: '24px', wordWrap: 'break-word', fontFamily: 'Geist Mono, monospace' }}>
                        {calculateProgress(featuredEvent)}%
                      </span>
                    </div>
                    {/* 프로그레스 바 */}
                    <div style={{ width: '100%', height: '4px', position: 'relative', borderRadius: '2px' }}>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#E1E6EC', borderRadius: '2px', position: 'absolute' }} />
                      <div style={{ width: `${calculateProgress(featuredEvent)}%`, height: '4px', backgroundColor: '#F27633', borderRadius: '2px', position: 'absolute' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 우측: 뉴스 목록 */}
            <div style={{ flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '32px', display: 'inline-flex' }}>
              {newsItems.map((item) => (
                <Link key={item.id} href={`/notices/${item.id}`}>
                  <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '24px', display: 'inline-flex' }}>
                    {/* 좌측: 텍스트 */}
                    <div style={{ flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px', display: 'inline-flex' }}>
                      {/* NEWS 태그 */}
                      <div style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '4px', paddingBottom: '4px', background: '#E6F9FB', borderRadius: '4px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                        <span style={{ color: '#00B8CD', fontSize: '15px', fontWeight: '600', lineHeight: '22.50px', wordWrap: 'break-word' }}>
                          NEWS
                        </span>
                      </div>

                      {/* 제목 */}
                      <h3 style={{ alignSelf: 'stretch', color: '#121418', fontSize: '20px', fontWeight: '700', lineHeight: '30px', wordWrap: 'break-word', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.title}
                      </h3>

                      {/* 설명 */}
                      <p style={{ alignSelf: 'stretch', color: '#6C747E', fontSize: '18px', fontWeight: '400', lineHeight: '27px', wordWrap: 'break-word', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.content?.replace(/<[^>]*>/g, '').substring(0, 80) || '전북 바이오 산업의 최신 소식입니다.'}
                      </p>

                      {/* 날짜 */}
                      <span style={{ color: '#6C747E', fontSize: '18px', fontWeight: '400', lineHeight: '27px', wordWrap: 'break-word' }}>
                        {formatDate(item.published_at || item.created_at)}
                      </span>
                    </div>

                    {/* 우측: 이미지 */}
                    <div style={{ width: '239px', height: '150px', position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F3F6FB', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsEventSection;
