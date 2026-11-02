'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type YearOption = { year: number; n_countries: number; is_projection: boolean };

export default function YearSelect({ years, value, refYear }: { years: YearOption[]; value: number; refYear?: number | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] text-textMuted">Year</span>
      <select
        value={value}
        onChange={(e) => {
          const p = new URLSearchParams(sp.toString());
          p.set('year', e.target.value);
          router.push(`${pathname}?${p.toString()}`);
        }}
        className="rounded-lg border border-borderStrong bg-panel h-11 px-3 text-[14px] text-text font-mono outline-none focus:border-accent"
      >
        {[...years].reverse().map((y) => (
          <option key={y.year} value={y.year}>
            {y.year}
            {y.is_projection ? ' · projection' : ''}
            {refYear === y.year ? ' · latest' : ''} ({y.n_countries})
          </option>
        ))}
      </select>
    </label>
  );
}
