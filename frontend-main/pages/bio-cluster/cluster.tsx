import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';
import FeedbackMemo from '../../components/FeedbackMemo';

const BioClusterPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB BIO 클러스터', href: '/bio-cluster' },
    { label: '바이오 클러스터' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* 페이지 헤더 */}
      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            [HEADER] 전북 바이오 클러스터
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 150만㎡ 규모의 국내 최대 바이오 클러스터
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 클러스터 개요 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 클러스터 개요
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 지도 사진 영역 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 클러스터 전체 지도</h3>
                <div className="w-full h-64 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                  [IMAGE] 클러스터 전체 지도
                </div>
              </div>

              {/* 기본 정보 테이블 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 기본 정보</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="font-medium text-gray-700">[LABEL] 조성면적</span>
                    <span className="text-gray-600">[VALUE] 150만㎡</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="font-medium text-gray-700">[LABEL] 입주기업</span>
                    <span className="text-gray-600">[VALUE] 87개</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="font-medium text-gray-700">[LABEL] 연구기관</span>
                    <span className="text-gray-600">[VALUE] 12개</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="font-medium text-gray-700">[LABEL] 총투자액</span>
                    <span className="text-gray-600">[VALUE] 2,300억원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">[LABEL] 설립연도</span>
                    <span className="text-gray-600">[VALUE] 2020년</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 바이오밸리 소개 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 바이오밸리 소개
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 바이오밸리 위치 지도 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 바이오밸리 위치</h3>
                <div className="w-full h-64 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                  [MAP] 바이오밸리 위치 지도
                </div>
              </div>

              {/* 주요 시설 현황 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 주요 시설 현황</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FACILITY] 바이오 연구센터</div>
                    <div className="text-gray-600 text-sm">[AREA] 15,000㎡</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FACILITY] GMP 생산시설</div>
                    <div className="text-gray-600 text-sm">[AREA] 8,000㎡</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FACILITY] 공용 실험실</div>
                    <div className="text-gray-600 text-sm">[AREA] 3,000㎡</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FACILITY] 회의실/교육시설</div>
                    <div className="text-gray-600 text-sm">[AREA] 2,000㎡</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 입주기업 현황 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 입주기업 현황
            </h2>
            
            {/* 업종별 분류 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 업종별 분류</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="border-2 border-gray-300 p-4 bg-gray-50 text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">[COUNT] 35</div>
                  <div className="text-gray-600">[CATEGORY] 바이오의약품</div>
                </div>
                <div className="border-2 border-gray-300 p-4 bg-gray-50 text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">[COUNT] 28</div>
                  <div className="text-gray-600">[CATEGORY] 의료기기</div>
                </div>
                <div className="border-2 border-gray-300 p-4 bg-gray-50 text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">[COUNT] 15</div>
                  <div className="text-gray-600">[CATEGORY] 농생명</div>
                </div>
                <div className="border-2 border-gray-300 p-4 bg-gray-50 text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">[COUNT] 9</div>
                  <div className="text-gray-600">[CATEGORY] 화장품</div>
                </div>
              </div>
            </div>

            {/* 기업 정보 테이블 */}
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 주요 입주기업</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 p-3 text-left">[TH] 업체명</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 대표자</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 생산품</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 위치</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 홈페이지</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3">[TD] 셀트리온</td>
                      <td className="border border-gray-300 p-3">[TD] 서정진</td>
                      <td className="border border-gray-300 p-3">[TD] 바이오시밀러</td>
                      <td className="border border-gray-300 p-3">[TD] A동 101호</td>
                      <td className="border border-gray-300 p-3">[LINK] www.celltrion.com</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">[TD] 진바이오텍</td>
                      <td className="border border-gray-300 p-3">[TD] 김○○</td>
                      <td className="border border-gray-300 p-3">[TD] 진단기기</td>
                      <td className="border border-gray-300 p-3">[TD] B동 205호</td>
                      <td className="border border-gray-300 p-3">[LINK] www.jinbiotech.com</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">[TD] 바이오젠텍</td>
                      <td className="border border-gray-300 p-3">[TD] 이○○</td>
                      <td className="border border-gray-300 p-3">[TD] 바이오의약품</td>
                      <td className="border border-gray-300 p-3">[TD] C동 301호</td>
                      <td className="border border-gray-300 p-3">[LINK] www.biogentech.com</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 문의 정보 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 문의 정보
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 담당부서</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 기관명</div>
                      <div className="text-gray-600">[VALUE] 전북바이오융합산업진흥원</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 전화번호</div>
                      <div className="text-gray-600">[VALUE] 063-219-3600</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 이메일</div>
                      <div className="text-gray-600">[VALUE] info@jbbia.or.kr</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 위치 정보</h3>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[LABEL] 주소</div>
                    <div className="text-gray-600">[VALUE] 전북 정읍시 첨단과학산업단지</div>
                  </div>
                  <div className="w-full h-48 bg-gray-300 border-2 border-gray-400 mt-4 flex items-center justify-center">
                    [MAP] 위치 지도
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* 피드백 메모 섹션 */}
      <FeedbackMemo pagePath="/bio-cluster/cluster" pageTitle="바이오 클러스터" />

      <Footer />
    </div>
  );
};

export default BioClusterPage;

