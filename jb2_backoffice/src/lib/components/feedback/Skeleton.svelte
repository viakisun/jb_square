<script lang="ts">
	/**
	 * JB SQUARE Skeleton Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Loading placeholder with shimmer effect
	 *
	 * Usage:
	 * <Skeleton width="200px" height="20px" />
	 * <Skeleton variant="text" />
	 * <Skeleton variant="circle" />
	 * <Skeleton variant="rect" width="100%" height="100px" />
	 */

	interface SkeletonProps {
		variant?: 'text' | 'rect' | 'circle';
		width?: string;
		height?: string;
		class?: string;
	}

	let {
		variant = 'rect',
		width = '100%',
		height = variant === 'text' ? '1em' : '100px',
		class: className = ''
	}: SkeletonProps = $props();

	const variantClasses = {
		text: 'skeleton-text',
		rect: 'skeleton-rect',
		circle: 'skeleton-circle'
	};

	const classes = ['skeleton', variantClasses[variant], className].filter(Boolean).join(' ');

	const style = `width: ${width}; height: ${height};`;
</script>

<div class={classes} {style} aria-busy="true" aria-live="polite">
	<span class="sr-only">Loading...</span>
</div>

<style>
	/* ========================================
     SKELETON BASE
     ======================================== */

	.skeleton {
		position: relative;
		background-color: var(--surface-1);
		overflow: hidden;
		display: block;
	}

	.skeleton::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.6) 50%,
			transparent 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	/* ========================================
     VARIANTS
     ======================================== */

	.skeleton-text {
		height: 1em;
		margin-bottom: var(--space-2);
	}

	.skeleton-rect {
		/* Default rectangular shape */
	}

	.skeleton-circle {
		border-radius: 50% !important;
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
		.skeleton::after {
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
