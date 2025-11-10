/**
 * 📋 공고 메인 페이지 (리팩토링 버전)
 *
 * 카테고리별 공고를 섹션 형태로 보여주는 메인 페이지입니다.
 * 5개의 주요 섹션으로 구성되어 있습니다:
 * 1. 정부 공고
 * 2. 지자체 사업 공고
 * 3. 유관 기관 공고 (R&D)
 * 4. 기업 맞춤형 지원 사업
 * 5. 창업 보육센터 현황
 *
 * 각 섹션은 3개의 공고/센터를 미리보기로 표시하고,
 * "더보기" 버튼을 통해 전체 목록으로 이동할 수 있습니다.
 *
 * 초보자를 위한 설명:
 * - CategorySection: 공고 카테고리별 섹션 (정부, 지자체, 유관기관, 기업맞춤형)
 * - IncubatorSection: 창업보육센터 섹션
 * - 각 섹션은 독립적으로 데이터를 불러오므로 성능이 최적화되어 있습니다
 * - 사용자는 관심 있는 카테고리를 쉽게 찾아볼 수 있습니다
 *
 * @author JB SQUARE 개발팀
 * @version 2.0.0
 */

import React from 'react';
import Head from 'next/head';
import { CategorySection } from '@/components/sample-board/CategorySection';
import { IncubatorSection } from '@/components/sample-board/IncubatorSection';

/**
 * 공고 메인 페이지 컴포넌트
 *
 * 작동 방식:
 * 1. 5개의 섹션 컴포넌트를 렌더링
 * 2. 각 섹션은 독립적으로 API를 호출하여 데이터 로드
 * 3. 각 섹션은 3개씩만 미리보기 표시
 * 4. 더보기 버튼으로 각 카테고리의 전체 페이지로 이동
 *
 * @returns 공고 메인 페이지 JSX
 */
export default function SampleBoardMainPage() {
  return (
    <>
      {/* ========== 페이지 메타데이터 ========== */}
      <Head>
        <title>공고 게시판 - JB SQUARE</title>
        <meta
          name="description"
          content="전북 바이오 산업 공고 및 창업보육센터 정보를 한 곳에서 확인하세요"
        />
      </Head>

      {/* ========== 메인 컨테이너 ========== */}
      <div className="min-h-screen bg-gray-50">

        {/* ========== 헤더 ========== */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {/* 좌측: 페이지 제목 및 설명 */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  공고 게시판
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  정부, 지자체, 유관기관 공고 및 창업보육센터 정보를 한눈에
                </p>
              </div>

              {/* 우측: API 문서 링크 버튼 */}
              <div className="flex items-center gap-4">
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  API 문서 보기
                </a>
                <a
                  href="/docs/SAMPLE_BOARD_README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  개발 가이드
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* ========== 메인 컨텐츠 ========== */}
        {/*
          main 요소 내에 5개의 섹션을 배치합니다.
          각 섹션은 자동으로 border-b를 가지며, 마지막 섹션은 border가 없습니다 (last:border-b-0)
        */}
        <main className="max-w-7xl mx-auto">

          {/* ========== 1. 정부 공고 섹션 ========== */}
          {/*
            sourceId='source:ntis:rss': 정부 부처에서 발표하는 공고
            정부 지원 사업, 보조금, 연구개발 과제 등
          */}
          <CategorySection
            title="정부 공고"
            description="정부 부처에서 발표하는 각종 지원 사업 및 공고"
            sourceId="source:ntis:rss"
            viewAllLink="/sample-board/government"
            limit={3}
          />

          {/* ========== 2. 지자체 사업 공고 섹션 ========== */}
          {/*
            sourceId='source:jbtp:local': 지방자치단체의 공고
            지역 맞춤형 지원 사업, 지역 특화 산업 육성 등
          */}
          <CategorySection
            title="지자체 사업 공고"
            description="지방자치단체의 지역 맞춤형 지원 사업"
            sourceId="source:jbtp:local"
            viewAllLink="/sample-board/local"
            limit={3}
          />

          {/* ========== 3. 유관 기관 공고 섹션 ========== */}
          {/*
            sourceId='source:jbtp:external': 연구개발 관련 기관의 공고
            JBTP 유관기관 R&D 지원 공고
            연구과제, 기술개발, 산학협력 등
          */}
          <CategorySection
            title="유관 기관 공고"
            description="R&D 유관 기관의 연구개발 지원 공고"
            sourceId="source:jbtp:external"
            viewAllLink="/sample-board/institutions"
            limit={3}
          />

          {/* ========== 4. 기업 맞춤형 지원 사업 섹션 ========== */}
          {/*
            sourceId='source:bizinfo:web': 기업을 위한 맞춤형 지원 사업
            스타트업 지원, 중소기업 지원, 벤처 육성 등
          */}
          <CategorySection
            title="기업 맞춤형 지원 사업"
            description="스타트업 및 중소기업을 위한 맞춤형 지원"
            sourceId="source:bizinfo:web"
            viewAllLink="/sample-board/business"
            limit={3}
          />

          {/* ========== 5. 창업보육센터 섹션 ========== */}
          {/*
            BI Center (Business Incubator)
            onlyVacant=true: 공실이 있는 센터만 우선 표시
            창업을 준비하는 기업이 입주 가능한 공간 정보 제공
          */}
          <IncubatorSection
            title="창업보육센터"
            description="전북 지역 창업보육센터 공실 현황"
            viewAllLink="/sample-board/incubators"
            limit={5}
            onlyVacant={true}
          />

        </main>

        {/* ========== 푸터 ========== */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
              {/* 페이지 설명 */}
              <p className="mb-2">
                전북 바이오 산업 플랫폼 - 공고 및 창업보육센터 정보
              </p>

              {/* 기술 스택 설명 */}
              <p className="mb-4">
                <span className="font-semibold">사용된 기술:</span>
                {' '}Next.js, TypeScript, Tailwind CSS, API Gateway, Custom Components
              </p>

              {/* 외부 링크 */}
              <div className="flex items-center justify-center gap-6">
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Swagger API 문서
                </a>
                <a
                  href="http://localhost:8000/redoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  ReDoc API 문서
                </a>
                <a
                  href="/docs/SAMPLE_BOARD_README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  개발자 가이드
                </a>
              </div>

              {/* 카테고리 설명 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">카테고리 안내</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">정부 공고</h5>
                    <p className="text-xs text-gray-500">
                      정부 부처의 지원 사업 및 연구개발 과제
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">지자체 사업</h5>
                    <p className="text-xs text-gray-500">
                      지방자치단체의 지역 맞춤형 지원
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">유관 기관</h5>
                    <p className="text-xs text-gray-500">
                      R&D 유관 기관의 연구개발 지원
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">기업 맞춤형</h5>
                    <p className="text-xs text-gray-500">
                      스타트업 및 중소기업 지원 사업
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">보육센터</h5>
                    <p className="text-xs text-gray-500">
                      창업보육센터 입주 공간 정보
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
