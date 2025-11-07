<script lang="ts">
	/**
	 * 리소스 사용률 카드 컴포넌트
	 *
	 * 메모리, 디스크, CPU 등의 리소스 사용률을 시각적으로 표시합니다.
	 * 프로그레스 바와 상세 정보를 포함하며, 임계값 초과 시 색상이 변경됩니다.
	 *
	 * @component
	 * @example
	 * ```svelte
	 * <ResourceCard
	 *   title="메모리"
	 *   icon="💾"
	 *   used={8}
	 *   total={16}
	 *   percent={50}
	 *   unit="GB"
	 * />
	 * ```
	 */

	import { formatBytes } from '$lib/api/system-monitor-api';

	/**
	 * Props
	 */

	/** 리소스 이름 */
	export let title: string;

	/** 아이콘 (이모지 또는 SVG) */
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

	/** 프로그레스 바 색상 클래스 */
	$: progressColor =
		percent >= criticalThreshold
			? 'bg-red-600'
			: percent >= warningThreshold
				? 'bg-yellow-500'
				: 'bg-green-500';

	/** 텍스트 색상 클래스 */
	$: textColor =
		percent >= criticalThreshold
			? 'text-red-600'
			: percent >= warningThreshold
				? 'text-yellow-600'
				: 'text-green-600';

	/** 배경 색상 클래스 */
	$: bgColor =
		percent >= criticalThreshold
			? 'bg-red-50'
			: percent >= warningThreshold
				? 'bg-yellow-50'
				: 'bg-green-50';
</script>

<div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
	<div class="card-body">
		<!-- 헤더: 아이콘 + 제목 + 사용률 -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<span class="text-2xl">{icon}</span>
				<h3 class="card-title text-lg">{title}</h3>
			</div>
			<div class={`font-bold text-2xl ${textColor}`}>
				{percent.toFixed(1)}%
			</div>
		</div>

		<!-- 프로그레스 바 -->
		<div class="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
			<div
				class={`h-full ${progressColor} transition-all duration-500 ease-out`}
				style="width: {percent}%"
			></div>
		</div>

		<!-- 상세 정보: 사용량 / 총 용량 -->
		<div class="flex justify-between text-sm text-gray-600 mb-2">
			<span>사용 중</span>
			<span class="font-semibold">{displayUsed}</span>
		</div>

		<div class="flex justify-between text-sm text-gray-600">
			<span>총 용량</span>
			<span class="font-semibold">{displayTotal}</span>
		</div>

		<!-- 추가 정보 (optional) -->
		{#if additional.length > 0}
			<div class="divider my-2"></div>
			{#each additional as info}
				<div class="flex justify-between text-sm text-gray-600">
					<span>{info.label}</span>
					<span class="font-semibold">{info.value}</span>
				</div>
			{/each}
		{/if}

		<!-- 알림 배지 (임계값 초과 시) -->
		{#if percent >= warningThreshold}
			<div class={`badge badge-sm mt-3 ${bgColor} ${textColor} border-none`}>
				{#if percent >= criticalThreshold}
					⚠️ 위험 수준
				{:else}
					⚡ 주의 필요
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.card {
		min-height: 220px;
	}

	.card-body {
		padding: 1.5rem;
	}
</style>
