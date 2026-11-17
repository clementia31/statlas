import { OG_SIZE, OG_TYPE, ogImage } from '@/lib/og';
import { getIndicatorMeta, getYearValues, rankValues } from '@/lib/data';
import { formatValue, shortSource } from '@/lib/format';

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = 'World ranking on Statlas';

// Aperçu d'un classement : son titre, l'année de référence, les trois premiers et la source.
export default async function Image({ params }: { params: { slug: string } }) {
  const meta = await getIndicatorMeta(params.slug);
  if (!meta || meta.ref_year === null) return ogImage({ kicker: 'World ranking', title: 'Statlas rankings' });
  const top = rankValues(await getYearValues(meta.slug, meta.ref_year), meta.higher_is_better).slice(0, 3);
  return ogImage({
    kicker: `World ranking ${meta.ref_year}`,
    title: meta.name,
    rows: top.map((r) => ({ rank: String(r.rank), label: r.entity_name, value: formatValue(r.value, meta.unit) })),
    footer: `${meta.ref_coverage} countries · Source: ${shortSource(meta.source_name)}`,
  });
}
