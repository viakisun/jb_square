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
  /** 이미지 경로 */
  imagePath: string;
  /** 이미지 스타일 (Figma 정확한 위치) */
  imageStyle: {
    width: number;
    height: number;
    left: number;
    top?: number;
  };
}

/**
 * 회원 혜택 목록
 */
const BENEFITS: Benefit[] = [
  {
    id: 'priority-notification',
    icon: 'notification',
    title: '지원사업 우선 알림 제공',
    description: '신규·진행 중인 바이오 지원사업 정보를 회원에게 가장 빠르게 우선 안내',
    imagePath: '/images/5f7932138f5cede6982f7d3246d54ed9928a622e.png',
    imageStyle: {
      width: 180,
      height: 180,
      left: 118,
      top: 0
    }
  },
  {
    id: 'custom-info',
    icon: 'search',
    title: '맞춤형 정보',
    description: '기업 유형과 성장 단계에 적합한 정책·사업 등 맞춤 정보 제공',
    imagePath: '/images/a77f8cd8431bb857fe1eefef15c966b63757205f.png',
    imageStyle: {
      width: 188,
      height: 180,
      left: 111,
      top: 0
    }
  },
  {
    id: 'networking',
    icon: 'network',
    title: '네트워킹 기회',
    description: '바이오 커뮤니티 행사 및 회원 대상 네트워킹 기회 우선 초청',
    imagePath: '/images/bd2cffde3096d59a6dab7097dea33ec544142c7b.png',
    imageStyle: {
      width: 208,
      height: 103,
      left: 90,
      top: 45
    }
  },
  {
    id: 'expert-consulting',
    icon: 'support',
    title: '전문가 상담',
    description: '창업·투자·인증 등 분야별 전문가와 1:1 실무 중심 전문 상담 제공',
    imagePath: '/images/37eceff4089c34c12c0b104004a2a8ccc12234df.png',
    imageStyle: {
      width: 190,
      height: 188,
      left: 108,
      top: 0
    }
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
    <section style={{ paddingTop: '80px', paddingBottom: '80px', backgroundColor: '#FFFFFF' }}>
      <div style={{ maxWidth: '1520px', margin: '0 auto', padding: '0 20px' }}>
        {/* 섹션 헤더 */}
        <div className="mb-12">
          <h2 className="font-bold mb-2" style={{ fontSize: '48px', letterSpacing: '-0.48px', lineHeight: '72px', color: '#121418' }}>
            회원 혜택
          </h2>
          <p style={{ fontSize: '20px', letterSpacing: '-0.2px', lineHeight: '26px', color: '#6C747E' }}>
            회원에게만 제공되는 맞춤형 정보와 실질적인 성장 지원 혜택을 만나보세요.
          </p>
        </div>

        {/* 혜택 카드 그리드 - 4개 카드 1열 */}
        <div className="flex" style={{ gap: '24px', marginBottom: '60px' }}>
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.id}
              className="flex flex-col"
              style={{
                flex: '1 1 0',
                backgroundColor: '#F3F6FB',
                padding: '32px',
                borderRadius: '8px',
                gap: '32px',
                alignItems: 'flex-end'
              }}
            >
              {/* 텍스트 영역 */}
              <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 제목 */}
                <h3 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '36px', color: '#121418', wordWrap: 'break-word' }}>
                  {benefit.title}
                </h3>

                {/* 설명 */}
                <p style={{ fontSize: '18px', fontWeight: '400', lineHeight: '27px', color: '#3A3F49', wordWrap: 'break-word' }}>
                  {benefit.description}
                </p>
              </div>

              {/* 이미지 영역 */}
              <div
                style={{
                  alignSelf: 'stretch',
                  height: '180px',
                  position: 'relative'
                }}
              >
                <img
                  src={benefit.imagePath}
                  alt={benefit.title}
                  style={{
                    width: `${benefit.imageStyle.width}px`,
                    height: `${benefit.imageStyle.height}px`,
                    left: `${benefit.imageStyle.left}px`,
                    top: `${benefit.imageStyle.top || 0}px`,
                    position: 'absolute'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <div className="flex justify-center">
          <Link
            href="/auth/signup"
            className="transition-colors"
            style={{
              fontSize: '18px',
              fontWeight: '500',
              lineHeight: '27px',
              paddingLeft: '24px',
              paddingRight: '24px',
              paddingTop: '16px',
              paddingBottom: '16px',
              backgroundColor: '#10409A',
              color: 'white',
              borderRadius: '8px',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            회원가입하고 혜택 받기
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BenefitSection;
