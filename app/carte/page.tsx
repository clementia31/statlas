import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Panel from '@/components/ui/Panel';
import SourceNote from '@/components/ui/SourceNote';
import EmptyState from '@/components/ui/EmptyState';
import AnimatedMap from '@/components/AnimatedMap';
import IndicatorSelect from '@/components/controls/IndicatorSelect';
import { DEFAULT_INDICATOR, getAllYearValues, getCountryCatalog } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function MapPage({ searchParams }: { searchParams: { indicator?: string } }) {
  const catalog = await getCountryCatalog();
  const meta = catalog.find((c) => c.slug === searchParams.indicator) ?? catalog.find((c) => c.slug === DEFAULT_INDICATOR) ?? catalog[0];
  if (!meta) {
    return (
      <AppShell active="Map">
        <EmptyState title="No indicators available yet" />
      </AppShell>
    );
  }

  const byYear = await getAllYearValues(meta.slug);
  const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
  const frames = Object.fromEntries(
    years.map((y) => [
      y,
      byYear[y].map((r) => ({ slug: r.entity_slug, name: r.entity_name, iso: r.iso_code, value: r.value, projection: r.is_projection })),
    ])
  );

  return (
    <AppShell active="Map">
      <PageHeader
        kicker="Map"
        title="The world over time"
        description="Play the map to see how an indicator evolved across countries. Colours use one scale for every year, so changes are comparable."
        actions={<IndicatorSelect options={catalog.map((c) => ({ slug: c.slug, name: c.name, category: c.category }))} value={meta.slug} />}
      />
      <Panel title={meta.name} subtitle={`${years[0]}–${years[years.length - 1]}`}>
        {years.length ? (
          <AnimatedMap years={years} frames={frames} unit={meta.unit} label={meta.name} initialYear={meta.ref_year ?? years[years.length - 1]} />
        ) : (
          <EmptyState title="No data" />
        )}
        <div className="mt-4">
          <SourceNote meta={meta} />
        </div>
      </Panel>
    </AppShell>
  );
}
