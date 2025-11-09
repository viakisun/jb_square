/**
 * 🤝 주요 기관 섹션 컴포넌트
 *
 * 메인 페이지의 주요 협력 기관 섹션
 * - 주요 파트너 기관 로고 및 링크
 * - 4열 그리드 레이아웃 (반응형: 4→3→2)
 * - 호버 효과로 상호작용성 강화
 *
 * Figma 디자인 기반으로 구현
 *
 * @example
 * <PartnerSection />
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

/**
 * 주요 파트너 기관 정보
 */
interface Partner {
  /** 기관 ID */
  id: string;
  /** 기관명 */
  name: string;
  /** 기관 설명 */
  description: string;
  /** 웹사이트 URL */
  website: string;
  /** 로고 이미지 URL (추후 실제 로고로 교체) */
  logo?: string;
}

/**
 * 주요 파트너 기관 목록
 * TODO: 추후 API에서 가져오도록 변경
 */
const PARTNERS: Partner[] = [
  {
    id: 'jbtp',
    name: '전북테크노파크',
    description: '전북 산업 혁신의 중심',
    website: 'https://www.jbtp.or.kr',
  },
  {
    id: 'ntis',
    name: '국가과학기술지식정보서비스',
    description: 'NTIS',
    website: 'https://www.ntis.go.kr',
  },
  {
    id: 'bizinfo',
    name: '중소기업 지원사업',
    description: 'K-Startup',
    website: 'https://www.bizinfo.go.kr',
  },
  {
    id: 'jeonbuk',
    name: '전라북도',
    description: '전북특별자치도청',
    website: 'https://www.jeonbuk.go.kr',
  },
  {
    id: 'kotra',
    name: '대한무역투자진흥공사',
    description: 'KOTRA',
    website: 'https://www.kotra.or.kr',
  },
  {
    id: 'smba',
    name: '중소벤처기업부',
    description: '중소기업 정책 총괄',
    website: 'https://www.mss.go.kr',
  },
  {
    id: 'kised',
    name: '중소기업유통센터',
    description: 'KISED',
    website: 'https://www.kised.or.kr',
  },
  {
    id: 'kbiz',
    name: '중소기업중앙회',
    description: '중소기업 권익 대변',
    website: 'http://www.kbiz.or.kr',
  },
];

export const PartnerSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <Container>
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            주요 협력 기관
          </h2>
          <p className="text-gray-600">
            JB SQUARE와 함께하는 주요 파트너 기관입니다
          </p>
        </div>

        {/* 파트너 기관 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PARTNERS.map((partner) => (
            <a
              key={partner.id}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-card transition-all h-full flex flex-col items-center justify-center border border-gray-100 hover:border-primary-blue">
                {/* 로고 영역 (플레이스홀더) */}
                <div className="w-full aspect-square mb-4 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center group-hover:from-primary-blue/5 group-hover:to-primary-cyan/5 transition-all">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    // 로고 플레이스홀더 아이콘
                    <svg
                      className="w-16 h-16 text-gray-300 group-hover:text-primary-blue transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  )}
                </div>

                {/* 기관명 */}
                <h3 className="text-center font-bold text-gray-900 mb-1 group-hover:text-primary-blue transition-colors text-sm">
                  {partner.name}
                </h3>

                {/* 설명 */}
                <p className="text-center text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                  {partner.description}
                </p>

                {/* 외부 링크 아이콘 */}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-4 h-4 text-primary-blue"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* 하단 안내 메시지 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            더 많은 협력 기관과 함께 전북 바이오 산업의 발전을 도모하고 있습니다
          </p>
        </div>
      </Container>
    </section>
  );
};

export default PartnerSection;
