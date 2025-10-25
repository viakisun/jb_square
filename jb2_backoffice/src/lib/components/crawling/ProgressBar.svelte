<script lang="ts">
	/**
	 * JB SQUARE ProgressBar Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * 크롤링 진행률을 표시하는 Progress Bar
	 *
	 * Usage:
	 * <ProgressBar progress={75} total={100} />
	 */

	interface ProgressBarProps {
		progress: number;
		total: number;
		showPercentage?: boolean;
		showNumbers?: boolean;
		height?: string;
		class?: string;
	}

	let {
		progress = 0,
		total = 100,
		showPercentage = true,
		showNumbers = true,
		height = '24px',
		class: className = ''
	}: ProgressBarProps = $props();

	const percentage = $derived(total > 0 ? Math.round((progress / total) * 100) : 0);
	const barWidth = $derived(`${percentage}%`);
</script>

<div class="progress-bar-wrapper {className}">
	{#if showNumbers}
		<div class="progress-info">
			<span class="progress-numbers">{progress} / {total}</span>
			{#if showPercentage}
				<span class="progress-percentage">{percentage}%</span>
			{/if}
		</div>
	{/if}

	<div class="progress-bar" style:height>
		<div class="progress-fill" style:width={barWidth} aria-label="Progress: {percentage}%"></div>
	</div>
</div>

<style>
	/* ========================================
     PROGRESS BAR WRAPPER
     ======================================== */

	.progress-bar-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	/* ========================================
     PROGRESS INFO
     ======================================== */

	.progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
	}

	.progress-numbers {
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-tight);
	}

	.progress-percentage {
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-tight);
		color: var(--muted);
	}

	/* ========================================
     PROGRESS BAR
     ======================================== */

	.progress-bar {
		position: relative;
		width: 100%;
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		overflow: hidden;
	}

	/* ========================================
     PROGRESS FILL
     ======================================== */

	.progress-fill {
		height: 100%;
		background-color: var(--fg);
		transition: width var(--duration-base) var(--ease-out-expo);
		position: relative;
	}

	.progress-fill::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 100%
		);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	/* ========================================
     REDUCED MOTION
     ======================================== */

	@media (prefers-reduced-motion: reduce) {
		.progress-fill {
			transition: none;
		}

		.progress-fill::after {
			animation: none;
		}
	}
</style>
