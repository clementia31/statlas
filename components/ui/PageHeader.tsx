export default function PageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {kicker && <div className="text-[11px] uppercase tracking-[0.14em] text-accent mb-1.5">{kicker}</div>}
        <h1 className="font-serif text-[26px] sm:text-[30px] leading-tight text-white">{title}</h1>
        {description && <div className="text-textSecondary text-[13px] mt-2 max-w-2xl leading-relaxed">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
