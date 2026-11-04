import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Flag from '@/components/ui/Flag';
import { STATUS_LABEL, formatListValue, getList } from '@/lib/lists';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getList(params.slug);
  if (!data) return { title: 'List not found — Statlas' };
  return { title: `${data.meta.title} — Statlas Lists`, description: data.meta.subtitle ?? undefined };
}

const STATUS_CLS = {
  verified: 'border-green/40 text-green bg-green/10',
  reported: 'border-yellow/40 text-yellow bg-yellow/10',
  estimate: 'border-borderStrong text-textSecondary bg-panel2',
} as const;

export default async function ListPage({ params }: { params: { slug: string } }) {
  const data = await getList(params.slug);
  if (!data) notFound();
  const { meta, items } = data;
  const max = Math.max(...items.map((i) => i.value ?? 0), 1);

  return (
    <AppShell active="Lists">
      <Link href="/lists" className="text-[13px] text-textMuted hover:text-accent">
        ← All lists
      </Link>
      <div className="mt-3">
        <PageHeader kicker={`Statlas Lists · ${meta.category ?? ''}`} title={meta.title} description={meta.subtitle ?? undefined} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[15px]">
          <thead>
            <tr className="border-b-2 border-text text-left text-[12px] uppercase tracking-[0.1em] text-textMuted">
              <th className="py-3 pr-3 font-semibold w-12">#</th>
              <th className="py-3 pr-3 font-semibold">Entry</th>
              <th className="py-3 pr-3 font-semibold w-16">Year</th>
              <th className="py-3 pr-3 font-semibold hidden md:table-cell w-[28%]" />
              <th className="py-3 pr-3 font-semibold text-right">{meta.value_label ?? 'Value'}</th>
              <th className="py-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.rank} className="border-b border-border align-middle">
                <td className="py-3 pr-3 font-mono text-textMuted">{i.rank}</td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3">
                    <Flag iso={i.country_iso} size="md" />
                    <div className="min-w-0">
                      <div className="font-medium leading-snug">{i.title}</div>
                      <div className="text-[13px] text-textMuted">
                        {[i.subtitle, i.detail].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3 font-mono text-textSecondary">{i.year ?? '—'}</td>
                <td className="py-3 pr-3 hidden md:table-cell">
                  <div className="h-2.5 rounded-sm bg-panel2">
                    <div className="h-2.5 rounded-sm bg-accent" style={{ width: `${Math.max(2, ((i.value ?? 0) / max) * 100)}%` }} />
                  </div>
                </td>
                <td className="py-3 pr-3 text-right font-mono whitespace-nowrap">{formatListValue(i.value, meta.unit)}</td>
                <td className="py-3 text-right">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11.5px] font-medium ${STATUS_CLS[i.status]}`}>
                    {STATUS_LABEL[i.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-8 grid gap-6 rounded-xl border border-border bg-panel p-6 md:grid-cols-2 text-[14px] leading-relaxed">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-textMuted">Method</div>
          <p className="mt-2 text-textSecondary">{meta.method}</p>
        </div>
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-textMuted">Sources</div>
          <p className="mt-2 text-textSecondary">{meta.sources}</p>
          <p className="mt-3 text-[13px] text-textMuted">
            Verified: public, documented result. Reported: figure published by the press, not officially confirmed. Estimate: no audited figure exists.
            {meta.is_research ? ' Ranking built by Statlas Research.' : ''}
          </p>
        </div>
      </section>
    </AppShell>
  );
}
