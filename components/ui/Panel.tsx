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
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 pt-5">
          <div className="min-w-0">
            {title && <h2 className="font-serif text-[20px] sm:text-[22px] font-semibold leading-snug text-text">{title}</h2>}
            {subtitle && <div className="text-[14px] text-textMuted mt-1">{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      <div className={padded ? 'p-4 sm:p-6' : ''}>{children}</div>
    </section>
  );
}
