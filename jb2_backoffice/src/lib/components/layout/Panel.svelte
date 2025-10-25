<script lang="ts">
	/**
	 * JB SQUARE Panel Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Features:
	 * - 1px black border
	 * - No shadows
	 * - White background
	 * - Optional header with title
	 *
	 * Usage:
	 * <Panel title="Panel Title">Content here</Panel>
	 * <Panel><div slot="header">Custom Header</div>Content</Panel>
	 */

	interface PanelProps {
		title?: string;
		noPadding?: boolean;
		class?: string;
		children?: any;
	}

	let {
		title = '',
		noPadding = false,
		class: className = '',
		children
	}: PanelProps = $props();
</script>

<div class="panel {className}">
	{#if title}
		<div class="panel-header">
			<h3 class="panel-title">{title}</h3>
		</div>
	{/if}

	<div class="panel-content" class:no-padding={noPadding}>
		{@render children?.()}
	</div>
</div>

<style>
	/* ========================================
     PANEL
     ======================================== */

	.panel {
		background-color: var(--bg);
		border: var(--border-width) solid var(--fg);
	}

	/* ========================================
     HEADER
     ======================================== */

	.panel-header {
		padding: var(--space-4) var(--space-6);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.panel-title {
		font-size: var(--text-md);
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-tight);
	}

	/* ========================================
     CONTENT
     ======================================== */

	.panel-content {
		padding: var(--space-6);
	}

	.panel-content.no-padding {
		padding: 0;
	}
</style>
