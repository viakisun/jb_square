<script lang="ts" generics="T">
	/**
	 * JB SQUARE DataTable Component
	 * BLACK/WHITE / ZERO-ROUND / INDUSTRIAL
	 *
	 * Features:
	 * - Monochrome table
	 * - ASCII sort arrows (▲/▼)
	 * - Sortable columns
	 * - Row hover state
	 * - Generic type support
	 *
	 * Usage:
	 * <DataTable {columns} {data} sortable />
	 */

	export interface Column<T> {
		key: keyof T;
		label: string;
		sortable?: boolean;
		width?: string;
		align?: 'left' | 'center' | 'right';
		render?: (value: any, row: T) => string;
	}

	interface DataTableProps<T> {
		columns: Column<T>[];
		data: T[];
		sortable?: boolean;
		hoverable?: boolean;
		striped?: boolean;
		onRowClick?: (row: T) => void;
		class?: string;
	}

	let {
		columns,
		data,
		sortable = false,
		hoverable = true,
		striped = false,
		onRowClick,
		class: className = ''
	}: DataTableProps<T> = $props();

	let sortKey = $state<keyof T | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');

	const sortedData = $derived(() => {
		if (!sortKey) return data;

		return [...data].sort((a, b) => {
			const key = sortKey;
			if (!key) return 0;

			const aValue = a[key];
			const bValue = b[key];

			if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	});

	function handleSort(column: Column<T>) {
		if (!sortable || !column.sortable) return;

		if (sortKey === column.key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = column.key;
			sortDirection = 'asc';
		}
	}

	function getSortIcon(column: Column<T>) {
		if (!sortable || !column.sortable) return '';
		if (sortKey !== column.key) return '';
		return sortDirection === 'asc' ? '▲' : '▼';
	}

	function getCellValue(row: T, column: Column<T>) {
		const value = row[column.key];
		return column.render ? column.render(value, row) : String(value);
	}
</script>

<div class="table-wrapper {className}">
	<table class="data-table" class:striped>
		<thead>
			<tr>
				{#each columns as column}
					<th
						class="table-header"
						class:sortable={sortable && column.sortable}
						style:width={column.width}
						style:text-align={column.align || 'left'}
						onclick={() => handleSort(column)}
						role={sortable && column.sortable ? 'button' : undefined}
						tabindex={sortable && column.sortable ? 0 : undefined}
						aria-sort={sortKey === column.key
							? sortDirection === 'asc'
								? 'ascending'
								: 'descending'
							: undefined}
					>
						<span class="header-content">
							{column.label}
							{#if getSortIcon(column)}
								<span class="sort-icon" aria-hidden="true">{getSortIcon(column)}</span>
							{/if}
						</span>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each sortedData() as row, i}
				<tr
					class="table-row"
					class:hoverable
					class:clickable={!!onRowClick}
					onclick={() => onRowClick?.(row)}
					role={onRowClick ? 'button' : undefined}
					tabindex={onRowClick ? 0 : undefined}
				>
					{#each columns as column}
						<td class="table-cell" style:text-align={column.align || 'left'}>
							{getCellValue(row, column)}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	/* ========================================
     TABLE WRAPPER
     ======================================== */

	.table-wrapper {
		width: 100%;
		overflow-x: auto;
	}

	/* ========================================
     TABLE
     ======================================== */

	.data-table {
		width: 100%;
		border-collapse: collapse;
		border: var(--border-width) solid var(--hair);
	}

	/* ========================================
     TABLE HEADER
     ======================================== */

	.table-header {
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--fg);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		background-color: var(--surface-1);
		border-bottom: var(--border-width) solid var(--hair);
		white-space: nowrap;
	}

	.table-header.sortable {
		cursor: pointer;
		user-select: none;
	}

	.table-header.sortable:hover {
		background-color: var(--surface-2);
	}

	.table-header.sortable:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: -2px;
	}

	.header-content {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.sort-icon {
		font-size: var(--text-xs);
		opacity: 0.7;
	}

	/* ========================================
     TABLE ROW
     ======================================== */

	.table-row {
		border-bottom: var(--border-width) solid var(--hair);
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.table-row.hoverable:hover {
		background-color: var(--ghost);
	}

	.table-row.clickable {
		cursor: pointer;
	}

	.table-row.clickable:focus-visible {
		outline: var(--focus-ring-width) solid var(--focus-black);
		outline-offset: -2px;
	}

	.data-table.striped .table-row:nth-child(even) {
		background-color: var(--ghost);
	}

	/* ========================================
     TABLE CELL
     ======================================== */

	.table-cell {
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-base);
		color: var(--fg);
		vertical-align: middle;
	}
</style>
