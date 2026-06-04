import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  centered,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10",
        centered && "items-center text-center md:flex-col",
        className,
      )}
    >
      <div>
        {label && (
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">
            {label}
          </p>
        )}
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
