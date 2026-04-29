"use client";

import { useState } from "react";
import {
	ArrowRight,
	Loader2,
	Mail,
	Lock,
	User,
	Eye,
	EyeOff,
	CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SignUp() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

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
		<AuthLayout
			heroTitle={
				<>
					Start your <br />
					<span className="text-white">Fitness</span> journey.
				</>
			}
			heroSubtitle="Unlock personalized workout plans, track your muscle growth, and visualize your strength gains over time."
			heroFloatingText="Join thousands of users who have transformed their lives using our data-driven approach to fitness.">
			<AnimatePresence mode="wait">
				{success ? (
					<motion.div
						key="success"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-center space-y-6 py-8">
						<div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
							<CheckCircle2 className="w-8 h-8 text-emerald-500" />
						</div>
						<div className="space-y-2">
							<h2 className="text-2xl font-black text-white tracking-tight">
								VERIFY YOUR EMAIL
							</h2>
							<p className="text-white/60 font-medium leading-relaxed max-w-xs mx-auto text-xs">
								We&apos;ve sent a verification link to your email address.
								Please check your inbox to activate your account.
							</p>
						</div>
						<Link
							href="/auth/signin"
							className="inline-flex items-center gap-2 bg-brand-primary text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-primary/20">
							<span>Back to Log In</span>
							<ArrowRight className="w-4 h-4" />
						</Link>
					</motion.div>
				) : (
					<motion.div key="form" className="space-y-6 lg:space-y-8">
						{/* Header */}
						<div className="space-y-1">
							<h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
								Join the <br />
								<span className="text-brand-primary">Movement</span>
							</h1>
							<p className="text-white/50 text-xs font-medium max-w-sm">
								Create your account today and start tracking your progress like
								a pro.
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
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
									<User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-brand-primary transition-colors" />
									<input
										name="name"
										type="text"
										required
										className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
										placeholder="Full Name"
									/>
								</div>

								<div className="relative group">
									<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-brand-primary transition-colors" />
									<input
										name="email"
										type="email"
										required
										className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
										placeholder="Email Address"
									/>
								</div>

								<div className="relative group">
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-brand-primary transition-colors" />
									<input
										name="password"
										type={showPassword ? "text" : "password"}
										required
										className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white outline-none focus:border-brand-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20"
										placeholder="Create Password"
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

							<button
								disabled={loading}
								className="w-full bg-brand-primary text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group mt-2">
								{loading ? (
									<Loader2 className="w-5 h-5 animate-spin" />
								) : (
									<>
										<span>Join Now</span>
										<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
									</>
								)}
							</button>
						</form>

						<p className="text-center text-white/40 text-xs font-bold uppercase tracking-widest">
							Already have an account?{" "}
							<Link
								href="/auth/signin"
								className="text-brand-primary hover:underline transition-all">
								Log In
							</Link>
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</AuthLayout>
	);
}
