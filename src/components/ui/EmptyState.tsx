import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="w-16 h-16 rounded-3xl bg-foreground/5 flex items-center justify-center mb-6">
        <div className="text-foreground/40">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm font-medium text-foreground/60 max-w-[250px] mb-8">
        {description}
      </p>
      {action}
    </div>
  );
}
