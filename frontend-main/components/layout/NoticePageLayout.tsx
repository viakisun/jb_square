/**
 * 🎨 공고 페이지 공통 레이아웃 컴포넌트
 *
 * 모든 공고 페이지(정부공고, 지자체공고, 유관기관공고, 기업마당공고)에서
 * 재사용되는 공통 레이아웃을 제공합니다.
 *
 * **디자인 언어:** bio-cluster/cluster.tsx와 동일
 *
 * **구조:**
 * 1. Breadcrumb (홈 > JB 지원사업 공고 > [현재 페이지])
 * 2. Category Label (cyan 색상)
 * 3. Main Title (60px bold)
 * 4. Info Box (아이콘 + 설명)
 * 5. Children (공고 목록이 들어갈 자리)
 *
 * **사용 예시:**
 * ```tsx
 * <NoticePageLayout
 *   pageTitle="정부공고"
 *   pageSubtitle="정부 부처에서 발표하는 각종 지원 사업 및 공고"
 *   infoTitle="정부공고란?"
 *   infoDescription="중앙 정부 각 부처에서 발표하는 바이오 산업 관련..."
 *   breadcrumbCurrent="정부공고"
 * >
 *   <NoticeList notices={notices} />
 *   <Pagination ... />
 * </NoticePageLayout>
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * 컴포넌트 Props 인터페이스
 */
interface NoticePageLayoutProps {
  /** 페이지 메인 타이틀 (예: "정부공고") */
  pageTitle: string;

  /** 페이지 서브타이틀 (설명) */
  pageSubtitle: string;

  /** Category Label (예: "JB 지원사업 공고", "뉴스/행사") - 기본값: "JB 지원사업 공고" */
  categoryLabel?: string;

  /** Breadcrumb 부모 단계 라벨 (기본값: categoryLabel) */
  breadcrumbParent?: string;

  /** Breadcrumb 부모 단계 링크 (기본값: undefined) */
  breadcrumbParentHref?: string;

  /** Breadcrumb 마지막 단계 라벨 (기본값: pageTitle) */
  breadcrumbCurrent?: string;

  /** 자식 컴포넌트 (공고 목록, 페이지네이션 등) */
  children: React.ReactNode;
}

/**
 * 공고 페이지 공통 레이아웃 컴포넌트
 */
export const NoticePageLayout: React.FC<NoticePageLayoutProps> = ({
  pageTitle,
  pageSubtitle,
  categoryLabel = 'JB 지원사업 공고',
  breadcrumbCurrent,
  breadcrumbParent,
  breadcrumbParentHref,
  children,
}) => {
  const currentBreadcrumb = breadcrumbCurrent ?? pageTitle;
  const parentBreadcrumb = breadcrumbParent ?? categoryLabel;

  const renderBreadcrumbPill = (text: string, href?: string) => {
    const content = (
      <div
        style={{
          padding: '2px 4px',
          background: '#FFFFFF',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            color: '#24272D',
            fontSize: '16px',
            fontFamily: 'Pretendard GOV',
            fontWeight: 500,
            lineHeight: '22.4px',
            wordWrap: 'break-word',
          }}
        >
          {text}
        </div>
      </div>
    );

    if (href) {
      return (
        <Link href={href} style={{ display: 'flex', alignItems: 'center' }}>
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - 모든 페이지 공통 */}
      <Header />

      {/* Main Content Container - cluster.tsx와 동일한 1060px 너비 */}
      <main className="max-w-[1060px] mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <section className="mb-8">
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'inline-flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Link
              href="/"
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image src="/images/home-03.svg" alt="홈" width={16} height={16} />
            </Link>
            <Image src="/images/icon16.svg" alt="" width={16} height={16} />
            {renderBreadcrumbPill(parentBreadcrumb, breadcrumbParentHref)}
            <Image src="/images/icon16.svg" alt="" width={16} height={16} />
            {renderBreadcrumbPill(currentBreadcrumb)}
          </div>
        </section>

        {/* ============================================
            1. PAGE TITLE
            ============================================ */}
        <section className="mb-16">
          {/* Category Label - 청록색(cyan) 강조 */}
          <div className="mb-4">
            <span className="text-[#00B8CC] font-semibold text-base tracking-tight">
              {categoryLabel}
            </span>
          </div>

          {/* Main Title - 60px 대형 타이틀 */}
          <h1 className="text-[60px] font-bold leading-[84px] text-[#121418] mb-4">
            {pageTitle}
          </h1>

          {/* Subtitle - 페이지 설명 */}
          <p className="text-lg text-gray-600 leading-relaxed">
            {pageSubtitle}
          </p>
        </section>

        {/* ============================================
            2. CHILDREN - 공고 목록 및 페이지네이션
            ============================================ */}
        <section>
          {children}
        </section>

      </main>

      {/* Footer - 모든 페이지 공통 */}
      <Footer />
    </div>
  );
};

export default NoticePageLayout;
