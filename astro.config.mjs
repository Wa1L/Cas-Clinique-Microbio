// @ts-check
import { defineConfig } from 'astro/config';
import remarkSupersub from 'remark-supersub';

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
    remarkPlugins: [remarkSupersub],
  },
});
