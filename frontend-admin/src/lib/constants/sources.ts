/**
 * Notice Source Constants
 * TypeScript equivalent of backend/src/constants/sources.py
 *
 * IMPORTANT: Keep in sync with backend NoticeSource enum
 */

/**
 * Notice Source IDs
 * Format: source:{organization}:{type}
 */
export const NoticeSource = {
	NTIS_RSS: 'source:ntis:rss',
	JBTP_LOCAL: 'source:jbtp:local',
	JBTP_EXTERNAL: 'source:jbtp:external',
	JBTP_EVENTS: 'source:jbtp:events',
	BIZINFO_API: 'source:bizinfo:api',
	NEWS_MFDS: 'source:news:mfds',
	NEWS_MOHW: 'source:news:mohw'
} as const;

/**
 * Type for notice source values
 */
export type NoticeSourceType = (typeof NoticeSource)[keyof typeof NoticeSource];

/**
 * Source metadata interface
 */
export interface SourceInfo {
	display_name: string;
	organization: string;
	type: 'rss' | 'api' | 'scraping';
	description: string;
	url?: string;
}

/**
 * Source metadata mapping
 * Contains display names, organizations, types, and descriptions for each source
 */
export const SOURCE_INFO: Record<string, SourceInfo> = {
	[NoticeSource.NTIS_RSS]: {
		display_name: '정부공고',
		organization: 'NTIS',
		type: 'rss',
		description: '국가과학기술지식정보서비스 R&D 과제공고',
		url: 'https://www.ntis.go.kr'
	},
	[NoticeSource.JBTP_LOCAL]: {
		display_name: '지자체 사업공고',
		organization: 'JBTP',
		type: 'scraping',
		description: '전북테크노파크 사업공고',
		url: 'https://www.jbtp.or.kr'
	},
	[NoticeSource.JBTP_EXTERNAL]: {
		display_name: '유관기관 공고',
		organization: 'JBTP',
		type: 'scraping',
		description: '전북테크노파크 유관기관 공고',
		url: 'https://www.jbtp.or.kr'
	},
	[NoticeSource.JBTP_EVENTS]: {
		display_name: '뉴스/행사',
		organization: 'JBTP',
		type: 'scraping',
		description: '전북테크노파크 교육/행사',
		url: 'https://www.jbtp.or.kr'
	},
	[NoticeSource.BIZINFO_API]: {
		display_name: '기업지원',
		organization: 'BizInfo',
		type: 'api',
		description: '중소기업 정책정보 종합지원시스템',
		url: 'https://www.bizinfo.go.kr'
	},
	[NoticeSource.NEWS_MFDS]: {
		display_name: '식약처',
		organization: 'MFDS',
		type: 'rss',
		description: '식품의약품안전처 보도자료',
		url: 'https://www.mfds.go.kr'
	},
	[NoticeSource.NEWS_MOHW]: {
		display_name: '보건복지부',
		organization: 'MOHW',
		type: 'rss',
		description: '보건복지부 보도자료',
		url: 'https://www.mohw.go.kr'
	}
};

/**
 * Array of all valid source IDs
 */
export const ALL_SOURCES = Object.values(NoticeSource);

/**
 * Helper function to get display name for a source
 */
export function getSourceDisplayName(sourceId: string): string {
	return SOURCE_INFO[sourceId]?.display_name || sourceId;
}

/**
 * Helper function to get organization for a source
 */
export function getSourceOrganization(sourceId: string): string {
	return SOURCE_INFO[sourceId]?.organization || 'Unknown';
}

/**
 * Helper function to validate source ID
 */
export function isValidSource(sourceId: string): sourceId is NoticeSourceType {
	return ALL_SOURCES.includes(sourceId as NoticeSourceType);
}

/**
 * Helper function to get source type
 */
export function getSourceType(sourceId: string): 'rss' | 'api' | 'scraping' | undefined {
	return SOURCE_INFO[sourceId]?.type;
}
