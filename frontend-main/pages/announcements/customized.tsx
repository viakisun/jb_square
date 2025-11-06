import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb';

const CustomizedPage = () => {
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    { label: '지원사업공고', href: '/announcements' },
    { label: '기업 맞춤형 지원' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <section className="bg-gray-100 border-2 border-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">[HEADER] 기업 맞춤형 지원</h1>
          <p className="text-xl text-gray-600 border border-gray-300 p-2 inline-block">
            [DESCRIPTION] 바이오 기업 1:1 맞춤형 컨설팅
          </p>
        </div>
      </section>

      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-2 border-gray-400 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">[SECTION] 바이오 기업지원 상담실 운영</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-300 p-4 bg-white">
                <div className="font-medium text-gray-800">[LABEL] 운영시간</div>
                <div className="text-gray-600 text-sm">[VALUE] 평일 09:00-18:00</div>
              </div>
              <div className="border border-gray-300 p-4 bg-white">
                <div className="font-medium text-gray-800">[LABEL] 상담방법</div>
                <div className="text-gray-600 text-sm">[VALUE] 전화, 이메일, 방문상담</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomizedPage;

