/**
 * Notices API
 * Handles all API calls related to published notices
 */

import { API_BASE_URL } from '$lib/config/api';

/**
 * Parameters for fetching notices
 */
export interface FetchNoticesParams {
	source_id: string;
	category: string;
	status: string;
	limit: string;
	offset: string;
	search?: string;
	tag?: string;
}

/**
 * Fetch published notices with filters
 * @param params - Filter and pagination parameters
 * @returns Promise with notices data (items and total count)
 */
export async function fetchNotices(params: FetchNoticesParams) {
	const urlParams = new URLSearchParams({
		source_id: params.source_id,
		category: params.category,
		status: params.status,
		limit: params.limit,
		offset: params.offset
	});

	if (params.search) {
		urlParams.append('search', params.search);
	}

	if (params.tag) {
		urlParams.append('tag', params.tag);
	}

	const res = await fetch(`${API_BASE_URL}/notices?${urlParams}`);
	if (!res.ok) {
		throw new Error(`Failed to fetch notices: ${res.statusText}`);
	}

	const data = await res.json();
	return {
		items: data.items,
		total: data.total
	};
}

/**
 * Publish queue items as notices
 * @param queueIds - Array of queue item IDs to publish
 * @param category - Notice category (e.g., 'business', 'government')
 * @param tags - Array of tag IDs to assign to the notices
 * @returns Promise with publish result (published count)
 */
export async function publishNotices(
	queueIds: number[],
	category: string,
	tags: number[]
): Promise<{ published: number }> {
	const res = await fetch(`${API_BASE_URL}/notices/publish`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			queue_ids: queueIds,
			category: category,
			tags: tags
		})
	});

	if (!res.ok) {
		throw new Error(`Failed to publish notices: ${res.statusText}`);
	}

	const data = await res.json();
	return data;
}

/**
 * Bulk delete (archive) multiple notices
 * @param noticeIds - Array of notice IDs to delete/archive
 * @returns Promise with archived count
 */
export async function bulkDeleteNotices(noticeIds: number[]): Promise<{ archived: number }> {
	const res = await fetch(`${API_BASE_URL}/notices/bulk-delete`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			notice_ids: noticeIds
		})
	});

	if (!res.ok) {
		throw new Error(`Failed to delete notices: ${res.statusText}`);
	}

	const data = await res.json();
	return data;
}
