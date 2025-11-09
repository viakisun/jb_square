"""
Run migration 021: Remove category and rename sources
"""
from src.core.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

print("=== Running Migration 021 ===\n")

try:
    # Step 1: Drop category-related constraints and indexes
    print("Step 1: Dropping category constraints and indexes...")

    db.execute(text("DROP INDEX IF EXISTS idx_support_notices_category"))
    db.commit()
    print("  ✓ Dropped idx_support_notices_category")

    db.execute(text("DROP INDEX IF EXISTS idx_notices_source_category"))
    db.commit()
    print("  ✓ Dropped idx_notices_source_category")

    db.execute(text("ALTER TABLE support_notices DROP CONSTRAINT IF EXISTS check_category"))
    db.commit()
    print("  ✓ Dropped check_category constraint")

    # Step 2: Update crawler_source_id values
    print("\nStep 2: Updating crawler_source_id values...")

    result = db.execute(text("UPDATE support_notices SET crawler_source_id = 'source:jbtp:local' WHERE crawler_source_id = 'jbtp'"))
    db.commit()
    print(f"  ✓ Updated {result.rowcount} rows: jbtp → source:jbtp:local")

    result = db.execute(text("UPDATE support_notices SET crawler_source_id = 'source:jbtp:external' WHERE crawler_source_id = 'jbtp_external'"))
    db.commit()
    print(f"  ✓ Updated {result.rowcount} rows: jbtp_external → source:jbtp:external")

    result = db.execute(text("UPDATE support_notices SET crawler_source_id = 'source:ntis:rss' WHERE crawler_source_id = 'ntis_rss'"))
    db.commit()
    print(f"  ✓ Updated {result.rowcount} rows: ntis_rss → source:ntis:rss")

    result = db.execute(text("UPDATE support_notices SET crawler_source_id = 'source:bizinfo:api' WHERE crawler_source_id = 'bizinfo'"))
    db.commit()
    print(f"  ✓ Updated {result.rowcount} rows: bizinfo → source:bizinfo:api")

    # Step 3: Remove category column
    print("\nStep 3: Removing category column...")
    db.execute(text("ALTER TABLE support_notices DROP COLUMN IF EXISTS category"))
    db.commit()
    print("  ✓ Dropped category column")

    # Step 4: Update crawler_configs if exists
    print("\nStep 4: Updating crawler_configs...")

    result = db.execute(text("UPDATE crawler_configs SET source_id = 'source:jbtp:local' WHERE source_id = 'jbtp'"))
    db.commit()
    print(f"  ✓ Updated {result.rowcount} config rows: jbtp")

    result = db.execute(text("UPDATE crawler_configs SET source_id = 'source:jbtp:external' WHERE source_id = 'jbtp_external'"))
    db.commit()
    print(f"  ✓ Updated {result.rowcount} config rows: jbtp_external")

    result = db.execute(text("UPDATE crawler_configs SET source_id = 'source:ntis:rss' WHERE source_id = 'ntis_rss'"))
    db.commit()
    print(f"  ✓ Updated {result.rowcount} config rows: ntis_rss")

    result = db.execute(text("UPDATE crawler_configs SET source_id = 'source:bizinfo:api' WHERE source_id = 'bizinfo'"))
    db.commit()
    print(f"  ✓ Updated {result.rowcount} config rows: bizinfo")

    # Verification
    print("\n=== Verification ===")
    result = db.execute(text("SELECT crawler_source_id, COUNT(*) FROM support_notices GROUP BY crawler_source_id"))
    print("\nSource distribution:")
    for row in result.fetchall():
        print(f"  {row[0]}: {row[1]} notices")

    print("\n✅ Migration 021 completed successfully!")

except Exception as e:
    db.rollback()
    print(f"\n❌ Migration failed: {str(e)}")
    raise
finally:
    db.close()
