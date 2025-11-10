/**
 * Notice Source Constants
 * 공고 출처 상수 정의
 *
 * Naming convention: source:organization:type
 */

/**
 * 공고 출처 Enum
 */
export enum NoticeSource {
	NTIS_RSS = 'source:ntis:rss',           // 정부공고 - NTIS
	JBTP_LOCAL = 'source:jbtp:local',       // 지자체 공고 - (재)전북테크노파크
	JBTP_EXTERNAL = 'source:jbtp:external', // 유관기관 공고 - (재)전북테크노파크
	JBTP_EVENTS = 'source:jbtp:events',     // 교육/행사 - (재)전북테크노파크
	BIZINFO_API = 'source:bizinfo:api',     // 기업마당 정보 - 기업마당
	NEWS_MFDS = 'source:news:mfds',         // 뉴스 - 식품의약품안전처
	NEWS_MOHW = 'source:news:mohw',         // 뉴스 - 보건복지부
}

/**
 * Source 메타데이터
 */
export interface SourceInfo {
	displayName: string;
	organization: string;
	organizationFull: string;
	type: string;
	description: string;
}

export const SOURCE_INFO: Record<NoticeSource, SourceInfo> = {
	[NoticeSource.NTIS_RSS]: {
		displayName: '정부공고',
		organization: 'NTIS',
		organizationFull: '국가과학기술지식정보서비스',
		type: 'RSS',
		description: '정부 R&D 지원 사업 공고',
	},
	[NoticeSource.JBTP_LOCAL]: {
		displayName: '지자체 공고',
		organization: '(재)전북테크노파크',
		organizationFull: '재단법인 전북테크노파크',
		type: 'Crawling',
		description: '전북 지역 지자체 지원 사업 공고',
	},
	[NoticeSource.JBTP_EXTERNAL]: {
		displayName: '유관기관 공고',
		organization: '(재)전북테크노파크',
		organizationFull: '재단법인 전북테크노파크',
		type: 'Crawling',
		description: '유관기관 지원 사업 공고',
	},
	[NoticeSource.JBTP_EVENTS]: {
		displayName: 'JBTP 행사',
		organization: '(재)전북테크노파크',
		organizationFull: '재단법인 전북테크노파크',
		type: 'Crawling',
		description: '전북테크노파크 교육/행사 정보',
	},
	[NoticeSource.BIZINFO_API]: {
		displayName: '기업마당 정보',
		organization: '기업마당',
		organizationFull: '중소기업 종합정보시스템',
		type: 'API',
		description: '중소기업 지원 사업 정보',
	},
	[NoticeSource.NEWS_MFDS]: {
		displayName: '식약처 뉴스',
		organization: '식품의약품안전처',
		organizationFull: '식품의약품안전처',
		type: 'RSS',
		description: '의약품 승인, 안전 규제, 식품 위생 관련 공지사항',
	},
	[NoticeSource.NEWS_MOHW]: {
		displayName: '복지부 뉴스',
		organization: '보건복지부',
		organizationFull: '보건복지부',
		type: 'RSS',
		description: '보건의료 정책, R&D 지원, 바이오 산업 보도자료',
	},
};

/**
 * Source ID로 표시명 가져오기
 */
export function getSourceDisplayName(sourceId: string): string {
	return SOURCE_INFO[sourceId as NoticeSource]?.displayName || sourceId;
}

/**
 * Source ID로 기관명 가져오기
 */
export function getSourceOrganization(sourceId: string): string {
	return SOURCE_INFO[sourceId as NoticeSource]?.organization || '알 수 없음';
}

/**
 * 유효한 Source ID인지 확인
 */
export function isValidSource(sourceId: string): boolean {
	return Object.values(NoticeSource).includes(sourceId as NoticeSource);
}

/**
 * 모든 Source ID 리스트
 */
export const ALL_SOURCES = Object.values(NoticeSource);

/**
 * Legacy compatibility - deprecated
 * @deprecated Use getSourceDisplayName instead
 */
export function getSourceLabel(sourceId: string): string {
	return getSourceDisplayName(sourceId);
}

/**
 * Legacy compatibility - deprecated
 * @deprecated Use getSourceDisplayName with SOURCE_INFO instead
 */
export function getLocationDisplay(sourceId: string): string {
	const info = SOURCE_INFO[sourceId as NoticeSource];
	return info ? `${info.displayName} (${info.organization})` : `공고 (${sourceId})`;
}
