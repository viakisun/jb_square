/**
 * 📝 JB SQUARE API 타입 정의
 *
 * 이 파일은 백엔드 API의 응답 데이터 구조를 TypeScript 인터페이스로 정의합니다.
 * 타입 안전성을 보장하고 IDE의 자동완성 기능을 활성화합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { Notice, PaginatedResponse } from '@/lib/api/types';
 *
 * const notice: Notice = { id: 1, title: '공고 제목', ... };
 * const response: PaginatedResponse<Notice> = { items: [...], total: 10 };
 * ```
 *
 * @author JB SQUARE 개발팀
 * @version 1.0.0
 */

/**
 * 공고 데이터 인터페이스
 *
 * 백엔드 Notice 모델과 1:1 매핑됩니다.
 * 모든 공고(정부/지자체/R&D/창업 지원)에 공통으로 사용되는 구조입니다.
 */
export interface Notice {
  /** 공고 고유 ID (Primary Key) */
  id: number;

  /** 공고 제목 (필수) */
  title: string;

  /** 공고 본문 내용 (HTML 또는 텍스트) */
  content: string | null;

  /** 원본 페이지 URL */
  link: string | null;

  /** 공고 출처 구분 ('crawled': 크롤링, 'manual': 수동 등록) */
  origin_type: 'crawled' | 'manual';

  /** 크롤러 소스 ID (NoticeSource enum 값) */
  crawler_source_id: string;

  /** 공고 태그 목록 (예: ['바이오', '제조업', '신규']) */
  tags: string[];

  /** 공고 상태 ('pending': 대기, 'published': 게시됨, 'archived': 보관됨) */
  status: 'pending' | 'published' | 'archived';

  /** 신청 마감일 (ISO 8601 형식, 예: '2024-12-31T23:59:59') */
  deadline: string | null;

  /** 신청 시작일 (ISO 8601 형식) */
  application_start: string | null;

  /** 신청 종료일 (ISO 8601 형식) */
  application_end: string | null;

  /** 공고일 (YYYY-MM-DD 형식) */
  announcement_date: string | null;

  /** 주관 기관명 (예: '전북테크노파크') */
  organization: string | null;

  /** 담당 부서명 (예: '바이오산업팀') */
  department: string | null;

  /** 연락처 정보 (전화번호, 이메일 등) */
  contact: string | null;

  /** 첨부 파일 목록 */
  attachment_links: Array<{
    /** 파일명 */
    filename: string;
    /** 다운로드 URL (S3 또는 외부 링크) */
    url: string;
  }> | null;

  /** 콘텐츠 타입 ('text': 텍스트, 'html': HTML, 'pdf_viewer': PDF 뷰어) */
  content_type: 'text' | 'html' | 'pdf_viewer' | null;

  /** PDF 뷰어 URL (content_type이 'pdf_viewer'일 때 사용) */
  content_viewer_url: string | null;

  /** 게시 일시 (ISO 8601 형식) */
  published_at: string | null;

  /** 생성 일시 (ISO 8601 형식) */
  created_at: string;

  /** 수정 일시 (ISO 8601 형식) */
  updated_at: string;

  /** 매칭된 키워드 목록 (크롤링 시 필터링에 사용된 키워드) */
  matched_keywords?: string[];
}

/**
 * 공고 목록 조회 필터 파라미터
 *
 * GET /api/notices 엔드포인트에 전달되는 쿼리 파라미터입니다.
 */
export interface NoticeFilterParams {
  /** 크롤러 소스 ID 필터 (NoticeSource enum 값) */
  source_id?: string;

  /** 상태 필터 */
  status?: 'pending' | 'published' | 'archived';

  /** 검색어 (제목, 내용, 기관명 등에서 검색) */
  search?: string;

  /** 태그 필터 (여러 개 가능, 콤마로 구분) */
  tags?: string;

  /** 페이지 번호 (1부터 시작, 기본값: 1) */
  page?: number;

  /** 페이지당 항목 수 (기본값: 20) */
  limit?: number;

  /** 정렬 기준 ('created_at': 생성일, 'published_at': 게시일, 'deadline': 마감일) */
  sort_by?: 'created_at' | 'published_at' | 'deadline';

