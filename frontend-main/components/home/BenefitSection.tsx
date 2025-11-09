/**
 * 🎁 회원 혜택 섹션 컴포넌트
 *
 * 메인 페이지의 회원 혜택 안내 섹션
 * - 주요 혜택 4가지 소개
 * - 3열 그리드 레이아웃 (반응형: 3→2→1)
 * - 아이콘 + 제목 + 설명 구조
 *
 * Figma 디자인 기반으로 구현
 *
 * @example
 * <BenefitSection />
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

/**
 * 혜택 정보 인터페이스
 */
interface Benefit {
  /** 혜택 ID */
  id: string;
  /** 아이콘 타입 */
  icon: 'search' | 'notification' | 'network' | 'support';
  /** 혜택 제목 */
  title: string;
  /** 혜택 설명 */
  description: string;
}

/**
 * 회원 혜택 목록
 */
const BENEFITS: Benefit[] = [
  {
    id: 'search',
    icon: 'search',
    title: '통합 정보 검색',
    description: '전북 바이오 산업 관련 공고, 기업, 기관 정보를 한 곳에서 검색하고 확인할 수 있습니다.',
  },
  {
    id: 'notification',
    icon: 'notification',
    title: '맞춤형 알림',
    description: '관심 분야의 새로운 지원사업 공고와 중요 소식을 실시간으로 받아보세요.',
  },
  {
    id: 'network',
    icon: 'network',
    title: '네트워킹 기회',
    description: '전북 바이오 산업 관계자들과의 네트워킹 이벤트 및 교류 프로그램에 참여하실 수 있습니다.',
  },
  {
    id: 'support',
    icon: 'support',
    title: '전문 컨설팅',
    description: '사업 운영, 기술 개발, 자금 조달 등 다양한 분야의 전문가 컨설팅을 받을 수 있습니다.',
  },
];

/**
 * 아이콘 컴포넌트
 */
const BenefitIcon: React.FC<{ type: Benefit['icon'] }> = ({ type }) => {
  const iconClass = "w-full h-full";

  switch (type) {
    case 'search':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      );
    case 'notification':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      );
    case 'network':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    case 'support':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
  }
};

export const BenefitSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-primary-blue/5 via-primary-cyan/5 to-white">
      <Container>
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            JB SQUARE 회원 혜택
          </h2>
          <p className="text-gray-600">
            회원가입 후 다양한 혜택을 누려보세요
          </p>
        </div>

        {/* 혜택 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {BENEFITS.map((benefit, index) => (
            <div
              key={benefit.id}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-card transition-all h-full flex flex-col items-center text-center border border-gray-100 hover:border-primary-blue">
                {/* 아이콘 영역 */}
                <div className="w-16 h-16 mb-6 text-primary-blue group-hover:text-primary-cyan transition-colors">
                  <BenefitIcon type={benefit.icon} />
                </div>

                {/* 제목 */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-blue transition-colors">
                  {benefit.title}
                </h3>

                {/* 설명 */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <div className="text-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary-blue text-white font-bold rounded-xl hover:bg-primary-cyan transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <span>지금 무료로 가입하기</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            이미 회원이신가요?{' '}
            <Link
              href="/auth/login"
              className="text-primary-blue hover:text-primary-cyan font-medium underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
};

export default BenefitSection;
