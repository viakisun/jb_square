/**
 * 📅 날짜 유틸리티 함수
 *
 * ISO 8601 형식의 날짜 문자열을 한국어 형식으로 변환하거나
 * 마감일 D-day를 계산하는 유틸리티 함수들을 제공합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { formatDate, getDaysUntilDeadline, formatRelativeTime } from '@/lib/utils/date';
 *
 * // ISO 날짜 포맷팅
 * formatDate('2024-12-25T10:30:00');  // '2024년 12월 25일'
 *
 * // D-day 계산
 * getDaysUntilDeadline('2024-12-31T23:59:59');  // 7 (7일 남음)
 *
 * // 상대 시간 표시
 * formatRelativeTime('2024-12-01T10:00:00');  // '2일 전'
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

/**
 * ISO 8601 날짜 문자열을 한국어 형식으로 변환
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열 (예: '2024-12-25T10:30:00')
 * @param includeTime - 시간 포함 여부 (기본값: false)
 * @returns 한국어 형식의 날짜 문자열 (예: '2024년 12월 25일' 또는 '2024년 12월 25일 10:30')
 *
 * @example
 * ```typescript
 * formatDate('2024-12-25T10:30:00');          // '2024년 12월 25일'
 * formatDate('2024-12-25T10:30:00', true);    // '2024년 12월 25일 10:30'
 * formatDate(null);                            // '-'
 * ```
 */
export function formatDate(dateString: string | null, includeTime: boolean = false): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    // 유효하지 않은 날짜 체크
    if (isNaN(date.getTime())) {
      return '-';
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const day = date.getDate();

    // 시간 포함 여부에 따라 다른 형식 반환
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    }

    return `${year}년 ${month}월 ${day}일`;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '-';
  }
}

/**
 * ISO 8601 날짜 문자열을 'YYYY.MM.DD' 형식으로 변환
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns 점으로 구분된 날짜 문자열 (예: '2024.12.25')
 *
 * @example
 * ```typescript
 * formatDateSimple('2024-12-25T10:30:00');  // '2024.12.25'
 * ```
 */
export function formatDateSimple(dateString: string | null): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '-';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '-';
  }
}

/**
 * 마감일까지 남은 일수 계산 (D-day)
 *
 * 현재 시각과 마감일 사이의 차이를 일 단위로 계산합니다.
 * - 양수: 마감일까지 남은 일수
 * - 0: 오늘 마감
 * - 음수: 마감일 경과
 *
 * @param deadline - 마감일 (ISO 8601 형식)
 * @returns 남은 일수 (null인 경우 null 반환)
 *
 * @example
 * ```typescript
 * // 오늘이 2024-12-20일 때
 * getDaysUntilDeadline('2024-12-25T23:59:59');  // 5 (5일 남음)
 * getDaysUntilDeadline('2024-12-20T23:59:59');  // 0 (오늘 마감)
 * getDaysUntilDeadline('2024-12-15T23:59:59');  // -5 (5일 경과)
 * getDaysUntilDeadline(null);                    // null
 * ```
 */
export function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null;

  try {
    const deadlineDate = new Date(deadline);

    if (isNaN(deadlineDate.getTime())) {
      return null;
    }

    // 현재 날짜와 마감일의 시간을 00:00:00으로 설정 (날짜만 비교)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDay = new Date(deadlineDate);
    deadlineDay.setHours(0, 0, 0, 0);

    // 밀리초 차이를 일 단위로 변환
    const diffInMs = deadlineDay.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays;
  } catch (error) {
    console.error('D-day 계산 오류:', error);
    return null;
  }
}

/**
 * 마감일 상태 텍스트 생성
 *
 * D-day를 기반으로 사용자 친화적인 상태 텍스트를 생성합니다.
 *
 * @param deadline - 마감일 (ISO 8601 형식)
 * @returns 상태 텍스트 ('D-7', '오늘 마감', '마감' 등)
 *
 * @example
 * ```typescript
 * getDeadlineStatus('2024-12-25T23:59:59');  // 'D-5' (5일 남음)
 * getDeadlineStatus('2024-12-20T23:59:59');  // '오늘 마감'
 * getDeadlineStatus('2024-12-15T23:59:59');  // '마감'
 * ```
 */
export function getDeadlineStatus(deadline: string | null): string {
  const daysLeft = getDaysUntilDeadline(deadline);

  if (daysLeft === null) return '-';

  if (daysLeft < 0) {
    return '마감';
  } else if (daysLeft === 0) {
    return '오늘 마감';
  } else if (daysLeft <= 7) {
    return `D-${daysLeft}`;
  } else {
    return `D-${daysLeft}`;
  }
}

/**
 * 상대 시간 표시 (예: '3시간 전', '2일 전')
 *
 * 현재 시각과 주어진 시각의 차이를 상대적으로 표현합니다.
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns 상대 시간 문자열
 *
 * @example
 * ```typescript
 * // 현재 시각이 2024-12-20 15:00:00 일 때
 * formatRelativeTime('2024-12-20 14:30:00');  // '30분 전'
 * formatRelativeTime('2024-12-20 12:00:00');  // '3시간 전'
 * formatRelativeTime('2024-12-18 12:00:00');  // '2일 전'
 * ```
 */
export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '-';
    }

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks}주 전`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months}개월 전`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years}년 전`;
    }
  } catch (error) {
    console.error('상대 시간 계산 오류:', error);
    return '-';
  }
}

/**
 * 날짜 범위 포맷팅
 *
 * 시작일과 종료일을 한 줄로 표시합니다.
 *
 * @param startDate - 시작일 (ISO 8601 형식)
 * @param endDate - 종료일 (ISO 8601 형식)
 * @returns 날짜 범위 문자열 (예: '2024년 12월 1일 ~ 2024년 12월 31일')
 *
 * @example
 * ```typescript
 * formatDateRange('2024-12-01', '2024-12-31');
 * // '2024년 12월 1일 ~ 2024년 12월 31일'
 * ```
 */
export function formatDateRange(startDate: string | null, endDate: string | null): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start === '-' && end === '-') {
    return '-';
  } else if (start === '-') {
    return `~ ${end}`;
  } else if (end === '-') {
    return `${start} ~`;
  } else {
    return `${start} ~ ${end}`;
  }
}

/**
 * 현재 날짜가 특정 기간 내에 있는지 확인
 *
 * @param startDate - 시작일 (ISO 8601 형식)
 * @param endDate - 종료일 (ISO 8601 형식)
 * @returns 현재 날짜가 기간 내에 있으면 true
 *
 * @example
 * ```typescript
 * // 현재가 2024-12-20일 때
 * isWithinPeriod('2024-12-01', '2024-12-31');  // true
 * isWithinPeriod('2024-11-01', '2024-11-30');  // false
 * ```
 */
export function isWithinPeriod(startDate: string | null, endDate: string | null): boolean {
  if (!startDate || !endDate) return false;

  try {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    return now >= start && now <= end;
  } catch (error) {
    console.error('기간 확인 오류:', error);
    return false;
  }
}
