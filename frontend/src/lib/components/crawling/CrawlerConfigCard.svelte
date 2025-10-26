<script lang="ts">
	/**
	 * 크롤링 설정 통합 카드
	 * 소스 정보 + 설정 관리 + 크롤링 실행을 하나의 카드로
	 */

	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/buttons';
	import { toast } from '$lib/stores/toast';

	interface Props {
		sourceType: 'jbtp' | 'ntis' | 'bizinfo';
		sourceName: string;
		onCrawl: () => void;
		crawling?: boolean;
	}

	let { sourceType, sourceName, onCrawl, crawling = false }: Props = $props();

	const API_BASE = 'http://localhost:8000/api';

	interface JBTPConfig {
		id: number;
		name: string;
		board_url: string;
		keywords: string[];
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
			let endpoint = '';
			if (sourceType === 'jbtp') {
				endpoint = `${API_BASE}/crawling/configs/jbtp/configs`;
			} else if (sourceType === 'ntis') {
				endpoint = `${API_BASE}/crawling/configs/ntis/config`;
			} else if (sourceType === 'bizinfo') {
				endpoint = `${API_BASE}/crawling/configs/bizinfo/config`;
			}

			const res = await fetch(endpoint);
			const data = await res.json();

			// Handle different response formats
			if (sourceType === 'jbtp') {
				// Filter out "채용공고" board from JBTP configs
				configs = (data.items || []).filter((c: JBTPConfig) => c.name !== '채용공고');
			} else {
				// NTIS and Bizinfo return single config object, wrap in array
				configs = data ? [data] : [];
			}
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

		if (config.keywords.includes(keyword)) {
			toast.info('이미 추가된 키워드입니다');
			return;
		}

		const updatedKeywords = [...config.keywords, keyword];

		try {
			let endpoint = '';
			if (sourceType === 'jbtp') {
				endpoint = `${API_BASE}/crawling/configs/jbtp/configs/${configId}`;
			} else if (sourceType === 'ntis') {
				endpoint = `${API_BASE}/crawling/configs/ntis/config`;
			} else if (sourceType === 'bizinfo') {
				endpoint = `${API_BASE}/crawling/configs/bizinfo/config`;
			}

			const body =
				sourceType === 'jbtp'
					? { keywords: updatedKeywords }
					: { search_keywords: updatedKeywords };

			const res = await fetch(endpoint, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (res.ok) {
				const updated = await res.json();
				if (sourceType === 'jbtp') {
					configs = configs.map((c) => (c.id === configId ? updated : c));
				} else {
					configs = [updated];
				}
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
			let endpoint = '';
			if (sourceType === 'jbtp') {
				endpoint = `${API_BASE}/crawling/configs/jbtp/configs/${configId}`;
			} else if (sourceType === 'ntis') {
				endpoint = `${API_BASE}/crawling/configs/ntis/config`;
			} else if (sourceType === 'bizinfo') {
				endpoint = `${API_BASE}/crawling/configs/bizinfo/config`;
			}

			const body =
				sourceType === 'jbtp'
					? { keywords: updatedKeywords }
					: { search_keywords: updatedKeywords };

			const res = await fetch(endpoint, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			if (res.ok) {
				const updated = await res.json();
				if (sourceType === 'jbtp') {
					configs = configs.map((c) => (c.id === configId ? updated : c));
				} else {
					configs = [updated];
				}
				toast.success('키워드가 삭제되었습니다');
			} else {
				toast.error('키워드 삭제 실패');
			}
		} catch (error) {
			console.error('Failed to remove keyword:', error);
			toast.error('키워드 삭제 실패');
		}
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

<div class="crawler-card">
	<div class="card-header">
		<div class="header-left">
			<h2 class="card-title">{sourceName}</h2>
			<span class="config-count">{configs.length}개 게시판</span>
		</div>
		<div class="header-right">
			<Button variant="primary" onclick={onCrawl} disabled={crawling || loading}>
				{crawling ? '크롤링 중...' : '크롤링 시작'}
			</Button>
		</div>
	</div>

	{#if loading}
		<div class="card-body">
			<div class="loading-state">설정을 불러오는 중...</div>
		</div>
	{:else if configs.length === 0}
		<div class="card-body">
			<div class="empty-state">설정된 크롤링 소스가 없습니다.</div>
		</div>
	{:else}
		<div class="card-body">
			<div class="boards-grid">
				{#each configs as config (config.id)}
					<div class="board-card" class:disabled={!config.enabled}>
						<div class="board-header">
							<h3 class="board-name">{config.name}</h3>
							<span class="board-status" class:active={config.enabled}>
								{config.enabled ? '활성' : '비활성'}
							</span>
						</div>

						<div class="board-url-section">
							<span class="section-label">URL</span>
							<a
								href={config.board_url}
								target="_blank"
								rel="noopener noreferrer"
								class="board-url"
							>
								{config.board_url}
							</a>
						</div>

						<div class="board-keywords-section">
							<span class="section-label">키워드</span>
							<div class="keywords-area">
								{#if config.keywords.length === 0 && addingKeywordForId !== config.id}
									<span class="no-keywords">키워드 없음</span>
								{/if}

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
									<div class="keyword-input-group">
										<input
											type="text"
											class="keyword-input"
											placeholder="키워드 입력"
											bind:value={newKeywordInputs[config.id]}
											onkeydown={(e) => handleKeyPress(e, config.id)}
											autofocus
										/>
										<button class="keyword-save-btn" onclick={() => addKeyword(config.id)}>
											✓
										</button>
										<button class="keyword-cancel-btn" onclick={cancelAddingKeyword}>✕</button>
									</div>
								{:else}
									<button class="keyword-add-btn" onclick={() => startAddingKeyword(config.id)}>
										+ 추가
									</button>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	/* ========================================
     CRAWLER CARD
     ======================================== */

	.crawler-card {
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: box-shadow var(--duration-normal) var(--ease-out);
	}

	.crawler-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	/* ========================================
     CARD HEADER
     ======================================== */

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-6);
		border-bottom: var(--border-width) solid var(--hair);
		background: linear-gradient(to bottom, var(--surface-1), var(--bg));
	}

	.header-left {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
	}

	.card-title {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--fg);
		letter-spacing: var(--tracking-tight);
		margin: 0;
		text-transform: uppercase;
	}

	.config-count {
		font-size: var(--text-sm);
		color: var(--muted);
		padding: var(--space-1) var(--space-3);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	.header-right {
		display: flex;
		gap: var(--space-3);
	}

	/* ========================================
     CARD BODY
     ======================================== */

	.card-body {
		padding: var(--space-6);
	}

	.loading-state,
	.empty-state {
		padding: var(--space-8);
		text-align: center;
		color: var(--muted);
		font-size: var(--text-sm);
	}

	/* ========================================
     BOARDS GRID
     ======================================== */

	.boards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--space-4);
	}

	.board-card {
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.board-card:hover {
		border-color: var(--muted);
		background-color: var(--bg);
	}

	.board-card.disabled {
		opacity: 0.6;
	}

	/* ========================================
     BOARD HEADER
     ======================================== */

	.board-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-3);
		padding-bottom: var(--space-3);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.board-name {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin: 0;
	}

	.board-status {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border: var(--border-width) solid var(--hair);
		color: var(--muted);
		text-transform: uppercase;
	}

	.board-status.active {
		color: var(--fg);
		border-color: var(--fg);
	}

	/* ========================================
     BOARD SECTIONS
     ======================================== */

	.board-url-section,
	.board-keywords-section {
		margin-bottom: var(--space-3);
	}

	.board-keywords-section {
		margin-bottom: 0;
	}

	.section-label {
		display: block;
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-2);
	}

	.board-url {
		display: block;
		font-size: var(--text-sm);
		color: var(--fg);
		text-decoration: none;
		padding: var(--space-2) var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		transition: all var(--duration-fast) var(--ease-out);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.board-url:hover {
		border-color: var(--fg);
		background-color: var(--surface-1);
	}

	/* ========================================
     KEYWORDS AREA
     ======================================== */

	.keywords-area {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		min-height: 32px;
	}

	.no-keywords {
		font-size: var(--text-xs);
		color: var(--muted);
		font-style: italic;
	}

	.keyword-tag {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.keyword-tag:hover {
		border-color: var(--muted);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.keyword-text {
		font-size: var(--text-sm);
		color: var(--fg);
		font-weight: var(--font-medium);
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

	/* ========================================
     KEYWORD INPUT
     ======================================== */

	.keyword-input-group {
		display: flex;
		gap: var(--space-2);
		align-items: center;
	}

	.keyword-input {
		padding: var(--space-2) var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--fg);
		color: var(--fg);
		font-size: var(--text-sm);
		font-family: var(--font-sans);
		min-width: 140px;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.keyword-input:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
	}

	.keyword-save-btn,
	.keyword-cancel-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		background: none;
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.keyword-save-btn:hover {
		border-color: var(--fg);
		background-color: var(--fg);
		color: var(--bg);
	}

	.keyword-cancel-btn:hover {
		border-color: var(--muted);
		background-color: var(--surface-1);
	}

	.keyword-add-btn {
		padding: var(--space-1) var(--space-3);
		background: none;
		border: var(--border-width) dashed var(--hair);
		color: var(--muted);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.keyword-add-btn:hover {
		border-color: var(--fg);
		border-style: solid;
		color: var(--fg);
		background-color: var(--surface-1);
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 768px) {
		.card-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-4);
		}

		.header-right {
			width: 100%;
		}

		.header-right :global(button) {
			width: 100%;
		}

		.boards-grid {
			grid-template-columns: 1fr;
		}
	}
</style>