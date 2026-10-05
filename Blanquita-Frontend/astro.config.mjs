import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',

  adapter: vercel(),

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});