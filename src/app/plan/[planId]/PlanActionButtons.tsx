"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { deletePlan } from "@/app/actions/plan";

export function PlanActionButtons({ planId }: { planId: string }) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
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
  };

  return (
    <>
      <div className="flex space-x-4">
        <Link 
          href={`/plan/designer?edit=${planId}`}
          className="flex-1 glass-button py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 text-foreground active:scale-95 transition-transform"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Plan</span>
        </Link>
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="flex-1 glass-button py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 text-red-500 hover:bg-red-500/10 active:scale-95 transition-all outline-none"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>

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
