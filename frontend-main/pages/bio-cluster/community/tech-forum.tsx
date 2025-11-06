import React from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Breadcrumb from "../../../components/Breadcrumb";

const TechForumPage = () => {
  const breadcrumbItems = [
    { label: "홈", href: "/" },
    { label: "JB BIO 클러스터", href: "/bio-cluster" },
    { label: "커뮤니티", href: "/bio-cluster/community" },
    { label: "기술포럼" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            JB BIO 기술포럼
          </h1>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8">
            <p className="text-gray-700 leading-relaxed">
              JB BIO 기술포럼은 전북지역 바이오 분야 연구기관과 기업이 함께 최신
              기술 동향을 공유하고 협력 방안을 모색하는 기술 교류의 장입니다.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TechForumPage;
