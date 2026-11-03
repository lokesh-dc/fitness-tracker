"use client";

import { useState, useTransition } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Switch } from "@/components/ui/Switch";
import { Scale, Timer, Check, Loader2 } from "lucide-react";
import { updateUserSettings } from "@/app/actions/user";
import { UserSettings } from "@/types/user-settings";
import { cn } from "@/lib/utils";

interface WorkoutPreferencesProps {
  initialSettings: UserSettings;
}

const REST_OPTIONS = [60, 90, 120, 180];

export function WorkoutPreferences({ initialSettings }: WorkoutPreferencesProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleToggleWeight = (checked: boolean) => {
    const previous = settings;
    setSettings((prev) => ({ ...prev, logWeightBeforeWorkout: checked }));
    setStatusMessage(null);

    startTransition(async () => {
      const res = await updateUserSettings({ logWeightBeforeWorkout: checked });
      if (!res.success) {
        setSettings(previous);
        setStatusMessage("Failed to save setting");
      } else {
        setStatusMessage("Saved");
        setTimeout(() => setStatusMessage(null), 2000);
      }
    });
  };

  const handleSelectRest = (seconds: number) => {
    if (seconds === settings.defaultRestDuration) return;
    const previous = settings;
    setSettings((prev) => ({ ...prev, defaultRestDuration: seconds }));
    setStatusMessage(null);

    startTransition(async () => {
      const res = await updateUserSettings({ defaultRestDuration: seconds });
      if (!res.success) {
        setSettings(previous);
        setStatusMessage("Failed to save setting");
      } else {
        setStatusMessage("Saved");
        setTimeout(() => setStatusMessage(null), 2000);
      }
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em]">
          Workout Preferences
        </h3>
        <div className="flex items-center space-x-1 text-[10px] font-bold">
          {isPending && (
            <span className="flex items-center text-brand-primary gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
          {statusMessage === "Saved" && (
            <span className="flex items-center text-emerald-500 gap-1 animate-in fade-in">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          {statusMessage && statusMessage !== "Saved" && (
            <span className="text-rose-500">{statusMessage}</span>
          )}
        </div>
      </div>

      <GlassCard className="p-4 md:p-5 space-y-5">
        {/* Toggle: Log Weight Before Workout */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Scale className="w-5 h-5 text-brand-primary" />
            </div>
            <div className="min-w-0">
              <label
                htmlFor="log-weight-toggle"
                className="text-sm font-bold text-foreground block cursor-pointer"
              >
                Log Weight Before Workout
              </label>
              <p className="text-[11px] text-foreground/50 font-medium leading-relaxed mt-0.5">
                Prompt to record body weight at the start of each session
              </p>
            </div>
          </div>
          <Switch
            id="log-weight-toggle"
            aria-label="Log Weight Before Workout"
            checked={settings.logWeightBeforeWorkout}
            onCheckedChange={handleToggleWeight}
            disabled={isPending}
          />
        </div>

        <div className="h-px bg-foreground/5" />

        {/* Default Rest Timer Option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Default Rest Timer
              </p>
              <p className="text-[11px] text-foreground/50 font-medium mt-0.5">
                Standard recovery interval (can be customized per exercise in plans)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {REST_OPTIONS.map((sec) => {
              const active = settings.defaultRestDuration === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleSelectRest(sec)}
                  disabled={isPending}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center",
                    active
                      ? "bg-brand-primary text-black shadow-[0_0_15px_rgba(249,115,22,0.3)] scale-[1.02]"
                      : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
                  )}
                >
                  <span>{sec}s</span>
                  <span className="text-[9px] font-bold opacity-60">
                    {sec / 60 >= 1 ? `${sec / 60}m` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

