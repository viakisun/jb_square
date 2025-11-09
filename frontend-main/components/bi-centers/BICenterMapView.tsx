/**
 * 🗺️ BI Center 지도 뷰 컴포넌트
 *
 * Naver Maps API를 사용하여 창업보육센터 위치를 지도에 표시합니다.
 *
 * **주요 기능:**
 * - 전라북도 중심으로 지도 표시
 * - 각 센터 위치에 마커 표시
 * - 마커 클릭 시 센터 정보 팝업
 * - 모바일 반응형 지원
 * - 전체화면 토글 기능
 *
 * **사용 예시:**
 * ```tsx
 * import { BICenterMapView } from '@/components/bi-centers/BICenterMapView';
 *
 * <BICenterMapView centers={centers} />
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { BICenter } from '@/lib/api/types';

/**
 * 컴포넌트 Props 인터페이스
 */
interface BICenterMapViewProps {
  /** 표시할 센터 목록 */
  centers: BICenter[];
  /** 초기 확장 상태 */
  initialExpanded?: boolean;
}

/**
 * BI Center 지도 뷰 컴포넌트
 */
export const BICenterMapView: React.FC<BICenterMapViewProps> = ({
  centers,
  initialExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  /**
   * Naver Maps API 스크립트 로드
   */
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;

    if (!clientId) {
      console.error('Naver Maps Client ID not found');
      return;
    }

    // 이미 로드되었는지 확인
    if (window.naver && window.naver.maps) {
      setIsMapLoaded(true);
      return;
    }

    // 스크립트 로드 (신규 NCP Maps API)
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => setIsMapLoaded(true);
    script.onerror = () => console.error('Failed to load Naver Maps API');
    document.head.appendChild(script);

    return () => {
      // 클린업은 하지 않음 (전역 스크립트이므로)
    };
  }, []);

  /**
   * 지도 초기화
   */
  useEffect(() => {
    if (!isMapLoaded || !window.naver || !window.naver.maps) return;

    const mapElement = document.getElementById('bicenter-map');
    if (!mapElement || map) return;

    // 전라북도 중심 좌표 (전주시)
    const center = new window.naver.maps.LatLng(35.82, 127.14);

    // 지도 생성
    const newMap = new window.naver.maps.Map(mapElement, {
      center,
      zoom: 9,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
      mapTypeControl: false,
    });

    setMap(newMap);
  }, [isMapLoaded, map]);

  /**
   * 마커 생성 및 업데이트
   */
  useEffect(() => {
    if (!map || !window.naver || !window.naver.maps) return;

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));

    // 유효한 좌표를 가진 센터만 필터링
    const validCenters = centers.filter(
      (center) => center.latitude && center.longitude
    );

    // 새로운 마커 생성
    const newMarkers = validCenters.map((center) => {
      const position = new window.naver.maps.LatLng(
        center.latitude!,
        center.longitude!
      );

      const marker = new window.naver.maps.Marker({
        position,
        map,
        title: center.center_name,
        icon: {
          content: `
            <div style="
              background-color: #00BDD6;
              border: 2px solid white;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              cursor: pointer;
            ">
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `,
          anchor: new window.naver.maps.Point(12, 24),
        },
      });

      // 인포윈도우 생성
      const infoWindow = new window.naver.maps.InfoWindow({
        content: `
          <div style="
            padding: 16px;
            min-width: 250px;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          ">
            <h3 style="
              font-size: 16px;
              font-weight: 700;
              color: #121418;
              margin: 0 0 8px 0;
            ">${center.center_name}</h3>

            ${center.org_name ? `
              <p style="
                font-size: 13px;
                color: #6B7280;
                margin: 0 0 8px 0;
              ">${center.org_name}</p>
            ` : ''}

            <div style="
              display: flex;
              gap: 12px;
              font-size: 13px;
              color: #374151;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #E5E7EB;
            ">
              <div>
                <span style="color: #6B7280;">입주기업:</span>
                <strong style="color: #00BDD6; margin-left: 4px;">${center.companies_count}</strong>
              </div>
              ${center.vacant_rooms && center.vacant_rooms !== '없음' ? `
                <div>
                  <span style="color: #6B7280;">공실:</span>
                  <strong style="color: #10B981; margin-left: 4px;">${center.vacant_rooms}</strong>
                </div>
              ` : ''}
            </div>

            ${center.specialization ? `
              <p style="
                font-size: 12px;
                color: #6B7280;
                margin: 8px 0 0 0;
                padding-top: 8px;
                border-top: 1px solid #E5E7EB;
              ">
                <span style="font-weight: 600;">특화분야:</span> ${center.specialization}
              </p>
            ` : ''}
          </div>
        `,
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    // 마커가 있으면 지도 범위 조정
    if (newMarkers.length > 0) {
      const bounds = new window.naver.maps.LatLngBounds();
      newMarkers.forEach((marker) => {
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [map, centers]);

  /**
   * 전체화면 토글
   */
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  /**
   * 로딩 상태
   */
  if (!isMapLoaded) {
    return (
      <div className="py-12 text-center bg-gray-50 rounded-lg">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
        <p className="text-gray-600">지도를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Desktop: 고정 높이 지도 */}
      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">전체 센터 위치</h3>
                <p className="text-sm text-gray-600 mt-1">
                  전라북도 창업보육센터 {centers.length}개 위치
                </p>
              </div>
              <div className="text-sm text-gray-500">
                📍 마커를 클릭하면 상세 정보를 볼 수 있습니다
              </div>
            </div>
          </div>

          {/* 지도 */}
          <div id="bicenter-map" className="w-full h-[600px]"></div>
        </div>
      </div>

      {/* Mobile: 토글 가능한 지도 */}
      <div className="md:hidden">
        {!isExpanded ? (
          /* 축소 상태: 버튼만 표시 */
          <button
            onClick={toggleExpand}
            className="w-full px-6 py-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">지도에서 보기</h3>
                  <p className="text-sm text-gray-600">전체 센터 위치 확인</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ) : (
          /* 확장 상태: 전체화면 지도 */
          <div className="fixed inset-0 z-50 bg-white">
            {/* 헤더 */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <h3 className="font-bold text-gray-900">센터 위치</h3>
              <button
                onClick={toggleExpand}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 지도 */}
            <div id="bicenter-map" className="w-full h-[calc(100vh-60px)]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BICenterMapView;
