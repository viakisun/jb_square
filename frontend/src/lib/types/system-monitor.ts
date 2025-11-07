/**
 * 시스템 모니터링 TypeScript 타입 정의
 *
 * Backend Pydantic 모델과 1:1 매핑되는 TypeScript 타입을 정의합니다.
 * 타입 안전성을 통해 런타임 에러를 방지하고, IDE 자동완성을 지원합니다.
 *
 * @module lib/types/system-monitor
 * @author JB Square Dev Team
 * @date 2025-11-07
 */

/**
 * 메모리 사용량 정보
 *
 * @interface MemoryInfo
 * @property {number} total - 총 메모리 (bytes)
 * @property {number} used - 사용 중인 메모리 (bytes)
 * @property {number} available - 사용 가능한 메모리 (bytes)
 * @property {number} percent - 사용률 (0-100)
 * @property {number} free - 완전히 비어있는 메모리 (bytes)
 * @property {number} cached - 캐시로 사용되는 메모리 (bytes)
 *
 * @example
 * ```typescript
 * const memory: MemoryInfo = {
 *   total: 2147483648,
 *   used: 1073741824,
 *   available: 536870912,
 *   percent: 50.0,
 *   free: 268435456,
 *   cached: 268435456
 * };
 * ```
 */
export interface MemoryInfo {
	total: number;
	used: number;
	available: number;
	percent: number;
	free: number;
	cached: number;
}

/**
 * 디스크 사용량 정보
 *
 * @interface DiskInfo
 * @property {number} total - 총 디스크 크기 (bytes)
 * @property {number} used - 사용 중인 디스크 공간 (bytes)
 * @property {number} free - 사용 가능한 디스크 공간 (bytes)
 * @property {number} percent - 사용률 (0-100)
 * @property {string} mount_point - 마운트 포인트 경로
 */
export interface DiskInfo {
	total: number;
	used: number;
	free: number;
	percent: number;
	mount_point: string;
}

/**
 * CPU 사용량 정보
 *
 * @interface CPUInfo
 * @property {number} percent - CPU 사용률 (0-100)
 * @property {number} count - CPU 코어 개수
 * @property {[number, number, number]} load_average - 시스템 로드 평균 (1분, 5분, 15분)
 */
export interface CPUInfo {
	percent: number;
	count: number;
	load_average: [number, number, number];
}

/**
 * Docker 시스템 정보
 *
 * @interface DockerSystemInfo
 * @property {number} images_count - 전체 이미지 개수
 * @property {number} containers_count - 전체 컨테이너 개수
 * @property {number} running_containers - 실행 중인 컨테이너 개수
 * @property {number} images_size - 이미지 총 크기 (bytes)
 * @property {number} containers_size - 컨테이너 총 크기 (bytes)
 * @property {number} volumes_count - 볼륨 개수
 * @property {number} build_cache_size - 빌드 캐시 크기 (bytes)
 */
export interface DockerSystemInfo {
	images_count: number;
	containers_count: number;
	running_containers: number;
	images_size: number;
	containers_size: number;
	volumes_count: number;
	build_cache_size: number;
}

/**
 * 전체 시스템 상태
 *
 * @interface SystemStatus
 * @property {MemoryInfo} memory - 메모리 사용량
 * @property {DiskInfo} disk - 디스크 사용량
 * @property {CPUInfo} cpu - CPU 사용량
 * @property {DockerSystemInfo} docker - Docker 시스템 정보
 * @property {string} timestamp - 조회 시각 (ISO 8601 형식)
 */
export interface SystemStatus {
	memory: MemoryInfo;
	disk: DiskInfo;
	cpu: CPUInfo;
	docker: DockerSystemInfo;
	timestamp: string;
}

/**
 * 컨테이너 정보
 *
 * @interface ContainerInfo
 * @property {string} id - 컨테이너 ID (short)
 * @property {string} name - 컨테이너 이름
 * @property {string} image - 사용 중인 이미지
 * @property {string} status - 컨테이너 상태
 * @property {string | null} health - 헬스체크 상태
 * @property {string} created - 생성 시각 (ISO 8601 형식)
 * @property {string | null} started - 시작 시각 (ISO 8601 형식)
 * @property {number} size - 컨테이너 크기 (bytes)
 */
export interface ContainerInfo {
	id: string;
	name: string;
	image: string;
	status: string;
	health: string | null;
	created: string;
	started: string | null;
	size: number;
}

/**
 * 이미지 정보
 *
 * @interface ImageInfo
 * @property {string} id - 이미지 ID (short)
 * @property {string} repository - 리포지토리 이름
 * @property {string} tag - 이미지 태그
 * @property {number} size - 이미지 크기 (bytes)
 * @property {string} created - 생성 시각 (ISO 8601 형식)
 */
export interface ImageInfo {
	id: string;
	repository: string;
	tag: string;
	size: number;
	created: string;
}

/**
 * 로그 라인 정보
 *
 * @interface LogLine
 * @property {string | null} timestamp - 로그 발생 시각 (ISO 8601 형식)
 * @property {string | null} level - 로그 레벨 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
 * @property {string} message - 로그 메시지
 */
export interface LogLine {
	timestamp: string | null;
	level: string | null;
	message: string;
}

/**
 * 로그 조회 응답
 *
 * @interface LogsResponse
 * @property {string} container_name - 컨테이너 이름
 * @property {LogLine[]} lines - 로그 라인 목록
 * @property {number} total_lines - 전체 로그 라인 수
 * @property {number} filtered_lines - 필터링 후 라인 수
 * @property {boolean} has_more - 더 많은 로그가 있는지 여부
 */
export interface LogsResponse {
	container_name: string;
	lines: LogLine[];
	total_lines: number;
	filtered_lines: number;
	has_more: boolean;
}

/**
 * 리소스 알림 정보
 *
 * @interface ResourceAlert
 * @property {string} resource_type - 리소스 타입 (memory, disk, cpu)
 * @property {string} level - 알림 레벨 (warning, critical)
 * @property {number} current_value - 현재 값
 * @property {number} threshold - 임계값
 * @property {string} message - 알림 메시지
 * @property {string} timestamp - 알림 발생 시각 (ISO 8601 형식)
 */
export interface ResourceAlert {
	resource_type: string;
	level: string;
	current_value: number;
	threshold: number;
	message: string;
	timestamp: string;
}

/**
 * 로그 레벨 타입
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

/**
 * 컨테이너 상태 타입
 */
export type ContainerStatus = 'running' | 'exited' | 'restarting' | 'paused' | 'dead' | 'created';

/**
 * 헬스체크 상태 타입
 */
export type HealthStatus = 'healthy' | 'unhealthy' | 'starting' | 'none';

/**
 * 알림 레벨 타입
 */
export type AlertLevel = 'warning' | 'critical';

/**
 * API 에러 응답
 *
 * @interface APIError
 * @property {string} error_code - 에러 코드
 * @property {string} message - 에러 메시지
 * @property {string} [detail] - 상세 에러 정보 (선택사항)
 */
export interface APIError {
	error_code: string;
	message: string;
	detail?: string;
}
