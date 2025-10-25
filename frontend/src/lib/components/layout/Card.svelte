<script lang="ts">
	/**
	 * JB SQUARE Card Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Features:
	 * - 1px hairline border (lighter than Panel)
	 * - Hover state
	 * - Optional clickable
	 *
	 * Usage:
	 * <Card>Card content</Card>
	 * <Card clickable onclick={handleClick}>Clickable card</Card>
	 */

	interface CardProps {
		clickable?: boolean;
		onclick?: (event: MouseEvent) => void;
		class?: string;
		children?: any;
	}

	let {
		clickable = false,
		onclick,
		class: className = '',
		children
	}: CardProps = $props();
</script>

{#if clickable}
	<button type="button" class="card card-clickable {className}" {onclick}>
		{@render children?.()}
	</button>
{:else}
	<div class="card {className}">
		{@render children?.()}
	</div>
{/if}

<style>
	/* ========================================
     CARD
     ======================================== */

	.card {
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-6);
		transition: border-color var(--duration-base) var(--ease-out);
	}

	/* ========================================
     CLICKABLE CARD
     ======================================== */

	.card-clickable {
		cursor: pointer;
		text-align: left;
		width: 100%;
	}

	.card-clickable:hover {
		border-color: var(--fg);
	}

	.card-clickable:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: 2px;
	}

	.card-clickable:active {
		background-color: var(--ghost);
	}
</style>
