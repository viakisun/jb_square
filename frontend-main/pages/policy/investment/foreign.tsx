import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Breadcrumb from '../../../components/Breadcrumb';

const ForeignInvestmentPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '바이오지원정책', href: '/policy' },
    { label: '투자제도', href: '/policy/investment' },
    { label: '외국인투자제도' }
  ];

  const investmentTypes = [
    {
      type: '주식 취득',
      description: '발행주식 총수의 10% 이상',
      details: [
        '신주 인수',
        '기존 주식 매수',
        '전환사채 인수',
        '신주인수권부사채 인수'
      ]
    },
    {
      type: '지분 출자',
      description: '합작회사 설립',
      details: [
        '신규 법인 설립',
        '기존 법인 증자',
        '합작투자 계약',
        '전략적 제휴'
      ]
    },
    {
      type: '장기차관',
      description: '5년 이상 차관 제공',
      details: [
        '만기 5년 이상',
        '이자율 연 2% 이상',
        '한국은행 신고',
        '차관계약서 제출'
      ]
    },
    {
      type: '영업권 양수',
      description: '기술도입 계약 등',
      details: [
        '기술도입 계약',
        '영업권 양수',
        '특허권 양수',
        '상표권 양수'
      ]
    }
  ];

  const procedures = [
    {
      step: '1단계',
      title: '투자신고',
      content: '외국인투자신고서 제출',
      support: '신고서 작성 컨설팅',
      duration: '7일',
      organization: '한국무역투자진흥공사'
    },
    {
      step: '2단계',
      title: '법인설립',
      content: '설립등기 신청',
      support: '법무사 연결 서비스',
      duration: '14일',
      organization: '등기소'
    },
    {
      step: '3단계',
      title: '사업자등록',
      content: '사업자등록 신청',
      support: '세무 관련 안내',
      duration: '3일',
      organization: '세무서'
    },
    {
      step: '4단계',
      title: '외국인등록',
      content: '외국인등록 신청',
      support: '비자 발급 지원',
      duration: '5일',
      organization: '출입국사무소'
    },
    {
      step: '5단계',
      title: '은행계좌 개설',
      content: '외국인투자계좌 개설',
      support: '은행 연결 서비스',
      duration: '1일',
      organization: '은행'
    },
    {
      step: '6단계',
      title: '투자금 반입',
      content: '투자금 반입 신고',
      support: '환전 및 송금 지원',
      duration: '1일',
      organization: '한국은행'
    },
    {
      step: '7단계',
      title: '사업개시',
      content: '사업 개시 신고',
      support: '사업 운영 안내',
      duration: '1일',
      organization: '관할 기관'
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
            [HEADER] 외국인투자제도
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 외국인투자 촉진법에 따른 투자제도 안내
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 투자제도 개요 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 투자제도 개요
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 외국인 정의 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 외국인 정의</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[DEFINITION] 외국인 (외투법 제2조)</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 외국 국적자, 외국법인, 외국정부, 
                      국제기구 및 기타 외국인에 준하는 자
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[DEFINITION] 외국투자가 (시행령 제2조)</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 투자 의사를 표명한 외국인으로서 
                      외국인투자신고를 한 자
                    </div>
                  </div>
                </div>
              </div>

              {/* 투자 유형 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 외국인 투자유형</h3>
                <div className="space-y-3">
                  {investmentTypes.map((type, index) => (
                    <div key={index} className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800 mb-1">[TYPE] {type.type}</div>
                      <div className="text-gray-600 text-sm mb-2">{type.description}</div>
                      <div className="text-gray-500 text-xs">
                        [DETAILS] {type.details.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 장기차관 상세 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 장기차관 상세
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 차관 조건 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 차관 조건</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[CONDITION] 만기</div>
                    <div className="text-gray-600 text-sm">[VALUE] 5년 이상</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[CONDITION] 이자율</div>
                    <div className="text-gray-600 text-sm">[VALUE] 연 2% 이상</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[CONDITION] 신고 기관</div>
                    <div className="text-gray-600 text-sm">[VALUE] 한국은행</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[CONDITION] 신고 기한</div>
                    <div className="text-gray-600 text-sm">[VALUE] 차관 계약 체결 후 30일 이내</div>
                  </div>
                </div>
              </div>

              {/* 신고 절차 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 신고 절차</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[STEP] 1. 차관계약서 작성</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 차관 조건 명시</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[STEP] 2. 이사회 결의서</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 차관 승인 결의</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[STEP] 3. 한국은행 신고</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 차관신고서 제출</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[STEP] 4. 신고 수리</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 신고서 검토 후 수리</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 투자 절차 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 투자절차 단계별 안내
            </h2>
            
            <div className="space-y-6">
              {procedures.map((procedure, index) => (
                <div key={index} className="border-2 border-gray-400 p-6 bg-gray-50">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="border border-gray-400 bg-gray-200 px-3 py-1 text-sm font-medium mr-3">
                          [STEP] {procedure.step}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">[TITLE] {procedure.title}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="border border-gray-300 p-2 bg-white">
                          <div className="font-medium text-gray-800">[CONTENT] {procedure.content}</div>
                        </div>
                        <div className="border border-gray-300 p-2 bg-white">
                          <div className="font-medium text-gray-800">[SUPPORT] {procedure.support}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div className="border border-gray-300 p-2 bg-white">
                          <div className="font-medium text-gray-800">[DURATION] 소요기간</div>
                          <div className="text-gray-600 text-sm">[VALUE] {procedure.duration}</div>
                        </div>
                        <div className="border border-gray-300 p-2 bg-white">
                          <div className="font-medium text-gray-800">[ORGANIZATION] 담당기관</div>
                          <div className="text-gray-600 text-sm">[VALUE] {procedure.organization}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 원스톱 서비스 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 원스톱 서비스
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 통합 창구 운영 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 통합 창구 운영</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SERVICE] 투자 상담</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 투자 관련 전반적인 상담</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SERVICE] 서류 작성 지원</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 각종 신청서 작성 지원</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SERVICE] 기관 연계</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 관련 기관 연결 서비스</div>
                  </div>
                </div>
              </div>

              {/* 담당자 배정 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 담당자 배정</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[ASSIGNMENT] 전담 담당자</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 투자 프로젝트별 전담 담당자 배정</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[ASSIGNMENT] 진행 상황 모니터링</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 투자 절차 진행 상황 실시간 모니터링</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[ASSIGNMENT] 문제 해결 지원</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 투자 과정 중 발생하는 문제 해결</div>
                  </div>
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
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 단계별 필수 서류</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOCUMENT] 투자신고서</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 외국인투자신고서 및 첨부서류</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOCUMENT] 차관계약서</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 차관 조건이 명시된 계약서</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOCUMENT] 이사회 결의서</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 투자 승인 이사회 결의서</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOCUMENT] 사업계획서</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 투자 목적 및 사업계획</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 서류 양식 다운로드</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOWNLOAD] 외국인투자신고서</div>
                    <div className="text-gray-600 text-sm">[LINK] 양식 다운로드</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[DOWNLOAD] 차관신고서</div>
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

          {/* 관련 법령 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 관련 법령
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 주요 법령</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LAW] 외국인투자 촉진법</div>
                      <div className="text-gray-600 text-sm">[DESCRIPTION] 외국인투자의 기본법</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LAW] 외국인투자 촉진법 시행령</div>
                      <div className="text-gray-600 text-sm">[DESCRIPTION] 법의 시행에 관한 세부사항</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LAW] 외국인투자 촉진법 시행규칙</div>
                      <div className="text-gray-600 text-sm">[DESCRIPTION] 법의 시행에 관한 세부규칙</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 관련 고시 및 공고</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[NOTICE] 외국인투자 신고 고시</div>
                      <div className="text-gray-600 text-sm">[DESCRIPTION] 신고 절차 및 방법</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[NOTICE] 차관 신고 고시</div>
                      <div className="text-gray-600 text-sm">[DESCRIPTION] 차관 신고 절차</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[NOTICE] 투자 유치 공고</div>
                      <div className="text-gray-600 text-sm">[DESCRIPTION] 투자 유치 관련 공고</div>
                    </div>
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

export default ForeignInvestmentPage;

