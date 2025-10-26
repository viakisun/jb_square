<script lang="ts">
	/**
	 * JB SQUARE Contents Page
	 * 콘텐츠 태그 관리 페이지
	 */

	import TagManager from '$lib/components/contents/TagManager.svelte';
</script>

<svelte:head>
	<title>콘텐츠 관리 - JB SQUARE Backoffice</title>
</svelte:head>

<div class="contents-page">
	<!-- Page Header -->
	<div class="page-header">
		<div>
			<h1 class="page-title">CONTENTS</h1>
			<p class="page-subtitle">콘텐츠 태그 관리</p>
		</div>
	</div>

	<!-- Tag Manager -->
	<div class="content-section">
		<TagManager />
	</div>
</div>

<style>
	/* ========================================
     CONTENTS PAGE
     ======================================== */

	.contents-page {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* ========================================
     PAGE HEADER
     ======================================== */

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
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

	/* ========================================
     CONTENT SECTION
     ======================================== */

	.content-section {
		flex: 1;
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 768px) {
		.contents-page {
			padding: var(--space-4);
		}
	}
</style>
