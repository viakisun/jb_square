<script lang="ts">
	/**
	 * JB SQUARE CrawlingStatus Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * 크롤링 진행 상태와 로그를 통합하여 표시
	 *
	 * Usage:
	 * <CrawlingStatus sourceId="jbtp" {status} {logs} />
	 */

	import ProgressBar from './ProgressBar.svelte';
	import LogStream from './LogStream.svelte';
	import { Badge } from '$lib/components/feedback';

	interface LogEntry {
		timestamp: string;
		message: string;
		type?: 'info' | 'success' | 'error' | 'warning';
	}

	interface BoardProgress {
		board_name: string;
		current: number;
		total: number;
		percentage: number;
	}

	interface Statistics {
		total: number;
		already_published: number;
		in_queue: number;
		new_items: number;
		matched: number;
		unmatched: number;
	}

	interface CrawlingStatusProps {
		sourceId: string;
		sourceName: string;
		status: 'idle' | 'running' | 'completed' | 'error' | 'stopped';
		progress?: number;
		total?: number;
		success?: number;
		failed?: number;
		logs?: LogEntry[];
		errorMessage?: string;
		boardProgress?: BoardProgress;
		statistics?: Statistics;
		class?: string;
	}

	let {
		sourceId,
		sourceName,
		status = 'idle',
		progress = 0,
		total = 0,
		success = 0,
		failed = 0,
		logs = [],
		errorMessage = '',
		boardProgress,
		statistics,
		class: className = ''
	}: CrawlingStatusProps = $props();

	// 현재 진행 단계 추적
	let currentStep = $derived.by(() => {
		if (status === 'idle') return '대기중';
		if (status === 'error') return '오류 발생';
		if (status === 'stopped') return '중단됨';
		if (status === 'completed') return '완료';

		// running 상태일 때 로그에서 현재 단계 파악
		if (logs.length === 0) return '크롤링 시작 중...';

		const lastLog = logs[logs.length - 1];
		const msg = lastLog.message;

		// 상세 정보 수집 중
		if (msg.includes('✓')) return `상세 정보 수집 중 (${progress}/${total})`;
		if (msg.includes('공고 수집')) return `목록 크롤링 중 (${progress}/${total})`;
		if (msg.includes('저장')) return '데이터 저장 중...';
		if (msg.includes('시작')) return '크롤링 초기화 중...';

		return `진행 중 (${progress}/${total})`;
	});

	// 진행률 계산
	let percentage = $derived(total > 0 ? Math.round((progress / total) * 100) : 0);

	function getStatusBadgeVariant(
		status: string
	): 'success' | 'error' | 'warning' | 'info' | 'default' {
		switch (status) {
			case 'completed':
				return 'success';
			case 'error':
				return 'error';
			case 'running':
				return 'info';
			case 'stopped':
				return 'warning';
			default:
				return 'default';
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'idle':
				return '대기';
			case 'running':
				return '진행중';
			case 'completed':
				return '완료';
			case 'error':
				return '오류';
			case 'stopped':
				return '중단됨';
			default:
				return status;
		}
	}
</script>

