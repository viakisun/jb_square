<script lang="ts">
	/**
	 * NTIS 정부 공고 페이지
	 * NTIS 크롤링 + 게시된 공고 관리
	 */
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/layout';
	import { Button } from '$lib/components/ui/buttons';
	import { CrawlingStatus, NTISConfigInline } from '$lib/components/crawling';
	import {
		CrawlQueueTable,
		PublishedNoticesList,
		AddNoticeModal
	} from '$lib/components/notices';
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
	let queueItems = $state([]);
	let selectedIds = $state<number[]>([]);
	let loading = $state(false);

	// Crawl state
	let crawlStatus = $state<'idle' | 'running' | 'completed' | 'error' | 'stopped'>('idle');
	let crawlLogs = $state<LogEntry[]>([]);
	let crawlProgress = $state({ progress: 0, total: 0, success: 0, failed: 0 });
	let errorMessage = $state('');

	// Modal state
	let showAddModal = $state(false);

	onMount(() => {
		loadQueue();
	});

	async function loadQueue() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/list?source_id=ntis_rss`);
			const data = await res.json();
			queueItems = data.items;
		} catch (error) {
			console.error('Failed to load queue:', error);
			toast.error('대기열 로드 실패');
		} finally {
			loading = false;
		}
	}

	async function crawlNTISRSS() {
		loading = true;
		crawlStatus = 'running';
		crawlLogs = [];
		crawlProgress = { progress: 0, total: 0, success: 0, failed: 0 };
		errorMessage = '';

		try {
			const ws = new WebSocket(`${WS_BASE_URL}/api/notices/crawl/ntis_rss`);

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const timestamp = new Date().toISOString();

				switch (data.type) {
					case 'start':
						crawlLogs = [...crawlLogs, { timestamp, message: data.message || 'RSS 크롤링 시작...', type: 'info' }];
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
						const totalCollected = data.total_collected || crawlProgress.success;
						crawlLogs = [
							...crawlLogs,
							{ timestamp, message: data.message || 'RSS 크롤링 완료', type: 'success' },
							{ timestamp, message: `📋 크롤링 대기열 탭에서 ${totalCollected}개의 공고를 확인하세요`, type: 'info' }
						];
						loading = false;
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
				if (crawlStatus === 'running') {
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
			toast.success(`${data.published}개 공고가 게시되었습니다`);
			await loadQueue();
			selectedIds = [];
			activeTab = 'published'; // Switch to published tab
		} catch (error) {
			console.error('Publish failed:', error);
			toast.error('게시 실패');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>정부 공고 (NTIS) - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">정부 공고 (NTIS)</h1>
			<p class="page-subtitle">국가R&D 공고 크롤링 및 관리</p>
		</div>
		<div class="header-actions">
			<Button variant="outline" onclick={() => (showAddModal = true)}>
				+ 수동 추가
			</Button>
		</div>
	</div>

	<!-- Crawler Config Panel -->
	<Panel title="NTIS 국가R&D 크롤러">
		<div class="crawler-card-content">
			<p class="crawler-description">
				NTIS RSS 피드를 통해 국가R&D 공고를 수집합니다.
			</p>
			<Button variant="primary" onclick={crawlNTISRSS} disabled={loading}>
				{loading ? '크롤링 중...' : 'RSS 크롤링 시작'}
			</Button>
		</div>
	</Panel>

	<!-- Crawling Configuration -->
	<NTISConfigInline />

	<!-- Crawling Status -->
	{#if crawlStatus !== 'idle'}
		<Panel title="크롤링 진행 상황">
			<CrawlingStatus
				sourceId="ntis"
				sourceName="NTIS"
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
			게시된 공고
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
		<Panel title="게시된 공고">
			<PublishedNoticesList sourceId="source:ntis:rss" />
		</Panel>
	{/if}

	<!-- Add Notice Modal -->
	{#if showAddModal}
		<AddNoticeModal
			sourceId="source:ntis:rss"
			onClose={() => (showAddModal = false)}
			onSuccess={() => {
				loadQueue();
				activeTab = 'published';
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
