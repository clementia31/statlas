import { getAllYearValues, getIndicatorMeta } from '@/lib/data';

export const dynamic = 'force-dynamic';

function csvCell(v: string | number | boolean | null) {
  const s = v === null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Export CSV d'un indicateur : toutes les années, tous les pays, avec la source
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const meta = await getIndicatorMeta(params.slug);
  if (!meta) return new Response('Indicator not found', { status: 404 });

  const byYear = await getAllYearValues(params.slug);
  const lines = [
    `# ${meta.name}`,
    `# Unit: ${meta.unit}`,
    `# Source: ${meta.source_name ?? ''}${meta.dataset_title ? ' — ' + meta.dataset_title : ''}`,
    `# Exported from Statlas on ${new Date().toISOString().slice(0, 10)}`,
    ['country', 'iso2', 'year', 'value', 'is_projection'].join(','),
  ];
  for (const [year, rows] of Object.entries(byYear)) {
    for (const r of rows) {
      lines.push([r.entity_name, r.iso_code, year, r.value, r.is_projection].map(csvCell).join(','));
    }
  }
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="statlas-${params.slug}.csv"`,
    },
  });
}
