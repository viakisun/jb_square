/**
 * 🔍 공고 검색 훅
 *
 * 디바운싱이 적용된 실시간 검색 기능을 제공하는 커스텀 훅입니다.
 * 사용자가 입력을 멈춘 후 일정 시간(기본 500ms) 후에 자동으로 검색을 수행합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { useNoticeSearch } from '@/hooks/useNoticeSearch';
 *
 * function SearchBar() {
 *   const {
 *     searchQuery,
 *     setSearchQuery,
 *     results,
 *     loading,
 *     error
 *   } = useNoticeSearch();
 *
 *   return (
 *     <div>
 *       <input
 *         value={searchQuery}
 *         onChange={(e) => setSearchQuery(e.target.value)}
 *         placeholder="검색어를 입력하세요"
 *       />
 *       {loading && <span>검색 중...</span>}
 *       {results.map(notice => <NoticeCard key={notice.id} notice={notice} />)}
 *     </div>
 *   );
 * }
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api/client';
import { Notice, NoticeFilterParams } from '@/lib/api/types';
import { getErrorMessage, logError } from '@/lib/utils/errors';

/**
 * 검색 옵션 인터페이스
 */
interface SearchOptions {
  /** 디바운스 지연 시간 (밀리초, 기본값: 500) */
  debounceDelay?: number;

  /** 최소 검색어 길이 (기본값: 1) */
  minLength?: number;

  /** 추가 필터 (카테고리, 태그 등) */
  additionalFilters?: Omit<NoticeFilterParams, 'search'>;

  /** 자동 검색 비활성화 (기본값: false) */
  disableAutoSearch?: boolean;
}

/**
 * 훅 반환 타입 정의
 */
interface UseNoticeSearchReturn {
  /** 현재 검색어 */
  searchQuery: string;

  /** 검색어 변경 함수 */
  setSearchQuery: (query: string) => void;

  /** 검색 결과 (공고 목록) */
  results: Notice[];

  /** 로딩 상태 */
  loading: boolean;

  /** 에러 메시지 */
  error: string | null;

  /** 총 결과 개수 */
  totalResults: number;

  /** 검색 실행 함수 (수동 검색용) */
  search: (query?: string) => Promise<void>;

  /** 검색 결과 초기화 */
  clearResults: () => void;

  /** 검색 수행 여부 */
  hasSearched: boolean;
}

/**
 * 디바운싱 적용 검색 훅
 *
 * @param options - 검색 옵션
 * @returns 검색 상태 및 제어 함수들
 *
 * @example
 * ```typescript
 * // 기본 사용 (500ms 디바운스)
 * const { searchQuery, setSearchQuery, results } = useNoticeSearch();
 *
 * // 커스텀 설정
 * const { searchQuery, setSearchQuery } = useNoticeSearch({
 *   debounceDelay: 1000,  // 1초 디바운스
 *   minLength: 2,         // 최소 2글자
 *   additionalFilters: { category: 'government' }  // 정부 공고만
 * });
 *
 * // 자동 검색 비활성화 + 수동 검색
 * const { searchQuery, setSearchQuery, search } = useNoticeSearch({
 *   disableAutoSearch: true
 * });
 * // 검색 버튼 클릭 시
 * <button onClick={() => search()}>검색</button>
 * ```
 */
export function useNoticeSearch(options: SearchOptions = {}): UseNoticeSearchReturn {
  const {
    debounceDelay = 500,
    minLength = 1,
    additionalFilters = {},
    disableAutoSearch = false
  } = options;

  // 상태 관리
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // 디바운스 타이머 참조
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * 검색 실행 함수
   *
   * API를 호출하여 검색을 수행합니다.
   *
   * @param query - 검색어 (선택적, 없으면 현재 searchQuery 사용)
   */
  const search = useCallback(async (query?: string) => {
    const searchTerm = query !== undefined ? query : searchQuery;

    // 검색어 길이 체크
    if (searchTerm.trim().length < minLength) {
      setResults([]);
      setTotalResults(0);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await api.notices.search(searchTerm, {
        ...additionalFilters,
        limit: 50  // 검색 결과는 기본 50개까지
      });

      setResults(response.items);
      setTotalResults(response.total);
    } catch (err) {
      const errorMessage = getErrorMessage(err, '검색 중 오류가 발생했습니다.');
      setError(errorMessage);
      logError(err, `공고 검색 실패 (검색어: ${searchTerm})`);

      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, minLength, additionalFilters]);

  /**
   * 검색 결과 초기화
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setError(null);
    setHasSearched(false);
  }, []);

  /**
   * 디바운싱 효과
   *
   * searchQuery가 변경되면 디바운스 타이머를 설정하고,
   * 일정 시간 후에 검색을 실행합니다.
   */
  useEffect(() => {
    // 자동 검색이 비활성화되어 있으면 리턴
    if (disableAutoSearch) {
      return;
    }

    // 기존 타이머 취소
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // 검색어가 최소 길이 미만이면 결과 초기화
    if (searchQuery.trim().length < minLength) {
      clearResults();
      return;
    }

    // 새로운 디바운스 타이머 설정
    debounceTimer.current = setTimeout(() => {
      search();
    }, debounceDelay);

    // 클린업: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, debounceDelay, minLength, disableAutoSearch, search, clearResults]);

  return {
    searchQuery,
    setSearchQuery,
    results,
    loading,
    error,
    totalResults,
    search,
    clearResults,
    hasSearched
  };
}

/**
 * 검색 제안 (Autocomplete) 훅
 *
 * 사용자가 입력하는 동안 실시간으로 검색 제안을 표시합니다.
 * useNoticeSearch와 유사하지만 결과 개수가 제한됩니다.
 *
 * @param options - 검색 옵션
 * @returns 검색 제안 상태 및 제어 함수들
 *
 * @example
 * ```typescript
 * function SearchAutocomplete() {
 *   const {
 *     searchQuery,
 *     setSearchQuery,
 *     suggestions,
 *     loading
 *   } = useSearchSuggestions({ maxSuggestions: 5 });
 *
 *   return (
 *     <div>
 *       <input
 *         value={searchQuery}
 *         onChange={(e) => setSearchQuery(e.target.value)}
 *       />
 *       {loading && <span>로딩 중...</span>}
 *       <ul>
 *         {suggestions.map(notice => (
 *           <li key={notice.id}>{notice.title}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSearchSuggestions(
  options: SearchOptions & { maxSuggestions?: number } = {}
) {
  const { maxSuggestions = 5, ...searchOptions } = options;

  const searchResult = useNoticeSearch({
    ...searchOptions,
    additionalFilters: {
      ...searchOptions.additionalFilters,
      limit: maxSuggestions
    }
  });

  return {
    ...searchResult,
    suggestions: searchResult.results.slice(0, maxSuggestions)
  };
}
