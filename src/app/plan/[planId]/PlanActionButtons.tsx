"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2, Trash2, AlertTriangle, Loader2, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { deletePlan, updatePlanWeeks, terminatePlan } from "@/app/actions/plan";
import { cn } from "@/lib/utils";
import { PowerOff } from "lucide-react";

import { useSession } from "next-auth/react";
import { isDemoSession } from "@/lib/demo";
import { demoActionGuard } from "@/lib/demo-guard";

export function PlanActionButtons({ 
  planId, 
  currentWeeks 
}: { 
  planId: string;
  currentWeeks: number;
}) {
  const { data: session } = useSession();
  const isDemo = isDemoSession(session);
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [showExtendOptions, setShowExtendOptions] = useState(false);

  const handleDelete = async () => {
    demoActionGuard(isDemo, async () => {
      setIsDeleting(true);
      try {
        const res = await deletePlan(planId);
        if (res.success) {
          router.push("/plan");
          router.refresh();
        } else {
          alert("Failed to delete plan");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const handleExtend = async (additionalWeeks: number) => {
    demoActionGuard(isDemo, async () => {
      setIsExtending(true);
      try {
        const res = await updatePlanWeeks(planId, currentWeeks + additionalWeeks);
        if (res.success) {
          setShowExtendOptions(false);
          router.refresh();
        } else {
          alert("Failed to extend plan");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsExtending(false);
      }
    });
  };
  const handleTerminate = async () => {
    demoActionGuard(isDemo, async () => {
      setIsExtending(true); // Re-use extender state for simplicity (or add isTerminating)
      try {
        const res = await terminatePlan(planId);
        if (res.success) {
          router.refresh();
        } else {
          alert("Failed to terminate plan");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsExtending(false);
      }
    });
  };


  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link 
          href={`/plan/designer?edit=${planId}`}
          className="glass-button py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-2 text-foreground active:scale-95 transition-transform"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Plan</span>
        </Link>
        <button 
          onClick={() => setShowExtendOptions(!showExtendOptions)}
          className={cn(
            "glass-button py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-2 transition-all active:scale-95",
            showExtendOptions ? "bg-brand-primary text-black border-brand-primary shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "text-foreground"
          )}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Extend</span>
        </button>
        <button 
          onClick={handleTerminate}
          className="glass-button py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-2 text-orange-500 hover:bg-orange-500/10 active:scale-95 transition-all outline-none"
        >
          <PowerOff className="w-4 h-4" />
          <span>Terminate</span>
        </button>
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="glass-button py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-2 text-red-500 hover:bg-red-500/10 active:scale-95 transition-all outline-none"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>

      {showExtendOptions && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <GlassCard className="p-4 border-brand-primary/20 bg-brand-primary/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3 text-center">Add More Weeks to Cycle</p>
            <div className="flex space-x-2">
              {[1, 2, 4, 8].map((weeks) => (
                <button
                  key={weeks}
                  disabled={isExtending}
                  onClick={() => handleExtend(weeks)}
                  className="flex-1 py-3 bg-foreground/5 hover:bg-brand-primary hover:text-black rounded-xl text-xs font-black transition-all disabled:opacity-50"
                >
                  +{weeks} W
                </button>
              ))}
            </div>
            {isExtending && (
              <div className="flex justify-center mt-3">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <GlassCard className="max-w-md w-full p-6 space-y-6 animate-in zoom-in-95 duration-200 border-red-500/30">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Delete Plan?</h3>
              <p className="text-xs font-bold text-foreground/60 leading-relaxed">This action cannot be undone. All templates inside this plan will be permanently removed.</p>
            </div>
            <div className="flex space-x-4 pt-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 glass-button py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em]"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
}
