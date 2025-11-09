<script lang="ts">
	import { onMount } from 'svelte';
	import NoticeCard from '$lib/components/notices/NoticeCard.svelte';
	import { API_BASE_URL } from '$lib/config/api';

	type Notice = {
		id: number;
		title: string;
		content: string | null;
		link: string | null;
		origin_type: string;
		crawler_source_id: string;
		tags: string[];
		organization: string | null;
		published_at: string | null;
		deadline: string | null;
		matched_keywords?: string[];
	};

	let notices = $state<Notice[]>([]);
	let loading = $state(true);

	async function loadRndNotices() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices?tag=${encodeURIComponent('R&D')}&limit=15`);
			const data = await res.json();
			notices = data.items;
		} catch (error) {
			console.error('Failed to load R&D notices:', error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadRndNotices();
	});
</script>

<svelte:head>
	<title>연구개발 공고 (R&D) - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">연구개발 공고 (R&D)</h1>
			<p class="page-subtitle">R&D 태그가 있는 공고 최근 15개</p>
		</div>
	</div>

	{#if loading}
		<div class="loading">로딩 중...</div>
	{:else if notices.length === 0}
		<div class="empty-state">
			<p>등록된 R&D 공고가 없습니다.</p>
		</div>
	{:else}
		<div class="notices-grid">
			{#each notices as notice (notice.id)}
				<NoticeCard {notice} />
			{/each}
		</div>
	{/if}
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

	.notices-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: var(--space-6);
	}

	.loading,
	.empty-state {
		text-align: center;
		padding: var(--space-12);
		color: var(--muted);
	}

	@media (max-width: 768px) {
		.notices-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
