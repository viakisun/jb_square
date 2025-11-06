import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Breadcrumb from '../../../components/Breadcrumb';

const TechForumPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB BIO 클러스터', href: '/bio-cluster' },
    { label: '커뮤니티', href: '/bio-cluster/community' },
    { label: '전북과학기술포럼' }
  ];

  const workingGroups = [
    {
      name: '바이오기술 워킹그룹',
      description: '바이오의약품, 의료기기, 농생명 분야 기술 개발',
      members: '15명',
      activities: ['기술 세미나', '공동연구', '기술이전']
    },
    {
      name: 'IT융합 워킹그룹',
      description: '디지털헬스, AI, 빅데이터 활용 기술',
      members: '12명',
      activities: ['기술 워크샵', '시제품 개발', '특허 분석']
    },
    {
      name: '신소재 워킹그룹',
      description: '나노소재, 바이오소재, 스마트소재 개발',
      members: '10명',
      activities: ['소재 연구', '성능 평가', '상용화 지원']
    },
    {
      name: '환경기술 워킹그룹',
      description: '친환경 기술, 재생에너지, 환경정화 기술',
      members: '8명',
      activities: ['환경 세미나', '기술 교류', '정책 연구']
    }
  ];

  const recentSeminars = [
    {
      date: '2024-09-15',
      title: '바이오시밀러 개발 동향과 전략',
      speaker: '김○○ 교수 (전북대학교)',
      participants: '85명',
      topics: ['바이오시밀러 시장', '개발 전략', '규제 동향']
    },
    {
      date: '2024-08-20',
      title: 'AI 기반 신약 발견 기술',
      speaker: '이○○ 박사 (한국생명공학연구원)',
      participants: '92명',
      topics: ['AI 신약발견', '머신러닝', '데이터 분석']
    },
    {
      date: '2024-07-18',
      title: '디지털헬스케어 혁신',
      speaker: '박○○ 대표 (헬스테크 스타트업)',
      participants: '78명',
      topics: ['디지털헬스', '원격의료', '헬스케어 IT']
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
            [HEADER] 전북과학기술포럼
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전북 과학기술 생태계 활성화를 위한 포럼
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 기획 의도 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 기획 의도
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 목표 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 목표</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[GOAL] 전북 과학기술 생태계 활성화</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 전북 지역의 과학기술 연구개발 역량을 강화하고 
                      혁신적인 기술 개발을 촉진하여 지역 경제 발전에 기여
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[GOAL] 산학연 협력 강화</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 대학, 연구소, 기업 간의 협력을 강화하여 
                      기술이전과 사업화를 통한 상호 발전 도모
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[GOAL] 기술 혁신 촉진</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 첨단 기술 개발과 융합을 통해 
                      새로운 성장동력을 발굴하고 경쟁력 강화
                    </div>
                  </div>
                </div>
              </div>

              {/* 비전 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 비전</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[VISION] 글로벌 과학기술 허브</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 전북을 국내외 과학기술 연구개발의 
                      중심지로 발전시켜 글로벌 경쟁력 확보
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[VISION] 혁신 생태계 구축</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 연구자, 기업가, 투자자가 상호 협력하는 
                      혁신적인 과학기술 생태계 조성
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[VISION] 지속가능한 성장</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 과학기술을 통한 지속가능한 지역 발전과 
                      미래 세대를 위한 기술 기반 마련
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 추진 주체 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 추진 주체
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* 주관기관 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 주관</h3>
                <div className="border border-gray-300 p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">[ORGANIZATION] 전북테크노파크</div>
                  <div className="text-gray-600 text-sm">
                    [DESCRIPTION] 전북 지역 과학기술 혁신을 선도하는 
                    핵심 기관으로 포럼 운영 및 지원
                  </div>
                </div>
              </div>

              {/* 후원기관 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 후원</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SPONSOR] 전북도청</div>
                    <div className="text-gray-600 text-sm">정책 지원 및 예산 지원</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SPONSOR] 과기정통부</div>
                    <div className="text-gray-600 text-sm">국가 R&D 정책 연계</div>
                  </div>
                </div>
              </div>

              {/* 협력기관 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 협력</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PARTNER] 전북대학교</div>
                    <div className="text-gray-600 text-sm">연구 인프라 및 인력 지원</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PARTNER] 원광대학교</div>
                    <div className="text-gray-600 text-sm">바이오 전문 연구 지원</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PARTNER] 한국생명공학연구원</div>
                    <div className="text-gray-600 text-sm">기술 전문성 및 연구 지원</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 주요 활동 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 주요 활동
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* 월례 기술 세미나 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 월례 기술 세미나</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACTIVITY] 최신 기술 동향</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 국내외 최신 과학기술 동향과 
                      연구 성과를 공유하는 정기 세미나
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACTIVITY] 전문가 초청 강연</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 국내외 저명한 과학자와 
                      기술 전문가를 초청한 특별 강연
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACTIVITY] 연구 성과 발표</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 회원 기관의 연구 성과와 
                      기술 개발 현황을 발표하는 자리
                    </div>
                  </div>
                </div>
              </div>

              {/* 분야별 워킹그룹 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 분야별 워킹그룹</h3>
                <div className="space-y-3">
                  {workingGroups.map((group, index) => (
                    <div key={index} className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800 mb-1">[GROUP] {group.name}</div>
                      <div className="text-gray-600 text-sm mb-2">{group.description}</div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>[MEMBERS] {group.members}</span>
                        <span>[ACTIVITIES] {group.activities.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 최근 세미나 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 최근 세미나
            </h2>
            
            <div className="space-y-6">
              {recentSeminars.map((seminar, index) => (
                <div key={index} className="border-2 border-gray-400 p-6 bg-gray-50">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="border border-gray-400 bg-gray-200 px-2 py-1 text-sm font-medium mr-3">
                          [DATE] {seminar.date}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">[TITLE] {seminar.title}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="border border-gray-300 p-2 bg-white">
                          <div className="font-medium text-gray-800">[SPEAKER] {seminar.speaker}</div>
                        </div>
                        <div className="border border-gray-300 p-2 bg-white">
                          <div className="font-medium text-gray-800">[PARTICIPANTS] {seminar.participants}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 주요 주제</h4>
                      <div className="space-y-2">
                        {seminar.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="border border-gray-300 p-2 bg-white text-sm">
                            [TOPIC] {topic}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 기술사업화 지원 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 기술사업화 지원
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* 지원 프로그램 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 지원 프로그램</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[PROGRAM] 기술이전 지원</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 대학 및 연구소의 우수 기술을 
                      기업으로 이전하는 과정을 지원
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[PROGRAM] 사업화 컨설팅</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 기술의 상용화 가능성 분석 및 
                      사업화 전략 수립 지원
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[PROGRAM] 특허 지원</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 특허 출원 및 관리, 
                      지적재산권 보호 지원
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[PROGRAM] 투자 연계</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 기술 기반 창업 및 
                      투자 유치 지원
                    </div>
                  </div>
                </div>
              </div>

              {/* 성과 현황 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 성과 현황</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACHIEVEMENT] 기술이전 건수</div>
                    <div className="text-gray-600">[VALUE] 연간 25건</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACHIEVEMENT] 특허 출원</div>
                    <div className="text-gray-600">[VALUE] 연간 150건</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACHIEVEMENT] 창업 지원</div>
                    <div className="text-gray-600">[VALUE] 연간 20개 기업</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[ACHIEVEMENT] 투자 유치</div>
                    <div className="text-gray-600">[VALUE] 연간 50억원</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 창업 멘토링 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 창업 멘토링
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 멘토링 프로그램 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 멘토링 프로그램</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[PROGRAM] 1:1 멘토링</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 경험 있는 기업가와 연구자가 
                      ㅁ1:1로 매칭되어 창업 및 사업화 조언
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[PROGRAM] 그룹 멘토링</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 동일 분야 창업자들이 모여 
                      서로의 경험을 공유하고 조언
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[PROGRAM] 전문 멘토링</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 특정 분야 전문가를 통한 
                      기술적, 사업적 전문 조언
                    </div>
                  </div>
                </div>
              </div>

              {/* 멘토 현황 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 멘토 현황</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[MENTOR] 총 멘토 수</div>
                    <div className="text-gray-600 text-sm">[VALUE] 45명</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[MENTOR] 기업가 멘토</div>
                    <div className="text-gray-600 text-sm">[VALUE] 25명</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[MENTOR] 연구자 멘토</div>
                    <div className="text-gray-600 text-sm">[VALUE] 15명</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[MENTOR] 투자자 멘토</div>
                    <div className="text-gray-600 text-sm">[VALUE] 5명</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 참여 방법 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 참여 방법
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 회원 가입</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[STEP] 온라인 신청</div>
                      <div className="text-gray-600 text-sm">홈페이지를 통한 회원 가입 신청</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[STEP] 자격 심사</div>
                      <div className="text-gray-600 text-sm">과학기술 관련 경력 및 전문성 검토</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[STEP] 가입 승인</div>
                      <div className="text-gray-600 text-sm">심사위원회 심의 후 가입 승인</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 문의처</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 담당부서</div>
                      <div className="text-gray-600">[VALUE] 전북테크노파크</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 담당자</div>
                      <div className="text-gray-600">[VALUE] 홍○○ 과장</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 전화</div>
                      <div className="text-gray-600">[VALUE] 063-XXX-XXXX</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 이메일</div>
                      <div className="text-gray-600">[VALUE] techforum@jbtech.or.kr</div>
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

export default TechForumPage;

