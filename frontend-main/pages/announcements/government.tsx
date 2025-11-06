import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';
import FeedbackMemo from '../../components/FeedbackMemo';

const GovernmentAnnouncementsPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '지원사업공고', href: '/announcements' },
    { label: '정부/지자체' }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const announcements = [
    {
      id: 1,
      title: '2024년 바이오의료기술개발사업',
      ministry: '보건복지부',
      status: '모집중',
      deadline: '2024-10-31',
      views: 1234,
      date: '2024-09-01',
      category: 'R&D',
      budget: '80억원',
      target: '바이오기업'
    },
    {
      id: 2,
      title: 'K-바이오 그랜드 챌린지',
      ministry: '과학기술정보통신부',
      status: '심사중',
      deadline: '2024-11-15',
      views: 856,
      date: '2024-08-25',
      category: '창업지원',
      budget: '50억원',
      target: '스타트업'
    },
    {
      id: 3,
      title: '바이오 스타트업 인큐베이팅',
      ministry: '산업통상자원부',
      status: '예정',
      deadline: '2024-12-01',
      views: 567,
      date: '2024-08-20',
      category: '창업지원',
      budget: '30억원',
      target: '초기창업자'
    }
  ];

  const ministries = [
    '과학기술정보통신부',
    '산업통상자원부',
    '보건복지부',
    '농림축산식품부'
  ];

  const statuses = ['모집중', '심사중', '예정', '마감'];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      {/* 페이지 헤더 */}
      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            [HEADER] 정부/지자체 공고
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 정부 부처 및 지자체 지원사업 공고
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 부처별 바로가기 탭 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 부처별 바로가기</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {ministries.map((ministry, index) => (
                <div key={index} className="border-2 border-gray-300 p-4 bg-gray-50 text-center">
                  <div className="font-medium text-gray-800">[TAB] {ministry}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 검색 기능 */}
          <section className="mb-8">
            <div className="bg-gray-50 border-2 border-gray-300 p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <input 
                  className="border border-gray-400 p-2" 
                  placeholder="[SEARCH] 키워드 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                  className="border border-gray-400 p-2"
                  value={selectedMinistry}
                  onChange={(e) => setSelectedMinistry(e.target.value)}
                >
                  <option value="">[FILTER] 부처별</option>
                  {ministries.map((ministry, index) => (
                    <option key={index} value={ministry}>{ministry}</option>
                  ))}
                </select>
                <select 
                  className="border border-gray-400 p-2"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">[FILTER] 상태별</option>
                  {statuses.map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
                </select>
                <button className="border-2 border-gray-400 bg-white p-2">[BUTTON] 검색</button>
              </div>
            </div>
          </section>

          {/* 공고 목록 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 공고 목록</h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 p-3 text-left">[TH] 순번</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 마감기한</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 제목</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 부처</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 상태</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 조회수</th>
                      <th className="border border-gray-300 p-3 text-left">[TH] 등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((announcement) => (
                      <tr key={announcement.id}>
                        <td className="border border-gray-300 p-3">[TD] {announcement.id}</td>
                        <td className="border border-gray-300 p-3">[TD] {announcement.deadline}</td>
                        <td className="border border-gray-300 p-3">[TD] {announcement.title}</td>
                        <td className="border border-gray-300 p-3">[TD] {announcement.ministry}</td>
                        <td className="border border-gray-300 p-3">
                          <span className="border border-gray-400 bg-gray-200 px-2 py-1 text-xs">
                            [STATUS] {announcement.status}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-3">[TD] {announcement.views}</td>
                        <td className="border border-gray-300 p-3">[TD] {announcement.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 공고 상세 예시 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 공고 상세 페이지 구조</h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">[TITLE] 2024년 바이오의료기술개발사업</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 산업분야</div>
                          <div className="text-gray-600 text-sm">[VALUE] 바이오의약품, 의료기기</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 사업구분</div>
                          <div className="text-gray-600 text-sm">[VALUE] R&D</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 기업유형</div>
                          <div className="text-gray-600 text-sm">[VALUE] 중소기업, 중견기업</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-3">
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 공고일/신청기간</div>
                          <div className="text-gray-600 text-sm">[VALUE] 2024-09-01 ~ 2024-10-31</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 총사업비</div>
                          <div className="text-gray-600 text-sm">[VALUE] 80억원</div>
                        </div>
                        <div className="border border-gray-300 p-3 bg-white">
                          <div className="font-medium text-gray-800">[LABEL] 품목코드</div>
                          <div className="text-gray-600 text-sm">[VALUE] 바이오분야 세부 분류 코드</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 전담기관 정보</h4>
                  <div className="border border-gray-300 p-4 bg-white">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-gray-800">[LABEL] 전담기관명</div>
                        <div className="text-gray-600 text-sm">[VALUE] 한국생명공학연구원</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">[LABEL] 전담부서</div>
                        <div className="text-gray-600 text-sm">[VALUE] 바이오의료기술개발팀</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">[LABEL] 담당자명</div>
                        <div className="text-gray-600 text-sm">[VALUE] 김○○ 연구원</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">[LABEL] 연락처</div>
                        <div className="text-gray-600 text-sm">[VALUE] 042-879-5000</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 첨부파일</h4>
                  <div className="space-y-2">
                    <div className="border border-gray-300 p-2 bg-white">
                      <div className="font-medium text-gray-800">[ATTACHMENT] 공고문.pdf</div>
                    </div>
                    <div className="border border-gray-300 p-2 bg-white">
                      <div className="font-medium text-gray-800">[ATTACHMENT] 신청서 양식.xlsx</div>
                    </div>
                    <div className="border border-gray-300 p-2 bg-white">
                      <div className="font-medium text-gray-800">[ATTACHMENT] 작성 가이드.pdf</div>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* 피드백 메모 섹션 */}
      <FeedbackMemo pagePath="/announcements/government" pageTitle="정부/지자체 공고" />

      <Footer />
    </div>
  );
};

export default GovernmentAnnouncementsPage;

