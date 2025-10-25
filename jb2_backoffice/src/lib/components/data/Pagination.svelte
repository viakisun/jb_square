<script lang="ts">
	/**
	 * JB SQUARE Pagination Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Page navigation with square design
	 *
	 * Usage:
	 * <Pagination currentPage={1} totalPages={10} onPageChange={handlePageChange} />
	 */

	interface PaginationProps {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
		showFirstLast?: boolean;
		maxVisible?: number;
		class?: string;
	}

	let {
		currentPage,
		totalPages,
		onPageChange,
		showFirstLast = true,
		maxVisible = 7,
		class: className = ''
	}: PaginationProps = $props();

	const canGoPrev = $derived(currentPage > 1);
	const canGoNext = $derived(currentPage < totalPages);

	function getVisiblePages() {
		if (totalPages <= maxVisible) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const half = Math.floor(maxVisible / 2);
		let start = Math.max(1, currentPage - half);
		let end = Math.min(totalPages, start + maxVisible - 1);

		if (end - start < maxVisible - 1) {
			start = Math.max(1, end - maxVisible + 1);
		}

		const pages: (number | string)[] = [];

		if (start > 1) {
			pages.push(1);
			if (start > 2) pages.push('...');
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (end < totalPages) {
			if (end < totalPages - 1) pages.push('...');
			pages.push(totalPages);
		}

		return pages;
	}

	const visiblePages = $derived(getVisiblePages());

	function handlePageClick(page: number | string) {
		if (typeof page === 'number' && page !== currentPage) {
			onPageChange(page);
		}
	}

	function handlePrev() {
		if (canGoPrev) {
			onPageChange(currentPage - 1);
		}
	}

	function handleNext() {
		if (canGoNext) {
			onPageChange(currentPage + 1);
		}
	}

	function handleFirst() {
		if (currentPage !== 1) {
			onPageChange(1);
		}
	}

	function handleLast() {
		if (currentPage !== totalPages) {
			onPageChange(totalPages);
		}
	}
</script>

<nav class="pagination {className}" role="navigation" aria-label="Pagination">
	<div class="pagination-info">
		<span class="text-sm text-muted">
			Page {currentPage} of {totalPages}
		</span>
	</div>

	<ul class="pagination-list">
		{#if showFirstLast}
			<li>
				<button
					type="button"
					class="pagination-btn"
					disabled={currentPage === 1}
					onclick={handleFirst}
					aria-label="Go to first page"
				>
					«
				</button>
			</li>
		{/if}

		<li>
			<button
				type="button"
				class="pagination-btn"
				disabled={!canGoPrev}
				onclick={handlePrev}
				aria-label="Go to previous page"
			>
				‹
			</button>
		</li>

		{#each visiblePages as page}
			<li>
				{#if page === '...'}
					<span class="pagination-ellipsis" aria-hidden="true">…</span>
				{:else}
					<button
						type="button"
						class="pagination-btn"
						class:active={page === currentPage}
						onclick={() => handlePageClick(page)}
						aria-label="Go to page {page}"
						aria-current={page === currentPage ? 'page' : undefined}
					>
						{page}
					</button>
				{/if}
			</li>
		{/each}

		<li>
			<button
				type="button"
				class="pagination-btn"
				disabled={!canGoNext}
				onclick={handleNext}
				aria-label="Go to next page"
			>
				›
			</button>
		</li>

		{#if showFirstLast}
			<li>
				<button
					type="button"
					class="pagination-btn"
					disabled={currentPage === totalPages}
					onclick={handleLast}
					aria-label="Go to last page"
				>
					»
				</button>
			</li>
		{/if}
	</ul>
</nav>

<style>
	/* ========================================
     PAGINATION CONTAINER
     ======================================== */

	.pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	/* ========================================
     PAGINATION INFO
     ======================================== */

	.pagination-info {
		display: flex;
		align-items: center;
	}

	/* ========================================
     PAGINATION LIST
     ======================================== */

	.pagination-list {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* ========================================
     PAGINATION BUTTON
     ======================================== */

	.pagination-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
		padding: 0 var(--space-2);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--fg);
		background-color: var(--bg);
		border: var(--border-width) solid var(--hair);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out-expo);
		font-variant-numeric: tabular-nums;
	}

	.pagination-btn:hover:not(:disabled):not(.active) {
		background-color: var(--ghost);
		border-color: var(--muted);
	}

	.pagination-btn:active:not(:disabled) {
		transform: scale(var(--hover-scale));
	}

	.pagination-btn.active {
		background-color: var(--fg);
		color: var(--bg);
		border-color: var(--fg);
	}

	.pagination-btn:disabled {
		cursor: not-allowed;
		opacity: 0.3;
	}

	.pagination-btn:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: 2px;
	}

	/* ========================================
     PAGINATION ELLIPSIS
     ======================================== */

	.pagination-ellipsis {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
		padding: 0 var(--space-2);
		font-size: var(--text-sm);
		color: var(--muted);
		user-select: none;
	}

	/* ========================================
     RESPONSIVE
     ======================================== */

	@media (max-width: 640px) {
		.pagination {
			flex-direction: column;
			align-items: stretch;
		}

		.pagination-info {
			justify-content: center;
		}

		.pagination-list {
			justify-content: center;
		}
	}

	/* ========================================
     REDUCED MOTION
     ======================================== */

	@media (prefers-reduced-motion: reduce) {
		.pagination-btn {
			transition: none;
		}

		.pagination-btn:active:not(:disabled) {
			transform: none;
		}
	}
</style>
