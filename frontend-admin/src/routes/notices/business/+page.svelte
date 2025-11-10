<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/layout';
	import { Button } from '$lib/components/ui/buttons';
	import CrawlQueueTable from '$lib/components/notices/CrawlQueueTable.svelte';
	import { CrawlingStatus, CrawlerConfigInline } from '$lib/components/crawling';
	import {
		PublishedNoticesList,
		AddNoticeModal
	} from '$lib/components/notices';
	import { toast } from '$lib/stores/toast';
	import { WS_BASE_URL } from '$lib/config/api';
	import { fetchCrawlQueue } from '$lib/api/crawl-queue';
	import { publishNotices } from '$lib/api/notices';
	import { useCrawlWebSocket } from '$lib/composables/useCrawlWebSocket.svelte';
	import { NoticeSource } from '$lib/constants/sources';

	const SOURCE_ID = NoticeSource.BIZINFO_API;

	// Tab state
	let activeTab = $state<'queue' | 'published'>('queue');

	// Queue state
	let queueItems = $state([]);
	let selectedIds = $state<number[]>([]);
	let loading = $state(false);

	// Modal state
	let showAddModal = $state(false);

	// For smooth UX flow
	let queuePanelRef: HTMLElement | null = null;

	// WebSocket composable for crawling
	const crawlWs = useCrawlWebSocket();

	async function loadQueue() {
		loading = true;
		try {
			queueItems = await fetchCrawlQueue(SOURCE_ID);
		} catch (error) {
			console.error('Failed to load queue:', error);
			toast.error('대기열 로드 실패');
		} finally {
			loading = false;
		}
	}

	function crawlBizinfo() {
		const wsUrl = `${WS_BASE_URL}/api/notices/crawl/${SOURCE_ID}`;

		crawlWs.connect(
			wsUrl,
			// onItemAdded callback
			(item) => {
				queueItems = [item, ...queueItems];
			},
			// onComplete callback
			() => {
				loadQueue();
				// Scroll to queue panel after completion
				setTimeout(() => {
					queuePanelRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}, 800);
			}
		);
	}

	async function publishSelected() {
		if (selectedIds.length === 0) return;

		loading = true;
		try {
			const result = await publishNotices(selectedIds, []);
			toast.success(`${result.published}개 공고가 게시되었습니다`);
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

	onMount(() => {
		loadQueue();
	});
</script>

<svelte:head>
	<title>기업 지원사업 - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">기업 지원사업</h1>
			<p class="page-subtitle">기업마당 API 데이터 수집 및 공고 관리</p>
		</div>
		<div class="header-actions">
			<Button variant="outline" onclick={() => (showAddModal = true)}>
				+ 수동 추가
			</Button>
		</div>
	</div>

	<!-- Crawler Config Panel -->
	<Panel title="기업마당 API 크롤러">
		<div class="crawler-card-content">
			<p class="crawler-description">
				기업마당 API를 통해 최신 기업 지원사업 공고를 수집합니다.
			</p>
			<Button variant="primary" onclick={crawlBizinfo} disabled={crawlWs.loading}>
				{crawlWs.loading ? '크롤링 중...' : 'API 데이터 수집 시작'}
			</Button>
		</div>
	</Panel>

	<!-- Bizinfo Crawler Settings -->
	<CrawlerConfigInline sourceId={SOURCE_ID} />

	{#if crawlWs.status !== 'idle'}
		<Panel title="데이터 수집 진행 상황">
			{#if crawlWs.status === 'collecting'}
				<div class="phase-indicator">
					<span class="phase-label">🔍 페이지 수집 중...</span>
					<span class="phase-info">
						페이지 {crawlWs.pageProgress.page} | 누적 {crawlWs.pageProgress.accumulated}개
					</span>
				</div>
			{:else if crawlWs.status === 'processing'}
				<div class="phase-indicator processing">
					<span class="phase-label">⚙️ 상세 정보 수집 중...</span>
					<span class="phase-info">
						{crawlWs.progress.progress} / {crawlWs.progress.total}
					</span>
				</div>
			{/if}

			<CrawlingStatus
				sourceId="bizinfo"
				sourceName="기업마당"
				status={crawlWs.status === 'collecting' || crawlWs.status === 'processing' ? 'running' : crawlWs.status}
				progress={crawlWs.progress.progress}
				total={crawlWs.progress.total}
				success={crawlWs.progress.success}
				failed={crawlWs.progress.failed}
				logs={crawlWs.logs}
				errorMessage={crawlWs.errorMessage}
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
			<PublishedNoticesList sourceId={SOURCE_ID} />
		</Panel>
	{/if}

	<!-- Add Notice Modal -->
	{#if showAddModal}
		<AddNoticeModal
			sourceId={SOURCE_ID}
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
