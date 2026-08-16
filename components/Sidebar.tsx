const NAV_ITEMS = [
  { label: 'Overview', href: '/' },
  { label: 'Indicators', href: '/indicateurs' },
  { label: 'Map', href: '/carte' },
  { label: 'Countries', href: '/pays' },
  { label: 'Comparisons', href: '/comparaisons' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Analysis', href: '/analysis' },
  { label: 'The Gazette', href: '/gazette' },
  { label: 'Bibliography', href: '/bibliographie' },
  { label: 'API & Export', href: '/api-export' },
];

export default function Sidebar({ active }: { active: string }) {
  return (
    <div className="w-[206px] shrink-0 bg-panel border-r border-border py-[18px]">
      <div className="font-serif text-xl px-[18px] pb-4 border-b border-border mb-2.5 text-white">
        Statlas
      </div>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`flex items-center gap-2.5 px-[18px] py-[9px] text-[13px] border-l-2 ${
            item.label === active
              ? 'text-white bg-panel2 border-accent'
              : 'text-textSecondary border-transparent hover:text-white'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
          {item.label}
        </a>
      ))}
    </div>
  );
}
