<script lang="ts">
	/**
	 * 컨테이너 로그 뷰어 컴포넌트
	 *
	 * Docker 컨테이너의 로그를 실시간으로 조회하고 필터링합니다.
	 * 로그 레벨, 검색어 필터링을 지원하며, 자동 스크롤 기능이 있습니다.
	 *
	 * @component
	 */

	import { onMount, onDestroy } from 'svelte';
	import type { LogsResponse, LogLine, LogLevel } from '$lib/types/system-monitor';
	import { getContainerLogs, getLogLevelColor } from '$lib/api/system-monitor-api';

	/**
	 * Props
	 */

	/** 컨테이너 이름 */
	export let containerName: string;

	/** 자동 새로고침 간격 (초, 0이면 비활성화) */
	export let autoRefreshInterval: number = 10;

	/**
	 * State
	 */

	let logs: LogsResponse | null = null;
	let loading: boolean = false;
	let error: string | null = null;

	/** 필터 상태 */
	let levelFilter: LogLevel | '' = '';
	let searchTerm: string = '';
	let linesCount: number = 500;

	/** 자동 새로고침 타이머 */
	let refreshTimer: NodeJS.Timeout | null = null;

	/** 로그 컨테이너 요소 (자동 스크롤용) */
	let logContainer: HTMLDivElement;

	/** 자동 스크롤 활성화 여부 */
	let autoScroll: boolean = true;

	/**
	 * 로그 조회 함수
	 */
	async function fetchLogs() {
		if (!containerName) return;

		loading = true;
		error = null;

		try {
			logs = await getContainerLogs(containerName, {
				lines: linesCount,
				levelFilter: levelFilter || undefined,
				searchTerm: searchTerm || undefined
			});

			// 자동 스크롤
			if (autoScroll && logContainer) {
				setTimeout(() => {
					logContainer.scrollTop = logContainer.scrollHeight;
				}, 100);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : '로그 조회 실패';
			console.error('Failed to fetch logs:', err);
		} finally {
			loading = false;
		}
	}

	/**
	 * 필터 적용 핸들러
	 */
	function applyFilters() {
		fetchLogs();
	}

	/**
	 * 로그 다운로드 핸들러
	 */
	function downloadLogs() {
		if (!logs || !logs.lines.length) return;

		const content = logs.lines
			.map((line) => {
				const timestamp = line.timestamp ? new Date(line.timestamp).toISOString() : 'N/A';
				const level = line.level || 'N/A';
				return `[${timestamp}] [${level}] ${line.message}`;
			})
			.join('\n');

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${containerName}-logs-${Date.now()}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	/**
	 * Lifecycle
	 */

	onMount(() => {
		fetchLogs();

		// 자동 새로고침 설정
		if (autoRefreshInterval > 0) {
			refreshTimer = setInterval(() => {
				fetchLogs();
			}, autoRefreshInterval * 1000);
		}
	});

	onDestroy(() => {
		if (refreshTimer) {
			clearInterval(refreshTimer);
		}
	});

	/**
	 * Reactive statements
	 */

	// 컨테이너 이름 변경 시 로그 재조회
	$: if (containerName) {
		fetchLogs();
	}
</script>

<div class="card bg-base-100 shadow-md">
	<div class="card-body">
		<!-- 헤더 -->
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
			<h3 class="card-title text-lg flex items-center gap-2">
				<span class="text-2xl">📋</span>
				컨테이너 로그: <code class="text-sm font-mono">{containerName}</code>
			</h3>

			<!-- 액션 버튼 -->
			<div class="flex gap-2">
				<button class="btn btn-sm btn-primary" on:click={fetchLogs} disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-xs"></span>
					{:else}
						🔄
					{/if}
					새로고침
				</button>

				<button
					class="btn btn-sm btn-outline"
					on:click={downloadLogs}
					disabled={!logs || logs.lines.length === 0}
				>
					💾 다운로드
				</button>
			</div>
		</div>

		<!-- 필터 -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
			<!-- 로그 레벨 필터 -->
			<div class="form-control">
				<label class="label" for="level-filter">
					<span class="label-text">로그 레벨</span>
				</label>
				<select
					id="level-filter"
					class="select select-bordered select-sm"
					bind:value={levelFilter}
					on:change={applyFilters}
				>
					<option value="">전체</option>
					<option value="DEBUG">DEBUG</option>
					<option value="INFO">INFO</option>
					<option value="WARNING">WARNING</option>
					<option value="ERROR">ERROR</option>
					<option value="CRITICAL">CRITICAL</option>
				</select>
			</div>

			<!-- 검색어 -->
			<div class="form-control">
				<label class="label" for="search-term">
					<span class="label-text">검색어</span>
				</label>
				<input
					id="search-term"
					type="text"
					placeholder="검색..."
					class="input input-bordered input-sm"
					bind:value={searchTerm}
					on:keydown={(e) => e.key === 'Enter' && applyFilters()}
				/>
			</div>

			<!-- 라인 수 -->
			<div class="form-control">
				<label class="label" for="lines-count">
					<span class="label-text">라인 수</span>
				</label>
				<select
					id="lines-count"
					class="select select-bordered select-sm"
					bind:value={linesCount}
					on:change={applyFilters}
				>
					<option value={100}>100</option>
					<option value={500}>500</option>
					<option value={1000}>1000</option>
					<option value={5000}>5000</option>
				</select>
			</div>
		</div>

		<!-- 자동 스크롤 토글 -->
		<div class="form-control mb-4">
			<label class="label cursor-pointer justify-start gap-2">
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={autoScroll} />
				<span class="label-text">자동 스크롤</span>
			</label>
		</div>

		<!-- 로그 내용 -->
		{#if loading && !logs}
			<div class="flex justify-center items-center py-12">
				<span class="loading loading-spinner loading-lg text-primary"></span>
			</div>
		{:else if error}
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
		{:else if logs && logs.lines.length > 0}
			<!-- 로그 통계 -->
			<div class="flex justify-between text-sm text-gray-600 mb-2">
				<span>총 {logs.total_lines}줄 (표시: {logs.filtered_lines}줄)</span>
				{#if logs.has_more}
					<span class="badge badge-warning badge-sm">더 많은 로그가 있습니다</span>
				{/if}
			</div>

			<!-- 로그 뷰어 -->
			<div bind:this={logContainer} class="log-container bg-gray-900 rounded-lg p-4">
				{#each logs.lines as line, i}
					<div class="log-line flex gap-3 text-sm font-mono hover:bg-gray-800 px-2 py-1 rounded">
						<!-- 라인 번호 -->
						<span class="text-gray-500 select-none w-12 text-right flex-shrink-0">
							{i + 1}
						</span>

						<!-- 타임스탬프 -->
						{#if line.timestamp}
							<span class="text-gray-400 flex-shrink-0">
								{new Date(line.timestamp).toLocaleTimeString('ko-KR', {
									hour12: false,
									hour: '2-digit',
									minute: '2-digit',
									second: '2-digit'
								})}
							</span>
						{/if}

						<!-- 로그 레벨 -->
						{#if line.level}
							<span class={`badge badge-sm ${getLogLevelColor(line.level)} flex-shrink-0`}>
								{line.level}
							</span>
						{/if}

						<!-- 메시지 -->
						<span class="text-gray-100 break-all flex-1">
							{line.message}
						</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-12 text-gray-500">
				<p class="text-lg mb-2">로그가 없습니다</p>
				<p class="text-sm">조회된 로그가 없거나 필터 조건에 맞는 로그가 없습니다.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.log-container {
		max-height: 600px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.log-container::-webkit-scrollbar {
		width: 8px;
	}

	.log-container::-webkit-scrollbar-track {
		background: #1f2937;
		border-radius: 4px;
	}

	.log-container::-webkit-scrollbar-thumb {
		background: #4b5563;
		border-radius: 4px;
	}

	.log-container::-webkit-scrollbar-thumb:hover {
		background: #6b7280;
	}

	.log-line {
		line-height: 1.5;
		min-height: 2rem;
		align-items: flex-start;
	}

	code {
		background-color: hsl(var(--b3));
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
	}
</style>
