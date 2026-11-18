import type { MetadataRoute } from 'next';

// Les adresses à paramètres (?year=…, ?indicator=…) sont des variantes d'une page déjà référencée : inutile que les robots
// les parcourent une à une, c'est ce qui consomme le plus de calcul.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/q/', '/studio', '/search', '/*?'] },
    sitemap: 'https://www.statlasresearch.com/sitemap.xml',
  };
}
