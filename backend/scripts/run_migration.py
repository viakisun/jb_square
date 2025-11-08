"""
Run SQL migration file
"""
import sys
from pathlib import Path
from sqlalchemy import text

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.database import engine

migration_file = Path(__file__).parent.parent / "migrations" / "019_add_content_type_and_viewer_url.sql"

with open(migration_file, 'r') as f:
    sql = f.read()

with engine.connect() as conn:
    # Execute SQL statements
    for statement in sql.split(';'):
        statement = statement.strip()
        if statement and not statement.startswith('--') and not statement.startswith('COMMENT'):
            try:
                conn.execute(text(statement))
                conn.commit()
                print(f"✓ Executed: {statement[:50]}...")
            except Exception as e:
                print(f"✗ Error: {e}")
                print(f"  Statement: {statement[:100]}")
                raise

print("\n✅ Migration completed successfully!")
