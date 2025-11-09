-- Migration: Remove unused entry_date and status columns from bi_companies table
-- Date: 2025-11-09
-- Description: These columns were found to have no data from the crawling source

-- Drop the index on status column
DROP INDEX IF EXISTS idx_bi_companies_status;

-- Remove entry_date column
ALTER TABLE bi_companies DROP COLUMN IF EXISTS entry_date;

-- Remove status column
ALTER TABLE bi_companies DROP COLUMN IF EXISTS status;
