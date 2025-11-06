import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const IncubatorPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '창업보육센터', href: '/incubator' },
    { label: '보육센터' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">[HEADER] 보육센터</h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 창업보육센터 현황
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-2 border-gray-400 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 보육센터 현황</h2>
            <div className="border-2 border-gray-300 p-4 bg-white">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">[TH] 센터명</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 위치</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 규모</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 운영기관</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 연락처</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">[TD] 전주바이오센터</td>
                    <td className="border border-gray-300 p-3">[TD] 전주시</td>
                    <td className="border border-gray-300 p-3">[TD] 50실</td>
                    <td className="border border-gray-300 p-3">[TD] 전주시</td>
                    <td className="border border-gray-300 p-3">[TD] 063-XXX-XXXX</td>
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

export default IncubatorPage;