-- Migration 006: Create content_tags table for tag management system
-- Purpose: Store master tag data for content categorization

-- Create content_tags table
CREATE TABLE IF NOT EXISTS content_tags (
    id SERIAL PRIMARY KEY,

    -- Basic Information
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,

    -- Display Properties
    color_hex VARCHAR(7) DEFAULT '#E3F2FD',
    icon VARCHAR(50),

    -- Categorization
    category VARCHAR(30),  -- 'bio', 'region', 'support_type', etc.

    -- Status & Ordering
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,

    -- Usage Statistics
    usage_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_content_tags_active ON content_tags(is_active);
CREATE INDEX idx_content_tags_category ON content_tags(category);
CREATE INDEX idx_content_tags_display_order ON content_tags(display_order);

-- Insert sample bio-related tags (8 tags)
INSERT INTO content_tags (name, slug, description, color_hex, category, display_order) VALUES
('바이오헬스', 'bio-health', '바이오헬스 관련 지원사업 및 공고', '#E3F2FD', 'bio', 1),
('바이오의약', 'bio-pharma', '바이오의약품 개발 및 제조 관련', '#F3E5F5', 'bio', 2),
('바이오화학', 'bio-chemistry', '바이오화학 기술 및 연구 관련', '#E8F5E9', 'bio', 3),
('바이오소재', 'bio-materials', '바이오 신소재 개발 및 응용', '#FFF3E0', 'bio', 4),
('의료기기', 'medical-device', '의료기기 개발 및 인증 관련', '#FCE4EC', 'bio', 5),
('임상시험', 'clinical-trial', '임상시험 및 연구 관련', '#E0F2F1', 'bio', 6),
('신약개발', 'drug-development', '신약 및 치료제 개발 관련', '#F1F8E9', 'bio', 7),
('바이오인증', 'bio-certification', 'GMP, 바이오 인증 및 규제 관련', '#FBE9E7', 'bio', 8);

-- Add comment to table
COMMENT ON TABLE content_tags IS 'Master table for content tags used for notice categorization';
