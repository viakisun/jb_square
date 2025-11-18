<script lang="ts">
	/**
	 * 컨테이너 로그 뷰어 컴포넌트
	 *
	 * BLACK/WHITE/ZERO-ROUND/INDUSTRIAL 디자인 시스템 적용
	 * monochrome 스타일의 로그 뷰어로 Docker 컨테이너 로그 표시
	 *
	 * @component
	 */

	import { onMount, onDestroy } from 'svelte';
	import type { LogsResponse, LogLine, LogLevel } from '$lib/types/system-monitor';
	import { getContainerLogs } from '$lib/api/system-monitor-api';

	/**
	 * Props
	 */

	/** 컨테이너 이름 */
	export let containerName: string;

	/** 자동 새로고침 간격 (초, 0이면 비활성화) */
	export let autoRefreshInterval: number = 10;

	/**
	 * State
	 */

	let logs: LogsResponse | null = null;
	let loading: boolean = false;
	let error: string | null = null;

	/** 필터 상태 */
	let levelFilter: LogLevel | '' = '';
	let searchTerm: string = '';
	let linesCount: number = 500;

	/** 자동 새로고침 타이머 */
	let refreshTimer: ReturnType<typeof setInterval> | null = null;

	/** 로그 컨테이너 요소 (자동 스크롤용) */
	let logContainer: HTMLDivElement;

	/** 자동 스크롤 활성화 여부 */
	let autoScroll: boolean = true;

	/**
	 * 로그 조회 함수
	 */
	async function fetchLogs() {
		if (!containerName) return;

		loading = true;
		error = null;

		try {
			logs = await getContainerLogs(containerName, {
				lines: linesCount,
				levelFilter: levelFilter || undefined,
				searchTerm: searchTerm || undefined
			});

			// 자동 스크롤
			if (autoScroll && logContainer) {
				setTimeout(() => {
					logContainer.scrollTop = logContainer.scrollHeight;
				}, 100);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : '로그 조회 실패';
			console.error('Failed to fetch logs:', err);
		} finally {
			loading = false;
		}
	}

	/**
	 * 필터 적용 핸들러
	 */
	function applyFilters() {
		fetchLogs();
	}

	/**
	 * 로그 다운로드 핸들러
	 */
	function downloadLogs() {
		if (!logs || !logs.lines.length) return;

		const content = logs.lines
			.map((line) => {
				const timestamp = line.timestamp ? new Date(line.timestamp).toISOString() : 'N/A';
				const level = line.level || 'N/A';
				return `[${timestamp}] [${level}] ${line.message}`;
			})
			.join('\n');

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${containerName}-logs-${Date.now()}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	/**
	 * Lifecycle
	 */

	onMount(() => {
		fetchLogs();

		// 자동 새로고침 설정
		if (autoRefreshInterval > 0) {
			refreshTimer = setInterval(() => {
				fetchLogs();
			}, autoRefreshInterval * 1000);
		}
	});

	onDestroy(() => {
		if (refreshTimer) {
			clearInterval(refreshTimer);
		}
	});

	/**
	 * Reactive statements
	 */

	// 컨테이너 이름 변경 시 로그 재조회
	$: if (containerName) {
		fetchLogs();
	}

	/**
	 * Utility functions
	 */

	/** 로그 레벨 표시 텍스트 (monochrome 디자인용) */
	function getLogLevelDisplay(level: string | null): string {
		if (!level) return '';
		return level.toUpperCase();
	}

	/** 로그 레벨 강도 (스타일 분류용) */
	function getLogLevelIntensity(level: string | null): 'high' | 'medium' | 'low' | 'none' {
		if (!level) return 'none';
		const upper = level.toUpperCase();
		if (upper === 'ERROR' || upper === 'CRITICAL') return 'high';
		if (upper === 'WARNING') return 'medium';
		if (upper === 'INFO') return 'low';
		return 'none';
	}
</script>

<div class="log-viewer">
	<!-- 헤더 -->
	<div class="viewer-header">
		<div class="header-left">
			<span class="icon">[LOGS]</span>
			<h3 class="title">컨테이너 로그</h3>
			<span class="container-name">{containerName}</span>
		</div>

		<!-- 액션 버튼 -->
		<div class="actions">
			<button class="action-btn" on:click={fetchLogs} disabled={loading}>
				<span class="btn-icon" class:loading-icon={loading}>↻</span>
				<span class="btn-text">새로고침</span>
			</button>

			<button
				class="action-btn"
				on:click={downloadLogs}
				disabled={!logs || logs.lines.length === 0}
			>
				<span class="btn-icon">↓</span>
				<span class="btn-text">다운로드</span>
			</button>
		</div>
	</div>

	<!-- 필터 -->
	<div class="filters">
		<!-- 로그 레벨 필터 -->
		<div class="filter-group">
			<label class="filter-label" for="level-filter">로그 레벨</label>
			<select
				id="level-filter"
				class="filter-select"
				bind:value={levelFilter}
				on:change={applyFilters}
			>
				<option value="">전체</option>
				<option value="DEBUG">DEBUG</option>
				<option value="INFO">INFO</option>
				<option value="WARNING">WARNING</option>
				<option value="ERROR">ERROR</option>
				<option value="CRITICAL">CRITICAL</option>
			</select>
		</div>

		<!-- 검색어 -->
		<div class="filter-group">
			<label class="filter-label" for="search-term">검색어</label>
			<input
				id="search-term"
				type="text"
				placeholder="검색..."
				class="filter-input"
				bind:value={searchTerm}
				on:keydown={(e) => e.key === 'Enter' && applyFilters()}
			/>
		</div>

		<!-- 라인 수 -->
		<div class="filter-group">
			<label class="filter-label" for="lines-count">라인 수</label>
			<select id="lines-count" class="filter-select" bind:value={linesCount} on:change={applyFilters}>
				<option value={100}>100</option>
				<option value={500}>500</option>
				<option value={1000}>1000</option>
				<option value={5000}>5000</option>
			</select>
		</div>
	</div>

	<!-- 자동 스크롤 토글 -->
	<div class="controls">
		<label class="checkbox-label">
			<input type="checkbox" class="checkbox-input" bind:checked={autoScroll} />
			<span class="checkbox-text">자동 스크롤</span>
		</label>
	</div>

	<!-- 로그 내용 -->
	{#if loading && !logs}
		<div class="loading-state">
			<div class="spinner"></div>
			<p class="loading-text">로그를 불러오는 중...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<div class="error-icon">■</div>
			<p class="error-message">{error}</p>
		</div>
	{:else if logs && logs.lines.length > 0}
		<!-- 로그 통계 -->
		<div class="log-stats">
			<span class="stat-text">총 {logs.total_lines}줄 (표시: {logs.filtered_lines}줄)</span>
			{#if logs.has_more}
				<span class="more-badge">더 많은 로그가 있습니다</span>
			{/if}
		</div>

		<!-- 로그 뷰어 -->
		<div bind:this={logContainer} class="log-container">
			{#each logs.lines as line, i}
				<div class="log-line">
					<!-- 라인 번호 -->
					<span class="line-number">{i + 1}</span>

					<!-- 타임스탬프 -->
					{#if line.timestamp}
						<span class="timestamp">
							{new Date(line.timestamp).toLocaleTimeString('ko-KR', {
								hour12: false,
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit'
							})}
						</span>
					{/if}

					<!-- 로그 레벨 -->
					{#if line.level}
						<span class="level-badge" class:level-high={getLogLevelIntensity(line.level) === 'high'} class:level-medium={getLogLevelIntensity(line.level) === 'medium'} class:level-low={getLogLevelIntensity(line.level) === 'low'}>
							{getLogLevelDisplay(line.level)}
						</span>
					{/if}

					<!-- 메시지 -->
					<span class="message">{line.message}</span>
				</div>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<p class="empty-message">로그가 없습니다</p>
			<p class="empty-description">조회된 로그가 없거나 필터 조건에 맞는 로그가 없습니다.</p>
		</div>
	{/if}
</div>

<style>
	/* ========================================
	   LOG VIEWER
	   ======================================== */

	.log-viewer {
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* ========================================
	   HEADER
	   ======================================== */

	.viewer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.icon {
		font-size: var(--text-xs);
		font-weight: var(--font-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		line-height: 1;
		padding: var(--space-1) var(--space-2);
		border: var(--border-width) solid var(--hair);
		background-color: var(--surface-1);
	}

	.title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
		line-height: 1;
	}

	.container-name {
		font-size: var(--text-sm);
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
		color: var(--fg);
		background-color: var(--surface-1);
		padding: var(--space-1) var(--space-2);
		border: var(--border-width) solid var(--hair);
	}

	/* ========================================
	   ACTIONS
	   ======================================== */

	.actions {
		display: flex;
		gap: var(--space-2);
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		background-color: var(--bg);
		color: var(--fg);
		border: var(--border-width) solid var(--hair);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.action-btn:hover:not(:disabled) {
		background-color: var(--ghost);
		border-color: var(--fg);
	}

	.action-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-icon {
		font-size: var(--text-base);
		line-height: 1;
	}

	.loading-icon {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.btn-text {
		line-height: 1;
	}

	/* ========================================
	   FILTERS
	   ======================================== */

	.filters {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.filter-label {
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--muted);
	}

	.filter-select,
	.filter-input {
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		color: var(--fg);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		font-family: 'Pretendard Variable', -apple-system, sans-serif;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.filter-select:hover,
	.filter-input:hover {
		border-color: var(--fg);
	}

	.filter-select:focus,
	.filter-input:focus {
		outline: none;
		border-color: var(--fg);
		background-color: var(--ghost);
	}

	/* ========================================
	   CONTROLS
	   ======================================== */

	.controls {
		display: flex;
		align-items: center;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
	}

	.checkbox-input {
		width: 16px;
		height: 16px;
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.checkbox-input:checked {
		background-color: var(--fg);
	}

	.checkbox-text {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--fg);
	}

	/* ========================================
	   LOADING STATE
	   ======================================== */

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-12) var(--space-4);
		gap: var(--space-3);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: var(--border-width) solid var(--hair);
		border-top-color: var(--fg);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		font-size: var(--text-sm);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	/* ========================================
	   ERROR STATE
	   ======================================== */

	.error-state {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--fg);
	}

	.error-icon {
		font-size: var(--text-2xl);
		color: var(--fg);
		line-height: 1;
	}

	.error-message {
		font-size: var(--text-sm);
		color: var(--fg);
		font-weight: var(--font-medium);
	}

	/* ========================================
	   EMPTY STATE
	   ======================================== */

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-12) var(--space-4);
		gap: var(--space-2);
	}

	.empty-message {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.empty-description {
		font-size: var(--text-sm);
		color: var(--muted);
	}

	/* ========================================
	   LOG STATS
	   ======================================== */

	.log-stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.stat-text {
		font-size: var(--text-sm);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.more-badge {
		display: inline-flex;
		padding: var(--space-0-5) var(--space-2);
		font-size: var(--text-2xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--fg);
		color: var(--fg);
	}

	/* ========================================
	   LOG CONTAINER
	   ======================================== */

	.log-container {
		max-height: 600px;
		overflow-y: auto;
		overflow-x: hidden;
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-4);
	}

	/* 스크롤바 스타일 (monochrome) */
	.log-container::-webkit-scrollbar {
		width: 8px;
	}

	.log-container::-webkit-scrollbar-track {
		background: var(--surface-2);
	}

	.log-container::-webkit-scrollbar-thumb {
		background: var(--muted);
		border: var(--border-width) solid var(--hair);
	}

	.log-container::-webkit-scrollbar-thumb:hover {
		background: var(--fg);
	}

	/* ========================================
	   LOG LINE
	   ======================================== */

	.log-line {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-1-5) var(--space-2);
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
		font-size: var(--text-xs);
		line-height: 1.6;
		min-height: 32px;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.log-line:hover {
		background-color: var(--ghost);
	}

	/* 라인 번호 */
	.line-number {
		user-select: none;
		width: 48px;
		text-align: right;
		flex-shrink: 0;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	/* 타임스탬프 */
	.timestamp {
		flex-shrink: 0;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
		min-width: 70px;
	}

	/* 로그 레벨 배지 */
	.level-badge {
		display: inline-flex;
		padding: var(--space-0-5) var(--space-1-5);
		font-size: var(--text-2xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		background-color: var(--surface-2);
		border: var(--border-width) solid var(--hair);
		flex-shrink: 0;
		min-width: 64px;
		justify-content: center;
	}

	.level-badge.level-high {
		background-color: rgba(0, 0, 0, 0.9);
		border-color: var(--fg);
		color: var(--bg);
	}

	.level-badge.level-medium {
		background-color: rgba(0, 0, 0, 0.6);
		color: var(--bg);
	}

	.level-badge.level-low {
		background-color: var(--surface-2);
		color: var(--fg);
	}

	/* 메시지 */
	.message {
		flex: 1;
		color: var(--fg);
		word-break: break-all;
	}
</style>
