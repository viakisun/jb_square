<script lang="ts">
	/**
	 * Unified Crawler Config Component
	 * 통합 크롤러 설정 관리 컴포넌트
	 *
	 * Uses new unified /api/crawling/configs API
	 */

	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast';
	import { API_BASE_URL } from '$lib/config/api';

	interface CrawlerConfig {
		id: number;
		source_id: string;
		crawler_type: string;
		name: string;
		url: string | null;
		config_data: Record<string, any>;
		keywords: string[];
		date_range_days: number;
		enabled: boolean;
	}

	type Props = {
		sourceId: string; // 'source:jbtp:local', 'source:news:mfds', etc.
	};

	let { sourceId }: Props = $props();

	let config = $state<CrawlerConfig | null>(null);
	let loading = $state(false);
	let addingKeyword = $state(false);
	let newKeyword = $state('');

	const API_ENDPOINT = `${API_BASE_URL}/crawling/configs/${sourceId}`;

	onMount(() => {
		loadConfig();
	});

	async function loadConfig() {
		loading = true;
		try {
			const res = await fetch(API_ENDPOINT);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			config = await res.json();
		} catch (error) {
			console.error('Failed to load config:', error);
			toast.error('설정을 불러오는데 실패했습니다');
		} finally {
			loading = false;
		}
	}

	async function updateConfig(updates: Partial<CrawlerConfig>) {
		try {
			const res = await fetch(API_ENDPOINT, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});

			if (res.ok) {
				config = await res.json();
				return true;
			} else {
				toast.error('설정 변경 실패');
				return false;
			}
		} catch (error) {
			console.error('Failed to update config:', error);
			toast.error('설정 변경 실패');
			return false;
		}
	}

	async function addKeyword() {
		const keyword = newKeyword.trim();
		if (!keyword || !config) return;

		if (config.keywords.includes(keyword)) {
			toast.info('이미 추가된 키워드입니다');
			return;
		}

		const success = await updateConfig({
			keywords: [...config.keywords, keyword]
		});

		if (success) {
			newKeyword = '';
			addingKeyword = false;
			toast.success('키워드가 추가되었습니다');
		}
	}

	async function removeKeyword(keyword: string) {
		if (!config) return;

		const success = await updateConfig({
			keywords: config.keywords.filter((k) => k !== keyword)
		});

		if (success) {
			toast.success('키워드가 삭제되었습니다');
		}
	}

	async function updateDateRange(days: number) {
		const success = await updateConfig({ date_range_days: days });
		if (success) {
			toast.success(`검색 기간이 ${days}일로 변경되었습니다`);
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addKeyword();
		} else if (event.key === 'Escape') {
			addingKeyword = false;
			newKeyword = '';
		}
	}
</script>

