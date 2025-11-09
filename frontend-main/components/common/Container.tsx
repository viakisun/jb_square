/**
 * 🎨 Container 컴포넌트
 *
 * 최대 너비가 제한되고 중앙 정렬된 컨테이너
 * 모든 페이지의 메인 콘텐츠 영역에 사용
 *
 * 기능:
 * - 반응형 최대 너비 (max-w-7xl = 1280px)
 * - 중앙 정렬 (mx-auto)
 * - 반응형 패딩 (px-4, sm:px-6, lg:px-8)
 *
 * @example
 * <Container>
 *   <h1>페이지 제목</h1>
 *   <p>내용...</p>
 * </Container>
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';

interface ContainerProps {
  /** 자식 요소 */
  children: React.ReactNode;

  /** 추가 CSS 클래스 */
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
