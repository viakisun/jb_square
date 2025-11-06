<script lang="ts">
	/**
	 * JB SQUARE Button Component v2.0
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 * Enhanced with Loading States, Icons, and Micro-interactions
	 *
	 * Variants:
	 * - primary: Black background, white text
	 * - outline: White background, black border
	 * - ghost: Transparent, hover surface-1
	 *
	 * Usage:
	 * <Button variant="primary" onclick={handleClick}>Submit</Button>
	 * <Button variant="outline" loading>Loading...</Button>
	 * <Button size="lg" iconLeft="←">Back</Button>
	 * <Button iconRight="→" iconOnly aria-label="Next" />
	 */

	interface ButtonProps {
		variant?: 'primary' | 'outline' | 'ghost';
		type?: 'button' | 'submit' | 'reset';
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
		disabled?: boolean;
		loading?: boolean;
		fullWidth?: boolean;
		iconLeft?: string;
		iconRight?: string;
		iconOnly?: boolean;
		onclick?: (event: MouseEvent) => void;
		class?: string;
		children?: any;
	}

	let {
		variant = 'primary',
		type = 'button',
		size = 'md',
		disabled = false,
		loading = false,
		fullWidth = false,
		iconLeft,
		iconRight,
		iconOnly = false,
		onclick,
		class: className = '',
		children
	}: ButtonProps = $props();

	const isDisabled = $derived(disabled || loading);

	const baseClasses =
		'btn inline-flex items-center justify-center gap-2 font-medium user-select-none outline-none';

	const variantClasses = {
		primary: 'btn-primary',
		outline: 'btn-outline',
		ghost: 'btn-ghost'
	};

	const sizeClasses = {
		xs: 'btn-xs',
		sm: 'btn-sm',
		md: 'btn-md',
		lg: 'btn-lg',
		xl: 'btn-xl'
	};

	const classes = [
		baseClasses,
		variantClasses[variant],
		sizeClasses[size],
		fullWidth && 'w-full',
		iconOnly && 'btn-icon-only',
		className
	]
		.filter(Boolean)
		.join(' ');
</script>

<button
	{type}
	disabled={isDisabled}
	{onclick}
	class={classes}
	aria-disabled={isDisabled}
	aria-busy={loading}
>
	{#if loading}
		<span class="spinner" aria-hidden="true">■</span>
	{:else if iconLeft}
		<span class="icon" aria-hidden="true">{iconLeft}</span>
	{/if}

	{#if !iconOnly}
		<span class="btn-content">
			{@render children?.()}
		</span>
	{/if}

	{#if !loading && iconRight}
		<span class="icon" aria-hidden="true">{iconRight}</span>
	{/if}
</button>

<style>
	/* ========================================
     BASE BUTTON
     ======================================== */

	.btn {
		position: relative;
		border: var(--border-width) solid transparent;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		letter-spacing: var(--tracking-normal);
		transition: all var(--duration-fast) var(--ease-out-expo);
	}

	.btn:disabled {
		cursor: not-allowed;
		opacity: 0.5;
		pointer-events: none;
	}

	.btn:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: var(--focus-ring-offset);
	}

	/* ========================================
     VARIANT: PRIMARY
     ======================================== */

	.btn-primary {
		background-color: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--muted);
		border-color: var(--muted);
		transform: translateY(-1px);
	}

	.btn-primary:active:not(:disabled) {
		background-color: var(--fg);
		border-color: var(--fg);
		transform: scale(var(--hover-scale)) translateY(var(--hover-translate-y));
	}

	/* ========================================
     VARIANT: OUTLINE
     ======================================== */

	.btn-outline {
		background-color: var(--bg);
		color: var(--fg);
		border-color: var(--fg);
	}

	.btn-outline:hover:not(:disabled) {
		background-color: var(--ghost);
		transform: translateY(-1px);
	}

	.btn-outline:active:not(:disabled) {
		background-color: var(--surface-1);
		transform: scale(var(--hover-scale)) translateY(var(--hover-translate-y));
	}

	/* ========================================
     VARIANT: GHOST
     ======================================== */

	.btn-ghost {
		background-color: transparent;
		color: var(--fg);
		border-color: transparent;
	}

	.btn-ghost:hover:not(:disabled) {
		background-color: var(--surface-1);
		transform: translateY(-1px);
	}

	.btn-ghost:active:not(:disabled) {
		background-color: var(--surface-2);
		transform: scale(var(--hover-scale)) translateY(var(--hover-translate-y));
	}

	/* ========================================
     SIZES
     ======================================== */

	.btn-xs {
		height: var(--button-height-xs);
		padding: 0 var(--space-2);
		font-size: var(--text-xs);
		gap: var(--space-1);
	}

	.btn-sm {
		height: var(--button-height-sm);
		padding: 0 var(--space-3);
		font-size: var(--text-sm);
		gap: var(--space-1-5);
	}

	.btn-md {
		height: var(--button-height-md);
		padding: 0 var(--space-4);
		font-size: var(--text-base);
		gap: var(--space-2);
	}

	.btn-lg {
		height: var(--button-height-lg);
		padding: 0 var(--space-6);
		font-size: var(--text-md);
		gap: var(--space-2);
	}

	.btn-xl {
		height: var(--button-height-xl);
		padding: 0 var(--space-8);
		font-size: var(--text-lg);
		gap: var(--space-3);
	}

	/* Icon-only buttons (square) */
	.btn-icon-only.btn-xs {
		width: var(--button-height-xs);
		padding: 0;
	}

	.btn-icon-only.btn-sm {
		width: var(--button-height-sm);
		padding: 0;
	}

	.btn-icon-only.btn-md {
		width: var(--button-height-md);
		padding: 0;
	}

	.btn-icon-only.btn-lg {
		width: var(--button-height-lg);
		padding: 0;
	}

	.btn-icon-only.btn-xl {
		width: var(--button-height-xl);
		padding: 0;
	}

	/* ========================================
     CONTENT & ICONS
     ======================================== */

	.btn-content {
		display: inline-flex;
		align-items: center;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* ========================================
     LOADING SPINNER
     ======================================== */

	.spinner {
		display: inline-flex;
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
     ACCESSIBILITY
     ======================================== */

	/* Increase touch target on mobile */
	@media (hover: none) and (pointer: coarse) {
		.btn {
			min-height: var(--touch-target-min);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}

		.spinner {
			animation: none;
		}

		.btn:hover:not(:disabled),
		.btn:active:not(:disabled) {
			transform: none;
		}
	}
</style>
