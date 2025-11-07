<script lang="ts">
	/**
	 * Docker 컨테이너 목록 컴포넌트
	 *
	 * 실행 중인 Docker 컨테이너 목록을 테이블 형식으로 표시합니다.
	 * 컨테이너 상태, 헬스체크, 이미지, 크기 등의 정보를 제공합니다.
	 *
	 * @component
	 */

	import type { ContainerInfo } from '$lib/types/system-monitor';
	import {
		formatBytes,
		formatRelativeTime,
		getContainerStatusColor,
		getHealthStatusColor
	} from '$lib/api/system-monitor-api';

	/**
	 * Props
	 */

	/** 컨테이너 목록 */
	export let containers: ContainerInfo[] = [];

	/** 로딩 상태 */
	export let loading: boolean = false;

	/** 에러 메시지 */
	export let error: string | null = null;

	/**
	 * Event handlers
	 */

	/** 컨테이너 클릭 이벤트 */
	function handleContainerClick(container: ContainerInfo) {
		// 로그 조회 페이지로 이동하는 이벤트 발생
		const event = new CustomEvent('container-select', {
			detail: { containerName: container.name }
		});
		document.dispatchEvent(event);
	}
</script>

<div class="card bg-base-100 shadow-md">
	<div class="card-body">
		<!-- 헤더 -->
		<div class="flex items-center justify-between mb-4">
			<h3 class="card-title text-lg flex items-center gap-2">
				<span class="text-2xl">🐳</span>
				Docker 컨테이너
			</h3>
			<div class="badge badge-primary badge-lg">
				{containers.length}개
			</div>
		</div>

		<!-- 로딩 상태 -->
		{#if loading}
			<div class="flex justify-center items-center py-12">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{:else if error}
			<!-- 에러 상태 -->
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current shrink-0 h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>{error}</span>
			</div>
		{:else if containers.length === 0}
			<!-- 빈 상태 -->
			<div class="text-center py-12 text-gray-500">
				<p class="text-lg mb-2">컨테이너가 없습니다</p>
				<p class="text-sm">실행 중인 Docker 컨테이너를 찾을 수 없습니다.</p>
			</div>
		{:else}
			<!-- 테이블 -->
			<div class="overflow-x-auto">
				<table class="table table-zebra">
					<thead>
						<tr>
							<th>컨테이너</th>
							<th>상태</th>
							<th>헬스</th>
							<th>이미지</th>
							<th>크기</th>
							<th>생성 시각</th>
						</tr>
					</thead>
					<tbody>
						{#each containers as container}
							<tr
								class="hover:bg-base-200 cursor-pointer transition-colors"
								on:click={() => handleContainerClick(container)}
								on:keypress={(e) => e.key === 'Enter' && handleContainerClick(container)}
								tabindex="0"
								role="button"
							>
								<!-- 컨테이너 이름 -->
								<td>
									<div class="flex flex-col">
										<span class="font-semibold text-sm">{container.name}</span>
										<span class="text-xs text-gray-500 font-mono">{container.id}</span>
									</div>
								</td>

								<!-- 상태 -->
								<td>
									<span class={`badge badge-sm ${getContainerStatusColor(container.status)}`}>
										{container.status}
									</span>
								</td>

								<!-- 헬스체크 -->
								<td>
									{#if container.health}
										<span class={`font-semibold ${getHealthStatusColor(container.health)}`}>
											{container.health === 'healthy' ? '✓' : '✗'}
											{container.health}
										</span>
									{:else}
										<span class="text-gray-400 text-sm">N/A</span>
									{/if}
								</td>

								<!-- 이미지 -->
								<td>
									<div class="max-w-xs truncate text-sm" title={container.image}>
										{container.image}
									</div>
								</td>

								<!-- 크기 -->
								<td>
									<span class="text-sm font-mono">{formatBytes(container.size)}</span>
								</td>

								<!-- 생성 시각 -->
								<td>
									<div class="flex flex-col">
										<span class="text-sm">{formatRelativeTime(container.created)}</span>
										{#if container.started}
											<span class="text-xs text-gray-500">
												시작: {formatRelativeTime(container.started)}
											</span>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- 푸터: 요약 정보 -->
			<div class="divider my-2"></div>
			<div class="flex justify-between text-sm text-gray-600">
				<span>총 {containers.length}개 컨테이너</span>
				<span>
					실행 중: <strong>{containers.filter((c) => c.status === 'running').length}</strong>개
				</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.table {
		font-size: 0.875rem;
	}

	.table th {
		background-color: hsl(var(--b2));
		font-weight: 600;
		text-transform: uppercase;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
	}

	.table td {
		padding: 0.75rem 1rem;
	}

	tr[role='button']:focus {
		outline: 2px solid hsl(var(--p));
		outline-offset: -2px;
	}
</style>
