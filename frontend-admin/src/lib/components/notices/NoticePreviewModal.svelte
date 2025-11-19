<script lang="ts">
	/**
	 * NoticePreviewModal - Notice detail preview modal
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 */

	import { Button } from '$lib/components/ui/buttons';
	import { getSourceDisplayName } from '$lib/constants/sources';
	import HWPViewer from './HWPViewer.svelte';

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
		published_date?: string | null;
		views?: number;
		status?: string | null;
		// Legacy support for crawl queue items
		raw_data?: {
			list?: {
				ministry?: string;
				organization?: string;
				date_range?: string;
				published_date?: string;
				views?: string;
				start_date?: string;
				end_date?: string;
			};
			detail?: {
				full_title?: string;
				writer?: string;
				published_date?: string;
				views?: number;
				status?: string;
				deadline?: string;
				d_day?: string;
				content_html?: string;
				content?: string;
				content_viewer_url?: string;
				attachments?: Array<{ filename: string; url: string }>;
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

	// Utility function to strip jsessionid from URLs (fixes Windows Chrome SYNAP viewer issue)
	function stripJsessionid(url: string | null | undefined): string | null | undefined {
		if (!url) return url;
		return url.replace(/;jsessionid=[^?&#]*/gi, '');
	}

	// Utility function to strip jsessionid from HTML content
	function stripJsessionidFromHtml(html: string | null | undefined): string | null | undefined {
		if (!html) return html;
		// Remove jsessionid from all URLs in HTML attributes
		return html.replace(/(['"])(.*?);jsessionid=[^?&#'"]*(['"])/gi, '$1$2$3');
	}

	// Use direct fields from notice, fallback to raw_data for crawl queue preview
	let detail = $derived({
		...activeItem?.raw_data?.detail,
		content_html: stripJsessionidFromHtml(activeItem?.raw_data?.detail?.content_html),
	});
	let contentType = $derived(activeItem?.content_type);
	let contentViewerUrl = $derived(stripJsessionid(activeItem?.content_viewer_url));
	let content = $derived(activeItem?.content);
	let attachments = $derived(activeItem?.attachment_links);

	// RSS 뉴스인지 확인 (source:news:* 패턴)
	let isRssNews = $derived(activeItem?.crawler_source_id?.startsWith('source:news:'));

	// JBTP 공고인지 확인
	let isJBTPNotice = $derived(activeItem?.crawler_source_id?.startsWith('source:jbtp:'));

	// 첫 번째 첨부파일 가져오기
	let firstAttachment = $derived(
		attachments?.[0] || detail?.attachments?.[0]
	);

	// 파일 타입 감지 유틸 함수
	function getFileExtension(filename: string | null | undefined): string {
		if (!filename) return '';
		return filename.split('.').pop()?.toLowerCase() || '';
	}

	function isPDF(filename: string | null | undefined): boolean {
		return getFileExtension(filename) === 'pdf';
	}

	function isHWP(filename: string | null | undefined): boolean {
		const ext = getFileExtension(filename);
		return ext === 'hwp' || ext === 'hwpx';
	}

	// Convert S3 URL to backend proxy URL for inline PDF rendering
	function getPdfProxyUrl(s3Url: string, download: boolean = false): string {
		// Extract S3 key from URL
		// Example: https://jb2-bucket.s3.ap-northeast-2.amazonaws.com/notices/123/file.pdf -> notices/123/file.pdf
		const match = s3Url.match(/amazonaws\.com\/(.+)$/);
		if (!match) {
			return s3Url; // Fallback to original URL if pattern doesn't match
		}

		const s3Key = match[1];
		const encodedKey = encodeURIComponent(s3Key);
		const downloadParam = download ? 'download=true' : 'download=false';

		return `/api/notices/serve-pdf?pdf_key=${encodedKey}&${downloadParam}`;
	}


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


</script>

{#if open && activeItem}
	<div class="modal-backdrop" onclick={handleBackdropClick} onkeydown={handleKeydown} role="button" tabindex="-1">
		<div class="modal-content">
			<!-- Header -->
			<div class="modal-header">
				<div class="header-top">
					<span class="source-badge">{getSourceDisplayName(activeItem.crawler_source_id)}</span>
					{#if activeItem.source_board_name}
						<span class="board-label">{activeItem.source_board_name}</span>
					{/if}
				</div>
				<h2 class="modal-title">{detail?.full_title || activeItem.title}</h2>
				<button class="close-button" onclick={onClose} aria-label="닫기">✕</button>
			</div>

			<!-- Body -->
			<div class="modal-body">
				<!-- Meta Information Grid -->
				{#if activeItem.crawler_source_id === 'bizinfo'}
					<!-- Bizinfo: Use raw_data.list + typed columns -->
					<div class="meta-grid">
						{#if activeItem.raw_data?.list?.ministry}
							<div class="meta-item">
								<span class="meta-label">소관부처</span>
								<span class="meta-value">{activeItem.raw_data.list.ministry}</span>
							</div>
						{/if}
						{#if activeItem.organization}
							<div class="meta-item">
								<span class="meta-label">사업수행기관</span>
								<span class="meta-value">{activeItem.organization}</span>
							</div>
						{/if}
						{#if activeItem.raw_data?.list?.date_range}
							<div class="meta-item">
								<span class="meta-label">신청기간</span>
								<span class="meta-value">{activeItem.raw_data.list.date_range}</span>
							</div>
						{/if}
						{#if activeItem.published_date}
							<div class="meta-item">
								<span class="meta-label">게시일</span>
								<span class="meta-value">{activeItem.published_date}</span>
							</div>
						{/if}
						{#if activeItem.views}
							<div class="meta-item">
								<span class="meta-label">조회수</span>
								<span class="meta-value">{activeItem.views.toLocaleString()}</span>
							</div>
						{/if}
						{#if activeItem.status}
							<div class="meta-item">
								<span class="meta-label">상태</span>
								<span class="meta-value status-value">{activeItem.status}</span>
							</div>
						{/if}
					</div>
				{:else if detail && (detail.writer || detail.published_date || detail.views !== undefined || detail.status || detail.deadline)}
					<!-- Other crawlers: Use raw_data.detail -->
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

				<!-- JBTP Attachment Viewer (replaces SYNAP viewer) -->
				{#if isJBTPNotice && firstAttachment}
					<!-- PDF/HWP/HWPX Attachment - use HWPViewer for all -->
					{#if isPDF(firstAttachment.filename) || isHWP(firstAttachment.filename)}
						<div class="attachment-viewer-section">
							<h3 class="section-title">
								첨부 문서 ({isPDF(firstAttachment.filename) ? 'PDF' : '한글'})
							</h3>
							<HWPViewer
								url={isPDF(firstAttachment.filename)
									? getPdfProxyUrl(firstAttachment.url)
									: firstAttachment.url}
								filename={firstAttachment.filename}
							/>
						</div>
					<!-- Unsupported File Type -->
					{:else}
						<div class="attachment-viewer-section">
							<h3 class="section-title">첨부 파일</h3>
							<div class="hwp-viewer-notice">
								<p>이 파일 형식({getFileExtension(firstAttachment.filename)})은 미리보기를 지원하지 않습니다.</p>
								<p>파일을 다운로드하여 확인해주세요.</p>
							</div>
							<div class="viewer-footer">
								<span class="attachment-info">
									{firstAttachment.filename}
									{#if attachments && attachments.length > 1}
										<span class="attachment-count">(총 {attachments.length}개 첨부파일)</span>
									{/if}
								</span>
								<a
									href={firstAttachment.url}
									download
									class="viewer-link download-button"
								>
									다운로드 →
								</a>
							</div>
						</div>
					{/if}
				<!-- Non-JBTP: Original SYNAP Viewer (for other sources) -->
				{:else if !isJBTPNotice && contentType === 'pdf_viewer' && contentViewerUrl}
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
					{:else if !isJBTPNotice && detail?.content_viewer_url}
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
						<!-- Unified content rendering for all crawlers -->
						<div class="content-section">
							<h3 class="section-title">공고 상세</h3>
							<div class="content-body">
								{#if detail.content_html}
									<div class="isolated-html-content {isRssNews ? 'block-scripts' : ''}">
										{@html detail.content_html}
									</div>
								{:else if detail.content}
									<div class="content-text-wrapper">{detail.content}</div>
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
					{/if}

					<!-- No content fallback for Bizinfo -->
					{#if activeItem.crawler_source_id === 'bizinfo' && !detail?.content_html && (!attachments || attachments.length === 0) && (!detail?.attachments || detail.attachments.length === 0)}
						<div class="no-content-notice">
							<p class="notice-title">상세 내용 보기</p>
							<p class="notice-text">
								기업마당 공고의 상세 내용은 원본 페이지에서 확인하실 수 있습니다.
							</p>
							{#if activeItem.link}
								<a
									href={activeItem.link}
									target="_blank"
									rel="noopener noreferrer"
									class="original-link-button"
								>
									기업마당 원문 보기 →
								</a>
							{/if}
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
		height: 800px;
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		border-radius: var(--radius-lg);
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

	/* RSS Content Text Wrapper */
	.content-text-wrapper {
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
		line-height: 1.7;
		color: var(--fg);
		font-size: var(--text-base);
	}

	.viewer-link:hover {
		background-color: var(--fg);
		color: var(--bg);
	}

	/* JBTP Attachment Viewer */
	.attachment-viewer-section {
		padding: var(--space-4);
		border: var(--border-width) solid var(--hair);
		margin-bottom: var(--space-6);
	}

	.attachment-info {
		font-size: var(--text-sm);
		color: var(--fg);
		font-weight: var(--font-medium);
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.attachment-count {
		font-size: var(--text-xs);
		color: var(--muted);
		font-weight: var(--font-normal);
	}

	.download-button {
		margin-left: var(--space-3);
	}

	/* Bizinfo No Content Notice */
	.no-content-notice {
		padding: var(--space-8);
		border: var(--border-width) solid var(--hair);
		background-color: var(--surface-1);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}

	.notice-title {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin: 0;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.notice-text {
		font-size: var(--text-sm);
		color: var(--muted);
		margin: 0;
		line-height: 1.6;
	}

	.original-link-button {
		display: inline-block;
		padding: var(--space-3) var(--space-6);
		background-color: var(--fg);
		color: var(--bg);
		text-decoration: none;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		transition: all var(--duration-base) var(--ease-out);
		border: var(--border-width) solid var(--fg);
	}

	.original-link-button:hover {
		background-color: var(--bg);
		color: var(--fg);
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
     CONTENT BODY - Unified HTML rendering
     ======================================== */

	.content-body :global(p) {
		margin-bottom: var(--space-3);
		line-height: var(--leading-relaxed);
	}

	.content-body :global(ul),
	.content-body :global(ol) {
		margin-left: var(--space-6);
		margin-bottom: var(--space-3);
	}

	.content-body :global(li) {
		margin-bottom: var(--space-2);
		line-height: var(--leading-relaxed);
	}

	.content-body :global(img) {
		max-width: 100%;
		height: auto;
		display: block;
		margin: var(--space-4) 0;
		border: var(--border-width) solid var(--hair);
	}

	.content-body :global(a) {
		color: var(--fg);
		text-decoration: underline;
		transition: opacity var(--duration-base) var(--ease-out);
	}

	.content-body :global(a:hover) {
		opacity: 0.7;
	}

	.content-body :global(strong),
	.content-body :global(b) {
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.content-body :global(em),
	.content-body :global(i) {
		font-style: italic;
	}

	.content-body :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: var(--space-4) 0;
		font-size: var(--text-sm);
	}

	.content-body :global(th),
	.content-body :global(td) {
		padding: var(--space-3) var(--space-4);
		border: var(--border-width) solid var(--hair);
		text-align: left;
		line-height: var(--leading-relaxed);
	}

	.content-body :global(th) {
		background-color: var(--surface-1);
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.content-body :global(tr:nth-child(even)) {
		background-color: var(--ghost);
	}

	.content-body :global(blockquote) {
		margin: var(--space-4) 0;
		padding: var(--space-4);
		border-left: 4px solid var(--fg);
		background-color: var(--surface-1);
		font-style: italic;
	}

	.content-body :global(pre) {
		margin: var(--space-4) 0;
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		overflow-x: auto;
		font-family: monospace;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	.content-body :global(code) {
		padding: var(--space-1) var(--space-2);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		font-family: monospace;
		font-size: var(--text-sm);
	}

	.content-body :global(pre code) {
		padding: 0;
		background: none;
		border: none;
	}

	.content-body :global(h1),
	.content-body :global(h2),
	.content-body :global(h3),
	.content-body :global(h4),
	.content-body :global(h5),
	.content-body :global(h6) {
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin-top: var(--space-4);
		margin-bottom: var(--space-3);
		line-height: var(--leading-tight);
	}

	.content-body :global(h1) {
		font-size: var(--text-xl);
	}

	.content-body :global(h2) {
		font-size: var(--text-lg);
	}

	.content-body :global(h3) {
		font-size: var(--text-base);
	}

	.content-body :global(h4),
	.content-body :global(h5),
	.content-body :global(h6) {
		font-size: var(--text-sm);
	}

	.content-body :global(hr) {
		margin: var(--space-6) 0;
		border: none;
		border-top: var(--border-width) solid var(--hair);
	}

	.content-body :global(ul ul),
	.content-body :global(ol ol),
	.content-body :global(ul ol),
	.content-body :global(ol ul) {
		margin-left: var(--space-4);
		margin-top: var(--space-2);
		margin-bottom: 0;
	}

	.content-body :global(div) {
		color: var(--fg);
	}

	.content-body :global(span) {
		color: inherit;
	}

	/* Content section structure (for Bizinfo structured HTML) */
	.content-body :global(.content-section) {
		margin-bottom: var(--space-6);
	}

	.content-body :global(.content-section h3) {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin-bottom: var(--space-3);
		padding-bottom: var(--space-2);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.content-body :global(.content-section .content-body) {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
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

	/* ========================================
	   ISOLATED HTML CONTENT (RSS 뉴스 등)
	   ======================================== */
	.isolated-html-content {
		/* CSS containment으로 외부 HTML 격리 (all: initial 제거 - 모달 containment 파괴 방지) */
		contain: layout style paint;
		display: block;
		max-width: 100%;
		overflow: auto;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		font-size: 16px;
		line-height: 1.6;
		color: #333;
		background: white;
		padding: 1rem;
	}

	/* 위험한 요소 숨김 (재귀적 페이지 로딩 방지) - RSS 뉴스에만 적용 */
	/* 지자체 공고(JBTP local)는 SYNAP 뷰어 iframe이 필요하므로 제외 */
	.isolated-html-content.block-scripts iframe,
	.isolated-html-content.block-scripts script {
		display: none !important;
	}

	/* JavaScript 이벤트 핸들러가 있는 버튼 비활성화 (RSS 뉴스에만) */
	.isolated-html-content.block-scripts button[onclick] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	/* 이미지가 컨테이너를 넘지 않도록 */
	.isolated-html-content img {
		max-width: 100% !important;
		height: auto !important;
	}

	/* 테이블 스타일 */
	.isolated-html-content table {
		border-collapse: collapse;
		width: 100%;
		margin: 1em 0;
	}

	.isolated-html-content th,
	.isolated-html-content td {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: left;
	}

	/* 링크 스타일 */
	.isolated-html-content a {
		color: #0066cc;
		text-decoration: underline;
	}

	.isolated-html-content a:hover {
		color: #0052a3;
	}
</style>
