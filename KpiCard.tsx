export default function KpiCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
}) {
  return (
    <div className="bg-panel border border-border rounded-[10px] px-[15px] py-[13px]">
      <div className="text-textMuted text-[11px] mb-1.5">{label}</div>
      <div className="font-mono text-[19px] font-medium text-white">{value}</div>
      <div className={`font-mono text-[11px] mt-1 ${positive ? 'text-green' : 'text-red'}`}>
        {delta}
      </div>
    </div>
  );
}