<details class="crawler-config" open>
	<summary class="config-summary">
		<h3 class="config-title">크롤링 설정</h3>
	</summary>

	{#if loading}
		<div class="loading">설정을 불러오는 중...</div>
	{:else if config}
		<div class="config-content">
			<!-- Config Info -->
			<div class="config-row">
				<span class="config-label">소스 ID</span>
				<span class="config-value">{config.source_id}</span>
			</div>

			<!-- URL (if exists) -->
			{#if config.url}
				<div class="config-row">
					<span class="config-label">URL</span>
					<a
						href={config.url}
						target="_blank"
						rel="noopener noreferrer"
						class="config-link"
					>
						{config.url}
					</a>
				</div>
			{/if}

			<!-- Date Range -->
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

			<!-- Keywords -->
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
							<button
								class="keyword-cancel"
								onclick={() => {
									addingKeyword = false;
									newKeyword = '';
								}}
							>
								✕
							</button>
						</div>
					{:else}
						<button class="keyword-add" onclick={() => (addingKeyword = true)}>
							+ 추가
						</button>
					{/if}
				</div>
			</div>

			<!-- Config Data (for debugging/advanced users) -->
			{#if Object.keys(config.config_data).length > 0}
				<details class="config-data-details">
					<summary>고급 설정</summary>
					<pre>{JSON.stringify(config.config_data, null, 2)}</pre>
				</details>
			{/if}
		</div>
	{:else}
		<div class="error">설정을 찾을 수 없습니다</div>
	{/if}
</details>

<style>
	.crawler-config {
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 16px;
		background: var(--card-bg);
		margin-bottom: 24px;
	}

	.config-summary {
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
	}

	.config-summary::-webkit-details-marker {
		display: none;
	}

	.config-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.loading,
	.error {
		padding: 24px;
		text-align: center;
		color: var(--text-muted);
	}

	.error {
		color: var(--error-color);
	}

	.config-content {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding-top: 16px;
	}

	.config-row {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.config-label {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.config-value {
		font-size: 14px;
		color: var(--text-primary);
		font-family: 'Monaco', 'Courier New', monospace;
	}

	.config-link {
		font-size: 13px;
		color: var(--primary-color);
		text-decoration: none;
		word-break: break-all;
	}

	.config-link:hover {
		text-decoration: underline;
	}

	.date-range-buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.date-range-btn {
		padding: 6px 12px;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: var(--bg-secondary);
		color: var(--text-primary);
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.date-range-btn:hover {
		background: var(--bg-hover);
		border-color: var(--primary-color);
	}

	.date-range-btn.active {
		background: var(--primary-color);
		color: white;
		border-color: var(--primary-color);
	}

	.keywords-container {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}

	.keyword-tag {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		background: var(--tag-bg);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		font-size: 13px;
		color: var(--text-primary);
	}

	.keyword-text {
		line-height: 1.4;
	}

	.keyword-remove {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		padding: 0;
		font-size: 14px;
		line-height: 1;
		transition: color 0.2s;
	}

	.keyword-remove:hover {
		color: var(--error-color);
	}

	.keyword-input-wrapper {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.keyword-input {
		padding: 4px 8px;
		border: 1px solid var(--primary-color);
		border-radius: 4px;
		font-size: 13px;
		outline: none;
		min-width: 120px;
	}

	.keyword-save,
	.keyword-cancel {
		padding: 4px 8px;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: var(--bg-secondary);
		cursor: pointer;
		font-size: 13px;
		line-height: 1;
		transition: all 0.2s;
	}

	.keyword-save {
		color: var(--success-color);
		border-color: var(--success-color);
	}

	.keyword-save:hover {
		background: var(--success-color);
		color: white;
	}

	.keyword-cancel {
		color: var(--error-color);
		border-color: var(--error-color);
	}

	.keyword-cancel:hover {
		background: var(--error-color);
		color: white;
	}

	.keyword-add {
		padding: 4px 10px;
		border: 1px dashed var(--border-color);
		border-radius: 4px;
		background: transparent;
		color: var(--text-muted);
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.keyword-add:hover {
		border-color: var(--primary-color);
		color: var(--primary-color);
		background: var(--bg-hover);
	}

	.config-data-details {
		margin-top: 8px;
		padding: 12px;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		background: var(--bg-secondary);
	}

	.config-data-details summary {
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		user-select: none;
	}

	.config-data-details pre {
		margin-top: 8px;
		padding: 8px;
		background: var(--bg-tertiary);
		border-radius: 4px;
		font-size: 12px;
		overflow-x: auto;
	}

	/* CSS Variables (adjust based on your theme) */
	:root {
		--border-color: #e5e7eb;
		--card-bg: #ffffff;
		--bg-secondary: #f9fafb;
		--bg-hover: #f3f4f6;
		--bg-tertiary: #f1f3f5;
		--text-primary: #111827;
		--text-muted: #6b7280;
		--primary-color: #3b82f6;
		--error-color: #ef4444;
		--success-color: #10b981;
		--tag-bg: #f3f4f6;
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		:root {
			--border-color: #374151;
			--card-bg: #1f2937;
			--bg-secondary: #111827;
			--bg-hover: #374151;
			--bg-tertiary: #0f172a;
			--text-primary: #f9fafb;
			--text-muted: #9ca3af;
			--tag-bg: #374151;
		}
	}
</style>
