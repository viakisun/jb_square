<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		title: string;
		children: Snippet;
	}

	let { id, title, children }: Props = $props();
</script>

<section {id} class="doc-section">
	<h2 class="section-title">{title}</h2>
	<div class="section-content">
		{@render children()}
	</div>
</section>

<style>
	.doc-section {
		margin-bottom: var(--space-16);
		scroll-margin-top: calc(var(--topbar-height) + var(--space-8));
	}

	.section-title {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		color: var(--fg);
		margin: 0 0 var(--space-6) 0;
		padding-bottom: var(--space-4);
		border-bottom: 2px solid var(--hair);
	}

	.section-content {
		color: var(--muted);
		line-height: 1.7;
	}

	.section-content :global(h3) {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin: var(--space-8) 0 var(--space-4) 0;
	}

	.section-content :global(p) {
		margin: var(--space-4) 0;
		line-height: 1.7;
	}

	.section-content :global(ul),
	.section-content :global(ol) {
		margin: var(--space-4) 0;
		padding-left: var(--space-8);
	}

	.section-content :global(li) {
		margin: var(--space-2) 0;
		line-height: 1.6;
	}

	.section-content :global(code) {
		background-color: var(--ghost);
		padding: 2px var(--space-2);
		border-radius: var(--radius-xs);
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: var(--text-sm);
		color: var(--fg);
	}

	.section-content :global(a) {
		color: #2196f3;
		text-decoration: none;
	}

	.section-content :global(a:hover) {
		text-decoration: underline;
	}
</style>
