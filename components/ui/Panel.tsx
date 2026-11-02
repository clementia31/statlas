export default function Panel({
  title,
  subtitle,
  right,
  children,
  className = '',
  padded = true,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-xl border border-border bg-panel ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4">
          <div className="min-w-0">
            {title && <h2 className="text-[14px] font-medium text-white">{title}</h2>}
            {subtitle && <div className="text-[12px] text-textMuted mt-0.5">{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      <div className={padded ? 'p-4 sm:p-5' : ''}>{children}</div>
    </section>
  );
}
