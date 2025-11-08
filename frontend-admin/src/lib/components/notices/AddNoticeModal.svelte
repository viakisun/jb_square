<script lang="ts">
	/**
	 * Add Notice Modal
	 * Modal for manually adding a notice
	 */
	import { Button } from '$lib/components/ui/buttons';
	import { Input } from '$lib/components/ui/forms';
	import { toast } from '$lib/stores/toast';
	import { API_BASE_URL } from '$lib/config/api';
	import { getLocationDisplay } from '$lib/constants/sources';
	import { useFileUpload } from '$lib/composables/useFileUpload.svelte';

	interface Props {
		category: string;
		sourceId: string;
		onClose: () => void;
		onSuccess: () => void;
	}

	let { category, sourceId, onClose, onSuccess }: Props = $props();

	let locationDisplay = $derived(getLocationDisplay(sourceId));

	// Form state
	let formData = $state({
		title: '',
		content: '',
		content_type: 'text',
		link: '',
		organization: '',
		department: '',
		contact: '',
		deadline: '',
		application_start: '',
		application_end: '',
		announcement_date: ''
	});

	let selectedTags = $state<string[]>([]);
	let attachments = $state<Array<{ filename: string; url: string }>>([]);
	let newAttachment = $state({ filename: '', url: '' });
	let availableTags = $state<Array<{ id: number; name: string; slug: string; color_hex: string }>>([]);
	let loadingTags = $state(true);
	let submitting = $state(false);
	let attachmentMode = $state<'url' | 'upload'>('upload'); // Toggle between URL input and file upload

	// Use file upload composable
	const fileUpload = useFileUpload(10); // 10MB max

	// Load tags on mount
	$effect(() => {
		loadTags();
	});

	async function loadTags() {
		try {
			const res = await fetch(`${API_BASE_URL}/tags/active`);
			if (res.ok) {
				availableTags = await res.json();
			}
		} catch (error) {
			console.error('Failed to load tags:', error);
		} finally {
			loadingTags = false;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error('제목을 입력하세요');
			return;
		}

		submitting = true;

		try {
			const res = await fetch(`${API_BASE_URL}/notices/manual`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formData.title,
					content: formData.content || null,
					content_type: formData.content_type,
					link: formData.link || null,
					category,
					tags: selectedTags,
					organization: formData.organization || null,
					department: formData.department || null,
					contact: formData.contact || null,
					deadline: formData.deadline || null,
					application_start: formData.application_start || null,
					application_end: formData.application_end || null,
					announcement_date: formData.announcement_date || null,
					attachment_links: attachments.length > 0 ? attachments : null
				})
			});

			if (res.ok) {
				toast.success('공고가 추가되었습니다');
				onSuccess();
				onClose();
			} else {
				const error = await res.json();
				toast.error(error.detail || '공고 추가 실패');
			}
		} catch (error) {
			console.error('Failed to add notice:', error);
			toast.error('공고 추가 중 오류 발생');
		} finally {
			submitting = false;
		}
	}

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}

	function addAttachment() {
		if (newAttachment.filename.trim() && newAttachment.url.trim()) {
			attachments = [...attachments, { ...newAttachment }];
			newAttachment = { filename: '', url: '' };
		}
	}

	function removeAttachment(index: number) {
		attachments = attachments.filter((_, i) => i !== index);
	}

	async function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		const result = await fileUpload.uploadFile(file);
		if (result) {
			attachments = [...attachments, result];
		}
		input.value = ''; // Reset input
	}

	async function handleDrop(e: DragEvent) {
		const result = await fileUpload.handleDrop(e);
		if (result) {
			attachments = [...attachments, result];
		}
	}
</script>

