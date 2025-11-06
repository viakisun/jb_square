import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-300 border-2 border-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-2 border-dashed border-gray-500 p-6 bg-gray-200">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="border border-gray-400 p-4 bg-white">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">[BRAND] JB SQUARE</h3>
              <div className="text-gray-600 text-sm leading-relaxed border border-gray-300 p-2">
                [DESCRIPTION] 전북산업 대전환과 기업 고도성장을 선도하는 Next 전북, Best TP
              </div>
            </div>
            <div className="border border-gray-400 p-4 bg-white">
              <h4 className="font-semibold mb-3 text-gray-800">[MENU] 바이오 클러스터</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="border-b border-gray-300 pb-1">[LINK] 바이오 클러스터</li>
                <li className="border-b border-gray-300 pb-1">[LINK] 지역 바이오밸리</li>
                <li className="border-b border-gray-300 pb-1">[LINK] 커뮤니티</li>
              </ul>
            </div>
            <div className="border border-gray-400 p-4 bg-white">
              <h4 className="font-semibold mb-3 text-gray-800">[MENU] 지원사업</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="border-b border-gray-300 pb-1">[LINK] 정부/지자체</li>
                <li className="border-b border-gray-300 pb-1">[LINK] 맞춤형 지원</li>
                <li className="border-b border-gray-300 pb-1">[LINK] R&D</li>
              </ul>
            </div>
            <div className="border border-gray-400 p-4 bg-white">
              <h4 className="font-semibold mb-3 text-gray-800">[CONTACT] 문의</h4>
              <div className="text-gray-600 text-sm space-y-1 border border-gray-300 p-2">
                <div>[TEL] 전화: 063-XXX-XXXX</div>
                <div>[EMAIL] 이메일: info@jbsquare.or.kr</div>
                <div>[ADDRESS] 주소: 전북 전주시</div>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-gray-400 mt-8 pt-8 text-center">
            <div className="border border-gray-400 bg-white p-2 text-gray-600 text-sm">
              [COPYRIGHT] &copy; 2024 JB SQUARE. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

