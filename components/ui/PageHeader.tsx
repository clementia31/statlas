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
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {kicker && <div className="text-[14px] font-semibold uppercase tracking-[0.14em] text-accent mb-2.5">{kicker}</div>}
        <h1 className="font-serif text-[34px] sm:text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] text-text">{title}</h1>
        {description && <div className="text-textSecondary text-[15px] sm:text-[16px] mt-3 max-w-2xl leading-relaxed">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