<div class="modal-overlay" onclick={onClose}>
	<div class="modal-content" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2>공고 수동 추가</h2>
			<button class="close-button" onclick={onClose}>✕</button>
		</div>

		<!-- Registration Location Badge -->
		<div class="location-badge-container">
			<div class="location-badge">
				<span class="location-icon">📍</span>
				<span class="location-text">등록 위치: <strong>{locationDisplay}</strong></span>
			</div>
		</div>

		<form class="modal-body" onsubmit={handleSubmit}>
			<!-- Title (Required) -->
			<div class="form-group">
				<label for="title">제목 <span class="required">*</span></label>
				<Input
					id="title"
					type="text"
					placeholder="공고 제목을 입력하세요"
					bind:value={formData.title}
					required
				/>
			</div>

			<!-- Content Type -->
			<div class="form-group">
				<label for="content_type">내용 유형</label>
				<select id="content_type" class="select" bind:value={formData.content_type}>
					<option value="text">텍스트</option>
					<option value="html">HTML</option>
				</select>
			</div>

			<!-- Content -->
			<div class="form-group">
				<label for="content">내용</label>
				<textarea
					id="content"
					class="textarea"
					placeholder={formData.content_type === 'html' ? 'HTML 내용을 입력하세요' : '공고 내용을 입력하세요'}
					bind:value={formData.content}
					rows="6"
				></textarea>
			</div>

			<!-- Link -->
			<div class="form-group">
				<label for="link">링크</label>
				<Input
					id="link"
					type="url"
					placeholder="https://example.com/notice"
					bind:value={formData.link}
				/>
			</div>

			<!-- Organization & Department -->
			<div class="form-row">
				<div class="form-group">
					<label for="organization">기관</label>
					<Input
						id="organization"
						type="text"
						placeholder="예: 전북테크노파크"
						bind:value={formData.organization}
					/>
				</div>
				<div class="form-group">
					<label for="department">부서</label>
					<Input
						id="department"
						type="text"
						placeholder="예: 바이오사업단"
						bind:value={formData.department}
					/>
				</div>
			</div>

			<!-- Contact -->
			<div class="form-group">
				<label for="contact">연락처</label>
				<Input
					id="contact"
					type="text"
					placeholder="예: 063-123-4567"
					bind:value={formData.contact}
				/>
			</div>

			<!-- Dates -->
			<div class="form-row">
				<div class="form-group">
					<label for="announcement_date">공고일</label>
					<Input
						id="announcement_date"
						type="date"
						bind:value={formData.announcement_date}
					/>
				</div>
				<div class="form-group">
					<label for="deadline">마감일</label>
					<Input id="deadline" type="datetime-local" bind:value={formData.deadline} />
				</div>
			</div>

			<!-- Application Period -->
			<div class="form-row">
				<div class="form-group">
					<label for="application_start">신청 시작</label>
					<Input
						id="application_start"
						type="datetime-local"
						bind:value={formData.application_start}
					/>
				</div>
				<div class="form-group">
					<label for="application_end">신청 종료</label>
					<Input
						id="application_end"
						type="datetime-local"
						bind:value={formData.application_end}
					/>
				</div>
			</div>

			<!-- Tags -->
			<div class="form-group">
				<label>태그</label>
				{#if loadingTags}
					<p class="loading-text">태그 로딩 중...</p>
				{:else if availableTags.length > 0}
					<div class="tag-selector">
						{#each availableTags as tag}
							<button
								type="button"
								class="tag-button"
								class:selected={selectedTags.includes(tag.name)}
								onclick={() => toggleTag(tag.name)}
								style="--tag-color: {tag.color_hex || '#666'}"
							>
								{tag.name}
							</button>
						{/each}
					</div>
				{:else}
					<p class="no-tags-text">사용 가능한 태그가 없습니다</p>
				{/if}
			</div>

			<!-- Attachments -->
			<div class="form-group">
				<label>첨부파일</label>

				<!-- Attachment Mode Toggle -->
				<div class="attachment-mode-toggle">
					<button
						type="button"
						class="mode-button"
						class:active={attachmentMode === 'url'}
						onclick={() => (attachmentMode = 'url')}
					>
						URL 입력
					</button>
					<button
						type="button"
						class="mode-button"
						class:active={attachmentMode === 'upload'}
						onclick={() => (attachmentMode = 'upload')}
					>
						파일 업로드
					</button>
				</div>

				<!-- Attachment List -->
				{#if attachments.length > 0}
					<div class="attachment-list">
						{#each attachments as attachment, index}
							<div class="attachment-item">
								<span class="attachment-icon">📎</span>
								<span class="attachment-name">{attachment.filename}</span>
								<button
									type="button"
									class="remove-button"
									onclick={() => removeAttachment(index)}
								>
									✕
								</button>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Add Attachment Form -->
				{#if attachmentMode === 'url'}
					<div class="attachment-input-group">
						<Input
							type="text"
							placeholder="파일명 (예: 신청서.hwp)"
							bind:value={newAttachment.filename}
						/>
						<Input
							type="url"
							placeholder="파일 URL"
							bind:value={newAttachment.url}
						/>
						<button
							type="button"
							class="add-attachment-button"
							onclick={addAttachment}
							disabled={!newAttachment.filename.trim() || !newAttachment.url.trim()}
						>
							추가
						</button>
					</div>
				{:else}
					<div
						class="file-upload-area"
						class:dragging={fileUpload.isDragging}
						ondragenter={fileUpload.handleDragEnter}
						ondragleave={fileUpload.handleDragLeave}
						ondragover={fileUpload.handleDragOver}
						ondrop={handleDrop}
					>
						<input
							type="file"
							id="file-upload"
							class="file-input"
							accept=".pdf,.hwp,.docx,.doc,.xls,.xlsx,.zip,.jpg,.jpeg,.png"
							onchange={handleFileUpload}
							disabled={fileUpload.uploading}
						/>
						<label for="file-upload" class="file-upload-label">
							{#if fileUpload.uploading}
								<span class="upload-icon">⏳</span>
								<span>업로드 중...</span>
							{:else if fileUpload.isDragging}
								<span class="upload-icon">📥</span>
								<span>파일을 여기에 놓으세요</span>
							{:else}
								<span class="upload-icon">📎</span>
								<span>파일을 드래그하거나 클릭하여 선택</span>
							{/if}
						</label>
						<p class="file-upload-hint">PDF, HWP, DOC, XLS, ZIP, 이미지 (최대 10MB)</p>
					</div>
				{/if}
			</div>
		</form>

		<div class="modal-footer">
			<Button variant="outline" onclick={onClose} disabled={submitting}>취소</Button>
			<Button onclick={handleSubmit} disabled={submitting}>
				{submitting ? '추가 중...' : '공고 추가'}
			</Button>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.modal-content {
		background-color: var(--bg);
		width: 100%;
		max-width: 700px;
		max-height: 90vh;
		overflow-y: auto;
		border: var(--border-width) solid var(--hair);
		animation: modal-in 0.2s var(--ease-out);
	}

	@keyframes modal-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-5);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.location-badge-container {
		padding: var(--space-4) var(--space-5) 0;
	}

	.location-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		font-size: var(--text-sm);
		color: var(--muted);
	}

	.location-icon {
		font-size: var(--text-base);
	}

	.location-text strong {
		color: var(--fg);
		font-weight: var(--font-semibold);
	}

	.modal-header h2 {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.close-button {
		padding: var(--space-2) var(--space-3);
		background: none;
		border: none;
		color: var(--muted);
		font-size: var(--text-lg);
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.close-button:hover {
		color: var(--fg);
	}

	.modal-body {
		padding: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.form-group label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
	}

	.required {
		color: red;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}

	.textarea {
		width: 100%;
		padding: var(--space-3);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--fg);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		resize: vertical;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.textarea:focus {
		outline: none;
		border-color: var(--fg);
	}

	.select {
		width: 100%;
		padding: var(--space-3);
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--fg);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		cursor: pointer;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.select:focus {
		outline: none;
		border-color: var(--fg);
	}

	.loading-text,
	.no-tags-text {
		font-size: var(--text-sm);
		color: var(--muted);
		padding: var(--space-3);
	}

	.tag-selector {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.tag-button {
		padding: var(--space-2) var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--muted);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.tag-button:hover {
		border-color: var(--fg);
		color: var(--fg);
	}

	.tag-button.selected {
		background-color: var(--tag-color, var(--fg));
		color: var(--bg);
		border-color: var(--tag-color, var(--fg));
	}

	/* Attachment Mode Toggle */
	.attachment-mode-toggle {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.mode-button {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--muted);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.mode-button:hover {
		border-color: var(--fg);
		color: var(--fg);
	}

	.mode-button.active {
		background-color: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	/* File Upload */
	.file-upload-area {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		border: 2px dashed var(--hair);
		background-color: var(--surface-1);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.file-upload-area.dragging {
		border-color: var(--fg);
		background-color: var(--bg);
		border-width: 2px;
	}

	.file-input {
		display: none;
	}

	.file-upload-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-5) var(--space-4);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-align: center;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.file-upload-label:hover {
		background-color: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	.upload-icon {
		font-size: var(--text-2xl);
	}

	.file-upload-hint {
		font-size: var(--text-xs);
		color: var(--muted);
		text-align: center;
		margin: 0;
	}

	/* Attachments */
	.attachment-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
		padding: var(--space-3);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	.attachment-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
	}

	.attachment-icon {
		flex-shrink: 0;
		font-size: var(--text-sm);
	}

	.attachment-name {
		flex: 1;
		font-size: var(--text-sm);
		color: var(--fg);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.remove-button {
		padding: var(--space-1) var(--space-2);
		background: none;
		border: var(--border-width) solid var(--hair);
		color: var(--muted);
		font-size: var(--text-sm);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.remove-button:hover {
		background-color: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	.attachment-input-group {
		display: grid;
		grid-template-columns: 1fr 2fr auto;
		gap: var(--space-2);
		align-items: end;
	}

	.add-attachment-button {
		padding: var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		white-space: nowrap;
	}

	.add-attachment-button:hover:not(:disabled) {
		background-color: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	.add-attachment-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		padding: var(--space-5);
		border-top: var(--border-width) solid var(--hair);
	}

	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.modal-content {
			max-height: 95vh;
		}

		.attachment-input-group {
			grid-template-columns: 1fr;
		}
	}
</style>
