<script lang="ts">
	/**
	 * JB SQUARE TagSelector Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * 공고 발행 시 태그 선택
	 */

	import { toast } from '$lib/stores/toast';
	import { API_BASE_URL } from '$lib/config/api';

	interface Tag {
		id: number;
		name: string;
		slug: string;
		description?: string;
		color_hex: string;
		category?: string;
	}

	interface TagSelectorProps {
		selectedTags?: number[];
		onTagsChange?: (tagIds: number[]) => void;
		maxTags?: number;
		required?: boolean;
		class?: string;
	}

	let {
		selectedTags = $bindable([]),
		onTagsChange,
		maxTags = 5,
		required = false,
		class: className = ''
	}: TagSelectorProps = $props();

	let availableTags = $state<Tag[]>([]);
	let isLoading = $state(false);
	let selectedCategory = $state<string>('all');
	let categories = $state<string[]>([]);

	$effect(() => {
		loadTags();
	});

	const filteredTags = $derived(
		selectedCategory === 'all'
			? availableTags
			: availableTags.filter((t) => t.category === selectedCategory)
	);

	const selectedTagObjects = $derived(
		availableTags.filter((t) => selectedTags.includes(t.id))
	);

	const hasSelection = $derived(selectedTags.length > 0);
	const canAddMore = $derived(selectedTags.length < maxTags);
	const warningMessage = $derived(
		required && !hasSelection ? '태그를 최소 1개 이상 선택해주세요' : ''
	);

	async function loadTags() {
		isLoading = true;
		try {
			const response = await fetch(`${API_BASE_URL}/tags/active`);
			const data = await response.json();
			availableTags = data.tags || [];

			// Extract unique categories
			const uniqueCategories = new Set<string>();
			availableTags.forEach((tag) => {
				if (tag.category) uniqueCategories.add(tag.category);
			});
			categories = Array.from(uniqueCategories);
		} catch (error) {
			console.error('Failed to load tags:', error);
			toast.error('태그를 불러오는데 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	function toggleTag(tagId: number) {
		if (selectedTags.includes(tagId)) {
			// Remove tag
			selectedTags = selectedTags.filter((id) => id !== tagId);
		} else {
			// Add tag (check max limit)
			if (canAddMore) {
				selectedTags = [...selectedTags, tagId];
			} else {
				toast.info(`최대 ${maxTags}개까지 선택할 수 있습니다.`);
			}
		}

		// Notify parent
		onTagsChange?.(selectedTags);
	}

	function removeTag(tagId: number) {
		selectedTags = selectedTags.filter((id) => id !== tagId);
		onTagsChange?.(selectedTags);
	}

	function clearAll() {
		selectedTags = [];
		onTagsChange?.(selectedTags);
	}
</script>

<div class="tag-selector {className}">
	<!-- Header -->
	<div class="selector-header">
		<div class="header-left">
			<span class="selector-label">
				태그 선택
				{#if required}
					<span class="required">*</span>
				{/if}
			</span>
			<span class="selected-count">{selectedTags.length}/{maxTags}</span>
		</div>
		{#if hasSelection}
			<button class="clear-button" onclick={clearAll}>전체 해제</button>
		{/if}
	</div>

	<!-- Selected Tags Preview -->
	{#if hasSelection}
		<div class="selected-tags">
			{#each selectedTagObjects as tag (tag.id)}
				<button
					class="selected-tag"
					style="background-color: {tag.color_hex}"
					onclick={() => removeTag(tag.id)}
					aria-label="Remove {tag.name}"
				>
					<span class="tag-name">{tag.name}</span>
					<span class="remove-icon">✕</span>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Warning Message -->
	{#if warningMessage}
		<div class="warning-message" role="alert">
			⚠️ {warningMessage}
		</div>
	{/if}

	<!-- Category Filter -->
	{#if categories.length > 0}
		<div class="category-filter">
			<button
				class="category-btn"
				class:active={selectedCategory === 'all'}
				onclick={() => (selectedCategory = 'all')}
			>
				전체
			</button>
			{#each categories as category}
				<button
					class="category-btn"
					class:active={selectedCategory === category}
					onclick={() => (selectedCategory = category)}
				>
					{category}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Available Tags -->
	<div class="available-tags">
		{#if isLoading}
			<div class="loading-state">
				<span>태그 로딩 중...</span>
			</div>
		{:else if filteredTags.length === 0}
			<div class="empty-state">
				<span class="empty-message">사용 가능한 태그가 없습니다.</span>
			</div>
		{:else}
			<div class="tag-grid">
				{#each filteredTags as tag (tag.id)}
					<button
						class="tag-option"
						class:selected={selectedTags.includes(tag.id)}
						class:disabled={!canAddMore && !selectedTags.includes(tag.id)}
						style="background-color: {tag.color_hex}"
						onclick={() => toggleTag(tag.id)}
						disabled={!canAddMore && !selectedTags.includes(tag.id)}
					>
						<span class="tag-name">{tag.name}</span>
						{#if selectedTags.includes(tag.id)}
							<span class="check-icon">✓</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Helper Text -->
	<div class="helper-text">
		태그는 사용자가 공고를 빠르게 이해하는데 도움을 줍니다. 최대 {maxTags}개까지 선택 가능합니다.
	</div>
</div>

<style>
	/* ========================================
     TAG SELECTOR
     ======================================== */

	.tag-selector {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* ========================================
     SELECTOR HEADER
     ======================================== */

	.selector-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.selector-label {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.required {
		color: var(--muted);
	}

	.selected-count {
		font-size: var(--text-xs);
		color: var(--muted);
		padding: var(--space-1) var(--space-2);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		font-variant-numeric: tabular-nums;
	}

	.clear-button {
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		color: var(--muted);
		background: none;
		border: var(--border-width) solid var(--hair);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.clear-button:hover {
		color: var(--fg);
		border-color: var(--fg);
	}

	/* ========================================
     SELECTED TAGS
     ======================================== */

	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		min-height: 60px;
	}

	.selected-tag {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		border: var(--border-width-thick) solid var(--fg);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.selected-tag:hover {
		opacity: 0.7;
	}

	.selected-tag .tag-name {
		font-weight: var(--font-semibold);
	}

	.selected-tag .remove-icon {
		font-size: var(--text-xs);
		opacity: 0.6;
	}

	/* ========================================
     WARNING MESSAGE
     ======================================== */

	.warning-message {
		padding: var(--space-3) var(--space-4);
		background-color: var(--color-warning-bg);
		border: var(--border-width) solid var(--border-color);
		color: var(--fg);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
	}

	/* ========================================
     CATEGORY FILTER
     ======================================== */

	.category-filter {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.category-btn {
		padding: var(--space-1-5) var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.category-btn:hover {
		background-color: var(--surface-1);
		border-color: var(--muted);
	}

	.category-btn.active {
		background-color: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	/* ========================================
     AVAILABLE TAGS
     ======================================== */

	.available-tags {
		padding: var(--space-4);
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		min-height: 150px;
	}

	.loading-state,
	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 150px;
		color: var(--muted);
		font-size: var(--text-sm);
	}

	.tag-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--space-2);
	}

	.tag-option {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		border: var(--border-width) solid var(--hair);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.tag-option:hover:not(.disabled) {
		border-color: var(--fg);
		transform: translateY(-1px);
	}

	.tag-option.selected {
		border-width: var(--border-width-thick);
		border-color: var(--fg);
	}

	.tag-option.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.tag-option .tag-name {
		flex: 1;
		text-align: left;
	}

	.tag-option .check-icon {
		font-size: var(--text-lg);
		font-weight: var(--font-bold);
	}

	/* ========================================
     HELPER TEXT
     ======================================== */

	.helper-text {
		font-size: var(--text-xs);
		color: var(--muted);
		line-height: var(--leading-relaxed);
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 640px) {
		.tag-grid {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		}

		.category-filter {
			overflow-x: auto;
			flex-wrap: nowrap;
		}
	}
</style>
