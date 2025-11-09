/**
 * 🏢 JB 창업보육센터 통합 페이지
 *
 * 전북 창업보육센터 통합 정보 페이지
 * - BI Centers API를 통한 실시간 데이터 조회
 * - 지역별 보육센터 현황
 * - 입주기업 정보
 * - 공실현황 포함 (별도 페이지 불필요)
 * - sample-board 스타일 참고
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { useBICenters, useBICompanies } from '@/hooks/useBICenters';

const IncubatorCentersPage: React.FC = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB 창업보육센터' },
  ];

  // 선택된 지역 상태 관리
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);

  // BI Centers API 훅 사용
  const { centers, loading: centersLoading, total: centersTotal } = useBICenters({
    region: selectedRegion || undefined,
    limit: 50
  });

  // 입주기업 API 훅 사용
  const { companies, loading: companiesLoading } = useBICompanies(
    selectedCenter,
    undefined
  );

  /**
   * 전북 14개 시/군 지역 목록
   */
  const regions = [
    '전주시', '군산시', '익산시', '정읍시', '남원시', '김제시',
    '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'
  ];

  /**
   * 공실이 있는 센터 개수 계산
   */
  const vacantCentersCount = centers.filter(c => c.vacant_rooms && c.vacant_rooms !== '없음').length;

  /**
   * 지역 선택 핸들러
   */
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCenter(null); // 지역 변경 시 센터 선택 초기화
  };

  /**
   * 센터 선택 핸들러
   */
  const handleCenterSelect = (centerId: number) => {
    setSelectedCenter(centerId === selectedCenter ? null : centerId);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-blue to-primary-cyan py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            JB 창업보육센터
          </h1>
          <p className="text-xl text-white/90 mb-8">
            전북 창업 보육 인프라와 입주기업 현황
          </p>

          {/* 주요 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold text-white">{centersTotal}</div>
              <div className="text-sm text-white/80">보육센터</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold text-white">{vacantCentersCount}</div>
              <div className="text-sm text-white/80">공실 있는 센터</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold text-white">
                {centers.reduce((sum, c) => sum + c.companies_count, 0)}
              </div>
              <div className="text-sm text-white/80">입주기업</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold text-white">14</div>
              <div className="text-sm text-white/80">시/군</div>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* 지역 선택 섹션 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">지역 선택</h2>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <button
                  onClick={() => handleRegionChange('')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedRegion === ''
                      ? 'bg-primary-blue text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-blue'
                  }`}
                >
                  전체
                </button>
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => handleRegionChange(region)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      selectedRegion === region
                        ? 'bg-primary-blue text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-blue'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 보육센터 목록 */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">보육센터 현황</h2>
              <p className="text-gray-600">
                총 <span className="font-bold text-primary-blue">{centers.length}</span>개 센터
                {selectedRegion && <span className="text-sm text-gray-500 ml-2">({selectedRegion})</span>}
              </p>
            </div>

            {/* 로딩 상태 */}
            {centersLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : centers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {centers.map((center) => (
                  <article
                    key={center.id}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border overflow-hidden cursor-pointer ${
                      selectedCenter === center.id
                        ? 'border-primary-blue ring-2 ring-primary-blue/20'
                        : 'border-gray-100'
                    }`}
                    onClick={() => handleCenterSelect(center.id)}
                  >
                    {/* 센터 헤더 */}
                    <div className="h-32 bg-gradient-to-br from-primary-blue/10 to-primary-cyan/10 flex items-center justify-center relative">
                      <div className="text-5xl">🏢</div>
                      {center.vacant_rooms && center.vacant_rooms !== '없음' && (
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                            공실 있음
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 센터 정보 */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {center.center_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">{center.org_name}</p>

                      <div className="space-y-3">
                        {center.location && (
                          <InfoItem
                            icon="📍"
                            label="위치"
                            value={center.location}
                          />
                        )}
                        <InfoItem
                          icon="🏢"
                          label="입주기업"
                          value={`${center.companies_count}개`}
                        />
                        {center.vacant_rooms && (
                          <InfoItem
                            icon="🔑"
                            label="공실"
                            value={center.vacant_rooms}
                            highlight={center.vacant_rooms !== '없음'}
                          />
                        )}
                        {center.specialization && (
                          <InfoItem
                            icon="🎯"
                            label="특화분야"
                            value={center.specialization}
                          />
                        )}
                        {center.contact && (
                          <InfoItem
                            icon="📞"
                            label="연락처"
                            value={center.contact}
                          />
                        )}
                      </div>

                      {selectedCenter === center.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs text-primary-blue font-medium">
                            ▼ 아래에서 입주기업 목록 확인
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-gray-600">
                  {selectedRegion
                    ? `${selectedRegion}에 등록된 보육센터가 없습니다.`
                    : '등록된 보육센터가 없습니다.'}
                </p>
              </div>
            )}
          </section>

          {/* 입주기업 섹션 */}
          {selectedCenter && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                입주기업 현황
                {centers.find(c => c.id === selectedCenter) && (
                  <span className="text-lg font-normal text-gray-600 ml-3">
                    ({centers.find(c => c.id === selectedCenter)?.center_name})
                  </span>
                )}
              </h2>

              {companiesLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                  <p className="mt-4 text-gray-600">입주기업 정보를 불러오는 중...</p>
                </div>
              ) : companies.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          {company.company_name}
                        </h3>
                        {company.business_field && (
                          <span className="px-3 py-1 bg-blue-50 text-primary-blue text-xs font-semibold rounded-full ml-2 flex-shrink-0">
                            {company.business_field}
                          </span>
                        )}
                      </div>

                      {company.product && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {company.product}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-600">등록된 입주기업 정보가 없습니다.</p>
                </div>
              )}
            </section>
          )}

          {/* 입주 안내 섹션 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">입주 안내</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 입주 절차 */}
              <div className="bg-blue-50 border-l-4 border-primary-blue p-6 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  입주 절차
                </h3>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <div className="font-semibold">입주 상담 및 신청</div>
                      <div className="text-xs text-gray-600">각 센터로 입주 상담 신청</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <div className="font-semibold">서류 심사</div>
                      <div className="text-xs text-gray-600">사업계획서 및 필수 서류 제출</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <div className="font-semibold">입주 심사위원회 평가</div>
                      <div className="text-xs text-gray-600">기술성, 사업성, 성장가능성 평가</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <div>
                      <div className="font-semibold">입주 승인 및 계약</div>
                      <div className="text-xs text-gray-600">입주 계약 체결 및 입주 시작</div>
                    </div>
                  </li>
                </ol>
              </div>

              {/* 문의 정보 */}
              <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-r-lg">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  문의
                </h3>
                <div className="space-y-4 text-sm text-gray-700">
                  <p>
                    각 보육센터로 직접 문의하시기 바랍니다.
                    센터별 연락처는 위 목록을 참고해주세요.
                  </p>
                  <div className="pt-4 border-t border-gray-300">
                    <p className="font-semibold mb-2">전북바이오융합산업진흥원</p>
                    <p>📞 전화: 063-219-3600</p>
                    <p>✉️ 이메일: info@jbbia.or.kr</p>
                    <p>📍 주소: 전북 정읍시 첨단과학산업단지</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

/**
 * 정보 아이템 컴포넌트
 *
 * 아이콘, 레이블, 값을 표시하는 재사용 가능한 컴포넌트입니다.
 */
const InfoItem: React.FC<{
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ icon, label, value, highlight }) => {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`font-medium truncate ${highlight ? 'text-green-600' : 'text-gray-900'}`}>
          {value}
        </div>
      </div>
    </div>
  );
};

export default IncubatorCentersPage;
