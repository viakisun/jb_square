/**
 * 💀 SkeletonCard 컴포넌트
 *
 * 데이터 로딩 중 표시되는 스켈레톤 UI
 * 사용자에게 로딩 상태를 시각적으로 전달
 *
 * 기능:
 * - 애니메이션 (animate-pulse)
 * - 카드 형태 레이아웃
 * - 이미지 + 텍스트 영역 모방
 *
 * @example
 * {loading ? (
 *   <SkeletonCard />
 * ) : (
 *   <ActualCard data={data} />
 * )}
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';

interface SkeletonCardProps {
  /** 스켈레톤 타입 (카드 높이 조정) */
  variant?: 'default' | 'compact' | 'tall';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'default'
}) => {
  // 타입별 이미지 영역 높이
  const imageHeights = {
    default: 'h-48',   // 192px
    compact: 'h-32',   // 128px
    tall: 'h-64',      // 256px
  };

  return (
    <div className="animate-pulse">
      {/* 이미지 영역 */}
      <div className={`bg-gray-200 border border-gray-300 mb-4 ${imageHeights[variant]}`}></div>

      {/* 제목 (긴 줄) */}
      <div className="bg-gray-200 h-4 mb-3"></div>

      {/* 서브 텍스트 (짧은 줄) */}
      <div className="bg-gray-200 h-4 w-2/3 mb-2"></div>

      {/* 날짜 또는 추가 정보 (더 짧은 줄) */}
      <div className="bg-gray-200 h-3 w-1/3"></div>
    </div>
  );
};

export default SkeletonCard;
