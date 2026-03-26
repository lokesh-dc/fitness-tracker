"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Dumbbell, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function SignUp() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess(false);

		const formData = new FormData(e.currentTarget);
		try {
			await registerUser(formData);
			setSuccess(true);
			setLoading(false);
		} catch (err: any) {
			setError(err.message || "Something went wrong.");
			setLoading(false);
		}
	};

	return (
		<div className=" flex items-center justify-center px-6">
			<div className="w-full max-w-md space-y-8">
				<div className="flex flex-col items-center">
					<div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)] mb-6">
						<Dumbbell className="w-8 h-8 text-black" />
					</div>
					<h1 className="text-3xl font-black text-white tracking-tighter">
						Create Account
					</h1>
					<p className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1">
						Start your journey today
					</p>
				</div>

				<GlassCard className="p-8 space-y-6">
					{success ? (
						<div className="text-center space-y-4 py-4">
							<div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
								<div className="w-6 h-6 rounded-full bg-green-500" />
							</div>
							<h2 className="text-xl font-black text-white uppercase tracking-tight">Verify Your Email</h2>
							<p className="text-sm text-white/60 font-medium leading-relaxed">
								We've sent a verification link to your email address. Please check your inbox to activate your account.
							</p>
							<Link 
								href="/auth/signin" 
								className="inline-block bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
							>
								Back to Log In
							</Link>
						</div>
					) : (
						<>
							{error && (
								<p className="text-xs font-bold text-rose-500 text-center uppercase tracking-widest">
									{error}
								</p>
							)}
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-1">
									<label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
										Name
									</label>
									<input
										name="name"
										required
										className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-primary transition-colors"
										placeholder="Your name"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
										Email
									</label>
									<input
										name="email"
										type="email"
										required
										className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-primary transition-colors"
										placeholder="you@example.com"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
										Password
									</label>
									<input
										name="password"
										type="password"
										required
										className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-primary transition-colors"
										placeholder="••••••••"
									/>
								</div>
								<button
									disabled={loading}
									className="w-full bg-brand-primary text-black py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] mt-8">
									{loading ? (
										<Loader2 className="w-5 h-5 animate-spin" />
									) : (
										<>
											<span className="mr-2">Join Now</span>{" "}
											<ArrowRight className="w-4 h-4" />
										</>
									)}
								</button>
							</form>
						</>
					)}
				</GlassCard>

				<p className="text-center text-white/40 text-xs font-bold">
					Already have an account?{" "}
					<Link href="/auth/signin" className="text-brand-primary hover:underline">
						Log In
					</Link>
				</p>
			</div>
		</div>
	);
}
