"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { format, startOfDay } from "date-fns";

export type TimeRange = "1M" | "3M" | "6M" | "1Y" | "All" | "Custom";

interface RangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange, from?: Date, to?: Date) => void;
  customFrom?: Date;
  customTo?: Date;
}

export function RangeSelector({
  selectedRange,
  onRangeChange,
  customFrom,
  customTo,
}: RangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(selectedRange === "Custom");
  const [tempFrom, setTempFrom] = useState(
    customFrom ? format(customFrom, "yyyy-MM-dd") : "",
  );
  const [tempTo, setTempTo] = useState(
    customTo ? format(customTo, "yyyy-MM-dd") : "",
  );
  const [error, setError] = useState<string | null>(null);

  const handlePreset = (range: TimeRange) => {
    setShowCustom(range === "Custom");
    setError(null);
    if (range !== "Custom") {
      onRangeChange(range);
    }
  };

  const handleCustomSubmit = () => {
    if (!tempFrom || !tempTo) {
      setError("Pick both dates.");
      return;
    }
    const from = startOfDay(new Date(tempFrom));
    const to = startOfDay(new Date(tempTo));

    if (from > to) {
      setError("From date cannot be after to date.");
      return;
    }

    setError(null);
    onRangeChange("Custom", from, to);
  };

  const presets: TimeRange[] = ["1M", "3M", "6M", "1Y", "All", "Custom"];

  return (
    <div className="space-y-3">
      <div className="flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] p-0.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handlePreset(p)}
            aria-pressed={selectedRange === p}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
              selectedRange === p
                ? "bg-foreground text-background"
                : "text-foreground/40 hover:text-foreground/80",
            )}>
            {p}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="animate-in fade-in duration-200">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-foreground/35">
                From
              </span>
              <input
                type="date"
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value)}
                className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.04] px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-brand-primary/40"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-foreground/35">
                To
              </span>
              <input
                type="date"
                value={tempTo}
                onChange={(e) => setTempTo(e.target.value)}
                className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.04] px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-brand-primary/40"
              />
            </label>
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="h-[34px] cursor-pointer rounded-lg bg-foreground/10 px-4 text-[11px] font-semibold text-foreground transition-colors hover:bg-foreground/20 active:scale-95">
              Apply
            </button>
          </div>
          {error && (
            <p className="mt-2 text-[11px] font-medium text-rose-400">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}