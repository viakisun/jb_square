import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const RegionalIncubatorPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '창업보육센터', href: '/incubator' },
    { label: '지역별 입주기업' }
  ];

  const [selectedRegion, setSelectedRegion] = useState('전주시');

  const regions = [
    '전주시', '군산시', '익산시', '정읍시',
    '남원시', '김제시', '완주군', '진안군',
    '무주군', '장수군', '임실군', '순창군',
    '고창군', '부안군'
  ];

  const incubatorCenters = [
    {
      region: '전주시',
      name: '전주바이오센터',
      location: '전주시 덕진구',
      type: '개별실 + 공용실',
      facilities: '실험실, 사무실, 회의실',
      companies: 15,
      capacity: 20
    },
    {
      region: '군산시',
      name: '군산테크노파크',
      location: '군산시 산업단지',
      type: '표준형 사무실',
      facilities: 'R&D실, 시제품실',
      companies: 12,
      capacity: 15
    },
    {
      region: '익산시',
      name: '익산바이오센터',
      location: '익산시 신동',
      type: '개별실',
      facilities: '실험실, 사무실',
      companies: 8,
      capacity: 10
    }
  ];

  const functions = [
    '초기창업기업 육성',
    '기술사업화 지원',
    '멘토링 및 컨설팅',
    '투자유치 지원',
    '네트워킹 프로그램'
  ];

  const admissionCriteria = [
    '창업 7년 이내 기업',
    '바이오 관련 기술 보유',
    '성장 가능성 우수',
    '고용 창출 계획'
  ];

  const admissionProcess = [
    '온라인 신청서 제출',
    '서류 심사',
    '발표 평가',
    '입주 계약',
    '입주 및 지원 시작'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* 페이지 헤더 */}
      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            [HEADER] 지역별 입주기업
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전북 지역별 창업보육센터 입주기업 현황
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 지자체 선택 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 지자체 선택 (14개 지역)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {regions.map((region, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedRegion(region)}
                  className={`border-2 p-3 text-center ${
                    selectedRegion === region 
                      ? 'border-gray-500 bg-gray-200' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-medium text-gray-800">[REGION] {region}</div>
                </button>
              ))}
            </div>
          </section>

          {/* 각 지역별 보육센터 정보 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 각 지역별 보육센터 정보</h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 p-3 text-left">[TH] 센터명</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 위치</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 입주형태</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 주요시설</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 입주현황</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incubatorCenters.map((center, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-3">[TD] {center.name}</td>
                        <td className="border border-gray-300 p-3">[TD] {center.location}</td>
                        <td className="border border-gray-300 p-3">[TD] {center.type}</td>
                        <td className="border border-gray-300 p-3">[TD] {center.facilities}</td>
                        <td className="border border-gray-300 p-3">[TD] {center.companies}/{center.capacity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 기능 및 역할 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 기능 및 역할</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {functions.map((func, index) => (
                <div key={index} className="border-2 border-gray-300 p-6 bg-gray-50">
                  <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 mb-4 flex items-center justify-center text-xs">ICON</div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">[FUNCTION] {func}</h3>
                  <div className="text-gray-600 text-sm border border-gray-300 p-2">
                    [DESCRIPTION] 창업기업의 성장과 발전을 위한 종합적인 지원 서비스
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 입주 안내 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 입주 안내</h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 입주대상 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 입주대상</h3>
                <div className="space-y-3">
                  {admissionCriteria.map((criteria, index) => (
                    <div key={index} className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[CRITERIA] {criteria}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 입주절차 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 입주절차</h3>
                <div className="space-y-3">
                  {admissionProcess.map((step, index) => (
                    <div key={index} className="border border-gray-300 p-3 bg-white">
                      <div className="flex items-center">
                        <div className="border border-gray-400 bg-gray-200 px-2 py-1 text-sm font-medium mr-3">
                          [STEP] {index + 1}
                        </div>
                        <div className="font-medium text-gray-800">[PROCESS] {step}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 입주 문의 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 입주 문의</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {incubatorCenters.map((center, index) => (
                <div key={index} className="border-2 border-gray-400 p-6 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">[CENTER] {center.name}</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 담당자</div>
                      <div className="text-gray-600 text-sm">[VALUE] 김○○ 팀장</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 센터장 직통전화</div>
                      <div className="text-gray-600 text-sm">[VALUE] 063-XXX-XXXX</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 이메일 문의</div>
                      <div className="text-gray-600 text-sm">[VALUE] info@center.or.kr</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 입주현황 및 e-book */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 입주현황 및 자료</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 입주현황 (홈페이지 바로가기)</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[LINK] 실시간 입주기업 현황</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 현재 입주기업 현황 조회</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[LINK] 공실 정보</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 입주 가능한 공간 정보</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[LINK] 졸업기업 현황</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 졸업한 기업들의 성과</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 입주기업 e-book (바로가기)</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[LINK] 입주기업 소개서</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 입주기업들의 상세 소개</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[LINK] 사업성과 리포트</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 입주기업들의 사업 성과</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[LINK] 성공사례집</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 성공한 기업들의 사례</div>
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

export default RegionalIncubatorPage;

