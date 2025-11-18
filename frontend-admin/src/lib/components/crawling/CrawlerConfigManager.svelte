<script lang="ts">
	/**
	 * 크롤링 설정 관리 컴포넌트
	 * 운영자가 크롤링 소스, URL, 키워드 등을 관리
	 */
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/buttons';
	import { Input } from '$lib/components/ui/forms';
	import { toast } from '$lib/stores/toast';
	// import JBTPConfigInline from './JBTPConfigInline.svelte';
	import { API_BASE_URL } from '$lib/config/api';

	interface JBTPConfig {
		id: number;
		config_type: string;
		name: string;
		board_url: string;
		keywords: string[];
		enabled: boolean;
	}

	interface BinetConfig {
		id: number;
		region_name: string;
		region_code: string;
		keywords: string[];
		enabled: boolean;
	}

	interface APIConfig {
		id: number;
		api_key: string;
		api_key_length: number;
		search_keywords: string[];
		enabled: boolean;
	}

	let activeTab = $state<'jbtp' | 'binet' | 'ntis' | 'bizinfo'>('jbtp');

	// JBTP 설정
	let jbtpConfigs = $state<JBTPConfig[]>([]);
	let jbtpLoading = $state(false);
	let newJBTPBoard = $state({ name: '', url: '', keywords: '' });

	// BI Center 설정
	let binetConfigs = $state<BinetConfig[]>([]);
	let binetLoading = $state(false);
	let newBinetRegion = $state({ name: '', code: '', keywords: '' });

	// NTIS 설정
	let ntisConfig = $state<APIConfig | null>(null);
	let ntisLoading = $state(false);
	let ntisApiKey = $state('');
	let ntisKeywords = $state('');

	// Bizinfo 설정
	let bizinfoConfig = $state<APIConfig | null>(null);
	let bizinfoLoading = $state(false);
	let bizinfoApiKey = $state('');
	let bizinfoKeywords = $state('');

	onMount(() => {
		loadJBTPConfigs();
		loadBinetConfigs();
		loadNTISConfig();
		loadBizinfoConfig();
	});

	// ========================================
	// JBTP 설정 관리
	// ========================================

	async function loadJBTPConfigs() {
		jbtpLoading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/jbtp/configs`);
			const data = await res.json();
			jbtpConfigs = data.items;
		} catch (error) {
			toast.error('JBTP 설정 로드 실패');
		} finally {
			jbtpLoading = false;
		}
	}

	async function addJBTPBoard() {
		if (!newJBTPBoard.name || !newJBTPBoard.url) {
			toast.error('게시판 이름과 URL을 입력하세요');
			return;
		}

		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/jbtp/configs`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					config_type: 'notices',
					name: newJBTPBoard.name,
					board_url: newJBTPBoard.url,
					keywords: newJBTPBoard.keywords.split(',').map((k) => k.trim()).filter(Boolean),
					enabled: true
				})
			});

			if (res.ok) {
				toast.success('게시판 추가 완료');
				newJBTPBoard = { name: '', url: '', keywords: '' };
				loadJBTPConfigs();
			} else {
				toast.error('게시판 추가 실패');
			}
		} catch (error) {
			toast.error('게시판 추가 중 오류 발생');
		}
	}

	async function updateJBTPKeywords(id: number, keywords: string[]) {
		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/jbtp/configs/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ keywords })
			});

			if (res.ok) {
				toast.success('키워드 업데이트 완료');
				loadJBTPConfigs();
			} else {
				toast.error('키워드 업데이트 실패');
			}
		} catch (error) {
			toast.error('키워드 업데이트 중 오류 발생');
		}
	}

	async function deleteJBTPBoard(id: number) {
		if (!confirm('정말 삭제하시겠습니까?')) return;

		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/jbtp/configs/${id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				toast.success('게시판 삭제 완료');
				loadJBTPConfigs();
			} else {
				toast.error('게시판 삭제 실패');
			}
		} catch (error) {
			toast.error('게시판 삭제 중 오류 발생');
		}
	}

	// ========================================
	// BI Center 설정 관리
	// ========================================

	async function loadBinetConfigs() {
		binetLoading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/binet/configs`);
			const data = await res.json();
			binetConfigs = data.items;
		} catch (error) {
			toast.error('BI Center 설정 로드 실패');
		} finally {
			binetLoading = false;
		}
	}

	async function addBinetRegion() {
		if (!newBinetRegion.name || !newBinetRegion.code) {
			toast.error('지역명과 지역코드를 입력하세요');
			return;
		}

		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/binet/configs`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					region_name: newBinetRegion.name,
					region_code: newBinetRegion.code,
					keywords: newBinetRegion.keywords.split(',').map((k) => k.trim()).filter(Boolean),
					enabled: true
				})
			});

			if (res.ok) {
				toast.success('지역 추가 완료');
				newBinetRegion = { name: '', code: '', keywords: '' };
				loadBinetConfigs();
			} else {
				toast.error('지역 추가 실패');
			}
		} catch (error) {
			toast.error('지역 추가 중 오류 발생');
		}
	}

	async function deleteBinetRegion(id: number) {
		if (!confirm('정말 삭제하시겠습니까?')) return;

		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/binet/configs/${id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				toast.success('지역 삭제 완료');
				loadBinetConfigs();
			} else {
				toast.error('지역 삭제 실패');
			}
		} catch (error) {
			toast.error('지역 삭제 중 오류 발생');
		}
	}

	// ========================================
	// NTIS 설정 관리
	// ========================================

	async function loadNTISConfig() {
		ntisLoading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/ntis/config`);
			const data = await res.json();
			ntisConfig = data;
			ntisKeywords = data.search_keywords?.join(', ') || '';
		} catch (error) {
			toast.error('NTIS 설정 로드 실패');
		} finally {
			ntisLoading = false;
		}
	}

	async function updateNTISConfig() {
		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/ntis/config`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					api_key: ntisApiKey || undefined,
					search_keywords: ntisKeywords.split(',').map((k) => k.trim()).filter(Boolean)
				})
			});

			if (res.ok) {
				toast.success('NTIS 설정 업데이트 완료');
				ntisApiKey = '';
				loadNTISConfig();
			} else {
				toast.error('NTIS 설정 업데이트 실패');
			}
		} catch (error) {
			toast.error('NTIS 설정 업데이트 중 오류 발생');
		}
	}

	// ========================================
	// Bizinfo 설정 관리
	// ========================================

	async function loadBizinfoConfig() {
		bizinfoLoading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/bizinfo/config`);
			const data = await res.json();
			bizinfoConfig = data;
			bizinfoKeywords = data.search_keywords?.join(', ') || '';
		} catch (error) {
			toast.error('Bizinfo 설정 로드 실패');
		} finally {
			bizinfoLoading = false;
		}
	}

	async function updateBizinfoConfig() {
		try {
			const res = await fetch(`${API_BASE_URL}/crawling/configs/bizinfo/config`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					api_key: bizinfoApiKey || undefined,
					search_keywords: bizinfoKeywords.split(',').map((k) => k.trim()).filter(Boolean)
				})
			});

			if (res.ok) {
				toast.success('Bizinfo 설정 업데이트 완료');
				bizinfoApiKey = '';
				loadBizinfoConfig();
			} else {
				toast.error('Bizinfo 설정 업데이트 실패');
			}
		} catch (error) {
			toast.error('Bizinfo 설정 업데이트 중 오류 발생');
		}
	}
</script>

<div class="config-manager">
	<!-- 탭 네비게이션 -->
	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'jbtp'}
			onclick={() => (activeTab = 'jbtp')}
		>
			JBTP
		</button>
		<button
			class="tab"
			class:active={activeTab === 'binet'}
			onclick={() => (activeTab = 'binet')}
		>
			창업보육센터
		</button>
		<button
			class="tab"
			class:active={activeTab === 'ntis'}
			onclick={() => (activeTab = 'ntis')}
		>
			NTIS
		</button>
		<button
			class="tab"
			class:active={activeTab === 'bizinfo'}
			onclick={() => (activeTab = 'bizinfo')}
		>
			기업마당
		</button>
	</div>

	<!-- JBTP 설정 -->
	{#if activeTab === 'jbtp'}
		<div class="tab-content">
			<!-- 검색 기간 및 키워드 설정 (인라인) -->
			<!-- <JBTPConfigInline /> -->

			<h3>JBTP 게시판 설정</h3>
			<p class="description">크롤링할 JBTP 게시판을 추가하거나 관리합니다.</p>

			{#if jbtpLoading}
				<div class="loading">로딩 중...</div>
			{:else}
				<!-- 기존 게시판 목록 -->
				<div class="config-list">
					{#each jbtpConfigs as config}
						<div class="config-item">
							<div class="config-header">
								<h4>{config.name}</h4>
								<Button variant="outline" size="sm" onclick={() => deleteJBTPBoard(config.id)}>
									삭제
								</Button>
							</div>
							<div class="config-detail">
								<div class="detail-row">
									<span class="label">URL:</span>
									<span class="value">{config.board_url}</span>
								</div>
								<div class="detail-row">
									<span class="label">키워드:</span>
									<span class="value">{config.keywords?.join(', ') || '없음'}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- 새 게시판 추가 -->
				<div class="add-form">
					<h4>새 게시판 추가</h4>
					<div class="form-row">
						<Input
							type="text"
							placeholder="게시판 이름 (예: 사업공고)"
							bind:value={newJBTPBoard.name}
						/>
						<Input
							type="text"
							placeholder="게시판 URL"
							bind:value={newJBTPBoard.url}
						/>
					</div>
					<div class="form-row">
						<Input
							type="text"
							placeholder="키워드 (쉼표로 구분)"
							bind:value={newJBTPBoard.keywords}
						/>
						<Button onclick={addJBTPBoard}>추가</Button>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- BI Center 설정 -->
	{#if activeTab === 'binet'}
		<div class="tab-content">
			<h3>창업보육센터 지역 설정</h3>
			<p class="description">크롤링할 지역을 추가하거나 관리합니다.</p>

			{#if binetLoading}
				<div class="loading">로딩 중...</div>
			{:else}
				<!-- 기존 지역 목록 -->
				<div class="config-list">
					{#each binetConfigs as config}
						<div class="config-item">
							<div class="config-header">
								<h4>{config.region_name} ({config.region_code})</h4>
								<Button variant="outline" size="sm" onclick={() => deleteBinetRegion(config.id)}>
									삭제
								</Button>
							</div>
							<div class="config-detail">
								<div class="detail-row">
									<span class="label">키워드:</span>
									<span class="value">{config.keywords?.join(', ') || '없음'}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- 새 지역 추가 -->
				<div class="add-form">
					<h4>새 지역 추가</h4>
					<div class="form-row">
						<Input
							type="text"
							placeholder="지역명 (예: 전북)"
							bind:value={newBinetRegion.name}
						/>
						<Input
							type="text"
							placeholder="지역코드 (예: 063)"
							bind:value={newBinetRegion.code}
						/>
					</div>
					<div class="form-row">
						<Input
							type="text"
							placeholder="키워드 (쉼표로 구분)"
							bind:value={newBinetRegion.keywords}
						/>
						<Button onclick={addBinetRegion}>추가</Button>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- NTIS 설정 -->
	{#if activeTab === 'ntis'}
		<div class="tab-content">
			<h3>NTIS API 설정</h3>
			<p class="description">NTIS API 키와 검색 키워드를 설정합니다.</p>

			{#if ntisLoading}
				<div class="loading">로딩 중...</div>
			{:else if ntisConfig}
				<div class="api-config">
					<div class="form-group">
						<label>API Key</label>
						<p class="help-text">
							{#if ntisConfig.api_key_length > 0}
								현재 API Key 길이: {ntisConfig.api_key_length}자 (마스킹됨)
							{:else}
								API Key가 설정되지 않았습니다
							{/if}
						</p>
						<Input
							type="password"
							placeholder="새 API Key (변경시에만 입력)"
							bind:value={ntisApiKey}
						/>
					</div>

					<div class="form-group">
						<label>검색 키워드</label>
						<p class="help-text">쉼표(,)로 구분하여 입력하세요</p>
						<Input
							type="text"
							placeholder="예: 전북, R&D, 연구개발"
							bind:value={ntisKeywords}
						/>
					</div>

					<Button onclick={updateNTISConfig}>설정 저장</Button>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Bizinfo 설정 -->
	{#if activeTab === 'bizinfo'}
		<div class="tab-content">
			<h3>기업마당 API 설정</h3>
			<p class="description">기업마당 API 키와 검색 키워드를 설정합니다.</p>

			{#if bizinfoLoading}
				<div class="loading">로딩 중...</div>
			{:else if bizinfoConfig}
				<div class="api-config">
					<div class="form-group">
						<label>API Key</label>
						<p class="help-text">
							{#if bizinfoConfig.api_key_length > 0}
								현재 API Key 길이: {bizinfoConfig.api_key_length}자 (마스킹됨)
							{:else}
								API Key가 설정되지 않았습니다
							{/if}
						</p>
						<Input
							type="password"
							placeholder="새 API Key (변경시에만 입력)"
							bind:value={bizinfoApiKey}
						/>
					</div>

					<div class="form-group">
						<label>검색 키워드</label>
						<p class="help-text">쉼표(,)로 구분하여 입력하세요</p>
						<Input
							type="text"
							placeholder="예: 전북, 중소기업, 창업"
							bind:value={bizinfoKeywords}
						/>
					</div>

					<Button onclick={updateBizinfoConfig}>설정 저장</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.config-manager {
		width: 100%;
	}

	.tabs {
		display: flex;
		gap: var(--space-2);
		border-bottom: var(--border-width) solid var(--hair);
		margin-bottom: var(--space-4);
	}

	.tab {
		padding: var(--space-3) var(--space-4);
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		transition: all 0.2s;
	}

	.tab:hover {
		color: var(--fg);
	}

	.tab.active {
		color: var(--fg);
		border-bottom-color: var(--fg);
	}

	.tab-content {
		padding: var(--space-4);
	}

	.tab-content h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		margin-bottom: var(--space-2);
	}

	.description {
		font-size: var(--text-sm);
		color: var(--muted);
		margin-bottom: var(--space-4);
	}

	.loading {
		text-align: center;
		padding: var(--space-8);
		color: var(--muted);
	}

	.config-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.config-item {
		border: var(--border-width) solid var(--hair);
		border-radius: var(--radius);
		padding: var(--space-4);
		background: var(--bg-secondary);
	}

	.config-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-3);
	}

	.config-header h4 {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
	}

	.config-detail {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.detail-row {
		display: flex;
		gap: var(--space-2);
		font-size: var(--text-sm);
	}

	.detail-row .label {
		font-weight: var(--font-medium);
		color: var(--muted);
		min-width: 80px;
	}

	.detail-row .value {
		color: var(--fg);
		word-break: break-all;
	}

	.add-form {
		padding: var(--space-4);
		background: var(--bg-tertiary);
		border-radius: var(--radius);
	}

	.add-form h4 {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		margin-bottom: var(--space-3);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	.form-row:last-child {
		margin-bottom: 0;
	}

	.api-config {
		max-width: 600px;
	}

	.form-group {
		margin-bottom: var(--space-4);
	}

	.form-group label {
		display: block;
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		margin-bottom: var(--space-2);
	}

	.help-text {
		font-size: var(--text-xs);
		color: var(--muted);
		margin-bottom: var(--space-2);
	}
</style>
