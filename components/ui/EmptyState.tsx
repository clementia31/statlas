export default function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <div className="font-serif text-text text-[18px] font-semibold">{title}</div>
      {children && <div className="text-textMuted text-[14px] mt-1.5">{children}</div>}
    </div>
  );
}
