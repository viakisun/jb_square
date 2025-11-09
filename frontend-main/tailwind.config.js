/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 회색 톤
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        // JB SQUARE 브랜드 색상 (Figma 디자인에서 추출)
        primary: {
          cyan: '#00BDD6',      // JB SQUARE 메인 컬러
          blue: '#0066CC',      // 서브 컬러
          dark: '#1a1a1a',      // 다크 텍스트
        },
        // 공고 카테고리 배지 색상
        accent: {
          government: '#3B82F6',  // 정부 공고 - 파란색
          rd: '#8B5CF6',          // R&D - 보라색
          startup: '#10B981',     // 창업 - 녹색
          business: '#F59E0B',    // 기업 - 주황색
        },
      },
      boxShadow: {
        'card': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(27, 48, 60, 0.7), rgba(0, 189, 214, 0.3))',
        'dark-overlay': 'linear-gradient(180deg, rgba(0,0,0,0.8), transparent)',
      },
    },
  },
  plugins: [],
};
