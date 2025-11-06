import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Breadcrumb from '../../../components/Breadcrumb';

const InvestmentProcessPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '바이오지원정책', href: '/policy' },
    { label: '투자제도', href: '/policy/investment' },
    { label: '투자 절차' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* 페이지 헤더 */}
      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            [HEADER] 투자 절차
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 외국인투자 절차 단계별 안내
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 투자절차 플로우차트 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 투자절차 플로우차트
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="w-full h-64 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                [CHART] 투자신고 → 법인설립 → 인허가 → 사업개시
              </div>
            </div>
          </section>

          {/* 단계별 상세 안내 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 단계별 상세 안내
            </h2>
            
            <div className="space-y-6">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[STEP] 1단계 - 투자신고</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[CONTENT] 주요내용</div>
                        <div className="text-gray-600 text-sm">[VALUE] 외국인투자신고서 제출</div>
                      </div>
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[SUPPORT] 지원사항</div>
                        <div className="text-gray-600 text-sm">[VALUE] 신고서 작성 컨설팅</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-3">
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[DURATION] 소요기간</div>
                        <div className="text-gray-600 text-sm">[VALUE] 7일</div>
                      </div>
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[ORGANIZATION] 담당기관</div>
                        <div className="text-gray-600 text-sm">[VALUE] 한국무역투자진흥공사</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[STEP] 2단계 - 법인설립</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[CONTENT] 주요내용</div>
                        <div className="text-gray-600 text-sm">[VALUE] 설립등기 신청</div>
                      </div>
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[SUPPORT] 지원사항</div>
                        <div className="text-gray-600 text-sm">[VALUE] 법무사 연결 서비스</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-3">
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[DURATION] 소요기간</div>
                        <div className="text-gray-600 text-sm">[VALUE] 14일</div>
                      </div>
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[ORGANIZATION] 담당기관</div>
                        <div className="text-gray-600 text-sm">[VALUE] 등기소</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[STEP] 3단계 - 사업자등록</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[CONTENT] 주요내용</div>
                        <div className="text-gray-600 text-sm">[VALUE] 사업자등록 신청</div>
                      </div>
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[SUPPORT] 지원사항</div>
                        <div className="text-gray-600 text-sm">[VALUE] 세무 관련 안내</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-3">
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[DURATION] 소요기간</div>
                        <div className="text-gray-600 text-sm">[VALUE] 3일</div>
                      </div>
                      <div className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[ORGANIZATION] 담당기관</div>
                        <div className="text-gray-600 text-sm">[VALUE] 세무서</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 원스톱 서비스 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 원스톱 서비스
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">[SERVICE] 통합 창구 운영</div>
                  <div className="text-gray-600 text-sm">[DESCRIPTION] 모든 투자 관련 업무를 한 곳에서 처리</div>
                </div>
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">[SERVICE] 담당자 배정</div>
                  <div className="text-gray-600 text-sm">[DESCRIPTION] 투자 프로젝트별 전담 담당자 배정</div>
                </div>
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">[SERVICE] 진행 상황 모니터링</div>
                  <div className="text-gray-600 text-sm">[DESCRIPTION] 투자 절차 진행 상황 실시간 모니터링</div>
                </div>
              </div>
            </div>
          </section>

          {/* 필요 서류 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 필요 서류
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 단계별 필수 서류 목록</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOCUMENT] 투자신고서</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 외국인투자신고서 및 첨부서류</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOCUMENT] 법인설립등기신청서</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 법인 설립 관련 서류</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOCUMENT] 사업자등록신청서</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 사업자등록 관련 서류</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 서류 양식 다운로드</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOWNLOAD] 투자신고서 양식</div>
                    <div className="text-gray-600 text-sm">[LINK] 양식 다운로드</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOWNLOAD] 법인설립 신청서</div>
                    <div className="text-gray-600 text-sm">[LINK] 양식 다운로드</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOWNLOAD] 작성 가이드</div>
                    <div className="text-gray-600 text-sm">[LINK] 작성 방법 안내</div>
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

export default InvestmentProcessPage;

