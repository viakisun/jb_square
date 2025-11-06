import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const NewsPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '뉴스/행사', href: '/news-events' },
    { label: '최신뉴스' }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const categories = ['산업동향', '기업소식', '정책뉴스', '글로벌동향'];
  const periods = ['1주일', '1개월', '3개월', '6개월', '1년'];

  const newsItems = [
    {
      id: 1,
      title: '전북 바이오 클러스터, 글로벌 바이오 허브로 도약',
      category: '산업동향',
      author: '관리자',
      date: '2024-09-15',
      views: 1234,
      content: '세계적인 바이오 기업들의 투자 러시가 이어지며 전북 바이오 클러스터가 글로벌 바이오 허브로 자리잡고 있습니다...'
    },
    {
      id: 2,
      title: 'JB SQUARE 입주기업 3곳, 임상 승인 획득',
      category: '기업소식',
      author: '기자단',
      date: '2024-09-12',
      views: 856,
      content: '혁신적인 바이오의약품 개발로 주목받는 JB SQUARE 입주기업들이 연이어 임상 승인을 획득했습니다...'
    },
    {
      id: 3,
      title: '바이오 투자 생태계 활성화 방안 논의',
      category: '정책뉴스',
      author: '정책팀',
      date: '2024-09-10',
      views: 567,
      content: '전북도와 주요 투자기관 간 협력 강화를 통한 바이오 투자 생태계 활성화 방안이 논의되었습니다...'
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
            [HEADER] 최신뉴스
          </h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전북 바이오 산업 관련 최신 뉴스
          </p>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          
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
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">[FILTER] 카테고리</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
                <select 
                  className="border border-gray-400 p-2"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="">[FILTER] 기간</option>
                  {periods.map((period, index) => (
                    <option key={index} value={period}>{period}</option>
                  ))}
                </select>
                <button className="border-2 border-gray-400 bg-white p-2">[BUTTON] 검색</button>
              </div>
            </div>
          </section>

          {/* 뉴스 목록 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 뉴스 목록</h2>
            
            <div className="space-y-4">
              {newsItems.map((news) => (
                <div key={news.id} className="border-2 border-gray-300 p-6 bg-gray-50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="border border-gray-400 bg-gray-200 px-2 py-1 text-sm font-medium mr-3">
                          [TAG] {news.category}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">[TITLE] {news.title}</h3>
                      </div>
                      <div className="text-gray-600 text-sm mb-3 border border-gray-300 p-3">
                        [DESCRIPTION] {news.content}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="border border-gray-300 px-2 py-1 mr-3">[AUTHOR] {news.author}</span>
                        <span className="border border-gray-300 px-2 py-1 mr-3">[DATE] {news.date}</span>
                        <span className="border border-gray-300 px-2 py-1">[VIEWS] {news.views}회</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 뉴스 상세 페이지 구조 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 뉴스 상세 페이지 구조</h2>
            
            <div className="border-2 border-gray-400 p-6 bg-gray-50">
              <div className="space-y-6">
                {/* 제목 영역 */}
                <div className="border-2 border-gray-400 p-6 bg-gray-50">
                  <h1 className="text-3xl font-bold mb-4 text-gray-800">[TITLE] 전북 바이오 클러스터, 글로벌 바이오 허브로 도약</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="border border-gray-300 px-2 py-1">[META] 작성일: 2024-09-15</span>
                    <span className="border border-gray-300 px-2 py-1">[META] 작성자: 관리자</span>
                    <span className="border border-gray-300 px-2 py-1">[META] 조회수: 1,234회</span>
                    <span className="border border-gray-400 bg-gray-200 px-2 py-1">[TAG] 산업동향</span>
                  </div>
                </div>

                {/* 대표 이미지 */}
                <div className="border-2 border-gray-400 p-6 bg-gray-50">
                  <div className="w-full h-64 bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                    [IMAGE] 뉴스 관련 사진
                  </div>
                </div>

                {/* 본문 영역 */}
                <div className="border-2 border-gray-300 p-6 bg-white">
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">[CONTENT] 본문 내용 영역</h3>
                    <p className="text-gray-600 mb-4">
                      세계적인 바이오 기업들의 투자 러시가 이어지며 전북 바이오 클러스터가 글로벌 바이오 허브로 자리잡고 있습니다. 
                      최근 발표된 통계에 따르면 전북 바이오 클러스터의 입주기업 수가 전년 대비 30% 증가한 87개로 늘어났으며, 
                      총 투자액도 2,300억원을 기록했습니다.
                    </p>
                    <p className="text-gray-600 mb-4">
                      특히 셀트리온, 진바이오텍 등 글로벌 바이오 기업들이 전북을 새로운 생산 거점으로 선택하면서 
                      클러스터의 위상이 한층 높아지고 있습니다. 이는 전북의 우수한 인력과 인프라, 
                      그리고 정부의 적극적인 지원 정책이 결합된 결과로 평가됩니다.
                    </p>
                  </div>
                </div>

                {/* 첨부파일 */}
                <div className="border border-gray-300 p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2 text-gray-800">[SECTION] 첨부파일</h3>
                  <div className="space-y-2">
                    <a href="#" className="block border border-gray-300 p-2 hover:bg-gray-100">
                      [LINK] 📄 바이오클러스터_현황보고서.pdf
                    </a>
                    <a href="#" className="block border border-gray-300 p-2 hover:bg-gray-100">
                      [LINK] 📊 투자현황_통계자료.xlsx
                    </a>
                  </div>
                </div>

                {/* 관련 뉴스 */}
                <div className="border border-gray-300 p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2 text-gray-800">[SECTION] 관련 뉴스</h3>
                  <div className="space-y-2">
                    <a href="#" className="block border border-gray-300 p-2 hover:bg-gray-100">
                      [LINK] JB SQUARE 입주기업 3곳, 임상 승인 획득
                    </a>
                    <a href="#" className="block border border-gray-300 p-2 hover:bg-gray-100">
                      [LINK] 바이오 투자 생태계 활성화 방안 논의
                    </a>
                    <a href="#" className="block border border-gray-300 p-2 hover:bg-gray-100">
                      [LINK] 전북 바이오 기업, 해외 진출 가속화
                    </a>
                  </div>
                </div>

                {/* 공유 기능 */}
                <div className="border border-gray-300 p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2 text-gray-800">[SECTION] 공유 기능</h3>
                  <div className="flex space-x-4">
                    <button className="border border-gray-400 px-4 py-2 bg-white">[BUTTON] 페이스북</button>
                    <button className="border border-gray-400 px-4 py-2 bg-white">[BUTTON] 트위터</button>
                    <button className="border border-gray-400 px-4 py-2 bg-white">[BUTTON] 링크복사</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 주요 뉴스 예시 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 주요 뉴스 예시</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-gray-300 p-4 bg-gray-50">
                <h3 className="font-semibold mb-2 text-gray-800">[TITLE] "전북 바이오 클러스터, 세계 10위 바이오허브 진입"</h3>
                <div className="text-gray-600 text-sm border border-gray-300 p-2">
                  [DESCRIPTION] 글로벌 바이오 클러스터 순위에서 전북이 10위에 진입했다는 소식
                </div>
              </div>
              <div className="border-2 border-gray-300 p-4 bg-gray-50">
                <h3 className="font-semibold mb-2 text-gray-800">[TITLE] "셀트리온 바이오시밀러, FDA 승인으로 해외 진출 가속화"</h3>
                <div className="text-gray-600 text-sm border border-gray-300 p-2">
                  [DESCRIPTION] 셀트리온의 바이오시밀러가 FDA 승인을 받아 해외 진출이 가속화
                </div>
              </div>
              <div className="border-2 border-gray-300 p-4 bg-gray-50">
                <h3 className="font-semibold mb-2 text-gray-800">[TITLE] "전북도, 바이오 스타트업 200개 육성 계획 발표"</h3>
                <div className="text-gray-600 text-sm border border-gray-300 p-2">
                  [DESCRIPTION] 전북도가 2025년까지 바이오 스타트업 200개 육성을 목표로 발표
                </div>
              </div>
              <div className="border-2 border-gray-300 p-4 bg-gray-50">
                <h3 className="font-semibold mb-2 text-gray-800">[TITLE] "K-바이오 벨트 사업 본격 추진, 5조원 투자 확정"</h3>
                <div className="text-gray-600 text-sm border border-gray-300 p-2">
                  [DESCRIPTION] K-바이오 벨트 사업에 5조원 규모의 투자가 확정되어 본격 추진
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

      <Footer />
    </div>
  );
};

export default NewsPage;

