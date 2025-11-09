"""
Verify the BI Company table structure and sample data
"""
from src.core.database import SessionLocal
from sqlalchemy import text, inspect

db = SessionLocal()

print("=== Database Table Structure Verification ===\n")

# Get table columns
inspector = inspect(db.bind)
columns = inspector.get_columns('bi_companies')

print("bi_companies table columns:")
for col in columns:
    print(f"  - {col['name']}: {col['type']}")

print("\n=== Checking for removed columns ===")
column_names = [col['name'] for col in columns]
if 'entry_date' in column_names:
    print("❌ ERROR: entry_date column still exists!")
else:
    print("✓ entry_date column successfully removed")

if 'status' in column_names:
    print("❌ ERROR: status column still exists!")
else:
    print("✓ status column successfully removed")

# Check if there's any data
result = db.execute(text("SELECT COUNT(*) FROM bi_companies"))
count = result.scalar()
print(f"\n=== Data Status ===")
print(f"Total companies in database: {count}")

if count > 0:
    print("\n=== Sample Data (first 3 records) ===")
    result = db.execute(text("""
        SELECT
            id,
            center_id,
            company_name,
            business_field,
            product
        FROM bi_companies
        LIMIT 3
    """))

    for i, row in enumerate(result.fetchall()):
        print(f"\n[{i+1}]")
        print(f"  ID: {row[0]}")
        print(f"  Center ID: {row[1]}")
        print(f"  Company Name: {row[2]}")
        print(f"  Business Field: {row[3]}")
        print(f"  Product: {row[4]}")
else:
    print("No data yet - ready for crawling")

db.close()
