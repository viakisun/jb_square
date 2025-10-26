-- Migration: Create BI Centers and Companies tables
-- Description: Tables for startup incubator centers and tenant companies

-- Create bi_centers table
CREATE TABLE IF NOT EXISTS bi_centers (
    id SERIAL PRIMARY KEY,
    region VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    org_name VARCHAR(200) NOT NULL,
    center_name VARCHAR(200) NOT NULL,
    contact VARCHAR(200),
    specialization TEXT,
    vacant_rooms VARCHAR(50),
    location VARCHAR(500),
    center_url VARCHAR(500),
    companies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bi_companies table
CREATE TABLE IF NOT EXISTS bi_companies (
    id SERIAL PRIMARY KEY,
    center_id INTEGER REFERENCES bi_centers(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    business_field VARCHAR(200),
    product TEXT,
    entry_date VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bi_centers_region ON bi_centers(region);
CREATE INDEX IF NOT EXISTS idx_bi_centers_org_name ON bi_centers(org_name);
CREATE INDEX IF NOT EXISTS idx_bi_companies_center_id ON bi_companies(center_id);
CREATE INDEX IF NOT EXISTS idx_bi_companies_status ON bi_companies(status);

-- Add update timestamp trigger for bi_centers
CREATE OR REPLACE FUNCTION update_bi_centers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bi_centers_updated_at
    BEFORE UPDATE ON bi_centers
    FOR EACH ROW
    EXECUTE FUNCTION update_bi_centers_updated_at();

-- Add update timestamp trigger for bi_companies
CREATE OR REPLACE FUNCTION update_bi_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bi_companies_updated_at
    BEFORE UPDATE ON bi_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_bi_companies_updated_at();
