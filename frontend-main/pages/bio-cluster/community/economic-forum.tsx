import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Breadcrumb from '../../../components/Breadcrumb';

const EconomicForumPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB BIO 클러스터', href: '/bio-cluster' },
    { label: '커뮤니티', href: '/bio-cluster/community' },
    { label: '전북경제포럼' }
  ];

  const researchInstitutes = [
    {
      name: '전북경제연구원',
      type: '지역경제연구소',
      location: '전주시 덕진구',
      researchAreas: ['지역경제', '산업정책', '투자환경'],
      achievements: '전북 경제발전 전략 수립, 투자유치 정책 연구'
    },
    {
      name: '전북산업연구원',
      type: '산업연구소',
      location: '전주시 완산구',
      researchAreas: ['산업분석', '기술혁신', '중소기업지원'],
      achievements: '전북 산업구조 분석, 중소기업 성장지원 방안 연구'
    },
    {
      name: '전북바이오경제연구소',
      type: '바이오전문연구소',
      location: '정읍시 첨단과학산업단지',
      researchAreas: ['바이오산업', '헬스케어', '디지털헬스'],
      achievements: '바이오 클러스터 성과분석, 글로벌 바이오허브 전략 연구'
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
            [HEADER] 전북경제포럼
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전북 전체 경제 생태계 활성화를 위한 포럼
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 포럼 개요 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 포럼 개요
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 활동 범위 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 활동 범위</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[SCOPE] 전북 전체 경제 생태계</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 전북 지역의 모든 산업 분야를 아우르는 
                      종합적인 경제 포럼으로, 바이오, IT, 제조업 등 
                      전 산업에 걸친 협력과 발전을 추진
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[SCOPE] 산업 간 융합</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 바이오와 IT, 제조업과 서비스업 등 
                      다양한 산업 간 융합을 통한 새로운 성장동력 발굴
                    </div>
                  </div>
                </div>
              </div>

              {/* 참여 대상 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 참여 대상</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TARGET] 바이오 기업</div>
                    <div className="text-gray-600 text-sm">바이오의약품, 의료기기, 농생명 기업</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TARGET] IT 기업</div>
                    <div className="text-gray-600 text-sm">소프트웨어, 하드웨어, 디지털헬스 기업</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TARGET] 제조업</div>
                    <div className="text-gray-600 text-sm">자동차, 기계, 전자부품 제조업</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TARGET] 서비스업</div>
                    <div className="text-gray-600 text-sm">물류, 금융, 컨설팅 서비스업</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TARGET] 연구기관</div>
                    <div className="text-gray-600 text-sm">대학, 연구소, 정부기관</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 회원 가입 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 회원 가입
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 가입 절차 및 방법 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 가입 절차 및 방법</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STEP] 1단계: 가입 신청</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 온라인 가입신청서 작성 및 제출
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STEP] 2단계: 자격 심사</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 기업 현황 및 사업계획서 검토
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STEP] 3단계: 가입 승인</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 심사위원회 심의 후 가입 승인
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STEP] 4단계: 회비 납부</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 연회비 납부 및 회원증 발급
                    </div>
                  </div>
                </div>
              </div>

              {/* 사무국 정보 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 사무국 정보</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[LABEL] 사무국명</div>
                    <div className="text-gray-600">[VALUE] 전북경제포럼 사무국</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[LABEL] 계좌번호</div>
                    <div className="text-gray-600">[VALUE] 농협 123-456-789012</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[LABEL] 주소</div>
                    <div className="text-gray-600">[VALUE] 전북 전주시 덕진구 ○○로 123</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[LABEL] 전화</div>
                    <div className="text-gray-600">[VALUE] 063-XXX-XXXX</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[LABEL] 이메일</div>
                    <div className="text-gray-600">[VALUE] info@jbeconclub.or.kr</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 연구소 현황 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 연구소 현황
            </h2>
            
            <div className="space-y-8">
              {researchInstitutes.map((institute, index) => (
                <div key={index} className="border-2 border-gray-400 p-6 bg-gray-50">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">[INSTITUTE] {institute.name}</h3>
                      <div className="space-y-3">
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 설립구분</div>
                          <div className="text-gray-600">[VALUE] {institute.type}</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 위치</div>
                          <div className="text-gray-600">[VALUE] {institute.location}</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 연구분야</div>
                          <div className="text-gray-600">[VALUE] {institute.researchAreas.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 주요 연구 성과</h4>
                      <div className="border border-gray-300 p-4 bg-white">
                        <div className="text-gray-600 text-sm">
                          [ACHIEVEMENTS] {institute.achievements}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 포럼 활동 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 포럼 활동
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* 정기 활동 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 정기 활동</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACTIVITY] 월례 경제동향 세미나</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 매월 첫째 주 금요일, 전북 경제 동향 분석 및 전망
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACTIVITY] 분기별 정책토론회</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 분기별로 정부 정책 및 지역발전 방안 논의
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACTIVITY] 연례 경제포럼</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 연말 전북 경제 성과 및 다음해 전망 발표
                    </div>
                  </div>
                </div>
              </div>

              {/* 특별 활동 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 특별 활동</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACTIVITY] 산업별 워킹그룹</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 바이오, IT, 제조업 등 산업별 전문 워킹그룹 운영
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACTIVITY] 해외 경제교류</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 해외 경제단체와의 교류 및 협력 프로그램
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACTIVITY] 청년 경제포럼</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 청년 기업가 및 경제인 대상 특별 프로그램
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 회원 혜택 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 회원 혜택
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 정보 제공</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[BENEFIT] 경제동향 리포트</div>
                    <div className="text-gray-600 text-sm">월간 전북 경제동향 분석 자료</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[BENEFIT] 정책 브리핑</div>
                    <div className="text-gray-600 text-sm">정부 정책 및 지원사업 정보</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[BENEFIT] 시장 분석 자료</div>
                    <div className="text-gray-600 text-sm">산업별 시장 분석 및 전망</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 네트워킹</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[BENEFIT] 정기 모임 참석</div>
                    <div className="text-gray-600 text-sm">월례 세미나 및 정책토론회 참석</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[BENEFIT] 비즈니스 매칭</div>
                    <div className="text-gray-600 text-sm">기업 간 협력 기회 제공</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[BENEFIT] 해외 교류</div>
                    <div className="text-gray-600 text-sm">해외 경제단체와의 교류 기회</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 지원 서비스</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[BENEFIT] 정책 자문</div>
                    <div className="text-gray-600 text-sm">정부 정책 및 지원사업 자문</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[BENEFIT] 연구 지원</div>
                    <div className="text-gray-600 text-sm">경제 연구 및 조사 지원</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[BENEFIT] 홍보 지원</div>
                    <div className="text-gray-600 text-sm">회원 기업 홍보 및 마케팅 지원</div>
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

export default EconomicForumPage;

