import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const ValleyPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB BIO 클러스터', href: '/bio-cluster' },
    { label: '지역 바이오밸리' }
  ];

  const regions = [
    {
      name: '전주',
      complex: '전주 첨단의료복합단지',
      location: '전주시 덕진구',
      area: '67만㎡',
      companies: '25개',
      industries: '바이오의약품, 의료기기',
      representative: '셀트리온, 진바이오텍'
    },
    {
      name: '군산',
      complex: '군산 바이오산업단지',
      location: '군산시 산업단지',
      area: '45만㎡',
      companies: '18개',
      industries: '바이오의약품, 화장품',
      representative: '바이오젠텍, 코스맥스'
    },
    {
      name: '익산',
      complex: '익산 바이오테크단지',
      location: '익산시 신동',
      area: '32만㎡',
      companies: '12개',
      industries: '농생명, 바이오의약품',
      representative: '농협바이오, 원광대바이오'
    },
    {
      name: '정읍',
      complex: '정읍 첨단과학산업단지',
      location: '정읍시 산내면',
      area: '150만㎡',
      companies: '87개',
      industries: '바이오의약품, 의료기기, 농생명',
      representative: '전북바이오클러스터'
    },
    {
      name: '남원',
      complex: '남원 바이오밸리',
      location: '남원시 주천면',
      area: '28만㎡',
      companies: '8개',
      industries: '농생명, 천연물',
      representative: '남원바이오, 한방바이오'
    },
    {
      name: '김제',
      complex: '김제 바이오산업단지',
      location: '김제시 백구면',
      area: '35만㎡',
      companies: '15개',
      industries: '바이오의약품, 의료기기',
      representative: '김제바이오, 메디텍'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* 페이지 헤더 */}
      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            [HEADER] 전북 지역별 바이오밸리 현황
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전북 각 지역의 바이오 산업단지와 클러스터 현황
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 바이오밸리 지도 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 바이오밸리 지도
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="w-full h-96 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                [MAP] 전북 전체 지도 - 지역별 바이오밸리 위치 표시
              </div>
            </div>
          </section>

          {/* 지역별 산업단지 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 지역별 산업단지
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regions.map((region, index) => (
                <div key={index} className="border-2 border-gray-300 p-6 bg-gray-50">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-gray-800 mb-2">[REGION] {region.name}</div>
                    <div className="border border-gray-400 bg-gray-200 px-3 py-1 text-sm font-medium">
                      [COMPLEX] {region.complex}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="border border-gray-300 p-2 bg-white">
                      <div className="text-sm font-medium text-gray-700">[LABEL] 위치</div>
                      <div className="text-gray-600">[VALUE] {region.location}</div>
                    </div>
                    <div className="border border-gray-300 p-2 bg-white">
                      <div className="text-sm font-medium text-gray-700">[LABEL] 면적</div>
                      <div className="text-gray-600">[VALUE] {region.area}</div>
                    </div>
                    <div className="border border-gray-300 p-2 bg-white">
                      <div className="text-sm font-medium text-gray-700">[LABEL] 입주업체 수</div>
                      <div className="text-gray-600">[VALUE] {region.companies}</div>
                    </div>
                    <div className="border border-gray-300 p-2 bg-white">
                      <div className="text-sm font-medium text-gray-700">[LABEL] 유치업종</div>
                      <div className="text-gray-600">[VALUE] {region.industries}</div>
                    </div>
                    <div className="border border-gray-300 p-2 bg-white">
                      <div className="text-sm font-medium text-gray-700">[LABEL] 대표기업</div>
                      <div className="text-gray-600">[VALUE] {region.representative}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 복합단지 상세 정보 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 복합단지 상세 정보
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 복합단지 소개 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 복합단지 소개</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[TITLE] 정읍 첨단과학산업단지</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 전북 바이오 클러스터의 핵심 거점으로, 150만㎡ 규모의 국내 최대 바이오 클러스터입니다. 
                      바이오의약품, 의료기기, 농생명 등 다양한 바이오 분야의 기업들이 입주하여 
                      상호 시너지를 창출하고 있습니다.
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[TITLE] 전주 첨단의료복합단지</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 의료기기와 바이오의약품 분야의 특화단지로, 
                      전북대학교병원과 연계한 의료복합단지입니다.
                    </div>
                  </div>
                </div>
              </div>

              {/* 교통 접근성 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 교통 접근성</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TRANSPORT] 버스</div>
                    <div className="text-gray-600 text-sm">[INFO] 전주시내버스 20분 간격 운행</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TRANSPORT] 지하철</div>
                    <div className="text-gray-600 text-sm">[INFO] 전주역에서 셔틀버스 15분</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TRANSPORT] 자차</div>
                    <div className="text-gray-600 text-sm">[INFO] 서해안고속도로 정읍IC 10분</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 주변 인프라 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 주변 인프라
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 대학</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[UNIVERSITY] 전북대학교</div>
                    <div className="text-gray-600 text-sm">[DISTANCE] 15분 거리</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[UNIVERSITY] 원광대학교</div>
                    <div className="text-gray-600 text-sm">[DISTANCE] 20분 거리</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[UNIVERSITY] 전주대학교</div>
                    <div className="text-gray-600 text-sm">[DISTANCE] 25분 거리</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 연구소</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[RESEARCH] 한국생명공학연구원</div>
                    <div className="text-gray-600 text-sm">[DISTANCE] 30분 거리</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[RESEARCH] 한국화학연구원</div>
                    <div className="text-gray-600 text-sm">[DISTANCE] 35분 거리</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 병원</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[HOSPITAL] 전북대학교병원</div>
                    <div className="text-gray-600 text-sm">[DISTANCE] 15분 거리</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[HOSPITAL] 원광대학교병원</div>
                    <div className="text-gray-600 text-sm">[DISTANCE] 20분 거리</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 천연물 한방산업 인프라 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 천연물 한방산업 인프라
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 주요 인프라 목록 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 주요 인프라</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[INFRA] 천연물 추출시설</div>
                    <div className="text-gray-600 text-sm">[CAPACITY] 일 10톤 처리 가능</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[INFRA] 한방제제 연구센터</div>
                    <div className="text-gray-600 text-sm">[AREA] 5,000㎡</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[INFRA] 천연물 품질관리센터</div>
                    <div className="text-gray-600 text-sm">[AREA] 3,000㎡</div>
                  </div>
                </div>
              </div>

              {/* 지원 시설 현황 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 지원 시설</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FACILITY] 공용 실험실</div>
                    <div className="text-gray-600 text-sm">[EQUIPMENT] HPLC, GC-MS, NMR 등</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FACILITY] 시제품 제작실</div>
                    <div className="text-gray-600 text-sm">[EQUIPMENT] 정제장비, 캡슐충전기 등</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FACILITY] 저장창고</div>
                    <div className="text-gray-600 text-sm">[CAPACITY] 1,000톤 저장 가능</div>
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

export default ValleyPage;

