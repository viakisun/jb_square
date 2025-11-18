<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';

	interface Props {
		activeSection: string;
		onNavigate: (id: string) => void;
	}

	let { activeSection, onNavigate }: Props = $props();

	const navSections = [
		{
			title: '시작하기',
			items: [
				{ id: 'overview', label: '시스템 개요' },
				{ id: 'dashboard', label: '대시보드' }
			]
		},
		{
			title: '크롤링 관리',
			items: [
				{ id: 'crawling-overview', label: '크롤링 시스템 이해하기' },
				{ id: 'crawler-config', label: '크롤러 설정하기' },
				{ id: 'manual-crawl', label: '수동 크롤링 실행' }
			]
		},
		{
			title: '공고 관리',
			items: [
				{ id: 'notice-queue', label: '크롤링 큐 검토하기' },
				{ id: 'notice-manage', label: '공고 게시 관리' },
				{ id: 'notice-create', label: '수동 공고 등록' }
			]
		},
		{
			title: '태그 관리',
			items: [
				{ id: 'tag-overview', label: '태그 시스템 이해하기' },
				{ id: 'tag-create', label: '태그 생성 및 편집' }
			]
		},
		{
			title: 'BI 센터 관리',
			items: [
				{ id: 'bi-center', label: 'BI 센터 디렉토리' },
				{ id: 'bi-company', label: '입주 기업 관리' }
			]
		},
		{
			title: '통계 및 분석',
			items: [{ id: 'analytics', label: '통계 및 분석' }]
		},
		{
			title: '시스템 관리',
			items: [
				{ id: 'system-monitor', label: '시스템 모니터링' },
				{ id: 'ksic', label: 'KSIC 코드 관리' }
			]
		},
		{
			title: 'API 레퍼런스',
			items: [
				{ id: 'api-crawling', label: '크롤링 API' },
				{ id: 'api-notices', label: '공고 API' },
				{ id: 'api-tags', label: '태그 API' },
				{ id: 'api-bi-centers', label: 'BI 센터 API' },
				{ id: 'api-dashboard', label: '대시보드 API' }
			]
		},
		{
			title: '문제 해결',
			items: [
				{ id: 'faq', label: '자주 묻는 질문' },
				{ id: 'troubleshoot-crawling', label: '크롤링 오류 해결' },
				{ id: 'api-keys', label: 'API 키 설정' },
				{ id: 'support', label: '지원 요청' }
			]
		}
	];
</script>

<nav class="doc-nav">
	{#each navSections as section}
		<div class="nav-section">
			<h3 class="section-title">{section.title}</h3>
			<ul class="section-items">
				{#each section.items as item}
					<li>
						<button
							class="nav-item"
							class:active={activeSection === item.id}
							onclick={() => onNavigate(item.id)}
							type="button"
						>
							<ChevronRight size={16} class="item-icon" />
							<span>{item.label}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>

<style>
	.doc-nav {
		padding: var(--space-6);
	}

	.nav-section {
		margin-bottom: var(--space-8);
	}

	.section-title {
		font-size: var(--text-xs);
		font-weight: var(--font-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--muted);
		margin: 0 0 var(--space-3) 0;
		padding: 0 var(--space-3);
	}

	.section-items {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.section-items li {
		margin: 0;
	}

	.nav-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: none;
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		color: var(--muted);
		text-align: left;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.nav-item:hover {
		background-color: var(--ghost);
		color: var(--fg);
	}

	.nav-item.active {
		background-color: var(--ghost);
		color: var(--fg);
		font-weight: var(--font-semibold);
	}

	.nav-item :global(.item-icon) {
		flex-shrink: 0;
		opacity: 0;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.nav-item:hover :global(.item-icon),
	.nav-item.active :global(.item-icon) {
		opacity: 1;
	}
</style>
