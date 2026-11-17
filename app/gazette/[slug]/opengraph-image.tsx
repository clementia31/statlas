import { OG_SIZE, OG_TYPE, ogImage } from '@/lib/og';
import { getArticleBySlug } from '@/lib/supabase';
import { getDomainBySlug } from '@/lib/gazette';

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'The Statlas Gazette';

export default async function Image({ params }: { params: { slug: string } }) {
  const domain = await getDomainBySlug(params.slug);
  if (domain) return ogImage({ brand: 'THE GAZETTE', kicker: 'Section', title: domain.name, footer: 'A quantitative journal of the world' });
  const article = await getArticleBySlug(params.slug);
  return ogImage({
    brand: 'THE GAZETTE',
    kicker: 'Article',
    title: article?.title ?? 'The Statlas Gazette',
    subtitle: article?.subtitle ?? undefined,
    footer: article?.author_name ? `By ${article.author_name}` : 'A quantitative journal of the world',
  });
}
