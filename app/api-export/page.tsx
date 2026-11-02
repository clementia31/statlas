import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Panel from '@/components/ui/Panel';
import { getCatalog } from '@/lib/data';
import { unitLabel } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Export & API — Statlas',
  description: 'Download every Statlas indicator as CSV, with its source and unit.',
};

export default async function ExportPage() {
  const catalog = await getCatalog();
  return (
    <AppShell active="Export & API">
      <PageHeader
        kicker="Data"
        title="Export & API"
        description="Every indicator can be downloaded as a CSV file: all countries, all years, with the unit, the source and a flag for projections. Free to reuse with attribution to the original source."
      />
      <Panel title="Download indicators" subtitle={`${catalog.length} datasets`} padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[14px]">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-[0.08em] text-textMuted border-b border-border">
                <th className="py-2.5 px-4 sm:px-5 font-medium">Indicator</th>
                <th className="py-2.5 px-2 font-medium">Source</th>
                <th className="py-2.5 px-2 font-medium">Years</th>
                <th className="py-2.5 px-4 sm:px-5 font-medium text-right">File</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((m) => (
                <tr key={m.slug} className="border-b border-border/60">
                  <td className="py-2.5 px-4 sm:px-5">
                    <div className="text-text">{m.name}</div>
                    <div className="text-[12px] text-textMuted">{unitLabel(m.unit)}</div>
                  </td>
                  <td className="py-2.5 px-2 text-textSecondary">{m.source_name}</td>
                  <td className="py-2.5 px-2 font-mono text-textSecondary whitespace-nowrap">
                    {m.first_year}–{m.last_year}
                  </td>
                  <td className="py-2.5 px-4 sm:px-5 text-right">
                    <a href={`/api/export/${m.slug}`} className="inline-flex h-11 items-center rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium text-text hover:border-accent">
                      CSV
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="mt-4 text-[13px] text-textMuted">
        Direct URL pattern: <code className="font-mono text-textSecondary">/api/export/&lt;indicator-slug&gt;</code> — returns UTF-8 CSV.
      </p>
    </AppShell>
  );
}
