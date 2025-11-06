import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Breadcrumb from '../../../components/Breadcrumb';

const BusinessSupportPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '바이오지원정책', href: '/policy' },
    { label: '인센티브', href: '/policy/incentives' },
    { label: '경영활동지원' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">[HEADER] 경영활동지원</h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 외국인투자 기업 경영활동 지원
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-2 border-gray-400 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 입지지원</h2>
            <div className="border-2 border-gray-300 p-4 bg-white">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">[TH] 구분</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 주요내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">[TD] 공장용지</td>
                    <td className="border border-gray-300 p-3">[TD] 표준공장 임대, 맞춤형 부지 제공</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">[TD] 연구시설</td>
                    <td className="border border-gray-300 p-3">[TD] 공용 연구장비 이용, 실험실 임대</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessSupportPage;

