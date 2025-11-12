/**
 * 🏢 주요 기업 섹션 컴포넌트
 *
 * 메인 페이지의 주요 기업 섹션
 * - 전북 바이오 산업의 핵심 기업 소개
 * - 2열 그리드 레이아웃
 * - 기업 로고 + 설명 카드 형태
 * - API에서 실시간 기업 데이터 조회
 *
 * Figma 디자인 기반으로 구현
 *
 * @example
 * <PartnerSection />
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';
import { Organization } from '@/lib/api/types';
import api from '@/lib/api/client';
import { RESPONSIVE, FONT_SIZES, SPACING } from '@/lib/utils/responsive';

export const PartnerSection: React.FC = () => {
  const [companies, setCompanies] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 기업 데이터 조회
   */
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.organizations.getList({
        limit: 6,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      setCompanies(response.items);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('기업 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 컴포넌트 마운트 시 데이터 로딩
   */
  useEffect(() => {
    fetchCompanies();
  }, []);

  /**
   * 기업명 표시 (company_name 또는 name 사용)
   */
  const getCompanyName = (company: Organization): string => {
    return company.company_name || company.name || '이름 없음';
  };

  /**
   * 기업 설명 생성 (주요제품명 사용, 없으면 기본 문구)
   */
  const getCompanyDescription = (company: Organization): string => {
    if (company.main_products) {
      return company.main_products;
    }
    return '전북 바이오 산업의 핵심 기업입니다.';
  };

  /**
   * 로고 컴포넌트 렌더링
   */
  const renderCompanyLogo = (company: Organization) => {
    // TODO: 추후 실제 로고 URL 필드 추가 시 사용
    const logoUrl = null; // company.logo_url

    if (logoUrl) {
      return <img src={logoUrl} alt={getCompanyName(company)} className="w-full h-full object-contain p-4" />;
    }

    // 로고가 없을 때: 기업명 첫 2글자를 그라디언트 배경과 함께 표시
    const companyName = getCompanyName(company);

    // 기업 ID 기반으로 색상 선택 (일관된 색상 유지)
    const colors = [
      { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#FFFFFF' },
      { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#FFFFFF' },
      { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#FFFFFF' },
      { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#FFFFFF' },
      { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#FFFFFF' },
      { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', text: '#FFFFFF' },
    ];

    const colorIndex = company.id % colors.length;
    const color = colors[colorIndex];

    if (companyName && companyName.length >= 2) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: color.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: '700',
            color: color.text,
            letterSpacing: '-0.5px'
          }}
        >
          {companyName.substring(0, 2)}
        </div>
      );
    }

    // 기본 빌딩 아이콘
    return (
      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    );
  };

  return (
    <section style={{ paddingTop: SPACING.SECTION, paddingBottom: SPACING.SECTION, backgroundColor: '#FFFFFF' }}>
      <div style={{ maxWidth: RESPONSIVE.CONTAINER_WIDTH, margin: '0 auto', padding: '0 20px' }}>
        {/* 섹션 헤더 */}
        <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-end', display: 'inline-flex', marginBottom: SPACING.LG }}>
          <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '4px', display: 'inline-flex' }}>
            <h2 style={{ color: '#121418', fontSize: FONT_SIZES.HEADING_XL, fontWeight: '700', lineHeight: '1.5', wordWrap: 'break-word' }}>
              주요 기업
            </h2>
            <p style={{ color: '#6C747E', fontSize: FONT_SIZES.BODY_LG, fontWeight: '400', lineHeight: '1.3', wordWrap: 'break-word' }}>
              바이오 산업의 미래 가치를 만들어가는 전북의 핵심 기업들을 소개합니다.
            </p>
          </div>
          <Link
            href="/companies/directory"
            style={{
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '12px',
              paddingBottom: '12px',
              background: '#FFFFFF',
              borderRadius: '8px',
              outline: '1px #D6DBE1 solid',
              outlineOffset: '-1px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              display: 'flex'
            }}
          >
            <span style={{ color: '#24272D', fontSize: FONT_SIZES.BODY_MD, fontWeight: '500', lineHeight: '1.5', wordWrap: 'break-word' }}>
              더보기
            </span>
            <div style={{ width: '24px', height: '24px', position: 'relative', overflow: 'hidden' }}>
              <svg style={{ width: '10px', height: '5px', position: 'absolute', left: '9.5px', top: '17px', transform: 'rotate(-90deg)', transformOrigin: 'top left' }} fill="none" viewBox="0 0 10 5">
                <path d="M0 0L5 5L10 0" stroke="#24272D" strokeWidth="1.5" />
              </svg>
            </div>
          </Link>
        </div>

      {/* 기업 목록 */}
      {loading ? (
        // 로딩 상태
        <div className="flex flex-col" style={{ gap: '40px' }}>
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex" style={{ gap: '60px' }}>
              {Array.from({ length: 2 }).map((_, colIndex) => (
                <div key={colIndex} className="flex items-center animate-pulse" style={{ flex: '1 1 0', gap: '24px' }}>
                  <div className="rounded-full bg-gray-200" style={{ width: '100px', height: '100px', flexShrink: 0 }} />
                  <div className="flex flex-col" style={{ flex: '1 1 0', gap: '8px' }}>
                    <div className="h-6 bg-gray-200 rounded" style={{ width: '60%' }} />
                    <div className="h-4 bg-gray-200 rounded" style={{ width: '100%' }} />
                    <div className="h-4 bg-gray-200 rounded" style={{ width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : error ? (
        // 에러 상태
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCompanies}
            className="px-6 py-2 bg-gray-900 text-white hover:bg-black transition-colors rounded-lg"
          >
            다시 시도
          </button>
        </div>
      ) : companies.length === 0 ? (
        // 데이터 없음
        <div className="text-center py-12">
          <p className="text-gray-600">등록된 기업이 없습니다.</p>
        </div>
      ) : (
        // 기업 목록
        <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: '40px', display: 'flex' }}>
          {/* Row 1 */}
          <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '60px', display: 'inline-flex' }}>
            {companies.slice(0, 2).map((company) => (
              <div key={company.id} style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: '24px', display: 'flex' }}>
                {/* 로고 */}
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '50px',
                    outline: '1px #D6DBE1 solid',
                    outlineOffset: '-1px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  {renderCompanyLogo(company)}
                </div>

                {/* 기업 정보 */}
                <div style={{ flex: '1 1 0', overflow: 'hidden', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'inline-flex' }}>
                  <h3 style={{ alignSelf: 'stretch', color: '#121418', fontSize: FONT_SIZES.HEADING_MD, fontWeight: '600', lineHeight: '1.5', wordWrap: 'break-word' }}>
                    {getCompanyName(company)}
                  </h3>
                  <p
                    style={{
                      alignSelf: 'stretch',
                      height: '54px',
                      color: '#565B64',
                      fontSize: FONT_SIZES.BODY_MD,
                      fontWeight: '400',
                      lineHeight: '1.5',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {getCompanyDescription(company)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2 */}
          {companies.length > 2 && (
            <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '60px', display: 'inline-flex' }}>
              {companies.slice(2, 4).map((company) => (
                <div key={company.id} style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: '24px', display: 'flex' }}>
                  {/* 로고 */}
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '50px',
                      outline: '1px #D6DBE1 solid',
                      outlineOffset: '-1px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {renderCompanyLogo(company)}
                  </div>

                  {/* 기업 정보 */}
                  <div style={{ flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'inline-flex' }}>
                    <h3 style={{ alignSelf: 'stretch', color: '#121418', fontSize: FONT_SIZES.HEADING_MD, fontWeight: '600', lineHeight: '1.5', wordWrap: 'break-word' }}>
                      {getCompanyName(company)}
                    </h3>
                    <p
                      style={{
                        alignSelf: 'stretch',
                        height: '54px',
                        color: '#565B64',
                        fontSize: FONT_SIZES.BODY_MD,
                        fontWeight: '400',
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {getCompanyDescription(company)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Row 3 */}
          {companies.length > 4 && (
            <div style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '60px', display: 'inline-flex' }}>
              {companies.slice(4, 6).map((company) => (
                <div key={company.id} style={{ flex: '1 1 0', justifyContent: 'flex-start', alignItems: 'center', gap: '24px', display: 'flex' }}>
                  {/* 로고 */}
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '50px',
                      outline: '1px #D6DBE1 solid',
                      outlineOffset: '-1px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {renderCompanyLogo(company)}
                  </div>

                  {/* 기업 정보 */}
                  <div style={{ flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'inline-flex' }}>
                    <h3 style={{ alignSelf: 'stretch', color: '#121418', fontSize: FONT_SIZES.HEADING_MD, fontWeight: '600', lineHeight: '1.5', wordWrap: 'break-word' }}>
                      {getCompanyName(company)}
                    </h3>
                    <p
                      style={{
                        alignSelf: 'stretch',
                        height: '54px',
                        color: '#565B64',
                        fontSize: FONT_SIZES.BODY_MD,
                        fontWeight: '400',
                        lineHeight: '1.5',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {getCompanyDescription(company)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </section>
  );
};

export default PartnerSection;
