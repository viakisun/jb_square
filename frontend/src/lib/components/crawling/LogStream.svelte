<script lang="ts">
	/**
	 * JB SQUARE LogStream Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Terminal-style 실시간 로그 스트림
	 *
	 * Usage:
	 * <LogStream logs={logMessages} />
	 */

	import { onMount } from 'svelte';

	interface LogEntry {
		timestamp: string;
		message: string;
		type?: 'info' | 'success' | 'error' | 'warning';
	}

	interface LogStreamProps {
		logs: LogEntry[];
		maxHeight?: string;
		autoScroll?: boolean;
		showTimestamp?: boolean;
		class?: string;
	}

	let {
		logs = [],
		maxHeight = '400px',
		autoScroll = true,
		showTimestamp = true,
		class: className = ''
	}: LogStreamProps = $props();

	let logContainer: HTMLDivElement;

	// Auto-scroll to bottom when new logs arrive
	$effect(() => {
		if (autoScroll && logContainer) {
			logContainer.scrollTop = logContainer.scrollHeight;
		}
	});

	function formatTimestamp(timestamp: string): string {
		try {
			const date = new Date(timestamp);
			return date.toLocaleTimeString('ko-KR', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
		} catch {
			return timestamp;
		}
	}

	function getLogIcon(type?: string): string {
		switch (type) {
			case 'success':
				return '✓';
			case 'error':
				return '✗';
			case 'warning':
				return '⚠';
			default:
				return '■';
		}
	}
</script>

<div class="log-stream {className}">
	<div class="log-header">
		<span class="log-title">■ LOGS</span>
		<span class="log-count">{logs.length} entries</span>
	</div>

	<div class="log-container" bind:this={logContainer} style:max-height={maxHeight}>
		{#if logs.length === 0}
			<div class="log-empty">
				<span class="empty-icon">□</span>
				<span class="empty-text">No logs yet...</span>
			</div>
		{:else}
			{#each logs as log, index (index)}
				<div class="log-entry log-{log.type || 'info'}">
					{#if showTimestamp}
						<span class="log-timestamp">{formatTimestamp(log.timestamp)}</span>
					{/if}
					<span class="log-icon">{getLogIcon(log.type)}</span>
					<span class="log-message">{log.message}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	/* ========================================
     LOG STREAM WRAPPER
     ======================================== */

	.log-stream {
		display: flex;
		flex-direction: column;
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
	}

	/* ========================================
     LOG HEADER
     ======================================== */

	.log-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		background-color: var(--surface-1);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.log-title {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--fg);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}

	.log-count {
		font-size: var(--text-xs);
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	/* ========================================
     LOG CONTAINER
     ======================================== */

	.log-container {
		overflow-y: auto;
		overflow-x: hidden;
		background-color: var(--bg);
		font-family: 'Pretendard Variable', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono',
			Consolas, 'Courier New', monospace;
	}

	/* Custom scrollbar */
	.log-container::-webkit-scrollbar {
		width: 8px;
	}

	.log-container::-webkit-scrollbar-track {
		background: var(--surface-1);
	}

	.log-container::-webkit-scrollbar-thumb {
		background: var(--hair);
	}

	.log-container::-webkit-scrollbar-thumb:hover {
		background: var(--muted);
	}

	/* ========================================
     LOG ENTRY
     ======================================== */

	.log-entry {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		border-bottom: var(--border-width) solid var(--ghost);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.log-entry:last-child {
		border-bottom: none;
	}

	.log-entry:hover {
		background-color: var(--ghost);
	}

	/* Log entry types */
	.log-entry.log-error {
		background-color: rgba(0, 0, 0, 0.02);
	}

	.log-entry.log-success {
		background-color: rgba(0, 0, 0, 0.01);
	}

	.log-timestamp {
		flex-shrink: 0;
		font-size: var(--text-xs);
		color: var(--subtle);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-tight);
		min-width: 65px;
	}

	.log-icon {
		flex-shrink: 0;
		color: var(--fg);
		font-size: var(--text-xs);
	}

	.log-message {
		flex: 1;
		color: var(--fg);
		word-break: break-word;
	}

	/* ========================================
     EMPTY STATE
     ======================================== */

	.log-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-16) var(--space-8);
		color: var(--subtle);
	}

	.empty-icon {
		font-size: 48px;
		opacity: 0.5;
	}

	.empty-text {
		font-size: var(--text-sm);
	}

	/* ========================================
     REDUCED MOTION
     ======================================== */

	@media (prefers-reduced-motion: reduce) {
		.log-entry {
			transition: none;
		}
	}
</style>
