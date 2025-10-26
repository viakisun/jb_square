<script lang="ts">
	/**
	 * 크롤링 소스 정보 패널
	 * 각 페이지에 표시되는 크롤링 소스 정보
	 */
	import { onMount } from 'svelte';

	interface Props {
		sourceIds: string[]; // 표시할 소스 ID 배열 (예: ['jbtp', 'binet'])
		title?: string;
	}

	let { sourceIds, title = '크롤링 소스 정보' }: Props = $props();

	interface SourceInfo {
		id: string;
		name: string;
		configs: any[];
		loading: boolean;
	}

	const API_BASE = 'http://localhost:8000/api';

	let sources = $state<SourceInfo[]>([]);

	onMount(async () => {
		await loadAllSources();
	});

	async function loadAllSources() {
		for (const sourceId of sourceIds) {
			const sourceInfo: SourceInfo = {
				id: sourceId,
				name: getSourceName(sourceId),
				configs: [],
				loading: true
			};
			sources.push(sourceInfo);

			// Load configs based on source type
			try {
				if (sourceId === 'jbtp') {
					const res = await fetch(`${API_BASE}/crawling/configs/jbtp/configs`);
					const data = await res.json();
					sourceInfo.configs = data.items;
				} else if (sourceId === 'binet') {
					const res = await fetch(`${API_BASE}/crawling/configs/binet/configs`);
					const data = await res.json();
					sourceInfo.configs = data.items;
				} else if (sourceId === 'ntis') {
					const res = await fetch(`${API_BASE}/crawling/configs/ntis/config`);
					const data = await res.json();
					sourceInfo.configs = [data];
				} else if (sourceId === 'bizinfo') {
					const res = await fetch(`${API_BASE}/crawling/configs/bizinfo/config`);
					const data = await res.json();
					sourceInfo.configs = [data];
				}
			} catch (error) {
				console.error(`Failed to load ${sourceId} configs:`, error);
			} finally {
				sourceInfo.loading = false;
			}
		}
		sources = [...sources];
	}

	function getSourceName(id: string): string {
		const names: Record<string, string> = {
			jbtp: 'JBTP 전북테크노파크',
			binet: '창업보육센터',
			ntis: 'NTIS 국가R&D',
			bizinfo: '기업마당 BizInfo'
		};
		return names[id] || id;
	}
</script>

<div class="source-info-panel">
	<h3 class="panel-title">{title}</h3>
	<div class="sources-grid">
		{#each sources as source}
			<div class="source-card">
				<div class="source-header">
					<h4>{source.name}</h4>
					{#if source.loading}
						<span class="loading-badge">로딩 중...</span>
					{:else}
						<span class="count-badge">{source.configs.length}개 설정</span>
					{/if}
				</div>

				{#if !source.loading && source.configs.length > 0}
					<div class="source-details">
						{#if source.id === 'jbtp'}
							<!-- JBTP 게시판 목록 -->
							<div class="detail-section">
								<span class="detail-label">크롤링 게시판:</span>
								<ul class="board-list">
									{#each source.configs as config}
										<li>
											<strong>{config.name}</strong>
											{#if config.keywords && config.keywords.length > 0}
												<span class="keywords">(키워드: {config.keywords.join(', ')})</span>
											{/if}
										</li>
									{/each}
								</ul>
							</div>
						{:else if source.id === 'binet'}
							<!-- BI Center 지역 목록 -->
							<div class="detail-section">
								<span class="detail-label">크롤링 지역:</span>
								<ul class="board-list">
									{#each source.configs as config}
										<li>
											<strong>{config.region_name}</strong> ({config.region_code})
											{#if config.keywords && config.keywords.length > 0}
												<span class="keywords">(키워드: {config.keywords.join(', ')})</span>
											{/if}
										</li>
									{/each}
								</ul>
							</div>
						{:else if source.id === 'ntis' || source.id === 'bizinfo'}
							<!-- API 기반 소스 -->
							{#each source.configs as config}
								<div class="detail-section">
									<span class="detail-label">API Key:</span>
									<span class="detail-value">
										{config.api_key_length > 0 ? `설정됨 (${config.api_key_length}자)` : '미설정'}
									</span>
								</div>
								{#if config.search_keywords && config.search_keywords.length > 0}
									<div class="detail-section">
										<span class="detail-label">검색 키워드:</span>
										<span class="detail-value">{config.search_keywords.join(', ')}</span>
									</div>
								{/if}
							{/each}
						{/if}
					</div>
				{:else if !source.loading}
					<p class="no-config">설정된 크롤링 소스가 없습니다.</p>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.source-info-panel {
		padding: var(--space-4);
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--hair);
		border-radius: var(--radius);
		margin-bottom: var(--space-4);
	}

	.panel-title {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin-bottom: var(--space-4);
	}

	.sources-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-3);
	}

	.source-card {
		padding: var(--space-3);
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
		border-radius: var(--radius);
	}

	.source-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-3);
		padding-bottom: var(--space-2);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.source-header h4 {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.loading-badge,
	.count-badge {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		background: var(--surface-1);
		color: var(--muted);
	}

	.source-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.detail-section {
		font-size: var(--text-xs);
	}

	.detail-label {
		font-weight: var(--font-medium);
		color: var(--muted);
		margin-right: var(--space-2);
	}

	.detail-value {
		color: var(--fg);
	}

	.board-list {
		margin: var(--space-2) 0 0 0;
		padding-left: var(--space-4);
		list-style: none;
	}

	.board-list li {
		font-size: var(--text-xs);
		color: var(--fg);
		margin-bottom: var(--space-1);
		position: relative;
	}

	.board-list li::before {
		content: '•';
		position: absolute;
		left: calc(-1 * var(--space-3));
		color: var(--muted);
	}

	.board-list li strong {
		font-weight: var(--font-medium);
	}

	.keywords {
		color: var(--muted);
		font-size: var(--text-xs);
		margin-left: var(--space-1);
	}

	.no-config {
		font-size: var(--text-xs);
		color: var(--muted);
		text-align: center;
		padding: var(--space-3);
	}

	@media (max-width: 768px) {
		.sources-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
