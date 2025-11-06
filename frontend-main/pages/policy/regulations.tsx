import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const RegulationsPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '바이오지원정책', href: '/policy' },
    { label: '기업 및 투자 유치촉진조례' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">[HEADER] 기업 및 투자 유치촉진조례</h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전라북도 기업 및 투자 유치촉진조례
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-2 border-gray-400 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 전라북도 기업 및 투자 유치촉진조례</h2>
            <div className="border-2 border-gray-300 p-4 bg-white">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">[SUBSECTION] 제1장 총칙</h3>
              <div className="space-y-2">
                <div className="border border-gray-300 p-2">
                  <div className="font-medium text-gray-800">[ARTICLE] 제1조(목적)</div>
                  <div className="text-gray-600 text-sm">[VALUE] 조례 제정 목적과 범위</div>
                </div>
                <div className="border border-gray-300 p-2">
                  <div className="font-medium text-gray-800">[ARTICLE] 제2조(정의)</div>
                  <div className="text-gray-600 text-sm">[VALUE] 용어의 정의</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegulationsPage;

