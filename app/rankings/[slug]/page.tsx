import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Panel from '@/components/ui/Panel';
import SourceNote from '@/components/ui/SourceNote';
import Flag from '@/components/ui/Flag';
import EmptyState from '@/components/ui/EmptyState';
import RankingTable from '@/components/RankingTable';
import YearSelect from '@/components/controls/YearSelect';
import { getIndicatorMeta, getIndicatorYears, getYearValues, isCityIndicator, pickYear, rankValues } from '@/lib/data';
import { formatValue } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const meta = await getIndicatorMeta(params.slug);
  if (!meta) return { title: 'Ranking not found — Statlas' };
  return {
    title: `${meta.name} — world ranking ${meta.ref_year} | Statlas`,
    description: `${meta.ref_coverage} countries ranked by ${meta.name} in ${meta.ref_year}. Source: ${meta.source_name}.`,
  };
}

export default async function RankingPage({ params, searchParams }: { params: { slug: string }; searchParams: { year?: string } }) {
  const meta = await getIndicatorMeta(params.slug);
  if (!meta || meta.ref_year === null) notFound();

  const years = await getIndicatorYears(meta.slug);
  const year = pickYear(years, searchParams.year, meta.ref_year) ?? meta.ref_year;
  const rows = await getYearValues(meta.slug, year);
  const ranked = rankValues(rows, meta.higher_is_better);
  const leader = ranked[0];
  const city = isCityIndicator(meta.slug);
  const direction = meta.higher_is_better === null ? 'Sorted from highest to lowest' : meta.higher_is_better ? 'Higher is better' : 'Lower is better';

  return (
    <AppShell active="Rankings">
      <Link href="/rankings" className="text-[13px] text-textMuted hover:text-accent">
        ← All rankings
      </Link>
      <div className="mt-3">
        <PageHeader
          kicker={meta.category ?? 'Ranking'}
          title={`${meta.name}`}
          description={meta.definition ?? undefined}
          actions={<YearSelect years={years} value={year} refYear={meta.ref_year} />}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-accent/50 bg-panel p-4">
          <div className="text-[12px] text-textMuted">{meta.higher_is_better === false ? 'Lowest' : 'Highest'} · {year}</div>
          {leader ? (
            <Link href={city ? '#' : `/pays/${leader.entity_slug}`} className="mt-1 flex items-center gap-2 text-text hover:text-accent">
              <Flag iso={leader.iso_code} size="md" />
              <span className="font-serif text-[18px]">{leader.entity_name}</span>
            </Link>
          ) : (
            <div className="text-textMuted">—</div>
          )}
          <div className="font-mono text-[16px] text-text mt-1">{leader ? formatValue(leader.value, meta.unit) : ''}</div>
        </div>
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="text-[12px] text-textMuted">Coverage · {year}</div>
          <div className="font-mono text-[22px] text-text mt-1">{rows.length}</div>
          <div className="text-[12px] text-textMuted">{city ? 'cities' : 'countries'}</div>
        </div>
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="text-[12px] text-textMuted">Method</div>
          <div className="text-[14px] text-text mt-1">{direction}</div>
          <div className="text-[12px] text-textMuted mt-1">Score: 0 = worst, 100 = best in {year}</div>
        </div>
      </div>

      <Panel
        title={`Ranking ${year}`}
        right={
          <a href={`/api/export/${meta.slug}`} className="inline-flex h-11 items-center rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium text-text hover:border-accent">
            Download CSV
          </a>
        }
      >
        {ranked.length ? <RankingTable rows={ranked} unit={meta.unit} showScore linkable={!city} /> : <EmptyState title="No data for this year" />}
        <div className="mt-4">
          <SourceNote meta={meta} year={year} count={rows.length} />
        </div>
      </Panel>
    </AppShell>
  );
}
