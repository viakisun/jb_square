/**
 * Source Constants
 * Centralized source ID mappings and labels
 */

/**
 * Source label mappings for display purposes
 */
export const SOURCE_LABELS: Record<string, string> = {
	jbtp: 'JBTP 사업공고',
	jbtp_external: 'JBTP 유관기관',
	ntis: 'NTIS',
	ntis_rss: 'NTIS RSS',
	bizinfo: '기업마당',
	manual: '수동등록'
};

/**
 * Get display label for a source ID
 * @param sourceId - Source identifier
 * @returns Display label or source ID if not found
 */
export function getSourceLabel(sourceId: string): string {
	return SOURCE_LABELS[sourceId] || sourceId;
}

/**
 * Location display mappings for form displays
 * Used in forms where more detailed categorization is needed
 */
export const LOCATION_LABELS: Record<string, string> = {
	ntis_rss: '정부공고 (NTIS)',
	ntis: '정부공고 (NTIS)',
	jbtp: '지자체 공고 (사업공고)',
	jbtp_external: '지자체 공고 (유관기관공고)',
	bizinfo: '정부공고 (기업마당)',
	manual: '수동등록'
};

/**
 * Get location display label for a source ID
 * @param sourceId - Source identifier
 * @returns Location display label
 */
export function getLocationDisplay(sourceId: string): string {
	return LOCATION_LABELS[sourceId] || `공고 (${sourceId})`;
}

/**
 * All available source IDs
 */
export const SOURCE_IDS = Object.keys(SOURCE_LABELS) as Array<keyof typeof SOURCE_LABELS>;
