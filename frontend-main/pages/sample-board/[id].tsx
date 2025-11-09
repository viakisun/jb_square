/**
 * 📄 공고 상세 페이지
 *
 * 개별 공고의 상세 정보를 표시하는 페이지입니다.
 * Next.js의 Dynamic Routes를 사용하여 공고 ID를 URL에서 받아옵니다.
 *
 * URL 예시: /sample-board/123 (123은 공고 ID)
 *
 * 이 페이지는 초보 개발자가 참고할 수 있도록 작성되었습니다:
 * - Dynamic Routes 사용법
 * - API 직접 호출 방법
 * - 로딩/에러 상태 처리
 * - 데이터 표시 방법
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/lib/api/client';
import { Notice } from '@/lib/api/types';
import { formatDate, getDeadlineStatus, getDaysUntilDeadline } from '@/lib/utils/date';
import { getErrorMessage, logError } from '@/lib/utils/errors';

/**
 * 공고 상세 페이지 컴포넌트
 *
 * @returns 공고 상세 페이지 JSX
 */
export default function NoticeDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  /**
   * 상태 관리
   */
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 공고 데이터 가져오기
   *
   * URL에서 추출한 ID를 사용하여 API를 호출합니다.
   */
  useEffect(() => {
    /**
     * 공고 데이터 fetch 함수
     */
    const fetchNotice = async () => {
      // ID가 없으면 리턴 (router가 아직 준비되지 않은 경우)
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // API 호출: 공고 ID로 상세 정보 조회
        const noticeId = Number(id);
        const data = await api.notices.getById(noticeId);
        setNotice(data);
      } catch (err) {
        const errorMessage = getErrorMessage(err, '공고를 불러오는 중 오류가 발생했습니다.');
        setError(errorMessage);
        logError(err, `공고 상세 조회 실패 (ID: ${id})`);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  /**
   * 로딩 상태 렌더링
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">공고를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  /**
   * 에러 상태 렌더링
   */
  if (error || !notice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-16 w-16 text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              오류가 발생했습니다
            </h2>
            <p className="text-red-600 mb-6">{error || '공고를 찾을 수 없습니다.'}</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/sample-board"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                목록으로 돌아가기
              </Link>
              <button
                onClick={() => router.reload()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Source ID로부터 표시 이름과 색상을 가져오는 함수
   */
  function getSourceDisplay(sourceId: string | undefined): { name: string; bg: string; text: string } {
    if (!sourceId) {
      return { name: '미분류', bg: 'bg-gray-100', text: 'text-gray-800' };
    }

    const parts = sourceId.split(':');
    if (parts.length < 3) {
      return { name: '미분류', bg: 'bg-gray-100', text: 'text-gray-800' };
    }

    const organization = parts[1];
    const type = parts[2];

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

  const sourceDisplay = getSourceDisplay(notice.crawler_source_id);
  const daysLeft = getDaysUntilDeadline(notice.deadline);
  const deadlineStatus = getDeadlineStatus(notice.deadline);
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const isExpired = daysLeft !== null && daysLeft < 0;

  return (
    <>
      {/* 페이지 메타데이터 */}
      <Head>
        <title>{notice.title} - JB SQUARE</title>
        <meta name="description" content={notice.content || '공고 상세 정보'} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/sample-board"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              목록으로 돌아가기
            </Link>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 공고 카드 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* 헤더 섹션 */}
            <div className="p-6 border-b">
              {/* 출처와 마감일 */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${sourceDisplay.bg} ${sourceDisplay.text}`}
                >
                  {sourceDisplay.name}
                </span>

                {notice.deadline && (
                  <span
                    className={`
                      px-4 py-2 rounded-full text-sm font-semibold
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {notice.title}
              </h1>

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{notice.organization || '미지정'}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>게시일: {formatDate(notice.published_at)}</span>
                </div>
                {notice.deadline && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>마감일: {formatDate(notice.deadline)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 본문 섹션 */}
            <div className="p-6">
              {/* PDF 뷰어 (JBTP, 유관기관 등) */}
              {notice.content_type === 'pdf_viewer' && notice.content_viewer_url ? (
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
              ) : notice.content ? (
                <div className="mb-6">
                  {notice.content_type === 'html' ? (
                    <div
                      className="notice-content-body"
                      dangerouslySetInnerHTML={{ __html: notice.content }}
                    />
                  ) : (
                    <div className="notice-content-body">
                      <pre className="whitespace-pre-wrap">{notice.content}</pre>
                    </div>
                  )}
                </div>
              ) : notice.link ? (
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
              ) : (
                <div className="mb-6 bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
                  <p className="text-gray-500 italic">상세 내용이 제공되지 않습니다.</p>
                </div>
              )}

              {/* 외부 링크 (content가 있는 경우에만 별도 표시) */}
              {notice.content && notice.link && (
                <div className="mb-6">
                  <a
                    href={notice.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    원문 보기
                  </a>
                </div>
              )}

              {/* 태그 */}
              {notice.tags && notice.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {notice.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 첨부파일 */}
              {notice.attachment_links && notice.attachment_links.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    첨부파일 ({notice.attachment_links.length})
                  </h3>
                  <ul className="attachment-list">
                    {notice.attachment_links.map((attachment, index) => {
                      const decodedFilename = decodeURIComponent(attachment.filename.replace(/\+/g, ' '));

                      return (
                        <li key={index} className="attachment-item">
                          <span className="attachment-icon">📎</span>
                          <span className="attachment-name">{decodedFilename}</span>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-download"
                          >
                            다운로드
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* 추가 정보 섹션 */}
            <div className="p-6 bg-gray-50 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상세 정보</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">공고 ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{notice.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">상태</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {notice.status === 'published' && '게시됨'}
                    {notice.status === 'pending' && '대기중'}
                    {notice.status === 'archived' && '보관됨'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">출처</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {notice.origin_type === 'crawled' ? '크롤링' : '수동 등록'}
                  </dd>
                </div>
                {notice.crawler_source_id && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">출처 ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{notice.crawler_source_id}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">등록일</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(notice.created_at, true)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">수정일</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(notice.updated_at, true)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/sample-board"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              목록으로
            </Link>
            {notice.link && (
              <a
                href={notice.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                원문 보기
              </a>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
