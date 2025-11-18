# JB SQUARE Frontend-Admin 업무자동화 크롤링 페이지 종합 가이드

## 개요

JB SQUARE 백오피스 시스템의 업무자동화 섹션은 10개의 페이지로 구성되어 있습니다. 8개의 크롤링 페이지에서 외부 소스로부터 바이오/제약 관련 공고와 뉴스를 자동 수집하며, 2개의 조회 전용 페이지에서 기존 데이터를 필터링하여 제공합니다.

### 페이지 목록

| 번호 | 페이지명 | 경로 | 타입 |
|-----|---------|------|-----|
| 1 | 정부 공고 (NTIS) | /notices/ntis | 크롤링 |
| 2 | 지자체 사업공고 | /notices/jbtp | 크롤링 |
| 3 | 유관기관 공고 | /notices/external | 크롤링 |
| 4 | 기업 맞춤형 지원사업 | /notices/business | 크롤링 |
| 5 | 식약처 뉴스 | /notices/mfds | 크롤링 |
| 6 | 복지부 뉴스 | /notices/mohw | 크롤링 |
| 7 | 바이오행사 | /notices/events | 크롤링 |
| 8 | 창업보육센터 (BI) | /notices/startup | 크롤링 |
| 9 | 연구개발 (R&D) | /notices/rnd | 조회 |
| 10 | 최신공고 모아보기 | /notices/latest | 조회 |

---

## 1. 정부 공고 (NTIS)

### 기본 정보

- 경로: `/notices/ntis`
- 페이지 제목: 정부 공고 (NTIS)
- 설명: 국가R&D 공고 크롤링 및 관리
- 소스 ID: `source:ntis:rss`
- 크롤러 타입: RSS 기반

### 크롤링 기능

- 크롤링 버튼: RSS 크롤링 시작
- WebSocket 실시간 진행상황: 지원
- 크롤링 방식: NTIS RSS 피드를 통해 국가R&D 공고 수집

### 검색 및 필터 (크롤링 대기열)

#### 테이블 컬럼
- 체크박스 (다중 선택)
- 제목
- 키워드 (매칭된 키워드 배지 표시)
- 게시일
- 마감일 (D-day 계산 및 긴급도 표시)
- 상세 (미리보기 버튼)
- 링크 (원본 링크)

#### 액션
- 선택 항목 게시
- 선택 삭제
- 새로고침

### 검색 및 필터 (게시된 공고)

- 검색바: 공고 제목 및 내용 검색
- 태그 필터: 드롭다운 선택
- 상태 필터: 기본값 published
- 페이지네이션: 20개씩 표시

#### 테이블 구조
- 전체 선택 체크박스
- NoticeCard 컴포넌트 (카드 형식 표시)

### 크롤러 설정

- 키워드 관리: 동적 추가 및 삭제 가능
- 검색 기간: 1주일, 1개월, 3개월, 6개월 선택
- 설정 API: `/api/crawling/configs/source:ntis:rss`

### 특수 기능

- 수동 추가 모달 (AddNoticeModal)
- 중복 공고 감지 (already_exists 배지)
- 실시간 WebSocket 로그

---

## 2. 지자체 사업공고

### 기본 정보

- 경로: `/notices/jbtp`
- 페이지 제목: 지자체 사업공고
- 설명: JBTP 사업공고 크롤링 및 관리
- 소스 ID: `source:jbtp:local`
- 크롤러 타입: 웹 스크래핑

### 크롤링 기능

- 크롤링 버튼: 사업공고 크롤링 시작
- WebSocket 실시간 진행상황: 지원
- 2단계 크롤링:
  - 수집 단계 (collecting): 페이지별 공고 목록 수집
  - 처리 단계 (processing): 각 공고의 상세 정보 수집

### 검색 및 필터 (크롤링 대기열)

#### 테이블 컬럼
NTIS와 동일 (체크박스, 제목, 키워드, 게시일, 마감일, 상세, 링크)

#### 상태 인디케이터
- 페이지 수집 중 (페이지 번호, 누적 개수 표시)
- 상세 정보 수집 중 (진행률 및 전체 개수 표시)

### 검색 및 필터 (게시된 공고)

NTIS와 동일 (검색, 태그 필터, 페이지네이션)

