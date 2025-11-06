<script lang="ts">
	/**
	 * KSIC Code Manager Component
	 * Manages Korean Standard Industry Classification codes
	 */

	import { toast } from '$lib/stores/toast';
	import { API } from '$lib/config/api';

	interface KSICCode {
		code: string;
		name: string;
		category: string;
		description?: string;
		is_active: boolean;
		company_count?: number;
		created_at?: string;
		updated_at?: string;
	}

	interface KSICFormData {
		code: string;
		name: string;
		category: string;
		description: string;
	}

	let ksicCodes = $state<KSICCode[]>([]);
	let isLoading = $state(false);
	let showCreateForm = $state(false);
	let editingCode = $state<KSICCode | null>(null);
	let selectedCategory = $state<string>('all');
	let searchQuery = $state<string>('');
	let stats = $state<any>(null);

	// Form state
	let formData = $state<KSICFormData>({
		code: '',
		name: '',
		category: 'NON_BIO',
		description: ''
	});

	$effect(() => {
		loadKSICCodes();
		loadStats();
	});

	const filteredCodes = $derived(() => {
		let filtered = ksicCodes;

		// Category filter
		if (selectedCategory !== 'all') {
			if (selectedCategory === 'BIO') {
				filtered = filtered.filter((c) => c.category === 'BIO_CORE' || c.category === 'BIO_RELATED');
			} else {
				filtered = filtered.filter((c) => c.category === selectedCategory);
			}
		}

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(c) => c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
			);
		}

		return filtered;
	});

	async function loadKSICCodes() {
		isLoading = true;
		try {
			const response = await fetch(API.ksicCodes.withCounts);
			const data = await response.json();
			ksicCodes = data.items || [];
		} catch (error) {
			console.error('Failed to load KSIC codes:', error);
			toast.error('KSIC 코드를 불러오는데 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	async function loadStats() {
		try {
			const response = await fetch(API.ksicCodes.stats);
			stats = await response.json();
		} catch (error) {
			console.error('Failed to load stats:', error);
		}
	}

	async function createCode() {
		if (!formData.code.trim() || !formData.name.trim()) {
			toast.error('코드와 이름은 필수입니다.');
			return;
		}

		isLoading = true;
		try {
			const response = await fetch(API.ksicCodes.base, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				toast.success('KSIC 코드가 생성되었습니다.');
				resetForm();
				await loadKSICCodes();
				await loadStats();
			} else {
				const error = await response.json();
				toast.error(error.detail || 'KSIC 코드 생성에 실패했습니다.');
			}
		} catch (error) {
			console.error('Failed to create KSIC code:', error);
			toast.error('KSIC 코드 생성에 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	async function updateCode(code: KSICCode) {
		isLoading = true;
		try {
			const response = await fetch(API.ksicCodes.byCode(code.code), {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: code.name,
					category: code.category,
					description: code.description,
					is_active: code.is_active
				})
			});

			if (response.ok) {
				toast.success('KSIC 코드가 수정되었습니다.');
				editingCode = null;
				await loadKSICCodes();
				await loadStats();
			} else {
				const error = await response.json();
				toast.error(error.detail || 'KSIC 코드 수정에 실패했습니다.');
			}
		} catch (error) {
			console.error('Failed to update KSIC code:', error);
			toast.error('KSIC 코드 수정에 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	async function deleteCode(code: string, companyCount: number) {
		if (companyCount > 0) {
			if (!confirm(`이 코드는 ${companyCount}개 기업에서 사용 중입니다. 비활성화하시겠습니까?`)) {
				return;
			}
		} else {
			if (!confirm('정말 이 KSIC 코드를 삭제하시겠습니까?')) {
				return;
			}
		}

		isLoading = true;
		try {
			const force = companyCount === 0;
			const response = await fetch(`${API.ksicCodes.byCode(code)}?force=${force}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				toast.success(
					companyCount > 0 ? 'KSIC 코드가 비활성화되었습니다.' : 'KSIC 코드가 삭제되었습니다.'
				);
				await loadKSICCodes();
				await loadStats();
			} else {
				const error = await response.json();
				toast.error(error.detail || 'KSIC 코드 삭제에 실패했습니다.');
			}
		} catch (error) {
			console.error('Failed to delete KSIC code:', error);
			toast.error('KSIC 코드 삭제에 실패했습니다.');
		} finally {
			isLoading = false;
		}
	}

	function startEdit(code: KSICCode) {
		editingCode = { ...code };
	}

	function cancelEdit() {
		editingCode = null;
	}

	function resetForm() {
		formData = {
			code: '',
			name: '',
			category: 'NON_BIO',
			description: ''
		};
		showCreateForm = false;
	}

	function getCategoryLabel(category: string): string {
		const labels: Record<string, string> = {
			BIO_CORE: '바이오 핵심산업',
			BIO_RELATED: '전후방 연관산업',
			NON_BIO: '비바이오산업'
		};
		return labels[category] || category;
	}

	function getCategoryColor(category: string): string {
		const colors: Record<string, string> = {
			BIO_CORE: 'core',
			BIO_RELATED: 'related',
			NON_BIO: 'non'
		};
		return colors[category] || 'non';
	}
</script>

<div class="ksic-manager">
	<!-- Header with Stats -->
	<div class="manager-header">
		<div class="stats-row">
			{#if stats}
				<div class="stat-card">
					<div class="stat-label">전체 코드</div>
					<div class="stat-value">{stats.total_codes}</div>
				</div>
				<div class="stat-card">
					<div class="stat-label">바이오 코드</div>
					<div class="stat-value">{stats.total_bio_codes}</div>
				</div>
				<div class="stat-card">
					<div class="stat-label">등록 기업</div>
					<div class="stat-value">{stats.total_companies}</div>
				</div>
			{/if}
		</div>

		<button class="create-button" onclick={() => (showCreateForm = !showCreateForm)}>
			{showCreateForm ? '취소' : '+ 새 코드 추가'}
		</button>
	</div>

	<!-- Create Form -->
	{#if showCreateForm}
		<div class="create-form">
			<h3>새 KSIC 코드 추가</h3>
			<div class="form-grid">
				<div class="form-group">
					<label for="code">코드 *</label>
					<input type="text" id="code" bind:value={formData.code} placeholder="예: 21101" />
				</div>

				<div class="form-group">
					<label for="category">카테고리 *</label>
					<select id="category" bind:value={formData.category}>
						<option value="BIO_CORE">바이오 핵심산업</option>
						<option value="BIO_RELATED">전후방 연관산업</option>
						<option value="NON_BIO">비바이오산업</option>
					</select>
				</div>

				<div class="form-group full-width">
					<label for="name">이름 *</label>
					<input type="text" id="name" bind:value={formData.name} placeholder="예: 의약용 화합물 제조업" />
				</div>

				<div class="form-group full-width">
					<label for="description">설명</label>
					<textarea id="description" bind:value={formData.description} rows="3"></textarea>
				</div>
			</div>

			<div class="form-actions">
				<button class="btn-primary" onclick={createCode} disabled={isLoading}>생성</button>
				<button class="btn-secondary" onclick={resetForm}>취소</button>
			</div>
		</div>
	{/if}

	<!-- Filters -->
	<div class="filters">
		<div class="filter-group">
			<label for="category-filter">카테고리</label>
			<select id="category-filter" bind:value={selectedCategory}>
				<option value="all">전체</option>
				<option value="BIO">바이오 (핵심 + 연관)</option>
				<option value="BIO_CORE">바이오 핵심산업</option>
				<option value="BIO_RELATED">전후방 연관산업</option>
				<option value="NON_BIO">비바이오산업</option>
			</select>
		</div>

		<div class="filter-group search">
			<label for="search">검색</label>
			<input
				type="text"
				id="search"
				bind:value={searchQuery}
				placeholder="코드 또는 이름으로 검색"
			/>
		</div>
	</div>

	<!-- KSIC Codes Table -->
	<div class="table-container">
		{#if isLoading}
			<div class="loading">로딩 중...</div>
		{:else if filteredCodes().length === 0}
			<div class="empty-state">
				<p>KSIC 코드가 없습니다.</p>
			</div>
		{:else}
			<table class="ksic-table">
				<thead>
					<tr>
						<th>코드</th>
						<th>이름</th>
						<th>카테고리</th>
						<th>사용 기업</th>
						<th>상태</th>
						<th>작업</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredCodes() as code (code.code)}
						{#if editingCode && editingCode.code === code.code}
							<tr class="editing-row">
								<td>
									<span class="code-cell">{code.code}</span>
								</td>
								<td>
									<input type="text" bind:value={editingCode.name} class="edit-input" />
								</td>
								<td>
									<select bind:value={editingCode.category} class="edit-select">
										<option value="BIO_CORE">바이오 핵심산업</option>
										<option value="BIO_RELATED">전후방 연관산업</option>
										<option value="NON_BIO">비바이오산업</option>
									</select>
								</td>
								<td>{code.company_count || 0}개</td>
								<td>
									<label class="toggle">
										<input type="checkbox" bind:checked={editingCode.is_active} />
										<span>{editingCode.is_active ? '활성' : '비활성'}</span>
									</label>
								</td>
								<td>
									<div class="actions">
										<button class="btn-save" onclick={() => updateCode(editingCode!)}>저장</button>
										<button class="btn-cancel" onclick={cancelEdit}>취소</button>
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td>
									<span class="code-cell">{code.code}</span>
								</td>
								<td>{code.name}</td>
								<td>
									<span class="badge category" data-color={getCategoryColor(code.category)}>
										{getCategoryLabel(code.category)}
									</span>
								</td>
								<td>{code.company_count || 0}개</td>
								<td>
									<span class="badge status" data-active={code.is_active}>
										{code.is_active ? '활성' : '비활성'}
									</span>
								</td>
								<td>
									<div class="actions">
										<button class="btn-edit" onclick={() => startEdit(code)}>수정</button>
										<button
											class="btn-delete"
											onclick={() => deleteCode(code.code, code.company_count || 0)}
										>
											삭제
										</button>
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
	.ksic-manager {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.manager-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
	}

	.stats-row {
		display: flex;
		gap: var(--space-4);
	}

	.stat-card {
		padding: var(--space-4);
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
		min-width: 120px;
	}

	.stat-label {
		font-size: var(--text-sm);
		color: var(--muted);
		margin-bottom: var(--space-1);
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.create-button {
		padding: var(--space-3) var(--space-4);
		background: var(--fg);
		color: var(--bg);
		border: none;
		font-weight: var(--font-medium);
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		transition: all var(--duration-base) var(--ease-out);
	}

	.create-button:hover {
		box-shadow: 2px 2px 0 var(--fg);
	}

	.create-form {
		padding: var(--space-6);
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
	}

	.create-form h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		margin-bottom: var(--space-4);
		text-transform: uppercase;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: var(--space-2) var(--space-3);
		border: var(--border-width) solid var(--hair);
		background: var(--bg);
		color: var(--fg);
		font-size: var(--text-sm);
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--fg);
	}

	.form-actions {
		display: flex;
		gap: var(--space-2);
	}

	.btn-primary,
	.btn-secondary {
		padding: var(--space-2) var(--space-4);
		border: var(--border-width) solid var(--fg);
		font-weight: var(--font-medium);
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.btn-primary {
		background: var(--fg);
		color: var(--bg);
	}

	.btn-secondary {
		background: var(--bg);
		color: var(--fg);
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.filters {
		display: flex;
		gap: var(--space-4);
		padding: var(--space-4);
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--hair);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 200px;
	}

	.filter-group.search {
		flex: 1;
		min-width: 300px;
	}

	.filter-group label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		text-transform: uppercase;
	}

	.filter-group select,
	.filter-group input {
		padding: var(--space-2) var(--space-3);
		border: var(--border-width) solid var(--border);
		background: var(--bg);
		color: var(--fg);
		font-size: var(--text-sm);
	}

	.table-container {
		overflow-x: auto;
	}

	.ksic-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
	}

	.ksic-table th,
	.ksic-table td {
		padding: var(--space-3) var(--space-4);
		text-align: left;
		border-bottom: var(--border-width) solid var(--hair);
	}

	.ksic-table th {
		background: var(--bg-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.ksic-table tbody tr {
		transition: background-color var(--duration-base) var(--ease-out);
	}

	.ksic-table tbody tr:hover {
		background: var(--bg-secondary);
	}

	.ksic-table tbody tr.editing-row {
		background: var(--bg-secondary);
	}

	.code-cell {
		font-family: monospace;
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.badge {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		border: var(--border-width) solid var(--fg);
	}

	.badge.category[data-color='core'] {
		background: var(--fg);
		color: var(--bg);
		font-weight: var(--font-bold);
	}

	.badge.category[data-color='related'] {
		background: var(--bg);
		color: var(--fg);
		font-weight: var(--font-semibold);
	}

	.badge.category[data-color='non'] {
		background: var(--bg);
		color: var(--muted);
		opacity: 0.7;
	}

	.badge.status[data-active='true'] {
		background: var(--fg);
		color: var(--bg);
	}

	.badge.status[data-active='false'] {
		background: var(--bg);
		color: var(--muted);
	}

	.actions {
		display: flex;
		gap: var(--space-2);
	}

	.btn-edit,
	.btn-delete,
	.btn-save,
	.btn-cancel {
		padding: var(--space-1) var(--space-3);
		border: var(--border-width) solid var(--fg);
		background: var(--bg);
		color: var(--fg);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		cursor: pointer;
		text-transform: uppercase;
	}

	.btn-save {
		background: var(--fg);
		color: var(--bg);
	}

	.btn-delete:hover {
		background: var(--fg);
		color: var(--bg);
	}

	.edit-input,
	.edit-select {
		padding: var(--space-1) var(--space-2);
		border: var(--border-width) solid var(--fg);
		background: var(--bg);
		color: var(--fg);
		font-size: var(--text-sm);
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
	}

	.toggle input[type='checkbox'] {
		cursor: pointer;
	}

	.loading,
	.empty-state {
		text-align: center;
		padding: var(--space-8);
		color: var(--muted);
	}
</style>
