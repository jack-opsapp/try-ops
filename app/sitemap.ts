import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://try.opsapp.co',
      lastModified: new Date('2025-03-08'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://try.opsapp.co/download',
      lastModified: new Date('2025-03-08'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
