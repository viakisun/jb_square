<script lang="ts">
	/**
	 * CrawlQueueTable - Multi-select table for crawl queue review
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 */

	import { Button } from '$lib/components/ui/buttons';
	import { Checkbox } from '$lib/components/ui/forms';
	import NoticePreviewModal from './NoticePreviewModal.svelte';

	type QueueItem = {
		id: number;
		source_id: string;
		board: string | null;
		title: string;
		link: string | null;
		date: string | null;
		extracted_at: string;
		selected: boolean;
		processed: boolean;
		already_exists?: boolean;
		existing_notice_id?: number;
		raw_data?: {
			detail?: {
				writer?: string;
				published_date?: string;
				views?: number;
				status?: string;
				deadline?: string;
				d_day?: string;
				attachments?: Array<{ filename: string; url: string }>;
			};
		};
	};

	type Props = {
		items: QueueItem[];
		onSelectionChange?: (selectedIds: number[]) => void;
		onRefresh?: () => void;
	};

	let { items = $bindable([]), onSelectionChange, onRefresh }: Props = $props();

	let selectedIds = $state<Set<number>>(new Set());
	let allSelected = $state(false);
	let expandedRows = $state<Set<number>>(new Set());
	let previewItem = $state<QueueItem | null>(null);
	let showPreview = $state(false);

	function toggleAll() {
		if (allSelected) {
			selectedIds.clear();
		} else {
			selectedIds = new Set(items.map((item) => item.id));
		}
		allSelected = !allSelected;
		onSelectionChange?.(Array.from(selectedIds));
	}

	function toggleItem(id: number) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
		allSelected = selectedIds.size === items.length;
		onSelectionChange?.(Array.from(selectedIds));
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('ko-KR', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			});
		} catch {
			return dateString;
		}
	}

	function getSourceLabel(sourceId: string): string {
		const labels: Record<string, string> = {
			jbtp: 'JBTP',
			ntis: 'NTIS',
			bizinfo: '기업마당'
		};
		return labels[sourceId] || sourceId;
	}

	function toggleExpand(id: number, event: Event) {
		event.stopPropagation();
		const newExpanded = new Set(expandedRows);
		if (newExpanded.has(id)) {
			newExpanded.delete(id);
		} else {
			newExpanded.add(id);
		}
		expandedRows = newExpanded;
	}

	function hasDetailData(item: QueueItem): boolean {
		const hasDetail = !!item.raw_data?.detail && Object.keys(item.raw_data.detail).length > 0;
		return hasDetail;
	}

	function openPreview(item: QueueItem, event: Event) {
		event.stopPropagation();
		previewItem = item;
		showPreview = true;
	}

	function closePreview() {
		showPreview = false;
		previewItem = null;
	}
</script>

