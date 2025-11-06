<script lang="ts">
	import KSICManager from '$lib/components/ksic/KSICManager.svelte';
</script>

<svelte:head>
	<title>KSIC 코드 관리 - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">KSIC 코드 관리</h1>
			<p class="page-subtitle">한국표준산업분류 코드 관리 시스템</p>
		</div>
	</div>

	<div class="content-section">
		<KSICManager />
	</div>
</div>

<style>
	.page {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.page-header {
		margin-bottom: var(--space-2);
	}

	.page-title {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
		text-transform: uppercase;
		margin-bottom: var(--space-1);
	}

	.page-subtitle {
		font-size: var(--text-base);
		color: var(--muted);
	}

	.content-section {
		flex: 1;
	}
</style>
