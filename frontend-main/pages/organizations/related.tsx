import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const RelatedOrganizationsPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '지원기관', href: '/organizations' },
    { label: '유관기관' }
  ];

  const organizations = [
    {
      name: '한국바이오협회',
      address: '서울특별시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      website: 'www.koreabio.or.kr',
      supportType: '정책 지원'
    },
    {
      name: '한국제약바이오협회',
      address: '서울특별시 중구 세종대로 456',
      phone: '02-2345-6789',
      website: 'www.kpma.or.kr',
      supportType: '정책 지원'
    },
    {
      name: '한국의료기기산업협회',
      address: '서울특별시 서초구 서초대로 789',
      phone: '02-3456-7890',
      website: 'www.kamed.or.kr',
      supportType: '기술 지원'
    },
    {
      name: '한국생명공학연구원',
      address: '대전광역시 유성구 대학로 101',
      phone: '042-879-5000',
      website: 'www.kribb.re.kr',
      supportType: '기술 지원'
    },
    {
      name: '한국화학연구원',
      address: '대전광역시 유성구 과학로 202',
      phone: '042-860-7114',
      website: 'www.krict.re.kr',
      supportType: '기술 지원'
    },
    {
      name: '한국생산기술연구원',
      address: '대전광역시 유성구 가정로 303',
      phone: '042-860-7114',
      website: 'www.kitech.re.kr',
      supportType: '기술 지원'
    },
    {
      name: '한국산업기술진흥원',
      address: '서울특별시 강남구 테헤란로 404',
      phone: '02-3456-7890',
      website: 'www.kitech.re.kr',
      supportType: '자금 지원'
    },
    {
      name: '한국기술거래소',
      address: '서울특별시 강남구 테헤란로 505',
      phone: '02-4567-8901',
      website: 'www.kotra.or.kr',
      supportType: '자금 지원'
    },
    {
      name: '한국연구재단',
      address: '대전광역시 유성구 대학로 606',
      phone: '042-869-6000',
      website: 'www.nrf.re.kr',
      supportType: '자금 지원'
    },
    {
      name: '한국과학기술원',
      address: '대전광역시 유성구 대학로 707',
      phone: '042-350-2114',
      website: 'www.kaist.ac.kr',
      supportType: '인력 지원'
    },
    {
      name: '한국과학기술연구원',
      address: '대전광역시 유성구 과학로 808',
      phone: '042-860-6114',
      website: 'www.kist.re.kr',
      supportType: '인력 지원'
    },
    {
      name: '한국과학기술기획평가원',
      address: '대전광역시 유성구 대학로 909',
      phone: '042-869-6000',
      website: 'www.kistep.re.kr',
      supportType: '인력 지원'
    }
  ];

  const supportCategories = {
    '정책 지원': organizations.filter(org => org.supportType === '정책 지원'),
    '기술 지원': organizations.filter(org => org.supportType === '기술 지원'),
    '자금 지원': organizations.filter(org => org.supportType === '자금 지원'),
    '인력 지원': organizations.filter(org => org.supportType === '인력 지원')
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* 페이지 헤더 */}
      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            [HEADER] 국가행정기관 지원기관
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 바이오 산업 관련 정부 지원기관 안내
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 기관 정보 안내 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 기관 정보 안내
            </h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 p-3 text-left">[TH] 기관명</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 주소</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 대표번호</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 조직현황</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 홈페이지</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-3">[TD] {org.name}</td>
                        <td className="border border-gray-300 p-3">[TD] {org.address}</td>
                        <td className="border border-gray-300 p-3">[TD] {org.phone}</td>
                        <td className="border border-gray-300 p-3">[LINK] 바로가기</td>
                        <td className="border border-gray-300 p-3">[LINK] {org.website}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 지원 내용별 분류 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 지원 내용별 분류
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {Object.entries(supportCategories).map(([category, orgs]) => (
                <div key={category} className="border-2 border-gray-400 p-6 bg-gray-50">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] {category}</h3>
                  <div className="space-y-3">
                    {orgs.map((org, index) => (
                      <div key={index} className="border border-gray-300 p-3 bg-white">
                        <div className="font-medium text-gray-800 mb-1">[ORGANIZATION] {org.name}</div>
                        <div className="text-gray-600 text-sm">[ADDRESS] {org.address}</div>
                        <div className="text-gray-600 text-sm">[PHONE] {org.phone}</div>
                        <div className="text-gray-600 text-sm">[WEBSITE] {org.website}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 정책 지원 기관 상세 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 정책 지원 기관 상세
            </h2>
            
            <div className="space-y-8">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[ORGANIZATION] 한국바이오협회</h3>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 기본 정보</h4>
                    <div className="space-y-2">
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 설립일</div>
                        <div className="text-gray-600 text-sm">[VALUE] 1989년 3월</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 회원 수</div>
                        <div className="text-gray-600 text-sm">[VALUE] 1,200개 기업</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 주요 사업</div>
                        <div className="text-gray-600 text-sm">[VALUE] 정책 연구, 산업 동향 분석, 국제 교류</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 지원 사업</h4>
                    <div className="space-y-2">
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[PROGRAM] 바이오산업 정책 연구</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 산업 정책 수립 지원</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[PROGRAM] 국제 바이오 전시회</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 해외 진출 지원</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[PROGRAM] 바이오 기업 인증</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 기업 신뢰도 향상</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[ORGANIZATION] 한국제약바이오협회</h3>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 기본 정보</h4>
                    <div className="space-y-2">
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 설립일</div>
                        <div className="text-gray-600 text-sm">[VALUE] 1962년 4월</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 회원 수</div>
                        <div className="text-gray-600 text-sm">[VALUE] 800개 기업</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[LABEL] 주요 사업</div>
                        <div className="text-gray-600 text-sm">[VALUE] 제약정책 연구, 의약품 규제 대응</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 지원 사업</h4>
                    <div className="space-y-2">
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[PROGRAM] 제약정책 연구</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 정책 수립 및 개선</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[PROGRAM] 의약품 규제 대응</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 규제 변화 대응 지원</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[PROGRAM] 해외 진출 지원</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 글로벌 시장 진출</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 기술 지원 기관 상세 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 기술 지원 기관 상세
            </h2>
            
            <div className="space-y-8">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[ORGANIZATION] 한국생명공학연구원</h3>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 연구 분야</h4>
                    <div className="space-y-2">
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[FIELD] 바이오의약품</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 신약 개발, 바이오시밀러</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[FIELD] 의료기기</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 진단기기, 치료기기</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[FIELD] 농생명</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 작물 개량, 생물농약</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 지원 서비스</h4>
                    <div className="space-y-2">
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[SERVICE] 공용 연구장비</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 고가 장비 공동 이용</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[SERVICE] 기술이전</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 우수 기술 기업 이전</div>
                      </div>
                      <div className="border border-gray-300 p-2 bg-white">
                        <div className="font-medium text-gray-800">[SERVICE] 공동연구</div>
                        <div className="text-gray-600 text-sm">[DESCRIPTION] 산학연 공동연구</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 연락처 정보 */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 border-gray-300 pb-4">
              [SECTION] 연락처 정보
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 주요 지원사업 안내</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PROGRAM] 바이오산업 기술개발사업</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 바이오 기술 개발 지원</div>
                    <div className="text-gray-600 text-sm">[CONTACT] 02-1234-5678</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PROGRAM] 의료기기 개발지원사업</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 의료기기 개발 지원</div>
                    <div className="text-gray-600 text-sm">[CONTACT] 02-2345-6789</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[PROGRAM] 바이오벤처 육성사업</div>
                    <div className="text-gray-600 text-sm">[DESCRIPTION] 바이오벤처 창업 지원</div>
                    <div className="text-gray-600 text-sm">[CONTACT] 02-3456-7890</div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-gray-400 p-6 bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 담당자 정보</h3>
                <div className="space-y-3">
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[CONTACT] 정책 지원 담당</div>
                    <div className="text-gray-600 text-sm">[NAME] 김○○ 과장</div>
                    <div className="text-gray-600 text-sm">[PHONE] 02-1234-5678</div>
                    <div className="text-gray-600 text-sm">[EMAIL] policy@koreabio.or.kr</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[CONTACT] 기술 지원 담당</div>
                    <div className="text-gray-600 text-sm">[NAME] 이○○ 대리</div>
                    <div className="text-gray-600 text-sm">[PHONE] 02-2345-6789</div>
                    <div className="text-gray-600 text-sm">[EMAIL] tech@koreabio.or.kr</div>
                  </div>
                  <div className="border border-gray-300 p-3 bg-white">
                    <div className="font-medium text-gray-800">[CONTACT] 자금 지원 담당</div>
                    <div className="text-gray-600 text-sm">[NAME] 박○○ 주임</div>
                    <div className="text-gray-600 text-sm">[PHONE] 02-3456-7890</div>
                    <div className="text-gray-600 text-sm">[EMAIL] fund@koreabio.or.kr</div>
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

export default RelatedOrganizationsPage;

