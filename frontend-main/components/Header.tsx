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
  const [isHomePage, setIsHomePage] = useState(true); // 기본값을 true로 설정 (깜빡임 방지)
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  /**
   * 컴포넌트 마운트 시 클라이언트 사이드에서만 실행
   */
  useEffect(() => {
    setMounted(true);
    setIsHomePage(router.pathname === '/');
  }, [router.pathname]);

  /**
   * 스크롤 감지 - 홈페이지에서만 배경색 변경
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
   * 메뉴 구조 - 5개 메뉴로 재구성
   *
   * 1. JB BIO 클러스터 - 단일 링크 (서브메뉴 없음)
   * 2. JB 지원사업 공고 - 일반 서브메뉴 (4개 항목)
   * 3. JB 창업보육센터 - 단일 링크 (서브메뉴 없음)
   * 4. 뉴스/행사 - 2개 서브메뉴 (최신뉴스/바이오행사)
   * 5. JB 기업정보 - 단일 링크 (서브메뉴 없음)
   */
  const menuItems = [
    {
      title: 'JB BIO 클러스터',
      href: '/bio-cluster/cluster',
    },
    {
      title: 'JB 지원사업 공고',
      subItems: [
        { name: '정부공고', href: '/notices/notice-government' },
        { name: '지자체공고', href: '/notices/notice-local' },
        { name: '유관기관공고', href: '/notices/notice-institutions' },
        { name: '기업마당공고', href: '/notices/notice-business' },
      ],
    },
    {
      title: 'JB 창업보육센터',
      href: '/incubator/centers',
    },
    {
      title: '뉴스/행사',
      subItems: [
        { name: '최신뉴스', href: '/news-events/news' },
        { name: '바이오행사', href: '/news-events/events' },
      ],
    },
    {
      title: 'JB 기업정보',
      href: '/companies/directory',
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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isHomePage && !isScrolled
        ? 'bg-transparent'
        : 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-4 lg:px-6 h-20">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            {/* 로고 아이콘 */}
            <img
              src="/images/JB2_logo.png"
              alt="JB SQUARE"
              className="h-12 w-auto"
            />
            {/* 텍스트 로고 */}
            <img
              src={isHomePage && !isScrolled ? "/images/JB2_textlogo_white.png" : "/images/JB2_textlogo.png"}
              alt="JB SQUARE"
              className="h-6 w-auto"
            />
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.map((menu, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => {
                  if (menu.subItems) {
                    setActiveDropdown(index);
                  }
                }}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {/* 서브메뉴가 있으면 버튼, 없으면 링크 */}
                {menu.subItems ? (
                  <button
                    className={`px-6 py-6 text-lg font-medium relative transition-all duration-200 ${
                      isHomePage && !isScrolled ? 'text-white' : 'text-[#121418]'
                    } ${
                      activeDropdown === index ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-[#00268F]' : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-1 hover:after:bg-[#00B8CC]'
                    }`}
                    style={{ letterSpacing: '-0.18px' }}
                  >
                    {menu.title}
                  </button>
                ) : (
                  <Link
                    href={menu.href!}
                    className={`px-6 py-6 text-lg font-medium relative transition-all duration-200 block ${
                      isHomePage && !isScrolled ? 'text-white' : 'text-[#121418]'
                    } ${
                      router.pathname === menu.href
                        ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-[#00268F]'
                        : 'hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0 hover:after:h-1 hover:after:bg-[#00B8CC]'
                    }`}
                    style={{ letterSpacing: '-0.18px' }}
                  >
                    {menu.title}
                  </Link>
                )}

                {/* 일반 드롭다운 메뉴 (서브메뉴가 있는 경우) */}
                {menu.subItems && activeDropdown === index && (
                  <div className="absolute top-full left-0 mt-0 min-w-[240px] bg-white shadow-xl py-4 z-50">
                    {menu.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={`block px-6 py-3 text-base transition-all duration-200 ${
                          router.pathname === subItem.href
                            ? 'bg-[#00268F] text-white font-semibold'
                            : 'text-[#121418] hover:bg-[#F5F7FA]'
                        }`}
                        style={{ letterSpacing: '-0.16px' }}
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
          <div className="flex items-center space-x-2">
            {/* 검색 아이콘 */}
            <button
              className={`hidden md:flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                isHomePage && !isScrolled
                  ? 'text-white hover:bg-white/10'
                  : 'text-[#121418] hover:bg-[#EBEFF5]'
              }`}
              aria-label="검색"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* 사용자 아이콘 */}
            <button
              className={`hidden md:flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                isHomePage && !isScrolled
                  ? 'text-white hover:bg-white/10'
                  : 'text-[#121418] hover:bg-[#EBEFF5]'
              }`}
              aria-label="로그인"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* 언어 선택 */}
            <button className={`hidden md:flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isHomePage && !isScrolled
                ? 'text-white hover:bg-white/10'
                : 'text-[#121418] hover:bg-[#EBEFF5]'
            }`}>
              <span>KR</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 햄버거 메뉴 (모바일) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                isHomePage && !isScrolled
                  ? 'text-white hover:bg-white/10'
                  : 'text-[#121418] hover:bg-[#EBEFF5]'
              }`}
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
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <nav className="px-4 py-4 space-y-1">
              {menuItems.map((menu, index) => (
                <div key={index} className="border-b border-gray-100 last:border-b-0">
                  {/* 서브메뉴가 있으면 expandable button, 없으면 Link */}
                  {menu.subItems ? (
                    <>
                      <button
                        onClick={() => toggleMobileSubMenu(index)}
                        className="w-full flex justify-between items-center py-3 text-left text-[#121418] hover:bg-[#EBEFF5] px-3 rounded-lg transition-all duration-200"
                      >
                        <span className="font-medium text-lg" style={{ letterSpacing: '-0.18px' }}>
                          {menu.title}
                        </span>
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
                              className={`block py-2 px-3 text-base rounded-lg transition-all duration-200 ${
                                router.pathname === subItem.href
                                  ? 'bg-[#00268F] text-white font-semibold'
                                  : 'text-[#121418] hover:bg-[#EBEFF5]'
                              }`}
                              style={{ letterSpacing: '-0.16px' }}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={menu.href!}
                      className={`block py-3 px-3 font-medium text-lg rounded-lg transition-all duration-200 ${
                        router.pathname === menu.href
                          ? 'bg-[#00268F] text-white font-semibold'
                          : 'text-[#121418] hover:bg-[#EBEFF5]'
                      }`}
                      style={{ letterSpacing: '-0.18px' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {menu.title}
                    </Link>
                  )}
                </div>
              ))}

              {/* 모바일 액션 */}
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                <button className="w-full flex items-center space-x-2 py-2 px-3 text-[#121418] hover:bg-[#EBEFF5] rounded-lg transition-all duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>검색</span>
                </button>
                <button className="w-full flex items-center space-x-2 py-2 px-3 text-[#121418] hover:bg-[#EBEFF5] rounded-lg transition-all duration-200">
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
