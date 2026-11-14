import struct from './structure.json';

export interface Chapter {
  slug: string;
  title: string;
  cases: string[];
  count: number;
}
export interface Part {
  slug: string;
  title: string;
  roman: string;
  icon: string;
  chapters: Chapter[];
  count: number;
}

export const parts = struct as Part[];
export const BASE = '/Cas-Clinique-Microbio';
export const AUTHOR = 'Dr. Wail NAMOUNE';
export const totalCases = parts.reduce((n, p) => n + p.count, 0);
export const totalChapters = parts.reduce((n, p) => n + p.chapters.length, 0);

/** « cases/part/chap/cas-x-y.md » -> « /Cas-Clinique-Microbio/cases/part/chap/cas-x-y/ » */
export function caseUrl(rel: string): string {
  return `${BASE}/${rel.replace(/\.md$/, '')}/`;
}

/** Liste plate de tous les cas, dans l'ordre du livre (pour précédent/suivant). */
export const caseOrder: string[] = parts.flatMap((p) =>
  p.chapters.flatMap((c) => c.cases.map((f) => `cases/${p.slug}/${c.slug}/${f}.md`))
);

export function caseLabel(stem: string): string {
  const m = stem.match(/^cas-(\d+)-(\d+)$/);
  if (m) return `Cas ${m[1]}.${parseInt(m[2], 10)}`;
  return stem.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function partBySlug(slug: string): Part | undefined {
  return parts.find((p) => p.slug === slug);
}
