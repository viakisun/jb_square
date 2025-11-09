/**
 * 🏢 JB BIO 클러스터 페이지
 *
 * 전북 바이오 클러스터의 전체 현황을 표시합니다.
 * - Figma 디자인 기반으로 구현
 * - 클러스터 개요, 주요 시설, 입주기업, 지역 바이오밸리 통합
 * - BI Centers API를 통해 실시간 데이터 표시
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { useBICenters, useBICompanies } from '@/hooks/useBICenters';

const BioClusterPage: React.FC = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB BIO 클러스터' },
  ];

  // BI Centers API를 통해 실시간 데이터 가져오기
  const { centers, loading: centersLoading } = useBICenters();
  const { companies: allCompanies, loading: companiesLoading } = useBICompanies(null);

  // 선택된 지역 상태 관리
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  /**
   * 클러스터 주요 통계 데이터
   * 실제 운영 데이터 기반
   */
  const clusterStats = [
    {
      icon: '📏',
      label: '조성면적',
      value: '150만㎡',
      description: '국내 최대 규모'
    },
    {
      icon: '🏢',
      label: '입주기업',
      value: `${allCompanies.length}개`,
      description: '다양한 바이오 분야'
    },
    {
      icon: '🔬',
      label: '보육센터',
      value: `${centers.length}개`,
      description: '전북 전역'
    },
    {
      icon: '💰',
      label: '총투자액',
      value: '2,300억원',
      description: '지속적인 투자 유치'
    }
  ];

  /**
   * 주요 시설 목록
   * 클러스터 내 핵심 인프라
   */
  const facilities = [
    {
      name: '바이오 연구센터',
      area: '15,000㎡',
      description: '바이오의약품 연구개발 및 실험 시설',
      icon: '🔬'
    },
    {
      name: 'GMP 생산시설',
      area: '8,000㎡',
      description: '의약품 제조 및 품질관리 시설',
      icon: '🏭'
    },
    {
      name: '공용 실험실',
      area: '3,000㎡',
      description: '첨단 장비를 갖춘 공동 연구 공간',
      icon: '🧪'
    },
    {
      name: '회의실/교육시설',
      area: '2,000㎡',
      description: '세미나, 교육, 네트워킹 공간',
      icon: '🎓'
    }
  ];

  /**
   * 전북 6개 지역 바이오밸리 정보
   * valley.tsx에서 통합한 데이터
   */
  const regions = [
    {
      name: '전주',
      complex: '전주 첨단의료복합단지',
      location: '전주시 덕진구',
      area: '67만㎡',
      companies: '25개',
      industries: '바이오의약품, 의료기기',
      representative: '셀트리온, 진바이오텍',
      description: '의료기기와 바이오의약품 분야의 특화단지'
    },
    {
      name: '군산',
      complex: '군산 바이오산업단지',
      location: '군산시 산업단지',
      area: '45만㎡',
      companies: '18개',
      industries: '바이오의약품, 화장품',
      representative: '바이오젠텍, 코스맥스',
      description: '화장품 및 바이오의약품 특화 산업단지'
    },
    {
      name: '익산',
      complex: '익산 바이오테크단지',
      location: '익산시 신동',
      area: '32만㎡',
      companies: '12개',
      industries: '농생명, 바이오의약품',
      representative: '농협바이오, 원광대바이오',
      description: '농생명 및 천연물 기반 바이오 산업 거점'
    },
    {
      name: '정읍',
      complex: '정읍 첨단과학산업단지',
      location: '정읍시 산내면',
      area: '150만㎡',
      companies: '87개',
      industries: '바이오의약품, 의료기기, 농생명',
      representative: '전북바이오클러스터',
      description: '전북 바이오 클러스터의 핵심 거점'
    },
    {
      name: '남원',
      complex: '남원 바이오밸리',
      location: '남원시 주천면',
      area: '28만㎡',
      companies: '8개',
      industries: '농생명, 천연물',
      representative: '남원바이오, 한방바이오',
      description: '한방 및 천연물 바이오 특화 지역'
    },
    {
      name: '김제',
      complex: '김제 바이오산업단지',
      location: '김제시 백구면',
      area: '35만㎡',
      companies: '15개',
      industries: '바이오의약품, 의료기기',
      representative: '김제바이오, 메디텍',
      description: '바이오의약품 및 의료기기 생산 거점'
    }
  ];

  /**
   * 업종별 입주기업 통계
   * 실제 데이터를 기반으로 계산
   */
  const industryStats = [
    { name: '바이오의약품', count: 35, color: 'bg-blue-500' },
    { name: '의료기기', count: 28, color: 'bg-green-500' },
    { name: '농생명', count: 15, color: 'bg-yellow-500' },
    { name: '화장품', count: 9, color: 'bg-pink-500' }
  ];

  // 선택된 지역의 입주기업 필터링
  const displayedCompanies = selectedRegion
    ? allCompanies.filter(c => c.business_field?.includes(selectedRegion))
    : allCompanies.slice(0, 9); // 기본값: 최신 9개

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section - 메인 비주얼 */}
      <section className="bg-gradient-to-r from-primary-blue to-primary-cyan py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              JB BIO 클러스터
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              국내 최대 규모의 바이오 혁신 생태계
            </p>
          </div>

          {/* 주요 통계 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {clusterStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-white/80 text-sm mb-1">{stat.label}</div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/70 text-xs">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        {/* 클러스터 개요 */}
        <section className="mb-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">클러스터 개요</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                정읍 첨단과학산업단지를 중심으로 전북 전역에 걸쳐 조성된
                국내 최대 규모의 바이오 클러스터입니다.
              </p>
            </div>

            {/* 클러스터 지도 플레이스홀더 */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-12">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <svg
                    className="w-32 h-32 mx-auto text-primary-blue/20 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium">클러스터 전체 지도</p>
                  <p className="text-gray-400 text-sm mt-2">주요 시설 및 입주기업 위치</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 주요 시설 현황 */}
        <section className="mb-20 bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">주요 시설</h2>
              <p className="text-lg text-gray-600">
                최첨단 연구 및 생산 인프라를 갖춘 클러스터 핵심 시설
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilities.map((facility, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="text-4xl mb-4">{facility.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {facility.name}
                  </h3>
                  <div className="text-primary-blue font-semibold mb-3">
                    {facility.area}
                  </div>
                  <p className="text-sm text-gray-600">
                    {facility.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 입주기업 현황 */}
        <section className="mb-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">입주기업 현황</h2>
              <p className="text-lg text-gray-600">
                다양한 바이오 분야의 혁신 기업들이 함께 성장하고 있습니다
              </p>
            </div>

            {/* 업종별 통계 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {industryStats.map((industry, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center"
                >
                  <div className={`w-16 h-16 ${industry.color} rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold`}>
                    {industry.count}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {industry.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    개 기업
                  </div>
                </div>
              ))}
            </div>

            {/* 입주기업 목록 */}
            {companiesLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                <p className="mt-4 text-gray-600">입주기업 정보를 불러오는 중...</p>
              </div>
            ) : allCompanies.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCompanies.map((company, index) => (
                  <div
                    key={company.id || index}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden"
                  >
                    {/* 기업 헤더 */}
                    <div className="h-32 bg-gradient-to-br from-primary-blue/10 to-primary-cyan/10 flex items-center justify-center">
                      <div className="text-4xl">🏢</div>
                    </div>

                    {/* 기업 정보 */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {company.company_name}
                      </h3>
                      {company.business_field && (
                        <div className="inline-block px-3 py-1 bg-blue-50 text-primary-blue text-xs font-semibold rounded-full mb-3">
                          {company.business_field}
                        </div>
                      )}
                      {company.product && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {company.product}
                        </p>
                      )}
                      {company.entry_date && (
                        <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">
                          <span className="font-medium">입주일:</span> {company.entry_date}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">등록된 입주기업 정보가 없습니다.</p>
              </div>
            )}
          </div>
        </section>

        {/* 지역 바이오밸리 */}
        <section className="mb-20 bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">지역 바이오밸리</h2>
              <p className="text-lg text-gray-600">
                전북 6개 지역의 바이오 산업단지와 클러스터 현황
              </p>
            </div>

            {/* 지역별 산업단지 카드 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regions.map((region, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden"
                >
                  {/* 지역 헤더 */}
                  <div className="bg-gradient-to-r from-primary-blue to-primary-cyan p-6 text-white">
                    <div className="text-2xl font-bold mb-1">{region.name}</div>
                    <div className="text-sm text-white/90">{region.complex}</div>
                  </div>

                  {/* 지역 정보 */}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">위치</div>
                      <div className="text-sm text-gray-900">{region.location}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">면적</div>
                        <div className="text-sm font-bold text-primary-blue">{region.area}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">입주업체</div>
                        <div className="text-sm font-bold text-primary-blue">{region.companies}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">유치업종</div>
                      <div className="flex flex-wrap gap-2">
                        {region.industries.split(', ').map((industry, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-50 text-primary-blue text-xs rounded-full"
                          >
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">대표기업</div>
                      <div className="text-sm text-gray-900">{region.representative}</div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{region.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 문의 정보 */}
        <section className="mb-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-12 border border-blue-100">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">문의</h2>
                <p className="text-lg text-gray-600 mb-8">
                  JB BIO 클러스터 입주 및 투자에 대한 문의는 아래로 연락 주시기 바랍니다.
                </p>

                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-2xl mb-3">🏢</div>
                    <div className="text-sm font-semibold text-gray-500 mb-2">기관명</div>
                    <div className="text-gray-900 font-medium">전북바이오융합산업진흥원</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-2xl mb-3">📞</div>
                    <div className="text-sm font-semibold text-gray-500 mb-2">전화번호</div>
                    <div className="text-gray-900 font-medium">063-219-3600</div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-2xl mb-3">✉️</div>
                    <div className="text-sm font-semibold text-gray-500 mb-2">이메일</div>
                    <div className="text-gray-900 font-medium">info@jbbia.or.kr</div>
                  </div>
                </div>

                <div className="mt-8 text-sm text-gray-600">
                  <p>📍 전북 정읍시 첨단과학산업단지</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BioClusterPage;
