/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-jost)', 'sans-serif'],
      },
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e5ede4',
          200: '#ccdccb',
          300: '#a6c2a4',
          400: '#78a175',
          500: '#547f52',
          600: '#406340',
          700: '#344f34',
          800: '#2b402c',
          900: '#243525',
        },
        clay: {
          50: '#fdf6f0',
          100: '#faeadc',
          200: '#f4d1b5',
          300: '#ecb083',
          400: '#e28550',
          500: '#da6830',
          600: '#cb5225',
          700: '#a93f21',
          800: '#873422',
          900: '#6d2d1f',
        },
        cream: '#faf7f2',
        charcoal: '#1c1c1e',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
