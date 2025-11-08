/**
 * Crawl Queue API
 * Handles all API calls related to the notice crawl queue
 */

import { API_BASE_URL } from '$lib/config/api';

/**
 * Fetch crawl queue items for a specific source
 * @param sourceId - The source identifier (e.g., 'bizinfo', 'ntis', 'jbtp')
 * @returns Promise with queue items
 */
export async function fetchCrawlQueue(sourceId: string) {
	const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/list?source_id=${sourceId}`);
	if (!res.ok) {
		throw new Error(`Failed to fetch crawl queue: ${res.statusText}`);
	}
	const data = await res.json();
	return data.items;
}

/**
 * Delete a single queue item
 * @param id - The queue item ID
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteQueueItem(id: number): Promise<void> {
	const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/${id}`, {
		method: 'DELETE'
	});
	if (!res.ok) {
		throw new Error(`Failed to delete queue item ${id}: ${res.statusText}`);
	}
}

/**
 * Delete multiple queue items in parallel
 * @param ids - Array of queue item IDs to delete
 * @returns Promise with success and fail counts
 */
export async function bulkDeleteQueueItems(ids: number[]): Promise<{
	success: number;
	failed: number;
}> {
	let successCount = 0;
	let failCount = 0;

	// Delete all selected items in parallel
	const deletePromises = ids.map(async (id) => {
		try {
			const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/${id}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				successCount++;
				return { id, success: true };
			} else {
				failCount++;
				return { id, success: false };
			}
		} catch (error) {
			failCount++;
			return { id, success: false };
		}
	});

	await Promise.all(deletePromises);

	return {
		success: successCount,
		failed: failCount
	};
}
