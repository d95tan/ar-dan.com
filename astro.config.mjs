// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.ar-dan.com',
  integrations: [sitemap()],
  // Keep old Wix URLs working after the domain moves over.
  redirects: {
    '/about': '/cv',
    '/software': '/work',
    '/projects': '/work',
    '/software/etatune': '/work/etatune',
    '/software/etapod': '/work/etapod',
    '/software/etagen': '/work/etagen',
  },
});
