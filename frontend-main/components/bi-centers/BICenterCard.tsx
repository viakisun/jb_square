/**
 * 🏢 BI Center 카드 컴포넌트
 *
 * 창업보육센터 정보를 표시하는 확장 가능한 카드 컴포넌트입니다.
 *
 * **주요 기능:**
 * - 센터 기본 정보 표시 (이름, 지역, 위치, 통계)
 * - 클릭하여 확장/축소
 * - 확장 시 입주기업 테이블 표시
 * - 부드러운 애니메이션
 * - 모바일 반응형 레이아웃
 *
 * **사용 예시:**
 * ```tsx
 * import { BICenterCard } from '@/components/bi-centers/BICenterCard';
 *
 * <BICenterCard center={center} companies={companies} />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import { BICenter, BICompany } from '@/lib/api/types';
import { BICompanyTable } from './BICompanyTable';

/**
 * 컴포넌트 Props 인터페이스
 */
interface BICenterCardProps {
  /** 센터 정보 */
  center: BICenter;
  /** 입주기업 목록 */
  companies: BICompany[];
  /** 입주기업 로딩 상태 */
  companiesLoading?: boolean;
  /** 확장 상태 */
  isExpanded?: boolean;
  /** 클릭 핸들러 */
  onClick?: () => void;
}

/**
 * BI Center 카드 컴포넌트
 *
 * @param props - BICenterCardProps
 * @returns 센터 카드 JSX
 */
export const BICenterCard: React.FC<BICenterCardProps> = ({
  center,
  companies,
  companiesLoading = false,
  isExpanded = false,
  onClick,
}) => {

  return (
    <div className="bg-white border border-gray-200 hover:shadow-sm hover:border-gray-900 transition-all overflow-hidden">
      {/* 카드 헤더 (항상 표시) */}
      <button
        onClick={onClick}
        className="w-full p-4 md:p-6 text-left focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-inset"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start justify-between">
          {/* 센터 정보 */}
          <div className="flex-1 min-w-0">
            {/* 센터명과 지역 배지 */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                {center.center_name}
              </h3>
              <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 border border-gray-300 text-xs font-semibold text-gray-700">
                {center.city || center.region || '전북'}
              </span>
            </div>

            {/* 운영기관 */}
            {center.org_name && (
              <p className="text-sm text-gray-600 mb-3">{center.org_name}</p>
            )}

            {/* 주소 */}
            {center.location && (
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="truncate">{center.location}</span>
              </div>
            )}

            {/* 통계 */}
            <div className="flex flex-wrap gap-4 text-sm">
              {/* 입주 기업 수 */}
              <div className="flex items-center text-gray-700">
                <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>입주 기업: <strong>{center.companies_count}</strong></span>
              </div>

              {/* 공실 정보 */}
              {center.vacant_rooms && (
                <div className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className={center.vacant_rooms !== '없음' ? 'text-green-600 font-semibold' : ''}>
                    공실: <strong>{center.vacant_rooms}</strong>
                  </span>
                </div>
              )}

              {/* 특화분야 */}
              {center.specialization && (
                <div className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>특화분야: <strong>{center.specialization}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* 확장/축소 아이콘 */}
          <div className="ml-4 flex-shrink-0">
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* 연락처 및 웹사이트 */}
        {(center.contact || center.center_url) && (
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            {center.contact && (
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>{center.contact}</span>
              </div>
            )}
            {center.center_url && (
              <div className="flex items-center text-gray-900 hover:text-black">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
                <a
                  href={center.center_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline"
                >
                  웹사이트 방문
                </a>
              </div>
            )}
          </div>
        )}
      </button>

      {/* 확장 영역 (입주기업 테이블) */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-4 md:px-6 py-4 bg-gray-50 animate-fadeIn">
          <h4 className="text-base font-semibold text-gray-900 mb-4">입주 기업 목록</h4>
          <BICompanyTable companies={companies} loading={companiesLoading} />
        </div>
      )}
    </div>
  );
};

export default BICenterCard;
