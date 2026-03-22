/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FC',
          100: '#E0EEF9',
          200: '#C2DEF4',
          300: '#A3CEEE',
          400: '#84BDE9',
          500: '#66ADE3',
          600: '#106EBE', // User Blue
          700: '#0D5A9C',
          800: '#0A457A',
          900: '#073258',
        },
        mint: {
          50: '#E6FFF8',
          100: '#CCFFF1',
          200: '#99FEE3',
          300: '#66FED5',
          400: '#33FDC6',
          500: '#0FFCBE', // User Mint
          600: '#0CBA8C',
          700: '#0A8A68',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(16, 110, 190, 0.08)',
        'float': '0 10px 30px rgba(16, 110, 190, 0.12)',
        'glow': '0 0 15px rgba(15, 252, 190, 0.4)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'pulse-soft': 'pulseSoft 2s infinite ease-in-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(15, 252, 190, 0.4)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(15, 252, 190, 0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
