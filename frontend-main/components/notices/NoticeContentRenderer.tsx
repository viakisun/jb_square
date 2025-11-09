/**
 * 📝 공고 콘텐츠 렌더러 컴포넌트
 *
 * Notice의 content_type에 따라 적절한 방식으로 콘텐츠를 렌더링합니다.
 *
 * **지원하는 콘텐츠 타입:**
 * - `pdf_viewer`: PDF 뷰어 iframe 렌더링
 * - `html`: HTML 콘텐츠를 dangerouslySetInnerHTML로 렌더링
 * - `text` 또는 `null`: plain text로 렌더링
 * - 콘텐츠 없음: 외부 링크 안내 또는 "내용 없음" 메시지
 *
 * **사용 예시:**
 * ```tsx
 * import { NoticeContentRenderer } from '@/components/notices/NoticeContentRenderer';
 *
 * <NoticeContentRenderer notice={notice} />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import { Notice } from '@/lib/api/types';

/**
 * 컴포넌트 Props 인터페이스
 */
interface NoticeContentRendererProps {
  /** 렌더링할 공고 데이터 */
  notice: Notice;
}

/**
 * 공고 콘텐츠 렌더러 컴포넌트
 *
 * @param props - NoticeContentRendererProps
 * @returns 콘텐츠 렌더링 JSX
 */
export const NoticeContentRenderer: React.FC<NoticeContentRendererProps> = ({ notice }) => {
  /**
   * Case 1: PDF 뷰어 타입
   * content_type === 'pdf_viewer'이고 content_viewer_url이 있는 경우
   */
  if (notice.content_type === 'pdf_viewer' && notice.content_viewer_url) {
    return (
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">공고 문서</h3>
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden" style={{ height: '800px' }}>
          <iframe
            src={notice.content_viewer_url}
            className="w-full h-full"
            title="공고 문서 뷰어"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            referrerPolicy="no-referrer-when-downgrade"
            allow="fullscreen"
          />
        </div>
        <div className="mt-3 text-sm text-gray-600">
          <p className="mb-2">문서가 보이지 않나요?</p>
          <a
            href={notice.content_viewer_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            새 창에서 열기
          </a>
        </div>
      </div>
    );
  }

  /**
   * Case 2: HTML 콘텐츠 타입
   * content_type === 'html'이고 content가 있는 경우
   */
  if (notice.content_type === 'html' && notice.content) {
    return (
      <div className="mb-6">
        <div
          className="notice-content-body"
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />
      </div>
    );
  }

  /**
   * Case 3: 텍스트 콘텐츠 타입
   * content_type === 'text' 또는 null이고 content가 있는 경우
   */
  if (notice.content) {
    return (
      <div className="mb-6">
        <div className="notice-content-body">
          <pre className="whitespace-pre-wrap">{notice.content}</pre>
        </div>
      </div>
    );
  }

  /**
   * Case 4: 콘텐츠는 없지만 외부 링크가 있는 경우
   * content가 null이고 link가 있는 경우
   */
  if (notice.link) {
    return (
      <div className="mb-6 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-base font-semibold text-blue-900 mb-2">상세 내용 안내</h3>
            <p className="text-sm text-blue-800 mb-4">
              이 공고는 외부 사이트에서 제공됩니다. 자세한 내용은 아래 원문 링크를 확인해주세요.
            </p>
            <a
              href={notice.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              원문 보기
            </a>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Case 5: 콘텐츠도 없고 링크도 없는 경우
   * "내용 없음" 메시지 표시
   */
  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
      <p className="text-gray-500 italic">상세 내용이 제공되지 않습니다.</p>
    </div>
  );
};

export default NoticeContentRenderer;
