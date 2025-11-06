<script lang="ts">
	/**
	 * JB SQUARE Login Page
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Layout: Split screen
	 * - Left: White background, login form
	 * - Right: Black background, branding
	 */

	import { Button } from '$lib/components/ui/buttons';
	import { Input, Checkbox } from '$lib/components/ui/forms';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let isLoading = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!email || !password) {
			error = '이메일과 비밀번호를 입력해주세요.';
			return;
		}

		isLoading = true;

		// Simulate API call
		setTimeout(() => {
			isLoading = false;
			// Navigate to dashboard on success
			goto('/');
		}, 1000);
	}
</script>

<svelte:head>
	<title>로그인 - JB SQUARE Backoffice</title>
</svelte:head>

<div class="login-page">
	<!-- Left: Login Form -->
	<div class="login-form-section">
		<div class="login-form-container">
			<div class="login-header">
				<h1 class="login-title">JB SQUARE</h1>
				<p class="login-subtitle">Backoffice</p>
			</div>

			<form onsubmit={handleSubmit} class="login-form">
				<div class="form-fields">
					<Input
						type="email"
						label="이메일"
						placeholder="admin@jbsquare.com"
						bind:value={email}
						required
						fullWidth
					/>

					<Input
						type="password"
						label="비밀번호"
						placeholder="••••••••"
						bind:value={password}
						required
						fullWidth
					/>

					{#if error}
						<div class="login-error" role="alert">
							{error}
						</div>
					{/if}
				</div>

				<div class="form-options">
					<Checkbox bind:checked={rememberMe}>로그인 상태 유지</Checkbox>
				</div>

				<Button type="submit" variant="primary" fullWidth disabled={isLoading}>
					{isLoading ? '로그인 중...' : '로그인'}
				</Button>
			</form>

			<div class="login-footer">
				<p class="text-sm text-muted">
					전북 바이오 산업 플랫폼 관리자 시스템
				</p>
			</div>
		</div>
	</div>

	<!-- Right: Branding -->
	<div class="login-brand-section">
		<div class="brand-content">
			<div class="brand-icon">■</div>
			<h2 class="brand-title">JB SQUARE</h2>
			<p class="brand-description">
				전북 바이오 산업 공고 및<br />
				창업보육센터 관리 플랫폼
			</p>
			<div class="brand-stats">
				<div class="stat-item">
					<div class="stat-value">42</div>
					<div class="stat-label">등록된 공고</div>
				</div>
				<div class="stat-item">
					<div class="stat-value">15</div>
					<div class="stat-label">창업보육센터</div>
				</div>
				<div class="stat-item">
					<div class="stat-value">202</div>
					<div class="stat-label">입주기업</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* ========================================
     LOGIN PAGE LAYOUT
     ======================================== */

	.login-page {
		min-height: 100vh;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	/* ========================================
     LEFT: FORM SECTION
     ======================================== */

	.login-form-section {
		background-color: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-8);
	}

	.login-form-container {
		width: 100%;
		max-width: 400px;
	}

	/* ========================================
     HEADER
     ======================================== */

	.login-header {
		margin-bottom: var(--space-10);
	}

	.login-title {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		letter-spacing: var(--tracking-tight);
		color: var(--fg);
		margin-bottom: var(--space-2);
		text-transform: uppercase;
	}

	.login-subtitle {
		font-size: var(--text-md);
		color: var(--muted);
		font-weight: var(--font-normal);
	}

	/* ========================================
     FORM
     ======================================== */

	.login-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.form-options {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	/* ========================================
     ERROR MESSAGE
     ======================================== */

	.login-error {
		padding: var(--space-3);
		background-color: var(--surface-1);
		border: var(--border-width) solid var(--fg);
		font-size: var(--text-sm);
		color: var(--fg);
	}

	/* ========================================
     FOOTER
     ======================================== */

	.login-footer {
		margin-top: var(--space-10);
		text-align: center;
	}

	/* ========================================
     RIGHT: BRAND SECTION
     ======================================== */

	.login-brand-section {
		background-color: var(--fg);
		color: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-8);
	}

	.brand-content {
		text-align: center;
		max-width: 500px;
	}

	/* ========================================
     BRAND ICON
     ======================================== */

	.brand-icon {
		font-size: 80px;
		line-height: 1;
		margin-bottom: var(--space-6);
		opacity: 0.9;
	}

	/* ========================================
     BRAND TITLE
     ======================================== */

	.brand-title {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		letter-spacing: var(--tracking-tight);
		margin-bottom: var(--space-4);
		text-transform: uppercase;
	}

	/* ========================================
     BRAND DESCRIPTION
     ======================================== */

	.brand-description {
		font-size: var(--text-md);
		line-height: var(--leading-relaxed);
		opacity: 0.8;
		margin-bottom: var(--space-12);
	}

	/* ========================================
     BRAND STATS
     ======================================== */

	.brand-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-8);
		padding-top: var(--space-8);
		border-top: var(--border-width) solid rgba(255, 255, 255, 0.2);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
	}

	.stat-label {
		font-size: var(--text-sm);
		opacity: 0.7;
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 768px) {
		.login-page {
			grid-template-columns: 1fr;
		}

		.login-brand-section {
			display: none;
		}
	}
</style>
