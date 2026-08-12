"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import {
	ArrowRight,
	Loader2,
	Mail,
	Lock,
	Eye,
	EyeOff,
	CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";

function SignInForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
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
		<AuthLayout
			heroTitle={
				<>
					PUSH YOUR <br />
					<span className="text-white">LIMITS</span> FURTHER.
				</>
			}
			heroSubtitle="Experience the next generation of workout tracking. Precision data, actionable insights, and a community that drives you."
			heroFloatingText="Track every set, rep, and personal record with our intuitive interface. Your progress is our mission.">
			<div className="space-y-6 lg:space-y-8">
				{/* Header */}
				<div className="space-y-1">
					<h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
						Welcome to <br />
						<span className="text-brand-primary">Fitness Tracker</span>
					</h1>
					<p className="text-white/50 text-xs font-medium max-w-sm">
						Track your progress, smash your goals, and join a community of
						dedicated athletes.
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{registered && !error && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
							<CheckCircle2 className="w-4 h-4 text-emerald-500" />
							<p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
								Registration successful! Please log in.
							</p>
						</motion.div>
					)}

					{error && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
							<div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
							<p className="text-xs font-bold text-rose-500 uppercase tracking-widest">
								{error}
							</p>
						</motion.div>
					)}

					<div className="space-y-4">
						<div className="relative group">
							<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-brand-primary transition-colors" />
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
								placeholder="Email Address"
							/>
						</div>

						<div className="relative group">
							<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-brand-primary transition-colors" />
							<input
								type={showPassword ? "text" : "password"}
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
								placeholder="Password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors">
								{showPassword ? (
									<EyeOff className="w-5 h-5" />
								) : (
									<Eye className="w-5 h-5" />
								)}
							</button>
						</div>
					</div>

					<div className="flex items-center justify-between px-1">
						<label className="flex items-center gap-2 cursor-pointer group">
							<input
								type="checkbox"
								className="w-4 h-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary/20 transition-all"
							/>
							<span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
								Remember me
							</span>
						</label>
						<button
							type="button"
							className="text-xs text-brand-primary hover:underline font-medium">
							Forgot password?
						</button>
					</div>

					<button
						disabled={loading}
						className="w-full bg-brand-primary text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group mt-2">
						{loading ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<>
								<span>Sign In</span>
								<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
							</>
						)}
					</button>
				</form>

				<p className="text-center text-white/40 text-xs font-bold uppercase tracking-widest">
					Don&apos;t have an account?{" "}
					<Link
						href="/auth/signup"
						className="text-brand-primary hover:underline transition-all">
						Sign Up
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
}

export default function SignIn() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
				</div>
			}>
			<SignInForm />
		</Suspense>
	);
}
