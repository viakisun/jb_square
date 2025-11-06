import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const GuidePage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '바이오지원정책', href: '/policy' },
    { label: '투자가이드' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">[HEADER] 투자가이드</h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전북 바이오 투자 가이드
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-2 border-gray-400 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 주요인센티브</h2>
            <div className="border-2 border-gray-300 p-4 bg-white">
              <div className="font-medium text-gray-800 mb-2">[LABEL] 조세감면</div>
              <div className="text-gray-600 text-sm">
                [VALUE] 법인세 5년 100% + 2년 50% 감면
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuidePage;

