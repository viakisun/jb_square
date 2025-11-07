<script lang="ts">
	/**
	 * 시스템 모니터링 페이지
	 *
	 * EC2 서버의 시스템 리소스, Docker 컨테이너, 로그를 모니터링하는 대시보드 페이지입니다.
	 * 실시간 데이터 새로고침과 알림 기능을 제공합니다.
	 *
	 * @page /system-monitor
	 * @author JB Square Dev Team
	 * @date 2025-11-07
	 */

	import { onMount, onDestroy } from 'svelte';
	import type {
		SystemStatus,
		ContainerInfo,
		ImageInfo,
		ResourceAlert
	} from '$lib/types/system-monitor';
	import {
		getSystemStatus,
		getContainers,
		getImages,
		getResourceAlerts,
		formatBytes
	} from '$lib/api/system-monitor-api';

	import ResourceCard from '$lib/components/system/ResourceCard.svelte';
	import ContainerList from '$lib/components/system/ContainerList.svelte';
	import LogViewer from '$lib/components/system/LogViewer.svelte';
	import AlertBanner from '$lib/components/system/AlertBanner.svelte';

	/**
	 * State
	 */

	let systemStatus: SystemStatus | null = null;
	let containers: ContainerInfo[] = [];
	let images: ImageInfo[] = [];
	let alerts: ResourceAlert[] = [];

	let loading: boolean = true;
	let error: string | null = null;

	/** 선택된 컨테이너 (로그 조회용) */
	let selectedContainer: string | null = null;

	/** 자동 새로고침 타이머 */
	let refreshTimer: NodeJS.Timeout | null = null;
	let autoRefresh: boolean = true;
	let refreshInterval: number = 30; // 30초

	/** 탭 상태 */
	type Tab = 'overview' | 'containers' | 'images' | 'logs';
	let activeTab: Tab = 'overview';

	/**
	 * 데이터 로딩 함수
	 */

	async function loadSystemStatus() {
		try {
			systemStatus = await getSystemStatus();
		} catch (err) {
			console.error('Failed to load system status:', err);
			throw err;
		}
	}

	async function loadContainers() {
		try {
			containers = await getContainers(true);
		} catch (err) {
			console.error('Failed to load containers:', err);
			throw err;
		}
	}

	async function loadImages() {
		try {
			images = await getImages();
		} catch (err) {
			console.error('Failed to load images:', err);
			throw err;
		}
	}

	async function loadAlerts() {
		try {
			alerts = await getResourceAlerts();
		} catch (err) {
			console.error('Failed to load alerts:', err);
			// 알림은 실패해도 페이지 로딩을 막지 않음
		}
	}

	async function loadAllData() {
		loading = true;
		error = null;

		try {
			await Promise.all([loadSystemStatus(), loadContainers(), loadImages(), loadAlerts()]);
		} catch (err) {
			error = err instanceof Error ? err.message : '데이터 로딩 실패';
		} finally {
			loading = false;
		}
	}

	/**
	 * Event handlers
	 */

	function handleRefresh() {
		loadAllData();
	}

	function handleContainerSelect(containerName: string) {
		selectedContainer = containerName;
		activeTab = 'logs';
	}

	/**
	 * Lifecycle
	 */

	onMount(() => {
		loadAllData();

		// 컨테이너 선택 이벤트 리스너
		const handleContainerSelectEvent = (e: Event) => {
			const customEvent = e as CustomEvent<{ containerName: string }>;
			handleContainerSelect(customEvent.detail.containerName);
		};
		document.addEventListener('container-select', handleContainerSelectEvent);

		// 자동 새로고침 타이머 시작
		if (autoRefresh) {
			refreshTimer = setInterval(() => {
				if (activeTab !== 'logs') {
					// 로그 탭이 아닐 때만 자동 새로고침
					loadAllData();
				}
			}, refreshInterval * 1000);
		}

		return () => {
			document.removeEventListener('container-select', handleContainerSelectEvent);
		};
	});

	onDestroy(() => {
		if (refreshTimer) {
			clearInterval(refreshTimer);
		}
	});

	/**
	 * Reactive statements
	 */

	// 자동 새로고침 설정 변경 시 타이머 재시작
	$: {
		if (refreshTimer) {
			clearInterval(refreshTimer);
		}

		if (autoRefresh) {
			refreshTimer = setInterval(() => {
				if (activeTab !== 'logs') {
					loadAllData();
				}
			}, refreshInterval * 1000);
		}
	}
</script>

