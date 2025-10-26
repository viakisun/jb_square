<script lang="ts">
	import { onMount } from 'svelte';
	import { Panel } from '$lib/components/layout';
	import { Button } from '$lib/components/ui/buttons';
	import { CrawlingStatus } from '$lib/components/crawling';

	const API_BASE = 'http://localhost:8000/api';

	interface LogEntry {
		timestamp: string;
		message: string;
		type?: 'info' | 'success' | 'error' | 'warning';
	}

	interface BICenter {
		id: number;
		region: string;
		city: string;
		org_name: string;
		center_name: string;
		contact: string;
		specialization: string;
		vacant_rooms: string;
		location: string;
		companies_count: number;
		created_at: string;
		updated_at: string;
	}

	interface BICompany {
		id: number;
		center_id: number;
		company_name: string;
		business_field: string;
		product: string;
		entry_date: string;
		status: string;
		created_at: string;
		updated_at: string;
	}

	interface Stats {
		total_centers: number;
		total_companies: number;
		centers_by_region: Array<{ region: string; count: number }>;
		companies_by_status: Array<{ status: string; count: number }>;
	}

	let allCenters = $state<BICenter[]>([]);
	let filteredCenters = $state<BICenter[]>([]);
	let loading = $state(false);
	let expandedCenterId = $state<number | null>(null);
	let companies = $state<Record<number, BICompany[]>>({});
	let stats = $state<Stats | null>(null);

	// Filter states
	let selectedRegion = $state<string>('all');
	let searchQuery = $state<string>('');
	let sortBy = $state<'name' | 'companies' | 'recent'>('companies');

	// Real-time crawling status
	let crawlStatus = $state<'idle' | 'running' | 'completed' | 'error' | 'stopped'>('idle');
	let crawlLogs = $state<LogEntry[]>([]);
	let crawlProgress = $state({ progress: 0, total: 0, success: 0, failed: 0 });
	let errorMessage = $state('');

	async function loadCenters() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE}/bi-centers/list`);
			const data = await res.json();
			allCenters = data.items;
			applyFilters();
		} catch (error) {
			console.error('Failed to load centers:', error);
		} finally {
			loading = false;
		}
	}

	async function loadStats() {
		try {
			const res = await fetch(`${API_BASE}/bi-centers/stats/overview`);
			stats = await res.json();
		} catch (error) {
			console.error('Failed to load stats:', error);
		}
	}

	async function loadCompanies(centerId: number) {
		if (companies[centerId]) {
			// Already loaded, just toggle
			return;
		}

		try {
			const res = await fetch(`${API_BASE}/bi-centers/${centerId}/companies`);
			const data = await res.json();
			companies[centerId] = data.items;
		} catch (error) {
			console.error('Failed to load companies:', error);
		}
	}

	function applyFilters() {
		let result = [...allCenters];

		// Region filter
		if (selectedRegion !== 'all') {
			result = result.filter((c) => c.region === selectedRegion);
		}

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(c) =>
					c.center_name.toLowerCase().includes(query) ||
					c.org_name.toLowerCase().includes(query) ||
					c.city?.toLowerCase().includes(query)
			);
		}

		// Sort
		if (sortBy === 'companies') {
			result.sort((a, b) => b.companies_count - a.companies_count);
		} else if (sortBy === 'name') {
			result.sort((a, b) => a.center_name.localeCompare(b.center_name, 'ko'));
		} else if (sortBy === 'recent') {
			result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
		}

		filteredCenters = result;
	}

	$effect(() => {
		// Re-apply filters when dependencies change
		selectedRegion;
		searchQuery;
		sortBy;
		applyFilters();
	});

	function toggleCenter(centerId: number) {
		if (expandedCenterId === centerId) {
			expandedCenterId = null;
		} else {
			expandedCenterId = centerId;
			loadCompanies(centerId);
		}
	}

	async function crawlBICenters() {
		loading = true;
		crawlStatus = 'running';
		crawlLogs = [];
		crawlProgress = { progress: 0, total: 0, success: 0, failed: 0 };
		errorMessage = '';

		try {
			const ws = new WebSocket(`ws://localhost:8000/api/crawling/ws/bi_center`);

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				const timestamp = new Date().toISOString();

				switch (data.type) {
					case 'start':
						crawlLogs = [
							...crawlLogs,
							{ timestamp, message: data.message || 'BI 센터 데이터 수집을 시작합니다...', type: 'info' }
						];
						break;

					case 'log':
						crawlLogs = [...crawlLogs, { timestamp, message: data.message, type: 'info' }];
						break;

					case 'progress':
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
							{
								timestamp,
								message: data.message || 'BI 센터 데이터 수집이 완료되었습니다.',
								type: 'success'
							},
							{
								timestamp,
								message: `총 ${data.total_centers}개 센터, ${data.total_companies}개 입주기업 수집 완료`,
								type: 'success'
							}
						];
						loading = false;
						// Reload data
						loadCenters();
						loadStats();
						break;

					case 'error':
						crawlStatus = 'error';
						errorMessage = data.message || 'BI 센터 데이터 수집 중 오류가 발생했습니다.';
						crawlLogs = [
							...crawlLogs,
							{ timestamp, message: data.message || 'Error occurred', type: 'error' }
						];
						loading = false;
						break;

					case 'stopped':
						crawlStatus = 'stopped';
						crawlLogs = [
							...crawlLogs,
							{ timestamp, message: data.message || 'BI 센터 데이터 수집이 중단되었습니다.', type: 'warning' }
						];
						loading = false;
						break;
				}
			};

			ws.onclose = () => {
				if (crawlStatus === 'running') {
					crawlStatus = 'completed';
				}
				loadCenters();
				loadStats();
				loading = false;
			};

			ws.onerror = (error) => {
				crawlStatus = 'error';
				errorMessage = '웹소켓 연결 오류가 발생했습니다.';
				crawlLogs = [
					...crawlLogs,
					{
						timestamp: new Date().toISOString(),
						message: '웹소켓 연결 오류가 발생했습니다.',
						type: 'error'
					}
				];
				loading = false;
			};
		} catch (error) {
			crawlStatus = 'error';
			errorMessage = String(error);
			loading = false;
		}
	}

	// Get unique regions from all centers
	let uniqueRegions = $derived([...new Set(allCenters.map((c) => c.region))].sort());

	// Calculate total vacancies
	let totalVacancies = $derived(
		allCenters.reduce((sum, center) => {
			const rooms = parseInt(center.vacant_rooms) || 0;
			return sum + rooms;
		}, 0)
	);

	onMount(() => {
		loadCenters();
		loadStats();
	});
