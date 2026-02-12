import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
};

export default function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 px-6 py-5 shadow-[var(--shadow-card)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] text-primary/70">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
