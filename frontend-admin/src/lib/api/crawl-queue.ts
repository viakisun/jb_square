/**
 * Crawl Queue API
 * Handles all API calls related to the notice crawl queue
 */

import { API_BASE_URL } from '$lib/config/api';

/**
 * Fetch crawl queue items for a specific source
 * @param sourceId - The source identifier (e.g., 'bizinfo', 'ntis', 'jbtp')
 * @param status - Optional status filter ('pending', 'approved', 'rejected', 'all')
 * @returns Promise with queue items
 */
export async function fetchCrawlQueue(sourceId: string, status?: string) {
	let url = `${API_BASE_URL}/notices/crawl-queue/list?source_id=${sourceId}`;
	if (status) {
		url += `&status=${status}`;
	}
	const res = await fetch(url);
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

/**
 * Bulk approve crawl queue items
 * @param queueIds - Array of queue item IDs to approve
 * @param reason - Optional reason for approval
 * @returns Promise with approval result
 */
export async function bulkApproveQueueItems(queueIds: number[], reason?: string) {
	const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/bulk-approve`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ queue_ids: queueIds, reason })
	});

	if (!res.ok) {
		throw new Error(`Failed to approve queue items: ${res.statusText}`);
	}

	return res.json();
}

/**
 * Bulk reject crawl queue items
 * @param queueIds - Array of queue item IDs to reject
 * @param reason - Optional reason for rejection
 * @returns Promise with rejection result
 */
export async function bulkRejectQueueItems(queueIds: number[], reason?: string) {
	const res = await fetch(`${API_BASE_URL}/notices/crawl-queue/bulk-reject`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ queue_ids: queueIds, reason })
	});

	if (!res.ok) {
		throw new Error(`Failed to reject queue items: ${res.statusText}`);
	}

	return res.json();
}
