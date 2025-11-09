/**
 * 🏢 BI 입주기업 테이블 컴포넌트
 *
 * 창업보육센터의 입주기업 목록을 테이블 형식으로 표시합니다.
 *
 * **주요 기능:**
 * - 기업명, 업종, 입주일, 연락처 표시
 * - 모바일에서 가로 스크롤 지원
 * - 빈 상태 처리
 * - 반응형 레이아웃
 *
 * **사용 예시:**
 * ```tsx
 * import { BICompanyTable } from '@/components/bi-centers/BICompanyTable';
 *
 * <BICompanyTable companies={companies} />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import { BICompany } from '@/lib/api/types';

/**
 * 컴포넌트 Props 인터페이스
 */
interface BICompanyTableProps {
  /** 입주기업 목록 */
  companies: BICompany[];
  /** 로딩 상태 */
  loading?: boolean;
}

/**
 * BI 입주기업 테이블 컴포넌트
 *
 * @param props - BICompanyTableProps
 * @returns 입주기업 테이블 JSX
 */
export const BICompanyTable: React.FC<BICompanyTableProps> = ({ companies, loading = false }) => {
  /**
   * 로딩 상태 렌더링
   */
  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        <p className="mt-3 text-sm text-gray-600">입주기업 정보를 불러오는 중...</p>
      </div>
    );
  }

  /**
   * 빈 상태 렌더링
   */
  if (!companies || companies.length === 0) {
    return (
      <div className="py-8 text-center bg-gray-50 rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <p className="mt-3 text-sm text-gray-600">입주 기업이 없습니다</p>
      </div>
    );
  }

  /**
   * 테이블 렌더링
   */
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            {/* 테이블 헤더 */}
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  기업명
                </th>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  사업분야
                </th>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  제품/서비스
                </th>
              </tr>
            </thead>

            {/* 테이블 바디 */}
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                  {/* 기업명 */}
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                  </td>

                  {/* 업종 */}
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{company.business_field || '-'}</div>
                  </td>

                  {/* 제품/서비스 */}
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {company.product || '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BICompanyTable;
