export default function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <div className="text-white text-[15px] font-medium">{title}</div>
      {children && <div className="text-textMuted text-[13px] mt-1.5">{children}</div>}
    </div>
  );
}
