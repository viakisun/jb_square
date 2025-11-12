/**
 * 🏢 JB BIO 클러스터 > 클러스터 현황 페이지
 *
 * Figma 디자인(CLUSTER_DEV_CLUSTER)을 100% 반영하여 구현
 * - 페이지 타이틀 + Breadcrumb
 * - 바이오클러스터란? 인포 박스
 * - 바이오 삼각벨트 구축 (인포그래픽 + 테이블 2개)
 * - 바이오 클러스터 주요 도시 (지역 지도)
 *
 * @author JB SQUARE 개발팀
 * @version 3.0.0 - Figma Design Implementation
 */

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const headingFont = 'Pretendard GOV';

const containerStyle: React.CSSProperties = {
  width: '1060px',
  margin: '0 auto',
  paddingTop: '160px',
  paddingBottom: '160px',
  display: 'flex',
  flexDirection: 'column',
  gap: '120px',
};

const BioClusterPage: React.FC = () => {
  const tableBlocks: Array<{
    title: string;
    headers: string[];
    rows: React.ReactNode[][];
  }> = [
    {
      title: '연구개발특구(전주, 정읍, 완주, 익산(예정))',
      headers: ['구분', '국세(법인세)', '지방세(재산/취득세)', '기타'],
      rows: [
        [
          '지원내용',
          (
            <>
              3년 100% +<br />2년 50% 감면
            </>
          ),
          (
            <>
              재산세 7년 100% +<br />3년 50% 감면, 취득세 면제
            </>
          ),
          (
            <>
              사업 참여 가점,<br />기반시설 등
            </>
          ),
        ],
      ],
    },
    {
      title: '기회발전특구(전주, 정읍, 익산, 김제)',
      headers: ['구분', '법인세·소득세', '취득세·재산세', '규제·정주'],
      rows: [
        [
          '지원내용',
          (
            <>
              5년 100% +<br />2년 50% 감면
            </>
          ),
          (
            <>
              취득세 100% 감면,<br />재산세 5년 100%+5년 50% 감면
            </>
          ),
          (
            <>
              규제특례·<br />주택공급·교육 등
            </>
          ),
        ],
      ],
    },
  ];

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  };

  const headerCellStyle: React.CSSProperties = {
    background: '#F2FBFC',
    padding: '18px 20px',
    borderBottom: '1px solid #B9C1C9',
    textAlign: 'center',
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: '18px 20px',
    borderBottom: '1px solid #B9C1C9',
    background: '#FFFFFF',
    textAlign: 'center',
  };

  const cellTextStyle: React.CSSProperties = {
    color: '#24272D',
    fontSize: '18px',
    fontFamily: headingFont,
    fontWeight: 400,
    lineHeight: '25.2px',
    wordWrap: 'break-word',
    display: 'inline-block',
    textAlign: 'center',
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main style={containerStyle}>
        <section style={{ width: '100%' }}>
          <div
            style={{
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              display: 'inline-flex',
            }}
          >
            <div
              style={{
                flex: '1 1 0',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: '4px',
                display: 'inline-flex',
              }}
            >
              <div
                style={{
                  alignSelf: 'stretch',
                  color: '#00B8CD',
                  fontSize: '16px',
                  fontFamily: headingFont,
                  fontWeight: 600,
                  lineHeight: '22.4px',
                  wordWrap: 'break-word',
                }}
              >
                JB BIO 클러스터
              </div>
              <div
                style={{
                  color: '#121418',
                  fontSize: '60px',
                  fontFamily: headingFont,
                  fontWeight: 700,
                  lineHeight: '84px',
                  wordWrap: 'break-word',
                }}
              >
                클러스터 현황
              </div>
            </div>

            <div
              style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '4px',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Image src="/images/home-03.svg" alt="홈" width={16} height={16} />
              </div>
              <Image src="/images/icon16.svg" alt="" width={16} height={16} />
              <div
                style={{
                  padding: '2px 4px',
                  background: '#FFFFFF',
                  borderRadius: '4px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    color: '#24272D',
                    fontSize: '16px',
                    fontFamily: headingFont,
                    fontWeight: 500,
                    lineHeight: '22.4px',
                    wordWrap: 'break-word',
                  }}
                >
                  JB BIO 클러스터
                </div>
              </div>
              <Image src="/images/icon16.svg" alt="" width={16} height={16} />
              <div
                style={{
                  padding: '2px 4px',
                  background: '#FFFFFF',
                  borderRadius: '4px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    color: '#24272D',
                    fontSize: '16px',
                    fontFamily: headingFont,
                    fontWeight: 500,
                    lineHeight: '22.4px',
                    wordWrap: 'break-word',
                  }}
                >
                  클러스터 현황
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ width: '100%' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              paddingLeft: '64px',
              paddingRight: '64px',
              paddingTop: '32px',
              paddingBottom: '32px',
              background: '#F4F6FB',
              borderRadius: '16px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px',
              display: 'inline-flex',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                position: 'relative',
                background: '#FFFFFF',
                overflow: 'hidden',
                borderRadius: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src="/images/cluster-icon.svg"
                alt="바이오 클러스터 아이콘"
                width={74}
                height={74}
                priority
                style={{ width: '74px', height: '74px' }}
              />
            </div>

            <div
              style={{
                flex: '1 1 0',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '16px',
                display: 'inline-flex',
              }}
            >
              <div
                style={{
                  alignSelf: 'stretch',
                  color: '#121418',
                  fontSize: '32px',
                  fontFamily: headingFont,
                  fontWeight: 700,
                  lineHeight: '44.8px',
                  wordWrap: 'break-word',
                }}
              >
                바이오클러스터란?
              </div>

              <div style={{ alignSelf: 'stretch' }}>
                <span
                  style={{
                    color: '#24272D',
                    fontSize: '18px',
                    fontFamily: headingFont,
                    fontWeight: 400,
                    lineHeight: '27px',
                    wordWrap: 'break-word',
                  }}
                >
                  바이오클러스터는 연구개발, 임상, 생산 등
                </span>
                <span
                  style={{
                    color: '#10409A',
                    fontSize: '18px',
                    fontFamily: headingFont,
                    fontWeight: 600,
                    lineHeight: '27px',
                    wordWrap: 'break-word',
                  }}
                >
                  {' '}바이오 산업의 전주기를 하나의 체계로 연결해 기업·대학·연구기관이 <br />협력하는 산업 생태계
                </span>
                <span
                  style={{
                    color: '#24272D',
                    fontSize: '18px',
                    fontFamily: headingFont,
                    fontWeight: 400,
                    lineHeight: '27px',
                    wordWrap: 'break-word',
                  }}
                >
                  를 의미합니다.<br />전라북도는 이러한 바이오클러스터를 중심으로 연구개발특구와 기회발전특구를 연계하여
                </span>
                <span
                  style={{
                    color: '#10409A',
                    fontSize: '18px',
                    fontFamily: headingFont,
                    fontWeight: 600,
                    lineHeight: '27px',
                    wordWrap: 'break-word',
                  }}
                >
                  {' '}지역별 특화 역량을 모은 전북형 바이오 삼각벨트를 구축
                </span>
                <span
                  style={{
                    color: '#24272D',
                    fontSize: '18px',
                    fontFamily: headingFont,
                    fontWeight: 400,
                    lineHeight: '27px',
                    wordWrap: 'break-word',
                  }}
                >
                  하고 있습니다.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '24px',
            display: 'inline-flex',
          }}
        >
          <div
            style={{
              alignSelf: 'stretch',
              color: '#121418',
              fontSize: '40px',
              fontFamily: headingFont,
              fontWeight: 700,
              lineHeight: '56px',
              wordWrap: 'break-word',
            }}
          >
            바이오 삼각벨트 구축
          </div>

          <div
            style={{
              alignSelf: 'stretch',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: '24px',
              display: 'flex',
            }}
          >
            <div
              style={{
                alignSelf: 'stretch',
                paddingLeft: '40px',
                paddingRight: '40px',
                paddingTop: '48px',
                paddingBottom: '48px',
                background: '#F8F9FC',
                borderRadius: '16px',
                outline: '1px #D6DBE1 solid',
                outlineOffset: '-1px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'inline-flex',
              }}
            >
              <div style={{ width: '574px', height: '620px', position: 'relative' }}>
                <div
                  style={{
                    width: '544px',
                    height: '544px',
                    left: '15px',
                    top: '61.96px',
                    position: 'absolute',
                    background: '#FFFFFF',
                    borderRadius: '9999px',
                    border: '2px #001D6C solid',
                  }}
                />
                <div
                  style={{
                    width: '374px',
                    height: '373px',
                    left: '100px',
                    top: '146.96px',
                    position: 'absolute',
                    background: '#F2FBFC',
                    borderRadius: '9999px',
                    outline: '1px #E6E9F4 solid',
                  }}
                />
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    padding: '10px',
                    left: '187px',
                    top: 0,
                    position: 'absolute',
                    background: '#009669',
                    borderRadius: '5500px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px',
                    display: 'inline-flex',
                  }}
                >
                  <div
                    style={{
                      color: '#FFFFFF',
                      fontSize: '32px',
                      fontFamily: headingFont,
                      fontWeight: 600,
                      lineHeight: '48px',
                      wordWrap: 'break-word',
                    }}
                  >
                    전주
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      justifyContent: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      color: '#F3F6FB',
                      fontSize: '20px',
                      fontFamily: headingFont,
                      fontWeight: 500,
                      lineHeight: '28px',
                      wordWrap: 'break-word',
                    }}
                  >
                    전주도시첨단
                    <br />
                    산업단지
                  </div>
                </div>
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    padding: '10px',
                    left: 0,
                    top: '379px',
                    position: 'absolute',
                    background: '#00397A',
                    borderRadius: '5500px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px',
                    display: 'inline-flex',
                  }}
                >
                  <div
                    style={{
                      color: '#FFFFFF',
                      fontSize: '32px',
                      fontFamily: headingFont,
                      fontWeight: 600,
                      lineHeight: '48px',
                      wordWrap: 'break-word',
                    }}
                  >
                    정읍
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      justifyContent: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      color: '#F3F6FB',
                      fontSize: '20px',
                      fontFamily: headingFont,
                      fontWeight: 500,
                      lineHeight: '28px',
                      wordWrap: 'break-word',
                    }}
                  >
                    첨단과학
                    <br />
                    일반산업단지
                  </div>
                </div>
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    padding: '10px',
                    left: '374px',
                    top: '379px',
                    position: 'absolute',
                    background: '#0076A0',
                    borderRadius: '5500px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px',
                    display: 'inline-flex',
                  }}
                >
                  <div
                    style={{
                      color: '#FFFFFF',
                      fontSize: '32px',
                      fontFamily: headingFont,
                      fontWeight: 600,
                      lineHeight: '48px',
                      wordWrap: 'break-word',
                    }}
                  >
                    익산
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      justifyContent: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      color: '#F3F6FB',
                      fontSize: '20px',
                      fontFamily: headingFont,
                      fontWeight: 500,
                      lineHeight: '28px',
                      wordWrap: 'break-word',
                    }}
                  >
                    제3일반
                    <br />
                    산업단지
                  </div>
                </div>
                <div
                  style={{
                    left: '184px',
                    top: '245px',
                    position: 'absolute',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: '16px',
                    display: 'inline-flex',
                  }}
                >
                  <div
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '12px',
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        paddingTop: '9px',
                        paddingBottom: '9px',
                        background: 'linear-gradient(136deg, #00BDDD 0%, #3662DF 100%)',
                        borderRadius: '500px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        display: 'inline-flex',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#FFFFFF',
                          fontSize: '24px',
                          fontFamily: headingFont,
                          fontWeight: 500,
                          lineHeight: '33.6px',
                          wordWrap: 'break-word',
                        }}
                      >
                        JB Bio Triangle
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#001756',
                        fontSize: '40px',
                        fontFamily: headingFont,
                        fontWeight: 700,
                        lineHeight: '56px',
                        wordWrap: 'break-word',
                      }}
                    >
                      바이오
                      <br />
                      삼각벨트
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: '24px',
                display: 'inline-flex',
              }}
            >
              <div
                style={{
                  alignSelf: 'stretch',
                  height: '201px',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  display: 'flex',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    alignSelf: 'stretch',
                    paddingBottom: '20px',
                    borderBottom: '1px #565B64 solid',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: '8px',
                    display: 'inline-flex',
                  }}
                >
                  <div
                    style={{
                      color: '#24272D',
                      fontSize: '24px',
                      fontFamily: headingFont,
                      fontWeight: 600,
                      lineHeight: '33.6px',
                      wordWrap: 'break-word',
                    }}
                  >
                    연구개발특구(전주, 정읍, 완주, 익산(예정))
                  </div>
                </div>

                <div
                  style={{
                    alignSelf: 'stretch',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      alignSelf: 'stretch',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      display: 'inline-flex',
                    }}
                  >
                    {['구분', '국세(법인세)', '지방세(재산/취득세)', '기타'].map((text) => (
                      <div
                        key={text}
                        style={{
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
                          display: 'flex',
                          minHeight: '86px',
                          boxSizing: 'border-box',
                        }}
                      >
                        <div
                          style={{
                            flex: '1 1 0',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '6px',
                            display: 'flex',
                          }}
                        >
                          <div
                            style={{
                              textAlign: 'center',
                              color: '#24272D',
                              fontSize: '18px',
                              fontFamily: headingFont,
                              fontWeight: 400,
                              lineHeight: '25.2px',
                              wordWrap: 'break-word',
                            }}
                          >
                            {text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      alignSelf: 'stretch',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      display: 'inline-flex',
                    }}
                  >
                    {[
                      '지원내용',
                      (
                        <>
                          3년 100% + 
                          <br />
                          2년 50% 감면
                        </>
                      ),
                      (
                        <>
                          <span style={{ whiteSpace: 'nowrap' }}>재산세 7년 100% + </span>
                          <br />
                          <span style={{ whiteSpace: 'nowrap' }}>3년 50% 감면, 취득세 면제</span>
                        </>
                      ),
                      (
                        <>
                          사업 참여 가점, 
                          <br />
                          기반시설 등
                        </>
                      ),
                    ].map((content, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: '1 1 0',
                          paddingLeft: '20px',
                          paddingRight: '20px',
                          paddingTop: '18px',
                          paddingBottom: '18px',
                          background: '#FFFFFF',
                          borderBottom: '1px #B9C1C9 solid',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '10px',
                          display: 'flex',
                          minHeight: '86px',
                          boxSizing: 'border-box',
                        }}
                      >
                          <div
                            style={{
                              flex: '1 1 0',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '6px',
                              display: 'flex',
                            }}
                          >
                            <div
                              style={{
                                textAlign: 'center',
                                color: '#24272D',
                                fontSize: '18px',
                                fontFamily: headingFont,
                                fontWeight: 400,
                                lineHeight: '25.2px',
                                wordWrap: 'break-word',
                              }}
                            >
                              {content}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  alignSelf: 'stretch',
                  height: '201px',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  display: 'flex',
                }}
              >
                <div
                  style={{
                    alignSelf: 'stretch',
                    paddingBottom: '20px',
                    borderBottom: '1px #565B64 solid',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: '8px',
                    display: 'inline-flex',
                  }}
                >
                  <div
                    style={{
                      color: '#24272D',
                      fontSize: '24px',
                      fontFamily: headingFont,
                      fontWeight: 600,
                      lineHeight: '33.6px',
                      wordWrap: 'break-word',
                    }}
                  >
                    기회발전특구(전주, 정읍, 익산, 김제)
                  </div>
                </div>

                <div
                  style={{
                    alignSelf: 'stretch',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      alignSelf: 'stretch',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      display: 'inline-flex',
                    }}
                  >
                    {['구분', '법인세·소득세', '취득세·재산세', '규제·정주'].map((text) => (
                      <div
                        key={text}
                        style={{
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
                          display: 'flex',
                          minHeight: '86px',
                          boxSizing: 'border-box',
                        }}
                      >
                          <div
                            style={{
                              flex: '1 1 0',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '6px',
                              display: 'flex',
                            }}
                          >
                            <div
                              style={{
                                textAlign: 'center',
                                color: '#24272D',
                                fontSize: '18px',
                                fontFamily: headingFont,
                                fontWeight: 400,
                                lineHeight: '25.2px',
                                wordWrap: 'break-word',
                              }}
                            >
                              {text}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>

                  <div
                    style={{
                      alignSelf: 'stretch',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      display: 'inline-flex',
                    }}
                  >
                    {[
                      '지원내용',
                      (
                        <>
                          5년 100% + 
                          <br />
                          2년 50% 감면
                        </>
                      ),
                      (
                        <>
                          <span style={{ whiteSpace: 'nowrap' }}>취득세 100% 감면, </span>
                          <br />
                          <span style={{ whiteSpace: 'nowrap' }}>재산세 5년 100%+5년 50% 감면</span>
                        </>
                      ),
                      (
                        <>
                          규제특례·
                          <br />
                          주택공급·교육 등
                        </>
                      ),
                    ].map((content, idx) => (
                      <div
                        key={idx}
                        style={{
                          flex: '1 1 0',
                          paddingLeft: '20px',
                          paddingRight: '20px',
                          paddingTop: '18px',
                          paddingBottom: '18px',
                          background: '#FFFFFF',
                          borderBottom: '1px #B9C1C9 solid',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '10px',
                          display: 'flex',
                          minHeight: '86px',
                          boxSizing: 'border-box',
                        }}
                      >
                          <div
                            style={{
                              flex: '1 1 0',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '6px',
                              display: 'flex',
                            }}
                          >
                            <div
                              style={{
                                textAlign: 'center',
                                color: '#24272D',
                                fontSize: '18px',
                                fontFamily: headingFont,
                                fontWeight: 400,
                                lineHeight: '25.2px',
                                wordWrap: 'break-word',
                              }}
                            >
                              {content}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '24px',
            display: 'inline-flex',
          }}
        >
          <div
            style={{
              alignSelf: 'stretch',
              color: '#121418',
              fontSize: '40px',
              fontFamily: headingFont,
              fontWeight: 700,
              lineHeight: '56px',
              wordWrap: 'break-word',
            }}
          >
            바이오 클러스터 주요 도시
          </div>

          <div
            style={{
              width: '1060px',
              background: '#F8F9FC',
              borderRadius: '16px',
              outline: '1px #D6DBE1 solid',
              outlineOffset: '-1px',
              padding: '40px',
              boxSizing: 'border-box',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              src="/images/cluster-map.png"
              alt="전북 바이오 클러스터 지도"
              width={980}
              height={700}
              style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
            />
          </div>
        </section>

        <section style={{ width: '100%' }}>
          <div
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #104099 0%, #00B8CD 100%)',
              borderRadius: '32px',
              padding: '48px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '32px',
                fontFamily: headingFont,
                fontWeight: 700,
                lineHeight: '44.8px',
              }}
            >
              입주 및 투자 문의
            </div>
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '18px',
                fontFamily: headingFont,
                fontWeight: 400,
                lineHeight: '27px',
              }}
            >
              JB BIO 클러스터의 입주 및 투자에 대해 궁금하신 사항이 있으시면 문의해 주세요.
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  minWidth: '240px',
                  padding: '20px 32px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    fontFamily: headingFont,
                    fontWeight: 500,
                    lineHeight: '20px',
                  }}
                >
                  전화문의
                </div>
                <div
                  style={{
                    color: '#FFFFFF',
                    fontSize: '24px',
                    fontFamily: headingFont,
                    fontWeight: 700,
                    lineHeight: '32px',
                  }}
                >
                  063-219-3600
                </div>
              </div>
              <div
                style={{
                  minWidth: '240px',
                  padding: '20px 32px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    fontFamily: headingFont,
                    fontWeight: 500,
                    lineHeight: '20px',
                  }}
                >
                  이메일
                </div>
                <div
                  style={{
                    color: '#FFFFFF',
                    fontSize: '24px',
                    fontFamily: headingFont,
                    fontWeight: 700,
                    lineHeight: '32px',
                  }}
                >
                  info@jbbia.or.kr
                </div>
              </div>
            </div>
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                fontFamily: headingFont,
                fontWeight: 500,
                lineHeight: '20px',
              }}
            >
              📍 전북 정읍시 산내면 첨단과학산업단지
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BioClusterPage;
