import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#af2245',
        'primary-dark': '#8a1a36',
        'primary-light': '#d03d5c',
        cream: '#fff8f1',
        rose: '#F2C4CE',
        peach: '#F9D9C8',
        lavender: '#DDD0EC',
      },
      fontFamily: {
        caslon: ['Libre Caslon Text', 'Georgia', 'serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
