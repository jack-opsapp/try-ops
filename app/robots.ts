import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/signup/', '/tutorial/', '/tutorial-interactive', '/tutorial-intro'],
    },
    sitemap: 'https://try.opsapp.co/sitemap.xml',
  };
}
