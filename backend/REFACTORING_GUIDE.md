# Crawler Manager 리팩토링 가이드

## 개요

`crawler_manager.py` (2416줄)를 모듈화된 구조로 리팩토링하는 가이드입니다.

## 현재 문제점

1. **단일 파일 2416줄** - 유지보수 어려움
2. **중복 코드** - 각 크롤러마다 반복되는 로직
3. **낮은 테스트 용이성** - 단위 테스트 작성 어려움
4. **확장성 부족** - 새 크롤러 추가 시 여러 곳 수정 필요

## 새로운 구조

```
backend/src/services/
├── crawler_manager.py          # 메인 매니저 (~200줄)
├── crawlers/
│   ├── __init__.py
│   ├── base_crawler.py         # 추상 클래스
│   ├── jbtp_crawler.py         # JBTP 크롤러
│   ├── ntis_crawler.py         # NTIS 크롤러
│   ├── bizinfo_crawler.py      # BIZINFO 크롤러
│   └── bi_center_crawler.py    # BI Center 크롤러
└── utils/
    ├── __init__.py
    └── crawler_utils.py        # 공통 유틸리티
```

## 완료된 작업

✅ **1. 디렉토리 구조 생성**
- `services/crawlers/` - 크롤러 클래스들
- `services/utils/` - 공통 유틸리티

✅ **2. 유틸리티 모듈 (`utils/crawler_utils.py`)**
```python
- match_keywords()      # 키워드 매칭
- parse_date()          # 날짜 파싱
- truncate_text()       # 텍스트 자르기
- clean_html_text()     # HTML 정제
```

✅ **3. BaseCrawler 추상 클래스 (`crawlers/base_crawler.py`)**
```python
class BaseCrawler(ABC):
    - get_status()          # 상태 조회
    - stop()                # 중단
    - reset_status()        # 상태 초기화
    - send_event()          # WebSocket 이벤트 전송
    - get_keywords()        # DB에서 키워드 로드
    - match_keywords()      # 키워드 매칭
    - parse_date()          # 날짜 파싱
    - execute()             # 추상 메서드 (하위 클래스 구현)
    - run()                 # 실행 래퍼 (에러 처리)
```

## 다음 단계 (점진적 리팩토링)

### Phase 1: 간단한 크롤러부터 분리

**1. BI Center 크롤러 분리** (가장 단순)
```python
# services/crawlers/bi_center_crawler.py
from .base_crawler import BaseCrawler

class BICenterCrawler(BaseCrawler):
    def __init__(self):
        super().__init__("bi_center")

    async def execute(self, callback=None):
        # execute_bi_center() 로직 이동
        pass
```

**2. CrawlerManager 업데이트**
```python
from .crawlers.bi_center_crawler import BICenterCrawler

class CrawlerManager:
    def __init__(self):
        self.crawlers = {
            "bi_center": BICenterCrawler(),
            # 기존 크롤러들은 그대로 유지
        }

    async def execute_bi_center(self, callback=None):
        return await self.crawlers["bi_center"].run(callback)
```

### Phase 2: 복잡한 크롤러 분리

**3. JBTP 크롤러 분리**
- `execute_jbtp()` → `JBTPCrawler`
- `_parse_jbtp_data()` → 내부 메서드로 이동
- `_load_jbtp_configs()` → 생성자에서 로드

**4. NTIS 크롤러 분리**
- `execute_ntis()` → `NTISCrawler`
- 중첩 함수들 (`get_xml_text`, `parse_project_hit`) → 클래스 메서드로

**5. BIZINFO 크롤러 분리**
- `execute_bizinfo()` → `BizinfoCrawler`

### Phase 3: CrawlerManager 완전히 간소화

```python
class CrawlerManager:
    """크롤러 인스턴스 관리 및 라우팅"""

    def __init__(self):
        self.crawlers = {
            "jbtp": JBTPCrawler(),
            "jbtp_external": JBTPExternalCrawler(),
            "ntis": NTISCrawler(),
            "bizinfo": BizinfoCrawler(),
            "bi_center": BICenterCrawler(),
        }

    def get_status(self, source_id: str) -> dict:
        return self.crawlers[source_id].get_status()

    def get_all_status(self) -> dict:
        return {
            source_id: crawler.get_status()
            for source_id, crawler in self.crawlers.items()
        }

    def stop_crawler(self, source_id: str):
        self.crawlers[source_id].stop()

    async def execute_jbtp(self, callback=None):
        return await self.crawlers["jbtp"].run(callback)

    # 나머지 execute 메서드들도 동일한 패턴
```

## 리팩토링 예시

### Before (기존 코드)
```python
class CrawlerManager:
    def __init__(self):
        self.crawlers_status = {
            "jbtp": {...},
            "ntis": {...},
            # 각 크롤러마다 반복
        }

    async def execute_jbtp(self, callback=None):
        # 600줄의 복잡한 로직
        source_id = "jbtp"
        self._reset_status(source_id)
        # ... 수백 줄의 코드
```

### After (리팩토링 후)
```python
class JBTPCrawler(BaseCrawler):
    def __init__(self):
        super().__init__("jbtp")

    async def execute(self, callback=None):
        # 깔끔하게 분리된 로직
        configs = self.load_configs()
        notices = await self.crawl_notices(configs)
        await self.save_notices(notices)

class CrawlerManager:
    def __init__(self):
        self.crawlers = {
            "jbtp": JBTPCrawler(),
        }

    async def execute_jbtp(self, callback=None):
        return await self.crawlers["jbtp"].run(callback)
```

## 이점

1. **가독성** - 각 크롤러가 독립 파일로 분리
2. **유지보수** - 크롤러별 수정이 쉬움
3. **테스트** - 각 크롤러를 독립적으로 테스트 가능
4. **확장성** - 새 크롤러 추가가 간단
5. **재사용** - BaseCrawler의 공통 로직 재사용

## 권장 작업 순서

1. ✅ 기본 구조 생성 (완료)
2. ⏳ 가장 단순한 크롤러 1개 분리 (BI Center)
3. ⏳ CrawlerManager 테스트
4. ⏳ 나머지 크롤러 순차적으로 분리
5. ⏳ 기존 `execute_*` 메서드들을 새 구조로 교체
6. ⏳ 최종 테스트 및 배포

## 주의사항

- **점진적 리팩토링**: 한 번에 모든 크롤러를 바꾸지 말고 하나씩
- **테스트**: 각 단계마다 기존 기능이 정상 작동하는지 확인
- **호환성**: 기존 API 엔드포인트는 그대로 유지
- **백업**: 작업 전 `crawler_manager.py.bak` 백업 유지

## 다음 작업

가장 간단한 크롤러(BI Center 또는 BIZINFO)를 먼저 분리하여 패턴을 확립하는 것을 권장합니다.

```bash
# 다음 명령으로 시작
# 1. BI Center 크롤러 분리
# 2. 테스트
# 3. 나머지 크롤러 순차 적용
```
