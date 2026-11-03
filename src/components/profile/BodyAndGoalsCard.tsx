import { GlassCard } from "@/components/ui/GlassCard";
import { UserProfile } from "@/types/profile";
import { Target, Ruler, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

interface BodyAndGoalsCardProps {
  profile: UserProfile | null;
  currentWeight?: number | null;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BodyAndGoalsCard({ profile, currentWeight }: BodyAndGoalsCardProps) {
  const height = profile?.height;
  const targetWeight = profile?.targetWeight;
  const preferredDays = profile?.preferredTrainingDays || [];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em]">
          Body & Goals
        </h3>
        <Link
          href="/profile/edit"
          className="text-[10px] font-bold text-brand-primary uppercase tracking-wider hover:underline"
        >
          Edit
        </Link>
      </div>

      <GlassCard className="p-4 md:p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Height */}
          <div className="p-3 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06] flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4 text-foreground/60" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                Height
              </p>
              <p className="text-sm font-black text-foreground">
                {height ? `${height} cm` : "Not set"}
              </p>
            </div>
          </div>

          {/* Target Weight */}
          <div className="p-3 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.06] flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                Target Weight
              </p>
              <p className="text-sm font-black text-foreground">
                {targetWeight ? `${targetWeight} kg` : "Not set"}
              </p>
            </div>
          </div>
        </div>

        {/* Training Days */}
        <div className="pt-2 border-t border-foreground/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Training Days
            </span>
            <span className="text-[10px] font-bold text-foreground/60">
              {preferredDays.length} days/wk
            </span>
          </div>
          <div className="flex gap-1.5">
            {DAY_LABELS.map((day, idx) => {
              const isSelected = preferredDays.includes(idx);
              return (
                <div
                  key={day}
                  className={`flex-1 py-1.5 rounded-lg text-center text-[10px] font-black uppercase transition-colors ${
                    isSelected
                      ? "bg-brand-primary text-black"
                      : "bg-foreground/5 text-foreground/30"
                  }`}
                >
                  {day[0]}
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

