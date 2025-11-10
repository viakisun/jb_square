<script lang="ts">
	/**
	 * RSS 뉴스 크롤링 설정 인라인 관리
	 * 단일 RSS 소스 설정 관리
	 */

	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast';
	import { API_BASE_URL } from '$lib/config/api';

	interface RSSConfigItem {
		id: number;
		source_id: string;
		name: string;
		feed_url: string;
		keywords: string[];
		date_range_days: number;
		enabled: boolean;
	}

	interface Props {
		selectedSourceId: string;
	}

	let { selectedSourceId }: Props = $props();

	let config = $state<RSSConfigItem | null>(null);
	let loading = $state(false);
	let addingKeyword = $state(false);
	let newKeyword = $state('');

	// RSS 소스 정보
	const RSS_SOURCES: Record<string, { name: string; description: string }> = {
		'source:news:mfds': { name: '식약처', description: '식품의약품안전처 공지사항' },
		'source:news:mohw': { name: '복지부', description: '보건복지부 보도자료' }
	};

	// 추천 키워드
	const RECOMMENDED_KEYWORDS = [
		'바이오',
		'의약품',
		'생물학적제제',
		'임상시험',
		'허가',
		'승인',
		'생명공학',
		'R&D',
		'연구개발',
		'보건산업'
	];

	onMount(() => {
		loadConfig();
	});

	$effect(() => {
		// Reload config when source changes
		loadConfig();
	});

	async function loadConfig() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/rss/${selectedSourceId}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			config = data;
		} catch (error) {
			console.error('Failed to load config:', error);
			toast.error('설정을 불러오는데 실패했습니다');
		} finally {
			loading = false;
		}
	}

	async function updateConfig(updates: Partial<RSSConfigItem>) {
		if (!config) return null;

		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/rss/${config.source_id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});

			if (res.ok) {
				const updated = await res.json();
				config = updated;
				return updated;
			} else {
				toast.error('설정 업데이트 실패');
				return null;
			}
		} catch (error) {
			console.error('Failed to update config:', error);
			toast.error('설정 업데이트 실패');
			return null;
		}
	}

	async function addKeyword() {
		if (!config) return;

		const keyword = newKeyword.trim();
		if (!keyword) return;

		if (config.keywords.includes(keyword)) {
			toast.info('이미 추가된 키워드입니다');
			return;
		}

		const updatedKeywords = [...config.keywords, keyword];
		const updated = await updateConfig({ keywords: updatedKeywords });

		if (updated) {
			newKeyword = '';
			addingKeyword = false;
			toast.success('키워드가 추가되었습니다');
		}
	}

	async function removeKeyword(keyword: string) {
		if (!config) return;

		const updatedKeywords = config.keywords.filter((k) => k !== keyword);
		const updated = await updateConfig({ keywords: updatedKeywords });

		if (updated) {
			toast.success('키워드가 삭제되었습니다');
		}
	}

	async function updateDateRange(days: number) {
		if (!config) return;

		const updated = await updateConfig({ date_range_days: days });
		if (updated) {
			toast.success(`검색 기간이 ${days}일로 변경되었습니다`);
		}
	}

	async function toggleEnabled() {
		if (!config) return;

		const updated = await updateConfig({ enabled: !config.enabled });
		if (updated) {
			toast.success(updated.enabled ? '크롤링이 활성화되었습니다' : '크롤링이 비활성화되었습니다');
		}
	}

	async function addRecommendedKeywords() {
		if (!config) return;

		const newKeywords = RECOMMENDED_KEYWORDS.filter((k) => !config.keywords.includes(k));

		if (newKeywords.length === 0) {
			toast.info('이미 모든 추천 키워드가 추가되어 있습니다');
			return;
		}

		const updatedKeywords = [...config.keywords, ...newKeywords];
		const updated = await updateConfig({ keywords: updatedKeywords });

		if (updated) {
			toast.success(`${newKeywords.length}개의 키워드가 추가되었습니다`);
		}
	}
</script>

