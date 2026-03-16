import { Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WorkoutHistoryItemProps {
  id: string;
  date: string | Date;
  name: string;
  exercisesCount: number;
  href: string;
  className?: string;
  showChevron?: boolean;
}

export function WorkoutHistoryItem({
  id,
  date,
  name,
  exercisesCount,
  href,
  className,
  showChevron = true,
}: WorkoutHistoryItemProps) {
  return (
    <Link href={href} className="contents">
      <GlassCard className={cn("flex items-center justify-between group cursor-pointer", className)}>
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-foreground/40" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {name}
            </h3>
            <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">
              {format(new Date(date), "d MMMM ''yy")} • {exercisesCount} Exercises
            </p>
          </div>
        </div>
        {showChevron && (
          <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:text-foreground transition-colors" />
        )}
      </GlassCard>
    </Link>
  );
}
