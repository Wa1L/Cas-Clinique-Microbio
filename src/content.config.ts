import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cases = defineCollection({
  loader: glob({ pattern: '**/cas-*.md', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),
    part: z.string(),
    section: z.string(),
  }),
});

const fiches = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/fiches' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    part: z.enum(['Bactériologie', 'Virologie', 'Mycologie', 'Parasitologie', 'Autre']).default('Bactériologie'),
    order: z.number().default(99),
  }),
});

export const collections = { cases, fiches };
