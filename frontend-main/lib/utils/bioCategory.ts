import { Organization } from '@/lib/api/types';

export type BioCategory = 'RED_BIO' | 'WHITE_BIO' | 'GREEN_BIO' | 'GENERAL';

interface KsicCategoryRule {
  category: BioCategory;
  prefixes?: string[];
  keywords?: string[];
}

const BIO_CATEGORY_PALETTE: Record<
  BioCategory,
  {
    label: string;
    icon: string;
    tagColor: string;
    tagBackground: string;
  }
> = {
  RED_BIO: {
    label: '레드바이오',
    icon: '/images/icon-bio-red.svg',
    tagColor: '#7C1038',
    tagBackground: 'rgba(255, 104, 143, 0.16)',
  },
  WHITE_BIO: {
    label: '화이트바이오',
    icon: '/images/icon-bio-white.svg',
    tagColor: '#004F95',
    tagBackground: 'rgba(74, 216, 255, 0.18)',
  },
  GREEN_BIO: {
    label: '그린바이오',
    icon: '/images/icon-bio-green.svg',
    tagColor: '#0F7150',
    tagBackground: 'rgba(70, 226, 125, 0.18)',
  },
  GENERAL: {
    label: '일반 산업',
    icon: '/images/icon-bio-general.svg',
    tagColor: '#2F3C54',
    tagBackground: 'rgba(139, 156, 188, 0.18)',
  },
};

const KSIC_CATEGORY_RULES: KsicCategoryRule[] = [
  {
    category: 'RED_BIO',
    prefixes: ['20', '21', '26', '27', '72', '73', '86'],
    keywords: ['의약', '제약', '의료', '바이오', '헬스케어', '진단', '백신'],
  },
  {
    category: 'WHITE_BIO',
    prefixes: ['10', '11', '12', '13', '14', '15', '16'],
    keywords: ['식품', '음료', '프로바이오틱', '발효', '화장품', '농식품', '식물성'],
  },
  {
    category: 'GREEN_BIO',
    prefixes: ['01', '02', '03', '05', '36', '37', '38', '39'],
    keywords: ['농업', '농업용', '환경', '에너지', '폐기물', '바이오매스', '친환경', '재생'],
  },
];

const normalizeText = (value?: string | null) => value?.toLowerCase() ?? '';

const matchesKeyword = (text: string | null | undefined, keywords: string[]) => {
  if (!text) return false;
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
};

const sanitizeKsicCode = (value?: string | null): string => {
  if (!value) return '';
  const digits = value.match(/\d+/g);
  return digits ? digits.join('') : '';
};

export const determineBioCategory = (company: Organization): BioCategory => {
  const candidateCodes = [
    sanitizeKsicCode(company.main_ksic_10th),
    sanitizeKsicCode(company.ksic_10th_code),
    sanitizeKsicCode(company.ksic_11th_code),
  ];

  for (const rawCode of candidateCodes) {
    if (!rawCode) continue;
    const prefix = rawCode.slice(0, 2);
    for (const rule of KSIC_CATEGORY_RULES) {
      if (rule.prefixes?.some((codePrefix) => prefix === codePrefix)) {
        return rule.category;
      }
    }
  }

  const textCandidates = [
    company.ksic_10th_name,
    company.ksic_11th_name,
    company.main_industry_name,
    company.main_products,
    company.description,
  ];

  for (const rule of KSIC_CATEGORY_RULES) {
    if (rule.keywords && textCandidates.some((text) => matchesKeyword(text, rule.keywords!))) {
      return rule.category;
    }
  }

  if (company.industry_type === 'BIO_CORE') {
    return 'RED_BIO';
  }
  if (company.industry_type === 'BIO_RELATED') {
    return 'WHITE_BIO';
  }

  return 'GENERAL';
};

export const BIO_CATEGORY_CONFIG = BIO_CATEGORY_PALETTE;

export const getCategoryConfig = (category: BioCategory) => BIO_CATEGORY_CONFIG[category];


