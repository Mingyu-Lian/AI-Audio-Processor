import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        custom: ['Arial', 'sans-serif']
      },
      keyframes: {
        expand: {
          '0%': { opacity: '0', transform: 'scaleY(0)', height: '0px' },
          '100%': { opacity: '1', transform: 'scaleY(1)', height: 'var(--content-height, 1000px)' },
        },
        collapse: {
          '0%': { opacity: '1', transform: 'scaleY(1)', height: 'var(--content-height, 1000px)' },
          '100%': { opacity: '0', transform: 'scaleY(0)', height: '0px' },
        },
      },
      animation: {
        expand: 'expand 300ms ease-out forwards',
        collapse: 'collapse 300ms ease-in forwards',
      },
    }
    
  },
  plugins: [animate],
}

export default config
