"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Trophy, X } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export function DemoExitModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [hasShown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md relative z-10"
          >
            <GlassCard className="p-8 border-brand-primary/20 bg-black/40 shadow-2xl relative overflow-hidden group">
              {/* Decorative Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/20 rounded-full blur-[80px]" />
              
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                  <Trophy className="w-8 h-8 text-brand-primary" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
                    Ready to track your own gains?
                  </h2>
                  <p className="text-sm font-medium text-foreground/60 leading-relaxed">
                    Your demo session will reset in 24 hours. Create a free account to keep your data forever.
                  </p>
                </div>

                <div className="flex flex-col w-full gap-3 pt-2">
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 bg-brand-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                  >
                    Create Free Account
                  </Link>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 bg-white/5 border border-white/10 text-foreground/60 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 hover:text-foreground transition-all"
                  >
                    Continue Demo
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
