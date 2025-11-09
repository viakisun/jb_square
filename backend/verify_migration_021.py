"""
Database Migration 021 Verification Script

Verifies that the category removal and source ID renaming migration
was completed successfully.

Checks:
1. Category column no longer exists
2. All source IDs follow the new naming convention
3. No orphaned or invalid source IDs
4. crawler_configs table is properly updated
"""

import sys
import os
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import Session

# Add backend src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database import SessionLocal
from src.constants.sources import NoticeSource

def verify_migration():
    """Run all verification checks"""
    print("=" * 70)
    print("DATABASE MIGRATION 021 VERIFICATION")
    print("=" * 70)
    print()

    db = SessionLocal()

    try:
        # Check 1: Verify category column is removed
        print("CHECK 1: Category column existence")
        print("-" * 70)

        result = db.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'support_notices'
            AND column_name = 'category'
        """))

        if result.fetchone():
            print("❌ FAIL: Category column still exists!")
            return False
        else:
            print("✅ PASS: Category column successfully removed")
        print()

        # Check 2: Verify all source IDs follow new naming convention
        print("CHECK 2: Source ID naming convention")
        print("-" * 70)

        valid_sources = [s.value for s in NoticeSource]
        print(f"Valid sources: {valid_sources}")
        print()

        result = db.execute(text("""
            SELECT DISTINCT crawler_source_id, COUNT(*) as count
            FROM support_notices
            WHERE crawler_source_id IS NOT NULL
            GROUP BY crawler_source_id
            ORDER BY crawler_source_id
        """))

        invalid_sources = []
        for row in result:
            source_id, count = row
            status = "✅" if source_id in valid_sources else "❌"
            print(f"{status} {source_id}: {count} notices")

            if source_id not in valid_sources:
                invalid_sources.append(source_id)

        if invalid_sources:
            print()
            print(f"❌ FAIL: Found {len(invalid_sources)} invalid source IDs: {invalid_sources}")
            return False
        else:
            print()
            print("✅ PASS: All source IDs follow the new naming convention")
        print()

        # Check 3: Verify crawler_configs table
        print("CHECK 3: crawler_configs table source IDs")
        print("-" * 70)

        result = db.execute(text("""
            SELECT DISTINCT source_id
            FROM crawler_configs
            WHERE source_id IS NOT NULL
            ORDER BY source_id
        """))

        config_invalid = []
        for row in result:
            source_id = row[0]
            status = "✅" if source_id in valid_sources else "❌"
            print(f"{status} {source_id}")

            if source_id not in valid_sources:
                config_invalid.append(source_id)

        if config_invalid:
            print()
            print(f"❌ FAIL: Found {len(config_invalid)} invalid source IDs in crawler_configs: {config_invalid}")
            return False
        else:
            print()
            print("✅ PASS: All crawler_configs source IDs are valid")
        print()

        # Check 4: Verify category-related indexes are removed
        print("CHECK 4: Category-related indexes")
        print("-" * 70)

        result = db.execute(text("""
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'support_notices'
            AND (indexname LIKE '%category%')
        """))

        category_indexes = [row[0] for row in result]
        if category_indexes:
            print(f"❌ FAIL: Category indexes still exist: {category_indexes}")
            return False
        else:
            print("✅ PASS: All category-related indexes removed")
        print()

        # Check 5: Verify category constraint is removed
        print("CHECK 5: Category constraint")
        print("-" * 70)

        result = db.execute(text("""
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = 'support_notices'
            AND constraint_name LIKE '%category%'
        """))

        category_constraints = [row[0] for row in result]
        if category_constraints:
            print(f"❌ FAIL: Category constraints still exist: {category_constraints}")
            return False
        else:
            print("✅ PASS: All category-related constraints removed")
        print()

        # Summary
        print("=" * 70)
        print("✅ ALL CHECKS PASSED - Migration 021 completed successfully!")
        print("=" * 70)
        return True

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = verify_migration()
    sys.exit(0 if success else 1)
