/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Muted navy blue primary — CTA, streak, emotional actions
        primary: {
          DEFAULT: '#42578b',
          hover:   '#36466f',
          soft:    '#EEF1F7',
          border:  '#A9B7D1',
        },
        // Navy secondary — metadata, labels, info
        secondary: {
          DEFAULT: '#1E293B',
          hover:   '#0F172A',
          soft:    '#F1F5F9',
          border:  '#CBD5E1',
        },
        // Surface tokens
        surface: {
          base:    '#F8FAFC',
          card:    '#FFFFFF',
          muted:   '#F1F5F9',
        },
        // Border tokens
        border: {
          DEFAULT: '#E2E8F0',
          strong:  '#CBD5E1',
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
        card: '0 1px 4px rgba(66, 87, 139, 0.06), 0 1px 2px rgba(0,0,0,0.04)',
        md:   '0 4px 12px rgba(30, 41, 59, 0.08), 0 2px 4px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
