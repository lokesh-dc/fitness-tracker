"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";

interface ExerciseSelectorProps {
  exerciseNames: string[];
  selectedExercise: string;
  onSelect: (name: string) => void;
}

export function ExerciseSelector({ exerciseNames, selectedExercise, onSelect }: ExerciseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredNames = useMemo(() => {
    return exerciseNames.filter(n => n.toLowerCase().includes(search.toLowerCase()));
  }, [exerciseNames, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-14 bg-foreground/5 border border-foreground/10 rounded-2xl px-6 flex items-center justify-between group hover:border-brand-primary/50 transition-all"
      >
        <div className="flex flex-col items-start">
          <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Exercise</span>
          <span className="text-sm font-bold text-foreground truncate max-w-[200px]">{selectedExercise || "Select Exercise"}</span>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-foreground/20 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <GlassCard className="absolute top-16 left-0 right-0 z-50 p-2 shadow-2xl border-brand-primary/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises..."
              className="w-full bg-foreground/5 border border-foreground/5 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-primary/30"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredNames.length === 0 ? (
              <div className="py-8 text-center text-xs text-foreground/20 font-bold uppercase tracking-widest">No exercises found</div>
            ) : (
              filteredNames.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    onSelect(name);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group",
                    selectedExercise === name ? "bg-brand-primary text-black" : "hover:bg-foreground/5 text-foreground/60 hover:text-foreground"
                  )}
                >
                  <span className="truncate">{name}</span>
                  {selectedExercise === name && <Check className="w-4 h-4" />}
                </button>
              ))
            )}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
