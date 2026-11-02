import type { IndicatorMeta } from '@/lib/data';
import { unitLabel } from '@/lib/format';

export default function SourceNote({ meta, year, count }: { meta: IndicatorMeta; year?: number | null; count?: number }) {
  return (
    <p className="text-[12.5px] text-textMuted leading-relaxed">
      Source:{' '}
      {meta.source_url ? (
        <a href={meta.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
          {meta.source_name}
        </a>
      ) : (
        meta.source_name ?? 'Unknown'
      )}
      {meta.dataset_title ? ` — ${meta.dataset_title}` : ''}
      {' · '}Unit: {unitLabel(meta.unit)}
      {year ? ` · Year: ${year}` : ''}
      {count !== undefined ? ` · ${count} ${count > 1 ? 'entries' : 'entry'}` : ''}
    </p>
  );
}
