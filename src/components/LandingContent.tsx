"use client";

import { useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Barlow, Space_Grotesk } from "next/font/google";
import {
	Trophy,
	Timer,
	TriangleAlert,
	CalendarRange,
	Flame,
	LineChart,
	ArrowRight,
	Check,
} from "lucide-react";
import { motion, MotionConfig, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const bodyFont = Barlow({
	weight: ["400", "500", "600"],
	subsets: ["latin"],
	variable: "--font-barlow",
	display: "swap",
});

const displayFont = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-grotesk",
	display: "swap",
});

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.09,
			delayChildren: 0.12,
		},
	},
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.75,
			ease: [0.25, 1, 0.5, 1],
		},
	},
};

const benchSeries = [72.5, 75, 75, 77.5, 77.5, 77.5, 80, 80, 82.5, 82.5, 85, 87.5];
const CHART_W = 640;
const CHART_H = 180;
const CHART_BASELINE = 158;

function chartX(index: number): number {
	return 16 + (index * (CHART_W - 32)) / (benchSeries.length - 1);
}

function chartY(value: number): number {
	return 24 + (1 - (value - 70) / 20) * 126;
}

const linePath = benchSeries
	.map((value, index) => `${index === 0 ? "M" : "L"}${chartX(index).toFixed(1)},${chartY(value).toFixed(1)}`)
	.join(" ");

const areaPath = `${linePath} L${chartX(benchSeries.length - 1).toFixed(1)},${CHART_BASELINE} L${chartX(0).toFixed(1)},${CHART_BASELINE} Z`;

interface Problem {
	problem: string;
	detail: string;
	fix: string;
}

const problems: Problem[] = [
	{
		problem: "You forget what you lifted",
		detail: "The notes app scrolled past it, the whiteboard photo is from March, and last week's bench weight is a guess.",
		fix: "Every exercise opens with your last session and your current PRs, so the numbers to beat are on screen before the first rep.",
	},
	{
		problem: "Rest times drift",
		detail: "A quick 90 seconds turns into three minutes of scrolling, and the next set starts cold.",
		fix: "The timer starts itself the moment a set is logged and counts down to the next one — adjustable per exercise.",
	},
	{
		problem: "Plateaus happen silently",
		detail: "The lift sits at 80 kg for a month and nothing in your workflow says so.",
		fix: "If weight and reps haven't moved in three weeks, the plateau alert fires mid-session, while there's still a set left to adjust.",
	},
	{
		problem: "PRs pass without notice",
		detail: "A 5 kg jump on deadlift happens and the notebook doesn't care.",
		fix: "Two PR types — heavier weight, or the same weight for more reps — are detected live and called out the moment they land.",
	},
	{
		problem: "The program lives in three places",
		detail: "The split is in a notes app, the sets are in a spreadsheet, and the progress is nowhere.",
		fix: "Multi-week blocks, drag-and-drop splits and warm-up math live in the same document as the log they produce.",
	},
];

interface Step {
	title: string;
	body: string;
}

const steps: Step[] = [
	{
		title: "Design the block",
		body: "Drag training days into a multi-week split, add exercises with sets and target reps, and the warm-up ladder calculates itself from your working weight.",
	},
	{
		title: "Train, don't transcribe",
		body: "Open the session and tap each set as it's done. The rest timer runs itself while last week's numbers sit beside the current ones.",
	},
	{
		title: "Read the signal",
		body: "Finish and get the debrief: volume, estimated 1RM, PRs hit. Timelines and muscle heatmaps show what is actually moving.",
	},
];

