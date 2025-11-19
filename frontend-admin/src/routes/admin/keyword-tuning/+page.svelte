<script lang="ts">
	import { onMount } from 'svelte';
	import { API_BASE_URL } from '$lib/config/api';

	// API Base URL
	const API_BASE = API_BASE_URL;

	// State
	let loading = $state(false);
	let error = $state('');

	// Filters
	let selectedSources = $state<string[]>([]);
	let keywordsInput = $state('');
	let dateRange = $state(365);
	let countPerSource = $state(100);

	// Available sources
	let availableSources = $state<Array<{ id: string; name: string }>>([]);

	// Results
	let allNotices = $state<any[]>([]);  // 전체 데이터 (백엔드에서 로드)
	let sourceStats = $state<any>({});   // 소스별 통계 (백엔드에서 로드)

	// Computed filtered data based on keywordsInput
	let filteredData = $derived.by(() => {
		if (!allNotices || allNotices.length === 0) {
			return {
				notices: [],
				statistics: {
					total: 0,
					matched: 0,
					unmatched: 0,
					by_source: {},
					by_keyword: {}
				}
			};
		}

		// Parse keywords
		const keywords = keywordsInput.trim().split(/\s+/).filter(k => k.length > 0);

		if (keywords.length === 0) {
			// No filter, return all
			return {
				notices: allNotices,
				statistics: {
					total: allNotices.length,
					matched: allNotices.length,
					unmatched: 0,
					by_source: sourceStats,
					by_keyword: {}
				}
			};
		}

		// Filter notices by keywords in title
		const filtered = allNotices.map(notice => {
			const title = (notice.title || '').toLowerCase();
			const matched: string[] = [];

			keywords.forEach(keyword => {
				if (title.includes(keyword.toLowerCase())) {
					matched.push(keyword);
				}
			});

			return {
				...notice,
				matched_keywords: matched
			};
		}).filter(notice => notice.matched_keywords.length > 0);

		// Calculate statistics
		const byKeyword: Record<string, number> = {};
		const bySource: Record<string, any> = {};

		filtered.forEach(notice => {
			// Keyword stats
			notice.matched_keywords.forEach((kw: string) => {
				byKeyword[kw] = (byKeyword[kw] || 0) + 1;
			});

			// Source stats
			const sourceName = notice.board || notice.source || '기타';
			if (!bySource[sourceName]) {
				bySource[sourceName] = { total: 0, matched: 0, unmatched: 0 };
			}
			bySource[sourceName].matched++;
		});

		// Add total counts to source stats
		Object.keys(sourceStats).forEach(sourceName => {
			if (!bySource[sourceName]) {
				bySource[sourceName] = { total: sourceStats[sourceName].total, matched: 0, unmatched: sourceStats[sourceName].total };
			} else {
				bySource[sourceName].total = sourceStats[sourceName].total;
				bySource[sourceName].unmatched = sourceStats[sourceName].total - bySource[sourceName].matched;
			}
		});

		return {
			notices: filtered,
			statistics: {
				total: allNotices.length,
				matched: filtered.length,
				unmatched: allNotices.length - filtered.length,
				by_source: bySource,
				by_keyword: byKeyword
			}
		};
	});

	// Load available sources
	onMount(async () => {
		try {
			const response = await fetch(`${API_BASE}/keyword-tuning/sources`);
			const data = await response.json();
			if (data.success) {
				availableSources = data.data;
				// Select all sources by default
				selectedSources = availableSources.map((s) => s.id);
			}
		} catch (err) {
			console.error('Failed to load sources:', err);
		}
	});

	// Run preview - fetch ALL data without keyword filter
	async function runPreview() {
		if (selectedSources.length === 0) {
			error = '최소 1개 이상의 소스를 선택해주세요.';
			return;
		}

		loading = true;
		error = '';
		allNotices = [];
		sourceStats = {};

		try {
			const sourcesParam = selectedSources.join(',');
			// Always fetch with empty keywords to get ALL data
			const url = `${API_BASE}/keyword-tuning/preview?source_ids=${sourcesParam}&keywords=&date_range_days=${dateRange}&count_per_source=${countPerSource}`;

			const response = await fetch(url);
			const data = await response.json();

			if (data.success) {
				allNotices = data.data.notices || [];
				sourceStats = data.data.statistics.by_source || {};
			} else {
				error = data.error || '알 수 없는 오류가 발생했습니다.';
			}
		} catch (err: any) {
			error = `API 요청 실패: ${err.message}`;
		} finally {
			loading = false;
		}
	}

	// Toggle all sources
	function toggleAllSources() {
		if (selectedSources.length === availableSources.length) {
			selectedSources = [];
		} else {
			selectedSources = availableSources.map((s) => s.id);
		}
	}

	// Export to CSV
	function exportToCSV() {
		if (!filteredData || !filteredData.notices || filteredData.notices.length === 0) {
			alert('다운로드할 데이터가 없습니다.');
			return;
		}

		// CSV 헤더
		const headers = ['날짜', '소스', '제목', '링크', '매칭 키워드'];

		// CSV 데이터 생성
		const rows = filteredData.notices.map((notice: any) => {
			return [
				notice.published_date || '',
				notice.source || '',
				`"${(notice.title || '').replace(/"/g, '""')}"`, // 큰따옴표 이스케이프
				notice.link || '',
				`"${(notice.matched_keywords || []).join(', ')}"`
			];
		});

		// CSV 문자열 생성
		const csvContent = [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');

		// UTF-8 BOM 추가 (Excel 한글 깨짐 방지)
		const bom = '\uFEFF';
		const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

		// 다운로드 트리거
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `keyword_tuning_${new Date().toISOString().split('T')[0]}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}

	// Group notices by board (more granular than source)
	function groupBySource(notices: any[]): Record<string, any[]> {
		const grouped: Record<string, any[]> = {};

		notices.forEach((notice) => {
			// Use 'board' field for JBTP to distinguish between different boards
			const groupKey = notice.board || notice.source || '기타';
			if (!grouped[groupKey]) {
				grouped[groupKey] = [];
			}
			grouped[groupKey].push(notice);
		});

		return grouped;
	}

	// Format date
	function formatDate(dateStr: string): string {
		if (!dateStr || dateStr === '날짜 없음') return dateStr;

		const date = new Date(dateStr);
		const now = new Date();
		const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return '오늘';
		if (diffDays === 1) return '어제';
		if (diffDays < 7) return `${diffDays}일 전`;

		return dateStr;
	}

	// Highlight keywords in title
	function highlightKeywords(title: string, matchedKeywords: string[]): string {
		if (!matchedKeywords || matchedKeywords.length === 0) {
			return title;
		}

		let highlightedTitle = title;

		// Sort keywords by length (longest first) to avoid partial replacements
		const sortedKeywords = [...matchedKeywords].sort((a, b) => b.length - a.length);

		sortedKeywords.forEach((keyword) => {
			// Case-insensitive global replacement
			const regex = new RegExp(`(${keyword})`, 'gi');
			highlightedTitle = highlightedTitle.replace(
				regex,
				'<span class="keyword-highlight">$1</span>'
			);
		});

		return highlightedTitle;
	}
</script>

<svelte:head>
	<title>키워드 튜닝 - JB SQUARE</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<h1>키워드 튜닝</h1>
		<p>실시간으로 키워드를 테스트하고 매칭 결과를 확인하세요.</p>
	</header>

	<!-- Filter Controls -->
	<section class="filters-section">
		<div class="filter-card">
			<h3>소스 선택</h3>
			<div class="source-selector">
				<button class="toggle-all-btn" onclick={toggleAllSources}>
					{selectedSources.length === availableSources.length ? '전체 해제' : '전체 선택'}
				</button>

				<div class="source-list">
					{#each availableSources as source}
						<label class="source-item">
							<input type="checkbox" bind:group={selectedSources} value={source.id} />
							<span>{source.name}</span>
						</label>
					{/each}
				</div>
			</div>
		</div>

		<div class="filter-card">
			<h3>필터 설정</h3>
			<div class="filter-options">
				<label class="filter-item">
					<span>날짜 범위:</span>
					<select bind:value={dateRange}>
						<option value={7}>최근 7일</option>
						<option value={14}>최근 14일</option>
						<option value={30}>최근 30일</option>
						<option value={60}>최근 60일</option>
						<option value={90}>최근 90일</option>
						<option value={180}>최근 180일</option>
						<option value={365}>최근 365일</option>
					</select>
				</label>

				<label class="filter-item">
					<span>소스당 개수:</span>
					<select bind:value={countPerSource}>
						<option value={50}>50개</option>
						<option value={100}>100개</option>
						<option value={150}>150개</option>
						<option value={200}>200개</option>
					</select>
				</label>
			</div>
		</div>

		<div class="action-buttons">
			<button class="btn-primary" onclick={runPreview} disabled={loading}>
				{loading ? '로딩 중...' : '데이터 불러오기'}
			</button>
		</div>
	</section>

	<!-- Error Message -->
	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	<!-- Results -->
	{#if allNotices.length > 0}
		<!-- Keyword Filter (Real-time) -->
		<section class="keyword-filter-section">
			<div class="filter-card">
				<h3>키워드 필터 (실시간)</h3>
				<input
					type="text"
					class="keyword-input"
					bind:value={keywordsInput}
					placeholder="띄어쓰기로 키워드 구분 (예: 바이오 R&D 헬스케어)"
				/>
				<p class="hint">빈 칸으로 두면 전체 공고를 표시합니다. 타이핑하면 즉시 필터링됩니다.</p>
			</div>
			<div class="action-buttons">
				<button class="btn-secondary" onclick={exportToCSV}>CSV 다운로드</button>
			</div>
		</section>
		<!-- Statistics -->
		<section class="stats-section">
			<div class="stat-cards">
				<div class="stat-card">
					<div class="stat-label">전체 공고</div>
					<div class="stat-value">{filteredData.statistics.total}</div>
				</div>

				<div class="stat-card highlight">
					<div class="stat-label">매칭</div>
					<div class="stat-value">{filteredData.statistics.matched}</div>
				</div>

				<div class="stat-card">
					<div class="stat-label">미매칭</div>
					<div class="stat-value">{filteredData.statistics.unmatched}</div>
				</div>

				<div class="stat-card">
					<div class="stat-label">키워드 종류</div>
					<div class="stat-value">{Object.keys(filteredData.statistics.by_keyword).length}</div>
				</div>
			</div>
		</section>

		<!-- Source Statistics -->
		<section class="source-stats-section">
			<h3>소스별 통계</h3>
			<div class="source-stats-grid">
				{#each Object.entries(filteredData.statistics.by_source) as [sourceName, stats]}
					{@const sourceStats = stats as { total: number; matched: number; unmatched: number; error?: string }}
					<div class="source-stat-card">
						<div class="source-name">{sourceName}</div>
						<div class="source-numbers">
							<span class="matched">{sourceStats.matched}</span>
							<span class="separator">/</span>
							<span class="total">{sourceStats.total}</span>
							<span class="label">수집</span>
						</div>
						{#if sourceStats.error}
							<div class="source-error">{sourceStats.error}</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>

		<!-- Keyword Statistics -->
		{#if Object.keys(filteredData.statistics.by_keyword).length > 0}
			<section class="keyword-stats-section">
				<h3>키워드별 매칭 수</h3>
				<div class="keyword-badges">
					{#each Object.entries(filteredData.statistics.by_keyword).sort((a, b) => (b[1] as number) - (a[1] as number)) as [keyword, count]}
						<span class="keyword-badge">
							{keyword} <span class="count">({count})</span>
						</span>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Notices List (Grouped by Source) -->
		<section class="notices-section">
			<h3>공고 목록 ({filteredData.notices.length}개)</h3>

			{#each Object.entries(groupBySource(filteredData.notices)) as [boardName, notices]}
				<div class="source-group">
					<h4 class="source-header">
						{boardName}
						<span class="count">({notices.length}개)</span>
					</h4>

					<table class="notice-table">
						<thead>
							<tr>
								<th class="col-date">등록일</th>
								<th class="col-title">게시물 제목</th>
								{#if keywordsInput.trim()}
									<th class="col-keywords">매칭 키워드</th>
								{/if}
							</tr>
						</thead>
						<tbody>
							{#each notices as notice}
								<tr>
									<td class="col-date">{notice.published_date || '-'}</td>
									<td class="col-title">
										<a href={notice.link} target="_blank" rel="noopener noreferrer">
											{@html highlightKeywords(notice.title, notice.matched_keywords || [])}
										</a>
									</td>
									{#if keywordsInput.trim()}
										<td class="col-keywords">
											{#if notice.matched_keywords && notice.matched_keywords.length > 0}
												<div class="matched-keywords">
													{#each notice.matched_keywords as keyword}
														<span class="keyword-tag">{keyword}</span>
													{/each}
												</div>
											{/if}
										</td>
									{/if}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/each}
		</section>
	{/if}
</div>

<style>
	.page-container {
		padding: var(--space-6);
		max-width: 1400px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: var(--space-8);
	}

	.page-header h1 {
		font-size: var(--text-2xl);
		font-weight: 700;
		margin-bottom: var(--space-2);
	}

	.page-header p {
		color: var(--muted);
		font-size: var(--text-sm);
	}

	/* Filters Section */
	.filters-section {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	/* Keyword Filter Section (Real-time) */
	.keyword-filter-section {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
		padding: var(--space-6);
		border: 2px solid var(--fg);
		background: rgba(0, 0, 0, 0.02);
	}

	.keyword-filter-section .filter-card {
		margin-bottom: 0;
	}

	.keyword-filter-section .action-buttons {
		justify-content: flex-start;
	}

	.filter-card {
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-4);
	}

	.filter-card h3 {
		font-size: var(--text-base);
		font-weight: 600;
		margin-bottom: var(--space-3);
	}

	/* Keyword Input */
	.keyword-input {
		width: 100%;
		padding: var(--space-3);
		border: var(--border-width) solid var(--hair);
		font-size: var(--text-base);
		font-family: inherit;
		background: var(--bg);
		color: var(--fg);
	}

	.keyword-input:focus {
		outline: none;
		border-color: var(--fg);
	}

	.hint {
		margin-top: var(--space-2);
		font-size: var(--text-xs);
		color: var(--muted);
	}

	/* Source Selector */
	.source-selector {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.toggle-all-btn {
		padding: var(--space-2) var(--space-3);
		border: var(--border-width) solid var(--hair);
		background: var(--bg);
		color: var(--fg);
		font-size: var(--text-sm);
		cursor: pointer;
		width: fit-content;
	}

	.toggle-all-btn:hover {
		background: var(--fg);
		color: var(--bg);
	}

	.source-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-2);
	}

	.source-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	/* Filter Options */
	.filter-options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.filter-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
	}

	.filter-item select {
		padding: var(--space-2);
		border: var(--border-width) solid var(--hair);
		background: var(--bg);
		color: var(--fg);
		font-family: inherit;
	}

	/* Action Buttons */
	.action-buttons {
		display: flex;
		gap: var(--space-3);
	}

	.btn-primary,
	.btn-secondary {
		padding: var(--space-3) var(--space-5);
		border: var(--border-width) solid var(--fg);
		font-size: var(--text-base);
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}

	.btn-primary {
		background: var(--fg);
		color: var(--bg);
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--bg);
		color: var(--fg);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: var(--bg);
		color: var(--fg);
	}

	.btn-secondary:hover {
		background: var(--fg);
		color: var(--bg);
	}

	/* Error Message */
	.error-message {
		padding: var(--space-4);
		background: var(--bg);
		border: var(--border-width) solid #ff0000;
		color: #ff0000;
		margin-bottom: var(--space-6);
	}

	/* Statistics Section */
	.stats-section {
		margin-bottom: var(--space-6);
	}

	.stat-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
	}

	.stat-card {
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-4);
		text-align: center;
	}

	.stat-card.highlight {
		border-color: var(--fg);
		background: var(--fg);
		color: var(--bg);
	}

	.stat-label {
		font-size: var(--text-sm);
		margin-bottom: var(--space-2);
		font-weight: 600;
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: 700;
	}

	/* Source Statistics */
	.source-stats-section {
		margin-bottom: var(--space-6);
	}

	.source-stats-section h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-4);
	}

	.source-stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: var(--space-3);
	}

	.source-stat-card {
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-3);
	}

	.source-name {
		font-size: var(--text-sm);
		font-weight: 600;
		margin-bottom: var(--space-2);
	}

	.source-numbers {
		font-size: var(--text-lg);
	}

	.source-numbers .matched {
		font-weight: 700;
	}

	.source-numbers .separator {
		color: var(--muted);
		margin: 0 var(--space-1);
	}

	.source-numbers .total {
		color: var(--muted);
	}

	.source-numbers .label {
		font-size: var(--text-xs);
		color: var(--muted);
		margin-left: var(--space-2);
	}

	.source-error {
		margin-top: var(--space-2);
		font-size: var(--text-xs);
		color: #ff0000;
	}

	/* Keyword Statistics */
	.keyword-stats-section {
		margin-bottom: var(--space-6);
	}

	.keyword-stats-section h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-4);
	}

	.keyword-badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.keyword-badge {
		display: inline-block;
		padding: var(--space-2) var(--space-3);
		background: var(--fg);
		color: var(--bg);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.keyword-badge .count {
		font-weight: 400;
		opacity: 0.8;
	}

	/* Notices Section */
	.notices-section {
		margin-bottom: var(--space-6);
	}

	.notices-section > h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-4);
	}

	.source-group {
		margin-bottom: var(--space-6);
	}

	.source-header {
		font-size: var(--text-base);
		font-weight: 600;
		margin-bottom: var(--space-3);
		padding-bottom: var(--space-2);
		border-bottom: var(--border-width) solid var(--fg);
	}

	.source-header .count {
		color: var(--muted);
		font-size: var(--text-sm);
		font-weight: 400;
		margin-left: var(--space-2);
	}

	/* Notice Table */
	.notice-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
	}

	.notice-table thead {
		background: var(--fg);
		color: var(--bg);
	}

	.notice-table th {
		padding: var(--space-3);
		text-align: left;
		font-size: var(--text-sm);
		font-weight: 600;
		border-bottom: var(--border-width) solid var(--hair);
	}

	.notice-table td {
		padding: var(--space-3);
		border-bottom: var(--border-width) solid var(--hair);
		font-size: var(--text-sm);
	}

	.notice-table tbody tr:last-child td {
		border-bottom: none;
	}

	.notice-table tbody tr:hover {
		background: rgba(0, 0, 0, 0.02);
	}

	/* Table Columns */
	.col-date {
		width: 120px;
		white-space: nowrap;
	}

	.col-title {
		width: auto;
	}

	.col-keywords {
		width: 200px;
	}

	.col-title a {
		color: var(--fg);
		text-decoration: none;
	}

	.col-title a:hover {
		text-decoration: underline;
	}

	.matched-keywords {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	/* Keyword Highlight in Title */
	:global(.keyword-highlight) {
		color: #dc2626;
		font-weight: 700;
		background-color: rgba(220, 38, 38, 0.05);
		padding: 0 2px;
		border-radius: 2px;
	}

	.keyword-tag {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		background: var(--fg);
		color: var(--bg);
		font-size: var(--text-xs);
		font-weight: 600;
	}
</style>
