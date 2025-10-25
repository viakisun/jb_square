/**
 * JB SQUARE Toast Store
 * Global toast notification system
 */

import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	title?: string;
	message: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function add(toast: Omit<Toast, 'id'>) {
		const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
		const duration = toast.duration ?? 5000;

		const newToast: Toast = {
			...toast,
			id,
			duration
		};

		update((toasts) => [...toasts, newToast]);

		// Auto-dismiss after duration
		if (duration > 0) {
			setTimeout(() => {
				dismiss(id);
			}, duration);
		}

		return id;
	}

	function dismiss(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	function dismissAll() {
		update(() => []);
	}

	// Convenience methods
	function success(message: string, title?: string, duration?: number) {
		return add({ type: 'success', message, title, duration });
	}

	function error(message: string, title?: string, duration?: number) {
		return add({ type: 'error', message, title, duration });
	}

	function warning(message: string, title?: string, duration?: number) {
		return add({ type: 'warning', message, title, duration });
	}

	function info(message: string, title?: string, duration?: number) {
		return add({ type: 'info', message, title, duration });
	}

	return {
		subscribe,
		add,
		dismiss,
		dismissAll,
		success,
		error,
		warning,
		info
	};
}

export const toast = createToastStore();
