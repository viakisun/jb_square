<script lang="ts">
	/**
	 * 리소스 사용률 카드 컴포넌트
	 *
	 * BLACK/WHITE/ZERO-ROUND/INDUSTRIAL 디자인 시스템 적용
	 * 메모리, 디스크, CPU 등의 리소스 사용률을 monochrome 스타일로 표시
	 *
	 * @component
	 */

	import { formatBytes } from '$lib/api/system-monitor-api';

	/**
	 * Props
	 */

	/** 리소스 이름 */
	export let title: string;

	/** 아이콘 (텍스트/이모지) */
	export let icon: string;

	/** 사용량 (원시 값) */
	export let used: number;

	/** 총 용량 (원시 값) */
	export let total: number;

	/** 사용률 (0-100) */
	export let percent: number;

	/** 단위 (GB, MB, %, 등) */
	export let unit: string = '%';

	/** 바이트 단위 여부 (true면 formatBytes로 변환) */
	export let isBytes: boolean = false;

	/** 추가 정보 (optional) */
	export let additional: Array<{ label: string; value: string }> = [];

	/** 경고 임계값 (기본값: 80%) */
	export let warningThreshold: number = 80;

	/** 위험 임계값 (기본값: 90%) */
	export let criticalThreshold: number = 90;

	/**
	 * Computed properties
	 */

	/** 표시용 사용량 */
	$: displayUsed = isBytes ? formatBytes(used) : `${used.toFixed(1)} ${unit}`;

	/** 표시용 총 용량 */
	$: displayTotal = isBytes ? formatBytes(total) : `${total.toFixed(1)} ${unit}`;

	/** 알림 레벨 결정 */
	$: alertLevel =
		percent >= criticalThreshold ? 'critical' : percent >= warningThreshold ? 'warning' : 'normal';
</script>

<div class="resource-card">
	<!-- 헤더: 아이콘 + 제목 -->
	<div class="card-header">
		<div class="header-left">
			<span class="icon">{icon}</span>
			<h3 class="title">{title}</h3>
		</div>
		<div class="percent-value">{percent.toFixed(1)}%</div>
	</div>

	<!-- 프로그레스 바 -->
	<div class="progress-bar">
		<div
			class="progress-fill"
			class:alert-warning={alertLevel === 'warning'}
			class:alert-critical={alertLevel === 'critical'}
			style="width: {percent}%"
		></div>
	</div>

	<!-- 상세 정보 -->
	<div class="details">
		<div class="detail-row">
			<span class="label">사용 중</span>
			<span class="value">{displayUsed}</span>
		</div>
		<div class="detail-row">
			<span class="label">총 용량</span>
			<span class="value">{displayTotal}</span>
		</div>
	</div>

	<!-- 추가 정보 -->
	{#if additional.length > 0}
		<div class="divider"></div>
		<div class="additional">
			{#each additional as info}
				<div class="detail-row">
					<span class="label">{info.label}</span>
					<span class="value">{info.value}</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- 알림 배지 -->
	{#if alertLevel !== 'normal'}
		<div
			class="alert-badge"
			class:alert-warning={alertLevel === 'warning'}
			class:alert-critical={alertLevel === 'critical'}
		>
			{#if alertLevel === 'critical'}
				■ 위험 수준
			{:else}
				■ 주의 필요
			{/if}
		</div>
	{/if}
</div>

<style>
	/* ========================================
	   RESOURCE CARD
	   ======================================== */

	.resource-card {
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-6);
		transition: border-color var(--duration-base) var(--ease-out);
		min-height: 240px;
		display: flex;
		flex-direction: column;
	}

	.resource-card:hover {
		border-color: var(--fg);
	}

	/* ========================================
	   CARD HEADER
	   ======================================== */

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.icon {
		font-size: var(--text-xs);
		font-weight: var(--font-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		line-height: 1;
		padding: var(--space-1) var(--space-2);
		border: var(--border-width) solid var(--hair);
		background-color: var(--surface-1);
	}

	.title {
		font-size: var(--text-md);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
		line-height: 1;
	}

	.percent-value {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
	}

	/* ========================================
	   PROGRESS BAR
	   ======================================== */

	.progress-bar {
		width: 100%;
		height: 4px;
		background-color: var(--surface-2);
		border: var(--border-width) solid var(--hair);
		margin-bottom: var(--space-4);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background-color: var(--fg);
		transition: width var(--duration-base) var(--ease-out-expo);
	}

	.progress-fill.alert-warning {
		background-color: rgba(0, 0, 0, 0.6);
	}

	.progress-fill.alert-critical {
		background-color: rgba(0, 0, 0, 0.9);
	}

	/* ========================================
	   DETAILS
	   ======================================== */

	.details {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.label {
		font-size: var(--text-sm);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		font-weight: var(--font-medium);
	}

	.value {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		font-variant-numeric: tabular-nums;
	}

	/* ========================================
	   DIVIDER
	   ======================================== */

	.divider {
		height: var(--border-width);
		background-color: var(--hair);
		margin: var(--space-3) 0;
	}

	/* ========================================
	   ADDITIONAL INFO
	   ======================================== */

	.additional {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	/* ========================================
	   ALERT BADGE
	   ======================================== */

	.alert-badge {
		margin-top: auto;
		padding-top: var(--space-3);
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--fg);
	}

	.alert-badge.alert-warning {
		opacity: 0.6;
	}

	.alert-badge.alert-critical {
		opacity: 0.9;
	}
</style>
