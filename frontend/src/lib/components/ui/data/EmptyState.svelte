<script lang="ts">
	/**
	 * JB SQUARE EmptyState Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Display when no data is available
	 *
	 * Usage:
	 * <EmptyState title="No results found" description="Try adjusting your filters" />
	 * <EmptyState icon="□" title="No data">
	 *   <Button>Create new</Button>
	 * </EmptyState>
	 */

	interface EmptyStateProps {
		icon?: string;
		title: string;
		description?: string;
		class?: string;
		children?: any;
	}

	let {
		icon = '□',
		title,
		description,
		class: className = '',
		children
	}: EmptyStateProps = $props();
</script>

<div class="empty-state {className}" role="status">
	<div class="empty-state-icon" aria-hidden="true">{icon}</div>
	<h3 class="empty-state-title">{title}</h3>
	{#if description}
		<p class="empty-state-description">{description}</p>
	{/if}
	{#if children}
		<div class="empty-state-actions">
			{@render children?.()}
		</div>
	{/if}
</div>

<style>
	/* ========================================
     EMPTY STATE
     ======================================== */

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		padding: var(--space-16) var(--space-8);
		text-align: center;
	}

	/* ========================================
     ICON
     ======================================== */

	.empty-state-icon {
		font-size: 64px;
		line-height: 1;
		color: var(--subtle);
		user-select: none;
	}

	/* ========================================
     TITLE
     ======================================== */

	.empty-state-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		letter-spacing: var(--tracking-tight);
		margin: 0;
	}

	/* ========================================
     DESCRIPTION
     ======================================== */

	.empty-state-description {
		font-size: var(--text-sm);
		color: var(--muted);
		max-width: 400px;
		line-height: var(--leading-relaxed);
		margin: 0;
	}

	/* ========================================
     ACTIONS
     ======================================== */

	.empty-state-actions {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}
</style>
