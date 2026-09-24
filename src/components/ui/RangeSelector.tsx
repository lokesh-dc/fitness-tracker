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
  options = ["7d", "30d", "all"],
}: RangeSelectorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] p-0.5",
        className,
      )}>
      {options.map((r) => (
        <button
          key={r}
          onClick={() => setRange(r)}
          aria-pressed={range === r}
          className={cn(
            "cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
            range === r
              ? "bg-foreground text-background"
              : "text-foreground/40 hover:text-foreground/80",
          )}>
          {r}
        </button>
      ))}
    </div>
  );
}