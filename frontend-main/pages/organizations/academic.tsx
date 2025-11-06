import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const AcademicPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '지원기관', href: '/organizations' },
    { label: '대학' }
  ];

  const universities = [
    {
      name: '전북대학교',
      type: '국립대',
      category: '종합대학',
      establishment: '국립',
      address: '전북 전주시 덕진구 백제대로 567',
      phone: '063-270-2114',
      website: 'www.jbnu.ac.kr',
      bioDepartments: [
        '생명과학과', '생명공학과', '의생명공학과', '바이오시스템공학과',
        '의학과', '치의학과', '한의학과', '간호학과'
      ]
    },
    {
      name: '원광대학교',
      type: '사립대',
      category: '종합대학',
      establishment: '사립',
      address: '전북 익산시 익산대로 460',
      phone: '063-850-5114',
      website: 'www.wku.ac.kr',
      bioDepartments: [
        '생명과학과', '생명공학과', '의생명공학과', '한약학과',
        '의학과', '치의학과', '한의학과', '간호학과'
      ]
    },
    {
      name: '전주대학교',
      type: '사립대',
      category: '종합대학',
      establishment: '사립',
      address: '전북 전주시 완산구 천잠로 303',
      phone: '063-220-3114',
      website: 'www.jj.ac.kr',
      bioDepartments: [
        '생명과학과', '생명공학과', '의생명공학과', '식품생명공학과'
      ]
    },
    {
      name: '예수대학교',
      type: '사립대',
      category: '종합대학',
      establishment: '사립',
      address: '전북 전주시 완산구 천잠로 303',
      phone: '063-220-3114',
      website: 'www.yesu.ac.kr',
      bioDepartments: [
        '생명과학과', '생명공학과', '의생명공학과'
      ]
    },
    {
      name: '군산대학교',
      type: '국립대',
      category: '종합대학',
      establishment: '국립',
      address: '전북 군산시 대학로 558',
      phone: '063-469-4114',
      website: 'www.kunsan.ac.kr',
      bioDepartments: [
        '생명과학과', '생명공학과', '의생명공학과', '해양생명공학과'
      ]
    },
    {
      name: '서남대학교',
      type: '사립대',
      category: '종합대학',
      establishment: '사립',
      address: '전북 남원시 양림길 31',
      phone: '063-620-0114',
      website: 'www.snu.ac.kr',
      bioDepartments: [
        '생명과학과', '생명공학과', '의생명공학과'
      ]
    }
  ];

  const bioRelatedMajors = [
    {
      university: '전북대학교',
      department: '생명과학과',
      professors: 15,
      researchAreas: ['분자생물학', '세포생물학', '발생생물학', '면역학'],
      industryCooperation: '셀트리온, 진바이오텍과 공동연구'
    },
    {
      university: '전북대학교',
      department: '생명공학과',
      professors: 12,
      researchAreas: ['단백질공학', '효소공학', '발효공학', '바이오소재'],
      industryCooperation: '바이오젠텍, 메디텍과 기술이전'
    },
    {
      university: '원광대학교',
      department: '한약학과',
      professors: 8,
      researchAreas: ['천연물화학', '한약재학', '생약학', '약리학'],
      industryCooperation: '농협바이오, 한방바이오와 협력'
    },
    {
      university: '전주대학교',
      department: '식품생명공학과',
      professors: 10,
      researchAreas: ['식품공학', '영양학', '식품미생물학', '식품화학'],
      industryCooperation: '식품기업과 공동연구'
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
            [HEADER] 대학
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전북 지역 대학의 바이오 관련 학과 및 연구 현황
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 대학 정보 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 대학 정보
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 p-3 text-left">[TH] 학교명</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 학교종류</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 학교유형</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 설립유형</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 주소</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 대표번호</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 조직현황</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 홈페이지</th>
                    </tr>
                  </thead>
                  <tbody>
                    {universities.map((univ, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-3">[TD] {univ.name}</td>
                        <td className="border border-gray-300 p-3">[TD] {univ.type}</td>
                        <td className="border border-gray-300 p-3">[TD] {univ.category}</td>
                        <td className="border border-gray-300 p-3">[TD] {univ.establishment}</td>
                        <td className="border border-gray-300 p-3">[TD] {univ.address}</td>
                        <td className="border border-gray-300 p-3">[TD] {univ.phone}</td>
                        <td className="border border-gray-300 p-3">[LINK] 바로가기</td>
                        <td className="border border-gray-300 p-3">[LINK] {univ.website}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 바이오 관련 학과/전공 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 바이오 관련 학과/전공
            </h2>
            
            <div className="space-y-8">
              {universities.map((univ, index) => (
                <div key={index} className="border-2 border-gray-400 p-6 bg-gray-50">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[UNIVERSITY] {univ.name}</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {univ.bioDepartments.map((dept, deptIndex) => (
                      <div key={deptIndex} className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800">[DEPARTMENT] {dept}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 주요 학과 상세 정보 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 주요 학과 상세 정보
            </h2>
            
            <div className="space-y-8">
              {bioRelatedMajors.map((major, index) => (
                <div key={index} className="border-2 border-gray-400 p-6 bg-gray-50">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">[DEPARTMENT] {major.department}</h3>
                      <div className="space-y-3">
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 소속 대학</div>
                          <div className="text-gray-600">[VALUE] {major.university}</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 교수진 현황</div>
                          <div className="text-gray-600">[VALUE] {major.professors}명</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 산학협력 현황</div>
                          <div className="text-gray-600">[VALUE] {major.industryCooperation}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 주요 연구 분야</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {major.researchAreas.map((area, areaIndex) => (
                          <div key={areaIndex} className="border border-gray-300 p-2 bg-white text-sm">
                            [FIELD] {area}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 대학별 특화 분야 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 대학별 특화 분야
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[UNIVERSITY] 전북대학교</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SPECIALTY] 의생명공학</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 의학과 생명공학의 융합 연구</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SPECIALTY] 바이오시스템공학</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 바이오 시스템 설계 및 제어</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SPECIALTY] 의학 연구</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 임상의학 및 기초의학 연구</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[UNIVERSITY] 원광대학교</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SPECIALTY] 한약학</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 천연물 및 한약재 연구</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SPECIALTY] 한의학</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 전통의학 현대화 연구</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[SPECIALTY] 생명공학</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 바이오 기술 개발</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 산학협력 현황 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 산학협력 현황
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 공동연구</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PROJECT] 바이오의약품 개발</div>
                    <div className="text-gray-600 text-sm">[PARTNERS] 전북대-셀트리온</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PROJECT] 진단기기 개발</div>
                    <div className="text-gray-600 text-sm">[PARTNERS] 전북대-진바이오텍</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PROJECT] 천연물 연구</div>
                    <div className="text-gray-600 text-sm">[PARTNERS] 원광대-농협바이오</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 기술이전</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TRANSFER] 단백질 정제 기술</div>
                    <div className="text-gray-600 text-sm">[FROM] 전북대 → 바이오젠텍</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TRANSFER] 진단키트 기술</div>
                    <div className="text-gray-600 text-sm">[FROM] 전북대 → 메디텍</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[TRANSFER] 천연물 추출 기술</div>
                    <div className="text-gray-600 text-sm">[FROM] 원광대 → 한방바이오</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 인력양성</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PROGRAM] 산업체 연수</div>
                    <div className="text-gray-600 text-sm">[TARGET] 대학원생 대상</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PROGRAM] 전문인력 양성</div>
                    <div className="text-gray-600 text-sm">[TARGET] 기업 재직자</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PROGRAM] 창업 교육</div>
                    <div className="text-gray-600 text-sm">[TARGET] 예비창업자</div>
                  </div>
                </div>
              </div>
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
                    <div className="font-medium text-gray-800">[PATENT] 전북대학교</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 150건 출원</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PATENT] 원광대학교</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 80건 출원</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PATENT] 전주대학교</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 60건 출원</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 논문 현황</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PAPER] SCI급 논문</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 200편 발표</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PAPER] 국제학술지</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 150편 발표</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PAPER] 국내학술지</div>
                    <div className="text-gray-600 text-sm">[COUNT] 연간 100편 발표</div>
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

export default AcademicPage;

