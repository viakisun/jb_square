/**
 * useCrawlWebSocket
 *
 * Composable for managing WebSocket connections for real-time crawling updates.
 * Extracted from business page lines 63-208.
 *
 * @example
 * ```typescript
 * const ws = useCrawlWebSocket();
 *
 * ws.connect(wsUrl,
 *   (item) => { queueItems = [item, ...queueItems] },
 *   () => { loadQueue() }
 * );
 * ```
 */

/**
 * Log entry type for crawling status messages
 */
export interface LogEntry {
	timestamp: string;
	message: string;
	type?: 'info' | 'success' | 'error' | 'warning';
}

/**
 * Progress information for crawling operation
 */
export interface CrawlProgress {
	progress: number;
	total: number;
	success: number;
	failed: number;
}

/**
 * Page-level progress information during collection phase
 */
export interface PageProgress {
	page: number;
	accumulated: number;
}

/**
 * WebSocket crawl status
 */
export type CrawlStatus = 'idle' | 'collecting' | 'processing' | 'completed' | 'error' | 'stopped';

/**
 * Creates a WebSocket connection manager for crawling operations
 *
 * @returns Object containing reactive state and connection methods
 */
export function useCrawlWebSocket() {
	// Reactive state using Svelte 5 runes
	let status = $state<CrawlStatus>('idle');
	let logs = $state<LogEntry[]>([]);
	let progress = $state<CrawlProgress>({ progress: 0, total: 0, success: 0, failed: 0 });
	let pageProgress = $state<PageProgress>({ page: 0, accumulated: 0 });
	let errorMessage = $state('');
	let loading = $state(false);

	/**
	 * Connect to WebSocket and handle crawling events
	 *
	 * @param wsUrl - WebSocket URL to connect to
	 * @param onItemAdded - Callback when a new item is added to queue
	 * @param onComplete - Callback when WebSocket connection closes
	 */
	function connect(
		wsUrl: string,
		onItemAdded?: (item: any) => void,
		onComplete?: () => void
	) {
		loading = true;
		status = 'collecting';
		logs = [];
		progress = { progress: 0, total: 0, success: 0, failed: 0 };
		pageProgress = { page: 0, accumulated: 0 };
		errorMessage = '';

		try {
			console.log('[WebSocket] Attempting to connect to:', wsUrl);
			const ws = new WebSocket(wsUrl);

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const timestamp = new Date().toISOString();

				switch (data.type) {
					case 'start':
						logs = [
							...logs,
							{ timestamp, message: data.message || 'API 데이터 수집을 시작합니다...', type: 'info' }
						];
						break;

					case 'log':
						logs = [...logs, { timestamp, message: data.message, type: 'info' }];
						break;

					case 'page_progress':
						status = 'collecting';
						pageProgress = {
							page: data.page || 0,
							accumulated: data.accumulated || 0
						};
						break;

					case 'collection_complete':
						status = 'processing';
						logs = [
							...logs,
							{
								timestamp,
								message: `✓ ${data.total_collected}개 공고 수집 완료. 상세 정보 수집 시작...`,
								type: 'success'
							}
						];
						break;

					case 'progress':
						status = 'processing';
						progress = {
							progress: data.progress || 0,
							total: data.total || 0,
							success: data.success || 0,
							failed: data.failed || 0
						};
						if (data.message) {
							logs = [...logs, { timestamp, message: data.message, type: 'info' }];
						}
						break;

					case 'item_added':
						// Real-time item addition - call callback
						if (data.item && onItemAdded) {
							onItemAdded(data.item);
						}
						break;

					case 'complete':
						status = 'completed';
						logs = [
							...logs,
							{
								timestamp,
								message: data.message || 'API 데이터 수집이 완료되었습니다.',
								type: 'success'
							},
							{
								timestamp,
								message: `📋 아래 '크롤링 대기열'에서 수집된 ${progress.success}개의 공고를 확인하세요`,
								type: 'info'
							}
						];
						loading = false;
						break;

					case 'error':
						status = 'error';
						errorMessage = data.message || 'API 데이터 수집 중 오류가 발생했습니다.';
						logs = [
							...logs,
							{ timestamp, message: data.message || 'Error occurred', type: 'error' }
						];
						loading = false;
						break;

					case 'stopped':
						status = 'stopped';
						logs = [
							...logs,
							{ timestamp, message: data.message || 'API 데이터 수집이 중단되었습니다.', type: 'warning' }
						];
						loading = false;
						break;
				}
			};

			ws.onopen = () => {
				console.log('[WebSocket] Connection opened successfully');
			};

			ws.onclose = (event) => {
				console.log('[WebSocket] Connection closed:', event.code, event.reason);
				if (status === 'collecting' || status === 'processing') {
					status = 'completed';
				}
				loading = false;

				// Call onComplete callback
				if (onComplete) {
					onComplete();
				}
			};

			ws.onerror = (error) => {
				console.error('[WebSocket] Error:', error);
				status = 'error';
				errorMessage = '웹소켓 연결 오류가 발생했습니다.';
				logs = [
					...logs,
					{
						timestamp: new Date().toISOString(),
						message: '웹소켓 연결 오류가 발생했습니다.',
						type: 'error'
					}
				];
				loading = false;
			};
		} catch (error) {
			status = 'error';
			errorMessage = String(error);
			loading = false;
		}
	}

	return {
		// Reactive state
		get status() { return status; },
		get logs() { return logs; },
		get progress() { return progress; },
		get pageProgress() { return pageProgress; },
		get errorMessage() { return errorMessage; },
		get loading() { return loading; },

		// Methods
		connect
	};
}
