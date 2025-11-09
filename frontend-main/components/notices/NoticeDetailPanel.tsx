/**
 * 🔍 공고 상세 정보 패널 컴포넌트
 *
 * 공고의 시스템 정보(ID, 상태, 출처, 생성일 등)를 표시합니다.
 *
 * **표시 항목:**
 * - 공고 ID
 * - 상태 (published/pending/archived)
 * - 출처 타입 (crawled/manual)
 * - 출처 ID (crawler_source_id)
 * - 등록일 (created_at)
 * - 수정일 (updated_at)
 *
 * **사용 예시:**
 * ```tsx
 * import { NoticeDetailPanel } from '@/components/notices/NoticeDetailPanel';
 *
 * <NoticeDetailPanel notice={notice} />
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
interface NoticeDetailPanelProps {
  /** 상세 정보를 표시할 공고 데이터 */
  notice: Notice;
}

/**
 * 공고 상세 정보 패널 컴포넌트
 *
 * @param props - NoticeDetailPanelProps
 * @returns 상세 정보 패널 JSX
 */
export const NoticeDetailPanel: React.FC<NoticeDetailPanelProps> = ({ notice }) => {
  /**
   * 상태 텍스트 변환
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'published':
        return '게시됨';
      case 'pending':
        return '대기중';
      case 'archived':
        return '보관됨';
      default:
        return status;
    }
  };

  /**
   * 출처 타입 텍스트 변환
   */
  const getOriginTypeText = (originType: string): string => {
    switch (originType) {
      case 'crawled':
        return '크롤링';
      case 'manual':
        return '수동 등록';
      default:
        return originType;
    }
  };

  return (
    <div className="p-6 bg-gray-50 border-t">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">상세 정보</h3>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 공고 ID */}
        <div>
          <dt className="text-sm font-medium text-gray-500">공고 ID</dt>
          <dd className="mt-1 text-sm text-gray-900">{notice.id}</dd>
        </div>

        {/* 상태 */}
        <div>
          <dt className="text-sm font-medium text-gray-500">상태</dt>
          <dd className="mt-1 text-sm text-gray-900">
            <span
              className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${notice.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                ${notice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${notice.status === 'archived' ? 'bg-gray-100 text-gray-800' : ''}
              `}
            >
              {getStatusText(notice.status)}
            </span>
          </dd>
        </div>

        {/* 출처 타입 */}
        <div>
          <dt className="text-sm font-medium text-gray-500">출처</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {getOriginTypeText(notice.origin_type)}
          </dd>
        </div>

        {/* 출처 ID */}
        {notice.crawler_source_id && (
          <div>
            <dt className="text-sm font-medium text-gray-500">출처 ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">
              {notice.crawler_source_id}
            </dd>
          </div>
        )}

        {/* 콘텐츠 타입 */}
        {notice.content_type && (
          <div>
            <dt className="text-sm font-medium text-gray-500">콘텐츠 타입</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {notice.content_type}
              </span>
            </dd>
          </div>
        )}

        {/* 등록일 */}
        <div>
          <dt className="text-sm font-medium text-gray-500">등록일</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formatDate(notice.created_at, true)}
          </dd>
        </div>

        {/* 수정일 */}
        <div>
          <dt className="text-sm font-medium text-gray-500">수정일</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formatDate(notice.updated_at, true)}
          </dd>
        </div>

        {/* 매칭 키워드 (있는 경우만) */}
        {notice.matched_keywords && notice.matched_keywords.length > 0 && (
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500 mb-2">매칭된 키워드</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {notice.matched_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {keyword}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
};

export default NoticeDetailPanel;
