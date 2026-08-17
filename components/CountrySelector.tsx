'use client';

import { useRouter } from 'next/navigation';

export default function CountrySelector({
  selected,
  allCountries,
  buildHref,
}: {
  selected: { slug: string; name: string }[];
  allCountries: { slug: string; name_default: string }[];
  buildHref: (countries: string[]) => string;
}) {
  const router = useRouter();
  const selectedSlugs = selected.map((s) => s.slug);
  const available = allCountries.filter((c) => !selectedSlugs.includes(c.slug));

  function addCountry(slug: string) {
    if (!slug || selectedSlugs.length >= 6) return;
    router.push(buildHref([...selectedSlugs, slug]));
  }

  function removeCountry(slug: string) {
    if (selectedSlugs.length <= 1) return;
    router.push(buildHref(selectedSlugs.filter((s) => s !== slug)));
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      {selected.map((c) => (
        <span
          key={c.slug}
          className="flex items-center gap-1.5 bg-panel2 border border-border rounded-md px-2.5 py-1 text-xs text-textSecondary"
        >
          {c.name}
          {selectedSlugs.length > 1 && (
            <button
              onClick={() => removeCountry(c.slug)}
              className="text-textMuted hover:text-white"
              aria-label={`Remove ${c.name}`}
            >
              ×
            </button>
          )}
        </span>
      ))}
      {selectedSlugs.length < 6 && (
        <select
          value=""
          onChange={(e) => addCountry(e.target.value)}
          className="bg-panel2 border border-border border-dashed rounded-md px-2.5 py-1 text-xs text-textMuted"
        >
          <option value="">+ Add country</option>
          {available.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name_default}</option>
          ))}
        </select>
      )}
    </div>
  );
}
