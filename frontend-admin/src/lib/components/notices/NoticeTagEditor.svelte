<script lang="ts">
	/**
	 * NoticeTagEditor - Inline tag editor for published notices
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 */
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/buttons';
	import { toast } from '$lib/stores/toast';
	import { API_BASE_URL } from '$lib/config/api';

	type Tag = {
		id: number;
		name: string;
		slug: string;
		category: string;
		color_hex: string;
	};

	type Props = {
		noticeId: number;
		currentTags: string[];
		onClose: () => void;
		onSuccess: (updatedTags: string[]) => void;
	};

	let { noticeId, currentTags, onClose, onSuccess }: Props = $props();

	let availableTags = $state<Tag[]>([]);
	let selectedTags = $state<string[]>([...currentTags]);
	let loading = $state(false);
	let saving = $state(false);

	onMount(async () => {
		await loadTags();
	});

	async function loadTags() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/tags/active`);
			if (!res.ok) throw new Error('Failed to load tags');
			const data = await res.json();
			availableTags = data.tags || [];
		} catch (error) {
			console.error('Failed to load tags:', error);
			toast.error('태그 목록을 불러오지 못했습니다');
		} finally {
			loading = false;
		}
	}

	async function saveTags() {
		saving = true;
		try {
			const res = await fetch(`${API_BASE_URL}/notices/${noticeId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tags: selectedTags })
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.detail || 'Failed to update tags');
			}

			toast.success('태그가 업데이트되었습니다');
			onSuccess(selectedTags);
			onClose();
		} catch (error) {
			console.error('Failed to save tags:', error);
			toast.error(error instanceof Error ? error.message : '태그 저장에 실패했습니다');
		} finally {
			saving = false;
		}
	}

	function toggleTag(tagName: string) {
		if (selectedTags.includes(tagName)) {
			selectedTags = selectedTags.filter(t => t !== tagName);
		} else {
			selectedTags = [...selectedTags, tagName];
		}
	}

	function handleCancel() {
		selectedTags = [...currentTags];
		onClose();
	}

	// Group tags by category
	const tagsByCategory = $derived(() => {
		const grouped: Record<string, Tag[]> = {};
		availableTags.forEach(tag => {
			if (!grouped[tag.category]) {
				grouped[tag.category] = [];
			}
			grouped[tag.category].push(tag);
		});
		return grouped;
	});

	const categoryLabels: Record<string, string> = {
		bio_field: '바이오분야',
		tech_field: '기술분야',
		support_type: '지원유형',
		ministry: '정부부처',
		agency: '산하기관',
		target: '대상기업',
		specialized: '특화지원',
		region: '지역'
	};
</script>

<div class="tag-editor-overlay" onclick={handleCancel}>
	<div class="tag-editor" onclick={(e) => e.stopPropagation()}>
		<div class="editor-header">
			<h3 class="editor-title">태그 편집</h3>
			<button class="close-button" onclick={handleCancel}>×</button>
		</div>

		<div class="editor-body">
			{#if loading}
				<div class="loading-state">
					<p>태그 목록 로딩 중...</p>
				</div>
			{:else if availableTags.length === 0}
				<div class="empty-state">
					<p>사용 가능한 태그가 없습니다.</p>
				</div>
			{:else}
				{#each Object.entries(tagsByCategory()) as [category, tags]}
					<div class="tag-category">
						<h4 class="category-label">{categoryLabels[category] || category}</h4>
						<div class="tag-options">
							{#each tags as tag}
								<label class="tag-option">
									<input
										type="checkbox"
										checked={selectedTags.includes(tag.name)}
										onchange={() => toggleTag(tag.name)}
									/>
									<span class="tag-name">{tag.name}</span>
								</label>
							{/each}
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<div class="editor-footer">
			<div class="selected-count">
				{selectedTags.length}개 선택됨
			</div>
			<div class="button-group">
				<Button variant="outline" onclick={handleCancel} disabled={saving}>
					취소
				</Button>
				<Button variant="primary" onclick={saveTags} disabled={saving || loading}>
					{saving ? '저장 중...' : '저장'}
				</Button>
			</div>
		</div>
	</div>
</div>

<style>
	/* ========================================
     OVERLAY
     ======================================== */

	.tag-editor-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	/* ========================================
     EDITOR CONTAINER
     ======================================== */

	.tag-editor {
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		width: 100%;
		max-width: 500px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
	}

	/* ========================================
     HEADER
     ======================================== */

	.editor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.editor-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-tight);
	}

	.close-button {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-2xl);
		line-height: 1;
		cursor: pointer;
		transition: all var(--duration-base) var(--ease-out);
	}

	.close-button:hover {
		background-color: var(--fg);
		color: var(--bg);
	}

	/* ========================================
     BODY
     ======================================== */

	.editor-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
	}

	.loading-state,
	.empty-state {
		padding: var(--space-8);
		text-align: center;
		color: var(--muted);
	}

	/* ========================================
     TAG CATEGORIES
     ======================================== */

	.tag-category {
		margin-bottom: var(--space-6);
	}

	.tag-category:last-child {
		margin-bottom: 0;
	}

	.category-label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		margin-bottom: var(--space-3);
		padding-bottom: var(--space-2);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.tag-options {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: var(--space-2);
	}

	/* ========================================
     TAG OPTIONS
     ======================================== */

	.tag-option {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		cursor: pointer;
		transition: all var(--duration-base) var(--ease-out);
	}

	.tag-option:hover {
		background-color: var(--ghost);
	}

	.tag-option input[type='checkbox'] {
		width: 16px;
		height: 16px;
		cursor: pointer;
		accent-color: var(--fg);
	}

	.tag-name {
		font-size: var(--text-sm);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	/* ========================================
     FOOTER
     ======================================== */

	.editor-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
		background-color: var(--surface-1);
	}

	.selected-count {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
	}

	.button-group {
		display: flex;
		gap: var(--space-2);
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 768px) {
		.tag-editor {
			max-width: none;
			max-height: 90vh;
		}

		.tag-options {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		}
	}
</style>
