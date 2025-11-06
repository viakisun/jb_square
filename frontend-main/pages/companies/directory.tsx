import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const CompanyDirectoryPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '기업정보', href: '/companies' },
    { label: '지역 기업 정보' }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const industries = ['바이오의약품', '의료기기', '농생명', '화장품', '디지털헬스'];
  const stages = ['예비창업', '창업초기', '성장기', '성숙기', '상장기업'];
  const regions = ['전주', '군산', '익산', '정읍', '남원', '김제'];
  const revenueRanges = ['10억 미만', '10-50억', '50-100억', '100-500억', '500억 이상'];

  const companies = [
    {
      id: 1,
      name: '셀트리온',
      ceo: '서정진',
      industry: '바이오의약품',
      stage: '상장기업',
      revenue: '1조원',
      address: '인천 송도',
      phone: '032-850-5000',
      website: 'www.celltrion.com',
      employees: 1200,
      founded: 2002
    },
    {
      id: 2,
      name: '진바이오텍',
      ceo: '김○○',
      industry: '진단기기',
      stage: 'Series B',
      revenue: '50억원',
      address: '전북 정읍',
      phone: '063-XXX-XXXX',
      website: 'www.jinbiotech.com',
      employees: 85,
      founded: 2018
    },
    {
      id: 3,
      name: '바이오젠텍',
      ceo: '이○○',
      industry: '바이오의약품',
      stage: 'Series A',
      revenue: '30억원',
      address: '전북 전주',
      phone: '063-XXX-XXXX',
      website: 'www.biogentech.com',
      employees: 45,
      founded: 2020
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
            [HEADER] 지역 기업 정보
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전북 지역 바이오 기업 정보 및 현황
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 검색 및 필터 */}
          <section className="mb-8">
            <div className="bg-gray-50 border-2 border-gray-300 p-6">
              <div className="grid md:grid-cols-5 gap-4">
                <input 
                  className="border border-gray-400 p-2" 
                  placeholder="[SEARCH] 기업명/대표자명/제품명 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                  className="border border-gray-400 p-2"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                >
                  <option value="">[FILTER] 산업분야</option>
                  {industries.map((industry, index) => (
                    <option key={index} value={industry}>{industry}</option>
                  ))}
                </select>
                <select 
                  className="border border-gray-400 p-2"
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                >
                  <option value="">[FILTER] 기업성장단계</option>
                  {stages.map((stage, index) => (
                    <option key={index} value={stage}>{stage}</option>
                  ))}
                </select>
                <select 
                  className="border border-gray-400 p-2"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="">[FILTER] 지역</option>
                  {regions.map((region, index) => (
                    <option key={index} value={region}>{region}</option>
                  ))}
                </select>
                <button className="border-2 border-gray-400 bg-white p-2">[BUTTON] 검색</button>
              </div>
            </div>
          </section>

          {/* 기업 목록 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 기업 목록</h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 p-3 text-left">[TH] 번호</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 기업명</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 대표자</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 업종</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 성장단계</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 매출규모</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 주소</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 전화번호</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id}>
                        <td className="border border-gray-300 p-3">[TD] {company.id}</td>
                        <td className="border border-gray-300 p-3">[TD] {company.name}</td>
                        <td className="border border-gray-300 p-3">[TD] {company.ceo}</td>
                        <td className="border border-gray-300 p-3">[TD] {company.industry}</td>
                        <td className="border border-gray-300 p-3">[TD] {company.stage}</td>
                        <td className="border border-gray-300 p-3">[TD] {company.revenue}</td>
                        <td className="border border-gray-300 p-3">[TD] {company.address}</td>
                        <td className="border border-gray-300 p-3">[TD] {company.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 기업 상세 정보 페이지 구조 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 기업 상세 정보 페이지 구조</h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="space-y-6">
                {/* 기업 기본정보 */}
                <div className="border-2 border-gray-400 p-6 bg-gray-50">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 기업 기본정보</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 기업명</div>
                          <div className="text-gray-600 text-sm">[VALUE] 셀트리온</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 대표자명</div>
                          <div className="text-gray-600 text-sm">[VALUE] 서정진</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 설립년도</div>
                          <div className="text-gray-600 text-sm">[VALUE] 2002년</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 종업원수</div>
                          <div className="text-gray-600 text-sm">[VALUE] 1,200명</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-3">
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 대표전화</div>
                          <div className="text-gray-600 text-sm">[VALUE] 032-850-5000</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 홈페이지</div>
                          <div className="text-gray-600 text-sm">[VALUE] www.celltrion.com</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 주소</div>
                          <div className="text-gray-600 text-sm">[VALUE] 인천 송도</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 업종</div>
                          <div className="text-gray-600 text-sm">[VALUE] 바이오의약품</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 사업 정보 */}
                <div className="border-2 border-gray-400 p-6 bg-gray-50">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 사업 정보</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-300 p-4 bg-white">
                      <div className="font-medium text-gray-800 mb-2">[LABEL] 주요사업</div>
                      <div className="text-gray-600 text-sm">
                        [VALUE] 바이오시밀러 개발 및 생산, 항체치료제 연구개발
                      </div>
                    </div>
                    <div className="border border-gray-300 p-4 bg-white">
                      <div className="font-medium text-gray-800 mb-2">[LABEL] 주력제품/서비스</div>
                      <div className="text-gray-600 text-sm">
                        [VALUE] 렘시마, 트루젠, 바이오시밀러 제품군
                      </div>
                    </div>
                    <div className="border border-gray-300 p-4 bg-white">
                      <div className="font-medium text-gray-800 mb-2">[LABEL] 보유기술</div>
                      <div className="text-gray-600 text-sm">
                        [VALUE] 항체 생산 기술, 바이오시밀러 개발 기술
                      </div>
                    </div>
                  </div>
                </div>

                {/* 재무 정보 */}
                <div className="border-2 border-gray-400 p-6 bg-gray-50">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 재무 정보</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="border border-gray-300 p-4 bg-white">
                      <div className="font-medium text-gray-800 mb-2">[LABEL] 자본금</div>
                      <div className="text-gray-600 text-sm">[VALUE] 1,000억원</div>
                    </div>
                    <div className="border border-gray-300 p-4 bg-white">
                      <div className="font-medium text-gray-800 mb-2">[LABEL] 전년도 매출</div>
                      <div className="text-gray-600 text-sm">[VALUE] 1조원</div>
                    </div>
                    <div className="border border-gray-300 p-4 bg-white">
                      <div className="font-medium text-gray-800 mb-2">[LABEL] 당기 예상매출</div>
                      <div className="text-gray-600 text-sm">[VALUE] 1.2조원</div>
                    </div>
                  </div>
                </div>

                {/* 투자유치 현황 */}
                <div className="border-2 border-gray-400 p-6 bg-gray-50">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[SUBSECTION] 투자유치 현황</h3>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="text-gray-600 text-sm">
                      [VALUE] 코스닥 상장 (2018년), 시가총액 10조원, 
                      글로벌 투자기관으로부터 지속적인 투자 유치
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 매출규모별 분류 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 매출규모별 분류</h2>
            
            <div className="grid md:grid-cols-5 gap-4">
              {revenueRanges.map((range, index) => (
                <div key={index} className="border-2 border-gray-300 p-4 bg-gray-50 text-center">
                  <div className="font-medium text-gray-800 mb-2">[RANGE] {range}</div>
                  <div className="text-gray-600 text-sm">[COUNT] {Math.floor(Math.random() * 50) + 10}개 기업</div>
                </div>
              ))}
            </div>
          </section>

          {/* 페이지네이션 */}
          <section className="mb-16">
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {[1,2,3,4,5].map(num => (
                  <button key={num} className="border border-gray-400 px-3 py-2 bg-white">
                    [PAGINATION] {num}
                  </button>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompanyDirectoryPage;

