<script lang="ts">
	/**
	 * 리소스 알림 배너 컴포넌트
	 *
	 * BLACK/WHITE/ZERO-ROUND/INDUSTRIAL 디자인 시스템 적용
	 * monochrome 스타일로 시스템 리소스 경고/위험 알림 표시
	 *
	 * @component
	 */

	import type { ResourceAlert } from '$lib/types/system-monitor';
	import { fade, slide } from 'svelte/transition';

	/**
	 * Props
	 */

	/** 알림 목록 */
	export let alerts: ResourceAlert[] = [];

	/** 알림 닫기 가능 여부 */
	export let dismissible: boolean = true;

	/**
	 * State
	 */

	/** 닫힌 알림 ID 목록 */
	let dismissedAlerts: Set<string> = new Set();

	/**
	 * Event handlers
	 */

	/** 알림 닫기 핸들러 */
	function dismissAlert(alert: ResourceAlert) {
		const alertId = `${alert.resource_type}_${alert.timestamp}`;
		dismissedAlerts.add(alertId);
		dismissedAlerts = dismissedAlerts; // Trigger reactivity
	}

	/**
	 * Computed properties
	 */

	/** 표시할 알림 목록 (닫히지 않은 알림만) */
	$: visibleAlerts = alerts.filter((alert) => {
		const alertId = `${alert.resource_type}_${alert.timestamp}`;
		return !dismissedAlerts.has(alertId);
	});

	/**
	 * Utility functions
	 */

	/** 알림 아이콘 (monochrome - black square) */
	function getAlertIcon(level: string): string {
		return level === 'critical' ? '■' : '■';
	}

	/** 알림 레벨 표시 텍스트 */
	function getAlertLevelText(level: string): string {
		return level === 'critical' ? '위험' : '경고';
	}

	/** 리소스 타입 한글 변환 */
	function getResourceTypeKo(type: string): string {
		const typeMap: Record<string, string> = {
			memory: '메모리',
			disk: '디스크',
			cpu: 'CPU'
		};
		return typeMap[type] || type.toUpperCase();
	}

	/** 시간 포맷 */
	function formatTime(timestamp: string): string {
		return new Date(timestamp).toLocaleTimeString('ko-KR', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}
</script>

{#if visibleAlerts.length > 0}
	<div class="alerts-container" transition:fade={{ duration: 200 }}>
		{#each visibleAlerts as alert (alert.timestamp)}
			<div
				class="alert-banner"
				class:alert-critical={alert.level === 'critical'}
				class:alert-warning={alert.level === 'warning'}
				transition:slide={{ duration: 300 }}
			>
				<!-- 알림 아이콘 -->
				<div class="alert-icon">{getAlertIcon(alert.level)}</div>

				<!-- 알림 내용 -->
				<div class="alert-content">
					<!-- 제목 -->
					<h4 class="alert-title">
						{getResourceTypeKo(alert.resource_type)} 사용량 {getAlertLevelText(alert.level)}
					</h4>

					<!-- 메시지 -->
					<p class="alert-message">{alert.message}</p>

					<!-- 상세 정보 -->
					<div class="alert-details">
						<span class="detail-item">현재: {alert.current_value.toFixed(1)}%</span>
						<span class="detail-separator">|</span>
						<span class="detail-item">임계값: {alert.threshold.toFixed(0)}%</span>
						<span class="detail-separator">|</span>
						<span class="detail-item">발생: {formatTime(alert.timestamp)}</span>
					</div>
				</div>

				<!-- 닫기 버튼 -->
				{#if dismissible}
					<button class="close-btn" on:click={() => dismissAlert(alert)} aria-label="알림 닫기">
						✕
					</button>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	/* ========================================
	   ALERTS CONTAINER
	   ======================================== */

	.alerts-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
	}

	/* ========================================
	   ALERT BANNER
	   ======================================== */

	.alert-banner {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		animation: slideIn 0.3s var(--ease-out);
	}

	/* 경고 레벨 스타일 (monochrome) */
	.alert-banner.alert-warning {
		border-color: rgba(0, 0, 0, 0.6);
		background-color: var(--surface-1);
	}

	.alert-banner.alert-critical {
		border-color: var(--fg);
		background-color: rgba(0, 0, 0, 0.05);
		border-width: 2px;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ========================================
	   ALERT ICON
	   ======================================== */

	.alert-icon {
		font-size: var(--text-2xl);
		color: var(--fg);
		line-height: 1;
		flex-shrink: 0;
	}

	.alert-critical .alert-icon {
		font-size: var(--text-3xl);
	}

	/* ========================================
	   ALERT CONTENT
	   ======================================== */

	.alert-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	/* 제목 */
	.alert-title {
		font-size: var(--text-sm);
		font-weight: var(--font-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--fg);
		line-height: 1.2;
	}

	.alert-critical .alert-title {
		font-size: var(--text-base);
	}

	/* 메시지 */
	.alert-message {
		font-size: var(--text-sm);
		color: var(--fg);
		line-height: 1.4;
	}

	/* 상세 정보 */
	.alert-details {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.detail-item {
		font-size: var(--text-xs);
		font-variant-numeric: tabular-nums;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.detail-separator {
		font-size: var(--text-xs);
		color: var(--hair);
	}

	/* ========================================
	   CLOSE BUTTON
	   ======================================== */

	.close-btn {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: transparent;
		border: var(--border-width) solid var(--hair);
		color: var(--fg);
		font-size: var(--text-sm);
		line-height: 1;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.close-btn:hover {
		background-color: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}
</style>
