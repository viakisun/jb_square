<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import NavItem from './NavItem.svelte';
	import type { ComponentType } from 'svelte';

	type NavChild = {
		path: string;
		label: string;
		icon: ComponentType;
	};

	type Props = {
		label: string;
		icon: ComponentType;
		children: NavChild[];
		collapsed?: boolean;
		expanded?: boolean;
		ontoggle?: () => void;
	};

	let { label, icon: Icon, children, collapsed = false, expanded = true, ontoggle }: Props = $props();
</script>

<div class="nav-group">
	<button class="nav-group-label" class:collapsed onclick={ontoggle} type="button" aria-expanded={expanded}>
		{#if !collapsed}
			<Icon size={20} strokeWidth={1.5} />
			<span>{label}</span>
			<ChevronDown
				size={16}
				class="chevron"
				style="transform: rotate({expanded ? 0 : -90}deg);"
			/>
		{:else}
			<Icon size={20} strokeWidth={1.5} />
		{/if}
	</button>

	{#if expanded || collapsed}
		{#each children as child}
			<NavItem href={child.path} label={child.label} icon={child.icon} {collapsed} variant="child" />
		{/each}
	{/if}
</div>

<style>
	.nav-group {
		display: flex;
		flex-direction: column;
	}

	.nav-group-label {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: var(--nav-item-height);
		padding: var(--nav-padding-y) var(--nav-padding-x);
		margin: 0 var(--space-2);
		font-size: var(--nav-font-size);
		font-weight: var(--font-bold);
		color: var(--fg);
		background: none;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.nav-group-label.collapsed {
		justify-content: center;
		padding: var(--nav-padding-y);
	}

	.nav-group-label :global(svg) {
		flex-shrink: 0;
		vertical-align: middle;
	}

	.nav-group-label :global(.chevron) {
		margin-left: auto;
		transition: transform var(--duration-base) var(--ease-out);
	}

	.nav-group-label span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.nav-group-label:hover {
		color: var(--fg);
		background-color: var(--ghost);
	}

	.nav-group-label:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: -2px;
	}
</style>
