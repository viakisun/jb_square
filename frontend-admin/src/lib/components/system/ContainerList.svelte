<script lang="ts">
	/**
	 * Docker 컨테이너 목록 컴포넌트
	 *
	 * BLACK/WHITE/ZERO-ROUND/INDUSTRIAL 디자인 시스템 적용
	 * monochrome 스타일의 테이블 형식으로 Docker 컨테이너 정보 표시
	 *
	 * @component
	 */

	import type { ContainerInfo } from '$lib/types/system-monitor';
	import { formatBytes, formatRelativeTime } from '$lib/api/system-monitor-api';

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
	 * Computed properties
	 */

	/** 실행 중인 컨테이너 수 */
	$: runningCount = containers.filter((c) => c.status === 'running').length;

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

	/**
	 * Utility functions
	 */

	/** 상태 텍스트 정규화 (대문자) */
	function normalizeStatus(status: string): string {
		return status.toUpperCase();
	}

	/** 헬스 상태 아이콘 */
	function getHealthIcon(health: string | null): string {
		if (!health) return '–';
		return health === 'healthy' ? '■' : '□';
	}

	/** 헬스 상태 텍스트 정규화 */
	function normalizeHealth(health: string | null): string {
		if (!health) return 'N/A';
		return health.toUpperCase();
	}
</script>

<div class="container-list">
	<!-- 헤더 -->
	<div class="list-header">
		<div class="header-left">
			<span class="icon">[DOCKER]</span>
			<h3 class="title">Docker 컨테이너</h3>
		</div>
		<div class="count-badge">{containers.length}개</div>
	</div>

	<!-- 로딩 상태 -->
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p class="loading-text">컨테이너 목록을 불러오는 중...</p>
		</div>
	{:else if error}
		<!-- 에러 상태 -->
		<div class="error-state">
			<div class="error-icon">■</div>
			<p class="error-message">{error}</p>
		</div>
	{:else if containers.length === 0}
		<!-- 빈 상태 -->
		<div class="empty-state">
			<p class="empty-message">컨테이너가 없습니다</p>
			<p class="empty-description">실행 중인 Docker 컨테이너를 찾을 수 없습니다.</p>
		</div>
	{:else}
		<!-- 테이블 -->
		<div class="table-wrapper">
			<table class="data-table">
				<thead>
					<tr>
						<th class="table-header">컨테이너</th>
						<th class="table-header">상태</th>
						<th class="table-header">헬스</th>
						<th class="table-header">이미지</th>
						<th class="table-header">크기</th>
						<th class="table-header">생성</th>
					</tr>
				</thead>
				<tbody>
					{#each containers as container}
						<tr
							class="table-row"
							on:click={() => handleContainerClick(container)}
							on:keypress={(e) => e.key === 'Enter' && handleContainerClick(container)}
							tabindex="0"
							role="button"
						>
							<!-- 컨테이너 이름 -->
							<td class="table-cell">
								<div class="container-name">
									<span class="name-text">{container.name}</span>
									<span class="id-text">{container.id}</span>
								</div>
							</td>

							<!-- 상태 -->
							<td class="table-cell">
								<span class="status-badge">{normalizeStatus(container.status)}</span>
							</td>

							<!-- 헬스체크 -->
							<td class="table-cell">
								<div class="health-status">
									<span class="health-icon">{getHealthIcon(container.health)}</span>
									<span class="health-text">{normalizeHealth(container.health)}</span>
								</div>
							</td>

							<!-- 이미지 -->
							<td class="table-cell">
								<div class="image-text" title={container.image}>
									{container.image}
								</div>
							</td>

							<!-- 크기 -->
							<td class="table-cell">
								<span class="size-text">{formatBytes(container.size)}</span>
							</td>

							<!-- 생성 시각 -->
							<td class="table-cell">
								<div class="time-info">
									<span class="time-text">{formatRelativeTime(container.created)}</span>
									{#if container.started}
										<span class="time-subtext">
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
		<div class="divider"></div>
		<div class="footer">
			<span class="footer-text">총 {containers.length}개 컨테이너</span>
			<span class="footer-text">실행 중: <strong>{runningCount}</strong>개</span>
		</div>
	{/if}
</div>

<style>
	/* ========================================
	   CONTAINER LIST
	   ======================================== */

	.container-list {
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* ========================================
	   HEADER
	   ======================================== */

	.list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
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
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
		line-height: 1;
	}

	.count-badge {
		display: inline-flex;
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
		font-variant-numeric: tabular-nums;
	}

	/* ========================================
	   LOADING STATE
	   ======================================== */

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-12) var(--space-4);
		gap: var(--space-3);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: var(--border-width) solid var(--hair);
		border-top-color: var(--fg);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		font-size: var(--text-sm);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	/* ========================================
	   ERROR STATE
	   ======================================== */

	.error-state {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--fg);
	}

	.error-icon {
		font-size: var(--text-2xl);
		color: var(--fg);
		line-height: 1;
	}

	.error-message {
		font-size: var(--text-sm);
		color: var(--fg);
		font-weight: var(--font-medium);
	}

	/* ========================================
	   EMPTY STATE
	   ======================================== */

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-12) var(--space-4);
		gap: var(--space-2);
	}

	.empty-message {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.empty-description {
		font-size: var(--text-sm);
		color: var(--muted);
	}

	/* ========================================
	   TABLE
	   ======================================== */

	.table-wrapper {
		width: 100%;
		overflow-x: auto;
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
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.table-row:hover {
		background-color: var(--ghost);
	}

	.table-row:focus {
		outline: var(--border-width) solid var(--fg);
		outline-offset: calc(-1 * var(--border-width));
		background-color: var(--ghost);
	}

	.table-row:not(:last-child) {
		border-bottom: var(--border-width) solid var(--hair);
	}

	.table-cell {
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-sm);
		vertical-align: middle;
	}

	/* ========================================
	   TABLE CONTENT
	   ======================================== */

	/* 컨테이너 이름 */
	.container-name {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.name-text {
		font-weight: var(--font-semibold);
		color: var(--fg);
		font-size: var(--text-sm);
	}

	.id-text {
		font-size: var(--text-2xs);
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	/* 상태 배지 */
	.status-badge {
		display: inline-flex;
		padding: var(--space-0-5) var(--space-2);
		font-size: var(--text-2xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	/* 헬스 상태 */
	.health-status {
		display: flex;
		align-items: center;
		gap: var(--space-1-5);
	}

	.health-icon {
		font-size: var(--text-base);
		color: var(--fg);
		line-height: 1;
	}

	.health-text {
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		color: var(--fg);
	}

	/* 이미지 텍스트 */
	.image-text {
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: var(--text-xs);
		color: var(--fg);
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
	}

	/* 크기 텍스트 */
	.size-text {
		font-size: var(--text-xs);
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
		color: var(--fg);
		font-variant-numeric: tabular-nums;
	}

	/* 시간 정보 */
	.time-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.time-text {
		font-size: var(--text-xs);
		color: var(--fg);
	}

	.time-subtext {
		font-size: var(--text-2xs);
		color: var(--muted);
	}

	/* ========================================
	   FOOTER
	   ======================================== */

	.divider {
		height: var(--border-width);
		background-color: var(--hair);
		margin: var(--space-2) 0;
	}

	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.footer-text {
		font-size: var(--text-sm);
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.footer-text strong {
		color: var(--fg);
		font-weight: var(--font-semibold);
	}
</style>
