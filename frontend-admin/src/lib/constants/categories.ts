/**
 * Notice Categories Configuration
 * 백엔드 categories.py와 동기화 필요
 */

export type CategoryId = "government" | "business" | "rnd" | "startup";

export type SourceId = "ntis" | "ntis_rss" | "jbtp" | "jbtp_external" | "bizinfo" | "manual";

export interface CategoryMetadata {
  id: CategoryId;
  label: string;
  description: string;
  sources: SourceId[];
  color: string;
}

// Database에서 허용하는 카테고리 목록
export const VALID_CATEGORIES: CategoryId[] = [
  "government",
  "business",
  "rnd",
  "startup",
];

// 카테고리 메타데이터
export const CATEGORY_METADATA: Record<CategoryId, CategoryMetadata> = {
  government: {
    id: "government",
    label: "정부 공고",
    description: "중앙정부 및 지자체 공고",
    sources: ["ntis", "ntis_rss", "jbtp"],
    color: "#1E40AF",
  },
  business: {
    id: "business",
    label: "기업 맞춤형 지원사업",
    description: "기업을 위한 맞춤형 지원사업 공고",
    sources: ["bizinfo", "jbtp"],
    color: "#059669",
  },
  rnd: {
    id: "rnd",
    label: "연구개발(R&D)",
    description: "R&D 관련 지원사업",
    sources: ["ntis", "ntis_rss", "jbtp"],
    color: "#7C3AED",
  },
  startup: {
    id: "startup",
    label: "창업 및 기술이전",
    description: "창업 지원 및 기술이전 관련 공고",
    sources: ["jbtp", "bizinfo"],
    color: "#DC2626",
  },
};

// Source별 기본 카테고리 매핑
export const SOURCE_DEFAULT_CATEGORY: Record<SourceId, CategoryId> = {
  ntis: "government", // NTIS → 정부 공고
  ntis_rss: "government", // NTIS RSS → 정부 공고
  jbtp: "government", // JBTP → 정부 공고 (지자체)
  jbtp_external: "government", // JBTP 유관기관공고 → 정부 공고
  bizinfo: "business", // Bizinfo → 기업 지원
  manual: "government", // 수동 입력 기본값
};

// UI 라우팅과 카테고리 매핑
export const ROUTE_CATEGORY_MAP: Record<string, CategoryId | null> = {
  "/notices/ntis": "government", // 정부 공고 (NTIS)
  "/notices/local": "government", // 지자체 공고 (JBTP)
  "/notices/business": "business", // 기업 맞춤형
  "/notices/rnd": "rnd", // R&D
  "/notices/startup": "startup", // 창업
  "/notices/latest": null, // 최신공고 (전체)
};

/**
 * 카테고리 ID로 라벨 조회
 */
export function getCategoryLabel(category: CategoryId): string {
  return CATEGORY_METADATA[category]?.label || category;
}

/**
 * 소스 ID로 기본 카테고리 조회
 */
export function getDefaultCategoryForSource(sourceId: SourceId): CategoryId {
  return SOURCE_DEFAULT_CATEGORY[sourceId] || "government";
}

/**
 * 카테고리 유효성 검증
 */
export function validateCategory(category: string): category is CategoryId {
  return VALID_CATEGORIES.includes(category as CategoryId);
}

/**
 * 특정 소스가 사용 가능한 카테고리 목록
 */
export function getCategoriesForSource(sourceId: SourceId): CategoryId[] {
  return Object.entries(CATEGORY_METADATA)
    .filter(([_, meta]) => meta.sources.includes(sourceId))
    .map(([catId]) => catId as CategoryId);
}

/**
 * 현재 라우트에서 카테고리 추출
 */
export function getCategoryFromRoute(pathname: string): CategoryId | null {
  return ROUTE_CATEGORY_MAP[pathname] ?? null;
}
