import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, className, children }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      {children}
    </div>
  );
}
