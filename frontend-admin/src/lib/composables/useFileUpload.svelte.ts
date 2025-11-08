/**
 * useFileUpload
 *
 * Composable for handling file uploads with drag-and-drop support.
 * Extracted from AddNoticeModal lines 143-220.
 *
 * @example
 * ```typescript
 * const fileUpload = useFileUpload(10); // 10MB max
 *
 * // Upload file programmatically
 * const result = await fileUpload.uploadFile(file);
 *
 * // Drag and drop handlers
 * <div
 *   ondragenter={fileUpload.handleDragEnter}
 *   ondragleave={fileUpload.handleDragLeave}
 *   ondragover={fileUpload.handleDragOver}
 *   ondrop={fileUpload.handleDrop}
 * >
 *   {fileUpload.isDragging ? 'Drop file here' : 'Drag file here'}
 * </div>
 * ```
 */

import { toast } from '$lib/stores/toast';
import { API_BASE_URL } from '$lib/config/api';

/**
 * Upload result containing file information
 */
export interface UploadResult {
	filename: string;
	url: string;
}

/**
 * Creates a file upload manager with drag-and-drop support
 *
 * @param maxSizeMB - Maximum file size in megabytes (default: 10)
 * @returns Object containing reactive state and upload methods
 */
export function useFileUpload(maxSizeMB: number = 10) {
	// Reactive state using Svelte 5 runes
	let uploading = $state(false);
	let isDragging = $state(false);

	/**
	 * Upload a file to the server
	 *
	 * @param file - File to upload
	 * @returns Upload result with filename and URL, or null on error
	 */
	async function uploadFile(file: File): Promise<UploadResult | null> {
		// Validate file size
		const maxSize = maxSizeMB * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다`);
			return null;
		}

		uploading = true;

		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch(`${API_BASE_URL}/notices/upload-attachment`, {
				method: 'POST',
				body: formData
			});

			if (res.ok) {
				const result = await res.json();
				toast.success('파일이 업로드되었습니다');
				return { filename: result.filename, url: result.url };
			} else {
				const error = await res.json();
				toast.error(error.detail || '파일 업로드 실패');
				return null;
			}
		} catch (error) {
			console.error('File upload error:', error);
			toast.error('파일 업로드 중 오류 발생');
			return null;
		} finally {
			uploading = false;
		}
	}

	/**
	 * Handle drag enter event
	 *
	 * @param e - Drag event
	 */
	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragging = true;
	}

	/**
	 * Handle drag leave event
	 *
	 * @param e - Drag event
	 */
	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		// Only set to false if leaving the drop zone itself
		const target = e.target as HTMLElement;
		if (target.classList.contains('file-upload-area')) {
			isDragging = false;
		}
	}

	/**
	 * Handle drag over event
	 *
	 * @param e - Drag event
	 */
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
	}

	/**
	 * Handle drop event and upload the file
	 *
	 * @param e - Drag event
	 * @returns Upload result with filename and URL, or null on error
	 */
	async function handleDrop(e: DragEvent): Promise<UploadResult | null> {
		e.preventDefault();
		e.stopPropagation();
		isDragging = false;

		const files = e.dataTransfer?.files;
		if (!files || files.length === 0) return null;

		// Upload first file only
		return await uploadFile(files[0]);
	}

	return {
		// Reactive state
		get uploading() { return uploading; },
		get isDragging() { return isDragging; },

		// Methods
		uploadFile,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop
	};
}
