-- ========================================
-- Professional Tag System - Backup #2
-- ========================================
-- Date: 2025-11-08
-- Purpose: Backup before complete professional tag system restructuring
-- ========================================

-- Backup current content_tags
DROP TABLE IF EXISTS content_tags_backup_professional;
CREATE TABLE content_tags_backup_professional AS
SELECT * FROM content_tags;

SELECT 'Professional Tag System Backup Created' AS status, COUNT(*) AS total_tags
FROM content_tags_backup_professional;

-- Backup support_notices with tags
DROP TABLE IF EXISTS support_notices_tags_backup_professional;
CREATE TABLE support_notices_tags_backup_professional AS
SELECT id, title, tags
FROM support_notices
WHERE tags IS NOT NULL AND json_array_length(tags) > 0;

SELECT 'Notice Tags Backup Created' AS status, COUNT(*) AS total_notices_with_tags
FROM support_notices_tags_backup_professional;

-- Summary
SELECT
    'BACKUP SUMMARY' AS report_type,
    (SELECT COUNT(*) FROM content_tags_backup_professional) AS backed_up_tags,
    (SELECT COUNT(*) FROM support_notices_tags_backup_professional) AS backed_up_notices;
