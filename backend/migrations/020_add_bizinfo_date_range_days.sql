-- Migration: Add date_range_days to bizinfo_config
-- Purpose: Add date range search functionality to Bizinfo crawler config (matching NTIS/JBTP)
-- Date: 2025-11-08

-- Add date_range_days column with default of 30 days
ALTER TABLE bizinfo_config
ADD COLUMN IF NOT EXISTS date_range_days INTEGER DEFAULT 30;

-- Add comment for documentation
COMMENT ON COLUMN bizinfo_config.date_range_days IS 'Search period in days for Bizinfo crawler (default: 30)';
