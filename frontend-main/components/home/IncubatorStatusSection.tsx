/**
 * 🏢 창업 보육센터 현황 섹션 컴포넌트 (홈페이지용)
 *
 * 메인 페이지의 창업 보육센터 현황 섹션
 * - 필터링 (전체/접수중/접수예정)
 * - 입주율 프로그레스 바
 * - 간결한 카드 레이아웃
 *
 * Figma 디자인 기반으로 구현
 *
 * @example
 * <IncubatorStatusSection />
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BICenter, BICenterListResponse } from '@/lib/api/types';
import api from '@/lib/api/client';

type FilterType = 'all' | 'accepting' | 'upcoming';

export const IncubatorStatusSection: React.FC = () => {
  /**
   * BI 센터 데이터 상태
   */
  const [centers, setCenters] = useState<BICenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  /**
   * 입주율 계산
   * 입주율 = (입주기업수 / 전체공간수) × 100
   * 전체공간수 = 입주기업수 + 잔여실
   */
  const calculateOccupancyRate = (center: BICenter): number => {
    const companiesCount = center.companies_count || 0;
    const vacant = parseInt(center.vacant_rooms || '0');
    const total = companiesCount + vacant;
    if (total === 0) return 0;
    return Math.round((companiesCount / total) * 100);
  };

  /**
   * 접수 상태 판단
   */
  const getAcceptingStatus = (center: BICenter): 'accepting' | 'upcoming' | 'closed' => {
    const vacant = parseInt(center.vacant_rooms || '0');
    if (vacant > 0) return 'accepting';
    return 'closed';
  };

  /**
   * BI 센터 데이터 조회
   */
  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.client.get<BICenterListResponse>('/api/bi-centers/list', {
        params: {
          limit: 20,
          skip: 0
        }
      });

      setCenters(response.data.items);
      setTotalCount(response.data.total);
    } catch (err) {
      console.error('Failed to fetch BI centers:', err);
      setError('창업보육센터 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 필터링된 센터 목록
   */
  const filteredCenters = centers.filter((center) => {
    if (activeFilter === 'all') return true;
    const status = getAcceptingStatus(center);
    if (activeFilter === 'accepting') return status === 'accepting';
    if (activeFilter === 'upcoming') return status === 'upcoming';
    return true;
  });

  /**
   * 컴포넌트 마운트 시 데이터 로딩
   */
  useEffect(() => {
    fetchCenters();
  }, []);

  return (
    <section style={{ paddingTop: '80px', paddingBottom: '80px', backgroundColor: '#F3F6FB', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1520px', margin: '0 auto', padding: '0 20px' }}>
        {/* 섹션 헤더 */}
        <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '24px', display: 'flex', marginBottom: '50px' }}>
          <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-end', display: 'inline-flex' }}>
            <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '4px', display: 'inline-flex' }}>
              <h2 style={{ color: '#121418', fontSize: '48px', fontWeight: '700', lineHeight: '72px', wordWrap: 'break-word' }}>
                창업 보육센터 현황
              </h2>
              <p style={{ color: '#6C747E', fontSize: '20px', fontWeight: '400', lineHeight: '26px', wordWrap: 'break-word' }}>
                전북 지역 바이오 창업보육센터의 입주 가능 현황과 상세 정보를 확인할 수 있습니다.
              </p>
            </div>
            <Link
              href="/incubator/centers"
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
              <span style={{ color: '#24272D', fontSize: '18px', fontWeight: '500', lineHeight: '27px', wordWrap: 'break-word' }}>
                더보기
              </span>
              <div style={{ width: '24px', height: '24px', position: 'relative', overflow: 'hidden' }}>
                <svg style={{ width: '10px', height: '5px', position: 'absolute', left: '9.5px', top: '17px', transform: 'rotate(-90deg)', transformOrigin: 'top left' }} fill="none" viewBox="0 0 10 5">
                  <path d="M0 0L5 5L10 0" stroke="#24272D" strokeWidth="1.5" />
                </svg>
              </div>
            </Link>
          </div>

          {/* 필터 버튼 */}
          <div style={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px', display: 'inline-flex' }}>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '8px',
                paddingBottom: '8px',
                background: activeFilter === 'all' ? '#10409A' : 'transparent',
                borderRadius: '8px',
                outline: activeFilter === 'all' ? 'none' : '1px #D6DBE1 solid',
                outlineOffset: '-1px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'flex',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ color: activeFilter === 'all' ? '#FFFFFF' : '#565B64', fontSize: '20px', fontWeight: '500', lineHeight: '30px', wordWrap: 'break-word' }}>
                전체
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('accepting')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '8px',
                paddingBottom: '8px',
                background: activeFilter === 'accepting' ? '#10409A' : 'transparent',
                borderRadius: '8px',
                outline: activeFilter === 'accepting' ? 'none' : '1px #D6DBE1 solid',
                outlineOffset: '-1px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'flex',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ color: activeFilter === 'accepting' ? '#FFFFFF' : '#565B64', fontSize: '20px', fontWeight: '500', lineHeight: '30px', wordWrap: 'break-word' }}>
                접수중
              </span>
            </button>
            <button
              onClick={() => setActiveFilter('upcoming')}
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '8px',
                paddingBottom: '8px',
                background: activeFilter === 'upcoming' ? '#10409A' : 'transparent',
                borderRadius: '8px',
                outline: activeFilter === 'upcoming' ? 'none' : '1px #D6DBE1 solid',
                outlineOffset: '-1px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'flex',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ color: activeFilter === 'upcoming' ? '#FFFFFF' : '#565B64', fontSize: '20px', fontWeight: '500', lineHeight: '30px', wordWrap: 'break-word' }}>
                접수예정
              </span>
            </button>
          </div>
        </div>

        {/* 센터 목록 */}
        {loading ? (
          // 로딩 스켈레톤
          <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                style={{
                  alignSelf: 'stretch',
                  paddingTop: '24px',
                  paddingBottom: '24px',
                  borderTop: index === 0 ? '2px solid #10409A' : '1px solid #B9C1C9',
                  height: '100px'
                }}
                className="animate-pulse"
              >
                <div style={{ height: '100%', background: '#E1E6EC', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          // 에러 메시지
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchCenters}
              className="px-6 py-2 bg-gray-900 text-white hover:bg-black transition-colors rounded-lg"
            >
              다시 시도
            </button>
          </div>
        ) : filteredCenters.length === 0 ? (
          // 센터 없음
          <div className="text-center py-12">
            <p className="text-gray-600">
              {activeFilter === 'all'
                ? '등록된 창업보육센터가 없습니다.'
                : activeFilter === 'accepting'
                ? '현재 접수중인 센터가 없습니다.'
                : '접수 예정인 센터가 없습니다.'}
            </p>
          </div>
        ) : (
          // 센터 카드 리스트
          <div>
            {filteredCenters.slice(0, 6).map((center, index) => {
              const occupancyRate = calculateOccupancyRate(center);
              const status = getAcceptingStatus(center);
              const companiesCount = center.companies_count || 0;
              const vacant = parseInt(center.vacant_rooms || '0');
              const total = companiesCount + vacant;
              const isFirst = index === 0;

              return (
                <div
                  key={center.id}
                  className="transition-all"
                  style={{
                    paddingTop: '24px',
                    paddingBottom: '24px',
                    borderTop: isFirst ? '2px solid #10409A' : '1px solid #B9C1C9'
                  }}
                >
                  <div className="flex items-center justify-between">
                    {/* 좌측: 공실 정보 (파란 점 + 숫자) */}
                    <div className="flex items-center gap-3" style={{ width: '120px', flexShrink: 0 }}>
                      <div className="rounded-full" style={{ width: '10px', height: '10px', backgroundColor: '#00B8CD' }}></div>
                      <span className="font-medium" style={{ fontSize: '20px', letterSpacing: '-0.2px', lineHeight: '30px', color: '#1B1E23', width: '100px' }}>
                        {vacant}실 / {total}실
                      </span>
                    </div>

                    {/* 센터명 */}
                    <div style={{ flex: 1, minWidth: '200px', marginLeft: '32px' }}>
                      <h3 className="font-semibold" style={{ fontSize: '20px', letterSpacing: '-0.6px', lineHeight: '30px', color: isFirst ? '#00B8CD' : '#24272D' }}>
                        {center.center_name}
                      </h3>
                    </div>

                    {/* 우측: 입주율 + VIEW MORE */}
                    <div className="flex items-center" style={{ gap: '80px', flexShrink: 0, marginLeft: 'auto' }}>
                      {/* 입주율 섹션 */}
                      <div className="flex-col" style={{ width: '318px', gap: '6px', display: 'inline-flex' }}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium" style={{ fontSize: '18px', letterSpacing: '-0.18px', lineHeight: '27px', color: '#6C747E' }}>
                            입주율
                          </span>
                          <span className="font-medium" style={{ fontSize: '18px', letterSpacing: '-0.18px', lineHeight: '27px', color: '#565B64', fontFamily: 'Geist Mono, monospace' }}>
                            {occupancyRate}%
                          </span>
                        </div>
                        {/* 프로그레스 바 */}
                        <div className="w-full relative" style={{ height: '6px', borderRadius: '2px' }}>
                          <div style={{ width: '318px', height: '5.65px', backgroundColor: '#E1E6EC', borderRadius: '2px', position: 'absolute' }} />
                          <div style={{ width: `${(occupancyRate / 100) * 318}px`, height: '5.65px', backgroundColor: '#00B8CD', borderRadius: '2px', position: 'absolute' }} />
                        </div>
                      </div>

                      {/* VIEW MORE 버튼 */}
                      <Link
                        href={`/incubator/centers/${center.id}`}
                        className="font-medium rounded-lg flex items-center gap-0.5"
                        style={{
                          fontSize: '14px',
                          fontFamily: 'Geist',
                          fontWeight: '500',
                          paddingLeft: '16px',
                          paddingRight: '16px',
                          paddingTop: '12px',
                          paddingBottom: '12px',
                          backgroundColor: isFirst ? '#10409A' : 'transparent',
                          color: isFirst ? '#FFFFFF' : '#24272D'
                        }}
                      >
                        VIEW MORE
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                          <path d="M5.6 7.2L12 13.53L18.4 7.2" stroke="currentColor" strokeWidth="1.5" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default IncubatorStatusSection;
