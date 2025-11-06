<script lang="ts">
	/**
	 * 지자체 공고 페이지 (JBTP)
	 * 1. 사업공고 (Business Notices) - JBTP 사업공고 게시판
	 * 2. 유관기관공고 (External Organization Notices) - JBTP 유관기관 게시판
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
	import ExternalNoticeQueueTable from '$lib/components/notices/ExternalNoticeQueueTable.svelte';
	import { toast } from '$lib/stores/toast';
	import JBTPConfigInline from '$lib/components/crawling/JBTPConfigInline.svelte';
	import TagSelector from '$lib/components/contents/TagSelector.svelte';
	import { API_BASE_URL, WS_BASE_URL } from '$lib/config/api';

	interface LogEntry {
		timestamp: string;
		message: string;
		type?: 'info' | 'success' | 'error' | 'warning';
	}

	// ============================================
	// Section 1: 사업공고 (Business Notices)
	// ============================================

	// Tab state for business notices
	let businessActiveTab = $state<'queue' | 'published'>('queue');

	// Queue state for business notices
	let businessQueueItems = $state<any[]>([]);
	let businessSelectedIds = $state<number[]>([]);
	let businessSelectedTagIds = $state<number[]>([]);
	let businessLoading = $state(false);

	// Crawl state for business notices
	let businessCrawlStatus = $state<'idle' | 'collecting' | 'processing' | 'completed' | 'error' | 'stopped'>('idle');
	let businessCrawlLogs = $state<LogEntry[]>([]);
	let businessCrawlProgress = $state({ progress: 0, total: 0, success: 0, failed: 0 });
	let businessCrawlStatistics = $state({ total: 0, already_published: 0, in_queue: 0, new_items: 0, matched: 0, unmatched: 0 });
	let businessPageProgress = $state({ page: 0, accumulated: 0 });
	let businessErrorMessage = $state('');

	// Reference for scrolling
	let businessCrawlingStatusRef = $state<HTMLElement | null>(null);
	let businessQueueSectionRef = $state<HTMLElement | null>(null);

	// ============================================
	// Section 2: 유관기관공고 (External Notices)
	// ============================================

	// Tab state for external notices
	let externalActiveTab = $state<'queue' | 'published'>('queue');

	// Queue state for external notices
	let externalQueueItems = $state<any[]>([]);
	let externalSelectedIds = $state<number[]>([]);
	let externalSelectedTagIds = $state<number[]>([]);
	let externalLoading = $state(false);

	// Crawl state for external notices
	let externalCrawlStatus = $state<'idle' | 'collecting' | 'processing' | 'completed' | 'error' | 'stopped'>('idle');
	let externalCrawlLogs = $state<LogEntry[]>([]);
	let externalCrawlProgress = $state({ progress: 0, total: 0, success: 0, failed: 0 });
	let externalCrawlStatistics = $state({ total: 0, already_published: 0, in_queue: 0, new_items: 0, matched: 0, unmatched: 0 });
	let externalPageProgress = $state({ page: 0, accumulated: 0 });
	let externalErrorMessage = $state('');

	// Reference for scrolling
	let externalCrawlingStatusRef = $state<HTMLElement | null>(null);
	let externalQueueSectionRef = $state<HTMLElement | null>(null);

	// ============================================
	// Modal state
	// ============================================
	let showAddModal = $state(false);

	onMount(() => {
		loadBusinessQueue();
		loadExternalQueue();
	});

	// ============================================
	// Business Notices Functions
	// ============================================

	async function loadBusinessQueue() {
		businessLoading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/list?source_id=jbtp`);
			const data = await res.json();
			// Remove duplicates by ID (defensive programming)
			const uniqueItems = Array.from(
				new Map(data.items.map((item: any) => [item.id, item])).values()
			);
			businessQueueItems = uniqueItems;
		} catch (error) {
			console.error('Failed to load business queue:', error);
			toast.error('사업공고 대기열 로드 실패');
		} finally {
			businessLoading = false;
		}
	}

	async function crawlJBTP() {
		businessLoading = true;
		businessCrawlStatus = 'collecting';
		businessCrawlLogs = [];
		businessCrawlProgress = { progress: 0, total: 0, success: 0, failed: 0 };
		businessCrawlStatistics = { total: 0, already_published: 0, in_queue: 0, new_items: 0, matched: 0, unmatched: 0 };
		businessPageProgress = { page: 0, accumulated: 0 };
		businessErrorMessage = '';

		// Scroll to crawling status panel
		setTimeout(() => {
			businessCrawlingStatusRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);

		try {
			const ws = new WebSocket(`${WS_BASE_URL}/api/notices/crawl/jbtp`);

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const timestamp = new Date().toISOString();

				switch (data.type) {
					case 'start':
						businessCrawlLogs = [...businessCrawlLogs, { timestamp, message: data.message || '크롤링 시작...', type: 'info' }];
						break;

					case 'log':
						businessCrawlLogs = [...businessCrawlLogs, { timestamp, message: data.message, type: 'info' }];
						break;

					case 'page_progress':
						businessCrawlStatus = 'collecting';
						businessPageProgress = {
							page: data.page || 0,
							accumulated: data.accumulated || 0
						};
						break;

					case 'statistics':
						businessCrawlStatistics = {
							total: data.total || 0,
							already_published: data.already_published || 0,
							in_queue: data.in_queue || 0,
							new_items: data.new_items || 0,
							matched: data.matched || 0,
							unmatched: data.unmatched || 0
						};
						break;

					case 'collection_complete':
						businessCrawlStatus = 'processing';
						businessCrawlLogs = [
							...businessCrawlLogs,
							{
								timestamp,
								message: `✓ ${data.total_collected}개 공고 수집 완료. 상세 정보 수집 시작...`,
								type: 'success'
							}
						];
						break;

					case 'item_added':
						if (data.item) {
							businessQueueItems = [data.item, ...businessQueueItems];
						}
						break;

					case 'progress':
						businessCrawlStatus = 'processing';
						businessCrawlProgress = {
							progress: data.progress || 0,
							total: data.total || 0,
							success: data.success || 0,
							failed: data.failed || 0
						};
						if (data.message) {
							businessCrawlLogs = [...businessCrawlLogs, { timestamp, message: data.message, type: 'info' }];
						}
						break;

					case 'complete':
						businessCrawlStatus = 'completed';
						businessCrawlLogs = [
							...businessCrawlLogs,
							{ timestamp, message: data.message || '크롤링 완료', type: 'success' },
							{ timestamp, message: `📋 크롤링 대기열 탭에서 ${businessCrawlProgress.success}개의 공고를 확인하세요`, type: 'info' }
						];
						businessLoading = false;
						businessActiveTab = 'queue';
						setTimeout(() => {
							businessQueueSectionRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}, 300);
						break;

					case 'error':
						businessCrawlStatus = 'error';
						businessErrorMessage = data.message || '크롤링 중 오류 발생';
						businessCrawlLogs = [...businessCrawlLogs, { timestamp, message: data.message, type: 'error' }];
						businessLoading = false;
						break;

					case 'stopped':
						businessCrawlStatus = 'stopped';
						businessCrawlLogs = [...businessCrawlLogs, { timestamp, message: data.message || '크롤링 중단됨', type: 'warning' }];
						businessLoading = false;
						break;
				}
			};

			ws.onclose = () => {
				if (businessCrawlStatus === 'collecting' || businessCrawlStatus === 'processing') {
					businessCrawlStatus = 'completed';
				}
				loadBusinessQueue();
				businessLoading = false;
			};

			ws.onerror = (error) => {
				businessCrawlStatus = 'error';
				businessErrorMessage = '웹소켓 연결 오류';
				businessCrawlLogs = [...businessCrawlLogs, { timestamp: new Date().toISOString(), message: '웹소켓 연결 오류', type: 'error' }];
				businessLoading = false;
			};
		} catch (error) {
			businessCrawlStatus = 'error';
			businessErrorMessage = String(error);
			businessLoading = false;
		}
	}

	async function publishBusinessSelected() {
		if (businessSelectedIds.length === 0) return;

		businessLoading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices/publish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					queue_ids: businessSelectedIds,
					category: 'government',
					tags: businessSelectedTagIds
				})
			});
			const data = await res.json();
			toast.success(`${data.published}개 사업공고가 게시되었습니다`);
			await loadBusinessQueue();
			businessSelectedIds = [];
			businessSelectedTagIds = [];
			businessActiveTab = 'published';
		} catch (error) {
			console.error('Publish failed:', error);
			toast.error('게시 실패');
		} finally {
			businessLoading = false;
		}
	}

	// ============================================
	// External Notices Functions
	// ============================================

	async function loadExternalQueue() {
		externalLoading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/list?source_id=jbtp_external`);
			const data = await res.json();
			// Remove duplicates by ID (defensive programming)
			const uniqueItems = Array.from(
				new Map(data.items.map((item: any) => [item.id, item])).values()
			);
			externalQueueItems = uniqueItems;
		} catch (error) {
			console.error('Failed to load external queue:', error);
			toast.error('유관기관공고 대기열 로드 실패');
		} finally {
			externalLoading = false;
		}
	}

	async function crawlJBTPExternal() {
		externalLoading = true;
		externalCrawlStatus = 'collecting';
		externalCrawlLogs = [];
		externalCrawlProgress = { progress: 0, total: 0, success: 0, failed: 0 };
		externalCrawlStatistics = { total: 0, already_published: 0, in_queue: 0, new_items: 0, matched: 0, unmatched: 0 };
		externalPageProgress = { page: 0, accumulated: 0 };
		externalErrorMessage = '';

		// Scroll to crawling status panel
		setTimeout(() => {
			externalCrawlingStatusRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);

		try {
			const ws = new WebSocket(`${WS_BASE_URL}/api/notices/crawl/jbtp_external`);

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const timestamp = new Date().toISOString();

				switch (data.type) {
					case 'start':
						externalCrawlLogs = [...externalCrawlLogs, { timestamp, message: data.message || '크롤링 시작...', type: 'info' }];
						break;

					case 'log':
						externalCrawlLogs = [...externalCrawlLogs, { timestamp, message: data.message, type: 'info' }];
						break;

					case 'page_progress':
						externalCrawlStatus = 'collecting';
						externalPageProgress = {
							page: data.page || 0,
							accumulated: data.accumulated || 0
						};
						break;

					case 'statistics':
						externalCrawlStatistics = {
							total: data.total || 0,
							already_published: data.already_published || 0,
							in_queue: data.in_queue || 0,
							new_items: data.new_items || 0,
							matched: data.matched || 0,
							unmatched: data.unmatched || 0
						};
						break;

					case 'collection_complete':
						externalCrawlStatus = 'processing';
						externalCrawlLogs = [
							...externalCrawlLogs,
							{
								timestamp,
								message: `✓ ${data.total_collected}개 공고 수집 완료. 상세 정보 수집 시작...`,
								type: 'success'
							}
						];
						break;

					case 'item_added':
						if (data.item) {
							externalQueueItems = [data.item, ...externalQueueItems];
						}
						break;

					case 'progress':
						externalCrawlStatus = 'processing';
						externalCrawlProgress = {
							progress: data.progress || 0,
							total: data.total || 0,
							success: data.success || 0,
							failed: data.failed || 0
						};
						if (data.message) {
							externalCrawlLogs = [...externalCrawlLogs, { timestamp, message: data.message, type: 'info' }];
						}
						break;

					case 'complete':
						externalCrawlStatus = 'completed';
						externalCrawlLogs = [
							...externalCrawlLogs,
							{ timestamp, message: data.message || '크롤링 완료', type: 'success' },
							{ timestamp, message: `📋 크롤링 대기열 탭에서 ${externalCrawlProgress.success}개의 공고를 확인하세요`, type: 'info' }
						];
						externalLoading = false;
						externalActiveTab = 'queue';
						setTimeout(() => {
							externalQueueSectionRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}, 300);
						break;

					case 'error':
						externalCrawlStatus = 'error';
						externalErrorMessage = data.message || '크롤링 중 오류 발생';
						externalCrawlLogs = [...externalCrawlLogs, { timestamp, message: data.message, type: 'error' }];
						externalLoading = false;
						break;

					case 'stopped':
						externalCrawlStatus = 'stopped';
						externalCrawlLogs = [...externalCrawlLogs, { timestamp, message: data.message || '크롤링 중단됨', type: 'warning' }];
						externalLoading = false;
						break;
				}
			};

			ws.onclose = () => {
				if (externalCrawlStatus === 'collecting' || externalCrawlStatus === 'processing') {
					externalCrawlStatus = 'completed';
				}
				loadExternalQueue();
				externalLoading = false;
			};

			ws.onerror = (error) => {
				externalCrawlStatus = 'error';
				externalErrorMessage = '웹소켓 연결 오류';
				externalCrawlLogs = [...externalCrawlLogs, { timestamp: new Date().toISOString(), message: '웹소켓 연결 오류', type: 'error' }];
				externalLoading = false;
			};
		} catch (error) {
			externalCrawlStatus = 'error';
			externalErrorMessage = String(error);
			externalLoading = false;
		}
	}

	async function publishExternalSelected() {
		if (externalSelectedIds.length === 0) return;

		externalLoading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices/publish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					queue_ids: externalSelectedIds,
					category: 'government',
					tags: externalSelectedTagIds
				})
			});
			const data = await res.json();
			toast.success(`${data.published}개 유관기관공고가 게시되었습니다`);
			await loadExternalQueue();
			externalSelectedIds = [];
			externalSelectedTagIds = [];
			externalActiveTab = 'published';
		} catch (error) {
			console.error('Publish failed:', error);
			toast.error('게시 실패');
		} finally {
			externalLoading = false;
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
			<Button variant="outline" onclick={() => (showAddModal = true)}>
				+ 수동 추가
			</Button>
		</div>
	</div>

	<!-- ============================================ -->
	<!-- Section 1: 사업공고 (Business Notices) -->
	<!-- ============================================ -->
	<div class="section">
		<div class="section-header">
			<h2 class="section-title">사업공고</h2>
			<Button variant="primary" onclick={crawlJBTP} disabled={businessLoading}>
				{businessLoading ? '크롤링 중...' : '사업공고 크롤링 시작'}
			</Button>
		</div>

		<!-- 크롤링 설정 -->
		<JBTPConfigInline configType="notices" />

		<!-- Crawling Status -->
		{#if businessCrawlStatus !== 'idle'}
			<div bind:this={businessCrawlingStatusRef}>
				<Panel title="크롤링 진행 상황">
					{#if businessCrawlStatus === 'collecting'}
						<div class="phase-indicator">
							<span class="phase-label">🔍 페이지 수집 중...</span>
							<span class="phase-info">
								페이지 {businessPageProgress.page} | 누적 {businessPageProgress.accumulated}개
							</span>
						</div>
					{:else if businessCrawlStatus === 'processing'}
						<div class="phase-indicator processing">
							<span class="phase-label">📋 상세 정보 수집 중</span>
							<span class="phase-info">
								{businessCrawlProgress.progress}/{businessCrawlProgress.total} ({Math.round((businessCrawlProgress.progress / businessCrawlProgress.total) * 100)}%)
							</span>
						</div>
					{/if}

					<CrawlingStatus
						sourceId="jbtp"
						sourceName="JBTP 사업공고"
						status={businessCrawlStatus === 'collecting' || businessCrawlStatus === 'processing' ? 'running' : businessCrawlStatus}
						progress={businessCrawlProgress.progress}
						total={businessCrawlProgress.total}
						success={businessCrawlProgress.success}
						failed={businessCrawlProgress.failed}
						logs={businessCrawlLogs}
						errorMessage={businessErrorMessage}
						statistics={businessCrawlStatistics}
					/>
				</Panel>
			</div>
		{/if}

		<!-- Tabs -->
		<div class="tabs" bind:this={businessQueueSectionRef}>
			<button
				class="tab"
				class:active={businessActiveTab === 'queue'}
				onclick={() => (businessActiveTab = 'queue')}
			>
				크롤링 대기열
			</button>
			<button
				class="tab"
				class:active={businessActiveTab === 'published'}
				onclick={() => (businessActiveTab = 'published')}
			>
				게시된 공고
			</button>
		</div>

		<!-- Tab Content -->
		{#if businessActiveTab === 'queue'}
			<Panel title="크롤링 대기열">
				<CrawlQueueTable
					bind:items={businessQueueItems}
					onSelectionChange={(ids) => (businessSelectedIds = ids)}
					onRefresh={loadBusinessQueue}
				/>

				{#if businessSelectedIds.length > 0}
					<div class="queue-actions">
						<div class="tag-selection-wrapper">
							<TagSelector bind:selectedTags={businessSelectedTagIds} maxTags={5} required />
						</div>
						<Button onclick={publishBusinessSelected} disabled={businessLoading}>
							선택 항목 게시 ({businessSelectedIds.length})
						</Button>
					</div>
				{/if}
			</Panel>
		{:else}
			<Panel title="게시된 공고">
				<PublishedNoticesList sourceId="jbtp" category="government" />
			</Panel>
		{/if}
	</div>

	<!-- ============================================ -->
	<!-- Section 2: 유관기관공고 (External Notices) -->
	<!-- ============================================ -->
	<div class="section">
		<div class="section-header">
			<h2 class="section-title">유관기관공고</h2>
			<Button variant="primary" onclick={crawlJBTPExternal} disabled={externalLoading}>
				{externalLoading ? '크롤링 중...' : '유관기관공고 크롤링 시작'}
			</Button>
		</div>

		<!-- 크롤링 설정 -->
		<JBTPConfigInline configType="external_notices" />

		<!-- Crawling Status -->
		{#if externalCrawlStatus !== 'idle'}
			<div bind:this={externalCrawlingStatusRef}>
				<Panel title="크롤링 진행 상황">
					{#if externalCrawlStatus === 'collecting'}
						<div class="phase-indicator">
							<span class="phase-label">🔍 페이지 수집 중...</span>
							<span class="phase-info">
								페이지 {externalPageProgress.page} | 누적 {externalPageProgress.accumulated}개
							</span>
						</div>
					{:else if externalCrawlStatus === 'processing'}
						<div class="phase-indicator processing">
							<span class="phase-label">📋 상세 정보 수집 중</span>
							<span class="phase-info">
								{externalCrawlProgress.progress}/{externalCrawlProgress.total} ({Math.round((externalCrawlProgress.progress / externalCrawlProgress.total) * 100)}%)
							</span>
						</div>
					{/if}

					<CrawlingStatus
						sourceId="jbtp_external"
						sourceName="JBTP 유관기관공고"
						status={externalCrawlStatus === 'collecting' || externalCrawlStatus === 'processing' ? 'running' : externalCrawlStatus}
						progress={externalCrawlProgress.progress}
						total={externalCrawlProgress.total}
						success={externalCrawlProgress.success}
						failed={externalCrawlProgress.failed}
						logs={externalCrawlLogs}
						errorMessage={externalErrorMessage}
						statistics={externalCrawlStatistics}
					/>
				</Panel>
			</div>
		{/if}

		<!-- Tabs -->
		<div class="tabs" bind:this={externalQueueSectionRef}>
			<button
				class="tab"
				class:active={externalActiveTab === 'queue'}
				onclick={() => (externalActiveTab = 'queue')}
			>
				크롤링 대기열
			</button>
			<button
				class="tab"
				class:active={externalActiveTab === 'published'}
				onclick={() => (externalActiveTab = 'published')}
			>
				게시된 공고
			</button>
		</div>

		<!-- Tab Content -->
		{#if externalActiveTab === 'queue'}
			<Panel title="크롤링 대기열">
				<ExternalNoticeQueueTable
					bind:items={externalQueueItems}
					onSelectionChange={(ids) => (externalSelectedIds = ids)}
					onRefresh={loadExternalQueue}
				/>

				{#if externalSelectedIds.length > 0}
					<div class="queue-actions">
						<div class="tag-selection-wrapper">
							<TagSelector bind:selectedTags={externalSelectedTagIds} maxTags={5} required />
						</div>
						<Button onclick={publishExternalSelected} disabled={externalLoading}>
							선택 항목 게시 ({externalSelectedIds.length})
						</Button>
					</div>
				{/if}
			</Panel>
		{:else}
			<Panel title="게시된 공고">
				<PublishedNoticesList sourceId="jbtp_external" category="government" />
			</Panel>
		{/if}
	</div>

	<!-- Add Notice Modal -->
	{#if showAddModal}
		<AddNoticeModal
			category="government"
			sourceId="jbtp"
			onClose={() => (showAddModal = false)}
			onSuccess={() => {
				loadBusinessQueue();
				businessActiveTab = 'published';
			}}
		/>
	{/if}
</div>

<style>
	.page {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
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

	/* Section Styles */
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding: var(--space-6);
		border: var(--border-width) solid var(--hair);
		background-color: var(--surface-1);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
		text-transform: uppercase;
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

		.section {
			padding: var(--space-4);
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-3);
		}

		.queue-actions {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