export function LandingContent({ autoLoginDemo }: { autoLoginDemo?: boolean }) {
	useEffect(() => {
		if (autoLoginDemo) {
			signIn("demo", { email: "demo@fittrack.app", callbackUrl: "/dashboard" });
		}
	}, [autoLoginDemo]);

	const openDemo = () => {
		signIn("demo", { email: "demo@fittrack.app", callbackUrl: "/dashboard" });
	};

	return (
		<MotionConfig reducedMotion="user">
			<div
				className={cn(
					"dark relative flex min-h-screen flex-col bg-background text-foreground selection:bg-brand-primary selection:text-black",
					bodyFont.variable,
					displayFont.variable,
					"font-[family-name:var(--font-barlow)]",
				)}
			>
				<a
					href="#main"
					className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-black"
				>
					Skip to content
				</a>

				{/* Navigation */}
				<nav className="sticky top-0 z-50 border-b border-foreground/10 bg-background/85 backdrop-blur-xl">
					<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-8">
						<Link
							href="/"
							className="font-display text-[15px] font-bold tracking-tight"
						>
							TRAK<span className="text-brand-primary">.FIT</span>
						</Link>
						<div className="hidden items-center gap-7 text-[13px] text-foreground/55 md:flex">
							<a href="#why" className="transition-colors hover:text-foreground">
								Why we built it
							</a>
							<a href="#problems" className="transition-colors hover:text-foreground">
								What it fixes
							</a>
							<a href="#how" className="transition-colors hover:text-foreground">
								How it works
							</a>
							<a href="#features" className="transition-colors hover:text-foreground">
								Features
							</a>
						</div>
						<div className="flex items-center gap-4">
							<Link
								href="/auth/signin"
								className="hidden text-[13px] font-medium text-foreground/55 transition-colors hover:text-foreground sm:block"
							>
								Sign in
							</Link>
							<Link
								href="/auth/signup"
								className="rounded-lg bg-brand-primary px-4 py-2 text-[13px] font-semibold text-black transition-all hover:bg-brand-primary/90 active:scale-95"
							>
								Start for free
							</Link>
						</div>
					</div>
				</nav>

				<main id="main">
					{/* Hero — what it is */}
					<section className="relative overflow-hidden px-6 pb-20 pt-14 md:px-8 md:pb-24 md:pt-20">
						<div aria-hidden className="landing-grid absolute inset-0" />
						<div aria-hidden className="landing-glow absolute inset-0" />
						<div className="relative mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-12 lg:gap-12">
							<motion.div
								initial="hidden"
								animate="visible"
								variants={containerVariants}
								className="lg:col-span-7"
							>
								<motion.div variants={itemVariants}>
									<SectionLabel>Workout log · built for progressive overload</SectionLabel>
								</motion.div>

								<motion.h1
									variants={itemVariants}
									className="mt-7 font-display text-balance text-[clamp(2.5rem,6.5vw,4.5rem)] font-bold leading-[1.03] tracking-[-0.035em]"
								>
									Track every set.
									<br />
									Catch every PR.
								</motion.h1>

								<motion.p
									variants={itemVariants}
									className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-foreground/60"
								>
									TRAK.FIT is a training log for lifters who care about progress, not just
									activity. Plan your blocks, log sets between rests, and get told the moment a
									number beats your last one.
								</motion.p>

								<motion.div variants={itemVariants} className="mt-9 flex flex-wrap items-center gap-6">
									<Link
										href="/auth/signup"
										className="rounded-xl bg-brand-primary px-7 py-3 text-[14px] font-semibold text-black shadow-xl shadow-brand-primary/15 transition-all hover:bg-brand-primary/90 active:scale-[0.98]"
									>
										Start tracking free
									</Link>
									<button
										type="button"
										onClick={openDemo}
										className="group inline-flex items-center gap-2 text-[14px] font-medium text-foreground/65 transition-colors hover:text-foreground"
									>
										Try the live demo
										<ArrowRight
											aria-hidden
											className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
										/>
									</button>
								</motion.div>

								<motion.p variants={itemVariants} className="mt-6 text-[12.5px] text-foreground/40">
									Free to use · No credit card · Sample data if you just want to look around
								</motion.p>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.85, delay: 0.35, ease: [0.25, 1, 0.5, 1] }}
								className="lg:col-span-5"
							>
								<div className="noise-overlay rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.9)]">
									<div className="flex items-baseline justify-between gap-4">
										<div>
											<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
												Push day
											</div>
											<div className="mt-1 text-[13px] font-semibold">
												Week 3 of 6 · Bench press 4×5
											</div>
										</div>
										<div className="text-[12px] tabular-nums text-foreground/40">0:47:12</div>
									</div>

									<div className="mt-4 space-y-1.5">
										<div className="grid grid-cols-3 items-center rounded-lg border border-foreground/10 bg-background/70 px-3 py-2.5 text-[13px] tabular-nums">
											<span className="text-foreground/45">Set 2</span>
											<span className="text-center font-semibold">80 kg × 5</span>
											<span className="flex items-center justify-end gap-1 text-[11px] font-semibold text-foreground/35">
												<Check aria-hidden className="h-3 w-3" /> Done
											</span>
										</div>
										<div className="grid grid-cols-3 items-center rounded-lg border border-brand-primary/40 bg-brand-primary/[0.07] px-3 py-2.5 text-[13px] tabular-nums">
											<span className="text-foreground/60">Set 3</span>
											<span className="text-center font-semibold">80 kg × 5</span>
											<span className="text-right text-[11px] font-bold uppercase tracking-wide text-brand-primary">
												Weight PR
											</span>
										</div>
										<div className="grid grid-cols-3 items-center rounded-lg border border-foreground/10 bg-background/70 px-3 py-2.5 text-[13px] tabular-nums">
											<span className="text-foreground/45">Set 4</span>
											<span className="text-center font-semibold text-foreground/60">80 kg × 5</span>
											<span className="text-right text-[11px] font-semibold uppercase text-foreground/30">
												Next
											</span>
										</div>
									</div>

									<div className="mt-4 rounded-xl border border-foreground/10 bg-background/70 p-4">
										<div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-[0.16em] text-foreground/40">
											<span>Rest timer</span>
											<span className="tabular-nums text-brand-primary">1:47</span>
										</div>
										<div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-foreground/10">
											<motion.div
												className="h-full origin-left rounded-full bg-brand-primary"
												initial={{ scaleX: 0.3 }}
												animate={{ scaleX: 1 }}
												transition={{
													duration: 5,
													repeat: Infinity,
													repeatType: "reverse",
													ease: "easeInOut",
												}}
											/>
										</div>
										<div className="mt-3 text-[12px] text-foreground/45">
											Next up · Incline DB press · 24 kg × 8
										</div>
									</div>
								</div>
							</motion.div>
						</div>
					</section>

					{/* Why it was built */}
					<section
						id="why"
						className="scroll-mt-24 border-t border-foreground/10 px-6 py-20 md:px-8 md:py-28"
					>
						<div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-12 lg:gap-14">
							<Reveal className="lg:col-span-5">
								<SectionLabel>Why we built it</SectionLabel>
								<h2 className="mt-6 font-display text-balance text-[clamp(1.85rem,3.6vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em]">
									Progress dies in a notes app.
								</h2>
								<div className="mt-6 max-w-[52ch] space-y-4 text-[15px] leading-relaxed text-foreground/60">
									<p>
										Most lifters track in whatever is closest: Notes, a spreadsheet, a photo of
										a whiteboard. Three weeks later the numbers are gone, last session&apos;s
										weights are a guess, and nobody notices the bench press has been stuck at
										80&nbsp;kg since March.
									</p>
									<p>
										TRAK.FIT exists to answer one question precisely — are you getting stronger?
										Everything else in the app, from the rest timer to the heatmaps, exists to
										keep that record accurate with as little typing as possible.
									</p>
								</div>
								<blockquote className="mt-8 border-l-2 border-brand-primary pl-5 text-[15px] leading-relaxed text-foreground/70">
									A log you maintain between sets, not one you reconstruct at home.
								</blockquote>
							</Reveal>

							<Reveal delay={0.12} className="lg:col-span-7">
								<div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5 md:p-7">
									<div className="flex flex-wrap items-baseline justify-between gap-3">
										<div>
											<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
												Bench press · estimated max
											</div>
											<div className="mt-1.5 font-display text-[28px] font-bold tabular-nums">87.5 kg</div>
										</div>
										<div className="rounded-md border border-brand-primary/30 bg-brand-primary/10 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-brand-primary">
											+15 kg over 6 months
										</div>
									</div>

									<svg
										viewBox={`0 0 ${CHART_W} ${CHART_H}`}
										role="img"
										aria-label="Bench press estimated max rising from 72.5 kg to 87.5 kg over six months, with a three-week plateau that triggered an alert"
										className="mt-5 h-auto w-full overflow-visible"
									>
										<line
											x1={CHART_W - 32}
											y1={20}
											x2={CHART_W - 32}
											y2={CHART_BASELINE}
											className="stroke-foreground/10"
											strokeDasharray="3 5"
										/>
										<path d={areaPath} className="fill-brand-primary/10" />
										<motion.path
											d={linePath}
											fill="none"
											className="stroke-brand-primary"
											strokeWidth={2.5}
											strokeLinecap="round"
											strokeLinejoin="round"
											initial={{ pathLength: 0 }}
											whileInView={{ pathLength: 1 }}
											viewport={{ once: true, margin: "-80px" }}
											transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1] }}
										/>

										<line
											x1={chartX(3)}
											y1={chartY(77.5) - 14}
											x2={chartX(5)}
											y2={chartY(77.5) - 14}
											className="stroke-foreground/30"
											strokeWidth={1.5}
										/>
										<line
											x1={chartX(3)}
											y1={chartY(77.5) - 14}
											x2={chartX(3)}
											y2={chartY(77.5) - 6}
											className="stroke-foreground/30"
											strokeWidth={1.5}
										/>
										<line
											x1={chartX(5)}
											y1={chartY(77.5) - 14}
											x2={chartX(5)}
											y2={chartY(77.5) - 6}
											className="stroke-foreground/30"
											strokeWidth={1.5}
										/>
										<text
											x={(chartX(3) + chartX(5)) / 2}
											y={chartY(77.5) - 24}
											textAnchor="middle"
											className="fill-foreground/45 text-[10.5px] font-medium"
										>
											3 weeks flat → flagged mid-session
										</text>

										<circle cx={chartX(11)} cy={chartY(87.5)} r={4.5} className="fill-brand-primary" />
										<circle
											cx={chartX(11)}
											cy={chartY(87.5)}
											r={9}
											className="stroke-brand-primary/40"
											strokeWidth={1.5}
											fill="none"
										/>

										<text x={16} y={CHART_H - 4} className="fill-foreground/30 text-[10.5px]">
											6 months ago
										</text>
										<text
											x={CHART_W - 16}
											y={CHART_H - 4}
											textAnchor="end"
											className="fill-foreground/30 text-[10.5px]"
										>
											this week
										</text>
									</svg>

									<div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-foreground/10 pt-4 text-[12px] text-foreground/45">
										<span className="inline-flex items-center gap-2">
											<span aria-hidden className="h-2 w-2 rounded-full bg-brand-primary" />
											Weight PR · every rep above your old max counts
										</span>
										<span className="inline-flex items-center gap-2">
											<span aria-hidden className="h-2 w-2 rounded-full bg-foreground/30" />
											Rep PR · same weight, more reps than before
										</span>
									</div>
								</div>
							</Reveal>
						</div>
					</section>

					{/* Problems it solves */}
					<section
						id="problems"
						className="scroll-mt-24 border-t border-foreground/10 px-6 py-20 md:px-8 md:py-28"
					>
						<div className="mx-auto w-full max-w-6xl">
							<Reveal>
								<SectionLabel>What it fixes</SectionLabel>
								<h2 className="mt-6 max-w-[20ch] font-display text-balance text-[clamp(1.85rem,3.6vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em]">
									Five ways strength tracking breaks down
								</h2>
							</Reveal>

							<div className="mt-12">
								<div className="hidden grid-cols-2 gap-x-12 border-b border-foreground/10 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/35 md:grid">
									<span>The problem</span>
									<span>What runs instead</span>
								</div>
								{problems.map((item, index) => (
									<Reveal key={item.problem} delay={index * 0.05}>
										<div className="grid grid-cols-1 gap-x-12 gap-y-3 border-b border-foreground/10 py-7 transition-colors md:grid-cols-2 md:hover:bg-foreground/[0.015]">
											<div>
												<h3 className="text-[17px] font-semibold tracking-[-0.01em]">
													{item.problem}
												</h3>
												<p className="mt-1.5 max-w-[46ch] text-[13.5px] leading-relaxed text-foreground/45">
													{item.detail}
												</p>
											</div>
											<p className="max-w-[52ch] border-l-2 border-brand-primary/50 pl-4 text-[14.5px] leading-relaxed text-foreground/70 md:border-l-0 md:pl-0">
												{item.fix}
											</p>
										</div>
									</Reveal>
								))}
							</div>
						</div>
					</section>

					{/* How it works */}
					<section
						id="how"
						className="scroll-mt-24 border-t border-foreground/10 px-6 py-20 md:px-8 md:py-28"
					>
						<div className="mx-auto w-full max-w-6xl">
							<Reveal>
								<SectionLabel>How it works</SectionLabel>
								<h2 className="mt-6 max-w-[22ch] font-display text-balance text-[clamp(1.85rem,3.6vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em]">
									Three steps, then it runs itself
								</h2>
							</Reveal>

							<div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
								{steps.map((step, index) => (
									<Reveal
										key={step.title}
										delay={index * 0.1}
										className={cn(index === 1 && "md:mt-16", index === 2 && "md:mt-32")}
									>
										<div className="border-t-2 border-brand-primary/40 pt-5">
											<div className="font-display text-[13px] font-bold tracking-[0.2em] text-brand-primary">
												{`0${index + 1}`}
											</div>
											<h3 className="mt-4 text-[19px] font-semibold tracking-[-0.01em]">
												{step.title}
											</h3>
											<p className="mt-3 max-w-[38ch] text-[14px] leading-relaxed text-foreground/55">
												{step.body}
											</p>
										</div>
									</Reveal>
								))}
							</div>
						</div>
					</section>

					{/* Features */}
					<section
						id="features"
						className="scroll-mt-24 border-t border-foreground/10 px-6 py-20 md:px-8 md:py-28"
					>
						<div className="mx-auto w-full max-w-6xl">
							<Reveal>
								<SectionLabel>What&apos;s inside</SectionLabel>
								<h2 className="mt-6 max-w-[24ch] font-display text-balance text-[clamp(1.85rem,3.6vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.025em]">
									Everything the log needs. Nothing it doesn&apos;t.
								</h2>
							</Reveal>

							<div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
								<Reveal className="sm:col-span-2 lg:col-span-4">
									<FeatureCard
										icon={<Trophy aria-hidden className="h-4 w-4 text-brand-primary" />}
										title="Two kinds of PR, caught live"
										desc="A weight PR and a rep PR are different achievements. Both are detected mid-session, materialized for O(1) lookup, and celebrated the moment they land."
									>
										<div className="mt-5 flex flex-wrap gap-2">
											<span className="rounded-md border border-brand-primary/30 bg-brand-primary/10 px-2.5 py-1 text-[11.5px] font-semibold tabular-nums text-brand-primary">
												Weight PR · 82.5 → 85 kg
											</span>
											<span className="rounded-md border border-foreground/15 bg-foreground/5 px-2.5 py-1 text-[11.5px] font-semibold tabular-nums text-foreground/60">
												Rep PR · 5 → 7 @ 82.5 kg
											</span>
										</div>
									</FeatureCard>
								</Reveal>

								<Reveal delay={0.08} className="lg:col-span-2">
									<FeatureCard
										icon={<Timer aria-hidden className="h-4 w-4 text-brand-primary" />}
										title="Rest timer that starts itself"
										desc="Set it once per exercise. It runs while you recover and gets out of the way when the next set starts."
									>
										<div className="mt-5 font-display text-[34px] font-bold leading-none tabular-nums text-foreground/80">
											1:47
										</div>
									</FeatureCard>
								</Reveal>

								<Reveal delay={0.04} className="lg:col-span-2">
									<FeatureCard
										icon={<Flame aria-hidden className="h-4 w-4 text-brand-primary" />}
										title="Warm-up ladder"
										desc="Rep-aware warm-up sets calculated from whatever is on the bar that day."
									>
										<div className="mt-5 space-y-1 text-[12.5px] tabular-nums text-foreground/50">
											<div>40 kg × 5</div>
											<div>60 kg × 3</div>
											<div>70 kg × 2</div>
											<div className="font-semibold text-foreground/80">100 kg × 5 · work set</div>
										</div>
									</FeatureCard>
								</Reveal>

								<Reveal delay={0.1} className="lg:col-span-2">
									<FeatureCard
										icon={<TriangleAlert aria-hidden className="h-4 w-4 text-brand-primary" />}
										title="Plateau alerts"
										desc="No movement in weight or reps for three weeks? The session says so while you still have sets left."
									>
										<div className="mt-5 rounded-md border border-brand-primary/30 bg-brand-primary/[0.07] px-3 py-2 text-[12px] font-medium text-brand-primary">
											OHP · flat for 3 weeks
										</div>
									</FeatureCard>
								</Reveal>

								<Reveal delay={0.14} className="lg:col-span-2">
									<FeatureCard
										icon={<CalendarRange aria-hidden className="h-4 w-4 text-brand-primary" />}
										title="Cycle architect"
										desc="Multi-week blocks with drag-and-drop training days, custom exercises, and target reps per slot."
									>
										<div className="mt-5 flex flex-wrap gap-1.5 text-[11px] font-semibold">
											<span className="rounded bg-brand-primary/15 px-2 py-1 text-brand-primary">Mon · Push</span>
											<span className="rounded bg-brand-primary/15 px-2 py-1 text-brand-primary">Tue · Pull</span>
											<span className="rounded bg-foreground/5 px-2 py-1 text-foreground/40">Wed · Rest</span>
											<span className="rounded bg-brand-primary/15 px-2 py-1 text-brand-primary">Thu · Legs</span>
										</div>
									</FeatureCard>
								</Reveal>

								<Reveal delay={0.06} className="sm:col-span-2 lg:col-span-6">
									<FeatureCard
										icon={<LineChart aria-hidden className="h-4 w-4 text-brand-primary" />}
										title="Timelines, 1RM, and muscle heatmaps"
										desc="Per-lift volume and estimated 1RM curves, bodyweight correlation, and a muscle-group breakdown that shows what you actually trained — not what you meant to."
									>
										<div className="mt-5 flex h-16 items-end gap-1.5" aria-hidden>
											{[34, 42, 38, 51, 47, 58, 55, 64, 60, 71, 77, 86].map((height, index) => (
												<div
													key={index}
													className="flex-1 rounded-sm bg-brand-primary/20"
													style={{ height: `${height}%` }}
												/>
											))}
										</div>
									</FeatureCard>
								</Reveal>
							</div>
						</div>
					</section>

					{/* Roadmap */}
					<section className="border-t border-foreground/10 px-6 py-16 md:px-8 md:py-20">
						<div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-12">
							<Reveal className="md:col-span-7">
								<SectionLabel>In development</SectionLabel>
								<h2 								className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-bold leading-tight tracking-[-0.02em]">
									A coach that reads your log
								</h2>
								<p className="mt-4 max-w-[54ch] text-[14.5px] leading-relaxed text-foreground/55">
									Session debriefs, program suggestions and weekly check-ins generated from your
									actual sets — not a template. This one is still being built; everything else on
									this page ships today.
								</p>
								<div className="mt-6 flex flex-wrap gap-2 text-[11.5px] text-foreground/50">
									<span className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1">
										Session debrief
									</span>
									<span className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1">
										Program generator
									</span>
									<span className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1">
										Weekly check-in
									</span>
								</div>
							</Reveal>
							<Reveal delay={0.1} className="md:col-span-5">
								<div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5">
									<div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/35">
										Planned debrief
									</div>
									<p className="mt-3 text-[13.5px] font-medium leading-relaxed text-foreground/65">
										&quot;Bench moved 2.5 kg this week and volume is up 12%. Keep the same load
										next session, then push for the rep PR.&quot;
									</p>
									<div className="mt-4 border-t border-foreground/10 pt-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-primary">
										Not shipped yet
									</div>
								</div>
							</Reveal>
						</div>
					</section>

					{/* Final CTA */}
					<section className="relative overflow-hidden border-t border-foreground/10 px-6 py-24 text-center md:px-8">
						<div aria-hidden className="landing-glow absolute inset-0" />
						<div className="relative mx-auto max-w-xl space-y-7">
							<h2 							className="font-display text-balance text-[clamp(1.9rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em]">
								Start with your next session.
							</h2>
							<p className="text-[15.5px] leading-relaxed text-foreground/55">
								The first workout takes two minutes to log. After that, the record keeps itself.
							</p>
							<div className="flex flex-wrap items-center justify-center gap-4">
								<Link
									href="/auth/signup"
									className="rounded-xl bg-brand-primary px-8 py-3.5 text-[14.5px] font-semibold text-black shadow-xl shadow-brand-primary/20 transition-all hover:bg-brand-primary/90 active:scale-[0.98]"
								>
									Create your account
								</Link>
								<button
									type="button"
									onClick={openDemo}
									className="rounded-xl border border-foreground/15 px-8 py-3.5 text-[14.5px] font-medium text-foreground/70 transition-all hover:border-foreground/30 hover:bg-foreground/5 active:scale-[0.98]"
								>
									Try the demo
								</button>
							</div>
							<p className="text-[12.5px] text-foreground/35">No credit card required</p>
						</div>
					</section>
				</main>

				{/* Footer */}
				<footer className="border-t border-foreground/10 px-6 py-10 md:px-8">
					<div className="mx-auto flex w-full max-w-6xl flex-col gap-7 md:flex-row md:items-center md:justify-between">
						<div>
							<div className="font-display text-[14px] font-bold tracking-tight">
								TRAK<span className="text-brand-primary">.FIT</span>
							</div>
							<p className="mt-1.5 text-[12.5px] text-foreground/40">
								Workout tracking for people who count reps, not steps.
							</p>
						</div>
						<nav className="flex flex-wrap gap-x-6 gap-y-2.5 text-[12.5px] text-foreground/45">
							<a href="#why" className="transition-colors hover:text-foreground">
								Why we built it
							</a>
							<a href="#problems" className="transition-colors hover:text-foreground">
								What it fixes
							</a>
							<a href="#how" className="transition-colors hover:text-foreground">
								How it works
							</a>
							<a href="#features" className="transition-colors hover:text-foreground">
								Features
							</a>
							<Link href="/auth/signin" className="transition-colors hover:text-foreground">
								Sign in
							</Link>
							<a
								href="https://github.com/lokesh-dc/fitness-tracker"
								target="_blank"
								rel="noreferrer"
								className="transition-colors hover:text-foreground"
							>
								GitHub
							</a>
						</nav>
						<div className="text-[12px] text-foreground/30">© 2026 TRAK.FIT</div>
					</div>
				</footer>
			</div>
		</MotionConfig>
	);
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				"flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary",
				className,
			)}
		>
			<span aria-hidden className="h-px w-8 bg-brand-primary/60" />
			{children}
		</div>
	);
}

function Reveal({
	children,
	className,
	delay = 0,
}: {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 26 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-60px" }}
			transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1], delay }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

function FeatureCard({
	icon,
	title,
	desc,
	className,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	desc: string;
	className?: string;
	children?: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"group h-full rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 transition-colors hover:border-brand-primary/30",
				className,
			)}
		>
			<div className="flex h-9 w-9 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5 transition-transform group-hover:scale-110">
				{icon}
			</div>
			<h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em]">{title}</h3>
			<p className="mt-2 max-w-[60ch] text-[13.5px] leading-relaxed text-foreground/50">{desc}</p>
			{children}
		</div>
	);
}
