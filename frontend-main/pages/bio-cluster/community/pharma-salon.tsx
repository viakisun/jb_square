import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Breadcrumb from '../../../components/Breadcrumb';

const PharmaSalonPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: 'JB BIO 클러스터', href: '/bio-cluster' },
    { label: '커뮤니티', href: '/bio-cluster/community' },
    { label: '혁신신약살롱' }
  ];

  const discussionTopics = [
    {
      title: '신약 파이프라인 전략',
      description: '효율적인 신약 개발 파이프라인 구축 및 관리 전략',
      details: [
        '타겟 선정 및 검증 방법론',
        '전임상 연구 설계 및 최적화',
        '임상시험 단계별 전략 수립',
        '파이프라인 포트폴리오 관리'
      ]
    },
    {
      title: '임상시험 설계 및 관리',
      description: '성공적인 임상시험을 위한 설계 및 운영 노하우',
      details: [
        '임상시험 프로토콜 설계',
        '환자 모집 및 관리 전략',
        '데이터 관리 및 품질보증',
        '글로벌 임상시험 운영'
      ]
    },
    {
      title: '규제 당국 대응 방안',
      description: 'FDA, EMA 등 글로벌 규제당국과의 효과적인 소통',
      details: [
        'IND/CTA 신청 전략',
        '규제당국 미팅 준비',
        '규제 피드백 대응',
        '승인 후 관리 전략'
      ]
    },
    {
      title: '글로벌 진출 전략',
      description: '해외 시장 진출을 위한 전략적 접근',
      details: [
        '시장 분석 및 진입 전략',
        '파트너십 구축',
        '라이선싱 및 아웃라이선싱',
        '글로벌 마케팅 전략'
      ]
    },
    {
      title: '투자 유치 노하우',
      description: '바이오 기업의 성공적인 투자 유치 전략',
      details: [
        '투자자 타겟팅',
        '사업계획서 작성',
        'IR 프레젠테이션',
        'DD 대응 전략'
      ]
    }
  ];

  const participantTypes = [
    {
      type: '제약회사 R&D 담당자',
      description: '신약 개발 경험 5년 이상의 R&D 책임자',
      benefits: '동종업계 경험 공유, 기술 트렌드 파악'
    },
    {
      type: '바이오벤처 창업자',
      description: '바이오 분야 창업 및 경영 경험자',
      benefits: '창업 노하우, 투자 유치 경험 공유'
    },
    {
      type: '관련 분야 교수/연구원',
      description: '대학 및 연구소 소속 바이오 연구자',
      benefits: '최신 연구 동향, 학술적 접근 방법론'
    },
    {
      type: '임상시험 전문가',
      description: 'CRO 또는 임상시험 관리 경험자',
      benefits: '임상시험 운영 노하우, 규제 대응 경험'
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
            [HEADER] 혁신신약살롱
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 신약 개발 전문가들의 지식 공유 및 네트워킹
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 살롱 소개 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 살롱 소개
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 목적 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 목적</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[PURPOSE] 전문가 네트워킹</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 신약 개발 분야의 전문가들이 모여 
                      서로의 경험과 지식을 공유하고 네트워크를 구축
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[PURPOSE] 지식 공유</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 신약 개발의 각 단계별 노하우와 
                      최신 동향을 공유하여 전체적인 역량 향상
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[PURPOSE] 협력 기회 발굴</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 기업 간, 기관 간 협력 기회를 발굴하고 
                      공동 프로젝트 추진
                    </div>
                  </div>
                </div>
              </div>

              {/* 특징 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 특징</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FEATURE] 소규모 심화 토론</div>
                    <div className="text-gray-600 text-sm">참가자 15명 이내의 소규모 그룹</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FEATURE] 전문성 중심</div>
                    <div className="text-gray-600 text-sm">신약 개발 경험 5년 이상 전문가</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FEATURE] 비공개 운영</div>
                    <div className="text-gray-600 text-sm">참가자 신원 확인 후 초대</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FEATURE] 정기 모임</div>
                    <div className="text-gray-600 text-sm">분기별 정기 모임 및 특별 세션</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FEATURE] 실무 중심</div>
                    <div className="text-gray-600 text-sm">이론보다는 실무 경험 중심 토론</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 참가자 정보 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 참가자 정보
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 현재 참가자 현황 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 현재 참가자 현황</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STATUS] 총 참가자 수</div>
                    <div className="text-gray-600">[VALUE] 45명 (익명 처리)</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STATUS] 제약회사 R&D</div>
                    <div className="text-gray-600">[VALUE] 18명</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STATUS] 바이오벤처</div>
                    <div className="text-gray-600">[VALUE] 15명</div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STATUS] 대학/연구소</div>
                    <div className="text-gray-600">[VALUE] 12명</div>
                  </div>
                </div>
              </div>

              {/* 참가자 자격 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 참가자 자격</h3>
                <div className="space-y-3">
                  {participantTypes.map((type, index) => (
                    <div key={index} className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800 mb-1">[TYPE] {type.type}</div>
                      <div className="text-gray-600 text-sm mb-2">{type.description}</div>
                      <div className="text-gray-500 text-xs">[BENEFIT] {type.benefits}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 주요 토론 주제 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 주요 토론 주제
            </h2>
            
            <div className="space-y-8">
              {discussionTopics.map((topic, index) => (
                <div key={index} className="border-2 border-gray-400 p-6 bg-gray-50">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-800">[TOPIC] {topic.title}</h3>
                      <div className="border border-gray-300 p-4 bg-white">
                        <div className="text-gray-600 text-sm">
                          [DESCRIPTION] {topic.description}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 세부 내용</h4>
                      <div className="space-y-2">
                        {topic.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="border border-gray-300 p-2 bg-white text-sm">
                            [DETAIL] {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 참여 방법 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 참여 방법
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 신청 절차 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 신청 절차</h3>
                <div className="space-y-4">
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STEP] 1단계: 신청 자격 확인</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 신약 개발 경험 5년 이상 여부 확인
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STEP] 2단계: 온라인 신청서 작성</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 경력, 전문분야, 참여 목적 등 작성
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STEP] 3단계: 심사 과정</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 운영위원회 심사 및 참가자 선정
                    </div>
                  </div>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="font-medium text-gray-800 mb-2">[STEP] 4단계: 연간 일정 공지</div>
                    <div className="text-gray-600 text-sm">
                      [DESCRIPTION] 선정된 참가자에게 연간 일정 안내
                    </div>
                  </div>
                </div>
              </div>

              {/* 신청서 양식 */}
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 신청서 양식</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FIELD] 개인정보</div>
                    <div className="text-gray-600 text-sm">성명, 소속, 직책, 연락처</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FIELD] 경력 정보</div>
                    <div className="text-gray-600 text-sm">신약 개발 경험, 주요 프로젝트</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FIELD] 전문 분야</div>
                    <div className="text-gray-600 text-sm">전임상, 임상, 규제, 사업화 등</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FIELD] 참여 목적</div>
                    <div className="text-gray-600 text-sm">네트워킹, 지식 공유, 협력 등</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FIELD] 기타</div>
                    <div className="text-gray-600 text-sm">특이사항, 제안사항</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 운영 정보 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 운영 정보
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 모임 일정</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SCHEDULE] 정기 모임</div>
                    <div className="text-gray-600 text-sm">분기별 1회 (3, 6, 9, 12월)</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SCHEDULE] 특별 세션</div>
                    <div className="text-gray-600 text-sm">연 2회 (필요시 추가 개최)</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SCHEDULE] 모임 시간</div>
                    <div className="text-gray-600 text-sm">오후 2시-6시 (4시간)</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 모임 장소</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[LOCATION] 정기 장소</div>
                    <div className="text-gray-600 text-sm">전북 바이오 클러스터 회의실</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[LOCATION] 특별 장소</div>
                    <div className="text-gray-600 text-sm">회원 기업 사무실, 연구소 등</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[LOCATION] 온라인</div>
                    <div className="text-gray-600 text-sm">필요시 화상회의 진행</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 문의 및 신청 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 문의 및 신청
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 문의처</h3>
                  <div className="space-y-3">
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 담당부서</div>
                      <div className="text-gray-600">[VALUE] 전북바이오융합산업진흥원</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 담당자</div>
                      <div className="text-gray-600">[VALUE] 김○○ 대리</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 전화</div>
                      <div className="text-gray-600">[VALUE] 063-219-3600</div>
                    </div>
                    <div className="border border-gray-300 p-3 bg-white">
                      <div className="font-medium text-gray-800">[LABEL] 이메일</div>
                      <div className="text-gray-600">[VALUE] salon@jbbia.or.kr</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 신청하기</h3>
                  <div className="space-y-4">
                    <div className="border-2 border-gray-400 bg-white p-4 text-center">
                      <div className="font-medium text-gray-800 mb-2">[BUTTON] 온라인 신청서 작성</div>
                      <div className="text-gray-600 text-sm">신청서 양식 다운로드 및 제출</div>
                    </div>
                    <div className="border-2 border-gray-400 bg-white p-4 text-center">
                      <div className="font-medium text-gray-800 mb-2">[BUTTON] 전화 문의</div>
                      <div className="text-gray-600 text-sm">063-219-3600</div>
                    </div>
                    <div className="border-2 border-gray-400 bg-white p-4 text-center">
                      <div className="font-medium text-gray-800 mb-2">[BUTTON] 이메일 문의</div>
                      <div className="text-gray-600 text-sm">salon@jbbia.or.kr</div>
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

export default PharmaSalonPage;

