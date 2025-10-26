<script lang="ts">
	/**
	 * 지자체 공고 페이지 (JBTP)
	 * 전북테크노파크 크롤링 + 게시된 공고 관리
	 */
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/layout';
	import { Button } from '$lib/components/ui/buttons';
	import { CrawlingStatus, CrawlerConfigCard } from '$lib/components/crawling';
	import {
		CrawlQueueTable,
		PublishedNoticesList,
		AddNoticeModal
	} from '$lib/components/notices';
	import { toast } from '$lib/stores/toast';
	import JBTPConfigInline from '$lib/components/crawling/JBTPConfigInline.svelte';

	const API_BASE = 'http://localhost:8000/api';

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
	let selectedTags = $state<string[]>([]);
	let loading = $state(false);

	// Crawl state
	let crawlStatus = $state<'idle' | 'collecting' | 'processing' | 'completed' | 'error' | 'stopped'>('idle');
	let crawlLogs = $state<LogEntry[]>([]);
	let crawlProgress = $state({ progress: 0, total: 0, success: 0, failed: 0 });
	let crawlStatistics = $state({ total: 0, already_published: 0, in_queue: 0, new_items: 0, matched: 0, unmatched: 0 });
	let pageProgress = $state({ page: 0, accumulated: 0 });
	let errorMessage = $state('');

	// Modal state
	let showAddModal = $state(false);

	// Reference for scrolling to crawling status panel
	let crawlingStatusRef: HTMLElement | null = null;

	// Reference for scrolling to queue section
	let queueSectionRef: HTMLElement | null = null;

	onMount(() => {
		loadQueue();
	});

	async function loadQueue() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE}/notices/crawl-queue/list?source_id=jbtp`);
			const data = await res.json();
			queueItems = data.items;
		} catch (error) {
			console.error('Failed to load queue:', error);
			toast.error('대기열 로드 실패');
		} finally {
			loading = false;
		}
	}

	async function crawlJBTP() {
		loading = true;
		crawlStatus = 'collecting';
		crawlLogs = [];
		crawlProgress = { progress: 0, total: 0, success: 0, failed: 0 };
		crawlStatistics = { total: 0, already_published: 0, in_queue: 0, new_items: 0, matched: 0, unmatched: 0 };
		pageProgress = { page: 0, accumulated: 0 };
		errorMessage = '';

		// Scroll to crawling status panel
		setTimeout(() => {
			crawlingStatusRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);

		try {
			const ws = new WebSocket(`ws://localhost:8000/api/notices/crawl/jbtp`);

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
						// 페이지 수집 진행 (불확정 프로그레스)
						crawlStatus = 'collecting';
						pageProgress = {
							page: data.page || 0,
							accumulated: data.accumulated || 0
						};
						break;

					case 'statistics':
						// 크롤링 통계 (중복 체크 결과)
						crawlStatistics = {
							total: data.total || 0,
							already_published: data.already_published || 0,
							in_queue: data.in_queue || 0,
							new_items: data.new_items || 0,
							matched: data.matched || 0,
							unmatched: data.unmatched || 0
						};
						break;

					case 'collection_complete':
						// 수집 완료, 상세 크롤링 시작
						crawlStatus = 'processing';
						crawlLogs = [
							...crawlLogs,
							{
								timestamp,
								message: `✓ ${data.total_collected}개 공고 수집 완료. 상세 정보 수집 시작...`,
								type: 'success'
							}
						];
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
							{ timestamp, message: `📋 크롤링 대기열 탭에서 ${crawlProgress.success}개의 공고를 확인하세요`, type: 'info' }
						];
						loading = false;
						// 크롤링 완료 시 대기열 섹션으로 스크롤
						activeTab = 'queue';
						setTimeout(() => {
							queueSectionRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}, 300);
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
			const res = await fetch(`${API_BASE}/notices/publish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					queue_ids: selectedIds,
					category: 'government', // DB 카테고리: 'government' (지자체도 government)
					tags: selectedTags
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
	<title>지자체 공고 (JBTP) - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">지자체 공고 (JBTP)</h1>
			<p class="page-subtitle">전북테크노파크 공고 크롤링 및 관리</p>
		</div>
		<div class="header-actions">
			<Button variant="primary" onclick={crawlJBTP} disabled={loading}>
				{loading ? '크롤링 중...' : '크롤링 시작'}
			</Button>
			<Button variant="secondary" onclick={() => (showAddModal = true)}>
				+ 수동 추가
			</Button>
		</div>
	</div>

	<!-- 크롤링 설정 (검색 기간 + 키워드) -->
	<JBTPConfigInline />

	<!-- Crawling Status -->
	{#if crawlStatus !== 'idle'}
		<div bind:this={crawlingStatusRef}>
			<Panel title="크롤링 진행 상황">
				<!-- Phase indicator -->
				{#if crawlStatus === 'collecting'}
					<div class="phase-indicator">
						<span class="phase-label">🔍 페이지 수집 중...</span>
						<span class="phase-info">
							페이지 {pageProgress.page} | 누적 {pageProgress.accumulated}개
						</span>
					</div>
				{:else if crawlStatus === 'processing'}
					<div class="phase-indicator processing">
						<span class="phase-label">📋 상세 정보 수집 중</span>
						<span class="phase-info">
							{crawlProgress.progress}/{crawlProgress.total} ({Math.round((crawlProgress.progress / crawlProgress.total) * 100)}%)
						</span>
					</div>
				{/if}

			<CrawlingStatus
				sourceId="jbtp"
				sourceName="JBTP"
				status={crawlStatus === 'collecting' || crawlStatus === 'processing' ? 'running' : crawlStatus}
				progress={crawlProgress.progress}
				total={crawlProgress.total}
				success={crawlProgress.success}
				failed={crawlProgress.failed}
				logs={crawlLogs}
				{errorMessage}
				statistics={crawlStatistics}
			/>
			</Panel>
		</div>
	{/if}

	<!-- Tabs -->
	<div class="tabs" bind:this={queueSectionRef}>
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
					<div class="tag-selector">
						<label class="tag-label">태그:</label>
						<label>
							<input type="checkbox" bind:group={selectedTags} value="전북" />
							전북
						</label>
						<label>
							<input type="checkbox" bind:group={selectedTags} value="지원사업" />
							지원사업
						</label>
						<label>
							<input type="checkbox" bind:group={selectedTags} value="바이오" />
							바이오
						</label>
						<label>
							<input type="checkbox" bind:group={selectedTags} value="창업" />
							창업
						</label>
					</div>
					<Button onclick={publishSelected} disabled={loading}>
						선택 항목 게시 ({selectedIds.length})
					</Button>
				</div>
			{/if}
		</Panel>
	{:else}
		<Panel title="게시된 공고">
			<PublishedNoticesList sourceId="jbtp" category="government" />
		</Panel>
	{/if}

	<!-- Add Notice Modal -->
	{#if showAddModal}
		<AddNoticeModal
			category="government"
			sourceId="jbtp"
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

	/* Phase indicator styles */
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
		align-items: center;
		padding: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
		margin-top: var(--space-4);
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.tag-selector {
		display: flex;
		gap: var(--space-4);
		align-items: center;
		flex-wrap: wrap;
	}

	.tag-label {
		font-weight: var(--font-medium);
		color: var(--fg);
	}

	.tag-selector label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		color: var(--muted);
	}

	.tag-selector label:hover {
		color: var(--fg);
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
