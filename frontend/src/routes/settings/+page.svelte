<script lang="ts">
	/**
	 * JB SQUARE Settings Page
	 * 크롤링 소스 관리 및 실시간 모니터링
	 */

	import { onMount, onDestroy } from 'svelte';
	import { Panel } from '$lib/components/layout';
	import {
		CrawlingCard,
		CrawlingStatus,
		KeywordManager,
		CrawlingReport
	} from '$lib/components/crawling';
	import { toast } from '$lib/stores/toast';

	interface LogEntry {
		timestamp: string;
		message: string;
		type?: 'info' | 'success' | 'error' | 'warning';
	}

	interface CrawlerState {
		status: 'idle' | 'running' | 'completed' | 'error' | 'stopped';
		progress: number;
		total: number;
		success: number;
		failed: number;
		last_run?: string;
		error_message?: string;
		logs: LogEntry[];
		ws?: WebSocket;
	}

	// 크롤링 소스 정보
	const sources = [
		{
			id: 'jbtp',
			name: 'JBTP 전북테크노파크',
			description: '사업공고, 채용공고, 유관기관공고'
		},
		{
			id: 'ntis',
			name: 'NTIS 국가R&D',
			description: '국가과학기술지식정보서비스'
		},
		{
			id: 'bizinfo',
			name: '기업마당 BizInfo',
			description: '기업지원사업 공고'
		},
		{
			id: 'bi_center',
			name: '창업보육센터',
			description: '전북 지역 창업보육센터 정보'
		}
	];

	// 각 크롤러의 상태를 저장
	let crawlerStates = $state<Record<string, CrawlerState>>({
		jbtp: {
			status: 'idle',
			progress: 0,
			total: 0,
			success: 0,
			failed: 0,
			logs: []
		},
		ntis: {
			status: 'idle',
			progress: 0,
			total: 0,
			success: 0,
			failed: 0,
			logs: []
		},
		bizinfo: {
			status: 'idle',
			progress: 0,
			total: 0,
			success: 0,
			failed: 0,
			logs: []
		},
		bi_center: {
			status: 'idle',
			progress: 0,
			total: 0,
			success: 0,
			failed: 0,
			logs: []
		}
	});

	let selectedSource = $state<string | null>(null);
	let keywordManagerSource = $state<string | null>(null);
	let reportSource = $state<string | null>(null);

	onMount(async () => {
		// Load initial status
		await loadAllStatus();
	});

	onDestroy(() => {
		// Close all WebSocket connections
		Object.values(crawlerStates).forEach((state) => {
			if (state.ws) {
				state.ws.close();
			}
		});
	});

	async function loadAllStatus() {
		try {
			const response = await fetch('http://localhost:8000/api/crawling/status');
			const data = await response.json();

			// Update states with loaded data
			Object.keys(data).forEach((sourceId) => {
				if (crawlerStates[sourceId]) {
					const sourceData = data[sourceId];
					crawlerStates[sourceId] = {
						...crawlerStates[sourceId],
						status: sourceData.status || 'idle',
						progress: sourceData.progress || 0,
						total: sourceData.total || 0,
						success: sourceData.success || 0,
						failed: sourceData.failed || 0,
						last_run: sourceData.last_run
					};
				}
			});
		} catch (error) {
			console.error('Failed to load crawler status:', error);
			toast.error('크롤러 상태를 불러오는데 실패했습니다.');
		}
	}

	function startCrawling(sourceId: string) {
		const state = crawlerStates[sourceId];

		// Close existing WebSocket if any
		if (state.ws) {
			state.ws.close();
		}

		// Reset state
		state.status = 'running';
		state.progress = 0;
		state.total = 0;
		state.success = 0;
		state.failed = 0;
		state.logs = [];
		state.error_message = undefined;

		// Connect WebSocket
		const ws = new WebSocket(`ws://localhost:8000/api/crawling/ws/${sourceId}`);

		ws.onopen = () => {
			console.log(`WebSocket connected for ${sourceId}`);
			toast.success(`${sources.find((s) => s.id === sourceId)?.name} 크롤링을 시작합니다.`);
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				handleWebSocketEvent(sourceId, data);
			} catch (error) {
				console.error('Failed to parse WebSocket message:', error);
			}
		};

		ws.onerror = (error) => {
			console.error(`WebSocket error for ${sourceId}:`, error);
			state.status = 'error';
			state.error_message = 'WebSocket 연결 오류';
			toast.error('WebSocket 연결에 실패했습니다.');
		};

		ws.onclose = () => {
			console.log(`WebSocket closed for ${sourceId}`);
			state.ws = undefined;
		};

		state.ws = ws;

		// Show status panel
		selectedSource = sourceId;
	}

	async function stopCrawling(sourceId: string) {
		try {
			const response = await fetch(`http://localhost:8000/api/crawling/${sourceId}/stop`, {
				method: 'POST'
			});

			if (response.ok) {
				toast.info('크롤링 중단 요청을 전송했습니다.');

				// Close WebSocket
				const state = crawlerStates[sourceId];
				if (state.ws) {
					state.ws.close();
					state.ws = undefined;
				}
			}
		} catch (error) {
			console.error('Failed to stop crawling:', error);
			toast.error('크롤링 중단에 실패했습니다.');
		}
	}

	function handleWebSocketEvent(sourceId: string, event: any) {
		const state = crawlerStates[sourceId];

		switch (event.type) {
			case 'start':
				state.logs.push({
					timestamp: event.timestamp,
					message: event.message,
					type: 'info'
				});
				break;

			case 'progress':
				state.progress = event.progress || 0;
				state.total = event.total || 0;
				state.success = event.success || 0;
				state.failed = event.failed || 0;

				state.logs.push({
					timestamp: event.timestamp,
					message: `진행: ${event.progress}/${event.total} (${event.percentage}%)`,
					type: 'info'
				});
				break;

			case 'log':
				state.logs.push({
					timestamp: event.timestamp,
					message: event.message,
					type: 'info'
				});
				break;

			case 'complete':
				state.status = 'completed';
				state.logs.push({
					timestamp: event.timestamp,
					message: event.message,
					type: 'success'
				});

				toast.success(event.message);

				// Close WebSocket
				if (state.ws) {
					state.ws.close();
					state.ws = undefined;
				}
				break;

			case 'error':
				state.status = 'error';
				state.error_message = event.message;
				state.logs.push({
					timestamp: event.timestamp,
					message: event.message,
					type: 'error'
				});

				toast.error(event.message);
				break;

			case 'stopped':
				state.status = 'stopped';
				state.logs.push({
					timestamp: event.timestamp,
					message: event.message,
					type: 'warning'
				});
				break;
		}

		// Trigger reactivity
		crawlerStates = { ...crawlerStates };
	}
