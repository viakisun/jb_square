<script lang="ts">
	/**
	 * NoticeQueueManager - Unified notice queue management component
	 * Simplified version with publish and reject actions
	 */

	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/buttons';
	import { toast } from '$lib/stores/toast';
	import { API_BASE_URL } from '$lib/config/api';
	import CrawlQueueTable from './CrawlQueueTable.svelte';
	import RejectReasonModal from './RejectReasonModal.svelte';

	type Props = {
		sourceId: string;
		onPublishSuccess?: () => void;
	};

	let { sourceId, onPublishSuccess }: Props = $props();

	// State
	let queueItems = $state([]);
	let selectedIds = $state<number[]>([]);
	let loading = $state(false);
	let showRejectModal = $state(false);

	onMount(() => {
		loadQueue();
	});

	async function loadQueue() {
		loading = true;
		try {
			const url = `${API_BASE_URL}/notices/crawl-queue/list?source_id=${sourceId}&status=all`;
			const res = await fetch(url);
			const data = await res.json();
			queueItems = data.items;
		} catch (error) {
			console.error('Failed to load queue:', error);
			toast.error('대기열 로드 실패');
		} finally {
			loading = false;
		}
	}

	async function publishSelected() {
		if (selectedIds.length === 0) return;

		loading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices/publish`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					queue_ids: selectedIds,
					tags: []
				})
			});
			const data = await res.json();
			toast.success(`${data.published}개 공고가 게시되었습니다`);
			await loadQueue();
			selectedIds = [];
			if (onPublishSuccess) {
				onPublishSuccess();
			}
		} catch (error) {
			console.error('Publish failed:', error);
			toast.error('게시 실패');
		} finally {
			loading = false;
		}
	}

	function openRejectModal() {
		if (selectedIds.length === 0) return;
		showRejectModal = true;
	}

	async function handleRejectSubmit(reason: string) {
		loading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/bulk-reject`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					queue_ids: selectedIds,
					reason: reason || undefined
				})
			});
			const data = await res.json();
			toast.success(`${data.rejected}개 항목이 반려되었습니다`);
			await loadQueue();
			selectedIds = [];
			showRejectModal = false;
		} catch (error) {
			console.error('Reject failed:', error);
			toast.error('반려 실패');
		} finally {
			loading = false;
		}
	}
</script>

<CrawlQueueTable
	bind:items={queueItems}
	onSelectionChange={(ids) => (selectedIds = ids)}
	onRefresh={loadQueue}
/>

{#if selectedIds.length > 0}
	<div class="queue-actions">
		<Button onclick={publishSelected} disabled={loading}>
			선택 항목 게시 ({selectedIds.length})
		</Button>
		<Button variant="outline" onclick={openRejectModal} disabled={loading}>
			선택 항목 반려 ({selectedIds.length})
		</Button>
	</div>
{/if}

<RejectReasonModal
	open={showRejectModal}
	count={selectedIds.length}
	{loading}
	onClose={() => (showRejectModal = false)}
	onSubmit={handleRejectSubmit}
/>

<style>
	.queue-actions {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
		margin-top: var(--space-4);
		flex-wrap: wrap;
		gap: var(--space-4);
	}
</style>
