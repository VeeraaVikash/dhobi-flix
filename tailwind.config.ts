import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#e50914',
          dark: '#0a0a0a',
          card: '#141414',
        },
      },
    },
  },
  plugins: [],
};

export default config;
