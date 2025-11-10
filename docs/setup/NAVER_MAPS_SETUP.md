# Naver Maps API 설정 가이드

## 개요

JB SQUARE 프로젝트는 Naver Maps JavaScript API를 사용하여 창업보육센터 위치를 지도에 표시합니다.

## 사용된 API

### 1. Naver Maps JavaScript API (현재 사용 중) ✅

**목적**: 프론트엔드에서 지도 표시 및 마커 렌더링

**필요한 인증 정보**:
- Client ID만 필요 (브라우저에서 사용)
- HTTP Referer 제한으로 보안 관리

**설정 방법**:
1. [Naver Cloud Platform Console](https://console.ncloud.com/naver-service/application)에서 애플리케이션 생성
2. Application 이름: `jb-square`
3. Service: "Web Dynamic Map" 선택
4. HTTP Referer 설정:
   - 개발: `http://localhost:*`
   - 프로덕션: `https://jb2.kr/*`, `https://www.jb2.kr/*`
5. Client ID를 `.env.local`에 추가:
   ```bash
   NEXT_PUBLIC_NAVER_CLIENT_ID=your_client_id_here
   ```

**보안**:
- ✅ Client ID는 브라우저에 노출되어도 안전함
- ✅ HTTP Referer 제한으로 다른 도메인에서 사용 불가
- ✅ `NEXT_PUBLIC_` 접두사 사용 (Next.js 관례)

### 2. Naver Cloud Platform Geocoding API (미사용) ❌

**목적**: 주소를 좌표로 변환 (시도했으나 실패)

**필요한 인증 정보**:
- Client ID + Client Secret (서버 사이드)
- NCP 전용 인증 필요

**현재 상태**:
- ❌ 401 인증 오류로 사용 불가
- ❌ `update_bi_center_coordinates.py` 파일은 사용되지 않음
- ✅ 대신 수동 좌표 매핑 방식 사용 (`set_bi_center_coordinates.py`)

## 환경 변수 설정

### 프론트엔드 (`frontend-main/.env.local`)

```bash
# Naver Maps JavaScript API Client ID
# 애플리케이션: jb-square
NEXT_PUBLIC_NAVER_CLIENT_ID=yacz432l4x
```

**중요**:
- ✅ `.env.local` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않습니다
- ✅ Client ID는 브라우저에 노출되어도 안전합니다
- ⚠️ 프로덕션 배포 시 환경 변수로 별도 설정 필요

### 백엔드 (선택사항 - 현재 미사용)

```bash
# NCP Geocoding API (현재 사용 안함)
# NAVER_CLOUD_CLIENT_ID=
# NAVER_CLOUD_CLIENT_SECRET=
```

## 파일 구조

### 프론트엔드
- `components/bi-centers/BICenterMapView.tsx` - 지도 컴포넌트
- `types/naver-maps.d.ts` - TypeScript 타입 정의
- `pages/incubator/centers.tsx` - 창업보육센터 페이지

### 백엔드
- `models/bi_center.py` - latitude, longitude 필드 추가
- `services/crawlers/bi_center_crawler.py` - 위도 크롤링 (경도는 수집 안됨)
- `set_bi_center_coordinates.py` - 좌표 수동 설정 스크립트 ✅

### 데이터베이스
- `bi_centers` 테이블:
  - `latitude DECIMAL(10, 7)` - 위도
  - `longitude DECIMAL(10, 7)` - 경도

## 보안 체크리스트

- [x] `.env.local` 파일이 `.gitignore`에 포함됨
- [x] Client Secret이 코드에 하드코딩되지 않음
- [x] `.env.example`에 설정 가이드 추가
- [x] HTTP Referer 제한 설정
- [x] 프로덕션 환경변수 별도 관리

## 프로덕션 배포

### Vercel/AWS 배포 시

환경 변수 설정:
```bash
NEXT_PUBLIC_NAVER_CLIENT_ID=your_production_client_id
```

### HTTP Referer 설정

Naver Cloud Console에서 다음 도메인 추가:
- `https://jb2.kr/*`
- `https://www.jb2.kr/*`
- `https://admin.jb2.kr/*`

## 문제 해결

### 지도가 표시되지 않을 때

1. 브라우저 콘솔에서 오류 확인
2. Client ID가 올바른지 확인
3. HTTP Referer 제한 확인
4. 네트워크 탭에서 API 호출 확인

### 좌표가 없는 센터

`backend/set_bi_center_coordinates.py` 스크립트 실행:
```bash
cd backend
source venv/bin/activate
python set_bi_center_coordinates.py
```

## 참고 자료

- [Naver Maps API 문서](https://navermaps.github.io/maps.js/)
- [Naver Cloud Platform Console](https://console.ncloud.com)
- [Next.js 환경 변수 가이드](https://nextjs.org/docs/basic-features/environment-variables)
