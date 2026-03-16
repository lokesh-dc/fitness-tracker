"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  variant?: "icon" | "full";
}

export function LogoutButton({ className, variant = "icon" }: LogoutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className={cn(
        "transition-all active:scale-95 group",
        variant === "icon" 
          ? "p-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 text-foreground/40 hover:text-rose-500 border border-white/10 hover:border-rose-500/20 shadow-xl"
          : "w-full glass-card border-rose-500/20 hover:bg-rose-500/10 flex items-center justify-center space-x-2 py-4 mt-8",
        className
      )}
    >
      <LogOut className={cn("w-5 h-5", variant === "full" && "text-rose-500")} />
      {variant === "full" && (
        <span className="text-sm font-bold text-rose-500 uppercase tracking-widest">
          Log Out
        </span>
      )}
    </button>
  );
}
