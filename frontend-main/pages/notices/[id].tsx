/**
 * 📄 공고 상세 페이지
 *
 * 개별 공고의 상세 정보를 표시하는 페이지입니다.
 * Next.js의 Dynamic Routes를 사용하여 공고 ID를 URL에서 받아옵니다.
 *
 * **URL 예시:** /notices/123 (123은 공고 ID)
 *
 * **주요 기능:**
 * - Dynamic Routes로 공고 ID 파라미터 받기
 * - API 호출하여 공고 상세 정보 조회
 * - 로딩/에러/성공 상태 처리
 * - content_type에 따른 유연한 콘텐츠 렌더링
 * - 컴포넌트 분리로 깔끔한 구조 유지
 *
 * **디자인:** sample-board/[id].tsx와 일관된 디자인
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
import { NoticeContentRenderer } from '@/components/notices/NoticeContentRenderer';
import { NoticeMetaInfo } from '@/components/notices/NoticeMetaInfo';
import { AttachmentList } from '@/components/notices/AttachmentList';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Source ID로부터 표시 이름과 색상을 가져오는 유틸리티 함수
 *
 * @param sourceId - 공고 출처 ID (source:organization:type 형식)
 * @returns 표시 이름, 배경색, 텍스트색
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
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">공고를 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /**
   * 에러 상태 렌더링
   */
  if (error || !notice) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50">
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
                  href="/notices/notice-government"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  공고 목록으로
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
        <Footer />
      </div>
    );
  }

  /**
   * 마감일 관련 계산
   */
  const daysLeft = getDaysUntilDeadline(notice.deadline);
  const deadlineStatus = getDeadlineStatus(notice.deadline);
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const isExpired = daysLeft !== null && daysLeft < 0;

  /**
   * 출처 표시 정보
   */
  const sourceDisplay = getSourceDisplay(notice.crawler_source_id);

  return (
    <>
      {/* 페이지 메타데이터 */}
      <Head>
        <title>{notice.title} - JB SQUARE</title>
        <meta name="description" content={notice.content || '공고 상세 정보'} />
      </Head>

      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <Header />

        <div className="flex-1 bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.back()}
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
            </button>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 공고 카드 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* ==================== 헤더 섹션 ==================== */}
            <div className="p-6 border-b">
              {/* 출처와 마감일 배지 */}
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
              <NoticeMetaInfo notice={notice} />
            </div>

            {/* ==================== 본문 섹션 ==================== */}
            <div className="p-6">
              {/* 콘텐츠 렌더링 (content_type에 따라 자동 분기) */}
              <NoticeContentRenderer notice={notice} />

              {/* 외부 링크 (content가 있고 link도 있는 경우에만 별도 표시) */}
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
              <AttachmentList attachments={notice.attachment_links} />
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              목록으로
            </button>
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

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
