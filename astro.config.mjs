import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://evgenykon.github.io',
  base: '/flat-earth/',
  vite: {
    plugins: [tailwindcss()],
  },
});
