# Crawler Module Refactoring

## 완료된 작업 (Phase 1)

### 1. Service Layer 생성
**새 파일:**
- `services/__init__.py`
- `services/event_service.py` - WebSocket 이벤트 전송 중앙화
- `services/keyword_service.py` - 키워드 매칭 로직 중앙화

**제거된 중복:**
- `send_event()` 메서드 중복 (crawler_manager.py, base_crawler.py)
- `match_keywords()` 메서드 중복 (crawler_manager.py, base_crawler.py, crawler_utils.py)

### 2. Repository Layer 생성
**새 파일:**
- `repositories/__init__.py`
- `repositories/config_repository.py` - 설정 로딩 중앙화
- `repositories/crawl_queue_repository.py` - CrawlQueue 데이터베이스 작업 중앙화

**제거될 중복:**
- `_load_jbtp_configs()`, `_load_jbtp_external_configs()`, `_load_binet_configs()` (crawler_manager.py 및 각 crawler)
- `save_results()`, `_save_single_notice()` (crawler_manager.py, base_crawler.py, 각 crawler)

## 사용 방법

### EventService 사용
```python
from src.services.crawlers.services import EventService

# 이벤트 전송
await EventService.send_start(callback, source_id, "크롤링 시작...")
await EventService.send_progress(callback, source_id, 10, 100)
await EventService.send_log(callback, source_id, "로그 메시지")
await EventService.send_complete(callback, source_id, "완료", total=100)
await EventService.send_error(callback, source_id, "에러 발생")
```

### KeywordService 사용
```python
from src.services.crawlers.services import KeywordService

# 키워드 매칭
matched = KeywordService.match_keywords("바이오 기술 개발", ["바이오", "AI"])
# Returns: ["바이오"]

# 키워드 포함 여부
has_keyword = KeywordService.has_any_keyword("텍스트", ["키워드1", "키워드2"])

# 항목 필터링
filtered = KeywordService.filter_by_keywords(items, keywords, text_field='title')
```

### ConfigRepository 사용
```python
from src.services.crawlers.repositories import ConfigRepository

# JBTP 설정 로드
configs = ConfigRepository.load_jbtp_configs('notices')
# Returns: [(name, board_url, keywords, date_range_days), ...]

# 외부 공고 설정
external_configs = ConfigRepository.load_jbtp_external_configs()

# BI Center 설정
binet_configs = ConfigRepository.load_binet_configs()
# Returns: [(region_name, region_code), ...]

# NTIS 설정
ntis_config = ConfigRepository.load_ntis_config()
keywords = ConfigRepository.get_keywords('ntis')
days = ConfigRepository.get_date_range_days('ntis')
```

### CrawlQueueRepository 사용
```python
from src.services.crawlers.repositories import CrawlQueueRepository

# 결과 저장 (키워드 필터링 포함)
stats = CrawlQueueRepository.save_results(
    notices=notices,
    keywords=keywords,
    source_id=self.source_id
)
# Returns: {'added': 10, 'updated': 5, 'skipped_rejected': 2, 'skipped_filtered': 3}

# 기존 항목 찾기
existing = CrawlQueueRepository.find_existing(source_id, title)

# 거부 여부 확인
is_rejected = CrawlQueueRepository.is_rejected(existing)
```

## 다음 단계 (Phase 2)

### 3. JBTP Extraction Strategy 생성
**생성할 파일:**
- `strategies/__init__.py`
- `strategies/jbtp_extraction_strategy.py`

**제거할 중복 (450 lines):**
- `_extract_jbtp_meta_info()` (crawler_manager.py:449-494, jbtp_crawler.py, jbtp_external_crawler.py)
- `_extract_jbtp_attachments()` (crawler_manager.py:496-533, jbtp_crawler.py, jbtp_external_crawler.py)
- `_extract_jbtp_content_viewer()` (crawler_manager.py:535-555, jbtp_crawler.py, jbtp_external_crawler.py)
- `_fetch_jbtp_detail()` (crawler_manager.py:557-594, jbtp_crawler.py, jbtp_external_crawler.py)

### 4. 기존 파일 리팩토링
**업데이트할 파일:**
- `base_crawler.py` - EventService, KeywordService, CrawlQueueRepository 사용
- `crawler_manager.py` - 모든 중복 코드 제거, 새 서비스/레포지토리 사용
- `jbtp_crawler.py` - ConfigRepository, CrawlQueueRepository, JBTPExtractionStrategy 사용
- `jbtp_external_crawler.py` - 위와 동일
- `ntis_crawler.py` - ConfigRepository, CrawlQueueRepository 사용
- `bizinfo_crawler.py` - ConfigRepository, CrawlQueueRepository 사용
- `bi_center_crawler.py` - ConfigRepository 사용

## 예상 효과

### 코드 감소량:
- **현재:** ~3,700 lines
- **목표:** ~2,100 lines
- **감소:** ~1,600 lines (43%)

### 중복 코드 제거:
- EventService: 3개 파일에서 중복 제거
- KeywordService: 3개 파일에서 중복 제거
- ConfigRepository: 6개 파일에서 중복 제거
- CrawlQueueRepository: 4개 파일에서 중복 제거
- JBTP Extraction (예정): 3개 파일에서 450 lines 제거

### 유지보수성 향상:
- 단일 소스 원칙 (Single Source of Truth)
- 명확한 책임 분리 (Separation of Concerns)
- 재사용 가능한 컴포넌트
- 테스트 용이성 증가
