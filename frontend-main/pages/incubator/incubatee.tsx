import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const IncubateePage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '창업보육센터', href: '/incubator' },
    { label: '보육기업' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">[HEADER] 보육기업</h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 창업보육센터 보육기업 현황
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-2 border-gray-400 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 보육기업 현황</h2>
            <div className="border-2 border-gray-300 p-4 bg-white">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">[TH] 기업명</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 대표자</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 업종</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 입주일</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 보육기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">[TD] 바이오테크</td>
                    <td className="border border-gray-300 p-3">[TD] 김대표</td>
                    <td className="border border-gray-300 p-3">[TD] 바이오</td>
                    <td className="border border-gray-300 p-3">[TD] 2024.01</td>
                    <td className="border border-gray-300 p-3">[TD] 3년</td>
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

export default IncubateePage;

