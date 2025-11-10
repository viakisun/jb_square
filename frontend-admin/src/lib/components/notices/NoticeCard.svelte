<script lang="ts">
	/**
	 * NoticeCard - Card component for displaying notice summary
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 */

	import { Badge } from '$lib/components/feedback';
	import { Button } from '$lib/components/ui/buttons';
	import { Checkbox } from '$lib/components/ui/forms';
	import NoticePreviewModal from './NoticePreviewModal.svelte';
	import NoticeTagEditor from './NoticeTagEditor.svelte';
	import { formatDate, getDaysUntilDeadline } from '$lib/utils/date';
	import { getSourceLabel } from '$lib/constants/sources';

	type Notice = {
		id: number;
		title: string;
		content: string | null;
		link: string | null;
		origin_type: string;
		crawler_source_id: string;
		tags: string[];
		organization: string | null;
		published_at: string | null;
		deadline: string | null;
		matched_keywords?: string[];
	};

	type Props = {
		notice: Notice;
		selectable?: boolean;
		selected?: boolean;
		onSelect?: (id: number) => void;
	};

	let { notice = $bindable(), selectable = false, selected = false, onSelect }: Props = $props();

	let showPreview = $state(false);
	let showTagEditor = $state(false);

	function openPreview(event: Event) {
		event.stopPropagation();
		showPreview = true;
	}

	function closePreview() {
		showPreview = false;
	}

	function openTagEditor(event: Event) {
		event.stopPropagation();
		showTagEditor = true;
	}

	function closeTagEditor() {
		showTagEditor = false;
	}

	function handleTagsUpdated(updatedTags: string[]) {
		notice.tags = updatedTags;
	}

	function handleCardClick() {
		if (selectable) {
			showPreview = true;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Handle Enter or Space key for keyboard accessibility
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick();
		}
	}

	function handleCheckboxChange() {
		if (onSelect) {
			onSelect(notice.id);
		}
	}

	const daysLeft = $derived(getDaysUntilDeadline(notice.deadline));
</script>

<article
	class="notice-card"
	class:selectable
	onclick={handleCardClick}
	onkeydown={handleKeyDown}
	tabindex={selectable ? 0 : undefined}
	role={selectable ? "button" : undefined}
