<script lang="ts">
	/**
	 * JB SQUARE CrawlingCard Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * 크롤링 소스 정보 카드 (실행/중단 버튼 포함)
	 *
	 * Usage:
	 * <CrawlingCard
	 *   sourceId="jbtp"
	 *   sourceName="JBTP 전북테크노파크"
	 *   status="idle"
	 *   onStart={handleStart}
	 *   onStop={handleStop}
	 * />
	 */

	import { Badge } from '$lib/components/feedback';
	import { Button } from '$lib/components/ui/buttons';

	interface CrawlingCardProps {
		sourceId: string;
		sourceName: string;
		description?: string;
		status: 'idle' | 'running' | 'completed' | 'error' | 'stopped';
		lastRun?: string;
		progress?: number;
		total?: number;
		success?: number;
		failed?: number;
		onStart?: () => void;
		onStop?: () => void;
		class?: string;
	}

	let {
		sourceId,
		sourceName,
		description = '',
		status = 'idle',
		lastRun,
		progress = 0,
		total = 0,
		success = 0,
		failed = 0,
		onStart,
		onStop,
		class: className = ''
	}: CrawlingCardProps = $props();

	const isRunning = $derived(status === 'running');
	const canStart = $derived(status === 'idle' || status === 'completed' || status === 'error' || status === 'stopped');

	function getStatusBadgeVariant(status: string): 'success' | 'error' | 'warning' | 'info' | 'default' {
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

	function formatDate(dateString?: string): string {
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

	const percentage = $derived(total > 0 ? Math.round((progress / total) * 100) : 0);
</script>

<div class="crawling-card {className}">
	<div class="card-header">
		<div class="card-title-group">
			<h3 class="card-title">{sourceName}</h3>
			<Badge variant={getStatusBadgeVariant(status)}>{getStatusText(status)}</Badge>
		</div>
		{#if description}
			<p class="card-description">{description}</p>
		{/if}
	</div>

	<div class="card-body">
		{#if isRunning && total > 0}
			<!-- Progress indicator -->
			<div class="progress-indicator">
				<div class="progress-mini-bar">
					<div class="progress-mini-fill" style:width="{percentage}%"></div>
				</div>
				<span class="progress-text">{progress} / {total} ({percentage}%)</span>
			</div>
		{/if}

		<div class="card-info">
			<div class="info-item">
				<span class="info-label">마지막 실행</span>
				<span class="info-value">{formatDate(lastRun)}</span>
			</div>

			{#if success > 0 || failed > 0}
				<div class="info-item">
					<span class="info-label">성공 / 실패</span>
					<span class="info-value">{success} / {failed}</span>
				</div>
			{/if}
		</div>
	</div>

	<div class="card-footer">
		{#if isRunning}
			<Button variant="outline" iconLeft="■" onclick={onStop} fullWidth>중단</Button>
		{:else if canStart}
			<Button variant="primary" iconLeft="▶" onclick={onStart} fullWidth>실행</Button>
		{/if}
	</div>
</div>

<style>
	/* ========================================
     CRAWLING CARD
     ======================================== */

	.crawling-card {
		display: flex;
		flex-direction: column;
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.crawling-card:hover {
		border-color: var(--muted);
	}

	/* ========================================
     CARD HEADER
     ======================================== */

	.card-header {
		padding: var(--space-5);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.card-title-group {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-2);
	}

	.card-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		letter-spacing: var(--tracking-tight);
		margin: 0;
	}

	.card-description {
		font-size: var(--text-sm);
		color: var(--muted);
		margin: 0;
		line-height: var(--leading-relaxed);
	}

	/* ========================================
     CARD BODY
     ======================================== */

	.card-body {
		padding: var(--space-5);
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* ========================================
     PROGRESS INDICATOR
     ======================================== */

	.progress-indicator {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.progress-mini-bar {
		height: 8px;
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		overflow: hidden;
	}

	.progress-mini-fill {
		height: 100%;
		background-color: var(--fg);
		transition: width var(--duration-base) var(--ease-out-expo);
	}

	.progress-text {
		font-size: var(--text-xs);
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	/* ========================================
     CARD INFO
     ======================================== */

	.card-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-label {
		font-size: var(--text-sm);
		color: var(--muted);
	}

	.info-value {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		font-variant-numeric: tabular-nums;
	}

	/* ========================================
     CARD FOOTER
     ======================================== */

	.card-footer {
		padding: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
	}

	/* ========================================
     REDUCED MOTION
     ======================================== */

	@media (prefers-reduced-motion: reduce) {
		.crawling-card {
			transition: none;
		}

		.progress-mini-fill {
			transition: none;
		}
	}
</style>
