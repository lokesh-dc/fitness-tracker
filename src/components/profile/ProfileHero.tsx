import { GlassCard } from "@/components/ui/GlassCard";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";
import { Edit2, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { getUserAvatarUrl } from "@/lib/avatar";

interface ProfileHeroProps {
  userName: string;
  userEmail: string;
  joinedDate: Date;
  level: number;
  weight?: number | null;
  isVerified: boolean;
  gender?: string | null;
}

export function ProfileHero({
  userName,
  userEmail,
  joinedDate,
  level,
  weight,
  isVerified,
  gender,
}: ProfileHeroProps) {
  return (
    <GlassCard className="p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top right logout button */}
      <div className="absolute top-4 right-4">
        <LogoutButton variant="icon" />
      </div>

      {/* Avatar */}
      <div className="relative mb-4">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl border-2 border-brand-primary/40 p-1 bg-background/50 backdrop-blur-md shadow-xl transition-transform duration-300 hover:scale-105">
          <img
            src={getUserAvatarUrl(gender)}
            alt={userName}
            className="w-full h-full rounded-2xl object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-primary rounded-full border-4 border-background flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      </div>

      {/* Name and email */}
      <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
        {userName}
      </h2>
      <div className="flex items-center justify-center space-x-1.5 mt-1 text-xs text-foreground/50 font-medium">
        <span>{userEmail}</span>
        {isVerified ? (
          <span title="Email verified" className="inline-flex shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </span>
        ) : (
          <span title="Email unverified" className="inline-flex shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          </span>
        )}
      </div>

      <p className="text-[11px] text-foreground/40 font-medium mt-1">
        Joined {format(joinedDate, "d MMMM ''yy")}
      </p>

      {/* Level, Pro & Weight Badges */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-brand-primary/15 text-brand-secondary dark:text-brand-primary uppercase tracking-widest border border-brand-primary/25">
          Level {level}
        </span>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-foreground/5 text-foreground/70 uppercase tracking-widest border border-foreground/10">
          Pro Member
        </span>
        {weight && (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-500 uppercase tracking-widest border border-blue-500/20">
            {weight} kg
          </span>
        )}
      </div>

      {/* Edit Profile CTA Button */}
      <div className="mt-5 w-full sm:w-auto">
        <Link
          href="/profile/edit"
          className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-xs font-bold text-foreground transition-all hover:scale-[1.02] active:scale-95 gap-2"
        >
          <Edit2 className="w-3.5 h-3.5 text-brand-primary" />
          <span>Edit Profile</span>
        </Link>
      </div>
    </GlassCard>
  );
}
