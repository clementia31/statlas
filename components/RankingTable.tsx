import Link from 'next/link';
import Flag from './ui/Flag';
import Badge from './ui/Badge';
import { formatValue } from '@/lib/format';
import type { Ranked } from '@/lib/data';

export default function RankingTable({ rows, unit, showScore = false, linkable = true }: { rows: Ranked[]; unit: string; showScore?: boolean; linkable?: boolean }) {
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 0) || 1;
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full min-w-[520px] text-[14px]">
        <thead>
          <tr className="text-left text-[12px] uppercase tracking-[0.08em] text-textMuted border-b border-border">
            <th className="py-2.5 pl-4 sm:pl-0 pr-2 w-12 font-medium">#</th>
            <th className="py-2.5 pr-2 font-medium">Country</th>
            <th className="py-2.5 pr-2 font-medium text-right">Value</th>
            <th className="py-2.5 pr-4 sm:pr-0 font-medium w-[34%] hidden sm:table-cell" aria-label="Relative value" />
            {showScore && <th className="py-2.5 pr-4 sm:pr-0 font-medium text-right w-20">Score</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.entity_slug} className="border-b border-border/60 hover:bg-panel2/50">
              <td className="py-2 pl-4 sm:pl-0 pr-2 font-mono text-textMuted">{r.rank}</td>
              <td className="py-2 pr-2">
                {linkable ? (
                  <Link href={`/pays/${r.entity_slug}`} className="inline-flex items-center gap-2.5 text-text hover:text-accent">
                    <Flag iso={r.iso_code} />
                    <span>{r.entity_name}</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2.5 text-text">
                    <Flag iso={r.iso_code} />
                    <span>{r.entity_name}</span>
                  </span>
                )}
                {r.is_projection && (
                  <span className="ml-2">
                    <Badge tone="warn">Projection</Badge>
                  </span>
                )}
              </td>
              <td className="py-2 pr-2 text-right font-mono text-text whitespace-nowrap">{formatValue(r.value, unit)}</td>
              <td className="py-2 pr-4 sm:pr-0 hidden sm:table-cell">
                <div className="h-1.5 rounded-full bg-panel2 overflow-hidden">
                  <div className="h-full rounded-full bg-accent/70" style={{ width: `${Math.max(1, (Math.abs(r.value) / max) * 100)}%` }} />
                </div>
              </td>
              {showScore && <td className="py-2 pr-4 sm:pr-0 text-right font-mono text-textSecondary">{r.score.toFixed(1)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
