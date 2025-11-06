<script lang="ts">
	import { page } from '$app/stores';
	import type { ComponentType } from 'svelte';

	type Props = {
		href: string;
		label: string;
		icon: ComponentType;
		collapsed?: boolean;
		variant?: 'default' | 'child';
	};

	let { href, label, icon: Icon, collapsed = false, variant = 'default' }: Props = $props();

	const isActive = $derived($page.url.pathname === href);
</script>

<a
	{href}
	class="nav-item"
	class:active={isActive}
	class:child={variant === 'child'}
	class:collapsed
	aria-current={isActive ? 'page' : undefined}
	title={collapsed ? label : ''}
>
	<Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
	{#if !collapsed}
		<span>{label}</span>
	{/if}
</a>

<style>
	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: var(--nav-item-height);
		padding: var(--nav-padding-y) var(--nav-padding-x);
		font-size: var(--nav-font-size);
		font-weight: var(--font-normal);
		color: var(--muted);
		text-decoration: none;
		border-left: 3px solid transparent;
		border-radius: var(--radius-sm);
		margin: 0 var(--space-2);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.nav-item.child {
		padding-left: var(--nav-indent);
		font-size: var(--text-sm);
	}

	.nav-item.collapsed {
		justify-content: center;
		padding: var(--nav-padding-y);
	}

	.nav-item:hover {
		color: var(--fg);
		background-color: var(--ghost);
		transform: translateX(2px);
	}

	.nav-item.collapsed:hover {
		transform: none;
	}

	.nav-item.active {
		color: var(--fg);
		font-weight: var(--font-semibold);
		background-color: var(--surface-2);
		border-left-color: var(--fg);
	}

	.nav-item :global(svg) {
		flex-shrink: 0;
		vertical-align: middle;
	}

	.nav-item span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.nav-item:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: -2px;
	}
</style>