### 크롤러 설정

- 키워드 관리: 지원
- 검색 기간: 1주일, 1개월, 3개월, 6개월
- URL: 전북테크노파크 사업공고 게시판

### 특수 기능

- 실시간 항목 추가 (item_added 이벤트)
- 중복 제거 (ID 기반)
- 강제 재렌더링 (publishedListKey)

---

## 3. 유관기관 공고

### 기본 정보

- 경로: `/notices/external`
- 페이지 제목: 유관기관 공고
- 설명: JBTP 유관기관 공고 크롤링 및 관리
- 소스 ID: `source:jbtp:external`
- 크롤러 타입: 웹 스크래핑

### 크롤링 기능

- 크롤링 버튼: 유관기관 크롤링 시작
- WebSocket 실시간 진행상황: 지원
- 2단계 크롤링: 수집 → 처리

### 검색 및 필터

특수 컴포넌트: ExternalNoticeQueueTable.svelte (유관기관 특화)

#### 테이블 컬럼
기본 CrawlQueueTable과 동일

### 크롤러 설정

- 키워드 관리: 지원
- 검색 기간: 지원

---

## 4. 기업 맞춤형 지원사업

### 기본 정보

- 경로: `/notices/business`
- 페이지 제목: 기업 지원사업
- 설명: 기업마당 API 데이터 수집 및 공고 관리
- 소스 ID: `source:bizinfo:web`
- 크롤러 타입: API 기반

### 크롤링 기능

- 크롤링 버튼: API 데이터 수집 시작
- WebSocket 실시간 진행상황: 지원
- Composable 사용: useCrawlWebSocket.svelte (재사용 가능한 WebSocket 로직)
- 2단계 크롤링: collecting → processing

### 검색 및 필터

동일한 CrawlQueueTable 사용

### 크롤러 설정

- 키워드 관리: 지원
- 검색 기간: 지원

### 특수 기능

- 크롤링 완료 후 자동 스크롤 (queuePanelRef)
- 모던 composable 패턴 사용

---

## 5. 식약처 뉴스

### 기본 정보

- 경로: `/notices/mfds`
- 페이지 제목: 식약처 뉴스
- 설명: 식품의약품안전처 RSS 뉴스 크롤링 및 관리
- 소스 ID: `source:news:mfds`
- 크롤러 타입: RSS

### 크롤링 기능

- 크롤링 버튼: RSS 크롤링 시작
- WebSocket 실시간 진행상황: 지원
- 단계: collecting → filtering

### 검색 및 필터

동일한 구조

### 크롤러 설정

- 키워드 관리: 지원 (바이오 및 제약 관련 키워드 필터링)
- 검색 기간: 지원

### 특수 기능

- phase_change 이벤트 (필터링 단계 구분)
- 뉴스 아이템 실시간 추가

---

## 6. 복지부 뉴스

### 기본 정보

- 경로: `/notices/mohw`
- 페이지 제목: 보건복지부 뉴스
- 설명: 보건복지부 RSS 뉴스 크롤링 및 관리
- 소스 ID: `source:news:mohw`
- 크롤러 타입: RSS

### 크롤링 기능

- 크롤링 버튼: RSS 크롤링 시작
- WebSocket 실시간 진행상황: 지원
- 단계: collecting → filtering

### 검색 및 필터

식약처 뉴스와 동일

### 크롤러 설정

- 키워드 관리: 지원
- 검색 기간: 지원

---

## 7. 바이오행사

### 기본 정보

- 경로: `/notices/events`
- 페이지 제목: 바이오행사
- 설명: JBTP 바이오행사 정보 크롤링 및 관리
- 소스 ID: `source:jbtp:events`
- 크롤러 타입: 웹 스크래핑

### 크롤링 기능

- 크롤링 버튼: 바이오행사 크롤링 시작
- WebSocket 실시간 진행상황: 지원
- 2단계 크롤링: collecting → processing

### 검색 및 필터

동일한 구조

### 크롤러 설정

- 키워드 관리: 지원
- 검색 기간: 지원

### 특수 기능

- 게시된 바이오행사 탭 (별도 표시)

---

## 8. 창업보육센터 (BI)

### 기본 정보

