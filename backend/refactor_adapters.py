"""
Adapter 리팩토링 스크립트
모든 Crawler → Adapter 변환을 자동화
"""

import re
from pathlib import Path

# 변경할 파일들의 경로
BASE_DIR = Path(__file__).parent / "src/services/sources"

# 파일별 클래스명 매핑
CLASS_MAPPINGS = {
    "_base.py": [
        ("class BaseCrawler", "class BaseAdapter"),
    ],
    "jbtp_local.py": [
        ("from .base_crawler import", "from ._base import"),
        ("class JBTPCrawler", "class JBTPLocalAdapter"),
        ("BaseCrawler", "BaseAdapter"),
    ],
    "jbtp_external.py": [
        ("from .base_crawler import", "from ._base import"),
        ("class JBTPExternalCrawler", "class JBTPExternalAdapter"),
        ("BaseCrawler", "BaseAdapter"),
    ],
    "jbtp_events.py": [
        ("from .base_crawler import", "from ._base import"),
        ("class JBTPEventsCrawler", "class JBTPEventsAdapter"),
        ("BaseCrawler", "BaseAdapter"),
    ],
    "government_ntis.py": [
        ("from .base_crawler import", "from ._base import"),
        ("class NTISCrawler", "class GovernmentNTISAdapter"),
        ("BaseCrawler", "BaseAdapter"),
    ],
    "government_bizinfo.py": [
        ("from .base_crawler import", "from ._base import"),
        ("class BizinfoCrawler", "class GovernmentBizinfoAdapter"),
        ("BaseCrawler", "BaseAdapter"),
    ],
    "government_bi_center.py": [
        ("from .base_crawler import", "from ._base import"),
        ("class BICenterCrawler", "class GovernmentBiCenterAdapter"),
        ("BaseCrawler", "BaseAdapter"),
    ],
    "government_mfds.py": [
        ("from .base_crawler import", "from ._base import"),
        ("class MFDSNewsCrawler", "class GovernmentMFDSAdapter"),
        ("BaseCrawler", "BaseAdapter"),
    ],
    "government_mohw.py": [
        ("from .base_crawler import", "from ._base import"),
        ("class MOHWNewsCrawler", "class GovernmentMOHWAdapter"),
        ("BaseCrawler", "BaseAdapter"),
    ],
    "_manager.py": [
        ("from src.services.crawlers import", "from src.services.sources import"),
        ("class CrawlerManager", "class SourceManager"),
        ("BICenterCrawler", "GovernmentBiCenterAdapter"),
        ("BizinfoCrawler", "GovernmentBizinfoAdapter"),
        ("JBTPCrawler", "JBTPLocalAdapter"),
        ("JBTPExternalCrawler", "JBTPExternalAdapter"),
        ("JBTPEventsCrawler", "JBTPEventsAdapter"),
        ("NTISCrawler", "GovernmentNTISAdapter"),
        ("MFDSNewsCrawler", "GovernmentMFDSAdapter"),
        ("MOHWNewsCrawler", "GovernmentMOHWAdapter"),
    ],
}

# Helper files 매핑
HELPER_MAPPINGS = {
    "helpers/bizinfo/bizinfo_detail_processor.py": [
        ("from ..base_crawler import", "from ..._base import"),
    ],
    "helpers/bizinfo/bizinfo_list_collector.py": [
        ("from ..base_crawler import", "from ..._base import"),
    ],
}

# Strategies 매핑
STRATEGY_MAPPINGS = {
    "strategies/jbtp_extraction.py": [],
    "strategies/bizinfo_extraction.py": [],
}


def update_file(file_path: Path, replacements: list):
    """파일의 내용을 일괄 변경"""
    if not file_path.exists():
        print(f"⚠️  {file_path.name} not found, skipping")
        return

    content = file_path.read_text(encoding='utf-8')
    original_content = content

    for old, new in replacements:
        content = content.replace(old, new)

    if content != original_content:
        file_path.write_text(content, encoding='utf-8')
        print(f"✅ {file_path.name} updated")
        return True
    else:
        print(f"⏭️  {file_path.name} no changes needed")
        return False


def main():
    print("="*80)
    print("Adapter 리팩토링 시작")
    print("="*80 + "\n")

    updated_count = 0

    # Main adapter files
    print("📝 Main Adapters:")
    for filename, replacements in CLASS_MAPPINGS.items():
        file_path = BASE_DIR / filename
        if update_file(file_path, replacements):
            updated_count += 1

    # Helper files
    print("\n📝 Helper Files:")
    for filename, replacements in HELPER_MAPPINGS.items():
        file_path = BASE_DIR / filename
        if update_file(file_path, replacements):
            updated_count += 1

    print(f"\n{'='*80}")
    print(f"완료: {updated_count}개 파일 업데이트됨")
    print("="*80)


if __name__ == "__main__":
    main()
