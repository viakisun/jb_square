<script lang="ts">
	/**
	 * JB SQUARE CrawlingReport Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * 크롤링 결과 상세 리포트
	 */

	import { Badge } from '$lib/components/feedback';
	import { API_BASE_URL } from '$lib/config/api';

	interface CrawlingReportProps {
		sourceId: string;
		sourceName: string;
		class?: string;
	}

	interface CrawlResult {
		id: number;
		title: string;
		link: string;
		source_date_string: string;
		source_board_name: string;
		keywords_matched: string[];
		crawler_extracted_at: string;
	}

	interface ReportData {
		crawler_source_id: string;
		total_collected: number;
		keyword_matched: number;
		board_distribution: Record<string, number>;
		keyword_matches: Record<string, number>;
		latest_crawl: string | null;
		recent_results: CrawlResult[];
	}

	let { sourceId, sourceName, class: className = '' }: CrawlingReportProps = $props();

	let reportData = $state<ReportData | null>(null);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		loadReport();
	});

	async function loadReport() {
		isLoading = true;
		error = null;

		try {
			const response = await fetch(`${API_BASE_URL}/crawling/report/${sourceId}`);

			if (!response.ok) {
				throw new Error('Failed to load report');
			}

			reportData = await response.json();
		} catch (err) {
			error = '리포트를 불러오는데 실패했습니다.';
			console.error('Failed to load crawling report:', err);
		} finally {
			isLoading = false;
		}
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toLocaleString('ko-KR', {
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return dateString;
		}
	}
</script>

<div class="crawling-report {className}">
	<div class="report-header">
		<h3 class="report-title">{sourceName} 크롤링 리포트</h3>
	</div>

	{#if isLoading}
		<div class="report-loading">
			<span class="loading-spinner">●</span>
			<span>리포트를 불러오는 중...</span>
		</div>
	{:else if error}
		<div class="report-error">
			<span class="error-icon">✗</span>
			<span>{error}</span>
		</div>
	{:else if reportData}
		<!-- Statistics -->
		<div class="report-stats">
			<div class="stat-card">
				<span class="stat-label">총 수집</span>
				<span class="stat-value">{reportData.total_collected}</span>
			</div>

			<div class="stat-card">
				<span class="stat-label">키워드 매칭</span>
				<span class="stat-value stat-highlight">{reportData.keyword_matched}</span>
			</div>

			<div class="stat-card">
				<span class="stat-label">최근 실행</span>
				<span class="stat-value stat-small">{formatDate(reportData.latest_crawl)}</span>
			</div>
		</div>

		<!-- Board Distribution -->
		{#if Object.keys(reportData.board_distribution).length > 0}
			<div class="report-section">
				<h4 class="section-title">게시판별 분포</h4>
				<div class="board-distribution">
					{#each Object.entries(reportData.board_distribution) as [board, count]}
						<div class="distribution-item">
							<span class="distribution-label">{board}</span>
							<span class="distribution-value">{count}개</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Keyword Matches -->
		{#if Object.keys(reportData.keyword_matches).length > 0}
			<div class="report-section">
				<h4 class="section-title">키워드별 매칭 수</h4>
				<div class="keyword-matches">
					{#each Object.entries(reportData.keyword_matches).sort((a, b) => b[1] - a[1]) as [keyword, count]}
						<div class="keyword-match-item">
							<Badge variant="default">{keyword}</Badge>
							<span class="match-count">{count}건</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Recent Results -->
		{#if reportData.recent_results.length > 0}
			<div class="report-section">
				<h4 class="section-title">최근 수집 결과 (최대 20개)</h4>
				<div class="results-table">
					<table>
						<thead>
							<tr>
								<th>제목</th>
								<th>게시판</th>
								<th>날짜</th>
								<th>키워드</th>
							</tr>
						</thead>
						<tbody>
							{#each reportData.recent_results as result (result.id)}
								<tr>
									<td class="result-title">
										{#if result.link}
											<a href={result.link} target="_blank" rel="noopener noreferrer">
												{result.title}
											</a>
										{:else}
											{result.title}
										{/if}
									</td>
									<td class="result-board">{result.source_board_name || '-'}</td>
									<td class="result-date">{result.source_date_string || '-'}</td>
									<td class="result-keywords">
										{#if result.keywords_matched && result.keywords_matched.length > 0}
											<div class="keyword-badges">
												{#each result.keywords_matched as keyword}
													<Badge variant="info">{keyword}</Badge>
												{/each}
											</div>
										{:else}
											<span class="no-keywords">-</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else}
			<div class="empty-results">
				<span class="empty-icon">📊</span>
				<p>수집된 결과가 없습니다.</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* ========================================
     CRAWLING REPORT
     ======================================== */

	.crawling-report {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding: var(--space-6);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
	}

	/* ========================================
     REPORT HEADER
     ======================================== */

	.report-header {
		padding-bottom: var(--space-4);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.report-title {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--fg);
		letter-spacing: var(--tracking-tight);
		margin: 0;
	}

	/* ========================================
     LOADING & ERROR
     ======================================== */

	.report-loading,
	.report-error {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-8);
		color: var(--muted);
	}

	.loading-spinner {
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	.report-error {
		color: var(--fg);
	}

	.error-icon {
		font-size: var(--text-xl);
	}

	/* ========================================
     STATISTICS
     ======================================== */

	.report-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-5);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	.stat-label {
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.stat-value {
		font-size: var(--text-3xl);
		font-weight: var(--font-bold);
		color: var(--fg);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-tight);
	}

	.stat-value.stat-highlight {
		color: var(--fg);
	}

	.stat-value.stat-small {
		font-size: var(--text-base);
		font-weight: var(--font-medium);
	}

	/* ========================================
     REPORT SECTIONS
     ======================================== */

	.report-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.section-title {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		margin: 0;
	}

	/* ========================================
     BOARD DISTRIBUTION
     ======================================== */

	.board-distribution {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	.distribution-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-2) 0;
	}

	.distribution-label {
		font-size: var(--text-sm);
		color: var(--fg);
	}

	.distribution-value {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	/* ========================================
     KEYWORD MATCHES
     ======================================== */

	.keyword-matches {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	.keyword-match-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.match-count {
		font-size: var(--text-sm);
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	/* ========================================
     RESULTS TABLE
     ======================================== */

	.results-table {
		overflow-x: auto;
		border: var(--border-width) solid var(--hair);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	thead {
		background-color: var(--surface-1);
	}

	th {
		padding: var(--space-3) var(--space-4);
		text-align: left;
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		font-size: var(--text-xs);
		border-bottom: var(--border-width) solid var(--hair);
	}

	td {
		padding: var(--space-3) var(--space-4);
		border-bottom: var(--border-width) solid var(--hair);
		vertical-align: top;
	}

	tbody tr:hover {
		background-color: var(--surface-1);
	}

	.result-title a {
		color: var(--fg);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.result-title a:hover {
		text-decoration: underline;
	}

	.result-board,
	.result-date {
		color: var(--muted);
		white-space: nowrap;
	}

	.keyword-badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.no-keywords {
		color: var(--muted);
	}

	/* ========================================
     EMPTY STATE
     ======================================== */

	.empty-results {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-8);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	.empty-icon {
		font-size: var(--text-3xl);
	}

	.empty-results p {
		font-size: var(--text-base);
		color: var(--muted);
		margin: 0;
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 768px) {
		.report-stats {
			grid-template-columns: 1fr;
		}

		.results-table {
			font-size: var(--text-xs);
		}
	}
</style>
