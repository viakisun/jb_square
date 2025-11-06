import React from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Breadcrumb from '../../../components/Breadcrumb';

const JBFEZPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '바이오지원정책', href: '/policy' },
    { label: '투자제도', href: '/policy/investment' },
    { label: 'JBFEZ' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">[HEADER] JBFEZ</h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 전북자유경제구역 안내
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-2 border-gray-400 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] JBFEZ 개요</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-300 p-4 bg-white">
                <div className="font-medium text-gray-800">[LABEL] 정식명칭</div>
                <div className="text-gray-600 text-sm">[VALUE] 전북자유경제구역</div>
              </div>
              <div className="border border-gray-300 p-4 bg-white">
                <div className="font-medium text-gray-800">[LABEL] 지정면적</div>
                <div className="text-gray-600 text-sm">[VALUE] 30.47㎢</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JBFEZPage;

