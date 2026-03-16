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
  Save
} from "lucide-react";
import { updateProfile } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface EditProfileClientProps {
  initialName: string;
  initialEmail: string;
  initialGender?: string;
  initialWeight?: number;
}

export function EditProfileClient({ 
  initialName, 
  initialEmail, 
  initialGender, 
  initialWeight 
}: EditProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [gender, setGender] = useState(initialGender || "");
  const [weight, setWeight] = useState(initialWeight?.toString() || "");
  
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleProfileUpdate = async () => {
    setUpdating(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await updateProfile({
        name,
        email,
        gender,
        weight: weight ? parseFloat(weight) : undefined,
      });
      
      if (res.success) {
        if (res.emailChanged) {
          setMessage({ text: "Email changed! Please re-verify and log in again.", type: "success" });
          setTimeout(() => signOut({ callbackUrl: "/auth/signin" }), 2000);
        } else {
          setMessage({ text: "Profile updated successfully!", type: "success" });
          setTimeout(() => router.push("/profile"), 1500);
        }
      } else {
        setMessage({ text: res.message || "Failed to update profile.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred.", type: "error" });
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
          <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center group-hover:bg-foreground/10">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Profile</span>
        </Link>
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
          Management
        </h3>
        <GlassCard className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
                <User className="w-3 h-3" />
                <span>Full Name</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition-all focus:bg-white/[0.07]"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
                <Mail className="w-3 h-3" />
                <span>Email Address</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition-all focus:bg-white/[0.07]"
                placeholder="email@example.com"
              />
              {email !== initialEmail && (
                <p className="text-[9px] text-orange-500/60 font-medium ml-1 flex items-center space-x-1">
                  <RefreshCw className="w-2 h-2 animate-spin" />
                  <span>Changing email requires re-verification</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
                <Smile className="w-3 h-3" />
                <span>Gender</span>
              </label>
              <div className="relative">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition-all focus:bg-white/[0.07] appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-zinc-900">Select Gender</option>
                  <option value="male" className="bg-zinc-900">Male</option>
                  <option value="female" className="bg-zinc-900">Female</option>
                  <option value="other" className="bg-zinc-900">Other</option>
                  <option value="prefer_not_to_say" className="bg-zinc-900">Prefer not to say</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/20">
                  <ChevronLeft className="w-3 h-3 -rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
                <Scale className="w-3 h-3" />
                <span>Body Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition-all focus:bg-white/[0.07]"
                placeholder="0.0"
              />
            </div>
          </div>

          <button
            onClick={handleProfileUpdate}
            disabled={updating}
            className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] disabled:opacity-50 mt-4 flex items-center justify-center space-x-3"
          >
            {updating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{updating ? "Saving Changes..." : "Save Profile Details"}</span>
          </button>
        </GlassCard>
      </section>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-2 ${
          message.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <p className="text-[10px] font-bold uppercase tracking-widest">
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
}
