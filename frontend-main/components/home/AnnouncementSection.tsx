/**
 * 📢 지원사업 공고 섹션 컴포넌트
 *
 * 메인 페이지의 지원사업 공고 섹션
 * - 4가지 공고 유형별 섹션 분리
 * - 각 유형별 최신 3개 표시
 * - 3열 그리드 레이아웃 (반응형: 3→2→1)
 * - NoticeCard 컴포넌트 재사용
 *
 * @example
 * <AnnouncementSection />
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React from 'react';
import Link from 'next/link';
import { NoticeCard } from '@/components/sample-board/NoticeCard';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { useNotices } from '@/hooks/useNotices';
import DebugErrorMessage from '@/components/ui/DebugErrorMessage';

/**
 * 개별 공고 섹션 컴포넌트
 */
interface NoticeSectionProps {
  title: string;
  description: string;
  sourceId: string;
  moreLink: string;
}

const NoticeSubSection: React.FC<NoticeSectionProps> = ({
  title,
  description,
  sourceId,
  moreLink,
}) => {
  const { notices, loading, error, errorDetails, fetchNotices } = useNotices({
    status: 'published',
    limit: 3,
    sort_by: 'published_at',
    sort_order: 'desc',
    source_id: sourceId,
  });

  return (
    <div style={{ marginBottom: '80px' }}>
      {/* 섹션 헤더 */}
      <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-end', display: 'flex', marginBottom: '40px' }}>
        <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '4px', display: 'inline-flex' }}>
          <h3 style={{ color: '#121418', fontSize: '32px', fontWeight: '700', lineHeight: '48px', wordWrap: 'break-word' }}>
            {title}
          </h3>
          <p style={{ color: '#6C747E', fontSize: '18px', fontWeight: '400', lineHeight: '24px', wordWrap: 'break-word' }}>
            {description}
          </p>
        </div>
        <Link
          href={moreLink}
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
          <span style={{ color: '#24272D', fontSize: '18px', fontWeight: '500', lineHeight: '27px', wordWrap: 'break-word' }}>
            더보기
          </span>
          <div style={{ width: '24px', height: '24px', position: 'relative', overflow: 'hidden' }}>
            <svg style={{ width: '10px', height: '5px', position: 'absolute', left: '9.5px', top: '17px', transform: 'rotate(-90deg)', transformOrigin: 'top left' }} fill="none" viewBox="0 0 10 5">
              <path d="M0 0L5 5L10 0" stroke="#24272D" strokeWidth="1.5" />
            </svg>
          </div>
        </Link>
      </div>

      {/* 공고 목록 */}
      {loading ? (
        // 로딩 스켈레톤
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} variant="default" />
          ))}
        </div>
      ) : error && errorDetails ? (
        // 에러 메시지
        <div className="py-8">
          <DebugErrorMessage
            error={errorDetails}
            onRetry={() => fetchNotices()}
          />
        </div>
      ) : notices.length === 0 ? (
        // 공고 없음
        <div className="text-center py-12 bg-white border border-gray-200">
          <p className="text-gray-500 text-sm">공고가 없습니다.</p>
        </div>
      ) : (
        // 공고 카드 그리드 (3열)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              variant="default"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AnnouncementSection: React.FC = () => {
  return (
    <section style={{ paddingTop: '80px', paddingBottom: '80px', backgroundColor: '#FFFFFF' }}>
      <div style={{ maxWidth: '1520px', margin: '0 auto', padding: '0 20px' }}>
        {/* 메인 섹션 헤더 */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ color: '#121418', fontSize: '48px', fontWeight: '700', lineHeight: '72px', wordWrap: 'break-word', marginBottom: '8px' }}>
            지원사업 공고
          </h2>
          <p style={{ color: '#6C747E', fontSize: '20px', fontWeight: '400', lineHeight: '26px', wordWrap: 'break-word' }}>
            전북 바이오 산업을 위한 다양한 지원사업을 확인하세요
          </p>
        </div>

        {/* 1. 정부공고 */}
        <NoticeSubSection
          title="정부공고"
          description="NTIS 정부 R&D 지원 사업"
          sourceId="source:ntis:rss"
          moreLink="/notices/notice-government"
        />

        {/* 2. 지자체 사업공고 */}
        <NoticeSubSection
          title="지자체 사업공고"
          description="전북 지역 지자체 지원 사업"
          sourceId="source:jbtp:local"
          moreLink="/notices/notice-local"
        />

        {/* 3. 유관기관 공고 */}
        <NoticeSubSection
          title="유관기관 공고"
          description="유관기관 지원 사업"
          sourceId="source:jbtp:external"
          moreLink="/notices/notice-institutions"
        />

        {/* 4. 기업맞춤형 지원사업 */}
        <NoticeSubSection
          title="기업맞춤형 지원사업"
          description="중소기업 지원 사업 정보"
          sourceId="source:bizinfo:web"
          moreLink="/notices/notice-business"
        />
      </div>
    </section>
  );
};

export default AnnouncementSection;
