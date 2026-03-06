import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className, onClick }: GlassCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "glass rounded-2xl p-5 md:p-6 transition-all duration-300",
        onClick && "cursor-pointer hover:bg-white/10 active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
}