- 경로: `/notices/startup`
- 페이지 제목: 창업보육센터
- 설명: 전북 지역 창업보육센터 및 입주기업 정보
- 크롤링 타입: BI 센터 디렉토리 정보 (공고가 아님)

### 크롤링 기능

- 크롤링 버튼: BI 센터 데이터 수집
- WebSocket: `/api/crawling/ws/bi_center`
- 데이터: BICenter 및 BICompany 모델

### 통계 대시보드

- 총 센터 수
- 총 입주기업
- 총 공실수
- 평균 입주기업

### 검색 및 필터

- 지역 필터: 드롭다운 (전체 및 지역별)
- 검색: 센터명, 기관명, 지역 검색
- 정렬: 입주기업 많은 순, 이름순, 최신순

### 테이블 구조

#### 센터 카드
- 센터명, 기관명
- 지역, 시군구 배지
- 입주기업 수 배지
- 주력보육분야, 공실, 위치 (인라인 표시)

#### 확장 시
- 입주기업 테이블 (기업명, 업종, 제품)

### 특수 기능

- 접을 수 있는 센터 카드
- 실시간 통계 계산
- 지역별 필터링

---

## 9. 연구개발 (R&D)

### 기본 정보

- 경로: `/notices/rnd`
- 페이지 제목: 연구개발 공고 (R&D)
- 설명: R&D 태그가 있는 공고 최근 15개
- 크롤링 기능: 없음 (조회 전용 페이지)

### 기능

- 데이터 소스: 기존 게시된 공고 중 R&D 태그 필터링
- API: `/notices?tag=R%26D&limit=15`
- 표시 방식: NoticeCard 그리드 (카드 형식)
- 실시간 크롤링: 없음

### 검색 및 필터

필터링 없음 (최신 15개만 표시)

---

## 10. 최신공고 모아보기

### 기본 정보

- 경로: `/notices/latest`
- 페이지 제목: 최신공고 모아보기
- 설명: 등록날짜 기준 최근 15개 공고
- 크롤링 기능: 없음 (조회 전용 페이지)

### 기능

- 데이터 소스: 모든 소스의 최신 공고
- API: `/notices/latest/list?limit=15`
- 표시 방식: NoticeCard 그리드
- 실시간 크롤링: 없음

### 검색 및 필터

필터링 없음 (최신 15개만 표시)

---

## 공통 기능

### 크롤링 진행 상황 (CrawlingStatus)

모든 크롤링 페이지에서 사용하는 실시간 진행 상황 컴포넌트입니다.

#### 표시 정보
- 실시간 로그 스트림
- 진행률 표시 (progress/total)
- 성공 및 실패 카운트
- 에러 메시지 표시
- 상태: idle, running, completed, error, stopped

### 크롤러 설정 (CrawlerConfigInline)

크롤러별 설정을 관리하는 인라인 컴포넌트입니다.

#### 설정 항목
- 소스 ID 표시
- URL 표시 (해당하는 경우)
- 검색 기간 설정: 1주일, 1개월, 3개월, 6개월 선택
- 키워드 관리:
  - 키워드 목록 표시 (태그 형식)
  - 동적 추가 및 삭제
  - 키워드 입력 시 Enter 저장, Esc 취소

### 크롤링 대기열 (CrawlQueueTable)

크롤링된 데이터를 검토하고 게시하는 테이블입니다.

#### 컬럼
1. 체크박스 (다중 선택)
2. 제목 (중복 감지 배지 포함)
3. 키워드 (매칭된 키워드 배지)
4. 게시일
5. 마감일 (D-day 계산, 긴급도 표시)
6. 상세 (미리보기 버튼)
7. 링크 (새 창 열기)

#### 액션
- 전체 선택 및 해제
- 선택 항목 게시
- 선택 삭제
- 새로고침

#### 상태 표시
- 선택된 항목 수
- 중복 공고 경고 (already_exists)
- 마감일 긴급도 (D-7 이하 빨간색)

### 게시된 공고 (PublishedNoticesList)

게시된 공고를 관리하는 목록 컴포넌트입니다.

#### 필터
- 검색바 (제목 및 내용)
- 태그 필터 (드롭다운)
- 검색 버튼
- 새로고침 버튼

