<script lang="ts">
	/**
	 * NoticeCard - Card component for displaying notice summary
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 */

	import { Badge } from '$lib/components/feedback';

	type Notice = {
		id: number;
		title: string;
		content: string | null;
		link: string | null;
		source_type: string;
		source_id: string;
		category: string;
		tags: string[];
		organization: string | null;
		published_at: string | null;
		deadline: string | null;
	};

	type Props = {
		notice: Notice;
	};

	let { notice }: Props = $props();

	function formatDate(dateString: string | null): string {
		if (!dateString) return '-';
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('ko-KR', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			});
		} catch {
			return dateString;
		}
	}

	function getSourceLabel(sourceId: string): string {
		const labels: Record<string, string> = {
			jbtp: 'JBTP',
			ntis: 'NTIS',
			bizinfo: '기업마당',
			manual: '수동등록'
		};
		return labels[sourceId] || sourceId;
	}

	function getDaysUntilDeadline(deadline: string | null): number | null {
		if (!deadline) return null;
		try {
			const deadlineDate = new Date(deadline);
			const today = new Date();
			const diffTime = deadlineDate.getTime() - today.getTime();
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays;
		} catch {
			return null;
		}
	}

	const daysLeft = $derived(getDaysUntilDeadline(notice.deadline));
</script>

<article class="notice-card">
	<!-- Header -->
	<div class="card-header">
		<div class="header-left">
			<span class="source-badge">{getSourceLabel(notice.source_id)}</span>
			{#if notice.organization}
				<span class="organization">{notice.organization}</span>
			{/if}
		</div>
		<div class="header-right">
			{#if daysLeft !== null}
				<span class="deadline" class:urgent={daysLeft <= 7}>
					{#if daysLeft > 0}
						D-{daysLeft}
					{:else if daysLeft === 0}
						오늘 마감
					{:else}
						마감
					{/if}
				</span>
			{/if}
		</div>
	</div>

	<!-- Title -->
	<h3 class="card-title">
		{#if notice.link}
			<a href={notice.link} target="_blank" rel="noopener noreferrer" class="title-link">
				{notice.title}
			</a>
		{:else}
			{notice.title}
		{/if}
	</h3>

	<!-- Content Preview -->
	{#if notice.content}
		<p class="card-content">
			{notice.content.substring(0, 120)}{notice.content.length > 120 ? '...' : ''}
		</p>
	{/if}

	<!-- Tags -->
	{#if notice.tags && notice.tags.length > 0}
		<div class="card-tags">
			{#each notice.tags as tag}
				<Badge variant="outline">{tag}</Badge>
			{/each}
		</div>
	{/if}

	<!-- Footer -->
	<div class="card-footer">
		<span class="date">게시일: {formatDate(notice.published_at)}</span>
		{#if notice.deadline}
			<span class="date">마감일: {formatDate(notice.deadline)}</span>
		{/if}
	</div>
</article>

<style>
	/* ========================================
     CARD CONTAINER
     ======================================== */

	.notice-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-6);
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		transition: all var(--duration-base) var(--ease-out);
	}

	.notice-card:hover {
		border-color: var(--fg);
		box-shadow: 4px 4px 0 var(--fg);
	}

	/* ========================================
     HEADER
     ======================================== */

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: 1;
		min-width: 0;
	}

	.header-right {
		flex-shrink: 0;
	}

	.source-badge {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		background-color: var(--fg);
		color: var(--bg);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		flex-shrink: 0;
	}

	.organization {
		font-size: var(--text-sm);
		color: var(--muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.deadline {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		padding: var(--space-1) var(--space-2);
		border: var(--border-width) solid var(--fg);
	}

	.deadline.urgent {
		background-color: var(--fg);
		color: var(--bg);
	}

	/* ========================================
     TITLE
     ======================================== */

	.card-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		line-height: var(--leading-tight);
		color: var(--fg);
		margin: 0;
	}

	.title-link {
		color: inherit;
		text-decoration: none;
		transition: opacity var(--duration-base) var(--ease-out);
	}

	.title-link:hover {
		opacity: 0.7;
	}

	/* ========================================
     CONTENT
     ======================================== */

	.card-content {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--muted);
		margin: 0;
	}

	/* ========================================
     TAGS
     ======================================== */

	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	/* ========================================
     FOOTER
     ======================================== */

	.card-footer {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding-top: var(--space-3);
		border-top: var(--border-width) solid var(--hair);
		font-size: var(--text-xs);
		color: var(--muted);
	}

	.date {
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}
</style>
