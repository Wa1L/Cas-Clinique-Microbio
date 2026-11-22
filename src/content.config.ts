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
    part: z.enum(['Bactériologie', 'Fondamentale Bactérienne', 'Virologie', 'Infections respiratoires virales', 'Infections virales du SNC', 'Infections cutanées virales', 'Zoonoses Virales', 'Techniques de Diagnostic en Virologie', 'Infections virales néonatales', "Infections chez l'ID et le greffé", 'Chimiothérapie antivirale', 'Mycologie', 'Parasitologie', 'Autre']).default('Bactériologie'),
    order: z.number().default(99),
  }),
});

export const collections = { cases, fiches };
