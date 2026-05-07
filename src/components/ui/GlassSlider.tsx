"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  displayValue: string;
  label: string;
  unit?: string;
}

export function GlassSlider({
  min,
  max,
  step,
  value,
  onChange,
  displayValue,
  label,
  unit,
}: GlassSliderProps) {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  return (
    <div className="w-full py-4 space-y-6">
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center group/input">
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              value={value}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) onChange(val);
              }}
              onBlur={() => {
                if (value < min) onChange(min);
                if (value > max) onChange(max);
              }}
              className="text-5xl font-black text-white bg-transparent text-center w-full max-w-[140px] outline-none focus:text-orange-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xl font-bold text-white/20">
              {unit || displayValue.split(' ').pop()}
            </span>
          </div>
          <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-white/5 group-focus-within/input:bg-orange-500 transition-all scale-x-50 group-focus-within/input:scale-x-100" />
        </div>
        <div className="mt-4 flex flex-col items-center gap-1">
          {/* <span className="text-sm font-bold text-orange-500/80">{displayValue}</span> */}
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
        </div>
      </div>

      <div className="relative w-full h-12 flex items-center group px-2">
        {/* Track */}
        <div className="absolute left-2 right-2 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
          {/* Fill */}
          <div 
            className="h-full bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all duration-300" 
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute left-0 right-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Thumb (Visual) */}
        <div 
          className="absolute h-7 w-7 bg-white rounded-full ring-[6px] ring-orange-500/20 pointer-events-none transition-all duration-75 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center"
          style={{ left: `calc(${percentage}% - 14px)` }}
        >
          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
