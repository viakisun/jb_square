<script lang="ts">
	/**
	 * JB SQUARE Dashboard Page
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 */

	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/buttons';
	import { Panel, Card } from '$lib/components/layout';
	import { DataTable, type Column } from '$lib/components/ui/data';
	import { API_BASE_URL } from '$lib/config/api';

	let summary = $state({
		notices: { total: 0, bio_related: 0, today_collected: 0, published: 0 },
		organizations: { total_centers: 0, total_companies: 0, today_updated: 0 },
		crawling: { last_run: '', status: '', sources_active: 0 }
	});

	type UrgentNotice = {
		title: string;
		source: string;
		days_left: number;
		urgency: string;
	};

	type RecentOrganization = {
		name: string;
		city: string;
		tenant_count: number;
	};

	type CrawlingLog = {
		source: string;
		status: string;
		items_collected: number;
		timestamp: string;
		duration: string;
	};

	let urgentNotices = $state<UrgentNotice[]>([]);
	let recentOrganizations = $state<RecentOrganization[]>([]);
	let recentLogs = $state<CrawlingLog[]>([]);

	const urgentNoticesColumns: Column<UrgentNotice>[] = [
		{ key: 'title', label: '제목', sortable: true, width: '50%' },
		{ key: 'source', label: '출처', sortable: true, width: '25%' },
		{
			key: 'days_left',
			label: 'D-day',
			sortable: true,
			width: '25%',
			align: 'right',
			render: (value) => `D-${value}`
		}
	];

	const recentOrganizationsColumns: Column<RecentOrganization>[] = [
		{ key: 'name', label: '센터명', sortable: true, width: '40%' },
		{ key: 'city', label: '지역', sortable: true, width: '30%' },
		{
			key: 'tenant_count',
			label: '입주기업',
			sortable: true,
			width: '30%',
			align: 'right',
			render: (value) => `${value}개`
		}
	];

	const crawlingLogsColumns: Column<CrawlingLog>[] = [
		{ key: 'source', label: '출처', sortable: true, width: '20%' },
		{ key: 'status', label: '상태', sortable: true, width: '15%' },
		{
			key: 'items_collected',
			label: '수집 건수',
			sortable: true,
			width: '15%',
			align: 'right',
			render: (value) => `${value}건`
		},
		{ key: 'timestamp', label: '실행 시간', sortable: true, width: '25%' },
		{ key: 'duration', label: '소요 시간', sortable: true, width: '25%', align: 'right' }
	];

	onMount(async () => {
		try {
			const [summaryRes, urgentRes, orgRes, logsRes] = await Promise.all([
				fetch(`${API_BASE_URL}/dashboard/summary`),
				fetch(`${API_BASE_URL}/dashboard/urgent-notices`),
				fetch(`${API_BASE_URL}/dashboard/recent-organizations`),
				fetch(`${API_BASE_URL}/dashboard/recent-logs`)
			]);

			summary = await summaryRes.json();
			urgentNotices = await urgentRes.json();
			recentOrganizations = await orgRes.json();
			recentLogs = await logsRes.json();
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		}
	});

	function handleManualCrawl() {
		console.log('Manual crawl triggered');
		// TODO: Implement manual crawl
	}
</script>

<svelte:head>
	<title>대시보드 - JB SQUARE Backoffice</title>
</svelte:head>

<div class="dashboard">
	<!-- Page Header -->
	<div class="page-header">
		<div>
			<h1 class="page-title">DASHBOARD</h1>
			<p class="page-subtitle">전북 바이오 산업 플랫폼 현황</p>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<Card>
			<div class="stat-card">
				<div class="stat-value">{summary.notices.total}</div>
				<div class="stat-label">전체 공고</div>
				<div class="stat-meta">바이오 {summary.notices.bio_related}건</div>
			</div>
		</Card>

		<Card>
			<div class="stat-card">
				<div class="stat-value">{summary.organizations.total_centers}</div>
				<div class="stat-label">창업보육센터</div>
				<div class="stat-meta">{summary.organizations.total_companies}개 입주기업</div>
			</div>
		</Card>

		<Card>
			<div class="stat-card">
				<div class="stat-value">{summary.notices.today_collected}</div>
				<div class="stat-label">오늘 수집</div>
				<div class="stat-meta">{summary.notices.published}건 게시됨</div>
			</div>
		</Card>

		<Card>
			<div class="stat-card">
				<div class="stat-value">{summary.crawling.sources_active}</div>
				<div class="stat-label">활성 소스</div>
				<div class="stat-meta">
					<span class="status-dot"></span>
					정상 작동
				</div>
			</div>
		</Card>
	</div>

	<!-- Main Grid -->
	<div class="content-grid">
		<!-- Urgent Notices -->
		<Panel title="마감 임박 공고">
			{#if urgentNotices.length === 0}
				<p class="text-muted">마감 임박 공고가 없습니다.</p>
			{:else}
				<DataTable columns={urgentNoticesColumns} data={urgentNotices} sortable hoverable />
			{/if}
		</Panel>

		<!-- Recent Organizations -->
		<Panel title="최근 업데이트 기업">
			{#if recentOrganizations.length === 0}
				<p class="text-muted">최근 업데이트가 없습니다.</p>
			{:else}
				<DataTable
					columns={recentOrganizationsColumns}
					data={recentOrganizations}
					sortable
					hoverable
				/>
			{/if}
		</Panel>
	</div>

	<!-- Crawling Logs -->
	<Panel title="크롤링 실행 로그">
		{#if recentLogs.length === 0}
			<p class="text-muted">크롤링 로그가 없습니다.</p>
		{:else}
			<DataTable columns={crawlingLogsColumns} data={recentLogs} sortable hoverable />
		{/if}
	</Panel>
</div>

<style>
	/* ========================================
     DASHBOARD LAYOUT
     ======================================== */

	.dashboard {
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

	/* ========================================
     STATS GRID
     ======================================== */

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-6);
	}

	@media (max-width: 1200px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}
	}

	/* ========================================
     STAT CARD
     ======================================== */

	.stat-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		color: var(--fg);
		line-height: 1;
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.stat-meta {
		font-size: var(--text-sm);
		color: var(--muted);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	/* ========================================
     CONTENT GRID
     ======================================== */

	.content-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-6);
	}

	@media (max-width: 1024px) {
		.content-grid {
			grid-template-columns: 1fr;
		}
	}

	/* ========================================
     STATUS DOT
     ======================================== */

	.status-dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		background-color: var(--fg);
	}
</style>
