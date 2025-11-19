<script lang="ts">
	/**
	 * RejectReasonModal - Modal for entering reject reason
	 */

	import { Button } from '$lib/components/ui/buttons';

	type Props = {
		open: boolean;
		count: number;
		loading: boolean;
		onClose: () => void;
		onSubmit: (reason: string) => void;
	};

	let { open, count, loading, onClose, onSubmit }: Props = $props();

	let reason = $state('');

	function handleSubmit() {
		onSubmit(reason);
		reason = ''; // Reset after submit
	}

	function handleOverlayClick() {
		if (!loading) {
			onClose();
		}
	}
</script>

{#if open}
	<div class="modal-overlay" onclick={handleOverlayClick}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>반려 사유 입력</h3>
				<button class="modal-close" onclick={onClose} disabled={loading}>×</button>
			</div>
			<div class="modal-body">
				<p class="modal-description">
					선택한 {count}개 항목을 반려합니다. 반려 사유를 입력해주세요. (선택사항)
				</p>
				<textarea
					bind:value={reason}
					placeholder="반려 사유를 입력하세요..."
					rows="4"
					class="reason-textarea"
					disabled={loading}
				></textarea>
			</div>
			<div class="modal-footer">
				<Button variant="outline" onclick={onClose} disabled={loading}>취소</Button>
				<Button variant="primary" onclick={handleSubmit} disabled={loading}>
					반려 확인
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.modal-header h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.modal-close {
		background: none;
		border: none;
		font-size: var(--text-2xl);
		cursor: pointer;
		color: var(--muted);
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
	}

	.modal-close:hover {
		color: var(--fg);
	}

	.modal-close:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.modal-body {
		padding: var(--space-6);
	}

	.modal-description {
		font-size: var(--text-sm);
		color: var(--muted);
		margin-bottom: var(--space-4);
		line-height: 1.6;
	}

	.reason-textarea {
		width: 100%;
		padding: var(--space-3);
		border: var(--border-width) solid var(--hair);
		background: var(--surface-0);
		color: var(--fg);
		font-size: var(--text-sm);
		font-family: inherit;
		resize: vertical;
		min-height: 100px;
	}

	.reason-textarea:focus {
		outline: none;
		border-color: var(--fg);
	}

	.reason-textarea:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		padding: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
	}
</style>
