<script lang="ts">
	/**
	 * JB SQUARE TagManager Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * 콘텐츠 태그 관리 (사용자가 볼 카테고리 태그)
	 */

	import { Button } from '$lib/components/ui/buttons';
	import { Input } from '$lib/components/ui/forms';
	import { toast } from '$lib/stores/toast';

	interface Tag {
		id: number;
		name: string;
		slug: string;
		description?: string;
		color_hex: string;
		icon?: string;
		category?: string;
		is_active: boolean;
		display_order: number;
		usage_count: number;
		created_at: string;
		updated_at: string;
	}

	interface TagFormData {
		name: string;
		slug: string;
		description: string;
		color_hex: string;
		category: string;
	}

	let tags = $state<Tag[]>([]);
	let isLoading = $state(false);
	let showCreateForm = $state(false);
	let editingTag = $state<Tag | null>(null);
	let selectedCategory = $state<string>('all');
	let categories = $state<string[]>([]);

	// Form state
	let formData = $state<TagFormData>({
		name: '',
		slug: '',
		description: '',
		color_hex: '#E3F2FD',
		category: 'bio'
	});

	$effect(() => {
		loadTags();
		loadCategories();
	});

	const filteredTags = $derived(
		selectedCategory === 'all'
			? tags
			: tags.filter((t) => t.category === selectedCategory)
	);

	async function loadTags() {
		isLoading = true;
		try {
			const response = await fetch('http://localhost:8000/api/tags');
			const data = await response.json();
			tags = data.tags || [];
		} catch (error) {
			console.error('Failed to load tags:', error);
			toast.error('태그를 불러오는데 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	async function loadCategories() {
		try {
			const response = await fetch('http://localhost:8000/api/tags/stats/categories');
			const data = await response.json();
			categories = data.categories || [];
		} catch (error) {
			console.error('Failed to load categories:', error);
		}
	}

	async function createTag() {
		if (!formData.name.trim() || !formData.slug.trim()) {
			toast.error('이름과 슬러그는 필수입니다.');
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('http://localhost:8000/api/tags', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				toast.success('태그가 생성되었습니다.');
				resetForm();
				await loadTags();
			} else {
				const error = await response.json();
				toast.error(error.detail || '태그 생성에 실패했습니다.');
			}
		} catch (error) {
			console.error('Failed to create tag:', error);
			toast.error('태그 생성에 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	async function updateTag(tag: Tag) {
		isLoading = true;
		try {
			const response = await fetch(`http://localhost:8000/api/tags/${tag.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: tag.name,
					slug: tag.slug,
					description: tag.description,
					color_hex: tag.color_hex,
					category: tag.category,
					is_active: tag.is_active
				})
			});

			if (response.ok) {
				toast.success('태그가 수정되었습니다.');
				editingTag = null;
				await loadTags();
			} else {
				const error = await response.json();
				toast.error(error.detail || '태그 수정에 실패했습니다.');
			}
		} catch (error) {
			console.error('Failed to update tag:', error);
			toast.error('태그 수정에 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	async function deleteTag(id: number) {
		if (!confirm('정말 삭제하시겠습니까?')) return;

		isLoading = true;
		try {
			const response = await fetch(`http://localhost:8000/api/tags/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				toast.success('태그가 삭제되었습니다.');
				await loadTags();
			} else {
				const error = await response.json();
				toast.error(error.detail || '태그 삭제에 실패했습니다.');
			}
		} catch (error) {
			console.error('Failed to delete tag:', error);
			toast.error('태그 삭제에 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	async function toggleActive(tag: Tag) {
		tag.is_active = !tag.is_active;
		await updateTag(tag);
	}

	function startEdit(tag: Tag) {
		editingTag = { ...tag };
	}

	function cancelEdit() {
		editingTag = null;
	}

	function resetForm() {
		formData = {
			name: '',
			slug: '',
			description: '',
			color_hex: '#E3F2FD',
			category: 'bio'
		};
		showCreateForm = false;
	}

	function generateSlug() {
		// Simple slug generation from name
		formData.slug = formData.name
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '');
	}
</script>

<div class="tag-manager">
	<div class="manager-header">
		<div class="header-left">
			<h2 class="manager-title">태그 관리</h2>
			<span class="tag-count">{tags.length}개</span>
		</div>
		<Button variant="primary" onclick={() => (showCreateForm = !showCreateForm)}>
			{showCreateForm ? '취소' : '+ 새 태그'}
		</Button>
	</div>

	<!-- Category Filter -->
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

	<!-- Create Form -->
	{#if showCreateForm}
		<div class="tag-form">
			<h3 class="form-title">새 태그 만들기</h3>

			<div class="form-grid">
				<Input
					label="태그 이름"
					bind:value={formData.name}
					placeholder="바이오헬스"
					onkeydown={(e) => {
						if (e.key === 'Enter') generateSlug();
					}}
					fullWidth
					required
				/>

				<Input
					label="슬러그 (URL)"
					bind:value={formData.slug}
					placeholder="bio-health"
					fullWidth
					required
				/>

				<Input
					label="설명"
					bind:value={formData.description}
					placeholder="바이오헬스 관련 지원사업 및 공고"
					fullWidth
				/>

				<div class="color-input-group">
					<Input
						label="색상"
						type="text"
						bind:value={formData.color_hex}
						placeholder="#E3F2FD"
						fullWidth
					/>
					<input
						type="color"
						bind:value={formData.color_hex}
						class="color-picker"
						aria-label="색상 선택"
					/>
				</div>

				<Input
					label="카테고리"
					bind:value={formData.category}
					placeholder="bio"
					fullWidth
				/>
			</div>

			<div class="form-actions">
				<Button variant="outline" onclick={resetForm}>취소</Button>
				<Button variant="primary" onclick={createTag} disabled={isLoading}>
					{isLoading ? '생성 중...' : '생성'}
				</Button>
			</div>
		</div>
	{/if}

	<!-- Tags Table -->
	<div class="tags-table">
		{#if filteredTags.length === 0}
			<div class="empty-state">
				<span class="empty-icon">🏷️</span>
				<p class="empty-message">등록된 태그가 없습니다.</p>
			</div>
		{:else}
			<table>
				<thead>
					<tr>
						<th>미리보기</th>
						<th>이름</th>
						<th>슬러그</th>
						<th>설명</th>
						<th>카테고리</th>
						<th>사용 횟수</th>
						<th>상태</th>
						<th>작업</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredTags as tag (tag.id)}
						{#if editingTag && editingTag.id === tag.id}
							<!-- Edit Row -->
							<tr class="edit-row">
								<td>
									<div class="tag-preview" style="background-color: {editingTag.color_hex}">
										{editingTag.name}
									</div>
								</td>
								<td>
									<input
										type="text"
										bind:value={editingTag.name}
										class="inline-input"
										placeholder="태그 이름"
									/>
								</td>
								<td>
									<input
										type="text"
										bind:value={editingTag.slug}
										class="inline-input"
										placeholder="slug"
									/>
								</td>
								<td>
									<input
										type="text"
										bind:value={editingTag.description}
										class="inline-input"
										placeholder="설명"
									/>
								</td>
								<td>
									<input
										type="text"
										bind:value={editingTag.category}
										class="inline-input"
										placeholder="카테고리"
									/>
								</td>
								<td>{tag.usage_count}</td>
								<td>
									<button
										class="status-badge"
										class:active={editingTag.is_active}
										onclick={() => (editingTag.is_active = !editingTag.is_active)}
									>
										{editingTag.is_active ? '활성' : '비활성'}
									</button>
								</td>
								<td>
									<div class="action-buttons">
										<Button size="sm" variant="primary" onclick={() => updateTag(editingTag)}>
											저장
										</Button>
										<Button size="sm" variant="outline" onclick={cancelEdit}>취소</Button>
									</div>
								</td>
							</tr>
						{:else}
							<!-- Normal Row -->
							<tr>
								<td>
									<div class="tag-preview" style="background-color: {tag.color_hex}">
										{tag.name}
									</div>
								</td>
								<td class="tag-name">{tag.name}</td>
								<td class="tag-slug">{tag.slug}</td>
								<td class="tag-description">{tag.description || '-'}</td>
								<td class="tag-category">{tag.category || '-'}</td>
								<td class="tag-usage">{tag.usage_count}</td>
								<td>
									<button
										class="status-badge"
										class:active={tag.is_active}
										onclick={() => toggleActive(tag)}
									>
										{tag.is_active ? '활성' : '비활성'}
									</button>
								</td>
								<td>
									<div class="action-buttons">
										<Button size="sm" variant="outline" onclick={() => startEdit(tag)}>
											수정
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onclick={() => deleteTag(tag.id)}
											disabled={tag.usage_count > 0}
										>
											삭제
										</Button>
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	/* ========================================
     TAG MANAGER
     ======================================== */

	.tag-manager {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* ========================================
     MANAGER HEADER
     ======================================== */

	.manager-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.manager-title {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		color: var(--fg);
		letter-spacing: var(--tracking-tight);
		margin: 0;
	}

	.tag-count {
		font-size: var(--text-sm);
		color: var(--muted);
		padding: var(--space-1) var(--space-3);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
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
		padding: var(--space-2) var(--space-4);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-sm);
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
     TAG FORM
     ======================================== */

	.tag-form {
		padding: var(--space-6);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	.form-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin: 0 0 var(--space-4) 0;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-6);
	}

	.color-input-group {
		display: flex;
		gap: var(--space-2);
		align-items: flex-end;
	}

	.color-picker {
		width: 50px;
		height: 40px;
		border: var(--border-width) solid var(--hair);
		cursor: pointer;
		background: transparent;
	}

	.form-actions {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
		padding-top: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
	}

	/* ========================================
     TAGS TABLE
     ======================================== */

	.tags-table {
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	thead {
		background-color: var(--surface-1);
		border-bottom: var(--border-width) solid var(--hair);
	}

	th {
		padding: var(--space-3) var(--space-4);
		text-align: left;
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	td {
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-sm);
		color: var(--fg);
		border-bottom: var(--border-width) solid var(--divider);
	}

	tr:hover:not(.edit-row) {
		background-color: var(--ghost);
	}

	.edit-row {
		background-color: var(--surface-1);
	}

	/* ========================================
     TAG PREVIEW
     ======================================== */

	.tag-preview {
		display: inline-block;
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		color: var(--fg);
		border: var(--border-width) solid var(--hair);
		white-space: nowrap;
	}

	/* ========================================
     TABLE CELLS
     ======================================== */

	.tag-name {
		font-weight: var(--font-medium);
	}

	.tag-slug {
		font-family: var(--font-mono);
		color: var(--muted);
		font-size: var(--text-xs);
	}

	.tag-description {
		color: var(--muted);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tag-category {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
	}

	.tag-usage {
		font-variant-numeric: tabular-nums;
		font-weight: var(--font-medium);
	}

	/* ========================================
     STATUS BADGE
     ======================================== */

	.status-badge {
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		background-color: var(--surface-2);
		border: var(--border-width) solid var(--hair);
		color: var(--muted);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.status-badge:hover {
		border-color: var(--muted);
	}

	.status-badge.active {
		background-color: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	/* ========================================
     ACTION BUTTONS
     ======================================== */

	.action-buttons {
		display: flex;
		gap: var(--space-2);
	}

	/* ========================================
     INLINE INPUT
     ======================================== */

	.inline-input {
		width: 100%;
		padding: var(--space-2);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
	}

	.inline-input:focus {
		outline: none;
		border-color: var(--fg);
	}

	/* ========================================
     EMPTY STATE
     ======================================== */

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-16);
		gap: var(--space-3);
	}

	.empty-icon {
		font-size: var(--text-3xl);
	}

	.empty-message {
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		color: var(--fg);
		margin: 0;
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.tags-table {
			overflow-x: scroll;
		}

		table {
			min-width: 800px;
		}
	}
</style>
