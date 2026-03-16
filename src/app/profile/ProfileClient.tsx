"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Bell, 
  Send, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  MessageSquare
} from "lucide-react";
import { updateTelegramChatId, resendVerification } from "@/app/actions/user";

interface ProfileClientProps {
  initialTelegramId: string;
  isVerified: boolean;
}

export function ProfileClient({ initialTelegramId, isVerified }: ProfileClientProps) {
  const [telegramId, setTelegramId] = useState(initialTelegramId);
  const [updating, setUpdating] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleTelegramUpdate = async () => {
    setUpdating(true);
    try {
      await updateTelegramChatId(telegramId);
      setMessage({ text: "Telegram ID updated!", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to update Telegram ID.", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

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
        <GlassCard className="p-4 flex items-center justify-between">
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

      {/* Notifications Section */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
          Workout Notifications
        </h3>
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Telegram Bot</p>
                <p className="text-[10px] text-foreground/40 font-medium">Daily workout reminders via Telegram</p>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full border relative transition-colors ${
              telegramId ? "bg-orange-500/20 border-orange-500/30" : "bg-white/5 border-white/10"
            }`}>
              <div className={`absolute top-1 w-4 h-4 bg-orange-500 rounded-full transition-all ${
                telegramId ? "right-1" : "left-1 opacity-20"
              }`} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
              Telegram Chat ID
            </label>
            <div className="flex space-x-2">
              <input
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                placeholder="Enter your Chat ID"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-orange-500 transition-colors"
              />
              <button
                onClick={handleTelegramUpdate}
                disabled={updating}
                className="bg-orange-500 text-black px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {updating ? "..." : "Save"}
              </button>
            </div>
            <p className="text-[9px] text-white/30 font-medium ml-1 italic">
              Send /id to our bot to get your Chat ID.
            </p>
          </div>
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
