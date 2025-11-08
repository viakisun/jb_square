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
import { formatDate, formatDateSimple, getDeadlineStatus, getDaysUntilDeadline } from '@/lib/utils/date';
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
   * 카테고리 색상 맵핑
   */
  const categoryColors: Record<Notice['category'], { bg: string; text: string }> = {
    government: { bg: 'bg-blue-100', text: 'text-blue-800' },
    business: { bg: 'bg-green-100', text: 'text-green-800' },
    rnd: { bg: 'bg-purple-100', text: 'text-purple-800' },
    startup: { bg: 'bg-orange-100', text: 'text-orange-800' }
  };

  /**
   * 카테고리 한글 이름
   */
  const categoryNames: Record<Notice['category'], string> = {
    government: '정부사업',
    business: '민간사업',
    rnd: 'R&D',
    startup: '스타트업'
  };

  const categoryColor = categoryColors[notice.category];
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
              {/* 카테고리와 마감일 */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${categoryColor.bg} ${categoryColor.text}`}
                >
                  {categoryNames[notice.category]}
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
              {/* 내용 */}
              {notice.content ? (
                <div className="mb-6">
                  {notice.content_type === 'html' ? (
                    <div
                      className="prose prose-lg prose-slate max-w-none
                        prose-headings:text-gray-900 prose-headings:font-bold
                        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:pb-2 prose-h3:border-b-2 prose-h3:border-blue-500
                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4
                        prose-ul:my-4 prose-li:my-2
                        prose-strong:text-gray-900 prose-strong:font-semibold"
                      dangerouslySetInnerHTML={{ __html: notice.content }}
                    />
                  ) : (
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {notice.content}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic mb-6">내용이 없습니다.</p>
              )}

              {/* 외부 링크 */}
              {notice.link && (
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
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">첨부파일</h3>
                  <div className="space-y-2">
                    {notice.attachment_links.map((attachment, index) => {
                      const getFileExtension = (filename: string) => {
                        const ext = filename.split('.').pop()?.toLowerCase();
                        return ext || '';
                      };

                      const getFileIcon = (ext: string) => {
                        const iconColors: Record<string, string> = {
                          'pdf': 'text-red-600',
                          'hwp': 'text-blue-600',
                          'doc': 'text-blue-700',
                          'docx': 'text-blue-700',
                          'xls': 'text-green-600',
                          'xlsx': 'text-green-600',
                          'ppt': 'text-orange-600',
                          'pptx': 'text-orange-600',
                          'zip': 'text-purple-600',
                        };
                        return iconColors[ext] || 'text-gray-600';
                      };

                      const ext = getFileExtension(attachment.filename);
                      const iconColor = getFileIcon(ext);
                      const decodedFilename = decodeURIComponent(attachment.filename.replace(/\+/g, ' '));

                      return (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group"
                        >
                          <svg className={`w-8 h-8 mr-3 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                              {decodedFilename}
                            </p>
                            <p className="text-xs text-gray-500 uppercase">
                              {ext} 파일
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
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
