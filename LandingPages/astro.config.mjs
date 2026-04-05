import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  compressHTML: true,
  vite: {
    resolve: {
      alias: {
        'react-dom/server': 'react-dom/server.edge',
      },
    },
    build: {
      cssCodeSplit: true,
    },
  },
});
