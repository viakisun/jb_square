<script lang="ts">
	/**
	 * NoticePreviewModal - Notice detail preview modal
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 */

	import { Button } from '$lib/components/ui/buttons';

	type NoticeItem = {
		id: number;
		title: string;
		content?: string | null;
		link?: string | null;
		crawler_source_id: string;
		source_board_name?: string | null;
		source_date_string?: string;
		// Direct fields (from typed columns)
		content_type?: string | null;
		content_viewer_url?: string | null;
		attachment_links?: Array<{ filename: string; url: string }> | null;
		organization?: string | null;
		department?: string | null;
		contact?: string | null;
		deadline?: string | null;
		announcement_date?: string | null;
		// Legacy support for crawl queue items
		raw_data?: {
			detail?: {
				full_title?: string;
				writer?: string;
				published_date?: string;
				views?: number;
				status?: string;
				deadline?: string;
				d_day?: string;
			};
		};
	};

	type Props = {
		item?: NoticeItem | null;
		notice?: NoticeItem | null;
		open?: boolean;
		onClose: () => void;
	};

	let { item, notice, open = false, onClose }: Props = $props();

	let activeItem = $derived(item || notice);

	// Use direct fields from notice, fallback to raw_data for crawl queue preview
	let detail = $derived(activeItem?.raw_data?.detail);
	let contentType = $derived(activeItem?.content_type);
	let contentViewerUrl = $derived(activeItem?.content_viewer_url);
	let content = $derived(activeItem?.content);
	let attachments = $derived(activeItem?.attachment_links);

	// Debug logging
	$effect(() => {
		if (open && activeItem) {
			console.log('NoticePreviewModal - activeItem:', activeItem);
			console.log('NoticePreviewModal - raw_data:', activeItem?.raw_data);
			console.log('NoticePreviewModal - detail:', detail);
		}
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	function getSourceLabel(sourceId: string): string {
		const labels: Record<string, string> = {
			jbtp: 'JBTP',
			ntis: 'NTIS',
			bizinfo: '기업마당'
		};
		return labels[sourceId] || sourceId;
	}
</script>

{#if open && activeItem}
	<div class="modal-backdrop" onclick={handleBackdropClick} onkeydown={handleKeydown} role="button" tabindex="-1">
		<div class="modal-content">
			<!-- Header -->
			<div class="modal-header">
				<div class="header-top">
					<span class="source-badge">{getSourceLabel(activeItem.crawler_source_id)}</span>
					{#if activeItem.source_board_name}
						<span class="board-label">{activeItem.source_board_name}</span>
					{/if}
				</div>
				<h2 class="modal-title">{detail?.full_title || activeItem.title}</h2>
				<button class="close-button" onclick={onClose} aria-label="닫기">✕</button>
			</div>

			<!-- Body -->
			<div class="modal-body">
				<!-- Meta Information Grid (only for crawl queue items with detail) -->
				{#if detail && (detail.writer || detail.published_date || detail.views !== undefined || detail.status || detail.deadline)}
						<div class="meta-grid">
						{#if detail.writer}
							<div class="meta-item">
								<span class="meta-label">작성자</span>
								<span class="meta-value">{detail.writer}</span>
							</div>
						{/if}
						{#if detail.published_date}
							<div class="meta-item">
								<span class="meta-label">작성일</span>
								<span class="meta-value">{detail.published_date}</span>
							</div>
						{/if}
						{#if detail.views !== undefined}
							<div class="meta-item">
								<span class="meta-label">조회수</span>
								<span class="meta-value">{detail.views.toLocaleString()}</span>
							</div>
						{/if}
						{#if detail.status}
							<div class="meta-item">
								<span class="meta-label">상태</span>
								<span class="meta-value status-value">{detail.status}</span>
							</div>
						{/if}
						{#if detail.deadline}
							<div class="meta-item meta-deadline">
								<span class="meta-label">마감일</span>
								<div class="deadline-value">
									<span>{detail.deadline}</span>
									{#if detail.d_day}
										<span class="d-day-badge">{detail.d_day}</span>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Content Viewer (for JBTP PDF viewer) -->
				{#if contentType === 'pdf_viewer' && contentViewerUrl}
						<div class="content-viewer-section">
							<h3 class="section-title">문서 내용</h3>
							<div class="pdf-viewer-container">
								<iframe
									src={contentViewerUrl}
									class="pdf-iframe"
									title="공고 문서"
									frameborder="0"
								></iframe>
							</div>
							<div class="viewer-footer">
								<a
									href={contentViewerUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="viewer-link"
								>
									새 창에서 열기 →
								</a>
							</div>
						</div>
					{:else if detail?.content_viewer_url}
						<!-- Fallback for crawl queue preview -->
						<div class="content-viewer-section">
							<h3 class="section-title">문서 내용</h3>
							<div class="pdf-viewer-container">
								<iframe
									src={detail.content_viewer_url}
									class="pdf-iframe"
									title="공고 문서"
									frameborder="0"
								></iframe>
							</div>
							<div class="viewer-footer">
								<a
									href={detail.content_viewer_url}
									target="_blank"
									rel="noopener noreferrer"
									class="viewer-link"
								>
									새 창에서 열기 →
								</a>
							</div>
						</div>
					{/if}

					<!-- Content HTML (for NTIS and other sources) -->
					{#if contentType === 'html' && content}
						<div class="content-section">
							<h3 class="section-title">공고 내용</h3>
							<div class="content-body">
								{@html content}
							</div>
						</div>
					{:else if contentType === 'text' && content}
						<div class="content-section">
							<h3 class="section-title">공고 내용</h3>
							<div class="content-body">
								<pre class="content-text">{content}</pre>
							</div>
						</div>
					{:else if detail?.content_html || detail?.content}
						<!-- Fallback for crawl queue preview -->
						<div class="content-section">
							<h3 class="section-title">공고 내용</h3>
							<div class="content-body">
								{#if detail.content_html}
									{@html detail.content_html}
								{:else if detail.content}
									<pre class="content-text">{detail.content}</pre>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Attachments -->
					{#if attachments && attachments.length > 0}
						<div class="attachments-section">
							<h3 class="section-title">첨부파일 ({attachments.length})</h3>
							<ul class="attachments-list">
								{#each attachments as attachment}
									<li class="attachment-item">
										<span class="attachment-icon">📎</span>
										<span class="attachment-name">{attachment.filename}</span>
										<a
											href={attachment.url}
											target="_blank"
											rel="noopener noreferrer"
											class="attachment-download"
										>
											다운로드
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{:else if detail?.attachments && detail.attachments.length > 0}
						<!-- Fallback for crawl queue preview -->
						<div class="attachments-section">
							<h3 class="section-title">첨부파일 ({detail.attachments.length})</h3>
							<ul class="attachments-list">
								{#each detail.attachments as attachment}
									<li class="attachment-item">
										<span class="attachment-icon">📎</span>
										<span class="attachment-name">{attachment.filename}</span>
										<a
											href={attachment.url}
											target="_blank"
											rel="noopener noreferrer"
											class="attachment-download"
										>
											다운로드
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{:else}
					<div class="no-detail">
						<p>상세 정보가 없습니다.</p>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="modal-footer">
				{#if activeItem.link}
					<a href={activeItem.link} target="_blank" rel="noopener noreferrer" class="link-button">
						원본 페이지 열기
					</a>
				{/if}
				<Button variant="outline" onclick={onClose}>닫기</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ========================================
     MODAL BACKDROP
     ======================================== */

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-8);
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* ========================================
     MODAL CONTENT
     ======================================== */

	.modal-content {
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		max-width: 960px;
		width: 100%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* ========================================
     MODAL HEADER
     ======================================== */

	.modal-header {
		padding: var(--space-6);
		border-bottom: var(--border-width) solid var(--hair);
		position: relative;
	}

	.header-top {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
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
	}

	.board-label {
		padding: var(--space-1) var(--space-2);
		background-color: var(--surface-1);
		color: var(--fg);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		border: var(--border-width) solid var(--hair);
	}

	.modal-title {
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--fg);
		letter-spacing: var(--tracking-tight);
		line-height: 1.4;
		margin: 0;
		padding-right: var(--space-12);
	}

	.close-button {
		position: absolute;
		top: var(--space-6);
		right: var(--space-6);
		background: none;
		border: none;
		color: var(--fg);
		font-size: var(--text-2xl);
		cursor: pointer;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--duration-base) var(--ease-out);
	}

	.close-button:hover {
		background-color: var(--surface-1);
	}

	/* ========================================
     MODAL BODY
     ======================================== */

	.modal-body {
		padding: var(--space-6);
		overflow-y: auto;
		flex: 1;
	}

	/* Meta Grid */
	.meta-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		margin-bottom: var(--space-6);
	}

	.meta-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.meta-deadline {
		grid-column: 1 / -1;
	}

	.meta-label {
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.meta-value {
		font-size: var(--text-sm);
		color: var(--fg);
		font-weight: var(--font-medium);
	}

	.status-value {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		background-color: var(--fg);
		color: var(--bg);
		font-size: var(--text-xs);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.deadline-value {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.d-day-badge {
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		background-color: var(--fg);
		color: var(--bg);
		font-size: var(--text-xs);
		font-weight: var(--font-bold);
	}

	/* Sections */
	.section-title {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		margin-bottom: var(--space-3);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	/* Attachments */
	.attachments-section {
		margin-bottom: var(--space-6);
		padding: var(--space-4);
		border: var(--border-width) solid var(--hair);
	}

	.attachments-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.attachment-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	.attachment-icon {
		font-size: var(--text-base);
		flex-shrink: 0;
	}

	.attachment-name {
		flex: 1;
		font-size: var(--text-sm);
		color: var(--fg);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.attachment-download {
		padding: var(--space-1) var(--space-3);
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		color: var(--fg);
		text-decoration: none;
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		transition: all var(--duration-base) var(--ease-out);
	}

	.attachment-download:hover {
		background-color: var(--fg);
		color: var(--bg);
	}

	/* Content Viewer */
	.content-viewer-section {
		padding: var(--space-4);
		border: var(--border-width) solid var(--hair);
		margin-bottom: var(--space-6);
	}

	.pdf-viewer-container {
		width: 100%;
		height: 600px;
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		margin-bottom: var(--space-3);
		position: relative;
		overflow: hidden;
	}

	.pdf-iframe {
		width: 100%;
		height: 100%;
		border: none;
	}

	.viewer-footer {
		text-align: center;
		padding: var(--space-2);
	}

	.viewer-link {
		display: inline-block;
		padding: var(--space-2) var(--space-4);
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		color: var(--fg);
		text-decoration: none;
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		transition: all var(--duration-base) var(--ease-out);
	}

	.viewer-link:hover {
		background-color: var(--fg);
		color: var(--bg);
	}

	/* No Detail */
	.no-detail {
		text-align: center;
		padding: var(--space-12);
		color: var(--muted);
	}

	/* Content Section */
	.content-section {
		padding: var(--space-4);
		border: var(--border-width) solid var(--hair);
		margin-bottom: var(--space-6);
	}

	.content-body {
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		line-height: 1.6;
		overflow-x: auto;
		color: var(--fg);
	}

	.content-body :global(*) {
		color: inherit !important;
	}

	.content-body :global(span),
	.content-body :global(p),
	.content-body :global(div) {
		color: var(--fg) !important;
	}

	.content-body :global(p) {
		margin-bottom: var(--space-3);
	}

	.content-body :global(ul),
	.content-body :global(ol) {
		margin-left: var(--space-6);
		margin-bottom: var(--space-3);
	}

	.content-body :global(li) {
		margin-bottom: var(--space-2);
	}

	.content-body :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: var(--space-4);
	}

	.content-body :global(th),
	.content-body :global(td) {
		padding: var(--space-2) var(--space-3);
		border: var(--border-width) solid var(--hair);
		text-align: left;
	}

	.content-body :global(th) {
		background-color: var(--fg);
		color: var(--bg);
		font-weight: var(--font-medium);
	}

	.content-text {
		white-space: pre-wrap;
		word-wrap: break-word;
		font-family: inherit;
		font-size: var(--text-sm);
		margin: 0;
	}

	/* ========================================
     MODAL FOOTER
     ======================================== */

	.modal-footer {
		padding: var(--space-6);
		border-top: var(--border-width) solid var(--hair);
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-3);
	}

	.link-button {
		padding: var(--space-2) var(--space-4);
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		color: var(--fg);
		text-decoration: none;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		transition: all var(--duration-base) var(--ease-out);
	}

	.link-button:hover {
		background-color: var(--fg);
		color: var(--bg);
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 640px) {
		.modal-backdrop {
			padding: 0;
		}

		.modal-content {
			max-width: 100%;
			max-height: 100vh;
			border: none;
		}

		.meta-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
