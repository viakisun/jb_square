"""
Migration: Add suggested_tags column to notice_crawl_queue table

This migration adds a JSON column to store auto-suggested tags based on matched keywords.
"""
from sqlalchemy import text
import sys
import os

# Add parent directory to path to import from src
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.core.database import engine


def upgrade():
    """Add suggested_tags column to notice_crawl_queue table"""
    print("Starting migration: add suggested_tags column...")

    with engine.connect() as conn:
        # Add suggested_tags column
        print("  - Adding suggested_tags JSON column...")
        conn.execute(text("""
            ALTER TABLE notice_crawl_queue
            ADD COLUMN IF NOT EXISTS suggested_tags JSON DEFAULT '[]';
        """))

        conn.commit()
        print("✓ Migration completed successfully!")


def downgrade():
    """Remove suggested_tags column from notice_crawl_queue table"""
    print("Rolling back migration: remove suggested_tags column...")

    with engine.connect() as conn:
        print("  - Dropping suggested_tags column...")
        conn.execute(text("ALTER TABLE notice_crawl_queue DROP COLUMN IF EXISTS suggested_tags;"))

        conn.commit()
        print("✓ Migration rolled back successfully!")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Add suggested_tags column migration')
    parser.add_argument('--downgrade', action='store_true',
                       help='Rollback the migration')

    args = parser.parse_args()

    if args.downgrade:
        downgrade()
    else:
        upgrade()
