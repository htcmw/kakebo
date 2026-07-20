/**
 * Tailwind(NativeWind v4) 설정.
 * 색 토큰은 designs/ui-mockup.html 의 :root 변수를 정본으로 옮긴 것.
 *  - primary(teal)=공동/브랜드, memberA(blue)=지훈, memberB(pink)=서연.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d9488',
          dark: '#0b7a70',
          soft: '#e3f4f1',
        },
        memberA: { DEFAULT: '#3b6ef6', soft: '#e7eefe' },
        memberB: { DEFAULT: '#e0568f', soft: '#fce7f0' },
        warn: { DEFAULT: '#e8a33d', soft: '#fcf1dd' },
        danger: '#dc2f45',
        surface: '#ffffff',
        canvas: '#f4f6f8',
        border: '#e6eaef',
        ink: {
          DEFAULT: '#1e293b',
          2: '#64748b',
          3: '#8496a8',
        },
      },
    },
  },
  plugins: [],
};
