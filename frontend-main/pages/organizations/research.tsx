import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const ResearchPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '지원기관', href: '/organizations' },
    { label: '연구소' }
  ];

  const researchInstitutes = [
    {
      name: '한국생명공학연구원',
      type: '정부출연연구기관',
      address: '대전광역시 유성구 대학로 101',
      phone: '042-879-5000',
      website: 'www.kribb.re.kr',
      researchAreas: ['바이오의약품', '의료기기', '농생명', '환경생명공학']
    },
    {
      name: '한국화학연구원',
      type: '정부출연연구기관',
      address: '대전광역시 유성구 과학로 202',
      phone: '042-860-7114',
      website: 'www.krict.re.kr',
      researchAreas: ['신소재', '화학공학', '나노기술', '바이오화학']
    },
    {
      name: '한국생산기술연구원',
      type: '정부출연연구기관',
      address: '대전광역시 유성구 가정로 303',
      phone: '042-860-7114',
      website: 'www.kitech.re.kr',
      researchAreas: ['제조기술', '자동화', '품질관리', '바이오제조']
    },
    {
      name: '한국과학기술연구원',
      type: '정부출연연구기관',
      address: '대전광역시 유성구 과학로 808',
      phone: '042-860-6114',
      website: 'www.kist.re.kr',
      researchAreas: ['기초과학', '응용과학', '융합기술', '바이오기술']
    },
    {
      name: '한국식품연구원',
      type: '정부출연연구기관',
      address: '전북 전주시 덕진구 백제대로 567',
      phone: '063-219-9000',
      website: 'www.kfri.re.kr',
      researchAreas: ['식품공학', '식품안전', '기능성식품', '식품생명공학']
    },
    {
      name: '한국농업기술원',
      type: '정부출연연구기관',
      address: '전북 전주시 완산구 천잠로 303',
      phone: '063-220-3114',
      website: 'www.rda.go.kr',
      researchAreas: ['작물육종', '생물농약', '농업생명공학', '스마트농업']
    },
    {
      name: '전북바이오융합산업진흥원',
      type: '지방공기업',
      address: '전북 정읍시 첨단과학산업단지 123',
      phone: '063-219-3600',
      website: 'www.jbbia.or.kr',
      researchAreas: ['바이오클러스터', '기업지원', '기술이전', '사업화']
    },
    {
      name: '전북테크노파크',
      type: '지방공기업',
      address: '전북 전주시 덕진구 백제대로 567',
      phone: '063-270-2114',
      website: 'www.jbtech.or.kr',
      researchAreas: ['기술혁신', '창업지원', 'R&D', '기술사업화']
    }
  ];

  const researchCategories = {
    '기초연구': researchInstitutes.filter(inst => 
      inst.researchAreas.some(area => 
        ['기초과학', '응용과학', '융합기술', '바이오기술'].includes(area)
      )
    ),
    '응용연구': researchInstitutes.filter(inst => 
      inst.researchAreas.some(area => 
        ['바이오의약품', '의료기기', '농생명', '환경생명공학'].includes(area)
      )
    ),
    '개발연구': researchInstitutes.filter(inst => 
      inst.researchAreas.some(area => 
        ['제조기술', '자동화', '품질관리', '바이오제조'].includes(area)
      )
    )
  };

  const cooperationPrograms = [
    {
      title: '산학연 협력 프로그램',
      description: '대학, 연구소, 기업 간의 공동연구 및 기술개발',
      participants: '전북대, 원광대, 셀트리온, 진바이오텍',
      results: '연간 50건의 공동연구 프로젝트 수행'
    },
    {
      title: '공동 연구 과제',
      description: '정부출연연구기관과 지역 기업의 공동연구',
      participants: '한국생명공학연구원, 한국화학연구원, 지역 바이오기업',
      results: '연간 30건의 공동연구 과제 수행'
    },
    {
      title: '기술이전 현황',
      description: '연구소의 우수 기술을 기업으로 이전',
      participants: '전북바이오융합산업진흥원, 전북테크노파크',
      results: '연간 100건의 기술이전 성사'
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
            [HEADER] 연구소
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전북 지역 연구소의 바이오 관련 연구 현황
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 연구소 정보 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 연구소 정보
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 p-3 text-left">[TH] 기관명</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 설립구분</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 주소</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 대표번호</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 조직현황</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 홈페이지</th>
                    </tr>
                  </thead>
                  <tbody>
                    {researchInstitutes.map((inst, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-3">[TD] {inst.name}</td>
                        <td className="border border-gray-300 p-3">[TD] {inst.type}</td>
                        <td className="border border-gray-300 p-3">[TD] {inst.address}</td>
                        <td className="border border-gray-300 p-3">[TD] {inst.phone}</td>
                        <td className="border border-gray-300 p-3">[LINK] 바로가기</td>
                        <td className="border border-gray-300 p-3">[LINK] {inst.website}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 연구 분야별 분류 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 연구 분야별 분류
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {Object.entries(researchCategories).map(([category, institutes]) => (
                <div key={category} className="border-2 border-gray-400 p-6 bg-gray-50">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] {category}</h3>
                  <div className="space-y-3">
                    {institutes.map((inst, index) => (
                      <div key={index} className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800 mb-1">[INSTITUTE] {inst.name}</div>
                        <div className="text-gray-600 text-sm">[TYPE] {inst.type}</div>
                        <div className="text-gray-600 text-sm">[ADDRESS] {inst.address}</div>
                        <div className="text-gray-600 text-sm">[PHONE] {inst.phone}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 주요 연구소 상세 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 주요 연구소 상세
            </h2>
            
            <div className="space-y-8">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[INSTITUTE] 한국생명공학연구원</h3>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 기본 정보</h4>
                    <div className="space-y-2">
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 설립일</div>
                        <div className="text-gray-600 text-sm">[VALUE] 1985년 2월</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 연구원 수</div>
                        <div className="text-gray-600 text-sm">[VALUE] 1,200명</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 연간 예산</div>
                        <div className="text-gray-600 text-sm">[VALUE] 3,000억원</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 연구 분야</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {researchInstitutes[0].researchAreas.map((area, index) => (
                        <div key={index} className="border border-gray-300 p-2 bg-white text-sm">
                          [FIELD] {area}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[INSTITUTE] 전북바이오융합산업진흥원</h3>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 기본 정보</h4>
                    <div className="space-y-2">
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 설립일</div>
                        <div className="text-gray-600 text-sm">[VALUE] 2020년 1월</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 직원 수</div>
                        <div className="text-gray-600 text-sm">[VALUE] 150명</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 연간 예산</div>
                        <div className="text-gray-600 text-sm">[VALUE] 500억원</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 주요 사업</h4>
                    <div className="space-y-2">
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[PROGRAM] 바이오 클러스터 운영</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 전북 바이오 클러스터 관리</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[PROGRAM] 기업 지원</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 바이오 기업 육성 지원</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[PROGRAM] 기술이전</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 연구 성과 사업화</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 협력 현황 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 협력 현황
            </h2>
            
            <div className="space-y-8">
              {cooperationPrograms.map((program, index) => (
                <div key={index} className="border-2 border-gray-400 p-6 bg-gray-50">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-800">[PROGRAM] {program.title}</h3>
                      <div className="border border-gray-300 p-4 bg-white">
                        <div className="text-gray-600 text-sm">
                          [DESCRIPTION] {program.description}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 참여 기관</h4>
                      <div className="space-y-2">
                        <div className="border border-gray-300 p-2 bg-white">
                          <div className="font-medium text-gray-800">[PARTICIPANTS] {program.participants}</div>
                        </div>
                        <div className="border border-gray-300 p-2 bg-white">
                          <div className="font-medium text-gray-800">[RESULTS] {program.results}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 연구 성과 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 연구 성과
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 특허 현황</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PATENT] 총 특허 출원</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 500건</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PATENT] 특허 등록</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 300건</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PATENT] 해외 특허</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 100건</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 논문 현황</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PAPER] SCI급 논문</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 400편</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PAPER] 국제학술지</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 300편</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PAPER] 국내학술지</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 200편</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 기술이전 현황 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 기술이전 현황
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 기술이전 건수</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TRANSFER] 연간 이전 건수</div>
                    <div className="text-gray-600 text-sm">[COUNT] 100건</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TRANSFER] 누적 이전 건수</div>
                    <div className="text-gray-600 text-sm">[COUNT] 1,000건</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TRANSFER] 성공률</div>
                    <div className="text-gray-600 text-sm">[RATE] 85%</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 기술이전 분야</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FIELD] 바이오의약품</div>
                    <div className="text-gray-600 text-sm">[COUNT] 40건</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FIELD] 의료기기</div>
                    <div className="text-gray-600 text-sm">[COUNT] 30건</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FIELD] 농생명</div>
                    <div className="text-gray-600 text-sm">[COUNT] 20건</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[FIELD] 기타</div>
                    <div className="text-gray-600 text-sm">[COUNT] 10건</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 기술이전 효과</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[EFFECT] 매출 증대</div>
                    <div className="text-gray-600 text-sm">[AMOUNT] 연간 500억원</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[EFFECT] 고용 창출</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 200명</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[EFFECT] 투자 유치</div>
                    <div className="text-gray-600 text-sm">[AMOUNT] 연간 300억원</div>
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

export default ResearchPage;