</script>

<svelte:head>
	<title>설정 - JB SQUARE Backoffice</title>
</svelte:head>

<div class="settings-page">
	<!-- Page Header -->
	<div class="page-header">
		<div>
			<h1 class="page-title">SETTINGS</h1>
			<p class="page-subtitle">크롤링 소스 관리</p>
		</div>
	</div>

	<!-- Crawler Cards Grid -->
	<div class="crawler-grid">
		{#each sources as source}
			<div class="crawler-card-wrapper">
				<CrawlingCard
					sourceId={source.id}
					sourceName={source.name}
					description={source.description}
					status={crawlerStates[source.id].status}
					lastRun={crawlerStates[source.id].last_run}
					progress={crawlerStates[source.id].progress}
					total={crawlerStates[source.id].total}
					success={crawlerStates[source.id].success}
					failed={crawlerStates[source.id].failed}
					onStart={() => startCrawling(source.id)}
					onStop={() => stopCrawling(source.id)}
				/>

				<!-- Card Actions -->
				<div class="card-actions">
					<button
						class="action-button"
						onclick={() => (keywordManagerSource = source.id)}
						title="키워드 설정"
					>
						🔑 키워드
					</button>
					<button
						class="action-button"
						onclick={() => (reportSource = source.id)}
						title="리포트 보기"
					>
						📊 리포트
					</button>
				</div>
			</div>
		{/each}
	</div>

	<!-- Crawling Status Panel -->
	{#if selectedSource && crawlerStates[selectedSource]}
		{@const state = crawlerStates[selectedSource]}
		{@const source = sources.find((s) => s.id === selectedSource)}
		<Panel>
			<CrawlingStatus
				sourceId={selectedSource}
				sourceName={source?.name || selectedSource}
				status={state.status}
				progress={state.progress}
				total={state.total}
				success={state.success}
				failed={state.failed}
				logs={state.logs}
				errorMessage={state.error_message}
			/>
		</Panel>
	{/if}

	<!-- Keyword Manager Modal -->
	{#if keywordManagerSource}
		{@const source = sources.find((s) => s.id === keywordManagerSource)}
		<div class="modal-overlay" onclick={() => (keywordManagerSource = null)}>
			<div class="modal-content" onclick={(e) => e.stopPropagation()}>
				<KeywordManager
					sourceId={keywordManagerSource}
					sourceName={source?.name || keywordManagerSource}
					onClose={() => (keywordManagerSource = null)}
				/>
			</div>
		</div>
	{/if}

	<!-- Crawling Report Modal -->
	{#if reportSource}
		{@const source = sources.find((s) => s.id === reportSource)}
		<div class="modal-overlay" onclick={() => (reportSource = null)}>
			<div class="modal-content modal-large" onclick={(e) => e.stopPropagation()}>
				<CrawlingReport sourceId={reportSource} sourceName={source?.name || reportSource} />
				<div class="modal-actions">
					<button class="close-modal-button" onclick={() => (reportSource = null)}>
						닫기
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* ========================================
     SETTINGS PAGE
     ======================================== */

	.settings-page {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* ========================================
     PAGE HEADER
     ======================================== */

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-2);
	}

	.page-title {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
		text-transform: uppercase;
		margin-bottom: var(--space-1);
	}

	.page-subtitle {
		font-size: var(--text-base);
		color: var(--muted);
	}

	/* ========================================
     CRAWLER GRID
     ======================================== */

	.crawler-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--space-6);
	}

	.crawler-card-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.card-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}

	.action-button {
		padding: var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.action-button:hover {
		background-color: var(--surface-1);
		border-color: var(--muted);
	}

	/* ========================================
     MODAL
     ======================================== */

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.modal-content {
		background-color: var(--bg);
		max-height: 90vh;
		overflow-y: auto;
		animation: modal-in 0.2s var(--ease-out);
	}

	.modal-large {
		width: 90%;
		max-width: 1200px;
	}

	@keyframes modal-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		padding: var(--space-5);
		border-top: var(--border-width) solid var(--hair);
	}

	.close-modal-button {
		padding: var(--space-3) var(--space-6);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.close-modal-button:hover {
		background-color: var(--surface-1);
		border-color: var(--muted);
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 768px) {
		.settings-page {
			padding: var(--space-4);
		}

		.crawler-grid {
			grid-template-columns: 1fr;
		}

		.modal-content {
			max-height: 95vh;
		}

		.modal-large {
			width: 100%;
		}
	}
</style>
