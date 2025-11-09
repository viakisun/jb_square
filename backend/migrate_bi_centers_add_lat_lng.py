"""
Database migration script to add latitude and longitude columns to bi_centers table
"""

from sqlalchemy import text
from src.core.database import engine

def migrate():
    """Add latitude and longitude columns to bi_centers"""

    with engine.connect() as conn:
        print("Starting migration...")

        # Add latitude column
        try:
            conn.execute(text('ALTER TABLE bi_centers ADD COLUMN latitude DECIMAL(10, 7)'))
            print('✓ Added latitude column')
        except Exception as e:
            if 'already exists' in str(e):
                print('  latitude column already exists')
            else:
                print(f'  Error adding latitude: {e}')

        # Add longitude column
        try:
            conn.execute(text('ALTER TABLE bi_centers ADD COLUMN longitude DECIMAL(10, 7)'))
            print('✓ Added longitude column')
        except Exception as e:
            if 'already exists' in str(e):
                print('  longitude column already exists')
            else:
                print(f'  Error adding longitude: {e}')

        # Commit column additions
        conn.commit()

        # Migrate existing data: location -> latitude
        try:
            result = conn.execute(text('''
                UPDATE bi_centers
                SET latitude = CAST(location AS DECIMAL(10, 7))
                WHERE location IS NOT NULL
                  AND location != ''
                  AND location ~ '^[0-9.]+$'
                  AND latitude IS NULL
            '''))
            conn.commit()
            print(f'✓ Migrated {result.rowcount} rows of existing location data to latitude')
        except Exception as e:
            print(f'  Error migrating data: {e}')
            conn.rollback()

    print("\nMigration completed!")
    print("Note: longitude values need to be populated by re-running the crawler")

if __name__ == '__main__':
    migrate()
