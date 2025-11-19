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

import React, { useEffect, useRef, useState } from 'react';
import { Notice } from '@/lib/api/types';
import dynamic from 'next/dynamic';

// HWPViewer를 dynamic import로 로드 (SSR 비활성화)
const HWPViewer = dynamic(() => import('./HWPViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center py-20 bg-gray-50 border border-gray-300 rounded-lg">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">뷰어를 불러오는 중...</p>
      </div>
    </div>
  ),
});

/**
 * 컴포넌트 Props 인터페이스
 */
interface NoticeContentRendererProps {
  /** 렌더링할 공고 데이터 */
  notice: Notice;
}

/**
 * 파일 확장자 추출
 */
function getFileExtension(filename: string | null | undefined): string {
  if (!filename) return '';
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * PDF 파일인지 확인
 */
function isPDF(filename: string | null | undefined): boolean {
  return getFileExtension(filename) === 'pdf';
}

/**
 * HWP 파일인지 확인
 */
function isHWP(filename: string | null | undefined): boolean {
  const ext = getFileExtension(filename);
  return ext === 'hwp' || ext === 'hwpx';
}

/**
 * 공고 콘텐츠 렌더러 컴포넌트
 *
 * @param props - NoticeContentRendererProps
 * @returns 콘텐츠 렌더링 JSX
 */
export const NoticeContentRenderer: React.FC<NoticeContentRendererProps> = ({ notice }) => {
  // JBTP 공고인지 확인
  const isJBTPNotice = notice.crawler_source_id?.startsWith('source:jbtp:');

  // 첫 번째 첨부파일 가져오기
  const firstAttachment = notice.attachment_links?.[0];

  /**
   * JBTP 공고이고 첨부파일이 있는 경우: 첨부파일 렌더링
   */
  if (isJBTPNotice && firstAttachment) {
    // Helper function to convert S3 URL to backend proxy URL
    const getPdfProxyUrl = (s3Url: string, forceDownload: boolean = false): string => {
      if (!s3Url.includes('.amazonaws.com/')) return s3Url;
      const s3Key = s3Url.split('.amazonaws.com/')[1];
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const downloadParam = forceDownload ? 'download=true' : 'download=false';
      return `${apiBaseUrl}/api/notices/serve-pdf?pdf_key=${encodeURIComponent(s3Key)}&${downloadParam}`;
    };

    // PDF 파일
    if (isPDF(firstAttachment.filename)) {
      return (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">첨부 문서 (PDF)</h3>
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden" style={{ height: '800px' }}>
            <embed
              src={getPdfProxyUrl(firstAttachment.url, false)}
              type="application/pdf"
              className="w-full h-full"
              title="PDF 문서"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">{firstAttachment.filename}</span>
            <a
              href={getPdfProxyUrl(firstAttachment.url, true)}
              download={firstAttachment.filename}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              다운로드
            </a>
          </div>
        </div>
      );
    }

    // HWP 파일
    if (isHWP(firstAttachment.filename)) {
      return (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">첨부 문서 (한글)</h3>
          <HWPViewer url={firstAttachment.url} filename={firstAttachment.filename} />
        </div>
      );
    }

    // 지원하지 않는 파일 형식
    return (
      <div className="mb-6 bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
        <p className="text-gray-700 mb-2">
          이 파일 형식({getFileExtension(firstAttachment.filename)})은 미리보기를 지원하지 않습니다.
        </p>
        <p className="text-gray-600 text-sm mb-4">파일을 다운로드하여 확인해주세요.</p>
        <a
          href={firstAttachment.url}
          download
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {firstAttachment.filename} 다운로드
        </a>
      </div>
    );
  }

  /**
   * 비-JBTP 공고 또는 첨부파일이 없는 경우: 기존 로직 유지
   */
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
