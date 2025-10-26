<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/layout';
	import { Button } from '$lib/components/ui/buttons';
	import { Select } from '$lib/components/ui/forms';
	import CrawlQueueTable from '$lib/components/notices/CrawlQueueTable.svelte';
	import { CrawlingStatus } from '$lib/components/crawling';

	const API_BASE = 'http://localhost:8000/api';

	interface LogEntry {
		timestamp: string;
		message: string;
		type?: 'info' | 'success' | 'error' | 'warning';
	}

	let queueItems = $state([]);
	let selectedIds = $state<number[]>([]);
	let selectedTags = $state<string[]>([]);
	let loading = $state(false);

	// Real-time crawling status
	let crawlStatus = $state<'idle' | 'running' | 'completed' | 'error' | 'stopped'>('idle');
	let crawlLogs = $state<LogEntry[]>([]);
	let crawlProgress = $state({ progress: 0, total: 0, success: 0, failed: 0 });
	let currentCrawlSource = $state<{ id: string; name: string } | null>(null);
	let errorMessage = $state('');

	// For smooth UX flow
	let queuePanelRef: HTMLElement | null = null;
	let previousQueueCount = $state(0);

	async function loadQueue() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE}/notices/crawl-queue/list?source_id=jbtp&source_id=ntis`);
			const data = await res.json();
			queueItems = data.items;
		} catch (error) {
			console.error('Failed to load queue:', error);
		} finally {
			loading = false;
		}
	}

	async function crawlJBTP() {
		loading = true;
		crawlStatus = 'running';
		crawlLogs = [];
		crawlProgress = { progress: 0, total: 0, success: 0, failed: 0 };
		currentCrawlSource = { id: 'jbtp', name: 'JBTP' };
		errorMessage = '';
		previousQueueCount = queueItems.length;

		try {
			const ws = new WebSocket(`ws://localhost:8000/api/notices/crawl/jbtp`);

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const timestamp = new Date().toISOString();

				switch (data.type) {
					case 'start':
						crawlLogs = [
							...crawlLogs,
							{ timestamp, message: data.message || '크롤링을 시작합니다...', type: 'info' }
						];
						break;

					case 'log':
						crawlLogs = [...crawlLogs, { timestamp, message: data.message, type: 'info' }];
						break;

					case 'progress':
						crawlProgress = {
							progress: data.progress || 0,
							total: data.total || 0,
							success: data.success || 0,
							failed: data.failed || 0
						};
						if (data.message) {
							crawlLogs = [...crawlLogs, { timestamp, message: data.message, type: 'info' }];
						}
						break;

					case 'complete':
						crawlStatus = 'completed';
						crawlLogs = [
							...crawlLogs,
							{
								timestamp,
								message: data.message || '크롤링이 완료되었습니다.',
								type: 'success'
							},
							{
								timestamp,
								message: `📋 아래 '크롤링 대기열'에서 수집된 ${crawlProgress.success}개의 공고를 확인하세요`,
								type: 'info'
							}
						];
						loading = false;
						// Scroll to queue panel after completion
						setTimeout(() => {
							queuePanelRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}, 800);
						break;

					case 'error':
						crawlStatus = 'error';
						errorMessage = data.message || '크롤링 중 오류가 발생했습니다.';
						crawlLogs = [
							...crawlLogs,
							{ timestamp, message: data.message || 'Error occurred', type: 'error' }
						];
						loading = false;
						break;

					case 'stopped':
						crawlStatus = 'stopped';
						crawlLogs = [
							...crawlLogs,
							{ timestamp, message: data.message || '크롤링이 중단되었습니다.', type: 'warning' }
						];
						loading = false;
						break;
				}
			};

			ws.onclose = () => {
				if (crawlStatus === 'running') {
					crawlStatus = 'completed';
				}
				loadQueue();
				loading = false;
			};

			ws.onerror = (error) => {
				crawlStatus = 'error';
				errorMessage = '웹소켓 연결 오류가 발생했습니다.';
				crawlLogs = [
					...crawlLogs,
					{
						timestamp: new Date().toISOString(),
						message: '웹소켓 연결 오류가 발생했습니다.',
						type: 'error'
					}
				];
				loading = false;
			};
		} catch (error) {
			crawlStatus = 'error';
			errorMessage = String(error);
			loading = false;
		}
	}

	async function crawlNTIS() {
		loading = true;
		crawlStatus = 'running';
		crawlLogs = [];
		crawlProgress = { progress: 0, total: 0, success: 0, failed: 0 };
		currentCrawlSource = { id: 'ntis', name: 'NTIS' };
		errorMessage = '';
		previousQueueCount = queueItems.length;

		try {
			const ws = new WebSocket(`ws://localhost:8000/api/notices/crawl/ntis`);

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const timestamp = new Date().toISOString();

				switch (data.type) {
					case 'start':
						crawlLogs = [
							...crawlLogs,
							{ timestamp, message: data.message || '크롤링을 시작합니다...', type: 'info' }
						];
						break;

					case 'log':
						crawlLogs = [...crawlLogs, { timestamp, message: data.message, type: 'info' }];
						break;

					case 'progress':
						crawlProgress = {
							progress: data.progress || 0,
							total: data.total || 0,
							success: data.success || 0,
							failed: data.failed || 0
						};
						if (data.message) {
							crawlLogs = [...crawlLogs, { timestamp, message: data.message, type: 'info' }];
						}
						break;

					case 'complete':
						crawlStatus = 'completed';
						crawlLogs = [
							...crawlLogs,
							{
								timestamp,
								message: data.message || '크롤링이 완료되었습니다.',
								type: 'success'
							},
							{
								timestamp,
								message: `📋 아래 '크롤링 대기열'에서 수집된 ${crawlProgress.success}개의 공고를 확인하세요`,
								type: 'info'
							}
						];
						loading = false;
						// Scroll to queue panel after completion
						setTimeout(() => {
							queuePanelRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}, 800);
						break;

					case 'error':
						crawlStatus = 'error';
						errorMessage = data.message || '크롤링 중 오류가 발생했습니다.';
						crawlLogs = [
							...crawlLogs,
							{ timestamp, message: data.message || 'Error occurred', type: 'error' }
						];
						loading = false;
						break;

					case 'stopped':
						crawlStatus = 'stopped';
						crawlLogs = [
							...crawlLogs,
							{ timestamp, message: data.message || '크롤링이 중단되었습니다.', type: 'warning' }
						];
						loading = false;
						break;
				}
			};

			ws.onclose = () => {
				if (crawlStatus === 'running') {
					crawlStatus = 'completed';
				}
				loadQueue();
				loading = false;
			};

			ws.onerror = (error) => {
				crawlStatus = 'error';
				errorMessage = '웹소켓 연결 오류가 발생했습니다.';
				crawlLogs = [
					...crawlLogs,
					{
						timestamp: new Date().toISOString(),
						message: '웹소켓 연결 오류가 발생했습니다.',
						type: 'error'
					}
				];
				loading = false;
			};
		} catch (error) {
			crawlStatus = 'error';
			errorMessage = String(error);
			loading = false;
		}
	}

	async function publishSelected() {
		if (selectedIds.length === 0) return;

		loading = true;
		try {
			const res = await fetch(`${API_BASE}/notices/publish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					queue_ids: selectedIds,
					category: 'government',
					tags: selectedTags
				})
			});
			const data = await res.json();
			console.log('Published:', data);
			await loadQueue();
			selectedIds = [];
		} catch (error) {
			console.error('Publish failed:', error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadQueue();
	});
</script>

<svelte:head>
	<title>정부/지자체 공고 - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">정부/지자체 공고</h1>
			<p class="page-subtitle">JBTP, NTIS 크롤링 및 공고 관리</p>
		</div>
		<div class="header-actions">
			<Button variant="outline" onclick={crawlJBTP} disabled={loading}>
				JBTP 크롤링
			</Button>
			<Button variant="outline" onclick={crawlNTIS} disabled={loading}>
				NTIS 크롤링
			</Button>
			<Button variant="primary" onclick={publishSelected} disabled={selectedIds.length === 0 || loading}>
				선택 항목 게시 ({selectedIds.length})
			</Button>
		</div>
	</div>

	{#if crawlStatus !== 'idle' && currentCrawlSource}
		<Panel title="크롤링 진행 상황">
			<CrawlingStatus
				sourceId={currentCrawlSource.id}
				sourceName={currentCrawlSource.name}
				status={crawlStatus}
				progress={crawlProgress.progress}
				total={crawlProgress.total}
				success={crawlProgress.success}
				failed={crawlProgress.failed}
				logs={crawlLogs}
				{errorMessage}
			/>
		</Panel>
	{/if}

	<div bind:this={queuePanelRef} class="queue-panel {crawlStatus === 'completed' ? 'highlight-pulse' : ''}">
		<Panel title="크롤링 대기열">
			<CrawlQueueTable
				bind:items={queueItems}
				onSelectionChange={(ids) => (selectedIds = ids)}
				onRefresh={loadQueue}
			/>
		</Panel>
	</div>

	{#if selectedIds.length > 0}
		<Panel title="태그 선택">
			<div class="tag-selector">
				<label>
					<input type="checkbox" bind:group={selectedTags} value="R&D" />
					R&D
				</label>
				<label>
					<input type="checkbox" bind:group={selectedTags} value="바이오" />
					바이오
				</label>
				<label>
					<input type="checkbox" bind:group={selectedTags} value="창업" />
					창업
				</label>
				<label>
					<input type="checkbox" bind:group={selectedTags} value="기술이전" />
					기술이전
				</label>
			</div>
		</Panel>
	{/if}
</div>

<style>
	.page {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

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

	.header-actions {
		display: flex;
		gap: var(--space-3);
	}

	.tag-selector {
		display: flex;
		gap: var(--space-4);
		padding: var(--space-4);
		border: var(--border-width) solid var(--hair);
	}

	.tag-selector label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
	}

	/* Queue panel highlight animation */
	.queue-panel {
		transition: all 0.3s ease;
	}

	.queue-panel.highlight-pulse {
		animation: pulse-border 2s ease-in-out 2;
	}

	@keyframes pulse-border {
		0%, 100% {
			outline: 2px solid transparent;
			outline-offset: 0px;
		}
		50% {
			outline: 2px solid var(--fg);
			outline-offset: 4px;
		}
	}
</style>
