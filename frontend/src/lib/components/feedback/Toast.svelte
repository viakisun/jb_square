<script lang="ts">
	/**
	 * JB SQUARE Toast Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Notification system with auto-dismiss
	 *
	 * Usage:
	 * import { toast } from '$lib/stores/toast';
	 * toast.success('Operation successful!');
	 * toast.error('An error occurred', 'Error');
	 */

	import { toast, type Toast } from '$lib/stores/toast';
	import { fly, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let toasts = $state<Toast[]>([]);

	toast.subscribe((value) => {
		toasts = value;
	});

	function handleDismiss(id: string) {
		toast.dismiss(id);
	}

	function getIcon(type: string) {
		const icons = {
			success: '✓',
			error: '✕',
			warning: '!',
			info: 'i'
		};
		return icons[type as keyof typeof icons] || '■';
	}
</script>

<div class="toast-container" aria-live="polite" aria-atomic="true">
	{#each toasts as item (item.id)}
		<div
			class="toast toast-{item.type}"
			in:fly={{ x: 300, duration: 300, easing: quintOut }}
			out:fade={{ duration: 150 }}
			role="status"
		>
			<div class="toast-icon" aria-hidden="true">
				{getIcon(item.type)}
			</div>

			<div class="toast-content">
				{#if item.title}
					<div class="toast-title">{item.title}</div>
				{/if}
				<div class="toast-message">{item.message}</div>
			</div>

			<button
				type="button"
				class="toast-close"
				onclick={() => handleDismiss(item.id)}
				aria-label="Close notification"
			>
				✕
			</button>
		</div>
	{/each}
</div>

<style>
	/* ========================================
     TOAST CONTAINER
     ======================================== */

	.toast-container {
		position: fixed;
		top: var(--topbar-height);
		right: 0;
		z-index: var(--z-toast);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		pointer-events: none;
		max-width: var(--toast-width);
	}

	/* ========================================
     TOAST
     ======================================== */

	.toast {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--bg);
		border: var(--border-width) solid var(--fg);
		box-shadow: var(--shadow-lg);
		pointer-events: auto;
		width: var(--toast-width);
		animation: slide-in-right var(--duration-base) var(--ease-out-expo);
	}

	/* ========================================
     TOAST TYPES
     ======================================== */

	.toast-success {
		border-color: var(--color-success);
		background-color: var(--color-success-bg);
	}

	.toast-error {
		border-color: var(--color-error);
		background-color: var(--color-error-bg);
	}

	.toast-warning {
		border-color: var(--color-warning);
		background-color: var(--color-warning-bg);
	}

	.toast-info {
		border-color: var(--color-info);
		background-color: var(--color-info-bg);
	}

	/* ========================================
     TOAST ICON
     ======================================== */

	.toast-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		font-size: var(--text-base);
		font-weight: var(--font-bold);
		color: var(--fg);
	}

	/* ========================================
     TOAST CONTENT
     ======================================== */

	.toast-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.toast-title {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--fg);
		letter-spacing: var(--tracking-normal);
	}

	.toast-message {
		font-size: var(--text-sm);
		color: var(--fg);
		line-height: var(--leading-normal);
	}

	/* ========================================
     TOAST CLOSE BUTTON
     ======================================== */

	.toast-close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		padding: 0;
		background: none;
		border: none;
		color: var(--muted);
		cursor: pointer;
		font-size: var(--text-sm);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.toast-close:hover {
		color: var(--fg);
	}

	.toast-close:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: -2px;
	}

	/* ========================================
     ANIMATIONS
     ======================================== */

	@keyframes slide-in-right {
		from {
			opacity: 0;
			transform: translateX(100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 768px) {
		.toast-container {
			left: 0;
			right: 0;
			max-width: 100%;
		}

		.toast {
			width: 100%;
		}
	}

	/* ========================================
     REDUCED MOTION
     ======================================== */

	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation: none;
		}
	}
</style>