>
	{#if selectable}
		<div class="checkbox-column" onclick={(e) => e.stopPropagation()}>
			<Checkbox checked={selected} onchange={handleCheckboxChange} />
		</div>
	{/if}

	<div class="card-content-wrapper">
	<!-- Header -->
	<div class="card-header">
		<div class="header-left">
			<span class="source-badge">{getSourceLabel(notice.crawler_source_id)}</span>
		</div>
		<div class="header-right">
			{#if notice.crawler_source_id === 'source:jbtp:external'}
				<!-- 유관기관공고: 작성일 표시 -->
				<div class="posted-info">
					<span class="info-label">등록일</span>
					<span class="posted-date">{formatDate(notice.published_at)}</span>
				</div>
			{:else if notice.deadline}
				<!-- 사업공고: 마감일 표시 -->
				<div class="deadline-info">
					<span class="deadline-date">{formatDate(notice.deadline)}</span>
					{#if daysLeft !== null}
						{#if daysLeft < 0}
							<span class="deadline-badge closed">마감</span>
						{:else if daysLeft === 0}
							<span class="deadline-badge urgent">오늘 마감</span>
						{:else if daysLeft <= 7}
							<span class="deadline-badge urgent">D-{daysLeft}</span>
						{:else}
							<span class="deadline-badge">D-{daysLeft}</span>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Title -->
	<div class="title-section">
		<h3 class="card-title">
			{notice.title}
		</h3>
		{#if notice.organization}
			<p class="organization">{notice.organization}</p>
		{/if}
	</div>

	<!-- Tags -->
	<div class="tags-section">
		{#if notice.tags && notice.tags.length > 0}
			<div class="card-tags">
				{#each notice.tags as tag}
					<Badge variant="outline">{tag}</Badge>
				{/each}
			</div>
		{:else}
			<div class="tag-warning">
				<span class="warning-icon">⚠️</span>
				<span class="warning-text">태그 미지정</span>
			</div>
		{/if}
		<button class="edit-tags-button" onclick={openTagEditor} title="태그 편집">
			태그 편집
		</button>
	</div>

	<!-- Footer -->
	<div class="card-footer">
		<div class="footer-left">
			<span class="date">{formatDate(notice.published_at)}</span>
		</div>
		<div class="footer-right">
			<Button variant="outline" size="sm" onclick={openPreview}>바로보기</Button>
			{#if notice.link}
				<Button
					variant="outline"
					size="sm"
					onclick={(e: Event) => {
						e.stopPropagation();
						window.open(notice.link!, '_blank');
					}}
				>
					바로가기
				</Button>
			{/if}
		</div>
	</div>
	</div>
</article>

<!-- Preview Modal -->
{#if showPreview}
	<NoticePreviewModal notice={notice} open={showPreview} onClose={closePreview} />
{/if}

<!-- Tag Editor -->
{#if showTagEditor}
	<NoticeTagEditor
		noticeId={notice.id}
		currentTags={notice.tags || []}
		onClose={closeTagEditor}
		onSuccess={handleTagsUpdated}
	/>
{/if}

<style>
	/* ========================================
     CARD CONTAINER
     ======================================== */

	.notice-card {
		display: flex;
		gap: var(--space-4);
		padding: var(--space-6);
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		transition: all var(--duration-base) var(--ease-out);
	}

	.notice-card.selectable {
		cursor: pointer;
	}

	.notice-card.selectable:hover {
		border-color: var(--fg);
	}

	.notice-card:not(.selectable):hover {
		border-color: var(--fg);
		box-shadow: 4px 4px 0 var(--fg);
	}

	.checkbox-column {
		display: flex;
		align-items: flex-start;
		padding-top: var(--space-2);
		flex-shrink: 0;
	}

	.card-content-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		flex: 1;
		min-width: 0;
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

	.deadline-info,
	.posted-info {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.deadline-date,
	.posted-date {
		font-size: var(--text-xs);
		color: var(--muted);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.info-label {
		font-size: var(--text-xs);
		color: var(--muted);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		opacity: 0.7;
	}

	.deadline-badge {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		padding: var(--space-1) var(--space-2);
		border: var(--border-width) solid var(--fg);
		white-space: nowrap;
	}

	.deadline-badge.urgent {
		background-color: var(--fg);
		color: var(--bg);
	}

	.deadline-badge.closed {
		background-color: var(--muted);
		color: var(--bg);
		border-color: var(--muted);
		opacity: 0.7;
	}

	/* ========================================
     TITLE
     ======================================== */

	.title-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.card-title {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		line-height: var(--leading-tight);
		color: var(--fg);
		margin: 0;
	}

	.organization {
		font-size: var(--text-sm);
		color: var(--muted);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ========================================
     TAGS
     ======================================== */

	.tags-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		flex: 1;
	}

	.tag-warning {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background-color: var(--color-warning-bg);
		border: var(--border-width) solid var(--border-color);
		flex: 1;
	}

	.warning-icon {
		font-size: var(--text-base);
		line-height: 1;
	}

	.warning-text {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
	}

	.edit-tags-button {
		padding: var(--space-1) var(--space-3);
		background: none;
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		cursor: pointer;
		transition: all var(--duration-base) var(--ease-out);
		flex-shrink: 0;
	}

	.edit-tags-button:hover {
		background-color: var(--fg);
		color: var(--bg);
	}

	/* ========================================
     FOOTER
     ======================================== */

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding-top: var(--space-3);
		border-top: var(--border-width) solid var(--hair);
		font-size: var(--text-xs);
		color: var(--muted);
		flex-wrap: wrap;
	}

	.footer-left {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		flex: 1;
	}

	.footer-right {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.date {
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}
</style>
