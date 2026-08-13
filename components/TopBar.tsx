'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

const GDP_INDICATORS = [
  { slug: 'gdp-nominal-usd', label: 'Nominal GDP' },
  { slug: 'gdp-nominal-per-capita-usd', label: 'GDP per capita (nominal)' },
  { slug: 'gdp-ppp-intl-dollar', label: 'GDP (PPP)' },
  { slug: 'gdp-ppp-per-capita-intl-dollar', label: 'GDP (PPP) per capita' },
];

const OTHER_INDICATORS = [
  { slug: 'fertility-rate', label: 'Fertility rate' },
  { slug: 'gini-index', label: 'Gini index' },
  { slug: 'gni-per-capita-ppp-2017', label: 'GNI per capita (PPP 2017)' },
  { slug: 'human-development-index', label: 'HDI' },
  { slug: 'fdi-inward-stock', label: 'Inward FDI (stock)' },
  { slug: 'life-expectancy-birth', label: 'Life expectancy' },
  { slug: 'net-debt-gdp-percent', label: 'Net debt (% of GDP)' },
  { slug: 'population-total', label: 'Population' },
];

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentIndicator = searchParams.get('indicator') ?? 'human-development-index';
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleIndicatorChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateParam('indicator', e.target.value);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => updateParam('q', value), 250);
  }

  return (
    <div className="h-[54px] border-b border-border flex items-center gap-3.5 px-[22px] shrink-0">
      <input
        type="text"
        placeholder="Search a country..."
        defaultValue={searchParams.get('q') ?? ''}
        onChange={handleSearchChange}
        className="flex-1 max-w-[380px] bg-panel2 border border-border rounded-md px-3 py-1.5 text-[13px] text-textSecondary outline-none"
      />
      <select
        value={currentIndicator}
        onChange={handleIndicatorChange}
        className="bg-panel2 border border-border rounded-md px-3 py-1.5 text-xs font-mono text-textSecondary"
      >
        <optgroup label="GDP">
          {GDP_INDICATORS.map((i) => (
            <option key={i.slug} value={i.slug}>{i.label}</option>
          ))}
        </optgroup>
        <optgroup label="Other indicators">
          {OTHER_INDICATORS.map((i) => (
            <option key={i.slug} value={i.slug}>{i.label}</option>
          ))}
        </optgroup>
      </select>
      <select className="bg-panel2 border border-border rounded-md px-3 py-1.5 text-xs font-mono text-textSecondary">
        <option>2024</option>
        <option>2023</option>
        <option>2020</option>
      </select>

      <div className="flex items-center gap-1.5 ml-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-textSecondary hover:text-white text-sm" aria-label="Notifications" title="Notifications (coming soon)">
          🔔
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-textSecondary hover:text-white text-sm" aria-label="Help" title="Help (coming soon)">
          ?
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-textSecondary hover:text-white text-sm" aria-label="Grid view" title="Grid view (coming soon)">
          ▦
        </button>
      </div>
    </div>
  );
}
