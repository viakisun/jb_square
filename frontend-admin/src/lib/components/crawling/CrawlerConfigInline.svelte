<script lang="ts">
	/**
	 * 통합 크롤러 설정 인라인 관리 컴포넌트
	 * NTIS, JBTP, Bizinfo, RSS 등 모든 크롤러 설정을 단일 컴포넌트로 관리
	 */

	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast';
	import { API_BASE_URL } from '$lib/config/api';

	interface SimpleConfig {
		keywords: string[];
		date_range_days: number;
	}

	interface BoardConfig {
		id: number;
		name: string;
		board_url: string;
		keywords: string[];
		date_range_days: number;
		enabled: boolean;
	}

	type Props = {
		/**
		 * 크롤러 타입 ('ntis' | 'bizinfo' | 'jbtp' | 'rss')
		 */
		crawlerType: 'ntis' | 'bizinfo' | 'jbtp' | 'rss';

		/**
		 * JBTP용 설정 타입 ('notices' | 'external_notices' | 'events')
		 */
		configType?: 'notices' | 'external_notices' | 'events';

		/**
		 * RSS용 소스 ID ('source:news:mfds' | 'source:news:mohw')
		 */
		sourceId?: string;
	};

	let { crawlerType, configType = 'notices', sourceId = '' }: Props = $props();

	// Simple config (NTIS, Bizinfo)
	let simpleConfig = $state<SimpleConfig>({
		keywords: [],
		date_range_days: 30
	});

	// Board configs (JBTP)
	let boardConfigs = $state<BoardConfig[]>([]);

	// RSS config
	let rssConfig = $state<any>(null);

	let loading = $state(false);
	let addingKeyword = $state(false);
	let addingKeywordForId = $state<number | null>(null);
	let newKeyword = $state('');
	let newKeywordInputs = $state<Record<number, string>>({});

	const API_ENDPOINTS = {
		ntis: {
			get: `${API_BASE_URL}/crawling/configs/ntis/config`,
			put: `${API_BASE_URL}/crawling/configs/ntis/config`
		},
		bizinfo: {
			get: `${API_BASE_URL}/crawling/configs/bizinfo/config`,
			put: `${API_BASE_URL}/crawling/configs/bizinfo/config`
		},
		jbtp: {
			get: (type: string) => `${API_BASE_URL}/crawling/configs/jbtp/configs?config_type=${type}`,
			put: (id: number) => `${API_BASE_URL}/crawling/configs/jbtp/configs/${id}`
		},
		rss: {
			get: (sid: string) => `${API_BASE_URL}/crawling/configs/rss/${sid}`,
			put: (sid: string) => `${API_BASE_URL}/crawling/configs/rss/${sid}`
		}
	};

	onMount(() => {
		loadConfig();
	});

	async function loadConfig() {
		loading = true;
		try {
			if (crawlerType === 'jbtp') {
				const res = await fetch(API_ENDPOINTS.jbtp.get(configType));
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const data = await res.json();
				boardConfigs = data.items || [];
			} else if (crawlerType === 'rss') {
				const res = await fetch(API_ENDPOINTS.rss.get(sourceId));
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				rssConfig = await res.json();
			} else {
				const res = await fetch(API_ENDPOINTS[crawlerType].get);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				simpleConfig = await res.json();
			}
		} catch (error) {
			console.error('Failed to load config:', error);
			toast.error('설정을 불러오는데 실패했습니다');
		} finally {
			loading = false;
		}
	}

	// Simple config functions
	async function addKeywordSimple() {
		const keyword = newKeyword.trim();
		if (!keyword) return;

		if (simpleConfig.keywords.includes(keyword)) {
			toast.info('이미 추가된 키워드입니다');
			return;
		}

		const updatedKeywords = [...simpleConfig.keywords, keyword];

		try {
			const res = await fetch(API_ENDPOINTS[crawlerType].put, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ keywords: updatedKeywords })
			});

			if (res.ok) {
				simpleConfig = await res.json();
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

	async function removeKeywordSimple(keyword: string) {
		const updatedKeywords = simpleConfig.keywords.filter((k) => k !== keyword);

		try {
			const res = await fetch(API_ENDPOINTS[crawlerType].put, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ keywords: updatedKeywords })
			});

			if (res.ok) {
				simpleConfig = await res.json();
				toast.success('키워드가 삭제되었습니다');
			} else {
				toast.error('키워드 삭제 실패');
			}
		} catch (error) {
			console.error('Failed to remove keyword:', error);
			toast.error('키워드 삭제 실패');
		}
	}

	async function updateDateRangeSimple(days: number) {
		try {
			const res = await fetch(API_ENDPOINTS[crawlerType].put, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ date_range_days: days })
			});

			if (res.ok) {
				simpleConfig = await res.json();
				toast.success(`검색 기간이 ${days}일로 변경되었습니다`);
			} else {
				toast.error('설정 변경 실패');
			}
		} catch (error) {
			console.error('Failed to update date range:', error);
			toast.error('설정 변경 실패');
		}
	}

	// Board config functions (JBTP)
	async function addKeywordBoard(boardId: number) {
		const keyword = newKeywordInputs[boardId]?.trim();
		if (!keyword) return;

		const config = boardConfigs.find((c) => c.id === boardId);
		if (!config) return;

		if (config.keywords.includes(keyword)) {
			toast.info('이미 추가된 키워드입니다');
			return;
		}

		const updatedKeywords = [...config.keywords, keyword];

		try {
			const res = await fetch(API_ENDPOINTS.jbtp.put(boardId), {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ keywords: updatedKeywords })
			});

			if (res.ok) {
				const updated = await res.json();
				boardConfigs = boardConfigs.map((c) => (c.id === boardId ? updated : c));
				newKeywordInputs[boardId] = '';
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

	async function removeKeywordBoard(boardId: number, keyword: string) {
		const config = boardConfigs.find((c) => c.id === boardId);
		if (!config) return;

		const updatedKeywords = config.keywords.filter((k) => k !== keyword);

		try {
			const res = await fetch(API_ENDPOINTS.jbtp.put(boardId), {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ keywords: updatedKeywords })
			});

			if (res.ok) {
				const updated = await res.json();
				boardConfigs = boardConfigs.map((c) => (c.id === boardId ? updated : c));
				toast.success('키워드가 삭제되었습니다');
			} else {
				toast.error('키워드 삭제 실패');
			}
		} catch (error) {
			console.error('Failed to remove keyword:', error);
			toast.error('키워드 삭제 실패');
		}
	}

	async function updateDateRangeBoard(boardId: number, days: number) {
		try {
			const res = await fetch(API_ENDPOINTS.jbtp.put(boardId), {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ date_range_days: days })
			});

			if (res.ok) {
				const updated = await res.json();
				boardConfigs = boardConfigs.map((c) => (c.id === boardId ? updated : c));
				toast.success(`검색 기간이 ${days}일로 변경되었습니다`);
			} else {
				toast.error('설정 변경 실패');
			}
		} catch (error) {
			console.error('Failed to update date range:', error);
			toast.error('설정 변경 실패');
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
			addKeywordSimple();
		} else if (event.key === 'Escape') {
			cancelAddingKeyword();
		}
	}

	function handleKeyPressBoard(event: KeyboardEvent, boardId: number) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addKeywordBoard(boardId);
		} else if (event.key === 'Escape') {
			addingKeywordForId = null;
			newKeywordInputs[boardId] = '';
		}
	}
