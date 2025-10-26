<script lang="ts">
	/**
	 * JB SQUARE Badge Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Status indicators and labels
	 *
	 * Usage:
	 * <Badge>Default</Badge>
	 * <Badge variant="success">Success</Badge>
	 * <Badge variant="error">Error</Badge>
	 * <Badge dot>With dot</Badge>
	 */

	interface BadgeProps {
		variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'outline';
		size?: 'sm' | 'md' | 'lg';
		dot?: boolean;
		class?: string;
		children?: any;
	}

	let {
		variant = 'default',
		size = 'md',
		dot = false,
		class: className = '',
		children
	}: BadgeProps = $props();

	const variantClasses = {
		default: 'badge-default',
		success: 'badge-success',
		error: 'badge-error',
		warning: 'badge-warning',
		info: 'badge-info',
		outline: 'badge-outline'
	};

	const sizeClasses = {
		sm: 'badge-sm',
		md: 'badge-md',
		lg: 'badge-lg'
	};

	const classes = [
		'badge',
		variantClasses[variant],
		sizeClasses[size],
		dot && 'badge-dot',
		className
	]
		.filter(Boolean)
		.join(' ');
</script>

<span class={classes}>
	{#if dot}
		<span class="dot" aria-hidden="true">■</span>
	{/if}
	{@render children?.()}
</span>

<style>
	/* ========================================
     BADGE BASE
     ======================================== */

	.badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		font-weight: var(--font-medium);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		white-space: nowrap;
		border: var(--border-width) solid transparent;
		line-height: 1;
	}

	/* ========================================
     SIZES
     ======================================== */

	.badge-sm {
		padding: var(--space-0-5) var(--space-2);
		font-size: var(--text-2xs);
		gap: var(--space-1);
	}

	.badge-md {
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		gap: var(--space-1-5);
	}

	.badge-lg {
		padding: var(--space-1-5) var(--space-4);
		font-size: var(--text-sm);
		gap: var(--space-2);
	}

	/* ========================================
     VARIANTS
     ======================================== */

	.badge-default {
		background-color: var(--surface-1);
		color: var(--fg);
		border-color: var(--hair);
	}

	.badge-success {
		background-color: var(--color-success-bg);
		color: var(--color-success);
		border-color: var(--fg);
	}

	.badge-error {
		background-color: var(--color-error-bg);
		color: var(--color-error);
		border-color: var(--fg);
	}

	.badge-warning {
		background-color: var(--color-warning-bg);
		color: var(--color-warning);
		border-color: var(--fg);
	}

	.badge-info {
		background-color: var(--color-info-bg);
		color: var(--color-info);
		border-color: var(--hair);
	}

	.badge-outline {
		background-color: transparent;
		color: var(--fg);
		border-color: var(--fg);
	}

	/* ========================================
     DOT INDICATOR
     ======================================== */

	.dot {
		font-size: 6px;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.badge-success .dot {
		color: var(--fg);
	}

	.badge-error .dot {
		color: var(--fg);
	}

	.badge-warning .dot {
		color: var(--fg);
	}

	.badge-info .dot {
		color: var(--muted);
	}

	.badge-default .dot {
		color: var(--muted);
	}
</style>
