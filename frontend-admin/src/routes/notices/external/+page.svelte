<script lang="ts">
	/**
	 * 유관기관 공고 페이지 (External Organization Notices)
	 * JBTP 유관기관 공고 크롤링 + 게시된 공고 관리
	 */
	import { Panel } from '$lib/components/layout';
	import { Button } from '$lib/components/ui/buttons';
	import { CrawlingStatus, CrawlerConfigInline } from '$lib/components/crawling';
	import {
		NoticeQueueManager,
		PublishedNoticesList,
		AddNoticeModal
	} from '$lib/components/notices';
	import { WS_BASE_URL } from '$lib/config/api';
	import { useCrawlWebSocket } from '$lib/composables/useCrawlWebSocket.svelte';
	import { NoticeSource } from '$lib/constants/sources';

	const SOURCE_ID = NoticeSource.JBTP_EXTERNAL;

	// Tab state
	let activeTab = $state<'queue' | 'published'>('queue');

	// Modal state
	let showAddModal = $state(false);
	let publishedListKey = $state(0); // Key to force re-mount

	// WebSocket composable for crawling
	const crawlWs = useCrawlWebSocket();

	function crawlExternal() {
		const wsUrl = `${WS_BASE_URL}/api/notices/crawl/${SOURCE_ID}`;

		crawlWs.connect(
			wsUrl,
			// onItemAdded callback
			() => {
				// Items will be loaded by NoticeQueueManager
			},
			// onComplete callback
			() => {
				activeTab = 'queue';
			}
		);
	}
</script>

<svelte:head>
	<title>유관기관 공고 - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">유관기관 공고</h1>
			<p class="page-subtitle">JBTP 유관기관 공고 크롤링 및 관리</p>
		</div>
		<div class="header-actions">
			<Button variant="outline" onclick={() => (showAddModal = true)}>
				+ 수동 추가
			</Button>
		</div>
	</div>

	<!-- Crawler Config Panel -->
	<Panel title="JBTP 유관기관 크롤러">
		<div class="crawler-card-content">
			<p class="crawler-description">
				전북테크노파크의 유관기관 공고를 수집합니다.
			</p>
			<Button variant="primary" onclick={crawlExternal} disabled={crawlWs.loading}>
				{crawlWs.loading ? '크롤링 중...' : '유관기관 크롤링 시작'}
			</Button>
		</div>
	</Panel>

	<!-- Crawling Configuration -->
	<CrawlerConfigInline sourceId={SOURCE_ID} />

	<!-- Crawling Status -->
	{#if crawlWs.status !== 'idle'}
		<Panel title="크롤링 진행 상황">
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
				sourceId={SOURCE_ID}
				sourceName="JBTP 유관기관"
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
			<NoticeQueueManager
				sourceId={SOURCE_ID}
				onPublishSuccess={() => {
					activeTab = 'published';
					publishedListKey++;
				}}
			/>
		</Panel>
	{:else}
		<Panel title="게시된 공고">
			{#key publishedListKey}
				<PublishedNoticesList sourceId={SOURCE_ID} />
			{/key}
		</Panel>
	{/if}

	<!-- Add Notice Modal -->
	{#if showAddModal}
		<AddNoticeModal
			sourceId={SOURCE_ID}
			onClose={() => (showAddModal = false)}
			onSuccess={() => {
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
	}
</style>
