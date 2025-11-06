<script lang="ts">
	import { onMount } from 'svelte';
	import { API_BASE_URL } from '$lib/config/api';

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

	type OrganizationDetail = Organization & {
		yearly_data?: {
			revenue?: Record<number, number | null>;
			employees?: Record<number, number | null>;
			export_amount?: Record<number, number | null>;
			rd_expense?: Record<number, number | null>;
			patent_registrations?: Record<number, number | null>;
			patent_applications?: Record<number, number | null>;
		};
	};

	type Props = {
		organization: Organization;
		onClose: () => void;
	};

	let { organization, onClose }: Props = $props();
	let detailData = $state<OrganizationDetail | null>(null);
	let loading = $state(true);

	async function loadDetailData() {
		loading = true;
		try {
			const res = await fetch(`${API_BASE_URL}/organizations/${organization.id}?include_yearly=true`);
			detailData = await res.json();
		} catch (error) {
			console.error('Failed to load organization details:', error);
		} finally {
			loading = false;
		}
	}

	function formatNumber(num: number | null | undefined): string {
		if (num === null || num === undefined) return '-';
		return num.toLocaleString('ko-KR');
	}

	function formatCurrency(num: number | null | undefined): string {
		if (num === null || num === undefined) return '-';
		if (num >= 1_000_000_000_000) {
			return `${(num / 1_000_000_000_000).toFixed(1)}조`;
		} else if (num >= 100_000_000) {
			return `${(num / 100_000_000).toFixed(0)}억`;
		} else {
			return `${(num / 10_000).toFixed(0)}만`;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	onMount(() => {
		loadDetailData();
	});

	const years = [2020, 2021, 2022, 2023, 2024];
</script>

<div class="modal-backdrop" onclick={handleBackdropClick} role="button" tabindex="0">
	<div class="modal-content">
		<div class="modal-header">
			<h2>{organization.company_name}</h2>
			<button class="close-button" onclick={onClose} type="button">✕</button>
		</div>

		{#if loading}
			<div class="loading">로딩 중...</div>
		{:else if detailData}
			<div class="modal-body">
				<!-- Basic Information -->
				<section class="info-section">
					<h3>기본 정보</h3>
					<div class="info-grid">
						{#if detailData.ceo_name}
							<div class="info-item">
								<span class="label">대표자</span>
								<span class="value">{detailData.ceo_name}</span>
							</div>
						{/if}

						{#if detailData.email}
							<div class="info-item">
								<span class="label">이메일</span>
								<span class="value">{detailData.email}</span>
							</div>
						{/if}

						{#if detailData.company_scale}
							<div class="info-item">
								<span class="label">기업 규모</span>
								<span class="value">{detailData.company_scale}</span>
							</div>
						{/if}

						{#if detailData.company_status}
							<div class="info-item">
								<span class="label">기업 상태</span>
								<span class="value">{detailData.company_status}</span>
							</div>
						{/if}

						{#if detailData.established_date}
							<div class="info-item">
								<span class="label">설립일</span>
								<span class="value">{detailData.established_date}</span>
							</div>
						{/if}

						<div class="info-item">
							<span class="label">기업부설연구소</span>
							<span class="value">{detailData.has_research_institute ? '보유' : '미보유'}</span>
						</div>

						{#if detailData.ksic_10th_name}
							<div class="info-item full-width">
								<span class="label">업종 (KSIC 10차)</span>
								<span class="value"
									>{detailData.ksic_10th_name}
									{#if detailData.ksic_10th_code}
										<span class="code">({detailData.ksic_10th_code})</span>
									{/if}
								</span>
							</div>
						{/if}

						{#if detailData.main_products}
							<div class="info-item full-width">
								<span class="label">주요 제품/서비스</span>
								<span class="value">{detailData.main_products}</span>
							</div>
						{/if}
					</div>
				</section>

				<!-- Financial Data -->
				{#if detailData.yearly_data}
					<section class="info-section">
						<h3>재무 데이터 (2020-2024)</h3>
						<div class="table-wrapper">
							<table class="data-table">
								<thead>
									<tr>
										<th>구분</th>
										{#each years as year}
											<th>{year}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#if detailData.yearly_data.revenue}
										<tr>
											<td class="label-cell">매출액</td>
											{#each years as year}
												<td>{formatCurrency(detailData.yearly_data.revenue[year])}</td>
											{/each}
										</tr>
									{/if}

									{#if detailData.yearly_data.employees}
										<tr>
											<td class="label-cell">종사자 수</td>
											{#each years as year}
												<td>{formatNumber(detailData.yearly_data.employees[year])}명</td>
											{/each}
										</tr>
									{/if}

									{#if detailData.yearly_data.export_amount}
										<tr>
											<td class="label-cell">수출액</td>
											{#each years as year}
												<td>{formatCurrency(detailData.yearly_data.export_amount[year])}</td>
											{/each}
										</tr>
									{/if}

									{#if detailData.yearly_data.rd_expense}
										<tr>
											<td class="label-cell">연구개발비</td>
											{#each years as year}
												<td>{formatCurrency(detailData.yearly_data.rd_expense[year])}</td>
											{/each}
										</tr>
									{/if}
								</tbody>
							</table>
						</div>
					</section>

					<!-- Patent Data -->
					{#if detailData.yearly_data.patent_registrations || detailData.yearly_data.patent_applications}
						<section class="info-section">
							<h3>특허 데이터 (2020-2024)</h3>
							<div class="table-wrapper">
								<table class="data-table">
									<thead>
										<tr>
											<th>구분</th>
											{#each years as year}
												<th>{year}</th>
											{/each}
										</tr>
									</thead>
									<tbody>
										{#if detailData.yearly_data.patent_registrations}
											<tr>
												<td class="label-cell">특허 등록</td>
												{#each years as year}
													<td>{formatNumber(detailData.yearly_data.patent_registrations[year])}건</td>
												{/each}
											</tr>
										{/if}

										{#if detailData.yearly_data.patent_applications}
											<tr>
												<td class="label-cell">특허 출원</td>
												{#each years as year}
													<td>{formatNumber(detailData.yearly_data.patent_applications[year])}건</td>
												{/each}
											</tr>
										{/if}
									</tbody>
								</table>
							</div>
						</section>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.modal-content {
		background: var(--bg);
		border-radius: var(--rounded-lg);
		max-width: 1000px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.modal-header {
		padding: var(--space-6);
		border-bottom: 1px solid var(--border);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h2 {
		margin: 0;
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		color: var(--fg);
	}

	.close-button {
		width: 32px;
		height: 32px;
		border-radius: var(--rounded-sm);
		border: 1px solid var(--border);
		background: var(--bg-secondary);
		color: var(--muted);
		cursor: pointer;
		transition: all 0.2s;
		font-size: var(--text-xl);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-button:hover {
		background: var(--bg);
		border-color: var(--accent);
		color: var(--accent);
	}

	.modal-body {
		padding: var(--space-6);
		overflow-y: auto;
		flex: 1;
	}

	.loading {
		padding: var(--space-8);
		text-align: center;
		color: var(--muted);
	}

	.info-section {
		margin-bottom: var(--space-6);
	}

	.info-section:last-child {
		margin-bottom: 0;
	}

	.info-section h3 {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin: 0 0 var(--space-4) 0;
		padding-bottom: var(--space-2);
		border-bottom: 2px solid var(--border);
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-4);
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.info-item.full-width {
		grid-column: 1 / -1;
	}

	.label {
		font-size: var(--text-sm);
		color: var(--muted);
		font-weight: var(--font-medium);
	}

	.value {
		font-size: var(--text-base);
		color: var(--fg);
	}

	.code {
		color: var(--muted);
		font-size: var(--text-sm);
	}

	.table-wrapper {
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.data-table th {
		background: var(--bg-secondary);
		padding: var(--space-3);
		text-align: left;
		font-weight: var(--font-semibold);
		color: var(--fg);
		border: 1px solid var(--border);
	}

	.data-table td {
		padding: var(--space-3);
		border: 1px solid var(--border);
		color: var(--fg);
	}

	.data-table .label-cell {
		font-weight: var(--font-medium);
		background: var(--bg-secondary);
	}

	.data-table tr:hover {
		background: var(--bg-secondary);
	}
</style>
