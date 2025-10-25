<script lang="ts">
	/**
	 * Login Layout - No header/sidebar
	 * Import only the essential CSS
	 */
	import '$lib/app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>JB SQUARE Backoffice</title>
</svelte:head>

{@render children?.()}