<div class="crawl-queue-table">
	<!-- Header Actions -->
	<div class="table-header">
		<div class="selected-count">
			{#if selectedIds.size > 0}
				<span class="count">{selectedIds.size}개 선택됨</span>
			{:else}
				<span class="text-muted">항목을 선택하세요</span>
			{/if}
		</div>
		{#if onRefresh}
			<Button variant="outline" size="sm" onclick={onRefresh}>새로고침</Button>
		{/if}
	</div>

	<!-- Table -->
	<div class="table-container">
		<table class="queue-table">
			<thead>
				<tr>
					<th class="col-checkbox">
						<Checkbox checked={allSelected} onchange={toggleAll} />
					</th>
					<th class="col-source">출처</th>
					<th class="col-board">게시판</th>
					<th class="col-title">제목</th>
					<th class="col-date">날짜</th>
					<th class="col-detail">상세</th>
					<th class="col-link">링크</th>
				</tr>
			</thead>
			<tbody>
				{#if items.length === 0}
					<tr class="empty-row">
						<td colspan="6">
							<div class="empty-state">
								<p>크롤링된 데이터가 없습니다.</p>
								<p class="text-sm text-muted">크롤링을 실행하여 데이터를 수집하세요.</p>
							</div>
						</td>
					</tr>
				{:else}
					{#each items as item (item.id)}
						<tr
							class="data-row"
							class:selected={selectedIds.has(item.id)}
							onclick={() => toggleItem(item.id)}
						>
							<td class="col-checkbox">
								<Checkbox
									checked={selectedIds.has(item.id)}
									onchange={() => toggleItem(item.id)}
								/>
							</td>
							<td class="col-source">
								<span class="source-badge">{getSourceLabel(item.source_id)}</span>
							</td>
							<td class="col-board">{item.board || '-'}</td>
							<td class="col-title">
								<span class="title-text">{item.title}</span>
								{#if item.already_exists}
									<span class="duplicate-badge">등록됨</span>
								{/if}
							</td>
							<td class="col-date">{formatDate(item.date)}</td>
							<td class="col-detail">
								{#if hasDetailData(item)}
									<button
										class="preview-button"
										onclick={(e) => openPreview(item, e)}
									>
										미리보기
									</button>
								{:else}
									<span class="no-detail">-</span>
								{/if}
							</td>
							<td class="col-link">
								{#if item.link}
									<a
										href={item.link}
										target="_blank"
										rel="noopener noreferrer"
										class="link-button"
										onclick={(e) => e.stopPropagation()}
									>
										보기
									</a>
								{:else}
									-
								{/if}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

<!-- Preview Modal -->
<NoticePreviewModal item={previewItem} open={showPreview} onClose={closePreview} />

<style>
	/* ========================================
     CONTAINER
     ======================================== */

	.crawl-queue-table {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* ========================================
     HEADER
     ======================================== */

	.table-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) 0;
	}

	.selected-count {
		font-size: var(--text-sm);
	}

	.count {
		color: var(--fg);
		font-weight: var(--font-medium);
	}

	/* ========================================
     TABLE
     ======================================== */

	.table-container {
		border: var(--border-width) solid var(--hair);
		overflow-x: auto;
	}

	.queue-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	/* ========================================
     TABLE HEADER
     ======================================== */

	thead {
		background-color: var(--surface-1);
		border-bottom: var(--border-width) solid var(--hair);
	}

	th {
		padding: var(--space-3) var(--space-4);
		text-align: left;
		font-weight: var(--font-medium);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		font-size: var(--text-xs);
	}

	/* Column widths */
	.col-checkbox {
		width: 40px;
	}

	.col-source {
		width: 100px;
	}

	.col-board {
		width: 150px;
	}

	.col-title {
		min-width: 300px;
	}

	.col-date {
		width: 120px;
	}

	.col-detail {
		width: 100px;
		text-align: center;
	}

	.col-link {
		width: 80px;
		text-align: center;
	}

	/* ========================================
     TABLE BODY
     ======================================== */

	tbody tr {
		border-bottom: var(--border-width) solid var(--hair);
	}

	.data-row {
		cursor: pointer;
		transition: background-color var(--duration-base) var(--ease-out);
	}

	.data-row:hover {
		background-color: var(--ghost);
	}

	.data-row.selected {
		background-color: var(--surface-1);
	}

	td {
		padding: var(--space-3) var(--space-4);
		vertical-align: middle;
	}

	/* ========================================
     CONTENT ELEMENTS
     ======================================== */

	.source-badge {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		background-color: var(--fg);
		color: var(--bg);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.title-text {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 500px;
	}

	.duplicate-badge {
		display: inline-block;
		margin-left: var(--space-2);
		padding: var(--space-1) var(--space-2);
		background-color: var(--muted);
		color: var(--bg);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.link-button {
		display: inline-block;
		padding: var(--space-1) var(--space-3);
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		color: var(--fg);
		text-decoration: none;
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		transition: all var(--duration-base) var(--ease-out);
	}

	.link-button:hover {
		background-color: var(--fg);
		color: var(--bg);
	}

	/* ========================================
     EMPTY STATE
     ======================================== */

	.empty-row td {
		padding: var(--space-12) var(--space-4);
	}

	.empty-state {
		text-align: center;
	}

	.empty-state p {
		margin-bottom: var(--space-2);
	}

	.empty-state p:last-child {
		margin-bottom: 0;
	}

	/* ========================================
     PREVIEW BUTTON
     ======================================== */

	.preview-button {
		padding: var(--space-1) var(--space-3);
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		color: var(--fg);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		cursor: pointer;
		transition: all var(--duration-base) var(--ease-out);
	}

	.preview-button:hover {
		background-color: var(--fg);
		color: var(--bg);
	}

	.no-detail {
		color: var(--muted);
	}
</style>
