'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type IndicatorOption = { slug: string; name: string; category: string | null };

export default function IndicatorSelect({ options, value, param = 'indicator' }: { options: IndicatorOption[]; value: string; param?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const groups = new Map<string, IndicatorOption[]>();
  for (const o of options) {
    const g = o.category ?? 'Other';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(o);
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] text-textMuted">Indicator</span>
      <select
        value={value}
        onChange={(e) => {
          const p = new URLSearchParams(sp.toString());
          p.set(param, e.target.value);
          p.delete('year');
          router.push(`${pathname}?${p.toString()}`);
        }}
        className="min-w-[240px] max-w-full rounded-lg border border-borderStrong bg-panel h-11 px-3 text-[14px] text-text outline-none focus:border-accent"
      >
        {Array.from(groups.entries()).map(([g, items]) => (
          <optgroup key={g} label={g}>
            {items.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
