import { Trophy, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface PRCardProps {
  name: string;
  weight: number;
  date: string | Date;
  increment?: number;
  className?: string;
}

export function PRCard({ name, weight, date, increment = 0, className }: PRCardProps) {
  return (
    <GlassCard className={cn("relative overflow-hidden group", className)}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Trophy className="w-12 h-12 text-orange-500" />
      </div>
      <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">
        {name}
      </p>
      <div className="flex items-baseline space-x-1 mb-2">
        <span className="text-2xl font-black text-foreground">
          {weight}
        </span>
        <span className="text-[10px] font-bold text-foreground/40 uppercase">
          KG
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-[10px] font-medium text-foreground/40">
          <Calendar className="w-3 h-3 mr-1" />
          {format(new Date(date), "d MMMM ''yy")}
        </div>
        {increment > 0 && (
          <div className="flex items-center text-[10px] font-bold text-emerald-500 dark:text-emerald-400">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{increment}kg
          </div>
        )}
      </div>
    </GlassCard>
  );
}
