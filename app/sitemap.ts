import type { MetadataRoute } from 'next';
import { getAllItems } from '@/lib/sheets';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://keurbally.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await getAllItems();
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/catalogue`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/packs`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/comment-commander`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ...items.map((i) => ({
      url: `${SITE}/article/${i.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
  return pages;
}
