/**
 * API 설정
 * 환경에 따라 자동으로 API Base URL 결정
 */

import { browser } from '$app/environment';

/**
 * API Base URL
 * - 프로덕션: 상대 경로 /api (Nginx 프록시 활용)
 * - 개발: http://localhost:8000/api
 */
export const API_BASE_URL = browser && window.location.hostname !== 'localhost'
	? '/api'
	: 'http://localhost:8000/api';

/**
 * WebSocket Base URL
 * - 프로덕션: ws:// 또는 wss:// (현재 프로토콜 기반)
 * - 개발: ws://localhost:8000
 */
export const WS_BASE_URL = browser && window.location.hostname !== 'localhost'
	? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
	: 'ws://localhost:8000';

/**
 * API 엔드포인트 헬퍼
 */
export const API = {
	// Dashboard
	dashboard: {
		summary: `${API_BASE_URL}/dashboard/summary`,
		urgentNotices: `${API_BASE_URL}/dashboard/urgent-notices`,
		recentOrganizations: `${API_BASE_URL}/dashboard/recent-organizations`,
		recentLogs: `${API_BASE_URL}/dashboard/recent-logs`
	},

	// Crawling
	crawling: {
		configs: `${API_BASE_URL}/crawling/configs`,
		keywords: (sourceId: string) => `${API_BASE_URL}/crawling/keywords/${sourceId}`,
		report: (sourceId: string) => `${API_BASE_URL}/crawling/report/${sourceId}`,
		ws: {
			ntis: `${WS_BASE_URL}/api/crawling/ws/ntis`,
			biCenter: `${WS_BASE_URL}/api/crawling/ws/bi_center`,
			jbtp: `${WS_BASE_URL}/api/notices/crawl/jbtp`,
			jbtpExternal: `${WS_BASE_URL}/api/notices/crawl/jbtp_external`,
			bizinfo: `${WS_BASE_URL}/api/notices/crawl/bizinfo`
		}
	},

	// Tags
	tags: {
		base: `${API_BASE_URL}/tags`,
		active: `${API_BASE_URL}/tags/active`,
		stats: `${API_BASE_URL}/tags/stats/categories`,
		byId: (id: number) => `${API_BASE_URL}/tags/${id}`
	},

	// Notices
	notices: {
		base: `${API_BASE_URL}/notices`
	}
};
