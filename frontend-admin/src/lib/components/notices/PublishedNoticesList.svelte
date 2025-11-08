<script lang="ts">
	/**
	 * Published Notices List
	 * Displays list of published notices with filtering and pagination
	 */
	import { onMount, untrack } from 'svelte';
	import NoticeCard from './NoticeCard.svelte';
	import { Input, Select, Checkbox } from '$lib/components/ui/forms';
	import { Button } from '$lib/components/ui/buttons';
	import { Pagination } from '$lib/components/ui/data';
	import { Spinner } from '$lib/components/feedback';
	import { toast } from '$lib/stores/toast';
	import type { CategoryId, SourceId } from '$lib/constants/categories';
	import { fetchNotices, bulkDeleteNotices } from '$lib/api/notices';
	import { TAG_OPTIONS } from '$lib/constants/tags';
	import { useSelection } from '$lib/composables/useSelection.svelte';

	interface Props {
		sourceId: SourceId; // 'ntis' | 'jbtp' | 'bizinfo'
		category: CategoryId; // DB 카테고리: 'government' | 'business' | 'rnd' | 'startup'
	}

	let { sourceId, category }: Props = $props();

	type Notice = {
		id: number;
		title: string;
		content: string | null;
		link: string | null;
		origin_type: string;
		crawler_source_id: string;
		category: string;
		tags: string[];
		organization: string | null;
		published_at: string | null;
		deadline: string | null;
		matched_keywords?: string[];
	};

	let notices = $state<Notice[]>([]);
	let total = $state(0);
	let loading = $state(false);

	// Use selection composable
	const selection = useSelection<Notice>();
	let deleting = $state(false);

	// Filters
	let searchQuery = $state('');
	let selectedTag = $state('');
	let statusFilter = $state('published');

	// Pagination
	let currentPage = $state(1);
	let itemsPerPage = 20;
	let totalPages = $derived(Math.ceil(total / itemsPerPage));

	let isInitialMount = true;

	onMount(() => {
		loadNotices();
		isInitialMount = false;
	});

	async function loadNotices() {
		loading = true;
		try {
			const result = await fetchNotices({
				source_id: sourceId,
				category: category,
				status: statusFilter,
				limit: String(itemsPerPage),
				offset: String((currentPage - 1) * itemsPerPage),
				search: searchQuery || undefined,
				tag: selectedTag || undefined
			});

			notices = result.items;
			total = result.total;
		} catch (error) {
			console.error('Failed to load notices:', error);
			toast.error('공고 로드 실패');
		} finally {
			loading = false;
		}
	}

	async function deleteSelected() {
		if (selection.selectedCount === 0) return;

		if (!confirm(`선택한 ${selection.selectedCount}개 공고를 삭제(아카이브)하시겠습니까?`)) {
			return;
		}

		deleting = true;
		try {
			const result = await bulkDeleteNotices(Array.from(selection.selectedIds));
			toast.success(`${result.archived}개 공고가 삭제되었습니다`);
			selection.clearSelection();
			await loadNotices();
		} catch (error) {
			console.error('Failed to delete notices:', error);
			toast.error('삭제 중 오류 발생');
		} finally {
			deleting = false;
		}
	}

	function handleSearch() {
		currentPage = 1;
		loadNotices();
	}

	function handlePageChange(page: number) {
		currentPage = page;
		loadNotices();
	}

	// Handle allSelected change
	let previousAllSelected = false;
	$effect(() => {
		// Only react when allSelected actually changes (not on initial render)
		if (selection.allSelected !== previousAllSelected) {
			if (selection.allSelected) {
				selection.selectedIds = new Set(notices.map((notice: any) => notice.id));
			} else {
				selection.selectedIds = new Set();
			}
			previousAllSelected = selection.allSelected;
		}
	});

	// Auto reload when filters change (초기 마운트 제외)
	$effect.pre(() => {
		if (isInitialMount) return;

		// 필터 변경만 추적
		selectedTag;
		statusFilter;

		// untrack으로 무한 루프 방지
		untrack(() => {
			currentPage = 1;
			loadNotices();
		});
	});
</script>

<div class="published-notices">
	<!-- Filters -->
	<div class="filters-bar">
		<Input
			type="search"
			placeholder="공고 검색..."
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<Select options={TAG_OPTIONS} bind:value={selectedTag} />
		<Button onclick={handleSearch}>검색</Button>
		<Button variant="outline" onclick={loadNotices}>새로고침</Button>
	</div>

	<!-- Selection Header -->
	<div class="selection-header">
		<div class="selection-left">
			<label class="select-all-label">
				<Checkbox bind:checked={selection.allSelected} />
				<span class="select-all-text">전체 선택</span>
			</label>
			{#if selection.selectedCount > 0}
				<span class="selected-count"><strong>{selection.selectedCount}</strong>개 선택됨</span>
			{:else}
				<span class="notice-count">총 <strong>{total}</strong>개의 공고</span>
			{/if}
		</div>
		{#if selection.selectedCount > 0}
			<Button variant="outline" size="sm" onclick={deleteSelected} disabled={deleting}>
				{deleting ? '삭제 중...' : '선택 삭제'}
			</Button>
		{/if}
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="loading-state">
			<Spinner />
			<p>공고를 불러오는 중...</p>
		</div>
	{:else if notices.length === 0}
		<div class="empty-state">
			<p>게시된 공고가 없습니다.</p>
			<p class="empty-subtitle">크롤링 대기열에서 공고를 선택하여 게시하거나, 수동으로 공고를 추가하세요.</p>
		</div>
	{:else}
		<!-- Notices Grid -->
		<div class="notices-grid">
			{#each notices as notice}
				<NoticeCard
					{notice}
					selectable={true}
					selected={selection.isSelected(notice.id)}
					onSelect={selection.toggleItem}
				/>
			{/each}
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="pagination-wrapper">
				<Pagination
					{currentPage}
					{totalPages}
					onPageChange={handlePageChange}
				/>
			</div>
		{/if}
	{/if}
</div>

<style>
	.published-notices {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.filters-bar {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		flex-wrap: wrap;
	}

	.filters-bar :global(input) {
		flex: 1;
		min-width: 250px;
	}

	.selection-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) 0;
		gap: var(--space-4);
	}

	.selection-left {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: 1;
	}

	.select-all-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
	}

	.select-all-text {
		font-size: var(--text-sm);
		color: var(--fg);
		font-weight: var(--font-medium);
	}

	.notice-count,
	.selected-count {
		font-size: var(--text-sm);
		color: var(--muted);
	}

	.notice-count strong,
	.selected-count strong {
		color: var(--fg);
		font-weight: var(--font-semibold);
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-12);
		color: var(--muted);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-12);
		text-align: center;
		color: var(--muted);
	}

	.empty-subtitle {
		font-size: var(--text-sm);
		max-width: 400px;
	}

	.notices-grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.pagination-wrapper {
		display: flex;
		justify-content: center;
		padding-top: var(--space-4);
	}

	@media (max-width: 768px) {
		.filters-bar {
			flex-direction: column;
			align-items: stretch;
		}

		.filters-bar :global(input),
		.filters-bar :global(select),
		.filters-bar :global(button) {
			width: 100%;
		}

		.notices-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
