<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/app.css';
	import { page } from '$app/stores';
	import { Toast } from '$lib/components/feedback';

	let { children } = $props();

	const navItems = [
		{ path: '/', label: '대시보드' },
		{ path: '/contents', label: '콘텐츠' },
		{ path: '/organizations', label: '기업·기관' },
		{ path: '/analytics', label: '통계' },
		{ path: '/settings', label: '설정' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>JB SQUARE Backoffice</title>
</svelte:head>

<div class="app">
	<!-- Skip Link for Accessibility -->
	<a href="#main" class="skip-link">메인 컨텐츠로 이동</a>

	<!-- Top Bar -->
	<header class="topbar">
		<div class="topbar-left">
			<a href="/" class="brand">JB SQUARE</a>
		</div>
		<div class="topbar-right">
			<button class="btn-text" type="button">관리자</button>
			<button class="btn-text" type="button">로그아웃</button>
		</div>
	</header>

	<!-- Sidebar + Main Layout -->
	<div class="layout">
		<!-- Sidebar Navigation -->
		<nav class="sidebar" aria-label="Main navigation">
			{#each navItems as item}
				<a
					href={item.path}
					class="sidebar-item"
					class:active={$page.url.pathname === item.path}
					aria-current={$page.url.pathname === item.path ? 'page' : undefined}
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- Main Content -->
		<main id="main" class="main">
			{@render children?.()}
		</main>
	</div>

	<!-- Global Toast Notifications -->
	<Toast />
</div>

<style>
	/* ========================================
	   APP CONTAINER
	   ======================================== */

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: var(--bg);
	}

	/* ========================================
	   SKIP LINK (A11Y)
	   ======================================== */

	.skip-link {
		position: absolute;
		top: -100px;
		left: var(--space-4);
		z-index: var(--z-toast);
		padding: var(--space-2) var(--space-4);
		background-color: var(--fg);
		color: var(--bg);
		text-decoration: none;
		font-weight: var(--font-medium);
		border: var(--border-width) solid var(--fg);
	}

	.skip-link:focus {
		top: var(--space-4);
	}

	/* ========================================
	   TOP BAR
	   ======================================== */

	.topbar {
		height: var(--topbar-height);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 var(--space-6);
		background-color: var(--bg);
		border-bottom: var(--border-width) solid var(--hair);
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
	}

	.topbar-left,
	.topbar-right {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.brand {
		font-size: var(--text-md);
		font-weight: var(--font-semibold);
		letter-spacing: var(--tracking-tight);
		text-decoration: none;
		color: var(--fg);
		text-transform: uppercase;
	}

	.brand:hover {
		opacity: 0.7;
	}

	.btn-text {
		background: none;
		border: none;
		padding: var(--space-2);
		font-size: var(--text-sm);
		color: var(--muted);
		cursor: pointer;
		transition: color var(--duration-base) var(--ease-out);
	}

	.btn-text:hover {
		color: var(--fg);
	}

	.btn-text:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: 2px;
	}

	/* ========================================
	   LAYOUT (SIDEBAR + MAIN)
	   ======================================== */

	.layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ========================================
	   SIDEBAR
	   ======================================== */

	.sidebar {
		width: var(--sidebar-width);
		background-color: var(--bg);
		border-right: var(--border-width) solid var(--hair);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.sidebar-item {
		display: block;
		padding: var(--space-3) var(--space-6);
		font-size: var(--text-base);
		font-weight: var(--font-normal);
		color: var(--muted);
		text-decoration: none;
		border-left: 2px solid transparent;
		transition: all var(--duration-base) var(--ease-out);
		position: relative;
	}

	.sidebar-item:hover {
		color: var(--fg);
		background-color: var(--ghost);
	}

	.sidebar-item.active {
		color: var(--fg);
		font-weight: var(--font-medium);
		background-color: var(--surface-1);
		border-left-color: var(--fg);
	}

	.sidebar-item:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: -2px;
	}

	/* ========================================
	   MAIN CONTENT
	   ======================================== */

	.main {
		flex: 1;
		overflow-y: auto;
		background-color: var(--bg);
	}
</style>
