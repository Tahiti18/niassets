module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
          neutral: {
              850: '#1f1f1f',
              900: '#171717',
              925: '#121212',
              950: '#080808', 
          },
          gold: {
              300: '#D4AF37',
              400: '#C5A028',
              500: '#B49020',
              900: '#3E320A',
          }
      },
      fontFamily: {
          serif: ['"Cormorant Garamond"', 'serif'],
          sans: ['"Inter"', 'sans-serif'],
      },
      letterSpacing: {
          widest: '0.2em',
          tight: '-0.025em',
          tighter: '-0.05em',
      },
      animation: {
          'fade-in': 'fadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          'breathe': 'breathe 20s infinite alternate',
      },
      keyframes: {
          fadeIn: {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          breathe: {
              '0%': { transform: 'scale(1)' },
              '100%': { transform: 'scale(1.05)' },
          }
      }
    }
  }
}
