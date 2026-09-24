"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseSelectorProps {
  exerciseNames: string[];
  selectedExercise: string;
  onSelect: (name: string) => void;
}

export function ExerciseSelector({
  exerciseNames,
  selectedExercise,
  onSelect,
}: ExerciseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredNames = useMemo(() => {
    return exerciseNames.filter((n) =>
      n.toLowerCase().includes(search.toLowerCase()),
    );
  }, [exerciseNames, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-foreground/[0.08] bg-foreground/[0.03] px-4 transition-all hover:border-brand-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40">
        <span className="min-w-0">
          <span className="block text-[9px] font-semibold uppercase tracking-widest text-foreground/35">
            Exercise
          </span>
          <span className="block truncate text-[13px] font-semibold text-foreground">
            {selectedExercise || "Select an exercise"}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-foreground/35 transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="glass absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl p-2 shadow-2xl animate-in fade-in duration-150">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] py-2 pl-9 pr-4 text-[13px] text-foreground placeholder:text-foreground/30 outline-none focus:border-brand-primary/40"
            />
          </div>

          <div className="max-h-60 overflow-y-auto no-scrollbar">
            {filteredNames.length === 0 ? (
              <div className="px-4 py-8 text-center text-[13px] font-medium text-foreground/40">
                No exercises found.
              </div>
            ) : (
              filteredNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onSelect(name);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors",
                    selectedExercise === name
                      ? "bg-foreground/10 text-foreground"
                      : "text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground",
                  )}>
                  <span className="truncate">{name}</span>
                  {selectedExercise === name && (
                    <Check className="h-4 w-4 shrink-0 text-brand-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}