{#if loading}
	<div class="config-panel">
		<div class="loading-state">
			<div class="spinner"></div>
			<span class="loading-text">설정 로딩 중...</span>
		</div>
	</div>
{:else if config}
	<div class="config-panel">
		<div class="config-header">
			<div class="config-info">
				<h4 class="config-title">{config.name}</h4>
				<p class="config-description">
					{RSS_SOURCES[config.source_id]?.description}
				</p>
				<p class="config-feed-url">
					{config.feed_url}
				</p>
			</div>
			<button onclick={toggleEnabled} class="toggle-button {config.enabled ? 'enabled' : ''}">
				{config.enabled ? '활성화됨' : '비활성화됨'}
			</button>
		</div>

		<!-- 검색 기간 설정 -->
		<div class="date-range-section">
			<label class="section-label">검색 기간</label>
			<div class="date-range-buttons">
				{#each [7, 15, 30, 60, 90] as days}
					<button
						onclick={() => updateDateRange(days)}
						class="date-button {config.date_range_days === days ? 'active' : ''}"
					>
						{days}일
					</button>
				{/each}
			</div>
		</div>

		<!-- 키워드 관리 -->
		<div class="keywords-section">
			<div class="keywords-header">
				<label class="section-label">필터링 키워드</label>
				<button onclick={addRecommendedKeywords} class="add-recommended-btn">
					+ 추천 키워드 일괄 추가
				</button>
			</div>

			<!-- 키워드 목록 -->
			<div class="keywords-list">
				{#each config.keywords as keyword}
					<div class="keyword-tag">
						<span>{keyword}</span>
						<button onclick={() => removeKeyword(keyword)} class="remove-btn">
							<svg class="icon" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</div>
				{/each}

				{#if config.keywords.length === 0}
					<p class="empty-message">키워드를 추가하지 않으면 모든 뉴스가 수집됩니다</p>
				{/if}
			</div>

			<!-- 키워드 추가 -->
			{#if addingKeyword}
				<div class="add-keyword-form">
					<input
						type="text"
						bind:value={newKeyword}
						placeholder="키워드 입력..."
						class="keyword-input"
						onkeydown={(e) => {
							if (e.key === 'Enter') addKeyword();
							if (e.key === 'Escape') addingKeyword = false;
						}}
					/>
					<button onclick={addKeyword} class="form-button primary">추가</button>
					<button
						onclick={() => {
							addingKeyword = false;
							newKeyword = '';
						}}
						class="form-button secondary"
					>
						취소
					</button>
				</div>
			{:else}
				<button onclick={() => (addingKeyword = true)} class="add-keyword-btn">
					+ 키워드 추가
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.config-panel {
		background: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-8);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 2px solid var(--hair);
		border-top-color: var(--fg);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		color: var(--muted);
		font-size: var(--text-sm);
	}

	.config-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.config-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.config-title {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.config-description {
		font-size: var(--text-sm);
		color: var(--muted);
	}

	.config-feed-url {
		font-size: var(--text-xs);
		color: var(--muted);
		font-family: var(--font-mono);
	}

	.toggle-button {
		padding: var(--space-2) var(--space-4);
		background: var(--surface-2);
		border: var(--border-width) solid var(--hair);
		color: var(--muted);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all 0.2s;
	}

	.toggle-button:hover {
		background: var(--surface-3);
	}

	.toggle-button.enabled {
		background: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	.date-range-section,
	.keywords-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.section-label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
	}

	.date-range-buttons {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.date-button {
		padding: var(--space-2) var(--space-4);
		background: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		color: var(--muted);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all 0.2s;
	}

	.date-button:hover {
		background: var(--surface-2);
		color: var(--fg);
	}

	.date-button.active {
		background: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	.keywords-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.add-recommended-btn {
		font-size: var(--text-xs);
		color: var(--fg);
		background: none;
		border: none;
		cursor: pointer;
		font-weight: var(--font-medium);
		transition: opacity 0.2s;
	}

	.add-recommended-btn:hover {
		opacity: 0.7;
	}

	.keywords-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.keyword-tag {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-3);
		background: var(--fg);
		color: var(--bg);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
	}

	.remove-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--bg);
		display: flex;
		align-items: center;
		transition: opacity 0.2s;
	}

	.remove-btn:hover {
		opacity: 0.7;
	}

	.icon {
		width: 14px;
		height: 14px;
	}

	.empty-message {
		font-size: var(--text-sm);
		color: var(--muted);
		font-style: italic;
	}

	.add-keyword-form {
		display: flex;
		gap: var(--space-2);
	}

	.keyword-input {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-sm);
	}

	.keyword-input:focus {
		outline: none;
		border-color: var(--fg);
	}

	.form-button {
		padding: var(--space-2) var(--space-4);
		border: var(--border-width) solid var(--hair);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all 0.2s;
	}

	.form-button.primary {
		background: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	.form-button.primary:hover {
		opacity: 0.9;
	}

	.form-button.secondary {
		background: var(--surface-2);
		color: var(--muted);
	}

	.form-button.secondary:hover {
		background: var(--surface-3);
		color: var(--fg);
	}

	.add-keyword-btn {
		width: 100%;
		padding: var(--space-3);
		background: var(--bg);
		border: 2px dashed var(--hair);
		color: var(--muted);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-keyword-btn:hover {
		border-color: var(--fg);
		color: var(--fg);
	}

	@media (max-width: 768px) {
		.config-header {
			flex-direction: column;
		}

		.toggle-button {
			align-self: flex-start;
		}

		.date-range-buttons {
			flex-direction: column;
		}

		.add-keyword-form {
			flex-direction: column;
		}
	}
</style>
