"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw
} from "lucide-react";
import { resendVerification, updateProfile } from "@/app/actions/user";

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
        setMessage({ text: "Verification email sent!", type: "success" });
      } else {
        setMessage({ text: res.message || "Failed to resend.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred.", type: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
          Identity Verification
        </h3>
        <GlassCard className="p-4 flex items-center justify-between border-blue-500/10 hover:border-blue-500/30 transition-all">
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isVerified ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"
            }`}>
              {isVerified ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Email Status
              </p>
              <p className={`text-[10px] font-medium uppercase tracking-widest ${
                isVerified ? "text-green-500/60" : "text-rose-500/60"
              }`}>
                {isVerified ? "Verified" : "Unverified"}
              </p>
            </div>
          </div>
          {!isVerified && (
            <button 
              onClick={handleResend}
              disabled={resending}
              className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Resend</span>
            </button>
          )}
        </GlassCard>
      </section>

      {message.text && (
        <p className={`text-[10px] font-bold text-center uppercase tracking-[0.2em] px-4 py-2 rounded-lg ${
          message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-rose-500/10 text-rose-500"
        }`}>
          {message.text}
        </p>
      )}
    </div>
  );
}


