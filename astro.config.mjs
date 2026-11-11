// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://wa1l.github.io',
  base: '/Cas-Clinique-Microbio',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
  },
  markdown: {
    gfm: true,
  },
});