  /** 정렬 순서 ('asc': 오름차순, 'desc': 내림차순, 기본값: 'desc') */
  sort_order?: 'asc' | 'desc';
}

/**
 * 페이지네이션이 적용된 응답 데이터
 *
 * 목록 조회 API의 표준 응답 형식입니다.
 * 제네릭 타입 T를 사용하여 다양한 데이터 타입에 재사용 가능합니다.
 *
 * @template T - 아이템의 데이터 타입 (예: Notice, Organization)
 */
export interface PaginatedResponse<T> {
  /** 현재 페이지의 데이터 목록 */
  items: T[];

  /** 전체 데이터 개수 */
  total: number;

  /** 현재 페이지 번호 */
  page: number;

  /** 페이지당 항목 수 */
  limit: number;

  /** 전체 페이지 수 */
  total_pages: number;

  /** 다음 페이지 존재 여부 */
  has_next: boolean;

  /** 이전 페이지 존재 여부 */
  has_prev: boolean;
}

/**
 * API 에러 응답 인터페이스
 *
 * 백엔드에서 에러 발생 시 반환되는 구조입니다.
 * FastAPI의 HTTPException 응답과 일치합니다.
 */
export interface APIError {
  /** 에러 메시지 */
  detail: string;

  /** HTTP 상태 코드 (400, 404, 500 등) */
  status_code?: number;

  /** 에러 코드 (선택적, 커스텀 에러 코드) */
  error_code?: string;
}

/**
 * API 응답 래퍼 인터페이스
 *
 * 일관된 API 응답 형식을 제공하기 위한 래퍼입니다.
 * 성공/실패 여부를 명확히 구분할 수 있습니다.
 *
 * @template T - 응답 데이터 타입
 */
export interface APIResponse<T> {
  /** 요청 성공 여부 */
  success: boolean;

  /** 응답 데이터 (success가 true일 때) */
  data?: T;

  /** 에러 정보 (success가 false일 때) */
  error?: APIError;

  /** 응답 메시지 (선택적) */
  message?: string;
}

/**
 * 기업/기관 데이터 인터페이스
 *
 * 바이오 산업 기업 정보를 나타냅니다.
 * 백엔드 Organization 모델과 1:1 매핑됩니다.
 */
export interface Organization {
  /** 기업 ID */
  id: number;

  /** 기업 식별 코드 */
  kedcd?: string | null;

  /** 업체명 */
  company_name: string;

  /** 업체명 (별칭, company_name과 동일) */
  name?: string;

  /** 업체명 (형태 포함) */
  company_name_with_type?: string | null;

  /** 사업자등록번호 */
  business_registration_number?: string | null;

  /** 법인등록번호 */
  corporate_registration_number?: string | null;

  /** 법인번호 */
  corporation_number?: string | null;

  /** 대표자명 */
  ceo_name: string | null;

  /** 대표자명 (별칭, ceo_name과 동일) */
  ceo?: string | null;

  /** 이메일 */
  email: string | null;

  /** 기업 상태 (영업중/폐업/휴업) */
  company_status: string | null;

  /** 기업 규모 (대기업/중견기업/중소기업) */
  company_scale: string | null;

  /** 기업 형태 */
  company_type?: string | null;

  /** KSIC 11차 코드 */
  ksic_11th_code?: string | null;

  /** KSIC 11차 명칭 */
  ksic_11th_name?: string | null;

  /** KSIC 10차 코드 */
  ksic_10th_code: string | null;

  /** KSIC 10차 명칭 */
  ksic_10th_name: string | null;

  /** 주업종 KSIC(10차) */
  main_ksic_10th?: string | null;

  /** 바이오 산업 분류 (BIO_CORE/BIO_RELATED/NON_BIO) */
  industry_type: string;

  /** 산업 분야 (별칭, industry_type과 동일) */
  industry?: string;

  /** 기업 설명 */
  description?: string | null;

  /** 주소 정보 */
  address?: string | null;

  /** 웹사이트 URL */
  website?: string | null;

  /** 주요 제품명 */
  main_products: string | null;

