<script lang="ts">
	/**
	 * Redirect: /notices/government → /notices/local
	 * The government page has been split into:
	 * - /notices/ntis (정부 공고 - NTIS)
	 * - /notices/local (지자체 공고 - JBTP)
	 *
	 * Defaulting to local government (JBTP) for backward compatibility
	 */
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/notices/local', { replaceState: true });
	});
</script>

<svelte:head>
	<title>리디렉션 중... - JB SQUARE</title>
</svelte:head>

<div class="redirect-page">
	<p>페이지를 이동하는 중입니다...</p>
	<p class="redirect-note">
		정부/지자체 공고 페이지가 분리되었습니다:
		<br />
		• <a href="/notices/ntis">정부 공고 (NTIS)</a>
		<br />
		• <a href="/notices/local">지자체 공고 (JBTP)</a>
	</p>
</div>

<style>
	.redirect-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		gap: var(--space-4);
		text-align: center;
		color: var(--muted);
	}

	.redirect-note {
		font-size: var(--text-sm);
		max-width: 400px;
		line-height: 1.6;
	}

	.redirect-note a {
		color: var(--fg);
		text-decoration: underline;
	}

	.redirect-note a:hover {
		opacity: 0.7;
	}
</style>
