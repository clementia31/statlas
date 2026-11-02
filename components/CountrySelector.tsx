'use client';

import { useRouter } from 'next/navigation';
import { SERIES_COLORS } from '@/lib/colors';

export default function CountrySelector({
  selected,
  allCountries,
  basePath,
  baseParams,
  max = 6,
}: {
  selected: { slug: string; name: string }[];
  allCountries: { slug: string; name_default: string }[];
  basePath: string;
  baseParams: Record<string, string>;
  max?: number;
}) {
  const router = useRouter();
  const selectedSlugs = selected.map((s) => s.slug);
  const available = allCountries.filter((c) => !selectedSlugs.includes(c.slug));

  // Construit l'URL côté client (une fonction ne peut pas être passée d'un Server Component)
  function buildHref(countries: string[]) {
    const params = new URLSearchParams(baseParams);
    params.set('countries', countries.join(','));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div>
      <span className="block text-[13px] text-textMuted mb-2">Countries ({selected.length}/{max})</span>
      <div className="flex items-center gap-2 flex-wrap">
        {selected.map((c, i) => (
          <span key={c.slug} className="inline-flex items-center gap-1.5 rounded-full border border-borderStrong bg-panel pl-3 pr-1 h-10 text-[14px] text-text">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            {c.name}
            {selectedSlugs.length > 1 && (
              <button
                type="button"
                onClick={() => router.push(buildHref(selectedSlugs.filter((s) => s !== c.slug)), { scroll: false })}
                className="w-8 h-8 rounded-full text-[16px] text-textMuted hover:text-accent hover:bg-border"
                aria-label={`Remove ${c.name}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {selectedSlugs.length < max && (
          <select
            value=""
            onChange={(e) => e.target.value && router.push(buildHref([...selectedSlugs, e.target.value]), { scroll: false })}
            aria-label="Add a country"
            className="rounded-full border border-dashed border-borderStrong bg-transparent px-3.5 h-10 text-[14px] text-textSecondary"
          >
            <option value="">+ Add country</option>
            {available.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name_default}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
