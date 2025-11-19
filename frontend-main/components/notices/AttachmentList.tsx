/**
 * 📎 첨부파일 리스트 컴포넌트
 *
 * 공고에 첨부된 파일 목록을 표시하고 다운로드 링크를 제공합니다.
 *
 * **주요 기능:**
 * - 첨부파일 목록 표시
 * - 다운로드 링크 제공
 * - 파일명 디코딩 (URL 인코딩된 파일명 처리)
 * - globals.css의 attachment 스타일 재사용
 *
 * **사용 예시:**
 * ```tsx
 * import { AttachmentList } from '@/components/notices/AttachmentList';
 *
 * <AttachmentList attachments={notice.attachment_links} />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';

/**
 * 첨부파일 인터페이스
 */
interface Attachment {
  /** 파일명 */
  filename: string;
  /** 다운로드 URL (S3 또는 외부 링크) */
  url: string;
}

/**
 * 컴포넌트 Props 인터페이스
 */
interface AttachmentListProps {
  /** 첨부파일 배열 */
  attachments: Attachment[] | null;
}

/**
 * 첨부파일 리스트 컴포넌트
 *
 * @param props - AttachmentListProps
 * @returns 첨부파일 리스트 JSX
 */
export const AttachmentList: React.FC<AttachmentListProps> = ({ attachments }) => {
  /**
   * 첨부파일이 없거나 빈 배열인 경우 렌더링하지 않음
   */
  if (!attachments || attachments.length === 0) {
    return null;
  }

  /**
   * 다운로드 URL 생성
   * PDF/HWP 파일은 백엔드 프록시를 사용하여 다운로드
   */
  const getDownloadUrl = (attachment: Attachment): string => {
    const url = attachment.url;
    const filename = attachment.filename.toLowerCase();

    // PDF/HWP 파일은 백엔드 프록시 사용 (download=true)
    if (filename.endsWith('.pdf') || filename.endsWith('.hwp') || filename.endsWith('.hwpx')) {
      if (!url.includes('.amazonaws.com/')) return url;
      const s3Key = url.split('.amazonaws.com/')[1];
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      return `${apiBaseUrl}/api/notices/serve-pdf?pdf_key=${encodeURIComponent(s3Key)}&download=true`;
    }

    // 기타 파일은 직접 S3 URL 사용
    return url;
  };

  return (
    <div className="mb-6">
      {/* 섹션 제목 */}
      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        첨부파일 ({attachments.length})
      </h3>

      {/* 첨부파일 목록 */}
      <ul className="attachment-list">
        {attachments.map((attachment, index) => {
          /**
           * URL 인코딩된 파일명 디코딩
           * 예: "file%20name.pdf" → "file name.pdf"
           * 플러스(+)를 공백으로 변환
           */
          const decodedFilename = decodeURIComponent(attachment.filename.replace(/\+/g, ' '));

          return (
            <li key={index} className="attachment-item">
              {/* 파일 아이콘 */}
              <span className="attachment-icon">📎</span>

              {/* 파일명 */}
              <span className="attachment-name">{decodedFilename}</span>

              {/* 다운로드 버튼 */}
              <a
                href={getDownloadUrl(attachment)}
                download={decodedFilename}
                className="attachment-download"
              >
                다운로드
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AttachmentList;
