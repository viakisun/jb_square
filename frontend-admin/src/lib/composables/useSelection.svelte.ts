/**
 * useSelection
 *
 * Composable for managing multi-select functionality.
 * Extracted from CrawlQueueTable (lines 42-70) and PublishedNoticesList (lines 104-113).
 *
 * @example
 * ```typescript
 * const selection = useSelection<QueueItem>();
 *
 * // Toggle single item
 * selection.toggleItem(item.id);
 *
 * // Toggle all items
 * selection.toggleAll(items);
 *
 * // Check if selected
 * const selected = selection.isSelected(item.id);
 *
 * // Access selected count
 * console.log(selection.selectedCount);
 * ```
 */

/**
 * Generic type constraint for items with an id property
 */
export type SelectableItem = { id: number };

/**
 * Creates a selection manager for items with numeric IDs
 *
 * @template T - Type of items to select (must have an `id: number` property)
 * @returns Object containing reactive state, computed values, and selection methods
 */
export function useSelection<T extends SelectableItem>() {
	// Reactive state using Svelte 5 runes
	let selectedIds = $state<Set<number>>(new Set());
	let allSelected = $state(false);

	// Computed value using $derived
	let selectedCount = $derived(selectedIds.size);

	/**
	 * Toggle selection for a single item
	 *
	 * @param id - ID of the item to toggle
	 */
	function toggleItem(id: number) {
		const newSelectedIds = new Set(selectedIds);
		if (newSelectedIds.has(id)) {
			newSelectedIds.delete(id);
		} else {
			newSelectedIds.add(id);
		}
		selectedIds = newSelectedIds;
	}

	/**
	 * Toggle selection for all items
	 *
	 * @param items - Array of items to select/deselect
	 */
	function toggleAll(items: T[]) {
		if (allSelected) {
			selectedIds = new Set();
			allSelected = false;
		} else {
			selectedIds = new Set(items.map((item) => item.id));
			allSelected = true;
		}
	}

	/**
	 * Clear all selections
	 */
	function clearSelection() {
		selectedIds = new Set();
		allSelected = false;
	}

	/**
	 * Check if an item is selected
	 *
	 * @param id - ID of the item to check
	 * @returns True if the item is selected
	 */
	function isSelected(id: number): boolean {
		return selectedIds.has(id);
	}

	return {
		// Reactive state
		get selectedIds() { return selectedIds; },
		set selectedIds(value: Set<number>) { selectedIds = value; },
		get allSelected() { return allSelected; },
		set allSelected(value: boolean) { allSelected = value; },

		// Computed values
		get selectedCount() { return selectedCount; },

		// Methods
		toggleItem,
		toggleAll,
		clearSelection,
		isSelected
	};
}
