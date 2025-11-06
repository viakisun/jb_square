<script lang="ts">
	import { onMount } from 'svelte';
	import OrganizationCard from '$lib/components/organizations/OrganizationCard.svelte';
	import OrganizationDetailModal from '$lib/components/organizations/OrganizationDetailModal.svelte';
	import { API_BASE_URL, API } from '$lib/config/api';

	type Organization = {
		id: number;
		company_name: string;
		ceo_name: string | null;
		company_scale: string | null;
		company_status: string | null;
		industry_type: string;
		ksic_10th_code: string | null;
		ksic_10th_name: string | null;
		main_products: string | null;
		has_research_institute: boolean;
		established_date: string | null;
		email: string | null;
	};

	let organizations = $state<Organization[]>([]);
	let loading = $state(true);
	let total = $state(0);
	let selectedOrganization = $state<Organization | null>(null);
	let showDetailModal = $state(false);

	// Filters
	let industryTypeFilter = $state<string>('');
	let companyScaleFilter = $state<string>('');
	let searchQuery = $state<string>('');
	let bioOnly = $state<boolean>(false); // 바이오 기업만 보기 토글
	let ksicCodeFilter = $state<string>(''); // KSIC 코드 필터

	// KSIC 코드 목록
	type KSICCode = {
		code: string;
		name: string;
		category: string;
		company_count: number;
	};
	let ksicCodes = $state<KSICCode[]>([]);

	async function loadOrganizations() {
		loading = true;
		try {
			const params = new URLSearchParams({
				limit: '50',
				skip: '0'
			});

			// 바이오 전용 필터 (industryTypeFilter보다 우선)
			if (bioOnly && !industryTypeFilter) {
				// bioOnly가 켜져 있으면 BIO_CORE와 BIO_RELATED만 표시
				// 백엔드에서 OR 조건이 없으므로, 일단 둘 중 하나만 선택하거나 클라이언트에서 필터링 필요
				// 여기서는 간단하게 BIO_CORE로 필터링 (추후 백엔드 개선 필요)
			}

			if (industryTypeFilter) params.append('industry_type', industryTypeFilter);
			if (companyScaleFilter) params.append('company_scale', companyScaleFilter);
			if (searchQuery) params.append('search', searchQuery);
			if (ksicCodeFilter) params.append('ksic_10th_code', ksicCodeFilter);

			const res = await fetch(`${API_BASE_URL}/organizations?${params}`);
			const data = await res.json();

			// 바이오 필터 적용 (클라이언트 사이드)
			if (bioOnly && !industryTypeFilter) {
				const filtered = data.items.filter((org: Organization) =>
					org.industry_type === 'BIO_CORE' || org.industry_type === 'BIO_RELATED'
				);
				organizations = filtered;
				total = filtered.length;
			} else {
				organizations = data.items;
				total = data.total;
			}
		} catch (error) {
			console.error('Failed to load organizations:', error);
		} finally {
			loading = false;
		}
	}

	function handleCardClick(org: Organization) {
		selectedOrganization = org;
		showDetailModal = true;
	}

	function closeModal() {
		showDetailModal = false;
		selectedOrganization = null;
	}

	async function loadKSICCodes() {
		try {
			const response = await fetch(API.ksicCodes.bioCodes);
			const data = await response.json();
			ksicCodes = data.items || [];
		} catch (error) {
			console.error('Failed to load KSIC codes:', error);
		}
	}

	onMount(() => {
		loadOrganizations();
		loadKSICCodes();
	});
</script>

