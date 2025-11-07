<script lang="ts">
	/**
	 * 리소스 알림 배너 컴포넌트
	 *
	 * 시스템 리소스 사용량이 임계값을 초과했을 때 알림을 표시합니다.
	 * 경고(warning) 및 위험(critical) 레벨을 시각적으로 구분합니다.
	 *
	 * @component
	 */

	import type { ResourceAlert } from '$lib/types/system-monitor';
	import { getAlertLevelColor } from '$lib/api/system-monitor-api';
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

	/** 아이콘 맵핑 */
	function getAlertIcon(level: string): string {
		return level === 'critical' ? '🚨' : '⚠️';
	}

	/** 리소스 타입 한글 변환 */
	function getResourceTypeKo(type: string): string {
		const typeMap: Record<string, string> = {
			memory: '메모리',
			disk: '디스크',
			cpu: 'CPU'
		};
		return typeMap[type] || type;
	}
</script>

{#if visibleAlerts.length > 0}
	<div class="space-y-2 mb-6" transition:fade={{ duration: 200 }}>
		{#each visibleAlerts as alert (alert.timestamp)}
			<div
				class={`alert ${getAlertLevelColor(alert.level)} border shadow-md`}
				transition:slide={{ duration: 300 }}
			>
				<div class="flex-1 flex items-center gap-3">
					<!-- 아이콘 -->
					<span class="text-2xl">{getAlertIcon(alert.level)}</span>

					<!-- 메시지 -->
					<div class="flex-1">
						<h4 class="font-bold text-sm">
							{getResourceTypeKo(alert.resource_type)} 사용량 {alert.level === 'critical'
								? '위험'
								: '경고'}
						</h4>
						<p class="text-sm mt-1">{alert.message}</p>
						<div class="flex gap-4 mt-2 text-xs opacity-80">
							<span>현재: {alert.current_value.toFixed(1)}%</span>
							<span>임계값: {alert.threshold.toFixed(0)}%</span>
							<span>
								발생 시각: {new Date(alert.timestamp).toLocaleTimeString('ko-KR', {
									hour12: false
								})}
							</span>
						</div>
					</div>

					<!-- 닫기 버튼 -->
					{#if dismissible}
						<button
							class="btn btn-sm btn-ghost btn-circle"
							on:click={() => dismissAlert(alert)}
							aria-label="알림 닫기"
						>
							✕
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.alert {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
