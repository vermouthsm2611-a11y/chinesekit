/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pink primary — CTA, streak, emotional actions
        pink: {
          DEFAULT: '#BE185D',
          hover:   '#9D174D',
          soft:    '#FCE7F3',
          border:  '#F9A8D4',
        },
        // Violet secondary — metadata, labels, info
        violet: {
          DEFAULT: '#7C3AED',
          hover:   '#6D28D9',
          soft:    '#EDE9FE',
          border:  '#C4B5FD',
        },
        // Surface tokens
        surface: {
          base:    '#FDF4FF',
          card:    '#FFFFFF',
          muted:   '#F9F0FB',
        },
        // Border tokens
        border: {
          DEFAULT: '#EDD9F5',
          strong:  '#D8B4E8',
        },
      },
      fontFamily: {
        // --font-inter và --font-noto được inject bởi next/font/google qua layout.jsx
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        hanzi: ['var(--font-noto)', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(190, 24, 93, 0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md:   '0 4px 12px rgba(124, 58, 237, 0.08), 0 2px 4px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
