-- Migration: Create Organizations table
-- Description: Biotech companies database with KSIC code classification

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Basic Information
    kedcd VARCHAR(50),  -- 기업 식별 코드
    company_name VARCHAR(255) NOT NULL,  -- 업체명
    company_name_with_type VARCHAR(255),  -- 업체명_형태포함
    business_registration_number VARCHAR(20),  -- 사업자등록번호
    corporate_registration_number VARCHAR(20),  -- 법인등록번호
    corporation_number VARCHAR(20),  -- 법인번호

    -- Representative & Contact
    ceo_name VARCHAR(100),  -- 대표자명
    email VARCHAR(200),  -- 이메일

    -- Company Status
    company_status VARCHAR(50),  -- 기업상태 (영업중, 폐업, 휴업 등)
    company_scale VARCHAR(50),  -- 기업규모 (대기업/중견기업/중소기업)
    company_type VARCHAR(50),  -- 기업형태 (법인/개인/비영리)

    -- Industry Classification (KSIC)
    ksic_11th_code VARCHAR(10),  -- 업종코드11차_세세분류
    ksic_11th_name VARCHAR(255),  -- 업종명11차_세세분류
    ksic_10th_code VARCHAR(10),  -- 업종코드10차_세세분류
    ksic_10th_name VARCHAR(255),  -- 업종명10차_세세분류
    main_ksic_10th VARCHAR(10),  -- KSIC(10차) 주업종

    -- Bio Industry Classification (Computed)
    industry_type VARCHAR(20) DEFAULT 'NON_BIO',  -- BIO_CORE/BIO_RELATED/NON_BIO

    -- Business Details
    main_products TEXT,  -- 주요제품명
    main_industry_name VARCHAR(255),  -- 주축산업명
    cultivation_item VARCHAR(255),  -- 육성품목명

    -- Establishment & Listing
    established_date DATE,  -- 설립일자
    is_listed BOOLEAN DEFAULT FALSE,  -- 상장여부
    listed_date DATE,  -- 상장일자
    delisted_date DATE,  -- 상장폐지일자
    has_research_institute BOOLEAN DEFAULT FALSE,  -- 기업부설연구소유무

    -- Financial Data (2020-2024)
    revenue_2020 BIGINT,  -- 매출액1_2020
    revenue_2021 BIGINT,
    revenue_2022 BIGINT,
    revenue_2023 BIGINT,
    revenue_2024 BIGINT,

    employees_2020 INTEGER,  -- 종사자수_2020
    employees_2021 INTEGER,
    employees_2022 INTEGER,
    employees_2023 INTEGER,
    employees_2024 INTEGER,

    export_amount_2020 BIGINT,  -- 수출액_2020
    export_amount_2021 BIGINT,
    export_amount_2022 BIGINT,
    export_amount_2023 BIGINT,
    export_amount_2024 BIGINT,

    operating_profit_2020 BIGINT,  -- 영업이익손실_2020
    operating_profit_2021 BIGINT,
    operating_profit_2022 BIGINT,
    operating_profit_2023 BIGINT,
    operating_profit_2024 BIGINT,

    net_income_2020 BIGINT,  -- 당기순이익_재무_2020
    net_income_2021 BIGINT,
    net_income_2022 BIGINT,
    net_income_2023 BIGINT,
    net_income_2024 BIGINT,

    rd_expense_2020 BIGINT,  -- 연구개발비_2020
    rd_expense_2021 BIGINT,
    rd_expense_2022 BIGINT,
    rd_expense_2023 BIGINT,
    rd_expense_2024 BIGINT,

    value_added_2020 BIGINT,  -- 부가가치_2020
    value_added_2021 BIGINT,
    value_added_2022 BIGINT,
    value_added_2023 BIGINT,
    value_added_2024 BIGINT,

    total_assets_2020 BIGINT,  -- 자산총계_2020
    total_assets_2021 BIGINT,
    total_assets_2022 BIGINT,
    total_assets_2023 BIGINT,
    total_assets_2024 BIGINT,

    total_liabilities_2020 BIGINT,  -- 부채총계_2020
    total_liabilities_2021 BIGINT,
    total_liabilities_2022 BIGINT,
    total_liabilities_2023 BIGINT,
    total_liabilities_2024 BIGINT,

    retained_earnings_2020 BIGINT,  -- 이익잉여금_2020
    retained_earnings_2021 BIGINT,
    retained_earnings_2022 BIGINT,
    retained_earnings_2023 BIGINT,
    retained_earnings_2024 BIGINT,

    working_capital_2020 BIGINT,  -- 운전자본_2020
    working_capital_2021 BIGINT,
    working_capital_2022 BIGINT,
    working_capital_2023 BIGINT,
    working_capital_2024 BIGINT,

    -- Patent Data (2020-2024)
    patent_registrations_2020 INTEGER,  -- 특허등록건수_등록일기준_2020
    patent_registrations_2021 INTEGER,
    patent_registrations_2022 INTEGER,
    patent_registrations_2023 INTEGER,
    patent_registrations_2024 INTEGER,

    patent_applications_2020 INTEGER,  -- 특허출원건수_출원일기준_2020
    patent_applications_2021 INTEGER,
    patent_applications_2022 INTEGER,
    patent_applications_2023 INTEGER,
    patent_applications_2024 INTEGER,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orgs_company_name ON organizations(company_name);
CREATE INDEX IF NOT EXISTS idx_orgs_company_status ON organizations(company_status);
CREATE INDEX IF NOT EXISTS idx_orgs_company_scale ON organizations(company_scale);
CREATE INDEX IF NOT EXISTS idx_orgs_industry_type ON organizations(industry_type);
CREATE INDEX IF NOT EXISTS idx_orgs_ksic_10th_code ON organizations(ksic_10th_code);
CREATE INDEX IF NOT EXISTS idx_orgs_established_date ON organizations(established_date);

-- Full-text search index for product names (using simple dictionary)
CREATE INDEX IF NOT EXISTS idx_orgs_main_products_fulltext
ON organizations USING gin(to_tsvector('simple', COALESCE(main_products, '')));

-- Add update timestamp trigger
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_organizations_updated_at();

-- Add function to automatically classify industry type based on KSIC code
CREATE OR REPLACE FUNCTION classify_bio_industry()
RETURNS TRIGGER AS $$
BEGIN
    -- BIO_CORE codes
    IF NEW.ksic_10th_code IN ('21101', '21102', '21210', '21220', '21230', '21300', '27199', '70113', '86101') THEN
        NEW.industry_type := 'BIO_CORE';
    -- BIO_RELATED codes
    ELSIF NEW.ksic_10th_code IN (
        '10121', '10749', '10759', '10797', '10799',
        '10801', '10902', '10802', '20423', '27111',
        '27213', '27219', '46441', '47811', '70111'
    ) THEN
        NEW.industry_type := 'BIO_RELATED';
    ELSE
        NEW.industry_type := 'NON_BIO';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER classify_bio_industry_trigger
    BEFORE INSERT OR UPDATE OF ksic_10th_code ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION classify_bio_industry();

-- Add comments to table
COMMENT ON TABLE organizations IS '전북 바이오 기업 데이터베이스 - KSIC 코드 기반 산업 분류';
COMMENT ON COLUMN organizations.industry_type IS 'BIO_CORE: 바이오 핵심산업, BIO_RELATED: 전후방 연관산업, NON_BIO: 비바이오산업';
COMMENT ON COLUMN organizations.ksic_10th_code IS 'KSIC 10차 기준 업종코드 (세세분류)';
