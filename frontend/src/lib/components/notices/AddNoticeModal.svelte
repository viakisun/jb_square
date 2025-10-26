<script lang="ts">
	/**
	 * Add Notice Modal
	 * Modal for manually adding a notice
	 */
	import { Button } from '$lib/components/ui/buttons';
	import { Input } from '$lib/components/ui/forms';
	import { toast } from '$lib/stores/toast';

	interface Props {
		category: string;
		sourceId: string;
		onClose: () => void;
		onSuccess: () => void;
	}

	let { category, sourceId, onClose, onSuccess }: Props = $props();

	const API_BASE = 'http://localhost:8000/api';

	// Form state
	let formData = $state({
		title: '',
		content: '',
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
	let submitting = $state(false);

	const availableTags = ['R&D', '바이오', '창업', '기술이전', '스타트업', '지원사업', '전북'];

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error('제목을 입력하세요');
			return;
		}

		submitting = true;

		try {
			const res = await fetch(`${API_BASE}/notices/manual`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formData.title,
					content: formData.content || null,
					link: formData.link || null,
					category,
					tags: selectedTags,
					organization: formData.organization || null,
					department: formData.department || null,
					contact: formData.contact || null,
					deadline: formData.deadline || null,
					application_start: formData.application_start || null,
					application_end: formData.application_end || null,
					announcement_date: formData.announcement_date || null
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
</script>

<div class="modal-overlay" onclick={onClose}>
	<div class="modal-content" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2>공고 수동 추가</h2>
			<button class="close-button" onclick={onClose}>✕</button>
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

			<!-- Content -->
			<div class="form-group">
				<label for="content">내용</label>
				<textarea
					id="content"
					class="textarea"
					placeholder="공고 내용을 입력하세요"
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
				<div class="tag-selector">
					{#each availableTags as tag}
						<button
							type="button"
							class="tag-button"
							class:selected={selectedTags.includes(tag)}
							onclick={() => toggleTag(tag)}
						>
							{tag}
						</button>
					{/each}
				</div>
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
		background-color: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
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
	}
</style>