#### 선택 기능
- 전체 선택 체크박스
- 선택된 공고 수 표시
- 선택 삭제 (아카이브)

#### 페이지네이션
- 20개씩 표시
- 전체 페이지 수 표시

### 수동 추가 모달 (AddNoticeModal)

모든 크롤링 페이지에 수동 추가 버튼이 있으며, 관리자가 직접 공고를 입력할 수 있습니다.

---

## 백엔드 구조

### 키워드 서비스 (KeywordService)

위치: `/backend/src/services/sources/services/keyword_service.py`

#### 메서드
- `match_keywords(text, keywords)`: 텍스트에서 키워드 매칭
- `has_any_keyword(text, keywords)`: 키워드 포함 여부 확인
- `filter_by_keywords(items, keywords)`: 항목 필터링

#### 매칭 방식
대소문자 무시 (case-insensitive)

### 크롤러 설정 모델

위치: `/backend/src/models/crawler_config.py`

#### 통합 모델 (CrawlerConfig)
```python
source_id: 소스 고유 ID
crawler_type: 'jbtp', 'rss', 'api', 'binet', 'web'
name: 표시 이름
url: 크롤링 URL
config_data: JSONB (타입별 특수 설정)
keywords: JSONB 배열
date_range_days: 검색 기간 (일)
enabled: 활성화 여부
```

### 소스 상수

위치: `/backend/src/constants/sources.py`

```python
NoticeSource.NTIS_RSS = "source:ntis:rss"
NoticeSource.JBTP_LOCAL = "source:jbtp:local"
NoticeSource.JBTP_EXTERNAL = "source:jbtp:external"
NoticeSource.JBTP_EVENTS = "source:jbtp:events"
NoticeSource.BIZINFO_API = "source:bizinfo:web"
NoticeSource.NEWS_MFDS = "source:news:mfds"
NoticeSource.NEWS_MOHW = "source:news:mohw"
```

### WebSocket 이벤트 타입

#### 공통 이벤트
- start: 크롤링 시작
- log: 로그 메시지
- progress: 진행률 업데이트 (progress, total, success, failed)
- complete: 크롤링 완료
- error: 에러 발생
- stopped: 중단됨

#### 특수 이벤트
- page_progress: 페이지별 수집 진행 (JBTP 계열)
- collection_complete: 수집 완료, 처리 시작 (JBTP 계열)
- item_added: 아이템 실시간 추가
- phase_change: 단계 변경 (RSS 뉴스)

---

## 페이지별 크롤러 설정 API

모든 크롤러 설정은 통합 API를 사용합니다.

### API 엔드포인트

```
GET/PUT /api/crawling/configs/{source_id}
```

### 예시
- `/api/crawling/configs/source:ntis:rss`
- `/api/crawling/configs/source:jbtp:local`
- `/api/crawling/configs/source:news:mfds`

---

## 키워드 설정

### 키워드 관리 방식

모든 크롤러는 CrawlerConfigInline 컴포넌트를 통해 키워드를 동적으로 관리합니다.

#### 기능
- 키워드 추가 (추가 버튼)
- 키워드 삭제 (X 버튼)
- 실시간 업데이트 (PUT 요청)

### 크롤러별 현재 키워드 설정

아래는 2025년 11월 18일 기준 데이터베이스에 설정된 실제 키워드 목록입니다.

#### 1. NTIS 국가R&D통합공고 (source:ntis:rss)

**키워드 (134개)**:
```
바이오, 생명, 의료, 제약, 헬스케어, 유전, 건강, 보건, 임상, 진단,
치료, 병원, 질병, 의약, 신약, 백신, 항체, 세포, 줄기세포, 유전자,
게놈, DNA, RNA, 단백질, 효소, 미생물, 발효, 배양, 의료기기, 의료장비,
진단기기, 헬스, 식품, 건강기능식품, 뷰티, 화장품, 천연물, 농생명, 동물, 수의,
축산, 재생의료, 면역, 항암, 첨단의료, 디지털헬스, 원격의료, 정밀의료, 맞춤의료, AI의료,
의료AI, 과제, 사업, 공모, 지원금, 보조금, 연구비, R&D, 연구개발, 기술개발,
개발과제, 산업, 제조, 생산, 공장, 시설, 창업, 스타트업, 벤처, 중소기업,
기업, 혁신, 신기술, 첨단, 미래, 전북, 지역, bio, Bio, BIO,
biotech, Biotech, health, Health, medical, Medical, pharma, Pharma, drug, Drug,
clinical, Clinical, diagnosis, Diagnosis, therapy, Therapy, vaccine, Vaccine, antibody, cell,
Cell, stem, Stem, gene, Gene, genome, Genome, protein, Protein, enzyme,
Enzyme, innovation, Innovation, startup, Startup, research, Research, development, Development
```

