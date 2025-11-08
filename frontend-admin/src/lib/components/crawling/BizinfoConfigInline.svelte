<script lang="ts">
	/**
	 * Bizinfo 크롤링 설정 인라인 관리
	 * 기업마당 API 키워드 필터링 설정
	 */

	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast';
	import { API_BASE_URL } from '$lib/config/api';

	interface BizinfoConfig {
		keywords: string[];
		date_range_days: number;
	}

	let config = $state<BizinfoConfig>({
		keywords: [],
		date_range_days: 30
	});

	let loading = $state(false);
	let addingKeyword = $state(false);
	let newKeyword = $state('');

	// 추천 바이오 키워드
	const RECOMMENDED_KEYWORDS = [
		'바이오',
		'생명공학',
		'제약',
		'의약품',
		'백신',
		'진단',
		'유전자',
		'세포',
		'항체',
		'신약'
	];

	onMount(() => {
		loadConfig();
	});

	async function loadConfig() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/bizinfo/config`);
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`);
			}
			const data = await res.json();
			config = data;
		} catch (error) {
			console.error('Failed to load config:', error);
			toast.error('설정을 불러오는데 실패했습니다');
		} finally {
			loading = false;
		}
	}

	async function addKeyword() {
		const keyword = newKeyword.trim();
		if (!keyword) return;

		// Check duplicate
		if (config.keywords.includes(keyword)) {
			toast.info('이미 추가된 키워드입니다');
			return;
		}

		// Update keywords
		const updatedKeywords = [...config.keywords, keyword];

		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/bizinfo/config`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ search_keywords: updatedKeywords })
			});

			if (res.ok) {
				const updated = await res.json();
				config = updated;
				newKeyword = '';
				addingKeyword = false;
				toast.success('키워드가 추가되었습니다');
			} else {
				toast.error('키워드 추가 실패');
			}
		} catch (error) {
			console.error('Failed to add keyword:', error);
			toast.error('키워드 추가 실패');
		}
	}

	async function removeKeyword(keyword: string) {
		const updatedKeywords = config.keywords.filter((k) => k !== keyword);

		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/bizinfo/config`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ search_keywords: updatedKeywords })
			});

			if (res.ok) {
				const updated = await res.json();
				config = updated;
				toast.success('키워드가 삭제되었습니다');
			} else {
				toast.error('키워드 삭제 실패');
			}
		} catch (error) {
			console.error('Failed to remove keyword:', error);
			toast.error('키워드 삭제 실패');
		}
	}

	async function updateDateRange(days: number) {
		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/bizinfo/config`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ date_range_days: days })
			});

			if (res.ok) {
				const updated = await res.json();
				config = updated;
				toast.success(`검색 기간이 ${days}일로 변경되었습니다`);
			} else {
				toast.error('설정 변경 실패');
			}
		} catch (error) {
			console.error('Failed to update date range:', error);
			toast.error('설정 변경 실패');
		}
	}

	async function addRecommendedKeywords() {
		const newKeywords = RECOMMENDED_KEYWORDS.filter((k) => !config.keywords.includes(k));

		if (newKeywords.length === 0) {
			toast.info('이미 모든 추천 키워드가 추가되어 있습니다');
			return;
		}

		const updatedKeywords = [...config.keywords, ...newKeywords];

		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/bizinfo/config`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ search_keywords: updatedKeywords })
			});

			if (res.ok) {
				const updated = await res.json();
				config = updated;
				toast.success(`${newKeywords.length}개의 추천 키워드가 추가되었습니다`);
			} else {
				toast.error('키워드 추가 실패');
			}
		} catch (error) {
			console.error('Failed to add recommended keywords:', error);
			toast.error('키워드 추가 실패');
		}
	}

	function startAddingKeyword() {
		addingKeyword = true;
	}

	function cancelAddingKeyword() {
		addingKeyword = false;
		newKeyword = '';
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addKeyword();
		} else if (event.key === 'Escape') {
			cancelAddingKeyword();
		}
	}
</script>

<div class="bizinfo-config">
	<div class="config-header">
		<h3 class="config-title">크롤링 설정</h3>
		<button class="btn-recommended" onclick={addRecommendedKeywords} type="button">
			추천 바이오 키워드 추가
		</button>
	</div>

	{#if loading}
		<div class="loading">설정을 불러오는 중...</div>
	{:else}
		<div class="config-content">
			<div class="config-row">
				<span class="config-label">검색 기간</span>
				<div class="date-range-buttons">
					<button
						class="date-range-btn"
						class:active={config.date_range_days === 7}
						onclick={() => updateDateRange(7)}
					>
						1주일
					</button>
					<button
						class="date-range-btn"
						class:active={config.date_range_days === 30}
						onclick={() => updateDateRange(30)}
					>
						1개월
					</button>
					<button
						class="date-range-btn"
						class:active={config.date_range_days === 90}
						onclick={() => updateDateRange(90)}
					>
						3개월
					</button>
					<button
						class="date-range-btn"
						class:active={config.date_range_days === 180}
						onclick={() => updateDateRange(180)}
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
								onclick={() => removeKeyword(keyword)}
								aria-label="키워드 삭제"
							>
								✕
							</button>
						</div>
					{/each}

					{#if addingKeyword}
						<div class="keyword-input-wrapper">
							<input
								type="text"
								class="keyword-input"
								placeholder="키워드 입력"
								bind:value={newKeyword}
								onkeydown={handleKeyPress}
								autofocus
							/>
							<button class="keyword-save" onclick={addKeyword}>✓</button>
							<button class="keyword-cancel" onclick={cancelAddingKeyword}>✕</button>
						</div>
					{:else}
						<button class="keyword-add" onclick={startAddingKeyword}>+ 추가</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.bizinfo-config {
		padding: var(--space-6);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		margin-bottom: var(--space-6);
	}

	.config-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}

	.config-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin: 0;
		letter-spacing: var(--tracking-tight);
	}

	.btn-recommended {
		padding: var(--space-2) var(--space-4);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.btn-recommended:hover {
		border-color: var(--fg);
		background-color: var(--fg);
		color: var(--bg);
	}

	.loading {
		padding: var(--space-4);
		text-align: center;
		color: var(--muted);
	}

	.config-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.config-row {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
	}

	.config-label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		min-width: 60px;
		padding-top: var(--space-1);
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
		.config-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-3);
		}

		.config-row {
			flex-direction: column;
			gap: var(--space-2);
		}

		.config-label {
			min-width: auto;
		}
	}
</style>
