/**
 * 🎯 Header 컴포넌트
 *
 * JB SQUARE 메인 헤더
 * - 로고 및 브랜드
 * - 네비게이션 메뉴 (1Depth + 드롭다운)
 * - 검색, 로그인, 언어 선택
 * - 반응형 햄버거 메뉴
 *
 * Figma 디자인 기반으로 구현
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Header: React.FC = () => {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<{
    [key: number]: boolean;
  }>({});

  /**
   * 화면 크기 변경 시 모바일 메뉴 닫기
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
        setMobileSubMenuOpen({});
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * 메뉴 구조
   */
  const menuItems = [
    {
      title: 'JB BIO클러스터',
      subItems: [
        { name: '바이오 클러스터', href: '/bio-cluster/cluster' },
        { name: '지역 바이오밸리', href: '/bio-cluster/valley' },
        { name: 'CEO포럼', href: '/bio-cluster/community/ceo-forum' },
        { name: '전북경제포럼', href: '/bio-cluster/community/economic-forum' },
        { name: '혁신신약살롱', href: '/bio-cluster/community/pharma-salon' },
        { name: '전북과학기술포럼', href: '/bio-cluster/community/tech-forum' },
      ],
    },
    {
      title: '바이오지원',
      subItems: [
        { name: '외국인투자제도', href: '/policy/investment/foreign' },
        { name: '투자 절차', href: '/policy/investment/process' },
        { name: 'JBFEZ', href: '/policy/investment/jbfez' },
        { name: '세제감면', href: '/policy/incentives/tax' },
        { name: '경영활동지원', href: '/policy/incentives/business-support' },
        { name: '투자상품', href: '/policy/products' },
      ],
    },
    {
      title: '배송지원',
      subItems: [
        { name: '정부/지자체', href: '/announcements/government' },
        { name: '기업 맞춤형 지원', href: '/announcements/customized' },
        { name: 'R&D', href: '/announcements/rd' },
        { name: '창업 및 기술이전', href: '/announcements/startup' },
        { name: '최신공고 모아보기', href: '/announcements/all' },
      ],
    },
    {
      title: '기타 지원',
      subItems: [
        { name: '유관기관', href: '/organizations/related' },
        { name: '대학', href: '/organizations/academic' },
        { name: '연구소', href: '/organizations/research' },
      ],
    },
    {
      title: '바이오센터',
      subItems: [
        { name: '지역별 입주기업', href: '/incubator/regional' },
        { name: '공실현황', href: '/incubator/vacancy' },
        { name: '입주 절차', href: '/incubator/application/process' },
        { name: '입주 신청', href: '/incubator/application/apply' },
      ],
    },
    {
      title: '뉴스센터',
      subItems: [
        { name: '최신뉴스', href: '/news-events/news' },
        { name: '바이오행사', href: '/news-events/events' },
      ],
    },
    {
      title: '기타 정보',
      subItems: [
        { name: '지역 기업 정보', href: '/companies/directory' },
        { name: '인터뷰 및 기획 기사', href: '/companies/interviews' },
      ],
    },
  ];

  /**
   * 모바일 서브메뉴 토글
   */
  const toggleMobileSubMenu = (index: number) => {
    setMobileSubMenuOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <header className="bg-gray-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-4 lg:px-6 h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            {/* 로고 이미지 */}
            <img
              src="/images/JB2_logo.png"
              alt="JB SQUARE"
              className="h-10 w-auto"
            />
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.map((menu, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="px-3 py-2 text-sm font-medium text-gray-200 hover:text-white hover:bg-gray-700 rounded transition-colors">
                  {menu.title}
                </button>

                {/* 드롭다운 메뉴 */}
                {activeDropdown === index && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                    {menu.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* 우측 액션 */}
          <div className="flex items-center space-x-3">
            {/* 검색 아이콘 */}
            <button
              className="hidden md:flex items-center justify-center w-10 h-10 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="검색"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* 사용자 아이콘 */}
            <button
              className="hidden md:flex items-center justify-center w-10 h-10 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="로그인"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* 언어 선택 */}
            <button className="hidden md:flex items-center space-x-1 px-3 py-2 text-sm hover:bg-gray-700 rounded transition-colors">
              <span>KR</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 햄버거 메뉴 (모바일) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 hover:bg-gray-700 rounded transition-colors"
              aria-label="메뉴"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-700 bg-gray-800">
            <nav className="px-4 py-4 space-y-1">
              {menuItems.map((menu, index) => (
                <div key={index} className="border-b border-gray-700 last:border-b-0">
                  <button
                    onClick={() => toggleMobileSubMenu(index)}
                    className="w-full flex justify-between items-center py-3 text-left text-white hover:bg-gray-700 px-3 rounded"
                  >
                    <span className="font-medium">{menu.title}</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform ${mobileSubMenuOpen[index] ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {mobileSubMenuOpen[index] && (
                    <div className="pl-6 pb-2 space-y-1">
                      {menu.subItems.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          className="block py-2 px-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* 모바일 액션 */}
              <div className="pt-4 mt-4 border-t border-gray-700 space-y-2">
                <button className="w-full flex items-center space-x-2 py-2 px-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>검색</span>
                </button>
                <button className="w-full flex items-center space-x-2 py-2 px-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>로그인</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
