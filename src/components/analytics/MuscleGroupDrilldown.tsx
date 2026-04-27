"use client";

import { useState } from "react";
import { MuscleGroupSummary, ExerciseProgressMap } from "@/types/workout";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { format, parseISO } from "date-fns";
import { X, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { ExerciseProgressInline } from "./ExerciseProgressInline";
import { cn } from "@/lib/utils";

interface MuscleGroupDrilldownProps {
  summary: MuscleGroupSummary;
  progressMap: ExerciseProgressMap;
  onClose: () => void;
}

export function MuscleGroupDrilldown({ summary, progressMap, onClose }: MuscleGroupDrilldownProps) {
  const [metric, setMetric] = useState<"volume" | "sets">("volume");
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const exercises = Object.entries(progressMap)
    .filter(([_, data]) => data.muscleGroup === summary.muscleGroup)
    .sort((a, b) => b[1].dataPoints.length - a[1].dataPoints.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mt-8 space-y-6"
    >
      <GlassCard className="border-brand-primary/20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              {summary.muscleGroup} Deep Dive
            </h2>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mt-1">
              Performance & Progression
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-foreground/40" />
          </button>
        </div>

        <div className="space-y-8">
          {/* 2a - Volume Chart */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">
                  Training {metric === "volume" ? "Volume" : "Sets"}
                </h3>
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                  Weekly progression
                </p>
              </div>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setMetric("volume")}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    metric === "volume" ? "bg-brand-primary text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  Volume
                </button>
                <button
                  onClick={() => setMetric("sets")}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    metric === "sets" ? "bg-brand-primary text-white" : "text-white/40 hover:text-white"
                  )}
                >
                  Sets
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 9, fontWeight: 700, className: "text-foreground/20" }}
                    tickFormatter={(str) => `W${str.split('-')[1]}`}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 9, fontWeight: 700, className: "text-foreground/20" }}
                    width={40}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass p-3 border-white/10 rounded-xl shadow-xl">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
                              Week {label.split('-')[1]}, {label.split('-')[0]}
                            </p>
                            <p className="text-sm font-bold text-brand-primary">
                              {payload[0].value} {metric === "volume" ? "kg" : "sets"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey={metric === "volume" ? "totalVolume" : "totalSets"} 
                    fill="var(--brand-accent)" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2b - Exercise List */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">
              Exercise Breakdown
            </h3>
            <div className="space-y-2">
              {exercises.map(([name, data]) => (
                <div key={name} className="space-y-2">
                  <button
                    onClick={() => setExpandedExercise(expandedExercise === name ? null : name)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all border border-white/5",
                      expandedExercise === name ? "bg-white/10 border-brand-primary/30" : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-primary/10 p-2 rounded-xl">
                        <Trophy className="w-4 h-4 text-brand-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-foreground">{name}</p>
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                          {data.dataPoints.length} Sessions Logged
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block text-right">
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Current PR</p>
                        <p className="text-sm font-black text-foreground">{data.currentPR || 0} kg</p>
                      </div>
                      <div className="bg-white/5 p-1 rounded-lg">
                        {expandedExercise === name ? (
                          <ChevronUp className="w-5 h-5 text-foreground/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-foreground/40" />
                        )}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedExercise === name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0">
                          <ExerciseProgressInline 
                            data={data.dataPoints} 
                            prDate={data.prDate}
                            exerciseName={name}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
