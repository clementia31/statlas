import { OG_SIZE, OG_TYPE, ogImage } from '@/lib/og';
import { supabase } from '@/lib/supabase';

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'Country profile on Statlas';

export default async function Image({ params }: { params: { slug: string } }) {
  const { data } = await supabase.from('entities').select('name_default').eq('slug', params.slug).eq('entity_type', 'country').maybeSingle();
  return ogImage({
    kicker: 'Country profile',
    title: data?.name_default ?? 'Country profiles',
    subtitle: 'Key statistics with their sources and world rankings: economy, population, development, health, environment.',
  });
}
