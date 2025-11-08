/**
 * Date Utility Functions
 * Centralized date formatting and calculations
 */

/**
 * Format a date string to Korean locale format (YYYY. MM. DD)
 * @param dateString - ISO date string or null
 * @returns Formatted date string or '-' if null/invalid
 */
export function formatDate(dateString: string | null): string {
	if (!dateString) return '-';
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	} catch {
		return dateString;
	}
}

/**
 * Calculate days until a deadline
 * @param deadline - ISO date string or null
 * @returns Number of days until deadline (negative if past) or null if invalid
 */
export function getDaysUntilDeadline(deadline: string | null): number | null {
	if (!deadline) return null;
	try {
		const deadlineDate = new Date(deadline);
		const today = new Date();
		const diffTime = deadlineDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	} catch {
		return null;
	}
}

/**
 * Get deadline badge information based on days remaining
 * @param daysLeft - Number of days until deadline
 * @returns Badge text and variant (color) for UI display
 */
export function getDeadlineBadge(daysLeft: number | null): {
	text: string;
	variant: 'danger' | 'warning' | 'success' | 'neutral';
} {
	if (daysLeft === null) {
		return { text: '마감일 없음', variant: 'neutral' };
	}

	if (daysLeft < 0) {
		return { text: '마감', variant: 'danger' };
	}

	if (daysLeft === 0) {
		return { text: 'D-Day', variant: 'danger' };
	}

	if (daysLeft <= 3) {
		return { text: `D-${daysLeft}`, variant: 'danger' };
	}

	if (daysLeft <= 7) {
		return { text: `D-${daysLeft}`, variant: 'warning' };
	}

	return { text: `D-${daysLeft}`, variant: 'success' };
}
