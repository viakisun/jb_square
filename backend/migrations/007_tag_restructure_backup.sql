-- ========================================
-- Tag System Restructuring - Phase 1: BACKUP
-- ========================================
-- Date: 2025-11-08
-- Purpose: Backup current content_tags and support_notices.tags before restructuring
--
-- INSTRUCTIONS:
-- 1. Run this script FIRST to create backup tables
-- 2. Keep this backup until verification is complete
-- 3. Can be used to rollback if needed
-- ========================================

-- Backup content_tags table
DROP TABLE IF EXISTS content_tags_backup_20251108;
CREATE TABLE content_tags_backup_20251108 AS
SELECT * FROM content_tags;

-- Verify backup
SELECT 'Content Tags Backup Created' AS status, COUNT(*) AS total_tags
FROM content_tags_backup_20251108;

-- Backup support_notices with tags
DROP TABLE IF EXISTS support_notices_tags_backup_20251108;
CREATE TABLE support_notices_tags_backup_20251108 AS
SELECT id, title, tags
FROM support_notices
WHERE tags IS NOT NULL AND json_array_length(tags) > 0;

-- Verify notices backup
SELECT 'Notice Tags Backup Created' AS status, COUNT(*) AS total_notices_with_tags
FROM support_notices_tags_backup_20251108;

-- Summary report
SELECT
    'BACKUP SUMMARY' AS report_type,
    (SELECT COUNT(*) FROM content_tags_backup_20251108) AS backed_up_tags,
    (SELECT COUNT(*) FROM support_notices_tags_backup_20251108) AS backed_up_notices;

-- Export backup instructions
COMMENT ON TABLE content_tags_backup_20251108 IS 'Backup before tag restructuring on 2025-11-08. Contains all tags before deleting field category and 방산 tag.';
COMMENT ON TABLE support_notices_tags_backup_20251108 IS 'Backup of notice tags before tag restructuring on 2025-11-08. Can be used to restore if migration fails.';
