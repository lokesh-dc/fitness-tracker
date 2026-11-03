import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SettingsRowProps {
  icon: ReactNode;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  isLast?: boolean;
}

export function SettingsRow({
  icon,
  label,
  value,
  href,
  onClick,
  badge,
  isLast = false,
}: SettingsRowProps) {
  const content = (
    <div
      onClick={onClick}
      className={cn(
        "p-4 flex items-center justify-between group transition-colors select-none",
        (href || onClick) && "cursor-pointer hover:bg-foreground/[0.03] active:bg-foreground/[0.05]",
        !isLast && "border-b border-foreground/5"
      )}
    >
      <div className="flex items-center space-x-3.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/60 group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{label}</p>
          {value && (
            <p className="text-[10px] text-foreground/45 font-medium truncate mt-0.5">
              {value}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {badge && (
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary uppercase tracking-widest border border-brand-primary/20">
            {badge}
          </span>
        )}
        {href ? (
          <ChevronRight className="w-4 h-4 text-foreground/25 group-hover:text-foreground transition-colors" />
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      {title && (
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] px-1">
          {title}
        </h3>
      )}
      <GlassCard className="overflow-hidden p-0">{children}</GlassCard>
    </section>
  );
}

