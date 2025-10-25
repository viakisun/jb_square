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
		class: className = ''
	}: CrawlingStatusProps = $props();

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
	</div>

	{#if status === 'running' || status === 'completed'}
		<div class="status-progress">
			<ProgressBar {progress} {total} />
		</div>

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
