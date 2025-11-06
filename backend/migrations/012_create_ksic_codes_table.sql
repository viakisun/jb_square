-- Migration: Create KSIC Codes Master Table
-- Description: Centralized management of KSIC codes with bio industry classification

-- Create ksic_codes table
CREATE TABLE IF NOT EXISTS ksic_codes (
    -- Primary Key
    code VARCHAR(10) PRIMARY KEY,

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Classification
    category VARCHAR(20) NOT NULL DEFAULT 'NON_BIO',  -- BIO_CORE/BIO_RELATED/NON_BIO

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_category CHECK (category IN ('BIO_CORE', 'BIO_RELATED', 'NON_BIO'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ksic_category ON ksic_codes(category);
CREATE INDEX IF NOT EXISTS idx_ksic_is_active ON ksic_codes(is_active);

-- Add update timestamp trigger
CREATE OR REPLACE FUNCTION update_ksic_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ksic_codes_updated_at
    BEFORE UPDATE ON ksic_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_ksic_codes_updated_at();

-- Insert BIO_CORE codes (9 codes)
INSERT INTO ksic_codes (code, name, category, description) VALUES
('21101', '의약용 화합물 및 항생물질 제조업', 'BIO_CORE', '바이오 핵심산업 - 의약품 제조'),
('21102', '생물학적 제제 제조업', 'BIO_CORE', '바이오 핵심산업 - 백신, 혈액제제 등'),
('21210', '완제 의약품 제조업', 'BIO_CORE', '바이오 핵심산업 - 완제 의약품'),
('21220', '한의약품 제조업', 'BIO_CORE', '바이오 핵심산업 - 한약'),
('21230', '동물용 의약품 제조업', 'BIO_CORE', '바이오 핵심산업 - 수의약품'),
('21300', '의료용품 및 기타 의약 관련제품 제조업', 'BIO_CORE', '바이오 핵심산업 - 의료용품'),
('27199', '기타 의료용 기기 제조업', 'BIO_CORE', '바이오 핵심산업 - 의료기기'),
('70113', '생명공학 연구개발업', 'BIO_CORE', '바이오 핵심산업 - 생명공학 R&D'),
('86101', '병원', 'BIO_CORE', '바이오 핵심산업 - 병원');

-- Insert BIO_RELATED codes (15 codes)
INSERT INTO ksic_codes (code, name, category, description) VALUES
('10121', '낙농제품 제조업', 'BIO_RELATED', '전후방 연관산업 - 유제품'),
('10749', '기타 곡물가공품 제조업', 'BIO_RELATED', '전후방 연관산업 - 곡물가공'),
('10759', '기타 식품 첨가물 제조업', 'BIO_RELATED', '전후방 연관산업 - 식품첨가물'),
('10797', '건강보조용 액화식품 제조업', 'BIO_RELATED', '전후방 연관산업 - 건강기능식품'),
('10799', '그외 기타 식품 제조업', 'BIO_RELATED', '전후방 연관산업 - 기타 식품'),
('10801', '배합사료 제조업', 'BIO_RELATED', '전후방 연관산업 - 사료'),
('10902', '동물용 사료 제조업', 'BIO_RELATED', '전후방 연관산업 - 동물사료'),
('10802', '애완용 동물 사료 제조업', 'BIO_RELATED', '전후방 연관산업 - 반려동물 사료'),
('20423', '화장품 제조업', 'BIO_RELATED', '전후방 연관산업 - 화장품'),
('27111', '전기식 진단 및 요법 기기 제조업', 'BIO_RELATED', '전후방 연관산업 - 의료기기'),
('27213', '방사선 장치 제조업', 'BIO_RELATED', '전후방 연관산업 - 방사선장비'),
('27219', '기타 의료용 기기 제조업', 'BIO_RELATED', '전후방 연관산업 - 의료기기'),
('46441', '의료용품 및 의약품 도매업', 'BIO_RELATED', '전후방 연관산업 - 유통'),
('47811', '의약품 및 의료용품 소매업', 'BIO_RELATED', '전후방 연관산업 - 소매'),
('70111', '자연과학 연구개발업', 'BIO_RELATED', '전후방 연관산업 - 자연과학 R&D');

-- Insert some NON_BIO codes for reference (used in dummy data)
INSERT INTO ksic_codes (code, name, category, description) VALUES
('26400', '통신 및 방송 장비 제조업', 'NON_BIO', '비바이오산업 - 통신장비'),
('28120', '산업처리공정 제어장비 제조업', 'NON_BIO', '비바이오산업 - 제어장비'),
('46900', '상품 종합 도매업', 'NON_BIO', '비바이오산업 - 도매'),
('62010', '컴퓨터 프로그래밍 서비스업', 'NON_BIO', '비바이오산업 - IT'),
('70200', '경영컨설팅업', 'NON_BIO', '비바이오산업 - 컨설팅'),
('71400', '회계 및 세무 관련 서비스업', 'NON_BIO', '비바이오산업 - 회계'),
('73209', '기타 시장조사 및 여론조사업', 'NON_BIO', '비바이오산업 - 조사');

-- Update the classify_bio_industry trigger to use the table
DROP TRIGGER IF EXISTS classify_bio_industry_trigger ON organizations;
DROP FUNCTION IF EXISTS classify_bio_industry();

CREATE OR REPLACE FUNCTION classify_bio_industry()
RETURNS TRIGGER AS $$
DECLARE
    ksic_category VARCHAR(20);
BEGIN
    -- Lookup category from ksic_codes table
    SELECT category INTO ksic_category
    FROM ksic_codes
    WHERE code = NEW.ksic_10th_code AND is_active = TRUE;

    -- If found, use the category from table; otherwise default to NON_BIO
    IF ksic_category IS NOT NULL THEN
        NEW.industry_type := ksic_category;
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

-- Add comments
COMMENT ON TABLE ksic_codes IS 'KSIC 코드 마스터 테이블 - 바이오 산업 분류 관리';
COMMENT ON COLUMN ksic_codes.category IS 'BIO_CORE: 바이오 핵심산업, BIO_RELATED: 전후방 연관산업, NON_BIO: 비바이오산업';
COMMENT ON COLUMN ksic_codes.is_active IS '활성 상태 - 비활성화된 코드는 분류에 사용되지 않음';
