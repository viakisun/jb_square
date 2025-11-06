<script lang="ts">
	/**
	 * JB SQUARE Spinner Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Loading indicator with rotating square
	 *
	 * Usage:
	 * <Spinner />
	 * <Spinner size="lg" />
	 * <Spinner label="Loading data..." />
	 */

	interface SpinnerProps {
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		label?: string;
		class?: string;
	}

	let { size = 'md', label, class: className = '' }: SpinnerProps = $props();

	const sizeClasses = {
		xs: 'spinner-xs',
		sm: 'spinner-sm',
		md: 'spinner-md',
		lg: 'spinner-lg',
		xl: 'spinner-xl'
	};

	const classes = ['spinner', sizeClasses[size], className].filter(Boolean).join(' ');
</script>

<div class="spinner-wrapper" role="status" aria-live="polite">
	<div class={classes} aria-hidden="true">■</div>
	{#if label}
		<span class="spinner-label">{label}</span>
	{:else}
		<span class="sr-only">Loading...</span>
	{/if}
</div>

<style>
	/* ========================================
     SPINNER WRAPPER
     ======================================== */

	.spinner-wrapper {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
	}

	/* ========================================
     SPINNER
     ======================================== */

	.spinner {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--fg);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* ========================================
     SIZES
     ======================================== */

	.spinner-xs {
		font-size: 12px;
		width: 12px;
		height: 12px;
	}

	.spinner-sm {
		font-size: 16px;
		width: 16px;
		height: 16px;
	}

	.spinner-md {
		font-size: 20px;
		width: 20px;
		height: 20px;
	}

	.spinner-lg {
		font-size: 28px;
		width: 28px;
		height: 28px;
	}

	.spinner-xl {
		font-size: 40px;
		width: 40px;
		height: 40px;
	}

	/* ========================================
     LABEL
     ======================================== */

	.spinner-label {
		font-size: var(--text-sm);
		color: var(--muted);
		text-align: center;
	}

	/* ========================================
     SCREEN READER ONLY
     ======================================== */

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* ========================================
     REDUCED MOTION
     ======================================== */

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: pulse 2s ease-in-out infinite;
		}

		@keyframes pulse {
			0%,
			100% {
				opacity: 1;
			}
			50% {
				opacity: 0.5;
			}
		}
	}
</style>
