"""
Fix remaining crawler_configs source IDs

Updates any old source_id values in crawler_configs to the new naming convention.
"""

import sys
import os
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database import SessionLocal
from src.constants.sources import NoticeSource

def fix_crawler_configs():
    """Update crawler_configs source IDs to new naming convention"""
    print("=" * 70)
    print("FIXING CRAWLER_CONFIGS SOURCE IDs")
    print("=" * 70)
    print()

    db = SessionLocal()

    try:
        # Check current state
        print("Current crawler_configs source_ids:")
        print("-" * 70)
        result = db.execute(text("""
            SELECT source_id, enabled
            FROM crawler_configs
            ORDER BY source_id
        """))

        for row in result:
            print(f"  - {row[0]} (enabled: {row[1]})")
        print()

        # Update ntis → source:ntis:rss
        print("Updating 'ntis' → 'source:ntis:rss'...")
        result = db.execute(text("""
            UPDATE crawler_configs
            SET source_id = 'source:ntis:rss'
            WHERE source_id = 'ntis'
        """))
        db.commit()
        print(f"✅ Updated {result.rowcount} row(s)")
        print()

        # Verify final state
        print("Final crawler_configs source_ids:")
        print("-" * 70)
        result = db.execute(text("""
            SELECT source_id, enabled
            FROM crawler_configs
            ORDER BY source_id
        """))

        valid_sources = [s.value for s in NoticeSource]
        all_valid = True

        for row in result:
            source_id = row[0]
            status = "✅" if source_id in valid_sources else "❌"
            print(f"  {status} {source_id} (enabled: {row[1]})")

            if source_id not in valid_sources:
                all_valid = False

        print()

        if all_valid:
            print("=" * 70)
            print("✅ SUCCESS: All crawler_configs source_ids are valid!")
            print("=" * 70)
            return True
        else:
            print("=" * 70)
            print("❌ FAIL: Some source_ids are still invalid")
            print("=" * 70)
            return False

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        db.rollback()
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = fix_crawler_configs()
    sys.exit(0 if success else 1)