  /** 주축산업명 */
  main_industry_name?: string | null;

  /** 육성품목명 */
  cultivation_item?: string | null;

  /** 설립일자 */
  established_date: string | null;

  /** 상장 여부 */
  is_listed?: boolean;

  /** 상장일자 */
  listed_date?: string | null;

  /** 상장폐지일자 */
  delisted_date?: string | null;

  /** 기업부설연구소 유무 */
  has_research_institute: boolean;

  /** 생성일시 */
  created_at: string;

  /** 수정일시 */
  updated_at: string;

  // 연도별 재무 데이터 (2020-2024)
  revenue_2020?: number | null;
  revenue_2021?: number | null;
  revenue_2022?: number | null;
  revenue_2023?: number | null;
  revenue_2024?: number | null;

  employees_2020?: number | null;
  employees_2021?: number | null;
  employees_2022?: number | null;
  employees_2023?: number | null;
  employees_2024?: number | null;

  export_amount_2020?: number | null;
  export_amount_2021?: number | null;
  export_amount_2022?: number | null;
  export_amount_2023?: number | null;
  export_amount_2024?: number | null;

  operating_profit_2020?: number | null;
  operating_profit_2021?: number | null;
  operating_profit_2022?: number | null;
  operating_profit_2023?: number | null;
  operating_profit_2024?: number | null;

  net_income_2020?: number | null;
  net_income_2021?: number | null;
  net_income_2022?: number | null;
  net_income_2023?: number | null;
  net_income_2024?: number | null;

  rd_expense_2020?: number | null;
  rd_expense_2021?: number | null;
  rd_expense_2022?: number | null;
  rd_expense_2023?: number | null;
  rd_expense_2024?: number | null;

  value_added_2020?: number | null;
  value_added_2021?: number | null;
  value_added_2022?: number | null;
  value_added_2023?: number | null;
  value_added_2024?: number | null;

  total_assets_2020?: number | null;
  total_assets_2021?: number | null;
  total_assets_2022?: number | null;
  total_assets_2023?: number | null;
  total_assets_2024?: number | null;

  total_liabilities_2020?: number | null;
  total_liabilities_2021?: number | null;
  total_liabilities_2022?: number | null;
  total_liabilities_2023?: number | null;
  total_liabilities_2024?: number | null;

  retained_earnings_2020?: number | null;
  retained_earnings_2021?: number | null;
  retained_earnings_2022?: number | null;
  retained_earnings_2023?: number | null;
  retained_earnings_2024?: number | null;

  working_capital_2020?: number | null;
  working_capital_2021?: number | null;
  working_capital_2022?: number | null;
  working_capital_2023?: number | null;
  working_capital_2024?: number | null;

  patent_registrations_2020?: number | null;
  patent_registrations_2021?: number | null;
  patent_registrations_2022?: number | null;
  patent_registrations_2023?: number | null;
  patent_registrations_2024?: number | null;

  patent_applications_2020?: number | null;
  patent_applications_2021?: number | null;
  patent_applications_2022?: number | null;
  patent_applications_2023?: number | null;
  patent_applications_2024?: number | null;

  /** 구조화된 연도별 데이터 (include_yearly=true일 때) */
  yearly_data?: {
    revenue: Record<number, number | null>;
    employees: Record<number, number | null>;
    export_amount: Record<number, number | null>;
    operating_profit: Record<number, number | null>;
    net_income: Record<number, number | null>;
    rd_expense: Record<number, number | null>;
    value_added: Record<number, number | null>;
    total_assets: Record<number, number | null>;
    total_liabilities: Record<number, number | null>;
    retained_earnings: Record<number, number | null>;
    working_capital: Record<number, number | null>;
    patent_registrations: Record<number, number | null>;
    patent_applications: Record<number, number | null>;
  };
}

/**
 * 기업 목록 조회 필터 파라미터
 */
export interface OrganizationFilterParams {
  /** 산업 분류 (BIO_CORE/BIO_RELATED/NON_BIO) */
  industry_type?: string;

  /** 기업 규모 (대기업/중견기업/중소기업) */
  company_scale?: string;