<div class="crawling-status {className}">
	<div class="status-header">
		<div class="status-info">
			<h3 class="status-title">{sourceName}</h3>
			<Badge variant={getStatusBadgeVariant(status)}>{getStatusText(status)}</Badge>
		</div>
		{#if status === 'running'}
			<div class="spinner"></div>
		{/if}
	</div>

	<!-- 현재 진행 단계 표시 -->
	{#if status === 'running' || status === 'completed'}
		<div class="current-step">
			<div class="step-indicator">
				{#if status === 'running'}
					<span class="step-pulse"></span>
				{/if}
				<span class="step-text">{currentStep}</span>
			</div>
			{#if total > 0}
				<div class="step-percentage">{percentage}%</div>
			{/if}
		</div>
	{/if}

	<!-- 게시판별 프로그레스 바 (실시간) -->
	{#if boardProgress && status === 'running'}
		<div class="board-progress-section">
			<div class="board-progress-header">
				<span class="board-name">[{boardProgress.board_name}]</span>
				<span class="board-stats"
					>{boardProgress.current}/{boardProgress.total} ({boardProgress.percentage}%)</span
				>
			</div>
			<div class="board-progress-bar">
				<div class="board-progress-fill" style="width: {boardProgress.percentage}%"></div>
			</div>
		</div>
	{/if}

	{#if status === 'running' || status === 'completed'}
		<div class="status-progress">
			<ProgressBar {progress} {total} />
		</div>

		{#if statistics && statistics.total > 0}
			<!-- New statistics format -->
			<div class="status-stats">
				<div class="stat-item">
					<span class="stat-label">총 개수</span>
					<span class="stat-value">{statistics.total}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">이미 게시됨</span>
					<span class="stat-value stat-muted">{statistics.already_published}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">대기 중</span>
					<span class="stat-value stat-muted">{statistics.in_queue}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">신규</span>
					<span class="stat-value stat-success">{statistics.new_items}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">키워드 매칭</span>
					<span class="stat-value stat-success">{statistics.matched}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">매칭 없음</span>
					<span class="stat-value stat-muted">{statistics.unmatched}</span>
				</div>
			</div>
		{:else}
			<!-- Legacy statistics format (for backward compatibility) -->
			<div class="status-stats">
				<div class="stat-item">
					<span class="stat-label">성공</span>
					<span class="stat-value stat-success">{success}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">실패</span>
					<span class="stat-value stat-failed">{failed}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">합계</span>
					<span class="stat-value">{success + failed}</span>
				</div>
			</div>
		{/if}
	{/if}

	{#if errorMessage}
		<div class="status-error">
			<span class="error-icon">✗</span>
			<span class="error-message">{errorMessage}</span>
		</div>
	{/if}

	{#if logs.length > 0}
		<div class="status-logs">
			<LogStream {logs} maxHeight="300px" />
		</div>
	{/if}
</div>

<style>
	/* ========================================
     CRAWLING STATUS
     ======================================== */

	.crawling-status {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-6);
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
	}

	/* ========================================
     STATUS HEADER
     ======================================== */

	.status-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.status-info {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.status-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		letter-spacing: var(--tracking-tight);
		margin: 0;
	}

	/* ========================================
     SPINNER (LOADING ANIMATION)
     ======================================== */

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--hair);
		border-top-color: var(--fg);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ========================================
     CURRENT STEP INDICATOR
     ======================================== */

	.current-step {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		margin-top: var(--space-2);
	}

	.step-indicator {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.step-pulse {
		width: 8px;
		height: 8px;
		background-color: var(--fg);
		border-radius: 50%;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.2);
		}
	}

	.step-text {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		letter-spacing: var(--tracking-tight);
	}

	.step-percentage {
		font-size: var(--text-xl);
		font-weight: var(--font-bold);
		color: var(--fg);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-tight);
		min-width: 60px;
		text-align: right;
	}

	/* ========================================
     STATUS PROGRESS
     ======================================== */

	.status-progress {
		padding: var(--space-2) 0;
	}

	/* ========================================
     STATUS STATS
     ======================================== */

	.status-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	/* When there are 6 stats, use 3 columns on large screens, 2 on medium */
	.status-stats:has(.stat-item:nth-child(6)) {
		grid-template-columns: repeat(3, 1fr);
	}

	@media (max-width: 768px) {
		.status-stats:has(.stat-item:nth-child(6)) {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.stat-label {
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		color: var(--fg);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-tight);
	}

	.stat-success {
		color: var(--fg);
	}

	.stat-failed {
		color: var(--muted);
	}

	.stat-muted {
		color: var(--muted);
	}

	/* ========================================
     STATUS ERROR
     ======================================== */

	.status-error {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--fg);
	}

	.error-icon {
		flex-shrink: 0;
		font-size: var(--text-lg);
		color: var(--fg);
	}

	.error-message {
		flex: 1;
		font-size: var(--text-sm);
		color: var(--fg);
	}

	/* ========================================
     STATUS LOGS
     ======================================== */

	.status-logs {
		/* Logs component has its own styling */
	}

	/* ========================================
     BOARD PROGRESS
     ======================================== */

	.board-progress-section {
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		margin-bottom: var(--space-2);
	}

	.board-progress-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-3);
	}

	.board-name {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--fg);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.board-stats {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	.board-progress-bar {
		width: 100%;
		height: 8px;
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		position: relative;
		overflow: hidden;
	}

	.board-progress-fill {
		height: 100%;
		background-color: var(--fg);
		transition: width 0.3s var(--ease-out);
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 640px) {
		.status-stats {
			grid-template-columns: 1fr;
		}

		.stat-value {
			font-size: var(--text-xl);
		}
	}
</style>
