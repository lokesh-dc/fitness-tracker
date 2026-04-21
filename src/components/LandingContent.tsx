"use client";

import Link from "next/link";
import {
	Dumbbell,
	CheckCircle2,
	Trophy,
	ArrowRight,
	Timer,
	Zap,
	LineChart,
	Plus,
	Play,
	ShieldCheck,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.8,
			ease: [0.25, 1, 0.5, 1],
		},
	},
};

export function LandingContent() {
	return (
		<div className="flex flex-col min-h-screen bg-[#0d0d0d] text-[#f0f0f0] selection:bg-brand-primary selection:text-black font-sans">
			{/* Navigation */}
			<nav className="flex items-center justify-between px-8 py-5 border-b border-white/5 sticky top-0 z-50 bg-[#0d0d0d]/80 backdrop-blur-md">
				<div className="text-lg font-bold text-brand-primary tracking-tight">PeakTrack</div>
				<div className="hidden md:flex gap-6 text-[13px] text-white/50">
					<a href="#features" className="hover:text-brand-primary transition-colors">Features</a>
					<a href="#how-it-works" className="hover:text-brand-primary transition-colors">How it works</a>
					<a href="#analytics" className="hover:text-brand-primary transition-colors">Analytics</a>
				</div>
				<Link href="/auth/signup">
					<button className="bg-brand-primary text-white text-[13px] font-medium border-none rounded-md px-4 py-1.5 cursor-pointer hover:bg-brand-primary/90 transition-colors">
						Start for free
					</button>
				</Link>
			</nav>

			{/* Hero Section */}
			<header className="px-8 pt-20 pb-16 text-center relative overflow-hidden">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={containerVariants}
					className="max-w-4xl mx-auto space-y-7 relative z-10"
				>
					<motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-[12px] px-3 py-1 rounded-full mx-auto">
						<div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></div>
						Built for the gym floor
					</motion.div>

					<motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] text-white">
						Track lifts.<br />
						<span className="text-brand-primary font-bold">Break PRs.</span><br />
						Not your flow.
					</motion.h1>

					<motion.p variants={itemVariants} className="text-[17px] text-white/50 max-w-md mx-auto leading-relaxed">
						A serious training log for serious lifters. Plan your sessions, track every set, and watch your strength grow — all without breaking a sweat on the UX.
					</motion.p>

					<motion.div variants={itemVariants} className="flex gap-3 justify-center items-center">
						<Link href="/auth/signup">
							<button className="bg-brand-primary text-white text-[14px] font-medium px-6 py-2.5 rounded-lg hover:bg-brand-primary/90 transition-all active:scale-95 shadow-lg shadow-brand-primary/20">
								Start tracking free
							</button>
						</Link>
						<button className="bg-transparent text-white/60 text-[14px] border border-white/15 px-6 py-2.5 rounded-lg hover:bg-white/5 transition-all">
							See a demo
						</button>
					</motion.div>
				</motion.div>
			</header>

			{/* Preview Section */}
			<section className="px-8 max-w-6xl mx-auto w-full">
				<div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 md:p-8">
					<div className="flex gap-2 mb-6">
						<div className="w-2 h-2 rounded-full bg-white/15"></div>
						<div className="w-2 h-2 rounded-full bg-white/15"></div>
						<div className="w-2 h-2 rounded-full bg-white/15"></div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-white/5 border border-white/10 rounded-xl p-4">
							<div className="text-[10px] text-white/35 uppercase tracking-widest mb-1.5 font-bold">Session volume</div>
							<div className="text-2xl font-bold text-brand-primary">8,420</div>
							<div className="text-[11px] text-white/30 mt-1">kg moved today</div>
						</div>

						<div className="bg-white/5 border border-white/10 rounded-xl p-4 font-bold">
							<div className="text-[10px] text-white/35 uppercase tracking-widest mb-1.5">Rest timer</div>
							<div className="text-2xl text-white">2:30</div>
							<div className="text-[11px] text-white/30 mt-1">auto-started</div>
						</div>

						<div className="bg-white/5 border border-white/10 rounded-xl p-4 font-bold">
							<div className="text-[10px] text-white/35 uppercase tracking-widest mb-1.5">PRs today</div>
							<div className="text-2xl text-brand-primary">3</div>
							<div className="text-[11px] text-white/30 mt-1">Bench / Squat / OHP</div>
						</div>

						<div className="md:col-span-3 bg-white/[0.03] border border-white/10 rounded-xl p-4">
							<div className="text-[11px] text-white/35 uppercase tracking-widest mb-4 font-bold">Bench press — max weight (6 months)</div>
							<div className="flex items-end gap-1.5 h-16 mb-4">
								<div className="flex-1 rounded-t-sm bg-brand-primary/15" style={{ height: '35%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/15" style={{ height: '45%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/15" style={{ height: '40%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/15" style={{ height: '55%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/20" style={{ height: '60%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/15" style={{ height: '50%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/15" style={{ height: '65%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/15" style={{ height: '70%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/20" style={{ height: '75%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/15" style={{ height: '68%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/15" style={{ height: '80%' }}></div>
								<div className="flex-1 rounded-t-sm bg-brand-primary/30" style={{ height: '90%' }}></div>
							</div>
							<div className="flex items-center gap-2 mt-2">
								<div className="w-2 h-2 bg-brand-primary rounded-full border border-black"></div>
								<div className="h-[2px] flex-1 bg-gradient-to-r from-brand-primary to-orange-400 rounded-full"></div>
								<div className="w-2 h-2 bg-brand-primary rounded-full border border-black"></div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<div className="h-[1px] bg-white/5 my-16 mx-8"></div>

			{/* Features Section */}
			<section id="features" className="px-8 pb-16 max-w-6xl mx-auto w-full">
				<div className="space-y-3 mb-10">
					<div className="text-brand-primary text-[12px] uppercase tracking-widest font-bold">Core features</div>
					<h2 className="text-3xl font-medium text-white leading-tight tracking-tight">Everything a serious<br />lifter actually needs</h2>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<FeatureCard
						icon={<Timer className="w-4 h-4 text-brand-primary" />}
						title="Auto rest timer"
						desc="Starts automatically after every set. No tapping around between heavy sets."
					/>
					<FeatureCard
						icon={<Zap className="w-4 h-4 text-brand-primary" />}
						title="Live PR detection"
						desc="Instant notification the moment you break a personal record, mid-session."
					/>
					<FeatureCard
						icon={<Plus className="w-4 h-4 text-brand-primary" />}
						title="Warm-up generator"
						desc="Rep-aware warm-up sets auto-calculated from your working weight."
					/>
					<FeatureCard
						icon={<Play className="w-4 h-4 text-brand-primary" />}
						title="Plan designer"
						desc="Build multi-week training plans with custom exercises per day."
					/>
					<FeatureCard
						icon={<LineChart className="w-4 h-4 text-brand-primary" />}
						title="PR timeline"
						desc="Per-exercise progress charts with max weight, estimated 1RM, and volume."
					/>
					<FeatureCard
						icon={<ShieldCheck className="w-4 h-4 text-brand-primary" />}
						title="Quick log"
						desc="One tap to repeat your last session as a starting template."
					/>
				</div>
			</section>

			<div className="h-[1px] bg-white/5 mx-8"></div>

			{/* How it Works Section */}
			<section id="how-it-works" className="px-8 py-16 max-w-6xl mx-auto w-full">
				<div className="space-y-3 mb-10">
					<div className="text-brand-primary text-[12px] uppercase tracking-widest font-bold">How it works</div>
					<h2 className="text-3xl font-medium text-white leading-tight tracking-tight">Plan. Train. Grow.</h2>
				</div>

				<div className="border border-white/10 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
					<div className="p-7 space-y-4">
						<div className="text-4xl font-medium text-brand-primary/20">01</div>
						<h3 className="text-[16px] font-medium text-white">Design your program</h3>
						<p className="text-[13px] text-white/40 leading-relaxed">Build a multi-week plan with specific exercises, sets, and target reps for each training day.</p>
					</div>
					<div className="p-7 space-y-4">
						<div className="text-4xl font-medium text-brand-primary/20">02</div>
						<h3 className="text-[16px] font-medium text-white">Execute in the gym</h3>
						<p className="text-[13px] text-white/40 leading-relaxed">Log sets as you go. Rest timer auto-runs. PRs get flagged the second you hit them.</p>
					</div>
					<div className="p-7 space-y-4">
						<div className="text-4xl font-medium text-brand-primary/20">03</div>
						<h3 className="text-[16px] font-medium text-white">Track your progress</h3>
						<p className="text-[13px] text-white/40 leading-relaxed">Watch your strength curve climb over weeks. Spot plateaus. Know what's actually working.</p>
					</div>
				</div>
			</section>

			<div className="h-[1px] bg-white/5 mx-8"></div>

			{/* Stats Row */}
			<section className="px-8 py-16 max-w-6xl mx-auto w-full">
				<div className="grid grid-cols-3 divide-x divide-white/10 border border-white/10 rounded-2xl overflow-hidden">
					<div className="py-7 px-4 text-center">
						<div className="text-3xl font-medium text-brand-primary">100K+</div>
						<div className="text-[11px] text-white/35 uppercase tracking-widest mt-1">Sets logged</div>
					</div>
					<div className="py-7 px-4 text-center">
						<div className="text-3xl font-medium text-brand-primary">8,400+</div>
						<div className="text-[11px] text-white/35 uppercase tracking-widest mt-1">PRs tracked</div>
					</div>
					<div className="py-7 px-4 text-center">
						<div className="text-3xl font-medium text-brand-primary">2,100+</div>
						<div className="text-[11px] text-white/35 uppercase tracking-widest mt-1">Sessions completed</div>
					</div>
				</div>
			</section>

			<div className="h-[1px] bg-white/5 mx-8"></div>

			{/* AI Banner Section */}
			<section className="px-8 py-16 max-w-6xl mx-auto w-full">
				<div className="bg-brand-primary/[0.03] border border-brand-primary/15 rounded-2xl p-7 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
					<div className="flex-1 space-y-5">
						<div className="inline-flex bg-brand-primary/15 text-brand-primary text-[11px] font-bold px-2.5 py-1 rounded-full">Coming soon</div>
						<h3 className="text-2xl font-medium text-white">Your AI training coach</h3>
						<p className="text-[13px] text-white/40 leading-relaxed max-w-md">After every session, get a debrief on what went well, what PRs you hit, and what to focus on next time. Based on your actual data — not generic advice.</p>
						<div className="flex flex-wrap gap-2">
							<span className="text-[11px] text-white/50 bg-white/5 border border-white/10 rounded-full px-3 py-1">Session debrief</span>
							<span className="text-[11px] text-white/50 bg-white/5 border border-white/10 rounded-full px-3 py-1">Program generator</span>
							<span className="text-[11px] text-white/50 bg-white/5 border border-white/10 rounded-full px-3 py-1">Weekly check-in</span>
						</div>
					</div>

					<div className="w-full md:w-[180px] flex-shrink-0">
						<div className="bg-brand-primary/[0.06] border border-brand-primary/15 rounded-xl p-5 text-center">
							<div className="text-[10px] text-white/30 mb-2.5 uppercase font-bold">Session debrief</div>
							<div className="text-[12px] text-white/60 leading-relaxed font-medium italic">"Great bench session. 3 PRs hit. Push volume is up 12% this week."</div>
							<div className="mt-4 h-[1px] bg-brand-primary/20 w-full"></div>
							<div className="text-[10px] text-brand-primary font-bold mt-3 uppercase tracking-tighter">Powered by PeakAI</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-8 py-20 text-center border-t border-white/5">
				<div className="max-w-md mx-auto space-y-8">
					<h2 className="text-4xl font-medium text-white leading-tight tracking-tight">Ready to actually<br />track your progress?</h2>
					<p className="text-[15px] text-white/40">Free to use. No fluff. Built for lifters who are serious about getting stronger.</p>
					<div className="space-y-4">
						<Link href="/auth/signup">
							<button className="bg-brand-primary text-white text-[15px] font-medium px-10 py-3 rounded-lg hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20">
								Create your account
							</button>
						</Link>
						<div className="text-[12px] text-white/25">No credit card required</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="flex items-center justify-between px-8 py-5 border-t border-white/5 bg-[#0d0d0d]">
				<div className="text-[13px] text-white/30">FitTrack</div>
				<div className="flex gap-5 text-[12px] text-white/25">
					<a href="#" className="hover:text-white transition-colors">Privacy</a>
					<a href="#" className="hover:text-white transition-colors">Terms</a>
					<a href="#" className="hover:text-white transition-colors">GitHub</a>
				</div>
			</footer>
		</div>
	);
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
	return (
		<div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand-primary/30 transition-all group">
			<div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
				{icon}
			</div>
			<h3 className="text-[14px] font-medium text-white mb-2">{title}</h3>
			<p className="text-[13px] text-white/40 leading-relaxed">{desc}</p>
		</div>
	);
}