  /** 기업 상태 (영업중/폐업/휴업) */
  company_status?: string;

  /** KSIC 10차 코드 */
  ksic_10th_code?: string;

  /** 검색어 (업체명, 대표자명, 주요제품명) */
  search?: string;

  /** 기업부설연구소 유무 */
  has_research_institute?: boolean;

  /** 건너뛸 항목 수 */
  skip?: number;

  /** 조회할 항목 수 (기본값: 20) */
  limit?: number;

  /** 페이지 번호 */
  page?: number;

  /** 연도별 데이터 구조화 여부 */
  include_yearly?: boolean;

  /** 정렬 기준 */
  sort_by?: string;

  /** 정렬 순서 */
  sort_order?: 'asc' | 'desc';
}

/**
 * 태그 데이터 인터페이스
 */
export interface Tag {
  /** 태그 ID */
  id: number;

  /** 태그명 */
  name: string;

  /** 태그 색상 (Hex 코드) */
  color: string | null;

  /** 태그 아이콘 */
  icon: string | null;

  /** 표시 순서 */
  display_order: number;

  /** 활성화 여부 */
  is_active: boolean;
}

/**
 * 최신 공고 조회 파라미터
 */
export interface LatestNoticesParams {
  /** 조회할 항목 수 (기본값: 10) */
  limit?: number;

  /** 출처 필터 (source:organization:type 형식) */
  source_id?: string;
}

/**
 * 창업보육센터 (BI Center) 데이터 인터페이스
 *
 * 백엔드 BICenter 모델과 1:1 매핑됩니다.
 */
export interface BICenter {
  /** BI 센터 고유 ID (Primary Key) */
  id: number;

  /** 지역 (예: '전북', '서울') */
  region: string;

  /** 도시 (예: '전주시', '완주군') */
  city: string | null;

  /** 운영 기관명 (예: '전북테크노파크') */
  org_name: string;

  /** 센터명 (예: '바이오 창업보육센터') */
  center_name: string;

  /** 연락처 (전화번호, 이메일 등) */
  contact: string | null;

  /** 특화 분야 (예: '바이오', 'IT', '제조') */
  specialization: string | null;

  /** 공실 정보 (예: '3실', '없음') */
  vacant_rooms: string | null;

  /** 위치/주소 정보 */
  location: string | null;

  /** 위도 (Latitude) */
  latitude: number | null;

  /** 경도 (Longitude) */
  longitude: number | null;

  /** 센터 웹사이트 URL */
  center_url: string | null;

  /** 입주 기업 수 */
  companies_count: number;

  /** 생성 일시 (ISO 8601 형식) */
  created_at: string;

  /** 수정 일시 (ISO 8601 형식) */
  updated_at: string;
}

/**
 * BI Center 목록 응답 인터페이스
 */
export interface BICenterListResponse {
  /** BI 센터 목록 */
  items: BICenter[];

  /** 전체 센터 개수 */
  total: number;
}

/**
 * 입주기업 (BI Company) 데이터 인터페이스
 *
 * 백엔드 BICompany 모델과 1:1 매핑됩니다.
 */
export interface BICompany {
  /** 입주기업 고유 ID (Primary Key) */
  id: number;

  /** 소속 센터 ID (Foreign Key) */
  center_id: number;

  /** 기업명 */
  company_name: string;

  /** 사업 분야 (예: 'IT', '바이오', '제조') */
  business_field: string | null;

  /** 제품/서비스 설명 */
  product: string | null;

  /** 생성 일시 (ISO 8601 형식) */
  created_at: string;

  /** 수정 일시 (ISO 8601 형식) */
  updated_at: string;

  /** 소속 센터 정보 (검색 API에서 포함됨) */
  center?: {
    id: number;
    center_name: string;
    org_name: string;
    region: string;
    city: string | null;
  };
}

/**
 * BI Company 목록 응답 인터페이스
 */
export interface BICompanyListResponse {
  /** 입주기업 목록 */
  items: BICompany[];

  /** 전체 기업 개수 */
  total: number;

  /** 센터 정보 (센터별 조회 시 포함됨) */
  center?: BICenter;
}
