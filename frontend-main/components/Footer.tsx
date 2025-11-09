/**
 * 🦶 Footer 컴포넌트
 *
 * JB SQUARE 메인 푸터
 * - 브랜드 정보 및 뉴스레터 구독
 * - 주요 서비스 링크
 * - 정책 & 제도 링크
 * - 하단 저작권 및 법적 링크
 * - 반응형 3열 그리드 (3→2→1)
 *
 * Figma 디자인 기반으로 구현
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useState } from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  /**
   * 뉴스레터 구독 처리
   */
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 뉴스레터 구독 API 연동
    console.log('Newsletter subscription:', email);
    setEmail('');
    alert('뉴스레터 구독이 신청되었습니다.');
  };

  /**
   * 주요 서비스 링크
   */
  const serviceLinks = [
    { name: '지원사업 공고', href: '/announcements/all' },
    { name: '창업보육센터', href: '/incubator/regional' },
    { name: '기업 디렉토리', href: '/companies/directory' },
    { name: '투자 지원', href: '/policy/investment/foreign' },
    { name: '뉴스 & 행사', href: '/news-events/news' },
  ];

  /**
   * 정책 & 제도 링크
   */
  const policyLinks = [
    { name: '사업 가이드', href: '/policy/guide' },
    { name: '인센티브', href: '/policy/incentives/tax' },
    { name: '규제 혁신', href: '/policy/innovation' },
    { name: 'JBFEZ 특구', href: '/policy/investment/jbfez' },
    { name: '관련 기관', href: '/organizations/related' },
  ];

  /**
   * 법적 링크
   */
  const legalLinks = [
    { name: '개인정보처리방침', href: '/legal/privacy' },
    { name: '서비스이용약관', href: '/legal/terms' },
    { name: '이용안내', href: '/legal/guide' },
    { name: '사이트맵', href: '/sitemap' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* 메인 푸터 콘텐츠 */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Column 1: 브랜드 정보 + 뉴스레터 */}
          <div className="lg:col-span-1">
            {/* 로고 */}
            <div className="mb-4">
              <img
                src="/images/JB2_logo.png"
                alt="JB SQUARE"
                className="h-12 w-auto"
              />
            </div>

            {/* 설명 */}
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              전북 바이오 산업의 허브, JB SQUARE는 기업 성장과 혁신을 지원하며 지역 경제 발전을 선도합니다.
            </p>

            {/* 뉴스레터 구독 */}
            <div>
              <h4 className="text-white font-semibold mb-3">뉴스레터 구독</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소를 입력하세요"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-cyan transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-cyan transition-colors whitespace-nowrap text-sm font-medium"
                >
                  구독
                </button>
              </form>
            </div>

            {/* 소셜 미디어 */}
            <div className="mt-6 flex items-center space-x-4">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-800 rounded-full hover:bg-primary-blue transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-800 rounded-full hover:bg-primary-blue transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: 주요 서비스 */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">주요 서비스</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-cyan transition-colors text-sm flex items-center group"
                  >
                    <svg
                      className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="group-hover:translate-x-1 transition-transform inline-block">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: 정책 & 제도 */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">정책 & 제도</h4>
            <ul className="space-y-3">
              {policyLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-cyan transition-colors text-sm flex items-center group"
                  >
                    <svg
                      className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="group-hover:translate-x-1 transition-transform inline-block">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 바 - 저작권 및 법적 링크 */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* 저작권 */}
            <div className="text-gray-500 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} JB SQUARE. All rights reserved.
            </div>

            {/* 법적 링크 */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-500 hover:text-white text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
