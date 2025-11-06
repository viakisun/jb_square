import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const RDPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '지원사업공고', href: '/announcements' },
    { label: 'R&D' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">[HEADER] R&D</h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] R&D 및 비R&D 사업 공고
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-2 border-gray-400 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] R&D / 비R&D 탭 구분</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-300 p-4 bg-white">
                <div className="font-medium text-gray-800">[TAB] R&D 사업</div>
                <div className="text-gray-600 text-sm">[DESCRIPTION] 연구개발 관련 사업</div>
              </div>
              <div className="border border-gray-300 p-4 bg-white">
                <div className="font-medium text-gray-800">[TAB] 비R&D 사업</div>
                <div className="text-gray-600 text-sm">[DESCRIPTION] 연구개발 외 사업</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RDPage;

