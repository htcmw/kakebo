/**
 * Tailwind(NativeWind v4) 설정 — 디자인 토큰 매핑.
 *
 * 정본은 designs/design-tokens.md (출처: designs/ui-mockup.html :root).
 * 색·타이포·라운드·섀도를 목업 값 그대로 옮긴다(공동=teal, 규관=blue, 윤선=pink).
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 브랜드 · 멤버
        primary: {
          DEFAULT: '#0d9488', // 공동/브랜드
          dark: '#0b7a70',
          soft: '#e3f4f1',
        },
        memberA: { DEFAULT: '#3b6ef6', soft: '#e7eefe' }, // 규관
        memberB: { DEFAULT: '#e0568f', soft: '#fce7f0' }, // 윤선
        // 의미 · 상태
        income: '#0f9d58',
        expense: '#e04b4b',
        warn: { DEFAULT: '#e8a33d', soft: '#fcf1dd' },
        danger: '#dc2f45',
        // 표면 · 경계 · 텍스트
        canvas: '#f4f6f8',
        surface: { DEFAULT: '#ffffff', 2: '#f8fafc' },
        border: { DEFAULT: '#e6eaef', strong: '#d3dae2' },
        ink: {
          DEFAULT: '#1b2733',
          2: '#5a6b7b',
          3: '#8a99a8',
        },
      },
      fontFamily: {
        // 네이티브 Pretendard 로딩은 후속(expo-font); 미로딩 시 시스템 폴백
        sans: [
          'Pretendard',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'System',
          'sans-serif',
        ],
      },
      fontSize: {
        caption: '11px',
        label: '12.5px',
        body: '13.5px',
        title: '19px',
        display: '24px',
        'display-lg': '26px',
      },
      borderRadius: {
        chip: '9px', // radius-sm
        card: '14px', // radius
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,32,48,.04), 0 6px 20px rgba(16,32,48,.06)',
        lg: '0 12px 40px rgba(16,32,48,.16)',
      },
    },
  },
  plugins: [],
};
