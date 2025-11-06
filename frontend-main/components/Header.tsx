import React, { useState, useEffect } from 'react';

const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<{[key: number]: boolean}>({});

  // 화면 크기 변경시 모바일 메뉴 닫기
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

  const menuItems = [
    {
      title: 'JB BIO 클러스터',
      subItems: [
        { name: '바이오 클러스터', href: '/bio-cluster/cluster' },
        { name: '지역 바이오밸리', href: '/bio-cluster/valley' },
        { name: 'CEO포럼', href: '/bio-cluster/community/ceo-forum' },
        { name: '전북경제포럼', href: '/bio-cluster/community/economic-forum' },
        { name: '혁신신약살롱', href: '/bio-cluster/community/pharma-salon' },
        { name: '전북과학기술포럼', href: '/bio-cluster/community/tech-forum' }
      ]
    },
    {
      title: '지원기관',
      subItems: [
        { name: '유관기관', href: '/organizations/related' },
        { name: '대학', href: '/organizations/academic' },
        { name: '연구소', href: '/organizations/research' }
      ]
    },
    {
      title: '바이오지원정책',
      subItems: [
        { name: '외국인투자제도', href: '/policy/investment/foreign' },
        { name: '투자 절차', href: '/policy/investment/process' },
        { name: 'JBFEZ', href: '/policy/investment/jbfez' },
        { name: '세제감면', href: '/policy/incentives/tax' },
        { name: '경영활동지원', href: '/policy/incentives/business-support' },
        { name: '투자상품', href: '/policy/products' },
        { name: '투자가이드', href: '/policy/guide' }
      ]
    },
    {
      title: '지원사업공고',
      subItems: [
        { name: '정부/지자체', href: '/announcements/government' },
        { name: '기업 맞춤형 지원', href: '/announcements/customized' },
        { name: 'R&D', href: '/announcements/rd' },
        { name: '창업 및 기술이전', href: '/announcements/startup' },
        { name: '최신공고 모아보기', href: '/announcements/all' }
      ]
    },
    {
      title: '창업보육센터',
      subItems: [
        { name: '지역별 입주기업', href: '/incubator/regional' },
        { name: '공실현황', href: '/incubator/vacancy' },
        { name: '입주 절차', href: '/incubator/application/process' },
        { name: '입주 신청', href: '/incubator/application/apply' }
      ]
    },
    {
      title: '뉴스/행사',
      subItems: [
        { name: '최신뉴스', href: '/news-events/news' },
        { name: '바이오행사', href: '/news-events/events' }
      ]
    },
    {
      title: '기업정보',
      subItems: [
        { name: '지역 기업 정보', href: '/companies/directory' },
        { name: '인터뷰 및 기획 기사', href: '/companies/interviews' }
      ]
    }
  ];

  const toggleMobileSubMenu = (index: number) => {
    setMobileSubMenuOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <header className="bg-white border-2 border-gray-400 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-4 py-4">
          {/* Logo */}
          <div className="border-2 border-gray-400 px-4 py-2 bg-gray-100">
            <a href="/" className="text-xl font-bold text-gray-800">
              [LOGO] JB SQUARE
            </a>
          </div>

          {/* Desktop Navigation - Always visible on large screens */}
          <div className="hidden lg:block flex-1 max-w-4xl mx-8">
            <div className="flex justify-center">
              <div className="flex space-x-1 border border-gray-400 p-1 bg-gray-50">
                {menuItems.map((menu, index) => (
                  <div
                    key={index}
                    className="relative"
                  >
                    <div
                      onMouseEnter={() => setActiveDropdown(index)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button className="border border-gray-300 px-3 py-2 bg-white hover:bg-gray-100 text-sm font-medium whitespace-nowrap">
                        [MENU] {menu.title}
                      </button>
                      
                      {/* Desktop Dropdown - Always rendered, visibility controlled by CSS */}
                      <div
                        className="absolute top-full left-0 w-64 bg-white border-2 border-gray-400 z-50"
                        style={{
                          display: activeDropdown === index ? 'block' : 'none',
                          top: '100%'
                        }}
                        onMouseEnter={() => setActiveDropdown(index)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        {menu.subItems.map((subItem, subIndex) => (
                          <a
                            key={subIndex}
                            href={subItem.href}
                            className="block px-4 py-3 text-sm border-b border-gray-300 last:border-b-0 hover:bg-gray-100"
                          >
                            [SUBMENU] {subItem.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden xl:block border border-gray-300 px-3 py-2 bg-white text-sm">
              [BTN] 검색
            </div>
            <div className="hidden md:block border border-gray-300 px-3 py-2 bg-white text-sm">
              [BTN] KR | EN
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden border-2 border-gray-400 p-2 bg-white"
            >
              <div className="w-6 h-6 flex flex-col justify-center">
                {mobileMenuOpen ? (
                  <div className="relative">
                    <span className="absolute w-5 h-0.5 bg-gray-700 transform rotate-45"></span>
                    <span className="absolute w-5 h-0.5 bg-gray-700 transform -rotate-45"></span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="block w-6 h-0.5 bg-gray-700"></span>
                    <span className="block w-6 h-0.5 bg-gray-700"></span>
                    <span className="block w-6 h-0.5 bg-gray-700"></span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-gray-400 bg-white">
            <div className="px-4 py-4">
              {menuItems.map((menu, index) => (
                <div key={index} className="border-b border-gray-300 last:border-b-0">
                  <button
                    onClick={() => toggleMobileSubMenu(index)}
                    className="w-full flex justify-between items-center py-3 text-left border border-gray-300 px-3 bg-gray-50 hover:bg-gray-100"
                  >
                    <span>[MENU] {menu.title}</span>
                    <span className={`transform transition-transform ${mobileSubMenuOpen[index] ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {mobileSubMenuOpen[index] && (
                    <div className="mt-1 border-l-2 border-gray-400 bg-white">
                      {menu.subItems.map((subItem, subIndex) => (
                        <a
                          key={subIndex}
                          href={subItem.href}
                          className="block py-2 px-4 ml-4 text-sm border border-gray-300 hover:bg-gray-100"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          [SUBMENU] {subItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Mobile Actions */}
              <div className="pt-4 mt-4 border-t border-gray-400 space-y-2">
                <div className="border border-gray-300 px-3 py-2 bg-gray-50">[BTN] 🔍 검색</div>
                <div className="border border-gray-300 px-3 py-2 bg-gray-50">[BTN] 🌐 언어 변경</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