</script>

<details class="crawler-config">
	<summary class="config-summary">
		<h3 class="config-title">크롤링 설정</h3>
	</summary>

	{#if loading}
		<div class="loading">설정을 불러오는 중...</div>
	{:else if crawlerType === 'jbtp'}
		<!-- JBTP Board Configs -->
		<div class="config-list">
			{#each boardConfigs as config (config.id)}
				<div class="config-item">
					<div class="config-header-board">
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
								onclick={() => updateDateRangeBoard(config.id, 7)}
							>
								1주일
							</button>
							<button
								class="date-range-btn"
								class:active={config.date_range_days === 30}
								onclick={() => updateDateRangeBoard(config.id, 30)}
							>
								1개월
							</button>
							<button
								class="date-range-btn"
								class:active={config.date_range_days === 90}
								onclick={() => updateDateRangeBoard(config.id, 90)}
							>
								3개월
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
										onclick={() => removeKeywordBoard(config.id, keyword)}
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
										onkeydown={(e) => handleKeyPressBoard(e, config.id)}
										autofocus
									/>
									<button class="keyword-save" onclick={() => addKeywordBoard(config.id)}>✓</button>
									<button class="keyword-cancel" onclick={() => { addingKeywordForId = null; newKeywordInputs[config.id] = ''; }}>✕</button>
								</div>
							{:else}
								<button class="keyword-add" onclick={() => addingKeywordForId = config.id}>+ 추가</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Simple Config (NTIS, Bizinfo) -->
		<div class="config-content">
			<div class="config-row">
				<span class="config-label">검색 기간</span>
				<div class="date-range-buttons">
					<button
						class="date-range-btn"
						class:active={simpleConfig.date_range_days === 7}
						onclick={() => updateDateRangeSimple(7)}
					>
						1주일
					</button>
					<button
						class="date-range-btn"
						class:active={simpleConfig.date_range_days === 30}
						onclick={() => updateDateRangeSimple(30)}
					>
						1개월
					</button>
					<button
						class="date-range-btn"
						class:active={simpleConfig.date_range_days === 90}
						onclick={() => updateDateRangeSimple(90)}
					>
						3개월
					</button>
					<button
						class="date-range-btn"
						class:active={simpleConfig.date_range_days === 180}
						onclick={() => updateDateRangeSimple(180)}
					>
						6개월
					</button>
				</div>
			</div>

			<div class="config-row">
				<span class="config-label">키워드</span>
				<div class="keywords-container">
					{#each simpleConfig.keywords as keyword (keyword)}
						<div class="keyword-tag">
							<span class="keyword-text">{keyword}</span>
							<button
								class="keyword-remove"
								onclick={() => removeKeywordSimple(keyword)}
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
							<button class="keyword-save" onclick={addKeywordSimple}>✓</button>
							<button class="keyword-cancel" onclick={cancelAddingKeyword}>✕</button>
						</div>
					{:else}
						<button class="keyword-add" onclick={startAddingKeyword}>+ 추가</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</details>

<style>
	.crawler-config {
		padding: var(--space-6);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		margin-bottom: var(--space-6);
	}

	.config-summary {
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0;
	}

	.config-summary::-webkit-details-marker {
		display: none;
	}

	.config-summary::before {
		content: '▶';
		margin-right: var(--space-2);
		transition: transform var(--duration-fast);
		display: inline-block;
		font-size: var(--text-xs);
	}

	details[open] .config-summary::before {
		transform: rotate(90deg);
	}

	details[open] .config-summary {
		margin-bottom: var(--space-4);
	}

	details:not([open]) .config-summary {
		margin-bottom: 0;
	}

	.config-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin: 0;
		letter-spacing: var(--tracking-tight);
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

	.config-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.config-item {
		padding: var(--space-4);
		border: var(--border-width) solid var(--hair);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.config-header-board {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
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
		border: var(--border-width) solid var(--muted);
		color: var(--muted);
	}

	.config-status.enabled {
		border-color: var(--fg);
		color: var(--fg);
	}

	.board-url {
		font-size: var(--text-sm);
		color: var(--muted);
		text-decoration: none;
		word-break: break-all;
	}

	.board-url:hover {
		color: var(--fg);
		text-decoration: underline;
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
		.config-summary {
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
