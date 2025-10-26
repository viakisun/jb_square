# 데이터 수집 API 설정 가이드

## 개요

JB SQUARE 백오피스는 다양한 소스로부터 공고 정보를 수집합니다. 각 소스별로 적절한 방법을 사용합니다.

## 데이터 소스 및 수집 방법

### 1. NTIS (국가과학기술정보서비스)

**수집 방법**: OpenAPI ✅

**설정 필요**: API 키 발급 및 환경변수 설정

**이유**: NTIS는 웹 크롤링을 금지하고 있으며, 공식 OpenAPI를 제공합니다.

#### API 키 발급 방법

1. **공공데이터포털을 통한 신청**
   - URL: https://www.data.go.kr/data/15077315/openapi.do
   - 회원가입 → 로그인 → 활용신청 → 승인 대기

2. **NTIS 직접 신청**
   - URL: https://www.ntis.go.kr/rndopen/api/mng/apiMain.do
   - NTIS 회원가입 → API 신청

#### 환경변수 설정

`.env` 파일에 다음 추가:
```bash
NTIS_API_KEY=발급받은_API_키
```

#### API 사용 현황

- **엔드포인트**: `https://www.ntis.go.kr/openapi/service/getRnDTaskList`
- **응답 형식**: JSON/XML
- **파라미터**:
  - `serviceKey`: API 키
  - `numOfRows`: 가져올 데이터 수 (기본 100)
  - `pageNo`: 페이지 번호
  - `_type`: 응답 형식 (json/xml)

---

### 2. 기업마당 (Bizinfo)

**수집 방법**: API/RSS ⏳

**설정 필요**: API 키 발급 (향후 적용 예정)

#### API 정보

- **공식 API**: https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do
- **공공데이터포털**: https://www.data.go.kr/data/15122782/fileData.do

#### 환경변수 설정 (준비)

```bash
BIZINFO_API_KEY=발급받은_API_키
```

> **현재 상태**: 추후 API 전환 예정

---

### 3. JBTP (전라북도테크노파크)

**수집 방법**: 웹 크롤링 🕷️

**설정 필요**: 없음

**이유**: 공개 API가 제공되지 않아 웹 크롤링 방식 유지

#### 크롤링 대상

- 사업공고: https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000102001000000
- 채용공고: https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000101001000000
- 유관기관공고: https://www.jbtp.or.kr/index.jbtp?menuCd=DOM_000000102002000000

#### 수집 정보

- 기본 정보: 제목, 링크, 날짜, 게시판
- 상세 정보: 작성자, 조회수, 상태, 마감일, 첨부파일, PDF 뷰어 URL

#### Rate Limiting

- 요청 간격: 0.5초
- 상세 페이지 수집 시에도 동일한 간격 적용

---

## 환경변수 설정 전체 예시

`/Users/adminvia/devwork/jb2/backoffice/.env` 파일:

```bash
# API Keys for Data Collection
# TODO: 키 발급 후 입력 필요

# NTIS (필수)
NTIS_API_KEY=

# 기업마당 (선택, 향후 사용)
BIZINFO_API_KEY=

# JBTP (불필요 - 웹 크롤링 사용)
# JBTP_API_KEY=
```

---

## 크롤러 실행 방법

### WebSocket을 통한 실시간 크롤링

```javascript
// 프론트엔드에서 WebSocket 연결
const ws = new WebSocket('ws://localhost:8000/api/notices/crawl/ntis');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.type, data.message);
};
```

### 지원되는 소스

- `jbtp`: 전라북도테크노파크
- `ntis`: 국가과학기술정보서비스 (API 키 필요)
- `bizinfo`: 기업마당 (향후 지원)

---

## 주의사항

### NTIS API 키가 없는 경우

API 키 없이 NTIS 크롤러를 실행하면 다음 오류가 발생합니다:

```json
{
  "type": "error",
  "message": "NTIS API 키가 설정되지 않았습니다. .env 파일에 NTIS_API_KEY를 입력해주세요."
}
```

### 크롤링 규칙 준수

- NTIS는 **반드시 API 사용** (크롤링 금지)
- JBTP는 rate limiting (0.5초 간격) 준수
- robots.txt 규칙 확인 권장

---

## 문제 해결

### API 키 오류

```bash
# .env 파일 확인
cat /Users/adminvia/devwork/jb2/backoffice/.env

# API 키 형식 확인 (공백 제거)
NTIS_API_KEY=키값 (X)
NTIS_API_KEY=키값 (O)
```

### 크롤링 실패

1. 네트워크 연결 확인
2. 대상 사이트 접근 가능 여부 확인
3. Rate limiting 설정 확인 (crawler_manager.py)

---

## 향후 개선 계획

1. ✅ NTIS API 전환 완료
2. ⏳ 기업마당 API 전환 예정
3. 🔍 JBTP API/RSS 제공 여부 지속 확인
4. 📊 수집 통계 및 모니터링 기능 추가

---

## 관련 파일

- **크롤러**: `/backoffice/backend/src/services/crawler_manager.py`
- **환경변수**: `/backoffice/.env`
- **API 라우터**: `/backoffice/backend/src/routers/notices.py`
- **프론트엔드**: `/backoffice/frontend/src/routes/crawling/+page.svelte`
