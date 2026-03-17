"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Dumbbell, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials. Try again.");
      setLoading(false);
    } else {
      router.replace(callbackUrl);
    }
  };

  return (
    <div className=" flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)] mb-6">
            <Dumbbell className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">Welcome Back</h1>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">Unlock your potential</p>
        </div>

        <GlassCard className="p-8 space-y-6">
          {registered && !error && (
            <p className="text-xs font-bold text-emerald-500 text-center uppercase tracking-widest">
              Registration successful! Please log in.
            </p>
          )}
          {error && <p className="text-xs font-bold text-rose-500 text-center uppercase tracking-widest">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-orange-500 text-black py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] mt-8"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span className="mr-2">Log In</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </GlassCard>

        <p className="text-center text-white/40 text-xs font-bold">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-orange-500 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className=" flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
