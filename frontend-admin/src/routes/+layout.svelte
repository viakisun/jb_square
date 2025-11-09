<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/app.css';
	import { Toast } from '$lib/components/feedback';
	import { NavItem, NavGroup } from '$lib/components/navigation';
	import { Menu, User } from 'lucide-svelte';
	import {
		LayoutDashboard,
		FileText,
		Building,
		Building2,
		MapPin,
		Briefcase,
		FlaskConical,
		Rocket,
		Clock,
		Tag,
		BarChart3,
		Activity,
		Calendar
	} from 'lucide-svelte';

	let { children } = $props();

	let sidebarCollapsed = $state(false);
	let groupCollapsedState = $state<Record<string, boolean>>({
		'업무자동화': true
	});

	const navItems = [
		{ path: '/', label: '대시보드', icon: LayoutDashboard },
		{
			label: '업무자동화',
			icon: Briefcase,
			children: [
				{ path: '/notices/ntis', label: '정부 공고 (NTIS)', icon: Building2 },
				{ path: '/notices/jbtp', label: '지자체 사업공고', icon: MapPin },
				{ path: '/notices/external', label: '유관기관 공고', icon: Building },
				{ path: '/notices/business', label: '기업 맞춤형 지원사업', icon: Briefcase },
				{ path: '/notices/events', label: '교육/행사', icon: Calendar },
				{ path: '/notices/rnd', label: '연구개발(R&D)', icon: FlaskConical },
				{ path: '/notices/startup', label: '창업보육센터(BI)', icon: Rocket },
				{ path: '/notices/latest', label: '최신공고 모아보기', icon: Clock }
			]
		},
		{ path: '/contents', label: '콘텐츠 관리', icon: FileText },
		{ path: '/organizations', label: '기업·기관', icon: Building },
		{ path: '/ksic', label: 'KSIC 코드', icon: Tag },
		{ path: '/analytics', label: '통계', icon: BarChart3 },
		{ path: '/system-monitor', label: '시스템 모니터링', icon: Activity }
	];

	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}

	function toggleGroup(label: string) {
		groupCollapsedState[label] = !groupCollapsedState[label];
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>JB2 Backoffice</title>
</svelte:head>

<div class="app">
	<!-- Skip Link for Accessibility -->
	<a href="#main" class="skip-link">메인 컨텐츠로 이동</a>

	<!-- Top Bar -->
	<header class="topbar">
		<div class="topbar-left">
			<button class="sidebar-toggle" onclick={toggleSidebar} type="button" aria-label="Toggle sidebar">
				{#if sidebarCollapsed}
					<Menu size={20} />
				{:else}
					<Menu size={20} />
				{/if}
			</button>
			<a href="/" class="brand">JB2 Backoffice</a>
		</div>
		<div class="topbar-right">
			<div class="user-info">
				<User size={18} />
				<span>관리자</span>
			</div>
			<button class="btn-text" type="button">로그아웃</button>
		</div>
	</header>

	<!-- Sidebar + Main Layout -->
	<div class="layout">
		<!-- Sidebar Navigation -->
		<nav class="sidebar" class:collapsed={sidebarCollapsed} aria-label="Main navigation">
			{#each navItems as item}
				{#if item.children}
					<NavGroup
						label={item.label}
						icon={item.icon}
						children={item.children}
						collapsed={sidebarCollapsed}
						expanded={!groupCollapsedState[item.label]}
						ontoggle={() => toggleGroup(item.label)}
					/>
				{:else}
					<NavItem href={item.path} label={item.label} icon={item.icon} collapsed={sidebarCollapsed} />
				{/if}
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
		border-radius: var(--radius-xs);
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
		padding: 0 var(--space-8);
		background-color: var(--bg);
		border-bottom: 2px solid var(--hair);
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

	.sidebar-toggle {
		background: none;
		border: none;
		padding: var(--space-2);
		cursor: pointer;
		color: var(--fg);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.sidebar-toggle:hover {
		background-color: var(--ghost);
	}

	.brand {
		font-size: var(--text-lg);
		font-weight: var(--font-bold);
		letter-spacing: var(--tracking-tight);
		text-decoration: none;
		color: var(--fg);
		text-transform: uppercase;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.brand:hover {
		opacity: 0.7;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		color: var(--fg);
		background-color: var(--ghost);
		border-radius: var(--radius-sm);
	}

	.btn-text {
		background: none;
		border: none;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		color: var(--muted);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.btn-text:hover {
		color: var(--fg);
		background-color: var(--ghost);
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
		transition: width var(--duration-base) var(--ease-out-expo);
	}

	.sidebar.collapsed {
		width: var(--sidebar-width-collapsed);
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
