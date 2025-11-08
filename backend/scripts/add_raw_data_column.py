"""
Migration: Add raw_data column to support_notices table

This migration adds a JSONB column to store the full crawled data
from the notice_crawl_queue, preserving all details for the preview modal.
"""
from sqlalchemy import text
import sys
import os

# Add parent directory to path to import from src
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.core.database import engine


def upgrade():
    """Add raw_data column to support_notices table"""
    print("Starting migration: add raw_data column...")

    with engine.connect() as conn:
        # Add raw_data column
        print("  - Adding raw_data JSONB column...")
        conn.execute(text("""
            ALTER TABLE support_notices
            ADD COLUMN IF NOT EXISTS raw_data JSONB;
        """))

        # Add GIN index for efficient JSONB queries
        print("  - Creating GIN index on raw_data...")
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_support_notices_raw_data
            ON support_notices USING GIN (raw_data);
        """))

        conn.commit()
        print("✓ Migration completed successfully!")


def downgrade():
    """Remove raw_data column from support_notices table"""
    print("Rolling back migration: remove raw_data column...")

    with engine.connect() as conn:
        print("  - Dropping GIN index...")
        conn.execute(text("DROP INDEX IF EXISTS idx_support_notices_raw_data;"))

        print("  - Dropping raw_data column...")
        conn.execute(text("ALTER TABLE support_notices DROP COLUMN IF EXISTS raw_data;"))

        conn.commit()
        print("✓ Migration rolled back successfully!")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Add raw_data column migration')
    parser.add_argument('--downgrade', action='store_true',
                       help='Rollback the migration')

    args = parser.parse_args()

    if args.downgrade:
        downgrade()
    else:
        upgrade()
