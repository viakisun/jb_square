/**
 * Tag Constants
 * Centralized tag definitions and options
 */

export interface TagOption {
	value: string;
	label: string;
}

/**
 * Available tag options for filtering and selection
 */
export const TAG_OPTIONS: TagOption[] = [
	{ value: '', label: '모든 태그' },
	{ value: 'R&D', label: 'R&D' },
	{ value: '바이오', label: '바이오' },
	{ value: '창업', label: '창업' },
	{ value: '기술이전', label: '기술이전' },
	{ value: '스타트업', label: '스타트업' }
];

/**
 * Get tag label by value
 * @param value - Tag value
 * @returns Tag label or the value itself if not found
 */
export function getTagLabel(value: string): string {
	const tag = TAG_OPTIONS.find(t => t.value === value);
	return tag?.label || value;
}

/**
 * Get all tag values (excluding empty filter option)
 */
export const TAG_VALUES = TAG_OPTIONS.filter(t => t.value !== '').map(t => t.value);
