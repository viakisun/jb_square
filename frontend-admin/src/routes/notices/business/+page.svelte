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
	import { fetchCrawlQueue, bulkApproveQueueItems, bulkRejectQueueItems } from '$lib/api/crawl-queue';
	import { publishNotices } from '$lib/api/notices';
	import { useCrawlWebSocket } from '$lib/composables/useCrawlWebSocket.svelte';
	import { NoticeSource } from '$lib/constants/sources';

	const SOURCE_ID = NoticeSource.BIZINFO_API;

	// Tab state
	let activeTab = $state<'queue' | 'published'>('queue');

	// Queue state
	let queueItems = $state<any[]>([]);
	let selectedIds = $state<number[]>([]);
	let loading = $state(false);
	let statusFilter = $state<'pending' | 'approved' | 'rejected' | 'all'>('pending');

	// Modal state
	let showAddModal = $state(false);

	// For smooth UX flow
	let queuePanelRef: HTMLElement | null = null;

	// WebSocket composable for crawling
	const crawlWs = useCrawlWebSocket();

	async function loadQueue() {
		loading = true;
		try {
			queueItems = await fetchCrawlQueue(SOURCE_ID, statusFilter);
		} catch (error) {
			console.error('Failed to load queue:', error);
			toast.error('대기열 로드 실패');
		} finally {
			loading = false;
		}
	}

	// Reload queue when status filter changes
	$effect(() => {
		statusFilter;
		loadQueue();
	});

	function crawlBizinfo() {
		const wsUrl = `${WS_BASE_URL}/api/notices/crawl/${SOURCE_ID}`;

		crawlWs.connect(
			wsUrl,
			// onItemAdded callback
			(item) => {
				// Add item and remove duplicates by ID
				const newItems = [item, ...queueItems];
				queueItems = Array.from(
					new Map(newItems.map((item: any) => [item.id, item])).values()
				);
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
			if (result.failed > 0) {
				toast.error(`${result.failed}개 항목 게시 실패 (승인된 항목만 게시할 수 있습니다)`);
			}
			if (result.published > 0) {
				toast.success(`${result.published}개 공고가 게시되었습니다`);
			}
			await loadQueue();
			selectedIds = [];
			if (result.published > 0) {
				activeTab = 'published'; // Switch to published tab
			}
		} catch (error) {
			console.error('Publish failed:', error);
			toast.error('게시 실패');
		} finally {
			loading = false;
		}
	}

	async function approveSelected() {
		if (selectedIds.length === 0) return;

		loading = true;
		try {
			const result = await bulkApproveQueueItems(selectedIds);
			toast.success(`${result.approved}개 항목이 승인되었습니다`);
			await loadQueue();
			selectedIds = [];
		} catch (error) {
			console.error('Approve failed:', error);
			toast.error('승인 실패');
		} finally {
			loading = false;
		}
	}

	let showRejectModal = $state(false);
	let rejectReason = $state('');

	function openRejectModal() {
		if (selectedIds.length === 0) return;
		showRejectModal = true;
		rejectReason = '';
	}

	async function confirmReject() {
		if (selectedIds.length === 0) return;

		loading = true;
		showRejectModal = false;
		try {
			const result = await bulkRejectQueueItems(selectedIds, rejectReason || undefined);
			toast.success(`${result.rejected}개 항목이 반려되었습니다`);
			await loadQueue();
			selectedIds = [];
			rejectReason = '';
		} catch (error) {
			console.error('Reject failed:', error);
			toast.error('반려 실패');
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
			<!-- Status Filter Buttons -->
			<div class="status-filters">
				<button
					class="filter-btn"
					class:active={statusFilter === 'pending'}
					onclick={() => (statusFilter = 'pending')}
				>
					대기
				</button>
				<button
					class="filter-btn"
					class:active={statusFilter === 'approved'}
					onclick={() => (statusFilter = 'approved')}
				>
					승인됨
				</button>
				<button
					class="filter-btn"
					class:active={statusFilter === 'rejected'}
					onclick={() => (statusFilter === 'rejected')}
				>
					반려됨
				</button>
				<button
					class="filter-btn"
					class:active={statusFilter === 'all'}
					onclick={() => (statusFilter = 'all')}
				>
					전체
				</button>
			</div>

			<CrawlQueueTable
				bind:items={queueItems}
				onSelectionChange={(ids) => (selectedIds = ids)}
				onRefresh={loadQueue}
			/>

			{#if selectedIds.length > 0}
				<div class="queue-actions">
					{#if statusFilter === 'pending'}
						<Button variant="primary" onclick={approveSelected} disabled={loading}>
							선택 항목 승인 ({selectedIds.length})
						</Button>
						<Button variant="outline" onclick={openRejectModal} disabled={loading}>
							선택 항목 반려 ({selectedIds.length})
						</Button>
					{:else if statusFilter === 'approved'}
						<Button variant="primary" onclick={publishSelected} disabled={loading}>
							선택 항목 게시 ({selectedIds.length})
						</Button>
						<Button variant="outline" onclick={openRejectModal} disabled={loading}>
							선택 항목 반려 ({selectedIds.length})
						</Button>
					{/if}
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

	<!-- Reject Reason Modal -->
	{#if showRejectModal}
		<div class="modal-overlay" onclick={() => (showRejectModal = false)}>
			<div class="modal-content" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>반려 사유 입력</h3>
					<button class="modal-close" onclick={() => (showRejectModal = false)}>×</button>
				</div>
				<div class="modal-body">
					<p class="modal-description">
						선택한 {selectedIds.length}개 항목을 반려합니다. 반려 사유를 입력해주세요. (선택사항)
					</p>
					<textarea
						bind:value={rejectReason}
						placeholder="반려 사유를 입력하세요..."
						rows="4"
						class="reason-textarea"
					></textarea>
				</div>
				<div class="modal-footer">
					<Button variant="outline" onclick={() => (showRejectModal = false)}>취소</Button>
					<Button variant="primary" onclick={confirmReject} disabled={loading}>
						반려 확인
					</Button>
				</div>
			</div>
		</div>
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

	.status-filters {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-4);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.filter-btn {
		padding: var(--space-2) var(--space-4);
		background: var(--surface-0);
		border: var(--border-width) solid var(--hair);
		cursor: pointer;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		transition: all 0.2s;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.filter-btn:hover {
		color: var(--fg);
		border-color: var(--fg);
	}

	.filter-btn.active {
		color: var(--bg);
		background: var(--fg);
		border-color: var(--fg);
	}

	.queue-actions {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
		margin-top: var(--space-4);
		gap: var(--space-3);
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

		.status-filters {
			flex-wrap: wrap;
		}
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.modal-header h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.modal-close {
		background: none;
		border: none;
		font-size: var(--text-2xl);
		cursor: pointer;
		color: var(--muted);
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.modal-close:hover {
		color: var(--fg);
	}

	.modal-body {
		padding: var(--space-6);
	}

	.modal-description {
		font-size: var(--text-sm);
		color: var(--muted);
		margin-bottom: var(--space-4);
		line-height: 1.6;
	}

	.reason-textarea {
		width: 100%;
		padding: var(--space-3);
		border: var(--border-width) solid var(--hair);
		background: var(--surface-0);
		color: var(--fg);
		font-size: var(--text-sm);
		font-family: inherit;
		resize: vertical;
		min-height: 100px;
	}

	.reason-textarea:focus {
		outline: none;
		border-color: var(--fg);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		padding: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
	}
</style>