<svelte:head>
	<title>기업·기관 관리 - JB SQUARE</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1 class="page-title">기업·기관 관리</h1>
			<p class="page-subtitle">전북 바이오 기업 디렉토리 ({total}개 기업)</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="filters">
		<div class="filter-group bio-toggle">
			<label>
				<input
					type="checkbox"
					bind:checked={bioOnly}
					onchange={loadOrganizations}
				/>
				<span class="toggle-label">바이오 기업만 보기 (핵심 + 연관)</span>
			</label>
		</div>

		<div class="filter-group">
			<label for="industry-type">산업 분류</label>
			<select id="industry-type" bind:value={industryTypeFilter} onchange={loadOrganizations} disabled={bioOnly}>
				<option value="">전체</option>
				<option value="BIO_CORE">바이오 핵심산업</option>
				<option value="BIO_RELATED">전후방 연관산업</option>
				<option value="NON_BIO">비바이오산업</option>
			</select>
		</div>

		<div class="filter-group">
			<label for="company-scale">기업 규모</label>
			<select id="company-scale" bind:value={companyScaleFilter} onchange={loadOrganizations}>
				<option value="">전체</option>
				<option value="대기업">대기업</option>
				<option value="중견기업">중견기업</option>
				<option value="중소기업">중소기업</option>
			</select>
		</div>

		<div class="filter-group">
			<label for="ksic-code">KSIC 코드</label>
			<select id="ksic-code" bind:value={ksicCodeFilter} onchange={loadOrganizations}>
				<option value="">전체</option>
				<optgroup label="바이오 핵심산업">
					{#each ksicCodes.filter(k => k.category === 'BIO_CORE') as code}
						<option value={code.code}>{code.code} - {code.name} ({code.company_count}개)</option>
					{/each}
				</optgroup>
				<optgroup label="전후방 연관산업">
					{#each ksicCodes.filter(k => k.category === 'BIO_RELATED') as code}
						<option value={code.code}>{code.code} - {code.name} ({code.company_count}개)</option>
					{/each}
				</optgroup>
			</select>
		</div>

		<div class="filter-group search">
			<label for="search">검색 (업체명, 대표자명, 제품명)</label>
			<input
				type="text"
				id="search"
				bind:value={searchQuery}
				placeholder="검색어를 입력하세요"
				oninput={loadOrganizations}
			/>
		</div>
	</div>

	{#if loading}
		<div class="loading">로딩 중...</div>
	{:else if organizations.length === 0}
		<div class="empty-state">
			<p>등록된 기업이 없습니다.</p>
		</div>
	{:else}
		<div class="organizations-grid">
			{#each organizations as org (org.id)}
				<OrganizationCard organization={org} onclick={() => handleCardClick(org)} />
			{/each}
		</div>
	{/if}
</div>

{#if showDetailModal && selectedOrganization}
	<OrganizationDetailModal organization={selectedOrganization} onClose={closeModal} />
{/if}

<style>
	.page {
		padding: var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.page-header {
		margin-bottom: var(--space-2);
	}

	.page-title {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
		text-transform: uppercase;
		margin-bottom: var(--space-1);
	}

	.page-subtitle {
		font-size: var(--text-base);
		color: var(--muted);
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		padding: var(--space-4);
		background: var(--surface-1);
		border: var(--border-width) solid var(--hair);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 180px;
		flex: 0 1 auto;
	}

	.filter-group.search {
		flex: 1 1 300px;
		min-width: 300px;
	}

	.filter-group.bio-toggle {
		flex-direction: row;
		align-items: center;
		justify-content: center;
		min-width: auto;
	}

	.filter-group.bio-toggle label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		margin: 0;
	}

	.filter-group.bio-toggle input[type="checkbox"] {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.filter-group.bio-toggle .toggle-label {
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		white-space: nowrap;
	}

	.filter-group label {
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--muted);
		text-transform: uppercase;
	}

	.filter-group select,
	.filter-group input {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--rounded-sm);
		background: var(--bg);
		color: var(--fg);
		font-size: var(--text-sm);
	}

	.filter-group select:focus,
	.filter-group input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.organizations-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: var(--space-4);
	}

	.loading {
		text-align: center;
		padding: var(--space-8);
		color: var(--muted);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-12);
		color: var(--muted);
	}

	.empty-state p {
		font-size: var(--text-lg);
	}
</style>
