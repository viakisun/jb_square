/**
 * 🏢 기업 상세 정보 페이지
 *
 * 특정 기업의 상세 정보를 표시합니다.
 * - 동적 라우팅: /companies/[id]
 * - Organizations API를 통한 실시간 데이터 조회
 * - 기업 기본정보, 사업정보, 연락처 표시
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';
import { useOrganization } from '@/hooks/useOrganizations';

const CompanyDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // 기업 상세 정보 조회
  const { company, loading, error } = useOrganization(id ? Number(id) : null);

  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB 기업정보', href: '/companies/directory' },
    { label: company?.name || '기업 상세' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* 로딩 상태 */}
      {loading && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-blue mb-4"></div>
            <p className="text-gray-600">기업 정보를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
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
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
              >
                다시 시도
              </button>
              <Link
                href="/companies/directory"
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                목록으로
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 기업 정보 */}
      {!loading && !error && company && (
        <>
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-primary-blue to-primary-cyan py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center gap-6">
                {/* 기업 로고 플레이스홀더 */}
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30">
                  <div className="text-6xl">🏢</div>
                </div>

                {/* 기업 기본 정보 */}
                <div className="flex-1 text-white">
                  <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
                  {company.ceo && (
                    <p className="text-xl text-white/90 mb-3">
                      대표: {company.ceo}
                    </p>
                  )}
                  {company.industry && (
                    <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                      {company.industry}
                    </div>
                  )}
                </div>

                {/* 목록으로 버튼 */}
                <Link
                  href="/companies/directory"
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  목록으로
                </Link>
              </div>
            </div>
          </section>

          {/* 메인 콘텐츠 */}
          <main className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              {/* 기업 설명 */}
              {company.description && (
                <section className="mb-12">
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">기업 소개</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {company.description}
                    </p>
                  </div>
                </section>
              )}

              {/* 기업 기본 정보 */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">기업 정보</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 좌측: 기본 정보 */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900">기본 정보</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <InfoRow label="기업명" value={company.name} />
                      {company.ceo && <InfoRow label="대표자" value={company.ceo} />}
                      {company.industry && <InfoRow label="산업 분야" value={company.industry} />}
                      {company.established_date && (
                        <InfoRow
                          label="설립일"
                          value={new Date(company.established_date).toLocaleDateString('ko-KR')}
                        />
                      )}
                    </div>
                  </div>

                  {/* 우측: 연락 정보 */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900">연락 정보</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {company.address && (
                        <InfoRow
                          label="주소"
                          value={company.address}
                          icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          }
                        />
                      )}
                      {company.website && (
                        <InfoRow
                          label="웹사이트"
                          value={
                            <a
                              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-blue hover:underline"
                            >
                              {company.website}
                            </a>
                          }
                          icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                              />
                            </svg>
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* 관련 기업 또는 추가 정보 섹션 */}
              <section className="mb-12">
                <div className="bg-blue-50 border-l-4 border-primary-blue p-6 rounded-r-lg">
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-primary-blue mt-0.5 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        기업 정보 문의
                      </h3>
                      <p className="text-gray-700 text-sm mb-3">
                        추가적인 기업 정보가 필요하시거나 협력을 원하시는 경우,
                        아래 연락처로 문의해주시기 바랍니다.
                      </p>
                      <div className="text-sm text-gray-700">
                        <p>📞 전화: 063-219-3600</p>
                        <p>✉️ 이메일: info@jbbia.or.kr</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 하단 네비게이션 */}
              <div className="flex justify-center">
                <Link
                  href="/companies/directory"
                  className="px-8 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors font-semibold"
                >
                  목록으로 돌아가기
                </Link>
              </div>
            </div>
          </main>
        </>
      )}

      <Footer />
    </div>
  );
};

/**
 * 정보 행 컴포넌트
 *
 * 레이블과 값을 표시하는 재사용 가능한 컴포넌트입니다.
 *
 * @param label - 정보 레이블 (예: "기업명", "대표자")
 * @param value - 정보 값 (문자열 또는 JSX 요소)
 * @param icon - 선택적 아이콘 (SVG 요소)
 */
const InfoRow: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="text-gray-400 mt-0.5 flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
        <div className="text-gray-900">{value || '-'}</div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
