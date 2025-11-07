<script lang="ts">
	/**
	 * 시스템 모니터링 페이지
	 *
	 * BLACK/WHITE/ZERO-ROUND/INDUSTRIAL 디자인 시스템 적용
	 * monochrome 스타일로 EC2 서버 리소스 및 Docker 모니터링
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

<div class="page-container">
	<!-- 페이지 헤더 -->
	<header class="page-header">
		<div class="header-content">
			<div class="title-group">
				<h1 class="page-title">
					<span class="title-icon">[SYS]</span>
					<span class="title-text">시스템 모니터링</span>
				</h1>
				<p class="page-description">
					EC2 서버의 리소스 사용량, Docker 컨테이너 및 로그를 실시간으로 모니터링합니다
				</p>
			</div>

			<!-- 액션 버튼 -->
			<div class="header-actions">
				<button class="action-button" on:click={handleRefresh} disabled={loading}>
					<span class="btn-icon" class:loading-icon={loading}>↻</span>
					<span class="btn-text">새로고침</span>
				</button>

				<div class="settings-group">
					<label class="settings-label">
						<input type="checkbox" class="settings-checkbox" bind:checked={autoRefresh} />
						<span class="checkbox-text">자동 새로고침</span>
					</label>
					{#if autoRefresh}
						<select class="interval-select" bind:value={refreshInterval}>
							<option value={10}>10초</option>
							<option value={30}>30초</option>
							<option value={60}>1분</option>
							<option value={300}>5분</option>
						</select>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<!-- 알림 배너 -->
	<AlertBanner {alerts} />

	<!-- 탭 네비게이션 -->
	<nav class="tabs-nav">
		<button class="tab-button" class:tab-active={activeTab === 'overview'} on:click={() => (activeTab = 'overview')}>
			<span class="tab-label">개요</span>
		</button>
		<button class="tab-button" class:tab-active={activeTab === 'containers'} on:click={() => (activeTab = 'containers')}>
			<span class="tab-label">컨테이너</span>
			<span class="tab-count">{containers.length}</span>
		</button>
		<button class="tab-button" class:tab-active={activeTab === 'images'} on:click={() => (activeTab = 'images')}>
			<span class="tab-label">이미지</span>
			<span class="tab-count">{images.length}</span>
		</button>
		<button class="tab-button" class:tab-active={activeTab === 'logs'} on:click={() => (activeTab = 'logs')}>
			<span class="tab-label">로그</span>
		</button>
	</nav>

	<!-- 로딩 상태 -->
	{#if loading && !systemStatus}
		<div class="loading-state">
			<div class="spinner"></div>
			<p class="loading-text">데이터를 불러오는 중...</p>
		</div>
	{:else if error}
		<!-- 에러 상태 -->
		<div class="error-state">
			<div class="error-icon">■</div>
			<p class="error-message">{error}</p>
		</div>
	{:else if systemStatus}
		<!-- 탭 컨텐츠 -->

		<!-- 개요 탭 -->
		{#if activeTab === 'overview'}
			<div class="tab-content">
				<!-- 리소스 카드 그리드 -->
				<div class="resource-grid">
					<!-- 메모리 -->
					<ResourceCard
						title="메모리"
						icon="MEM"
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
						icon="DISK"
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
						icon="CPU"
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
				<div class="docker-panel">
					<div class="panel-header">
						<span class="panel-icon">[DOCKER]</span>
						<h3 class="panel-title">Docker 시스템</h3>
					</div>

					<div class="stats-grid">
						<div class="stat-card">
							<div class="stat-label">이미지</div>
							<div class="stat-value">{systemStatus.docker.images_count}</div>
							<div class="stat-desc">{formatBytes(systemStatus.docker.images_size)}</div>
						</div>

						<div class="stat-card">
							<div class="stat-label">컨테이너</div>
							<div class="stat-value">{systemStatus.docker.containers_count}</div>
							<div class="stat-desc">실행 중: {systemStatus.docker.running_containers}</div>
						</div>

						<div class="stat-card">
							<div class="stat-label">볼륨</div>
							<div class="stat-value">{systemStatus.docker.volumes_count}</div>
						</div>

						<div class="stat-card">
							<div class="stat-label">빌드 캐시</div>
							<div class="stat-value stat-value-sm">
								{formatBytes(systemStatus.docker.build_cache_size)}
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
			<div class="images-panel">
				<div class="panel-header">
					<span class="panel-icon">[IMAGES]</span>
					<h3 class="panel-title">Docker 이미지</h3>
				</div>

				{#if images.length > 0}
					<div class="table-wrapper">
						<table class="data-table">
							<thead>
								<tr>
									<th class="table-header">리포지토리</th>
									<th class="table-header">태그</th>
									<th class="table-header">크기</th>
									<th class="table-header">생성 시각</th>
								</tr>
							</thead>
							<tbody>
								{#each images as image}
									<tr class="table-row">
										<td class="table-cell">
											<div class="repo-text" title={image.repository}>
												{image.repository}
											</div>
										</td>
										<td class="table-cell">
											<span class="tag-badge">{image.tag}</span>
										</td>
										<td class="table-cell">
											<span class="size-text">{formatBytes(image.size)}</span>
										</td>
										<td class="table-cell">
											<span class="date-text">
												{new Date(image.created).toLocaleString('ko-KR')}
											</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- 요약 -->
					<div class="divider"></div>
					<div class="summary-footer">
						<span class="summary-text">총 {images.length}개 이미지</span>
						<span class="summary-text">
							총 크기: <strong>{formatBytes(images.reduce((sum, img) => sum + img.size, 0))}</strong>
						</span>
					</div>
				{:else}
					<div class="empty-state">
						<p class="empty-message">이미지가 없습니다</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- 로그 탭 -->
		{#if activeTab === 'logs'}
			<div class="logs-content">
				<!-- 컨테이너 선택 -->
				{#if !selectedContainer}
					<div class="container-selection">
						<h3 class="selection-title">컨테이너를 선택하세요</h3>
						<div class="selection-grid">
							{#each containers as container}
								<button class="container-button" on:click={() => handleContainerSelect(container.name)}>
									<span class="container-button-name">{container.name}</span>
									<span class="container-button-status">{container.status}</span>
								</button>
							{/each}
						</div>
					</div>
				{:else}
					<!-- 로그 뷰어 -->
					<LogViewer containerName={selectedContainer} autoRefreshInterval={10} />

					<!-- 컨테이너 변경 버튼 -->
					<button class="back-button" on:click={() => (selectedContainer = null)}>
						<span class="btn-icon">←</span>
						<span class="btn-text">다른 컨테이너 선택</span>
					</button>
				{/if}
			</div>
		{/if}
	{/if}

	<!-- 푸터: 마지막 업데이트 시각 -->
	{#if systemStatus}
		<footer class="page-footer">
			<span class="footer-text">
				마지막 업데이트: {new Date(systemStatus.timestamp).toLocaleString('ko-KR', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit',
					hour12: false
				})}
			</span>
		</footer>
	{/if}
</div>

<style>
	/* ========================================
	   PAGE CONTAINER
	   ======================================== */

	.page-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4);
	}

	/* ========================================
	   PAGE HEADER
	   ======================================== */

	.page-header {
		margin-bottom: var(--space-6);
	}

	.header-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	@media (min-width: 640px) {
		.header-content {
			flex-direction: row;
			align-items: flex-start;
			justify-content: space-between;
		}
	}

	.title-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.page-title {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-3xl);
		font-weight: var(--font-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
		line-height: 1.2;
	}

	.title-icon {
		font-size: var(--text-3xl);
		line-height: 1;
	}

	.page-description {
		font-size: var(--text-sm);
		color: var(--muted);
		margin-top: var(--space-1);
	}

	/* ========================================
	   HEADER ACTIONS
	   ======================================== */

	.header-actions {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.action-button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		background-color: var(--bg);
		color: var(--fg);
		border: var(--border-width) solid var(--hair);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.action-button:hover:not(:disabled) {
		background-color: var(--ghost);
		border-color: var(--fg);
	}

	.action-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-icon {
		font-size: var(--text-base);
		line-height: 1;
	}

	.loading-icon {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.btn-text {
		line-height: 1;
	}

	/* Settings */
	.settings-group {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
	}

	.settings-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
	}

	.settings-checkbox {
		width: 16px;
		height: 16px;
		border: var(--border-width) solid var(--hair);
		background-color: var(--bg);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.settings-checkbox:checked {
		background-color: var(--fg);
	}

	.checkbox-text {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--fg);
	}

	.interval-select {
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		color: var(--fg);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		text-transform: uppercase;
	}

	/* ========================================
	   TABS NAVIGATION
	   ======================================== */

	.tabs-nav {
		display: flex;
		gap: var(--border-width);
		margin-bottom: var(--space-6);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.tab-button {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		background-color: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--muted);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		margin-bottom: calc(-1 * var(--border-width));
	}

	.tab-button:hover {
		color: var(--fg);
		background-color: var(--ghost);
	}

	.tab-button.tab-active {
		color: var(--fg);
		border-bottom-color: var(--fg);
	}

	.tab-icon {
		font-size: var(--text-base);
		line-height: 1;
	}

	.tab-count {
		display: inline-flex;
		padding: var(--space-0-5) var(--space-1-5);
		font-size: var(--text-2xs);
		font-variant-numeric: tabular-nums;
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	/* ========================================
	   LOADING & ERROR STATES
	   ======================================== */

	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-24);
		gap: var(--space-3);
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: var(--border-width) solid var(--hair);
		border-top-color: var(--fg);
		animation: spin 1s linear infinite;
	}

	.loading-text {
		font-size: var(--text-sm);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.error-state {
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--fg);
	}

	.error-icon {
		font-size: var(--text-4xl);
		color: var(--fg);
		line-height: 1;
	}

	.error-message {
		font-size: var(--text-base);
		color: var(--fg);
		font-weight: var(--font-medium);
	}

	/* ========================================
	   TAB CONTENT
	   ======================================== */

	.tab-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* ========================================
	   RESOURCE GRID
	   ======================================== */

	.resource-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-6);
	}

	/* ========================================
	   DOCKER PANEL / PANELS
	   ======================================== */

	.docker-panel,
	.images-panel,
	.container-selection {
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-6);
	}

	.panel-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.panel-icon {
		font-size: var(--text-2xl);
		line-height: 1;
	}

	.panel-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
	}

	/* ========================================
	   STATS GRID
	   ======================================== */

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--space-4);
	}

	.stat-card {
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.stat-label {
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--muted);
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		font-variant-numeric: tabular-nums;
		color: var(--fg);
	}

	.stat-value-sm {
		font-size: var(--text-sm);
	}

	.stat-desc {
		font-size: var(--text-xs);
		color: var(--muted);
	}

	/* ========================================
	   TABLE (Images tab)
	   ======================================== */

	.table-wrapper {
		width: 100%;
		overflow-x: auto;
		margin-top: var(--space-4);
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		border: var(--border-width) solid var(--hair);
	}

	.table-header {
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		text-align: left;
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--fg);
		background-color: var(--surface-1);
		border-bottom: var(--border-width) solid var(--hair);
	}

	.table-row {
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.table-row:hover {
		background-color: var(--ghost);
	}

	.table-row:not(:last-child) {
		border-bottom: var(--border-width) solid var(--hair);
	}

	.table-cell {
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-sm);
	}

	.repo-text {
		max-width: 400px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
		font-size: var(--text-xs);
		color: var(--fg);
	}

	.tag-badge {
		display: inline-flex;
		padding: var(--space-0-5) var(--space-2);
		font-size: var(--text-2xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	.size-text {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
		font-size: var(--text-xs);
		font-variant-numeric: tabular-nums;
		color: var(--fg);
	}

	.date-text {
		font-size: var(--text-xs);
		color: var(--fg);
	}

	/* ========================================
	   DIVIDER & SUMMARY
	   ======================================== */

	.divider {
		height: var(--border-width);
		background-color: var(--hair);
		margin: var(--space-3) 0;
	}

	.summary-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.summary-text {
		font-size: var(--text-sm);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.summary-text strong {
		color: var(--fg);
		font-weight: var(--font-semibold);
	}

	/* ========================================
	   LOGS CONTENT
	   ======================================== */

	.logs-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* Container Selection */
	.selection-title {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
		margin-bottom: var(--space-4);
	}

	.selection-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: var(--space-4);
	}

	.container-button {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-1);
		padding: var(--space-4);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		text-align: left;
	}

	.container-button:hover {
		background-color: var(--ghost);
		border-color: var(--fg);
	}

	.container-button-name {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.container-button-status {
		font-size: var(--text-xs);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	/* Back button */
	.back-button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		background-color: var(--bg);
		color: var(--fg);
		border: var(--border-width) solid var(--hair);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.back-button:hover {
		background-color: var(--ghost);
		border-color: var(--fg);
	}

	/* ========================================
	   EMPTY STATE
	   ======================================== */

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-12);
	}

	.empty-message {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	/* ========================================
	   PAGE FOOTER
	   ======================================== */

	.page-footer {
		margin-top: var(--space-8);
		padding-top: var(--space-4);
		border-top: var(--border-width) solid var(--hair);
		text-align: center;
	}

	.footer-text {
		font-size: var(--text-sm);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}
</style>