#### 2. 사업공고 (source:jbtp:local)

**키워드 (41개)**:
```
바이오, bio, 생명공학, 제약, 의료기기, 헬스케어, healthcare, 바이오헬스, 의약품, 임상,
진단, 치료제, 스타트업, 창업, R&D, 연구개발, 기술개발, 사업화, 실증, 특허,
중소기업, 벤처, 예비창업, 초기창업, 시제품, 테스트베드, 인공지능, AI, 디지털, 디지털헬스,
농생명, 식품, 농업, 농산물, 농식품, ICT, IoT, 첨단, 혁신, 이차전지
```

#### 3. 유관기관공고 (source:jbtp:external)

**키워드 (34개)**:
```
바이오, bio, 생명공학, 제약, 의료기기, 헬스케어, healthcare, 바이오헬스, 의약품, 임상,
진단, 치료제, 인공지능, AI, 디지털, 디지털헬스, 농생명, 식품, 농업, 농산물,
농식품, ICT, IoT, 전자, 이차전지, 반도체, 스타트업, 창업, R&D, 연구개발,
기술개발, 사업화
```

#### 4. 기업마당 정책정보 (source:bizinfo:web)

**키워드 (2개)**:
```
전북, 전북특별자치도
```

#### 5. 식약처 공지사항 (source:news:mfds)

**키워드 (7개)**:
```
바이오, 의약품, 생물학적제제, 임상시험, 의약외품, 허가, 승인
```

#### 6. 보건복지부 보도자료 (source:news:mohw)

**키워드 (31개)**:
```
바이오, 생명공학, 생명과학, 제약, 의약품, 바이오의약품, 백신, 의료기기, 의료기술, 헬스케어,
디지털헬스, R&D, 연구개발, 연구, 개발, 임상, 임상시험, 기술, 혁신, 첨단,
신약, 산업, 기업, 육성, 지원사업, 투자, 데이터, AI, 인공지능, 디지털
```

#### 7. 교육/행사 (source:jbtp:events)

**키워드 (3개)**:
```
전북, 바이오, AI
```

#### 8. 전북 BI센터 (source:binet:063)

**키워드**: 없음 (키워드 필터링 미사용)

#### 확인 방법
- 데이터베이스 직접 조회: `SELECT source_id, keywords FROM crawler_config`
- API 호출: `GET /api/crawling/configs/{source_id}`

---

## 디렉토리 구조

### 프론트엔드

```
frontend-admin/src/
├── routes/notices/
│   ├── ntis/+page.svelte          # 정부 공고 (NTIS)
│   ├── jbtp/+page.svelte          # 지자체 사업공고
│   ├── external/+page.svelte      # 유관기관 공고
│   ├── business/+page.svelte      # 기업 지원사업
│   ├── mfds/+page.svelte          # 식약처 뉴스
│   ├── mohw/+page.svelte          # 복지부 뉴스
│   ├── events/+page.svelte        # 바이오행사
│   ├── rnd/+page.svelte           # R&D (조회 전용)
│   ├── startup/+page.svelte       # 창업보육센터
│   ├── latest/+page.svelte        # 최신공고 모아보기
│   └── government/+page.svelte    # 리디렉션 페이지
├── lib/
│   ├── components/
│   │   ├── crawling/
│   │   │   ├── CrawlingStatus.svelte
│   │   │   └── CrawlerConfigInline.svelte
│   │   └── notices/
│   │       ├── CrawlQueueTable.svelte
│   │       ├── PublishedNoticesList.svelte
│   │       ├── ExternalNoticeQueueTable.svelte
│   │       ├── NoticeCard.svelte
│   │       ├── NoticePreviewModal.svelte
│   │       └── AddNoticeModal.svelte
│   ├── constants/
│   │   └── sources.ts
│   ├── composables/
│   │   ├── useCrawlWebSocket.svelte
│   │   └── useSelection.svelte
│   └── api/
│       ├── crawl-queue.ts
│       └── notices.ts
```

