"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw
} from "lucide-react";
import { resendVerification } from "@/app/actions/user";

interface ProfileClientProps {
  isVerified: boolean;
}

export function ProfileClient({ isVerified }: ProfileClientProps) {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await resendVerification();
      if (res.success) {
        setMessage({ text: "Verification email sent! Check your inbox.", type: "success" });
      } else {
        setMessage({ text: res.message || "Failed to resend.", type: "error" });
      }
    } catch {
      setMessage({ text: "An error occurred.", type: "error" });
    } finally {
      setResending(false);
    }
  };

  if (isVerified) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] px-1">
        Account Security
      </h3>
      <GlassCard className="p-4 flex items-center justify-between border-amber-500/20 bg-amber-500/5">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Email Unverified
            </p>
            <p className="text-[10px] text-amber-500/80 font-medium uppercase tracking-wider mt-0.5">
              Verify your email to secure your account
            </p>
          </div>
        </div>
        <button 
          onClick={handleResend}
          disabled={resending}
          className="flex items-center space-x-1.5 bg-foreground/10 hover:bg-foreground/15 text-foreground px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 text-[10px] font-black uppercase tracking-wider shrink-0"
        >
          <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
          <span>Resend</span>
        </button>
      </GlassCard>

      {message.text && (
        <p className={`text-[10px] font-bold text-center uppercase tracking-[0.2em] px-4 py-2 rounded-xl ${
          message.type === "success" 
            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
        }`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
