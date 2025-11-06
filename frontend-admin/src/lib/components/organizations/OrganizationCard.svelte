<script lang="ts">
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

	type Props = {
		organization: Organization;
		onclick?: () => void;
	};

	let { organization, onclick }: Props = $props();

	function getIndustryTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			BIO_CORE: '바이오 핵심산업',
			BIO_RELATED: '전후방 연관산업',
			NON_BIO: '비바이오'
		};
		return labels[type] || type;
	}

	function getIndustryTypeColor(type: string): string {
		const colors: Record<string, string> = {
			BIO_CORE: 'core',
			BIO_RELATED: 'related',
			NON_BIO: 'non'
		};
		return colors[type] || 'non';
	}

	function getStatusColor(status: string): string {
		const colors: Record<string, string> = {
			영업중: 'green',
			휴업: 'yellow',
			폐업: 'red'
		};
		return colors[status] || 'gray';
	}
</script>

<button class="org-card" onclick={onclick} type="button">
	<div class="card-header">
		<div class="company-info">
			<h3 class="company-name">{organization.company_name}</h3>
			{#if organization.ceo_name}
				<p class="ceo-name">대표: {organization.ceo_name}</p>
			{/if}
		</div>
		<div class="badges">
			<span class="badge industry-type" data-color={getIndustryTypeColor(organization.industry_type)}>
				{getIndustryTypeLabel(organization.industry_type)}
			</span>
		</div>
	</div>

	<div class="card-body">
		<div class="info-grid">
			{#if organization.company_scale}
				<div class="info-item">
					<span class="label">기업 규모</span>
					<span class="value">{organization.company_scale}</span>
				</div>
			{/if}

			{#if organization.company_status}
				<div class="info-item">
					<span class="label">상태</span>
					<span class="badge status" data-color={getStatusColor(organization.company_status)}>
						{organization.company_status}
					</span>
				</div>
			{/if}

			{#if organization.ksic_10th_code || organization.ksic_10th_name}
				<div class="info-item full-width">
					<span class="label">KSIC 코드 / 업종</span>
					<span class="value ksic-code">
						{#if organization.ksic_10th_code}
							<span class="code-number">{organization.ksic_10th_code}</span>
						{/if}
						{#if organization.ksic_10th_name}
							<span class="code-name">{organization.ksic_10th_name}</span>
						{/if}
					</span>
				</div>
			{/if}

			{#if organization.main_products}
				<div class="info-item full-width">
					<span class="label">주요 제품</span>
					<span class="value products">{organization.main_products}</span>
				</div>
			{/if}
		</div>
	</div>

	<div class="card-footer">
		<div class="footer-left">
			{#if organization.has_research_institute}
				<span class="ri-badge">기업부설연구소</span>
			{/if}
		</div>
		<div class="footer-right">
			<span class="view-details">자세히 보기 →</span>
		</div>
	</div>
</button>

<style>
	.org-card {
		display: flex;
		flex-direction: column;
		background: var(--bg);
		border: var(--border-width) solid var(--hair);
		padding: var(--space-4);
		gap: var(--space-3);
		cursor: pointer;
		transition: all var(--duration-base) var(--ease-out);
		text-align: left;
		width: 100%;
	}

	.org-card:hover {
		border-color: var(--fg);
		box-shadow: 4px 4px 0 var(--fg);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-3);
	}

	.company-info {
		flex: 1;
		min-width: 0;
	}

	.company-name {
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--fg);
		margin: 0 0 var(--space-1) 0;
		word-break: break-word;
	}

	.ceo-name {
		font-size: var(--text-sm);
		color: var(--muted);
		margin: 0;
	}

	.badges {
		display: flex;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.badge {
		padding: var(--space-1) var(--space-2);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		white-space: nowrap;
		border: var(--border-width) solid var(--fg);
	}

	.badge.industry-type[data-color='core'] {
		background: var(--fg);
		color: var(--bg);
		font-weight: var(--font-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.badge.industry-type[data-color='related'] {
		background: var(--bg);
		color: var(--fg);
		font-weight: var(--font-semibold);
	}

	.badge.industry-type[data-color='non'] {
		background: var(--bg);
		color: var(--muted);
		opacity: 0.7;
	}

	.badge.status[data-color='green'] {
		background: var(--fg);
		color: var(--bg);
	}

	.badge.status[data-color='yellow'] {
		background: var(--bg);
		color: var(--fg);
		opacity: 0.8;
	}

	.badge.status[data-color='red'] {
		background: var(--bg);
		color: var(--muted);
	}

	.card-body {
		flex: 1;
	}

	.info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
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
		font-size: var(--text-xs);
		color: var(--muted);
		font-weight: var(--font-medium);
	}

	.value {
		font-size: var(--text-sm);
		color: var(--fg);
	}

	.value.products {
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.value.ksic-code {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.code-number {
		font-family: monospace;
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--fg);
		padding: var(--space-1) var(--space-2);
		background: var(--bg-secondary);
		border: var(--border-width) solid var(--hair);
	}

	.code-name {
		font-size: var(--text-sm);
		color: var(--fg);
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: var(--space-2);
		border-top: var(--border-width) solid var(--hair);
	}

	.footer-left {
		display: flex;
		gap: var(--space-2);
	}

	.ri-badge {
		padding: var(--space-1) var(--space-2);
		background: var(--fg);
		color: var(--bg);
		font-size: var(--text-xs);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.view-details {
		font-size: var(--text-sm);
		color: var(--fg);
		font-weight: var(--font-medium);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.org-card:hover .view-details {
		text-decoration: underline;
	}
</style>
