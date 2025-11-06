import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Breadcrumb from '../../../components/Breadcrumb';

const CEOForumPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB BIO 클러스터', href: '/bio-cluster' },
    { label: '커뮤니티', href: '/bio-cluster/community' },
    { label: 'CEO포럼' }
  ];

  const memberCompanies = [
    { name: '셀트리온', ceo: '서정진', industry: '바이오의약품', joinDate: '2020-01-15' },
    { name: '진바이오텍', ceo: '김○○', industry: '진단기기', joinDate: '2020-03-20' },
    { name: '바이오젠텍', ceo: '이○○', industry: '바이오의약품', joinDate: '2020-05-10' },
    { name: '메디텍', ceo: '박○○', industry: '의료기기', joinDate: '2020-07-25' },
    { name: '농협바이오', ceo: '최○○', industry: '농생명', joinDate: '2020-09-12' },
    { name: '코스맥스', ceo: '정○○', industry: '화장품', joinDate: '2020-11-08' }
  ];

  const recentActivities = [
    {
      date: '2024-09-15',
      title: '2024년 9월 정례회의',
      content: '글로벌 바이오시밀러 시장 동향 및 전북 바이오 클러스터 발전 방안 논의',
      participants: '15개 기업 CEO 참석'
    },
    {
      date: '2024-08-18',
      title: '2024년 8월 정례회의',
      content: '바이오 투자 생태계 활성화 방안 및 정책 제안서 작성',
      participants: '12개 기업 CEO 참석'
    },
    {
      date: '2024-07-21',
      title: '2024년 7월 정례회의',
      content: '신약 개발 파이프라인 공유 및 협력 사업 발굴',
      participants: '18개 기업 CEO 참석'
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
            [HEADER] 전북 바이오 CEO 포럼
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 바이오 기업 CEO들의 네트워킹 및 정보 공유
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* CEO 포럼 소개 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] CEO 포럼 소개
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 설립 목적 및 비전 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 설립 목적 및 비전</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[TITLE] 설립 목적</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 전북 바이오 클러스터 내 기업 CEO들 간의 네트워킹 강화와 
                      정보 공유를 통해 상호 발전과 협력을 도모하고, 
                      전북 바이오 산업의 경쟁력 향상에 기여
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[TITLE] 비전</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 전북을 글로벌 바이오 허브로 발전시키고, 
                      회원 기업들의 지속적인 성장과 혁신을 지원하는 
                      최고의 CEO 네트워크 구축
                    </div>
                  </div>
                </div>
              </div>

              {/* 주요 활동 내용 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 주요 활동 내용</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[ACTIVITY] 정례회의</div>
                    <div className="text-gray-600 text-sm">매월 세 번째 금요일 정기 모임</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[ACTIVITY] 산업 동향 공유</div>
                    <div className="text-gray-600 text-sm">글로벌 바이오 시장 트렌드 분석</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[ACTIVITY] 정책 논의</div>
                    <div className="text-gray-600 text-sm">정부 정책 및 지원사업 검토</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[ACTIVITY] 협력 사업 발굴</div>
                    <div className="text-gray-600 text-sm">기업 간 협력 및 공동사업 추진</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[ACTIVITY] 네트워킹 세션</div>
                    <div className="text-gray-600 text-sm">CEO 간 인맥 구축 및 정보 교환</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 구성 현황 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 구성 현황
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 회원기관 목록 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 회원기관 목록</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border border-gray-300 p-3 text-left">[TH] 기업명</th>
                        <th className="border border-gray-300 p-3 text-left">[TH] CEO명</th>
                        <th className="border border-gray-300 p-3 text-left">[TH] 업종</th>
                        <th className="border border-gray-300 p-3 text-left">[TH] 가입일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberCompanies.map((company, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-3">[TD] {company.name}</td>
                          <td className="border border-gray-300 p-3">[TD] {company.ceo}</td>
                          <td className="border border-gray-300 p-3">[TD] {company.industry}</td>
                          <td className="border border-gray-300 p-3">[TD] {company.joinDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 포럼 정보 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 포럼 정보</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[LABEL] 주관기관</div>
                    <div className="text-gray-600">[VALUE] 전북바이오융합산업진흥원</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[LABEL] 총 회원 수</div>
                    <div className="text-gray-600">[VALUE] 25개 기업</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[LABEL] 설립일</div>
                    <div className="text-gray-600">[VALUE] 2020년 1월</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[LABEL] 연락처</div>
                    <div className="text-gray-600">[VALUE] 063-219-3600</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 정례회의 운영 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 정례회의 운영
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">[LABEL] 개최 일정</div>
                  <div className="text-gray-600">[VALUE] 매월 세 번째 금요일</div>
                </div>
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">[LABEL] 개최 시간</div>
                  <div className="text-gray-600">[VALUE] 오후 2시-5시</div>
                </div>
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">[LABEL] 개최 장소</div>
                  <div className="text-gray-600">[VALUE] 전북 바이오 클러스터 회의실</div>
                </div>
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">[LABEL] 참석 대상</div>
                  <div className="text-gray-600">[VALUE] CEO 및 임원진</div>
                </div>
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">[LABEL] 회의 형태</div>
                  <div className="text-gray-600">[VALUE] 오프라인 + 온라인</div>
                </div>
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">[LABEL] 참석료</div>
                  <div className="text-gray-600">[VALUE] 무료</div>
                </div>
              </div>
            </div>

            {/* 주요 안건 */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 주요 안건</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-2 border-gray-300 p-4 bg-gray-50">
                  <div className="font-medium text-gray-800 mb-3">[AGENDA] 산업 동향 공유</div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="border-l-2 border-gray-400 pl-3">• 글로벌 바이오 시장 트렌드</li>
                    <li className="border-l-2 border-gray-400 pl-3">• 신약 개발 동향</li>
                    <li className="border-l-2 border-gray-400 pl-3">• 투자 환경 변화</li>
                    <li className="border-l-2 border-gray-400 pl-3">• 규제 정책 업데이트</li>
                  </ul>
                </div>
                <div className="border-2 border-gray-300 p-4 bg-gray-50">
                  <div className="font-medium text-gray-800 mb-3">[AGENDA] 협력 사업 발굴</div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="border-l-2 border-gray-400 pl-3">• 공동 R&D 프로젝트</li>
                    <li className="border-l-2 border-gray-400 pl-3">• 마케팅 협력</li>
                    <li className="border-l-2 border-gray-400 pl-3">• 인력 교류</li>
                    <li className="border-l-2 border-gray-400 pl-3">• 기술 이전</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 최근 활동 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 최근 활동
            </h2>
            
            <div className="space-y-6">
              {recentActivities.map((activity, index) => (
                <div key={index} className="border-2 border-gray-300 p-6 bg-gray-50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="border border-gray-400 bg-gray-200 px-2 py-1 text-sm font-medium mr-3">
                          [DATE] {activity.date}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">[TITLE] {activity.title}</h3>
                      </div>
                      <div className="text-gray-600 mb-3 border border-gray-300 p-3">
                        [CONTENT] {activity.content}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 border border-gray-300 p-2 bg-white">
                      [PARTICIPANTS] {activity.participants}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 향후 계획 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 향후 계획
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 단기 계획 (2024년 하반기)</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PLAN] 글로벌 바이오 투자자 초청 세미나</div>
                    <div className="text-gray-600 text-sm">[DATE] 2024년 10월</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PLAN] 바이오 클러스터 성과 발표회</div>
                    <div className="text-gray-600 text-sm">[DATE] 2024년 11월</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PLAN] 연말 네트워킹 파티</div>
                    <div className="text-gray-600 text-sm">[DATE] 2024년 12월</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 중장기 계획 (2025년)</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PLAN] 해외 바이오 클러스터와의 MOU 체결</div>
                    <div className="text-gray-600 text-sm">[TARGET] 미국, 유럽 클러스터</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PLAN] 바이오 CEO 아카데미 운영</div>
                    <div className="text-gray-600 text-sm">[TARGET] 신규 CEO 대상</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PLAN] 글로벌 바이오 컨퍼런스 개최</div>
                    <div className="text-gray-600 text-sm">[TARGET] 500명 규모</div>
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

export default CEOForumPage;