### 백엔드

```
backend/src/
├── services/sources/
│   ├── _base.py                   # BaseAdapter
│   ├── _manager.py                # CrawlerManager
│   ├── government_ntis.py
│   ├── government_bizinfo.py
│   ├── government_mfds.py
│   ├── government_mohw.py
│   ├── government_bi_center.py
│   ├── jbtp_base.py
│   ├── jbtp_local.py
│   ├── jbtp_external.py
│   ├── jbtp_events.py
│   ├── services/
│   │   └── keyword_service.py
│   └── repositories/
│       ├── config_repository.py
│       └── crawl_queue_repository.py
├── models/
│   └── crawler_config.py
└── constants/
    └── sources.py
```

---

## 요약

### 크롤링 페이지 (8개)

| 번호 | 페이지명 | 소스 ID | 타입 | 주요 기능 |
|-----|---------|---------|------|----------|
| 1 | 정부 공고 (NTIS) | source:ntis:rss | RSS | 국가R&D 공고 수집 |
| 2 | 지자체 사업공고 | source:jbtp:local | 웹 | JBTP 사업공고 수집 |
| 3 | 유관기관 공고 | source:jbtp:external | 웹 | JBTP 유관기관 공고 수집 |
| 4 | 기업 지원사업 | source:bizinfo:web | API | 기업마당 API 데이터 수집 |
| 5 | 식약처 뉴스 | source:news:mfds | RSS | 식약처 보도자료 수집 |
| 6 | 복지부 뉴스 | source:news:mohw | RSS | 복지부 보도자료 수집 |
| 7 | 바이오행사 | source:jbtp:events | 웹 | JBTP 행사 정보 수집 |
| 8 | 창업보육센터 (BI) | bi_center | 웹 | BI 센터 및 입주기업 정보 수집 |

### 조회 전용 페이지 (2개)

| 번호 | 페이지명 | 데이터 소스 | 표시 개수 |
|-----|---------|------------|----------|
| 9 | 연구개발 (R&D) | R&D 태그 필터링 | 15개 |
| 10 | 최신공고 모아보기 | 전체 소스 최신순 | 15개 |

### 핵심 기능

- 실시간 크롤링 (WebSocket)
- 키워드 필터링 (동적 관리)
- 2단계 처리 (수집 → 상세 정보)
- 대기열 관리 (선택, 게시, 삭제)
- 중복 감지
- 마감일 추적 (D-day)
- 통합 설정 관리 (CrawlerConfigInline)
- 수동 공고 추가

---

## 크롤러별 키워드 요약 테이블

| 크롤러 | 소스 ID | 키워드 개수 | 주요 키워드 |
|--------|---------|------------|------------|
| NTIS 국가R&D | source:ntis:rss | 134개 | 바이오, 생명, 의료, 제약, 헬스케어, 임상, 진단, R&D, 연구개발, 전북 |
| 사업공고 | source:jbtp:local | 41개 | 바이오, 제약, 의료기기, 스타트업, 창업, 농생명, AI, 디지털헬스 |
| 유관기관공고 | source:jbtp:external | 34개 | 바이오, 제약, 의료기기, 농생명, AI, 디지털헬스, 반도체, 이차전지 |
| 기업마당 | source:bizinfo:web | 2개 | 전북, 전북특별자치도 |
| 식약처 뉴스 | source:news:mfds | 7개 | 바이오, 의약품, 생물학적제제, 임상시험, 허가, 승인 |
| 복지부 뉴스 | source:news:mohw | 31개 | 바이오, 제약, 의약품, 백신, 의료기기, R&D, AI, 디지털헬스 |
| 교육/행사 | source:jbtp:events | 3개 | 전북, 바이오, AI |
| BI센터 | source:binet:063 | 0개 | 키워드 필터링 미사용 |

---

문서 작성일: 2025년 11월 18일
키워드 설정 기준일: 2025년 11월 18일 (데이터베이스 실제 데이터)
