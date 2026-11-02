import Link from 'next/link';

export default function Tabs({ tabs, active }: { tabs: { key: string; label: string; href: string }[]; active: string }) {
  return (
    <div className="mb-5 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
      <div className="flex gap-1 border-b border-border min-w-max">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            aria-current={t.key === active ? 'page' : undefined}
            className={`px-3.5 py-2.5 text-[13px] border-b-2 -mb-px transition-colors ${
              t.key === active ? 'border-accent text-white' : 'border-transparent text-textSecondary hover:text-white'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
