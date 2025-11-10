<script lang="ts">
	/**
	 * CrawlQueueTable - Multi-select table for crawl queue review
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 */

	import { Button } from '$lib/components/ui/buttons';
	import { Checkbox } from '$lib/components/ui/forms';
	import NoticePreviewModal from './NoticePreviewModal.svelte';
	import { toast } from '$lib/stores/toast';
	import { bulkDeleteQueueItems } from '$lib/api/crawl-queue';
	import { formatDate, getDaysUntilDeadline } from '$lib/utils/date';
	import { getSourceDisplayName } from '$lib/constants/sources';
	import { useSelection } from '$lib/composables/useSelection.svelte';

	type QueueItem = {
		id: number;
		crawler_source_id: string;
		source_board_name: string | null;
		title: string;
		link: string | null;
		crawler_extracted_at: string;
		deadline: string | null;
		published_date: string | null;
		organization: string | null;
		department: string | null;
		contact: string | null;
		views: number;
		status: string | null;
		already_exists?: boolean;
		existing_notice_id?: number;
		matched_keywords?: string[];
		suggested_tags?: string[];
		raw_data?: any;
	};

	type Props = {
		items: QueueItem[];
		onSelectionChange?: (selectedIds: number[]) => void;
		onRefresh?: () => void;
	};

	let { items = $bindable([]), onSelectionChange, onRefresh }: Props = $props();

	// Use selection composable
	const selection = useSelection<QueueItem>();

	let expandedRows = $state<Set<number>>(new Set());
	let previewItem = $state<QueueItem | null>(null);
	let showPreview = $state(false);
	let deleting = $state(false);

	// Sync selection state with parent component
	$effect(() => {
		onSelectionChange?.(Array.from(selection.selectedIds));
	});

	// Update allSelected state based on items
	$effect(() => {
		selection.allSelected = selection.selectedIds.size === items.length && items.length > 0;
	});

	async function deleteSelected() {
		if (selection.selectedCount === 0) return;

		if (!confirm(`선택한 ${selection.selectedCount}개 항목을 삭제하시겠습니까?`)) {
			return;
		}

		deleting = true;
		try {
			const result = await bulkDeleteQueueItems(Array.from(selection.selectedIds));

			// Show result
			if (result.success > 0) {
				toast.success(`${result.success}개 항목이 삭제되었습니다`);
			}
			if (result.failed > 0) {
				toast.error(`${result.failed}개 항목 삭제 실패`);
			}

			// Clear selection and refresh
			selection.clearSelection();
			onSelectionChange?.([]);
			onRefresh?.();
		} catch (error) {
			console.error('Delete failed:', error);
			toast.error('삭제 중 오류가 발생했습니다');
		} finally {
			deleting = false;
		}
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
			{#if selection.selectedCount > 0}
				<span class="count">{selection.selectedCount}개 선택됨</span>
			{:else}
				<span class="text-muted">항목을 선택하세요</span>
			{/if}
		</div>
		<div class="header-actions">
			{#if selection.selectedCount > 0}
				<Button variant="outline" size="sm" onclick={deleteSelected} disabled={deleting}>
					{deleting ? '삭제 중...' : '선택 삭제'}
				</Button>
			{/if}
			{#if onRefresh}
				<Button variant="outline" size="sm" onclick={onRefresh}>새로고침</Button>
			{/if}
		</div>
	</div>

	<!-- Table -->
	<div class="table-container">
		<table class="queue-table">
			<thead>
				<tr>
					<th class="col-checkbox">
						<input
							type="checkbox"
							checked={selection.allSelected}
							onchange={() => selection.toggleAll(items)}
							class="table-checkbox"
						/>
					</th>
					<th class="col-title">제목</th>
					<th class="col-keywords">키워드</th>
					<th class="col-date">게시일</th>
					<th class="col-deadline">마감일</th>
					<th class="col-detail">상세</th>
					<th class="col-link">링크</th>
				</tr>
			</thead>
			<tbody>
				{#if items.length === 0}
					<tr class="empty-row">
						<td colspan="7">
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
							class:selected={selection.isSelected(item.id)}
							onclick={() => selection.toggleItem(item.id)}
						>
							<td class="col-checkbox">
								<input
									type="checkbox"
									checked={selection.isSelected(item.id)}
									onchange={() => selection.toggleItem(item.id)}
									class="table-checkbox"
									onclick={(e) => e.stopPropagation()}
								/>
							</td>
							<td class="col-title">
								<div class="title-container">
									<span class="title-text">{item.title}</span>
									{#if item.already_exists}
										<span class="duplicate-badge">등록됨</span>
									{/if}
								</div>
							</td>
							<td class="col-keywords">
								{#if item.matched_keywords && item.matched_keywords.length > 0}
									<div class="keywords-badges">
										{#each item.matched_keywords as keyword}
											<span class="keyword-badge">{keyword}</span>
										{/each}
									</div>
								{:else}
									<span class="no-keywords">-</span>
								{/if}
							</td>
							<td class="col-date">{formatDate(item.published_date)}</td>
							<td class="col-deadline">
								{#if item.deadline}
									{@const daysLeft = getDaysUntilDeadline(item.deadline)}
									<div class="deadline-cell">
										<span class="deadline-date">{formatDate(item.deadline)}</span>
										{#if daysLeft !== null}
											{#if daysLeft < 0}
												<span class="deadline-badge closed">마감</span>
											{:else if daysLeft === 0}
												<span class="deadline-badge urgent">오늘</span>
											{:else if daysLeft <= 7}
												<span class="deadline-badge urgent">D-{daysLeft}</span>
											{:else}
												<span class="deadline-badge">D-{daysLeft}</span>
											{/if}
										{/if}
									</div>
								{:else}
									<span class="error-text">마감일 누락</span>
								{/if}
							</td>
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

	.header-actions {
		display: flex;
		gap: var(--space-2);
		align-items: center;
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

	.col-title {
		min-width: 300px;
	}

	.col-keywords {
		width: 150px;
	}

	.col-date {
		width: 110px;
	}

	.col-deadline {
		width: 150px;
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

	.title-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.title-text {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 500px;
	}

	.keywords-badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.keyword-badge {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		background-color: var(--fg);
		color: var(--bg);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		border: var(--border-width) solid var(--fg);
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

	/* ========================================
     TABLE CHECKBOX
     ======================================== */

	.table-checkbox {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: var(--fg);
	}

	/* ========================================
     DEADLINE CELL
     ======================================== */

	.deadline-cell {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		align-items: flex-start;
	}

	.deadline-date {
		font-size: var(--text-xs);
		color: var(--muted);
	}

	.deadline-badge {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		border: var(--border-width) solid var(--fg);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.deadline-badge.urgent {
		background-color: var(--fg);
		color: var(--bg);
	}

	.deadline-badge.closed {
		background-color: var(--muted);
		color: var(--bg);
		border-color: var(--muted);
		opacity: 0.7;
	}
</style>
