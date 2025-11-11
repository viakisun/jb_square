/**
 * 공고 상세 페이지
 *
 * 개별 공고의 상세 정보를 표시하는 페이지입니다.
 * Next.js의 Dynamic Routes를 사용하여 공고 ID를 URL에서 받아옵니다.
 *
 * URL 예시: /notices/123 (123은 공고 ID)
 *
 * 주요 기능:
 * - Dynamic Routes로 공고 ID 파라미터 받기
 * - API 호출하여 공고 상세 정보 조회
 * - 로딩/에러/성공 상태 처리
 * - content_type에 따른 유연한 콘텐츠 렌더링
 * - 미니멀하고 전문적인 UI
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/lib/api/client';
import { Notice } from '@/lib/api/types';
import { getDeadlineStatus, getDaysUntilDeadline } from '@/lib/utils/date';
import { getErrorMessage, logError } from '@/lib/utils/errors';
import { NoticeContentRenderer } from '@/components/notices/NoticeContentRenderer';
import { NoticeMetaInfo } from '@/components/notices/NoticeMetaInfo';
import { AttachmentList } from '@/components/notices/AttachmentList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Source ID로부터 표시 이름을 가져오는 유틸리티 함수
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
  }

  return '기타';
}

/**
 * 공고 상세 페이지 컴포넌트
 */
export default function NoticeDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
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

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin h-12 w-12 border-2 border-gray-900 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-sm">공고를 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 에러 상태
  if (error || !notice) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="bg-white border-2 border-red-600 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                오류가 발생했습니다
              </h2>
              <p className="text-gray-600 mb-6">{error || '공고를 찾을 수 없습니다.'}</p>
              <div className="flex gap-4">
                <Link
                  href="/notices/notice-government"
                  className="px-6 py-3 bg-gray-900 text-white hover:bg-black transition-colors font-medium"
                >
                  공고 목록으로
                </Link>
                <button
                  onClick={() => router.reload()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 hover:border-gray-900 transition-colors font-medium"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const daysLeft = getDaysUntilDeadline(notice.deadline);
  const deadlineStatus = getDeadlineStatus(notice.deadline);
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const isExpired = daysLeft !== null && daysLeft < 0;
  const sourceName = getSourceName(notice.crawler_source_id);

  return (
    <>
      <Head>
        <title>{notice.title} - JB SQUARE</title>
        <meta name="description" content={notice.content || '공고 상세 정보'} />
      </Head>

      <div className="min-h-screen bg-white flex flex-col">
        <Header />

        <div className="flex-1 bg-gray-50">
          {/* 상단 네비게이션 */}
          <div className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                목록으로
              </button>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 공고 상세 카드 */}
            <div className="bg-white border border-gray-200">
              {/* 헤더 */}
              <div className="p-8 border-b border-gray-200">
                {/* 상태 및 출처 */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {/* 출처 */}
                    <span className="text-xs font-bold tracking-wider uppercase text-gray-600">
                      {sourceName}
                    </span>

                    <div className="w-px h-3 bg-gray-300"></div>

                    {/* 마감 상태 */}
                    {notice.deadline ? (
                      <span
                        className={`
                          text-xs font-bold tracking-wider uppercase
                          ${isExpired ? 'text-gray-400' : isUrgent ? 'text-red-600' : 'text-gray-900'}
                        `}
                      >
                        {deadlineStatus}
                      </span>
                    ) : (
                      <span className="text-xs font-bold tracking-wider uppercase text-green-600">
                        상시모집
                      </span>
                    )}

                    <div className="w-px h-3 bg-gray-300"></div>

                    {/* 접수 상태 */}
                    <span
                      className={`
                        text-xs font-bold tracking-wider uppercase
                        ${isExpired ? 'text-gray-400' : 'text-green-600'}
                      `}
                    >
                      {isExpired ? '마감' : '접수중'}
                    </span>
                  </div>
                </div>

                {/* 제목 */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                  {notice.title}
                </h1>

                {/* 메타 정보 */}
                <NoticeMetaInfo notice={notice} />
              </div>

              {/* 본문 */}
              <div className="p-8">
                {/* 콘텐츠 */}
                <div className="mb-8">
                  <NoticeContentRenderer notice={notice} />
                </div>

                {/* 원문 링크 */}
                {notice.content && notice.link && (
                  <div className="mb-8">
                    <a
                      href={notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-gray-900 text-white hover:bg-black transition-colors font-medium"
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
                  <div className="mb-8 pt-8 border-t border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase">태그</h3>
                    <div className="flex flex-wrap gap-2">
                      {notice.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 border border-gray-300 text-gray-700 text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 첨부파일 */}
                <div className="pt-8 border-t border-gray-200">
                  <AttachmentList attachments={notice.attachment_links} />
                </div>
              </div>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors font-medium"
              >
                목록으로
              </button>
              {notice.link && (
                <a
                  href={notice.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gray-900 text-white hover:bg-black transition-colors font-medium"
                >
                  원문 보기
                </a>
              )}
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}
