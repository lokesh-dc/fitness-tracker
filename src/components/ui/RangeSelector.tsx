import { cn } from "@/lib/utils";

export type TimeRange = "7d" | "30d" | "all";

interface RangeSelectorProps {
  range: TimeRange;
  setRange: (range: TimeRange) => void;
  className?: string;
  options?: TimeRange[];
}

export function RangeSelector({ 
  range, 
  setRange, 
  className,
  options = ["7d", "30d", "all"]
}: RangeSelectorProps) {
  return (
    <div className={cn("flex bg-foreground/5 p-1 rounded-xl border border-foreground/5", className)}>
      {options.map((r) => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all",
            range === r
              ? "bg-orange-500 text-black shadow-lg"
              : "text-foreground/40 hover:text-foreground"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
