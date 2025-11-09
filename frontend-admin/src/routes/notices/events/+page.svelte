<script lang="ts">
	/**
	 * 교육/행사 페이지 (JBTP Events)
	 * JBTP 교육/행사 크롤링 + 게시된 공고 관리
	 */
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/layout';
	import { Button } from '$lib/components/ui/buttons';
	import { CrawlingStatus } from '$lib/components/crawling';
	import {
		CrawlQueueTable,
		PublishedNoticesList,
		AddNoticeModal
	} from '$lib/components/notices';
	import JBTPConfigInline from '$lib/components/crawling/JBTPConfigInline.svelte';
	import { toast } from '$lib/stores/toast';
	import { API_BASE_URL, WS_BASE_URL } from '$lib/config/api';

	interface LogEntry {
		timestamp: string;
		message: string;
		type?: 'info' | 'success' | 'error' | 'warning';
	}

	// Tab state
	let activeTab = $state<'queue' | 'published'>('queue');

	// Queue state
	let queueItems = $state<any[]>([]);
	let selectedIds = $state<number[]>([]);
	let loading = $state(false);

	// Crawl state (two-phase: collecting + processing)
	let crawlStatus = $state<'idle' | 'collecting' | 'processing' | 'completed' | 'error' | 'stopped'>('idle');
	let crawlLogs = $state<LogEntry[]>([]);
	let crawlProgress = $state({ progress: 0, total: 0, success: 0, failed: 0 });
	let pageProgress = $state({ page: 0, accumulated: 0 });
	let errorMessage = $state('');

	// Modal state
	let showAddModal = $state(false);
	let publishedListKey = $state(0); // Key to force re-mount

	onMount(() => {
		loadQueue();
	});

	async function loadQueue() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/list?source_id=jbtp_events`);
			const data = await res.json();
			// Remove duplicates by ID
			const uniqueItems = Array.from(
				new Map(data.items.map((item: any) => [item.id, item])).values()
			);
			queueItems = uniqueItems;
		} catch (error) {
			console.error('Failed to load queue:', error);
			toast.error('대기열 로드 실패');
		} finally {
			loading = false;
		}
	}

	async function crawlJBTPEvents() {
		loading = true;
		crawlStatus = 'collecting';
		crawlLogs = [];
		crawlProgress = { progress: 0, total: 0, success: 0, failed: 0 };
		pageProgress = { page: 0, accumulated: 0 };
		errorMessage = '';

		try {
			const ws = new WebSocket(`${WS_BASE_URL}/api/notices/crawl/jbtp_events`);

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const timestamp = new Date().toISOString();

				switch (data.type) {
					case 'start':
						crawlLogs = [...crawlLogs, { timestamp, message: data.message || '크롤링 시작...', type: 'info' }];
						break;

					case 'log':
						crawlLogs = [...crawlLogs, { timestamp, message: data.message, type: 'info' }];
						break;

					case 'page_progress':
						crawlStatus = 'collecting';
						pageProgress = {
							page: data.page || 0,
							accumulated: data.accumulated || 0
						};
						break;

					case 'collection_complete':
						crawlStatus = 'processing';
						crawlLogs = [
							...crawlLogs,
							{
								timestamp,
								message: `✓ ${data.total_collected}개 행사 수집 완료. 상세 정보 수집 시작...`,
								type: 'success'
							}
						];
						break;

					case 'item_added':
						if (data.item) {
							queueItems = [data.item, ...queueItems];
						}
						break;

					case 'progress':
						crawlStatus = 'processing';
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
							{ timestamp, message: data.message || '크롤링 완료', type: 'success' },
							{ timestamp, message: `📋 크롤링 대기열 탭에서 ${crawlProgress.success}개의 행사를 확인하세요`, type: 'info' }
						];
						loading = false;
						activeTab = 'queue';
						break;

					case 'error':
						crawlStatus = 'error';
						errorMessage = data.message || '크롤링 중 오류 발생';
						crawlLogs = [...crawlLogs, { timestamp, message: data.message, type: 'error' }];
						loading = false;
						break;

					case 'stopped':
						crawlStatus = 'stopped';
						crawlLogs = [...crawlLogs, { timestamp, message: data.message || '크롤링 중단됨', type: 'warning' }];
						loading = false;
						break;
				}
			};

			ws.onclose = () => {
				if (crawlStatus === 'collecting' || crawlStatus === 'processing') {
					crawlStatus = 'completed';
				}
				loadQueue();
				loading = false;
			};

			ws.onerror = (error) => {
				crawlStatus = 'error';
				errorMessage = '웹소켓 연결 오류';
				crawlLogs = [...crawlLogs, { timestamp: new Date().toISOString(), message: '웹소켓 연결 오류', type: 'error' }];
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
			const res = await fetch(`${API_BASE_URL}/notices/publish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					queue_ids: selectedIds,
					tags: []
				})
			});
			const data = await res.json();
			toast.success(`${data.published}개 행사가 게시되었습니다`);
			await loadQueue();
			selectedIds = [];
			activeTab = 'published'; // Switch to published tab
			publishedListKey++; // Force re-mount
		} catch (error) {
			console.error('Publish failed:', error);
			toast.error('게시 실패');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>교육/행사 - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">교육/행사</h1>
			<p class="page-subtitle">JBTP 교육 및 행사 정보 크롤링 및 관리</p>
		</div>
		<div class="header-actions">
			<Button variant="outline" onclick={() => (showAddModal = true)}>
				+ 수동 추가
			</Button>
		</div>
	</div>

	<!-- Crawler Config Panel -->
	<Panel title="JBTP 교육/행사 크롤러">
		<div class="crawler-card-content">
			<p class="crawler-description">
				전북테크노파크의 교육 및 행사 정보를 수집합니다.
			</p>
			<Button variant="primary" onclick={crawlJBTPEvents} disabled={loading}>
				{loading ? '크롤링 중...' : '교육/행사 크롤링 시작'}
			</Button>
		</div>
	</Panel>

	<!-- Crawling Configuration -->
	<JBTPConfigInline configType="events" />

	<!-- Crawling Status -->
	{#if crawlStatus !== 'idle'}
		<Panel title="크롤링 진행 상황">
			{#if crawlStatus === 'collecting'}
				<div class="phase-indicator">
					<span class="phase-label">🔍 페이지 수집 중...</span>
					<span class="phase-info">
						페이지 {pageProgress.page} | 누적 {pageProgress.accumulated}개
					</span>
				</div>
			{:else if crawlStatus === 'processing'}
				<div class="phase-indicator processing">
					<span class="phase-label">⚙️ 상세 정보 수집 중...</span>
					<span class="phase-info">
						{crawlProgress.progress} / {crawlProgress.total}
					</span>
				</div>
			{/if}

			<CrawlingStatus
				sourceId="jbtp_events"
				sourceName="JBTP 교육/행사"
				status={crawlStatus === 'collecting' || crawlStatus === 'processing' ? 'running' : crawlStatus}
				progress={crawlProgress.progress}
				total={crawlProgress.total}
				success={crawlProgress.success}
				failed={crawlProgress.failed}
				logs={crawlLogs}
				{errorMessage}
			/>
		</Panel>
	{/if}

	<!-- Tabs -->
	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'queue'}
			onclick={() => (activeTab = 'queue')}
		>
			크롤링 대기열
		</button>
		<button
			class="tab"
			class:active={activeTab === 'published'}
			onclick={() => (activeTab = 'published')}
		>
			게시된 행사
		</button>
	</div>

	<!-- Tab Content -->
	{#if activeTab === 'queue'}
		<Panel title="크롤링 대기열">
			<CrawlQueueTable
				bind:items={queueItems}
				onSelectionChange={(ids) => (selectedIds = ids)}
				onRefresh={loadQueue}
			/>

			{#if selectedIds.length > 0}
				<div class="queue-actions">
					<Button onclick={publishSelected} disabled={loading}>
						선택 항목 게시 ({selectedIds.length})
					</Button>
				</div>
			{/if}
		</Panel>
	{:else}
		<Panel title="게시된 행사">
			{#key publishedListKey}
				<PublishedNoticesList sourceId="source:jbtp:events" />
			{/key}
		</Panel>
	{/if}

	<!-- Add Notice Modal -->
	{#if showAddModal}
		<AddNoticeModal
			sourceId="source:jbtp:events"
			onClose={() => (showAddModal = false)}
			onSuccess={() => {
				loadQueue();
				activeTab = 'published';
				publishedListKey++;
			}}
		/>
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

	.crawler-card-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.crawler-description {
		color: var(--muted);
		font-size: var(--text-sm);
		line-height: 1.6;
	}

	.phase-indicator {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4);
		margin-bottom: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		font-family: var(--font-mono);
	}

	.phase-label {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.phase-info {
		font-size: var(--text-sm);
		color: var(--muted);
	}

	.phase-indicator.processing {
		border-color: var(--fg);
	}

	.tabs {
		display: flex;
		gap: var(--space-2);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.tab {
		padding: var(--space-3) var(--space-4);
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		transition: all 0.2s;
	}

	.tab:hover {
		color: var(--fg);
	}

	.tab.active {
		color: var(--fg);
		border-bottom-color: var(--fg);
	}

	.queue-actions {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
		margin-top: var(--space-4);
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.tag-selection-wrapper {
		flex: 1;
		min-width: 300px;
	}

	@media (max-width: 768px) {
		.page {
			padding: var(--space-4);
		}

		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-3);
		}

		.header-actions {
			width: 100%;
		}

		.queue-actions {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
