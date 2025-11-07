/**
 * 시스템 모니터링 API 클라이언트
 *
 * Backend FastAPI 엔드포인트와 통신하는 클라이언트 함수들을 제공합니다.
 * fetch API를 사용하여 REST API 호출을 수행하며, 타입 안전성을 보장합니다.
 *
 * @module lib/api/system-monitor-api
 * @author JB Square Dev Team
 * @date 2025-11-07
 */

import type {
	SystemStatus,
	MemoryInfo,
	DiskInfo,
	CPUInfo,
	DockerSystemInfo,
	ContainerInfo,
	ImageInfo,
	LogsResponse,
	ResourceAlert,
	LogLevel,
	APIError
} from '$lib/types/system-monitor';

/**
 * API 기본 URL
 *
 * 환경변수에서 읽거나 기본값 사용
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API 호출 헬퍼 함수
 *
 * fetch API를 래핑하여 에러 처리, JSON 파싱, 타입 캐스팅을 수행합니다.
 *
 * @template T - 응답 데이터 타입
 * @param {string} endpoint - API 엔드포인트 경로
 * @param {RequestInit} [options] - fetch 옵션
 * @returns {Promise<T>} 파싱된 응답 데이터
 * @throws {APIError} API 에러 발생 시
 *
 * @example
 * ```typescript
 * const data = await apiCall<SystemStatus>('/system/status');
 * ```
 */
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	try {
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers
			}
		});

		if (!response.ok) {
			// API 에러 응답 파싱
			const errorData: APIError = await response.json().catch(() => ({
				error_code: 'UNKNOWN_ERROR',
				message: `HTTP ${response.status}: ${response.statusText}`
			}));

			throw new Error(errorData.message || `API Error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error('알 수 없는 오류가 발생했습니다');
	}
}

/**
 * 전체 시스템 상태 조회
 *
 * 메모리, 디스크, CPU, Docker 정보를 통합하여 반환합니다.
 *
 * @returns {Promise<SystemStatus>} 시스템 상태
 * @throws {Error} API 호출 실패 시
 *
 * @example
 * ```typescript
 * const status = await getSystemStatus();
 * console.log(`Memory: ${status.memory.percent}%`);
 * console.log(`Disk: ${status.disk.percent}%`);
 * console.log(`CPU: ${status.cpu.percent}%`);
 * ```
 */
export async function getSystemStatus(): Promise<SystemStatus> {
	return apiCall<SystemStatus>('/system/status');
}

/**
 * 메모리 상태 조회
 *
 * @returns {Promise<MemoryInfo>} 메모리 상태
 * @throws {Error} API 호출 실패 시
 *
 * @example
 * ```typescript
 * const memory = await getMemoryStatus();
 * console.log(`Used: ${(memory.used / (1024**3)).toFixed(2)} GB`);
 * ```
 */
export async function getMemoryStatus(): Promise<MemoryInfo> {
	return apiCall<MemoryInfo>('/system/memory');
}

/**
 * 디스크 상태 조회
 *
 * @returns {Promise<DiskInfo>} 디스크 상태
 * @throws {Error} API 호출 실패 시
 */
export async function getDiskStatus(): Promise<DiskInfo> {
	return apiCall<DiskInfo>('/system/disk');
}

/**
 * CPU 상태 조회
 *
 * @returns {Promise<CPUInfo>} CPU 상태
 * @throws {Error} API 호출 실패 시
 */
export async function getCPUStatus(): Promise<CPUInfo> {
	return apiCall<CPUInfo>('/system/cpu');
}

/**
 * 리소스 알림 조회
 *
 * 시스템 리소스 사용량이 임계값을 초과한 경우 알림을 반환합니다.
 *
 * @returns {Promise<ResourceAlert[]>} 알림 목록 (임계값 미초과 시 빈 배열)
 * @throws {Error} API 호출 실패 시
 *
 * @example
 * ```typescript
 * const alerts = await getResourceAlerts();
 * if (alerts.length > 0) {
 *   alerts.forEach(alert => {
 *     console.log(`[${alert.level}] ${alert.message}`);
 *   });
 * }
 * ```
 */
export async function getResourceAlerts(): Promise<ResourceAlert[]> {
	return apiCall<ResourceAlert[]>('/system/alerts');
}

/**
 * 컨테이너 목록 조회
 *
 * @param {boolean} [all=true] - 중지된 컨테이너 포함 여부
 * @returns {Promise<ContainerInfo[]>} 컨테이너 목록
 * @throws {Error} API 호출 실패 시
 *
 * @example
 * ```typescript
 * // 실행 중인 컨테이너만 조회
 * const runningContainers = await getContainers(false);
 *
 * // 모든 컨테이너 조회
 * const allContainers = await getContainers(true);
 * ```
 */
export async function getContainers(all: boolean = true): Promise<ContainerInfo[]> {
	return apiCall<ContainerInfo[]>(`/docker/containers?all=${all}`);
}

/**
 * 이미지 목록 조회
 *
 * @returns {Promise<ImageInfo[]>} 이미지 목록
 * @throws {Error} API 호출 실패 시
 *
 * @example
 * ```typescript
 * const images = await getImages();
 * const totalSize = images.reduce((sum, img) => sum + img.size, 0);
 * console.log(`Total: ${(totalSize / (1024**3)).toFixed(2)} GB`);
 * ```
 */
export async function getImages(): Promise<ImageInfo[]> {
	return apiCall<ImageInfo[]>('/docker/images');
}

/**
 * Docker 시스템 정보 조회
 *
 * @returns {Promise<DockerSystemInfo>} Docker 시스템 정보
 * @throws {Error} API 호출 실패 시
 */
export async function getDockerSystemInfo(): Promise<DockerSystemInfo> {
	return apiCall<DockerSystemInfo>('/docker/system');
}

/**
 * 로그 조회 가능한 컨테이너 목록
 *
 * @returns {Promise<string[]>} 컨테이너 이름 목록
 * @throws {Error} API 호출 실패 시
 *
 * @example
 * ```typescript
 * const containers = await getAvailableContainers();
 * // ['jb2-backend-prod', 'jb2-frontend-admin-prod', ...]
 * ```
 */
export async function getAvailableContainers(): Promise<string[]> {
	return apiCall<string[]>('/logs/containers');
}

/**
 * 컨테이너 로그 조회 옵션
 *
 * @interface GetLogsOptions
 * @property {number} [lines=500] - 조회할 로그 라인 수
 * @property {LogLevel} [levelFilter] - 로그 레벨 필터
 * @property {string} [searchTerm] - 검색어
 */
export interface GetLogsOptions {
	lines?: number;
	levelFilter?: LogLevel;
	searchTerm?: string;
}

/**
 * 컨테이너 로그 조회
 *
 * 민감한 정보는 자동으로 마스킹됩니다.
 *
 * @param {string} containerName - 컨테이너 이름
 * @param {GetLogsOptions} [options] - 조회 옵션
 * @returns {Promise<LogsResponse>} 로그 응답
 * @throws {Error} API 호출 실패 시
 *
 * @example
 * ```typescript
 * // 기본 조회 (최근 500줄)
 * const logs = await getContainerLogs('jb2-backend-prod');
 *
 * // 에러 로그만 조회
 * const errorLogs = await getContainerLogs('jb2-backend-prod', {
 *   levelFilter: 'ERROR',
 *   lines: 100
 * });
 *
 * // 검색어로 필터링
 * const searchLogs = await getContainerLogs('jb2-backend-prod', {
 *   searchTerm: 'crawling',
 *   lines: 200
 * });
 * ```
 */
export async function getContainerLogs(
	containerName: string,
	options?: GetLogsOptions
): Promise<LogsResponse> {
	const params = new URLSearchParams();

	if (options?.lines) {
		params.append('lines', options.lines.toString());
	}
	if (options?.levelFilter) {
		params.append('level_filter', options.levelFilter);
	}
	if (options?.searchTerm) {
		params.append('search_term', options.searchTerm);
	}

	const queryString = params.toString();
	const endpoint = `/logs/${containerName}${queryString ? `?${queryString}` : ''}`;

	return apiCall<LogsResponse>(endpoint);
}

/**
 * 바이트를 사람이 읽기 쉬운 형식으로 변환
 *
 * @param {number} bytes - 바이트 수
 * @param {number} [decimals=2] - 소수점 자리수
 * @returns {string} 변환된 문자열 (예: "1.5 GB")
 *
 * @example
 * ```typescript
 * formatBytes(1536); // "1.5 KB"
 * formatBytes(1073741824); // "1 GB"
 * formatBytes(1536, 0); // "2 KB"
 * ```
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * 상대 시간 포맷 (예: "2시간 전")
 *
 * @param {string} isoString - ISO 8601 형식 날짜 문자열
 * @returns {string} 상대 시간 문자열
 *
 * @example
 * ```typescript
 * formatRelativeTime('2025-11-07T08:00:00Z'); // "2시간 전"
 * formatRelativeTime('2025-11-06T10:00:00Z'); // "1일 전"
 * ```
 */
export function formatRelativeTime(isoString: string): string {
	const date = new Date(isoString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) {
		return `${diffSec}초 전`;
	} else if (diffMin < 60) {
		return `${diffMin}분 전`;
	} else if (diffHour < 24) {
		return `${diffHour}시간 전`;
	} else if (diffDay < 30) {
		return `${diffDay}일 전`;
	} else {
		return date.toLocaleDateString('ko-KR');
	}
}

/**
 * 로그 레벨에 따른 색상 클래스 반환
 *
 * Tailwind CSS 클래스를 반환합니다.
 *
 * @param {string | null} level - 로그 레벨
 * @returns {string} Tailwind CSS 클래스
 *
 * @example
 * ```typescript
 * getLogLevelColor('ERROR'); // "text-red-600 bg-red-50"
 * getLogLevelColor('INFO'); // "text-blue-600 bg-blue-50"
 * ```
 */
export function getLogLevelColor(level: string | null): string {
	switch (level) {
		case 'DEBUG':
			return 'text-gray-600 bg-gray-50';
		case 'INFO':
			return 'text-blue-600 bg-blue-50';
		case 'WARNING':
			return 'text-yellow-600 bg-yellow-50';
		case 'ERROR':
			return 'text-red-600 bg-red-50';
		case 'CRITICAL':
			return 'text-red-800 bg-red-100';
		default:
			return 'text-gray-500 bg-gray-50';
	}
}

/**
 * 알림 레벨에 따른 색상 클래스 반환
 *
 * @param {string} level - 알림 레벨 (warning, critical)
 * @returns {string} Tailwind CSS 클래스
 *
 * @example
 * ```typescript
 * getAlertLevelColor('critical'); // "text-red-800 bg-red-100 border-red-200"
 * ```
 */
export function getAlertLevelColor(level: string): string {
	switch (level) {
		case 'warning':
			return 'text-yellow-800 bg-yellow-100 border-yellow-200';
		case 'critical':
			return 'text-red-800 bg-red-100 border-red-200';
		default:
			return 'text-gray-800 bg-gray-100 border-gray-200';
	}
}

/**
 * 컨테이너 상태에 따른 색상 클래스 반환
 *
 * @param {string} status - 컨테이너 상태
 * @returns {string} Tailwind CSS 클래스
 *
 * @example
 * ```typescript
 * getContainerStatusColor('running'); // "text-green-600 bg-green-50"
 * ```
 */
export function getContainerStatusColor(status: string): string {
	switch (status.toLowerCase()) {
		case 'running':
			return 'text-green-600 bg-green-50';
		case 'exited':
			return 'text-gray-600 bg-gray-50';
		case 'restarting':
			return 'text-yellow-600 bg-yellow-50';
		case 'paused':
			return 'text-blue-600 bg-blue-50';
		case 'dead':
			return 'text-red-600 bg-red-50';
		default:
			return 'text-gray-500 bg-gray-50';
	}
}

/**
 * 헬스체크 상태에 따른 색상 클래스 반환
 *
 * @param {string | null} health - 헬스체크 상태
 * @returns {string} Tailwind CSS 클래스
 */
export function getHealthStatusColor(health: string | null): string {
	if (!health) return 'text-gray-400';

	switch (health.toLowerCase()) {
		case 'healthy':
			return 'text-green-600';
		case 'unhealthy':
			return 'text-red-600';
		case 'starting':
			return 'text-yellow-600';
		default:
			return 'text-gray-400';
	}
}
