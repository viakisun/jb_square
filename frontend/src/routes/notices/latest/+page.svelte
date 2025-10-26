<script lang="ts">
	import { onMount } from 'svelte';
	import NoticeCard from '$lib/components/notices/NoticeCard.svelte';

	const API_BASE = 'http://localhost:8000/api';

	let notices = $state([]);
	let loading = $state(true);

	async function loadLatestNotices() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE}/notices/latest/list?limit=15`);
			const data = await res.json();
			notices = data.items;
		} catch (error) {
			console.error('Failed to load notices:', error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadLatestNotices();
	});
</script>

<svelte:head>
	<title>최신공고 모아보기 - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">최신공고 모아보기</h1>
			<p class="page-subtitle">등록날짜 기준 최근 15개 공고</p>
		</div>
	</div>

	{#if loading}
		<div class="loading">로딩 중...</div>
	{:else if notices.length === 0}
		<div class="empty-state">
			<p>등록된 공고가 없습니다.</p>
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
