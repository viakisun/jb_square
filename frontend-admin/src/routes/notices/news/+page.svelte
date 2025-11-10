<script lang="ts">
	/**
	 * RSS 뉴스 페이지
	 * RSS 뉴스 크롤링 (MFDS + MOHW) + 게시된 뉴스 관리
	 */
	import { Panel } from '$lib/components/layout';
	import { Button } from '$lib/components/ui/buttons';
	import { CrawlingStatus, RSSConfigInline } from '$lib/components/crawling';
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

	// RSS 소스 목록
	const RSS_SOURCES = [
		{ source_id: 'source:news:mfds', name: '식약처', fullName: '식품의약품안전처' },
		{ source_id: 'source:news:mohw', name: '복지부', fullName: '보건복지부' }
	];

	// Tab state
	let activeTab = $state<'queue' | 'published'>('queue');

	// Source selection
	let selectedSourceId = $state<string>(RSS_SOURCES[0].source_id);

	// Queue state
	let queueItems = $state<any[]>([]);
	let selectedIds = $state<number[]>([]);
	let loading = $state(false);

	// Crawl state
	let crawlStatus = $state<'idle' | 'collecting' | 'processing' | 'completed' | 'error' | 'stopped'>('idle');
	let crawlLogs = $state<LogEntry[]>([]);
	let crawlProgress = $state({ progress: 0, total: 0, success: 0, failed: 0 });
	let errorMessage = $state('');

	// Modal state
	let showAddModal = $state(false);
	let publishedListKey = $state(0);

	// Derived
	let selectedSource = $derived(RSS_SOURCES.find(s => s.source_id === selectedSourceId));

	// Reactive effect: reload queue when source changes or on mount
	$effect(() => {
		selectedSourceId;  // Track dependency
		loadQueue();
	});

	async function loadQueue() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/list?source_id=${selectedSourceId}`);
			const data = await res.json();
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

	async function crawlRSSNews() {
		loading = true;
		crawlStatus = 'collecting';
		crawlLogs = [];
		crawlProgress = { progress: 0, total: 0, success: 0, failed: 0 };
		errorMessage = '';

		try {
			const ws = new WebSocket(`${WS_BASE_URL}/api/crawling/ws/rss/${selectedSourceId}`);

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

					case 'phase_change':
						if (data.phase === 'filtering') {
							crawlStatus = 'processing';
						}
						crawlLogs = [...crawlLogs, { timestamp, message: data.message, type: 'info' }];
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
							{ timestamp, message: data.message || 'RSS 크롤링 완료', type: 'success' },
							{ timestamp, message: `크롤링 대기열 탭에서 ${crawlProgress.success}개의 뉴스를 확인하세요`, type: 'info' }
						];
						loading = false;
						activeTab = 'queue';
						break;

					case 'error':
						crawlStatus = 'error';
						errorMessage = data.message || 'RSS 크롤링 중 오류 발생';
						crawlLogs = [...crawlLogs, { timestamp, message: data.message, type: 'error' }];
						loading = false;
						break;

					case 'stopped':
						crawlStatus = 'stopped';
						crawlLogs = [...crawlLogs, { timestamp, message: data.message || 'RSS 크롤링 중단됨', type: 'warning' }];
						loading = false;
						break;
				}
			};

			ws.onerror = (error) => {
				console.error('WebSocket error:', error);
				crawlStatus = 'error';
				errorMessage = 'WebSocket 연결 오류';
				loading = false;
			};

			ws.onclose = () => {
				if (crawlStatus === 'collecting' || crawlStatus === 'processing') {
					crawlStatus = 'completed';
				}
				loadQueue();
				loading = false;
			};
		} catch (error) {
			console.error('Failed to start crawling:', error);
			crawlStatus = 'error';
			errorMessage = '크롤링 시작 실패';
			loading = false;
			toast.error('크롤링 시작 실패');
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
			toast.success(`${data.published}개 뉴스가 게시되었습니다`);
			await loadQueue();
			selectedIds = [];
			activeTab = 'published';
			publishedListKey++;
		} catch (error) {
			console.error('Publish failed:', error);
			toast.error('게시 실패');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>RSS 뉴스 - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">RSS 뉴스</h1>
			<p class="page-subtitle">RSS 피드 뉴스 크롤링 및 관리 (식약처, 복지부)</p>
		</div>
		<div class="header-actions">
			<Button variant="outline" onclick={() => (showAddModal = true)}>
				+ 수동 추가
			</Button>
		</div>
	</div>

	<!-- Crawler Config Panel -->
	<Panel title="RSS 뉴스 크롤러">
		<div class="crawler-card-content">
			<div class="source-selector">
				<label class="source-label">RSS 소스 선택</label>
				<div class="source-buttons">
					{#each RSS_SOURCES as source}
						<button
							onclick={() => {
								selectedSourceId = source.source_id;
								crawlStatus = 'idle';
								crawlLogs = [];
							}}
							class="source-button {selectedSourceId === source.source_id ? 'active' : ''}"
						>
							{source.fullName}
						</button>
					{/each}
				</div>
			</div>
			<p class="crawler-description">
				{selectedSource?.fullName}의 RSS 피드를 통해 뉴스를 수집합니다.
			</p>
			<Button variant="primary" onclick={crawlRSSNews} disabled={loading}>
				{loading ? '크롤링 중...' : 'RSS 크롤링 시작'}
			</Button>
		</div>
	</Panel>

	<!-- Crawling Configuration -->
	<RSSConfigInline selectedSourceId={selectedSourceId} />

	<!-- Crawling Status -->
	{#if crawlStatus !== 'idle'}
		<Panel title="크롤링 진행 상황">
			<CrawlingStatus
				sourceId={selectedSourceId}
				sourceName={selectedSource?.fullName || 'RSS 뉴스'}
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
			게시된 뉴스
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
		<Panel title="게시된 뉴스">
			{#key publishedListKey}
				<PublishedNoticesList sourceId={selectedSourceId} />
			{/key}
		</Panel>
	{/if}

	<!-- Add Notice Modal -->
	{#if showAddModal}
		<AddNoticeModal
			sourceId={selectedSourceId}
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

	.source-selector {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.source-label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
	}

	.source-buttons {
		display: flex;
		gap: var(--space-2);
	}

	.source-button {
		padding: var(--space-2) var(--space-4);
		background: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		cursor: pointer;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		transition: all 0.2s;
	}

	.source-button:hover {
		background: var(--surface-2);
		color: var(--fg);
	}

	.source-button.active {
		background: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
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

		.source-buttons {
			flex-direction: column;
		}
	}
</style>