</script>

<svelte:head>
	<title>창업보육센터 - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">창업보육센터</h1>
			<p class="page-subtitle">전북 지역 창업보육센터 및 입주기업 정보</p>
		</div>
		<div class="header-actions">
			<Button variant="primary" onclick={crawlBICenters} disabled={loading}>
				BI 센터 데이터 수집
			</Button>
		</div>
	</div>

	{#if stats}
		<div class="stats-grid">
			<div class="stat-card">
				<div class="stat-value">{stats.total_centers}</div>
				<div class="stat-label">총 센터 수</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{stats.total_companies}</div>
				<div class="stat-label">총 입주기업</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{totalVacancies}</div>
				<div class="stat-label">총 공실수</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">
					{stats.total_centers > 0 ? Math.round(stats.total_companies / stats.total_centers) : 0}
				</div>
				<div class="stat-label">평균 입주기업</div>
			</div>
		</div>
	{/if}

	{#if crawlStatus !== 'idle'}
		<Panel title="데이터 수집 진행 상황">
			<CrawlingStatus
				sourceId="bi_center"
				sourceName="창업보육센터"
				status={crawlStatus}
				progress={crawlProgress.progress}
				total={crawlProgress.total}
				success={crawlProgress.success}
				failed={crawlProgress.failed}
				logs={crawlLogs}
				{errorMessage}
			/>
		</Panel>
	{/if}

	<Panel title="필터 및 검색">
		<div class="filter-section">
			<div class="filter-group">
				<label for="region-filter">지역</label>
				<select id="region-filter" bind:value={selectedRegion}>
					<option value="all">전체</option>
					{#each uniqueRegions as region}
						<option value={region}>{region}</option>
					{/each}
				</select>
			</div>

			<div class="filter-group">
				<label for="search-input">검색</label>
				<input
					id="search-input"
					type="text"
					placeholder="센터명, 기관명, 지역 검색..."
					bind:value={searchQuery}
				/>
			</div>

			<div class="filter-group">
				<label for="sort-select">정렬</label>
				<select id="sort-select" bind:value={sortBy}>
					<option value="companies">입주기업 많은 순</option>
					<option value="name">이름순</option>
					<option value="recent">최신순</option>
				</select>
			</div>
		</div>
	</Panel>

	<Panel title={`BI 센터 목록 (${filteredCenters.length}개)`}>
		{#if loading && filteredCenters.length === 0}
			<div class="loading">로딩 중...</div>
		{:else if filteredCenters.length === 0}
			<div class="empty">
				{searchQuery || selectedRegion !== 'all'
					? '검색 결과가 없습니다.'
					: '등록된 BI 센터가 없습니다. 위의 "BI 센터 데이터 수집" 버튼을 눌러 데이터를 수집하세요.'}
			</div>
		{:else}
			<div class="centers-list">
				{#each filteredCenters as center (center.id)}
					<div class="center-card">
						<div class="center-header" role="button" tabindex="0" onclick={() => toggleCenter(center.id)}>
							<div class="center-info">
								<h3 class="center-name">{center.center_name}</h3>
								<p class="org-name">{center.org_name}</p>
								<div class="meta">
									<span class="badge">{center.region}</span>
									{#if center.city}
										<span class="badge">{center.city}</span>
									{/if}
									<span class="companies-badge {center.companies_count > 0 ? 'has-companies' : ''}">
										{center.companies_count}개 입주기업
									</span>
								</div>

								<!-- Always visible center details -->
								<div class="detail-grid-inline">
									<div class="detail-item-inline">
										<span class="label-inline">주력보육분야:</span>
										<span class="value-inline">{center.specialization || '-'}</span>
									</div>
									<div class="detail-item-inline">
										<span class="label-inline">공실:</span>
										<span class="value-inline">{center.vacant_rooms || '-'}</span>
									</div>
									<div class="detail-item-inline">
										<span class="label-inline">위치:</span>
										<span class="value-inline">{center.location || '-'}</span>
									</div>
								</div>
							</div>
							<div class="expand-icon">
								{#if expandedCenterId === center.id}
									▼
								{:else}
									▶
								{/if}
							</div>
						</div>

						{#if expandedCenterId === center.id}
							<div class="center-details">
								{#if companies[center.id] && companies[center.id].length > 0}
									<div class="companies-section">
										<h4 class="companies-title">입주기업 ({companies[center.id].length}개)</h4>
										<div class="companies-table">
											<table>
												<thead>
													<tr>
														<th>기업명</th>
														<th>업종</th>
														<th>제품</th>
														<th>입주일</th>
														<th>상태</th>
													</tr>
												</thead>
												<tbody>
													{#each companies[center.id] as company (company.id)}
														<tr>
															<td>{company.company_name}</td>
															<td>{company.business_field || '-'}</td>
															<td>{company.product || '-'}</td>
															<td>{company.entry_date || '-'}</td>
															<td><span class="status-badge">{company.status || '-'}</span></td>
														</tr>
													{/each}
												</tbody>
											</table>
										</div>
									</div>
								{:else if companies[center.id]}
									<div class="empty-companies">입주기업 정보가 없습니다.</div>
								{:else}
									<div class="loading-companies">입주기업 정보를 불러오는 중...</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</Panel>
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

	/* Statistics */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
	}

	.stat-card {
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--hair);
		border-radius: var(--radius);
		padding: var(--space-4);
		text-align: center;
	}

	.stat-value {
		font-size: var(--text-3xl);
		font-weight: var(--font-bold);
		color: var(--fg);
		margin-bottom: var(--space-1);
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--muted);
	}

	/* Filters */
	.filter-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
		padding: var(--space-4);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.filter-group label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
	}

	.filter-group select,
	.filter-group input {
		padding: var(--space-2) var(--space-3);
		border: var(--border-width) solid var(--hair);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--fg);
		font-size: var(--text-sm);
	}

	.filter-group input::placeholder {
		color: var(--muted);
	}

	.loading,
	.empty {
		text-align: center;
		padding: var(--space-8);
		color: var(--muted);
	}

	.centers-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.center-card {
		border: var(--border-width) solid var(--hair);
		border-radius: var(--radius);
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.center-card:hover {
		border-color: var(--fg);
	}

	.center-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4);
		cursor: pointer;
		background: var(--bg-secondary);
	}

	.center-header:hover {
		background: var(--bg-tertiary);
	}

	.center-info {
		flex: 1;
	}

	.center-name {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin-bottom: var(--space-1);
	}

	.org-name {
		font-size: var(--text-sm);
		color: var(--muted);
		margin-bottom: var(--space-2);
	}

	.meta {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.badge {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		background: var(--bg-tertiary);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		color: var(--muted);
	}

	.companies-badge {
		display: inline-block;
		padding: var(--space-1) var(--space-3);
		background: var(--bg-tertiary);
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
	}

	.companies-badge.has-companies {
		background: var(--fg);
		color: var(--bg);
	}

	.expand-icon {
		color: var(--muted);
		font-size: var(--text-sm);
	}

	.center-details {
		padding: var(--space-4);
		background: var(--bg);
		border-top: var(--border-width) solid var(--hair);
	}

	.detail-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.detail-item {
		display: flex;
		gap: var(--space-2);
	}

	.detail-item .label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		min-width: 100px;
	}

	.detail-item .value {
		font-size: var(--text-sm);
		color: var(--fg);
	}

	/* Inline detail grid - always visible in header */
	.detail-grid-inline {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-2);
		margin-top: var(--space-3);
		padding-top: var(--space-3);
		border-top: var(--border-width) solid var(--hair);
	}

	.detail-item-inline {
		display: flex;
		gap: var(--space-2);
		font-size: var(--text-sm);
	}

	.label-inline {
		font-weight: var(--font-medium);
		color: var(--muted);
		white-space: nowrap;
	}

	.value-inline {
		color: var(--fg);
	}

	.companies-section {
		margin-top: 0;
	}

	.companies-title {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin-bottom: var(--space-3);
	}

	.companies-table {
		overflow-x: auto;
	}

	.companies-table table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.companies-table thead {
		background: var(--bg-secondary);
	}

	.companies-table th {
		padding: var(--space-2) var(--space-3);
		text-align: left;
		font-weight: var(--font-medium);
		color: var(--muted);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.companies-table td {
		padding: var(--space-2) var(--space-3);
		border-bottom: var(--border-width) solid var(--hair);
		color: var(--fg);
	}

	.companies-table tbody tr:hover {
		background: var(--bg-secondary);
	}

	.status-badge {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		background: var(--bg-tertiary);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		color: var(--muted);
	}

	.empty-companies,
	.loading-companies {
		text-align: center;
		padding: var(--space-4);
		color: var(--muted);
		font-size: var(--text-sm);
	}
</style>
