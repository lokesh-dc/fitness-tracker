"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  User,
  Mail,
  Scale,
  Smile,
  ChevronLeft,
  Save,
  Ruler,
  Target,
  Calendar
} from "lucide-react";
import { updateProfile } from "@/app/actions/user";
import { saveOnboardingStep } from "@/app/actions/profile";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { getUserAvatarUrl } from "@/lib/avatar";

interface EditProfileClientProps {
  initialName: string;
  initialEmail: string;
  initialGender?: string;
  initialWeight?: number;
  initialHeight?: number;
  initialTargetWeight?: number;
  initialPreferredDays?: number[];
  initialUnit?: "kg" | "lbs";
}

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function EditProfileClient({ 
  initialName, 
  initialEmail, 
  initialGender, 
  initialWeight,
  initialHeight,
  initialTargetWeight,
  initialPreferredDays = [1, 3, 5],
  initialUnit = "kg",
}: EditProfileClientProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [gender, setGender] = useState(initialGender || "");
  const [weight, setWeight] = useState(initialWeight?.toString() || "");
  const [height, setHeight] = useState(initialHeight?.toString() || "");
  const [targetWeight, setTargetWeight] = useState(initialTargetWeight?.toString() || "");
  const [unit, setUnit] = useState<"kg" | "lbs">(initialUnit);
  const [preferredDays, setPreferredDays] = useState<number[]>(initialPreferredDays);
  
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const toggleDay = (dayIndex: number) => {
    setPreferredDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const handleProfileUpdate = async () => {
    setUpdating(true);
    setMessage({ text: "", type: "" });
    try {
      // 1. Update basic user account info
      const res = await updateProfile({
        name,
        email,
        gender,
        weight: weight ? parseFloat(weight) : undefined,
      });
      
      if (!res.success) {
        setMessage({ text: res.message || "Failed to update profile.", type: "error" });
        return;
      }

      // 2. Update body & goals onboarding profile
      await saveOnboardingStep({
        unit,
        height: height ? parseFloat(height) : undefined,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        currentWeight: weight ? parseFloat(weight) : undefined,
        preferredTrainingDays: preferredDays,
      });

      if (updateSession) {
        await updateSession({ gender });
      }

      if (res.emailChanged) {
        setMessage({ text: "Email changed! Please re-verify and log in again.", type: "success" });
        setTimeout(() => signOut({ callbackUrl: "/auth/signin" }), 2000);
      } else {
        setMessage({ text: "Profile & goals updated successfully!", type: "success" });
        setTimeout(() => router.push("/profile"), 1200);
      }
    } catch {
      setMessage({ text: "An error occurred while saving.", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Link 
          href="/profile" 
          className="flex items-center space-x-2 text-foreground/40 hover:text-foreground transition-colors group"
        >
          <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Profile</span>
        </Link>
      </div>

      {/* Basic Account Info */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] ml-1">
          Account Information
        </h3>
        <GlassCard className="p-6 space-y-6">
          {/* Avatar Live Preview */}
          <div className="flex items-center space-x-4 pb-4 border-b border-foreground/5">
            <div className="w-16 h-16 rounded-2xl border-2 border-brand-primary/40 p-1 bg-background/50 shadow-md shrink-0">
              <img
                src={getUserAvatarUrl(gender)}
                alt="Avatar Preview"
                className="w-full h-full rounded-xl object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Avatar Preview</p>
              <p className="text-[11px] text-foreground/50 font-medium">
                {gender?.toLowerCase() === "female"
                  ? "Female avatar (assigned)"
                  : "Male avatar (assigned)"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">
                <User className="w-3 h-3" />
                <span>Full Name</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-3 text-sm text-foreground outline-none focus:border-brand-primary/50 transition-all focus:bg-foreground/[0.08]"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">
                <Mail className="w-3 h-3" />
                <span>Email Address</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-3 text-sm text-foreground outline-none focus:border-brand-primary/50 transition-all focus:bg-foreground/[0.08]"
                placeholder="email@example.com"
              />
              {email !== initialEmail && (
                <p className="text-[9px] text-brand-primary font-medium ml-1 flex items-center space-x-1">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>Changing email requires re-verification</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">
                <Smile className="w-3 h-3" />
                <span>Gender</span>
              </label>
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-3 text-sm text-foreground outline-none focus:border-brand-primary/50 transition-all focus:bg-foreground/[0.08] appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-background">Select Gender</option>
                  <option value="male" className="bg-background">Male</option>
                  <option value="female" className="bg-background">Female</option>
                  <option value="other" className="bg-background">Other</option>
                  <option value="prefer_not_to_say" className="bg-background">Prefer not to say</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20">
                  <ChevronLeft className="w-3 h-3 -rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">
                <Scale className="w-3 h-3" />
                <span>Current Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-3 text-sm text-foreground outline-none focus:border-brand-primary/50 transition-all focus:bg-foreground/[0.08]"
                placeholder="0.0"
              />
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Body & Training Goals */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] ml-1">
          Body & Training Goals
        </h3>
        <GlassCard className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">
                <Ruler className="w-3 h-3" />
                <span>Height (cm)</span>
              </label>
              <input
                type="number"
                step="1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-3 text-sm text-foreground outline-none focus:border-brand-primary/50 transition-all focus:bg-foreground/[0.08]"
                placeholder="175"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">
                <Target className="w-3 h-3" />
                <span>Target Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-3 text-sm text-foreground outline-none focus:border-brand-primary/50 transition-all focus:bg-foreground/[0.08]"
                placeholder="70.0"
              />
            </div>
          </div>

          {/* Preferred Training Days */}
          <div className="space-y-2.5 pt-2 border-t border-foreground/5">
            <label className="flex items-center space-x-2 text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">
              <Calendar className="w-3 h-3" />
              <span>Preferred Training Days</span>
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d) => {
                const selected = preferredDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      selected
                        ? "bg-brand-primary text-black shadow-[0_0_10px_rgba(249,115,22,0.3)] scale-[1.02]"
                        : "bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:text-foreground"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Save Button */}
      <button
        onClick={handleProfileUpdate}
        disabled={updating}
        className="w-full bg-brand-primary text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-95 transition-all shadow-[0_15px_30px_rgba(249,115,22,0.3)] disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        {updating ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        <span>{updating ? "Saving Changes..." : "Save All Changes"}</span>
      </button>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-2 ${
          message.type === "success" 
            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <p className="text-xs font-bold uppercase tracking-widest">
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
}
