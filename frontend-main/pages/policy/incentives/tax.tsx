import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Breadcrumb from '../../../components/Breadcrumb';

const TaxIncentivesPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '바이오지원정책', href: '/policy' },
    { label: '인센티브', href: '/policy/incentives' },
    { label: '세제감면' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">[HEADER] 세제감면</h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 외국인투자 기업 대상 세제감면 혜택
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-2 border-gray-400 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 세제감면 개요</h2>
            <div className="border-2 border-gray-300 p-4 bg-white">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 p-3 text-left">[TH] 구분</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 국세</th>
                    <th className="border border-gray-300 p-3 text-left">[TH] 지방세</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">[TD] 법인세</td>
                    <td className="border border-gray-300 p-3">[TD] 5년 100% + 2년 50%</td>
                    <td className="border border-gray-300 p-3">[TD] -</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">[TD] 소득세</td>
                    <td className="border border-gray-300 p-3">[TD] 5년 100% + 2년 50%</td>
                    <td className="border border-gray-300 p-3">[TD] -</td>
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

export default TaxIncentivesPage;

