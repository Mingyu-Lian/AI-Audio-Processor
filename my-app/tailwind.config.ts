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
        slideDown: {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        slideDown: 'slideDown 300ms ease-out',
        slideUp: 'slideUp 300ms ease-in',
      },
    },
  },
  plugins: [
    animate, // ✅ 注册插件
  ],
}

export default config