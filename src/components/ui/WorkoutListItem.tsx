import { Play, Clock, Dumbbell } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface WorkoutListItemProps {
  title: string;
  subtitle: string;
  duration?: string;
  exercisesCount?: number;
  image?: string;
  active?: boolean;
  onClick?: () => void;
}

export function WorkoutListItem({ 
  title, 
  subtitle, 
  duration, 
  exercisesCount, 
  image, 
  active, 
  onClick 
}: WorkoutListItemProps) {
  return (
    <GlassCard 
      onClick={onClick}
      className={cn(
        "flex items-center space-x-4 p-4",
        active && "border-orange-500/40 bg-orange-500/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
      )}
    >
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-foreground/10 flex-shrink-0 flex items-center justify-center border border-foreground/5">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <Dumbbell className="w-6 h-6 text-foreground/40" />
        )}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Play className="w-6 h-6 fill-white text-white" />
        </div>
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className="text-base font-bold text-foreground truncate">{title}</h3>
        <p className="text-xs text-foreground/50 truncate mb-2">{subtitle}</p>
        
        <div className="flex items-center space-x-3 text-[10px] font-medium text-foreground/40 uppercase tracking-wider">
          {duration && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {duration}
            </div>
          )}
          {exercisesCount !== undefined && (
            <div className="flex items-center">
              <Dumbbell className="w-3 h-3 mr-1" />
              {exercisesCount} Exercises
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        <div className="glass-button w-10 h-10 rounded-full border-foreground/10">
          <Play className="w-4 h-4 fill-orange-500 text-orange-500 ml-0.5" />
        </div>
      </div>
    </GlassCard>
  );
}