<svelte:head>
	<title>시스템 모니터링 | JB Square Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-6 max-w-7xl">
	<!-- 페이지 헤더 -->
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
		<div>
			<h1 class="text-3xl font-bold flex items-center gap-3">
				<span>🖥️</span>
				시스템 모니터링
			</h1>
			<p class="text-sm text-gray-600 mt-1">
				EC2 서버의 리소스 사용량, Docker 컨테이너 및 로그를 실시간으로 모니터링합니다
			</p>
		</div>

		<!-- 액션 버튼 -->
		<div class="flex gap-2">
			<button class="btn btn-primary btn-sm" on:click={handleRefresh} disabled={loading}>
				{#if loading}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					🔄
				{/if}
				새로고침
			</button>

			<!-- 자동 새로고침 토글 -->
			<div class="dropdown dropdown-end">
				<label tabindex="0" class="btn btn-sm btn-outline">⚙️ 설정</label>
				<div
					tabindex="0"
					class="dropdown-content z-[1] card card-compact w-64 p-4 shadow bg-base-100 mt-2"
				>
					<div class="form-control">
						<label class="label cursor-pointer">
							<span class="label-text">자동 새로고침</span>
							<input type="checkbox" class="toggle toggle-primary" bind:checked={autoRefresh} />
						</label>
					</div>
					{#if autoRefresh}
						<div class="form-control mt-2">
							<label class="label" for="refresh-interval">
								<span class="label-text">새로고침 간격 (초)</span>
							</label>
							<select
								id="refresh-interval"
								class="select select-bordered select-sm"
								bind:value={refreshInterval}
							>
								<option value={10}>10초</option>
								<option value={30}>30초</option>
								<option value={60}>1분</option>
								<option value={300}>5분</option>
							</select>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- 알림 배너 -->
	<AlertBanner {alerts} />

	<!-- 탭 네비게이션 -->
	<div class="tabs tabs-boxed mb-6">
		<button
			class="tab"
			class:tab-active={activeTab === 'overview'}
			on:click={() => (activeTab = 'overview')}
		>
			📊 개요
		</button>
		<button
			class="tab"
			class:tab-active={activeTab === 'containers'}
			on:click={() => (activeTab = 'containers')}
		>
			🐳 컨테이너 ({containers.length})
		</button>
		<button
			class="tab"
			class:tab-active={activeTab === 'images'}
			on:click={() => (activeTab = 'images')}
		>
			💿 이미지 ({images.length})
		</button>
		<button class="tab" class:tab-active={activeTab === 'logs'} on:click={() => (activeTab = 'logs')}>
			📋 로그
		</button>
	</div>

	<!-- 로딩 상태 -->
	{#if loading && !systemStatus}
		<div class="flex justify-center items-center py-24">
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
	{:else if systemStatus}
		<!-- 탭 컨텐츠 -->

		<!-- 개요 탭 -->
		{#if activeTab === 'overview'}
			<div class="space-y-6">
				<!-- 리소스 카드 그리드 -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<!-- 메모리 -->
					<ResourceCard
						title="메모리"
						icon="💾"
						used={systemStatus.memory.used}
						total={systemStatus.memory.total}
						percent={systemStatus.memory.percent}
						isBytes={true}
						additional={[
							{ label: '캐시', value: formatBytes(systemStatus.memory.cached) },
							{ label: '사용 가능', value: formatBytes(systemStatus.memory.available) }
						]}
					/>

					<!-- 디스크 -->
					<ResourceCard
						title="디스크"
						icon="💿"
						used={systemStatus.disk.used}
						total={systemStatus.disk.total}
						percent={systemStatus.disk.percent}
						isBytes={true}
						additional={[
							{ label: '마운트', value: systemStatus.disk.mount_point },
							{ label: '사용 가능', value: formatBytes(systemStatus.disk.free) }
						]}
					/>

					<!-- CPU -->
					<ResourceCard
						title="CPU"
						icon="⚙️"
						used={systemStatus.cpu.percent}
						total={100}
						percent={systemStatus.cpu.percent}
						unit="%"
						additional={[
							{ label: '코어 수', value: `${systemStatus.cpu.count}개` },
							{
								label: '로드 평균',
								value: `${systemStatus.cpu.load_average.map((l) => l.toFixed(2)).join(' / ')}`
							}
						]}
					/>
				</div>

				<!-- Docker 시스템 정보 -->
				<div class="card bg-base-100 shadow-md">
					<div class="card-body">
						<h3 class="card-title text-lg flex items-center gap-2">
							<span class="text-2xl">🐳</span>
							Docker 시스템
						</h3>
						<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title text-xs">이미지</div>
								<div class="stat-value text-2xl">{systemStatus.docker.images_count}</div>
								<div class="stat-desc text-xs">{formatBytes(systemStatus.docker.images_size)}</div>
							</div>

							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title text-xs">컨테이너</div>
								<div class="stat-value text-2xl">{systemStatus.docker.containers_count}</div>
								<div class="stat-desc text-xs">
									실행 중: {systemStatus.docker.running_containers}
								</div>
							</div>

							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title text-xs">볼륨</div>
								<div class="stat-value text-2xl">{systemStatus.docker.volumes_count}</div>
							</div>

							<div class="stat bg-base-200 rounded-lg">
								<div class="stat-title text-xs">빌드 캐시</div>
								<div class="stat-value text-2xl text-sm">
									{formatBytes(systemStatus.docker.build_cache_size)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 컨테이너 목록 미리보기 -->
				<ContainerList {containers} {loading} {error} />
			</div>
		{/if}

		<!-- 컨테이너 탭 -->
		{#if activeTab === 'containers'}
			<ContainerList {containers} {loading} {error} />
		{/if}

		<!-- 이미지 탭 -->
		{#if activeTab === 'images'}
			<div class="card bg-base-100 shadow-md">
				<div class="card-body">
					<h3 class="card-title text-lg flex items-center gap-2">
						<span class="text-2xl">💿</span>
						Docker 이미지
					</h3>

					{#if images.length > 0}
						<div class="overflow-x-auto mt-4">
							<table class="table table-zebra">
								<thead>
									<tr>
										<th>리포지토리</th>
										<th>태그</th>
										<th>크기</th>
										<th>생성 시각</th>
									</tr>
								</thead>
								<tbody>
									{#each images as image}
										<tr>
											<td>
												<div class="max-w-md truncate text-sm" title={image.repository}>
													{image.repository}
												</div>
											</td>
											<td>
												<span class="badge badge-sm badge-outline">{image.tag}</span>
											</td>
											<td>
												<span class="font-mono text-sm">{formatBytes(image.size)}</span>
											</td>
											<td class="text-sm">
												{new Date(image.created).toLocaleString('ko-KR')}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<!-- 요약 -->
						<div class="divider my-2"></div>
						<div class="flex justify-between text-sm text-gray-600">
							<span>총 {images.length}개 이미지</span>
							<span>
								총 크기: <strong
									>{formatBytes(images.reduce((sum, img) => sum + img.size, 0))}</strong
								>
							</span>
						</div>
					{:else}
						<div class="text-center py-12 text-gray-500">
							<p class="text-lg mb-2">이미지가 없습니다</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- 로그 탭 -->
		{#if activeTab === 'logs'}
			<div class="space-y-6">
				<!-- 컨테이너 선택 -->
				{#if !selectedContainer}
					<div class="card bg-base-100 shadow-md">
						<div class="card-body">
							<h3 class="card-title text-lg mb-4">컨테이너를 선택하세요</h3>
							<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each containers as container}
									<button
										class="btn btn-outline justify-start"
										on:click={() => handleContainerSelect(container.name)}
									>
										<div class="flex flex-col items-start">
											<span class="font-semibold">{container.name}</span>
											<span class="text-xs opacity-60">{container.status}</span>
										</div>
									</button>
								{/each}
							</div>
						</div>
					</div>
				{:else}
					<!-- 로그 뷰어 -->
					<LogViewer containerName={selectedContainer} autoRefreshInterval={10} />

					<!-- 컨테이너 변경 버튼 -->
					<button class="btn btn-outline btn-sm" on:click={() => (selectedContainer = null)}>
						← 다른 컨테이너 선택
					</button>
				{/if}
			</div>
		{/if}
	{/if}

	<!-- 푸터: 마지막 업데이트 시각 -->
	{#if systemStatus}
		<div class="text-center text-sm text-gray-500 mt-8">
			마지막 업데이트: {new Date(systemStatus.timestamp).toLocaleString('ko-KR', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			})}
		</div>
	{/if}
</div>

<style>
	.stat {
		padding: 1rem;
	}

	.stat-title {
		color: hsl(var(--bc) / 0.6);
	}

	.stat-value {
		color: hsl(var(--bc));
	}

	.stat-desc {
		color: hsl(var(--bc) / 0.5);
	}
</style>
