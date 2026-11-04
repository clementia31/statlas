import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Flag from '@/components/ui/Flag';
import EmptyState from '@/components/ui/EmptyState';
import { formatListValue, getLists } from '@/lib/lists';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Statlas Lists — sourced rankings',
  description: 'Sourced rankings beyond country statistics: the most expensive paintings, and more. Every entry carries its source and its status.',
};

export default async function ListsPage() {
  const lists = await getLists();
  return (
    <AppShell active="Lists">
      <PageHeader
        kicker="Statlas Lists"
        title="Sourced rankings"
        description="Rankings beyond country statistics. Every entry carries its source and its status: verified, reported or estimate."
      />
      {lists.length === 0 ? (
        <EmptyState title="No lists yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lists.map((l) => (
            <Link key={l.slug} href={`/lists/${l.slug}`} className="rounded-xl border border-border bg-panel p-6 hover:border-accent transition-colors">
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">{l.category ?? 'List'}</div>
              <h2 className="mt-2 font-serif text-[24px] font-semibold leading-snug">{l.title}</h2>
              {l.subtitle && <p className="mt-2 text-[14px] text-textSecondary">{l.subtitle}</p>}
              {l.top && (
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-[14px]">
                  <span className="font-mono text-textMuted">#1</span>
                  <Flag iso={l.top.country_iso} />
                  <span className="flex-1 truncate">
                    {l.top.title}
                    {l.top.subtitle ? <span className="text-textMuted"> · {l.top.subtitle}</span> : null}
                  </span>
                  <span className="font-mono">{formatListValue(l.top.value, l.unit)}</span>
                </div>
              )}
              <div className="mt-3 text-[13px] text-textMuted">{l.n} entries · updated {l.updated_at.slice(0, 4)}</div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
