import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useOrganizations } from '@/hooks/useOrganizations';
import { Organization } from '@/lib/api/types';

const CompanyDirectoryPage: React.FC = () => {
  const router = useRouter();

  // 필터 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('전체');
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // 데이터 fetching
  const { companies, loading, error, pagination, setFilters, setPage } = useOrganizations({
    limit: itemsPerPage
  });

  // 샘플 데이터 (디자이너 제공)
  const sampleCompanies = [
    {
      name: '(주)제이더블유바이오사이언스',
      ceo: '김성민',
      products: '허브 유래 건강기능식품 및 의약품',
      phone: '063-245-1234',
      address: '전주시 덕진구 유상로 67, 605호'
    },
    {
      name: '(주)전북바이오사이언스',
      ceo: '강현민',
      products: '사료, 비료, 영양제',
      phone: '070-1234-1234',
      address: '전주시 덕진구 유상로 214-2, 미래 오피스텔 203호'
    },
    {
      name: '위자드 (WIZARD)',
      ceo: '이선영',
      products: '탄소섬유, 필터',
      phone: '063-123-4548',
      address: '전주시 덕진구 유상로 12-2, 1208호'
    }
  ];

  // 디스플레이용 데이터 (실제 데이터가 없으면 샘플 데이터 반복)
  const displayCompanies = companies.length > 0 ? companies :
    Array(12).fill(null).map((_, i) => sampleCompanies[i % sampleCompanies.length]);

  const totalCount = pagination?.total || 15;

  const handleSearch = useCallback(() => {
    setFilters({
      search: searchTerm,
      // 추가 필터 로직
    });
  }, [searchTerm, setFilters]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    // 카테고리에 따른 필터 적용
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 페이지 스타일 정의
  const pageStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    background: '#F8F9FC',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    position: 'relative',
    flex: '1'
  };

  const sectionStyle: React.CSSProperties = {
    width: '1060px',
    margin: '0 auto'
  };

  return (
    <div style={pageStyle}>
      <Header />

      <div style={containerStyle}>
        {/* 브레드크럼 및 타이틀 섹션 */}
        <div style={{
          ...sectionStyle,
          paddingTop: '96px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}>
          <div style={{
            flex: '1 1 0',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '4px',
            display: 'inline-flex'
          }}>
            <div style={{
              alignSelf: 'stretch',
              color: '#00B8CD',
              fontSize: '16px',
              fontFamily: 'Pretendard GOV',
              fontWeight: '600',
              lineHeight: '22.40px'
            }}>기업 정보</div>
            <div style={{
              color: '#121418',
              fontSize: '60px',
              fontFamily: 'Pretendard GOV',
              fontWeight: '700',
              lineHeight: '84px'
            }}>지역 기업 정보</div>
          </div>

          {/* 브레드크럼 */}
          <div style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '4px',
            display: 'flex'
          }}>
            <div style={{width: '24px', height: '24px', position: 'relative'}}>
              <img
                src="/images/home-03.svg"
                alt="Home"
                style={{width: '100%', height: '100%', objectFit: 'contain'}}
              />
            </div>
            <div style={{width: '16px', height: '16px', position: 'relative'}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="#5B687C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{
              padding: '2px 4px',
              background: 'white',
              borderRadius: '4px'
            }}>
              <div style={{
                color: '#24272D',
                fontSize: '16px',
                fontFamily: 'Pretendard GOV',
                fontWeight: '500',
                lineHeight: '22.40px'
              }}>기업 정보</div>
            </div>
            <div style={{width: '16px', height: '16px', position: 'relative'}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="#5B687C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{
              padding: '2px 4px',
              background: 'white',
              borderRadius: '4px'
            }}>
              <div style={{
                color: '#24272D',
                fontSize: '16px',
                fontFamily: 'Pretendard GOV',
                fontWeight: '500',
                lineHeight: '22.40px'
              }}>지역 기업 정보</div>
            </div>
          </div>
        </div>

        {/* 필터 섹션 */}
        <div style={{
          ...sectionStyle,
          padding: '32px',
          marginTop: '24px',
          background: 'white',
          borderRadius: '16px',
          outline: '1px #D6DBE1 solid',
          outlineOffset: '-1px',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: '20px',
          display: 'flex'
        }}>
          {/* 검색 바 */}
          <div style={{
            alignSelf: 'stretch',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '16px',
            display: 'inline-flex'
          }}>
            <div style={{
              width: '180px',
              minWidth: '180px',
              paddingTop: '4px',
              paddingBottom: '4px',
              paddingLeft: '20px',
              paddingRight: '8px',
              background: 'white',
              borderRadius: '8px',
              outline: '1px #D6DBE1 solid',
              outlineOffset: '-1px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              display: 'flex'
            }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  flex: '1 1 0',
                  color: '#808892',
                  fontSize: '16px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '500',
                  lineHeight: '20.80px',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent'
                }}
              >
                <option>전체</option>
                <option>바이오 핵심산업</option>
                <option>전후방 연관산업</option>
                <option>비바이오산업</option>
              </select>
              <div style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#808892" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div style={{
              flex: '1 1 0',
              paddingLeft: '20px',
              background: 'white',
              borderRadius: '8px',
              outline: '1px #10409A solid',
              outlineOffset: '-1px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              display: 'flex'
            }}>
              <input
                type="text"
                placeholder="검색어를 입력하세요."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  flex: '1 1 0',
                  color: '#808892',
                  fontSize: '16px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '500',
                  lineHeight: '20.80px',
                  border: 'none',
                  outline: 'none',
                  padding: '14px 0'
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  width: '48px',
                  height: '48px',
                  background: '#10409A',
                  borderTopRightRadius: '8px',
                  borderBottomRightRadius: '8px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  display: 'flex',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="#F8F9FC" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="#F8F9FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* 카테고리 탭 */}
          <div style={{
            alignSelf: 'stretch',
            justifyContent: 'space-between',
            alignItems: 'center',
            display: 'inline-flex'
          }}>
            <div style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '8px',
              display: 'flex'
            }}>
              {['All', 'R&D', '비R&D', '창업지원', '인력양성', '기타'].map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  style={{
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    background: selectedCategory === category ? '#F4F6FB' : '#F8F9FC',
                    borderRadius: '8px',
                    outline: selectedCategory === category ? '1px #10409A solid' : 'none',
                    outlineOffset: '-1px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    display: 'inline-flex',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    color: selectedCategory === category ? '#10409A' : '#808892',
                    fontSize: '16px',
                    fontFamily: 'Pretendard GOV',
                    fontWeight: selectedCategory === category ? '500' : '400',
                    textDecoration: selectedCategory === category ? 'underline' : 'none',
                    lineHeight: '20.80px'
                  }}>{category}</div>
                </button>
              ))}
            </div>

            <button style={{
              width: '40px',
              height: '40px',
              background: 'white',
              borderRadius: '8px',
              outline: '1px #D6DBE1 solid',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              display: 'flex',
              border: 'none',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10H15M2.5 5H17.5M7.5 15H12.5" stroke="#6C747E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 결과 정보 및 테이블 */}
        <div style={{
          ...sectionStyle,
          marginTop: '40px',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex'
        }}>
          {/* 결과 헤더 */}
          <div style={{
            alignSelf: 'stretch',
            paddingBottom: '16px',
            borderBottom: '1px #565B64 solid',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '8px',
            display: 'inline-flex'
          }}>
            <div style={{
              flex: '1 1 0',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '40px',
              display: 'flex'
            }}>
              <div style={{flex: '1 1 0'}}>
                <span style={{
                  color: '#3A3F49',
                  fontSize: '18px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '600',
                  lineHeight: '25.20px'
                }}>총 </span>
                <span style={{
                  color: '#10409A',
                  fontSize: '18px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '700',
                  lineHeight: '25.20px'
                }}>{totalCount}</span>
                <span style={{
                  color: '#3A3F49',
                  fontSize: '18px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '600',
                  lineHeight: '25.20px'
                }}>개</span>
              </div>

              <div style={{
                flex: '1 1 0',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '16px',
                display: 'flex'
              }}>
                <div style={{
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '12px',
                  display: 'flex'
                }}>
                  <div style={{
                    color: '#3A3F49',
                    fontSize: '18px',
                    fontFamily: 'Pretendard GOV',
                    fontWeight: '600',
                    lineHeight: '25.20px'
                  }}>목록 표시 개수</div>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    style={{
                      color: '#1B1E23',
                      fontSize: '18px',
                      fontFamily: 'Pretendard GOV',
                      fontWeight: '500',
                      lineHeight: '25.20px',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent'
                    }}
                  >
                    <option value={12}>12개</option>
                    <option value={24}>24개</option>
                    <option value={48}>48개</option>
                  </select>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#1B1E23" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <div style={{
            alignSelf: 'stretch',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            display: 'flex'
          }}>
            {/* 테이블 헤더 */}
            <div style={{
              alignSelf: 'stretch',
              justifyContent: 'flex-start',
              alignItems: 'center',
              display: 'inline-flex'
            }}>
              <div style={{
                flex: '1 1 0',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '18px',
                paddingBottom: '18px',
                background: '#F2FBFC',
                borderBottom: '1px #B9C1C9 solid',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'flex'
              }}>
                <div style={{
                  flex: '1 1 0',
                  textAlign: 'center',
                  color: '#24272D',
                  fontSize: '18px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '400',
                  lineHeight: '25.20px'
                }}>회사명</div>
              </div>
              <div style={{
                width: '160px',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '18px',
                paddingBottom: '18px',
                background: '#F2FBFC',
                borderBottom: '1px #B9C1C9 solid',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'flex'
              }}>
                <div style={{
                  flex: '1 1 0',
                  textAlign: 'center',
                  color: '#24272D',
                  fontSize: '18px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '400',
                  lineHeight: '25.20px'
                }}>대표자명</div>
              </div>
              <div style={{
                flex: '1 1 0',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '18px',
                paddingBottom: '18px',
                background: '#F2FBFC',
                borderBottom: '1px #B9C1C9 solid',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'flex'
              }}>
                <div style={{
                  flex: '1 1 0',
                  textAlign: 'center',
                  color: '#24272D',
                  fontSize: '18px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '400',
                  lineHeight: '25.20px'
                }}>주생산품</div>
              </div>
              <div style={{
                width: '160px',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '18px',
                paddingBottom: '18px',
                background: '#F2FBFC',
                borderBottom: '1px #B9C1C9 solid',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'flex'
              }}>
                <div style={{
                  flex: '1 1 0',
                  textAlign: 'center',
                  color: '#24272D',
                  fontSize: '18px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '400',
                  lineHeight: '25.20px'
                }}>연락처</div>
              </div>
              <div style={{
                flex: '1 1 0',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '18px',
                paddingBottom: '18px',
                background: '#F2FBFC',
                borderBottom: '1px #B9C1C9 solid',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'flex'
              }}>
                <div style={{
                  flex: '1 1 0',
                  textAlign: 'center',
                  color: '#24272D',
                  fontSize: '18px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '400',
                  lineHeight: '25.20px'
                }}>주소</div>
              </div>
            </div>

            {/* 테이블 바디 */}
            {loading ? (
              <div style={{
                alignSelf: 'stretch',
                paddingTop: '60px',
                paddingBottom: '60px',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex'
              }}>
                <div style={{
                  color: '#6C747E',
                  fontSize: '16px',
                  fontFamily: 'Pretendard GOV',
                  fontWeight: '400',
                  lineHeight: '24px'
                }}>기업 정보를 불러오는 중입니다...</div>
              </div>
            ) : (
              displayCompanies.map((company: any, index: number) => (
                <div key={index} style={{
                  alignSelf: 'stretch',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  display: 'inline-flex'
                }}>
                  <div style={{
                    flex: '1 1 0',
                    alignSelf: 'stretch',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingTop: '18px',
                    paddingBottom: '18px',
                    background: 'white',
                    borderBottom: '1px #B9C1C9 solid',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    display: 'flex'
                  }}>
                    <div style={{
                      flex: '1 1 0',
                      textAlign: 'center',
                      color: '#24272D',
                      fontSize: '18px',
                      fontFamily: 'Pretendard GOV',
                      fontWeight: '400',
                      lineHeight: '25.20px'
                    }}>{company.name || company.company_name || company.organization_name}</div>
                  </div>
                  <div style={{
                    width: '160px',
                    alignSelf: 'stretch',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingTop: '18px',
                    paddingBottom: '18px',
                    background: 'white',
                    borderBottom: '1px #B9C1C9 solid',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    display: 'flex'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      color: '#24272D',
                      fontSize: '18px',
                      fontFamily: 'Pretendard GOV',
                      fontWeight: '400',
                      lineHeight: '25.20px'
                    }}>{company.ceo || company.ceo_name || '-'}</div>
                  </div>
                  <div style={{
                    flex: '1 1 0',
                    alignSelf: 'stretch',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingTop: '18px',
                    paddingBottom: '18px',
                    background: 'white',
                    borderBottom: '1px #B9C1C9 solid',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    display: 'flex'
                  }}>
                    <div style={{
                      flex: '1 1 0',
                      textAlign: 'center',
                      color: '#24272D',
                      fontSize: '18px',
                      fontFamily: 'Pretendard GOV',
                      fontWeight: '400',
                      lineHeight: '25.20px'
                    }}>{company.products || company.main_products || '-'}</div>
                  </div>
                  <div style={{
                    width: '160px',
                    alignSelf: 'stretch',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingTop: '18px',
                    paddingBottom: '18px',
                    background: 'white',
                    borderBottom: '1px #B9C1C9 solid',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    display: 'flex'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      color: '#24272D',
                      fontSize: '18px',
                      fontFamily: 'Pretendard GOV',
                      fontWeight: '400',
                      lineHeight: '25.20px'
                    }}>{company.phone || company.phone_number || '-'}</div>
                  </div>
                  <div style={{
                    flex: '1 1 0',
                    alignSelf: 'stretch',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingTop: '18px',
                    paddingBottom: '18px',
                    background: 'white',
                    borderBottom: '1px #B9C1C9 solid',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    display: 'flex'
                  }}>
                    <div style={{
                      flex: '1 1 0',
                      textAlign: 'center',
                      color: '#24272D',
                      fontSize: '18px',
                      fontFamily: 'Pretendard GOV',
                      fontWeight: '400',
                      lineHeight: '25.20px'
                    }}>{company.address || company.full_address || '-'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 페이지네이션 */}
        <div style={{
          ...sectionStyle,
          marginTop: '40px',
          marginBottom: '200px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          display: 'flex'
        }}>
          <div style={{
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '8px',
            display: 'inline-flex'
          }}>
            <button
              onClick={() => handlePageChange(Math.max(1, (pagination?.page || 1) - 1))}
              disabled={(pagination?.page || 1) === 1}
              style={{
                height: '40px',
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '4px',
                paddingRight: '8px',
                borderRadius: '6px',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                border: 'none',
                background: 'transparent',
                cursor: (pagination?.page || 1) === 1 ? 'not-allowed' : 'pointer',
                opacity: (pagination?.page || 1) === 1 ? 0.5 : 1
              }}
            >
              <img
                src="/images/icon20.svg"
                alt="Previous"
                style={{width: '20px', height: '20px'}}
              />
              <div style={{
                textAlign: 'center',
                color: '#3A3F49',
                fontSize: '16px',
                fontFamily: 'Pretendard GOV',
                fontWeight: '400',
                lineHeight: '22.40px'
              }}>이전</div>
            </button>

            {(() => {
              const currentPage = pagination?.page || 1;
              const totalPages = pagination?.total_pages || Math.ceil(totalCount / itemsPerPage);
              const pageNumbers = [];
              const maxPagesToShow = 5; // 최대 표시할 페이지 수

              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, currentPage + 2);

              // 현재 페이지가 앞쪽에 있을 때
              if (currentPage <= 3) {
                startPage = 1;
                endPage = Math.min(maxPagesToShow, totalPages);
              }

              // 현재 페이지가 뒤쪽에 있을 때
              if (currentPage > totalPages - 3) {
                startPage = Math.max(1, totalPages - maxPagesToShow + 1);
                endPage = totalPages;
              }

              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
              }

              return pageNumbers.map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    width: '40px',
                    height: '40px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    background: page === currentPage ? '#002690' : 'transparent',
                    borderRadius: '6px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    display: 'inline-flex',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    textAlign: 'center',
                    color: page === currentPage ? 'white' : '#3A3F49',
                    fontSize: '18px',
                    fontFamily: 'Pretendard GOV',
                    fontWeight: page === currentPage ? '600' : '400',
                    lineHeight: '25.20px'
                  }}>{page}</div>
                </button>
              ));
            })()}

            <button
              onClick={() => handlePageChange((pagination?.page || 1) + 1)}
              disabled={(pagination?.page || 1) >= (pagination?.total_pages || Math.ceil(totalCount / itemsPerPage))}
              style={{
                height: '40px',
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '8px',
                paddingRight: '4px',
                borderRadius: '6px',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                border: 'none',
                background: 'transparent',
                cursor: (pagination?.page || 1) >= (pagination?.total_pages || Math.ceil(totalCount / itemsPerPage)) ? 'not-allowed' : 'pointer',
                opacity: (pagination?.page || 1) >= (pagination?.total_pages || Math.ceil(totalCount / itemsPerPage)) ? 0.5 : 1
              }}
            >
              <div style={{
                textAlign: 'center',
                color: '#3A3F49',
                fontSize: '16px',
                fontFamily: 'Pretendard GOV',
                fontWeight: '400',
                lineHeight: '22.40px'
              }}>다음</div>
              <img
                src="/images/icon20_right.svg"
                alt="Next"
                style={{width: '20px', height: '20px'}}
              />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CompanyDirectoryPage;