"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { format, subMonths, subYears, startOfDay } from "date-fns";

export type TimeRange = "1M" | "3M" | "6M" | "1Y" | "All" | "Custom";

interface RangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange, from?: Date, to?: Date) => void;
  customFrom?: Date;
  customTo?: Date;
}

export function RangeSelector({ selectedRange, onRangeChange, customFrom, customTo }: RangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(selectedRange === "Custom");
  const [tempFrom, setTempFrom] = useState(customFrom ? format(customFrom, "yyyy-MM-dd") : "");
  const [tempTo, setTempTo] = useState(customTo ? format(customTo, "yyyy-MM-dd") : "");

  const handlePreset = (range: TimeRange) => {
    setShowCustom(range === "Custom");
    if (range !== "Custom") {
      onRangeChange(range);
    }
  };

  const handleCustomSubmit = () => {
    if (!tempFrom || !tempTo) return;
    const from = startOfDay(new Date(tempFrom));
    const to = startOfDay(new Date(tempTo));
    
    if (from > to) {
      alert("From date cannot be after To date");
      return;
    }
    
    onRangeChange("Custom", from, to);
  };

  const presets: TimeRange[] = ["1M", "3M", "6M", "1Y", "All", "Custom"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-1 bg-foreground/5 rounded-2xl w-fit">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              selectedRange === p
                ? "bg-brand-primary text-black shadow-lg"
                : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col space-y-1">
            <label className="text-[8px] font-black text-foreground/40 uppercase tracking-widest ml-1">From</label>
            <input
              type="date"
              value={tempFrom}
              onChange={(e) => setTempFrom(e.target.value)}
              className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 text-xs font-bold text-foreground outline-none focus:border-brand-primary/50"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-[8px] font-black text-foreground/40 uppercase tracking-widest ml-1">To</label>
            <input
              type="date"
              value={tempTo}
              onChange={(e) => setTempTo(e.target.value)}
              className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 text-xs font-bold text-foreground outline-none focus:border-brand-primary/50"
            />
          </div>
          <button
            onClick={handleCustomSubmit}
            className="mt-5 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-black transition-all"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
