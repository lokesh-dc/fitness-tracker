"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Dumbbell, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
	children: React.ReactNode;
	heroTitle: React.ReactNode;
	heroSubtitle: string;
	heroFloatingText: string;
}

export function AuthLayout({
	children,
	heroTitle,
	heroSubtitle,
	heroFloatingText,
}: AuthLayoutProps) {
	return (
		<div className="h-screen bg-background flex items-center justify-center p-4 lg:p-3 overflow-hidden">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full grid lg:grid-cols-2 gap-4 lg:gap-6 h-full max-h-[850px]">
				{/* Left Side - Form Content */}
				<div className="flex flex-col space-y-4 h-full">
					<GlassCard className="flex-1 p-6 lg:p-10 flex flex-col justify-center relative overflow-hidden">
						<div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

						<div className="relative space-y-6 lg:space-y-8">
							{/* Logo */}
							<div className="flex items-center gap-2">
								<div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
									<Dumbbell className="w-5 h-5 text-black" />
								</div>
								<span className="text-lg font-black tracking-tighter text-white">
									FITNESS TRACKER
								</span>
							</div>

							{children}
						</div>
					</GlassCard>

					{/* Shared Social Proof Card */}
					<GlassCard className="p-4 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex -space-x-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="w-8 h-8 rounded-full border-2 border-background bg-white/10 flex items-center justify-center overflow-hidden">
										<img
											src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
											alt="User"
											className="w-full h-full object-cover"
										/>
									</div>
								))}
								<div className="w-8 h-8 rounded-full border-2 border-background bg-brand-primary flex items-center justify-center text-[10px] font-black text-black">
									+20k
								</div>
							</div>
							<div className="space-y-0.5">
								<p className="text-xs font-black text-white uppercase tracking-tighter">
									Join with 20k+ Users!
								</p>
								<p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
									Let's see our happy customer
								</p>
							</div>
						</div>
						<div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group hover:bg-white/10 transition-all cursor-pointer">
							<ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:rotate-[-45deg] transition-all" />
						</div>
					</GlassCard>
				</div>

				{/* Right Side - Hero */}
				<GlassCard className="hidden lg:flex relative overflow-hidden p-12 flex-col justify-between border-none bg-gradient-to-br from-brand-primary to-brand-dark">
					<div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
						<div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-[120px]" />
						<div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-black rounded-full blur-[80px]" />
					</div>

					<div className="relative z-10 space-y-6">
						<h2 className="text-6xl font-black text-white/20 tracking-tighter leading-none uppercase">
							{heroTitle}
						</h2>
						<p className="text-white/60 text-lg font-bold max-w-md leading-relaxed">
							{heroSubtitle}
						</p>
					</div>

					<div className="relative z-10">
						<div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
							<div className="flex items-center justify-between">
								<div className="w-12 h-1 bg-white/20 rounded-full" />
								<div className="flex gap-2">
									<div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center">
										<ArrowRight className="w-4 h-4 text-white rotate-180" />
									</div>
									<div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
										<ArrowRight className="w-4 h-4 text-white" />
									</div>
								</div>
							</div>
							<p className="text-white text-sm font-medium leading-relaxed">
								{heroFloatingText}
							</p>
						</div>
					</div>
				</GlassCard>
			</motion.div>
		</div>
	);
}
