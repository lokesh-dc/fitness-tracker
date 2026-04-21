"use client";

import Link from "next/link";
import {
	Dumbbell,
	CheckCircle2,
	Trophy,
	Star,
	ArrowRight,
} from "lucide-react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef } from "react";

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
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	});

	const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
	const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

	return (
		<div ref={containerRef} className="flex flex-col min-h-screen bg-[#000000] text-white selection:bg-brand-primary selection:text-black font-sans">
			{/* Header */}
			<header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
				<div className="flex items-center gap-2">
					<div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
						<Dumbbell className="text-black w-6 h-6" />
					</div>
					<span className="text-xl font-black uppercase tracking-tighter">Peak<span className="text-brand-primary">Track</span></span>
				</div>

				<nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
					{/* <Link href="#" className="hover:text-brand-primary transition-colors text-white">Home</Link> */}
					{/* <Link href="#" className="hover:text-brand-primary transition-colors">About</Link> */}
					{/* <Link href="#" className="hover:text-brand-primary transition-colors">Feature</Link> */}
					{/* <Link href="#" className="hover:text-brand-primary transition-colors">Blog</Link> */}
					{/* <Link href="#" className="hover:text-brand-primary transition-colors">Contact</Link> */}
				</nav>

				<div className="flex items-center gap-4">
					<Link href="/auth/signin" className="text-[11px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-full hover:bg-white/5 transition-colors">Log In</Link>
					<Link href="/auth/signup" className="text-[11px] font-black uppercase tracking-[0.2em] bg-white text-black px-6 py-3 rounded-full hover:bg-brand-primary transition-colors">Sign Up</Link>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative pt-40 pb-20 overflow-hidden min-h-screen flex flex-col items-center">
				{/* Animated Background Elements */}
				<div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px]" />
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-brand-primary/5 blur-[120px] rounded-full -z-10" />

				<motion.div
					initial="hidden"
					animate="visible"
					variants={containerVariants}
					className=" mx-auto px-6 text-center space-y-10 relative z-10"
				>
					<motion.h1
						variants={itemVariants}
						className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] uppercase text-balance"
					>
						Where Fitness Meets <br />
						<span className="text-brand-primary">Smart Performance</span> Tracking
					</motion.h1>


					{/* Visual Composition */}
					<motion.div
						variants={itemVariants}
						className="relative mt-20 perspective-1000 flex justify-center h-[500px] md:h-[600px] w-full"
					>
						{/* Pillars Design */}
						<div className="absolute inset-0 flex items-end justify-center gap-2 md:gap-4 -z-10 pb-20 w-full px-4 md:px-12">
							<motion.div 
								initial={{ height: 0 }}
								animate={{ height: "60%" }}
								transition={{ duration: 1, delay: 0.5 }}
								className="flex-1 max-w-[350px] bg-gradient-to-t from-brand-primary/20 to-brand-primary/5 rounded-t-3xl rounded-b-xl"
							/>
							<motion.div 
								initial={{ height: 0 }}
								animate={{ height: "90%" }}
								transition={{ duration: 1, delay: 0.7 }}
								className="flex-1 max-w-[350px] bg-gradient-to-t from-brand-primary/40 to-brand-primary/10 rounded-t-3xl rounded-b-xl"
							/>
							<motion.div 
								initial={{ height: 0 }}
								animate={{ height: "70%" }}
								transition={{ duration: 1, delay: 0.9 }}
								className="flex-1 max-w-[350px] bg-gradient-to-t from-brand-primary/20 to-brand-primary/5 rounded-t-3xl rounded-b-xl"
							/>
						</div>

						{/* Floating Phone */}
						<motion.div
							initial={{ opacity: 0, y: 100, rotateX: 20 }}
							animate={{ opacity: 1, y: 0, rotateX: 15 }}
							transition={{ duration: 1.2, ease: "easeOut", delay: 1 }}
							whileHover={{ y: -20, rotateX: 10 }}
							className="relative overflow-hidden"
						>
							{/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20" /> */}
							<img src="/629shots_so.png" alt="App Preview" className="w-full h-full object-cover grayscale-[0.2]" />
							{/* <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 via-transparent to-transparent pointer-events-none" /> */}
						</motion.div>
					</motion.div>

					{/* Bottom Info Bar */}
					<motion.div
						variants={itemVariants}
						className="flex flex-col md:flex-row items-center justify-between gap-12 pt-10 border-t border-white/5"
					>
						<div className="max-w-xs text-left">
							<p className="text-white/50 text-sm font-medium leading-relaxed">
								Track your performance, monitor your health, and stay motivated with a smarter fitness experience.
							</p>
						</div>

						<div className="flex items-center gap-6">
							<div className="flex -space-x-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-zinc-800 overflow-hidden">
										<img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover" />
									</div>
								))}
							</div>
							<div className="text-left">
								<div className="flex gap-1 mb-1">
									{[1, 2, 3, 4, 5].map((s) => (
										<Star key={s} className="w-4 h-4 fill-brand-primary text-brand-primary" />
									))}
								</div>
								<p className="text-sm font-black">5/4.7 <span className="text-white/30 font-medium ml-1">from 500K+ reviews</span></p>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</section>

			{/* Brand Logos */}
			<section className="py-20 border-y border-white/5">
				<div className="max-w-7xl mx-auto px-6 overflow-hidden">
					<motion.div
						animate={{ x: [0, -1000] }}
						transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
						className="flex items-center gap-20 whitespace-nowrap opacity-30"
					>
						{Array.from({ length: 12 }).map((_, i) => (
							<div key={i} className="flex items-center gap-2 text-2xl font-black italic tracking-tighter uppercase">
								<Trophy className="w-6 h-6" />
								<span>LogoIpsum</span>
							</div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Feature Section Placeholder */}
			<section className="py-32 px-6">
				<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
					<FeatureCard
						icon={<Trophy />}
						title="Personal Records"
						desc="Automatically track your 1RMs and rep maxes for every exercise."
					/>
					<FeatureCard
						icon={<CheckCircle2 />}
						title="Smart Planning"
						desc="Design cycles with progressive overload built-in automatically."
					/>
					<FeatureCard
						icon={<Dumbbell />}
						title="Elite Training"
						desc="Used by powerlifters and bodybuilders who demand precision."
					/>
				</div>
			</section>

			<footer className="py-20 border-t border-white/5 text-center">
				<p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">
					&copy; 2026 PeakTrack &bull; Precision Engineered
				</p>
			</footer>
		</div>
	);
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
	return (
		<motion.div
			whileHover={{ y: -10 }}
			className="p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-brand-primary/20 transition-all group"
		>
			<div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-6 group-hover:bg-brand-primary group-hover:text-black transition-colors">
				{icon}
			</div>
			<h3 className="text-xl font-black uppercase mb-3">{title}</h3>
			<p className="text-white/40 text-sm leading-relaxed">{desc}</p>
		</motion.div>
	);
}
