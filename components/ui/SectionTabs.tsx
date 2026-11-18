import Link from 'next/link';

// Onglets de section : regroupent sous une même entrée du menu des pages voisines
// (Rankings : pays / sport / listes ; Compare : côte à côte / benchmark).
const SETS = {
  rankings: [
    { label: 'Countries', href: '/rankings' },
    { label: 'Sport & space', href: '/sport' },
    { label: 'Lists', href: '/lists' },
  ],
  compare: [
    { label: 'Side by side', href: '/compare' },
    { label: 'Benchmark', href: '/benchmark' },
  ],
} as const;

export default function SectionTabs({ set, current }: { set: keyof typeof SETS; current: string }) {
  return (
    <nav aria-label="Section" className="-mt-2 mb-7 flex flex-wrap gap-2">
      {SETS[set].map((t) => {
        const on = t.href === current;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? 'page' : undefined}
            className={`inline-flex h-11 items-center rounded-full border px-[18px] text-[14px] ${
              on ? 'border-text bg-text text-white' : 'border-borderStrong bg-panel text-text hover:border-accent hover:text-accent'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
