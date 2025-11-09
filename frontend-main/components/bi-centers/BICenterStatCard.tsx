/**
 * 📊 BI Center 통계 카드 컴포넌트
 *
 * 창업보육센터 통계 정보를 표시하는 재사용 가능한 카드 컴포넌트입니다.
 *
 * **주요 기능:**
 * - 아이콘, 제목, 값 표시
 * - 변화율 표시 (선택적)
 * - 모바일 반응형 디자인
 * - Hover 효과
 *
 * **사용 예시:**
 * ```tsx
 * import { BICenterStatCard } from '@/components/bi-centers/BICenterStatCard';
 *
 * <BICenterStatCard
 *   title="총 센터"
 *   value={12}
 *   icon="🏢"
 *   changePercent={5.2}
 * />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';

/**
 * 컴포넌트 Props 인터페이스
 */
interface BICenterStatCardProps {
  /** 카드 제목 */
  title: string;
  /** 표시할 값 */
  value: number | string;
  /** 변화율 (선택적, 퍼센트) */
  changePercent?: number;
  /** 단위 (선택적, 예: "개", "명") */
  unit?: string;
}

/**
 * BI Center 통계 카드 컴포넌트
 *
 * @param props - BICenterStatCardProps
 * @returns 통계 카드 JSX
 */
export const BICenterStatCard: React.FC<BICenterStatCardProps> = ({
  title,
  value,
  changePercent,
  unit = '',
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-200">
      {/* 제목 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm md:text-base font-medium text-gray-600">{title}</h3>
      </div>

      {/* 값 표시 */}
      <div className="flex items-baseline justify-between">
        <p className="text-2xl md:text-3xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span className="text-lg md:text-xl font-medium text-gray-600 ml-1">{unit}</span>}
        </p>

        {/* 변화율 표시 (있는 경우) */}
        {changePercent !== undefined && (
          <div
            className={`flex items-center text-xs md:text-sm font-semibold ${
              changePercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {changePercent >= 0 ? (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {Math.abs(changePercent).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default BICenterStatCard;
