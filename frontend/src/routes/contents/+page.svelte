<script lang="ts">
	/**
	 * JB SQUARE Contents Page
	 * 공고 목록 관리 페이지
	 */

	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/buttons';
	import { Input, Select } from '$lib/components/ui/forms';
	import { Panel } from '$lib/components/layout';
	import { DataTable, Pagination, EmptyState, type Column } from '$lib/components/ui/data';
	import { Badge, Spinner } from '$lib/components/feedback';

	type Notice = {
		id: string;
		title: string;
		source: string;
		category: string;
		start_date: string;
		end_date: string;
		status: 'active' | 'closed' | 'upcoming';
		days_left?: number;
	};

	let notices = $state<Notice[]>([]);
	let filteredNotices = $state<Notice[]>([]);
	let isLoading = $state(true);

	// Filters
	let searchQuery = $state('');
	let selectedSource = $state('all');
	let selectedStatus = $state('all');

	// Pagination
	let currentPage = $state(1);
	let itemsPerPage = 20;

	const sourceOptions = [
		{ value: 'all', label: '전체 출처' },
		{ value: 'JBTP', label: 'JBTP' },
		{ value: 'NTIS', label: 'NTIS' },
		{ value: 'BizInfo', label: 'BizInfo' }
	];

	const statusOptions = [
		{ value: 'all', label: '전체 상태' },
		{ value: 'active', label: '진행중' },
		{ value: 'upcoming', label: '예정' },
		{ value: 'closed', label: '마감' }
	];

	const columns: Column<Notice>[] = [
		{
			key: 'title',
			label: '제목',
			sortable: true,
			width: '40%'
		},
		{
			key: 'source',
			label: '출처',
			sortable: true,
			width: '15%'
		},
		{
			key: 'category',
			label: '분류',
			sortable: true,
			width: '15%'
		},
		{
			key: 'start_date',
			label: '시작일',
			sortable: true,
			width: '12%'
		},
		{
			key: 'end_date',
			label: '마감일',
			sortable: true,
			width: '12%'
		},
		{
			key: 'status',
			label: '상태',
			sortable: true,
			width: '10%',
			align: 'center'
		}
	];

	const totalPages = $derived(Math.ceil(filteredNotices.length / itemsPerPage));
	const paginatedNotices = $derived(
		filteredNotices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	onMount(async () => {
		await loadNotices();
	});

	async function loadNotices() {
		isLoading = true;
		try {
			const response = await fetch('http://localhost:8000/api/contents');
			const data = await response.json();

			// Transform data to match our Notice type
			notices = data.notices.map((notice: any, index: number) => ({
				id: `notice-${index}`,
				title: notice.title,
				source: notice.source,
				category: notice.category || '일반',
				start_date: notice.start_date || '-',
				end_date: notice.end_date || '-',
				status: getStatus(notice.end_date),
				days_left: notice.days_left
			}));

			applyFilters();
		} catch (error) {
			console.error('Failed to load notices:', error);
		} finally {
			isLoading = false;
		}
	}

	function getStatus(endDate: string): 'active' | 'closed' | 'upcoming' {
		if (!endDate || endDate === '-') return 'active';

		const end = new Date(endDate);
		const now = new Date();

		if (end < now) return 'closed';
		if (end > now) return 'active';
		return 'active';
	}

	function applyFilters() {
		filteredNotices = notices.filter((notice) => {
			const matchesSearch =
				searchQuery === '' ||
				notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				notice.source.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesSource = selectedSource === 'all' || notice.source === selectedSource;
			const matchesStatus = selectedStatus === 'all' || notice.status === selectedStatus;

			return matchesSearch && matchesSource && matchesStatus;
		});

		// Reset to first page when filters change
		currentPage = 1;
	}

	function handlePageChange(page: number) {
		currentPage = page;
	}

	function handleReset() {
		searchQuery = '';
		selectedSource = 'all';
		selectedStatus = 'all';
		applyFilters();
	}

	function handleRowClick(notice: Notice) {
		console.log('Notice clicked:', notice);
		// TODO: Navigate to detail page or open modal
	}

	// Apply filters when inputs change
	$effect(() => {
		searchQuery;
		selectedSource;
		selectedStatus;
		applyFilters();
	});
</script>

<svelte:head>
	<title>콘텐츠 - JB SQUARE Backoffice</title>
</svelte:head>

<div class="contents-page">
	<!-- Page Header -->
	<div class="page-header">
		<div>
			<h1 class="page-title">CONTENTS</h1>
			<p class="page-subtitle">공고 목록 관리</p>
		</div>
		<div class="page-actions">
			<Button variant="outline" iconLeft="↻" onclick={loadNotices}>새로고침</Button>
			<Button variant="primary" iconLeft="+">공고 추가</Button>
		</div>
	</div>

	<!-- Filters -->
	<Panel>
		<div class="filters">
			<Input
				type="search"
				placeholder="제목, 출처로 검색..."
				bind:value={searchQuery}
				clearable
				class="filter-search"
			/>

			<Select bind:value={selectedSource} options={sourceOptions} />

			<Select bind:value={selectedStatus} options={statusOptions} />

			<Button variant="ghost" onclick={handleReset}>초기화</Button>
		</div>

		<div class="filters-summary">
			<span class="text-sm text-muted">
				총 {filteredNotices.length}개 공고 (전체 {notices.length}개 중)
			</span>
		</div>
	</Panel>

	<!-- Content Table -->
	{#if isLoading}
		<Panel>
			<div class="loading-container">
				<Spinner size="lg" label="공고 목록을 불러오는 중..." />
			</div>
		</Panel>
	{:else if paginatedNotices.length === 0}
		<Panel>
			<EmptyState
				icon="□"
				title="검색 결과가 없습니다"
				description="다른 검색어나 필터를 사용해보세요."
			>
				<Button variant="outline" onclick={handleReset}>필터 초기화</Button>
			</EmptyState>
		</Panel>
	{:else}
		<Panel noPadding>
			<DataTable
				{columns}
				data={paginatedNotices}
				sortable
				hoverable
				onRowClick={handleRowClick}
			/>
		</Panel>

		<!-- Pagination -->
		{#if totalPages > 1}
			<Pagination {currentPage} {totalPages} onPageChange={handlePageChange} />
		{/if}
	{/if}
</div>

<style>
	/* ========================================
     CONTENTS PAGE
     ======================================== */

	.contents-page {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* ========================================
     PAGE HEADER
     ======================================== */

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

	.page-actions {
		display: flex;
		gap: var(--space-3);
	}

	/* ========================================
     FILTERS
     ======================================== */

	.filters {
		display: flex;
		gap: var(--space-3);
		align-items: flex-end;
		margin-bottom: var(--space-4);
	}

	.filters :global(.filter-search) {
		flex: 1;
		min-width: 200px;
	}

	.filters-summary {
		padding-top: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
	}

	/* ========================================
     LOADING
     ======================================== */

	.loading-container {
		display: flex;
		justify-content: center;
		padding: var(--space-16) var(--space-8);
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 1024px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-4);
		}

		.page-actions {
			width: 100%;
		}
	}

	@media (max-width: 768px) {
		.contents-page {
			padding: var(--space-4);
		}

		.filters {
			flex-direction: column;
			align-items: stretch;
		}

		.filters :global(.filter-search) {
			width: 100%;
		}

		.page-actions {
			flex-direction: column;
		}
	}
</style>
