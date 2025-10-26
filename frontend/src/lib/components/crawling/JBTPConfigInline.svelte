<script lang="ts">
	/**
	 * JBTP 크롤링 설정 인라인 관리
	 * 주소 + 키워드를 게시판별로 표시/관리
	 */

	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast';

	const API_BASE = 'http://localhost:8000/api';

	interface JBTPConfig {
		id: number;
		name: string;
		board_url: string;
		keywords: string[];
		date_range_days: number;
		enabled: boolean;
	}

	let configs = $state<JBTPConfig[]>([]);
	let loading = $state(false);
	let addingKeywordForId = $state<number | null>(null);
	let newKeywordInputs = $state<Record<number, string>>({});

	onMount(() => {
		loadConfigs();
	});

	async function loadConfigs() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE}/crawling/configs/jbtp/configs`);
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`);
			}
			const data = await res.json();
			configs = data.items || [];
		} catch (error) {
			console.error('Failed to load configs:', error);
			toast.error('설정을 불러오는데 실패했습니다');
		} finally {
			loading = false;
		}
	}

	async function addKeyword(configId: number) {
		const keyword = newKeywordInputs[configId]?.trim();
		if (!keyword) return;

		const config = configs.find((c) => c.id === configId);
		if (!config) return;

		// Check duplicate
		if (config.keywords.includes(keyword)) {
			toast.info('이미 추가된 키워드입니다');
			return;
		}

		// Update keywords
		const updatedKeywords = [...config.keywords, keyword];

		try {
			const res = await fetch(`${API_BASE}/crawling/configs/jbtp/configs/${configId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ keywords: updatedKeywords })
			});

			if (res.ok) {
				const updated = await res.json();
				configs = configs.map((c) => (c.id === configId ? updated : c));
				newKeywordInputs[configId] = '';
				addingKeywordForId = null;
				toast.success('키워드가 추가되었습니다');
			} else {
				toast.error('키워드 추가 실패');
			}
		} catch (error) {
			console.error('Failed to add keyword:', error);
			toast.error('키워드 추가 실패');
		}
	}

	async function removeKeyword(configId: number, keyword: string) {
		const config = configs.find((c) => c.id === configId);
		if (!config) return;

		const updatedKeywords = config.keywords.filter((k) => k !== keyword);

		try {
			const res = await fetch(`${API_BASE}/crawling/configs/jbtp/configs/${configId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ keywords: updatedKeywords })
			});

			if (res.ok) {
				const updated = await res.json();
				configs = configs.map((c) => (c.id === configId ? updated : c));
				toast.success('키워드가 삭제되었습니다');
			} else {
				toast.error('키워드 삭제 실패');
			}
		} catch (error) {
			console.error('Failed to remove keyword:', error);
			toast.error('키워드 삭제 실패');
		}
	}

	async function updateDateRange(configId: number, days: number) {
		try {
			const res = await fetch(`${API_BASE}/crawling/configs/jbtp/configs/${configId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ date_range_days: days })
			});

			if (res.ok) {
				const updated = await res.json();
				configs = configs.map((c) => (c.id === configId ? updated : c));
				toast.success(`검색 기간이 ${days}일로 변경되었습니다`);
			} else {
				toast.error('설정 변경 실패');
			}
		} catch (error) {
			console.error('Failed to update date range:', error);
			toast.error('설정 변경 실패');
		}
	}

	function getDateRangeLabel(days: number): string {
		if (days === 7) return '1주일';
		if (days === 30) return '1개월';
		if (days === 90) return '3개월';
		if (days === 180) return '6개월';
		return `${days}일`;
	}

	function startAddingKeyword(configId: number) {
		addingKeywordForId = configId;
		if (!newKeywordInputs[configId]) {
			newKeywordInputs[configId] = '';
		}
	}

	function cancelAddingKeyword() {
		addingKeywordForId = null;
	}

	function handleKeyPress(event: KeyboardEvent, configId: number) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addKeyword(configId);
		} else if (event.key === 'Escape') {
			cancelAddingKeyword();
		}
	}
</script>

<div class="jbtp-config">
	<h3 class="config-title">크롤링 설정</h3>

	{#if loading}
		<div class="loading">설정을 불러오는 중...</div>
	{:else}
		<div class="config-list">
			{#each configs as config (config.id)}
				<div class="config-item">
					<div class="config-header">
						<h4 class="board-name">{config.name}</h4>
						<span class="config-status" class:enabled={config.enabled}>
							{config.enabled ? '활성화' : '비활성화'}
						</span>
					</div>

					<div class="config-row">
						<span class="config-label">주소</span>
						<a href={config.board_url} target="_blank" rel="noopener noreferrer" class="board-url">
							{config.board_url}
						</a>
					</div>

					<div class="config-row">
						<span class="config-label">검색 기간</span>
						<div class="date-range-buttons">
							<button
								class="date-range-btn"
								class:active={config.date_range_days === 7}
								onclick={() => updateDateRange(config.id, 7)}
							>
								1주일
							</button>
							<button
								class="date-range-btn"
								class:active={config.date_range_days === 30}
								onclick={() => updateDateRange(config.id, 30)}
							>
								1개월
							</button>
							<button
								class="date-range-btn"
								class:active={config.date_range_days === 90}
								onclick={() => updateDateRange(config.id, 90)}
							>
								3개월
							</button>
							<button
								class="date-range-btn"
								class:active={config.date_range_days === 180}
								onclick={() => updateDateRange(config.id, 180)}
							>
								6개월
							</button>
						</div>
					</div>

					<div class="config-row">
						<span class="config-label">키워드</span>
						<div class="keywords-container">
							{#each config.keywords as keyword (keyword)}
								<div class="keyword-tag">
									<span class="keyword-text">{keyword}</span>
									<button
										class="keyword-remove"
										onclick={() => removeKeyword(config.id, keyword)}
										aria-label="키워드 삭제"
									>
										✕
									</button>
								</div>
							{/each}

							{#if addingKeywordForId === config.id}
								<div class="keyword-input-wrapper">
									<input
										type="text"
										class="keyword-input"
										placeholder="키워드 입력"
										bind:value={newKeywordInputs[config.id]}
										onkeydown={(e) => handleKeyPress(e, config.id)}
										autofocus
									/>
									<button class="keyword-save" onclick={() => addKeyword(config.id)}>✓</button>
									<button class="keyword-cancel" onclick={cancelAddingKeyword}>✕</button>
								</div>
							{:else}
								<button class="keyword-add" onclick={() => startAddingKeyword(config.id)}>
									+ 추가
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.jbtp-config {
		padding: var(--space-6);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
	}

	.config-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin: 0 0 var(--space-4) 0;
		letter-spacing: var(--tracking-tight);
	}

	.loading {
		padding: var(--space-4);
		text-align: center;
		color: var(--muted);
	}

	.config-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.config-item {
		padding: var(--space-4);
		border: var(--border-width) solid var(--hair);
		background-color: var(--surface-1);
	}

	.config-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-3);
	}

	.board-name {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin: 0;
	}

	.config-status {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border: var(--border-width) solid var(--hair);
		color: var(--muted);
	}

	.config-status.enabled {
		color: var(--fg);
		border-color: var(--fg);
	}

	.config-row {
		display: flex;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
		align-items: flex-start;
	}

	.config-row:last-child {
		margin-bottom: 0;
	}

	.config-label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		min-width: 60px;
		padding-top: var(--space-1);
	}

	.board-url {
		flex: 1;
		font-size: var(--text-sm);
		color: var(--fg);
		text-decoration: none;
		border-bottom: var(--border-width) solid var(--hair);
		padding-bottom: var(--space-1);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.board-url:hover {
		border-color: var(--fg);
	}

	.keywords-container {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}

	.keyword-tag {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.keyword-tag:hover {
		border-color: var(--muted);
	}

	.keyword-text {
		font-size: var(--text-sm);
		color: var(--fg);
	}

	.keyword-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		padding: 0;
		background: none;
		border: none;
		color: var(--muted);
		font-size: var(--text-xs);
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.keyword-remove:hover {
		color: var(--fg);
	}

	.keyword-add {
		padding: var(--space-1) var(--space-3);
		background: none;
		border: var(--border-width) dashed var(--hair);
		color: var(--muted);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.keyword-add:hover {
		border-color: var(--fg);
		color: var(--fg);
	}

	.keyword-input-wrapper {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.keyword-input {
		padding: var(--space-1) var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--fg);
		color: var(--fg);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		min-width: 120px;
	}

	.keyword-input:focus {
		outline: none;
	}

	.keyword-save,
	.keyword-cancel {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		background: none;
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.keyword-save:hover {
		border-color: var(--fg);
		background-color: var(--fg);
		color: var(--bg);
	}

	.keyword-cancel:hover {
		border-color: var(--muted);
		color: var(--muted);
	}

	/* Date Range Buttons */
	.date-range-buttons {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.date-range-btn {
		padding: var(--space-2) var(--space-4);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--muted);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.date-range-btn:hover {
		border-color: var(--muted);
		color: var(--fg);
	}

	.date-range-btn.active {
		background-color: var(--fg);
		border-color: var(--fg);
		color: var(--bg);
		font-weight: var(--font-semibold);
	}

	@media (max-width: 768px) {
		.config-row {
			flex-direction: column;
			gap: var(--space-2);
		}

		.config-label {
			min-width: auto;
		}
	}
</style>
